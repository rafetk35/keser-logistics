import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Download,
  Upload,
  CheckCircle,
  Building,
  Truck,
  ShieldCheck,
  Printer,
  Calendar,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Currency, TransportContract } from '../types';

export const TransportContractModal: React.FC = () => {
  const {
    isContractModalOpen,
    setIsContractModalOpen,
    contractModalTrip,
    companySettings,
    customers,
    suppliers,
    contracts,
    addContract,
    uploadSignedContract,
    showToast,
  } = useApp();

  const [partyType, setPartyType] = useState<'customer' | 'supplier'>('customer');
  const [selectedPartyId, setSelectedPartyId] = useState<string>('');
  const [partyName, setPartyName] = useState('');
  const [partyTaxId, setPartyTaxId] = useState('');
  const [partyTaxOffice, setPartyTaxOffice] = useState('');
  const [partyAddress, setPartyAddress] = useState('');

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [cargoDescription, setCargoDescription] = useState('');
  const [agreedPrice, setAgreedPrice] = useState<number>(4500);
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [paymentTerms, setPaymentTerms] = useState(
    'Teslimat evrakı (CMR aslı) ve fatura ibrazından itibaren 15 gün vadeli havale/EFT.'
  );
  const [demurrageTerms, setDemurrageTerms] = useState(
    'Gümrük ve boşaltma noktalarında bekleme süresi 48 saat ücretsizdir. Aşan her 24 saat veya kesri için günlük 150 EUR demoraj bedeli fatura edilir.'
  );

  const [previewMode, setPreviewMode] = useState(false);
  const [signedFileUrl, setSignedFileUrl] = useState<string>('');
  const [existingContract, setExistingContract] = useState<TransportContract | null>(null);

  // Auto fill when modal opens or trip changes
  useEffect(() => {
    if (contractModalTrip) {
      if (contractModalTrip.ownership === 'Kiralık') {
        setPartyType('supplier');
        const matchedSup = suppliers.find((s) => s.companyName === contractModalTrip.driverName || s.taxId);
        if (matchedSup) {
          setSelectedPartyId(matchedSup.id);
          setPartyName(matchedSup.companyName);
          setPartyTaxId(matchedSup.taxId);
          setPartyTaxOffice('İlgili Vergi Dairesi');
          setPartyAddress(`${matchedSup.city}, ${matchedSup.country}`);
        } else {
          setPartyName(contractModalTrip.customerName);
          setPartyTaxId('1234567890');
          setPartyTaxOffice('Vergi Dairesi');
          setPartyAddress('İstanbul / Türkiye');
        }
      } else {
        setPartyType('customer');
        const matchedCust = customers.find((c) => c.id === contractModalTrip.customerId);
        if (matchedCust) {
          setSelectedPartyId(matchedCust.id);
          setPartyName(matchedCust.companyName);
          setPartyTaxId(matchedCust.taxId);
          setPartyTaxOffice(matchedCust.taxOffice);
          setPartyAddress(`${matchedCust.city}, ${matchedCust.country}`);
        } else {
          setPartyName(contractModalTrip.customerName);
          setPartyTaxId('1234567890');
          setPartyTaxOffice('Vergi Dairesi');
          setPartyAddress('İstanbul / Türkiye');
        }
      }

      setOrigin(`${contractModalTrip.originCity} / ${contractModalTrip.originCountry}`);
      setDestination(`${contractModalTrip.destinationCity} / ${contractModalTrip.destinationCountry}`);
      setCargoDescription(
        `${contractModalTrip.cargoDescription} (${(contractModalTrip.weightKg / 1000).toFixed(1)} Ton, ${contractModalTrip.palletCount} Palet)`
      );
      setAgreedPrice(contractModalTrip.freightPrice);
      setCurrency(contractModalTrip.currency);

      // Check if existing contract exists
      const foundContract = contracts.find((c) => c.tripId === contractModalTrip.id);
      if (foundContract) {
        setExistingContract(foundContract);
        if (foundContract.signedContractUrl) {
          setSignedFileUrl(foundContract.signedContractUrl);
        }
      } else {
        setExistingContract(null);
      }
    } else {
      // Default to first customer
      if (customers.length > 0) {
        const c = customers[0];
        setSelectedPartyId(c.id);
        setPartyName(c.companyName);
        setPartyTaxId(c.taxId);
        setPartyTaxOffice(c.taxOffice);
        setPartyAddress(`${c.city}, ${c.country}`);
        setOrigin('İstanbul / Türkiye');
        setDestination('Frankfurt / Almanya');
        setCargoDescription('Ticari Yük & Paletli Malzeme (22 Ton)');
        setAgreedPrice(4600);
        setCurrency('EUR');
      }
    }
  }, [contractModalTrip, isContractModalOpen, customers, suppliers, contracts]);

  const handlePartySelect = (id: string) => {
    setSelectedPartyId(id);
    if (partyType === 'customer') {
      const c = customers.find((item) => item.id === id);
      if (c) {
        setPartyName(c.companyName);
        setPartyTaxId(c.taxId);
        setPartyTaxOffice(c.taxOffice);
        setPartyAddress(`${c.city}, ${c.country}`);
      }
    } else {
      const s = suppliers.find((item) => item.id === id);
      if (s) {
        setPartyName(s.companyName);
        setPartyTaxId(s.taxId);
        setPartyTaxOffice('Vergi Dairesi');
        setPartyAddress(`${s.city}, ${s.country}`);
      }
    }
  };

  const handleSaveContract = () => {
    if (!partyName || !partyTaxId || !agreedPrice) {
      showToast('Lütfen sözleşme tarafları ve navlun tutarını eksiksiz doldurun.', 'error');
      return;
    }

    const created = addContract({
      partyType,
      partyId: selectedPartyId,
      partyName,
      partyTaxId,
      partyTaxOffice,
      partyAddress,
      tripId: contractModalTrip?.id,
      tripCmrNo: contractModalTrip?.cmrNo,
      origin,
      destination,
      cargoDescription,
      agreedPrice,
      currency,
      paymentTerms,
      demurrageTerms,
      specialClauses: [
        'Taşıma işlemi CMR Konvansiyonu ve Türk Ticaret Kanunu (TTK) hükümlerine tabidir.',
        'Taşıyıcı, yükü sevk irsaliyesi ve CMR belgesine uygun şekilde hasarsız teslim etmeyi taahhüt eder.',
        'Gümrük kapılarında yaşanan gecikmeler taraflara derhal yazılı bildirilmek kaydıyla sözleşme süresine eklenir.',
        'Doğabilecek hukuki uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.',
      ],
      status: signedFileUrl ? 'İmzalandı / Kaşelendi' : 'Taslak',
      signedContractUrl: signedFileUrl || undefined,
      createdByName: 'Operasyon Departmanı',
    });

    setExistingContract(created);
    setPreviewMode(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file extension and size (Cybersecurity constraint)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showToast('Güvenlik Uyarısı: Sadece PDF veya JPG/PNG/WEBP formatında evrak yüklenebilir.', 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast('Dosya boyutu 10 MB sınırını aşamaz.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setSignedFileUrl(url);
        if (existingContract) {
          uploadSignedContract(existingContract.id, url, contractModalTrip?.id);
        }
        showToast('İmzalı/kaşeli sözleşme görseli yüklendi.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isContractModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-300">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {contractModalTrip ? `Hızlı Taşıma Sözleşmesi: ${contractModalTrip.cmrNo}` : 'Uluslararası Taşıma Sözleşmesi Hazırla'}
              </h2>
              <p className="text-xs text-blue-200">
                CMR & TTK Mevzuatına Uyumlu Dijital Sözleşme ve Onay Arşivi
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                previewMode
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {previewMode ? 'Düzenleme Modu' : 'Sözleşme Önizle & Yazdır'}
            </button>
            <button
              onClick={() => setIsContractModalOpen(false)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {!previewMode ? (
            <div className="space-y-6">
              {/* Party Type Switch */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Sözleşme Tarafı
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setPartyType('customer');
                      if (customers.length > 0) handlePartySelect(customers[0].id);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all border ${
                      partyType === 'customer'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    Müşteri (Yük Veren Sözleşmesi)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPartyType('supplier');
                      if (suppliers.length > 0) handlePartySelect(suppliers[0].id);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all border ${
                      partyType === 'supplier'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    Tedarikçi / Taşeron (Kiralık Filo Sözleşmesi)
                  </button>
                </div>
              </div>

              {/* 1. Taraflar Bilgisi */}
              <div className="border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    1. Taraflar ve Yasal Bilgiler
                  </h3>
                  <div className="text-xs text-slate-500 font-mono">
                    Taşıyıcı: {companySettings.companyName} (VKN: {companySettings.companyTaxId})
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Kayıtlı {partyType === 'customer' ? 'Müşteri' : 'Tedarikçi'} Seç
                    </label>
                    <select
                      value={selectedPartyId}
                      onChange={(e) => handlePartySelect(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {partyType === 'customer'
                        ? customers.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.companyName} ({c.taxId})
                            </option>
                          ))
                        : suppliers.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.companyName} ({s.taxId})
                            </option>
                          ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Firma Resmi Unvanı
                    </label>
                    <input
                      type="text"
                      value={partyName}
                      onChange={(e) => setPartyName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Vergi Kimlik No (VKN) / TC
                    </label>
                    <input
                      type="text"
                      value={partyTaxId}
                      onChange={(e) => setPartyTaxId(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Vergi Dairesi
                    </label>
                    <input
                      type="text"
                      value={partyTaxOffice}
                      onChange={(e) => setPartyTaxOffice(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Tebligat Adresi
                    </label>
                    <input
                      type="text"
                      value={partyAddress}
                      onChange={(e) => setPartyAddress(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Güzergah & Yük Şartları */}
              <div className="border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm border-b pb-2">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  2. Taşıma Parkuru ve Yük Detayları
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Yükleme Yeri (Origin)
                    </label>
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="Örn: Manisa OSB / TÜRKİYE"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Teslim Yeri (Destination)
                    </label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Örn: Stuttgart / ALMANYA"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Yükün Cinsi, Tonaj ve Ambalaj Şekli
                    </label>
                    <input
                      type="text"
                      value={cargoDescription}
                      onChange={(e) => setCargoDescription(e.target.value)}
                      placeholder="Örn: Endüstriyel Parçalar (22 Ton / 33 Palet)"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Fiyat, Ödeme ve Demoraj */}
              <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-blue-50/30">
                <h3 className="font-bold text-blue-900 flex items-center gap-2 text-sm border-b pb-2">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  3. Navlun Bedeli, Vade ve Demoraj (Bekleme) Koşulları
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Anlaşılan Navlun Fiyatı
                    </label>
                    <input
                      type="number"
                      value={agreedPrice}
                      onChange={(e) => setAgreedPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Para Birimi
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as Currency)}
                      className="w-full px-3 py-2 text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="TRY">TRY (₺)</option>
                      <option value="RUB">RUB (₽)</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Ödeme Vadesi ve Şartları
                    </label>
                    <textarea
                      rows={2}
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Gümrük / Sınır Kapısı Demoraj (Bekleme) Maddesi
                    </label>
                    <textarea
                      rows={2}
                      value={demurrageTerms}
                      onChange={(e) => setDemurrageTerms(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Islak İmzalı / Kaşeli Belge Yükleme */}
              <div className="border-2 border-dashed border-indigo-200 rounded-xl p-5 bg-indigo-50/40">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-indigo-950 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-indigo-600" />
                      İmzalanmış Islak İmzalı / Kaşeli Sözleşme Yükle
                    </h4>
                    <p className="text-xs text-indigo-700 mt-1">
                      Sözleşme çıktısı alındıktan ve taraflarca imzalandıktan sonra fotoğrafını veya PDF taramasını doğrudan bu sefere bağlayabilirsiniz.
                    </p>
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow cursor-pointer transition-all">
                      <Upload className="w-4 h-4" />
                      İmzalı Belge Seç
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                {signedFileUrl && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    İmzalı sözleşme görseli yüklendi. Sözleşme durumu "İmzalandı / Kaşelendi" olarak mühürlenecektir.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* PREVIEW / PRINT VIEW */
            <div className="border border-slate-300 rounded-xl p-8 bg-white shadow-sm space-y-6 print:m-0 print:border-none print:shadow-none">
              {/* Top Banner */}
              <div className="border-b-2 border-blue-900 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-black text-blue-950 tracking-wide uppercase">
                    ULUSLARARASI TAŞIMA VE LOJİSTİK SÖZLEŞMESİ
                  </h1>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">
                    1956 C.M.R. Konvansiyonu &amp; 6102 Sayılı Türk Ticaret Kanunu Hükümlerine Tabidir
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-900 font-mono font-bold text-sm rounded">
                    {existingContract?.contractNo || 'SOZ-2026-TASLAK'}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    Düzenleme Tarihi: {new Date().toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>

              {/* Taraflar Tablosu */}
              <div className="grid grid-cols-2 gap-6 text-xs">
                <div className="border rounded-lg p-3 bg-slate-50">
                  <h4 className="font-bold text-blue-900 border-b pb-1 mb-2">TAŞIYICI</h4>
                  <p className="font-bold text-slate-800">{companySettings.companyName}</p>
                  <p className="text-slate-600">VKN: {companySettings.companyTaxId} • {companySettings.companyTaxOffice}</p>
                  <p className="text-slate-600">{companySettings.companyAddress}</p>
                  <p className="text-slate-600">Tel: {companySettings.companyPhone}</p>
                  <p className="text-slate-600">IBAN (EUR): {companySettings.companyIbanEUR}</p>
                </div>

                <div className="border rounded-lg p-3 bg-slate-50">
                  <h4 className="font-bold text-blue-900 border-b pb-1 mb-2">
                    {partyType === 'customer' ? 'YÜK VEREN (MÜŞTERİ)' : 'TAŞERON FİLO SAĞLAYICI'}
                  </h4>
                  <p className="font-bold text-slate-800">{partyName}</p>
                  <p className="text-slate-600">VKN / TC: {partyTaxId} • {partyTaxOffice}</p>
                  <p className="text-slate-600">{partyAddress}</p>
                  {contractModalTrip && (
                    <p className="text-blue-700 font-semibold mt-1">
                      İlişkili Sefer No: {contractModalTrip.cmrNo}
                    </p>
                  )}
                </div>
              </div>

              {/* Parkur & Yük */}
              <div className="border rounded-lg p-3 text-xs space-y-2">
                <h4 className="font-bold text-blue-900 border-b pb-1">TAŞIMA VE GÜZERGAH DETAYLARI</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold text-slate-600">Yükleme Noktası: </span>
                    <span className="font-bold text-slate-800">{origin}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600">Teslim Noktası: </span>
                    <span className="font-bold text-slate-800">{destination}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold text-slate-600">Yük Tanımı ve Cinsi: </span>
                    <span className="text-slate-800">{cargoDescription}</span>
                  </div>
                </div>
              </div>

              {/* Fiyat & Demoraj */}
              <div className="border rounded-lg p-3 text-xs space-y-2 bg-blue-50/50">
                <h4 className="font-bold text-blue-900 border-b pb-1">NAVLUN BEDELİ VE BEKLEME ŞARTLARI</h4>
                <div className="flex justify-between items-center py-1">
                  <span className="font-semibold text-slate-700">Kararlaştırılan Toplam Navlun:</span>
                  <span className="text-base font-extrabold text-blue-900">
                    {agreedPrice.toLocaleString('tr-TR')} {currency}
                  </span>
                </div>
                <p className="text-slate-700">
                  <strong className="text-slate-900">Ödeme Koşulları: </strong>
                  {paymentTerms}
                </p>
                <p className="text-slate-700">
                  <strong className="text-slate-900">Demoraj / Bekleme Hükmü: </strong>
                  {demurrageTerms}
                </p>
              </div>

              {/* Standart CMR Maddeleri */}
              <div className="border rounded-lg p-3 text-[11px] text-slate-600 space-y-1">
                <h4 className="font-bold text-slate-800 mb-1">HUKUKİ YÜKÜMLÜLÜKLER VE ÖZEL ŞARTLAR</h4>
                <p>1. Taşıma sırasında emtianın ziya ve hasarından doğacak sorumluluklar CMR Konvansiyonu çerçevesindedir.</p>
                <p>2. Yük verenin beyan ettiği ağırlık ve ambalaj standartlarına uyulmamasından doğacak cezalar yük verene aittir.</p>
                <p>3. Mücbir sebepler ve sınır kapısı yoğunlukları dışında meydana gelen gecikmeler derhal yazılı bildirilmelidir.</p>
                <p>4. Uyuşmazlık halinde İstanbul Ticaret Mahkemeleri ve İcra Daireleri münhasıran yetkilidir.</p>
              </div>

              {/* Kaşe ve İmza Blokları */}
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="border rounded-lg p-4 text-center h-32 flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-700">TAŞIYICI KAŞE &amp; İMZA</span>
                  <div className="text-[10px] text-slate-400">
                    {companySettings.companyName}
                    <br />
                    Yetkili İmza
                  </div>
                </div>
                <div className="border rounded-lg p-4 text-center h-32 flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    {partyType === 'customer' ? 'MÜŞTERİ KAŞE &amp; İMZA' : 'TAŞERON KAŞE &amp; İMZA'}
                  </span>
                  <div className="text-[10px] text-slate-400">
                    {partyName}
                    <br />
                    Yetkili İmza
                  </div>
                </div>
              </div>

              {/* Uploaded signed copy preview if available */}
              {signedFileUrl && (
                <div className="mt-4 p-4 border border-emerald-200 bg-emerald-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Arşivlenmiş Islak İmzalı &amp; Kaşeli Sözleşme Dosyası
                    </span>
                    <a
                      href={signedFileUrl}
                      download={`Sozlesme_${partyName.replace(/\s+/g, '_')}.png`}
                      className="text-xs text-blue-600 underline font-semibold"
                    >
                      İndir
                    </a>
                  </div>
                  <img
                    src={signedFileUrl}
                    alt="İmzalı Sözleşme"
                    className="max-h-60 mx-auto rounded border shadow-sm object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sözleşme ve ekleri yasal arşiv kilidi ile saklanır.</span>
          </div>

          <div className="flex items-center gap-3">
            {previewMode ? (
              <>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow"
                >
                  <Printer className="w-4 h-4" />
                  Yazdır / PDF Olarak Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setIsContractModalOpen(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow"
                >
                  Tamamla ve Kapat
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsContractModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleSaveContract}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md"
                >
                  <FileCheck className="w-4 h-4" />
                  Sözleşmeyi Oluştur ve Arşivle
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
