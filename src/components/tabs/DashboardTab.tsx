import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  Navigation,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  ArrowUpRight,
  Clock,
  MapPin,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Building2,
  Calendar,
  Coins,
} from 'lucide-react';
import { TripStatus } from '../../types';

export const DashboardTab: React.FC = () => {
  const {
    vehicles,
    trips,
    expenses,
    invoices,
    customers,
    currentRole,
    permissions,
    setActiveTab,
    convertCurrency,
    tcmbData,
    setIsCurrencyModalOpen,
  } = useApp();

  // Fleet stats
  const totalVehicles = vehicles.length;
  const idleVehicles = vehicles.filter((v) => v.status === 'Boş').length;
  const onDutyVehicles = vehicles.filter((v) => v.status === 'Yükte').length;
  const inMaintenanceVehicles = vehicles.filter((v) => v.status === 'Bakımda').length;
  const ownedVehicles = vehicles.filter((v) => v.type === 'Öz Mal').length;
  const rentedVehicles = vehicles.filter((v) => v.type === 'Kiralık').length;

  // Trips stats
  const activeTrips = trips.filter((t) => t.status === 'Yolda' || t.status === 'Gümrükte' || t.status === 'Hazırlanıyor');
  const deliveredTrips = trips.filter((t) => t.status === 'Teslim Edildi').length;

  // Financial stats (EUR normalized using live TCMB Forex Buying rates)
  const totalFreightEUR = trips.reduce(
    (sum, t) => sum + convertCurrency(t.freightPrice, t.currency, 'EUR', 'forexBuying'),
    0
  );

  const totalExpenseEUR = expenses.reduce(
    (sum, e) => sum + convertCurrency(e.amount, e.currency, 'EUR', 'forexBuying'),
    0
  );

  const pendingReceivablesEUR = customers.reduce((sum, c) => sum + (c.balanceEUR || 0), 0);
  const estimatedNetProfitEUR = Math.max(0, totalFreightEUR - totalExpenseEUR);
  const profitMargin = totalFreightEUR > 0 ? ((estimatedNetProfitEUR / totalFreightEUR) * 100).toFixed(1) : '0';

  // Overdue / Urgent reminders
  const urgentInvoices = invoices.filter((inv) => {
    if (inv.status === 'Tahsil Edildi / Ödendi') return false;
    const dueTime = new Date(inv.dueDate).getTime();
    const diffDays = Math.ceil((dueTime - Date.now()) / (1000 * 3600 * 24));
    return diffDays <= 3;
  });

  const urgentVehicles = vehicles.filter((v) => {
    if (!v.nextInspectionDate) return false;
    const inspTime = new Date(v.nextInspectionDate).getTime();
    const diffDays = Math.ceil((inspTime - Date.now()) / (1000 * 3600 * 24));
    return diffDays <= 15;
  });

  const getStatusBadge = (status: TripStatus) => {
    switch (status) {
      case 'Yolda':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Gümrükte':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Hazırlanıyor':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Teslim Edildi':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Role banner if restricted */}
      {currentRole === 'operations' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-900">
                Operasyon Modu: Filo &amp; Sefer Yönetimi Aktif
              </h4>
              <p className="text-xs text-emerald-700">
                Tüm araç hareketleri, sınır kapısı geçişleri ve şoför harcırah masrafları sizin yetkinizdedir.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('trips')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            Seferleri Yönet <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {currentRole === 'accounting' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Muhasebe Modu: Cari &amp; Fatura Denetimi Aktif
              </h4>
              <p className="text-xs text-amber-700">
                Bekleyen navlun alacakları ve araç gider fişlerini kontrol edip onaylayabilirsiniz.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('accounting')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            Faturaları İncele <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TCMB Live Rates Bar */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-300/60 rounded-2xl p-3.5 px-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-700 rounded-xl">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>TCMB Günlük Gösterge Kurları</span>
              <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">
                Bülten: {tcmbData?.bulletinNo || '2026/201'}
              </span>
            </div>
            <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-3 flex-wrap font-mono">
              <span>
                EUR/TL (Alış): <strong className="text-emerald-700">{tcmbData?.rates?.EUR?.forexBuying?.toFixed(4) || '54.2150'}</strong>
              </span>
              <span>•</span>
              <span>
                USD/TL (Alış): <strong className="text-emerald-700">{tcmbData?.rates?.USD?.forexBuying?.toFixed(4) || '49.5647'}</strong>
              </span>
              <span>•</span>
              <span>
                BGN/TL: <strong className="text-amber-800">{tcmbData?.rates?.BGN?.forexBuying?.toFixed(4) || '27.6800'}</strong>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCurrencyModalOpen(true)}
          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs ml-auto"
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Döviz &amp; Navlun Kuru Hesapla</span>
        </button>
      </div>

      {/* Top Quick KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Vehicles */}
        <div
          onClick={() => setActiveTab('vehicles')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Toplam Araç Filosu
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalVehicles}</span>
            <span className="text-xs text-slate-500">Adet Araç</span>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-semibold text-indigo-600">{ownedVehicles} Öz Mal</span>
            <span>•</span>
            <span className="font-medium text-slate-500">{rentedVehicles} Kiralık</span>
          </div>
        </div>

        {/* Idle / Available Vehicles */}
        <div
          onClick={() => setActiveTab('vehicles')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Boşta / Müsait Araçlar
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{idleVehicles}</span>
            <span className="text-xs text-slate-500">Hemen Yüklenebilir</span>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <span className="text-emerald-700 font-medium">
              Filo müsaitlik: %{((idleVehicles / totalVehicles) * 100).toFixed(0)}
            </span>
          </div>
        </div>

        {/* Active Trips */}
        <div
          onClick={() => setActiveTab('trips')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Aktif Yükler / Seferler
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Navigation className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-600">{activeTrips.length}</span>
            <span className="text-xs text-slate-500">Sefer İcrada</span>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">{onDutyVehicles} TIR Yolda</span>
            <span>•</span>
            <span className="text-slate-500">{deliveredTrips} Tamamlandı</span>
          </div>
        </div>

        {/* In Maintenance / Warnings */}
        <div
          onClick={() => setActiveTab('vehicles')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Bakımdaki Araçlar
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{inMaintenanceVehicles}</span>
            <span className="text-xs text-slate-500">Serviste / Muayene</span>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
            {urgentVehicles.length > 0 ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {urgentVehicles.length} araç muayene yaklaştı
              </span>
            ) : (
              <span className="text-slate-500">Muayeneler güncel</span>
            )}
          </div>
        </div>
      </div>

      {/* Financial Overview Cards (If allowed by Role) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Freight Turnover */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-5 rounded-2xl shadow-md border border-slate-700/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Toplam Navlun Cirosu
              </span>
              <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-black tracking-tight">
              {totalFreightEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {trips.length} toplam uluslararası sefer anlaşması
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Bekleyen Alacak:</span>
            <span className="font-bold text-amber-400">
              {pendingReceivablesEUR.toLocaleString('tr-TR')} €
            </span>
          </div>
        </div>

        {/* Fleet Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Öz Mal Araç &amp; Şoför Gideri
              </span>
              <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <Receipt className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              {totalExpenseEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Yakıt, harcırah, otoyol vinyetleri ve bakım toplamı
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Kayıtlı Masraf Fişi:</span>
            <span className="font-bold text-slate-800">{expenses.length} Adet</span>
          </div>
        </div>

        {/* Net Profit & Margin */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Net Faaliyet Kârı (Tahmini)
              </span>
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-black text-emerald-600 tracking-tight">
              {estimatedNetProfitEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Navlun geliri - doğrudan sefer masrafları
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Ortalama Kâr Marjı:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              %{profitMargin}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Trips Tracking & Alerts/Fleet Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Active Trips */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-indigo-600" />
                <span>Aktif Seferler &amp; Canlı Güzergah Takibi</span>
              </h3>
              <p className="text-xs text-slate-500">
                Yolda ve gümrük noktasında olan araçların son durumu
              </p>
            </div>
            <button
              onClick={() => setActiveTab('trips')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Tüm Seferler <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {activeTrips.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Şu anda yolda olan aktif sefer bulunmamaktadır.
              </div>
            ) : (
              activeTrips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => setActiveTab('trips')}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50 transition-all cursor-pointer"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-slate-900 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {trip.cmrNo}
                      </span>
                      <span className="font-bold text-xs text-indigo-700">
                        {trip.vehiclePlate}
                      </span>
                      <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                        ({trip.driverName})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(
                          trip.status
                        )}`}
                      >
                        {trip.status}
                      </span>
                      <span className="text-xs font-black text-slate-900">
                        {trip.freightPrice.toLocaleString('tr-TR')} {trip.currency}
                      </span>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 my-2">
                    <span className="text-slate-900">{trip.originCity} ({trip.originCountry})</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="text-indigo-900">{trip.destinationCity} ({trip.destinationCountry})</span>
                    <span className="text-[10px] text-slate-500 font-normal ml-auto">
                      {trip.shipmentType} ({(trip.weightKg / 1000).toFixed(1)} Ton)
                    </span>
                  </div>

                  {/* Milestone */}
                  <div className="bg-slate-50 rounded-lg p-2.5 flex items-center justify-between text-xs border border-slate-200/70">
                    <div className="flex items-center gap-2 text-slate-700 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate font-medium">{trip.currentMilestone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>ETA: {trip.etaDate}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Fleet Distribution & Urgent Reminders */}
        <div className="space-y-6">
          {/* Fleet Status Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" />
              <span>Araç Filo Durum Dağılımı</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {totalVehicles} çekici ve dorsenin anlık operasyonel hali
            </p>

            {/* Segment Bar */}
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex mb-4">
              <div
                style={{ width: `${(onDutyVehicles / totalVehicles) * 100}%` }}
                className="bg-blue-500 h-full transition-all"
                title={`Yükte: ${onDutyVehicles}`}
              />
              <div
                style={{ width: `${(idleVehicles / totalVehicles) * 100}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`Boşta: ${idleVehicles}`}
              />
              <div
                style={{ width: `${(inMaintenanceVehicles / totalVehicles) * 100}%` }}
                className="bg-amber-500 h-full transition-all"
                title={`Bakımda: ${inMaintenanceVehicles}`}
              />
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/50">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Yükte / Seferde
                </span>
                <span className="font-bold text-slate-900">{onDutyVehicles} Araç (%{((onDutyVehicles/totalVehicles)*100).toFixed(0)})</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Boşta / Müsait (Hazır)
                </span>
                <span className="font-bold text-emerald-700">{idleVehicles} Araç (%{((idleVehicles/totalVehicles)*100).toFixed(0)})</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Bakımda / Serviste
                </span>
                <span className="font-bold text-amber-700">{inMaintenanceVehicles} Araç</span>
              </div>
            </div>

            {/* Quick AI Consultant trigger card */}
            <div
              onClick={() => setActiveTab('ai_advisor')}
              className="mt-5 p-3.5 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-purple-200 cursor-pointer hover:border-purple-300 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-600 text-white rounded-lg shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-purple-950">Gemini Rota &amp; Navlun Asistanı</div>
                  <div className="text-[10px] text-purple-700">Maliyet ve sınır kapısı analizi al</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-600" />
            </div>
          </div>

          {/* Urgent Alerts Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Kritik Hatırlatmalar &amp; Vadeler</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Mali ve operasyonel aksiyon gerektiren durumlar
            </p>

            <div className="space-y-2.5">
              {urgentInvoices.slice(0, 2).map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => setActiveTab('accounting')}
                  className="p-3 rounded-xl border border-amber-200 bg-amber-50/60 cursor-pointer hover:bg-amber-100/50 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span>{inv.invoiceNo} (Vade Uyarısı)</span>
                    <span>{inv.totalAmount.toLocaleString('tr-TR')} {inv.currency}</span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    {inv.customerName} - Son Ödeme: {inv.dueDate}
                  </p>
                </div>
              ))}

              {urgentVehicles.slice(0, 2).map((v) => (
                <div
                  key={v.id}
                  onClick={() => setActiveTab('vehicles')}
                  className="p-3 rounded-xl border border-rose-200 bg-rose-50/60 cursor-pointer hover:bg-rose-100/50 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                    <span>{v.plate} (Muayene Yaklaşıyor)</span>
                    <span className="text-[10px] uppercase font-bold text-rose-600">{v.type}</span>
                  </div>
                  <p className="text-[11px] text-rose-800 mt-0.5">
                    TÜVTÜRK muayene bitiş tarihi: {v.nextInspectionDate}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
