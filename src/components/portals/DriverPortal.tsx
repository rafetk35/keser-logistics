import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  Camera,
  FileUp,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileText,
  CreditCard,
  Send,
  X,
  Phone,
  Shield,
} from 'lucide-react';
import { Currency } from '../../types';

export const DriverPortal: React.FC = () => {
  const {
    currentUser,
    drivers,
    trips,
    pendingApprovals,
    addDriverApprovalRequest,
    openDocumentUpload,
    tractors,
  } = useApp();

  // Find linked driver or fallback to Ahmet Karaca
  const activeDriver =
    drivers.find((d) => d.id === currentUser.linkedDriverId) ||
    drivers.find((d) => d.fullName.toLowerCase().includes(currentUser.name.toLowerCase())) ||
    drivers[0];

  // Driver's active trip
  const activeTrip = trips.find(
    (t) =>
      (t.driverName === activeDriver?.fullName || t.tractorPlate === activeDriver?.currentTractorPlate) &&
      t.status !== 'Teslim Edildi' &&
      t.status !== 'İptal'
  );

  // Past trips
  const pastTrips = trips.filter(
    (t) => t.driverName === activeDriver?.fullName && t.status === 'Teslim Edildi'
  );

  // Driver's requests
  const myApprovals = pendingApprovals.filter(
    (a) => a.driverName === activeDriver?.fullName || a.driverId === activeDriver?.id
  );

  // Request form modal
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reqType, setReqType] = useState<any>('Yakıt Masrafı');
  const [reqAmount, setReqAmount] = useState<number>(350);
  const [reqCurrency, setReqCurrency] = useState<Currency>('EUR');
  const [reqLocation, setReqLocation] = useState('Sırbistan OMV İstasyonu');
  const [reqDesc, setReqDesc] = useState('Dizel yakıt alımı ve fiş görseli');
  const [selectedTripId, setSelectedTripId] = useState<string>(activeTrip?.id || (trips[0]?.id ?? ''));
  const [reqLiters, setReqLiters] = useState<string>('340');
  const [receiptPhotoUrl, setReceiptPhotoUrl] = useState<string>('');

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDriver) return;

    addDriverApprovalRequest({
      driverId: activeDriver.id,
      driverName: activeDriver.fullName,
      tractorPlate: activeDriver.currentTractorPlate || '34 TL 4501',
      tripId: activeTrip?.id,
      tripCmrNo: activeTrip?.cmrNo,
      type: reqType,
      amount: reqAmount,
      currency: reqCurrency,
      location: reqLocation,
      description: reqDesc,
    });

    setIsRequestModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Mobile-Friendly Driver Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-inner">
              {activeDriver?.fullName.split(' ').map((n) => n[0]).join('') || 'K'}
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-300">
                Mobil Sürücü Portalı • Kaptan Paneli
              </span>
              <h1 className="text-2xl font-black">{activeDriver?.fullName}</h1>
              <p className="text-xs text-slate-300">
                Çekici: <strong className="font-mono text-white">{activeDriver?.currentTractorPlate || '34 TL 4501'}</strong> • {activeDriver?.licenseClass}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow transition"
            >
              <Receipt className="w-4 h-4" />
              <span>Fiş / Masraf Bildir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Trip Card */}
      {activeTrip ? (
        <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-sm p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-mono font-black text-sm rounded-lg border border-indigo-200">
                {activeTrip.cmrNo}
              </span>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                {activeTrip.status}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Tahmini Varış: <strong>{activeTrip.etaDate}</strong>
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 text-base font-bold text-slate-900">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{activeTrip.originCity} ({activeTrip.originCountry})</span>
              <ArrowRight className="w-4 h-4 text-indigo-600" />
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>{activeTrip.destinationCity} ({activeTrip.destinationCountry})</span>
            </div>

            <div className="mt-3 p-3 bg-slate-50 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Müşteri:</span>
                <span className="font-semibold text-slate-800">{activeTrip.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Yük Cinsi:</span>
                <span className="text-slate-800">{activeTrip.cargoDescription}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Ağırlık &amp; Palet:</span>
                <span className="text-slate-800">{activeTrip.weightKg.toLocaleString('tr-TR')} kg / {activeTrip.palletCount} Palet</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Dorse:</span>
                <span className="font-mono font-bold text-slate-800">{activeTrip.trailerPlate} ({activeTrip.trailerType})</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Güncel Aşama: <strong>{activeTrip.currentMilestone}</strong>
              </span>

              <button
                onClick={() =>
                  openDocumentUpload({
                    relatedEntityType: 'trip',
                    relatedEntityId: activeTrip.id,
                    referenceNo: activeTrip.cmrNo,
                    defaultType: 'CMR / Taşıma Belgesi',
                  })
                }
                className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" />
                Teslim Evrakı Çek / Yükle
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800">Şu Anda Aktif Sefer Bulunmuyor</h3>
          <p className="text-xs text-slate-500 mt-1">
            Operasyon ekibi yeni bir rota atadığında sefer detaylarınız bu ekranda görünecektir.
          </p>
        </div>
      )}

      {/* Driver's Official Expirable Documents */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Resmi Evraklarım &amp; Vize Süreleri
            </h3>
          </div>
          <button
            onClick={() =>
              openDocumentUpload({
                relatedEntityType: 'driver',
                relatedEntityId: activeDriver?.id || 'drv-1',
                referenceNo: activeDriver?.fullName,
                defaultType: 'Ehliyet / SRC Belgesi',
              })
            }
            className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
          >
            <FileUp className="w-3.5 h-3.5" />
            Yeni Evrak Fotoğrafı Yükle
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeDriver?.documents.map((doc) => {
            const diff = new Date(doc.expiryDate).getTime() - new Date().getTime();
            const daysLeft = Math.ceil(diff / (1000 * 3600 * 24));

            return (
              <div
                key={doc.id}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 block text-sm">{doc.type}</span>
                  <span className="font-mono text-slate-500 text-[11px]">Seri: {doc.documentNo}</span>
                </div>

                <div className="text-right">
                  <span className="text-slate-500 block text-[11px]">Bitiş: {doc.expiryDate}</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                      daysLeft < 0
                        ? 'bg-red-100 text-red-700'
                        : daysLeft <= 30
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {daysLeft < 0 ? 'Süresi Doldu!' : daysLeft <= 30 ? `${daysLeft} gün kaldı` : 'Geçerli'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver's Pending & Past Expense Requests */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-indigo-600" />
          Operasyona İlettiğim Masraf &amp; Harcırah Talepleri
        </h3>

        {myApprovals.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">Henüz masraf talebi göndermediniz.</p>
        ) : (
          <div className="space-y-2">
            {myApprovals.map((appr) => (
              <div
                key={appr.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{appr.type}</span>
                    <span className="font-black text-indigo-700">
                      {appr.amount.toLocaleString('tr-TR')} {appr.currency}
                    </span>
                    <span className="text-slate-400">• {appr.location}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{appr.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      appr.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : appr.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {appr.status === 'approved'
                      ? '✓ Onaylandı'
                      : appr.status === 'rejected'
                      ? '✕ Reddedildi'
                      : '⏳ Onay Bekliyor'}
                  </span>

                  {appr.rejectionReason && (
                    <span className="text-red-600 text-[11px] block">
                      Gerekçe: {appr.rejectionReason}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------------- MODAL: SÜPER KOLAY HIZLI FİŞ & MASRAF GİRİŞİ (5 ADIM) ---------------- */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 my-8 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Hızlı Fiş / Masraf Girişi
                  </h3>
                  <p className="text-xs text-slate-500">5 Adımda Kolay Fiş Bildirimi</p>
                </div>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!activeDriver) return;

                const selectedTripObj = trips.find((t) => t.id === selectedTripId);

                addDriverApprovalRequest({
                  driverId: activeDriver.id,
                  driverName: activeDriver.fullName,
                  tractorPlate: activeDriver.currentTractorPlate || '34 TL 4501',
                  tripId: selectedTripId || activeTrip?.id,
                  tripCmrNo: selectedTripObj?.cmrNo || activeTrip?.cmrNo,
                  type: reqType,
                  amount: reqAmount,
                  currency: reqCurrency,
                  location: reqLocation,
                  description: `${reqLiters ? `[${reqLiters} Lt] ` : ''}${reqDesc}`,
                  receiptUrl: receiptPhotoUrl || undefined,
                });

                setIsRequestModalOpen(false);
                setReceiptPhotoUrl('');
                setReqLiters('');
              }}
              className="space-y-4 mt-4 text-xs"
            >
              {/* Adım 1: Sefer No Seçimi */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-700 mb-1">
                  1. Sefer No Seçimi *
                </label>
                <select
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                >
                  {trips
                    .filter((t) => t.status !== 'İptal')
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.cmrNo} • {t.originCity} ➔ {t.destinationCity} ({t.customerName})
                      </option>
                    ))}
                </select>
              </div>

              {/* Adım 2: Masraf Türü */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  2. Masraf Türü *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'Yakıt Masrafı', label: '⛽ Mazot / Yakıt' },
                    { id: 'Otoyol / Vinyet', label: '🛣️ Otoyol / Vinyet' },
                    { id: 'Kantar / Belge', label: '⚖️ Kantar / Tartı' },
                    { id: 'Harcırah Avansı', label: '💵 Harcırah Avansı' },
                    { id: 'Acil Tamir / Lastik', label: '🔧 Lastik & Tamir' },
                    { id: 'Ceza', label: '⚠️ Trafik Cezası' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setReqType(cat.id as any)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-[11px] transition-all ${
                        reqType === cat.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Adım 3: Tutar & Para Birimi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    3. Fiş / Fatura Tutarı *
                  </label>
                  <input
                    type="number"
                    required
                    value={reqAmount}
                    onChange={(e) => setReqAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-base font-extrabold border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Para Birimi</label>
                  <select
                    value={reqCurrency}
                    onChange={(e) => setReqCurrency(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="TRY">TRY (₺)</option>
                    <option value="USD">USD ($)</option>
                    <option value="RUB">RUB (₽)</option>
                  </select>
                </div>
              </div>

              {/* Adım 4: Detay ve Yakıt Litresi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reqType === 'Yakıt Masrafı' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Alınan Litre (Mazot Norm Kontrolü İçin)
                    </label>
                    <input
                      type="number"
                      placeholder="Örn: 350 Lt"
                      value={reqLiters}
                      onChange={(e) => setReqLiters(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none font-bold"
                    />
                  </div>
                )}
                <div className={reqType === 'Yakıt Masrafı' ? '' : 'sm:col-span-2'}>
                  <label className="block font-bold text-slate-700 mb-1">
                    4. Bulunulan Konum / İstasyon
                  </label>
                  <input
                    type="text"
                    required
                    value={reqLocation}
                    onChange={(e) => setReqLocation(e.target.value)}
                    placeholder="Sırbistan OMV İstasyonu / Kapıkule"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kısa Açıklama &amp; Fiş No
                </label>
                <input
                  type="text"
                  value={reqDesc}
                  onChange={(e) => setReqDesc(e.target.value)}
                  placeholder="Fiş no, istasyon adı veya detay..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              {/* Adım 5: Fiş / Fatura Görseli (Kamera / Dosya) */}
              <div className="border-2 border-dashed border-emerald-300 rounded-xl p-4 bg-emerald-50/40 text-center">
                <Camera className="w-7 h-7 text-emerald-600 mx-auto mb-1.5" />
                <div className="font-bold text-slate-800 text-xs mb-1">
                  5. Fiş / Fatura Fotoğrafı Çek veya Dosya Seç *
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow transition-all">
                  <Camera className="w-4 h-4" />
                  Kamera / Fotoğraf Yükle
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    capture="environment"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setReceiptPhotoUrl(event.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>

                {receiptPhotoUrl && (
                  <div className="mt-3 p-2 bg-white rounded-lg border border-emerald-200 inline-block text-left">
                    <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Fiş Fotoğrafı Eklendi
                    </p>
                    <img
                      src={receiptPhotoUrl}
                      alt="Fiş Önizleme"
                      className="max-h-24 rounded border object-contain mx-auto"
                    />
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Onay Masasına Gönder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
