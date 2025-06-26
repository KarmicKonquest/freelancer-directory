import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

// Placeholder functions - these would be defined in App.jsx or a utility
// and passed down or imported if they need to interact with app-level state/logic for script loading.
// For now, they are just illustrative.
const loadNonEssentialScripts = () => {
  console.log('GDPR Consent: Loading non-essential scripts...');
  // Example: Dynamically load a script or enable a service
  // if (typeof window.gtag === 'function') { // Check if GA is defined
  //   window.gtag('config', 'YOUR_GA_MEASUREMENT_ID'); // Re-enable if previously disabled
  // }
};

const blockNonEssentialScripts = () => {
  console.log('GDPR Consent: Blocking non-essential scripts...');
  // Example: Disable Google Analytics
  // window['ga-disable-YOUR_GA_MEASUREMENT_ID'] = true;
};


function GDPRBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const intl = useIntl();

  useEffect(() => {
    const gdprChoice = localStorage.getItem('gdpr_choice');
    if (!gdprChoice) {
      setIsVisible(true);
    } else if (gdprChoice === 'accepted') {
      loadNonEssentialScripts();
    } else if (gdprChoice === 'rejected') {
      blockNonEssentialScripts();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('gdpr_choice', 'accepted');
    setIsVisible(false);
    loadNonEssentialScripts();
  };

  const handleReject = () => {
    localStorage.setItem('gdpr_choice', 'rejected');
    setIsVisible(false);
    blockNonEssentialScripts();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
        id="gdpr-banner"
        className="fixed bottom-0 left-0 right-0 bg-gray-100 p-4 shadow-lg border-t border-gray-300 z-[1000] text-sm text-gray-700"
        style={{ display: isVisible ? 'block' : 'none' }}
    >
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <p className="mb-3 md:mb-0 md:mr-4">
          <FormattedMessage
            id="gdpr.banner.text"
            defaultMessage="We use cookies to provide essential functionality and to improve your experience. By continuing, you agree to our use of cookies. See our {privacyPolicyLink} for more details."
            values={{
              privacyPolicyLink: (
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  <FormattedMessage id="gdpr.banner.privacyPolicyLinkText" defaultMessage="Privacy Policy"/>
                </a>
              )
            }}
          />
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            id="gdpr-accept"
            onClick={handleAccept}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow hover:shadow-md transition-all duration-150"
          >
            <FormattedMessage id="gdpr.banner.acceptButton" defaultMessage="Accept All"/>
          </button>
          <button
            id="gdpr-reject"
            onClick={handleReject}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow hover:shadow-md transition-all duration-150"
          >
            <FormattedMessage id="gdpr.banner.rejectButton" defaultMessage="Reject Non-Essential"/>
          </button>
        </div>
      </div>
    </div>
  );
}

export default GDPRBanner;
