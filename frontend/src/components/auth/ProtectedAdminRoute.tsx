import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogto } from '@logto/react';
import { useTranslation } from 'react-i18next';
import { Loader2, ShieldAlert, ArrowLeft, LogIn, LogOut } from 'lucide-react';
import type { SyncedUser } from '../../lib/api';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  syncedUser: SyncedUser | null;
  isSyncing: boolean;
  onRoleSwitch?: (newRole: 'SALON_DIRECTOR' | 'CLIENT') => void;
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({
  children,
  syncedUser,
  isSyncing,
}) => {
  const { isAuthenticated, isLoading: isAuthLoading, signIn, signOut } = useLogto();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (isAuthLoading || isSyncing || (isAuthenticated && !syncedUser)) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-paper-100 text-charcoal-900 font-sans select-none">
        <div className="w-10 h-10 border border-charcoal-900 flex items-center justify-center mb-4 bg-paper-50">
          <span className="font-serif text-xl font-bold">L</span>
        </div>
        <div className="flex items-center gap-2.5 text-charcoal-700 text-label font-mono">
          <Loader2 className="w-4 h-4 animate-spin text-terracotta-500" />
          <span>Lume Atelier...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-paper-100 flex flex-col items-center justify-center p-6 select-none font-sans">
        <div className="w-full max-w-md bg-paper-50 border border-line p-8 rounded-sm shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 border border-charcoal-900 flex items-center justify-center bg-paper-100 mb-6">
            <span className="font-serif text-2xl font-bold text-charcoal-900">L</span>
          </div>
          <span className="text-micro font-mono uppercase tracking-widest text-charcoal-500 mb-2">
            {t('app.brand')} {t('app.tagline')}
          </span>
          <h2 className="font-serif text-display font-bold text-charcoal-900 mb-3">
            {t('auth.restricted_403_title')}
          </h2>
          <p className="text-body text-charcoal-600 mb-8 max-w-sm">
            {t('auth.restricted_staff_only')}
          </p>
          <div className="w-full space-y-3">
            <button
              onClick={() => {
                sessionStorage.setItem('lume_post_login_redirect', '/admin');
                void signIn(`${window.location.origin}/callback`);
              }}
              className="w-full py-3 bg-charcoal-900 text-paper-50 rounded-sm text-label font-medium hover:bg-charcoal-700 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{t('auth.signin_staff_btn')}</span>
            </button>
            <button
              onClick={() => navigate('/book')}
              className="w-full py-2.5 border border-line bg-paper-100 hover:bg-paper-200 text-charcoal-700 rounded-sm text-label font-mono transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('auth.goto_booking')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isStaff =
    syncedUser !== null &&
    (syncedUser.role === 'SALON_DIRECTOR' ||
      syncedUser.role === 'ADMIN' ||
      syncedUser.role === 'BARBER');

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-paper-100 flex flex-col items-center justify-center p-6 select-none font-sans">
        <div className="w-full max-w-md bg-paper-50 border border-line p-8 rounded-sm shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 border border-terracotta bg-paper-100 flex items-center justify-center rounded-sm mb-4 text-terracotta">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <span className="text-micro font-mono uppercase tracking-widest text-terracotta mb-2 font-bold">
            403 FORBIDDEN
          </span>
          <h2 className="font-serif text-display font-bold text-charcoal-900 mb-2">
            Dostęp tylko dla personelu salonu
          </h2>
          <p className="text-body text-charcoal-600 mb-6 max-w-sm">
            {t('auth.restricted_403_desc')}
          </p>
          <div className="w-full space-y-3">
            <button
              onClick={() => navigate('/book')}
              className="w-full py-3 bg-charcoal-900 text-paper-50 rounded-sm text-label font-medium hover:bg-charcoal-700 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('auth.goto_booking')}</span>
            </button>
            <button
              onClick={() => void signOut(window.location.origin)}
              className="w-full py-2 text-micro font-mono text-charcoal-500 hover:text-charcoal-900 transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('auth.signout')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
