import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Import the necessary components from react-intl
import { IntlProvider } from 'react-intl';
// Import your new messages file
import { messages } from './messages.js';

// Determine the user's locale (for now, we'll default to English)
const locale = 'en';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <IntlProvider locale={locale} messages={messages[locale]}>
      <App />
    </IntlProvider>
  </React.StrictMode>,
);
