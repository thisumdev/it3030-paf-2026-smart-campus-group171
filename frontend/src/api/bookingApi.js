import axiosClient from "./axiosClient";

export const createBooking = (data) =>
  axiosClient.post("/api/bookings", data);

export const getMyBookings = () =>
  axiosClient.get("/api/bookings/my");

export const getBookingHistory = () =>
  axiosClient.get("/api/bookings/history");

export const getBookingById = (id) =>
  axiosClient.get(`/api/bookings/${id}`);

export const getAllBookings = () =>
  axiosClient.get("/api/bookings");

export const approveBooking = (id) =>
  axiosClient.put(`/api/bookings/${id}/approve`);

export const rejectBooking = (id, reason) =>
  axiosClient.put(`/api/bookings/${id}/reject`, { reason });

export const cancelBooking = (id) =>
  axiosClient.put(`/api/bookings/${id}/cancel`);

export const checkIn = (token) =>
  axiosClient.post(`/api/bookings/checkin?token=${token}`);

export const getCalendarEvents = (resourceId, from, to) =>
  axiosClient.get("/api/bookings/calendar", { params: { resourceId, from, to } });

export const getResources = () =>
  axiosClient.get("/api/resources");
