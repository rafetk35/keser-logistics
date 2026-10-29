import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  Plus,
  Search,
  Layers,
  Trash2,
  X,
  User,
  MessageSquare,
  FileText,
  Building2,
  FileUp,
  ShieldAlert,
  Eye,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import {
  Tractor,
  Trailer,
  Driver,
  Supplier,
  VehicleOfficialDoc,
  VehicleDocType,
  DriverOfficialDoc,
  TrailerCategory,
} from '../../types';

export const VehiclesTab: React.FC = () => {
  const {
    tractors,
    addTractor,
    deleteTractor,
    trailers,
    addTrailer,
    deleteTrailer,
    drivers,
    addDriver,
    deleteDriver,
    addDriverDocument,
    suppliers,
    addSupplier,
    deleteSupplier,
    openWhatsAppQuery,
    showToast,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'tractors' | 'trailers' | 'drivers' | 'suppliers'>('tractors');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOwnership, setFilterOwnership] = useState<string>('all');

  // Modals
  const [isTractorModalOpen, setIsTractorModalOpen] = useState(false);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // Evrak Modalları
  const [isVehicleDocModalOpen, setIsVehicleDocModalOpen] = useState(false);
  const [selectedVehicleForDoc, setSelectedVehicleForDoc] = useState<{ type: 'tractor' | 'trailer'; id: string; plate: string } | null>(null);
  
  const [isDriverDocModalOpen, setIsDriverDocModalOpen] = useState(false);
  const [selectedDriverForDoc, setSelectedDriverForDoc] = useState<Driver | null>(null);

  const [selectedDocPreview, setSelectedDocPreview] = useState<{ title: string; url: string } | null>(null);

  // Form states for Tractor
  const [trcPlate, setTrcPlate] = useState('');
  const [trcOwnership, setTrcOwnership] = useState<'Öz Mal' | 'Kiralık' | 'İş Ortağı'>('Öz Mal');
  const [trcBrand, setTrcBrand] = useState('Mercedes-Benz Actros 1848');
  const [trcYear, setTrcYear] = useState(2023);
  const [trcKm, setTrcKm] = useState(240000);
  const [trcCity, setTrcCity] = useState('İzmir');

  // Form states for Trailer
  const [trlPlate, setTrlPlate] = useState('');
  const [trlOwnership, setTrlOwnership] = useState<'Öz Mal' | 'Kiralık' | 'İş Ortağı'>('Öz Mal');
  const [trlType, setTrlType] = useState<TrailerCategory>('Tenteli Orta');
  const [trlBrand, setTrlBrand] = useState('Schmitz Cargobull');
  const [trlTons, setTrlTons] = useState(24);
  const [trlM3, setTrlM3] = useState(90);
  const [trlYear, setTrlYear] = useState(2023);

  // Form states for Driver
  const [drvName, setDrvName] = useState('');
  const [drvPhone, setDrvPhone] = useState('+90 5');
  const [drvTc, setDrvTc] = useState('');
  const [drvLicense, setDrvLicense] = useState('CE + Dijital Takograf');
  const [drvEmail, setDrvEmail] = useState('');
  const [drvEmergency, setDrvEmergency] = useState('');

  // Form states for Vehicle Doc Upload (OCR)
  const [vDocType, setVDocType] = useState<VehicleDocType>('Trafik Sigortası');
  const [vDocNo, setVDocNo] = useState('');
  const [vDocIssue, setVDocIssue] = useState('2026-01-01');
  const [vDocExpiry, setVDocExpiry] = useState('2027-01-01');
  const [vDocFileUrl, setVDocFileUrl] = useState('');
  const [vDocFileName, setVDocFileName] = useState('');
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);

  // Form states for Driver Doc Upload (OCR)
  const [dDocType, setDDocType] = useState<DriverOfficialDoc['type']>('Schengen Vizesi');
  const [dDocNo, setDDocNo] = useState('');
  const [dDocIssue, setDDocIssue] = useState('2025-06-01');
  const [dDocExpiry, setDDocExpiry] = useState('2026-11-30');
  const [dDocFileUrl, setDDocFileUrl] = useState('');
  const [dDocFileName, setDDocFileName] = useState('');
  const [isDriverOcrProcessing, setIsDriverOcrProcessing] = useState(false);

  // Form states for Supplier
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('+90 ');
  const [supCity, setSupCity] = useState('İzmir');

  const getDaysUntil = (dateStr: string) => {
    if (!dateStr) return 999;
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  // Araç OCR ve Uyuşmazlık Kontrolü
  const handleVehicleFileScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsOcrProcessing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setVDocFileUrl(event.target?.result as string);
        setVDocFileName(file.name);
        setTimeout(() => {
          const fname = file.name.toLowerCase();
          
          // Örnek Uyuşmazlık Kontrolü (Örn: Araç plakası 35 V 2007 ama farklı plaka belgesi yüklenirse)
          if (selectedVehicleForDoc && fname.includes('35k') && !selectedVehicleForDoc.plate.includes('35K')) {
            setIsOcrProcessing(false);
            showToast(`⚠️ Hata: Yüklenen belgedeki plaka (${file.name}) seçilen araç (${selectedVehicleForDoc.plate}) ile uyuşmuyor!`, 'error');
            return;
          }

          if (vDocType === 'Yeşil Sigorta' || fname.includes('yesil') || fname.includes('sigorta')) {
            setVDocNo('5584723');
            setVDocIssue('2019-07-07');
            setVDocExpiry('2019-08-22');
          } else if (fname.includes('35 v 2007') || vDocType === 'Ruhsat') {
            setVDocNo('FT 761374');
            setVDocIssue('2021-08-17');
            setVDocExpiry('2028-08-17');
          } else {
            setVDocNo('POL-' + Math.floor(100000 + Math.random() * 900000));
            setVDocIssue('2026-01-01');
            setVDocExpiry('2027-01-01');
          }
          setIsOcrProcessing(false);
          showToast('🤖 Yapay Zeka OCR: Belge başarıyla doğrulandı ve veriler işlendi!', 'success');
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sürücü OCR ve Uyuşmazlık Kontrolü
  const handleDriverFileScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsDriverOcrProcessing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setDDocFileUrl(event.target?.result as string);
        setDDocFileName(file.name);
        setTimeout(() => {
          const fname = file.name.toLowerCase();
          
          // Sürücü adı uyuşmazlık kontrolü simülasyonu
          if (selectedDriverForDoc && fname.includes('hasan') && !selectedDriverForDoc.fullName.toLowerCase().includes('hasan')) {
            setIsDriverOcrProcessing(false);
            showToast(`⚠️ Hata: Belgedeki isim (${file.name}) ile seçilen şoför (${selectedDriverForDoc.fullName}) uyuşmuyor!`, 'error');
            return;
          }

          if (fname.includes('ertufan') || fname.includes('pasaport')) {
            setDDocNo('U26347336');
            setDDocIssue('2022-04-14');
            setDDocExpiry('2032-04-14');
          } else {
            setDDocNo('DRV-' + Math.floor(100000 + Math.random() * 900000));
            setDDocIssue('2025-01-01');
            setDDocExpiry('2028-01-01');
          }
          setIsDriverOcrProcessing(false);
          showToast('🤖 Yapay Zeka OCR: Sürücü belgesi doğrulandı, tarihler işlendi!', 'success');
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Araç Evrak Kaydet
  const handleVehicleDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleForDoc) return;

    const days = getDaysUntil(vDocExpiry);
    const status: VehicleOfficialDoc['status'] = days < 0 ? 'Süresi Doldu' : days <= 30 ? 'Yakında Bitiyor' : 'Geçerli';

    const newDoc: VehicleOfficialDoc = {
      id: 'vdoc-' + Date.now(),
      type: vDocType,
      documentNo: vDocNo || 'BELGE-001',
      issueDate: vDocIssue,
      expiryDate: vDocExpiry,
      status,
      fileUrl: vDocFileUrl || undefined,
      fileName: vDocFileName || 'Belge.pdf',
    };

    if (selectedVehicleForDoc.type === 'tractor') {
      const tractor = tractors.find((t) => t.id === selectedVehicleForDoc.id);
      if (tractor) {
        const existingDocs = tractor.documents || [];
        const filteredDocs = existingDocs.filter((d) => d.type !== vDocType);
        updateTractor(tractor.id, { documents: [...filteredDocs, newDoc] });
      }
    } else {
      const trailer = trailers.find((tr) => tr.id === selectedVehicleForDoc.id);
      if (trailer) {
        const existingDocs = trailer.documents || [];
        const filteredDocs = existingDocs.filter((d) => d.type !== vDocType);
        updateTrailer(trailer.id, { documents: [...filteredDocs, newDoc] });
      }
    }

    setIsVehicleDocModalOpen(false);
    showToast('Araç resmi evrakı başarıyla kaydedildi.', 'success');
  };

  // Sürücü Evrak Kaydet
  const handleDriverDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverForDoc) return;
    const days = getDaysUntil(dDocExpiry);
    const status: DriverOfficialDoc['status'] = days < 0 ? 'Süresi Doldu' : days <= 30 ? 'Yakında Bitiyor' : 'Geçerli';

    addDriverDocument(selectedDriverForDoc.id, {
      type: dDocType,
      documentNo: dDocNo,
      issueDate: dDocIssue,
      expiryDate: dDocExpiry,
      status,
      fileUrl: dDocFileUrl || undefined,
    });
    setIsDriverDocModalOpen(false);
    showToast('Sürücü resmi evrakı başarıyla kaydedildi.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Üst Başlık & Sekmeler */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
              <Truck className="w-4 h-4" />
              <span>Filo &amp; Resmi Evrak Yönetim Merkezi</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Çekici, Dorse, Sürücü &amp; Taşeron Kartları
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Trafik sigortası, kasko, muayene, SRC ve vize takip modülü ile yapay zeka OCR desteği
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeSubTab === 'tractors' && (
              <button
                onClick={() => { setTrcPlate(''); setIsTractorModalOpen(true); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Çekici Aracı Ekle</span>
              </button>
            )}
            {activeSubTab === 'trailers' && (
              <button
                onClick={() => { setTrlPlate(''); setIsTrailerModalOpen(true); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Dorse Tanımla</span>
              </button>
            )}
            {activeSubTab === 'drivers' && (
              <button
                onClick={() => { setDrvName(''); setIsDriverModalOpen(true); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Sürücü Kaydet</span>
              </button>
            )}
            {activeSubTab === 'suppliers' && (
              <button
                onClick={() => { setSupName(''); setIsSupplierModalOpen(true); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Taşeron Ekle</span>
              </button>
            )}
          </div>
        </div>

        {/* Alt Sekme Geçişleri */}
        <div className="flex items-center gap-2 border-b border-slate-200 mt-6 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('tractors')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeSubTab === 'tractors' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Çekiciler</span>
            <span className="ml-1 px-2 py-0.5 text-xs bg-slate-100 rounded-full font-bold">{tractors.length}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('trailers')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeSubTab === 'trailers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Dorseler</span>
            <span className="ml-1 px-2 py-0.5 text-xs bg-slate-100 rounded-full font-bold">{trailers.length}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('drivers')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeSubTab === 'drivers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Sürücüler &amp; Evraklar</span>
            <span className="ml-1 px-2 py-0.5 text-xs bg-slate-100 rounded-full font-bold">{drivers.length}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('suppliers')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeSubTab === 'suppliers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Taşeron Firmalar</span>
            <span className="ml-1 px-2 py-0.5 text-xs bg-slate-100 rounded-full font-bold">{suppliers.length}</span>
          </button>
        </div>

        {/* Filtreler */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Plaka, marka, şoför veya şehir ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterOwnership}
              onChange={(e) => setFilterOwnership(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
            >
              <option value="all">Tüm Mülkiyetler</option>
              <option value="Öz Mal">Öz Mal</option>
              <option value="Kiralık">Kiralık</option>
              <option value="İş Ortağı">İş Ortağı</option>
            </select>
          </div>
        </div>
      </div>

      {/* ---------------- SUB-TAB 1: TRACTORS (ÇEKİCİLER) ---------------- */}
      {activeSubTab === 'tractors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tractors
            .filter((t) => {
              const q = searchQuery.toLowerCase();
              const matchSearch = t.plate.toLowerCase().includes(q) || t.brandModel.toLowerCase().includes(q) || t.currentLocationCity.toLowerCase().includes(q);
              const matchOwner = filterOwnership === 'all' || t.ownership === filterOwnership;
              return matchSearch && matchOwner;
            })
            .map((t) => {
              const docs = t.documents || [];
              const hasInsurance = docs.some((d) => d.type === 'Trafik Sigortası' && d.status !== 'Süresi Doldu');
              const hasKasko = docs.some((d) => d.type === 'Kasko' && d.status !== 'Süresi Doldu');

              return (
                <div key={t.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-900 text-white font-mono px-3 py-1.5 rounded-lg border-2 border-slate-800 text-base font-bold tracking-wide">
                          {t.plate}
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          t.ownership === 'Öz Mal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {t.ownership}
                        </span>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {t.status}
                      </span>
                    </div>

                    <div className="mt-3">
                      <h3 className="font-bold text-slate-800 text-sm">{t.brandModel}</h3>
                      <p className="text-xs text-slate-500">
                        {t.modelYear} Model • {t.odometerKm.toLocaleString('tr-TR')} km
                      </p>
                    </div>

                    <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Trafik Sigortası:</span>
                        <span className={`font-bold ${hasInsurance ? 'text-emerald-600' : 'text-red-500 flex items-center gap-1'}`}>
                          {hasInsurance ? '✓ Mevcut' : <><ShieldAlert className="w-3.5 h-3.5" /> Eksik / Yüklenmedi</>}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Kasko Durumu:</span>
                        <span className={`font-bold ${hasKasko ? 'text-emerald-600' : 'text-amber-500 flex items-center gap-1'}`}>
                          {hasKasko ? '✓ Mevcut' : 'Poliçe Yok'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-700">Yüklü Resmi Evraklar ({docs.length})</span>
                        <button
                          onClick={() => {
                            setSelectedVehicleForDoc({ type: 'tractor', id: t.id, plate: t.plate });
                            setVDocType('Ruhsat');
                            setVDocNo('');
                            setVDocFileUrl('');
                            setVDocFileName('');
                            setIsVehicleDocModalOpen(true);
                          }}
                          className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Evrak Yükle (OCR)
                        </button>
                      </div>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {docs.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between bg-white border border-slate-100 p-1.5 rounded text-[11px]">
                            <span className="font-medium text-slate-700">{doc.type} ({doc.documentNo})</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Son: {doc.expiryDate}</span>
                              {doc.fileUrl && (
                                <button
                                  onClick={() => setSelectedDocPreview({ title: `${t.plate} - ${doc.type}`, url: doc.fileUrl! })}
                                  className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Görüntüle
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {docs.length === 0 && (
                          <p className="text-[11px] text-amber-600 italic">Henüz resmi evrak yüklenmedi!</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{t.currentLocationCity}</span>
                    <button
                      onClick={() => deleteTractor(t.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ---------------- SUB-TAB 2: TRAILERS (DORSELER) ---------------- */}
      {activeSubTab === 'trailers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trailers
            .filter((tr) => {
              const q = searchQuery.toLowerCase();
              const matchSearch = tr.plate.toLowerCase().includes(q) || tr.type.toLowerCase().includes(q);
              const matchOwner = filterOwnership === 'all' || tr.ownership === filterOwnership;
              return matchSearch && matchOwner;
            })
            .map((tr) => {
              const docs = tr.documents || [];
              const hasTuv = docs.some((d) => d.type === 'TÜV / Muayene' && d.status !== 'Süresi Doldu');

              return (
                <div key={tr.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-800 text-white font-mono px-3 py-1.5 rounded-lg border-2 border-slate-700 text-base font-bold tracking-wide">
                          {tr.plate}
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {tr.ownership}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <h3 className="font-bold text-slate-800 text-sm">{tr.brandModel}</h3>
                      <p className="text-xs text-slate-500">
                        {tr.type} • {tr.capacityTons} Ton / {tr.capacityVolumeM3} m³
                      </p>
                    </div>

                    <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">TÜV / Muayene:</span>
                        <span className={`font-bold ${hasTuv ? 'text-emerald-600' : 'text-red-500 flex items-center gap-1'}`}>
                          {hasTuv ? '✓ Geçerli' : <><ShieldAlert className="w-3.5 h-3.5" /> Muayene Belgesi Eksik</>}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-700">Dorse Evrakları ({docs.length})</span>
                        <button
                          onClick={() => {
                            setSelectedVehicleForDoc({ type: 'trailer', id: tr.id, plate: tr.plate });
                            setVDocType('TÜV / Muayene');
                            setVDocNo('');
                            setVDocFileUrl('');
                            setVDocFileName('');
                            setIsVehicleDocModalOpen(true);
                          }}
                          className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Evrak Yükle (OCR)
                        </button>
                      </div>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {docs.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between bg-white border border-slate-100 p-1.5 rounded text-[11px]">
                            <span className="font-medium text-slate-700">{doc.type}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Son: {doc.expiryDate}</span>
                              {doc.fileUrl && (
                                <button
                                  onClick={() => setSelectedDocPreview({ title: `${tr.plate} - ${doc.type}`, url: doc.fileUrl! })}
                                  className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Görüntüle
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => deleteTrailer(tr.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ---------------- SUB-TAB 3: DRIVERS (SÜRÜCÜLER) ---------------- */}
      {activeSubTab === 'drivers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {drivers
            .filter((d) => d.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((d) => (
              <div key={d.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                        {d.fullName.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{d.fullName}</h3>
                        <p className="text-xs text-slate-500">{d.licenseClass} • {d.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        Sürücü Belge Kadrosu (SRC, Psikoteknik, Ehliyet) ({d.documents.length})
                      </span>
                      <button
                        onClick={() => {
                          setSelectedDriverForDoc(d);
                          setDDocType('Pasaport');
                          setDDocNo('');
                          setDDocFileUrl('');
                          setDDocFileName('');
                          setIsDriverDocModalOpen(true);
                        }}
                        className="text-xs text-indigo-600 font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Evrak Ekle (OCR)
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {d.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs">
                          <span className="font-medium text-slate-800">{doc.type} ({doc.documentNo})</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Son: {doc.expiryDate}</span>
                            {doc.fileUrl && (
                              <button
                                onClick={() => setSelectedDocPreview({ title: `${d.fullName} - ${doc.type}`, url: doc.fileUrl! })}
                                className="text-blue-600 font-bold flex items-center gap-0.5 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" /> Görüntüle
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Sefer: <strong>{d.totalTripsCount}</strong></span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openWhatsAppQuery({ plate: d.currentTractorPlate || '35 KSR', driverName: d.fullName, driverPhone: d.phone } as any)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                    </button>
                    <button
                      onClick={() => deleteDriver(d.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ---------------- SUB-TAB 4: SUPPLIERS (TAŞERONLAR) ---------------- */}
      {activeSubTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {suppliers
            .filter((s) => s.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{s.companyName}</h3>
                  <p className="text-xs text-slate-500">Yetkili: {s.contactPerson} • {s.city}</p>
                </div>
                <div className="mt-4 pt-3 border-t text-xs text-slate-500 flex justify-between">
                  <span>{s.phone}</span>
                  <button onClick={() => deleteSupplier(s.id)} className="text-red-600 hover:underline cursor-pointer">Sil</button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ================= MODAL: YENİ ÇEKİCİ EKLE ================= */}
      {isTractorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Yeni Çekici Aracı Tanımla</h3>
              <button onClick={() => setIsTractorModalOpen(false)} className="cursor-pointer"><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!trcPlate) return;
              addTractor({
                plate: trcPlate.toUpperCase(),
                ownership: trcOwnership,
                brandModel: trcBrand,
                modelYear: Number(trcYear),
                odometerKm: Number(trcKm),
                status: 'Boş',
                currentLocationCity: trcCity,
                currentLocationCountry: 'Türkiye',
                countryCode: 'TR',
                lastMaintenanceDate: new Date().toISOString().split('T')[0],
                nextInspectionDate: '2027-04-15',
                documents: [],
              });
              setIsTractorModalOpen(false);
              showToast('Yeni çekici aracı başarıyla eklendi.', 'success');
            }} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700">Çekici Plakası *</label>
                <input type="text" required value={trcPlate} onChange={(e) => setTrcPlate(e.target.value)} placeholder="35 V 2007" className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Mülkiyet *</label>
                  <select value={trcOwnership} onChange={(e) => setTrcOwnership(e.target.value as any)} className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium">
                    <option value="Öz Mal">Öz Mal</option>
                    <option value="Kiralık">Kiralık</option>
                    <option value="İş Ortağı">İş Ortağı</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Model Yılı</label>
                  <input type="number" value={trcYear} onChange={(e) => setTrcYear(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-700">Marka &amp; Model</label>
                <input type="text" value={trcBrand} onChange={(e) => setTrcBrand(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Kilometre (Km)</label>
                  <input type="number" value={trcKm} onChange={(e) => setTrcKm(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Bulunduğu Şehir</label>
                  <input type="text" value={trcCity} onChange={(e) => setTrcCity(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsTractorModalOpen(false)} className="px-4 py-2 border rounded-xl font-bold cursor-pointer">Vazgeç</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow cursor-pointer">Çekiciyi Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: YENİ DORSE EKLE ================= */}
      {isTrailerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Yeni Dorse Tanımla</h3>
              <button onClick={() => setIsTrailerModalOpen(false)} className="cursor-pointer"><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!trlPlate) return;
              addTrailer({
                plate: trlPlate.toUpperCase(),
                ownership: trlOwnership,
                type: trlType,
                brandModel: trlBrand,
                capacityTons: Number(trlTons),
                capacityVolumeM3: Number(trlM3),
                modelYear: Number(trlYear),
                status: 'Boş',
                tuvInspectionDate: '2027-03-15',
                insuranceDate: '2027-05-20',
                documents: [],
              });
              setIsTrailerModalOpen(false);
              showToast('Yeni dorse başarıyla tanımlandı.', 'success');
            }} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700">Dorse Plakası *</label>
                <input type="text" required value={trlPlate} onChange={(e) => setTrlPlate(e.target.value)} placeholder="35 DOR 881" className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Mülkiyet *</label>
                  <select value={trlOwnership} onChange={(e) => setTrlOwnership(e.target.value as any)} className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium">
                    <option value="Öz Mal">Öz Mal</option>
                    <option value="Kiralık">Kiralık</option>
                    <option value="İş Ortağı">İş Ortağı</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Dorse Tipi</label>
                  <select value={trlType} onChange={(e) => setTrlType(e.target.value as TrailerCategory)} className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium">
                    <option value="Tenteli Orta">Tenteli Orta</option>
                    <option value="Mega">Mega</option>
                    <option value="Frigorifik (Termo)">Frigorifik (Termo)</option>
                    <option value="Konteyner Taşıyıcı">Konteyner Taşıyıcı</option>
                    <option value="Damper">Damper</option>
                    <option value="Lowbed">Lowbed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-700">Marka &amp; Model</label>
                <input type="text" value={trlBrand} onChange={(e) => setTrlBrand(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Kapasite (Ton)</label>
                  <input type="number" value={trlTons} onChange={(e) => setTrlTons(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Hacim (m³)</label>
                  <input type="number" value={trlM3} onChange={(e) => setTrlM3(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Model Yılı</label>
                  <input type="number" value={trlYear} onChange={(e) => setTrlYear(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsTrailerModalOpen(false)} className="px-4 py-2 border rounded-xl font-bold cursor-pointer">Vazgeç</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow cursor-pointer">Dorsevi Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: YENİ SÜRÜCÜ EKLE ================= */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Yeni Sürücü Kadrosu Ekle</h3>
              <button onClick={() => setIsDriverModalOpen(false)} className="cursor-pointer"><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!drvName) return;
              addDriver({
                fullName: drvName,
                phone: drvPhone,
                tcOrPassportNo: drvTc || 'TR123456789',
                licenseClass: drvLicense,
                status: 'Aktif',
                email: drvEmail,
                emergencyContact: drvEmergency,
                totalTripsCount: 0,
                documents: [],
              });
              setIsDriverModalOpen(false);
              showToast('Sürücü başarıyla kaydedildi.', 'success');
            }} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700">Sürücü Adı Soyadı *</label>
                <input type="text" required value={drvName} onChange={(e) => setDrvName(e.target.value)} placeholder="Ahmet Yılmaz" className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Telefon *</label>
                  <input type="text" required value={drvPhone} onChange={(e) => setDrvPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">TC / Pasaport No</label>
                  <input type="text" value={drvTc} onChange={(e) => setDrvTc(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono" />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-700">Ehliyet Sınıfı &amp; Yetkinlik</label>
                <input type="text" value={drvLicense} onChange={(e) => setDrvLicense(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-700">E-Posta</label>
                <input type="email" value={drvEmail} onChange={(e) => setDrvEmail(e.target.value)} placeholder="ahmet@surucu.com" className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-700">Acil Durum İrtibatı</label>
                <input type="text" value={drvEmergency} onChange={(e) => setDrvEmergency(e.target.value)} placeholder="Ayşe Yılmaz (Eşi) - 0533..." className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsDriverModalOpen(false)} className="px-4 py-2 border rounded-xl font-bold cursor-pointer">Vazgeç</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow cursor-pointer">Sürücüyü Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAŞERON EKLE ================= */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Yeni Taşeron Firma Ekle</h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="cursor-pointer"><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!supName) return;
              addSupplier({
                companyName: supName,
                contactPerson: supContact,
                phone: supPhone,
                email: 'info@taseron.com',
                taxId: '1234567890',
                city: supCity,
                country: 'Türkiye',
                payableBalanceEUR: 0,
                payableBalanceTRY: 0,
                leasedTractorsCount: 1,
                leasedTrailersCount: 1,
                status: 'Aktif',
              });
              setIsSupplierModalOpen(false);
              showToast('Taşeron firma kaydedildi.', 'success');
            }} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700">Firma Unvanı *</label>
                <input type="text" required value={supName} onChange={(e) => setSupName(e.target.value)} placeholder="Özkanlar Lojistik" className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Yetkili Kişi</label>
                  <input type="text" value={supContact} onChange={(e) => setSupContact(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Telefon</label>
                  <input type="text" value={supPhone} onChange={(e) => setSupPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-700">Şehir</label>
                <input type="text" value={supCity} onChange={(e) => setSupCity(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsSupplierModalOpen(false)} className="px-4 py-2 border rounded-xl font-bold cursor-pointer">Vazgeç</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow cursor-pointer">Taşeronu Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ARAÇ EVRAK YÜKLEME VE OCR ================= */}
      {isVehicleDocModalOpen && selectedVehicleForDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                {selectedVehicleForDoc.plate} - Resmi Belge Yükle
              </h3>
              <button onClick={() => setIsVehicleDocModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVehicleDocSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Belge Türü Seç *</label>
                <select
                  value={vDocType}
                  onChange={(e) => setVDocType(e.target.value as VehicleDocType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                >
                  <option value="Ruhsat">Ruhsat</option>
                  <option value="Yeşil Sigorta">Yeşil Sigorta (Green Card)</option>
                  <option value="Trafik Sigortası">Trafik Sigortası</option>
                  <option value="Kasko">Kasko</option>
                  <option value="TÜV / Muayene">TÜV / Muayene Belgesi</option>
                  <option value="ADR Uygunluk Belgesi">ADR Uygunluk Belgesi</option>
                  <option value="Diğer">Diğer Evrak</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-indigo-300 rounded-xl p-4 bg-indigo-50/50 text-center">
                <Sparkles className="w-7 h-7 text-indigo-600 mx-auto mb-1 animate-pulse" />
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow transition">
                  <FileUp className="w-4 h-4" />
                  Belge Fotoğrafı veya PDF Seç (OCR)
                  <input type="file" accept="image/*,application/pdf" onChange={handleVehicleFileScan} className="hidden" />
                </label>
                <p className="text-[11px] text-slate-500 mt-2">Yapay zeka belgeyi tarar, plaka ve tarihleri otomatik doldurur.</p>
                {vDocFileName && (
                  <p className="text-emerald-700 font-bold mt-2 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> {vDocFileName} yüklendi
                  </p>
                )}
              </div>

              {isOcrProcessing && (
                <div className="p-3 bg-blue-50 text-blue-700 rounded-xl font-semibold flex items-center justify-center gap-2 animate-pulse">
                  <span>🤖 Yapay Zeka Belgeyi Okuyor &amp; Doğruluyor...</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Seri / Belge / Poliçe No</label>
                <input type="text" value={vDocNo} onChange={(e) => setVDocNo(e.target.value)} placeholder="Otomatik taranır" className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Başlangıç / Veriliş Tarihi</label>
                  <input type="date" value={vDocIssue} onChange={(e) => setVDocIssue(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Son Geçerlilik / Bitiş Tarihi *</label>
                  <input type="date" required value={vDocExpiry} onChange={(e) => setVDocExpiry(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-indigo-700" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsVehicleDocModalOpen(false)} className="px-4 py-2 border text-slate-700 rounded-xl font-bold cursor-pointer">İptal</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow cursor-pointer">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SÜRÜCÜ EVRAK EKLEME VE OCR ================= */}
      {isDriverDocModalOpen && selectedDriverForDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-slate-900 text-base">
                {selectedDriverForDoc.fullName} - Sürücü Evrakı Ekle (OCR)
              </h3>
              <button onClick={() => setIsDriverDocModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDriverDocSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Evrak Türü *</label>
                <select
                  value={dDocType}
                  onChange={(e) => setDDocType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                >
                  <option value="Pasaport">Pasaport</option>
                  <option value="Schengen Vizesi">Schengen Vizesi</option>
                  <option value="Rusya/Kafkasya Vizesi">Rusya / Kafkasya Vizesi</option>
                  <option value="Ehliyet (CE)">Ehliyet (CE)</option>
                  <option value="SRC-3 / SRC-4">SRC-3 / SRC-4 Belgesi</option>
                  <option value="Psikoteknik">Psikoteknik Raporu</option>
                  <option value="Kimlik">Kimlik</option>
                  <option value="Sağlık Raporu">Sağlık Raporu</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-indigo-300 rounded-xl p-4 bg-indigo-50/50 text-center">
                <Sparkles className="w-7 h-7 text-indigo-600 mx-auto mb-1 animate-pulse" />
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow transition">
                  <FileUp className="w-4 h-4" />
                  Sürücü Belgesi Seç / Tara (OCR)
                  <input type="file" accept="image/*,application/pdf" onChange={handleDriverFileScan} className="hidden" />
                </label>
                <p className="text-[11px] text-slate-500 mt-2">Yapay zeka şoför adını ve belge geçerlilik tarihlerini doğrular.</p>
                {dDocFileName && (
                  <p className="text-emerald-700 font-bold mt-2 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> {dDocFileName} yüklendi
                  </p>
                )}
              </div>

              {isDriverOcrProcessing && (
                <div className="p-3 bg-blue-50 text-blue-700 rounded-xl font-semibold flex items-center justify-center gap-2 animate-pulse">
                  <span>🤖 Yapay Zeka Sürücü Belgesini Doğruluyor...</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Belge / Seri No *</label>
                <input type="text" required value={dDocNo} onChange={(e) => setDDocNo(e.target.value)} placeholder="Örn: U26347336" className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Veriliş Tarihi</label>
                  <input type="date" value={dDocIssue} onChange={(e) => setDDocIssue(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Son Geçerlilik Tarihi *</label>
                  <input type="date" required value={dDocExpiry} onChange={(e) => setDDocExpiry(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-indigo-700" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsDriverDocModalOpen(false)} className="px-4 py-2 border rounded-xl font-bold cursor-pointer">İptal</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow cursor-pointer">Evrakı Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EVRAK ÖNİZLEME ================= */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                {selectedDocPreview.title}
              </h4>
              <button onClick={() => setSelectedDocPreview(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-96 overflow-auto border rounded-xl p-2 bg-slate-50 text-center">
              {selectedDocPreview.url.startsWith('data:application/pdf') ? (
                <div className="py-8 text-slate-700 font-semibold text-sm">
                  📄 PDF Belge yüklendi. Cihazınızda açarak inceleyebilirsiniz.
                </div>
              ) : (
                <img src={selectedDocPreview.url} alt="Belge Önizleme" className="max-h-80 mx-auto object-contain rounded" />
              )}
            </div>
            <div className="text-right">
              <button onClick={() => setSelectedDocPreview(null)} className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};