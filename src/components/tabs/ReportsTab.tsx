import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Truck,
  Ship,
  MapPin,
  Calendar,
  Fuel,
  Receipt,
  Milestone,
  Coins,
  FileText,
  DollarSign,
  Printer,
  PieChart,
  ArrowRight,
  Layers,
  Shield,
  Percent,
} from 'lucide-react';
import { Trip, VehicleExpense, Region, VehicleType, ExpenseCategory } from '../../types';

export const ReportsTab: React.FC = () => {
  const { trips, expenses, vehicles, convertCurrency } = useApp();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterPlate, setFilterPlate] = useState<string>('all');
  const [filterVehicleType, setFilterVehicleType] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');

  // Expanded Trip IDs state
  // Default open trip-6 (Russia Ro-Ro) and trip-7 (Domestic) so user immediately sees the rich breakdown!
  const [expandedTripIds, setExpandedTripIds] = useState<Set<string>>(
    new Set(['trip-6', 'trip-7'])
  );

  const toggleExpand = (tripId: string) => {
    setExpandedTripIds((prev) => {
      const next = new Set(prev);
      if (next.has(tripId)) {
        next.delete(tripId);
      } else {
        next.add(tripId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedTripIds(new Set(trips.map((t) => t.id)));
  };

  const collapseAll = () => {
    setExpandedTripIds(new Set());
  };

  // Filtered trips
  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const veh = vehicles.find((v) => v.id === t.vehicleId);
      const plate = t.tractorPlate || t.vehiclePlate || '';
      const matchesSearch =
        t.cmrNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.originCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.destinationCity.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRegion = filterRegion === 'all' || t.region === filterRegion;
      const matchesPlate = filterPlate === 'all' || plate === filterPlate;
      const matchesType =
        filterVehicleType === 'all' || (veh && veh.type === filterVehicleType);

      return matchesSearch && matchesRegion && matchesPlate && matchesType;
    });
  }, [trips, vehicles, searchQuery, filterRegion, filterPlate, filterVehicleType]);

  // Trip financial calculations
  const tripFinancials = useMemo(() => {
    return filteredTrips.map((trip) => {
      const veh = vehicles.find((v) => v.id === trip.vehicleId);
      const tripExpenses = expenses.filter(
        (e) => e.tripId === trip.id || (e.tripCmrNo && e.tripCmrNo === trip.cmrNo)
      );

      // Revenue in EUR
      const revenueEUR = convertCurrency(trip.freightPrice, trip.currency, 'EUR', 'forexBuying');
      const revenueTRY = convertCurrency(trip.freightPrice, trip.currency, 'TRY', 'forexBuying');

      // Breakdown by Location Group
      const trExpenses = tripExpenses.filter(
        (e) => e.locationGroup === 'Türkiye İçi' || (!e.locationGroup && e.currency === 'TRY')
      );
      const roRoExpenses = tripExpenses.filter(
        (e) => e.locationGroup === 'Ro-Ro / Gemi' || e.category === 'Ro-Ro / Gemi Bileti'
      );
      const foreignExpenses = tripExpenses.filter(
        (e) =>
          e.locationGroup === 'Transit Ülke' ||
          e.locationGroup === 'Hedef Ülke' ||
          (e.locationGroup !== 'Türkiye İçi' && e.locationGroup !== 'Ro-Ro / Gemi' && e.currency !== 'TRY')
      );

      const totalTrEUR = trExpenses.reduce(
        (sum, e) => sum + convertCurrency(e.amount, e.currency, 'EUR', 'forexBuying'),
        0
      );
      const totalRoRoEUR = roRoExpenses.reduce(
        (sum, e) => sum + convertCurrency(e.amount, e.currency, 'EUR', 'forexBuying'),
        0
      );
      const totalForeignEUR = foreignExpenses.reduce(
        (sum, e) => sum + convertCurrency(e.amount, e.currency, 'EUR', 'forexBuying'),
        0
      );

      const totalCostEUR = totalTrEUR + totalRoRoEUR + totalForeignEUR;
      const totalCostTRY = convertCurrency(totalCostEUR, 'EUR', 'TRY', 'forexBuying');

      const netProfitEUR = revenueEUR - totalCostEUR;
      const netProfitTRY = revenueTRY - totalCostTRY;
      const profitMarginPct = revenueEUR > 0 ? (netProfitEUR / revenueEUR) * 100 : 0;

      return {
        trip,
        veh,
        tripExpenses,
        revenueEUR,
        revenueTRY,
        trExpenses,
        roRoExpenses,
        foreignExpenses,
        totalTrEUR,
        totalRoRoEUR,
        totalForeignEUR,
        totalCostEUR,
        totalCostTRY,
        netProfitEUR,
        netProfitTRY,
        profitMarginPct,
      };
    });
  }, [filteredTrips, expenses, vehicles, convertCurrency]);

  // Aggregate KPIs
  const totalRevenueEUR = tripFinancials.reduce((sum, item) => sum + item.revenueEUR, 0);
  const totalCostEUR = tripFinancials.reduce((sum, item) => sum + item.totalCostEUR, 0);
  const totalProfitEUR = totalRevenueEUR - totalCostEUR;
  const overallMarginPct = totalRevenueEUR > 0 ? (totalProfitEUR / totalRevenueEUR) * 100 : 0;

  const totalTrAllEUR = tripFinancials.reduce((sum, item) => sum + item.totalTrEUR, 0);
  const totalRoRoAllEUR = tripFinancials.reduce((sum, item) => sum + item.totalRoRoEUR, 0);
  const totalForeignAllEUR = tripFinancials.reduce((sum, item) => sum + item.totalForeignEUR, 0);

  // Öz Mal vs Kiralık comparison
  const ownedTrips = tripFinancials.filter((item) => item.veh?.type === 'Öz Mal');
  const rentedTrips = tripFinancials.filter((item) => item.veh?.type === 'Kiralık');

  const ownedRevenue = ownedTrips.reduce((s, i) => s + i.revenueEUR, 0);
  const ownedCost = ownedTrips.reduce((s, i) => s + i.totalCostEUR, 0);
  const ownedProfit = ownedRevenue - ownedCost;
  const ownedMargin = ownedRevenue > 0 ? (ownedProfit / ownedRevenue) * 100 : 0;

  const rentedRevenue = rentedTrips.reduce((s, i) => s + i.revenueEUR, 0);
  const rentedCost = rentedTrips.reduce((s, i) => s + i.totalCostEUR, 0);
  const rentedProfit = rentedRevenue - rentedCost;
  const rentedMargin = rentedRevenue > 0 ? (rentedProfit / rentedRevenue) * 100 : 0;

  const formatCurrency = (amount: number, curr: string) => {
    const symbol = curr === 'TRY' ? '₺' : curr === 'RUB' ? '₽' : curr === 'USD' ? '$' : '€';
    return `${amount.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ${symbol}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>Sefer Bazlı Detaylı Masraf Dökümü &amp; Kâr/Zarar Raporu</span>
            </h2>
            <p className="text-xs text-slate-500">
              Türkiye İçi, Ro-Ro Denizyolu ve Yurt Dışı / Transit masraf kırılımları ile hat ve araç kârlılık analizi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Tümünü Genişlet
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Tümünü Daralt
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Raporu Yazdır</span>
            </button>
          </div>
        </div>

        {/* Global KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {/* Revenue */}
          <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xs">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Toplam Navlun</div>
            <div className="text-lg font-black text-white mt-0.5">
              {totalRevenueEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              ~{(totalRevenueEUR * 54.21).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL
            </div>
          </div>

          {/* Cost */}
          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
            <div className="text-[10px] text-rose-800 uppercase font-bold">Toplam Sefer Gideri</div>
            <div className="text-lg font-black text-rose-950 mt-0.5">
              {totalCostEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
            </div>
            <div className="text-[10px] text-rose-700 mt-0.5">Filo toplam masraf</div>
          </div>

          {/* Profit */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 uppercase">
              <span>Net Kâr / Marj</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-lg font-black text-emerald-950 mt-0.5">
              {totalProfitEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
            </div>
            <div className="text-[10px] font-bold text-emerald-700 mt-0.5">
              %{overallMarginPct.toFixed(1)} Kâr Marjı
            </div>
          </div>

          {/* TR Costs */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
            <div className="text-[10px] text-amber-900 uppercase font-bold">1. Türkiye İçi Gider</div>
            <div className="text-lg font-black text-amber-950 mt-0.5">
              {totalTrAllEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
            </div>
            <div className="text-[10px] text-amber-800 mt-0.5">TR Mazot &amp; Otoyol</div>
          </div>

          {/* Ro-Ro Costs */}
          <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-xl">
            <div className="flex items-center justify-between text-[10px] font-bold text-cyan-900 uppercase">
              <span>2. Ro-Ro Denizyolu</span>
              <Ship className="w-3.5 h-3.5 text-cyan-600" />
            </div>
            <div className="text-lg font-black text-cyan-950 mt-0.5">
              {totalRoRoAllEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
            </div>
            <div className="text-[10px] text-cyan-800 mt-0.5">Gemi bileti &amp; liman</div>
          </div>

          {/* Foreign Costs */}
          <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
            <div className="text-[10px] text-purple-900 uppercase font-bold">3. Yurt Dışı &amp; Transit</div>
            <div className="text-lg font-black text-purple-950 mt-0.5">
              {totalForeignAllEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
            </div>
            <div className="text-[10px] text-purple-800 mt-0.5">Yabancı yakıt, harcırah</div>
          </div>
        </div>

        {/* Filters Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="CMR, müşteri, plaka veya şehir ara..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium text-slate-800"
            >
              <option value="all">Tüm Güzergah &amp; Sektörler</option>
              <option value="Yurtiçi">Yurtiçi (Türkiye 81 İl / Liman Transferleri)</option>
              <option value="Avrupa">Avrupa Koridoru</option>
              <option value="Rusya & Beyaz Rusya">Rusya &amp; Beyaz Rusya (Ro-Ro)</option>
              <option value="Asya / Orta Asya">Asya / Orta Asya (Kazakistan vb.)</option>
              <option value="Kafkasya">Kafkasya (Gürcistan, Azerbaycan)</option>
              <option value="Orta Doğu">Orta Doğu (Irak, İran)</option>
            </select>
          </div>

          <div>
            <select
              value={filterPlate}
              onChange={(e) => setFilterPlate(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
            >
              <option value="all">Tüm Araç Plakaları</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.plate}>
                  {v.plate} ({v.type} - {v.driverName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterVehicleType}
              onChange={(e) => setFilterVehicleType(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
            >
              <option value="all">Tüm Mülkiyet (Öz Mal &amp; Kiralık)</option>
              <option value="Öz Mal">Sadece Öz Mal Filo</option>
              <option value="Kiralık">Sadece Kiralık Araçlar</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Listelenen Sefer: <strong>{tripFinancials.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Öz Mal vs Kiralık Kârlılık Karşılaştırması */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Öz Mal vs. Kiralık Araç Kârlılık Karşılaştırması
            </h3>
          </div>
          <span className="text-xs text-slate-500">Operasyonel marj karşılaştırması</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Öz Mal Card */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 uppercase tracking-wide flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-indigo-700" />
                Öz Mal Filo ({ownedTrips.length} Sefer)
              </span>
              <span className="text-xs font-black text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200">
                %{ownedMargin.toFixed(1)} Net Kâr Marjı
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <div className="text-[10px] text-slate-500">Navlun Hasılatı</div>
                <div className="text-sm font-black text-slate-900">
                  {ownedRevenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Toplam Masraf</div>
                <div className="text-sm font-black text-rose-700">
                  {ownedCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Net Kâr</div>
                <div className="text-sm font-black text-emerald-700">
                  +{ownedProfit.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
                </div>
              </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, ownedMargin))}%` }}
              />
            </div>
          </div>

          {/* Kiralık Card */}
          <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-slate-600" />
                Kiralık Araçlar ({rentedTrips.length} Sefer)
              </span>
              <span className="text-xs font-black text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-300">
                %{rentedMargin.toFixed(1)} Net Kâr Marjı
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <div className="text-[10px] text-slate-500">Navlun Hasılatı</div>
                <div className="text-sm font-black text-slate-900">
                  {rentedRevenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Kira &amp; Masraf</div>
                <div className="text-sm font-black text-rose-700">
                  {rentedCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Net Kâr</div>
                <div className="text-sm font-black text-emerald-700">
                  +{rentedProfit.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
                </div>
              </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-slate-700 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, rentedMargin))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sefer Bazlı Detaylı Masraf Dökümü Table with Accordions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Sefer Listesi ve 3 Kademeli Masraf Kırılımı</span>
          </h3>
          <span className="text-xs text-slate-500">
            Detay satırlarına tıklayarak masrafları genişletebilirsiniz
          </span>
        </div>

        {tripFinancials.map((item) => {
          const {
            trip,
            veh,
            trExpenses,
            roRoExpenses,
            foreignExpenses,
            revenueEUR,
            totalCostEUR,
            netProfitEUR,
            profitMarginPct,
            totalTrEUR,
            totalRoRoEUR,
            totalForeignEUR,
          } = item;

          const isExpanded = expandedTripIds.has(trip.id);

          return (
            <div
              key={trip.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Trip Header Row (Clickable) */}
              <div
                onClick={() => toggleExpand(trip.id)}
                className="p-4 sm:p-5 cursor-pointer bg-white hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: CMR, Customer, Route */}
                <div className="flex items-start sm:items-center gap-3">
                  <button
                    type="button"
                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors mt-0.5 sm:mt-0"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                        {trip.cmrNo}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{trip.customerName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                        {trip.region || 'Avrupa'}
                      </span>
                      {trip.transportMode === 'Ro-Ro / Gemi' && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                          <Ship className="w-3 h-3 text-cyan-600" />
                          <span>Ro-Ro Gemi</span>
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          veh?.type === 'Öz Mal'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {veh?.type || 'Öz Mal'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="font-semibold text-slate-900">{trip.originCity}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="font-semibold text-slate-900">{trip.destinationCity}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-mono text-slate-500">Plaka: {trip.vehiclePlate}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">Şoför: {trip.driverName}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Revenue, Cost, Profit Pills */}
                <div className="flex items-center gap-3 sm:gap-5 flex-wrap self-end lg:self-center">
                  {/* Revenue */}
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Navlun Geliri</div>
                    <div className="text-sm font-black text-slate-900">
                      {trip.freightPrice.toLocaleString('tr-TR')}{' '}
                      {trip.currency === 'TRY' ? '₺' : trip.currency === 'RUB' ? '₽' : trip.currency === 'USD' ? '$' : '€'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      ({revenueEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €)
                    </div>
                  </div>

                  {/* Total Cost */}
                  <div className="text-right">
                    <div className="text-[10px] text-rose-500 font-bold uppercase">Toplam Gider</div>
                    <div className="text-sm font-black text-rose-700">
                      {totalCostEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.tripExpenses.length} Kalem Fiş
                    </div>
                  </div>

                  {/* Net Profit */}
                  <div className="text-right pl-3 border-l border-slate-200">
                    <div className="text-[10px] text-emerald-600 font-bold uppercase">Net Kâr</div>
                    <div className="text-sm font-black text-emerald-700">
                      +{netProfitEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600">
                      %{profitMarginPct.toFixed(1)} Marj
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    {isExpanded ? 'Detayı Gizle' : 'Masraf Kırılımı'}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </span>
                </div>
              </div>

              {/* Accordion Content: 3-Tier Detailed Breakdown */}
              {isExpanded && (
                <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4 animate-in fade-in duration-150">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>
                      {trip.cmrNo} — Harcama Bölgesi &amp; Masraf Kalemleri Kırılımı
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      TCMB döviz alış kurlarıyla konsolide edilmiştir.
                    </span>
                  </div>

                  {/* 3 Columns Grid for the 3 Groups */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* 1. Türkiye İçi Masraflar */}
                    <div className="bg-white rounded-xl border border-amber-200 shadow-xs p-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                              <Fuel className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-black text-amber-950">1. Türkiye İçi Masraflar</div>
                              <div className="text-[10px] text-amber-700">TR Yakıt, TR Otoyol, Kantar</div>
                            </div>
                          </div>
                          <span className="text-xs font-black text-amber-950">
                            {totalTrEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
                          </span>
                        </div>

                        {trExpenses.length === 0 ? (
                          <div className="text-[11px] text-slate-400 py-3 text-center italic">
                            Bu seferde Türkiye içi masraf kaydı bulunmuyor.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {trExpenses.map((exp) => (
                              <div
                                key={exp.id}
                                className="p-2 rounded-lg bg-amber-50/40 border border-amber-100 text-[11px] space-y-1"
                              >
                                <div className="flex items-center justify-between font-bold text-slate-800">
                                  <span>{exp.category}: {exp.countryOrPort || 'Türkiye'}</span>
                                  <span className="text-slate-900 font-black">
                                    {formatCurrency(exp.amount, exp.currency)}
                                  </span>
                                </div>
                                <div className="text-slate-600 text-[10px] truncate">{exp.description}</div>
                                {exp.liters && (
                                  <div className="text-[10px] text-amber-700 font-semibold">
                                    ⛽ {exp.liters} Lt Motorin ({exp.fuelStation || 'İstasyon'})
                                  </div>
                                )}
                                <div className="text-[9px] text-slate-400 flex items-center justify-between pt-0.5">
                                  <span>Fiş: {exp.receiptNo}</span>
                                  <span>Tarih: {exp.date}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 mt-3 border-t border-amber-100 flex items-center justify-between text-xs font-bold text-amber-950">
                        <span>TR Harcamalar Ara Toplam:</span>
                        <span>
                          {totalTrEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} € (
                          {(totalTrEUR * 54.21).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺)
                        </span>
                      </div>
                    </div>

                    {/* 2. Ro-Ro / Denizyolu Masrafları */}
                    <div className="bg-white rounded-xl border border-cyan-200 shadow-xs p-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-cyan-100 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-cyan-100 text-cyan-800 rounded-lg">
                              <Ship className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-black text-cyan-950">2. Ro-Ro / Denizyolu Masrafları</div>
                              <div className="text-[10px] text-cyan-700">Gemi Bilet Tutarı, Liman Ordino</div>
                            </div>
                          </div>
                          <span className="text-xs font-black text-cyan-950">
                            {totalRoRoEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
                          </span>
                        </div>

                        {roRoExpenses.length === 0 ? (
                          <div className="text-[11px] text-slate-400 py-3 text-center italic">
                            {trip.transportMode === 'Ro-Ro / Gemi'
                              ? 'Bu sefer için henüz Ro-Ro bileti işlenmedi.'
                              : 'Standart karayolu hattı (Ro-Ro kullanılmadı).'}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {roRoExpenses.map((exp) => (
                              <div
                                key={exp.id}
                                className="p-2 rounded-lg bg-cyan-50/40 border border-cyan-100 text-[11px] space-y-1"
                              >
                                <div className="flex items-center justify-between font-bold text-slate-800">
                                  <span>{exp.category}</span>
                                  <span className="text-cyan-950 font-black">
                                    {formatCurrency(exp.amount, exp.currency)}
                                  </span>
                                </div>
                                <div className="text-slate-700 text-[10px]">{exp.description}</div>
                                {exp.countryOrPort && (
                                  <div className="text-[10px] text-cyan-800 font-semibold">
                                    🚢 Hat: {exp.countryOrPort}
                                  </div>
                                )}
                                <div className="text-[9px] text-slate-400 flex items-center justify-between pt-0.5">
                                  <span>Bilet No: {exp.receiptNo}</span>
                                  <span>Tarih: {exp.date}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 mt-3 border-t border-cyan-100 flex items-center justify-between text-xs font-bold text-cyan-950">
                        <span>Ro-Ro Ara Toplam:</span>
                        <span>{totalRoRoEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €</span>
                      </div>
                    </div>

                    {/* 3. Yurt Dışı & Transit Masraflar */}
                    <div className="bg-white rounded-xl border border-purple-200 shadow-xs p-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-purple-100 text-purple-800 rounded-lg">
                              <Milestone className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-black text-purple-950">3. Yurt Dışı &amp; Transit Masraflar</div>
                              <div className="text-[10px] text-purple-700">Yabancı Yakıt, Harcırah, Otoban/Platon</div>
                            </div>
                          </div>
                          <span className="text-xs font-black text-purple-950">
                            {totalForeignEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
                          </span>
                        </div>

                        {foreignExpenses.length === 0 ? (
                          <div className="text-[11px] text-slate-400 py-3 text-center italic">
                            Yurt dışı masraf kaydı bulunmuyor.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {foreignExpenses.map((exp) => (
                              <div
                                key={exp.id}
                                className="p-2 rounded-lg bg-purple-50/40 border border-purple-100 text-[11px] space-y-1"
                              >
                                <div className="flex items-center justify-between font-bold text-slate-800">
                                  <span>{exp.category}: {exp.countryOrPort || 'Yurt Dışı'}</span>
                                  <span className="text-purple-950 font-black">
                                    {formatCurrency(exp.amount, exp.currency)}
                                  </span>
                                </div>
                                <div className="text-slate-700 text-[10px]">{exp.description}</div>
                                {exp.liters && (
                                  <div className="text-[10px] text-purple-700 font-semibold">
                                    ⛽ {exp.liters} Lt ({exp.fuelStation || 'Yabancı İstasyon'})
                                  </div>
                                )}
                                <div className="text-[9px] text-slate-400 flex items-center justify-between pt-0.5">
                                  <span>Belge: {exp.receiptNo}</span>
                                  <span>
                                    EUR Karşılığı: ~{convertCurrency(exp.amount, exp.currency, 'EUR', 'forexBuying').toFixed(0)} €
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 mt-3 border-t border-purple-100 flex items-center justify-between text-xs font-bold text-purple-950">
                        <span>Yurt Dışı Ara Toplam:</span>
                        <span>{totalForeignEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Footer for Trip */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4 flex-wrap text-slate-600">
                      <span>
                        TR Harcama Payı:{' '}
                        <strong>
                          {totalCostEUR > 0 ? ((totalTrEUR / totalCostEUR) * 100).toFixed(0) : 0}%
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Ro-Ro Payı:{' '}
                        <strong>
                          {totalCostEUR > 0 ? ((totalRoRoEUR / totalCostEUR) * 100).toFixed(0) : 0}%
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Yurt Dışı Payı:{' '}
                        <strong>
                          {totalCostEUR > 0 ? ((totalForeignEUR / totalCostEUR) * 100).toFixed(0) : 0}%
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">Bu Seferin Kârlılık Hesabı:</span>
                      <span className="font-bold text-slate-900">
                        {revenueEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} € (Gelir) -{' '}
                        {totalCostEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} € (Maliyet) =
                      </span>
                      <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        +{netProfitEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} € Kâr (%{profitMarginPct.toFixed(1)})
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
