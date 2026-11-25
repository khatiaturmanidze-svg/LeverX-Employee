import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { bootstrapSession } from './sessionBootstrap';
import { selectSession } from './sessionSlice';
import type { AppDispatch } from './store';
import Loading from '../shared/ui/Loading';
import { SignupPolicy } from '../shared/lib/SignupPolicy';

export function SessionGate({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const session = useSelector(selectSession);
  useEffect(() => {
    void dispatch(bootstrapSession());
  }, [dispatch]);
  if (!session.ready || session.status === 'checking') return <Loading />;
  if (session.status === 'error') {
    return (
      <main>
        <p role="alert">{session.error}</p>
        <button
          onClick={() => {
            void dispatch(bootstrapSession());
          }}
        >
          Try again
        </button>
      </main>
    );
  }
  return (
    <SignupPolicy.Provider value={session.allowPublicSignup}>
      {children}
    </SignupPolicy.Provider>
  );
}
