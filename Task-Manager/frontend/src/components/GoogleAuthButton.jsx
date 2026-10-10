import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink, AlertCircle, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const GoogleIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

// Google Client ID is strictly retrieved from environment variables (VITE_GOOGLE_CLIENT_ID)
// or dynamic runtime entry via localStorage — never hardcoded in public source code!
const ENV_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const GoogleAuthButton = ({
  text = 'Continue with Google',
  isSignup = false,
  className = '',
}) => {
  const [clientId, setClientId] = useState(
    () => ENV_CLIENT_ID || localStorage.getItem('google_client_id') || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [inputClientId, setInputClientId] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(() => !!window.google?.accounts);

  const { googleLogin } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const navigate = useNavigate();

  // Load official Google Identity Services script
  useEffect(() => {
    if (window.google?.accounts) {
      setScriptLoaded(true);
      return;
    }

    const scriptId = 'google-gsi-client';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => {
        console.error('Failed to load Google Identity Services SDK');
      };
      document.body.appendChild(script);
    } else {
      script.addEventListener('load', () => setScriptLoaded(true));
    }
  }, []);

  // Initialize One Tap if available
  useEffect(() => {
    if (!clientId || !scriptLoaded || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response?.credential) return;
          try {
            setIsLoading(true);
            const res = await googleLogin({ credential: response.credential });
            showSuccess(`Signed in with Google as ${res.user?.fullName || res.user?.username}!`);
            navigate('/dashboard');
          } catch (err) {
            showError(err.response?.data?.message || err.message || 'Google sign-in failed.');
          } finally {
            setIsLoading(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    } catch (e) {
      console.warn('[Google One Tap Init Warning]', e);
    }
  }, [clientId, scriptLoaded]);

  // Handle click on Google button using Google OAuth2 Token Client popup
  const handleGoogleClick = () => {
    if (!clientId) {
      setIsConfigModalOpen(true);
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      showError('Google Identity Services is still loading. Please try again in a moment.');
      return;
    }

    setIsLoading(true);

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setIsLoading(false);
            console.error('[Google OAuth Error]', tokenResponse);
            if (tokenResponse.error === 'popup_closed_by_user') {
              showInfo('Google sign-in window was closed.');
            } else if (
              tokenResponse.error === 'access_denied' ||
              tokenResponse.error === 'origin_mismatch'
            ) {
              showError(
                `Google OAuth Error: ${tokenResponse.error}. Ensure http://localhost:5173 is added to Authorized JavaScript origins in Google Cloud Console.`
              );
              setIsHelpOpen(true);
            } else {
              showError(`Google sign-in error: ${tokenResponse.error_description || tokenResponse.error}`);
            }
            return;
          }

          // Fetch verified profile from Google's UserInfo API
          try {
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });

            if (!userInfoRes.ok) {
              throw new Error('Could not fetch user profile from Google.');
            }

            const userInfo = await userInfoRes.json();

            // Send verified Google user info to backend
            const res = await googleLogin({
              email: userInfo.email,
              name: userInfo.name || userInfo.given_name,
              avatar: userInfo.picture,
              googleId: userInfo.sub,
              accessToken: tokenResponse.access_token,
            });

            showSuccess(`Signed in with Google as ${res.user?.fullName || res.user?.username}!`);
            navigate('/dashboard');
          } catch (err) {
            console.error('[Google UserInfo / Backend Error]', err);
            showError(
              err.response?.data?.message || err.message || 'Failed to authenticate Google user.'
            );
          } finally {
            setIsLoading(false);
          }
        },
        error_callback: (err) => {
          setIsLoading(false);
          console.error('[Google OAuth Error Callback]', err);
          showError(
            err.message ||
              'Google OAuth encountered an error. Check Authorized JavaScript origins in Google Cloud Console.'
          );
          setIsHelpOpen(true);
        },
      });

      // Request access token with account selection popup
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      setIsLoading(false);
      console.error('[Google Init Exception]', err);
      showError(err.message || 'Failed to open Google authentication window.');
    }
  };

  const handleSaveClientId = (e) => {
    e.preventDefault();
    if (!inputClientId.trim()) return;
    const clean = inputClientId.trim();
    localStorage.setItem('google_client_id', clean);
    setClientId(clean);
    setIsConfigModalOpen(false);
    showSuccess('Google Client ID applied successfully.');
  };

  return (
    <div className="w-full">
      {/* Primary Full-width Google Sign-In Button */}
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={isLoading}
        className={`w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-slate-300 border-t-brand-700 rounded-full animate-spin" />
            <span className="text-xs sm:text-sm font-medium">Connecting to Google...</span>
          </>
        ) : (
          <>
            <GoogleIcon className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">{text}</span>
          </>
        )}
      </button>

      {/* Origin Configuration Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface rounded-2xl border border-slate-200 shadow-modal max-w-lg w-full p-6 animate-scale-in">
            <div className="flex items-start justify-between pb-3 border-b border-borderMuted">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-textMain">Google Cloud Configuration</h3>
                  <p className="text-xs text-muted">Required URIs for Google OAuth</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="p-1 text-muted hover:text-textMain rounded-lg hover:bg-black/5"
                aria-label="Close Google help modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-textMain">
              <p className="text-muted leading-relaxed">
                If Google displays <strong className="text-rose-600">origin_mismatch</strong> or{' '}
                <strong className="text-rose-600">redirect_uri_mismatch</strong>, configure these in{' '}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-700 font-semibold underline inline-flex items-center gap-1"
                >
                  Google Cloud Console <ExternalLink className="w-3 h-3" />
                </a>
                :
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  1. Authorized JavaScript Origins:
                </span>
                <code className="block bg-white px-2 py-1 rounded border border-slate-200 font-mono text-[11px] text-brand-800">
                  http://localhost:5173
                </code>
                <code className="block bg-white px-2 py-1 rounded border border-slate-200 font-mono text-[11px] text-brand-800">
                  http://localhost
                </code>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  2. Authorized Redirect URIs:
                </span>
                <code className="block bg-white px-2 py-1 rounded border border-slate-200 font-mono text-[11px] text-brand-800">
                  http://localhost:5173
                </code>
                <code className="block bg-white px-2 py-1 rounded border border-slate-200 font-mono text-[11px] text-brand-800">
                  http://localhost:5173/login
                </code>
                <code className="block bg-white px-2 py-1 rounded border border-slate-200 font-mono text-[11px] text-brand-800">
                  http://localhost:5173/signup
                </code>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(false)}
                  className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client ID Configuration Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface rounded-2xl border border-slate-200 shadow-modal max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-start justify-between pb-3 border-b border-borderMuted">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <GoogleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-textMain">Google OAuth Integration</h3>
                  <p className="text-xs text-muted">Configure Google Client ID</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1 text-muted hover:text-textMain rounded-lg hover:bg-black/5"
                aria-label="Close configuration modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClientId} className="mt-4 space-y-3.5">
              <p className="text-xs text-muted leading-relaxed">
                Enter your Google Cloud OAuth Client ID below:
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-textMain mb-1">
                  Google Client ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. xxxxxxxx.apps.googleusercontent.com"
                  value={inputClientId}
                  onChange={(e) => setInputClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-bgMain/50 border border-slate-200 rounded-xl text-xs font-mono text-textMain focus-ring"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-textMain hover:bg-black/5 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
