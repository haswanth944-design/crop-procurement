import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { mockCrops, mockCentres } from '../../data/mockData';
import confetti from 'canvas-confetti';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Calendar,
  Clock,
  Building2,
  Scale,
  QrCode,
  Printer,
  ArrowRight,
  X,
  Phone,
  User,
  Sprout,
  Check
} from 'lucide-react';

interface VoiceTokenBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete?: (booking: any) => void;
}

export const VoiceTokenBookingModal: React.FC<VoiceTokenBookingModalProps> = ({
  isOpen,
  onClose,
  onBookingComplete
}) => {
  const { addNewBooking, navigate, showToast, language: appLanguage } = useApp();

  // Selected language for speech recognition and TTS ('te' | 'hi' | 'en')
  const [selectedLang, setSelectedLang] = useState<'te' | 'hi' | 'en'>(
    appLanguage === 'te' || appLanguage === 'hi' ? appLanguage : 'te'
  );

  // Listening state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeakingTts, setIsSpeakingTts] = useState(false);

  // Extracted/Parsed Booking Fields
  const [parsedData, setParsedData] = useState<{
    crop: string;
    cropId: string;
    quantityQuintals: number;
    centreName: string;
    centreId: string;
    farmerName: string;
    mobileNumber: string;
    date: string;
    timeSlot: string;
    audioFeedback?: string;
  }>({
    crop: 'Paddy (Grade-A)',
    cropId: 'paddy',
    quantityQuintals: 30,
    centreName: 'Mylavaram Procurement Centre',
    centreId: 'centre-1',
    farmerName: '',
    mobileNumber: '',
    date: '13 September 2026',
    timeSlot: '10:30 AM - 11:00 AM',
    audioFeedback: ''
  });

  // Success Confirmation State
  const [issuedBooking, setIssuedBooking] = useState<{
    token: string;
    id: string;
    crop: string;
    quantityQuintals: number;
    centreName: string;
    date: string;
    timeSlot: string;
    farmerName: string;
    farmerMobile: string;
  } | null>(null);

  const recognitionRef = useRef<any>(null);

  // Text-To-Speech (TTS) Voice Audio Prompt
  const speakAloud = (text: string, langCode: 'te' | 'hi' | 'en' = selectedLang) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode === 'te' ? 'te-IN' : langCode === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeakingTts(true);
      utterance.onend = () => setIsSpeakingTts(false);
      utterance.onerror = () => setIsSpeakingTts(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS not supported or interrupted:', e);
      setIsSpeakingTts(false);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingTts(false);
    }
  };

  // Welcome announcement when modal opens
  useEffect(() => {
    if (isOpen && !issuedBooking) {
      const welcomeMessage =
        selectedLang === 'te'
          ? 'నమస్కారం! మైక్ బటన్ నొక్కి మీ పేరు, పంట, మరియు బస్తాల సంఖ్య చెప్పండి.'
          : selectedLang === 'hi'
          ? 'नमस्ते! माइक बटन दबाकर अपनी फसल, मात्रा और केंद्र का नाम बोलें।'
          : 'Welcome! Tap the microphone and speak your crop, quantity, and centre name to book your token.';

      const timer = setTimeout(() => {
        speakAloud(welcomeMessage, selectedLang);
      }, 500);

      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    }
  }, [isOpen, selectedLang]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Web Speech API Initialization & Toggle
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    stopSpeaking();
    setErrorMessage(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        'Speech recognition is not supported in this browser. You can use the quick voice options below.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLang === 'te' ? 'te-IN' : selectedLang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permission in your browser.');
        } else if (event.error === 'no-speech') {
          setErrorMessage('No speech was detected. Please tap the microphone and speak clearly.');
        } else {
          setErrorMessage('Could not understand speech. Please try speaking again.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
      setErrorMessage('Failed to start microphone. Please try again.');
    }
  };

  // When transcript updates, automatically parse details via backend Gemini / local heuristic
  const handleParseTranscript = async (spokenText: string) => {
    if (!spokenText.trim()) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/parse-voice-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: spokenText,
          language: selectedLang
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setParsedData(prev => ({
          ...prev,
          crop: d.crop || prev.crop,
          cropId: d.cropId || prev.cropId,
          quantityQuintals: d.quantityQuintals || prev.quantityQuintals,
          centreName: d.centreName || prev.centreName,
          centreId: d.centreId || prev.centreId,
          farmerName: d.farmerName || prev.farmerName,
          mobileNumber: d.mobileNumber || prev.mobileNumber,
          date: d.date || prev.date,
          timeSlot: d.timeSlot || prev.timeSlot,
          audioFeedback: d.audioFeedback
        }));

        if (d.audioFeedback) {
          speakAloud(d.audioFeedback, selectedLang);
        }
      } else {
        // Local client heuristic fallback
        runLocalHeuristic(spokenText);
      }
    } catch (e) {
      runLocalHeuristic(spokenText);
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger parsing whenever user stops speaking and has transcript
  useEffect(() => {
    if (!isListening && transcript.trim().length > 2) {
      handleParseTranscript(transcript);
    }
  }, [isListening]);

  // Local fallback parser
  const runLocalHeuristic = (text: string) => {
    const lower = text.toLowerCase();
    let crop = 'Paddy (Grade-A)';
    let cropId = 'paddy';
    if (lower.includes('వరి') || lower.includes('ధాన్యం') || lower.includes('paddy') || lower.includes('dhan')) {
      crop = 'Paddy (Grade-A)';
      cropId = 'paddy';
    } else if (lower.includes('గోధుమ') || lower.includes('wheat') || lower.includes('gehun')) {
      crop = 'Wheat';
      cropId = 'wheat';
    } else if (lower.includes('మొక్కజొన్న') || lower.includes('maize') || lower.includes('corn')) {
      crop = 'Maize (Corn)';
      cropId = 'maize';
    } else if (lower.includes('పత్తి') || lower.includes('cotton')) {
      crop = 'Cotton (Medium Staple)';
      cropId = 'cotton';
    }

    const numMatch = lower.match(/\b(\d+)\b/);
    let qty = 30;
    if (numMatch) {
      const val = parseInt(numMatch[1], 10);
      if (val > 0 && val <= 300) qty = val;
    }

    let centreName = 'Mylavaram Procurement Centre';
    let centreId = 'centre-1';
    if (lower.includes('గొల్లపూడి') || lower.includes('gollapudi')) {
      centreName = 'Gollapudi Procurement Centre';
      centreId = 'centre-2';
    } else if (lower.includes('విజయవాడ') || lower.includes('vijayawada')) {
      centreName = 'Vijayawada Central APMC Yard';
      centreId = 'centre-3';
    } else if (lower.includes('ఇబ్రహీంపట్నం') || lower.includes('ibrahimpatnam')) {
      centreName = 'Ibrahimpatnam Grain Terminal';
      centreId = 'centre-4';
    }

    const phoneMatch = lower.match(/\b([6-9]\d{9})\b/);
    const mobile = phoneMatch ? phoneMatch[1] : '';

    setParsedData(prev => ({
      ...prev,
      crop,
      cropId,
      quantityQuintals: qty,
      centreName,
      centreId,
      mobileNumber: mobile || prev.mobileNumber
    }));

    const feedback =
      selectedLang === 'te'
        ? `మీరు ${crop} ${qty} క్వింటాళ్లు ${centreName} వద్ద నమోదు చేయాలని గుర్తించబడింది.`
        : `Captured: ${qty} quintals of ${crop} at ${centreName}.`;
    speakAloud(feedback, selectedLang);
  };

  // Quick Spoken Example Prompts for One-Tap Voice Simulation
  const sampleVoicePrompts = [
    {
      labelTe: '🌾 40 బస్తాల వరి ధాన్యం మైలవరం కేంద్రానికి',
      labelEn: '🌾 40 bags paddy at Mylavaram Centre',
      speech: 'నా పేరు రామయ్య, 40 బస్తాల వరి ధాన్యం మైలవరం సెంటర్ లో రేపటికి బుక్ చేయండి, ఫోన్ నంబర్ 9848123456'
    },
    {
      labelTe: '🌽 50 క్వింటాళ్ల మొక్కజొన్న గొల్లపూడి కి',
      labelEn: '🌽 50 quintals maize at Gollapudi Centre',
      speech: '50 క్వింటాళ్ల మొక్కజొన్న గొల్లపూడి ప్రొక్యూర్మెంట్ కేంద్రానికి బుక్ చేయండి'
    },
    {
      labelTe: '☁️ 25 క్వింటాళ్ల పత్తి విజయవాడ APMC కి',
      labelEn: '☁️ 25 quintals cotton at Vijayawada APMC',
      speech: '25 క్వింటాళ్ల పత్తి విజయవాడ సెంట్రల్ యార్డ్ కు రేపు ఉదయం బుక్ చేయండి'
    }
  ];

  // Final Action: Confirm and Book Official Token
  const handleConfirmAndIssueToken = () => {
    stopSpeaking();

    const booking = addNewBooking({
      farmerName: parsedData.farmerName || 'రైతు (Farmer)',
      farmerMobile: parsedData.mobileNumber || '9848012345',
      crop: parsedData.crop,
      quantityQuintals: parsedData.quantityQuintals,
      centreId: parsedData.centreId,
      centreName: parsedData.centreName,
      date: parsedData.date,
      timeSlot: parsedData.timeSlot
    });

    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch {}

    const successBookingData = {
      token: booking.token,
      id: booking.id,
      crop: booking.crop,
      quantityQuintals: booking.quantityQuintals,
      centreName: booking.centreName,
      date: booking.date,
      timeSlot: booking.timeSlot,
      farmerName: booking.farmerName,
      farmerMobile: booking.farmerMobile
    };

    setIssuedBooking(successBookingData);
    if (onBookingComplete) {
      onBookingComplete(successBookingData);
    }

    showToast(`🎉 Token ${booking.token} booked successfully by voice!`);

    // Voice announcement of the issued token
    const successSpeech =
      selectedLang === 'te'
        ? `అభినందనలు! మీ టోకెన్ సంఖ్య ${booking.token} జారీ చేయబడింది. ${booking.date} రోజున ${booking.centreName} కి రండి. మీ మొబైల్ కి వివరాలు పంపబడ్డాయి.`
        : selectedLang === 'hi'
        ? `बधाई हो! आपका टोकन नंबर ${booking.token} जारी हो गया है। ${booking.date} को ${booking.centreName} पर आएं।`
        : `Congratulations! Your token number ${booking.token} has been confirmed for ${booking.centreName} on ${booking.date}.`;

    setTimeout(() => {
      speakAloud(successSpeech, selectedLang);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div
      id="voice-booking-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-auto">
        
        {/* Header Banner - High contrast & rural friendly */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 text-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700/80 border border-emerald-400/40 flex items-center justify-center text-amber-300 shadow-inner">
                <Mic className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>వాయిస్ టోకెన్ బుకింగ్</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Voice Assist
                  </span>
                </h3>
                <p className="text-xs text-emerald-100/90 mt-0.5 font-medium">
                  రైతులు మాట్లాడి సులభంగా కొత్త టోకెన్ బుక్ చేసుకోండి
                </p>
              </div>
            </div>

            <button
              type="button"
              id="voice-modal-close-btn"
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-200 hover:text-white flex items-center justify-center transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Language Selector Chips */}
          <div className="mt-4 flex items-center gap-2 pt-3 border-t border-emerald-700/60 text-xs">
            <span className="text-emerald-200 font-medium">భాష / Language:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedLang('te');
                  speakAloud('తెలుగు భాష ఎంపిక చేయబడింది. మైక్ నొక్కి మాట్లాడండి.', 'te');
                }}
                className={`py-1 px-3 rounded-full font-bold transition cursor-pointer ${
                  selectedLang === 'te'
                    ? 'bg-amber-400 text-slate-900 shadow-xs'
                    : 'bg-emerald-800/60 text-emerald-100 hover:bg-emerald-700/80'
                }`}
              >
                తెలుగు (Telugu)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedLang('hi');
                  speakAloud('हिंदी भाषा चुनी गई है। माइक दबाकर बोलें।', 'hi');
                }}
                className={`py-1 px-3 rounded-full font-bold transition cursor-pointer ${
                  selectedLang === 'hi'
                    ? 'bg-amber-400 text-slate-900 shadow-xs'
                    : 'bg-emerald-800/60 text-emerald-100 hover:bg-emerald-700/80'
                }`}
              >
                हिन्दी (Hindi)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedLang('en');
                  speakAloud('English selected. Tap the microphone and speak.', 'en');
                }}
                className={`py-1 px-3 rounded-full font-bold transition cursor-pointer ${
                  selectedLang === 'en'
                    ? 'bg-amber-400 text-slate-900 shadow-xs'
                    : 'bg-emerald-800/60 text-emerald-100 hover:bg-emerald-700/80'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        {/* MODAL CONTENT */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* SUCCESS SCREEN IF TOKEN WAS ISSUED */}
          {issuedBooking ? (
            <div className="text-center space-y-5 animate-fade-in py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-block py-1 px-3.5 bg-emerald-100 text-emerald-900 font-extrabold text-xs rounded-full uppercase tracking-wider mb-2">
                  ✅ టోకెన్ జారీ చేయబడింది / TOKEN CONFIRMED
                </span>
                <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                  {issuedBooking.token}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  బుకింగ్ సంఖ్య: <span className="font-semibold text-slate-700">{issuedBooking.id}</span>
                </p>
              </div>

              {/* Visual Token Pass Card */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50 to-teal-50/50 border-2 border-emerald-300 rounded-2xl text-left space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                      రైతు పేరు / Farmer
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {issuedBooking.farmerName || 'రైతు'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                      మొబైల్ సంఖ్య / Phone
                    </span>
                    <span className="text-sm font-mono font-bold text-slate-900">
                      {issuedBooking.farmerMobile}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                  <div>
                    <span className="text-slate-500 block font-medium">పంట / Crop:</span>
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1">
                      🌾 {issuedBooking.crop}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">పరిమాణం / Quantity:</span>
                    <span className="font-bold text-emerald-900 text-sm">
                      {issuedBooking.quantityQuintals} క్వింటాళ్లు (Qtl)
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block font-medium">సేకరణ కేంద్రం / Centre:</span>
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      {issuedBooking.centreName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">తేదీ / Date:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {issuedBooking.date}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">సమయం / Time:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {issuedBooking.timeSlot}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Confirmed Token */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  id="voice-token-speak-details-btn"
                  onClick={() => {
                    const readout =
                      selectedLang === 'te'
                        ? `మీ టోకెన్ సంఖ్య ${issuedBooking.token}. ${issuedBooking.quantityQuintals} క్వింటాళ్ల ${issuedBooking.crop} కోసం ${issuedBooking.centreName} వద్ద సిద్ధంగా ఉంది.`
                        : `Your token number is ${issuedBooking.token} for ${issuedBooking.quantityQuintals} quintals of ${issuedBooking.crop}.`;
                    speakAloud(readout, selectedLang);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-emerald-800" />
                  <span>టోకెన్ వినండి (Read Aloud)</span>
                </button>

                <button
                  type="button"
                  id="voice-token-go-queue-btn"
                  onClick={() => {
                    stopSpeaking();
                    onClose();
                    navigate('/queue');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <span>లైవ్ క్యూ చూడండి (Live Queue)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIssuedBooking(null);
                  setTranscript('');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline cursor-pointer"
              >
                మరో టోకెన్ బుక్ చేయండి / Book Another Token
              </button>
            </div>
          ) : (
            <>
              {/* BIG MICROPHONE INTERACTION HERO */}
              <div className="text-center py-2">
                <div className="relative inline-flex items-center justify-center mb-3">
                  {/* Outer pulsating wave if listening */}
                  {isListening && (
                    <>
                      <div className="absolute w-28 h-28 rounded-full bg-emerald-400/30 animate-ping" />
                      <div className="absolute w-36 h-36 rounded-full bg-emerald-300/20 animate-pulse" />
                    </>
                  )}

                  <button
                    type="button"
                    id="farmer-voice-mic-trigger"
                    onClick={toggleListening}
                    disabled={isProcessing}
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg transform active:scale-95 ${
                      isListening
                        ? 'bg-red-600 text-white shadow-red-300 scale-105'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-200 hover:shadow-emerald-300'
                    }`}
                    aria-label={isListening ? 'Stop listening' : 'Start microphone'}
                  >
                    {isListening ? (
                      <MicOff className="w-10 h-10 animate-pulse" />
                    ) : (
                      <Mic className="w-10 h-10" />
                    )}
                  </button>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {isListening
                      ? '🎙️ వింటున్నాము... మాట్లాడండి (Listening...)'
                      : isProcessing
                      ? '⏳ వివరాలను విశ్లేషిస్తున్నాము... (Processing...)'
                      : 'మైక్రోఫోన్ నొక్కి వివరాలు చెప్పండి (Tap Mic & Speak)'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {selectedLang === 'te'
                      ? 'ఉదాహరణకు: "నా పేరు రామయ్య, 40 బస్తాల వరి ధాన్యం మైలవరం కేంద్రానికి రేపటికి బుక్ చేయండి"'
                      : 'Say your name, crop, quantity and centre name'}
                  </p>
                </div>
              </div>

              {/* LIVE TRANSCRIPT BUBBLE */}
              {transcript && (
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 uppercase">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      మీరు మాట్లాడిన మాటలు (Recognized Speech):
                    </span>
                    {isListening && <span className="animate-pulse text-red-600">● Live</span>}
                  </div>
                  <p className="text-sm font-semibold text-slate-900 leading-relaxed font-sans">
                    "{transcript}"
                  </p>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* QUICK SAMPLE VOICE CLICKS FOR UNEDUCATED FARMERS */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  సులభమైన ఉదాహరణ మాటలు (Tap to Try Sample Voice):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {sampleVoicePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTranscript(p.speech);
                        handleParseTranscript(p.speech);
                      }}
                      className="py-2 px-2.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-left text-xs text-slate-700 font-medium transition cursor-pointer truncate"
                    >
                      {selectedLang === 'te' ? p.labelTe : p.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* EXTRACTED BOOKING SUMMARY CARD - HIGH VISIBILITY */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    గుర్తించిన వివరాలు / Captured Booking Details:
                  </span>
                  
                  {/* TTS Voice button */}
                  <button
                    type="button"
                    onClick={() => {
                      const readout =
                        selectedLang === 'te'
                          ? `మీరు ${parsedData.crop} ${parsedData.quantityQuintals} క్వింటాళ్లు ${parsedData.centreName} వద్ద బుక్ చేయడానికి సిద్ధంగా ఉన్నారు.`
                          : `Captured: ${parsedData.quantityQuintals} quintals of ${parsedData.crop} at ${parsedData.centreName}.`;
                      speakAloud(readout, selectedLang);
                    }}
                    className="text-xs text-emerald-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>వినండి (Listen)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {/* Crop Card */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 text-lg">
                      🌾
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">పంట (Crop)</span>
                      <span className="font-bold text-slate-900">{parsedData.crop}</span>
                    </div>
                  </div>

                  {/* Quantity Card */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">పరిమాణం (Quantity)</span>
                      <span className="font-bold text-emerald-800 text-sm">
                        {parsedData.quantityQuintals} క్వింటాళ్లు (Qtl)
                      </span>
                    </div>
                  </div>

                  {/* Centre Card */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2.5 sm:col-span-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">సేకరణ కేంద్రం (Centre)</span>
                      <span className="font-bold text-slate-900 truncate block">{parsedData.centreName}</span>
                    </div>
                  </div>

                  {/* Date & Time Slot */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">తేదీ (Date)</span>
                      <span className="font-bold text-slate-800">{parsedData.date}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">సమయం (Slot)</span>
                      <span className="font-bold text-slate-800">{parsedData.timeSlot}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ONE-TAP CONFIRMATION BUTTON - LARGE & EASY FOR RURAL FARMERS */}
              <div className="pt-2">
                <button
                  type="button"
                  id="voice-booking-confirm-issue-btn"
                  onClick={handleConfirmAndIssueToken}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-emerald-900/10 active:scale-98"
                >
                  <Check className="w-5 h-5 text-amber-300" />
                  <span>టోకెన్ జారీ చేయండి / Confirm &amp; Generate Token</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-1.5">
                  ఒక్క క్లిక్ తో మీ టోకెన్ మరియు క్యూ సంఖ్య వెంటనే మీ మొబైల్ కు జారీ చేయబడుతుంది.
                </p>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
