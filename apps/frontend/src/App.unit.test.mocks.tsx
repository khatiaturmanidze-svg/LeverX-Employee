import React from 'react';

export const mockPagesModule = {
  SignIn: () => <div data-testid="signin-page">SignIn</div>,
  SignUp: () => <div data-testid="signup-page">SignUp</div>,
  NewPassword: () => <div data-testid="new-password-page">NewPassword</div>,
  Main: () => <div data-testid="main-page">Main</div>,
  Details: () => <div data-testid="details-page">Details</div>,
  Roles: () => <div data-testid="roles-page">Roles</div>,
  Requests: () => <div data-testid="requests-page">Requests</div>,
  Create: () => <div data-testid="create-page">Create</div>,
};
