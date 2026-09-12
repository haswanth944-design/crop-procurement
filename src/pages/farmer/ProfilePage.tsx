import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../i18n/translations';
import { 
  User, 
  MapPin, 
  Tractor, 
  CreditCard, 
  Phone, 
  ShieldCheck, 
  Edit3, 
  Check, 
  Globe, 
  FileText,
  Building2,
  Sparkles
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile, setProfile, language, setLanguage, showToast } = useApp();
  const t = getTranslation(language);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    mobile: profile.mobile,
    village: profile.village,
    mandal: profile.mandal,
    district: profile.district,
    landAcres: profile.landAcres.toString(),
    surveyPassbookNo: profile.surveyPassbookNo,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(prev => ({
      ...prev,
      name: formData.name,
      mobile: formData.mobile,
      village: formData.village,
      mandal: formData.mandal,
      district: formData.district,
      landAcres: parseFloat(formData.landAcres) || prev.landAcres,
      surveyPassbookNo: formData.surveyPassbookNo
    }));
    setIsEditing(false);
    showToast(language === 'te' ? 'రైతు వివరాలు విజయవంతంగా నవీకరించబడ్డాయి.' : 'Farmer profile details updated successfully.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            {language === 'te' ? 'రైతు ప్రొఫైల్ & భూమి రికార్డులు' : 'Farmer Profile & Land Records'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'te' 
              ? 'పౌర సరఫరాల శాఖ ఇ-ప్రొక్యూర్మెంట్ పోర్టల్ క్రింద నమోదైంది.' 
              : 'Registered under Department of Consumer Affairs e-Procurement Portal.'}
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition self-start sm:self-auto ${
            isEditing 
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
              : 'bg-emerald-800 text-white hover:bg-emerald-900 shadow-md'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>
            {language === 'te' 
              ? (isEditing ? 'సవరణ రద్దు చేయండి' : 'ప్రొఫైల్ సవరించండి') 
              : (isEditing ? 'Cancel Editing' : 'Edit Profile')}
          </span>
        </button>
      </div>

      {/* Main Profile Info Card */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          {/* Identity Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="h-16 w-16 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-heading font-black text-2xl shadow-md">
              {profile.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  {profile.name}
                </h2>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 border border-emerald-300">
                  Aadhaar Seeded ✓
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Farmer ID: <strong className="font-mono text-slate-700">FID-AP-2024-99120</strong>
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {language === 'te' ? 'పూర్తి పేరు' : 'Full Name'}
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border font-medium ${
                  isEditing ? 'border-emerald-700 bg-white ring-1 ring-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-800'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {language === 'te' ? 'మొబైల్ సంఖ్య (SMS అలర్ట్ రిజిస్టర్డ్)' : 'Mobile Number (SMS Alert Registered)'}
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-medium ${
                  isEditing ? 'border-emerald-700 bg-white ring-1 ring-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-800'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {language === 'te' ? 'గ్రామం & మండలం' : 'Village & Mandal'}
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={`${formData.village}, ${formData.mandal}`}
                onChange={(e) => {
                  const parts = e.target.value.split(',');
                  setFormData({ ...formData, village: parts[0] || '', mandal: parts[1] || '' });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border font-medium ${
                  isEditing ? 'border-emerald-700 bg-white ring-1 ring-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-800'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {language === 'te' ? 'జిల్లా & రాష్ట్రం' : 'District & State'}
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={`${formData.district}, Andhra Pradesh`}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {language === 'te' ? 'పట్టాదారు పాస్‌బుక్ సంఖ్య' : 'Pattadar Passbook No.'}
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.surveyPassbookNo}
                onChange={(e) => setFormData({ ...formData, surveyPassbookNo: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-medium ${
                  isEditing ? 'border-emerald-700 bg-white ring-1 ring-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-800'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {language === 'te' ? 'సాగు విస్తీర్ణం (ఎకరాలు)' : 'Cultivated Land (Acres)'}
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.landAcres}
                onChange={(e) => setFormData({ ...formData, landAcres: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border font-medium ${
                  isEditing ? 'border-emerald-700 bg-white ring-1 ring-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-800'
                }`}
              />
            </div>
          </div>

          {isEditing && (
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{language === 'te' ? 'ప్రొఫైల్ మార్పులను సేవ్ చేయండి' : 'Save Profile Changes'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Bank & DBT Account Summary */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <CreditCard className="w-5 h-5 text-emerald-800" />
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Aadhaar-Linked Bank Account (Direct Benefit Transfer)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="text-slate-400 block text-[10px]">Bank Name</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{profile.bankName}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="text-slate-400 block text-[10px]">Account Number</span>
              <span className="font-mono font-bold text-slate-800 mt-0.5 block">{profile.bankAccountMasked}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="text-slate-400 block text-[10px]">IFSC Code</span>
              <span className="font-mono font-bold text-slate-800 mt-0.5 block">{profile.ifscCode}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              PFMS Mandate is active and verified with NPCI mapper. Payouts are directly credited via RBI clearance.
            </span>
          </div>
        </div>

        {/* Language Preference Setting */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Globe className="w-5 h-5 text-emerald-800" />
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Language Preference / భాష ఎంపిక
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { code: 'en', label: 'English', desc: 'Default system language' },
              { code: 'te', label: 'తెలుగు', desc: 'ఆంధ్రప్రదేశ్ & తెలంగాణ' },
              { code: 'hi', label: 'हिन्दी', desc: 'राष्ट्रीय भाषा' },
            ].map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code as any);
                  showToast(`Language switched to ${lang.label}`);
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition ${
                  language === lang.code 
                    ? 'border-emerald-700 bg-emerald-50/80 ring-1 ring-emerald-700' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className="text-sm font-bold text-slate-900 block">{lang.label}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{lang.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
