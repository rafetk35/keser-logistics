import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, X, Check, ShieldAlert, FileText, Info } from 'lucide-react';

export const CompanySettingsModal: React.FC = () => {
  const {
    companySettings,
    updateCompanySettings,
    isCompanySettingsModalOpen,
    setIsCompanySettingsModalOpen,
    currentRole,
    permissions,
  } = useApp();

  const [name, setName] = useState(companySettings.companyName);
  const [taxId, setTaxId] = useState(companySettings.companyTaxId);
  const [taxOffice, setTaxOffice] = useState(companySettings.companyTaxOffice);
  const [address, setAddress] = useState(companySettings.companyAddress);
  const [phone, setPhone] = useState(companySettings.companyPhone);
  const [email, setEmail] = useState(companySettings.companyEmail);
  const [ibanEUR, setIbanEUR] = useState(companySettings.companyIbanEUR);
  const [ibanTRY, setIbanTRY] = useState(companySettings.companyIbanTRY);

  useEffect(() => {
    if (isCompanySettingsModalOpen) {
      setName(companySettings.companyName);
      setTaxId(companySettings.companyTaxId);
      setTaxOffice(companySettings.companyTaxOffice);
      setAddress(companySettings.companyAddress);
      setPhone(companySettings.companyPhone);
      setEmail(companySettings.companyEmail);
      setIbanEUR(companySettings.companyIbanEUR);
      setIbanTRY(companySettings.companyIbanTRY);
    }
  }, [isCompanySettingsModalOpen, companySettings]);

  if (!isCompanySettingsModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.canManageRoles) return;

    updateCompanySettings({
      companyName: name.trim(),
      companyTaxId: taxId.trim(),
      companyTaxOffice: taxOffice.trim(),
      companyAddress: address.trim(),
      companyPhone: phone.trim(),
      companyEmail: email.trim(),
      companyIbanEUR: ibanEUR.trim(),
      companyIbanTRY: ibanTRY.trim(),
    });

    setIsCompanySettingsModalOpen(false);
  };

  const isEditable = permissions.canManageRoles;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Şirket Resmi Bilgileri &amp; VKN Tanımları
              </h2>
              <p className="text-xs text-slate-400">
                Akıllı Fatura ve OCR motorunun 'Gelen / Giden Fatura' tespiti için baz aldığı VKN ve kurum verileri
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCompanySettingsModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OCR VKN explanation box */}
        <div className="bg-amber-50 border-b border-amber-200/70 p-4 flex items-start gap-3 text-xs text-amber-900">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-950">
              Akıllı Fatura &amp; VKN Ayrıştırma Mantığı:
            </span>
            <span>
              Yüklenen e-fatura veya taranan görselde Satıcı VKN bu alandaki VKN ile eşleştiğinde sistem faturayı otomatik olarak{' '}
              <strong>"Giden Fatura (Kesilen Navlun / Gelir)"</strong>; Alıcı VKN eşleştiğinde ise{' '}
              <strong>"Gelen Fatura (Alınan / Mazot-Otoyol Gideri)"</strong> olarak kaydeder ve doğrudan Onay Masasına sevk eder.
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {!isEditable && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Bu alan salt okunurdur. Yalnızca Yönetici (Admin) ve Müdür rollerince düzenlenebilir.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Şirket Resmi Unvanı</label>
              <input
                type="text"
                disabled={!isEditable}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-xs disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                <span>Vergi Kimlik Numarası (VKN)</span>
                <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] rounded font-mono font-bold">
                  OCR Anahtarı
                </span>
              </label>
              <input
                type="text"
                disabled={!isEditable}
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                required
                maxLength={11}
                placeholder="Örn: 5480921478"
                className="w-full px-3 py-2 bg-slate-50 border border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-xs font-mono font-bold text-indigo-900 disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Bağlı Vergi Dairesi</label>
              <input
                type="text"
                disabled={!isEditable}
                value={taxOffice}
                onChange={(e) => setTaxOffice(e.target.value)}
                required
                placeholder="Örn: Büyük Mükellefler V.D."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-xs disabled:opacity-75"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Merkez Adresi</label>
              <input
                type="text"
                disabled={!isEditable}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-xs disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Telefon</label>
              <input
                type="text"
                disabled={!isEditable}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-xs disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">E-Posta (Muhasebe / Bildirim)</label>
              <input
                type="email"
                disabled={!isEditable}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-xs disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Resmi IBAN (EUR - Navlun Tahsilat)</label>
              <input
                type="text"
                disabled={!isEditable}
                value={ibanEUR}
                onChange={(e) => setIbanEUR(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Resmi IBAN (TRY - TL Tahsilat &amp; Masraf)</label>
              <input
                type="text"
                disabled={!isEditable}
                value={ibanTRY}
                onChange={(e) => setIbanTRY(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs disabled:opacity-75"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsCompanySettingsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-xs transition"
            >
              Kapat
            </button>

            {isEditable && (
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
              >
                <Check className="w-4 h-4" />
                <span>Ayarları Kaydet</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
