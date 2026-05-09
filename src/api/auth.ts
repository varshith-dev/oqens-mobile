import client from './client'

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload {
  display_name: string
  username: string
  email: string
  password: string
}

export const authApi = {
  login: (data: LoginPayload) =>
    client.post<{ session: { accessToken: string } }>('/auth/login', data),

  register: (data: RegisterPayload) =>
    client.post('/auth/register', data),

  me: () =>
    client.post('/auth/me'),

  verifyEmail: (email: string, code: string) =>
    client.post('/auth/verify-email', { email, code }),

  resendCode: (email: string) =>
    client.post('/auth/resend-code', { email }),

  forgotPassword: (email: string) =>
    client.post('/auth/forgot-password', { email }),

  changePassword: (currentPassword: string, newPassword: string) =>
    client.post('/auth/change-password', { currentPassword, newPassword }),

  deleteAccount: () =>
    client.delete('/auth/account'),
}
