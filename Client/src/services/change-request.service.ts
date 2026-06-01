import { api } from '../lib/api';

// ─── Types ───────────────────────────────────────────────────

export interface ChangeRequest {
  id: number;
  request_id: string;
  user_id: number;
  change_type: string;
  current_value: string;
  new_value: string;
  status: string;
  documents: DocumentItem[];
  created_at: string;
  updated_at: string;
}

export interface DocumentItem {
  name: string;
  originalName: string;
  size: number;
  type: string;
  data?: string; // base64
}

export interface ChangeRequestMessage {
  id: number;
  request_id: number;
  sender: 'SYSTEM' | 'ADMIN' | 'USER';
  message: string;
  documents: DocumentItem[] | null;
  created_at: string;
}

export interface ChangeRequestWithUser extends ChangeRequest {
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  phone_number: string;
  profile_picture: string | null;
}

// ─── User API Calls ──────────────────────────────────────────

export const changeRequestService = {
  /** Create a new change request */
  create: async (payload: {
    changeType: string;
    currentValue: string;
    newValue: string;
    documents: DocumentItem[];
  }): Promise<{ message: string; request: ChangeRequest }> => {
    const { data } = await api.post('/change-requests', payload);
    return data;
  },

  /** List all requests for the current user */
  list: async (): Promise<{ requests: ChangeRequest[] }> => {
    const { data } = await api.get('/change-requests');
    return data;
  },

  /** Get a single request with messages */
  get: async (id: number): Promise<{ request: ChangeRequest; messages: ChangeRequestMessage[] }> => {
    const { data } = await api.get(`/change-requests/${id}`);
    return data;
  },

  /** Upload additional documents */
  uploadDocuments: async (id: number, documents: DocumentItem[]): Promise<{ message: string; request: ChangeRequest }> => {
    const { data } = await api.post(`/change-requests/${id}/documents`, { documents });
    return data;
  },

  /** Send a message */
  sendMessage: async (id: number, message: string): Promise<{ message: string; data: ChangeRequestMessage }> => {
    const { data } = await api.post(`/change-requests/${id}/messages`, { message });
    return data;
  },

  /** Send OTP for email/phone changes */
  sendOtp: async (changeType: string, newValue: string): Promise<{ message: string }> => {
    const { data } = await api.post('/change-requests/send-otp', { changeType, newValue });
    return data;
  },

  /** Verify OTP for email/phone changes */
  verifyOtp: async (changeType: string, newValue: string, otp: string): Promise<{ message: string }> => {
    const { data } = await api.post('/change-requests/verify-otp', { changeType, newValue, otp });
    return data;
  },
};

// ─── Admin API Calls ─────────────────────────────────────────

export const changeRequestAdminService = {
  /** List all change requests (admin) */
  list: async (): Promise<{ requests: ChangeRequestWithUser[] }> => {
    const { data } = await api.get('/admin/change-requests');
    return data;
  },

  /** Get a single request with messages and user info */
  get: async (id: number): Promise<{ request: ChangeRequest; messages: ChangeRequestMessage[]; user: any }> => {
    const { data } = await api.get(`/admin/change-requests/${id}`);
    return data;
  },

  /** Approve a change request */
  approve: async (id: number): Promise<{ message: string; request: ChangeRequest }> => {
    const { data } = await api.post(`/admin/change-requests/${id}/approve`);
    return data;
  },

  /** Reject a change request */
  reject: async (id: number, reason: string): Promise<{ message: string; request: ChangeRequest }> => {
    const { data } = await api.post(`/admin/change-requests/${id}/reject`, { reason });
    return data;
  },

  /** Request more info from user */
  requestInfo: async (id: number, message: string): Promise<{ message: string; request: ChangeRequest }> => {
    const { data } = await api.post(`/admin/change-requests/${id}/request-info`, { message });
    return data;
  },
};
