
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  sponsor_id uuid REFERENCES public.profiles(id),
  referral_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active')),
  activated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_profiles_sponsor ON public.profiles(sponsor_id);
CREATE INDEX idx_profiles_code ON public.profiles(referral_code);

-- Payments (entry fee)
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL DEFAULT 50000,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reference text,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_payments_user ON public.payments(user_id);

-- Earnings
CREATE TABLE public.earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  level integer NOT NULL CHECK (level BETWEEN 1 AND 5),
  amount integer NOT NULL DEFAULT 5000,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_earnings_user ON public.earnings(user_id);

-- Referral code generator
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  code text;
  exists_ boolean;
BEGIN
  LOOP
    code := 'DA' || upper(substring(md5(random()::text || clock_timestamp()::text) for 6));
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists_;
    EXIT WHEN NOT exists_;
  END LOOP;
  RETURN code;
END;
$$;

-- Approve payment + activate + credit 5 ancestor levels
CREATE OR REPLACE FUNCTION public.approve_payment(_payment_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _payment payments%ROWTYPE;
  _profile profiles%ROWTYPE;
  _ancestor uuid;
  _level int;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can approve payments';
  END IF;

  SELECT * INTO _payment FROM payments WHERE id = _payment_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Payment not found'; END IF;
  IF _payment.status = 'approved' THEN RAISE EXCEPTION 'Already approved'; END IF;

  UPDATE payments SET status='approved', approved_by=auth.uid(), approved_at=now() WHERE id=_payment_id;

  SELECT * INTO _profile FROM profiles WHERE id = _payment.user_id;
  IF _profile.status = 'pending' THEN
    UPDATE profiles SET status='active', activated_at=now() WHERE id=_payment.user_id;
  END IF;

  -- Credit up to 5 ancestor levels (only active sponsors earn)
  _ancestor := _profile.sponsor_id;
  _level := 1;
  WHILE _ancestor IS NOT NULL AND _level <= 5 LOOP
    INSERT INTO earnings(user_id, source_user_id, level, amount)
    SELECT _ancestor, _payment.user_id, _level, 5000
    WHERE EXISTS (SELECT 1 FROM profiles WHERE id=_ancestor AND status='active');
    SELECT sponsor_id INTO _ancestor FROM profiles WHERE id = _ancestor;
    _level := _level + 1;
  END LOOP;
END;
$$;

-- RLS Policies
-- profiles
CREATE POLICY "users view own profile" ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "users view downline profiles" ON profiles FOR SELECT TO authenticated
  USING (sponsor_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "users update own profile" ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());
CREATE POLICY "admins manage profiles" ON profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- user_roles
CREATE POLICY "users view own roles" ON user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage roles" ON user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- payments
CREATE POLICY "users view own payments" ON payments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "users create own payment" ON payments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins manage payments" ON payments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- earnings
CREATE POLICY "users view own earnings" ON earnings FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage earnings" ON earnings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
