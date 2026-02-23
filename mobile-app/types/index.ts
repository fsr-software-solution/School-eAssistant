export interface User {
  id: string;
  username: string;
  role: 'student' | 'admin';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}


