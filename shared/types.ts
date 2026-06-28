export interface EmailMessage {
  id: string;
  message_id: string;
  recipient: string;
  sender: string;
  subject: string;
  body_text: string;
  body_html: string;
  created_at: string;
}

export interface GenerateEmailResponse {
  address: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

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
