package com.smart_campus.smart_campus.booking.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.qrcode.QRCodeWriter;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class BookingEmailService {

    private final JavaMailSender mailSender;

    @Value("${app.base-url}")
    private String baseUrl;

    public void sendBookingApprovalEmail(
            String toEmail,
            String userName,
            String resourceName,
            String resourceLocation,
            LocalDateTime startTime,
            LocalDateTime endTime,
            String purpose,
            Integer attendees,
            String checkInToken
    ) {
        try {
            // 1. Generate QR code
            String checkInUrl = baseUrl + "/checkin?token=" + checkInToken;
            QRCodeWriter qrWriter = new QRCodeWriter();
            var bitMatrix = qrWriter.encode(checkInUrl, BarcodeFormat.QR_CODE, 250, 250);
            ByteArrayOutputStream qrStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", qrStream);
            byte[] qrBytes = qrStream.toByteArray();

            // 2. Format times
            DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("EEEE, MMM d yyyy 'at' h:mm a");
            DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("h:mm a");
            String formattedStart = startTime.format(dateFmt);
            String formattedEnd   = endTime.format(timeFmt);

            // 3. Build HTML
            String attendeeRow = (attendees != null)
                    ? "<tr><td style='padding:6px 0;color:#64748b;'>Attendees</td>"
                      + "<td style='font-weight:bold;'>" + attendees + " people</td></tr>"
                    : "";

            String html = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px;">
                      <div style="background:#0f172a;color:white;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
                        <h1 style="margin:0;font-size:22px;"> Booking Approved</h1>
                        <p style="margin:8px 0 0;opacity:0.7;font-size:14px;">Smart Campus Operations Hub</p>
                      </div>
                      <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;">
                        <p style="color:#475569;font-size:15px;">Hi <strong>%s</strong>,</p>
                        <p style="color:#475569;font-size:14px;">Your booking has been approved. Here are your details:</p>
                        <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin:16px 0;">
                          <table style="width:100%%;font-size:14px;color:#334155;">
                            <tr><td style="padding:6px 0;color:#64748b;">Resource</td><td style="font-weight:bold;">%s</td></tr>
                            <tr><td style="padding:6px 0;color:#64748b;">Location</td><td>%s</td></tr>
                            <tr><td style="padding:6px 0;color:#64748b;">Date &amp; Time</td><td>%s – %s</td></tr>
                            <tr><td style="padding:6px 0;color:#64748b;">Purpose</td><td>%s</td></tr>
                            %s
                          </table>
                        </div>
                        <div style="text-align:center;margin:24px 0;">
                          <p style="color:#0f172a;font-weight:bold;font-size:15px;margin-bottom:12px;">📱 Scan to Check In</p>
                          <p style="color:#64748b;font-size:13px;">Scan this QR code when you arrive. You must check in within 15 minutes of your booking start time.</p>
                          <img src="cid:qrcode" style="width:180px;height:180px;margin:16px auto;display:block;" />
                        </div>
                        <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:12px;font-size:13px;color:#92400e;">
                          ⚠️ If you do not check in within 15 minutes of your start time, your booking will be automatically cancelled.
                        </div>
                        <p style="color:#94a3b8;font-size:12px;margin-top:24px;text-align:center;">Smart Campus Operations Hub — SLIIT</p>
                      </div>
                    </div>
                    """.formatted(
                            userName, resourceName, resourceLocation,
                            formattedStart, formattedEnd, purpose, attendeeRow
                    );

            // 4. Send email
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("YOUR_GMAIL_ADDRESS", "Smart Campus");
            helper.setTo(toEmail);
            helper.setSubject("Booking Approved — " + resourceName);
            helper.setText(html, true);
            helper.addInline("qrcode", new ByteArrayResource(qrBytes), "image/png");
            mailSender.send(message);

        } catch (Exception e) {
            System.err.println("❌ Failed to send booking approval email to " + toEmail + ": " + e.getMessage());
        }
    }
}
