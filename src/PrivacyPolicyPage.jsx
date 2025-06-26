import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

function PrivacyPolicyPage() {
    const intl = useIntl();

    const handleNavigateToProfileEdit = () => {
        alert(intl.formatMessage({ id: "privacyPolicy.navigateToProfileEditPlaceholder", defaultMessage: "Navigation to profile edit/data management page would occur here." }));
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
                <FormattedMessage id="privacyPage.title" defaultMessage="Privacy Policy" />
            </h1>

            <div className="bg-white p-6 rounded-lg shadow-md space-y-6 text-gray-700">
                <p>
                    <FormattedMessage
                        id="privacyPolicy.intro"
                        defaultMessage="Your privacy is important to us. It is LancerPages' policy to respect your privacy regarding any information we may collect from you across our website, {websiteUrl}, and other sites we own and operate."
                        values={{ websiteUrl: <a href="https://lancerpages.com" className="text-indigo-600 hover:underline">lancerpages.com</a> }}
                    />
                </p>

                {/* GDPR Specific Sections */}
                <h2 className="text-2xl font-semibold mt-6 mb-2 text-gray-800 border-b pb-2">
                    <FormattedMessage id="privacyPolicy.gdpr.dataCollectionTitle" defaultMessage="Data Collection (GDPR)"/>
                </h2>
                <p>
                    <FormattedMessage
                        id="privacyPolicy.gdpr.dataCollectionText"
                        defaultMessage="We collect only essential data for platform functionality. We use cookies for user authentication (essential) and basic analytics (non-essential, requires consent)."
                    />
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-2 text-gray-800 border-b pb-2">
                    <FormattedMessage id="privacyPolicy.gdpr.cookiesUsedTitle" defaultMessage="Cookies Used (GDPR)"/>
                </h2>
                <table className="w-full text-left border-collapse my-4">
                    <thead>
                        <tr>
                            <th className="border-b-2 border-gray-300 py-2 px-3 bg-gray-50"><FormattedMessage id="privacyPolicy.cookies.table.name" defaultMessage="Cookie Name"/></th>
                            <th className="border-b-2 border-gray-300 py-2 px-3 bg-gray-50"><FormattedMessage id="privacyPolicy.cookies.table.purpose" defaultMessage="Purpose"/></th>
                            <th className="border-b-2 border-gray-300 py-2 px-3 bg-gray-50"><FormattedMessage id="privacyPolicy.cookies.table.essential" defaultMessage="Essential?"/></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border-b border-gray-200 py-2 px-3"><code>sessionid</code> (example for session management)</td>
                            <td className="border-b border-gray-200 py-2 px-3"><FormattedMessage id="privacyPolicy.cookies.purpose.session" defaultMessage="User authentication & session management"/></td>
                            <td className="border-b border-gray-200 py-2 px-3"><FormattedMessage id="privacyPolicy.cookies.essential.yes" defaultMessage="Yes"/></td>
                        </tr>
                        <tr>
                            <td className="border-b border-gray-200 py-2 px-3"><code>gdpr_choice</code></td>
                            <td className="border-b border-gray-200 py-2 px-3"><FormattedMessage id="privacyPolicy.cookies.purpose.gdpr" defaultMessage="Stores your GDPR consent preference"/></td>
                            <td className="border-b border-gray-200 py-2 px-3"><FormattedMessage id="privacyPolicy.cookies.essential.yes" defaultMessage="Yes"/></td>
                        </tr>
                        <tr>
                            <td className="border-b border-gray-200 py-2 px-3"><code>_ga</code>, <code>_gid</code> (examples for analytics)</td>
                            <td className="border-b border-gray-200 py-2 px-3"><FormattedMessage id="privacyPolicy.cookies.purpose.analytics" defaultMessage="Basic website analytics (e.g., Google Analytics)"/></td>
                            <td className="border-b border-gray-200 py-2 px-3"><FormattedMessage id="privacyPolicy.cookies.essential.no" defaultMessage="No (Requires Consent)"/></td>
                        </tr>
                    </tbody>
                </table>

                <h2 className="text-2xl font-semibold mt-6 mb-2 text-gray-800 border-b pb-2">
                    <FormattedMessage id="privacyPolicy.gdpr.userRightsTitle" defaultMessage="User Rights (GDPR)"/>
                </h2>
                <p><FormattedMessage id="privacyPolicy.userRights.intro" defaultMessage="You have certain rights regarding your personal data, subject to local data protection laws. These may include the right to:"/></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><FormattedMessage id="privacyPolicy.userRights.access" defaultMessage="Access your personal data."/></li>
                    <li><FormattedMessage id="privacyPolicy.userRights.rectify" defaultMessage="Correct inaccurate or incomplete data."/></li>
                    <li><FormattedMessage id="privacyPolicy.userRights.erase" defaultMessage="Request deletion of your personal data."/> (<button onClick={handleNavigateToProfileEdit} className="text-indigo-600 hover:underline"><FormattedMessage id="privacyPolicy.userRights.deleteAccountLink" defaultMessage="Manage in Profile Settings"/></button>)</li>
                    <li><FormattedMessage id="privacyPolicy.userRights.export" defaultMessage="Request a copy of your personal data."/> (<button onClick={handleNavigateToProfileEdit} className="text-indigo-600 hover:underline"><FormattedMessage id="privacyPolicy.userRights.downloadDataLink" defaultMessage="Manage in Profile Settings"/></button>)</li>
                    <li><FormattedMessage id="privacyPolicy.userRights.withdrawConsent" defaultMessage="Withdraw consent for non-essential data processing (e.g., via our cookie banner)."/></li>
                </ul>
                 <p>
                    <FormattedMessage
                        id="privacyPolicy.userRights.contact"
                        defaultMessage="To exercise these rights, or if you have questions about our privacy practices, please contact us at {email}."
                        values={{ email: <a href="mailto:directoryhelperbot@gmail.com" className="text-indigo-600 hover:underline">directoryhelperbot@gmail.com</a>}}
                    />
                </p>
                {/* End GDPR Specific Sections */}

                <h2 className="text-xl font-semibold mt-8 mb-2 text-gray-800 border-t pt-4"><FormattedMessage id="privacyPolicy.infoCollectGen.title" defaultMessage="1. Information We Collect (General)" /></h2>
                <p><FormattedMessage id="privacyPolicy.infoCollectGen.p1" defaultMessage="We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used."/></p>

                <h3 className="text-lg font-semibold mt-3 mb-1 text-gray-800"><FormattedMessage id="privacyPolicy.infoCollectGen.logData.title" defaultMessage="Log Data"/></h3>
                <p><FormattedMessage id="privacyPolicy.infoCollectGen.logData.p1" defaultMessage="When you visit our website, our servers may automatically log the standard data provided by your web browser. This may include your computer’s Internet Protocol (IP) address, your browser type and version, the pages you visit, the time and date of your visit, the time spent on each page, and other details."/></p>

                <h3 className="text-lg font-semibold mt-3 mb-1 text-gray-800"><FormattedMessage id="privacyPolicy.infoCollectGen.personalInfo.title" defaultMessage="Personal Information"/></h3>
                <p><FormattedMessage id="privacyPolicy.infoCollectGen.personalInfo.p1" defaultMessage="We may ask for personal information, such as your:"/></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><FormattedMessage id="privacyPolicy.infoCollectGen.personalInfo.item1" defaultMessage="Name"/></li>
                    <li><FormattedMessage id="privacyPolicy.infoCollectGen.personalInfo.item2" defaultMessage="Email"/></li>
                    <li><FormattedMessage id="privacyPolicy.infoCollectGen.personalInfo.item3" defaultMessage="Contact information (if you choose to provide it for your public profile)"/></li>
                    <li><FormattedMessage id="privacyPolicy.infoCollectGen.personalInfo.item4" defaultMessage="Professional details (domains, bio, links, location for your public profile)"/></li>
                </ul>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="privacyPolicy.howWeUseGen.title" defaultMessage="2. How We Use Your Information (General)"/></h2>
                <p><FormattedMessage id="privacyPolicy.howWeUseGen.p1" defaultMessage="We use the information we collect in various ways, including to:"/></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><FormattedMessage id="privacyPolicy.howWeUseGen.item1" defaultMessage="Provide, operate, and maintain our website"/></li>
                    <li><FormattedMessage id="privacyPolicy.howWeUseGen.item2" defaultMessage="Improve, personalize, and expand our website"/></li>
                    <li><FormattedMessage id="privacyPolicy.howWeUseGen.item3" defaultMessage="Understand and analyze how you use our website"/></li>
                    <li><FormattedMessage id="privacyPolicy.howWeUseGen.item4" defaultMessage="Develop new products, services, features, and functionality"/></li>
                    <li><FormattedMessage id="privacyPolicy.howWeUseGen.item5" defaultMessage="Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes (with your consent)"/></li>
                    <li><FormattedMessage id="privacyPolicy.howWeUseGen.item6" defaultMessage="Process your transactions (e.g. if premium features are introduced)"/></li>
                    <li><FormattedMessage id="privacyPolicy.howWeUseGen.item7" defaultMessage="Find and prevent fraud"/></li>
                    <li><FormattedMessage id="privacyPolicy.howWeUseGen.item8" defaultMessage="Facilitate the public directory of freelancers as per your profile settings"/></li>
                </ul>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="privacyPolicy.sharingGen.title" defaultMessage="3. Sharing Your Information (General)"/></h2>
                <p><FormattedMessage id="privacyPolicy.sharingGen.p1" defaultMessage="The primary purpose of LancerPages is to create a public directory. Information you provide for your public profile (name, domains, bio, links, city, country) will be visible to users of the website."/></p>
                <p><FormattedMessage id="privacyPolicy.sharingGen.p2" defaultMessage="We do not share your personally identifying information publicly or with third-parties, except when required to by law, or with your explicit consent for specific features (e.g., connecting with clients if a premium feature is enabled)."/></p>
                <p><FormattedMessage id="privacyPolicy.sharingGen.p3" defaultMessage="We may share aggregated, non-personally identifiable information publicly and with our partners – for example, in trend reports about use of our services."/></p>


                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="privacyPolicy.dataSecurityGen.title" defaultMessage="4. Data Security (General)"/></h2>
                <p><FormattedMessage id="privacyPolicy.dataSecurityGen.p1" defaultMessage="We take security seriously and take reasonable steps to protect your personal information from loss, theft, unauthorized access, disclosure, copying, use, or modification. That said, we advise that no method of electronic transmission or storage is 100% secure, and cannot guarantee absolute data security."/></p>
                <p><FormattedMessage id="privacyPolicy.dataSecurityGen.p2" defaultMessage="Your account information is protected by a password, which you should keep confidential. It is important that you protect against unauthorized access to your account and information by choosing your password carefully and by signing off after you have finished using your account."/></p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="privacyPolicy.dataRetentionGen.title" defaultMessage="5. Data Retention (General)"/></h2>
                <p><FormattedMessage id="privacyPolicy.dataRetentionGen.p1" defaultMessage="We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification."/></p>
                <p><FormattedMessage id="privacyPolicy.dataRetentionGen.p2" defaultMessage="You can request deletion of your personal data by contacting us. Please note that some information may be retained if required by law or for legitimate business purposes (like fraud prevention)."/></p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="privacyPolicy.cookiesGen.title" defaultMessage="6. Cookies (General)"/></h2>
                <p><FormattedMessage id="privacyPolicy.cookiesGen.p1" defaultMessage="We use “cookies” to collect information about you and your activity across our site. A cookie is a small piece of data that our website stores on your computer, and accesses each time you visit, so we can understand how you use our site. This helps us serve you content based on preferences you have specified. You can disable cookies in your browser, but this may affect your ability to use some features of our website."/></p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="privacyPolicy.thirdPartyGen.title" defaultMessage="7. Third-Party Services (General)"/></h2>
                <p><FormattedMessage id="privacyPolicy.thirdPartyGen.p1" defaultMessage="Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and policies of those sites, and cannot accept responsibility or liability for their respective privacy practices."/></p>
                <p><FormattedMessage id="privacyPolicy.thirdPartyGen.p2" defaultMessage="We use Firebase for authentication, database, and analytics. Firebase is a Google product and its use is governed by Google's privacy policies."/></p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="privacyPolicy.childrensPrivacyGen.title" defaultMessage="8. Children's Privacy (General)"/></h2>
                <p><FormattedMessage id="privacyPolicy.childrensPrivacyGen.p1" defaultMessage="Our services are not directed to children under the age of 13 (or a higher age threshold where applicable under local laws), and we do not knowingly collect personal information from children. If we learn that we have collected personal information from a child without verification of parental consent, we will take steps to remove that information from our servers."/></p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="privacyPolicy.yourRightsGen.title" defaultMessage="9. Your Rights (General)"/></h2>
                <p><FormattedMessage id="privacyPolicy.yourRightsGen.p1" defaultMessage="You have the right to be informed about how your personal data is used, the right to access your personal data, and the right to have your personal data corrected or deleted. You also have the right to withdraw consent at any time where LancerPages is relying on consent to process your personal data."/></p>
                <p><FormattedMessage id="privacyPolicy.yourRightsGen.p2" defaultMessage="Depending on your location, you may have other rights under local data protection laws. To exercise these rights, please contact us."/></p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="privacyPolicy.changesGen.title" defaultMessage="10. Changes to This Policy (General)"/></h2>
                <p><FormattedMessage id="privacyPolicy.changesGen.p1" defaultMessage="We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page."/></p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="privacyPolicy.contactGen.title" defaultMessage="11. Contact Us (General)"/></h2>
                <p><FormattedMessage id="privacyPolicy.contactGen.p1" defaultMessage="If you have any questions about this Privacy Policy, please contact us at {email}." values={{email: <a href="mailto:directoryhelperbot@gmail.com" className="text-indigo-600 hover:underline">directoryhelperbot@gmail.com</a>}}/></p>

                <p className="mt-6">
                    <FormattedMessage id="privacyPolicy.lastUpdated" defaultMessage="Last updated: {date}" values={{date: new Date().toLocaleDateString()}}/>
                </p>
            </div>
        </div>
    );
}

export default PrivacyPolicyPage;
