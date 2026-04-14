import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignIn, SignUp, Main, Details, Roles, Requests } from '@/pages';

const isAuthenticated = () => {
  return (
    localStorage.getItem('loggedInUser') ||
    sessionStorage.getItem('loggedInUser')
  );
};

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  return isAuthenticated() ? children : <Navigate to="/signin" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />

        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

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
      </Routes>
    </BrowserRouter>
  );
}
