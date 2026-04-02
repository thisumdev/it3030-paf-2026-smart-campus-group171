import axiosClient from "../../../api/axiosClient";

// ── Resources ─────────────────────────────────────────────────────────────────

export const fetchResources = async () => {
  const res = await axiosClient.get("/api/tickets/resources");
  return res.data.data;
};

// ── Tickets ───────────────────────────────────────────────────────────────────

export const createTicket = async (data) => {
  const res = await axiosClient.post("/api/tickets", data);
  return res.data.data;
};

export const getMyTickets = async () => {
  const res = await axiosClient.get("/api/tickets/my");
  return res.data.data;
};

export const getTicketById = async (id) => {
  const res = await axiosClient.get(`/api/tickets/${id}`);
  return res.data.data;
};

export const getAllTickets = async () => {
  const res = await axiosClient.get("/api/tickets");
  return res.data.data;
};

export const updateTicketStatus = async (id, dto) => {
  const res = await axiosClient.patch(`/api/tickets/${id}/status`, dto);
  return res.data.data;
};

export const deleteTicket = async (id) => {
  await axiosClient.delete(`/api/tickets/${id}`);
};

export const uploadTicketImages = async (ticketId, files) => {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  const res = await axiosClient.post(`/api/tickets/${ticketId}/images`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

// ── Comments ──────────────────────────────────────────────────────────────────

export const getComments = async (ticketId) => {
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
