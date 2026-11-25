import { createContext } from 'react';

// Display policy only; the API independently enforces signup availability.
export const SignupPolicy = createContext(true);
