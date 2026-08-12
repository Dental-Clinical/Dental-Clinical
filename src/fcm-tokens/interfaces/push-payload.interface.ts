export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  badge?: number;
  /** Web only: URL the browser opens when the notification is clicked. */
  link?: string;
}
