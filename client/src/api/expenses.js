import API from "./axios";

// ─── Expenses API ──────────────────────────────────────────────────────────────
// All functions that communicate with the backend expense routes

export const fetchExpenses = (groupId) =>
  API.get(`/groups/${groupId}/expenses`);
export const addExpense = (groupId, data) =>
  API.post(`/groups/${groupId}/expenses`, data);
export const deleteExpense = (groupId, expenseId) =>
  API.delete(`/groups/${groupId}/expenses/${expenseId}`);
export const fetchBalances = (groupId) =>
  API.get(`/groups/${groupId}/expenses/balances`);
export const fetchSettlements = (groupId) =>
  API.get(`/groups/${groupId}/expenses/settlements`); // New
