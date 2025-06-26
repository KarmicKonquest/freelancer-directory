import React from 'react';
import { FormattedMessage } from 'react-intl';

function ContactBanner() {
    const email = "directoryhelperbot@gmail.com";
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-indigo-700 text-white p-3 text-center shadow-lg z-50">
            <p className="text-sm">
                <FormattedMessage
                    id="contactBanner.mainText"
                    defaultMessage="For questions, complaints, suggestions etc. please email <link>{email}</link>"
                    values={{
                        email: email,
                        link: (chunks) => <a href={`mailto:${email}`} className="font-semibold hover:underline">{chunks}</a>
                    }}
                />
            </p>
        </div>
    );
}

export default ContactBanner;
