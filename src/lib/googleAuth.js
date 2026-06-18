import supabase from './supabase';

const isMobile = () => {
  try { return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent); } catch { return false; }
};

function buildGoogleUrl(appName) {
  try {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GOOGLE_AUTH_PROXY;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!clientId || !redirectUri) return null;
    const state = btoa(JSON.stringify({ origin: window.location.origin, appName, supabaseUrl, supabaseAnonKey }));
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&prompt=select_account&state=${encodeURIComponent(state)}`;
  } catch { return null; }
}

export function signInWithGoogle(appName = 'LAILA SHOES') {
  try {
    const url = buildGoogleUrl(appName);
    if (!url) return;
    window.open(url, 'google-auth', isMobile() ? '' : 'width=500,height=600');
    const handler = async (event) => {
      try {
        if (event.data?.type === 'google-auth-denied') {
          window.removeEventListener('message', handler);
          return;
        }
        if (event.data?.type !== 'google-auth-success') return;
        window.removeEventListener('message', handler);
        if (event.data.access_token && event.data.refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token: event.data.access_token, refresh_token: event.data.refresh_token });
          if (error) console.error('[google-auth] setSession failed:', error.message);
        } else if (event.data.id_token) {
          const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: event.data.id_token });
          if (error) console.error('[google-auth] signInWithIdToken failed:', error.message);
        }
      } catch (err) {
        console.error('[google-auth] handler error:', err);
      }
    };
    window.addEventListener('message', handler);
  } catch (err) {
    console.error('[google-auth] signInWithGoogle error:', err);
  }
}

export async function handleGoogleRedirect() {
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('google_id_token');
    if (!token) return;
    window.history.replaceState({}, '', window.location.pathname);
    const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token });
    if (error) { console.error('[google-auth] signInWithIdToken failed:', error.message); return; }
    try { window.close(); } catch {}
  } catch (err) {
    console.error('[google-auth] handleGoogleRedirect error:', err);
  }
}
