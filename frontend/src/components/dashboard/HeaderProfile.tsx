import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLogto } from '@logto/react';
import { LogIn, LogOut, ChevronDown, UserCheck, Shield } from 'lucide-react';
import type { SyncedUser } from '../../lib/api';

interface HeaderProfileProps {
  syncedUser?: SyncedUser | null;
  onRoleSwitch?: (role: 'SALON_DIRECTOR' | 'CLIENT') => void;
}

export const HeaderProfile: React.FC<HeaderProfileProps> = ({
  syncedUser,
  onRoleSwitch,
}) => {
  const { t } = useTranslation();
  const { isAuthenticated, signIn, signOut } = useLogto();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && e.target instanceof Node && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignIn = () => {
    void signIn(`${window.location.origin}/callback`);
  };

  const handleSignOut = () => {
    setIsOpen(false);
    void signOut(window.location.origin);
  };

  if (!isAuthenticated) {
    return (
      <button
        onClick={handleSignIn}
        className="px-4 py-2 border border-charcoal-900 bg-charcoal-900 text-paper-50 rounded-sm text-label font-medium hover:bg-charcoal-700 transition-colors flex items-center gap-2"
      >
        <LogIn className="w-4 h-4" />
        <span>{t('auth.signin')}</span>
      </button>
    );
  }

  const name = syncedUser?.name || 'Sarah Mitchell';
  const roleName = syncedUser?.role === 'CLIENT' ? 'Client' : 'Salon Director';
  const avatar =
    syncedUser?.avatarUrl ||
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80';
  const email = syncedUser?.email || 'sarah.mitchell@lume.salon';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-3 p-1 rounded-sm hover:bg-paper-200 transition-colors text-left"
      >
        <img
          src={avatar}
          alt={name}
          className="w-9 h-9 rounded-full object-cover border border-line-dark shrink-0"
        />
        <div className="hidden sm:block leading-tight">
          <span className="font-semibold text-body text-charcoal-900 block truncate max-w-[130px]">
            {name}
          </span>
          <span className="text-[11px] font-mono text-charcoal-500 block truncate">
            {roleName}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-charcoal-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-paper-50 border border-line rounded-sm shadow-none p-2 z-50 animate-in fade-in select-none">
          <div className="px-3 py-2 border-b border-line">
            <span className="font-semibold text-body text-charcoal-900 block truncate">
              {name}
            </span>
            <span className="text-micro font-mono text-charcoal-500 block truncate mt-0.5">
              {email}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-micro font-mono text-terracotta">
              <UserCheck className="w-3 h-3" />
              <span>Role: {roleName}</span>
            </div>
          </div>

          {onRoleSwitch && (
            <div className="py-1 border-b border-line">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onRoleSwitch(syncedUser?.role === 'CLIENT' ? 'SALON_DIRECTOR' : 'CLIENT');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-micro font-mono text-charcoal-700 hover:bg-paper-200 rounded-sm transition-colors text-left"
              >
                <Shield className="w-3.5 h-3.5 text-terracotta-500" />
                <span>
                  {syncedUser?.role === 'CLIENT'
                    ? 'Switch to: Salon Director'
                    : 'Switch to: Client Space'}
                </span>
              </button>
            </div>
          )}

          <div className="pt-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-label text-status-cancelled-text hover:bg-paper-200 rounded-sm transition-colors text-left font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('auth.signout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
