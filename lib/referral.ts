export const SITE_ORIGIN = "https://meatheadpakistan.vercel.app";

export function normalizePakistaniPhone(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";

  let normalized = digits;

  if (normalized.startsWith("92")) {
    normalized = normalized.slice(2);
  }

  if (normalized.startsWith("0")) {
    normalized = normalized.slice(1);
  }

  if (normalized.length > 10) {
    normalized = normalized.slice(-10);
  }

  return normalized;
}

export function formatPakistaniPhoneForStorage(phone: string): string {
  const normalized = normalizePakistaniPhone(phone);
  if (!normalized) return "";
  return `0${normalized}`;
}

export function getDeterministicReferralCode(phone: string): string {
  const normalized = normalizePakistaniPhone(phone);
  if (!normalized) return "MEATHEAD000";

  let hash = 2166136261;

  for (const character of normalized) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  const token = (hash >>> 0)
    .toString(36)
    .toUpperCase()
    .padStart(7, "0")
    .slice(-7);

  return `MEAT${token}`;
}

export function getReferralLink(referralCode: string): string {
  return `${SITE_ORIGIN}/ref?=${encodeURIComponent(referralCode)}`;
}
