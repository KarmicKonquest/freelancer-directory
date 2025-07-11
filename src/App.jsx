import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInWithCustomToken,
    signInAnonymously
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    query, 
    where,
    getDocs,
    onSnapshot,
    addDoc,
    serverTimestamp,
    updateDoc,
    deleteDoc,
    runTransaction,
    limit,
    startAfter,
    orderBy
} from 'firebase/firestore';
import { Eye, EyeOff, Search, User, MessageSquare, LogIn, LogOut, Shield, CheckCircle, XCircle, Menu, X, AlertTriangle, Gift, Users, Copy, ChevronsRight, BookUser, FileText, Mail, Square, Circle, Triangle, AtSign, Home } from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyA769aw44I0Kdb7KkTheJbAezDAFJ_a58w",
  authDomain: "lancerpages.firebaseapp.com",
  projectId: "lancerpages",
  storageBucket: "lancerpages.firebasestorage.app",
  messagingSenderId: "757657627874",
  appId: "1:757657627874:web:2adaf06e7e42fcc28ec2bb",
  measurementId: "G-EMY22RLXQE"
};

// --- App Initialization ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'lancerpages'; // Using the consistent app ID for Firestore paths

// --- Static Data ---
const domainsOfExpertise = ["Design", "Coding", "Operations", "Marketing", "Sales", "Finance", "HR", "Legal"];

// --- Helper Components ---

const GDPRBanner = () => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if (!localStorage.getItem('gdpr_accepted')) {
            setVisible(true);
        }
    }, []);

    if (!visible) return null;

    const handleAccept = () => {
        localStorage.setItem('gdpr_accepted', 'true');
        setVisible(false);
    };

    return (
        <div className="bg-[rgba(20,20,20,0.95)] p-4 text-[var(--text-primary)]">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
                <p className="text-sm mb-4 md:mb-0 md:mr-4">We use cookies to improve your browsing experience. By using our website, you consent to our use of cookies.</p>
                <button onClick={handleAccept} className="bg-[var(--color-accent)] hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg transition duration-300 whitespace-nowrap">Accept & Continue</button>
            </div>
        </div>
    );
};

const CountryCitySelector = ({ country, setCountry, city, setCity, countries, cities }) => (
    <>
        <div className="w-full md:w-1/2 pr-0 md:pr-2 mb-4 md:mb-0">
            <label htmlFor="country" className="block text-sm font-medium text-[var(--text-primary)] opacity-80">Country</label>
            <select id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1 block w-full bg-[var(--bg-secondary)] border-[var(--border-color)] rounded-md shadow-sm py-2 px-3 text-[var(--text-primary)]" required>
                <option value="">Select Country</option>
                {countries.map(c => <option key={c.iso2} value={c.country}>{c.country}</option>)}
            </select>
        </div>
        <div className="w-full md:w-1/2 pl-0 md:pl-2">
            <label htmlFor="city" className="block text-sm font-medium text-[var(--text-primary)] opacity-80">City</label>
            <select id="city" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 block w-full bg-[var(--bg-secondary)] border-[var(--border-color)] rounded-md shadow-sm py-2 px-3 text-[var(--text-primary)]" required disabled={!country}>
                <option value="">Select City</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
    </>
);

const Captcha = ({ onVerify }) => {
    const shapes = [{ name: 'Square', icon: <Square/> }, { name: 'Circle', icon: <Circle/> }, { name: 'Triangle', icon: <Triangle/> }];
    const [targetShape, setTargetShape] = useState(null);

    useEffect(() => {
        setTargetShape(shapes[Math.floor(Math.random() * shapes.length)]);
    }, []);

    const handleSelect = (shapeName) => {
        if (shapeName === targetShape.name) {
            onVerify(true);
        } else {
            onVerify(false);
            setTargetShape(shapes[Math.floor(Math.random() * shapes.length)]);
        }
    };

    if (!targetShape) return null;

    return (
        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg text-center">
            <p className="text-[var(--text-primary)] mb-3">Please select the <span className="font-bold text-[var(--color-accent)]">{targetShape.name}</span> to continue.</p>
            <div className="flex justify-center space-x-4">
                {shapes.map(shape => (
                    <button key={shape.name} type="button" onClick={() => handleSelect(shape.name)} className="p-3 bg-[var(--bg-primary)] rounded-md text-[var(--text-primary)] hover:bg-[var(--color-accent)]">
                        {shape.icon}
                    </button>
                ))}
            </div>
        </div>
    );
};

const BottomNavBar = ({ user, setPage }) => {
    return (
        <nav className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
            <div className="container mx-auto flex justify-around items-center h-16">
                <a href="#home" className="flex flex-col items-center justify-center text-[var(--text-primary)] opacity-70 hover:opacity-100 transition w-20">
                    <Home size={20} />
                    <span className="text-xs mt-1">Home</span>
                </a>
                <a href="#directory" className="flex flex-col items-center justify-center text-[var(--text-primary)] opacity-70 hover:opacity-100 transition w-20">
                    <Search size={20} />
                    <span className="text-xs mt-1">Directory</span>
                </a>
                <a href="#chatbox" className="flex flex-col items-center justify-center text-[var(--text-primary)] opacity-70 hover:opacity-100 transition w-20">
                    <MessageSquare size={20} />
                    <span className="text-xs mt-1">Chatbox</span>
                </a>
                {user && !user.isAnonymous && (
                    <button onClick={() => setPage('profile')} className="flex flex-col items-center justify-center text-[var(--text-primary)] opacity-70 hover:opacity-100 transition w-20">
                        <User size={20} />
                        <span className="text-xs mt-1">Profile</span>
                    </button>
                )}
            </div>
        </nav>
    );
};

// --- Page & Section Components ---

const HomePageBanner = () => {
    const changingTexts = ["clients to find freelancers for their projects.", "freelancers to get visibility and leads.", "freelancers and clients to work together without middlemen"];
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setCurrentIndex(prev => (prev + 1) % changingTexts.length), 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section id="home" className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-[var(--bg-primary)] text-[var(--text-primary)]">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">Lancerpages is the easiest way for...</h1>
            <div className="relative h-20 mb-8 w-full max-w-3xl">
                {changingTexts.map((text, index) => (
                    <p key={index} className={`absolute w-full top-0 left-0 text-xl md:text-2xl text-[var(--color-accent)] transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}>{text}</p>
                ))}
            </div>
            <div className="grid md:grid-cols-2 gap-8 text-left mt-8 max-w-4xl">
                 <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border-color)]"><h2 className="text-3xl font-serif font-semibold mb-3 text-[var(--color-accent)] opacity-90">For Freelancers</h2><p className="text-[var(--text-primary)] opacity-80">Create a profile in seconds, get leads directly, and chat with the community.</p></div>
                 <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border-color)]"><h2 className="text-3xl font-serif font-semibold mb-3 text-[var(--color-accent)] opacity-90">For Clients</h2><p className="text-[var(--text-primary)] opacity-80">Browse and connect with freelancers directly. Pay a small one-time fee to get their contact details.</p></div>
            </div>
        </section>
    );
};

const AuthSection = ({ user, setPage }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roles, setRoles] = useState({ lancer: true, client: false });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [captchaVerified, setCaptchaVerified] = useState(false);

    const handleRoleChange = (role) => {
        setRoles(prev => ({ ...prev, [role]: !prev[role] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLogin && !captchaVerified) {
            setError("Please complete the captcha.");
            return;
        }
        setLoading(true); setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                if (!roles.lancer && !roles.client) {
                    throw new Error("You must select at least one role (Lancer or Client).");
                }
                const userCred = await createUserWithEmailAndPassword(auth, email, password);
                const newUser = userCred.user;

                const profileData = { email: newUser.email, status: 'pending', chatboxAccess: true, roles, createdAt: serverTimestamp() };

                await setDoc(doc(db, `artifacts/${appId}/users/${newUser.uid}/profile`, 'data'), profileData);
                await setDoc(doc(db, `artifacts/${appId}/public/data/profiles`, newUser.uid), { email: newUser.email, status: 'pending', roles });
                setPage('profile');
            }
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    if (user && !user.isAnonymous) return null;

    return (
        <section id="login" className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)] p-4">
             <div className="max-w-md w-full bg-[var(--bg-primary)] rounded-lg shadow-xl p-8 space-y-6 text-[var(--text-primary)] border border-[var(--border-color)]">
                <h2 className="text-4xl font-serif font-bold text-center">{isLogin ? "Login" : "Create an Account"}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required className="w-full bg-[var(--bg-secondary)] p-3 rounded-md border border-[var(--border-color)] focus:ring-[var(--color-accent)]" />
                    <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full bg-[var(--bg-secondary)] p-3 rounded-md border border-[var(--border-color)]" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400"><Eye size={20} /></button>
                    </div>
                    {!isLogin && (
                        <div>
                            <p className="text-[var(--text-primary)] opacity-80 mb-2">I am a... (select at least one)</p>
                            <div className="flex space-x-4">
                                <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={roles.lancer} onChange={() => handleRoleChange('lancer')} className="form-checkbox h-5 w-5 bg-gray-800 border-gray-600 text-[var(--color-accent)]" /><span>Lancer</span></label>
                                <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={roles.client} onChange={() => handleRoleChange('client')} className="form-checkbox h-5 w-5 bg-gray-800 border-gray-600 text-[var(--color-accent)]" /><span>Client</span></label>
                            </div>
                            <div className="mt-6"><Captcha onVerify={setCaptchaVerified} /></div>
                        </div>
                    )}
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button type="submit" disabled={loading || (!isLogin && !captchaVerified)} className="w-full py-3 bg-[var(--color-accent)] hover:opacity-90 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition">
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                    </button>
                </form>
                <p className="text-center text-[var(--text-primary)] opacity-70">{isLogin ? "Don't have an account?" : "Already have an account?"}<button onClick={() => setIsLogin(!isLogin)} className="text-[var(--color-accent)] hover:underline ml-2">{isLogin ? 'Sign Up' : 'Login'}</button></p>
             </div>
        </section>
    );
};

const ChatboxSection = ({ user, profile, authReady }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [lastPostTime, setLastPostTime] = useState(0);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (!authReady) return;
        const q = query(collection(db, `artifacts/${appId}/public/data/chatbox`), orderBy("timestamp", "desc"), limit(50));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
            setMessages(msgs); setLoading(false);
        }, (error) => {
            console.error("Chatbox fetch error:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [authReady]);

    useEffect(() => {
        let timer;
        if(cooldown > 0) {
            timer = setInterval(() => setCooldown(c => c - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const now = Date.now();
        if (now - lastPostTime < 30000) {
            alert(`Please wait ${Math.ceil((30000 - (now - lastPostTime))/1000)}s before posting again.`);
            return;
        }
        const canPost = user && !user.isAnonymous && profile?.status === 'approved';
        if (!newMessage.trim() || !canPost) return;

        await addDoc(collection(db, `artifacts/${appId}/public/data/chatbox`), { text: newMessage, timestamp: serverTimestamp(), uid: user.uid, name: profile.name || 'Anonymous', roles: profile.roles || {} });
        setNewMessage('');
        setLastPostTime(now);
        setCooldown(30);
    };

    const canPost = user && !user.isAnonymous && profile?.status === 'approved';

    return (
        <section id="chatbox" className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
            <h1 className="text-4xl font-serif font-bold text-white text-center mb-4">Chatbox</h1>
            <p className="text-lg text-gray-400 text-center mb-8 max-w-3xl">Live chat for the Lancerpages community. Chat with lancers and clients, free of cost. Share jobs, gigs, news, resources, tips etc. Please be civil and helpful :)</p>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-xl flex-grow flex flex-col p-4 w-full max-w-4xl h-[70vh]">
                <div className="flex-grow overflow-y-auto mb-4 space-y-4 pr-2">
                    {loading ? <p className="text-gray-400">Loading messages...</p> : messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.uid === user?.uid ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-lg max-w-xs md:max-w-md ${msg.uid === user?.uid ? 'bg-[var(--color-accent)] bg-opacity-30' : 'bg-[var(--bg-primary)]'}`}>
                                <p className="font-bold text-[var(--color-accent)] text-sm flex items-center">
                                    {msg.name}
                                    {msg.roles?.client && <span className="ml-2 text-xs bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center">C</span>}
                                    {msg.roles?.lancer && <span className="ml-1 text-xs bg-green-500 text-white rounded-full h-5 w-5 flex items-center justify-center">L</span>}
                                </p>
                                <p className="text-[var(--text-primary)] break-words">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="border-t border-[var(--border-color)] pt-4">
                    {canPost ? (
                        <form onSubmit={handleSendMessage} className="flex space-x-2">
                            <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type your message..." className="flex-grow bg-[var(--bg-primary)] border border-[var(--border-color)] p-2 rounded-lg text-[var(--text-primary)]" />
                            <button type="submit" disabled={cooldown > 0} className="bg-[var(--color-accent)] p-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed">{cooldown > 0 ? `${cooldown}s` : 'Send'}</button>
                        </form>
                    ) : ( <div className="text-center p-3 bg-[var(--bg-primary)] rounded-lg text-gray-400">{!user || user.isAnonymous ? "Login to chat." : "Your profile must be approved to post."}</div> )}
                </div>
            </div>
        </section>
    );
};

const DirectorySection = ({ setPage, setSelectedProfileId, authReady }) => {
    const [freelancers, setFreelancers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef(null);

    // Filter states
    const [nameFilter, setNameFilter] = useState('');
    const [keywordFilter, setKeywordFilter] = useState('');
    const [domainFilter, setDomainFilter] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');

    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        fetch('https://countriesnow.space/api/v0.1/countries').then(res => res.json()).then(data => setCountries(data.data.sort((a, b) => a.country.localeCompare(b.country))));
    }, []);

    useEffect(() => {
        if (countryFilter) {
            const selected = countries.find(c => c.country === countryFilter);
            setCities(selected ? selected.cities : []);
        } else {
            setCities([]);
        }
        setCityFilter('');
    }, [countryFilter, countries]);

    const fetchFreelancers = useCallback(async (isInitial = false) => {
        if (loadingMore || (!isInitial && !hasMore)) return;
        isInitial ? setLoading(true) : setLoadingMore(true);
        try {
            let q = query(
                collection(db, `artifacts/${appId}/public/data/profiles`),
                where("status", "==", "approved"),
                where("roles.lancer", "==", true),
                orderBy("name"),
                limit(9)
            );
            if (!isInitial && lastVisible) q = query(q, startAfter(lastVisible));

            const docSnapshots = await getDocs(q);
            const newFreelancers = docSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLastVisible(docSnapshots.docs[docSnapshots.docs.length - 1]);
            setHasMore(newFreelancers.length >= 9);
            setFreelancers(prev => isInitial ? newFreelancers : [...prev, ...newFreelancers]);
        } catch (error) { console.error("Error fetching freelancers: ", error); }
        finally { setLoading(false); setLoadingMore(false); }
    }, [lastVisible, loadingMore, hasMore]); // Removed appId from here as it's defined globally

    useEffect(() => {
        if(authReady) {
            fetchFreelancers(true);
        }
    }, [authReady, fetchFreelancers]);

    const handleFilterChange = () => {};

    const viewProfile = (id) => { setSelectedProfileId(id); setPage('viewProfile'); };

    const filteredFreelancers = freelancers.filter(f => {
        const nameMatch = nameFilter ? f.name?.toLowerCase().includes(nameFilter.toLowerCase()) : true;
        const keywordMatch = keywordFilter ? f.bio?.toLowerCase().includes(keywordFilter.toLowerCase()) : true;
        const domainMatch = domainFilter ? f.domains?.includes(domainFilter) : true;
        const countryMatch = countryFilter ? f.location?.country === countryFilter : true;
        const cityMatch = cityFilter ? f.location?.city === cityFilter : true;
        return nameMatch && keywordMatch && domainMatch && countryMatch && cityMatch;
    });

    return (
        <section id="directory" className="min-h-screen bg-[var(--bg-secondary)] p-4 pt-16 text-[var(--text-primary)]">
            <div className="container mx-auto">
                <h1 className="text-4xl font-serif font-bold text-center mb-4">Freelancer Directory</h1>
                <p className="text-lg opacity-80 text-center mb-8">Find the talent you need.</p>
                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-6 rounded-lg shadow-lg mb-8">
                    <form onChange={handleFilterChange} className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                        <div>
                            <label className="block text-sm font-medium opacity-80 mb-1">Name</label>
                            <input type="text" placeholder="Search by name..." value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium opacity-80 mb-1">Keyword</label>
                            <input type="text" placeholder="e.g. 'React', 'logo'" value={keywordFilter} onChange={(e) => setKeywordFilter(e.target.value)} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium opacity-80 mb-1">Domain</label>
                            <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-md">
                                <option value="">All Domains</option>
                                {domainsOfExpertise.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium opacity-80 mb-1">Country</label>
                            <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-md">
                                <option value="">All Countries</option>
                                {countries.map(c => <option key={c.iso2} value={c.country}>{c.country}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium opacity-80 mb-1">City</label>
                             <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-md" disabled={!countryFilter}>
                                <option value="">All Cities</option>
                                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </form>
                </div>
                {loading ? <p className="text-center">Loading...</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredFreelancers.map(f => (
                             <div key={f.id} className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-xl overflow-hidden flex flex-col">
                                <div className="p-6 flex-grow">
                                    <h3 className="text-2xl font-serif font-bold mb-2">{f.name}</h3>
                                    <p className="opacity-80 mb-4 h-24 overflow-hidden text-ellipsis">{f.bio}</p>
                                </div>
                                <div className="p-6 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
                                    <button onClick={() => viewProfile(f.id)} className="w-full bg-[var(--color-accent)] hover:opacity-90 text-white font-bold py-2 rounded-lg">View Profile</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div ref={loaderRef} className="h-10 text-center p-4">
                    {loadingMore && <p>Loading more...</p>}
                    {!hasMore && freelancers.length > 0 && <p className="opacity-60">You've reached the end.</p>}
                </div>
            </div>
        </section>
    );
};

// --- Standalone Pages ---

const ProfilePage = ({ user, profile, setPage, setProfile: setAppProfile }) => {
    const [name, setName] = useState(profile?.name || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [profileUrl, setProfileUrl] = useState(profile?.profileUrl || '');
    const [urlError, setUrlError] = useState('');
    const [roles, setRoles] = useState(profile?.roles || { lancer: false, client: false });
    const [country, setCountry] = useState(profile?.location?.country || '');
    const [city, setCity] = useState(profile?.location?.city || '');
    const [selectedDomains, setSelectedDomains] = useState(profile?.domains || []);
    const [bio, setBio] = useState(profile?.bio || '');
    const [linkedin, setLinkedin] = useState(profile?.linkedin || '');
    const [otherLinks, setOtherLinks] = useState(profile?.otherLinks || [{ value: '' }]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => { fetch('https://countriesnow.space/api/v0.1/countries').then(res => res.json()).then(data => setCountries(data.data)); }, []);
    useEffect(() => {
        if (country) { const selected = countries.find(c => c.country === country); setCities(selected ? selected.cities : []); }
        else { setCities([]); }
        // setCity(''); // Do not reset city if country changes but city might still be valid or for re-population
    }, [country, countries]);

     // Repopulate city if profile data exists and country matches
    useEffect(() => {
        if (profile?.location?.country === country && profile?.location?.city) {
            setCity(profile.location.city);
        }
    }, [country, profile]);


    const handleUrlChange = (e) => {
        const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setProfileUrl(slug);
        setUrlError('');
    };

    const handleRoleChange = (role) => setRoles(p => ({ ...p, [role]: !p[role] }));
    const handleDomainChange = (domain) => setSelectedDomains(p => p.includes(domain) ? p.filter(d => d !== domain) : [...p, domain]);
    const handleLinkChange = (index, value) => { const l = [...otherLinks]; l[index].value = value; setOtherLinks(l); };
    const addLink = () => setOtherLinks([...otherLinks, { value: '' }]);
    const removeLink = (index) => setOtherLinks(otherLinks.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setMessage(''); setUrlError('');
        if (!user || user.isAnonymous) { setMessage("You must be logged in."); setLoading(false); return; }
        if (!roles.lancer && !roles.client) { setMessage("You must have at least one role active."); setLoading(false); return; }
        if (roles.lancer && !profileUrl) { setUrlError("Profile URL is required for Lancers."); setLoading(false); return; }

        if (roles.lancer && profileUrl) {
            const q = query(collection(db, `artifacts/${appId}/public/data/profiles`), where("profileUrl", "==", profileUrl));
            const querySnapshot = await getDocs(q);
            const isTaken = !querySnapshot.empty && querySnapshot.docs[0].id !== user.uid;
            if (isTaken) {
                setUrlError("This URL is already taken. Please choose another.");
                setLoading(false);
                return;
            }
        }

        const profileDataToSave = {
            name,
            phone,
            roles,
            profileUrl: roles.lancer ? profileUrl : '', // only save profileUrl if lancer
            location: { country, city },
            domains: selectedDomains,
            bio,
            linkedin,
            otherLinks: otherLinks.filter(l => l.value.trim() !== ''),
            status: profile?.status === 'approved' ? 'approved' : 'pending', // Preserve approved status
            updatedAt: serverTimestamp(),
            email: user.email,
            createdAt: profile?.createdAt || serverTimestamp() // Preserve original createdAt
        };
        try {
            await setDoc(doc(db, `artifacts/${appId}/public/data/profiles`, user.uid), profileDataToSave, { merge: true });
            // Update minimal data in private user profile
            const privateProfileData = { name, status: profileDataToSave.status, roles, profileUrl: profileDataToSave.profileUrl, email: user.email, updatedAt: serverTimestamp() };
            if(profile?.createdAt) privateProfileData.createdAt = profile.createdAt; else privateProfileData.createdAt = serverTimestamp();

            await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'data'), privateProfileData, { merge: true });

            setAppProfile(prev => ({ ...prev, ...profileDataToSave })); // Update app's main profile state
            setMessage('Profile updated successfully! If it was pending, it will be reviewed.');
        } catch (error) { setMessage(`Error: ${error.message}`); console.error("Profile save error:", error); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => setPage('home')} className="text-[var(--color-accent)] hover:underline mb-6">&larr; Back Home</button>
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-xl p-8">
                    <h1 className="text-3xl font-serif font-bold mb-6 text-[var(--color-accent)]">Your Profile</h1>
                    {profile?.status === 'pending' && <div className="bg-yellow-900 border-l-4 border-yellow-500 text-yellow-200 p-4 rounded-md mb-6">Profile pending review by Admin.</div>}
                    {profile?.status === 'approved' && <div className="bg-green-900 border-l-4 border-green-500 text-green-200 p-4 rounded-md mb-6">Your profile is approved and live!</div>}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="bg-[var(--bg-primary)] p-6 rounded-lg border border-[var(--border-color)]">
                            <h3 className="text-xl font-serif font-semibold mb-4">Your Roles</h3>
                             <div className="flex space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={roles.lancer} onChange={() => handleRoleChange('lancer')} className="form-checkbox h-5 w-5 bg-gray-900 border-gray-600 text-[var(--color-accent)]" /><span>Lancer (Visible in Directory)</span></label>
                                <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={roles.client} onChange={() => handleRoleChange('client')} className="form-checkbox h-5 w-5 bg-gray-900 border-gray-600 text-[var(--color-accent)]" /><span>Client</span></label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="opacity-80">Full Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-2 rounded" /></div>
                            <div><label className="opacity-80">Phone (Optional)</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-2 rounded" /></div>
                        </div>
                        {roles.lancer && (
                        <div>
                            <label className="opacity-80">Your Public Profile URL</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-[var(--border-color)] bg-[var(--bg-primary)] text-gray-400 sm:text-sm">lancerpages.com/hire/</span>
                                <input type="text" value={profileUrl} onChange={handleUrlChange} placeholder="ux-designer-mumbai" required={roles.lancer} className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md bg-[var(--bg-primary)] border border-[var(--border-color)]" />
                            </div>
                             {urlError && <p className="text-red-400 text-sm mt-1">{urlError}</p>}
                        </div>
                        )}
                        <div className="flex flex-col md:flex-row"><CountryCitySelector country={country} setCountry={setCountry} city={city} setCity={setCity} countries={countries} cities={cities} /></div>
                        {roles.lancer && <>
                            <div><label className="opacity-80">Domains of Expertise</label><div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">{domainsOfExpertise.map(d => (<label key={d} className="flex items-center space-x-2 bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)]"><input type="checkbox" checked={selectedDomains.includes(d)} onChange={() => handleDomainChange(d)} className="form-checkbox bg-gray-900 text-[var(--color-accent)]" /><span>{d}</span></label>))}</div></div>
                            <div><label className="opacity-80">Bio / About Me</label><textarea value={bio} onChange={e => setBio(e.target.value)} required={roles.lancer} rows="6" className="mt-1 w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-2 rounded"></textarea></div>
                            <div className="space-y-4">
                               <div><label className="opacity-80">LinkedIn URL</label><input type="url" value={linkedin} onChange={e => setLinkedin(e.target.value)} className="mt-1 w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-2 rounded"/></div>
                               <div><label className="opacity-80">Other Links</label>{otherLinks.map((l, i) => (<div key={i} className="flex items-center mt-2"><input type="url" value={l.value} onChange={e => handleLinkChange(i, e.target.value)} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-2 rounded"/><button type="button" onClick={() => removeLink(i)} className="ml-2 p-2 bg-red-600 rounded">&times;</button></div>))}<button type="button" onClick={addLink} className="mt-2 text-[var(--color-accent)]">+ Add link</button></div>
                            </div>
                        </>}
                        {message && <p className={`text-center ${message.startsWith("Error") ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}
                        <div className="flex justify-end"><button type="submit" disabled={loading} className="py-2 px-6 bg-[var(--color-accent)] hover:opacity-90 text-white rounded disabled:opacity-50">Save Profile</button></div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const ViewProfilePage = ({ profileId, setPage, user, profile }) => {
    const [freelancer, setFreelancer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showContactPopup, setShowContactPopup] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            const docRef = doc(db, `artifacts/${appId}/public/data/profiles`, profileId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) setFreelancer({ id: docSnap.id, ...docSnap.data() });
            else console.log("No such profile!");
            setLoading(false);
        };
        if (profileId) fetchProfile();
    }, [profileId]);

    const handleContact = async () => {
        if (!user || user.isAnonymous) {
            alert("Please login or create an account to contact freelancers.");
            setPage('home'); // Redirect to home which has login/signup
            // Ideally, you'd scroll to #login or trigger a modal.
            // For now, direct to home, which shows AuthSection if not logged in.
            return;
        }

        // Check if current user's profile has paid/contact access
        // The `profile` prop is the currently logged-in user's profile from App state
        if (profile && profile.hasPaidContactAccess) {
             setShowContactPopup(true);
        } else {
            alert("To access contact details, please complete the one-time payment via your profile or the payment page.");
            setPage('payment');
        }
    };

    if (loading) return <div className="bg-[var(--bg-primary)] min-h-screen text-[var(--text-primary)] flex justify-center items-center">Loading Profile...</div>;
    if (!freelancer) return <div className="bg-[var(--bg-primary)] min-h-screen text-[var(--text-primary)] flex justify-center items-center">Profile not found or not approved.</div>;

    return (
        <div className="bg-[var(--bg-primary)] min-h-screen p-4 sm:p-8 text-[var(--text-primary)]">
            <div className="max-w-4xl mx-auto">
                 <button onClick={() => setPage('home')} className="text-[var(--color-accent)] hover:underline mb-6">&larr; Back to Directory</button>
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-2xl p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                        <div><h1 className="text-4xl font-serif font-bold">{freelancer.name}</h1>
                        <p className="text-[var(--color-accent)]">{freelancer.location?.city}, {freelancer.location?.country}</p>
                        </div>
                        <button onClick={handleContact} className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">Contact</button>
                    </div>

                    {showContactPopup && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                            <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-8 rounded-lg max-w-md w-full">
                                <h2 className="text-2xl font-serif text-[var(--color-accent)] mb-4">Contact Information</h2>
                                <p className="mb-2"><strong>Email:</strong> {freelancer.email || "Not provided"}</p>
                                <p className="mb-4"><strong>Phone:</strong> {freelancer.phone || "Not provided"}</p>
                                <button onClick={() => setShowContactPopup(false)} className="w-full bg-[var(--color-accent)] hover:opacity-80 text-white py-2 rounded">Close</button>
                            </div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {freelancer.linkedin && <a href={freelancer.linkedin} target="_blank" rel="noopener noreferrer" className="bg-[var(--bg-primary)] p-3 rounded border border-[var(--border-color)] text-center hover:border-[var(--color-accent)]">LinkedIn</a>}
                        {freelancer.otherLinks?.map((link, i) => link.value && <a key={i} href={link.value} target="_blank" rel="noopener noreferrer" className="bg-[var(--bg-primary)] p-3 rounded border border-[var(--border-color)] text-center hover:border-[var(--color-accent)] truncate" title={link.value}>Link {i+1}</a>)}
                    </div>

                    {freelancer.domains && freelancer.domains.length > 0 && (<div className="mb-8"><h3 className="text-xl font-semibold mb-2">Domains:</h3><div className="flex flex-wrap gap-2">{freelancer.domains.map(d => <span key={d} className="bg-[var(--bg-primary)] px-3 py-1 rounded-full text-sm border border-[var(--border-color)]">{d}</span>)}</div></div>)}

                    <div className="border-t border-[var(--border-color)] pt-6"><h2 className="text-2xl font-serif font-semibold text-[var(--color-accent)] mb-4">About</h2><p className="opacity-80 whitespace-pre-wrap leading-relaxed">{freelancer.bio || "No bio provided."}</p></div>
                </div>
            </div>
        </div>
    );
};

const PaymentPage = ({ setPage, user, profile, setProfile: setAppProfile }) => {
    const [paymentStatus, setPaymentStatus] = useState(profile?.hasPaidContactAccess ? 'paid' : 'pending');
    const [loading, setLoading] = useState(false);

    const handleMarkAsPaid = async () => {
        if (!user || !db) return;
        setLoading(true);
        try {
            const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'data');
            const publicProfileRef = doc(db, `artifacts/${appId}/public/data/profiles`, user.uid);

            await updateDoc(userProfileRef, { hasPaidContactAccess: true });
            await updateDoc(publicProfileRef, { hasPaidContactAccess: true }); // also update public for consistency if needed elsewhere

            setAppProfile(prev => ({ ...prev, hasPaidContactAccess: true }));
            setPaymentStatus('paid');
            alert("Thank you! Your access to contact details has been activated.");
        } catch (error) {
            console.error("Error marking as paid:", error);
            alert("There was an error activating your access. Please contact support.");
        }
        setLoading(false);
    };

    return (
    <div className="bg-[var(--bg-primary)] min-h-screen text-[var(--text-primary)] flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-xl p-8 text-center">
             <h1 className="text-3xl font-serif font-bold text-[var(--color-accent)] mb-4">Unlock Freelancer Contact Details</h1>
             <p className="opacity-80 mb-6">Make a one-time payment of <span className="font-bold text-white">$10 (or equivalent)</span> to get lifetime access to the contact details of all listed freelancers. This helps support the platform.</p>

            {paymentStatus === 'paid' ? (
                <div className="p-4 bg-green-800 bg-opacity-50 border border-green-600 rounded-md">
                    <p className="text-lg text-green-300 font-semibold">Your contact access is active!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="opacity-80">This is a placeholder for payment integration. For now, click below to simulate successful payment and activate your access.</p>
                    <button
                        onClick={handleMarkAsPaid}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg disabled:opacity-50"
                    >
                        {loading ? "Processing..." : "Simulate Payment ($10)"}
                    </button>
                </div>
            )}
             <button onClick={() => setPage('home')} className="mt-8 text-[var(--color-accent)] hover:underline">Back Home</button>
        </div>
    </div>
)};

const AdminDashboardPage = ({ setPage, user }) => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !db) return;
        setLoading(true);
        const q = query(collection(db, `artifacts/${appId}/public/data/profiles`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setProfiles(data);
            setLoading(false);
        }, (err) => { console.error(err); setLoading(false); });
        return () => unsubscribe();
    }, [user]);

    const updateStatus = async (id, status) => {
        await updateDoc(doc(db, `artifacts/${appId}/public/data/profiles`, id), { status });
        await updateDoc(doc(db, `artifacts/${appId}/users/${id}/profile`, 'data'), { status }, {merge: true});
    };

    const toggleChatAccess = async (id, currentAccess) => {
        await updateDoc(doc(db, `artifacts/${appId}/users/${id}/profile`, 'data'), { chatboxAccess: !currentAccess }, {merge: true});
    };

    if (loading) return <div className="bg-[var(--bg-primary)] min-h-screen text-[var(--text-primary)] flex justify-center items-center">Loading Admin Data...</div>;

    return (
    <div className="bg-[var(--bg-primary)] min-h-screen text-[var(--text-primary)] p-8">
        <div className="max-w-6xl mx-auto">
            <button onClick={() => setPage('home')} className="text-[var(--color-accent)] hover:underline mb-6">&larr; Back Home</button>
            <h1 className="text-3xl font-serif font-bold mb-6 text-[var(--color-accent)]">Admin Dashboard</h1>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-xl p-6">
                <h2 className="text-xl font-serif mb-4">User Profiles ({profiles.length})</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-[var(--bg-primary)]">
                            <tr><th className="px-4 py-2">Name/Email</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Roles</th><th className="px-4 py-2">Chat</th><th className="px-4 py-2">Actions</th></tr>
                        </thead>
                        <tbody>
                            {profiles.map(p => (
                                <tr key={p.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-primary)]">
                                    <td className="px-4 py-2">{p.name || 'N/A'}<br/><span className="opacity-70 text-xs">{p.email}</span></td>
                                    <td className="px-4 py-2">{p.status}</td>
                                    <td className="px-4 py-2">{p.roles?.lancer && 'L '}{p.roles?.client && 'C'}</td>
                                    <td className="px-4 py-2">{p.chatboxAccess ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-2 space-x-1">
                                        <select onChange={(e) => updateStatus(p.id, e.target.value)} value={p.status} className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-1 rounded text-xs">
                                            <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
                                        </select>
                                        <button onClick={() => toggleChatAccess(p.id, p.chatboxAccess)} className="bg-blue-600 p-1 rounded text-xs">Toggle Chat</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
)};

const ContactUsPage = ({ setPage }) => {
    const [submitted, setSubmitted] = useState(false);
    const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

    return (
        <div className="bg-[var(--bg-primary)] min-h-screen text-[var(--text-primary)] p-8">
            <div className="max-w-2xl mx-auto">
                <button onClick={() => setPage('home')} className="text-[var(--color-accent)] hover:underline mb-6">&larr; Back Home</button>
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-8 rounded-lg shadow-xl">
                    <h1 className="text-3xl font-serif font-bold mb-4">Contact Us</h1>
                    <p className="opacity-80 mb-6">Please fill the form with any bug reports, errors, feedback and suggestions, we will try our best to get back to you.</p>
                    {submitted ? (
                        <p className="text-center text-green-400 text-lg">Thank you! Your message has been sent.</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Your Name" required className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 rounded-md text-[var(--text-primary)]" />
                            <input type="email" placeholder="Your Email" required className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 rounded-md text-[var(--text-primary)]" />
                            <textarea placeholder="Your Message" rows="5" required className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 rounded-md text-[var(--text-primary)]"></textarea>
                            <button type="submit" className="w-full bg-[var(--color-accent)] hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg">Send Message</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

const TermsPage = ({ setPage }) => (
    <div className="bg-[var(--bg-primary)] min-h-screen text-[var(--text-primary)] p-8">
        <div className="max-w-4xl mx-auto">
            <button onClick={() => setPage('home')} className="text-[var(--color-accent)] hover:underline mb-6">&larr; Back Home</button>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-8 rounded-lg shadow-xl opacity-80 space-y-4">
                <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-4">Terms and Conditions</h1>
                <p><strong>Effective Date:</strong> July 1, 2025</p>
                <p>Welcome to Lancerpages.com. These terms and conditions outline the rules and regulations for the use of our website and services, located at Lancerpages.com. By accessing this website, we assume you accept these terms and conditions. Do not continue to use Lancerpages.com if you do not agree to all of the terms and conditions stated on this page.</p>
                <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] pt-2">1. The Service</h2>
                <p>Lancerpages.com provides an online directory where freelancers ("Lancers") can create profiles and clients ("Clients") can search for and connect with Lancers. We are a platform provider and are not a party to any agreement or transaction between Lancers and Clients.</p>
                <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] pt-2">2. User Accounts</h2>
                <p>To use certain features, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. You are responsible for safeguarding your password.</p>
                <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] pt-2">3. User Conduct</h2>
                <p>You agree not to use the Service to post or transmit any material which is defamatory, offensive, or of an obscene or menacing character, or that may cause annoyance, inconvenience, or needless anxiety. You are solely responsible for your interactions with other users.</p>
                <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] pt-2">6. Governing Law & Jurisdiction</h2>
                <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes relating to these terms and conditions will be subject to the exclusive jurisdiction of the courts of Pune, Maharashtra, India.</p>
            </div>
        </div>
    </div>
);

const PrivacyPolicyPage = ({ setPage }) => (
    <div className="bg-[var(--bg-primary)] min-h-screen text-[var(--text-primary)] p-8">
        <div className="max-w-4xl mx-auto">
            <button onClick={() => setPage('home')} className="text-[var(--color-accent)] hover:underline mb-6">&larr; Back Home</button>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-8 rounded-lg shadow-xl opacity-80 space-y-4">
                <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-4">Privacy Policy</h1>
                <p><strong>Effective Date:</strong> July 1, 2025</p>
                <p>Lancerpages.com ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by Lancerpages.com.</p>
                <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] pt-2">1. Information We Collect</h2>
                <p>We collect information you provide directly to us, such as when you create an account, create a profile, or communicate with us. This may include: name, email address, phone number (optional), location, and any other information you choose to provide in your bio or links.</p>
                <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] pt-2">2. How We Use Your Information</h2>
                <p>We use the information we collect to operate, maintain, and provide the features and functionality of the Service, including: displaying your profile in our directory, facilitating communication between Clients and Lancers, and processing payments for premium features.</p>
                <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] pt-2">5. Your Rights under GDPR</h2>
                <p>If you are a resident of the European Economic Area (EEA), you have certain data protection rights, including: <br/>- The right to access, update or delete the information we have on you.<br/>- The right of rectification.<br/>- The right to object.<br/>- The right of restriction.<br/>- The right to data portability.<br/>- The right to withdraw consent.</p>
            </div>
        </div>
    </div>
);

// --- Main App & Navigation ---

const RightSidebar = ({ user, profile, setPage }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const handleSignOut = async () => { await signOut(auth); setSidebarOpen(false); };

    return (
        <>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="fixed top-4 right-4 z-50 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full text-[var(--text-primary)] lg:hidden">
                <Menu size={24} />
            </button>
            <aside className={`fixed top-0 right-0 h-full bg-[var(--bg-primary)] bg-opacity-95 border-l border-[var(--border-color)] shadow-2xl z-40 p-6 flex flex-col space-y-4 transform transition-transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:w-64`}>
                <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-[var(--text-primary)] lg:hidden"><X size={24}/></button>
                <h2 className="text-2xl font-serif font-bold text-[var(--color-accent)]">Navigation</h2>
                <nav className="flex flex-col space-y-3 text-lg flex-grow">
                    <a href="#home" onClick={()=>setSidebarOpen(false)} className="text-[var(--text-primary)] opacity-80 hover:opacity-100 flex items-center"><ChevronsRight size={16} className="mr-2"/>Home</a>
                    <a href="#directory" onClick={()=>setSidebarOpen(false)} className="text-[var(--text-primary)] opacity-80 hover:opacity-100 flex items-center"><Search size={16} className="mr-2"/>Directory</a>
                    <a href="#chatbox" onClick={()=>setSidebarOpen(false)} className="text-[var(--text-primary)] opacity-80 hover:opacity-100 flex items-center"><MessageSquare size={16} className="mr-2"/>Chatbox</a>
                    {(!user || user.isAnonymous) && <a href="#login" onClick={()=>setSidebarOpen(false)} className="text-[var(--text-primary)] opacity-80 hover:opacity-100 flex items-center"><LogIn size={16} className="mr-2"/>Login</a>}
                </nav>
                <div className="border-t border-[var(--border-color)] pt-4 space-y-3">
                    {user && !user.isAnonymous && (<button onClick={() => setPage('profile')} className="w-full text-left text-[var(--text-primary)] opacity-80 hover:opacity-100 flex items-center"><User size={16} className="mr-2"/>My Profile</button>)}
                    {profile?.isAdmin && (<button onClick={() => setPage('admin')} className="w-full text-left text-yellow-400 hover:text-yellow-300 flex items-center"><Shield size={16} className="mr-2"/>Admin</button>)}
                    <button onClick={() => setPage('contact')} className="w-full text-left text-[var(--text-primary)] opacity-80 hover:opacity-100 flex items-center"><Mail size={16} className="mr-2"/>Contact</button>
                    <button onClick={() => setPage('terms')} className="w-full text-left text-[var(--text-primary)] opacity-80 hover:opacity-100 flex items-center"><FileText size={16} className="mr-2"/>Terms</button>
                    <button onClick={() => setPage('privacy')} className="w-full text-left text-[var(--text-primary)] opacity-80 hover:opacity-100 flex items-center"><Shield size={16} className="mr-2"/>Privacy</button>
                </div>
                {user && !user.isAnonymous && (<button onClick={handleSignOut} className="w-full text-left flex items-center text-red-400 hover:text-red-300 font-bold border-t border-[var(--border-color)] pt-4"><LogOut size={16} className="mr-2"/>Logout</button>)}
            </aside>
        </>
    );
};


const LandingPage = ({ user, profile, setPage, setSelectedProfileId, authReady }) => {
    return (
        <main className="lg:mr-64 bg-[var(--bg-primary)] pb-16">
            <HomePageBanner />
            <AuthSection user={user} setPage={setPage} />
            <ChatboxSection user={user} profile={profile} authReady={authReady}/>
            <DirectorySection setPage={setPage} setSelectedProfileId={setSelectedProfileId} authReady={authReady}/>
        </main>
    );
};

export default function App() {
    // Add font styles to the document head
    useEffect(() => {
        const fontLink = document.createElement('link');
        fontLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Sans+Pro:wght@300;400&display=swap";
        fontLink.rel = "stylesheet";
        document.head.appendChild(fontLink);

        const tailwindScript = document.createElement('script');
        tailwindScript.src = "https://cdn.tailwindcss.com";
        document.head.appendChild(tailwindScript);
    }, []);

    const [page, setPage] = useState('home');
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [selectedProfileId, setSelectedProfileId] = useState(null);

    useEffect(() => {
        const performAuth = async () => {
          try {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
            else await signInAnonymously(auth);
          } catch (error) { console.error("Firebase auth error:", error); }
        };
        performAuth();
        const unsubAuth = onAuthStateChanged(auth, u => { setUser(u); setAuthReady(true); });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        let unsubProfile = () => {};
        if (user && user.uid && !user.isAnonymous) {
            const profileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'data');
            unsubProfile = onSnapshot(profileRef, docSnap => setProfile(docSnap.exists() ? docSnap.data() : null));
        } else {
            setProfile(null);
        }
        return () => unsubProfile();
    }, [user]);

    if (!authReady) {
        return <div className="bg-black min-h-screen flex items-center justify-center text-white">Initializing...</div>;
    }

    const renderPage = () => {
        switch (page) {
            case 'profile': return <ProfilePage user={user} profile={profile} setPage={setPage} setProfile={setProfile} />;
            case 'admin': return <AdminDashboardPage setPage={setPage} />;
            case 'viewProfile': return <ViewProfilePage profileId={selectedProfileId} setPage={setPage} user={user} profile={profile} />;
            case 'payment': return <PaymentPage setPage={setPage} user={user} profile={profile} setProfile={setProfile} />;
            case 'contact': return <ContactUsPage setPage={setPage} />;
            case 'terms': return <TermsPage setPage={setPage} />;
            case 'privacy': return <PrivacyPolicyPage setPage={setPage} />;
            case 'home':
            default:
                return <LandingPage user={user} profile={profile} setPage={setPage} setSelectedProfileId={setSelectedProfileId} authReady={authReady} />;
        }
    };

    return (
        <>
            <style>{`
                :root {
                  --bg-primary: rgb(53, 53, 53);
                  --bg-secondary: rgb(40, 40, 40);
                  --text-primary: rgb(240, 214, 187);
                  --color-accent: rgb(160, 138, 127);
                  --border-color: rgb(80, 80, 80);
                }
                body {
                    font-family: 'Source Sans Pro', sans-serif;
                    font-weight: 300;
                    background-color: var(--bg-primary);
                    color: var(--text-primary);
                }
                h1, h2, h3, h4, h5, h6, .font-serif {
                    font-family: 'Playfair Display', serif;
                }
                .form-checkbox, .form-radio {
                    color: var(--color-accent);
                }
                .form-checkbox:focus, .form-radio:focus, select:focus, input:focus {
                    --tw-ring-color: var(--color-accent) !important;
                }
            `}</style>
            <div className="bg-[var(--bg-primary)]">
                <RightSidebar user={user} profile={profile} setPage={setPage} />
                {renderPage()}
                <div className="fixed bottom-0 left-0 right-0 z-40 lg:mr-64">
                    <GDPRBanner />
                    <BottomNavBar user={user} setPage={setPage} />
                </div>
            </div>
        </>
    );
}
