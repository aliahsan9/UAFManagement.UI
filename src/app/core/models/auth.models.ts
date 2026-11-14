export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { fullName: string; email: string; password: string; }
export interface AuthResponse { accessToken: string; expiresAtUtc: string; userId: string; email: string; roles: string[]; permissions?: string[]; }
export interface CurrentUser { userId: string; fullName: string; email: string; roles: string[]; }