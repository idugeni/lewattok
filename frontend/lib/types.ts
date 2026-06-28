export interface EmailMessage {
  id: string;
  message_id: string;
  recipient: string;
  sender: string;
  subject: string;
  body_text: string;
  body_html: string;
  created_at: string;
  /** UI-only flag for newly received messages */
  isNew?: boolean;
}

export interface GenerateEmailResponse {
  address: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

export type PollingStatus = "idle" | "ok" | "error" | "expired";

/** Info returned when creating an inbox */
export interface InboxInfo {
  address: string;
  created_at: string;
  expires_at: string;
}

/** Request body for creating an inbox with optional custom username */
export interface CreateInboxRequest {
  username?: string;
}
