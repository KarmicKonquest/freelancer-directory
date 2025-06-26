import React from 'react';

function AboutPage() {
    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">About LancerPages</h1>

            <div className="bg-white p-6 rounded-lg shadow-md space-y-4 text-gray-700">
                <p className="text-lg">Welcome to LancerPages – your go-to directory for discovering skilled freelance professionals from around the globe!</p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800">Our Mission</h2>
                <p>At LancerPages, our mission is simple: to connect talented freelancers with clients who need their expertise. We aim to create a straightforward, accessible platform where professionals can showcase their skills and clients can easily find the right talent for their projects.</p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800">Why LancerPages?</h2>
                <p>In a world brimming with talent, finding the right freelancer or getting your skills noticed can be challenging. LancerPages is designed to bridge that gap. We provide:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>A curated directory of professionals across various domains.</li>
                    <li>Easy-to-use search and filtering tools to find the perfect match.</li>
                    <li>A platform for freelancers to create detailed profiles highlighting their expertise, experience, and portfolio.</li>
                    <li>A community space for interaction and networking (like our Chat feature!).</li>
                </ul>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800">For Freelancers</h2>
                <p>Showcase your skills, experience, and portfolio to a global audience. Create your profile, list your domains of expertise, and let potential clients find you. LancerPages is your space to shine and grow your freelance career.</p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800">For Clients & Hirers</h2>
                <p>Browse through a diverse pool of talented freelancers. Whether you're looking for a designer, developer, marketer, writer, or any other skilled professional, LancerPages helps you find the right person for your project quickly and efficiently.</p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800">Our Commitment</h2>
                <p>We are committed to continuously improving LancerPages to make it the most effective and user-friendly platform for both freelancers and clients. We believe in transparency, quality, and fostering a supportive community.</p>

                <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800">Get in Touch</h2>
                <p>We value your feedback and suggestions. If you have any questions or ideas on how we can improve LancerPages, please don't hesitate to reach out to us at directoryhelperbot@gmail.com.</p>

                <p className="mt-6">Thank you for being a part of the LancerPages community!</p>
            </div>
        </div>
    );
}

export default AboutPage;
