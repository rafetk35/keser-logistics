import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, Truck, Layers, MapPin, Clock, ArrowRight, Plus, Upload, CheckCircle, AlertCircle, FileText, Eye, Radio, Lock, X } from 'lucide-react';
import { Tractor } from '../../types';

export const SupplierPortal: React.FC = () => {
  const { currentUser, suppliers, tractors, trailers, trips, addTractor, updateTractor, setTractorAvailability, showToast } = useApp();

  const activeSupplier = suppliers.find((s) => s.id === currentUser.linkedSupplierId) || suppliers.find((s) => s.companyName.toLowerCase().includes(currentUser.name.toLowerCase())) || suppliers[0];

  const leasedTractors = tractors.filter((t) => t.ownership === 'Kiralık' && (t.supplierName === activeSupplier?.companyName || !t.supplierName));
  const leasedTrailers = trailers.filter((tr) => tr.ownership === 'Kiralık' && (tr.supplierName === activeSupplier?.companyName || !tr.supplierName));
  const supplierTrips = trips.filter((t) => t.ownership === 'Kiralık');

  const [isAddTruckModalOpen, setIsAddTruckModalOpen] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newBrandModel, setNewBrandModel] = useState('Ford F-Max 500');
  const [newVehicleType, setNewVehicleType] = useState('Çekici');
  const [newModelYear, setNewModelYear] = useState(2023);
  const [registrationDocUrl, setRegistrationDocUrl] = useState('');
  const [selectedRuhsatPreview, setSelectedRuhsatPreview] = useState<string | null>(null);

  const handleRuhsatUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('Dosya boyutu 10 MB sınırını aşamaz.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setRegistrationDocUrl(event.target?.result as string);
        showToast('Ruhsat görseli başarıyla yüklendi.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateTruck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate.trim()) {
      showToast('Lütfen araç plakasını girin.', 'error');
      return;
    }
    if (!registrationDocUrl) {
      showToast('Lojistik mevzuatı gereği iş ortağı araçları için Ruhsat Görseli zorunludur.', 'warning');
      return;
    }

    addTractor({
      plate: newPlate.toUpperCase().trim(),
      ownership: 'Kiralık',
      brandModel: `${newBrandModel} (${newVehicleType})`,
      modelYear: newModelYear,
      odometerKm: 250000,
      status: 'Boş',
      supplierName: activeSupplier?.companyName || 'İş Ortağı Firma',
      currentLocationCity: 'İstanbul',
      currentLocationCountry: 'Türkiye',
      countryCode: 'TR',
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      nextInspectionDate: '2027-01-01',
      registrationDocUrl,
      isEmptyAndAvailable: true,
      availableRegion: 'İstanbul / Türkiye',
      fuelNormPer100Km: 29.5,
      notes: 'İş Ortağı Portalı üzerinden ruhsat görseliyle eklendi.',
    });

    setIsAddTruckModalOpen(false);
    setNewPlate('');
    setRegistrationDocUrl('');
    showToast(`${newPlate.toUpperCase()} plakalı kiralık araç ruhsat görseliyle başarıyla kaydedildi.`, 'success');
  };

  const handleToggleAvailability = (trc: Tractor) => {
    const targetStatus = !trc.isEmptyAndAvailable;
    const currentLoc = trc.currentLocationCity || 'İstanbul';
    setTractorAvailability(trc.id, targetStatus, `${currentLoc} / Türkiye`);
    showToast(targetStatus ? `${trc.plate} plakalı araç boş olarak işaretlendi ve Keser Operasyon ekibine bildirildi.` : `${trc.plate} plakalı araç meşgul olarak güncellendi.`, 'success');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/30 border border-indigo-400 text-white flex items-center justify-center font-bold text-xl">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-300">
                Keser Uluslararası İş Ortağı &amp; Kiralık Filo Portalı
              </span>
              <h1 className="text-2xl font-black">{activeSupplier?.companyName}</h1>
              <p className="text-xs text-slate-300">
                Yetkili: {activeSupplier?.contactPerson} • {activeSupplier?.city}, {activeSupplier?.country} • VKN / Vergi No: <strong className="text-indigo-200">{activeSupplier?.taxId || activeSupplier?.vkn || 'Belirtilmemiş'}</strong>
              </p>
            </div>
          </div>

          <div className="text-right bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/15 min-w-[240px] space-y-1.5 font-mono">
            <span className="text-[10px] text-indigo-200 uppercase block font-bold tracking-wider font-sans">
              Alacak / Hak Ediş Bakiyeniz
            </span>
            <div className="flex items-center justify-between gap-4 text-xs font-bold text-white">
              <span className="font-semibold text-slate-300 font-sans">EUR Hak Ediş:</span>
              <span className="text-emerald-300">{(activeSupplier?.payableBalanceEUR || 3200).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} €</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs font-bold text-cyan-300 border-t border-white/10 pt-1">
              <span className="font-semibold text-slate-300 font-sans">USD Hak Ediş:</span>
              <span>0,00 $</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs font-bold text-amber-300 border-t border-white/10 pt-1">
              <span className="font-semibold text-slate-300 font-sans">TRY Hak Ediş:</span>
              <span>{(activeSupplier?.payableBalanceTRY || 85000).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 rounded-xl text-amber-700">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-amber-950 text-sm">Boştaki Araç Bildirimi (Anlık Yük Eşleştirme)</h3>
            <p className="text-xs text-amber-800 mt-0.5">Boşta olan aracınızın bulunduğu bölgeyi bildirin. Keser Uluslararası Operasyon Sorumluları gelen yük talepleriyle aracınızı doğrudan eşleştirsin.</p>
            <div className="text-[11px] text-amber-900/70 flex items-center gap-1.5 mt-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Bu bildirimleri yalnızca siz, Keser Operasyon Yöneticileri ve Admin görebilir.</span>
            </div>
          </div>
        </div>
        <button onClick={() => setIsAddTruckModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap cursor-pointer">
          <Plus className="w-4 h-4" />
          Kiralık Araç Ekle (Sadece Ruhsat)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Kiralık Araçlarınız / Çekiciler ({leasedTractors.length})</h3>
            </div>
            <span className="text-[11px] text-slate-400">Sadece Ruhsat Belgesi Yeterlidir</span>
          </div>
          <div className="space-y-3">
            {leasedTractors.map((trc) => (
              <div key={trc.id} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-slate-900 text-sm block">{trc.plate}</span>
                    <span className="text-slate-500">{trc.brandModel} ({trc.modelYear})</span>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${trc.isEmptyAndAvailable ? 'bg-emerald-100 text-emerald-800' : trc.status === 'Yolda' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'}`}>
                      {trc.isEmptyAndAvailable ? '🟢 BOŞTA / YÜK BEKLİYOR' : trc.status}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Konum: {trc.availableRegion || trc.currentLocationCity}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                  <div>
                    {trc.registrationDocUrl ? (
                      <button type="button" onClick={() => setSelectedRuhsatPreview(trc.registrationDocUrl!)} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer">
                        <FileText className="w-3.5 h-3.5" />
                        Ruhsatı Gör
                      </button>
                    ) : (
                      <span className="text-amber-600 font-medium">Ruhsat Bekleniyor</span>
                    )}
                  </div>
                  <div>
                    <button type="button" onClick={() => handleToggleAvailability(trc)} className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${trc.isEmptyAndAvailable ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                      {trc.isEmptyAndAvailable ? '✓ Boşta Bildirildi' : 'Boşta Olarak Bildir'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Kiraya Verilen Dorseler ({leasedTrailers.length})</h3>
            </div>
          </div>
          <div className="space-y-3">
            {leasedTrailers.map((trl) => (
              <div key={trl.id} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-900 block text-sm">{trl.plate}</span>
                  <span className="text-slate-500">{trl.type} • {trl.brandModel}</span>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${trl.status === 'Yolda' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {trl.status}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{trl.capacityTons} Ton Kapasite</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          Ekipmanlarınızın Çalıştığı Seferler &amp; Rotalar
        </h3>
        <div className="space-y-3">
          {supplierTrips.map((trip) => (
            <div key={trip.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2 font-mono font-bold text-slate-900 text-sm">
                  <span>{trip.cmrNo}</span>
                  <span className="text-xs text-slate-500 font-sans font-normal">({trip.customerName})</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-slate-700 font-semibold">
                  <span>{trip.originCity}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{trip.destinationCity}</span>
                </div>
                <div className="text-slate-500 mt-0.5">
                  Araç/Çekici: <strong className="font-mono">{trip.tractorPlate}</strong> / Dorse: <strong className="font-mono">{trip.trailerPlate}</strong> • Şoför: {trip.driverName}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 inline-block mb-1">{trip.status}</span>
                <div className="text-slate-600">Tahmini Varış: <strong>{trip.etaDate}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isAddTruckModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                Araç Kaydı
              </h3>
              <button onClick={() => setIsAddTruckModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-800">
              💡 <strong>İş Ortağı Kolaylığı:</strong> Kiralık araçlar için SRC veya periyodik diğer süreli evraklar talep edilmez. Sadece <strong>Ruhsat Görseli</strong> yüklemeniz yeterlidir.
            </div>

            <form onSubmit={handleCreateTruck} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Araç / Çekici Plakası *</label>
                <input type="text" required placeholder="34 ABC 123" value={newPlate} onChange={(e) => setNewPlate(e.target.value)} className="w-full px-3 py-2 text-sm font-mono uppercase font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Marka &amp; Model</label>
                  <input type="text" value={newBrandModel} onChange={(e) => setNewBrandModel(e.target.value)} placeholder="Ford F-Max / Mercedes" className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ticari Cins (Araç Cinsi)</label>
                  <select value={newVehicleType} onChange={(e) => setNewVehicleType(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none bg-white font-medium">
                    <option value="Çekici">Çekici (Tractor)</option>
                    <option value="Kamyon">Kamyon</option>
                    <option value="Kamyonet">Kamyonet</option>
                    <option value="Tır">Tır</option>
                    <option value="Dorse">Dorse</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Model Yılı</label>
                <input type="number" value={newModelYear} onChange={(e) => setNewModelYear(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none" />
              </div>

              <div className="border-2 border-dashed border-indigo-300 rounded-xl p-4 bg-indigo-50/40 text-center">
                <FileText className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow transition-all">
                  <Upload className="w-4 h-4" />
                  Ruhsat Görseli Yükle (Fotoğraf / PDF)
                  <input type="file" accept="image/*,application/pdf" onChange={handleRuhsatUpload} className="hidden" />
                </label>
                {registrationDocUrl && (
                  <p className="text-xs text-emerald-700 font-bold mt-2 flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Ruhsat görseli başarıyla yüklendi
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddTruckModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 cursor-pointer">
                  İptal
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow cursor-pointer">
                  Aracı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedRuhsatPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Araç Ruhsat Belgesi
              </h4>
              <button onClick={() => setSelectedRuhsatPreview(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-96 overflow-auto border rounded-xl p-2 bg-slate-50">
              <img src={selectedRuhsatPreview} alt="Ruhsat Belgesi" className="max-h-80 mx-auto object-contain rounded" />
            </div>
            <div className="text-right">
              <button onClick={() => setSelectedRuhsatPreview(null)} className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};