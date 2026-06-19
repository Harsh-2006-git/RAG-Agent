import axios from 'axios';

const CLIENT_ID_KEY = 'docuchat_client_id';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const apiRoot = API_BASE_URL
  .trim()
  .replace(/\/+$/, '')
  .replace(/(\/api\/v1)+$/, '');
const normalizedBaseURL = `${apiRoot}/api/v1`;

function getClientId() {
  let clientId = localStorage.getItem(CLIENT_ID_KEY);
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }
  return clientId;
}

// Create an Axios instance
const api = axios.create({
  baseURL: normalizedBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  config.headers['X-Client-Id'] = getClientId();
  return config;
});

export const documentAPI = {
  upload: async (files, onUploadProgress) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  process: async (documentIds) => {
    const response = await api.post('/process', { document_ids: documentIds });
    return response.data;
  },

  list: async () => {
    const response = await api.get('/documents');
    return response.data;
  },

  delete: async (documentId) => {
    const response = await api.delete(`/document/${documentId}`);
    return response.data;
  }
};

export const chatAPI = {
  send: async (question, documentIds = [], sessionId = null, model = "gemini-2.5-flash", retrievalMode = "history_aware") => {
    const payload = {
      question,
      document_ids: documentIds,
      model,
      retrieval_mode: retrievalMode,
    };
    if (sessionId) {
      payload.session_id = sessionId;
    }
    const response = await api.post('/chat', payload);
    return response.data;
  },
  list: async () => {
    const response = await api.get('/chats');
    return response.data;
  },
  get: async (sessionId) => {
    const response = await api.get(`/chats/${sessionId}`);
    return response.data;
  },
  delete: async (sessionId) => {
    const response = await api.delete(`/chats/${sessionId}`);
    return response.data;
  }
};

export default api;
