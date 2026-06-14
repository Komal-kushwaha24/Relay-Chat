import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002',
  withCredentials: true,
});

// Attach JWT from localStorage as Bearer token on every request.

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (data) =>
  api.post('/auth/register', data);

export const loginUser = (data) =>
  api.post('/auth/login', data);

export const getCurrentUser = () =>
  api.get('/auth/me');

export const getCloudinarySignature = () =>
  api.get('/cloudinary/signature');

export const updateCurrentUser = (data) =>
  api.put('/auth/me', data);

export const requestPasswordReset = (data) =>
  api.post('/auth/forgot-password', data);

export const validateResetToken = (token) =>
  api.get(`/auth/reset-password/${token}`);

export const resetPassword = (token, data) =>
  api.post(`/auth/reset-password/${token}`, data);

export const logCurrentUser = async () => {
  try {
    const response = await getCurrentUser();
    console.log(response.data);
  } catch (error) {
    console.error(error.response?.data ?? error.message);
  }
};

// ─── Auth ────────────────────────────────────────────────────────────────────

export const logoutUser = () =>
  api.post('/auth/logout');

// ─── Users ───────────────────────────────────────────────────────────────────

/** Returns all users except the currently logged-in user. */
export const getUsers = () =>
  api.get('/auth/users');

// ─── Conversations ────────────────────────────────────────────────────────────

/** Returns all conversations the authenticated user is part of. */
export const getConversations = () =>
  api.get('/conversations');

/**
 * Creates a new 1-to-1 conversation.
 * If one already exists between the two participants it is returned instead.
 * @param {[string, string]} participants - Array of exactly two user IDs.
 */
export const createConversation = (participants) =>
  api.post('/conversations', { participants });

export const deleteConversation = (conversationId) =>
  api.delete(`/conversations/${conversationId}`);

// ─── Messages ────────────────────────────────────────────────────────────────

/**
 * Returns all messages for a conversation, sorted oldest-first.
 * @param {string} conversationId
 */
export const getMessages = (conversationId) =>
  api.get(`/messages/${conversationId}`);

/**
 * Sends a new message inside a conversation.
 * @param {string} conversationId
 * @param {string} text
 */
export const sendMessage = (conversationId, text) =>
  api.post('/messages', { conversationId, text });

export const undoMessage = (messageId, type = 'everyone') =>
  api.delete(`/messages/${messageId}?type=${type}`);

export const editMessage = (messageId, text) =>
  api.patch(`/messages/${messageId}`, { text });

// ─── Message Requests ───────────────────────────────────────────────────────
export const getMessageRequests = () =>
  api.get('/messages/requests');

export const getSentMessageRequests = () =>
  api.get('/messages/requests/sent');

export const createMessageRequest = (toUserId, text) =>
  api.post('/messages/requests', { toUserId, text });

export const cancelSentMessageRequest = (requestId) =>
  api.delete(`/messages/requests/sent/${requestId}`);

export const acceptMessageRequest = (requestId) =>
  api.post(`/messages/requests/${requestId}/accept`);

export const deleteMessageRequest = (requestId) =>
  api.delete(`/messages/requests/${requestId}`);
