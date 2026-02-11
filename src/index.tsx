import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './app/store';
import './sass/styles';
import React from 'react';

const root = ReactDOM.createRoot(
  document.getElementById('root')!
) as ReactDOM.Root;

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
