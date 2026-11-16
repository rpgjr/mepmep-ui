/** The same rules the server enforces: 8+ characters with a lowercase letter, a number and a special character. */
export const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "A lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "A number", test: (p: string) => /\d/.test(p) },
  { label: "A special character (like ! or #)", test: (p: string) => /[^A-Za-z0-9\s]/.test(p) },
] as const;

export const passwordOk = (p: string) => PASSWORD_RULES.every((r) => r.test(p));
