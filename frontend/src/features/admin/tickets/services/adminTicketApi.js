import axiosClient from "../../../../api/axiosClient";
import { fetchAllUsers } from "../../user/services/adminApi";

export const fetchAllTickets = async () => {
  const res = await axiosClient.get("/api/tickets");
  return res.data.data;
};

export const updateTicketStatus = async (id, { status, reason, resolutionNotes, assigneeId }) => {
  const res = await axiosClient.patch(`/api/tickets/${id}/status`, {
    status,
    reason: reason || null,
    resolutionNotes: resolutionNotes || null,
    assigneeId: assigneeId || null,
  });
  return res.data.data;
};

export const deleteAdminTicket = async (id) => {
  await axiosClient.delete(`/api/tickets/${id}`);
};

export const fetchTechnicians = async () => fetchAllUsers("TECHNICIAN");
