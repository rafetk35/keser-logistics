import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Fuel,
  Coins,
  Milestone,
  Wrench,
  FileText,
  DollarSign,
  TrendingDown,
  Trash2,
  Calendar,
  X,
  Truck,
  Shield,
  Ship,
  Globe2,
} from 'lucide-react';
import { VehicleExpense, ExpenseCategory, ExpenseLocationGroup, Currency } from '../../types';

export const ExpensesTab: React.FC = () => {
  const {
    expenses,
    vehicles,
    trips,
    addExpense,
    deleteExpense,
    permissions,
    convertCurrency,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlate, setFilterPlate] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLocationGroup, setFilterLocationGroup] = useState<string>('all');
  const [ownershipTab, setOwnershipTab] = useState<'all' | 'ozmal' | 'kiralik_taseron'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formVehicleId, setFormVehicleId] = useState(vehicles[0]?.id || '');
  const [formTripId, setFormTripId] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('Yakıt');
  const [formLocationGroup, setFormLocationGroup] = useState<ExpenseLocationGroup>('Türkiye İçi');
  const [formCountryOrPort, setFormCountryOrPort] = useState('Türkiye - Pendik');
  const [formAmount, setFormAmount] = useState<number>(850);
  const [formCurrency, setFormCurrency] = useState<Currency>('EUR');
  const [formReceiptNo, setFormReceiptNo] = useState('');
  const [formDescription, setFormDescription] = useState('Shell Sofya - 550 Lt Euro Dizel');
  const [formLiters, setFormLiters] = useState<number>(550);
  const [formFuelStation, setFormFuelStation] = useState('Shell Sofya Ring Road');
  const [formKm, setFormKm] = useState<number>(285000);

  const openModal = () => {
    const veh = vehicles[0];
    setFormVehicleId(veh?.id || '');
    setFormTripId('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormCategory('Yakıt');
    setFormLocationGroup('Türkiye İçi');
    setFormCountryOrPort('Türkiye - Pendik');
    setFormAmount(850);
    setFormCurrency('EUR');
    setFormReceiptNo('FIS-' + Math.floor(10000 + Math.random() * 90000));
    setFormDescription('Shell Otoyol İstasyonu - 540 Lt Mazot');
    setFormLiters(540);
    setFormFuelStation('Shell Otoyol');
    setFormKm(veh?.odometerKm ? veh.odometerKm + 500 : 250000);
    setIsModalOpen(true);
  };

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vehId = e.target.value;
    setFormVehicleId(vehId);
    const veh = vehicles.find((v) => v.id === vehId);
    if (veh) {
      setFormKm(veh.odometerKm + 300);
    }
  };

  const handleTripChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tId = e.target.value;
    setFormTripId(tId);
    const matched = trips.find((t) => t.id === tId);
    if (matched) {
      if (matched.transportMode === 'Ro-Ro / Gemi') {
        setFormLocationGroup('Ro-Ro / Gemi');
        setFormCountryOrPort(matched.roRoRoute || 'Karadeniz Ro-Ro Gemisi');
      } else if (matched.isDomestic) {
        setFormLocationGroup('Türkiye İçi');
        setFormCountryOrPort('Türkiye');
        setFormCurrency('TRY');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const veh = vehicles.find((v) => v.id === formVehicleId);
    if (!veh) return;

    const matchedTrip = trips.find((t) => t.id === formTripId);

    addExpense({
      vehicleId: veh.id,
      vehiclePlate: veh.plate,
      tripId: matchedTrip?.id,
      tripCmrNo: matchedTrip?.cmrNo,
      driverName: veh.driverName || 'Şoför Belirtilmemiş',
      date: formDate,
      category: formCategory,
      locationGroup: formLocationGroup,
      countryOrPort: formCountryOrPort || 'Türkiye İçi',
      amount: Number(formAmount),
      currency: formCurrency,
      receiptNo: formReceiptNo || 'FIS-' + Date.now().toString().slice(-5),
      description: formDescription,
      liters: formCategory === 'Yakıt' ? Number(formLiters) : undefined,
      fuelStation: formCategory === 'Yakıt' ? formFuelStation : undefined,
      km: formKm ? Number(formKm) : undefined,
    });

    setIsModalOpen(false);
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.countryOrPort && e.countryOrPort.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPlate = filterPlate === 'all' || e.vehiclePlate === filterPlate;
    const matchesCategory = filterCategory === 'all' || e.category === filterCategory;
    const matchesLocation = filterLocationGroup === 'all' || e.locationGroup === filterLocationGroup;

    // Araç mülkiyet türüne göre filtreleme (Özmal vs Kiralık/Taşeron)
    const vehicleObj = vehicles.find((v) => v.plate === e.vehiclePlate);
    const isVehicleOzmal = vehicleObj ? vehicleObj.type === 'Öz Mal' : true;

    let matchesOwnershipTab = true;
    if (ownershipTab === 'ozmal') {
      matchesOwnershipTab = isVehicleOzmal;
    } else if (ownershipTab === 'kiralik_taseron') {
      matchesOwnershipTab = !isVehicleOzmal;
    }

    return matchesSearch && matchesPlate && matchesCategory && matchesLocation && matchesOwnershipTab;
  });

  // Calculate totals normalized in EUR
  const totalEUR = filteredExpenses.reduce((sum, e) => {
    return sum + convertCurrency(e.amount, e.currency, 'EUR', 'forexBuying');
  }, 0);

  const fuelTotalEUR = filteredExpenses
    .filter((e) => e.category === 'Yakıt')
    .reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, 'EUR', 'forexBuying'), 0);

  const totalFuelLiters = filteredExpenses
    .filter((e) => e.category === 'Yakıt' && e.liters)
    .reduce((sum, e) => sum + (e.liters || 0), 0);

  const roRoTotalEUR = filteredExpenses
    .filter((e) => e.category === 'Ro-Ro / Gemi Bileti')
    .reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, 'EUR', 'forexBuying'), 0);

  const allowanceTotalEUR = filteredExpenses
    .filter((e) => e.category === 'Harcırah')
    .reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, 'EUR', 'forexBuying'), 0);

  const tollTotalEUR = filteredExpenses
    .filter((e) => e.category === 'Otoyol')
    .reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, 'EUR', 'forexBuying'), 0);

  const getCategoryIcon = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'Yakıt':
        return <Fuel className="w-4 h-4 text-amber-500" />;
      case 'Ro-Ro / Gemi Bileti':
        return <Ship className="w-4 h-4 text-cyan-600" />;
      case 'Harcırah':
        return <Coins className="w-4 h-4 text-emerald-500" />;
      case 'Otoyol':
        return <Milestone className="w-4 h-4 text-blue-500" />;
      case 'Bakım':
        return <Wrench className="w-4 h-4 text-rose-500" />;
      case 'Gümrük':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      default:
        return <Receipt className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCategoryBadge = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'Yakıt':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Ro-Ro / Gemi Bileti':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Harcırah':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Otoyol':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Bakım':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Gümrük':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getLocationGroupBadge = (loc?: ExpenseLocationGroup) => {
    switch (loc) {
      case 'Türkiye İçi':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Ro-Ro / Gemi':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'Transit Ülke':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Hedef Ülke':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              <span>Filo Masraf &amp; Gider Merkezi</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                {filteredExpenses.length} Fiş
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Özmal ve Kiralık / Taşeron araçlara (Örn: 34 RRO 882) ait yakıt, harcırah, otoban ve gümrük giderleri
            </p>
          </div>

          {permissions.canManageExpenses && (
            <button
              onClick={openModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Masraf Fişi Gir</span>
            </button>
          )}
        </div>

        {/* Ownership Switch Tabs (Özmal vs Kiralık/Taşeron) */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
          <button
            onClick={() => setOwnershipTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              ownershipTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tüm Araç Giderleri
          </button>
          <button
            onClick={() => setOwnershipTab('ozmal')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              ownershipTab === 'ozmal'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🛡️ Özmal Araç Giderleri
          </button>
          <button
            onClick={() => setOwnershipTab('kiralik_taseron')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              ownershipTab === 'kiralik_taseron'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🤝 Kiralık &amp; Taşeron Araç Giderleri (Örn: 34 RRO 882)
          </button>
        </div>

        {/* Expense Category Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {/* Total Expense */}
          <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xs">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Toplam Gider (EUR)</div>
            <div className="text-lg font-black mt-0.5">
              {totalEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Seçili filtre toplamı</div>
          </div>

          {/* Fuel */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
            <div className="flex items-center justify-between text-[10px] font-bold text-amber-800 uppercase">
              <span>Yakıt (Dizel)</span>
              <Fuel className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-lg font-black text-amber-950 mt-0.5">
              {fuelTotalEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
            </div>
            <div className="text-[10px] text-amber-700 mt-0.5">
              {totalFuelLiters.toLocaleString('tr-TR')} Litre mazot
            </div>
          </div>

          {/* Ro-Ro Gemi */}
          <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-xl">
            <div className="flex items-center justify-between text-[10px] font-bold text-cyan-800 uppercase">
              <span>Ro-Ro &amp; Deniz</span>
              <Ship className="w-3.5 h-3.5 text-cyan-600" />
            </div>
            <div className="text-lg font-black text-cyan-950 mt-0.5">
              {roRoTotalEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
            </div>
            <div className="text-[10px] text-cyan-700 mt-0.5">Gemi bilet bedelleri</div>
          </div>

          {/* Per Diem */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 uppercase">
              <span>Şoför Harcırahı</span>
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-lg font-black text-emerald-950 mt-0.5">
              {allowanceTotalEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Yurtiçi/yurtdışı avanslar</div>
          </div>

          {/* Tolls */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between text-[10px] font-bold text-blue-800 uppercase">
              <span>Otoyol &amp; Vinyet</span>
              <Milestone className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-lg font-black text-blue-950 mt-0.5">
              {tollTotalEUR.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} €
            </div>
            <div className="text-[10px] text-blue-700 mt-0.5">HGS, Asfinag, Platon</div>
          </div>
        </div>

        {/* Filter inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Fiş, şoför, istasyon, liman ara..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
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
                  {v.plate} ({v.type || 'Öz Mal'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value="all">Tüm Masraf Kalemleri</option>
              <option value="Yakıt">Yakıt (Litre &amp; Tutar)</option>
              <option value="Ro-Ro / Gemi Bileti">Ro-Ro / Gemi Bileti</option>
              <option value="Otoyol">Otoyol / Otoban / Köprü</option>
              <option value="Harcırah">Şoför Harcırahı</option>
              <option value="Gümrük">Gümrük / Transit Belgeleri</option>
              <option value="Bakım">Bakım / Servis / Tamir</option>
              <option value="Diğer">Diğer Masraflar</option>
            </select>
          </div>

          <div>
            <select
              value={filterLocationGroup}
              onChange={(e) => setFilterLocationGroup(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium text-slate-700"
            >
              <option value="all">Tüm Harcama Bölgeleri</option>
              <option value="Türkiye İçi">Türkiye İçi Masraflar</option>
              <option value="Ro-Ro / Gemi">Ro-Ro / Denizyolu</option>
              <option value="Transit Ülke">Transit Ülke Masrafları</option>
              <option value="Hedef Ülke">Hedef Ülke Masrafları</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Filtrelenen: <strong>{totalEUR.toFixed(0)} €</strong></span>
          </div>
        </div>
      </div>

      {/* Expense Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Tarih &amp; Fiş No</th>
                <th className="py-3 px-3">Araç Plakası &amp; Türü</th>
                <th className="py-3 px-3">Bölge &amp; Konum</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-4">Açıklama &amp; Detay</th>
                <th className="py-3 px-3">Şoför / Sefer</th>
                <th className="py-3 px-4 text-right">Tutar</th>
                {permissions.canManageExpenses && <th className="py-3 px-3 text-center">İşlem</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Kayıtlı masraf fişi bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const vehObj = vehicles.find((v) => v.plate === exp.vehiclePlate);
                  const isOzmal = vehObj ? vehObj.type === 'Öz Mal' : true;
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{exp.date}</div>
                        <div className="text-[11px] text-slate-500">Fiş: {exp.receiptNo}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 block w-max">
                          {exp.vehiclePlate}
                        </span>
                        <span className={`text-[10px] font-bold mt-1 px-1.5 py-0.2 rounded inline-block ${isOzmal ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
                          {isOzmal ? 'Özmal' : 'Kiralık / Taşeron'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${getLocationGroupBadge(
                            exp.locationGroup
                          )}`}
                        >
                          {exp.locationGroup || 'Türkiye İçi'}
                        </span>
                        {exp.countryOrPort && (
                          <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[120px]">
                            {exp.countryOrPort}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${getCategoryBadge(
                            exp.category
                          )}`}
                        >
                          {getCategoryIcon(exp.category)}
                          {exp.category}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{exp.description}</div>
                        {exp.category === 'Yakıt' && exp.liters && (
                          <div className="text-[11px] text-amber-700 mt-0.5 font-medium">
                            ⛽ {exp.liters} Litre • İstasyon: {exp.fuelStation || 'Otoyol'}
                          </div>
                        )}
                        {exp.km && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Sayaç: {exp.km.toLocaleString('tr-TR')} km
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-900">{exp.driverName}</div>
                        {exp.tripCmrNo && (
                          <div className="text-[11px] text-indigo-600 font-semibold">
                            {exp.tripCmrNo}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="text-sm font-black text-slate-900">
                          {exp.amount.toLocaleString('tr-TR')} {exp.currency === 'TRY' ? '₺' : exp.currency === 'RUB' ? '₽' : exp.currency === 'USD' ? '$' : '€'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          (~{convertCurrency(exp.amount, exp.currency, 'EUR', 'forexBuying').toFixed(0)} €)
                        </div>
                      </td>

                      {permissions.canManageExpenses && (
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => {
                              if (window.confirm('Bu masraf kaydını silmek istiyor musunuz?')) {
                                deleteExpense(exp.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Detaylı Şoför &amp; Araç Masrafı Ekle</h3>
                  <p className="text-xs text-slate-400">
                    Özmal veya Kiralık / Taşeron araç masrafı ve bölge kırılımı girişi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Araç Plakası (Özmal / Kiralık) *
                  </label>
                  <select
                    value={formVehicleId}
                    onChange={handleVehicleChange}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-bold"
                    required
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.plate} ({v.type || 'Öz Mal'} - {v.brandModel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    İlişkili Sefer
                  </label>
                  <select
                    value={formTripId}
                    onChange={handleTripChange}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="">Sefer Seçimi Yapılmadı (Genel Masraf)</option>
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.cmrNo}: {t.originCity} → {t.destinationCity} ({t.region})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location Group and Country/Port */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4 text-indigo-600" />
                  <span>Masrafın Yapıldığı Ülke &amp; Bölge Kırılımı *</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Harcama Bölgesi *
                    </label>
                    <select
                      value={formLocationGroup}
                      onChange={(e) => setFormLocationGroup(e.target.value as ExpenseLocationGroup)}
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white font-bold focus:outline-none"
                    >
                      <option value="Türkiye İçi">1. Türkiye İçi (TR Yakıt, TR Otoyol, Kantar)</option>
                      <option value="Ro-Ro / Gemi">2. Ro-Ro / Gemi (Gemi Bileti &amp; Denizyolu)</option>
                      <option value="Transit Ülke">3. Transit Ülke (Vinyet, Yabancı Yakıt, Harcırah)</option>
                      <option value="Hedef Ülke">4. Hedef Ülke (Varış Gümrüğü, Otoban, Yakıt)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Ülke / Şehir / Liman Adı *
                    </label>
                    <input
                      type="text"
                      value={formCountryOrPort}
                      onChange={(e) => setFormCountryOrPort(e.target.value)}
                      placeholder="örn: Türkiye - Sakarya, Karasu Limanı, Rusya - Rostov"
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gider Kategorisi *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-semibold"
                  >
                    <option value="Yakıt">Yakıt (Litre &amp; Tutar)</option>
                    <option value="Ro-Ro / Gemi Bileti">Ro-Ro / Gemi Bileti (Denizyolu)</option>
                    <option value="Otoyol">Otoyol / Otoban / Köprü / Vinyet</option>
                    <option value="Harcırah">Şoför Harcırahı (Yol Gideri)</option>
                    <option value="Gümrük">Gümrük &amp; Transit Belgeleri / Kantar</option>
                    <option value="Bakım">Servis &amp; Bakım Onarım</option>
                    <option value="Diğer">Diğer Masraflar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Masraf Tarihi
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Amount and Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harcama Tutarı *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="w-full p-2.5 text-sm font-black text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Para Birimi *
                  </label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value as Currency)}
                    className="w-full p-2.5 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-indigo-900"
                  >
                    <option value="TRY">TRY (₺) - Türk Lirası</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="USD">USD ($) - ABD Doları</option>
                    <option value="RUB">RUB (₽) - Rus Rublesi</option>
                  </select>
                </div>
              </div>

              {/* Specific fuel fields */}
              {formCategory === 'Yakıt' && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Fuel className="w-4 h-4 text-amber-600" />
                    <span>Yakıt (Litre &amp; Tutar) Detayı</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                        Alınan Litre (Motorin) *
                      </label>
                      <input
                        type="number"
                        value={formLiters}
                        onChange={(e) => setFormLiters(Number(e.target.value))}
                        placeholder="450"
                        className="w-full p-2 text-xs border border-amber-300 rounded-lg bg-white focus:outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                        Akaryakıt İstasyonu / Şehir
                      </label>
                      <input
                        type="text"
                        value={formFuelStation}
                        onChange={(e) => setFormFuelStation(e.target.value)}
                        placeholder="Opet Karasu, Lukoil Rostov, Shell Sofya vb."
                        className="w-full p-2 text-xs border border-amber-300 rounded-lg bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fiş / Bilet / Fatura No
                  </label>
                  <input
                    type="text"
                    value={formReceiptNo}
                    onChange={(e) => setFormReceiptNo(e.target.value)}
                    placeholder="örn: FIS-88123, RORO-991 vb."
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sayaç Kilometresi (km)
                  </label>
                  <input
                    type="number"
                    value={formKm}
                    onChange={(e) => setFormKm(Number(e.target.value))}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Açıklama *
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Harcama detay açıklaması..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  Masrafı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};