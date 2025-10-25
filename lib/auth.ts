export const SESSION_PW_KEY = "copyparty_pw"

export function saveSessionPassword(pw: string) {
  try {
    sessionStorage.setItem(SESSION_PW_KEY, pw)
  } catch (_) {
    // ignore storage errors
  }
}

export function clearSessionPassword() {
  try {
    sessionStorage.removeItem(SESSION_PW_KEY)
  } catch (_) {
    // ignore storage errors
  }
}

export function getSessionPassword(): string | null {
  try {
    return sessionStorage.getItem(SESSION_PW_KEY)
  } catch (_) {
    return null
  }
}

export function appendPwToUrl(url: string, pw?: string): string {
  const password = pw ?? getSessionPassword() ?? ""
  if (!password) return url
  const hasQuery = url.includes("?")
  const sep = hasQuery ? "&" : "?"
  return `${url}${sep}pw=${encodeURIComponent(password)}`
}

export function isSessionPasswordValid(expected: string): boolean {
  const sessionPw = getSessionPassword()
  if (sessionPw == null) return true
  return sessionPw === expected
}