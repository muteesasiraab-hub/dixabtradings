export const UGX = (n: number) =>
  new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(n);

export const ENTRY_FEE = 60000;
export const EARNING_PER_REFERRAL = 5000;
export const MAX_DIRECT_REFERRALS = 3;
export const MAX_LEVELS = 5;
