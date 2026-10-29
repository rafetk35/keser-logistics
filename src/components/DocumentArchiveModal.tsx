import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Upload,
  Camera,
  X,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  Check,
  Calendar,
  User,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FolderOpen,
  Image as ImageIcon,
  Receipt,
  Truck,
  Plus,
} from 'lucide-react';
import { ArchivedDocument, DocumentType } from '../types';

export const DocumentArchiveModal: React.FC = () => {
  const {
    documents,
    addDocument,
    deleteDocument,
    activeDocumentPreview,
    setActiveDocumentPreview,
    isDocumentUploadModalOpen,
    closeDocumentUpload,
    documentUploadTarget,
    trips,
    expenses,
    vehicles,
    currentUser,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'upload' | 'browse'>('upload');

  // Form states
  const [formTitle, setFormTitle] = useState(
    documentUploadTarget?.referenceNo
      ? `${documentUploadTarget.referenceNo} - Evrak / Fiş`
      : 'Yeni Sefer Evrakı'
  );
  const [formType, setFormType] = useState<DocumentType>(
    documentUploadTarget?.defaultType || 'CMR / Taşıma Belgesi'
  );
  const [formReferenceNo, setFormReferenceNo] = useState(
    documentUploadTarget?.referenceNo || ''
  );
  const [formRelatedType, setFormRelatedType] = useState<
    'trip' | 'expense' | 'vehicle' | 'driver' | 'customer' | 'general'
  >(documentUploadTarget?.relatedEntityType || 'trip');
  const [formRelatedId, setFormRelatedId] = useState(
    documentUploadTarget?.relatedEntityId || trips[0]?.id || ''
  );
  const [formNotes, setFormNotes] = useState('');
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');

  // Browse filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Image viewer zoom & rotate
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isDocumentUploadModalOpen && !activeDocumentPreview) return null;

  // Handle file selection from disk or camera
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');

    if (!formTitle || formTitle === 'Yeni Sefer Evrakı') {
      setFormTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!previewDataUrl) {
      showToast('Lütfen bir belge görseli veya PDF dosyası seçin.', 'warning');
      return;
    }

    addDocument({
      title: formTitle || 'Evrak ' + Date.now(),
      type: formType,
      relatedEntityType: formRelatedType,
      relatedEntityId: formRelatedId,
      relatedReferenceNo: formReferenceNo,
      uploadedBy: currentUser.name,
      fileUrl: previewDataUrl,
      fileName: fileName || 'belge.jpg',
      fileSize: fileSize || '1.2 MB',
      notes: formNotes,
    });

    // Reset and close
    setPreviewDataUrl('');
    setFileName('');
    closeDocumentUpload();
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.relatedReferenceNo && doc.relatedReferenceNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.notes && doc.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || doc.type === filterType;

    return matchesSearch && matchesType;
  });

  const getDocTypeBadge = (t: DocumentType) => {
    switch (t) {
      case 'CMR / Taşıma Belgesi':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Gümrük Beyannamesi':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Yakıt Fişi':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Ro-Ro Gemi Bileti':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'Otoyol & Vinyet Makbuzu':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Kantar / VGM Fişi':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <>
      {/* 1. Main Document Modal (Upload & Archive Explorer) */}
      {isDocumentUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    Evrak &amp; Fiş Görsel Arşivi
                  </h2>
                  <p className="text-xs text-slate-400">
                    CMR taşıma belgeleri, gümrük beyannameleri, yakıt ve otoyol fişleri (Tüm kullanıcılar erişebilir)
                  </p>
                </div>
              </div>

              <button
                onClick={closeDocumentUpload}
                className="text-slate-400 hover:text-white p-2 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-6">
              <button
                onClick={() => setActiveTab('upload')}
                className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
                  activeTab === 'upload' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                1. Yeni Belge / Fiş Tara &amp; Yükle
                {activeTab === 'upload' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('browse')}
                className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
                  activeTab === 'browse' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                2. Tüm Arşiv Galerisi ({documents.length} Belge)
                {activeTab === 'browse' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>
            </div>

            {/* Tab 1: Upload Form */}
            {activeTab === 'upload' && (
              <form onSubmit={handleUploadSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Upload / Camera Dropzone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Evrak / Fiş Görseli veya Dosyası *
                  </label>

                  <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 text-center bg-slate-50/60 transition-colors">
                    {previewDataUrl ? (
                      <div className="space-y-3">
                        <div className="max-h-56 overflow-hidden rounded-xl border border-slate-200 bg-white flex items-center justify-center p-2 shadow-xs">
                          <img
                            src={previewDataUrl}
                            alt="Yüklenen Evrak Önizleme"
                            className="max-h-52 object-contain rounded"
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-600 px-2">
                          <span className="font-semibold text-slate-900 truncate max-w-xs">{fileName}</span>
                          <span>{fileSize}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewDataUrl('');
                              setFileName('');
                            }}
                            className="text-rose-600 hover:underline font-semibold"
                          >
                            Görseli Değiştir
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Bilgisayardan Dosya Seç</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Kameradan Çek / Tara</span>
                          </button>
                        </div>

                        <p className="text-[11px] text-slate-400">
                          JPG, PNG veya PDF formatında fatura, fiş veya CMR taraması
                        </p>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Belge Başlığı / Adı *
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Örn: Stuttgart CMR İmzalı Nüsha"
                      className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Evrak Türü *
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as DocumentType)}
                      className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                    >
                      <option value="CMR / Taşıma Belgesi">CMR / Taşıma Belgesi</option>
                      <option value="Gümrük Beyannamesi">Gümrük Beyannamesi (T1 / Deklarasyon)</option>
                      <option value="Yakıt Fişi">Yakıt Fişi / Akaryakıt Faturası</option>
                      <option value="Ro-Ro Gemi Bileti">Ro-Ro Gemi Bileti</option>
                      <option value="Otoyol & Vinyet Makbuzu">Otoyol / Vinyet / Köprü Makbuzu</option>
                      <option value="Kantar / VGM Fişi">Kantar / VGM Yükleme Fişi</option>
                      <option value="Diğer Evrak">Diğer Evrak &amp; Tutanak</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      İlişkili Referans No (CMR / Fiş No)
                    </label>
                    <input
                      type="text"
                      value={formReferenceNo}
                      onChange={(e) => setFormReferenceNo(e.target.value)}
                      placeholder="Örn: CMR-2026-081 veya SHL-BG-99812"
                      className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      İlişkili Sefer / Taşıma
                    </label>
                    <select
                      value={formRelatedId}
                      onChange={(e) => setFormRelatedId(e.target.value)}
                      className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    >
                      <option value="">Genel Evrak (Sefer Bağımsız)</option>
                      {trips.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.cmrNo} • {t.customerName} ({t.originCity} → {t.destinationCity})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Evrak Açıklaması &amp; Gümrük Notu
                  </label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    rows={2}
                    placeholder="Kaşeli nüsha, mühür numarası veya fatura detayı..."
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeDocumentUpload}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                  >
                    Evrakı Arşive Kaydet
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Browse All Archived Documents */}
            {activeTab === 'browse' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search & Filter */}
                <div className="p-4 border-b border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Evrak adı, CMR no, şoför ara..."
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-300 rounded-xl focus:outline-none bg-white font-medium"
                    >
                      <option value="all">Tüm Evrak Türleri ({documents.length})</option>
                      <option value="CMR / Taşıma Belgesi">CMR / Taşıma Belgeleri</option>
                      <option value="Gümrük Beyannamesi">Gümrük Beyannameleri</option>
                      <option value="Yakıt Fişi">Yakıt Fişleri</option>
                      <option value="Ro-Ro Gemi Bileti">Ro-Ro Gemi Biletleri</option>
                      <option value="Otoyol & Vinyet Makbuzu">Otoyol / Vinyet Makbuzları</option>
                      <option value="Kantar / VGM Fişi">Kantar / VGM Fişleri</option>
                    </select>
                  </div>
                </div>

                {/* Documents Grid */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  {filteredDocs.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      Kayıtlı evrak bulunamadı.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-2.5"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getDocTypeBadge(
                                  doc.type
                                )}`}
                              >
                                {doc.type}
                              </span>

                              {doc.fileSize && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {doc.fileSize}
                                </span>
                              )}
                            </div>

                            <div className="font-bold text-xs text-slate-900 mt-1.5 line-clamp-1">
                              {doc.title}
                            </div>

                            {doc.relatedReferenceNo && (
                              <div className="text-[11px] font-semibold text-indigo-700 mt-0.5">
                                Ref: {doc.relatedReferenceNo}
                              </div>
                            )}

                            {doc.notes && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                                {doc.notes}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                            <div>
                              <span>{doc.uploadDate}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setActiveDocumentPreview(doc)}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Görüntüle</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`"${doc.title}" evrakını arşivden silmek istiyor musunuz?`)) {
                                    deleteDocument(doc.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                title="Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Full-Screen Interactive Document Preview Modal */}
      {activeDocumentPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden border border-slate-700">
            {/* Top Toolbar */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 text-white flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{activeDocumentPreview.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {activeDocumentPreview.type}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Yükleyen: {activeDocumentPreview.uploadedBy} • Tarih: {activeDocumentPreview.uploadDate}
                  </p>
                </div>
              </div>

              {/* Viewer Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.2))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Uzaklaştır"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-slate-400 px-1">
                  {(zoomLevel * 100).toFixed(0)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Yakınlaştır"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRotationAngle((r) => (r + 90) % 360)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Döndür"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Download Button */}
                <a
                  href={activeDocumentPreview.fileUrl}
                  download={activeDocumentPreview.fileName || 'belge.png'}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs ml-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Cihaza İndir</span>
                </a>

                <button
                  onClick={() => {
                    setActiveDocumentPreview(null);
                    setZoomLevel(1);
                    setRotationAngle(0);
                  }}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Render Area */}
            <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-slate-950/80">
              <div
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotationAngle}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="max-w-full shadow-2xl rounded-lg overflow-hidden border border-slate-700"
              >
                <img
                  src={activeDocumentPreview.fileUrl}
                  alt={activeDocumentPreview.title}
                  className="max-h-[75vh] w-auto object-contain bg-white"
                />
              </div>
            </div>

            {/* Footer with Details */}
            {activeDocumentPreview.notes && (
              <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span>
                  <strong>Açıklama:</strong> {activeDocumentPreview.notes}
                </span>
                {activeDocumentPreview.relatedReferenceNo && (
                  <span className="font-mono text-indigo-400">
                    Ref: {activeDocumentPreview.relatedReferenceNo}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
