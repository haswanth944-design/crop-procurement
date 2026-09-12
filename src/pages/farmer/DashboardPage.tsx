import React from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../i18n/translations';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatCard } from '../../components/common/StatCard';
import { 
  Calendar, 
  Clock, 
  FileCheck2, 
  CreditCard, 
  ArrowRight, 
  Building2, 
  QrCode, 
  TrendingUp, 
  Scale, 
  AlertTriangle, 
  CloudSun, 
  Sparkles, 
  Printer, 
  CheckCircle2 
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { 
    language, 
    navigate, 
    activeBooking, 
    activeToken, 
    servingToken, 
    farmersAhead, 
    estimatedWaitMinutes,
    isUsersTurn,
    simulateNextToken,
    profile
  } = useApp();

  const t = getTranslation(language);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              {language === 'te' ? `నమస్కారం, ${profile.name} 👋` : language === 'hi' ? `नमस्ते, ${profile.name} 👋` : `Good morning, ${profile.name} 👋`}
            </h1>
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 border border-emerald-300">
              {language === 'te' ? 'ధృవీకరించబడిన రైతు' : language === 'hi' ? 'सत्यापित किसान' : 'Verified Farmer'}
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            {t.dashboard.subtitle}
          </p>
        </div>

        {/* Quick actions top bar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/book-slot')}
            className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
          >
            <Calendar className="w-4 h-4" />
            <span>{t.dashboard.bookNewSlot}</span>
          </button>
          <button
            onClick={() => navigate('/queue')}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
          >
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>{t.dashboard.trackQueue}</span>
          </button>
        </div>
      </div>

      {/* Hero Active Booking Card */}
      {activeBooking ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-800">
          {/* Subtle decoration badge */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-emerald-700/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Token Highlight */}
            <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-emerald-800/80 pb-6 lg:pb-0 lg:pr-8">
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-emerald-300 bg-emerald-800/80 px-2.5 py-1 rounded-md border border-emerald-700">
                {t.dashboard.activeTokenTitle}
              </span>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-white font-mono">
                  {activeToken}
                </span>
                <span className="text-xs font-semibold text-emerald-300">
                  {language === 'te' ? 'కౌంటర్ 2' : 'Counter 2'}
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{activeBooking.centreName}</span>
              </p>
            </div>

            {/* Middle: Live Queue Status Breakdown */}
            <div className="lg:col-span-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-900/50 p-3.5 rounded-2xl border border-emerald-700/60">
                  <span className="text-[11px] font-medium text-emerald-300 block">
                    {t.dashboard.date} & {t.dashboard.time}
                  </span>
                  <span className="text-sm font-bold text-white mt-1 block">
                    {activeBooking.date}
                  </span>
                  <span className="text-xs text-emerald-200 font-mono">
                    {activeBooking.timeSlot}
                  </span>
                </div>

                <div className="bg-emerald-900/50 p-3.5 rounded-2xl border border-emerald-700/60">
                  <span className="text-[11px] font-medium text-emerald-300 block">
                    {t.dashboard.queueStatus}
                  </span>
                  <span className="text-sm font-bold text-amber-300 mt-1 block flex items-center gap-1">
                    {farmersAhead === 0 ? (
                      <span className="text-emerald-300 animate-pulse">
                        {language === 'te' ? 'ఇప్పుడు మీ వంతు!' : language === 'hi' ? 'अब आपकी बारी है!' : 'Your Turn NOW!'}
                      </span>
                    ) : (
                      <span>{farmersAhead} {t.dashboard.queueAhead}</span>
                    )}
                  </span>
                  <span className="text-xs text-emerald-200 font-mono">
                    {language === 'te' ? `వేచి ఉండే సమయం: ~ ${estimatedWaitMinutes} నిమి.` : `Wait: ~ ${estimatedWaitMinutes} mins`}
                  </span>
                </div>
              </div>

              {/* Status Alert */}
              <div className="flex items-center gap-3 bg-emerald-800/40 p-3 rounded-xl border border-emerald-700/40 text-xs">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                <span className="text-emerald-100">
                  {language === 'te' 
                    ? <>ప్రస్తుతం సర్వ్ చేస్తున్నది: <strong className="text-white font-mono">{servingToken}</strong>. {farmersAhead <= 3 ? 'దయచేసి కౌంటర్ 2 వద్ద సిద్ధంగా ఉండండి!' : t.dashboard.approachingStatus}</>
                    : <>Currently serving: <strong className="text-white font-mono">{servingToken}</strong>. {farmersAhead <= 3 ? 'Please be stationed at Counter 2!' : t.dashboard.approachingStatus}</>}
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              <button
                onClick={() => navigate('/queue')}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition active:scale-95"
              >
                <span>{t.dashboard.viewLiveQueue}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={simulateNextToken}
                className="w-full py-2.5 px-4 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-emerald-600 transition"
              >
                <Clock className="w-4 h-4 text-amber-300" />
                <span>{language === 'te' ? 'టోకెన్ పురోగతిని చూడండి' : 'Simulate Token Advance'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl bg-white p-8 border border-slate-200 text-center">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Upcoming Bookings Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You currently have no scheduled procurement appointments. Book a guaranteed unloading slot today.
          </p>
          <button
            onClick={() => navigate('/book-slot')}
            className="mt-4 inline-flex items-center gap-2 bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs"
          >
            <span>Book a Slot Now</span>
          </button>
        </div>
      )}

      {/* 4 Large Farmer Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-upcoming-slot"
          title={t.dashboard.upcomingSlot}
          value="12 Sep"
          subtitle="10:30 AM • Mylavaram Centre"
          icon={<Calendar className="w-5 h-5" />}
          trend={{ text: language === 'te' ? 'స్లాట్ ఖరారైంది ✓' : 'Slot Confirmed ✓', positive: true }}
          onClick={() => navigate('/bookings')}
        />

        <StatCard
          id="stat-queue-position"
          title={t.dashboard.queueStatus}
          value={farmersAhead === 0 ? (language === 'te' ? "ఇప్పుడు" : "NOW") : `#${farmersAhead + 1}`}
          subtitle={language === 'te' ? `${estimatedWaitMinutes} నిమిషాలు వేచి ఉండే సమయం` : `${estimatedWaitMinutes} min estimated wait`}
          icon={<Clock className="w-5 h-5" />}
          trend={{ text: `${language === 'te' ? 'ప్రస్తుత టోకెన్' : 'Serving'} ${servingToken}`, positive: false }}
          highlight={farmersAhead <= 2}
          onClick={() => navigate('/queue')}
        />

        <StatCard
          id="stat-procurement-status"
          title={t.dashboard.procurementStatus}
          value={language === 'te' ? 'పరిశీలనలో ఉంది' : 'Under Verification'}
          subtitle={language === 'te' ? '25.00 క్వింటాళ్ల ధాన్యం (గ్రేడ్-ఎ)' : '25.00 Q Paddy (Grade-A)'}
          icon={<Scale className="w-5 h-5" />}
          trend={{ text: language === 'te' ? 'దశ 6/8 పురోగతిలో ఉంది' : 'Stage 6 of 8 In Progress', positive: true }}
          onClick={() => navigate('/procurement')}
        />

        <StatCard
          id="stat-payment-status"
          title={t.dashboard.paymentCard}
          value={language === 'te' ? 'చెల్లింపు ప్రక్రియలో ఉంది' : 'Processing'}
          subtitle={language === 'te' ? 'PFMS DBT ద్వారా ₹58,000' : '₹58,000 via PFMS DBT'}
          icon={<CreditCard className="w-5 h-5" />}
          trend={{ text: language === 'te' ? 'మంజూరు ఉత్తర్వు ఆమోదించబడింది' : 'Sanction order approved', positive: true }}
          onClick={() => navigate('/payments')}
        />
      </div>

      {/* Quick Action Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 font-heading mb-4">
          {t.dashboard.quickActions}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/book-slot')}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition text-left group"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mt-3">{t.dashboard.bookNewSlot}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'te' ? 'పంట, తేదీ మరియు కేంద్రాన్ని ఎంచుకోండి' : 'Select crop, date & centre'}
            </p>
          </button>

          <button
            onClick={() => navigate('/queue')}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition text-left group"
          >
            <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center group-hover:scale-105 transition">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mt-3">{t.dashboard.trackQueue}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'te' ? 'ప్రస్తుత లైవ్ టోకెన్ నంబర్ చూడండి' : 'Check current serving token'}
            </p>
          </button>

          <button
            onClick={() => navigate('/queue')}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition text-left group"
          >
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center group-hover:scale-105 transition">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mt-3">{t.dashboard.viewToken}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'te' ? 'డిజిటల్ పాస్ చూడండి / ప్రింట్ చేయండి' : 'Download / print digital pass'}
            </p>
          </button>

          <button
            onClick={() => navigate('/payments')}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition text-left group"
          >
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center group-hover:scale-105 transition">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mt-3">{t.dashboard.paymentCard}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'te' ? 'ప్రత్యక్ష PFMS DBT స్థితిని ట్రాక్ చేయండి' : 'Track direct PFMS DBT status'}
            </p>
          </button>
        </div>
      </div>

      {/* Advisory Bar & Minimum Support Price (MSP) Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* MSP Rates for 2026 Season */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {language === 'te' ? 'అధికారిక కనీస మద్దతు ధరలు (MSP 2026)' : 'Official MSP Rates (Kharif/Rabi 2026)'}
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              {language === 'te' ? 'ప్రభుత్వ నిర్దేశిత' : 'Govt Mandated'}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-[11px] block">{language === 'te' ? 'ధాన్యం (గ్రేడ్-ఎ)' : 'Paddy (Grade A)'}</span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block font-mono">₹2,320 / Q</span>
              <span className="text-[10px] text-emerald-600 font-medium">{language === 'te' ? 'గరిష్ట తేమ: 17%' : 'Max Moisture: 17%'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-[11px] block">{language === 'te' ? 'గోధుమలు' : 'Wheat'}</span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block font-mono">₹2,275 / Q</span>
              <span className="text-[10px] text-emerald-600 font-medium">{language === 'te' ? 'గరిష్ట తేమ: 12%' : 'Max Moisture: 12%'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-[11px] block">{language === 'te' ? 'మొక్కజొన్న' : 'Maize'}</span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block font-mono">₹2,090 / Q</span>
              <span className="text-[10px] text-emerald-600 font-medium">{language === 'te' ? 'గరిష్ట తేమ: 14%' : 'Max Moisture: 14%'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-[11px] block">{language === 'te' ? 'ప్రత్తి' : 'Cotton (Med)'}</span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block font-mono">₹7,121 / Q</span>
              <span className="text-[10px] text-emerald-600 font-medium">{language === 'te' ? 'గరిష్ట తేమ: 8%' : 'Max Moisture: 8%'}</span>
            </div>
          </div>
        </div>

        {/* Weather & Smart Recommendation */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-2">
            <CloudSun className="w-4 h-4 text-amber-600" />
            <span>{language === 'te' ? 'వాతావరణ సూచన (NTR జిల్లా)' : 'NTR District Weather Alert'}</span>
          </div>
          <p className="text-xs text-amber-950 leading-relaxed font-medium">
            {language === 'te' ? '32°C • రేపు మధ్యాహ్నం చెదురుమదురు వర్షాలు పడే అవకాశం ఉంది.' : '32°C • Scattered showers expected tomorrow afternoon.'}
          </p>
          <p className="text-[11px] text-amber-800 mt-2 bg-white/80 p-2.5 rounded-xl border border-amber-200/80">
            <strong>{language === 'te' ? 'రైతు సలహా:' : 'Advisory:'}</strong> {language === 'te' ? 'ధాన్యాన్ని టార్పాలిన్లతో కప్పి ఉంచండి. తిరస్కరణ నివారించడానికి తేమ 17% కంటే తక్కువ ఉండేలా చూడండి.' : 'Keep produce under waterproof tarpaulin. Bring samples with <17% moisture to avoid rejection.'}
          </p>
        </div>
      </div>
    </div>
  );
};
