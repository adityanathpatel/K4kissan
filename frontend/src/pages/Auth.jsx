import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Mail, Lock, User, UserCheck, Eye, EyeOff,
    ArrowRight, CheckCircle2
} from 'lucide-react';

// ─── Constants (outside component — stable) ────────────────────────────────────
const ROLES = [
    { value: 'Farmer',      label: 'Farmer (किसान / उत्पादक)',               emoji: '🌾' },
    { value: 'Buyer',       label: 'Buyer (क्रेता / थोक व्यापारी)',           emoji: '🏪' },
    { value: 'Transporter', label: 'Transporter (ट्रांसपोर्टर / वाहन मालिक)', emoji: '🚛' },
];

// ─── Shared sub-components defined OUTSIDE Auth so they are stable ─────────────
// ⚠️ NEVER define components inside another component — causes focus loss on every keystroke

function PasswordStrengthBar({ password }) {
    const checks = {
        len:     password.length >= 8,
        upper:   /[A-Z]/.test(password),
        num:     /[0-9]/.test(password),
    };
    const score = Object.values(checks).filter(Boolean).length;
    const color = score === 0 ? 'bg-gray-200' : score === 1 ? 'bg-red-400' : score === 2 ? 'bg-amber-400' : 'bg-emerald-500';
    const label = score === 0 ? '' : score === 1 ? 'Weak' : score === 2 ? 'Fair' : 'Strong';

    return password.length > 0 ? (
        <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${(score / 3) * 100}%` }} />
            </div>
            <span className={`text-[11px] font-bold ${score === 3 ? 'text-emerald-600' : score === 2 ? 'text-amber-600' : 'text-red-500'}`}>{label}</span>
        </div>
    ) : null;
}

function RoleSelect({ value, onChange }) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Select Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-700">
                    <UserCheck size={16} />
                </div>
                <select
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 text-sm font-semibold bg-emerald-50 border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-emerald-950 transition cursor-pointer appearance-none"
                >
                    {ROLES.map(r => (
                        <option key={r.value} value={r.value}>{r.emoji} {r.label}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-emerald-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

// ─── Main Auth Component ────────────────────────────────────────────────────────
const Auth = () => {
    const [authMode, setAuthMode] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('Farmer');

    const navigate = useNavigate();
    const { signIn, signUp } = useAuth();

    // Auto-fill last used email / role
    useEffect(() => {
        const cachedEmail = localStorage.getItem('last_user_email') || '';
        const cachedRole  = localStorage.getItem('selected_role') || 'Farmer';
        if (cachedEmail) setEmail(cachedEmail);
        if (cachedRole)  setRole(cachedRole);
    }, []);

    const pwValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

    const redirectAfterLogin = (loggedRole) => {
        const nextRole = loggedRole || role;
        localStorage.setItem('selected_role', nextRole);
        if (nextRole === 'Farmer') navigate('/farmer-dashboard');
        else if (nextRole === 'Buyer') navigate('/products');
        else if (nextRole === 'Transporter') navigate('/map');
        else navigate('/');
    };

    const redirectToKyc = (r) => {
        localStorage.setItem('selected_role', r);
        if (r === 'Farmer') window.location.href = '/farmer-register.html';
        else if (r === 'Buyer') window.location.href = '/buyer-register.html';
        else window.location.href = '/transporter-register.html';
    };

    const formatAuthError = (err) => {
        if (!err) return 'Authentication failed.';
        const msg = typeof err === 'string' ? err : `${err.code || ''} ${err.message || ''}`;
        if (
            msg.includes('auth/invalid-credential') ||
            msg.includes('auth/wrong-password') ||
            msg.includes('auth/user-not-found') ||
            msg.includes('invalid-credential')
        ) {
            return 'Incorrect email or password.';
        }
        if (msg.includes('auth/email-already-in-use')) {
            return 'An account with this email already exists.';
        }
        if (msg.includes('auth/invalid-email')) {
            return 'Please enter a valid email address.';
        }
        if (msg.includes('auth/too-many-requests')) {
            return 'Too many failed attempts. Please try again later.';
        }
        if (msg.includes('auth/weak-password')) {
            return 'Password should be at least 6 characters.';
        }
        if (msg.includes('auth/network-request-failed')) {
            return 'Network error. Please check your internet connection.';
        }
        return (err.message || String(err)).replace(/^Firebase:\s*Error\s*\((.*?)\)\.?/i, '$1');
    };

    // ── Login ──────────────────────────────────────────────────────────────────
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email.trim())    { setError('Please enter your email.'); return; }
        if (!password.trim()) { setError('Please enter your password.'); return; }
        setLoading(true);
        setError('');
        try {
            localStorage.setItem('last_user_email', email);
            const res = await signIn(email, password);
            if (res?.error) {
                setError(formatAuthError(res.error));
            } else {
                redirectAfterLogin(res.role || role);
            }
        } catch (err) {
            setError(formatAuthError(err));
        } finally {
            setLoading(false);
        }
    };

    // ── Demo Login Helper ──────────────────────────────────────────────────────
    const handleDemoLogin = async (demoRole, demoEmail) => {
        setAuthMode('login');
        setRole(demoRole);
        setEmail(demoEmail);
        setPassword('Password123');
        setLoading(true);
        setError('');
        try {
            localStorage.setItem('last_user_email', demoEmail);
            const res = await signIn(demoEmail, 'Password123');
            if (res?.error) {
                setError(formatAuthError(res.error));
            } else {
                redirectAfterLogin(res.role || demoRole);
            }
        } catch (err) {
            setError(formatAuthError(err));
        } finally {
            setLoading(false);
        }
    };

    // ── Signup ─────────────────────────────────────────────────────────────────
    const handleSignup = async (e) => {
        e.preventDefault();
        if (!fullName.trim()) { setError('Please enter your full name.'); return; }
        if (!pwValid)         { setError('Password must be ≥8 chars with 1 uppercase & 1 number.'); return; }
        setLoading(true);
        setError('');
        try {
            localStorage.setItem('last_user_email', email);
            const res = await signUp(email, password, { full_name: fullName, role });
            if (res?.error) {
                setError(formatAuthError(res.error));
            } else {
                redirectToKyc(role);
            }
        } catch (err) {
            setError(formatAuthError(err));
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (mode) => {
        setAuthMode(mode);
        setError('');
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 bg-slate-50">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

                {/* Brand Banner */}
                <div className="bg-gradient-to-r from-emerald-800 to-green-700 text-white p-6 text-center relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
                    <img src="/images/k4kissan-logo.svg" alt="K4kissan" className="h-10 mx-auto mb-2 filter brightness-0 invert" onError={e => e.target.style.display='none'} />
                    <h1 className="text-xl font-bold tracking-tight text-white">
                        {authMode === 'login' ? 'Welcome Back 👋' : 'Join K4kissan 🌾'}
                    </h1>
                    <p className="text-xs text-emerald-100 mt-1">
                        {authMode === 'login'
                            ? 'Sign in to access your portal'
                            : 'Create your farmer / buyer / transporter account'}
                    </p>

                    {/* Tab Toggle */}
                    <div className="flex items-center justify-center mt-4">
                        <div className="inline-flex bg-white/10 rounded-full p-0.5 gap-0.5 border border-white/20">
                            {['login', 'signup'].map(mode => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => switchMode(mode)}
                                    className={`px-5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${authMode === mode ? 'bg-white text-emerald-800 shadow' : 'text-white/80 hover:text-white'}`}
                                >
                                    {mode === 'login' ? 'Log In' : 'Sign Up'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-6 sm:p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4">

                        {/* Full Name — signup only */}
                        {authMode === 'signup' && (
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <User size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        autoComplete="name"
                                        value={fullName}
                                        onChange={e => { setFullName(e.target.value); setError(''); }}
                                        className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-800 transition"
                                        placeholder="e.g. Ramesh Kumar Patel"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={16} />
                                </div>
                                <input
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={e => { setEmail(e.target.value); setError(''); }}
                                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-800 transition"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                <span>Password <span className="text-red-500">*</span></span>
                                {authMode === 'login' && (
                                    <button
                                        type="button"
                                        onClick={() => alert('Password reset link will be sent to your registered email.')}
                                        className="text-[11px] text-blue-500 hover:underline font-normal normal-case cursor-pointer"
                                    >Forgot?</button>
                                )}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); setError(''); }}
                                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-800 transition font-mono"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(s => !s)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {authMode === 'signup' && <PasswordStrengthBar password={password} />}
                        </div>

                        {/* Role */}
                        <RoleSelect value={role} onChange={setRole} />

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || (authMode === 'signup' && !pwValid)}
                            className={`w-full py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                                authMode === 'login'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                    {authMode === 'login' ? 'Signing In...' : 'Creating Account...'}
                                </span>
                            ) : authMode === 'login' ? (
                                <><span>Sign In to Portal</span><ArrowRight size={16} /></>
                            ) : (
                                <><CheckCircle2 size={16} /><span>Create Account & Proceed</span></>
                            )}
                        </button>
                    </form>

                    {/* Quick Demo Login Section */}
                    {authMode === 'login' && (
                        <div className="mt-6 border-t border-gray-100 pt-5">
                            <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Demo Login</p>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleDemoLogin('Farmer', 'farmer_demo@test.com')}
                                    className="px-2 py-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition"
                                >
                                    <span className="text-lg">🌾</span> Farmer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDemoLogin('Buyer', 'buyer_demo@test.com')}
                                    className="px-2 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition"
                                >
                                    <span className="text-lg">🏪</span> Buyer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDemoLogin('Transporter', 'transporter_demo@test.com')}
                                    className="px-2 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition"
                                >
                                    <span className="text-lg">🚛</span> Transporter
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Switch mode banner */}
                    <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-sm">
                        {authMode === 'login' ? (
                            <>
                                <span className="text-gray-600">New to K4kissan?</span>
                                <button onClick={() => switchMode('signup')} className="font-semibold text-emerald-700 hover:text-emerald-800 underline ml-2 whitespace-nowrap cursor-pointer">
                                    Sign Up Here →
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="text-gray-600">Already have an account?</span>
                                <button onClick={() => switchMode('login')} className="font-semibold text-emerald-700 hover:text-emerald-800 underline ml-2 whitespace-nowrap cursor-pointer">
                                    Log In Instead →
                                </button>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Auth;
