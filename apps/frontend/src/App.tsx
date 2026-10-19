import React, { lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import Loading from './shared/ui/Loading';
import TestRenderingPage from './pages/test-rendering/TestRenderingPage';

const SignIn = lazy(() => import('@/pages/SignIn'));
const SignUp = lazy(() => import('@/pages/SignUp'));
const NewPassword = lazy(() => import('@/pages/NewPassword'));
const Main = lazy(() => import('@/pages/Main'));
const Details = lazy(() => import('@/pages/Details'));
const Roles = lazy(() => import('@/pages/Roles'));
const Requests = lazy(() => import('@/pages/Requests'));
const Create = lazy(() => import('@/pages/Create'));

const isAuthenticated = () => {
  return (
    localStorage.getItem('loggedInUser') ||
    sessionStorage.getItem('loggedInUser')
  );
};

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const { pathname } = useLocation();
  if (!isAuthenticated()) return <Navigate to="/signin" replace />;

  const storage = localStorage.getItem('loggedInUser')
    ? localStorage
    : sessionStorage;
  let mustChangePassword = false;
  try {
    mustChangePassword =
      JSON.parse(storage.getItem('result') ?? '{}').mustChangePassword === true;
  } catch {
    // Ignore malformed stored auth payload.
  }

  return mustChangePassword && pathname !== '/new-password' ? (
    <Navigate to="/new-password" replace />
  ) : (
    children
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
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
    </BrowserRouter>
  );
}
