import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHandleSignInCallback } from '@logto/react';
import { AlertCircle, Loader2 } from 'lucide-react';

interface CallbackProps {
  onComplete?: () => void;
}

export const Callback: React.FC<CallbackProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const navigatedRef = useRef(false);

  const performNavigation = useCallback(() => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    const redirectUrl = sessionStorage.getItem('lume_post_login_redirect') || '/admin';
    sessionStorage.removeItem('lume_post_login_redirect');
    if (onComplete) {
      onComplete();
    }
    navigate(redirectUrl, { replace: true });
  }, [navigate, onComplete]);

  const { error, isAuthenticated } = useHandleSignInCallback(() => {
    performNavigation();
  });

  useEffect(() => {
    if (error) {
      return;
    }

    if (isAuthenticated) {
      performNavigation();
      return;
    }

    if (!window.location.search.includes('code=')) {
      performNavigation();
      return;
    }

    const timer = setTimeout(() => {
      performNavigation();
    }, 4000);

    return () => clearTimeout(timer);
  }, [error, isAuthenticated, performNavigation]);

  if (error) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-paper-100 text-charcoal-900 font-sans p-6 select-none">
        <div className="w-12 h-12 border border-status-cancelled-border bg-status-cancelled-bg text-status-cancelled-text flex items-center justify-center rounded-sm mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-headline font-bold mb-2">Authentication Failed</h2>
        <p className="text-body text-charcoal-500 max-w-md text-center mb-6 font-mono text-label">
          {error.message || 'Logto authentication could not be completed.'}
        </p>
        <button
          onClick={() => {
            navigate('/', { replace: true });
          }}
          className="px-6 py-2.5 bg-charcoal-900 text-paper-50 rounded-sm text-label font-medium hover:bg-charcoal-700 transition-colors"
        >
          Return to Atelier
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-paper-100 text-charcoal-900 font-sans select-none">
      <div className="w-10 h-10 border border-charcoal-900 flex items-center justify-center mb-4 bg-paper-50">
        <span className="font-serif text-xl font-bold">L</span>
      </div>
      <div className="flex items-center gap-2.5 text-charcoal-700 text-label font-mono">
        <Loader2 className="w-4 h-4 animate-spin text-terracotta-500" />
        <span>Completing authentication with Logto...</span>
      </div>
    </div>
  );
};
