import React from 'react';
import { FormattedMessage } from 'react-intl';

import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

function BlogIndexPage({ hubType }) {
    const intl = useIntl();
    let titleId = "blog.title.general";
    let descriptionId = "blog.description.general";
    let titleValues = {};
    let descriptionValues = {};

    if (hubType && hubType !== "general") {
        if (hubType.startsWith("hire-in-")) {
            const location = hubType.replace("hire-in-", "").replace("-", " ");
            const formattedLocation = location.charAt(0).toUpperCase() + location.slice(1);
            titleId = "blog.title.hireInLocation";
            descriptionId = "blog.description.hireInLocation";
            titleValues = { location: formattedLocation };
            descriptionValues = { location: formattedLocation };
        } else if (hubType.startsWith("freelance-in-")) {
            const location = hubType.replace("freelance-in-", "").replace("-", " ");
            const formattedLocation = location.charAt(0).toUpperCase() + location.slice(1);
            titleId = "blog.title.freelanceInLocation";
            descriptionId = "blog.description.freelanceInLocation";
            titleValues = { location: formattedLocation };
            descriptionValues = { location: formattedLocation };
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">
                <FormattedMessage id={titleId} defaultMessage="Blog" values={titleValues} />
            </h1>
            <p className="text-lg text-gray-600 mb-8">
                <FormattedMessage id={descriptionId} defaultMessage="Welcome to our blog. Discover articles on hiring and freelancing." values={descriptionValues} />
            </p>

            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <h2 className="text-2xl font-semibold text-gray-700">
                    <FormattedMessage id="blog.featuredArticles" defaultMessage="Featured Articles" />
                </h2>
                <div className="border-t pt-4 mt-4">
                    <p className="text-gray-500">
                        <em>
                            <FormattedMessage
                                id="blog.comingSoon"
                                defaultMessage="Exciting articles and insights coming soon. Stay tuned!"
                            />
                        </em>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default BlogIndexPage;
