import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Navigation,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  ArrowRight,
  Printer,
  CheckCircle2,
  AlertCircle,
  Truck,
  Shield,
  X,
  FileText,
  User,
  Package,
  Ship,
  Globe2,
  Anchor,
  Download,
  Shuffle,
  History,
  FileUp,
  Snowflake,
  Container,
  Layers,
} from 'lucide-react';
import {
  Trip,
  ShipmentType,
  TripStatus,
  Currency,
  Region,
  TransportMode,
  TrailerCategory,
} from '../../types';
import { exportToCsv } from '../../utils/exportToCsv';

export const TripsTab: React.FC = () => {
  const {
    trips,
    tractors,
    trailers,
    drivers,
    customers,
    addTrip,
    updateTripStatus,
    deleteTrip,
    reassignTripEquipment,
    generateDynamicTripCode,
    openDocumentUpload,
    permissions,
    freightRequests,
    updateFreightRequestStatus,
    contracts,
    openContractModalForTrip,
    updateTripDemurrage,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [cmrPreviewTrip, setCmrPreviewTrip] = useState<Trip | null>(null);

  // Demurrage (Gümrük Bekleme) modal
  const [demurrageTrip, setDemurrageTrip] = useState<Trip | null>(null);
  const [waitHoursInput, setWaitHoursInput] = useState<number>(48);
  const [freeHoursInput, setFreeHoursInput] = useState<number>(48);
  const [dailyRateInput, setDailyRateInput] = useState<number>(150);

  // Equipment reassignment modal
  const [reassignTrip, setReassignTrip] = useState<Trip | null>(null);
  const [newTractorPlate, setNewTractorPlate] = useState('');
  const [newTrailerPlate, setNewTrailerPlate] = useState('');
  const [newTrailerType, setNewTrailerType] = useState<TrailerCategory>('Tenteli Mega');
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('+90 532 444 1234');
  const [reassignReason, setReassignReason] = useState('');
  const [reassignLocation, setReassignLocation] = useState('');

  // History modal
  const [historyTrip, setHistoryTrip] = useState<Trip | null>(null);

  // Form states for new trip
  const [formCustomerId, setFormCustomerId] = useState(customers[0]?.id || '');
  const [formCustomerName, setFormCustomerName] = useState(customers[0]?.companyName || '');
  const [formShipmentType, setFormShipmentType] = useState<ShipmentType>('Komple');
  const [formRegion, setFormRegion] = useState<Region>('Avrupa');
  const [formTransportMode, setFormTransportMode] = useState<TransportMode>('Karayolu Standart');
  const [formRoRoRoute, setFormRoRoRoute] = useState('Karasu - Novorossiysk (Karadeniz Ro-Ro)');
  const [formIsDomestic, setFormIsDomestic] = useState(false);
  const [formDomesticTransferType, setFormDomesticTransferType] = useState<'Şehirlerarası' | 'Liman Transferi' | 'Serbest Bölge / Antrepo'>('Şehirlerarası');
  const [formOriginCountry, setFormOriginCountry] = useState('Türkiye');
  const [formOriginCity, setFormOriginCity] = useState('İstanbul (Erenköy)');
  const [formDestCountry, setFormDestCountry] = useState('Almanya');
  const [formDestCity, setFormDestCity] = useState('Münih');
  const [formFreightPrice, setFormFreightPrice] = useState<number>(4500);
  const [formCurrency, setFormCurrency] = useState<Currency>('EUR');

  // Discrete Equipment Form States
  const [formTractorPlate, setFormTractorPlate] = useState(tractors[0]?.plate || '34 TL 4501');
  const [formTrailerPlate, setFormTrailerPlate] = useState(trailers[0]?.plate || '34 DRS 45');
  const [formTrailerType, setFormTrailerType] = useState<TrailerCategory>(trailers[0]?.type || 'Tenteli Mega');
  const [formOwnership, setFormOwnership] = useState<'Öz Mal' | 'Kiralık'>('Öz Mal');
  const [formDriverName, setFormDriverName] = useState(drivers[0]?.fullName || 'Ahmet Karaca');
  const [formDriverPhone, setFormDriverPhone] = useState(drivers[0]?.phone || '+90 532 444 1234');

  const [formDepartureDate, setFormDepartureDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEtaDate, setFormEtaDate] = useState('2026-10-30');
  const [formCargoDesc, setFormCargoDesc] = useState('Endüstriyel Ürünler & Makine Komponentleri');
  const [formWeightKg, setFormWeightKg] = useState<number>(21000);
  const [formPalletCount, setFormPalletCount] = useState<number>(33);
  const [formNotes, setFormNotes] = useState('');

  const handleTrailerSelect = (trailerPlate: string) => {
    setFormTrailerPlate(trailerPlate);
    const tr = trailers.find((t) => t.plate === trailerPlate);
    if (tr) {
      setFormTrailerType(tr.type);
      setFormOwnership(tr.ownership);
    }
  };

  const handleDriverSelect = (driverName: string) => {
    setFormDriverName(driverName);
    const drv = drivers.find((d) => d.fullName === driverName);
    if (drv) {
      setFormDriverPhone(drv.phone);
    }
  };

  const openCreateModal = () => {
    const defaultTrc = tractors.find((t) => t.status === 'Boş') || tractors[0];
    const defaultTrl = trailers.find((t) => t.status === 'Boş') || trailers[0];
    const defaultDrv = drivers.find((d) => d.status === 'Aktif') || drivers[0];

    if (defaultTrc) setFormTractorPlate(defaultTrc.plate);
    if (defaultTrl) {
      setFormTrailerPlate(defaultTrl.plate);
      setFormTrailerType(defaultTrl.type);
      setFormOwnership(defaultTrl.ownership);
    }
    if (defaultDrv) {
      setFormDriverName(defaultDrv.fullName);
      setFormDriverPhone(defaultDrv.phone);
    }

    if (customers.length > 0) {
      setFormCustomerId(customers[0].id);
      setFormCustomerName(customers[0].companyName);
    }
    setFormShipmentType('Komple');
    setFormRegion('Avrupa');
    setFormTransportMode('Karayolu Standart');
    setFormRoRoRoute('Karasu - Novorossiysk (Karadeniz Ro-Ro)');
    setFormIsDomestic(false);
    setFormDomesticTransferType('Şehirlerarası');
    setFormOriginCountry('Türkiye');
    setFormOriginCity('İstanbul (Erenköy)');
    setFormDestCountry('Almanya');
    setFormDestCity('Münih');
    setFormFreightPrice(4600);
    setFormCurrency('EUR');
    setFormDepartureDate(new Date().toISOString().split('T')[0]);
    setFormEtaDate('2026-10-31');
    setFormCargoDesc('Endüstriyel Ürünler & Makine Komponentleri');
    setFormWeightKg(21000);
    setFormPalletCount(33);
    setFormNotes('Gümrükleme sabah randevulu.');
    setIsCreateModalOpen(true);
  };

  const handleRegionChange = (reg: Region) => {
    setFormRegion(reg);
    if (reg === 'Yurtiçi') {
      setFormIsDomestic(true);
      setFormOriginCountry('Türkiye');
      setFormOriginCity('İzmir (Aliağa Limanı)');
      setFormDestCountry('Türkiye');
      setFormDestCity('İstanbul (Ambarlı Limanı)');
      setFormCurrency('TRY');
      setFormFreightPrice(48000);
      setFormTransportMode('Karayolu Standart');
    } else if (reg === 'Rusya & Beyaz Rusya') {
      setFormIsDomestic(false);
      setFormOriginCountry('Türkiye');
      setFormOriginCity('Kocaeli (Karasu Limanı)');
      setFormDestCountry('Rusya');
      setFormDestCity('Moskova (Vnukovo)');
      setFormCurrency('USD');
      setFormFreightPrice(5800);
      setFormTransportMode('Ro-Ro / Gemi');
      setFormRoRoRoute('Karasu - Novorossiysk (Karadeniz Ro-Ro)');
    } else {
      setFormIsDomestic(false);
      setFormOriginCountry('Türkiye');
      setFormOriginCity('İstanbul (Erenköy)');
      setFormDestCountry('Almanya');
      setFormDestCity('Stuttgart');
      setFormCurrency('EUR');
      setFormFreightPrice(4850);
      setFormTransportMode('Karayolu Standart');
    }
  };

  const handleCreateTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTrip({
      customerId: formCustomerId,
      customerName: formCustomerName,
      shipmentType: formShipmentType,
      region: formRegion,
      transportMode: formTransportMode,
      roRoRoute: formTransportMode === 'Ro-Ro / Gemi' ? formRoRoRoute : undefined,
      isDomestic: formIsDomestic,
      domesticTransferType: formIsDomestic ? formDomesticTransferType : undefined,
      originCountry: formOriginCountry,
      originCity: formOriginCity,
      destinationCountry: formDestCountry,
      destinationCity: formDestCity,
      freightPrice: formFreightPrice,
      currency: formCurrency,
      tractorPlate: formTractorPlate,
      trailerPlate: formTrailerPlate,
      trailerType: formTrailerType,
      ownership: formOwnership,
      vehiclePlate: formTractorPlate,
      driverName: formDriverName,
      driverPhone: formDriverPhone,
      status: 'Hazırlanıyor',
      currentMilestone: `${formOriginCity} Yükleme & Evrak Hazırlığı`,
      departureDate: formDepartureDate,
      etaDate: formEtaDate,
      cargoDescription: formCargoDesc,
      weightKg: formWeightKg,
      palletCount: formPalletCount,
      borderCrossings: formIsDomestic ? ['Yurtiçi Koridor'] : ['Sınır Kapısı / Gümrük Noktası'],
      notes: formNotes,
    });
    setIsCreateModalOpen(false);
  };

  const openReassignModal = (trip: Trip) => {
    setReassignTrip(trip);
    setNewTractorPlate(trip.tractorPlate);
    setNewTrailerPlate(trip.trailerPlate);
    setNewTrailerType(trip.trailerType || 'Tenteli Mega');
    setNewDriverName(trip.driverName);
    setNewDriverPhone(trip.driverPhone || '+90 532 444 1234');
    setReassignReason('Sınır kapısında dorse/şoför değişimi');
    setReassignLocation(trip.currentMilestone || 'Kapıkule Sınır Kapısı');
  };

  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignTrip) return;
    reassignTripEquipment(reassignTrip.id, {
      newTractorPlate,
      newTrailerPlate,
      newTrailerType,
      newDriverName,
      newDriverPhone,
      reason: reassignReason,
      location: reassignLocation,
    });
    setReassignTrip(null);
  };

  const handleExportCsv = () => {
    exportToCsv(
      'Keser_Uluslararasi_Sefer_Listesi',
      trips,
      [
        { header: 'CMR / Seri No', key: 'cmrNo' },
        { header: 'Müşteri Adı', key: 'customerName' },
        { header: 'Bölge', key: 'region' },
        { header: 'Taşıma Modu', key: 'transportMode' },
        { header: 'Çekici Plaka', key: (r) => r.tractorPlate || r.vehiclePlate },
        { header: 'Dorse Plaka', key: (r) => r.trailerPlate || '-' },
        { header: 'Sürücü Kaptan', key: 'driverName' },
        { header: 'Çıkış Noktası', key: (r) => `${r.originCity}, ${r.originCountry}` },
        { header: 'Varış Noktası', key: (r) => `${r.destinationCity}, ${r.destinationCountry}` },
        { header: 'Sefer Durumu', key: 'status' },
        { header: 'Navlun Tutarı', key: 'freightPrice' },
        { header: 'Para Birimi', key: 'currency' },
      ]
    );
  };

  const filteredTrips = trips.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      t.cmrNo.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      (t.tractorPlate || t.vehiclePlate || '').toLowerCase().includes(q) ||
      (t.trailerPlate || '').toLowerCase().includes(q) ||
      t.driverName.toLowerCase().includes(q) ||
      t.destinationCity.toLowerCase().includes(q);

    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchType = filterType === 'all' || t.shipmentType === filterType;
    const matchRegion = filterRegion === 'all' || t.region === filterRegion;
    const matchMode = filterMode === 'all' || t.transportMode === filterMode;

    return matchSearch && matchStatus && matchType && matchRegion && matchMode;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
              <Navigation className="w-4 h-4" />
              <span>Uluslararası &amp; Yurtiçi Sefer Operasyonları (Aktif / Pasif Takibi)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Seferler, CMR &amp; Muhasebe Arşiv Masası
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Dosya/CMR numarasıyla arama, aktif/tamamlanan sefer filtrelemesi ve masraf merkezi entegrasyonu
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition shadow-2xs"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Excel / CSV</span>
            </button>

            <button
              onClick={() => openContractModalForTrip(null)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm transition"
            >
              <FileText className="w-4 h-4" />
              <span>Sözleşme Hazırla</span>
            </button>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Sefer Başlat</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6 pt-4 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 translate-y-[-50%] text-slate-400" />
            <input
              type="text"
              placeholder="CMR dosya no, plaka, şoför..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none font-bold text-slate-700"
          >
            <option value="all">🟢 Tüm Durumlar (Aktif &amp; Kapalı)</option>
            <option value="Hazırlanıyor">🟡 Hazırlanıyor (Aktif)</option>
            <option value="Yolda">🚚 Yolda (Devam Ediyor)</option>
            <option value="Gümrükte">🏛️ Gümrükte (Beklemede)</option>
            <option value="Teslim Edildi">✅ Teslim Edildi (Tamamlandı / Kapandı)</option>
          </select>

          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
          >
            <option value="all">Tüm Bölgeler</option>
            <option value="Yurtiçi">Yurtiçi (İzmir, İstanbul vb.)</option>
            <option value="Avrupa">Avrupa</option>
            <option value="Rusya & Beyaz Rusya">Rusya &amp; Beyaz Rusya</option>
          </select>

          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
          >
            <option value="all">Tüm Modlar</option>
            <option value="Karayolu Standart">Karayolu Standart</option>
            <option value="Ro-Ro / Gemi">Ro-Ro / Denizyolu</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
          >
            <option value="all">Tüm Yük Tipleri</option>
            <option value="Komple">Komple (FTL)</option>
            <option value="Parsiyel">Parsiyel (LTL)</option>
          </select>
        </div>
      </div>

      {/* Inbound Customer Freight Requests (Müşteri Portalı Yük Talepleri) */}
      {freightRequests.filter((r) => r.status === 'Yeni Talep' || r.status === 'İnceleniyor').length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600 animate-bounce" />
              <h3 className="font-bold text-blue-950 text-sm">
                Müşteri Portalı Yük Talepleri ({freightRequests.filter((r) => r.status === 'Yeni Talep' || r.status === 'İnceleniyor').length} Bekleyen Talep)
              </h3>
            </div>
            <span className="text-xs text-blue-700 font-semibold">
              Uygun araç ve dorse ile tek tıkla sefere dönüştürün
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {freightRequests
              .filter((r) => r.status === 'Yeni Talep' || r.status === 'İnceleniyor')
              .map((req) => (
                <div
                  key={req.id}
                  className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-2xs flex flex-col justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{req.customerName}</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded-full">
                        {req.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-900 font-bold mt-1 text-[11px]">
                      <span>{req.originCity} ({req.originCountry})</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{req.destinationCity} ({req.destinationCountry})</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-1">
                      {req.cargoDescription} • {req.tonnage} Ton • {req.trailerType}
                      {req.targetBudgetEUR && (
                        <span className="font-bold text-slate-700 ml-1">
                          (Hedef: {req.targetBudgetEUR} €)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setFormCustomerName(req.customerName);
                        setFormOriginCity(req.originCity);
                        setFormOriginCountry(req.originCountry);
                        setFormDestCity(req.destinationCity);
                        setFormDestCountry(req.destinationCountry);
                        setFormCargoDesc(req.cargoDescription);
                        setFormWeightKg(Math.round(req.tonnage * 1000));
                        setFormTrailerType(req.trailerType);
                        if (req.targetBudgetEUR) setFormFreightPrice(req.targetBudgetEUR);
                        updateFreightRequestStatus(req.id, 'İnceleniyor');
                        setIsCreateModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Bu Taleple Sefer Planla &amp; CMR Aç</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Trips Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredTrips.map((trip) => {
          const isOngoing = trip.status !== 'Teslim Edildi' && trip.status !== 'İptal';

          return (
            <div
              key={trip.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 transition flex flex-col justify-between ${
                isOngoing ? 'border-indigo-200 bg-indigo-50/10' : 'border-slate-200 opacity-90'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-black text-indigo-900 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg">
                      {trip.cmrNo}
                    </span>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                        trip.status === 'Yolda'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : trip.status === 'Gümrükte'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : trip.status === 'Teslim Edildi'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isOngoing ? '🟢' : '🔴'} {trip.status}
                    </span>

                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {trip.region}
                    </span>

                    {trip.transportMode === 'Ro-Ro / Gemi' && (
                      <span className="text-xs font-medium px-2 py-0.5 bg-cyan-50 text-cyan-800 border border-cyan-200 rounded flex items-center gap-1">
                        <Ship className="w-3 h-3 text-cyan-600" />
                        Ro-Ro
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900 block">
                      {trip.freightPrice.toLocaleString('tr-TR')} {trip.currency}
                    </span>
                    <span className="text-[10px] text-slate-400">Navlun Bedeli</span>
                  </div>
                </div>

                <div className="mt-3.5">
                  <h3 className="font-bold text-slate-900 text-sm">{trip.customerName}</h3>
                  <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-slate-800">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{trip.originCity} ({trip.originCountry})</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <div className="flex items-center gap-1 text-indigo-700">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{trip.destinationCity} ({trip.destinationCountry})</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Çekici Plaka:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {trip.tractorPlate || trip.vehiclePlate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Dorse &amp; Tipi:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {trip.trailerPlate || 'Belirtilmedi'}
                        {trip.trailerType && (
                          <span className="font-sans font-normal text-slate-500 ml-1">
                            ({trip.trailerType})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Kaptan Şoför:</span>
                      <span className="font-medium text-slate-800">
                        {trip.driverName}
                        {trip.driverPhone && (
                          <span className="text-slate-500 block text-[11px]">{trip.driverPhone}</span>
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Yük Bilgisi:</span>
                      <span className="text-slate-700">
                        {trip.weightKg.toLocaleString('tr-TR')} kg • {trip.palletCount} Palet
                      </span>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      Aşama / Konum:
                    </span>
                    <span className="font-semibold text-slate-800 truncate max-w-[240px]">
                      {trip.currentMilestone}
                    </span>
                  </div>
                </div>

                {trip.assignmentHistory && trip.assignmentHistory.length > 0 && (
                  <div className="mt-2 text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg flex items-center justify-between">
                    <span className="flex items-center gap-1 font-medium">
                      <Shuffle className="w-3.5 h-3.5" />
                      {trip.assignmentHistory.length} kez ekipman/şoför değişimi yapıldı
                    </span>
                    <button
                      onClick={() => setHistoryTrip(trip)}
                      className="underline font-bold hover:text-indigo-800"
                    >
                      Geçmişi Gör
                    </button>
                  </div>
                )}

                <div className="mt-2.5 p-2.5 rounded-xl border bg-slate-50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="font-bold text-slate-800">
                        Gümrük Bekleme: {trip.borderWaitHours || 0} Saat
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {trip.demurrageFreeHours || 48}s ücretsiz • {trip.demurrageTotalEUR && trip.demurrageTotalEUR > 0 ? (
                          <strong className="text-rose-600">{trip.demurrageTotalEUR} € Ceza</strong>
                        ) : (
                          <span className="text-emerald-700">Normal (Aşım Yok)</span>
                        )}
                      </span>
                    </div>
                  </div>
                  {isOngoing && (
                    <button
                      type="button"
                      onClick={() => {
                        setDemurrageTrip(trip);
                        setWaitHoursInput(trip.borderWaitHours || 48);
                        setFreeHoursInput(trip.demurrageFreeHours || 48);
                        setDailyRateInput(trip.demurrageDailyRateEUR || 150);
                      }}
                      className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg text-[11px] transition"
                    >
                      Bekleme Güncelle
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCmrPreviewTrip(trip)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>CMR Belgesi</span>
                  </button>

                  <button
                    onClick={() => openContractModalForTrip(trip)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 font-semibold text-xs rounded-lg transition border ${
                      trip.hasSignedContract
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>{trip.hasSignedContract ? '✓ Sözleşme İmzalı' : 'Sözleşme'}</span>
                  </button>

                  <button
                    onClick={() =>
                      openDocumentUpload({
                        relatedEntityType: 'trip',
                        relatedEntityId: trip.id,
                        referenceNo: trip.cmrNo,
                        defaultType: 'CMR / Taşıma Belgesi',
                      })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
                  >
                    <FileUp className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Evrak</span>
                  </button>

                  {isOngoing && (
                    <button
                      onClick={() => openReassignModal(trip)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs rounded-lg transition border border-amber-200"
                    >
                      <Shuffle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Değiştir</span>
                    </button>
                  )}
                </div>

                {isOngoing ? (
                  <select
                    value={trip.status}
                    onChange={(e) => updateTripStatus(trip.id, e.target.value as TripStatus)}
                    className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-900 cursor-pointer"
                  >
                    <option value="Hazırlanıyor">Hazırlanıyor</option>
                    <option value="Yolda">Yolda</option>
                    <option value="Gümrükte">Gümrükte</option>
                    <option value="Teslim Edildi">✅ Teslim Edildi (Seferi Kapat)</option>
                  </select>
                ) : (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-lg flex items-center gap-1 border border-emerald-200">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    Muhasebe Arşivlendi (Kapandı)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Yeni Sefer Başlat &amp; CMR Aç</h3>
                <p className="text-xs text-slate-500">
                  Dinamik seri kodlama: Araç tipi ve mülkiyetine göre otomatik üretilir.
                </p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTripSubmit} className="space-y-4 mt-4 text-sm">
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-indigo-700 font-semibold block">
                    Otomatik Üretilen Dinamik Seri / CMR Kodu:
                  </span>
                  <span className="font-mono text-xl font-black text-indigo-900">
                    {generateDynamicTripCode(formTrailerType, formOwnership)}
                  </span>
                </div>
                <span className="text-xs font-medium bg-white px-2.5 py-1 rounded-lg text-indigo-700 border border-indigo-100">
                  {formTrailerType} • {formOwnership}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Müşteri (Cari) *</label>
                  <select
                    value={formCustomerId}
                    onChange={(e) => {
                      setFormCustomerId(e.target.value);
                      const c = customers.find((cust) => cust.id === e.target.value);
                      if (c) setFormCustomerName(c.companyName);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.companyName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Operasyon Bölgesi *</label>
                  <select
                    value={formRegion}
                    onChange={(e) => handleRegionChange(e.target.value as Region)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="Avrupa">Avrupa</option>
                    <option value="Rusya & Beyaz Rusya">Rusya &amp; Beyaz Rusya</option>
                    <option value="Yurtiçi">Yurtiçi</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">Bağımsız Ekipman &amp; Sürücü Ataması</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Çekici</label>
                    <select
                      value={formTractorPlate}
                      onChange={(e) => setFormTractorPlate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    >
                      {tractors.map((t) => (
                        <option key={t.id} value={t.plate}>{t.plate} ({t.ownership})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Dorse</label>
                    <select
                      value={formTrailerPlate}
                      onChange={(e) => handleTrailerSelect(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    >
                      {trailers.map((tr) => (
                        <option key={tr.id} value={tr.plate}>{tr.plate} ({tr.type})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Şoför</label>
                    <select
                      value={formDriverName}
                      onChange={(e) => handleDriverSelect(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                    >
                      {drivers.map((d) => (
                        <option key={d.id} value={d.fullName}>{d.fullName}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Çıkış Şehri *</label>
                  <input
                    type="text"
                    value={formOriginCity}
                    onChange={(e) => setFormOriginCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Varış Şehri *</label>
                  <input
                    type="text"
                    value={formDestCity}
                    onChange={(e) => setFormDestCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Navlun Tutarı *</label>
                  <input
                    type="number"
                    value={formFreightPrice}
                    onChange={(e) => setFormFreightPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Para Birimi</label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="TRY">TRY (₺)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Seferi Başlat &amp; CMR Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REASSIGN MODAL */}
      {reassignTrip && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Ekipman / Şoför Değişimi</h3>
              <button onClick={() => setReassignTrip(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} className="space-y-4 mt-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Yeni Çekici</label>
                <select
                  value={newTractorPlate}
                  onChange={(e) => setNewTractorPlate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs font-bold"
                >
                  {tractors.map((t) => (
                    <option key={t.id} value={t.plate}>{t.plate}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Yeni Dorse</label>
                <select
                  value={newTrailerPlate}
                  onChange={(e) => setNewTrailerPlate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs font-bold"
                >
                  {trailers.map((tr) => (
                    <option key={tr.id} value={tr.plate}>{tr.plate}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Yeni Şoför</label>
                <select
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.fullName}>{d.fullName}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setReassignTrip(null)}
                  className="px-4 py-2 border text-slate-700 font-bold rounded-lg text-xs"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs"
                >
                  Değişimi Onayla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CMR PREVIEW MODAL */}
      {cmrPreviewTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <span className="font-bold text-sm">CMR Taşıma Belgesi Önizleme</span>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold">
                  Yazdır / PDF
                </button>
                <button onClick={() => setCmrPreviewTrip(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50 text-slate-800 text-xs">
              <div className="border-2 border-slate-800 p-6 bg-white space-y-4">
                <div className="flex justify-between border-b-2 pb-4">
                  <h1 className="text-xl font-black">CMR CONSIGNMENT NOTE</h1>
                  <span className="font-mono text-base font-bold">{cmrPreviewTrip.cmrNo}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border p-3 rounded">
                    <strong>Gönderici:</strong> {cmrPreviewTrip.customerName}<br/>
                    {cmrPreviewTrip.originCity}, {cmrPreviewTrip.originCountry}
                  </div>
                  <div className="border p-3 rounded">
                    <strong>Alıcı:</strong> {cmrPreviewTrip.customerName} Depo<br/>
                    {cmrPreviewTrip.destinationCity}, {cmrPreviewTrip.destinationCountry}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEMURRAGE MODAL */}
      {demurrageTrip && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Gümrük Bekleme (Demoraj)</h3>
              <button onClick={() => setDemurrageTrip(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateTripDemurrage(demurrageTrip.id, waitHoursInput, freeHoursInput, dailyRateInput);
                setDemurrageTrip(null);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Toplam Bekleme (Saat)</label>
                <input
                  type="number"
                  value={waitHoursInput}
                  onChange={(e) => setWaitHoursInput(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setDemurrageTrip(null)}
                  className="px-4 py-2 border rounded-lg text-slate-700 font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow"
                >
                  Demorajı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};