import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  PhoneCall, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  FileText,
  Mail,
  ShieldCheck
} from 'lucide-react';

export const HelpSupportPage: React.FC = () => {
  const { profile, showToast, submitFeedback } = useApp();

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [grievanceSubmitted, setGrievanceSubmitted] = useState<string | null>(null);
  const [grievanceData, setGrievanceData] = useState({
    category: 'Weighbridge Discrepancy',
    centre: 'Mylavaram Procurement Centre',
    description: '',
  });

  const faqs = [
    {
      q: 'What documents must I carry to the procurement center?',
      a: 'You must bring: (1) Digital Token QR pass (printed or on mobile), (2) Original Pattadar Passbook or Survey verification document, (3) Aadhaar Card copy, and (4) Bank passbook front page for bank details verification.'
    },
    {
      q: 'What is the maximum allowed moisture content for Paddy?',
      a: 'As per Ministry guidelines, the fair average quality (FAQ) moisture content limit for Paddy is 17.0%. Produce with moisture below 17.0% is accepted without any price deductions. If moisture is higher, drying facilities in the yard may be utilized.'
    },
    {
      q: 'How long does the DBT payment take to reflect in my bank account?',
      a: 'Under the Smart India Hackathon direct procurement protocol, once the final weighment slip is cryptographically sanctioned, the batch file is transmitted to PFMS. Funds are normally credited via RBI RTGS/NEFT within 24 to 48 working hours.'
    },
    {
      q: 'What happens if I arrive late or miss my 30-minute scheduled time slot?',
      a: 'If you arrive late, your digital token remains valid for the entire calendar day. You will be accommodated in the buffer queue between scheduled arrivals with minimal wait, or you can one-click reschedule using the app.'
    },
    {
      q: 'How does the digital weighbridge prevent fraud or manipulation?',
      a: 'The electronic weighbridges are equipped with digital load cells directly interfaced with the central server via secure IoT telemetry. Weights are locked automatically upon truck stabilization without manual operator override.'
    }
  ];

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievanceData.description) {
      showToast('Please describe your grievance in detail.');
      return;
    }
    const ticketId = 'GRV-2026-' + Math.floor(1000 + Math.random() * 9000);
    submitFeedback(4, `[${ticketId}] ${grievanceData.description} (Centre: ${grievanceData.centre})`, grievanceData.category).catch(console.warn);
    setGrievanceSubmitted(ticketId);
    showToast(`Grievance ticket ${ticketId} registered with the District Collector office.`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
          Kisan Help & Grievance Redressal
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          24/7 farmer assistance, official procurement FAQs, and direct administrative escalation.
        </p>
      </div>

      {/* Official Helplines Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-900 to-emerald-950 text-white shadow-md border border-emerald-800">
          <div className="flex items-center gap-2.5 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <PhoneCall className="w-4 h-4" />
            <span>Kisan Call Centre (Toll-Free)</span>
          </div>
          <p className="text-3xl font-black font-mono mt-2 tracking-tight">
            1800-180-1551
          </p>
          <p className="text-xs text-emerald-200/90 mt-1">
            Available 6:00 AM to 10:00 PM in Telugu, Hindi, and English.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              DISTRICT CIVIL SUPPLIES OFFICE
            </span>
            <p className="text-sm font-bold text-slate-900 mt-1">
              NTR District Collectorate, Vijayawada
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Email: dso-ntr@ap.gov.in • Phone: 0866-2571234
            </p>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-3">
            Response turnaround within 4 hours ✓
          </span>
        </div>
      </div>

      {/* FAQs Accordion */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-base font-bold text-slate-900 font-heading mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-800" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-3">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left flex items-center justify-between text-xs font-bold text-slate-800 hover:text-emerald-900 transition"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-emerald-700 shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                )}
              </button>
              {openFaq === idx && (
                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Grievance Submission Form */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-base font-bold text-slate-900 font-heading mb-1">
          Register a Grievance or Dispute
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          All complaints are automatically escalated to the District Joint Collector (Civil Supplies).
        </p>

        {grievanceSubmitted ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
            <h3 className="text-base font-bold text-emerald-950 font-heading">
              Grievance Registered Successfully
            </h3>
            <p className="text-xs text-emerald-800">
              Your formal tracking ticket is <strong className="font-mono">{grievanceSubmitted}</strong>. You will receive SMS updates on investigation progress.
            </p>
            <button
              type="button"
              onClick={() => setGrievanceSubmitted(null)}
              className="mt-2 text-xs font-bold text-emerald-900 underline"
            >
              Submit another grievance
            </button>
          </div>
        ) : (
          <form onSubmit={handleGrievanceSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Issue Category
                </label>
                <select
                  value={grievanceData.category}
                  onChange={(e) => setGrievanceData({ ...grievanceData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
                >
                  <option>Weighbridge Discrepancy</option>
                  <option>Moisture Testing Dispute</option>
                  <option>Delayed PFMS Payment</option>
                  <option>Queue Jumping / Operator Misconduct</option>
                  <option>Digital Token Not Recognized</option>
                  <option>Other Technical Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Procurement Centre
                </label>
                <input
                  type="text"
                  value={grievanceData.centre}
                  onChange={(e) => setGrievanceData({ ...grievanceData, centre: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Description of Complaint
              </label>
              <textarea
                rows={4}
                required
                value={grievanceData.description}
                onChange={(e) => setGrievanceData({ ...grievanceData, description: e.target.value })}
                placeholder="Explain the incident, token number, tractor vehicle number, and date..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Filing as: <strong>{profile.name}</strong> (+91 {profile.mobile})
              </span>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Grievance Ticket</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
