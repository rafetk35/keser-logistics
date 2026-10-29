import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Coins,
  X,
  ArrowRightLeft,
  RotateCw,
  FileText,
  Calculator,
  Layers,
  Table,
  Check,
  Copy,
  Info,
  DollarSign,
  TrendingUp,
  Percent,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { TcmbRateType } from '../types';

export const CurrencyCalculatorModal: React.FC = () => {
  const {
    isCurrencyModalOpen,
    setIsCurrencyModalOpen,
    tcmbData,
    loadingRates,
    fetchTcmbRates,
    convertCurrency,
    trips,
    setActiveTab,
    showToast,
  } = useApp();

  const [activeTab, setActiveTabLocal] = useState<'converter' | 'cmr_vat' | 'multi_expense' | 'rates_table'>('converter');

  // Converter state
  const [sourceAmount, setSourceAmount] = useState<number>(4500);
  const [sourceCurrency, setSourceCurrency] = useState<string>('EUR');
  const [targetCurrency, setTargetCurrency] = useState<string>('TRY');
  const [rateType, setRateType] = useState<TcmbRateType>('forexBuying');
  const [useCustomRate, setUseCustomRate] = useState<boolean>(false);
  const [customRate, setCustomRate] = useState<number>(55.0);

  // CMR / Freight VAT tool state
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [freightAmount, setFreightAmount] = useState<number>(4850);
  const [freightCurrency, setFreightCurrency] = useState<string>('EUR');
  const [copiedInvoiceNote, setCopiedInvoiceNote] = useState<boolean>(false);

  // Multi-Currency Expense Aggregator state
  interface ExpenseLine {
    id: string;
    description: string;
    amount: number;
    currency: string;
  }

  const [expenseLines, setExpenseLines] = useState<ExpenseLine[]>([
    { id: '1', description: 'Bulgaristan BG-TOLL Vinyet Bedeli', amount: 110, currency: 'BGN' },
    { id: '2', description: 'Avusturya Asfinag GO-Box Otoyol', amount: 285, currency: 'EUR' },
    { id: '3', description: 'Kapıkule Dezenfeksiyon & Tescil', amount: 3200, currency: 'TRY' },
    { id: '4', description: 'Almanya Otoyol Dinlenme & Mazot', amount: 620, currency: 'EUR' },
  ]);
  const [newLineDesc, setNewLineDesc] = useState('');
  const [newLineAmount, setNewLineAmount] = useState<number>(100);
  const [newLineCurrency, setNewLineCurrency] = useState('EUR');

  // Search filter for rates table
  const [searchQuery, setSearchQuery] = useState('');

  if (!isCurrencyModalOpen) return null;

  // Selected trip autologin
  const handleTripSelect = (tripId: string) => {
    setSelectedTripId(tripId);
    const trip = trips.find((t) => t.id === tripId);
    if (trip) {
      setFreightAmount(trip.freightPrice);
      setFreightCurrency(trip.currency);
    }
  };

  // Currencies supported
  const currencyOptions = [
    { code: 'EUR', label: 'EUR (€) - Euro', flag: '🇪🇺' },
    { code: 'TRY', label: 'TRY (₺) - Türk Lirası', flag: '🇹🇷' },
    { code: 'USD', label: 'USD ($) - ABD Doları', flag: '🇺🇸' },
    { code: 'GBP', label: 'GBP (£) - İngiliz Sterlini', flag: '🇬🇧' },
    { code: 'BGN', label: 'BGN (лв) - Bulgar Levası', flag: '🇧🇬' },
    { code: 'CHF', label: 'CHF (Fr) - İsviçre Frangı', flag: '🇨🇭' },
    { code: 'RON', label: 'RON (lei) - Rumen Leyi', flag: '🇷🇴' },
  ];

  // Primary rate value used for direct conversion
  const effectiveRate = useMemo(() => {
    if (useCustomRate) {
      return customRate;
    }
    // Calculate 1 sourceCurrency in targetCurrency
    return convertCurrency(1, sourceCurrency, targetCurrency, rateType);
  }, [useCustomRate, customRate, sourceCurrency, targetCurrency, rateType, convertCurrency]);

  const convertedResult = useMemo(() => {
    if (useCustomRate) {
      return sourceAmount * customRate;
    }
    return convertCurrency(sourceAmount, sourceCurrency, targetCurrency, rateType);
  }, [sourceAmount, useCustomRate, customRate, sourceCurrency, targetCurrency, rateType, convertCurrency]);

  // Swap currencies
  const handleSwap = () => {
    const temp = sourceCurrency;
    setSourceCurrency(targetCurrency);
    setTargetCurrency(temp);
  };

  // CMR calculations
  const tcmbEurBuyingRate = convertCurrency(1, freightCurrency, 'TRY', 'forexBuying');
  const freightMatrahTRY = freightAmount * tcmbEurBuyingRate;

  const invoiceNoteText = `İşbu navlun faturası 3065 sayılı Katma Değer Vergisi Kanununun 14/1 maddesi uyarınca KDV'den istisnadır. Fatura tarihindeki TCMB Döviz Alış Kuru: 1 ${freightCurrency} = ${tcmbEurBuyingRate.toFixed(
    4
  )} TL. Fatura TL Karşılığı: ${freightMatrahTRY.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} TL.`;

  const copyNoteToClipboard = () => {
    navigator.clipboard.writeText(invoiceNoteText);
    setCopiedInvoiceNote(true);
    showToast('Fatura KDV istisna metni panoya kopyalandı.', 'success');
    setTimeout(() => setCopiedInvoiceNote(false), 2500);
  };

  // Add line to multi-expense
  const handleAddExpenseLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLineDesc.trim() || newLineAmount <= 0) return;
    setExpenseLines((prev) => [
      ...prev,
      {
        id: 'line-' + Date.now(),
        description: newLineDesc.trim(),
        amount: Number(newLineAmount),
        currency: newLineCurrency,
      },
    ]);
    setNewLineDesc('');
    setNewLineAmount(100);
    showToast('Masraf kalemi eklendi.', 'info');
  };

  const removeExpenseLine = (id: string) => {
    setExpenseLines((prev) => prev.filter((l) => l.id !== id));
  };

  // Consolidated expense totals
  const consolidatedEUR = expenseLines.reduce(
    (sum, l) => sum + convertCurrency(l.amount, l.currency, 'EUR', 'forexBuying'),
    0
  );
  const consolidatedTRY = expenseLines.reduce(
    (sum, l) => sum + convertCurrency(l.amount, l.currency, 'TRY', 'forexBuying'),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  TCMB Otomatik Döviz Çevirici &amp; Navlun Kur Hesaplayıcı
                </h2>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-600 text-white">
                  Canlı TCMB
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>{tcmbData?.source || 'Türkiye Cumhuriyet Merkez Bankası'}</span>
                <span>•</span>
                <span>Bülten: {tcmbData?.bulletinNo || '2026/01'}</span>
                <span>•</span>
                <span>Tarih: {tcmbData?.date || new Date().toLocaleDateString('tr-TR')}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchTcmbRates();
                showToast('TCMB kurları güncelleniyor...', 'info');
              }}
              disabled={loadingRates}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Kurları Şimdi Yenile"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loadingRates ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">Kurları Yenile</span>
            </button>
            <button
              onClick={() => setIsCurrencyModalOpen(false)}
              className="text-slate-400 hover:text-white p-2 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Rates Ticker Strip */}
        <div className="bg-slate-950 px-5 py-2 text-xs border-b border-slate-800 flex items-center justify-between overflow-x-auto gap-4 scrollbar-none text-slate-300">
          <div className="flex items-center gap-4 sm:gap-6 shrink-0 font-mono text-[11px]">
            <div>
              <span className="text-slate-400">EUR/TL (Alış): </span>
              <strong className="text-emerald-400">
                {tcmbData?.rates?.EUR?.forexBuying?.toFixed(4) || '54.2150'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400">USD/TL (Alış): </span>
              <strong className="text-emerald-400">
                {tcmbData?.rates?.USD?.forexBuying?.toFixed(4) || '49.5647'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400">GBP/TL (Alış): </span>
              <strong className="text-blue-400">
                {tcmbData?.rates?.GBP?.forexBuying?.toFixed(4) || '63.8500'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400">BGN/TL (Alış): </span>
              <strong className="text-amber-400">
                {tcmbData?.rates?.BGN?.forexBuying?.toFixed(4) || '27.6800'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400">EUR/USD: </span>
              <strong className="text-purple-300">
                {(
                  (tcmbData?.rates?.EUR?.forexBuying || 54.215) /
                  (tcmbData?.rates?.USD?.forexBuying || 49.5647)
                ).toFixed(4)}
              </strong>
            </div>
          </div>

          <span className="text-[10px] text-slate-500 uppercase tracking-wider shrink-0 hidden md:inline">
            Resmi Gösterge Kurları
          </span>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTabLocal('converter')}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 shrink-0 ${
              activeTab === 'converter' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            1. Otomatik Döviz Çevirici
            {activeTab === 'converter' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTabLocal('cmr_vat')}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 shrink-0 ${
              activeTab === 'cmr_vat' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            2. CMR Navlun &amp; KDV Matrahı (Gümrük)
            {activeTab === 'cmr_vat' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTabLocal('multi_expense')}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 shrink-0 ${
              activeTab === 'multi_expense' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            3. Çoklu Masraf Fişi Konsolidasyonu
            {activeTab === 'multi_expense' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTabLocal('rates_table')}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 shrink-0 ${
              activeTab === 'rates_table' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            4. TCMB Resmi Kurlar Listesi
            {activeTab === 'rates_table' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab 1: Converter */}
        {activeTab === 'converter' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Input grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Çevrilecek Tutar
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={sourceAmount}
                    onChange={(e) => setSourceAmount(Number(e.target.value))}
                    className="w-full p-3 text-lg font-black text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <div className="absolute right-3 top-3.5 text-xs font-bold text-slate-400">
                    {sourceCurrency}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kaynak Birim
                </label>
                <select
                  value={sourceCurrency}
                  onChange={(e) => setSourceCurrency(e.target.value)}
                  className="w-full p-3 text-xs font-bold border border-slate-300 rounded-xl focus:outline-none bg-white"
                >
                  {currencyOptions.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center pb-1">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 transition-colors shadow-xs"
                  title="Para Birimlerini Değiştir (Swap)"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hedef Birim
                </label>
                <select
                  value={targetCurrency}
                  onChange={(e) => setTargetCurrency(e.target.value)}
                  className="w-full p-3 text-xs font-bold border border-slate-300 rounded-xl focus:outline-none bg-white"
                >
                  {currencyOptions.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rate Type Selector */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Uygulanacak TCMB Kur Tipi Seçimi:
                </span>
                <label className="flex items-center gap-2 text-xs font-semibold text-indigo-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomRate}
                    onChange={(e) => setUseCustomRate(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-indigo-600"
                  />
                  <span>Özel Sözleşmeli Sabit Kur Uygula</span>
                </label>
              </div>

              {!useCustomRate ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'forexBuying', label: 'TCMB Döviz Alış', desc: 'Gümrük & Fatura Matrahı (Yasal)' },
                    { id: 'forexSelling', label: 'TCMB Döviz Satış', desc: 'Banka Transferleri' },
                    { id: 'banknoteBuying', label: 'Efektif Alış', desc: 'Nakit Şoför Avansı' },
                    { id: 'banknoteSelling', label: 'Efektif Satış', desc: 'Nakit Gişe Satışı' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRateType(r.id as TcmbRateType)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        rateType === r.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-bold text-xs">{r.label}</div>
                      <div className={`text-[10px] mt-0.5 ${rateType === r.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                        {r.desc}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                      Müşteri ile Sözleşilen Özel Sabit Kur (1 {sourceCurrency} = ? {targetCurrency})
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={customRate}
                      onChange={(e) => setCustomRate(Number(e.target.value))}
                      className="w-full p-2 text-sm font-bold border border-indigo-300 rounded-lg bg-white focus:outline-none"
                    />
                  </div>
                  <div className="text-xs text-indigo-800 shrink-0">
                    <div className="font-semibold">Resmi TCMB Kuru:</div>
                    <div className="font-mono font-bold">
                      {convertCurrency(1, sourceCurrency, targetCurrency, 'forexBuying').toFixed(4)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Big Result Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-lg border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                  Dönüşüm Sonucu ({rateType === 'forexBuying' ? 'TCMB Döviz Alış' : rateType})
                </div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                  {convertedResult.toLocaleString('tr-TR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  <span className="text-xl sm:text-2xl font-bold text-white">{targetCurrency}</span>
                </div>
                <div className="text-xs text-slate-400 mt-2 font-mono">
                  1 {sourceCurrency} = {effectiveRate.toFixed(4)} {targetCurrency} • 1 {targetCurrency} ={' '}
                  {(1 / (effectiveRate || 1)).toFixed(4)} {sourceCurrency}
                </div>
              </div>

              <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-slate-700/80 pt-4 sm:pt-0 sm:pl-6 space-y-1 text-xs">
                <div className="text-slate-400">TCMB Bülten Tarihi:</div>
                <div className="font-bold text-white">{tcmbData?.date || '23.10.2026'}</div>
                <div className="text-slate-400 mt-2">Bülten No:</div>
                <div className="font-mono text-amber-400 font-bold">{tcmbData?.bulletinNo || '2026/201'}</div>
              </div>
            </div>

            {/* Quick Multi-Currency Cross Rate Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2">
                Girilen {sourceAmount.toLocaleString('tr-TR')} {sourceCurrency} Tutarının Diğer Para Birimlerindeki Karşılığı:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {currencyOptions
                  .filter((c) => c.code !== sourceCurrency)
                  .map((c) => {
                    const converted = convertCurrency(sourceAmount, sourceCurrency, c.code, rateType);
                    return (
                      <div
                        key={c.code}
                        className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs"
                      >
                        <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
                          <span>{c.flag} {c.code}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            1={convertCurrency(1, sourceCurrency, c.code, rateType).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-base font-black text-slate-900 mt-1">
                          {converted.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} {c.code}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: CMR Navlun & KDV Matrahı (Gümrük & Muhasebe) */}
        {activeTab === 'cmr_vat' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Uluslararası Taşımacılık KDV İstisnası Kuralı:</strong> 3065 sayılı Katma Değer Vergisi Kanununun 14. maddesi ve Vergi Usul Kanunu gereğince, Türkiye ile yabancı ülkeler arasındaki navlun faturalarında dövizli tutar faturanın düzenlendiği günkü <strong>T.C. Merkez Bankası Döviz Alış Kuru</strong> ile Türk Lirasına çevrilerek matrah kaydedilir.
              </div>
            </div>

            {/* Trip selector or manual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kayıtlı Sefer / CMR Seç (Otomatik Doldur)
                </label>
                <select
                  value={selectedTripId}
                  onChange={(e) => handleTripSelect(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl bg-white font-medium focus:outline-none"
                >
                  <option value="">-- Manuel Tutar Gireceğim --</option>
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.cmrNo} • {t.customerName} ({t.originCity} → {t.destinationCity}) - {t.freightPrice} {t.currency}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Navlun Bedeli
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={freightAmount}
                    onChange={(e) => setFreightAmount(Number(e.target.value))}
                    className="w-full p-2.5 text-xs font-bold border border-slate-300 rounded-xl focus:outline-none"
                  />
                  <select
                    value={freightCurrency}
                    onChange={(e) => setFreightCurrency(e.target.value)}
                    className="p-2.5 text-xs font-bold border border-slate-300 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Calculations breakdown table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-800">
                Resmi Gümrük &amp; Fatura Tescil Hesabı
              </div>
              <table className="w-full text-left text-xs">
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-white">
                    <td className="py-2.5 px-4 font-medium text-slate-600">Dövizli Navlun Tutarı:</td>
                    <td className="py-2.5 px-4 text-right font-black text-slate-900">
                      {freightAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {freightCurrency}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="py-2.5 px-4 font-medium text-slate-600">
                      Resmi TCMB Döviz Alış Kuru (Forex Buying):
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-indigo-700">
                      1 {freightCurrency} = {tcmbEurBuyingRate.toFixed(4)} TL
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="py-2.5 px-4 font-medium text-slate-600">
                      Fatura KDV Matrahı (Türk Lirası):
                    </td>
                    <td className="py-2.5 px-4 text-right font-black text-base text-slate-900">
                      {freightMatrahTRY.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="py-2.5 px-4 font-medium text-slate-600">
                      Hesaplanan KDV (%0 İstisna Md. 14):
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-emerald-700">
                      0,00 TL (%0 İstisna)
                    </td>
                  </tr>
                  <tr className="bg-emerald-50 font-bold text-emerald-950">
                    <td className="py-3 px-4">Genel Toplam (Fatura Tutarı):</td>
                    <td className="py-3 px-4 text-right font-black text-lg text-emerald-700">
                      {freightAmount.toLocaleString('tr-TR')} {freightCurrency} (
                      {freightMatrahTRY.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} TL)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Official Invoice Note Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  E-Fatura &amp; E-Arşiv İçin Resmi Şerh Metni:
                </span>
                <button
                  type="button"
                  onClick={copyNoteToClipboard}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-indigo-600 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                >
                  {copiedInvoiceNote ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kopyalandı</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Metni Kopyala</span>
                    </>
                  )}
                </button>
              </div>
              <p className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 font-mono leading-relaxed select-all">
                {invoiceNoteText}
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Multi-Expense Aggregator */}
        {activeTab === 'multi_expense' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Çoklu Para Birimli Sefer Masrafları Konsolidasyonu
              </h3>
              <p className="text-xs text-slate-500">
                Şoförlerin Avrupa seferinde Leva (BGN), Euro (EUR) veya Türk Lirası ile yaptığı farklı fişleri TCMB kuruyla tek sepette toplayın.
              </p>
            </div>

            {/* Add Line Form */}
            <form onSubmit={handleAddExpenseLine} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap sm:flex-nowrap gap-2 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Masraf Açıklaması
                </label>
                <input
                  type="text"
                  value={newLineDesc}
                  onChange={(e) => setNewLineDesc(e.target.value)}
                  placeholder="örn: Sırbistan Otoyol Geçiş Fişi"
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="w-28">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tutar
                </label>
                <input
                  type="number"
                  step="any"
                  value={newLineAmount}
                  onChange={(e) => setNewLineAmount(Number(e.target.value))}
                  className="w-full p-2 text-xs font-bold border border-slate-300 rounded-lg bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="w-28">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Para Birimi
                </label>
                <select
                  value={newLineCurrency}
                  onChange={(e) => setNewLineCurrency(e.target.value)}
                  className="w-full p-2 text-xs font-bold border border-slate-300 rounded-lg bg-white focus:outline-none"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="TRY">TRY (₺)</option>
                  <option value="BGN">BGN (лв)</option>
                  <option value="USD">USD ($)</option>
                  <option value="CHF">CHF (Fr)</option>
                  <option value="RON">RON (lei)</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ekle</span>
              </button>
            </form>

            {/* Expense Lines Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                    <th className="py-2.5 px-4">Harcama Kalemi</th>
                    <th className="py-2.5 px-3 text-right">Orijinal Tutar</th>
                    <th className="py-2.5 px-3 text-right">TCMB Kuru (TL)</th>
                    <th className="py-2.5 px-3 text-right">EUR Karşılığı</th>
                    <th className="py-2.5 px-3 text-right">TL Karşılığı</th>
                    <th className="py-2.5 px-3 text-center">Sil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenseLines.map((line) => {
                    const eurVal = convertCurrency(line.amount, line.currency, 'EUR', 'forexBuying');
                    const tryVal = convertCurrency(line.amount, line.currency, 'TRY', 'forexBuying');
                    const rateToTry = convertCurrency(1, line.currency, 'TRY', 'forexBuying');

                    return (
                      <tr key={line.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 font-medium text-slate-900">{line.description}</td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-800">
                          {line.amount.toLocaleString('tr-TR')} {line.currency}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                          {rateToTry.toFixed(4)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-indigo-700">
                          {eurVal.toFixed(2)} €
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {tryVal.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeExpenseLine(line.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Consolidated Summary */}
            <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-400 uppercase font-bold">Konsolide Toplam Sefer Gideri</div>
                <div className="text-2xl font-black text-amber-400 mt-0.5">
                  {consolidatedEUR.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400 uppercase font-bold">Toplam TL Karşılığı</div>
                <div className="text-2xl font-black text-white mt-0.5">
                  {consolidatedTRY.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Official TCMB Rates Table */}
        {activeTab === 'rates_table' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Para birimi ara (USD, EUR, GBP, BGN vb.)..."
                className="p-2 text-xs border border-slate-300 rounded-lg w-full max-w-xs focus:outline-none"
              />
              <span className="text-xs text-slate-500">
                Kaynak: TCMB Gösterge Kurları Bülteni ({tcmbData?.bulletinNo})
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                      <th className="py-2.5 px-3">Kod</th>
                      <th className="py-2.5 px-3">Para Birimi Adı</th>
                      <th className="py-2.5 px-3 text-center">Birim</th>
                      <th className="py-2.5 px-3 text-right">Döviz Alış</th>
                      <th className="py-2.5 px-3 text-right">Döviz Satış</th>
                      <th className="py-2.5 px-3 text-right">Efektif Alış</th>
                      <th className="py-2.5 px-3 text-right">Efektif Satış</th>
                      <th className="py-2.5 px-3 text-right">Dolar Çapraz</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tcmbData && tcmbData.rates ? (
                      Object.values(tcmbData.rates)
                        .filter((r) =>
                          r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.name.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((r) => (
                          <tr key={r.code} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3 font-bold text-indigo-700">{r.code}</td>
                            <td className="py-2.5 px-3 font-medium text-slate-800">{r.name}</td>
                            <td className="py-2.5 px-3 text-center text-slate-500">{r.unit}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                              {r.forexBuying ? r.forexBuying.toFixed(4) : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                              {r.forexSelling ? r.forexSelling.toFixed(4) : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                              {r.banknoteBuying ? r.banknoteBuying.toFixed(4) : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                              {r.banknoteSelling ? r.banknoteSelling.toFixed(4) : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                              {r.crossRateUSD ? r.crossRateUSD.toFixed(4) : '-'}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          Kurlar yükleniyor...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-500" />
            <span>Kurlar TCMB günlük bülteninden otomatik yenilenir.</span>
          </div>
          <button
            onClick={() => setIsCurrencyModalOpen(false)}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Pencereyi Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
