export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidUsername(username: string): boolean {
  return /^[a-z0-9_]{3,20}$/.test(username)
}

export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) return { valid: false, message: 'At least 8 characters' }
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'At least 1 uppercase letter' }
  if (!/[0-9]/.test(password)) return { valid: false, message: 'At least 1 number' }
  return { valid: true }
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
