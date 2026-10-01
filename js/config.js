// ---------- SITE CONFIG ----------
// These values are public by design (they ship to every visitor's browser).
// Never put the Supabase service role key or Flutterwave secret key here.
const SUPABASE_URL = 'https://kriopjrwolpcigivrmqr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FT6A_l3zbbJtcp-7h3ToJA_1VgmmtX0';
const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxx-X';

// 'simulate' = fake checkout with a "complete payment" button, no money taken
//              (also needs the SIMULATE_PAYMENTS=true Supabase secret).
// 'flutterwave' = real Flutterwave checkout. Use this when going live.
const PAYMENT_MODE = 'simulate';
