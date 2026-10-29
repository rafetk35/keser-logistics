import React, { useState } from 'react';
import {
  X,
  Database,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  HardDrive,
  Cloud,
  FileCode,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BackupRestoreModal: React.FC = () => {
  const {
    isBackupRestoreModalOpen,
    setIsBackupRestoreModalOpen,
    exportBackupJson,
    restoreBackupJson,
    trips,
    invoices,
    contracts,
    tractors,
    trailers,
    drivers,
    customers,
    suppliers,
    showToast,
  } = useApp();

  const [restoreJsonText, setRestoreJsonText] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [activeTab, setActiveTab] = useState<'backup' | 'restore'>('backup');

  if (!isBackupRestoreModalOpen) return null;

  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `Keser_Lojistik_Yedek_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Veritabanı tam sistem yedeği başarıyla indirildi.', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        showToast('Hata: Sadece .json uzantılı yedek dosyası seçebilirsiniz.', 'error');
        return;
      }
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setRestoreJsonText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleExecuteRestore = () => {
    if (!restoreJsonText) {
      showToast('Lütfen önce bir yedek dosyası seçin veya JSON verisini yapıştırın.', 'error');
      return;
    }
    const success = restoreBackupJson(restoreJsonText);
    if (success) {
      setConfirmRestore(false);
      setIsBackupRestoreModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-300">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Veri Kalıcılığı, Yedekleme ve Geri Yükleme</h2>
              <p className="text-xs text-blue-200">
                Supabase Bulut Senkronizasyonu &amp; Tam JSON Veritabanı Yedekleme
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBackupRestoreModalOpen(false)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3">
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'backup'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            Veritabanı Yedeğini İndir
          </button>
          <button
            onClick={() => setActiveTab('restore')}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'restore'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            Yedekten Geri Yükle (Restore)
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'backup' ? (
            <div className="space-y-6">
              {/* Cloud Sync Status */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">
                      Supabase Canlı Bulut Kalıcılığı
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      Tüm cari hesaplar, seferler, faturalar ve evraklar eş zamanlı olarak Supabase bulutunda şifreli olarak korunur.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-200 text-emerald-800 font-bold text-[10px] rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                  CANLI SENKRON
                </span>
              </div>

              {/* Current Data Counts */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Yedeklenecek Veritabanı Tabloları
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-base font-extrabold text-blue-900">{trips.length}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">Aktif/Biten Sefer</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-base font-extrabold text-blue-900">{invoices.length}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">Fatura / Muhasebe</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-base font-extrabold text-blue-900">{contracts.length}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">Taşıma Sözleşmesi</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-base font-extrabold text-blue-900">{customers.length + suppliers.length}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">Cari &amp; Tedarikçi</div>
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all"
                >
                  <Download className="w-5 h-5" />
                  Tam Veritabanı Yedeğini İndir (.JSON)
                </button>
                <p className="text-xs text-slate-400 mt-2">
                  İndirilen dosya tüm filo ayarlarını, cari kayıtları ve onay belgelerini kapsar.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Restore Warning */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    Yedekten Geri Yükleme Uyarısı
                  </h4>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Geri yükleme işlemi mevcut uygulama verilerinin üzerine yazar. Lütfen geçerli bir Keser Lojistik JSON yedek dosyası yükleyin.
                  </p>
                </div>
              </div>

              {/* Upload File Area */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                <FileCode className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg cursor-pointer shadow transition-all">
                  <Upload className="w-4 h-4" />
                  Yedek Dosyası Seç (.json)
                  <input
                    type="file"
                    accept="application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {selectedFileName && (
                  <p className="text-xs font-semibold text-emerald-700 mt-3 flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Seçilen Dosya: {selectedFileName}
                  </p>
                )}
              </div>

              {/* Confirmation checkbox */}
              {restoreJsonText && (
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmRestore}
                      onChange={(e) => setConfirmRestore(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    Yedek dosyasındaki kayıtların mevcut verilerin üzerine yazılmasını onaylıyorum.
                  </label>

                  <button
                    type="button"
                    disabled={!confirmRestore}
                    onClick={handleExecuteRestore}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm shadow transition-all ${
                      confirmRestore
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Geri Yüklemeyi Başlat ve Veritabanını Güncelle
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <span>Veri kaybını önlemek için düzenli aralıklarla yedek almanız önerilir.</span>
          </div>
          <button
            onClick={() => setIsBackupRestoreModalOpen(false)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
