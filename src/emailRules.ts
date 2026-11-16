/** Same shape and sample-email checks as the server, so people see the problem while typing. The server also checks the domain exists. */
const SHAPE = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,24}$/;

const PLACEHOLDER_NAME =
  /^(test|tester|testing|testuser|test[._-]?user|sample|example|demo|fake|dummy|temp|tmp|abc|abcd|abcde|asdf|asdfg|qwerty|qwe|xyz|user|username|name|yourname|your[._-]?name|email|mail|noreply|no-reply|null|none|nobody|nothing|me|you|foo|bar|baz|hello|hi|admin|root)[._-]?\d*$/;

const PLACEHOLDER_DOMAINS = new Set([
  "email.com", "example.com", "example.org", "example.net", "test.com", "test.org", "test.net", "sample.com",
  "domain.com", "mail.test", "email.test", "yourdomain.com", "yourmail.com", "youremail.com", "abc.com", "xyz.com",
  "asdf.com", "fake.com", "fakemail.com", "noemail.com", "none.com", "nomail.com", "invalid.com", "localhost.com",
]);

/** An error message, or "" when the address looks fine. */
export function emailProblem(raw: string): string {
  const email = raw.trim().toLowerCase();
  if (!email) return "";
  if (!SHAPE.test(email) || email.includes("..")) return "Enter a valid email address";
  const [local, domain] = email.split("@");
  if (PLACEHOLDER_NAME.test(local) || /^(.)\1{3,}$/.test(local)) return "That looks like a sample email. Use your real address";
  if (PLACEHOLDER_DOMAINS.has(domain)) return "That looks like a sample email domain. Use your real address";
  return "";
}
