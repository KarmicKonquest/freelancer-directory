import React from 'react';
import ReactDOM from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import App from './App.jsx';
import './index.css';
import enMessages from './locales/en.json'; // Import the messages

// For now, we'll default to English. Language switching can be added later.
const locale = navigator.language.split(/[-_]/)[0] || 'en';
// A more robust solution would involve user preference, local storage, etc.
// For simplicity, we'll just use 'en' for now, but this shows how one might detect.
const messages = {
  'en': enMessages,
  // Add other languages here, e.g., 'es': esMessages
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <IntlProvider locale={'en'} messages={messages['en']}>
      <App />
    </IntlProvider>
  </React.StrictMode>,
)
