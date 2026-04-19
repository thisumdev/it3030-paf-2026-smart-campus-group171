package com.smart_campus.smart_campus.facility.dto;

import com.smart_campus.smart_campus.facility.entity.Resource;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class ResourceDto {

    // ── CREATE / UPDATE REQUEST ───────────────────────────────────────────────

    public record ResourceRequest(
            @NotBlank(message = "Name is required")
            @Size(max = 100, message = "Name must not exceed 100 characters")
            String name,

            @NotNull(message = "Type is required")
            Resource.ResourceType type,

            @Min(value = 1, message = "Capacity must be at least 1")
            Integer capacity,

            @NotBlank(message = "Location is required")
            String location,

            // "08:00" format — parsed to LocalTime in service
            String availableFrom,

            // "22:00" format
            String availableTo,

            @Size(max = 500, message = "Description must not exceed 600 characters")
            String description,

            Resource.ResourceStatus status,

            String imageUrl
    ) {}

    // ── STATUS PATCH REQUEST ──────────────────────────────────────────────────

    public record StatusUpdateRequest(
            @NotNull(message = "Status is required")
            Resource.ResourceStatus status
    ) {}

    // ── RESPONSE ─────────────────────────────────────────────────────────────

    public record ResourceResponse(
            Long id,
            String name,
            Resource.ResourceType type,
            Integer capacity,
            String location,
            String availableFrom,   // formatted "HH:mm"
            String availableTo,
            String description,
            Resource.ResourceStatus status,
            String imageUrl,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        // Factory — converts entity → response record
        public static ResourceResponse from(Resource r) {
            return new ResourceResponse(
                    r.getId(),
                    r.getName(),
                    r.getType(),
                    r.getCapacity(),
                    r.getLocation(),
                    r.getAvailableFrom() != null ? r.getAvailableFrom().toString() : null,
                    r.getAvailableTo()   != null ? r.getAvailableTo().toString()   : null,
                    r.getDescription(),
                    r.getStatus(),
                    r.getImageUrl(),
                    r.getCreatedAt(),
                    r.getUpdatedAt()
            );
        }
    }

    // ── ANALYTICS RESPONSE ────────────────────────────────────────────────────

    public record TopResourceEntry(Long resourceId, String name, String type, long bookingCount) {}

    public record PeakHourEntry(int hour, long bookingCount) {}

    public record AnalyticsResponse(
            long totalResources,
            long activeResources,
            long maintenanceResources,
            long outOfServiceResources,
            java.util.List<TopResourceEntry> topResources,
            java.util.List<PeakHourEntry> peakHours,
            java.util.Map<String, Long> countByType
    ) {}
}