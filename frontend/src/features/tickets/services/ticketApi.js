import axiosClient from "../../../api/axiosClient";

export const fetchMyTickets = async () => {
  const res = await axiosClient.get("/api/tickets/my");
  return res.data.data;
};

export const fetchTicketById = async (id) => {
  const res = await axiosClient.get(`/api/tickets/${id}`);
  return res.data.data;
};

export const createTicket = async (payload) => {
  const res = await axiosClient.post("/api/tickets", payload);
  return res.data.data;
};

export const fetchResources = async () => {
  const res = await axiosClient.get("/api/tickets/resources");
  return res.data.data;
};

export const fetchComments = async (ticketId) => {
  const res = await axiosClient.get(`/api/tickets/${ticketId}/comments`);
  return res.data.data;
};

export const addComment = async (ticketId, commentText) => {
  const res = await axiosClient.post(`/api/tickets/${ticketId}/comments`, {
    commentText,
  });
  return res.data.data;
};

export const deleteComment = async (ticketId, commentId) => {
  await axiosClient.delete(`/api/tickets/${ticketId}/comments/${commentId}`);
};

export const fetchAssignedTickets = async () => {
  const res = await axiosClient.get("/api/tickets/assigned");
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
