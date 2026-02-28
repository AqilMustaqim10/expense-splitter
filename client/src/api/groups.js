import API from "./axios";

// ─── Groups API ────────────────────────────────────────────────────────────────
// All functions that communicate with the backend group routes

export const fetchGroups = () => API.get("/groups");
export const fetchGroup = (id) => API.get(`/groups/${id}`);
export const createGroup = (data) => API.post("/groups", data);
export const deleteGroup = (id) => API.delete(`/groups/${id}`);
export const addMember = (id, email) =>
  API.post(`/groups/${id}/members`, { email });
export const removeMember = (id, memberId) =>
  API.delete(`/groups/${id}/members/${memberId}`);
