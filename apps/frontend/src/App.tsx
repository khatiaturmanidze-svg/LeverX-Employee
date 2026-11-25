import React, { lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from 'react-router-dom';
import Loading from './shared/ui/Loading';
import TestRenderingPage from './pages/test-rendering/TestRenderingPage';
import { useSelector } from 'react-redux';
import { selectSession } from './app/sessionSlice';
import { SessionGate } from './app/SessionGate';
import AccessDenied from './shared/ui/AccessDenied';

const SignIn = lazy(() => import('@/pages/SignIn'));
const SignUp = lazy(() => import('@/pages/SignUp'));
const NewPassword = lazy(() => import('@/pages/NewPassword'));
const Main = lazy(() => import('@/pages/Main'));
const Details = lazy(() => import('@/pages/Details'));
const Roles = lazy(() => import('@/pages/Roles'));
const Requests = lazy(() => import('@/pages/Requests'));
const Create = lazy(() => import('@/pages/Create'));

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const { pathname } = useLocation();
  const { account } = useSelector(selectSession);
  if (!account) return <Navigate to="/signin" replace />;
  const mustChangePassword = account.mustChangePassword;
  if (mustChangePassword && pathname !== '/new-password')
    return <Navigate to="/new-password" replace />;
  if (['/roles', '/create'].includes(pathname) && account.role !== 'Admin')
    return (
      <main>
        <AccessDenied />
      </main>
    );
  if (!mustChangePassword && pathname === '/new-password')
    return <Navigate to="/main" replace />;

  return children;
};

function PublicAuthRoute({ signup = false }: { signup?: boolean }) {
  const { account, allowPublicSignup } = useSelector(selectSession);
  if (account)
    return (
      <Navigate
        to={account.mustChangePassword ? '/new-password' : '/main'}
        replace
      />
    );
  if (signup && !allowPublicSignup)
    return (
      <main>
        <p>Public signup is disabled. Contact your administrator.</p>
        <Link to="/signin">Sign in</Link>
      </main>
    );
  return signup ? <SignUp /> : <SignIn />;
}

export default function App() {
  return (
    <BrowserRouter>
      <SessionGate>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Navigate to="/signin" replace />} />
            <Route path="/signin" element={<PublicAuthRoute />} />
            <Route path="/signup" element={<PublicAuthRoute signup />} />
            <Route
              path="/new-password"
              element={
                <PrivateRoute>
                  <NewPassword />
                </PrivateRoute>
              }
            />
            <Route
              path="/main"
              element={
                <PrivateRoute>
                  <Main />
                </PrivateRoute>
              }
            />
            <Route
              path="/details/:id"
              element={
                <PrivateRoute>
                  <Details />
                </PrivateRoute>
              }
            />
            <Route
              path="/roles"
              element={
                <PrivateRoute>
                  <Roles />
                </PrivateRoute>
              }
            />
            <Route
              path="/requests/:id"
              element={
                <PrivateRoute>
                  <Requests />
                </PrivateRoute>
              }
            />
            <Route
              path="/create"
              element={
                <PrivateRoute>
                  <Create />
                </PrivateRoute>
              }
            />{' '}
            <Route path="rendering-test" element={<TestRenderingPage />} />
          </Routes>
        </Suspense>
      </SessionGate>
    </BrowserRouter>
  );
}
