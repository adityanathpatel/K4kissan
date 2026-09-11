import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Smartphone, ShieldCheck, CheckCircle2, X, ArrowRight } from 'lucide-react';

const STORAGE_KEY = 'location_verified';
const PHONE_KEY   = 'verified_phone';

/**
 * LocationVerificationModal
 *
 * Shows a one-time OTP gate before a user can assign/edit a delivery address.
 * Once verified, writes `location_verified = 'true'` to localStorage so the
 * modal is never shown again on subsequent visits.
 *
 * Props:
 *   onVerified  — callback invoked after successful verification
 *   onDismiss   — callback if user explicitly closes (optional)
 */
export default function LocationVerificationModal({ onVerified, onDismiss }) {
    const [step, setStep]           = useState('phone');   // 'phone' | 'otp' | 'success'
    const [phone, setPhone]         = useState('');
    const [otp, setOtp]             = useState(['', '', '', '', '', '']);
    const [sending, setSending]     = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError]         = useState('');
    const [countdown, setCountdown] = useState(0);

    const otpRefs = useRef([]);

    // Pre-fill phone from localStorage (set during login)
    useEffect(() => {
        const stored = localStorage.getItem('user_identifier') || '';
        // Only pre-fill if it looks like a phone number
        if (/^\d/.test(stored)) setPhone(stored);
    }, []);

    // Countdown timer for resend cooldown
    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    // ── Send OTP ──────────────────────────────────────────────────────────
    const handleSendOtp = async (e) => {
        e.preventDefault();
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length < 10) {
            setError('Please enter a valid 10-digit phone number.');
            return;
        }
        setSending(true);
        setError('');
        try {
            // Simulated OTP dispatch (replace with real SMS/WhatsApp API)
            await new Promise(r => setTimeout(r, 800));
            setStep('otp');
            setCountdown(30);
            // Auto-focus first OTP box
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } catch {
            setError('Failed to send OTP. Please try again.');
        } finally {
            setSending(false);
        }
    };

    // ── OTP digit change ──────────────────────────────────────────────────
    const handleOtpChange = (idx, val) => {
        if (!/^\d?$/.test(val)) return;
        const next = [...otp];
        next[idx] = val;
        setOtp(next);
        setError('');
        if (val && idx < 5) {
            otpRefs.current[idx + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (idx, e) => {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
            otpRefs.current[idx - 1]?.focus();
        }
    };

    // Paste support
    const handleOtpPaste = (e) => {
        e.preventDefault();
        const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (digits.length === 6) {
            setOtp(digits.split(''));
            otpRefs.current[5]?.focus();
        }
    };

    // ── Verify OTP ────────────────────────────────────────────────────────
    const handleVerify = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            setError('Please enter all 6 digits of the OTP.');
            return;
        }
        setVerifying(true);
        setError('');
        try {
            // Simulated verification — any 6-digit code passes
            await new Promise(r => setTimeout(r, 900));
            // Persist verified state
            localStorage.setItem(STORAGE_KEY, 'true');
            localStorage.setItem(PHONE_KEY, phone.replace(/\D/g, ''));
            setStep('success');
            // Hand off after brief success animation
            setTimeout(() => { if (onVerified) onVerified(); }, 1200);
        } catch {
            setError('Verification failed. Please try again.');
        } finally {
            setVerifying(false);
        }
    };

    // ── Resend OTP ────────────────────────────────────────────────────────
    const handleResend = async () => {
        if (countdown > 0) return;
        setSending(true);
        setError('');
        setOtp(['', '', '', '', '', '']);
        try {
            await new Promise(r => setTimeout(r, 600));
            setCountdown(30);
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } catch {
            setError('Failed to resend OTP.');
        } finally {
            setSending(false);
        }
    };

    return (
        /* ── Backdrop ── */
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="loc-modal-title"
        >
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

                {/* ── Dismiss button ── */}
                {onDismiss && step !== 'success' && (
                    <button
                        onClick={onDismiss}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition z-10"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                )}

                {/* ── Header strip ── */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                            <MapPin size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 id="loc-modal-title" className="text-base font-extrabold leading-tight">
                                Location Verification Required
                            </h2>
                            <p className="text-xs text-blue-100 mt-0.5">
                                One-time OTP to validate your operational area
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-6">

                    {/* ── SUCCESS ── */}
                    {step === 'success' && (
                        <div className="flex flex-col items-center gap-3 py-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center animate-bounce-once">
                                <CheckCircle2 size={36} className="text-emerald-500" />
                            </div>
                            <p className="text-base font-bold text-gray-800">Location Verified!</p>
                            <p className="text-xs text-gray-500">
                                Your area has been confirmed. You won't be asked again.
                            </p>
                        </div>
                    )}

                    {/* ── STEP: PHONE ── */}
                    {step === 'phone' && (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                To assign a delivery address, we need to verify your phone number once via OTP (SMS / WhatsApp).
                            </p>

                            <div>
                                <label htmlFor="loc-phone" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Mobile Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500">
                                        <Smartphone size={15} />
                                    </div>
                                    <input
                                        id="loc-phone"
                                        type="tel"
                                        inputMode="numeric"
                                        value={phone}
                                        onChange={e => { setPhone(e.target.value); setError(''); }}
                                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        placeholder="Enter 10-digit mobile number"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-xs text-red-600 font-medium">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 text-white py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                            >
                                {sending ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4" strokeLinecap="round"/>
                                        </svg>
                                        Sending OTP…
                                    </>
                                ) : (
                                    <>Send OTP <ArrowRight size={15} /></>
                                )}
                            </button>
                        </form>
                    )}

                    {/* ── STEP: OTP ── */}
                    {step === 'otp' && (
                        <form onSubmit={handleVerify} className="space-y-5">
                            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-800">
                                <Smartphone size={14} className="mt-0.5 shrink-0 text-blue-500" />
                                <span>
                                    OTP sent to <strong>{phone}</strong> via SMS/WhatsApp.
                                    <button
                                        type="button"
                                        onClick={() => { setStep('phone'); setOtp(['','','','','','']); setError(''); }}
                                        className="ml-1 underline text-blue-600 hover:text-blue-800"
                                    >
                                        Change
                                    </button>
                                </span>
                            </div>

                            {/* 6-box OTP input */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Enter 6-Digit OTP
                                </label>
                                <div className="flex items-center gap-2" onPaste={handleOtpPaste}>
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={el => otpRefs.current[idx] = el}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={e => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={e => handleOtpKeyDown(idx, e)}
                                            className={`
                                                w-10 h-12 text-center text-lg font-bold rounded-xl border-2 outline-none
                                                transition-all duration-100
                                                ${digit
                                                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                                                    : 'border-gray-200 bg-gray-50 text-gray-800'
                                                }
                                                focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200
                                            `}
                                            aria-label={`OTP digit ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1.5">
                                    Didn't receive?{' '}
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={countdown > 0 || sending}
                                        className={`font-semibold transition ${countdown > 0 ? 'text-gray-400' : 'text-blue-600 hover:underline'}`}
                                    >
                                        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                                    </button>
                                </p>
                            </div>

                            {error && (
                                <p className="text-xs text-red-600 font-medium">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={verifying || otp.join('').length < 6}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60 text-white py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                            >
                                {verifying ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4" strokeLinecap="round"/>
                                        </svg>
                                        Verifying…
                                    </>
                                ) : (
                                    <><ShieldCheck size={15} /> Verify &amp; Assign Location</>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* ── Footer note ── */}
                {step !== 'success' && (
                    <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 flex items-center gap-1.5 text-[11px] text-gray-400">
                        <ShieldCheck size={12} className="text-emerald-500 shrink-0" />
                        This is a one-time check. Future transactions will skip this step.
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Helper: returns true if the user has already verified their location.
 * Import and call this wherever you need to gate location-dependent actions.
 */
export function isLocationVerified() {
    return localStorage.getItem(STORAGE_KEY) === 'true';
}
