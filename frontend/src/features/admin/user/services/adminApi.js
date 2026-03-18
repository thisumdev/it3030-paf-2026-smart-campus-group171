// src/features/admin/user/services/adminApi.js

import axiosClient from "../../../../api/axiosClient";

/**
 * Fetch all users, with an optional role filter.
 * GET /api/users?role=USER|ADMIN|TECHNICIAN
 */
export const fetchAllUsers = async (role = null) => {
  const params = role ? { role } : {};
  const response = await axiosClient.get("/api/users", { params });
  return response.data.data;
};

/**
 * Delete a user by ID.
 * DELETE /api/users/{id}
 */
export const deleteUserById = async (id) => {
  await axiosClient.delete(`/api/users/${id}`);
};

/**
 * Update a user's role.
 * PUT /api/users/{id}/role
 */
export const updateUserRole = async (id, role) => {
  const response = await axiosClient.put(`/api/users/${id}/role`, { role });
  return response.data.data;
};
