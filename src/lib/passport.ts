export const SIGNALS = ['Khruangbin','Nina Simone','Wong Kar-wai','Before Sunrise','Patti Smith','Independent bookstores','Small art galleries','Neighbourhood cafés'] as const;
export const PASSPORT_KEY = 'tpd-passport-v1';
export function parsePassport(raw: string | null): string[] {
 try {
  const value: unknown = JSON.parse(raw ?? 'null');
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === 'string' && (SIGNALS as readonly string[]).includes(item)))].slice(0,5);
 } catch { return []; }
}
