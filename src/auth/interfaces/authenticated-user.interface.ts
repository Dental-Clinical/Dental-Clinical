export interface AuthenticatedUser {
  userId: number;
  role: string;
  jti: string;
}
