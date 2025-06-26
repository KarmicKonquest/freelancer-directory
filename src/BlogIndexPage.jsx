import React from 'react';
import { FormattedMessage } from 'react-intl';

// This component will receive a 'hubType' or similar prop later
// to customize content based on the route.
function BlogIndexPage({ hubType }) {
    let title = "Blog";
    let description = "Welcome to our blog. Discover articles on hiring and freelancing.";

    if (hubType) {
        // Basic customization based on hubType
        if (hubType.startsWith("hire-in-")) {
            const location = hubType.replace("hire-in-", "").replace("-", " ");
            title = `Hiring Insights for ${location.charAt(0).toUpperCase() + location.slice(1)}`;
            description = `Find the best freelancers and hiring tips for ${location.charAt(0).toUpperCase() + location.slice(1)}.`;
        } else if (hubType.startsWith("freelance-in-")) {
            const location = hubType.replace("freelance-in-", "").replace("-", " ");
            title = `Freelancing in ${location.charAt(0).toUpperCase() + location.slice(1)}`;
            description = `Guides and tips for freelancers working in ${location.charAt(0).toUpperCase() + location.slice(1)}.`;
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">{title}</h1>
            <p className="text-lg text-gray-600 mb-8">{description}</p>

            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <h2 className="text-2xl font-semibold text-gray-700">Featured Articles</h2>
                {/* Placeholder for blog posts list */}
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

                {/* Example of how individual posts might be linked (for future use) */}
                {/*
                <div className="pt-4">
                    <h3 className="text-xl font-semibold text-indigo-600 hover:underline">
                        <a href="#">Example Blog Post Title 1</a>
                    </h3>
                    <p className="text-sm text-gray-500">Published on January 1, 2024</p>
                    <p className="text-gray-600 mt-1">A short summary of the blog post...</p>
                </div>
                <div className="pt-4 border-t mt-4">
                    <h3 className="text-xl font-semibold text-indigo-600 hover:underline">
                        <a href="#">Example Blog Post Title 2</a>
                    </h3>
                    <p className="text-sm text-gray-500">Published on January 5, 2024</p>
                    <p className="text-gray-600 mt-1">Another interesting topic discussed here...</p>
                </div>
                */}
            </div>
        </div>
    );
}

export default BlogIndexPage;
