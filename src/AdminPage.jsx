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
const appId = 'lancerpages'; // Updated

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
    const [allUserProfiles, setAllUserProfiles] = useState([]); // New state for all users
    const [loading, setLoading] = useState({
        pending: true,
        reports: true,
        allUsers: true
    });

    const updateLoadingState = (key, value) => {
        setLoading(prev => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        if (!db) {
            setLoading({ pending: false, reports: false, allUsers: false });
            return;
        }

        updateLoadingState('pending', true);
        const pendingQuery = query(collection(db, `/artifacts/${appId}/public/data/profiles`), where("status", "==", "pending"));
        const unsubPending = onSnapshot(pendingQuery, (snap) => {
            const profiles = [];
            snap.forEach(doc => profiles.push({ id: doc.id, ...doc.data() }));
            setPendingProfiles(profiles);
            updateLoadingState('pending', false);
        }, (error) => {
            console.error("Error fetching pending profiles:", error);
            updateLoadingState('pending', false);
        });

        updateLoadingState('reports', true);
        const reportsQuery = query(collection(db, `/artifacts/${appId}/public/data/reports`), where("status", "==", "new"));
        const unsubReports = onSnapshot(reportsQuery, (snap) => {
            const reports = [];
            snap.forEach(doc => reports.push({ id: doc.id, ...doc.data() }));
            setReportedProfiles(reports);
            updateLoadingState('reports', false);
        }, (error) => {
            console.error("Error fetching reported profiles:", error);
            updateLoadingState('reports', false);
        });

        updateLoadingState('allUsers', true);
        // Fetch all profiles (public data used as a proxy for all users who interacted with profile system)
        // This will include pending, approved, rejected etc.
        const allUsersQuery = query(collection(db, `/artifacts/${appId}/public/data/profiles`));
        const unsubAllUsers = onSnapshot(allUsersQuery, (snap) => {
            const users = [];
            snap.forEach(doc => users.push({ id: doc.id, ...doc.data() }));
            setAllUserProfiles(users);
            updateLoadingState('allUsers', false);
        }, (error) => {
            console.error("Error fetching all user profiles:", error);
            updateLoadingState('allUsers', false);
        });

        return () => {
            unsubPending();
            unsubReports();
            unsubAllUsers();
        };
    }, [db]);

    const isLoading = loading.pending || loading.reports || loading.allUsers;

    const handleUpdateProfileStatus = async (profileId, newStatus) => {
        if (!db) return;
        const publicProfileRef = doc(db, `/artifacts/${appId}/public/data/profiles`, profileId);
        const userProfileRef = doc(db, `/artifacts/${appId}/users/${profileId}/profile/data`);

        try {
            await updateDoc(publicProfileRef, { status: newStatus });
            await updateDoc(userProfileRef, { status: newStatus }, { merge: true }).catch(error => { // Added merge:true
                if (error.code === 'not-found') {
                    console.warn(`Private profile for ${profileId} not found. Status only updated on public profile.`);
                } else {
                    console.error("Error updating user's private profile status:", error);
                }
            });
            alert(`Profile ${profileId} status updated to ${newStatus}.`);
        } catch (error) {
            console.error("Error updating profile status:", error);
            alert(`Failed to update profile status for ${profileId}.`);
        }
    };

    const handleTogglePaymentStatus = async (profileId, currentStatus) => {
        if (!db) return;
        const userProfileRef = doc(db, `/artifacts/${appId}/users/${profileId}/profile/data`);
        const newPaymentStatus = !currentStatus; // Toggle boolean 'hasContactAccess'
        try {
            await updateDoc(userProfileRef, { hasContactAccess: newPaymentStatus });
            alert(`Payment status (contact access) for ${profileId} set to ${newPaymentStatus}.`);
            setAllUserProfiles(prevProfiles => prevProfiles.map(p =>
                p.id === profileId ? { ...p, hasContactAccess: newPaymentStatus } : p
            ));
        } catch (error) {
             if (error.code === 'not-found') {
                try {
                    await setDoc(userProfileRef, { hasContactAccess: newPaymentStatus, userId: profileId }, { merge: true });
                    alert(`Payment status for ${profileId} set to ${newPaymentStatus}. (Profile created)`);
                    setAllUserProfiles(prevProfiles => prevProfiles.map(p =>
                        p.id === profileId ? { ...p, hasContactAccess: newPaymentStatus } : p
                    ));
                } catch (setEror) {
                    console.error("Error creating user profile with payment status:", setEror);
                    alert(`Failed to set payment status for ${profileId}.`);
                }
            } else {
                console.error("Error toggling payment status:", error);
                alert(`Failed to toggle payment status for ${profileId}.`);
            }
        }
    };

    const handleToggleTrollboxAccess = async (profileId, currentAccess) => {
        if (!db) return;
        const userProfileRef = doc(db, `/artifacts/${appId}/users/${profileId}/profile/data`);
        const newAccessStatus = !currentAccess;
        try {
            // Ensure the document exists before updating, or create it with the field.
            // For simplicity, we'll attempt an update and if it fails due to not-found, we can set it.
            // However, a user should ideally have a private profile document if they are a user.
            await updateDoc(userProfileRef, { canAccessTrollbox: newAccessStatus });
            alert(`Trollbox access for ${profileId} set to ${newAccessStatus}.`);
             // Force re-fetch or update local state for allUserProfiles to reflect change
            setAllUserProfiles(prevProfiles => prevProfiles.map(p =>
                p.id === profileId ? { ...p, canAccessTrollbox: newAccessStatus } : p
            ));
        } catch (error) {
            if (error.code === 'not-found') {
                 // If private profile doesn't exist, create it with the trollbox access field
                try {
                    await setDoc(userProfileRef, { canAccessTrollbox: newAccessStatus, userId: profileId }, { merge: true });
                    alert(`Trollbox access for ${profileId} set to ${newAccessStatus}. (Profile created)`);
                    setAllUserProfiles(prevProfiles => prevProfiles.map(p =>
                        p.id === profileId ? { ...p, canAccessTrollbox: newAccessStatus } : p
                    ));
                } catch (setEror) {
                    console.error("Error creating user profile with trollbox status:", setEror);
                    alert(`Failed to set Trollbox access for ${profileId}.`);
                }
            } else {
                console.error("Error toggling Trollbox access:", error);
                alert(`Failed to toggle Trollbox access for ${profileId}.`);
            }
        }
    };

    const handleApprove = async (profileId) => {
        await handleUpdateProfileStatus(profileId, 'approved');
    };

    const handleReject = async (profileId) => { // This function also deletes, might need to separate concerns later
        if (!db) return;
        if (window.confirm("Are you sure you want to reject and PERMANENTLY DELETE this profile? This cannot be undone.")) {
            try {
                await deleteDoc(doc(db, `/artifacts/${appId}/public/data/profiles`, profileId));
                // Try to delete the private profile as well, if it exists
                await deleteDoc(doc(db, `/artifacts/${appId}/users/${profileId}/profile/data`)).catch(error => {
                     if (error.code !== 'not-found') console.error("Error deleting user's private profile:", error);
                });
                alert('Profile rejected and deleted.');
            } catch (error) {
                console.error("Error deleting profile:", error);
                alert("Failed to delete profile.");
            }
        }
    };

    const handlePermanentDeleteUser = async (profileId, userEmail) => {
        if (!db) return;
        if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE user ${profileId} (${userEmail || 'No Email'}) and blacklist their email? This cannot be undone.`)) {
            return;
        }

        try {
            // 1. Delete public profile
            await deleteDoc(doc(db, `/artifacts/${appId}/public/data/profiles`, profileId));

            // 2. Delete private profile data
            await deleteDoc(doc(db, `/artifacts/${appId}/users/${profileId}/profile/data`)).catch(error => {
                if (error.code !== 'not-found') console.error(`Error deleting private profile for ${profileId}:`, error);
                else console.log(`Private profile for ${profileId} not found, skipping delete.`);
            });

            // 3. Add email to blacklist (if email exists)
            if (userEmail) {
                const blacklistRef = doc(db, `/blacklistedEmails/${userEmail}`);
                await setDoc(blacklistRef, { email: userEmail, blacklistedAt: serverTimestamp() });
                console.log(`Email ${userEmail} added to blacklist.`);
            }

            // 4. Firebase Auth user deletion - IMPORTANT: Needs to be handled by a backend (e.g., Cloud Function)
            // For now, we'll just log this and show an alert.
            console.warn(`Firebase Auth user deletion for ${profileId} needs to be handled by a backend function.`);
            alert(`User data for ${profileId} deleted from Firestore and email blacklisted (if provided). Auth user deletion requires backend action.`);

            // Refresh the user list locally
            setAllUserProfiles(prevProfiles => prevProfiles.filter(p => p.id !== profileId));
            setPendingProfiles(prevProfiles => prevProfiles.filter(p => p.id !== profileId));


        } catch (error) {
            console.error(`Error during permanent delete for ${profileId}:`, error);
            alert(`Failed to fully delete user ${profileId}. Check console for details.`);
        }
    };

    const handleDismissReport = async (reportId) => {
        if (!db) return;
        await deleteDoc(doc(db, `/artifacts/${appId}/public/data/reports`, reportId));
        alert('Report dismissed.');
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div></div>;
    if (!db) return <p>Error: Database not available. Please try again later.</p>;


    return (
        <div className="container mx-auto space-y-12">
            <div>
                <h1 className="text-3xl font-bold mb-4 border-b pb-2">Admin Dashboard</h1>
            </div>

            {/* All User Profiles Section */}
            <div>
                <h2 className="text-2xl font-bold mb-4">All User Profiles ({allUserProfiles.length})</h2>
                <div className="space-y-4 max-h-[500px] overflow-y-auto bg-gray-50 p-4 rounded-lg shadow">
                    {allUserProfiles.length > 0 ? allUserProfiles.map(p => (
                        <div key={p.id} className="bg-white p-4 rounded-lg shadow-md ">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div className="mb-2 sm:mb-0">
                                    <p className="font-bold text-lg">{p.name || <span className="italic text-gray-500">No name</span>} <span className="text-sm font-normal text-gray-600">({p.status || 'N/A'})</span></p>
                                    <p className="text-xs text-gray-500">UID: {p.id}</p>
                                    <p className="text-sm text-gray-600">{p.email || <span className="italic text-gray-500">No email</span>}</p>
                                </div>
                                <div className="flex gap-2 flex-wrap items-center">
                                     <button onClick={() => navigateToProfile(p.id)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-xs font-semibold hover:bg-gray-300">View Profile</button>
                                    <select
                                        value={p.status || ''}
                                        onChange={(e) => handleUpdateProfileStatus(p.id, e.target.value)}
                                        className="text-xs border-gray-300 rounded shadow-sm p-1 bg-white focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected (Will Delete)</option>
                                        {/* 'rejected' status will trigger deletion via handleReject if selected from pending,
                                            or can be a soft "hidden" if we adapt handleUpdate to not delete for 'rejected'*/}
                                        <option value="hidden">Hidden</option>
                                    </select>
                                    <button
                                        onClick={() => handleToggleTrollboxAccess(p.id, p.canAccessTrollbox === undefined ? true : p.canAccessTrollbox)}
                                        className={`px-3 py-1 rounded text-xs font-semibold ${p.canAccessTrollbox === undefined || p.canAccessTrollbox ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                        title={p.canAccessTrollbox === undefined || p.canAccessTrollbox ? "Revoke Trollbox Access" : "Grant Trollbox Access"}
                                    >
                                        {p.canAccessTrollbox === undefined || p.canAccessTrollbox ? 'Revoke Chat' : 'Grant Chat'}
                                    </button>
                                    <button
                                        onClick={() => handleTogglePaymentStatus(p.id, p.hasContactAccess)}
                                        className={`px-3 py-1 rounded text-xs font-semibold ${p.hasContactAccess ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                        title={p.hasContactAccess ? "Mark as Unpaid/Revoke Access" : "Mark as Paid/Grant Access"}
                                    >
                                        {p.hasContactAccess ? 'Revoke Payment' : 'Grant Payment'}
                                    </button>
                                    <button
                                        onClick={() => handlePermanentDeleteUser(p.id, p.email)}
                                        className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-700"
                                        title="Permanently delete user data and blacklist email"
                                    >
                                        Delete User
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2 text-xs space-y-1">
                                <p><strong>Directory Status:</strong> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'approved' ? 'bg-green-100 text-green-800' : (p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : (p.status === 'hidden' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'))}`}>{p.status || 'N/A'}</span></p>
                                <p><strong>Trollbox Access:</strong> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.canAccessTrollbox === undefined || p.canAccessTrollbox ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{p.canAccessTrollbox === undefined || p.canAccessTrollbox ? 'Allowed' : 'Revoked'}</span></p>
                                <p><strong>Payment (Contact Access):</strong> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.hasContactAccess ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>{p.hasContactAccess ? 'Paid/Access Granted' : 'Not Paid/No Access'}</span></p>
                            </div>
                        </div>
                    )) : <p>No user profiles found.</p>}
                </div>
            </div>

            {/* Pending Profiles Section */}
            <div className="mt-12">
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
