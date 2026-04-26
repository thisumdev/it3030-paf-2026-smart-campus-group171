import axiosClient from "./axiosClient";

export const createBooking = (data) =>
  axiosClient.post('/api/bookings', data);

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

export const cancelRecurringSeries = (groupId) =>
  axiosClient.put(`/api/bookings/recurring/${groupId}/cancel`);

export const approveRecurringSeries = (groupId) =>
  axiosClient.put(`/api/bookings/recurring/${groupId}/approve`);

export const rejectRecurringSeries = (groupId, reason) =>
  axiosClient.put(`/api/bookings/recurring/${groupId}/reject`, { reason });

export const cancelBookingById = (id) =>
  axiosClient.put(`/api/bookings/${id}/cancel`);

export const deleteBookingById = (id) =>
  axiosClient.delete(`/api/bookings/${id}`);

export const restoreBooking = (id) =>
  axiosClient.put(`/api/bookings/${id}/restore`);

export const checkIn = (token) =>
  axiosClient.post(`/api/bookings/checkin?token=${token}`);

export const getCalendarEvents = (resourceId, from, to) =>
  axiosClient.get("/api/bookings/calendar", { params: { resourceId, from, to } });

export const getResources = () =>
  axiosClient.get("/api/resources");

export const getPublicCalendarEvents = (resourceId) =>
  axiosClient.get("/api/bookings/public/calendar", {
    params: resourceId ? { resourceId } : {},
  });

export const getCheckedInBookings = () =>
  axiosClient.get("/api/bookings/checkins");

export const getNoShowBookings = () =>
  axiosClient.get("/api/bookings/no-shows");

export const deleteBooking = (id) =>
  axiosClient.delete(`/api/bookings/${id}`);

export const getBookingAnalytics = () =>
  axiosClient.get("/api/bookings/analytics");

export const downloadDailyReport = (date) =>
  axiosClient.get("/api/bookings/report/daily", {
    params: date ? { date } : {},
    responseType: "blob",
  });
