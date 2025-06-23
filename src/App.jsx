import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    signInAnonymously
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    query, 
    onSnapshot,
    addDoc,
    serverTimestamp,
    limit,
    orderBy,
    where,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';

// --- Helper Functions & Configuration ---

/**
 * Firebase configuration object.
 * @type {object}
 */
const firebaseConfig = {
  apiKey: "AIzaSyA769aw44I0Kdb7KkTheJbAezDAFJ_a58w",
  authDomain: "freelancer-directory.firebaseapp.com",
  projectId: "freelancer-directory",
  storageBucket: "freelancer-directory.firebasestorage.app",
  messagingSenderId: "757657627874",
  appId: "1:757657627874:web:2adaf06e7e42fcc28ec2bb",
  measurementId: "G-EMY22RLXQE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

/**
 * Application ID, used for namespacing Firebase paths.
 * @type {string}
 */
const appId = 'freelancer-directory';

/**
 * Converts a string to title case.
 * e.g., "hello world" becomes "Hello World".
 * @param {string} str - The string to convert.
 * @returns {string} The title-cased string.
 */
const toTitleCase = (str) => str ? str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) : '';

// --- IMPORTANT: MODERATOR CONFIGURATION ---
/**
 * The Firebase UID of the admin/moderator account.
 * This UID is used to grant access to the AdminPage.
 * @type {string}
 */
// PASTE THE USER UID OF YOUR ADMIN ACCOUNT HERE
const ADMIN_UID = "9cCHy7jQRgXNdAPmqet9Mz4KDi12";

/**
 * Array of all available domains for freelancers.
 * @type {string[]}
 */
const ALL_DOMAINS = ["design", "coding", "operations", "marketing", "sales", "finance", "hr", "legal"];

// --- Icon Components ---
// These are simple functional components that render SVG icons.

/** Search icon component. */
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
/** Map pin icon component. */
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
/** Link icon component. */
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>;
/** Send icon component. */
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
/** Log out icon component. */
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
/** User icon component. */
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
/** Plus circle icon component. */
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
/** Trash icon component. */
const Trash2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
/** Share icon component. */
const Share2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>;
/** Eye icon (visible) component. */
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
/** Eye off icon (hidden) component. */
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;
/** LinkedIn icon component. */
const LinkedinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
/** Flag icon component (for reporting). */
const FlagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>;
/** Shield icon component (for admin). */
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;

// --- Main App Component ---

/**
 * The main application component.
 * Manages global state including user authentication, profile data,
 * current page, loading status, and Firebase instances.
 * It also handles routing between different pages of the application.
 */
function App() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState('directory');
    const [viewedProfile, setViewedProfile] = useState(null);
    const [locationData, setLocationData] = useState({});
    const [auth, setAuth] = useState(null);
    const [db, setDb] = useState(null);
    
    useEffect(() => {
        fetch('https://raw.githubusercontent.com/russ666/all-countries-and-cities-json/master/countries.json')
            .then(response => response.json())
            .then(data => setLocationData(data))
            .catch(error => console.error("Error fetching location data:", error));

        try {
            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const authInstance = getAuth(app);
            setDb(firestore);
            setAuth(authInstance);

            const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
                setLoading(true);
                if (currentUser) {
                    setUser(currentUser);
                    if (!currentUser.isAnonymous) {
                        const profilePath = `/artifacts/${appId}/users/${currentUser.uid}/profile/data`;
                        const docRef = doc(firestore, profilePath);
                        const docSnap = await getDoc(docRef);
                        setProfile(docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null);
                    } else {
                        // FIX: Ensure profile is cleared for anonymous users
                        setProfile(null);
                    }
                } else {
                    setUser(null);
                    setProfile(null);
                }
                setLoading(false);
            });
            
            (async () => {
                const authForSignIn = getAuth(app);
                await signInAnonymously(authForSignIn);
            })();

            return () => unsubscribe();
        } catch (error) {
            console.error("Firebase initialization error:", error);
            setLoading(false);
        }
    }, []);

    const handleEmailSignUp = async (email, password) => {
        if (!auth) return;
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) { alert(`Error Signing Up: ${error.message}`); }
    };

    const handleEmailLogin = async (email, password) => {
        if (!auth) return;
        try {
            await signInWithEmailAndPassword(auth, email, password);
             setPage('directory');
        } catch (error) { alert(`Error Logging In: ${error.message}`); }
    };

    const handleLogout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
            await signInAnonymously(auth);
            setPage('directory');
        } catch (error) { console.error("Error during sign-out:", error); }
    };
    
    const navigateToProfile = async (profileOrId) => {
        setLoading(true);
        const profileId = typeof profileOrId === 'string' ? profileOrId : profileOrId.id;
        try {
            const profilePath = `/artifacts/${appId}/public/data/profiles/${profileId}`;
            const docRef = doc(db, profilePath);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const profileData = { id: docSnap.id, ...docSnap.data() };
                setViewedProfile(profileData);
                document.title = `${profileData.name} - Freelancer Directory`;
                setPage('profile');
            } else { alert("Could not find this freelancer's profile."); }
        } catch (error) { console.error("Error fetching profile by ID:", error); }
        setLoading(false);
    };

    const renderPage = () => {
        if (loading || Object.keys(locationData).length === 0) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div></div>;

        switch (page) {
            case 'directory': return <DirectoryPage db={db} navigateToProfile={navigateToProfile} locationData={locationData} />;
            case 'chat': return <ChatPage db={db} user={user} profile={profile} onProfileClick={navigateToProfile} />;
            case 'profile': return <ProfilePage profileData={viewedProfile} user={user} db={db} />;
            case 'editProfile':
                if (!user || user.isAnonymous) return <LoginPage handleEmailSignUp={handleEmailSignUp} handleEmailLogin={handleEmailLogin} />;
                return <EditProfilePage db={db} user={user} existingProfile={profile} setPage={setPage} setProfile={setProfile} locationData={locationData} />;
            case 'login': return <LoginPage handleEmailSignUp={handleEmailSignUp} handleEmailLogin={handleEmailLogin} />;
            case 'admin':
                if (user?.uid !== ADMIN_UID) return <p>Access Denied</p>;
                // Lazily load AdminPage
                const AdminPageComponent = lazy(() => import('./AdminPage.jsx'));
                return (
                    <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div></div>}>
                        <AdminPageComponent db={db} navigateToProfile={navigateToProfile} />
                    </Suspense>
                );
            default: return <DirectoryPage db={db} navigateToProfile={navigateToProfile} locationData={locationData} />;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
            <Header user={user} profile={profile} setPage={setPage} handleLogout={handleLogout} />
            <main className="p-4 md:p-8">
                {/* Suspense fallback for all page components if any of them were lazy-loaded at a higher level */}
                <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div></div>}>
                    {renderPage()}
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}

// --- Components (Pages) ---

/**
 * Header component displaying the site logo, navigation links, and user authentication status.
 * @param {object} props - Component props.
 * @param {object} props.user - Firebase user object.
 * @param {object} props.profile - User's profile data.
 * @param {function} props.setPage - Function to change the current page.
 * @param {function} props.handleLogout - Function to log out the user.
 */
function Header({ user, profile, setPage, handleLogout }) {
    return (
        <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 shadow-sm">
            <nav className="container mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('directory')}>
                    <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span className="text-xl font-bold text-gray-800">FreelancerDirectory</span>
                </div>
                <div className="flex items-center gap-6">
                    <button onClick={() => setPage('directory')} className="font-medium text-gray-600 hover:text-indigo-600 transition-colors">Directory</button>
                    <button onClick={() => setPage('chat')} className="font-medium text-gray-600 hover:text-indigo-600 transition-colors">Chat</button>
                    {user?.uid === ADMIN_UID && (<button onClick={() => setPage('admin')} className="font-bold text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"><ShieldIcon /> Admin</button>)}
                </div>
                <div className="flex items-center gap-3">
                    {user && !user.isAnonymous ? (
                        <>
                           {profile ? ( <button onClick={() => setPage('editProfile')} className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-indigo-600"><UserIcon /><span>My Profile</span></button>
                           ) : ( <button onClick={() => setPage('editProfile')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all">Create Profile</button> )}
                           <button onClick={handleLogout} title="Logout" className="p-2 rounded-full hover:bg-gray-200"><LogOutIcon /></button>
                        </>
                    ) : (
                        <button onClick={() => setPage('login')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all">Join / Login</button>
                    )}
                </div>
            </nav>
        </header>
    );
}

/**
 * DirectoryPage component displays a list of freelancers.
 * It allows users to search and filter freelancers based on various criteria.
 * @param {object} props - Component props.
 * @param {object} props.db - Firestore database instance.
 * @param {function} props.navigateToProfile - Function to navigate to a freelancer's profile page.
 * @param {object} props.locationData - Object containing countries and their cities.
 */
function DirectoryPage({ db, navigateToProfile, locationData }) {
    const [allFreelancers, setAllFreelancers] = useState([]);
    const [filteredFreelancers, setFilteredFreelancers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [keywordTerm, setKeywordTerm] = useState("");
    const [countryFilter, setCountryFilter] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [domainFilter, setDomainFilter] = useState("");
    
    const countries = Object.keys(locationData);

    useEffect(() => {
        if (!db) return;
        setLoading(true);
        const q = query(collection(db, `/artifacts/${appId}/public/data/profiles`), where("status", "==", "approved"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const freelancersData = [];
            querySnapshot.forEach((doc) => { freelancersData.push({ id: doc.id, ...doc.data() }); });
            setAllFreelancers(freelancersData);
            // setFilteredFreelancers(freelancersData); // Apply filters directly in useEffect instead
            setLoading(false);
        }, (error) => { console.error("Error fetching freelancers: ", error); setLoading(false); });
        return () => unsubscribe();
    }, [db]);
    
    // Debounced filtering logic
    useEffect(() => {
        const handler = setTimeout(() => {
            let results = allFreelancers;
            if (searchTerm) results = results.filter(f => f.name?.toLowerCase().includes(searchTerm.toLowerCase()));
            if (keywordTerm) results = results.filter(f => f.bio?.toLowerCase().includes(keywordTerm.toLowerCase()));
            if (countryFilter) results = results.filter(f => f.country === countryFilter);
            if (cityFilter) results = results.filter(f => f.city === cityFilter);
            if (domainFilter) results = results.filter(f => f.domains?.includes(domainFilter));
            setFilteredFreelancers(results);
        }, 300); // 300ms debounce delay

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, keywordTerm, countryFilter, cityFilter, domainFilter, allFreelancers]);

    // No longer need a separate submit handler for the form, as filters apply on change.
    // The form tag can remain for layout/semantic purposes, or be replaced by a div.
    // The button type="submit" can be changed to type="button" or removed if not needed.

    return (
        <div className="container mx-auto">
            <form onSubmit={(e) => e.preventDefault()} className="bg-white p-6 rounded-xl shadow-md mb-8 space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">Find Top Freelance Talent</h1>
                <p className="text-gray-600 text-center mb-6">Search our directory of vetted professionals.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" placeholder="Search by name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Keyword</label><input type="text" placeholder="e.g. 'React', 'logo'" value={keywordTerm} onChange={e => setKeywordTerm(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Domain</label><select value={domainFilter} onChange={e => setDomainFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"><option value="">All Domains</option>{ALL_DOMAINS.map(c => <option key={c} value={c}>{toTitleCase(c)}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Country</label><select value={countryFilter} onChange={e => {setCountryFilter(e.target.value); setCityFilter('');}} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"><option value="">All Countries</option>{countries.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><select value={cityFilter} onChange={e => setCityFilter(e.target.value)} disabled={!countryFilter} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100"><option value="">All Cities</option>{countryFilter && locationData[countryFilter].map(city => <option key={city} value={city}>{city}</option>)}</select></div>
                </div>
                {/* The search button is now optional as filtering happens on input change (debounced) */}
                {/* <button type="button" className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">Search</button> */}
            </form>

            {loading ? (<p className="text-center">Loading freelancers...</p>) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredFreelancers.map(freelancer => (
                        <FreelancerCard key={freelancer.id} freelancer={freelancer} navigateToProfile={navigateToProfile} />
                    ))}
                </div>
            )}
            { !loading && filteredFreelancers.length === 0 && <p className="text-center text-gray-500 mt-8">No freelancers found matching your criteria.</p>}
        </div>
    );
}

/**
 * FreelancerCard component displays a summary of a freelancer's profile.
 * It is memoized to prevent unnecessary re-renders.
 * @param {object} props - Component props.
 * @param {object} props.freelancer - The freelancer data object.
 * @param {function} props.navigateToProfile - Function to navigate to the freelancer's full profile.
 */
const FreelancerCard = React.memo(({ freelancer, navigateToProfile }) => {
    return (
        <div onClick={() => navigateToProfile(freelancer)} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer p-6 flex flex-col items-center text-center">
            <img src={`https://placehold.co/100x100/E2E8F0/4A5568?text=${freelancer.name.charAt(0)}`} alt={freelancer.name} className="w-24 h-24 rounded-full mb-4 border-4 border-white shadow-md" />
            <h3 className="font-bold text-lg">{freelancer.name}</h3>
            <div className="flex flex-wrap gap-1 justify-center mt-1">{freelancer.domains?.map(d => <span key={d} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{toTitleCase(d)}</span>)}</div>
            <div className="flex items-center text-gray-500 text-sm mt-2"><MapPinIcon /><span className="ml-1">{freelancer.city}, {freelancer.country}</span></div>
            <p className="text-gray-600 mt-3 text-sm flex-grow">{freelancer.bio?.substring(0, 100)}{freelancer.bio?.length > 100 && '...'}</p>
            <button className="mt-4 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-xs font-semibold hover:bg-indigo-200 transition-colors">View Profile</button>
        </div>
    );
});

/**
 * ChatPage component provides a real-time public chat interface.
 * Users with profiles can send messages. All users can view messages.
 * @param {object} props - Component props.
 * @param {object} props.db - Firestore database instance.
 * @param {object} props.user - Firebase user object.
 * @param {object} props.profile - User's profile data.
 * @param {function} props.onProfileClick - Function to navigate to a user's profile from chat.
 */
function ChatPage({ db, user, profile, onProfileClick }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const lastMessageTime = useRef(0);
    const chatEndRef = useRef(null);
    useEffect(() => { if (!db) return; const q = query(collection(db, `/artifacts/${appId}/public/data/chat_messages`), orderBy("timestamp", "desc"), limit(50)); const unsub = onSnapshot(q, (snap) => { const msgs = []; snap.forEach(d => msgs.push({id: d.id, ...d.data()})); setMessages(msgs.reverse()); }); return () => unsub(); }, [db]);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
    const handleSendMessage = async(e) => { e.preventDefault(); if(!user||user.isAnonymous||!profile||newMessage.trim()===""||isSending)return;const now=Date.now();if(now-lastMessageTime.current<5e3){alert(`Wait ${Math.ceil((5e3-(now-lastMessageTime.current))/1e3)}s`);return;}setIsSending(!0);lastMessageTime.current=now;try{await addDoc(collection(db,`/artifacts/${appId}/public/data/chat_messages`),{text:newMessage,timestamp:serverTimestamp(),userId:user.uid,userName:profile.name});setNewMessage("");}catch(err){console.error(err)}finally{setIsSending(!1)}}
    return <div className="container mx-auto max-w-4xl"><div className="bg-white rounded-xl shadow-lg flex flex-col" style={{height:'75vh'}}><div className="p-4 border-b"><h2 className="text-xl font-bold text-center">Community Trollbox</h2></div><div className="flex-grow p-4 overflow-y-auto">{messages.map(msg=><ChatMessageItem key={msg.id} msg={msg} onProfileClick={onProfileClick} />)}<div ref={chatEndRef}/></div ><div className="p-4 border-t bg-gray-50"><form onSubmit={handleSendMessage}className="flex items-center gap-2"><input type="text"value={newMessage}onChange={e=>setNewMessage(e.target.value)}placeholder={user&&!user.isAnonymous&&profile?"Type...":"Login & create a profile to chat"}className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"disabled={!user||user.isAnonymous||!profile||isSending}/><button type="submit"disabled={isSending||!newMessage.trim()}className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"><SendIcon /></button></form></div></div></div>
}

/**
 * ChatMessageItem component displays a single chat message.
 * It is memoized to prevent unnecessary re-renders.
 * @param {object} props - Component props.
 * @param {object} props.msg - The message data object.
 * @param {function} props.onProfileClick - Function to navigate to the sender's profile.
 */
const ChatMessageItem = React.memo(({ msg, onProfileClick }) => {
    return (
        <div className="flex items-start gap-3 mb-4">
            <div
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-indigo-600 flex-shrink-0 cursor-pointer"
                onClick={() => onProfileClick(msg.userId)}
                title={`View ${msg.userName || 'Anonymous'}'s profile`}
            >
                {msg.userName ? msg.userName.charAt(0) : '?'}
            </div>
            <div>
                <div className="flex items-baseline gap-2">
                    <p className="font-bold text-indigo-700">{msg.userName || 'Anonymous'}</p>
                    <p className="text-xs text-gray-400">
                        {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <p className="text-gray-800 break-words">{msg.text}</p>
            </div>
        </div>
    );
});

/**
 * ProfilePage component displays the detailed profile of a freelancer.
 * It shows their name, domains, location, bio, and links.
 * Logged-in users can report profiles.
 * @param {object} props - Component props.
 * @param {object} props.profileData - The data of the profile to display.
 * @param {object} props.user - Firebase user object (current user).
 * @param {object} props.db - Firestore database instance.
 */
function ProfilePage({ profileData, user, db }) {
    if (!profileData) { return <div className="text-center">Profile not found. <button onClick={() => window.location.reload()} className="text-indigo-600">Go back to directory.</button></div> }
    
    const handleReportProfile = async () => {
        if (!user || user.isAnonymous) { alert("You must be logged in to report a profile."); return; }
        if (window.confirm("Are you sure you want to report this profile for review?")) {
            try {
                const reportsPath = `/artifacts/${appId}/public/data/reports`;
                await addDoc(collection(db, reportsPath), { reportedProfileId: profileData.id, reportedProfileName: profileData.name, reporterId: user.uid, timestamp: serverTimestamp(), status: 'new' });
                alert("Thank you. This profile has been reported and will be reviewed by a moderator.");
            } catch (error) { console.error("Error reporting profile:", error); alert("An error occurred while reporting the profile."); }
        }
    }

    const shareProfile = () => { const url = window.location.href; navigator.clipboard.writeText(url).then(() => { alert('Profile URL copied to clipboard!'); }).catch(err => { console.error('Could not copy text: ', err); alert('Failed to copy URL.'); }); }
    return (
        <div className="container mx-auto max-w-4xl">
            <div className="bg-white rounded-xl shadow-lg p-8">
                 <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="text-center flex-shrink-0">
                         <img src={`https://placehold.co/150x150/E2E8F0/4A5568?text=${profileData.name.charAt(0)}`} alt={profileData.name} className="w-36 h-36 rounded-full mb-4 border-4 border-white shadow-xl mx-auto" />
                         <div className="flex flex-col gap-2">
                            {profileData.linkedinUrl && <a href={profileData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="bg-[#0077B5] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#005E92] transition-colors flex items-center justify-center gap-2"><LinkedinIcon /> View LinkedIn</a>}
                            <button onClick={shareProfile} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"><Share2Icon />Share Profile</button>
                            {user && !user.isAnonymous && <button onClick={handleReportProfile} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors flex items-center justify-center gap-2"><FlagIcon /> Report Profile</button>}
                         </div>
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">{profileData.name}</h1>
                        <div className="flex flex-wrap gap-2 mt-2">{profileData.domains?.map(d => <span key={d} className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">{toTitleCase(d)}</span>)}</div>
                        <div className="flex items-center text-gray-500 mt-3"><MapPinIcon /><span className="ml-2">{profileData.city}, {profileData.country}</span></div>
                        <div className="mt-6"><h2 className="text-2xl font-bold border-b pb-2 mb-4">About Me</h2><p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profileData.bio}</p></div>
                        <div className="mt-8"><h2 className="text-2xl font-bold border-b pb-2 mb-4">Other Links</h2><div className="flex flex-col gap-3">{profileData.links?.map((link, index) => (<a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-indigo-600 hover:underline"><LinkIcon /><span>{link.url}</span></a>))}{(!profileData.links || profileData.links.length === 0) && <p className="text-gray-500">No other links provided.</p>}</div></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * EditProfilePage component allows users to create or update their freelancer profile.
 * It includes fields for name, location, domains, bio, LinkedIn URL, and other links.
 * Profile changes are submitted for admin approval.
 * @param {object} props - Component props.
 * @param {object} props.db - Firestore database instance.
 * @param {object} props.user - Firebase user object (current user).
 * @param {object} props.existingProfile - The user's current profile data, if it exists.
 * @param {function} props.setPage - Function to change the current page.
 * @param {function} props.setProfile - Function to update the user's profile state in App.js.
 * @param {object} props.locationData - Object containing countries and their cities.
 */
function EditProfilePage({ db, user, existingProfile, setPage, setProfile, locationData }) {
    const [formData, setFormData] = useState({ name: '', email: '', country: '', city: '', domains: [], bio: '', linkedinUrl: '', links: [{ url: '' }] });
    const [isSaving, setIsSaving] = useState(false);
    const countries = Object.keys(locationData);

    useEffect(() => {
        if (existingProfile) {
            setFormData({
                name: existingProfile.name || user.displayName || '', email: existingProfile.email || user.email || '', country: existingProfile.country || '', city: existingProfile.city || '', domains: existingProfile.domains || [],
                bio: existingProfile.bio || '', linkedinUrl: existingProfile.linkedinUrl || '', links: existingProfile.links && existingProfile.links.length > 0 ? existingProfile.links : [{ url: '' }]
            });
        } else {
             setFormData(prev => ({ ...prev, name: user.displayName || '', email: user.email || ''}));
        }
    }, [existingProfile, user]);

    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); if (name === 'country') setFormData(prev => ({ ...prev, city: '' })); };
    const handleDomainChange = (domain) => { const currentDomains = formData.domains; if (currentDomains.includes(domain)) { setFormData(prev => ({ ...prev, domains: currentDomains.filter(d => d !== domain)})); } else { setFormData(prev => ({ ...prev, domains: [...currentDomains, domain]})); }};
    const handleLinkChange = (index, value) => { const newLinks = [...formData.links]; newLinks[index].url = value; setFormData(prev => ({...prev, links: newLinks})); };
    const addLink = () => { setFormData(prev => ({...prev, links: [...prev.links, {url: ''}]})); }
    const removeLink = (index) => { const newLinks = formData.links.filter((_, i) => i !== index); setFormData(prev => ({...prev, links: newLinks})); }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!db || !user) return;
        if (formData.domains.length === 0) { alert("Please select at least one domain of expertise."); return; }
        setIsSaving(true);
        const finalData = { ...formData, userId: user.uid, updatedAt: serverTimestamp(), status: 'pending' };
        try {
            await setDoc(doc(db, `/artifacts/${appId}/users/${user.uid}/profile/data`), finalData, { merge: true });
            await setDoc(doc(db, `/artifacts/${appId}/public/data/profiles/${user.uid}`), finalData, { merge: true });
            setProfile({id: user.uid, ...finalData});
            alert('Profile submitted for approval! It will be visible after a moderator reviews it.');
            setPage('directory');
        } catch (error) { console.error("Error saving profile:", error); alert('Failed to save profile.'); } finally { setIsSaving(false); }
    };

    return (
        <div className="container mx-auto max-w-2xl">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
                <h1 className="text-3xl font-bold text-center">{existingProfile ? "Edit Your Profile" : "Create Your Profile"}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Country</label><select name="country" value={formData.country} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"><option value="">Select a Country</option>{countries.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><select name="city" value={formData.city} onChange={handleChange} required disabled={!formData.country} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100"><option value="">Select a City</option>{formData.country && locationData[formData.country].map(city => <option key={city} value={city}>{city}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile URL (Optional)</label><input type="url" name="linkedinUrl" placeholder="https://linkedin.com/in/..." value={formData.linkedinUrl} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Domains of Expertise (select all that apply)</label><div className="grid grid-cols-2 md:grid-cols-4 gap-2">{ALL_DOMAINS.map(domain => (<label key={domain} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"><input type="checkbox" checked={formData.domains.includes(domain)} onChange={() => handleDomainChange(domain)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/><span>{toTitleCase(domain)}</span></label>))}</div></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Bio / About Me</label><textarea name="bio" value={formData.bio} onChange={handleChange} rows="5" required placeholder="Describe your skills, experience, and what makes you a great freelancer." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Other Links (Portfolio, Website, etc.)</label><div className="space-y-3">{formData.links.map((link, index) => (<div key={index} className="flex items-center gap-2"><input type="url" placeholder="https://..." value={link.url} onChange={(e) => handleLinkChange(index, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /><button type="button" onClick={() => removeLink(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2Icon /></button></div>))}</div ><button type="button" onClick={addLink} className="mt-3 flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"><PlusCircleIcon /> Add another link</button></div>
                <div className="pt-4 border-t"><button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors text-lg">{isSaving ? 'Saving...' : 'Save Profile'}</button></div>
            </form>
        </div>
    );
}

/**
 * LoginPage component handles user authentication.
 * It provides forms for both email/password sign-up and login.
 * @param {object} props - Component props.
 * @param {function} props.handleEmailSignUp - Function to handle email sign-up.
 * @param {function} props.handleEmailLogin - Function to handle email login.
 */
function LoginPage({ handleEmailSignUp, handleEmailLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); if (isLogin) { await handleEmailLogin(email, password); } else { await handleEmailSignUp(email, password); } setLoading(false); };
    return <div className="text-center max-w-md mx-auto bg-white p-10 rounded-xl shadow-lg"><h2 className="text-2xl font-bold mb-2">{isLogin ? "Welcome Back" : "Create Account"}</h2><p className="text-gray-600 mb-6">{isLogin ? "Log in to access your profile." : "Join the community."}</p><form onSubmit={handleSubmit} className="space-y-4"><div><input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div><div className="relative"><input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">{showPassword ? <EyeOffIcon /> : <EyeIcon />}</button></div><button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors text-lg">{loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}</button></form><div className="mt-6"><button onClick={() => setIsLogin(!isLogin)} className="text-sm text-indigo-600 hover:underline">{isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}</button></div></div>;
}

// CHANGE: New Admin Page component
// The AdminPage component definition has been moved to src/AdminPage.jsx

/**
 * Footer component displaying copyright information.
 */
function Footer() {
    return (<footer className="text-center py-6 mt-12 border-t"><p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} FreelancerDirectory. All rights reserved.</p></footer>);
}

export default App;
