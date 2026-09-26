import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useLogto } from '@logto/react';
import { Callback } from './components/auth/Callback';
import { ProtectedAdminRoute } from './components/auth/ProtectedAdminRoute';
import { Dashboard } from './components/dashboard/Dashboard';
import { BookingLayout } from './components/booking/BookingLayout';
import { ClientPortalView } from './components/client/ClientPortalView';
import { syncUserWithBackend, type SyncedUser } from './lib/api';
import { useBarbers, useServices } from './features/dashboard/useSalonData';
import { DEFAULT_DIRECTOR_NAME, DEFAULT_CLIENT_NAME } from './constants/defaults';

const getCachedUser = (): SyncedUser | null => {
  try {
    const raw = sessionStorage.getItem('lume_synced_user');
    return raw ? (JSON.parse(raw) as SyncedUser) : null;
  } catch {
    return null;
  }
};

export default function App() {
  const [syncedUser, setSyncedUser] = useState<SyncedUser | null>(getCachedUser);
  const [isSyncing, setIsSyncing] = useState(true);

  const updateSyncedUser = (user: SyncedUser | null) => {
    setSyncedUser(user);
    try {
      if (user) {
        sessionStorage.setItem('lume_synced_user', JSON.stringify(user));
      } else {
        sessionStorage.removeItem('lume_synced_user');
      }
    } catch {}
  };

  const { isAuthenticated, getIdTokenClaims, fetchUserInfo } = useLogto();
  const { barbers } = useBarbers();
  const { services } = useServices();

  const getIdTokenClaimsRef = useRef(getIdTokenClaims);
  const fetchUserInfoRef = useRef(fetchUserInfo);

  useEffect(() => {
    getIdTokenClaimsRef.current = getIdTokenClaims;
    fetchUserInfoRef.current = fetchUserInfo;
  });

  useEffect(() => {
    let isCancelled = false;

    if (!isAuthenticated) {
      Promise.resolve().then(() => {
        if (!isCancelled) {
          updateSyncedUser(null);
          setIsSyncing(false);
        }
      });
      return;
    }

    const resolveUserData = async () => {
      setIsSyncing(true);
      try {
        const claims = await getIdTokenClaimsRef.current();
        const sub = claims?.sub;

        if (isCancelled) return;

        if (!sub) {
          const info = await fetchUserInfoRef.current();
          if (!info?.sub) {
            if (!isCancelled) setIsSyncing(false);
            return;
          }
          if (isCancelled) return;
          const res = await syncUserWithBackend({
            logtoSub: info.sub,
            email: info.email ?? undefined,
            name: info.name ?? undefined,
            picture: info.picture ?? undefined,
          });
          if (!isCancelled) {
            updateSyncedUser(res.user);
          }
          return;
        }

        const res = await syncUserWithBackend({
          logtoSub: sub,
          email: claims.email ?? undefined,
          name: claims.name ?? undefined,
          picture: claims.picture ?? undefined,
        });

        if (!isCancelled) {
          updateSyncedUser(res.user);
        }
      } catch {
        if (!isCancelled) {
          try {
            const claims = await getIdTokenClaimsRef.current();
            if (claims?.sub) {
              const isDirector = Boolean(
                claims.email &&
                  ['borawiy457@kingdais.com', 'director@lume.salon'].includes(
                    claims.email.toLowerCase()
                  )
              );
              const fallbackRole = isDirector ? 'SALON_DIRECTOR' : 'CLIENT';
              updateSyncedUser({
                id: claims.sub,
                logtoSub: claims.sub,
                email: claims.email || `${claims.sub}@client.local`,
                name: claims.name ?? (fallbackRole === 'SALON_DIRECTOR' ? DEFAULT_DIRECTOR_NAME : DEFAULT_CLIENT_NAME),
                role: fallbackRole,
                avatarUrl: claims.picture ?? undefined,
              });
            }
          } catch {
            updateSyncedUser(null);
          }
        }
      } finally {
        if (!isCancelled) {
          setIsSyncing(false);
        }
      }
    };

    void resolveUserData();

    const timeoutId = setTimeout(() => {
      if (!isCancelled) {
        setIsSyncing(false);
      }
    }, 3500);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isAuthenticated]);

  const handleRoleSwitch = (newRole: 'SALON_DIRECTOR' | 'CLIENT') => {
    if (!syncedUser) return;
    syncUserWithBackend({
      logtoSub: syncedUser.logtoSub,
      email: syncedUser.email,
      name: syncedUser.name ?? undefined,
      picture: syncedUser.avatarUrl ?? undefined,
      role: newRole,
    })
      .then((res) => {
        updateSyncedUser(res.user);
      })
      .catch(() => {
        updateSyncedUser({ ...syncedUser, role: newRole });
      });
  };

  return (
    <Routes>
      <Route path="/" element={<BookingLayout syncedUser={syncedUser} />} />
      <Route path="/book" element={<BookingLayout syncedUser={syncedUser} />} />
      <Route path="/callback" element={<Callback />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedAdminRoute
            syncedUser={syncedUser}
            isSyncing={isSyncing}
            onRoleSwitch={handleRoleSwitch}
          >
            <Dashboard
              syncedUser={syncedUser}
              onRoleSwitch={handleRoleSwitch}
            />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/portal"
        element={
          isAuthenticated && syncedUser ? (
            <ClientPortalView
              user={syncedUser}
              barbers={barbers}
              services={services}
              onRoleSwitch={handleRoleSwitch}
            />
          ) : (
            <BookingLayout syncedUser={syncedUser} />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
