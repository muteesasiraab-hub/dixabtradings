import type { User } from "@supabase/supabase-js";

type ProfileInput = {
  fullName: string;
  phone: string;
  email: string;
  referralCode?: string;
};

export async function ensureProfileFromSignup(
  user: User,
  createProfile: (input: { data: ProfileInput }) => Promise<unknown>,
) {
  const pending = user.user_metadata?.dixab_registration;
  if (
    !pending ||
    typeof pending.fullName !== "string" ||
    typeof pending.phone !== "string" ||
    typeof user.email !== "string"
  ) {
    return;
  }

  try {
    await createProfile({
      data: {
        fullName: pending.fullName,
        phone: pending.phone,
        email: user.email,
        referralCode: typeof pending.referralCode === "string" ? pending.referralCode : undefined,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Profile already exists") return;
    throw error;
  }
}
