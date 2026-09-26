export const DEFAULT_DIRECTOR_AVATAR =
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80';

export const DEFAULT_CLIENT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';

export const DEFAULT_DIRECTOR_NAME = 'Sarah Mitchell';
export const DEFAULT_CLIENT_NAME = 'Lume Client';

export const getSuperadminEmails = (): string[] => {
  const envVal = process.env['SUPERADMIN_EMAILS'] ?? 'borawiy457@kingdais.com,director@lume.salon';
  return envVal
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);
};

export const isSuperadminEmail = (email?: string | null): boolean => {
  if (!email) {
    return false;
  }
  return getSuperadminEmails().includes(email.trim().toLowerCase());
};
