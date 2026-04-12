package com.smart_campus.smart_campus.notifications.service;

import com.smart_campus.smart_campus.core.exception.CustomExceptions;
import com.smart_campus.smart_campus.notifications.dto.ResourceDto;
import com.smart_campus.smart_campus.facility.entity.Resource;
import com.smart_campus.smart_campus.notifications.repository.ResourceRepository;
import com.smart_campus.smart_campus.notifications.repository.ResourceSpec;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    // ── LIST / SEARCH ─────────────────────────────────────────────────────────

    public Page<ResourceDto.ResourceResponse> search(
            String name,
            Resource.ResourceType type,
            Resource.ResourceStatus status,
            String location,
            Integer minCapacity,
            Integer maxCapacity,
            Pageable pageable
    ) {
        var spec = ResourceSpec.withFilters(name, type, status, location, minCapacity, maxCapacity);
        return resourceRepository.findAll(spec, pageable)
                .map(ResourceDto.ResourceResponse::from);
    }

    // ── GET ONE ───────────────────────────────────────────────────────────────

    public ResourceDto.ResourceResponse getById(Long id) {
        return ResourceDto.ResourceResponse.from(findOrThrow(id));
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    @Transactional
    public ResourceDto.ResourceResponse create(ResourceDto.ResourceRequest req) {
        if (resourceRepository.existsByNameIgnoreCase(req.name())) {
            throw new CustomExceptions.ResourceConflictException(
                    "A resource with the name '" + req.name() + "' already exists.");
        }

        Resource resource = new Resource();
        applyRequest(resource, req);
        return ResourceDto.ResourceResponse.from(resourceRepository.save(resource));
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    @Transactional
    public ResourceDto.ResourceResponse update(Long id, ResourceDto.ResourceRequest req) {
        Resource resource = findOrThrow(id);

        if (!resource.getName().equalsIgnoreCase(req.name())
                && resourceRepository.existsByNameIgnoreCase(req.name())) {
            throw new CustomExceptions.ResourceConflictException(
                    "A resource with the name '" + req.name() + "' already exists.");
        }

        applyRequest(resource, req);
        return ResourceDto.ResourceResponse.from(resourceRepository.save(resource));
    }

    // ── PATCH STATUS ──────────────────────────────────────────────────────────

    @Transactional
    public ResourceDto.ResourceResponse updateStatus(Long id, ResourceDto.StatusUpdateRequest req) {
        Resource resource = findOrThrow(id);
        resource.setStatus(req.status());
        return ResourceDto.ResourceResponse.from(resourceRepository.save(resource));
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    @Transactional
    public void delete(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new CustomExceptions.ResourceNotFoundException("Resource", id);
        }
        resourceRepository.deleteById(id);
    }

    // ── ANALYTICS ─────────────────────────────────────────────────────────────

    public ResourceDto.AnalyticsResponse getAnalytics() {
        long total        = resourceRepository.count();
        long active       = resourceRepository.countByStatus(Resource.ResourceStatus.AVAILABLE);
        long maintenance  = resourceRepository.countByStatus(Resource.ResourceStatus.MAINTENANCE);
        long outOfService = resourceRepository.countByStatus(Resource.ResourceStatus.OUT_OF_SERVICE);

        List<ResourceDto.TopResourceEntry> topResources = resourceRepository
                .findTopBookedResources(5)
                .stream()
                .map(row -> {
                    Resource r = (Resource) row[0];
                    long count = (Long) row[1];
                    return new ResourceDto.TopResourceEntry(
                            r.getId(), r.getName(), r.getType().name(), count);
                })
                .collect(Collectors.toList());

        List<ResourceDto.PeakHourEntry> peakHours = resourceRepository
                .findBookingCountByHour()
                .stream()
                .map(row -> new ResourceDto.PeakHourEntry(
                        Integer.parseInt((String) row[0]),
                        (Long) row[1]))
                .collect(Collectors.toList());

        Map<String, Long> countByType = new LinkedHashMap<>();
        resourceRepository.countByType()
                .forEach(row -> countByType.put(
                        ((Resource.ResourceType) row[0]).name(), (Long) row[1]));

        return new ResourceDto.AnalyticsResponse(
                total, active, maintenance, outOfService,
                topResources, peakHours, countByType);
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────────────────────

    private Resource findOrThrow(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Resource", id));
    }

    private void applyRequest(Resource resource, ResourceDto.ResourceRequest req) {
        resource.setName(req.name());
        resource.setType(req.type());
        resource.setCapacity(req.capacity());
        resource.setLocation(req.location());
        resource.setDescription(req.description());
        resource.setImageUrl(req.imageUrl());

        if (req.status() != null) {
            resource.setStatus(req.status());
        }
        resource.setAvailableFrom(
                req.availableFrom() != null ? LocalTime.parse(req.availableFrom()) : null);
        resource.setAvailableTo(
                req.availableTo() != null ? LocalTime.parse(req.availableTo()) : null);
    }
}