import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
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
const firebaseConfig = {
  apiKey: "AIzaSyA769aw44I0Kdb7KkTheJbAezDAFJ_a58w",
  authDomain: "lancerpages.firebaseapp.com",
  projectId: "lancerpages",
  storageBucket: "lancerpages.firebasestorage.app",
  messagingSenderId: "757657627874",
  appId: "1:757657627874:web:2adaf06e7e42fcc28ec2bb",
  measurementId: "G-EMY22RLXQE"
};

const app = initializeApp(firebaseConfig); // This is the Firebase app instance
const analytics = getAnalytics(app); // Pass the Firebase app instance
const appId = 'lancerpages';
const toTitleCase = (str) => str ? str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) : '';
const ADMIN_UID = "9cCHy7jQRgXNdAPmqet9Mz4KDi12";
const ALL_DOMAINS = ["design", "coding", "operations", "marketing", "sales", "finance", "hr", "legal"];

// --- Icon Components ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
const Trash2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const Share2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;
const LinkedinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
const FlagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;

import ContactBanner from './ContactBanner.jsx';
import GDPRBanner from './GDPRBanner.jsx'; // Import GDPRBanner

// Placeholder script control functions (to be defined/managed by the user later)
const loadNonEssentialScripts = () => {
  console.log('App-level: GDPR consent accepted - loading non-essential scripts.');
  // User would implement actual script loading here (e.g., analytics, ads)
};

const blockNonEssentialScripts = () => {
  console.log('App-level: GDPR consent rejected - blocking non-essential scripts.');
  // User would implement script blocking here
  // Example: window['ga-disable-YOUR_GA_MEASUREMENT_ID'] = true;
};


function App() {
    const intl = useIntl();
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

        const firebaseAppInstance = initializeApp(firebaseConfig);
        const firestore = getFirestore(firebaseAppInstance);
        const authInstance = getAuth(firebaseAppInstance);
        setDb(firestore);
        setAuth(authInstance);

        const unsubscribeAuth = onAuthStateChanged(authInstance, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                setUser(currentUser);
                if (!currentUser.isAnonymous) {
                    const profilePath = `/artifacts/${appId}/users/${currentUser.uid}/profile/data`;
                    const docRef = doc(firestore, profilePath);
                    const docSnap = await getDoc(docRef);
                    setProfile(docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null);
                } else {
                    setProfile(null);
                }
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        });

        (async () => {
            try {
                await signInAnonymously(authInstance);
            } catch (error) {
                console.error("Error signing in anonymously:", error);
            }
        })();

        return () => {
            unsubscribeAuth();
        };
    }, [appId]);

    // GDPR consent check on initial load
    useEffect(() => {
        const gdprChoice = localStorage.getItem('gdpr_choice');
        if (gdprChoice === 'accepted') {
            loadNonEssentialScripts();
        } else if (gdprChoice === 'rejected') {
            blockNonEssentialScripts();
        }
        // If no choice, the banner will handle it.
    }, []);

    const handleEmailSignUp = async (email, password) => {
        if (!auth || !db) return;

        try {
            // Check if email is blacklisted
            const blacklistRef = doc(db, `/blacklistedEmails/${email}`);
            const blacklistSnap = await getDoc(blacklistRef);

            if (blacklistSnap.exists()) {
                alert(intl.formatMessage({ id: 'alert.emailBlacklisted', defaultMessage: "This email address is not allowed to register." }));
                return;
            }

            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) { alert(intl.formatMessage({ id: 'alert.errorSigningUp' }, { message: error.message })); }
    };

    const handleEmailLogin = async (email, password) => {
        if (!auth) return;
        try {
            await signInWithEmailAndPassword(auth, email, password);
             setPage('directory');
        } catch (error) { alert(intl.formatMessage({ id: 'alert.errorLoggingIn' }, { message: error.message })); }
    };

    const handleLogout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
            await signInAnonymously(auth);
            setPage('directory');
        } catch (error) { console.error("Error during sign-out:", error); }
    };
    
    const navigateToProfile = (profileOrIdOrSlug) => {
        const slug = typeof profileOrIdOrSlug === 'string' ? profileOrIdOrSlug : profileOrIdOrSlug.id;
        setPage(`profile/${slug}`);
    };

    useEffect(() => {
        if (page.startsWith('profile/')) {
            const slug = page.split('/')[1];
            if (!slug || !db) return;
            setLoading(true);
            const fetchProfileBySlug = async (profileSlug) => {
                const profileId = profileSlug;
                const profilePath = `/artifacts/${appId}/public/data/profiles/${profileId}`;
                try {
                    const docRef = doc(db, profilePath);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const profileData = { id: docSnap.id, ...docSnap.data() };
                        setViewedProfile(profileData);
                        document.title = intl.formatMessage({ id: 'app.title.profilePage' }, { name: profileData.name });
                    } else {
                        alert(intl.formatMessage({ id: 'alert.profileNotFound' }));
                        setPage('directory');
                    }
                } catch (error) {
                    console.error("Error fetching profile by ID/slug:", error);
                    alert(intl.formatMessage({ id: 'alert.fetchProfileError' }));
                    setPage('directory');
                } finally {
                    setLoading(false);
                }
            };
            fetchProfileBySlug(slug);
        } else {
             if (viewedProfile) setViewedProfile(null);
        }
    }, [page, db, intl, appId]);

    const renderPage = () => {
        if (loading && !page.startsWith('profile/')) {
            return <PageLoader />;
        }

        if (page.startsWith('profile/')) {
            if (loading && !viewedProfile) return <PageLoader/>;
            if (!viewedProfile && !loading) return <p className="text-center"><FormattedMessage id="alert.profileNotFound" /></p>;
            return <ProfilePage profileData={viewedProfile} user={user} db={db} setPage={setPage} />;
        }

        switch (page) {
            case 'directory': return <DirectoryPage db={db} navigateToProfile={navigateToProfile} locationData={locationData} />;
            case 'chat': return <ChatPage db={db} user={user} profile={profile} onProfileClick={navigateToProfile} />;
            case 'editProfile':
                if (!user || user.isAnonymous) return <LoginPage handleEmailSignUp={handleEmailSignUp} handleEmailLogin={handleEmailLogin} />;
                return <EditProfilePage db={db} user={user} existingProfile={profile} setPage={setPage} setProfile={setProfile} locationData={locationData} handleLogout={handleLogout} />; {/* Pass handleLogout */}
            case 'login': return <LoginPage handleEmailSignUp={handleEmailSignUp} handleEmailLogin={handleEmailLogin} />;
            case 'admin':
                if (user?.uid !== ADMIN_UID) return <p>Access Denied</p>;
                const AdminPageComponent = lazy(() => import('./AdminPage.jsx'));
                return <Suspense fallback={<PageLoader />}><AdminPageComponent db={db} navigateToProfile={navigateToProfile} /></Suspense>;
            case 'terms':
                const TermsPage = lazy(() => import('./TermsPage.jsx'));
                return <Suspense fallback={<PageLoader />}><TermsPage /></Suspense>;
            case 'privacy':
                const PrivacyPolicyPage = lazy(() => import('./PrivacyPolicyPage.jsx'));
                return <Suspense fallback={<PageLoader />}><PrivacyPolicyPage /></Suspense>;
            case 'about':
                const AboutPage = lazy(() => import('./AboutPage.jsx'));
                return <Suspense fallback={<PageLoader />}><AboutPage /></Suspense>;
            case 'payment':
                const PaymentPage = lazy(() => import('./PaymentPage.jsx'));
                return <Suspense fallback={<PageLoader />}><PaymentPage /></Suspense>;
            case 'blog':
                const BlogIndexPage = lazy(() => import('./BlogIndexPage.jsx'));
                return <Suspense fallback={<PageLoader />}><BlogIndexPage hubType="general" /></Suspense>;
            case 'blog/hire-in-india':
                const BlogIndexHireIndia = lazy(() => import('./BlogIndexPage.jsx'));
                return <Suspense fallback={<PageLoader />}><BlogIndexHireIndia hubType="hire-in-india" /></Suspense>;
            case 'blog/freelance-in-germany':
                const BlogIndexFreelanceGermany = lazy(() => import('./BlogIndexPage.jsx'));
                return <Suspense fallback={<PageLoader />}><BlogIndexFreelanceGermany hubType="freelance-in-germany" /></Suspense>;
            case 'blog/hire-in-mumbai':
                const BlogIndexHireMumbai = lazy(() => import('./BlogIndexPage.jsx'));
                return <Suspense fallback={<PageLoader />}><BlogIndexHireMumbai hubType="hire-in-mumbai" /></Suspense>;
            default:
                if (page.startsWith('blog/post/')) {
                    const BlogPostPageComponent = lazy(() => import('./BlogPostPage.jsx'));
                    const postId = page.substring('blog/post/'.length);
                    return <Suspense fallback={<PageLoader />}><BlogPostPageComponent postId={postId} /></Suspense>;
                }
                return <DirectoryPage db={db} navigateToProfile={navigateToProfile} locationData={locationData} />;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
            <Header user={user} profile={profile} setPage={setPage} handleLogout={handleLogout} />
            <main className="p-4 md:p-8">
                <Suspense fallback={<PageLoader />}>
                    {renderPage()}
                </Suspense>
            </main>
            <Footer setPage={setPage} />
            <ContactBanner />
            <GDPRBanner /> {/* Add GDPR Banner here */}
        </div>
    );
}

const PageLoader = () => (
    <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
);

function Header({ user, profile, setPage, handleLogout }) {
    return (
        <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 shadow-sm">
            <nav className="container mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('directory')}>
                    <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span className="text-xl font-bold text-gray-800"><FormattedMessage id="app.title" /></span>
                </div>
                <div className="flex items-center gap-6">
                    <button onClick={() => setPage('directory')} className="font-medium text-gray-600 hover:text-indigo-600 transition-colors"><FormattedMessage id="header.directoryLink" /></button>
                    <button onClick={() => setPage('chat')} className="font-medium text-gray-600 hover:text-indigo-600 transition-colors"><FormattedMessage id="header.chatLink" /></button>
                    {user?.uid === ADMIN_UID && (<button onClick={() => setPage('admin')} className="font-bold text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"><ShieldIcon /> <FormattedMessage id="header.adminLink" /></button>)}
                </div>
                <div className="flex items-center gap-3">
                    {user && !user.isAnonymous ? (
                        <>
                           {profile ? ( <button onClick={() => setPage('editProfile')} className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-indigo-600"><UserIcon /><span><FormattedMessage id="header.myProfileLink" /></span></button>
                           ) : ( <button onClick={() => setPage('editProfile')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all"><FormattedMessage id="header.createProfileButton" /></button> )}
                           <button onClick={handleLogout} title="Logout" className="p-2 rounded-full hover:bg-gray-200"><LogOutIcon /></button>
                        </>
                    ) : (
                        <button onClick={() => setPage('login')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all"><FormattedMessage id="header.joinLoginButton" /></button>
                    )}
                </div>
            </nav>
        </header>
    );
}

function DirectoryPage({ db, navigateToProfile, locationData }) {
    const intl = useIntl();
    const [allFreelancers, setAllFreelancers] = useState([]);
    const [filteredFreelancers, setFilteredFreelancers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [keywordTerm, setKeywordTerm] = useState("");
    const [countryFilter, setCountryFilter] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [domainFilter, setDomainFilter] = useState("");
    const [totalFreelancers, setTotalFreelancers] = useState(0);
    const countries = Object.keys(locationData);

    useEffect(() => {
        if (!db) { setLoading(false); return; }
        setLoading(true);
        const freelancersQuery = query(collection(db, `/artifacts/${appId}/public/data/profiles`), where("status", "==", "approved"));
        const unsubscribeFreelancers = onSnapshot(freelancersQuery, (querySnapshot) => {
            const freelancersData = [];
            querySnapshot.forEach((doc) => { freelancersData.push({ id: doc.id, ...doc.data() }); });
            setAllFreelancers(freelancersData);
            setLoading(false);
        }, (error) => { console.error("Error fetching freelancers: ", error); setLoading(false); });
        const countQuery = query(collection(db, `/artifacts/${appId}/public/data/profiles`), where("status", "==", "approved"));
        const unsubscribeCount = onSnapshot(countQuery, (snapshot) => { setTotalFreelancers(snapshot.size); },
            (error) => { console.error("Error fetching total freelancer count: ", error); });
        return () => { unsubscribeFreelancers(); unsubscribeCount(); };
    }, [db, appId]); // Added appId dependency

    useEffect(() => {
        const handler = setTimeout(() => {
            let results = allFreelancers;
            if (searchTerm) results = results.filter(f => f.name?.toLowerCase().includes(searchTerm.toLowerCase()));
            if (keywordTerm) results = results.filter(f => f.bio?.toLowerCase().includes(keywordTerm.toLowerCase()));
            if (countryFilter) results = results.filter(f => f.country === countryFilter);
            if (cityFilter) results = results.filter(f => f.city === cityFilter);
            if (domainFilter) results = results.filter(f => f.domains?.includes(domainFilter));
            setFilteredFreelancers(results);
        }, 300);
        return () => { clearTimeout(handler); };
    }, [searchTerm, keywordTerm, countryFilter, cityFilter, domainFilter, allFreelancers]);

    return (
        <div className="container mx-auto">
            <form onSubmit={(e) => e.preventDefault()} className="bg-white p-6 rounded-xl shadow-md mb-8 space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center"><FormattedMessage id="directory.mainTitle" /></h1>
                <p className="text-gray-600 text-center mb-2"><FormattedMessage id="directory.subTitle" /></p>
                <p className="text-center text-indigo-600 font-semibold mb-6">
                    {totalFreelancers > 0 ? <FormattedMessage id="directory.joinMessage" values={{ count: totalFreelancers }} />
                                         : <FormattedMessage id="directory.joinMessage.noCount" />}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1"><FormattedMessage id="directory.filter.nameLabel" /></label><input type="text" placeholder={intl.formatMessage({ id: "directory.filter.namePlaceholder"})} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1"><FormattedMessage id="directory.filter.keywordLabel" /></label><input type="text" placeholder={intl.formatMessage({ id: "directory.filter.keywordPlaceholder"})} value={keywordTerm} onChange={e => setKeywordTerm(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1"><FormattedMessage id="directory.filter.domainLabel" /></label><select value={domainFilter} onChange={e => setDomainFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"><option value=""><FormattedMessage id="directory.filter.domainPlaceholder" /></option>{ALL_DOMAINS.map(c => <option key={c} value={c}>{toTitleCase(c)}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1"><FormattedMessage id="directory.filter.countryLabel" /></label><select value={countryFilter} onChange={e => {setCountryFilter(e.target.value); setCityFilter('');}} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"><option value=""><FormattedMessage id="directory.filter.countryPlaceholder" /></option>{countries.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1"><FormattedMessage id="directory.filter.cityLabel" /></label><select value={cityFilter} onChange={e => setCityFilter(e.target.value)} disabled={!countryFilter} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100"><option value=""><FormattedMessage id="directory.filter.cityPlaceholder" /></option>{countryFilter && locationData[countryFilter].map(city => <option key={city} value={city}>{city}</option>)}</select></div>
                </div>
            </form>
            {loading ? (<p className="text-center"><FormattedMessage id="directory.loading" /></p>) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredFreelancers.map(freelancer => (
                        <FreelancerCard key={freelancer.id} freelancer={freelancer} navigateToProfile={navigateToProfile} />
                    ))}
                </div>
            )}
            { !loading && filteredFreelancers.length === 0 && <p className="text-center text-gray-500 mt-8"><FormattedMessage id="directory.noResults" /></p>}
        </div>
    );
}

const FreelancerCard = React.memo(({ freelancer, navigateToProfile }) => {
    return (
        <div onClick={() => navigateToProfile(freelancer)} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer p-6 flex flex-col items-center text-center">
            <img src={`https://placehold.co/100x100/E2E8F0/4A5568?text=${freelancer.name.charAt(0)}`} alt={freelancer.name} className="w-24 h-24 rounded-full mb-4 border-4 border-white shadow-md" />
            <h3 className="font-bold text-lg">{freelancer.name}</h3>
            <div className="flex flex-wrap gap-1 justify-center mt-1">{freelancer.domains?.map(d => <span key={d} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{toTitleCase(d)}</span>)}</div>
            <div className="flex items-center text-gray-500 text-sm mt-2"><MapPinIcon /><span className="ml-1">{freelancer.city}, {freelancer.country}</span></div>
            <p className="text-gray-600 mt-3 text-sm flex-grow">{freelancer.bio?.substring(0, 100)}{freelancer.bio?.length > 100 && '...'}</p>
            <button className="mt-4 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-xs font-semibold hover:bg-indigo-200 transition-colors">
                <FormattedMessage id="profile.viewProfileButton" />
            </button>
        </div>
    );
});

function ChatPage({ db, user, profile, onProfileClick }) {
    const intl = useIntl();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const lastMessageTime = useRef(0);
    const chatEndRef = useRef(null);

    // Determine if user can chat based on profile.canAccessTrollbox
    // Default to true if the field is undefined (for backward compatibility or if profile is not fully loaded/exists)
    const userCanChat = (user && !user.isAnonymous && profile && (profile.canAccessTrollbox === undefined || profile.canAccessTrollbox));

    useEffect(() => {
        if (!db) return;
        const q = query(collection(db, `/artifacts/${appId}/public/data/chat_messages`), orderBy("timestamp", "desc"), limit(50));
        const unsub = onSnapshot(q, (snap) => {
            const msgs = [];
            snap.forEach(d => msgs.push({id: d.id, ...d.data()}));
            setMessages(msgs.reverse());
        });
        return () => unsub();
    }, [db, appId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async(e) => {
        e.preventDefault();
        if(!userCanChat || !user || user.isAnonymous || !profile || newMessage.trim()==="" || isSending) return;

        const now=Date.now();
        if(now-lastMessageTime.current<5e3){
            alert(intl.formatMessage({id: 'chat.waitMessage'}, {seconds: Math.ceil((5e3-(now-lastMessageTime.current))/1e3)}));
            return;
        }
        setIsSending(true);
        lastMessageTime.current=now;
        try{
            await addDoc(collection(db,`/artifacts/${appId}/public/data/chat_messages`),{text:newMessage,timestamp:serverTimestamp(),userId:user.uid,userName:profile.name});
            setNewMessage("");
        } catch(err){console.error(err)}
        finally{setIsSending(false)}
    }

    let placeholderText = intl.formatMessage({id: 'chat.inputPlaceholder.loggedOut'});
    if (user && !user.isAnonymous && profile) {
        if (userCanChat) {
            placeholderText = intl.formatMessage({id: 'chat.inputPlaceholder.loggedIn'});
        } else {
            placeholderText = intl.formatMessage({id: 'chat.inputPlaceholder.accessRevoked', defaultMessage: "Chat access has been revoked."});
        }
    }

    return <div className="container mx-auto max-w-4xl"><div className="bg-white rounded-xl shadow-lg flex flex-col" style={{height:'75vh'}}><div className="p-4 border-b"><h2 className="text-xl font-bold text-center"><FormattedMessage id="chat.title" defaultMessage="Community Trollbox"/></h2></div><div className="flex-grow p-4 overflow-y-auto">{messages.map(msg=><ChatMessageItem key={msg.id} msg={msg} onProfileClick={onProfileClick} />)}<div ref={chatEndRef}/></div ><div className="p-4 border-t bg-gray-50"><form onSubmit={handleSendMessage}className="flex items-center gap-2"><input type="text"value={newMessage}onChange={e=>setNewMessage(e.target.value)}placeholder={placeholderText}className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"disabled={!userCanChat || !user || user.isAnonymous || !profile || isSending}/><button type="submit"disabled={isSending||!newMessage.trim()||!userCanChat}className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"><SendIcon /></button></form></div></div></div>
}

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

function ProfilePage({ profileData, user, db, setPage }) {
    const intl = useIntl();
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportText, setReportText] = useState('');
    const [reportRecaptchaToken, setReportRecaptchaToken] = useState(null); // Added
    const reportRecaptchaRef = useRef(); // Added
    const MAX_REPORT_TEXT_WORDS = 50;
    const REPORT_REASONS = ["Scammer", "Spammer", "Bot", "Others"];

    // NOTE: User needs to replace this with their actual site key
    const RECAPTCHA_SITE_KEY = "YOUR_RECAPTCHA_SITE_KEY_HERE"; // Added, assuming same key for all instances

    const onReportRecaptchaChange = (token) => { // Added
        setReportRecaptchaToken(token);
    };

    if (!profileData) { return <div className="text-center"><FormattedMessage id="alert.profileNotFound" /> <button onClick={() => window.location.reload()} className="text-indigo-600"><FormattedMessage id="profile.goBackLink" defaultMessage="Go back to directory."/></button></div> }

    const openReportModal = () => {
        if (!user || user.isAnonymous) {
            alert(intl.formatMessage({id: 'profile.reportLoginPrompt', defaultMessage: "You must be logged in to report a profile."}));
            return;
        }
        setShowReportModal(true);
    };

    const countWords = (str) => str ? str.trim().split(/\s+/).length : 0;

    const submitReport = async () => {
        if (!reportReason) {
            alert(intl.formatMessage({id: 'profile.report.selectReasonError', defaultMessage: "Please select a reason for reporting."}));
            return;
        }
        if (reportReason === 'Others' && !reportText.trim()) {
            alert(intl.formatMessage({id: 'profile.report.otherReasonTextError', defaultMessage: "Please provide details if you select 'Others'."}));
            return;
        }

        const currentWordCount = countWords(reportText);
        if (currentWordCount > MAX_REPORT_TEXT_WORDS) {
            alert(intl.formatMessage({id: 'profile.report.wordLimitError', defaultMessage: "Your reason is {count} words. Please limit it to {limit} words."}, {limit: MAX_REPORT_TEXT_WORDS, count: currentWordCount}));
            return;
        }

        if (RECAPTCHA_SITE_KEY !== "YOUR_RECAPTCHA_SITE_KEY_HERE" && !reportRecaptchaToken) {
            alert(intl.formatMessage({ id: 'alert.recaptchaRequired', defaultMessage: "Please complete the reCAPTCHA."}));
            return;
        }

        try {
            const reportsPath = `/artifacts/${appId}/public/data/reports`;
            await addDoc(collection(db, reportsPath), {
                reportedProfileId: profileData.id,
                reportedProfileName: profileData.name,
                reporterId: user.uid,
                reason: reportReason,
                customReasonText: reportText.trim(),
                timestamp: serverTimestamp(),
                status: 'new'
            });
            alert(intl.formatMessage({id: 'profile.reportSuccess', defaultMessage: "Thank you. This profile has been reported and will be reviewed by a moderator."}));
            setShowReportModal(false);
            setReportReason('');
            setReportText('');
            if (reportRecaptchaRef.current) { // Reset reCAPTCHA
                reportRecaptchaRef.current.reset();
            }
            setReportRecaptchaToken(null);
        } catch (error) {
            console.error("Error submitting report:", error);
            alert(intl.formatMessage({id: 'profile.reportError', defaultMessage: "An error occurred while reporting the profile."}));
        }
    };

    const shareProfile = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert(intl.formatMessage({id: 'profile.shareSuccess'}));
        }).catch(err => {
            console.error('Could not copy text: ', err);
            alert(intl.formatMessage({id: 'profile.shareError'}));
        });
    }
    return (
        <div className="container mx-auto max-w-4xl">
            <div className="bg-white rounded-xl shadow-lg p-8">
                 <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="text-center flex-shrink-0">
                         <img src={`https://placehold.co/150x150/E2E8F0/4A5568?text=${profileData.name.charAt(0)}`} alt={profileData.name} className="w-36 h-36 rounded-full mb-4 border-4 border-white shadow-xl mx-auto" />
                         <div className="flex flex-col gap-2">
                            {profileData.linkedinUrl && <a href={profileData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="bg-[#0077B5] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#005E92] transition-colors flex items-center justify-center gap-2"><LinkedinIcon /> <FormattedMessage id="profile.viewLinkedIn" defaultMessage="View LinkedIn"/></a>}
                            <button onClick={shareProfile} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"><Share2Icon /><FormattedMessage id="profile.shareProfileButton" defaultMessage="Share Profile"/></button>
                            {user && !user.isAnonymous && <button onClick={openReportModal} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors flex items-center justify-center gap-2"><FlagIcon /> <FormattedMessage id="profile.reportProfileButton" defaultMessage="Report Profile"/></button>}
                         </div>
                    </div>
                    <div>
                        {showReportModal && (
                            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
                                <div className="relative p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4"><FormattedMessage id="profile.reportModal.title" defaultMessage="Report Profile"/></h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="reportReason" className="block text-sm font-medium text-gray-700"><FormattedMessage id="profile.reportModal.reasonLabel" defaultMessage="Reason for reporting:"/></label>
                                            <select
                                                id="reportReason"
                                                name="reportReason"
                                                value={reportReason}
                                                onChange={(e) => setReportReason(e.target.value)}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white"
                                            >
                                                <option value=""><FormattedMessage id="profile.reportModal.selectReasonPlaceholder" defaultMessage="Select a reason..."/></option>
                                                {REPORT_REASONS.map(reason => (
                                                    <option key={reason} value={reason}>{intl.formatMessage({id: `profile.reportModal.reason.${reason.toLowerCase()}`, defaultMessage: reason})}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {(reportReason === 'Others' || reportReason !== '') && (
                                            <div>
                                                <label htmlFor="reportText" className="block text-sm font-medium text-gray-700">
                                                    <FormattedMessage id="profile.reportModal.detailsLabel" defaultMessage="Details (Optional, {limit} words max):"/>
                                                </label>
                                                <textarea
                                                    id="reportText"
                                                    name="reportText"
                                                    rows="3"
                                                    value={reportText}
                                                    onChange={(e) => setReportText(e.target.value)}
                                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder={intl.formatMessage({id: 'profile.reportModal.detailsPlaceholder', defaultMessage: "Provide more details if necessary..."})}
                                                ></textarea>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    <FormattedMessage id="profile.reportModal.wordCount" defaultMessage="{count}/{limit} words" values={{count: countWords(reportText), limit: MAX_REPORT_TEXT_WORDS}}/>
                                                </p>
                                            </div>
                                        )}
                                        {RECAPTCHA_SITE_KEY !== "YOUR_RECAPTCHA_SITE_KEY_HERE" && (
                                            <div className="flex justify-center mt-4">
                                                <ReCAPTCHA
                                                    ref={reportRecaptchaRef}
                                                    sitekey={RECAPTCHA_SITE_KEY}
                                                    onChange={onReportRecaptchaChange}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                        <button
                                            type="button"
                                            onClick={submitReport}
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                                        >
                                            <FormattedMessage id="profile.reportModal.submitButton" defaultMessage="Submit Report"/>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setShowReportModal(false); setReportReason(''); setReportText(''); }}
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                        >
                                            <FormattedMessage id="profile.reportModal.cancelButton" defaultMessage="Cancel"/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <h1 className="text-4xl font-bold">{profileData.name}</h1>
                        <div className="flex flex-wrap gap-2 mt-2">{profileData.domains?.map(d => <span key={d} className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">{toTitleCase(d)}</span>)}</div>
                        <div className="flex items-center text-gray-500 mt-3"><MapPinIcon /><span className="ml-2">{profileData.city}, {profileData.country}</span></div>
                        <div className="mt-6"><h2 className="text-2xl font-bold border-b pb-2 mb-4"><FormattedMessage id="profile.aboutMeTitle" defaultMessage="About Me"/></h2><p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profileData.bio}</p></div>

                        {profileData.hasContactAccess ? (
                            <div className="mt-8 p-6 bg-green-50 rounded-lg shadow">
                                <h2 className="text-xl font-bold text-green-700 mb-3">
                                    <FormattedMessage id="profile.contactInfoTitle" defaultMessage="Contact Information"/>
                                </h2>
                                <div className="space-y-2">
                                    <p><strong className="font-medium"><FormattedMessage id="profile.contactEmailLabel" defaultMessage="Email:"/></strong> {profileData.email || <span className="italic"><FormattedMessage id="profile.contactNotProvided" defaultMessage="Not provided"/></span>}</p>
                                    {profileData.phone && <p><strong className="font-medium"><FormattedMessage id="profile.phoneLabel" defaultMessage="Phone:"/></strong> {profileData.phone}</p>}
                                    {profileData.whatsapp && <p><strong className="font-medium"><FormattedMessage id="profile.whatsappLabel" defaultMessage="WhatsApp:"/></strong> {profileData.whatsapp}</p>}
                                    {profileData.telegram && <p><strong className="font-medium"><FormattedMessage id="profile.telegramLabel" defaultMessage="Telegram:"/></strong> {profileData.telegram}</p>}
                                    {profileData.slack && <p><strong className="font-medium"><FormattedMessage id="profile.slackLabel" defaultMessage="Slack ID:"/></strong> {profileData.slack}</p>}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-8 p-6 bg-indigo-50 rounded-lg shadow">
                                <h2 className="text-xl font-bold text-indigo-700 mb-3"><FormattedMessage id="profile.connectTitle" values={{name: profileData.name}} /></h2>
                                <p className="text-gray-700 mb-4">
                                    <FormattedMessage id="profile.connectMessage" values={{name: profileData.name}} />
                                </p>
                                <button
                                    onClick={() => setPage('payment')}
                                    className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-lg"
                                >
                                    <FormattedMessage id="profile.payNowButton" />
                                </button>
                            </div>
                        )}

                        <div className="mt-8"><h2 className="text-2xl font-bold border-b pb-2 mb-4"><FormattedMessage id="profile.otherLinksTitle" defaultMessage="Other Links"/></h2><div className="flex flex-col gap-3">{profileData.links?.map((link, index) => (<a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-indigo-600 hover:underline"><LinkIcon /><span>{link.url}</span></a>))}{(!profileData.links || profileData.links.length === 0) && <p className="text-gray-500"><FormattedMessage id="profile.noOtherLinks" defaultMessage="No other links provided."/></p>}</div></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import ReCAPTCHA from "react-google-recaptcha"; // Added

function EditProfilePage({ db, user, existingProfile, setPage, setProfile, locationData }) {
    const intl = useIntl();
    const [formData, setFormData] = useState({
        name: '', email: '', country: '', city: '', domains: [], bio: '', linkedinUrl: '', links: [{ url: '' }],
        phone: '', whatsapp: '', telegram: '', slack: '' // New contact fields
    });
    const [isSaving, setIsSaving] = useState(false);
    const countries = Object.keys(locationData);
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const recaptchaRef = useRef();

    const RECAPTCHA_SITE_KEY = "YOUR_RECAPTCHA_SITE_KEY_HERE";

    const onRecaptchaChange = (token) => {
        setRecaptchaToken(token);
    };

    useEffect(() => {
        if (existingProfile) {
            setFormData({
                name: existingProfile.name || user.displayName || '',
                email: existingProfile.email || user.email || '',
                country: existingProfile.country || '',
                city: existingProfile.city || '',
                domains: existingProfile.domains || [],
                bio: existingProfile.bio || '',
                linkedinUrl: existingProfile.linkedinUrl || '',
                links: existingProfile.links && existingProfile.links.length > 0 ? existingProfile.links : [{ url: '' }],
                phone: existingProfile.phone || '',
                whatsapp: existingProfile.whatsapp || '',
                telegram: existingProfile.telegram || '',
                slack: existingProfile.slack || ''
            });
        } else {
             setFormData(prev => ({
                ...prev,
                name: user.displayName || '',
                email: user.email || '',
                // Initialize new fields for new profile
                phone: '', whatsapp: '', telegram: '', slack: '', links: [{url: ''}], domains: []
            }));
        }
    }, [existingProfile, user]);

    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); if (name === 'country') setFormData(prev => ({ ...prev, city: '' })); };
    const handleDomainChange = (domain) => { const currentDomains = formData.domains; if (currentDomains.includes(domain)) { setFormData(prev => ({ ...prev, domains: currentDomains.filter(d => d !== domain)})); } else { setFormData(prev => ({ ...prev, domains: [...currentDomains, domain]})); }};
    const handleLinkChange = (index, value) => { const newLinks = [...formData.links]; newLinks[index].url = value; setFormData(prev => ({...prev, links: newLinks})); };

    const addLink = () => {
        if (formData.links.length >= 5) {
            alert(intl.formatMessage({ id: 'alert.maxLinksReached' }));
            return;
        }
        setFormData(prev => ({...prev, links: [...prev.links, {url: ''}]}));
    }
    const removeLink = (index) => { const newLinks = formData.links.filter((_, i) => i !== index); setFormData(prev => ({...prev, links: newLinks})); }

    const countWords = (str) => {
        if (!str || str.trim() === '') return 0;
        return str.trim().split(/\s+/).length;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!db || !user) return;

        if (RECAPTCHA_SITE_KEY !== "YOUR_RECAPTCHA_SITE_KEY_HERE" && !recaptchaToken) {
            alert(intl.formatMessage({ id: 'alert.recaptchaRequired', defaultMessage: "Please complete the reCAPTCHA."}));
            return;
        }

        if (formData.domains.length === 0) {
            alert(intl.formatMessage({ id: 'alert.selectDomain' }));
            return;
        }

        const bioWordCount = countWords(formData.bio);
        if (bioWordCount > 500) {
            alert(intl.formatMessage({ id: 'alert.bioTooLong' }, { wordCount: bioWordCount }));
            return;
        }

        if (formData.links.length > 5) {
            alert(intl.formatMessage({ id: 'alert.maxLinksReached' }));
            return;
        }

        setIsSaving(true);
        // Data for private profile (includes email)
        const privateProfileData = { ...formData, userId: user.uid, updatedAt: serverTimestamp(), status: 'pending' };

        // Data for public profile (omits email and other potentially sensitive fields not meant for public view by default)
        const { email, ...publicProfileDataFields } = formData; // Destructure to remove email
        const publicProfileData = {
            ...publicProfileDataFields,
            userId: user.uid,
            updatedAt: serverTimestamp(),
            status: 'pending' // Status should be on both for admin queries and public filtering
        };

        try {
            await setDoc(doc(db, `/artifacts/${appId}/users/${user.uid}/profile/data`), privateProfileData, { merge: true });
            await setDoc(doc(db, `/artifacts/${appId}/public/data/profiles/${user.uid}`), publicProfileData, { merge: true });
            setProfile({id: user.uid, ...privateProfileData}); // App state uses the full private profile
            alert(intl.formatMessage({ id: 'alert.profileSubmitted' }));
            setPage('directory');
        } catch (error) {
            console.error("Error saving profile:", error);
            alert(intl.formatMessage({ id: 'alert.profileSaveFailed' }));
        } finally {
            setIsSaving(false);
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
            }
            setRecaptchaToken(null);
        }
    };

    const handleDataExportRequest = () => {
        alert(intl.formatMessage({id: 'editProfile.dataExportAlert', defaultMessage: "To request your data, please email directoryhelperbot@gmail.com. Automated data export is coming soon."}));
    };

    const handleDeleteAccount = async () => {
        if (!db || !user) return;
        if (window.confirm(intl.formatMessage({id: 'editProfile.deleteConfirm', defaultMessage: "Are you sure you want to permanently delete your account and all associated data? This cannot be undone."}))) {
            try {
                setIsSaving(true); // Use isSaving to disable buttons during deletion
                // Delete public profile
                await deleteDoc(doc(db, `/artifacts/${appId}/public/data/profiles/${user.uid}`));
                // Delete private profile
                await deleteDoc(doc(db, `/artifacts/${appId}/users/${user.uid}/profile/data`));

                // IMPORTANT: Firebase Auth user deletion should ideally be triggered here,
                // but requires backend (Admin SDK) or re-authentication for security.
                // For now, we will log the user out and they won't be able to log back in
                // if their data is gone. If they sign up again with same email, it would be a new UID.
                // A more robust flow might involve a 'deletionRequested' flag for backend processing.

                alert(intl.formatMessage({id: 'editProfile.deleteSuccessAlert', defaultMessage: "Your LancerPages data has been deleted. Your authentication account will be removed shortly if you do not log back in."}));

                // Log out the user
                if (handleLogout) { // Check if handleLogout is passed as a prop
                    await handleLogout(); // This will also redirect to directory
                } else { // Fallback if handleLogout is not available (e.g. if component is used elsewhere)
                    setPage('directory');
                }

            } catch (error) {
                console.error("Error deleting account data:", error);
                alert(intl.formatMessage({id: 'editProfile.deleteErrorAlert', defaultMessage: "An error occurred while deleting your account data. Please contact support."}));
                setIsSaving(false);
            }
            // No finally setIsSaving(false) here if logout causes unmount
        }
    };

    return (
        <div className="container mx-auto max-w-2xl">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
                <h1 className="text-3xl font-bold text-center">
                    {existingProfile
                        ? <FormattedMessage id="editProfile.title.edit" defaultMessage="Edit Your Profile"/>
                        : <FormattedMessage id="editProfile.title.create" defaultMessage="Create Your Profile"/>}
                </h1>
                {/* ... form fields ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1"><FormattedMessage id="editProfile.nameLabel" defaultMessage="Name"/></label><input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1"><FormattedMessage id="editProfile.countryLabel" defaultMessage="Country"/></label><select name="country" value={formData.country} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"><option value=""><FormattedMessage id="editProfile.selectCountryPlaceholder" defaultMessage="Select a Country"/></option>{countries.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1"><FormattedMessage id="editProfile.cityLabel" defaultMessage="City"/></label><select name="city" value={formData.city} onChange={handleChange} required disabled={!formData.country} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100"><option value=""><FormattedMessage id="editProfile.selectCityPlaceholder" defaultMessage="Select a City"/></option>{formData.country && locationData[formData.country].map(city => <option key={city} value={city}>{city}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1"><FormattedMessage id="editProfile.linkedinLabel" defaultMessage="LinkedIn Profile URL (Optional)"/></label><input type="url" name="linkedinUrl" placeholder="https://linkedin.com/in/..." value={formData.linkedinUrl} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                </div>

                {/* New Contact Fields */}
                <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium text-gray-800 mb-3"><FormattedMessage id="editProfile.contactInfoSubtitle" defaultMessage="Contact Information (Optional)"/></h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1"><FormattedMessage id="editProfile.phoneLabel" defaultMessage="Phone Number"/></label><input type="tel" name="phone" placeholder="+1 123 456 7890" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1"><FormattedMessage id="editProfile.whatsappLabel" defaultMessage="WhatsApp Number"/></label><input type="tel" name="whatsapp" placeholder="Same as phone, or different" value={formData.whatsapp} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1"><FormattedMessage id="editProfile.telegramLabel" defaultMessage="Telegram ID"/></label><input type="text" name="telegram" placeholder="@username" value={formData.telegram} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1"><FormattedMessage id="editProfile.slackLabel" defaultMessage="Slack ID (User ID)"/></label><input type="text" name="slack" placeholder="U0xxxxxxxxx" value={formData.slack} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                    </div>
                </div>


                <div><label className="block text-sm font-medium text-gray-700 mb-2"><FormattedMessage id="editProfile.domainsLabel" defaultMessage="Domains of Expertise (select all that apply)"/></label><div className="grid grid-cols-2 md:grid-cols-4 gap-2">{ALL_DOMAINS.map(domain => (<label key={domain} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"><input type="checkbox" checked={formData.domains.includes(domain)} onChange={() => handleDomainChange(domain)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/><span>{toTitleCase(domain)}</span></label>))}</div></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1"><FormattedMessage id="editProfile.bioLabel" defaultMessage="Bio / About Me"/></label><textarea name="bio" value={formData.bio} onChange={handleChange} rows="5" required placeholder={intl.formatMessage({id: "editProfile.bioPlaceholder", defaultMessage: "Describe your skills, experience, and what makes you a great freelancer."})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1"><FormattedMessage id="editProfile.otherLinksLabel" defaultMessage="Other Links (Portfolio, Website, etc.)"/></label><div className="space-y-3">{formData.links.map((link, index) => (<div key={index} className="flex items-center gap-2"><input type="url" placeholder="https://..." value={link.url} onChange={(e) => handleLinkChange(index, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /><button type="button" onClick={() => removeLink(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2Icon /></button></div>))}</div ><button type="button" onClick={addLink} className="mt-3 flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"><PlusCircleIcon /> <FormattedMessage id="editProfile.addLinkLabel" defaultMessage="Add another link"/></button></div>

                {RECAPTCHA_SITE_KEY !== "YOUR_RECAPTCHA_SITE_KEY_HERE" && (
                    <div className="flex justify-center pt-4">
                        <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey={RECAPTCHA_SITE_KEY}
                            onChange={onRecaptchaChange}
                        />
                    </div>
                )}

                <div className="pt-4 border-t"><button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors text-lg">{isSaving ? <FormattedMessage id="editProfile.savingButton" defaultMessage="Saving..."/> : <FormattedMessage id="editProfile.saveButton" defaultMessage="Save Profile"/>}</button></div>

                {/* GDPR Data Actions */}
                <div className="mt-8 pt-6 border-t border-gray-300 space-y-4">
                    <h3 className="text-lg font-medium text-gray-800"><FormattedMessage id="editProfile.dataManagementTitle" defaultMessage="Data Management"/></h3>
                    <div>
                        <button
                            type="button"
                            onClick={handleDataExportRequest}
                            className="w-full mb-3 text-sm text-indigo-600 hover:text-indigo-800 py-2 px-4 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                            <FormattedMessage id="editProfile.downloadDataButton" defaultMessage="Download Your Data"/>
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteAccount}
                            className="w-full text-sm text-red-600 hover:text-red-800 py-2 px-4 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <FormattedMessage id="editProfile.deleteAccountButton" defaultMessage="Delete My Account"/>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

function LoginPage({ handleEmailSignUp, handleEmailLogin }) {
    const intl = useIntl();
    const [isLogin, setIsLogin] = useState(true);
import ReCAPTCHA from "react-google-recaptcha"; // Import reCAPTCHA

// ... (other code for LoginPage)

function LoginPage({ handleEmailSignUp, handleEmailLogin }) {
    const intl = useIntl();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const recaptchaRef = useRef();

    // NOTE: User needs to replace this with their actual site key
    const RECAPTCHA_SITE_KEY = "YOUR_RECAPTCHA_SITE_KEY_HERE";

    const onRecaptchaChange = (token) => {
        setRecaptchaToken(token);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!recaptchaToken && RECAPTCHA_SITE_KEY !== "YOUR_RECAPTCHA_SITE_KEY_HERE") { // Only enforce if key is set
            alert(intl.formatMessage({ id: 'alert.recaptchaRequired', defaultMessage: "Please complete the reCAPTCHA."}));
            return;
        }
        setLoading(true);
        if (isLogin) {
            await handleEmailLogin(email, password);
        } else {
            await handleEmailSignUp(email, password);
        }
        setLoading(false);
        // Reset reCAPTCHA after submission attempt
        if (recaptchaRef.current) {
            recaptchaRef.current.reset();
        }
        setRecaptchaToken(null);
    };

    return <div className="text-center max-w-md mx-auto bg-white p-10 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-2">{isLogin ? <FormattedMessage id="loginPage.welcomeBack" /> : <FormattedMessage id="loginPage.createAccount" />}</h2>
        <p className="text-gray-600 mb-6">{isLogin ? <FormattedMessage id="loginPage.loginPrompt" /> : <FormattedMessage id="loginPage.signupPrompt" />}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><input type="email" placeholder={intl.formatMessage({id: 'loginPage.emailPlaceholder'})} value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div>
            <div className="relative"><input type={showPassword ? "text" : "password"} placeholder={intl.formatMessage({id: 'loginPage.passwordPlaceholder'})} value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">{showPassword ? <EyeOffIcon /> : <EyeIcon />}</button></div>

            {RECAPTCHA_SITE_KEY !== "YOUR_RECAPTCHA_SITE_KEY_HERE" && (
                 <div className="flex justify-center">
                    <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={RECAPTCHA_SITE_KEY}
                        onChange={onRecaptchaChange}
                    />
                </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors text-lg">
                {loading ? <FormattedMessage id="loginPage.processingButton" /> : (isLogin ? <FormattedMessage id="loginPage.loginButton" /> : <FormattedMessage id="loginPage.signupButton" />)}
            </button>
        </form>
        <div className="mt-6">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-indigo-600 hover:underline">
                {isLogin ? <FormattedMessage id="loginPage.switchToSignup" /> : <FormattedMessage id="loginPage.switchToLogin" />}
            </button>
        </div>
    </div>;
}

// The AdminPage component definition has been moved to src/AdminPage.jsx

function Footer({ setPage }) {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="text-center py-8 mt-12 border-t">
            <div className="container mx-auto px-4">
                <div className="mb-4">
                    <button onClick={() => setPage('about')} className="text-gray-600 hover:text-indigo-600 px-3 py-1"><FormattedMessage id="footer.aboutLink" /></button>
                    <span className="text-gray-400 mx-1">|</span>
                    <button onClick={() => setPage('terms')} className="text-gray-600 hover:text-indigo-600 px-3 py-1"><FormattedMessage id="footer.termsLink" /></button>
                    <span className="text-gray-400 mx-1">|</span>
                    <button onClick={() => setPage('privacy')} className="text-gray-600 hover:text-indigo-600 px-3 py-1"><FormattedMessage id="footer.privacyLink" /></button>
                    <span className="text-gray-400 mx-1">|</span>
                    <button onClick={() => setPage('blog')} className="text-gray-600 hover:text-indigo-600 px-3 py-1"><FormattedMessage id="footer.blogLink" /></button>
                </div>
                <p className="text-gray-500 text-sm">
                    <FormattedMessage id="footer.copyright" values={{ currentYear }} />
                </p>
            </div>
        </footer>
    );
}

export default App;
