// Default authorized admin emails for Vibespot
const DEFAULT_ADMIN_EMAILS = [
  'adityapranihith123@gmail.com',
  'pranihithaditya@gmail.com',
];

export function getAdminEmails(): string[] {
  const envEmails =
    process.env.ADMIN_EMAILS ||
    process.env.NEXT_PUBLIC_ADMIN_EMAILS;

  if (!envEmails) return DEFAULT_ADMIN_EMAILS;

  return envEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  const adminList = getAdminEmails();
  return adminList.includes(email.trim().toLowerCase());
}
