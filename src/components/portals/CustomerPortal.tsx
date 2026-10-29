import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Package,
  MapPin,
  Clock,
  ArrowRight,
  FileText,
  Download,
  Receipt,
  CheckCircle2,
  Calendar,
  Truck,
  Ship,
  Printer,
  X,
  Plus,
  Send,
  HelpCircle,
  FileCheck,
  ChevronDown,
} from 'lucide-react';
import { Trip, TrailerCategory, Customer } from '../../types';

export const CustomerPortal: React.FC = () => {
  const {
    currentUser,
    currentRole,
    customers,
    trips,
    invoices,
    freightRequests,
    addFreightRequest,
    showToast,
  } = useApp();

  // Admin / Müdür / Operasyon personeli için manuel müşteri değiştirme state'i
  const [selectedCustomerIdForAdmin, setSelectedCustomerIdForAdmin] = useState<string | null>(null);

  // Find linked customer or fallback
  const baseCustomer =
    customers.find((c) => c.id === currentUser.linkedCustomerId) ||
    customers.find((c) => c.companyName.toLowerCase().includes(currentUser.name.toLowerCase())) ||
    customers[0];

  // Eğer dahili personel ise ve manuel seçim yaptıysa onu kullan, yoksa varsayılanı
  const activeCustomer =
    (currentRole === 'admin' || currentRole === 'manager' || currentRole === 'operations') &&
    selectedCustomerIdForAdmin
      ? customers.find((c) => c.id === selectedCustomerIdForAdmin) || baseCustomer
      : baseCustomer;

  // Muhasebe onaylı faturalardan ve ödemelerden güncel bakiye hesaplama mantığı (EUR, USD, TRY)
  const customerInvoices = invoices.filter(
    (i) => i.customerId === activeCustomer?.id || i.customerName === activeCustomer?.companyName
  );

  // Ödenmemiş veya kısmi ödenmiş faturalara göre dinamik bakiye hesabı
  let calculatedEUR = 0;
  let calculatedUSD = 0;
  let calculatedTRY = 0;

  customerInvoices.forEach((inv) => {
    // Eğer fatura onaylandıysa ve henüz tam tahsil edilmediyse borç bakiyesine ekle
    if (inv.status !== 'Tahsil Edildi / Ödendi') {
      const remainingAmount = inv.totalAmount; // ya da kalan tutar
      if (inv.currency === 'EUR') calculatedEUR += remainingAmount;
      else if (inv.currency === 'USD') calculatedUSD += remainingAmount;
      else if (inv.currency === 'TRY' || inv.currency === 'TL') calculatedTRY += remainingAmount;
    }
  });

  // Eğer faturalarda henüz veri yoksa customer nesnesindeki varsayılan değerleri baz al
  const displayEUR = calculatedEUR > 0 ? calculatedEUR : (activeCustomer?.balanceEUR || 0);
  const displayTRY = calculatedTRY > 0 ? calculatedTRY : (activeCustomer?.balanceTRY || 0);
  const displayUSD = calculatedUSD > 0 ? calculatedUSD : ((activeCustomer as any)?.balanceUSD || 0);

  const myTrips = trips.filter(
    (t) => t.customerId === activeCustomer?.id || t.customerName === activeCustomer?.companyName
  );

  const myRequests = freightRequests.filter(
    (r) => r.customerId === activeCustomer?.id || r.customerName === activeCustomer?.companyName
  );

  const [selectedTripForCmr, setSelectedTripForCmr] = useState<Trip | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // New Request Form State
  const [originCountry, setOriginCountry] = useState('Türkiye');
  const [originCity, setOriginCity] = useState('');
  const [originPostalCode, setOriginPostalCode] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('Almanya');
  const [destinationCity, setDestinationCity] = useState('');
  const [destinationPostalCode, setDestinationPostalCode] = useState('');
  const [loadType, setLoadType] = useState<'Komple (FTL)' | 'Parsiyel (LTL)'>('Komple (FTL)');
  const [readyDate, setReadyDate] = useState(new Date().toISOString().split('T')[0]);
  const [cargoDescription, setCargoDescription] = useState('');
  const [tonnage, setTonnage] = useState<number>(20);
  const [palletCount, setPalletCount] = useState<number>(33);
  const [trailerType, setTrailerType] = useState<TrailerCategory>('Tenteli Mega');
  const [notes, setNotes] = useState('');

  const europeanCountries = [
    'Türkiye',
    'Almanya',
    'Fransa',
    'İtalya',
    'Hollanda',
    'Belçika',
    'Avusturya',
    'Polonya',
    'Romanya',
    'Macaristan',
    'Bulgaristan',
    'Sırbistan',
    'Çekya',
    'Slovakya',
    'İspanya',
    'İngiltere',
    'Yunanistan',
  ];

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!originCity || !destinationCity || !cargoDescription) {
      showToast('Lütfen kalkış şehri, varış şehri ve yük cinsi alanlarını doldurun.', 'error');
      return;
    }

    addFreightRequest({
      customerId: activeCustomer?.id || 'cust-1',
      customerName: activeCustomer?.companyName || 'Müşteri Firması',
      customerTaxId: activeCustomer?.taxId,
      originCountry,
      originCity,
      destinationCountry,
      destinationCity,
      readyDate,
      cargoDescription,
      tonnage,
      palletCount,
      trailerType,
      notes: `Yük Tipi: ${loadType} | Çıkış PK: ${originPostalCode || '-'} | Varış PK: ${destinationPostalCode || '-'} | ${notes}`,
    });

    setIsRequestModalOpen(false);
    setOriginCity('');
    setOriginPostalCode('');
    setDestinationCity('');
    setDestinationPostalCode('');
    setCargoDescription('');
    setNotes('');
    showToast('Yük talebiniz Keser Operasyon ekibine iletildi.', 'success');
  };

  const isInternalStaff = currentRole === 'admin' || currentRole === 'manager' || currentRole === 'operations';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Dahili Personel İçin Müşteri Görünüm Seçici */}
      {isInternalStaff && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <span>⚙️ Operasyon / Yönetici Görünüm Modu:</span>
            <span className="font-normal text-amber-800">Hangi müşterinin portalını test etmek istiyorsanız seçin:</span>
          </div>
          <select
            value={activeCustomer?.id}
            onChange={(e) => setSelectedCustomerIdForAdmin(e.target.value)}
            className="px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-800 shadow-2xs focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName} ({c.code})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Customer Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/30 border border-indigo-400 text-white flex items-center justify-center font-bold text-xl">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-300">
                Keser Müşteri Portalı • Yük Takip &amp; Çoklu Döviz Cari Ekstre
              </span>
              <h1 className="text-2xl font-black">{activeCustomer?.companyName}</h1>
              <p className="text-xs text-slate-300">
                Cari Kod: <strong className="font-mono text-white">{activeCustomer?.code}</strong> • {activeCustomer?.taxOffice} / {activeCustomer?.taxId}
              </p>
            </div>
          </div>

          {/* Çoklu Döviz Müşteri Borç Bakiyesi (EUR, USD, TRY) */}
          <div className="text-right bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/15 min-w-[240px] space-y-1.5 font-mono">
            <span className="text-[10px] text-indigo-200 uppercase block font-bold tracking-wider font-sans">
              Güncel Borç Bakiyeniz
            </span>
            
            {/* EUR Borç */}
            <div className="flex items-center justify-between gap-4 text-xs font-bold text-white">
              <span className="font-semibold text-slate-300 font-sans">EUR Borç:</span>
              <span className="text-emerald-300">{displayEUR.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} €</span>
            </div>

            {/* USD Borç */}
            <div className="flex items-center justify-between gap-4 text-xs font-bold text-cyan-300 border-t border-white/10 pt-1">
              <span className="font-semibold text-slate-300 font-sans">USD Borç:</span>
              <span>{displayUSD.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} $</span>
            </div>

            {/* TRY Borç */}
            <div className="flex items-center justify-between gap-4 text-xs font-bold text-amber-300 border-t border-white/10 pt-1">
              <span className="font-semibold text-slate-300 font-sans">TRY Borç:</span>
              <span>{displayTRY.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
            </div>
          </div>
        </div>
      </div>

      {/* Yük Talep & İlan Modülü Banner */}
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-slate-50 border border-indigo-200 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-md">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-indigo-950 text-base">
              Yeni Uluslararası Yük / Sefer Talebi İletin
            </h3>
            <p className="text-xs text-indigo-800/80 mt-0.5">
              İhracat veya ithalat yükünüz için güzergah, posta kodu, tonaj ve dorse tipi belirterek Keser Operasyon ekibine anlık talep iletebilirsiniz.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Yük / Sefer Talebi Oluştur
        </button>
      </div>

      {/* Gönderilen Yük Talepleri */}
      {myRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-base">
                İlettiğiniz Yük Talepleri ({myRequests.length})
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    {req.originCity} ({req.originCountry}) ➔ {req.destinationCity} ({req.destinationCountry})
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      req.status === 'Sefer Planlandı'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'İnceleniyor'
                        ? 'bg-blue-100 text-blue-800'
                        : req.status === 'Reddedildi'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="text-slate-600">
                  <span>Yük Cinsi: <strong>{req.cargoDescription}</strong> • </span>
                  <span>{req.tonnage} Ton • </span>
                  <span>{req.trailerType}</span>
                </div>

                <div className="text-slate-500 text-[11px] bg-white p-2 rounded-lg border border-slate-200">
                  {req.notes}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[11px] text-slate-500">
                  <span>Hazır Olma Tarihi: <strong>{req.readyDate}</strong></span>
                  {req.convertedTripCmrNo && (
                    <span className="font-mono text-indigo-600 font-bold">
                      Sefer No: {req.convertedTripCmrNo}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Cargo Tracking */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-900 text-base">
              Yoldaki Sevkiyatlarım &amp; Canlı Durum ({myTrips.length} Sefer)
            </h2>
          </div>
        </div>

        {myTrips.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">Bu firmaya ait aktif sefer bulunmuyor.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myTrips.map((trip) => {
              const isDelivered = trip.status === 'Teslim Edildi';

              return (
                <div
                  key={trip.id}
                  className="p-5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-indigo-300 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-black text-indigo-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
                        {trip.cmrNo}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isDelivered
                            ? 'bg-emerald-100 text-emerald-800'
                            : trip.status === 'Gümrükte'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {trip.status}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{trip.region}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedTripForCmr(trip)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>CMR Belgesi Görüntüle</span>
                      </button>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{trip.originCity} ({trip.originCountry})</span>
                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <span>{trip.destinationCity} ({trip.destinationCountry})</span>
                  </div>

                  {/* Shipment Milestone Bar */}
                  <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Güncel Konum &amp; Aşama:</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        {trip.currentMilestone}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Tahmini Varış (ETA):</span>
                      <span className="font-bold text-slate-900">{trip.etaDate}</span>
                    </div>
                  </div>

                  {/* Cargo details */}
                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-4">
                    <span>Mal Cinsi: <strong>{trip.cargoDescription}</strong></span>
                    <span>Ağırlık: <strong>{trip.weightKg.toLocaleString('tr-TR')} kg</strong></span>
                    <span>Palet: <strong>{trip.palletCount} Adet</strong></span>
                    <span>Taşıyıcı Plaka: <strong className="font-mono">{trip.tractorPlate || trip.vehiclePlate}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Customer Invoices & Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-900 text-base">Faturalar &amp; Cari Ekstre</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                <th className="p-3">Fatura No</th>
                <th className="p-3">Tarih</th>
                <th className="p-3">Vade</th>
                <th className="p-3">İlişkili CMR</th>
                <th className="p-3 text-right">Tutar</th>
                <th className="p-3">KDV</th>
                <th className="p-3">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-800">{inv.invoiceNo}</td>
                  <td className="p-3 text-slate-600">{inv.date}</td>
                  <td className="p-3 text-slate-600">{inv.dueDate}</td>
                  <td className="p-3 font-mono text-indigo-700">{inv.tripCmrNo || '-'}</td>
                  <td className="p-3 text-right font-black text-slate-900">
                    {inv.totalAmount.toLocaleString('tr-TR')} {inv.currency}
                  </td>
                  <td className="p-3 text-slate-500">
                    {inv.vatRate === 0 ? '%0 İstisna' : `%${inv.vatRate}`}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'Tahsil Edildi / Ödendi'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Yeni Uluslararası Yük / Sefer Talebi Oluştur */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 space-y-4 my-8 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                Uluslararası Yük / Sefer Talebi Oluştur
              </h3>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              {/* Taşıma Türü: Komple / Parsiyel */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Taşıma Şekli (Komple / Parsiyel) *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLoadType('Komple (FTL)')}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs transition cursor-pointer ${
                      loadType === 'Komple (FTL)'
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    🚛 Komple Yük (FTL)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoadType('Parsiyel (LTL)')}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs transition cursor-pointer ${
                      loadType === 'Parsiyel (LTL)'
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    📦 Parsiyel Yük (LTL)
                  </button>
                </div>
              </div>

              {/* Kalkış Ülke, Şehir, Posta Kodu */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kalkış Ülkesi *</label>
                  <select
                    value={originCountry}
                    onChange={(e) => setOriginCountry(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none cursor-pointer"
                  >
                    {europeanCountries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kalkış Şehri *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Manisa / İzmir"
                    value={originCity}
                    onChange={(e) => setOriginCity(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Posta Kodu</label>
                  <input
                    type="text"
                    placeholder="Örn: 45030"
                    value={originPostalCode}
                    onChange={(e) => setOriginPostalCode(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Varış Ülke, Şehir, Posta Kodu */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Varış Ülkesi *</label>
                  <select
                    value={destinationCountry}
                    onChange={(e) => setDestinationCountry(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none cursor-pointer"
                  >
                    {europeanCountries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Varış Şehri *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Münih / Belgrad"
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Posta Kodu</label>
                  <input
                    type="text"
                    placeholder="Örn: 80331"
                    value={destinationPostalCode}
                    onChange={(e) => setDestinationPostalCode(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Yük Cinsi */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Yük Cinsi ve Açıklaması *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Endüstriyel Isıtma Kazanları & Paletli Eşya"
                  value={cargoDescription}
                  onChange={(e) => setCargoDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              {/* Tonaj, Palet, Hazır Olma Tarihi, Dorse Tipi */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tonaj (Ton)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tonnage}
                    onChange={(e) => setTonnage(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Palet Sayısı</label>
                  <input
                    type="number"
                    value={palletCount}
                    onChange={(e) => setPalletCount(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hazır Olma Tarihi</label>
                  <input
                    type="date"
                    value={readyDate}
                    onChange={(e) => setReadyDate(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dorse Tipi</label>
                  <select
                    value={trailerType}
                    onChange={(e) => setTrailerType(e.target.value as TrailerCategory)}
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:outline-none cursor-pointer"
                  >
                    <option value="Tenteli Mega">Tenteli Mega</option>
                    <option value="Frigorifik (Termo)">Frigorifik (Termo)</option>
                    <option value="Konteyner Taşıyıcı">Konteyner Taşıyıcı</option>
                    <option value="Damper">Damper</option>
                    <option value="Sal Kasa">Sal Kasa</option>
                    <option value="Lowbed">Lowbed</option>
                  </select>
                </div>
              </div>

              {/* Notlar */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Özel Talimatlar / Notlar</label>
                <textarea
                  rows={2}
                  placeholder="Yükleme saatleri, gümrük detayları, lashing gereksinimi vb."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              {/* Form Butonları */}
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Talebi Keser Operasyona İlet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CMR Modal */}
      {selectedTripForCmr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">
                CMR Taşıma Belgesi - {selectedTripForCmr.cmrNo}
              </h3>
              <button onClick={() => setSelectedTripForCmr(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2 font-bold">
                <span>Taşıyıcı: Keser Uluslararası Lojistik</span>
                <span>CMR No: {selectedTripForCmr.cmrNo}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>Gönderici: <strong>{selectedTripForCmr.customerName}</strong></div>
                <div>Araç: <strong>{selectedTripForCmr.tractorPlate || selectedTripForCmr.vehiclePlate}</strong></div>
                <div>Çıkış: <strong>{selectedTripForCmr.originCity}</strong></div>
                <div>Varış: <strong>{selectedTripForCmr.destinationCity}</strong></div>
                <div>Yük: <strong>{selectedTripForCmr.cargoDescription}</strong></div>
                <div>Ağırlık: <strong>{selectedTripForCmr.weightKg} kg</strong></div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Yazdır / İndir
              </button>
              <button
                onClick={() => setSelectedTripForCmr(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};