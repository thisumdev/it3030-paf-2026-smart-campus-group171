package com.smart_campus.smart_campus.booking.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Div;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.smart_campus.smart_campus.booking.entity.Booking;
import com.smart_campus.smart_campus.booking.entity.BookingStatus;
import com.smart_campus.smart_campus.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingReportService {

    private final BookingRepository bookingRepository;

    /**
     * Loads bookings for the report day with user and resource initialized.
     * Requires a transaction because {@code spring.jpa.open-in-view} is false.
     */
    @Transactional(readOnly = true)
    public byte[] generateDailyReport(LocalDate date) throws Exception {
        ZoneId zone = ZoneId.systemDefault();
        long startMs = date.atStartOfDay(zone).toInstant().toEpochMilli();
        long endMs = date.plusDays(1).atStartOfDay(zone).toInstant().toEpochMilli();

        List<Long> ids = bookingRepository.findIdsForDailyReportByStartTimeMillis(startMs, endMs);
        List<Booking> todayBookings = ids.isEmpty()
                ? Collections.emptyList()
                : bookingRepository.findAllByIdInWithUserAndResource(ids);

        // Count by status
        long approved = todayBookings.stream().filter(b -> b.getStatus() == BookingStatus.APPROVED).count();
        long pending = todayBookings.stream().filter(b -> b.getStatus() == BookingStatus.PENDING).count();
        long rejected = todayBookings.stream().filter(b -> b.getStatus() == BookingStatus.REJECTED).count();
        long cancelled = todayBookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count();
        long autoCancelled = todayBookings.stream().filter(b -> b.getStatus() == BookingStatus.AUTO_CANCELLED).count();
        long checkedIn = todayBookings.stream().filter(b -> b.getCheckedInAt() != null).count();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf, PageSize.A4);
        document.setMargins(40, 40, 40, 40);

        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("MMMM d, yyyy");
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("h:mm a");
        DeviceRgb darkColor = new DeviceRgb(15, 23, 42);
        DeviceRgb emeraldColor = new DeviceRgb(16, 185, 129);
        DeviceRgb slateColor = new DeviceRgb(100, 116, 139);
        DeviceRgb lightGray = new DeviceRgb(241, 245, 249);

        // ── HEADER ──────────────────────────────────────────────────────────────
        Paragraph header = new Paragraph("Smart Campus Operations Hub")
                .setFontSize(20)
                .setBold()
                .setFontColor(darkColor)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(header);

        Paragraph subHeader = new Paragraph("Daily Booking Report — " + date.format(dateFmt))
                .setFontSize(12)
                .setFontColor(slateColor)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(subHeader);

        // Divider line
        document.add(new Paragraph("─".repeat(80))
                .setFontColor(new DeviceRgb(226, 232, 240))
                .setFontSize(8)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20));

        // ── SUMMARY STATS ────────────────────────────────────────────────────────
        document.add(new Paragraph("Summary")
                .setFontSize(14)
                .setBold()
                .setFontColor(darkColor)
                .setMarginBottom(10));

        // Stats table - 3 columns
        Table statsTable = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(20);

        // Helper to add stat cell
        String[][] stats = {
                {"Total Bookings", String.valueOf(todayBookings.size()), "#0f172a"},
                {"Approved", String.valueOf(approved), "#10b981"},
                {"Pending", String.valueOf(pending), "#f59e0b"},
                {"Rejected", String.valueOf(rejected), "#ef4444"},
                {"Cancelled", String.valueOf(cancelled), "#94a3b8"},
                {"Checked In", String.valueOf(checkedIn), "#6366f1"},
        };

        for (String[] stat : stats) {
            Cell cell = new Cell()
                    .setBackgroundColor(lightGray)
                    .setPadding(12)
                    .setBorder(null);
            cell.add(new Paragraph(stat[0])
                    .setFontSize(9)
                    .setFontColor(slateColor));
            cell.add(new Paragraph(stat[1])
                    .setFontSize(22)
                    .setBold()
                    .setFontColor(darkColor));
            statsTable.addCell(cell);
        }
        document.add(statsTable);

        // ── BOOKINGS TABLE ───────────────────────────────────────────────────────
        document.add(new Paragraph("Booking Details")
                .setFontSize(14)
                .setBold()
                .setFontColor(darkColor)
                .setMarginBottom(10));

        if (todayBookings.isEmpty()) {
            document.add(new Paragraph("No bookings found for this date.")
                    .setFontColor(slateColor)
                    .setFontSize(11)
                    .setItalic());
        } else {
            Table table = new Table(UnitValue.createPercentArray(new float[]{2.5f, 1.8f, 1.5f, 1.5f, 1.2f, 1.2f}))
                    .setWidth(UnitValue.createPercentValue(100));

            // Header row
            String[] headers = {"Resource", "Booked By", "Start Time", "End Time", "Status", "Checked In"};
            for (String h : headers) {
                table.addHeaderCell(new Cell()
                        .setBackgroundColor(darkColor)
                        .setPadding(8)
                        .setBorder(null)
                        .add(new Paragraph(h)
                                .setFontColor(ColorConstants.WHITE)
                                .setFontSize(9)
                                .setBold()));
            }

            // Data rows
            DateTimeFormatter rowFmt = DateTimeFormatter.ofPattern("h:mm a");
            boolean alternate = false;
            for (Booking b : todayBookings) {
                DeviceRgb rowBg = alternate ? lightGray : new DeviceRgb(255, 255, 255);
                alternate = !alternate;

                String resourceLabel = b.getResource() != null && b.getResource().getName() != null
                        ? b.getResource().getName()
                        : "—";
                String userLabel = "—";
                if (b.getUser() != null) {
                    if (b.getUser().getFullName() != null && !b.getUser().getFullName().isBlank()) {
                        userLabel = b.getUser().getFullName();
                    } else if (b.getUser().getEmail() != null) {
                        userLabel = b.getUser().getEmail();
                    }
                }

                String[][] cells = {
                        {resourceLabel},
                        {userLabel},
                        {b.getStartTime().format(rowFmt)},
                        {b.getEndTime().format(rowFmt)},
                        {b.getStatus().name().replace("_", " ")},
                        {b.getCheckedInAt() != null ? "Yes " + b.getCheckedInAt().format(rowFmt) : "No"},
                };

                for (String[] cellContent : cells) {
                    table.addCell(new Cell()
                            .setBackgroundColor(rowBg)
                            .setPadding(7)
                            .setBorder(null)
                            .add(new Paragraph(cellContent[0])
                                    .setFontSize(9)
                                    .setFontColor(darkColor)));
                }
            }
            document.add(table);
        }

        // ── FOOTER ───────────────────────────────────────────────────────────────
        document.add(new Paragraph("\n"));
        document.add(new Paragraph("Generated on " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM d, yyyy 'at' h:mm a")) +
                "  ·  Smart Campus Operations Hub — SLIIT")
                .setFontSize(8)
                .setFontColor(slateColor)
                .setTextAlignment(TextAlignment.CENTER));

        document.close();
        return baos.toByteArray();
    }
}
