package com.smart_campus.smart_campus.facility.repository;

import com.smart_campus.smart_campus.facility.entity.Resource;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * JPA Specifications for dynamic resource filtering.
 * Supports: type, status, location (partial), minCapacity, maxCapacity, name (partial).
 */
public class ResourceSpec {

    private ResourceSpec() {}

    public static Specification<Resource> withFilters(
            String name,
            Resource.ResourceType type,
            Resource.ResourceStatus status,
            String location,
            Integer minCapacity,
            Integer maxCapacity
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (name != null && !name.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (location != null && !location.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%"));
            }
            if (minCapacity != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), minCapacity));
            }
            if (maxCapacity != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("capacity"), maxCapacity));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}