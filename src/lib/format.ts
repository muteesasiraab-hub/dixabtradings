export const UGX = (n: number) =>
  `UGX ${Math.round(n).toLocaleString("en-US")}`;

// Approx exchange rate used for indicative USD price equivalents on the catalog.
export const UGX_PER_USD = 3800;
export const USD = (ugx: number) =>
  `$${Math.round(ugx / UGX_PER_USD).toLocaleString("en-US")}`;

export const ENTRY_FEE = 100000;
export const EARNING_PER_REFERRAL = 10000; // 10% of entry product price
export const MAX_DIRECT_REFERRALS = 3;
export const MAX_LEVELS = 5;
