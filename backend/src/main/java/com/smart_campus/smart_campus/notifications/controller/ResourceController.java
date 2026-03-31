package com.smart_campus.smart_campus.notifications.controller;

import com.smart_campus.smart_campus.core.util.ApiResponse;
import com.smart_campus.smart_campus.notifications.dto.ResourceDto;
import com.smart_campus.smart_campus.facility.entity.Resource;
import com.smart_campus.smart_campus.notifications.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    // ── PUBLIC: List / Search ─────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ResourceDto.ResourceResponse>>> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Resource.ResourceType type,
            @RequestParam(required = false) Resource.ResourceStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) Integer maxCapacity,
            @RequestParam(defaultValue = "0")        int page,
            @RequestParam(defaultValue = "12")       int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc")     String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(ApiResponse.success("Resources retrieved",
                resourceService.search(name, type, status, location, minCapacity, maxCapacity, pageable)));
    }

    // ── PUBLIC: Get One ───────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceDto.ResourceResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(resourceService.getById(id)));
    }

    // ── ADMIN: Create ─────────────────────────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResourceDto.ResourceResponse>> create(
            @Valid @RequestBody ResourceDto.ResourceRequest req) {
        return ResponseEntity.status(201)
                .body(ApiResponse.created("Resource created successfully", resourceService.create(req)));
    }

    // ── ADMIN: Full Update ────────────────────────────────────────────────────
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResourceDto.ResourceResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ResourceDto.ResourceRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Resource updated", resourceService.update(id, req)));
    }

    // ── ADMIN: Patch Status Only ──────────────────────────────────────────────
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResourceDto.ResourceResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ResourceDto.StatusUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", resourceService.updateStatus(id, req)));
    }

    // ── ADMIN: Delete ─────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        resourceService.delete(id);
        return ResponseEntity.ok(ApiResponse.noContent("Resource deleted successfully"));
    }

    // ── ADMIN: Analytics ──────────────────────────────────────────────────────
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResourceDto.AnalyticsResponse>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.success("Analytics retrieved", resourceService.getAnalytics()));
    }
}