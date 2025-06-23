import React, { useState, useEffect } from 'react';
import {
    getFirestore,
    doc,
    collection,
    query,
    onSnapshot,
    where,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';

// IMPORTANT: This appId is duplicated from App.jsx. Consider centralizing if it's used in more places.
const appId = 'freelancer-directory';

/**
 * AdminPage component provides an interface for administrators.
 * It allows admins to view and approve/reject pending freelancer profiles,
 * and view/dismiss reported profiles.
 * Access is restricted to users whose UID matches ADMIN_UID (defined in App.jsx).
 * @param {object} props - Component props.
 * @param {object} props.db - Firestore database instance.
 * @param {function} props.navigateToProfile - Function to navigate to a freelancer's profile page.
 */
function AdminPage({ db, navigateToProfile }) {
    const [pendingProfiles, setPendingProfiles] = useState([]);
    const [reportedProfiles, setReportedProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) {
            setLoading(false); // Set loading to false if db is not available
            return;
        }
        setLoading(true);

        const pendingQuery = query(collection(db, `/artifacts/${appId}/public/data/profiles`), where("status", "==", "pending"));
        const reportsQuery = query(collection(db, `/artifacts/${appId}/public/data/reports`), where("status", "==", "new"));

        const unsubPending = onSnapshot(pendingQuery, (snap) => {
            const profiles = [];
            snap.forEach(doc => profiles.push({ id: doc.id, ...doc.data() }));
            setPendingProfiles(profiles);
            setLoading(false); // Stop loading after pending profiles are fetched
        }, (error) => {
            console.error("Error fetching pending profiles:", error);
            setLoading(false);
        });

        const unsubReports = onSnapshot(reportsQuery, (snap) => {
            const reports = [];
            snap.forEach(doc => reports.push({ id: doc.id, ...doc.data() }));
            setReportedProfiles(reports);
            // Potentially set loading to false here as well if this is the last data to fetch
        }, (error) => {
            console.error("Error fetching reported profiles:", error);
            // setLoading(false); // Consider if this is needed
        });

        // Combined loading state management: set loading to false once both snapshots are initially processed
        // For simplicity, current implementation sets loading false after pending profiles.
        // A more robust solution might use Promise.all or count initial loads.

        return () => {
            unsubPending();
            unsubReports();
        };
    }, [db]);

    const handleApprove = async (profileId) => {
        if (!db) return;
        const publicDocRef = doc(db, `/artifacts/${appId}/public/data/profiles`, profileId);
        await updateDoc(publicDocRef, { status: 'approved' });
        const privateDocRef = doc(db, `/artifacts/${appId}/users/${profileId}/profile/data`);
        await updateDoc(privateDocRef, { status: 'approved' });
        alert('Profile approved!');
    };

    const handleReject = async (profileId) => {
        if (!db) return;
        if (window.confirm("Are you sure you want to reject and delete this profile? This cannot be undone.")) {
            await deleteDoc(doc(db, `/artifacts/${appId}/public/data/profiles`, profileId));
            await deleteDoc(doc(db, `/artifacts/${appId}/users/${profileId}/profile/data`));
            alert('Profile rejected and deleted.');
        }
    };

    const handleDismissReport = async (reportId) => {
        if (!db) return;
        await deleteDoc(doc(db, `/artifacts/${appId}/public/data/reports`, reportId));
        alert('Report dismissed.');
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div></div>;
    if (!db) return <p>Error: Database not available. Please try again later.</p>;


    return (
        <div className="container mx-auto space-y-12">
            <div>
                <h1 className="text-3xl font-bold mb-4 border-b pb-2">Admin Dashboard</h1>
            </div>
            {/* Pending Profiles Section */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Pending Profiles for Approval ({pendingProfiles.length})</h2>
                <div className="space-y-4">
                    {pendingProfiles.length > 0 ? pendingProfiles.map(p => (
                        <div key={p.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div className="mb-2 sm:mb-0">
                                <p className="font-bold">{p.name}</p>
                                <p className="text-sm text-gray-600">{p.city}, {p.country}</p>
                                <p className="text-xs text-gray-500">UID: {p.id}</p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <button onClick={() => navigateToProfile(p.id)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm font-semibold hover:bg-gray-300">View</button>
                                <button onClick={() => handleApprove(p.id)} className="bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-green-600">Approve</button>
                                <button onClick={() => handleReject(p.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-600">Reject</button>
                            </div>
                        </div>
                    )) : <p>No pending profiles.</p>}
                </div>
            </div>
             {/* Reported Profiles Section */}
             <div>
                <h2 className="text-2xl font-bold mb-4">Reported Profiles ({reportedProfiles.length})</h2>
                <div className="space-y-4">
                    {reportedProfiles.length > 0 ? reportedProfiles.map(r => (
                        <div key={r.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div className="mb-2 sm:mb-0">
                                <p className="font-bold">{r.reportedProfileName} (UID: {r.reportedProfileId})</p>
                                <p className="text-sm text-gray-500">Reported by UID: {r.reporterId}</p>
                                <p className="text-xs text-gray-500">Reported on: {r.timestamp?.toDate().toLocaleDateString()}</p>
                                <p className="text-xs text-gray-500">Report ID: {r.id}</p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <button onClick={() => navigateToProfile(r.reportedProfileId)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm font-semibold hover:bg-gray-300">View Profile</button>
                                <button onClick={() => handleDismissReport(r.id)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-600">Dismiss Report</button>
                            </div>
                        </div>
                    )) : <p>No new reports.</p>}
                </div>
            </div>
        </div>
    );
}

export default AdminPage;
