import React from 'react';
import { FormattedMessage } from 'react-intl';

function TermsPage() {
    // It's good practice to define a variable for dynamic values if they are used multiple times
    // or need some logic, though for a static string like a website name, direct use is also fine.
    const websiteName = "LancerPages";
    const websiteUrl = "[Your Website URL]"; // Placeholder, should be updated or made dynamic

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
                <FormattedMessage id="termsPage.title" defaultMessage="Terms and Conditions" />
            </h1>

            <div className="bg-white p-6 rounded-lg shadow-md space-y-4 text-gray-700">
                <p><FormattedMessage id="termsPage.welcome" defaultMessage="Welcome to {websiteName}!" values={{ websiteName }} /></p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="termsPage.introduction.title" defaultMessage="1. Introduction" /></h2>
                <p><FormattedMessage id="termsPage.introduction.p1" defaultMessage="These Website Standard Terms and Conditions written on this webpage shall manage your use of our website, {websiteName} accessible at {websiteUrl}." values={{ websiteName, websiteUrl }} /></p>
                <p><FormattedMessage id="termsPage.introduction.p2" defaultMessage="These Terms will be applied fully and affect to your use of this Website. By using this Website, you agreed to accept all terms and conditions written in here. You must not use this Website if you disagree with any of these Website Standard Terms and Conditions." /></p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="termsPage.ipRights.title" defaultMessage="2. Intellectual Property Rights" /></h2>
                <p><FormattedMessage id="termsPage.ipRights.p1" defaultMessage="Other than the content you own, under these Terms, {websiteName} and/or its licensors own all the intellectual property rights and materials contained in this Website." values={{ websiteName }} /></p>
                <p><FormattedMessage id="termsPage.ipRights.p2" defaultMessage="You are granted limited license only for purposes of viewing the material contained on this Website." /></p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="termsPage.restrictions.title" defaultMessage="3. Restrictions" /></h2>
                <p><FormattedMessage id="termsPage.restrictions.p1" defaultMessage="You are specifically restricted from all of the following:" /></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><FormattedMessage id="termsPage.restrictions.item1" defaultMessage="publishing any Website material in any other media;" /></li>
                    <li><FormattedMessage id="termsPage.restrictions.item2" defaultMessage="selling, sublicensing and/or otherwise commercializing any Website material;" /></li>
                    <li><FormattedMessage id="termsPage.restrictions.item3" defaultMessage="publicly performing and/or showing any Website material;" /></li>
                    <li><FormattedMessage id="termsPage.restrictions.item4" defaultMessage="using this Website in any way that is or may be damaging to this Website;" /></li>
                    <li><FormattedMessage id="termsPage.restrictions.item5" defaultMessage="using this Website in any way that impacts user access to this Website;" /></li>
                    <li><FormattedMessage id="termsPage.restrictions.item6" defaultMessage="using this Website contrary to applicable laws and regulations, or in any way may cause harm to the Website, or to any person or business entity;" /></li>
                    <li><FormattedMessage id="termsPage.restrictions.item7" defaultMessage="engaging in any data mining, data harvesting, data extracting or any other similar activity in relation to this Website;" /></li>
                    <li><FormattedMessage id="termsPage.restrictions.item8" defaultMessage="using this Website to engage in any advertising or marketing." /></li>
                </ul>
                <p><FormattedMessage id="termsPage.restrictions.p2" defaultMessage="Certain areas of this Website are restricted from being access by you and {websiteName} may further restrict access by you to any areas of this Website, at any time, in absolute discretion. Any user ID and password you may have for this Website are confidential and you must maintain confidentiality as well." values={{ websiteName }} /></p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="termsPage.yourContent.title" defaultMessage="4. Your Content" /></h2>
                <p><FormattedMessage id="termsPage.yourContent.p1" defaultMessage="In these Website Standard Terms and Conditions, “Your Content” shall mean any audio, video text, images or other material you choose to display on this Website. By displaying Your Content, you grant {websiteName} a non-exclusive, worldwide irrevocable, sub licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media." values={{ websiteName }} /></p>
                <p><FormattedMessage id="termsPage.yourContent.p2" defaultMessage="Your Content must be your own and must not be invading any third-party’s rights. {websiteName} reserves the right to remove any of Your Content from this Website at any time without notice." values={{ websiteName }} /></p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="termsPage.noWarranties.title" defaultMessage="5. No warranties" /></h2>
                <p><FormattedMessage id="termsPage.noWarranties.p1" defaultMessage="This Website is provided “as is,” with all faults, and {websiteName} express no representations or warranties, of any kind related to this Website or the materials contained on this Website. Also, nothing contained on this Website shall be interpreted as advising you." values={{ websiteName }} /></p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="termsPage.limitationOfLiability.title" defaultMessage="6. Limitation of liability" /></h2>
                <p><FormattedMessage id="termsPage.limitationOfLiability.p1" defaultMessage="In no event shall {websiteName}, nor any of its officers, directors and employees, shall be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. {websiteName}, including its officers, directors and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website." values={{ websiteName }} /></p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="termsPage.indemnification.title" defaultMessage="7. Indemnification" /></h2>
                <p><FormattedMessage id="termsPage.indemnification.p1" defaultMessage="You hereby indemnify to the fullest extent {websiteName} from and against any and/or all liabilities, costs, demands, causes of action, damages and expenses arising in any way related to your breach of any of the provisions of these Terms." values={{ websiteName }} /></p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="termsPage.severability.title" defaultMessage="8. Severability" /></h2>
                <p><FormattedMessage id="termsPage.severability.p1" defaultMessage="If any provision of these Terms is found to be invalid under any applicable law, such provisions shall be deleted without affecting the remaining provisions herein." /></p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="termsPage.variationOfTerms.title" defaultMessage="9. Variation of Terms" /></h2>
                <p><FormattedMessage id="termsPage.variationOfTerms.p1" defaultMessage="{websiteName} is permitted to revise these Terms at any time as it sees fit, and by using this Website you are expected to review these Terms on a regular basis." values={{ websiteName }} /></p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="termsPage.assignment.title" defaultMessage="10. Assignment" /></h2>
                <p><FormattedMessage id="termsPage.assignment.p1" defaultMessage="The {websiteName} is allowed to assign, transfer, and subcontract its rights and/or obligations under these Terms without any notification. However, you are not allowed to assign, transfer, or subcontract any of your rights and/or obligations under these Terms." values={{ websiteName }} /></p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="termsPage.entireAgreement.title" defaultMessage="11. Entire Agreement" /></h2>
                <p><FormattedMessage id="termsPage.entireAgreement.p1" defaultMessage="These Terms constitute the entire agreement between {websiteName} and you in relation to your use of this Website, and supersede all prior agreements and understandings." values={{ websiteName }} /></p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800"><FormattedMessage id="termsPage.governingLaw.title" defaultMessage="12. Governing Law & Jurisdiction" /></h2>
                <p><FormattedMessage id="termsPage.governingLaw.p1" defaultMessage="These Terms will be governed by and interpreted in accordance with the laws of [Your Country/State], and you submit to the non-exclusive jurisdiction of the state and federal courts located in [Your Country/State] for the resolution of any disputes." /></p>

                <p className="mt-6"><FormattedMessage id="termsPage.lastUpdated" defaultMessage="Last updated: {date}" values={{ date: new Date().toLocaleDateString() }} /></p>
            </div>
        </div>
    );
}

export default TermsPage;
