import axiosClient from "../../../api/axiosClient";

/**
 * Facility / Resource API service
 * All endpoints map to /api/resources on the Spring Boot backend.
 */

// ── PUBLIC ────────────────────────────────────────────────────────────────────

/**
 * Search/filter resources with pagination.
 * @param {Object} params - { name, type, status, location, minCapacity, maxCapacity, page, size, sortBy, sortDir }
 */
export const searchResources = (params = {}) =>
  axiosClient.get("/api/resources", { params });

/**
 * Get a single resource by ID.
 */
export const getResourceById = (id) =>
  axiosClient.get(`/api/resources/${id}`);

// ── ADMIN ─────────────────────────────────────────────────────────────────────

/**
 * Create a new resource (ADMIN only).
 */
export const createResource = (data) =>
  axiosClient.post("/api/resources", data);

/**
 * Full update of a resource (ADMIN only).
 */
export const updateResource = (id, data) =>
  axiosClient.put(`/api/resources/${id}`, data);

/**
 * Patch status only (ADMIN only).
 * @param {string} status - ACTIVE | MAINTENANCE | OUT_OF_SERVICE
 */
export const updateResourceStatus = (id, status) =>
  axiosClient.patch(`/api/resources/${id}/status`, { status });

/**
 * Delete a resource (ADMIN only).
 */
export const deleteResource = (id) =>
  axiosClient.delete(`/api/resources/${id}`);

/**
 * Get analytics (top resources, peak hours, counts) — ADMIN only.
 */
export const getResourceAnalytics = () =>
  axiosClient.get("/api/resources/analytics");