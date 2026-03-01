import API from "./axios";

// ─── Settlements API ───────────────────────────────────────────────────────────
// All functions that communicate with the backend settlement routes

export const fetchSettlements = (groupId) =>
  API.get(`/groups/${groupId}/settlements`);

export const markAsPaid = (groupId, data) =>
  API.post(`/groups/${groupId}/settlements`, data);

export const confirmPayment = (groupId, settlementId) =>
  API.patch(`/groups/${groupId}/settlements/${settlementId}/confirm`);

export const cancelSettlement = (groupId, settlementId) =>
  API.patch(`/groups/${groupId}/settlements/${settlementId}/cancel`);
