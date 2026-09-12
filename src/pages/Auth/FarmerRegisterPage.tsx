import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  Sprout, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Tractor, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  Mail,
  KeyRound,
  RotateCcw,
  Mic,
  Sparkles,
  Volume2
} from 'lucide-react';
import { VoiceFarmerSignupModal } from '../../components/common/VoiceFarmerSignupModal';

export const FarmerRegisterPage: React.FC = () => {
  const { registerFarmer, requestSignupOtp, signInWithGoogle } = useAuth();
  const { navigate, showToast, setProfile } = useApp();

  const queryParams = new URLSearchParams(window.location.search);
  const wasNotFoundInFirebase = queryParams.get('not_found') === '1';
  const prefillEmail = queryParams.get('email') || '';
  const initialVoiceMode = queryParams.get('voice') === '1' || queryParams.get('voice') === 'true';

  const [showVoiceModal, setShowVoiceModal] = useState(initialVoiceMode);
  const [listeningField, setListeningField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: prefillEmail,
    password: '',
    confirmPassword: '',
    address: '',
    village: '',
    mandal: '',
    district: 'NTR District',
    state: 'Andhra Pradesh',
    preferredLanguage: 'en',
    farmerId: '',
    landDetails: '',
    mainCrop: 'Paddy (Grade-A)',
    termsAccepted: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // OTP Verification Step state
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const [dispatchNotice, setDispatchNotice] = useState<string | null>(null);

  // Cooldown countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showOtpStep && resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showOtpStep, resendCooldown]);

  // Speech Recognition for individual fields
  const handleVoiceInputField = (field: string) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Speech recognition is not supported in this browser. Please use the Voice Assistant above.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'te-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      setListeningField(field);

      recognition.onresult = (e: any) => {
        const spoken = e.results[0][0].transcript || '';
        if (field === 'mobile') {
          const digits = spoken.replace(/\D/g, '');
          const cleanPhone = digits.length >= 10 ? digits.slice(-10) : digits;
          setFormData(prev => ({ 
            ...prev, 
            mobile: cleanPhone,
            email: prev.email || `${cleanPhone}@farmer.procureease.gov.in`
          }));
        } else if (field === 'otp') {
          const digits = spoken.replace(/\D/g, '');
          setOtpCode(digits.length >= 6 ? digits.slice(-6) : digits);
        } else if (field === 'landDetails') {
          const match = spoken.match(/\d+(\.\d+)?/);
          if (match) setFormData(prev => ({ ...prev, landDetails: match[0] }));
        } else if (field === 'name') {
          const clean = spoken.replace(/^(నా పేరు|my name is)/gi, '').trim();
          setFormData(prev => ({ ...prev, name: clean || spoken }));
        } else {
          setFormData(prev => ({ ...prev, [field]: spoken.trim() }));
        }
        setListeningField(null);
        showToast(`🎙️ నమోదు చేయబడింది: ${spoken}`);
      };

      recognition.onerror = () => setListeningField(null);
      recognition.onend = () => setListeningField(null);
      recognition.start();
    } catch (err) {
      console.warn('Voice input error:', err);
      setListeningField(null);
    }
  };

  const validate = (): string | null => {
    if (!formData.name.trim()) return 'Please enter your Full Name.';
    if (!formData.mobile.trim() || !/^\d{10}$/.test(formData.mobile.trim())) {
      return 'Please enter a valid 10-digit Mobile Number.';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return 'Please enter a valid Email address.';
    }
    if (!formData.password || formData.password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Password and Confirm Password do not match.';
    }
    if (!formData.village.trim()) return 'Please specify your Village.';
    if (!formData.mandal.trim()) return 'Please specify your Mandal / Taluk.';
    if (!formData.district.trim()) return 'Please specify your District.';
    if (!formData.state.trim()) return 'Please specify your State.';
    if (!formData.termsAccepted) return 'You must accept the Terms & Conditions to register.';
    return null;
  };

  // Trigger Email OTP Dispatch
  const handleInitiateSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSubmitting(true);
    const otpRes = await requestSignupOtp(formData.email);
    setSubmitting(false);

    if (otpRes.success) {
      if (otpRes.notice) {
        setDispatchNotice(otpRes.notice);
      }
      setShowOtpStep(true);
      setResendCooldown(60);
      showToast(`Verification OTP sent to ${formData.email}`);
    } else {
      setErrorMessage(otpRes.error || 'Failed to dispatch email verification code. Please check your email.');
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setSubmitting(true);
    setErrorMessage(null);
    const otpRes = await requestSignupOtp(formData.email);
    setSubmitting(false);
    if (otpRes.success) {
      if (otpRes.notice) setDispatchNotice(otpRes.notice);
      setResendCooldown(60);
      showToast('New verification code sent to your email.');
    } else {
      setErrorMessage(otpRes.error || 'Failed to resend OTP.');
    }
  };

  // Submit OTP & Finalize Registration
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification OTP code.');
      return;
    }

    setSubmitting(true);
    const result = await registerFarmer(
      {
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        village: formData.village,
        mandal: formData.mandal,
        district: formData.district,
        state: formData.state,
        preferredLanguage: formData.preferredLanguage,
        farmerId: formData.farmerId,
        landDetails: formData.landDetails,
        mainCrop: formData.mainCrop
      },
      cleanOtp
    );
    setSubmitting(false);

    if (result.success) {
      // Sync local profile in AppContext
      setProfile(prev => ({
        ...prev,
        name: formData.name,
        mobile: formData.mobile,
        village: formData.village,
        mandal: formData.mandal,
        district: formData.district,
        state: formData.state,
        landAcres: parseFloat(formData.landDetails) || prev.landAcres,
        surveyPassbookNo: formData.farmerId || prev.surveyPassbookNo
      }));

      showToast('Email verified successfully! Account created in Firebase.');
      navigate('/dashboard');
    } else {
      setErrorMessage(result.error || 'Invalid or expired OTP. Please try again.');
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage(null);
    setSubmitting(true);
    try {
      const result = await signInWithGoogle('farmer');
      setSubmitting(false);
      if (result.success) {
        showToast('Google account verified! Welcome to ProcureEase.');
        navigate('/dashboard');
      } else {
        setErrorMessage(result.error || 'Failed to sign in with Google.');
      }
    } catch (err: unknown) {
      setSubmitting(false);
      const e = err as { message?: string };
      setErrorMessage(e.message || 'An unexpected error occurred during Google sign-up.');
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-md shadow-emerald-900/20 mb-3">
              <Sprout className="w-7 h-7 text-emerald-300" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-heading">
              {showOtpStep ? 'Verify Your Email' : 'Create Farmer Account'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              ProcureEase • Official Farmer Procurement &amp; Scheduling
            </p>
          </div>

          {/* Not Found In Firebase Notice */}
          {wasNotFoundInFirebase && !showOtpStep && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-950 mb-0.5">Account Setup Required</p>
                <p className="leading-relaxed">
                  Your credentials were not found in Firebase. As per platform policy, please complete your registration below. A 6-digit OTP will be dispatched to your email for security verification.
                </p>
              </div>
            </div>
          )}

          {/* Error Message Box */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="flex-1 leading-relaxed">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* AI Voice Assistant Registration Banner (for uneducated / rural farmers) */}
          {!showOtpStep && (
            <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white shadow-xl relative overflow-hidden border border-emerald-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-lg">
                    <Mic className="w-6 h-6 text-emerald-950 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                        రైతు సదుపాయం (Voice Mode)
                      </span>
                      <span className="text-[11px] text-emerald-200 font-medium">చదువురాని వారి కోసం</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-black font-heading mt-1 text-white">
                      🎙️ మాట్లాడి స్టెప్-బై-స్టెప్ ఖాతా తెరవండి
                    </h3>
                    <p className="text-xs text-emerald-100/90 mt-0.5 leading-relaxed">
                      AI ప్రశ్నలు అడుగుతుంది (పేరు, మొబైల్, ఊరు, పంట). మీరు మైక్‌తో సమాధానం చెబితే సరిపోతుంది!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="start-voice-signup-hero-btn"
                  onClick={() => setShowVoiceModal(true)}
                  className="px-4 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl text-xs font-black shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-emerald-950" />
                  <span>వాయిస్ సహాయకుడు ప్రారంభించండి</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: EMAIL OTP VERIFICATION */}
          {showOtpStep ? (
            <form onSubmit={handleVerifyAndRegister} className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-800 mb-1">
                  <Mail className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  Verification Code Sent to:
                </p>
                <p className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 py-1 px-3 rounded-full inline-block">
                  {formData.email}
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Please enter the 6-digit one-time password to verify your email and authorize account creation.
                </p>
              </div>

              {/* Email Delivery Security Notice */}
              {dispatchNotice && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{dispatchNotice}</span>
                </div>
              )}

              {/* OTP Input with Microphone support */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    ENTER 6-DIGIT VERIFICATION CODE
                  </label>
                  <button
                    type="button"
                    onClick={() => handleVoiceInputField('otp')}
                    title="Speak 6-digit OTP code"
                    className={`p-1 rounded-md transition cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold ${
                      listeningField === 'otp'
                        ? 'bg-red-600 text-white animate-pulse px-2'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-2'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{listeningField === 'otp' ? 'వింటున్నాము...' : 'కోడ్ చెప్పండి (Speak OTP)'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full text-center text-3xl font-black font-mono tracking-widest py-3 px-12 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 outline-none bg-white text-slate-900"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleVoiceInputField('otp')}
                    title="Speak 6-digit OTP code"
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition cursor-pointer ${
                      listeningField === 'otp' ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-800 text-white hover:bg-emerald-900'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Resend & Back controls */}
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setShowOtpStep(false)}
                  className="text-slate-500 hover:text-slate-800 font-medium transition"
                >
                  ← Edit Registration Details
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || submitting}
                  className="text-emerald-800 font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>

              {/* Submit OTP */}
              <button
                type="submit"
                disabled={submitting || otpCode.length !== 6}
                className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-950/20 transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{submitting ? 'Verifying OTP & Creating Account...' : 'Confirm OTP & Activate Account'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* STEP 1: FILL IN FARMER REGISTRATION DETAILS */
            <>
              {/* Quick 1-Click Sign-up with Google */}
              <div className="mb-6">
                <button
                  type="button"
                  id="google-signup-btn"
                  onClick={handleGoogleSignUp}
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 hover:border-slate-400 text-slate-800 font-semibold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2.5 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.64-5.2 3.64-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.13 0-5.78-2.11-6.73-4.96H1.23v3.13C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.63H1.23C.44 8.24 0 10.06 0 12s.44 3.76 1.23 5.37l4.04-3.13z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.23 6.63l4.04 3.13c.95-2.85 3.6-4.96 6.73-4.96z"
                    />
                  </svg>
                  <span>Instant Sign up with Google</span>
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-slate-400 font-medium">
                      or register with official form &amp; email OTP
                    </span>
                  </div>
                </div>
              </div>

              {/* Farmer Sign-up Form */}
              <form onSubmit={handleInitiateSignup} className="space-y-4">
                {/* Personal Information */}
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-800" />
                    Personal &amp; Contact Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Full Name *
                        </label>
                        <button
                          type="button"
                          onClick={() => handleVoiceInputField('name')}
                          title="Speak full name"
                          className={`p-1 rounded-md transition cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold ${
                            listeningField === 'name' ? 'bg-red-600 text-white animate-pulse px-1.5' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-1.5'
                          }`}
                        >
                          <Mic className="w-3 h-3" />
                          <span>{listeningField === 'name' ? 'వింటున్నాము...' : 'మాట్లాడండి'}</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-700 outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Mobile Number (10 Digits) *
                        </label>
                        <button
                          type="button"
                          onClick={() => handleVoiceInputField('mobile')}
                          title="Speak phone number"
                          className={`p-1 rounded-md transition cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold ${
                            listeningField === 'mobile' ? 'bg-red-600 text-white animate-pulse px-1.5' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-1.5'
                          }`}
                        >
                          <Mic className="w-3 h-3" />
                          <span>{listeningField === 'mobile' ? 'వింటున్నాము...' : 'ఫోన్ చెప్పండి'}</span>
                        </button>
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                        placeholder="9848012345"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-700 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Email Address (For OTP Verification) *
                      </label>
                      <button
                        type="button"
                        onClick={() => handleVoiceInputField('email')}
                        title="Speak email"
                        className={`p-1 rounded-md transition cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold ${
                          listeningField === 'email' ? 'bg-red-600 text-white animate-pulse px-1.5' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-1.5'
                        }`}
                      >
                        <Mic className="w-3 h-3" />
                        <span>ఇమెయిల్ చెప్పండి</span>
                      </button>
                    </div>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ramesh.farmer@example.com"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-700 outline-none"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      A 6-digit security OTP will be sent to this email address to activate your account.
                    </p>
                  </div>
                </div>

                {/* Password Credentials */}
                <div className="pt-2 border-t border-slate-100">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-800" />
                    Security Credentials
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Account Password (min. 6 chars) *
                        </label>
                        <button
                          type="button"
                          onClick={() => handleVoiceInputField('password')}
                          title="Speak password or 6-digit PIN"
                          className={`p-1 rounded-md transition cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold ${
                            listeningField === 'password' ? 'bg-red-600 text-white animate-pulse px-1.5' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-1.5'
                          }`}
                        >
                          <Mic className="w-3 h-3" />
                          <span>పిన్ చెప్పండి</span>
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2 pr-10 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-700 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2 pr-10 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-700 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="pt-2 border-t border-slate-100">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                    Residential &amp; Revenue Jurisdiction
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Village *
                        </label>
                        <button
                          type="button"
                          onClick={() => handleVoiceInputField('village')}
                          title="Speak village"
                          className={`p-1 rounded-md transition cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold ${
                            listeningField === 'village' ? 'bg-red-600 text-white animate-pulse px-1.5' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-1.5'
                          }`}
                        >
                          <Mic className="w-3 h-3" />
                          <span>ఊరు చెప్పండి</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.village}
                        onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                        placeholder="e.g. Velvadam"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-700 outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Mandal / Taluk *
                        </label>
                        <button
                          type="button"
                          onClick={() => handleVoiceInputField('mandal')}
                          title="Speak mandal"
                          className={`p-1 rounded-md transition cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold ${
                            listeningField === 'mandal' ? 'bg-red-600 text-white animate-pulse px-1.5' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-1.5'
                          }`}
                        >
                          <Mic className="w-3 h-3" />
                          <span>మండలం</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.mandal}
                        onChange={(e) => setFormData({ ...formData, mandal: e.target.value })}
                        placeholder="e.g. Mylavaram"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-700 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        District *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder="NTR District"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-700 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="Andhra Pradesh"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-700 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Agricultural Particulars */}
                <div className="pt-2 border-t border-slate-100">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Tractor className="w-3.5 h-3.5 text-emerald-800" />
                    Agricultural &amp; Crop Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Survey / Pattadar Passbook No.
                      </label>
                      <input
                        type="text"
                        value={formData.farmerId}
                        onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                        placeholder="AP/NTR/2026/8812"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-700 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Cultivated Land (Acres)
                        </label>
                        <button
                          type="button"
                          onClick={() => handleVoiceInputField('landDetails')}
                          title="Speak acres"
                          className={`p-1 rounded-md transition cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold ${
                            listeningField === 'landDetails' ? 'bg-red-600 text-white animate-pulse px-1.5' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-1.5'
                          }`}
                        >
                          <Mic className="w-3 h-3" />
                          <span>ఎకరాలు</span>
                        </button>
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.landDetails}
                        onChange={(e) => setFormData({ ...formData, landDetails: e.target.value })}
                        placeholder="e.g. 5.5"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-700 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Primary Crop
                      </label>
                      <select
                        value={formData.mainCrop}
                        onChange={(e) => setFormData({ ...formData, mainCrop: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-700 outline-none bg-white"
                      >
                        <option value="Paddy (Grade-A)">Paddy (Grade-A)</option>
                        <option value="Paddy (Common)">Paddy (Common)</option>
                        <option value="Wheat">Wheat</option>
                        <option value="Maize">Maize</option>
                        <option value="Groundnut">Groundnut</option>
                        <option value="Cotton">Cotton</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-800 focus:ring-emerald-600 mt-0.5"
                    />
                    <span>
                      I declare that the agricultural information and landholding credentials provided above are accurate as per state land registry records, and I consent to email OTP verification.
                    </span>
                  </label>
                </div>

                {/* Next Button: Dispatches OTP */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-950/20 transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <span>{submitting ? 'Sending Email OTP...' : 'Send Verification OTP to Email'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Footer Link */}
              <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
                <span>Already have an account? </span>
                <button
                  onClick={() => navigate('/login')}
                  className="font-bold text-emerald-800 hover:underline cursor-pointer"
                >
                  Farmer Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Step-by-Step AI Farmer Voice Registration Assistant */}
      <VoiceFarmerSignupModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onSuccess={(registered) => {
          setFormData(prev => ({
            ...prev,
            name: registered.name || prev.name,
            mobile: registered.mobile || prev.mobile,
            email: registered.email || prev.email,
            village: registered.village || prev.village,
            mandal: registered.mandal || prev.mandal,
            district: registered.district || prev.district,
            mainCrop: registered.crop || prev.mainCrop,
            landDetails: registered.landDetails || prev.landDetails,
            farmerId: registered.farmerId || prev.farmerId
          }));
        }}
      />
    </div>
  );
};
