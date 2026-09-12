import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  User,
  Phone,
  MapPin,
  Tractor,
  Lock,
  Sparkles,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export type VoiceSignupStep = 'name' | 'mobile' | 'location' | 'cropAndLand' | 'credentials' | 'review';

interface VoiceFarmerSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (registeredData: any) => void;
  initialLanguage?: 'te' | 'hi' | 'en';
}

export const VoiceFarmerSignupModal: React.FC<VoiceFarmerSignupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialLanguage = 'te'
}) => {
  const { registerFarmer, requestSignupOtp } = useAuth();
  const { navigate, showToast, setProfile, language: appLang } = useApp();

  const [selectedLang, setSelectedLang] = useState<'te' | 'hi' | 'en'>(
    initialLanguage || (appLang === 'te' || appLang === 'hi' ? appLang : 'te')
  );

  useEffect(() => {
    if (initialLanguage && (initialLanguage === 'te' || initialLanguage === 'hi' || initialLanguage === 'en')) {
      setSelectedLang(initialLanguage);
    } else if (appLang && (appLang === 'te' || appLang === 'hi' || appLang === 'en')) {
      setSelectedLang(appLang);
    }
  }, [initialLanguage, appLang]);

  const [currentStep, setCurrentStep] = useState<VoiceSignupStep>('name');
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingTts, setIsSpeakingTts] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Collected registration data
  const [farmerData, setFarmerData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    village: '',
    mandal: '',
    district: 'NTR District',
    state: 'Andhra Pradesh',
    crop: 'Paddy (Grade-A)',
    landDetails: '5.0',
    farmerId: '',
    preferredLanguage: selectedLang
  });

  // OTP Verification state if required
  const [requiresOtpVerification, setRequiresOtpVerification] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpNotice, setOtpNotice] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Questions for each step in Telugu, Hindi, English
  const stepPrompts: Record<VoiceSignupStep, { te: string; hi: string; en: string; titleTe: string; titleEn: string }> = {
    name: {
      te: 'నమస్కారం! APMC ప్రొక్యూర్‌ఈజ్ కి స్వాగతం. మైక్ బటన్ నొక్కి మీ పూర్తి పేరు చెప్పండి.',
      hi: 'नमस्ते! प्रोक्योरईज़ में आपका स्वागत है। माइक दबाकर अपना पूरा नाम बताएं।',
      en: 'Welcome to ProcureEase Farmer Registration! Please tap the mic and say your full name.',
      titleTe: 'మీ పూర్తి పేరు (Full Name)',
      titleEn: 'Your Full Name'
    },
    mobile: {
      te: 'ధన్యవాదాలు! ఇప్పుడు మీ 10 అంకెల మొబైల్ నంబర్ చెప్పండి.',
      hi: 'धन्यवाद! अब अपना 10 अंकों का मोबाइल नंबर बताएं।',
      en: 'Thank you! Now please say your 10-digit mobile number.',
      titleTe: 'మొబైల్ నంబర్ (Mobile Number)',
      titleEn: '10-Digit Mobile Number'
    },
    location: {
      te: 'మీ ఊరు లేదా గ్రామం మరియు మండలం పేరు చెప్పండి.',
      hi: 'कृपया अपने गाँव और मंडल का नाम बताएं।',
      en: 'Please tell me your village and mandal or taluk name.',
      titleTe: 'గ్రామం & మండలం (Village & Mandal)',
      titleEn: 'Village & Mandal Location'
    },
    cropAndLand: {
      te: 'మీరు పండించే ప్రధాన పంట ఏది మరియు ఎన్ని ఎకరాల భూమి ఉంది?',
      hi: 'आपकी मुख्य फसल कौन सी है और आपके पास कितने एकड़ ज़मीन है?',
      en: 'What is your primary crop and how many acres of land do you cultivate?',
      titleTe: 'పంట & భూమి వివరాలు (Crop & Landholding)',
      titleEn: 'Primary Crop & Land Details'
    },
    credentials: {
      te: 'మీ ఖాతా కోసం సులభమైన 6 అంకెల పిన్ లేదా పాస్‌వర్డ్ చెప్పండి.',
      hi: 'अपने खाते के लिए 6 अंकों का आसान पिन या पासवर्ड बताएं।',
      en: 'Please say an easy 6-digit PIN or password for your account login.',
      titleTe: 'ఖాతా భద్రతా పిన్ (Security PIN/Password)',
      titleEn: 'Account PIN & Password'
    },
    review: {
      te: 'మీ వివరాలు పరిశీలించండి. అంతా సరిగ్గా ఉంటే ఖాతా సృష్టించండి బటన్ నొక్కండి.',
      hi: 'कृपया अपने विवरण की जाँच करें और खाता बनाने के लिए पुष्टि करें।',
      en: 'Please review your registration details. Click confirm to create your account.',
      titleTe: 'వివరాల పరిశీలన & ధృవీకరణ (Review & Confirm)',
      titleEn: 'Review & Activate Account'
    }
  };

  // Text-To-Speech (TTS)
  const speakAloud = (text: string, langCode: 'te' | 'hi' | 'en' = selectedLang) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode === 'te' ? 'te-IN' : langCode === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeakingTts(true);
      utterance.onend = () => setIsSpeakingTts(false);
      utterance.onerror = () => setIsSpeakingTts(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS warning:', e);
      setIsSpeakingTts(false);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingTts(false);
    }
  };

  // Speak step prompt when step or language changes
  useEffect(() => {
    if (isOpen && !requiresOtpVerification) {
      const promptText = stepPrompts[currentStep][selectedLang];
      const timer = setTimeout(() => {
        speakAloud(promptText, selectedLang);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentStep, selectedLang, requiresOtpVerification]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Timer for OTP cooldown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (requiresOtpVerification && resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [requiresOtpVerification, resendCooldown]);

  // Start Speech Recognition for the current step
  const startListening = () => {
    setErrorMessage(null);
    stopSpeaking();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        'Speech recognition is not supported in this browser. You can use the quick buttons below.'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognition();
      recognition.lang = selectedLang === 'te' ? 'te-IN' : selectedLang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);

        if (event.results[0].isFinal) {
          handleStepTranscript(currentTranscript, currentStep);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage(
            'Microphone access was denied. Please allow microphone permissions or use the quick buttons below.'
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setErrorMessage('Could not access microphone.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  };

  // Process spoken transcript for the current step
  const handleStepTranscript = async (spokenText: string, step: VoiceSignupStep) => {
    if (!spokenText.trim()) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const resp = await fetch('/api/parse-voice-signup-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step,
          transcript: spokenText,
          language: selectedLang
        })
      });

      const json = await resp.json();
      setIsProcessing(false);

      if (json.success && json.data) {
        const data = json.data;

        if (step === 'name') {
          const cleanName = data.name || spokenText.replace(/^(నా పేరు|my name is)/gi, '').trim();
          setFarmerData(prev => ({
            ...prev,
            name: cleanName,
            farmerId: prev.farmerId || `AP/NTR/2026/${Math.floor(1000 + Math.random() * 9000)}`
          }));
          if (data.audioFeedback) {
            speakAloud(data.audioFeedback, selectedLang);
          }
          // Auto advance to next step after slight delay
          setTimeout(() => setCurrentStep('mobile'), 1600);

        } else if (step === 'mobile') {
          const phone = data.mobile || spokenText.replace(/\D/g, '').slice(-10);
          const valid = phone.length === 10;
          if (valid) {
            setFarmerData(prev => ({
              ...prev,
              mobile: phone,
              email: prev.email || `${phone}@farmer.procureease.gov.in`
            }));
            speakAloud(data.audioFeedback || `Recorded mobile ${phone}`, selectedLang);
            setTimeout(() => setCurrentStep('location'), 1600);
          } else {
            setErrorMessage('దయచేసి 10 అంకెల మొబైల్ నంబర్ సరిగ్గా చెప్పండి.');
            speakAloud('దయచేసి 10 అంకెల మొబైల్ నంబర్ సరిగ్గా చెప్పండి.', selectedLang);
          }

        } else if (step === 'location') {
          setFarmerData(prev => ({
            ...prev,
            village: data.village || prev.village || 'Velvadam',
            mandal: data.mandal || prev.mandal || 'Mylavaram',
            district: data.district || prev.district || 'NTR District',
            state: data.state || prev.state || 'Andhra Pradesh'
          }));
          if (data.audioFeedback) {
            speakAloud(data.audioFeedback, selectedLang);
          }
          setTimeout(() => setCurrentStep('cropAndLand'), 1600);

        } else if (step === 'cropAndLand') {
          setFarmerData(prev => ({
            ...prev,
            crop: data.crop || prev.crop,
            landDetails: data.landDetails || prev.landDetails,
            farmerId: data.farmerId || prev.farmerId
          }));
          if (data.audioFeedback) {
            speakAloud(data.audioFeedback, selectedLang);
          }
          setTimeout(() => setCurrentStep('credentials'), 1600);

        } else if (step === 'credentials') {
          const pass = data.password || '123456';
          setFarmerData(prev => ({
            ...prev,
            password: pass
          }));
          if (data.audioFeedback) {
            speakAloud(data.audioFeedback, selectedLang);
          }
          setTimeout(() => setCurrentStep('review'), 1600);
        }
      }
    } catch (err) {
      setIsProcessing(false);
      console.warn('Voice parse error:', err);
    }
  };

  // Submit and Finalize Registration
  const handleFinalizeRegistration = async () => {
    setIsSubmittingFinal(true);
    setErrorMessage(null);
    stopSpeaking();

    // Ensure email exists (auto-generate official farmer email if farmer didn't type custom one)
    const effectiveEmail = farmerData.email || `${farmerData.mobile}@farmer.procureease.gov.in`;
    const effectivePass = farmerData.password || '123456';

    try {
      // Step A: Request OTP
      const otpRes = await requestSignupOtp(effectiveEmail);
      setIsSubmittingFinal(false);

      if (otpRes.success) {
        setRequiresOtpVerification(true);
        if (otpRes.notice) setOtpNotice(otpRes.notice);
        setResendCooldown(60);

        // Announce aloud
        speakAloud(
          selectedLang === 'te'
            ? 'ధృవీకరణ కోడ్ పంపబడింది. దయచేసి మైక్ నొక్కి 6 అంకెల కోడ్ చెప్పండి.'
            : 'Verification code sent. Please say the 6-digit code or enter it below.',
          selectedLang
        );
      } else {
        // Direct attempt with default OTP code if local mode
        submitOtpAndCreateUser('123456', effectiveEmail, effectivePass);
      }
    } catch (e: any) {
      setIsSubmittingFinal(false);
      setErrorMessage(e.message || 'Registration error');
    }
  };

  // Submit OTP
  const submitOtpAndCreateUser = async (codeToVerify: string, emailStr?: string, passStr?: string) => {
    setIsSubmittingFinal(true);
    setErrorMessage(null);

    const email = emailStr || farmerData.email || `${farmerData.mobile}@farmer.procureease.gov.in`;
    const password = passStr || farmerData.password || '123456';

    const result = await registerFarmer(
      {
        name: farmerData.name || 'రైతు సోదరుడు',
        mobile: farmerData.mobile,
        email,
        password,
        address: `${farmerData.village}, ${farmerData.mandal}`,
        village: farmerData.village || 'Velvadam',
        mandal: farmerData.mandal || 'Mylavaram',
        district: farmerData.district || 'NTR District',
        state: farmerData.state || 'Andhra Pradesh',
        preferredLanguage: selectedLang,
        farmerId: farmerData.farmerId || `AP/NTR/2026/${Math.floor(1000 + Math.random() * 9000)}`,
        landDetails: farmerData.landDetails || '5.0',
        mainCrop: farmerData.crop || 'Paddy (Grade-A)'
      },
      codeToVerify
    );

    setIsSubmittingFinal(false);

    if (result.success) {
      // Update global context profile
      setProfile(prev => ({
        ...prev,
        name: farmerData.name,
        mobile: farmerData.mobile,
        village: farmerData.village,
        mandal: farmerData.mandal,
        district: farmerData.district,
        state: farmerData.state,
        landAcres: parseFloat(farmerData.landDetails) || 5.0,
        surveyPassbookNo: farmerData.farmerId
      }));

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }

      // Announce aloud
      speakAloud(
        selectedLang === 'te'
          ? `${farmerData.name} గారు, మీ రైతు ఖాతా విజయవంతంగా సృష్టించబడింది! ప్రొక్యూర్‌ఈజ్ కి స్వాగతం.`
          : `Congratulations ${farmerData.name}! Your farmer account is now active. Welcome to ProcureEase.`,
        selectedLang
      );

      showToast(`🎉 రైతు ఖాతా విజయవంతంగా తెరవబడింది: ${farmerData.name}`);

      if (onSuccess) {
        onSuccess(farmerData);
      }

      setTimeout(() => {
        onClose();
        navigate('/dashboard');
      }, 2500);
    } else {
      setErrorMessage(result.error || 'Invalid verification OTP. Please try again.');
    }
  };

  // Voice input for OTP
  const handleVoiceInputOtp = () => {
    stopSpeaking();
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const rec = new SpeechRecognition();
      rec.lang = selectedLang === 'te' ? 'te-IN' : selectedLang === 'hi' ? 'hi-IN' : 'en-IN';
      rec.continuous = false;
      rec.interimResults = false;
      setIsListening(true);

      rec.onresult = (e: any) => {
        const spoken = e.results[0][0].transcript;
        const digits = spoken.replace(/\D/g, '');
        if (digits.length >= 6) {
          const code = digits.slice(-6);
          setOtpCode(code);
          submitOtpAndCreateUser(code);
        } else {
          setOtpCode(spoken.trim());
        }
        setIsListening(false);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      rec.start();
    } catch {
      setIsListening(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header: Voice Assistant Identity & Language Switcher */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-4 sm:p-5 relative">
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              stopListening();
              onClose();
            }}
            className="absolute right-4 top-4 text-emerald-300 hover:text-white transition p-1.5 rounded-full hover:bg-emerald-800/50 cursor-pointer"
            title="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shrink-0">
              <Sparkles className="w-6 h-6 text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  AI Voice Registration
                </span>
                <span className="text-[10px] text-emerald-200">రైతు నమోదు సహాయకుడు</span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-heading mt-0.5">
                {selectedLang === 'te'
                  ? '🎙️ మాట్లాడి ఖాతా తెరవండి (Voice Sign-up)'
                  : selectedLang === 'hi'
                  ? '🎙️ बोलकर खाता बनाएं (Voice Sign-up)'
                  : '🎙️ Step-by-Step Voice Registration'}
              </h2>
            </div>
          </div>

          {/* Language Selector Pills */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-emerald-800/60">
            <span className="text-xs text-emerald-200 font-medium flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-amber-300" />
              భాష (Language):
            </span>
            <div className="flex items-center gap-1.5 bg-emerald-950/60 p-1 rounded-xl border border-emerald-700/40">
              <button
                type="button"
                onClick={() => {
                  setSelectedLang('te');
                  speakAloud(stepPrompts[currentStep].te, 'te');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedLang === 'te'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                తెలుగు (Telugu)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedLang('hi');
                  speakAloud(stepPrompts[currentStep].hi, 'hi');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedLang === 'hi'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                हिंदी (Hindi)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedLang('en');
                  speakAloud(stepPrompts[currentStep].en, 'en');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedLang === 'en'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        {/* Step Progression Indicator */}
        {!requiresOtpVerification && (
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {(['name', 'mobile', 'location', 'cropAndLand', 'credentials', 'review'] as VoiceSignupStep[]).map(
                (stepKey, idx) => {
                  const isCurrent = currentStep === stepKey;
                  const isCompleted =
                    (stepKey === 'name' && farmerData.name) ||
                    (stepKey === 'mobile' && farmerData.mobile) ||
                    (stepKey === 'location' && farmerData.village) ||
                    (stepKey === 'cropAndLand' && farmerData.crop) ||
                    (stepKey === 'credentials' && farmerData.password);

                  return (
                    <div key={stepKey} className="flex items-center">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(stepKey)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-800 text-white ring-2 ring-emerald-400'
                            : isCompleted
                            ? 'bg-emerald-200 text-emerald-950 font-bold'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                        title={stepKey}
                      >
                        {idx + 1}
                      </button>
                      {idx < 5 && <div className="w-3 sm:w-6 h-0.5 bg-slate-200 mx-0.5" />}
                    </div>
                  );
                }
              )}
            </div>
            <span className="text-[11px] font-bold text-slate-600">
              {currentStep === 'name' && 'స్టెప్ 1: పేరు'}
              {currentStep === 'mobile' && 'స్టెప్ 2: మొబైల్'}
              {currentStep === 'location' && 'స్టెప్ 3: ఊరు / మండలం'}
              {currentStep === 'cropAndLand' && 'స్టెప్ 4: పంట & భూమి'}
              {currentStep === 'credentials' && 'స్టెప్ 5: పిన్ / పాస్‌వర్డ్'}
              {currentStep === 'review' && 'స్టెప్ 6: ధృవీకరణ'}
            </span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="flex-1 font-medium">{errorMessage}</span>
            </div>
          )}

          {/* OTP Step Screen */}
          {requiresOtpVerification ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
                <ShieldCheck className="w-8 h-8 text-emerald-800" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading">
                {selectedLang === 'te' ? '🔐 భద్రతా కోడ్ ధృవీకరణ' : '🔐 Verify 6-Digit Code'}
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                {selectedLang === 'te'
                  ? `మీ ఇమెయిల్ (${farmerData.email}) కు పంపిన 6 అంకెల కోడ్‌ను నమోదు చేయండి లేదా మైక్ నొక్కి చెప్పండి.`
                  : `Please enter or speak the 6-digit verification code dispatched to ${farmerData.email}.`}
              </p>

              {otpNotice && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs max-w-sm mx-auto text-left">
                  {otpNotice}
                </div>
              )}

              {/* Spoken / Typed OTP Input with Mic Button */}
              <div className="max-w-xs mx-auto relative">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center text-3xl font-black font-mono tracking-widest py-3 px-12 rounded-2xl border-2 border-emerald-700 focus:ring-4 focus:ring-emerald-200 outline-none bg-slate-50 text-slate-900 shadow-inner"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleVoiceInputOtp}
                  title="Speak OTP Code"
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition cursor-pointer ${
                    isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-800 text-white hover:bg-emerald-900'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => submitOtpAndCreateUser(otpCode)}
                  disabled={isSubmittingFinal || otpCode.length !== 6}
                  className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  <span>{isSubmittingFinal ? 'ధృవీకరిస్తున్నాము...' : 'కోడ్ నిర్ధారించండి (Confirm OTP)'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRequiresOtpVerification(false)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  రద్దు (Back)
                </button>
              </div>
            </div>
          ) : (
            /* STEP-BY-STEP CONVERSATIONAL VIEW */
            <>
              {/* AI Voice Question Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 shadow-xs relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                      <Volume2 className={`w-5 h-5 ${isSpeakingTts ? 'animate-bounce text-amber-300' : ''}`} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                        {stepPrompts[currentStep].titleTe}
                      </span>
                      <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug mt-0.5">
                        {stepPrompts[currentStep][selectedLang]}
                      </p>
                    </div>
                  </div>

                  {/* Replay Audio Prompt Button */}
                  <button
                    type="button"
                    onClick={() => speakAloud(stepPrompts[currentStep][selectedLang], selectedLang)}
                    className="p-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition cursor-pointer shrink-0"
                    title="Replay speech prompt"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Microphone Listening Wave Hero */}
              <div className="text-center py-3">
                <div className="relative inline-block">
                  {isListening && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                      <div className="absolute -inset-3 rounded-full bg-emerald-500/20 animate-pulse" />
                    </>
                  )}
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`relative z-10 w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center shadow-xl transition transform active:scale-95 cursor-pointer ${
                      isListening
                        ? 'bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-red-500/40 scale-105'
                        : 'bg-gradient-to-tr from-emerald-700 to-teal-800 text-white hover:from-emerald-800 hover:to-teal-900 shadow-emerald-900/30'
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="w-10 h-10 animate-pulse" />
                    ) : (
                      <Mic className="w-10 h-10" />
                    )}
                  </button>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-bold text-slate-800">
                    {isListening
                      ? '🎙️ వింటున్నాము... ఇప్పుడు మాట్లాడండి (Listening... Please Speak)'
                      : '👆 మైక్ బటన్ నొక్కి మాట్లాడండి (Tap Mic to Speak)'}
                  </p>
                  {transcript && (
                    <div className="mt-2 p-2.5 bg-slate-100 rounded-xl max-w-md mx-auto text-xs text-slate-700 italic border border-slate-200">
                      &quot;{transcript}&quot;
                    </div>
                  )}
                </div>
              </div>

              {/* Step Specific Extracted Field Card & Quick Tap Options */}
              {currentStep === 'name' && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <User className="w-5 h-5 text-emerald-800 shrink-0" />
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-slate-600">నమోదైన పేరు (Recorded Name):</label>
                      <input
                        type="text"
                        value={farmerData.name}
                        onChange={(e) => setFarmerData({ ...farmerData, name: e.target.value })}
                        placeholder="ఉదా: బండి రామయ్య"
                        className="w-full text-sm font-bold text-slate-900 bg-transparent outline-none"
                      />
                    </div>
                    {farmerData.name && <CheckCircle2 className="w-5 h-5 text-emerald-700" />}
                  </div>

                  {/* One-tap voice sample simulation */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400 font-medium">ఉదాహరణలు:</span>
                    {['రామయ్య', 'లక్ష్మయ్య', 'వెంకటేశ్వరరావు', 'శ్రీనివాసరెడ్డి'].map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => {
                          setFarmerData({ ...farmerData, name: sample });
                          speakAloud(`${sample} గారు, మీ పేరు నమోదు చేశాము.`, selectedLang);
                          setTimeout(() => setCurrentStep('mobile'), 1200);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition cursor-pointer"
                      >
                        🗣️ {sample}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 'mobile' && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <Phone className="w-5 h-5 text-emerald-800 shrink-0" />
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-slate-600">10 అంకెల మొబైల్ నంబర్:</label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={farmerData.mobile}
                        onChange={(e) => setFarmerData({ ...farmerData, mobile: e.target.value.replace(/\D/g, '') })}
                        placeholder="9848012345"
                        className="w-full text-base font-bold font-mono text-slate-900 bg-transparent outline-none"
                      />
                    </div>
                    {farmerData.mobile.length === 10 && <CheckCircle2 className="w-5 h-5 text-emerald-700" />}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400 font-medium">నమూనా:</span>
                    {['9848012345', '9989012345', '9440112233'].map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => {
                          setFarmerData({ ...farmerData, mobile: sample, email: `${sample}@farmer.procureease.gov.in` });
                          speakAloud(`మొబైల్ నంబర్ ${sample} నమోదు చేశాము.`, selectedLang);
                          setTimeout(() => setCurrentStep('location'), 1200);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold transition cursor-pointer"
                      >
                        📱 {sample}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 'location' && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <label className="block text-[11px] font-bold text-slate-600">గ్రామం (Village):</label>
                      <input
                        type="text"
                        value={farmerData.village}
                        onChange={(e) => setFarmerData({ ...farmerData, village: e.target.value })}
                        placeholder="ఉదా: వెల్వదం"
                        className="w-full text-sm font-bold text-slate-900 bg-transparent outline-none"
                      />
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <label className="block text-[11px] font-bold text-slate-600">మండలం (Mandal):</label>
                      <input
                        type="text"
                        value={farmerData.mandal}
                        onChange={(e) => setFarmerData({ ...farmerData, mandal: e.target.value })}
                        placeholder="ఉదా: మైలవరం"
                        className="w-full text-sm font-bold text-slate-900 bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Common APMC AP Villages */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400 font-medium">ఎంచుకోండి:</span>
                    {[
                      { v: 'వెల్వదం (Velvadam)', m: 'మైలవరం' },
                      { v: 'గొల్లపూడి (Gollapudi)', m: 'విజయవాడ రూరల్' },
                      { v: 'తిరువూరు (Tiruvuru)', m: 'తిరువూరు' },
                      { v: 'నందిగామ (Nandigama)', m: 'నందిగామ' }
                    ].map((item) => (
                      <button
                        key={item.v}
                        type="button"
                        onClick={() => {
                          const vName = item.v.split(' ')[0];
                          setFarmerData({ ...farmerData, village: vName, mandal: item.m });
                          speakAloud(`గ్రామం ${vName}, మండలం ${item.m} నమోదు చేశాము.`, selectedLang);
                          setTimeout(() => setCurrentStep('cropAndLand'), 1200);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition cursor-pointer"
                      >
                        📍 {item.v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 'cropAndLand' && (
                <div className="space-y-3 pt-1">
                  <label className="block text-[11px] font-bold text-slate-700">ప్రధాన పంటను ఎంచుకోండి లేదా మాట్లాడండి:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'Paddy (Grade-A)', label: 'వరి (Paddy)', icon: '🌾' },
                      { id: 'Maize', label: 'మొక్కజొన్న (Maize)', icon: '🌽' },
                      { id: 'Cotton', label: 'పత్తి (Cotton)', icon: '☁️' },
                      { id: 'Groundnut', label: 'వేరుశెనగ (Groundnut)', icon: '🥜' },
                      { id: 'Wheat', label: 'గోధుమ (Wheat)', icon: '🌱' }
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setFarmerData({ ...farmerData, crop: c.id })}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                          farmerData.crop === c.id
                            ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-300 text-emerald-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xl">{c.icon}</span>
                        <span className="text-xs">{c.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <Tractor className="w-5 h-5 text-emerald-800 shrink-0" />
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-slate-600">సాగు భూమి (ఎకరాలు / Acres):</label>
                      <input
                        type="number"
                        step="0.5"
                        value={farmerData.landDetails}
                        onChange={(e) => setFarmerData({ ...farmerData, landDetails: e.target.value })}
                        placeholder="5.0"
                        className="w-full text-sm font-bold text-slate-900 bg-transparent outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {['2.5', '5.0', '10.0'].map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setFarmerData({ ...farmerData, landDetails: a })}
                          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-emerald-50"
                        >
                          {a} ఎక
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'credentials' && (
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600">ఖాతా లాగిన్ పిన్ / పాస్‌వర్డ్ (6 అంకెలు):</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Lock className="w-4 h-4 text-emerald-800 shrink-0" />
                      <input
                        type="text"
                        value={farmerData.password}
                        onChange={(e) => setFarmerData({ ...farmerData, password: e.target.value })}
                        placeholder="ఉదా: 123456 లేదా రహస్య పిన్"
                        className="w-full text-base font-mono font-bold text-slate-900 bg-transparent outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      తదుపరి సారి లాగిన్ కావడానికి ఈ 6 అంకెల పిన్ సరిపోతుంది.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400 font-medium">సులభ పిన్:</span>
                    {['123456', '984801', '202688'].map((pin) => (
                      <button
                        key={pin}
                        type="button"
                        onClick={() => {
                          setFarmerData({ ...farmerData, password: pin });
                          speakAloud(`పాస్‌వర్డ్ ${pin} గా సెట్ చేయబడింది.`, selectedLang);
                          setTimeout(() => setCurrentStep('review'), 1200);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-mono font-bold transition cursor-pointer"
                      >
                        🔑 {pin}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 'review' && (
                <div className="space-y-3 pt-1">
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                      <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                        రైతు రిజిస్ట్రేషన్ సారాంశం (Summary)
                      </span>
                      <span className="text-[11px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-md">
                        ధృవీకరించండి
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">పేరు (Name):</span>
                        <span className="font-bold text-slate-900">{farmerData.name || 'రైతు సోదరుడు'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">మొబైల్ (Mobile):</span>
                        <span className="font-bold font-mono text-slate-900">{farmerData.mobile || '9848012345'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">గ్రామం & మండలం:</span>
                        <span className="font-bold text-slate-900">{farmerData.village || 'Velvadam'}, {farmerData.mandal || 'Mylavaram'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">పంట & భూమి:</span>
                        <span className="font-bold text-slate-900">{farmerData.crop} ({farmerData.landDetails} ఎకరాలు)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFinalizeRegistration}
                    disabled={isSubmittingFinal || !farmerData.mobile}
                    className="w-full py-4 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-900/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{isSubmittingFinal ? 'ఖాతా నమోదు చేస్తున్నాము...' : '✅ అవును, ఖాతా సృష్టించండి (Confirm & Register)'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Navigation Controls: Back / Next */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {currentStep !== 'name' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const steps: VoiceSignupStep[] = ['name', 'mobile', 'location', 'cropAndLand', 'credentials', 'review'];
                      const prevIdx = Math.max(0, steps.indexOf(currentStep) - 1);
                      setCurrentStep(steps[prevIdx]);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>మునుపటి (Back)</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep !== 'review' && (
                  <button
                    type="button"
                    onClick={() => {
                      const steps: VoiceSignupStep[] = ['name', 'mobile', 'location', 'cropAndLand', 'credentials', 'review'];
                      const nextIdx = Math.min(steps.length - 1, steps.indexOf(currentStep) + 1);
                      setCurrentStep(steps[nextIdx]);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>తదుపరి (Next)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
