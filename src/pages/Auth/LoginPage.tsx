import React, { useState, useEffect } from 'react';
import { useAuth, RegisterStaffData, RegisterAdminData } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { mockCentres } from '../../data/mockData';
import { 
  Sprout, 
  Building2, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle,
  X,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Mail,
  UserPlus,
  ArrowRight,
  RotateCcw,
  Clock,
  Smartphone,
  Lock,
  Shield,
  Mic,
  Volume2,
  Sparkles
} from 'lucide-react';
import { VoiceTokenBookingModal } from '../../components/common/VoiceTokenBookingModal';
import { VoiceFarmerSignupModal } from '../../components/common/VoiceFarmerSignupModal';

type RoleType = 'farmer' | 'staff' | 'admin';

interface LoginPageProps {
  initialRole?: RoleType;
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialRole }) => {
  const { 
    loginFarmer, 
    requestLoginOtp,
    verifyLoginOtp,
    loginStaff, 
    verifyStaffLoginOtp, 
    registerStaff, 
    requestStaffSignupOtp,
    registerStaffWithOtp,
    loginAdmin, 
    verifyAdminLoginOtp,
    requestAdminSignupOtp,
    registerAdminWithOtp,
    sendResetEmail, 
    signInWithGoogle 
  } = useAuth();
  const { navigate, showToast } = useApp();

  // Role selection state (Farmer selected by default)
  const [selectedRole, setSelectedRole] = useState<RoleType>(() => {
    if (initialRole) return initialRole;
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam === 'staff' || roleParam === 'admin') return roleParam;
    return 'farmer';
  });

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login Mode: Password vs OTP Verification
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtpCode, setLoginOtpCode] = useState('');
  const [loginOtpTimer, setLoginOtpTimer] = useState(60);
  const [loginOtpNotice, setLoginOtpNotice] = useState<string | null>(null);
  const [loginOtpResolvedEmail, setLoginOtpResolvedEmail] = useState('');

  // User/Farmer Not Found in Firebase state
  const [farmerNotFound, setFarmerNotFound] = useState(false);

  // Staff Login with Mandatory OTP state
  const [staffRequiresOtp, setStaffRequiresOtp] = useState(false);
  const [staffEmailForOtp, setStaffEmailForOtp] = useState('');
  const [staffOtpCode, setStaffOtpCode] = useState('');
  const [staffOtpTimer, setStaffOtpTimer] = useState(60);
  const [staffOtpNotice, setStaffOtpNotice] = useState<string | null>(null);
  const [staffNotFound, setStaffNotFound] = useState(false);
  const [staffPendingApproval, setStaffPendingApproval] = useState(false);

  // Admin Login with 2FA OTP state
  const [adminRequiresOtp, setAdminRequiresOtp] = useState(false);
  const [adminEmailForOtp, setAdminEmailForOtp] = useState('');
  const [adminOtpCode, setAdminOtpCode] = useState('');
  const [adminOtpTimer, setAdminOtpTimer] = useState(60);
  const [adminOtpNotice, setAdminOtpNotice] = useState<string | null>(null);

  // Voice Token Booking for Illiterate / Rural Farmers
  const [showVoiceBookingModal, setShowVoiceBookingModal] = useState(false);
  const [showVoiceSignupModal, setShowVoiceSignupModal] = useState(false);
  const [isListeningForIdentifier, setIsListeningForIdentifier] = useState(false);

  // Quick Speech-to-Text for Farmer Phone Number / Email Field
  const handleVoiceInputIdentifier = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setShowVoiceBookingModal(true);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'te-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListeningForIdentifier(true);
      recognition.onresult = (e: any) => {
        const spoken = e.results[0][0].transcript;
        const digits = spoken.replace(/\D/g, '');
        if (digits.length >= 10) {
          setIdentifier(digits.slice(-10));
        } else {
          setIdentifier(spoken.trim());
        }
        setIsListeningForIdentifier(false);
        showToast(`వాయిస్ ద్వారా నమోదు చేయబడింది: ${spoken}`);
      };
      recognition.onerror = () => setIsListeningForIdentifier(false);
      recognition.onend = () => setIsListeningForIdentifier(false);
      recognition.start();
    } catch {
      setIsListeningForIdentifier(false);
    }
  };

  // Staff Sign-Up Modal state with OTP verification
  const [showStaffSignupModal, setShowStaffSignupModal] = useState(false);
  const [staffSignupStep, setStaffSignupStep] = useState<'form' | 'otp'>('form');
  const [staffSignupOtp, setStaffSignupOtp] = useState('');
  const [staffSignupOtpTimer, setStaffSignupOtpTimer] = useState(60);
  const [staffSignupOtpNotice, setStaffSignupOtpNotice] = useState<string | null>(null);
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeCode: '',
    centreId: 'CTR-01',
    centreName: 'Mylavaram APMC Centre',
    designation: 'APMC Weighbridge & Inspection Officer',
    password: '',
    confirmPassword: ''
  });
  const [staffSignupSubmitting, setStaffSignupSubmitting] = useState(false);
  const [staffSignupError, setStaffSignupError] = useState<string | null>(null);
  const [staffSignupSuccess, setStaffSignupSuccess] = useState(false);

  // Admin Sign-Up Modal state with OTP verification
  const [showAdminSignupModal, setShowAdminSignupModal] = useState(false);
  const [adminSignupStep, setAdminSignupStep] = useState<'form' | 'otp'>('form');
  const [adminSignupOtp, setAdminSignupOtp] = useState('');
  const [adminSignupOtpTimer, setAdminSignupOtpTimer] = useState(60);
  const [adminSignupOtpNotice, setAdminSignupOtpNotice] = useState<string | null>(null);
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Food & Civil Supplies',
    designation: 'APMC Administrative Officer',
    password: '',
    confirmPassword: ''
  });
  const [adminSignupSubmitting, setAdminSignupSubmitting] = useState(false);
  const [adminSignupError, setAdminSignupError] = useState<string | null>(null);
  const [adminSignupSuccess, setAdminSignupSuccess] = useState(false);
  const [adminSignupPending, setAdminSignupPending] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // OTP Timer countdowns
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (staffRequiresOtp && staffOtpTimer > 0) {
      interval = setInterval(() => setStaffOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [staffRequiresOtp, staffOtpTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loginOtpSent && loginOtpTimer > 0) {
      interval = setInterval(() => setLoginOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [loginOtpSent, loginOtpTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (staffSignupStep === 'otp' && staffSignupOtpTimer > 0) {
      interval = setInterval(() => setStaffSignupOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [staffSignupStep, staffSignupOtpTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (adminRequiresOtp && adminOtpTimer > 0) {
      interval = setInterval(() => setAdminOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [adminRequiresOtp, adminOtpTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (adminSignupStep === 'otp' && adminSignupOtpTimer > 0) {
      interval = setInterval(() => setAdminSignupOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [adminSignupStep, adminSignupOtpTimer]);

  const handleRoleChange = (role: RoleType) => {
    setSelectedRole(role);
    setErrorMessage(null);
    setFarmerNotFound(false);
    setStaffNotFound(false);
    setStaffPendingApproval(false);
    setStaffRequiresOtp(false);
    setAdminRequiresOtp(false);
    setLoginOtpSent(false);
    setLoginOtpCode('');
    setLoginOtpNotice(null);
    setIdentifier('');
    setPassword('');
  };

  // Dispatch Login OTP
  const handleRequestLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFarmerNotFound(false);
    setStaffNotFound(false);
    setStaffPendingApproval(false);

    const trimmedId = identifier.trim();
    if (!trimmedId) {
      setErrorMessage(
        selectedRole === 'farmer' 
          ? 'Please enter your registered email or 10-digit mobile number.'
          : selectedRole === 'staff'
          ? 'Please enter your official staff email.'
          : 'Please enter your Apex Admin email.'
      );
      return;
    }

    setSubmitting(true);
    const res = await requestLoginOtp(trimmedId, selectedRole);
    setSubmitting(false);

    if (res.success) {
      setLoginOtpSent(true);
      setLoginOtpTimer(60);
      setLoginOtpNotice(res.notice || null);
      setLoginOtpResolvedEmail(res.email || trimmedId);
      showToast(`Verification code sent to ${res.email || trimmedId}`);
    } else if (res.notFoundInFirebase) {
      if (selectedRole === 'farmer') {
        setFarmerNotFound(true);
      } else {
        setStaffNotFound(true);
      }
      setErrorMessage(res.error || 'Record not found in Firebase. Please sign up to proceed.');
    } else {
      setErrorMessage(res.error || 'Failed to dispatch security OTP. Please verify your contact details.');
    }
  };

  // Verify Login OTP
  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = loginOtpCode.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setSubmitting(true);
    const res = await verifyLoginOtp(loginOtpResolvedEmail || identifier, cleanCode, selectedRole);
    setSubmitting(false);

    if (res.success) {
      showToast('OTP verified successfully! Welcome.');
      if (selectedRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (selectedRole === 'staff') {
        navigate('/centre/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setErrorMessage(res.error || 'Invalid or expired verification code.');
    }
  };

  const handleResendLoginOtp = async () => {
    if (loginOtpTimer > 0) return;
    setSubmitting(true);
    setErrorMessage(null);
    const res = await requestLoginOtp(identifier, selectedRole);
    setSubmitting(false);
    if (res.success) {
      setLoginOtpTimer(60);
      setLoginOtpNotice(res.notice || null);
      showToast('New verification code dispatched.');
    } else {
      setErrorMessage(res.error || 'Failed to resend OTP.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFarmerNotFound(false);
    setStaffNotFound(false);
    setStaffPendingApproval(false);

    const trimmedId = identifier.trim();
    if (!trimmedId) {
      if (selectedRole === 'farmer') {
        setErrorMessage('Please enter your email or mobile number.');
      } else if (selectedRole === 'staff') {
        setErrorMessage('Please enter your staff email.');
      } else {
        setErrorMessage('Please enter your admin email.');
      }
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setSubmitting(true);

    try {
      if (selectedRole === 'farmer') {
        // User Login: Checks Firebase users collection first
        const res = await loginFarmer(trimmedId, password);
        setSubmitting(false);

        if (res.success) {
          showToast('Welcome to ProcureEase!');
          navigate('/dashboard');
        } else if (res.notFoundInFirebase) {
          setFarmerNotFound(true);
          setErrorMessage(res.error || 'User data not found in Firebase. Please sign up with email OTP verification.');
        } else {
          setErrorMessage(res.error || 'Failed to login. Please verify your credentials.');
        }
      } else if (selectedRole === 'staff') {
        // Staff Login: Mandatory OTP every time + checks Firebase staff collection
        const res = await loginStaff(trimmedId, password);
        setSubmitting(false);

        if (res.requiresOtp) {
          // Trigger OTP step
          setStaffEmailForOtp(res.email || trimmedId);
          setStaffRequiresOtp(true);
          setStaffOtpTimer(60);
          if (res.notice) setStaffOtpNotice(res.notice);
          showToast(`Security OTP sent to ${res.email || trimmedId}`);
        } else if (res.notFoundInFirebase) {
          setStaffNotFound(true);
          setErrorMessage(res.error || 'Staff credentials not found in Firebase. Staff members must sign up and await Administrator authentication.');
        } else if (res.pendingApproval) {
          setStaffPendingApproval(true);
          setErrorMessage(res.error || 'Staff account is pending Administrator authentication.');
        } else {
          setErrorMessage(res.error || 'Staff authentication failed. Please check your credentials.');
        }
      } else if (selectedRole === 'admin') {
        const res = await loginAdmin(trimmedId, password);
        setSubmitting(false);
        if (res.requiresOtp) {
          setAdminEmailForOtp(res.email || trimmedId);
          setAdminRequiresOtp(true);
          setAdminOtpTimer(60);
          if (res.notice) setAdminOtpNotice(res.notice);
          showToast(`Security OTP sent to ${res.email || trimmedId}`);
        } else if (res.pendingApproval) {
          setErrorMessage(res.error || 'Your administrator application is currently awaiting approval from an existing Apex Administrator.');
        } else if (res.success) {
          showToast('Apex Administrator authenticated.');
          navigate('/admin/dashboard');
        } else {
          setErrorMessage(res.error || 'Admin authentication failed. Access denied.');
        }
      }
    } catch (err: unknown) {
      setSubmitting(false);
      const e = err as { message?: string };
      setErrorMessage(e.message || 'An unexpected error occurred. Please try again.');
    }
  };

  // Staff OTP Verification
  const handleVerifyStaffOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = staffOtpCode.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit staff verification OTP.');
      return;
    }

    setSubmitting(true);
    const res = await verifyStaffLoginOtp(staffEmailForOtp, cleanCode);
    setSubmitting(false);

    if (res.success) {
      showToast('Staff credentials and OTP verified! Welcome to Centre Portal.');
      navigate('/centre/dashboard');
    } else {
      setErrorMessage(res.error || 'Invalid or expired OTP. Please try again.');
    }
  };

  // Staff Resend OTP
  const handleResendStaffOtp = async () => {
    if (staffOtpTimer > 0) return;
    setSubmitting(true);
    setErrorMessage(null);
    const res = await loginStaff(staffEmailForOtp);
    setSubmitting(false);
    if (res.requiresOtp) {
      setStaffOtpTimer(60);
      showToast('New staff login OTP dispatched to your email.');
    } else {
      setErrorMessage(res.error || 'Failed to resend staff OTP.');
    }
  };

  // Admin OTP Verification (2FA)
  const handleVerifyAdminOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = adminOtpCode.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit administrator verification OTP.');
      return;
    }

    setSubmitting(true);
    const res = await verifyAdminLoginOtp(adminEmailForOtp, cleanCode);
    setSubmitting(false);

    if (res.success) {
      showToast('Apex Administrator authenticated! Welcome to Management Console.');
      navigate('/admin/dashboard');
    } else {
      setErrorMessage(res.error || 'Invalid or expired OTP. Please try again.');
    }
  };

  // Admin Resend OTP
  const handleResendAdminOtp = async () => {
    if (adminOtpTimer > 0) return;
    setSubmitting(true);
    setErrorMessage(null);
    const res = await loginAdmin(adminEmailForOtp, password);
    setSubmitting(false);
    if (res.requiresOtp) {
      setAdminOtpTimer(60);
      showToast('New administrator 2FA OTP dispatched to your email.');
    } else {
      setErrorMessage(res.error || 'Failed to resend administrator OTP.');
    }
  };

  // Staff Registration Step 1: Request OTP
  const handleInitiateStaffSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffSignupError(null);

    if (!staffFormData.name.trim()) {
      setStaffSignupError('Please enter your full name.');
      return;
    }
    if (!staffFormData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffFormData.email.trim())) {
      setStaffSignupError('Please enter a valid official staff email address.');
      return;
    }
    if (!staffFormData.phone.trim() || !/^\d{10}$/.test(staffFormData.phone.trim())) {
      setStaffSignupError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!staffFormData.employeeCode.trim()) {
      setStaffSignupError('Please enter your APMC employee code.');
      return;
    }
    if (!staffFormData.password || staffFormData.password.length < 6) {
      setStaffSignupError('Password must be at least 6 characters.');
      return;
    }
    if (staffFormData.password !== staffFormData.confirmPassword) {
      setStaffSignupError('Passwords do not match.');
      return;
    }

    setStaffSignupSubmitting(true);
    const otpRes = await requestStaffSignupOtp(staffFormData.email);
    setStaffSignupSubmitting(false);

    if (otpRes.success) {
      setStaffSignupStep('otp');
      setStaffSignupOtpTimer(60);
      setStaffSignupOtpNotice(otpRes.notice || null);
      showToast(`Verification OTP dispatched to ${staffFormData.email}`);
    } else {
      setStaffSignupError(otpRes.error || 'Failed to dispatch staff verification OTP.');
    }
  };

  // Staff Registration Step 2: Verify OTP and Register in Staff Table
  const handleConfirmStaffSignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffSignupError(null);

    const cleanCode = staffSignupOtp.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setStaffSignupError('Please enter the complete 6-digit verification OTP code.');
      return;
    }

    setStaffSignupSubmitting(true);
    const payload: RegisterStaffData = {
      name: staffFormData.name,
      email: staffFormData.email,
      password: staffFormData.password,
      phone: staffFormData.phone,
      employeeCode: staffFormData.employeeCode,
      centreId: staffFormData.centreId,
      centreName: staffFormData.centreName,
      designation: staffFormData.designation
    };

    const res = await registerStaffWithOtp(payload, cleanCode);
    setStaffSignupSubmitting(false);

    if (res.success) {
      setStaffSignupSuccess(true);
      showToast('Staff registration submitted with verified email for Admin approval!');
    } else {
      setStaffSignupError(res.error || 'Failed to complete staff registration.');
    }
  };

  // Staff Registration Resend OTP
  const handleResendStaffSignupOtp = async () => {
    if (staffSignupOtpTimer > 0) return;
    setStaffSignupSubmitting(true);
    setStaffSignupError(null);
    const res = await requestStaffSignupOtp(staffFormData.email);
    setStaffSignupSubmitting(false);
    if (res.success) {
      setStaffSignupOtpTimer(60);
      setStaffSignupOtpNotice(res.notice || null);
      showToast('New staff verification OTP dispatched.');
    } else {
      setStaffSignupError(res.error || 'Failed to resend staff OTP.');
    }
  };

  // Admin Registration Step 1: Request OTP
  const handleInitiateAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminSignupError(null);

    if (!adminFormData.name.trim()) {
      setAdminSignupError('Please enter your full name.');
      return;
    }
    if (!adminFormData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminFormData.email.trim())) {
      setAdminSignupError('Please enter a valid administrator email address.');
      return;
    }
    if (!adminFormData.phone.trim() || !/^\d{10}$/.test(adminFormData.phone.trim())) {
      setAdminSignupError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!adminFormData.password || adminFormData.password.length < 6) {
      setAdminSignupError('Password must be at least 6 characters.');
      return;
    }
    if (adminFormData.password !== adminFormData.confirmPassword) {
      setAdminSignupError('Passwords do not match. Please re-enter.');
      return;
    }

    setAdminSignupSubmitting(true);
    const otpRes = await requestAdminSignupOtp(adminFormData.email);
    setAdminSignupSubmitting(false);

    if (otpRes.success) {
      setAdminSignupStep('otp');
      setAdminSignupOtpTimer(60);
      setAdminSignupOtpNotice(otpRes.notice || null);
      showToast(`Verification OTP dispatched to ${adminFormData.email}`);
    } else {
      setAdminSignupError(otpRes.error || 'Failed to dispatch administrator verification OTP.');
    }
  };

  // Admin Registration Step 2: Verify OTP and Register in Admins Table
  const handleConfirmAdminSignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminSignupError(null);

    const cleanCode = adminSignupOtp.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setAdminSignupError('Please enter the complete 6-digit verification OTP code.');
      return;
    }

    setAdminSignupSubmitting(true);
    const payload: RegisterAdminData = {
      name: adminFormData.name,
      email: adminFormData.email,
      password: adminFormData.password,
      phone: adminFormData.phone,
      department: adminFormData.department,
      designation: adminFormData.designation
    };

    const res = await registerAdminWithOtp(payload, cleanCode);
    setAdminSignupSubmitting(false);

    if (res.success) {
      setAdminSignupSuccess(true);
      setAdminSignupPending(!!res.pendingApproval);
      if (res.pendingApproval) {
        showToast('Administrator registration submitted! Awaiting approval from an existing Apex Administrator.');
      } else {
        showToast('Designated Apex Administrator account created!');
      }
    } else {
      setAdminSignupError(res.error || 'Failed to complete administrator registration.');
    }
  };

  // Admin Registration Resend OTP
  const handleResendAdminSignupOtp = async () => {
    if (adminSignupOtpTimer > 0) return;
    setAdminSignupSubmitting(true);
    setAdminSignupError(null);
    const res = await requestAdminSignupOtp(adminFormData.email);
    setAdminSignupSubmitting(false);
    if (res.success) {
      setAdminSignupOtpTimer(60);
      setAdminSignupOtpNotice(res.notice || null);
      showToast('New administrator verification OTP dispatched.');
    } else {
      setAdminSignupError(res.error || 'Failed to resend administrator OTP.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSubmitting(true);
    try {
      const res = await signInWithGoogle(selectedRole);
      setSubmitting(false);
      if (res.success) {
        showToast('Signed in successfully with Google.');
        const targetRole = res.role || selectedRole;
        if (targetRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (targetRole === 'staff' || targetRole === 'centre_staff') {
          navigate('/centre/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMessage(res.error || 'Google sign-in failed.');
      }
    } catch (err: unknown) {
      setSubmitting(false);
      const e = err as { message?: string };
      setErrorMessage(e.message || 'An unexpected error occurred during Google sign-in.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    const emailToReset = forgotEmail.trim();

    if (!emailToReset || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToReset)) {
      setForgotError('Please enter a valid email address.');
      return;
    }

    setForgotSubmitting(true);
    const res = await sendResetEmail(emailToReset);
    setForgotSubmitting(false);

    if (res.success) {
      setForgotSuccess(true);
    } else {
      setForgotError(res.error || 'Failed to send password reset email.');
    }
  };

  const openForgotModal = () => {
    if (identifier.includes('@')) {
      setForgotEmail(identifier.trim());
    } else {
      setForgotEmail('');
    }
    setForgotSuccess(false);
    setForgotError(null);
    setShowForgotModal(true);
  };

  return (
    <div className="w-full flex items-center justify-center py-6 px-4">
      {/* Clean White Login Card */}
      <div className="w-full max-w-[430px] bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        
        {/* Top of the card */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-800 text-white mb-2.5">
            <Sprout className="w-5 h-5 text-emerald-200" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            ProcureEase
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Farmer Procurement &amp; Scheduling
          </p>
        </div>

        {/* STAFF MANDATORY OTP VIEW */}
        {staffRequiresOtp ? (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <div className="inline-flex p-2.5 rounded-full bg-emerald-100 text-emerald-800 mb-1">
                <KeyRound className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Staff 2FA Verification</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mandatory Security Check: Every staff login requires an OTP dispatched to your official email.
              </p>
              <p className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 py-1 px-3 rounded-full inline-block mt-2">
                {staffEmailForOtp}
              </p>
              {staffOtpNotice && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs mt-2 text-left leading-relaxed">
                  <span className="font-semibold block mb-0.5">⚠️ Security OTP Notice:</span>
                  {staffOtpNotice}
                </div>
              )}
            </div>

            {/* Error in OTP */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerifyStaffOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 text-center uppercase tracking-wider mb-2">
                  ENTER 6-DIGIT SECURITY OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={staffOtpCode}
                  onChange={(e) => setStaffOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center text-3xl font-black font-mono tracking-widest py-3 px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 outline-none bg-white text-slate-900"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStaffRequiresOtp(false);
                    setStaffOtpCode('');
                  }}
                  className="text-slate-500 hover:text-slate-800 font-medium transition cursor-pointer"
                >
                  ← Back to Login
                </button>
                <button
                  type="button"
                  onClick={handleResendStaffOtp}
                  disabled={staffOtpTimer > 0 || submitting}
                  className="text-emerald-800 font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  {staffOtpTimer > 0 ? `Resend in ${staffOtpTimer}s` : 'Resend OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting || staffOtpCode.length !== 6}
                className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
              >
                {submitting ? 'Verifying Security OTP...' : 'Verify OTP & Enter Centre Portal'}
              </button>
            </form>
          </div>
        ) : adminRequiresOtp ? (
          /* ADMIN MANDATORY 2FA OTP VIEW */
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <div className="inline-flex p-2.5 rounded-full bg-purple-100 text-purple-800 mb-1">
                <ShieldCheck className="w-5 h-5 text-purple-700" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Apex Administrator 2FA</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                High-Security Access: Every administrator login requires a one-time verification code dispatched to your authorized email.
              </p>
              <p className="text-xs font-mono font-bold text-purple-900 bg-purple-50 py-1 px-3 rounded-full inline-block mt-2">
                {adminEmailForOtp}
              </p>
              {adminOtpNotice && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs mt-2 text-left leading-relaxed">
                  <span className="font-semibold block mb-0.5">⚠️ Security OTP Notice:</span>
                  {adminOtpNotice}
                </div>
              )}
            </div>

            {/* Error in Admin OTP */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerifyAdminOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 text-center uppercase tracking-wider mb-2">
                  ENTER 6-DIGIT ADMIN 2FA OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={adminOtpCode}
                  onChange={(e) => setAdminOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center text-3xl font-black font-mono tracking-widest py-3 px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-700 focus:border-purple-700 outline-none bg-white text-slate-900"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAdminRequiresOtp(false);
                    setAdminOtpCode('');
                  }}
                  className="text-slate-500 hover:text-slate-800 font-medium transition cursor-pointer"
                >
                  ← Back to Login
                </button>
                <button
                  type="button"
                  onClick={handleResendAdminOtp}
                  disabled={adminOtpTimer > 0 || submitting}
                  className="text-purple-800 font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  {adminOtpTimer > 0 ? `Resend in ${adminOtpTimer}s` : 'Resend OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting || adminOtpCode.length !== 6}
                className="w-full py-2.5 px-4 bg-purple-900 hover:bg-purple-950 text-white font-semibold text-xs rounded-xl transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
              >
                {submitting ? 'Verifying Admin 2FA...' : 'Verify OTP & Access Admin Console'}
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* SELECT YOUR ROLE */}
            <div className="mb-6">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
                SELECT YOUR ROLE
              </label>
              <div className="grid grid-cols-3 gap-2">
                
                {/* Farmer Box */}
                <button
                  type="button"
                  id="role-box-farmer"
                  onClick={() => handleRoleChange('farmer')}
                  className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all cursor-pointer ${
                    selectedRole === 'farmer'
                      ? 'border-2 border-emerald-700 bg-emerald-50 text-emerald-950 font-semibold'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Sprout className={`w-5 h-5 mb-1 ${selectedRole === 'farmer' ? 'text-emerald-800' : 'text-slate-400'}`} />
                  <span className="text-xs">Farmer</span>
                </button>

                {/* Staff Box */}
                <button
                  type="button"
                  id="role-box-staff"
                  onClick={() => handleRoleChange('staff')}
                  className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all cursor-pointer ${
                    selectedRole === 'staff'
                      ? 'border-2 border-emerald-700 bg-emerald-50 text-emerald-950 font-semibold'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Building2 className={`w-5 h-5 mb-1 ${selectedRole === 'staff' ? 'text-emerald-800' : 'text-slate-400'}`} />
                  <span className="text-xs">Staff</span>
                </button>

                {/* Admin Box */}
                <button
                  type="button"
                  id="role-box-admin"
                  onClick={() => handleRoleChange('admin')}
                  className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all cursor-pointer ${
                    selectedRole === 'admin'
                      ? 'border-2 border-emerald-700 bg-emerald-50 text-emerald-950 font-semibold'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <ShieldCheck className={`w-5 h-5 mb-1 ${selectedRole === 'admin' ? 'text-emerald-800' : 'text-slate-400'}`} />
                  <span className="text-xs">Admin</span>
                </button>

              </div>
            </div>

            {/* Role Specific Header */}
            <div className="text-center mb-4">
              <h2 className="text-base font-bold text-slate-900">
                {selectedRole === 'farmer' && 'Farmer / Citizen Login'}
                {selectedRole === 'staff' && 'Procurement Centre Staff Login'}
                {selectedRole === 'admin' && 'Apex Administrator Login'}
              </h2>
              {selectedRole === 'staff' && (
                <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                  🔐 2-Factor Authentication (Email OTP) Required for Every Login
                </p>
              )}
              {selectedRole === 'admin' && (
                <p className="text-[11px] text-purple-700 font-medium mt-0.5">
                  🛡️ 2FA Security Protected (One-Time Passcode Sent to Registered Admin Email)
                </p>
              )}
            </div>

            {/* FARMER VOICE BOOKING HERO CALLOUT FOR ILLITERATE / UNEDUCATED FARMERS */}
            {selectedRole === 'farmer' && (
              <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-800 text-white shadow-lg border border-emerald-500/30 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-400/10 pointer-events-none" />
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider mb-1.5">
                      <Sparkles className="w-3 h-3 text-emerald-950" />
                      <span>చదువురాని రైతుల కోసం ప్రత్యేక సదుపాయం</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                      🎤 మాట్లాడి కొత్త టోకెన్ బుక్ చేయండి
                    </h3>
                    <p className="text-[11px] text-emerald-100/90 leading-tight mt-1">
                      మీ పంట, బస్తాల సంఖ్య చెప్పండి — వివరాలు మాట్లాడితే చాలు, టోకెన్ జారీ చేయబడుతుంది!
                    </p>
                  </div>
                  <button
                    type="button"
                    id="farmer-hero-voice-booking-btn"
                    onClick={() => setShowVoiceBookingModal(true)}
                    className="shrink-0 py-2.5 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-md active:scale-95 hover:shadow-amber-400/30"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-950 text-amber-300 flex items-center justify-center">
                      <Mic className="w-5 h-5 animate-pulse" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold">Tap Mic</span>
                  </button>
                </div>
              </div>
            )}

            {/* Login Method Switcher: Password vs OTP Verification */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-4 border border-slate-200/80">
              <button
                type="button"
                id="login-tab-password"
                onClick={() => {
                  setLoginMethod('password');
                  setLoginOtpSent(false);
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  loginMethod === 'password'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Password Login</span>
              </button>
              <button
                type="button"
                id="login-tab-otp"
                onClick={() => {
                  setLoginMethod('otp');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  loginMethod === 'otp'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>OTP Verification</span>
              </button>
            </div>

            {/* Prompt for Farmer not found in Firebase */}
            {farmerNotFound && (
              <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-950">Data Not Found in Firebase</p>
                    <p className="mt-0.5 leading-relaxed">
                      Your credentials do not exist in Firebase. Please sign up to create your account. An email verification OTP will be sent.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/register?not_found=1&email=${encodeURIComponent(identifier)}`)}
                  className="w-full py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Sign Up with Email OTP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Prompt for Staff not found in Firebase */}
            {staffNotFound && (
              <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-950">Staff Account Not Found in Firebase</p>
                    <p className="mt-0.5 leading-relaxed">
                      Staff must sign up with official credentials. An Administrator must authenticate and accept your staff access before you can log in.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStaffSignupModal(true)}
                  className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up as Staff (Admin Approval)</span>
                </button>
              </div>
            )}

            {/* Prompt for Staff Pending Approval */}
            {staffPendingApproval && (
              <div className="mb-4 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-1">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-blue-950">Pending Administrator Approval</p>
                    <p className="mt-0.5 leading-relaxed">
                      Your staff registration is currently under review by the Apex Administrator. Once accepted, you will be able to log in with your credentials and mandatory OTP.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {errorMessage && !farmerNotFound && !staffNotFound && !staffPendingApproval && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span className="flex-1 leading-relaxed">{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Render Password Form OR OTP Login Form */}
            {loginMethod === 'password' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email / Identifier Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label 
                      htmlFor="login-identifier" 
                      className="block text-xs font-semibold text-slate-700"
                    >
                      {selectedRole === 'farmer' && 'Email or Mobile Number'}
                      {selectedRole === 'staff' && 'Official Staff Email'}
                      {selectedRole === 'admin' && 'Apex Admin Email'}
                    </label>
                    {selectedRole === 'farmer' && (
                      <button
                        type="button"
                        onClick={handleVoiceInputIdentifier}
                        className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 cursor-pointer"
                        title="Speak phone number"
                      >
                        <Mic className={`w-3.5 h-3.5 ${isListeningForIdentifier ? 'text-red-600 animate-pulse' : 'text-emerald-700'}`} />
                        <span>{isListeningForIdentifier ? 'వింటున్నాము...' : 'మాట్లాడండి (Speak Phone)'}</span>
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="login-identifier"
                      type={selectedRole === 'farmer' ? 'text' : 'email'}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        selectedRole === 'farmer'
                          ? 'Enter registered email or phone'
                          : selectedRole === 'staff'
                            ? 'staff@procureease.gov.in'
                            : 'tirumalavenkatesh0502@gmail.com'
                      }
                      required
                      autoComplete="username"
                      className={`w-full ${selectedRole === 'farmer' ? 'pl-3.5 pr-11' : 'px-3.5'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition`}
                    />
                    {selectedRole === 'farmer' && (
                      <button
                        type="button"
                        id="farmer-voice-mic-input-btn"
                        onClick={handleVoiceInputIdentifier}
                        title="Speak Phone Number"
                        className={`absolute inset-y-0 right-0 pr-3 flex items-center transition cursor-pointer ${
                          isListeningForIdentifier ? 'text-red-600 animate-pulse' : 'text-emerald-700 hover:text-emerald-900'
                        }`}
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label 
                    htmlFor="login-password" 
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      autoComplete="current-password"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password? */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={openForgotModal}
                    className="text-xs font-medium text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Login Button */}
                <div className="pt-1">
                  <button
                    type="submit"
                    id="login-submit-btn"
                    disabled={submitting}
                    className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-semibold text-xs rounded-xl transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
                  >
                    {submitting ? 'Authenticating...' : selectedRole === 'staff' ? 'Continue with Mandatory OTP' : 'Login'}
                  </button>
                </div>

              </form>
            ) : !loginOtpSent ? (
              /* OTP Request Form */
              <form onSubmit={handleRequestLoginOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label 
                      htmlFor="login-otp-identifier" 
                      className="block text-xs font-semibold text-slate-700"
                    >
                      {selectedRole === 'farmer' && 'Registered Email or 10-Digit Mobile Number'}
                      {selectedRole === 'staff' && 'Official Staff Email'}
                      {selectedRole === 'admin' && 'Apex Admin Email'}
                    </label>
                    {selectedRole === 'farmer' && (
                      <button
                        type="button"
                        onClick={handleVoiceInputIdentifier}
                        className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 cursor-pointer"
                        title="Speak phone number"
                      >
                        <Mic className={`w-3.5 h-3.5 ${isListeningForIdentifier ? 'text-red-600 animate-pulse' : 'text-emerald-700'}`} />
                        <span>{isListeningForIdentifier ? 'వింటున్నాము...' : 'ఫోన్ చెప్పండి (Speak)'}</span>
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="login-otp-identifier"
                      type={selectedRole === 'farmer' ? 'text' : 'email'}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        selectedRole === 'farmer'
                          ? 'e.g. 9848011223 or ramarao@gmail.com'
                          : selectedRole === 'staff'
                            ? 'staff@procureease.gov.in'
                            : 'tirumalavenkatesh0502@gmail.com'
                      }
                      required
                      className="w-full pl-3.5 pr-16 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
                      {selectedRole === 'farmer' && (
                        <button
                          type="button"
                          id="farmer-voice-mic-otp-btn"
                          onClick={handleVoiceInputIdentifier}
                          title="Speak Phone Number"
                          className={`p-1 rounded-md transition cursor-pointer ${
                            isListeningForIdentifier ? 'text-red-600 animate-pulse' : 'text-emerald-700 hover:text-emerald-900'
                          }`}
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                      )}
                      <Mail className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    We will verify your credentials in the Firebase {selectedRole === 'admin' ? 'admins' : selectedRole === 'staff' ? 'staff' : 'users'} table and dispatch a 6-digit security code.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="send-login-otp-btn"
                    disabled={submitting}
                    className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-semibold text-xs rounded-xl transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating & Dispatching OTP...</span>
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Send 6-Digit Verification OTP</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* OTP Code Verification Form */
              <form onSubmit={handleVerifyLoginOtp} className="space-y-4">
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-900">OTP Sent To:</span>
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-emerald-300 text-emerald-800">
                      {loginOtpResolvedEmail}
                    </span>
                  </div>
                  {loginOtpNotice && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mt-2 text-left leading-relaxed">
                      <span className="font-semibold block mb-0.5">⚠️ Security OTP Notice:</span>
                      {loginOtpNotice}
                    </div>
                  )}
                </div>

                <div>
                  <label 
                    htmlFor="login-otp-code-input" 
                    className="block text-xs font-semibold text-slate-700 mb-1.5 text-center"
                  >
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    id="login-otp-code-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={loginOtpCode}
                    onChange={(e) => setLoginOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    autoFocus
                    required
                    className="w-full text-center tracking-[0.6em] font-mono font-bold text-lg py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
                  />
                  <p className="text-[11px] text-slate-400 text-center mt-1">
                    Valid for 10 minutes.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginOtpSent(false);
                      setLoginOtpCode('');
                      setErrorMessage(null);
                    }}
                    className="text-slate-500 hover:text-slate-800 font-medium transition cursor-pointer"
                  >
                    ← Change Mobile / Email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendLoginOtp}
                    disabled={loginOtpTimer > 0 || submitting}
                    className="text-emerald-800 font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {loginOtpTimer > 0 ? `Resend in ${loginOtpTimer}s` : 'Resend OTP'}
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="verify-login-otp-submit-btn"
                    disabled={submitting || loginOtpCode.length !== 6}
                    className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-semibold text-xs rounded-xl transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Validating OTP Code...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verify OTP & Log In</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Google Sign-in */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-400 font-medium">
                  or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              id="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 hover:border-slate-400 text-slate-700 font-medium text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2.5 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.64-5.2 3.64-9.15z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.13 0-5.78-2.11-6.73-4.96H1.23v3.13C3.26 21.36 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.63H1.23C.44 8.24 0 10.06 0 12s.44 3.76 1.23 5.37l4.04-3.13z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.23 6.63l4.04 3.13c.95-2.85 3.6-4.96 6.73-4.96z" />
              </svg>
              <span>Sign in with Google</span>
            </button>

            {/* Bottom Links based on role */}
            {selectedRole === 'farmer' && (
              <div className="mt-5 space-y-2.5 text-center">
                <button
                  type="button"
                  id="voice-farmer-signup-login-btn"
                  onClick={() => setShowVoiceSignupModal(true)}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mic className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>🎙️ మాట్లాడి కొత్త ఖాతా తెరవండి (AI Voice Sign-up)</span>
                </button>
                <div className="text-xs text-slate-600">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="font-semibold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer"
                  >
                    Sign Up with Email OTP
                  </button>
                </div>
              </div>
            )}

            {selectedRole === 'staff' && (
              <div className="mt-6 text-center text-xs text-slate-600">
                New staff officer?{' '}
                <button
                  type="button"
                  onClick={() => setShowStaffSignupModal(true)}
                  className="font-semibold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer"
                >
                  Sign Up for Staff Credentials
                </button>
              </div>
            )}

            {selectedRole === 'admin' && (
              <div className="mt-6 text-center text-xs text-slate-600">
                New APMC Administrator?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAdminSignupSuccess(false);
                    setAdminSignupPending(false);
                    setAdminSignupStep('form');
                    setAdminSignupError(null);
                    setShowAdminSignupModal(true);
                  }}
                  className="font-semibold text-purple-800 hover:text-purple-950 hover:underline cursor-pointer"
                >
                  Apply for Administrator Access
                </button>
              </div>
            )}
          </>
        )}

      </div>

      {/* STAFF SIGN-UP MODAL (Admin Approval Workflow) */}
      {showStaffSignupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-800" />
                  Staff Account Registration
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  An Administrator must authenticate and accept your staff account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowStaffSignupModal(false);
                  setStaffSignupSuccess(false);
                  setStaffSignupError(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {staffSignupSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Staff Registration Submitted
                </h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  Your credentials have been securely stored in the Firebase <strong>staff</strong> collection. An Apex Administrator will review and authenticate your application.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowStaffSignupModal(false);
                    setStaffSignupSuccess(false);
                    setStaffSignupStep('form');
                    setStaffSignupOtp('');
                    handleRoleChange('staff');
                  }}
                  className="mt-3 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition"
                >
                  Return to Staff Login
                </button>
              </div>
            ) : staffSignupStep === 'form' ? (
              <form onSubmit={handleInitiateStaffSignup} className="space-y-3.5 mt-4">
                {staffSignupError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{staffSignupError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={staffFormData.name}
                      onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                      placeholder="e.g. S. Prabhakar"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Staff Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={staffFormData.email}
                      onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                      placeholder="prabhakar@procureease.gov.in"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number (10 Digits) *
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      value={staffFormData.phone}
                      onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value.replace(/\D/g, '') })}
                      placeholder="9848099881"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      APMC Employee Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={staffFormData.employeeCode}
                      onChange={(e) => setStaffFormData({ ...staffFormData, employeeCode: e.target.value })}
                      placeholder="STF-APMC-9042"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Assigned Procurement Centre *
                    </label>
                    <select
                      value={staffFormData.centreId}
                      onChange={(e) => {
                        const sel = mockCentres.find(c => c.id === e.target.value);
                        setStaffFormData({
                          ...staffFormData,
                          centreId: e.target.value,
                          centreName: sel ? sel.name : 'Mylavaram APMC Centre'
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none"
                    >
                      {mockCentres.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Designation *
                    </label>
                    <input
                      type="text"
                      required
                      value={staffFormData.designation}
                      onChange={(e) => setStaffFormData({ ...staffFormData, designation: e.target.value })}
                      placeholder="e.g. Weighbridge Officer"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Staff Password (min. 6 chars) *
                    </label>
                    <input
                      type="password"
                      required
                      value={staffFormData.password}
                      onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={staffFormData.confirmPassword}
                      onChange={(e) => setStaffFormData({ ...staffFormData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={staffSignupSubmitting}
                    className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {staffSignupSubmitting ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Dispatching Verification OTP...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verify Official Email via OTP →</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Staff Sign-up OTP Step */
              <form onSubmit={handleConfirmStaffSignupOtp} className="space-y-4 mt-4">
                {staffSignupError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{staffSignupError}</span>
                  </div>
                )}

                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-900">OTP Sent To:</span>
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-emerald-300 text-emerald-800">
                      {staffFormData.email}
                    </span>
                  </div>
                  {staffSignupOtpNotice && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mt-2 text-left leading-relaxed">
                      <span className="font-semibold block mb-0.5">⚠️ Security OTP Notice:</span>
                      {staffSignupOtpNotice}
                    </div>
                  )}
                </div>

                <div>
                  <label 
                    htmlFor="staff-signup-otp-input" 
                    className="block text-xs font-semibold text-slate-700 mb-1.5 text-center"
                  >
                    Enter 6-Digit Email Verification Code
                  </label>
                  <input
                    id="staff-signup-otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={staffSignupOtp}
                    onChange={(e) => setStaffSignupOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    autoFocus
                    required
                    className="w-full text-center tracking-[0.6em] font-mono font-bold text-lg py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
                  />
                  <p className="text-[11px] text-slate-400 text-center mt-1">
                    Valid for 10 minutes.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStaffSignupStep('form');
                      setStaffSignupOtp('');
                      setStaffSignupError(null);
                    }}
                    className="text-slate-500 hover:text-slate-800 font-medium transition cursor-pointer"
                  >
                    ← Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={handleResendStaffSignupOtp}
                    disabled={staffSignupOtpTimer > 0 || staffSignupSubmitting}
                    className="text-emerald-800 font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {staffSignupOtpTimer > 0 ? `Resend in ${staffSignupOtpTimer}s` : 'Resend OTP'}
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={staffSignupSubmitting || staffSignupOtp.length !== 6}
                    className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {staffSignupSubmitting ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying OTP & Registering...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verify OTP & Submit for Admin Authentication</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Reset Password
              </h3>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="py-5 text-center space-y-3">
                <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Reset Email Sent
                </h4>
                <p className="text-xs text-slate-500">
                  We sent a link to reset your password to <strong>{forgotEmail}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="mt-2 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4 mt-4">
                {forgotError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{forgotError}</span>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotSubmitting}
                  className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-xl text-xs shadow-xs transition cursor-pointer"
                >
                  {forgotSubmitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ADMIN SIGN-UP MODAL (Approval Workflow) */}
      {showAdminSignupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  Apex Administrator Application
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  High-privilege system role. Registrations are vetted by existing Apex Admins.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAdminSignupModal(false);
                  setAdminSignupSuccess(false);
                  setAdminSignupError(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adminSignupSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  {adminSignupPending ? 'Application Submitted for Review' : 'Administrator Account Created'}
                </h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  {adminSignupPending ? (
                    <>Your credentials have been securely stored in the <strong>admins</strong> collection with <em>pending_approval</em> status. An active Apex Administrator will review and approve your account.</>
                  ) : (
                    <>Your email is recognized as a designated Apex Administrator! You may now sign in using your credentials and 2FA OTP code.</>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminSignupModal(false);
                    setAdminSignupSuccess(false);
                    setAdminSignupStep('form');
                    setAdminSignupOtp('');
                    handleRoleChange('admin');
                  }}
                  className="mt-3 px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold transition"
                >
                  Return to Admin Login
                </button>
              </div>
            ) : adminSignupStep === 'form' ? (
              <form onSubmit={handleInitiateAdminSignup} className="space-y-3.5 mt-4">
                {adminSignupError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{adminSignupError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={adminFormData.name}
                      onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
                      placeholder="Dr. Rajesh Sharma"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number (10 digits) *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={adminFormData.phone}
                      onChange={(e) => setAdminFormData({ ...adminFormData, phone: e.target.value.replace(/\D/g, '') })}
                      placeholder="9876543210"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-700 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Admin Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={adminFormData.email}
                    onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                    placeholder="admin@procureease.gov.in"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-700 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    A 6-digit verification code will be dispatched to this email before submitting.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      required
                      value={adminFormData.department}
                      onChange={(e) => setAdminFormData({ ...adminFormData, department: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      required
                      value={adminFormData.designation}
                      onChange={(e) => setAdminFormData({ ...adminFormData, designation: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-700 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password (min 6 chars) *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={adminFormData.password}
                      onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={adminFormData.confirmPassword}
                      onChange={(e) => setAdminFormData({ ...adminFormData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-700 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={adminSignupSubmitting}
                  className="w-full mt-3 py-2.5 bg-purple-900 hover:bg-purple-950 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {adminSignupSubmitting ? 'Dispatching Verification OTP...' : 'Send Verification OTP to Email'}
                </button>
              </form>
            ) : (
              /* OTP verification step */
              <form onSubmit={handleConfirmAdminSignupOtp} className="space-y-4 mt-4">
                <div className="text-center space-y-1">
                  <div className="inline-flex p-2 rounded-full bg-purple-100 text-purple-800 mb-1">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Verify Administrator Email</h4>
                  <p className="text-xs text-slate-500">
                    We dispatched a 6-digit one-time passcode to:
                  </p>
                  <p className="text-xs font-mono font-bold text-purple-900 bg-purple-50 py-1 px-3 rounded-full inline-block">
                    {adminFormData.email}
                  </p>
                  {adminSignupOtpNotice && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg mt-1 border border-amber-200 text-left">
                      {adminSignupOtpNotice}
                    </p>
                  )}
                </div>

                {adminSignupError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{adminSignupError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 text-center uppercase tracking-wider mb-2">
                    ENTER 6-DIGIT VERIFICATION CODE
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={adminSignupOtp}
                    onChange={(e) => setAdminSignupOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full text-center text-3xl font-black font-mono tracking-widest py-3 px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-700 focus:border-purple-700 outline-none bg-white text-slate-900"
                    autoFocus
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminSignupStep('form');
                      setAdminSignupOtp('');
                    }}
                    className="text-slate-500 hover:text-slate-800 font-medium transition cursor-pointer"
                  >
                    ← Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={handleResendAdminSignupOtp}
                    disabled={adminSignupOtpTimer > 0 || adminSignupSubmitting}
                    className="text-purple-800 font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {adminSignupOtpTimer > 0 ? `Resend in ${adminSignupOtpTimer}s` : 'Resend Code'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={adminSignupSubmitting || adminSignupOtp.length !== 6}
                  className="w-full py-2.5 px-4 bg-purple-900 hover:bg-purple-950 text-white font-semibold text-xs rounded-xl transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
                >
                  {adminSignupSubmitting ? 'Verifying & Submitting...' : 'Verify OTP & Complete Application'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Illiterate / Rural Farmer Voice Token Booking Modal */}
      <VoiceTokenBookingModal
        isOpen={showVoiceBookingModal}
        onClose={() => setShowVoiceBookingModal(false)}
        onBookingComplete={(booking) => {
          showToast(`✅ Voice Token ${booking.token} booked successfully!`);
        }}
      />

      {/* Step-by-Step AI Farmer Voice Registration Assistant */}
      <VoiceFarmerSignupModal
        isOpen={showVoiceSignupModal}
        onClose={() => setShowVoiceSignupModal(false)}
        onSuccess={() => {
          showToast('✅ ఖాతా విజయవంతంగా సృష్టించబడింది! స్వాగతం.');
          navigate('/farmer-dashboard');
        }}
      />

    </div>
  );
};
