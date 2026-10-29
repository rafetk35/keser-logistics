import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Check,
  X,
  Clock,
  AlertTriangle,
  Receipt,
  User,
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Search,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  XCircle,
  FileCheck,
  Shield,
  Layers,
  Sparkles,
  Archive,
  Lock,
  Filter,
  Image,
  FolderArchive,
} from 'lucide-react';
import { DriverPendingApproval, Invoice, ExpirableDocApproval } from '../../types';

export const ApprovalDeskTab: React.FC = () => {
  const {
    pendingApprovals,
    approveDriverRequest,
    rejectDriverRequest,
    invoices,
    approveInvoice,
    rejectInvoice,
    expirableApprovals,
    approveExpirableDoc,
    rejectExpirableDoc,
    permissions,
    companySettings,
    currentUser,
    trips,
    contracts,
    expenses,
  } = useApp();

  type DeskCategory = 'driver_expenses' | 'invoices' | 'expirable_docs' | 'visual_archive' | 'history';
  const [activeCategory, setActiveCategory] = useState<DeskCategory>('driver_expenses');

  // Visual Archive search & filters
  const [archiveSearchTerm, setArchiveSearchTerm] = useState('');
  const [archiveFilterType, setArchiveFilterType] = useState<'ALL' | 'EXPENSE' | 'INVOICE' | 'CONTRACT_CMR' | 'DOC'>('ALL');
  const [archiveStatusFilter, setArchiveStatusFilter] = useState<'ALL' | 'COMPLETED_ONLY' | 'ACTIVE_ONLY'>('ALL');

  // Rejection modal state
  const [rejectingTarget, setRejectingTarget] = useState<{
    type: 'driver' | 'invoice' | 'doc';
    id: string;
    title: string;
    entityName: string;
    amountOrNo?: string;
  } | null>(null);

  const [rejectionReason, setRejectionReason] = useState('Fiş görseli okunaklı değil veya onaylanmamış rota masrafı.');

  // Visual document preview modal state
  const [visualPreview, setVisualPreview] = useState<{
    title: string;
    subTitle: string;
    imageUrl: string;
    details?: string;
  } | null>(null);

  // Counts
  const pendingDriverList = pendingApprovals.filter((a) => a.status === 'pending');
  const pendingInvoiceList = invoices.filter((i) => i.status === 'pending_review');
  const pendingDocList = expirableApprovals.filter((e) => e.status === 'pending');

  const historyDriverList = pendingApprovals.filter((a) => a.status !== 'pending');
  const historyInvoiceList = invoices.filter((i) => i.status === 'Fatura Kesildi' || i.status === 'İptal');
  const historyDocList = expirableApprovals.filter((e) => e.status !== 'pending');

  const totalPending = pendingDriverList.length + pendingInvoiceList.length + pendingDocList.length;

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingTarget) return;

    if (rejectingTarget.type === 'driver') {
      rejectDriverRequest(rejectingTarget.id, rejectionReason);
    } else if (rejectingTarget.type === 'invoice') {
      rejectInvoice(rejectingTarget.id, rejectionReason);
    } else if (rejectingTarget.type === 'doc') {
      rejectExpirableDoc(rejectingTarget.id, rejectionReason);
    }

    setRejectingTarget(null);
  };

  const openRejectModal = (
    type: 'driver' | 'invoice' | 'doc',
    id: string,
    title: string,
    entityName: string,
    amountOrNo?: string
  ) => {
    let defaultReason = 'Evrak görseli okunamıyor veya geçerlilik süresi dolmuş.';
    if (type === 'driver') defaultReason = 'Fiş görseli bulanık veya yetkisiz rota harcaması.';
    if (type === 'invoice') defaultReason = 'VKN tutarsızlığı veya onaylanmamış navlun bedeli.';

    setRejectionReason(defaultReason);
    setRejectingTarget({ type, id, title, entityName, amountOrNo });
  };

  // Aggregated Visual Archive (Past & Completed Trips, Slips, Invoices, CMRs, Contracts)
  interface VisualArchiveRecord {
    id: string;
    category: 'EXPENSE' | 'INVOICE' | 'CONTRACT_CMR' | 'DOC';
    categoryLabel: string;
    badgeColor: string;
    title: string;
    subTitle: string;
    tripCode?: string;
    tripStatus?: string;
    plate?: string;
    driverName?: string;
    date: string;
    amount?: string;
    imageUrl: string;
    isArchivedLocked: boolean;
    tags: string[];
  }

  const allArchiveRecords: VisualArchiveRecord[] = [];

  // 1. Vehicle and Trip Expenses
  expenses.forEach((exp) => {
    const defaultImg =
      exp.category === 'Yakıt'
        ? 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&auto=format&fit=crop&q=80';
    const relatedTrip = trips.find((t) => t.id === exp.tripId || (exp.tripCmrNo && t.cmrNo === exp.tripCmrNo));
    allArchiveRecords.push({
      id: `exp-${exp.id}`,
      category: 'EXPENSE',
      categoryLabel: exp.category === 'Yakıt' ? 'Mazot Fişi' : `${exp.category} Fişi`,
      badgeColor:
        exp.category === 'Yakıt'
          ? 'bg-amber-50 text-amber-800 border-amber-200'
          : 'bg-indigo-50 text-indigo-800 border-indigo-200',
      title: exp.description || `${exp.category} Harcaması`,
      subTitle: relatedTrip
        ? `${relatedTrip.cmrNo} • ${relatedTrip.originCity} ➔ ${relatedTrip.destinationCity}`
        : `${exp.vehiclePlate} • ${exp.locationGroup}`,
      tripCode: exp.tripCmrNo || (relatedTrip ? relatedTrip.cmrNo : undefined),
      tripStatus: relatedTrip ? relatedTrip.status : undefined,
      plate: exp.vehiclePlate,
      driverName: exp.driverName,
      date: exp.date,
      amount: `${exp.amount.toLocaleString('tr-TR')} ${exp.currency}`,
      imageUrl: defaultImg,
      isArchivedLocked: !!(exp.isArchivedLocked || (relatedTrip && (relatedTrip.status === 'Teslim Edildi' || relatedTrip.isArchivedLocked))),
      tags: [exp.category, exp.vehiclePlate, exp.tripCmrNo || '', exp.fuelNormExceeded ? 'Aşırı Tüketim Uyarısı' : ''].filter(Boolean),
    });
  });

  // 2. Signed Contracts & CMRs from Trips
  trips.forEach((trip) => {
    if (trip.signedContractUrl) {
      allArchiveRecords.push({
        id: `trip-contract-${trip.id}`,
        category: 'CONTRACT_CMR',
        categoryLabel: 'Kaşeli Taşıma Sözleşmesi',
        badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
        title: `Taşıma Sözleşmesi: ${trip.cmrNo}`,
        subTitle: `${trip.customerName} • TTK & CMR Hükümlerince İmzalı Nüsha`,
        tripCode: trip.cmrNo,
        tripStatus: trip.status,
        plate: trip.tractorPlate,
        driverName: trip.driverName,
        date: trip.departureDate,
        amount: `${trip.freightPrice.toLocaleString('tr-TR')} ${trip.currency}`,
        imageUrl: trip.signedContractUrl,
        isArchivedLocked: !!(trip.isArchivedLocked || trip.status === 'Teslim Edildi'),
        tags: ['Taşıma Sözleşmesi', 'İmzalı & Mühürlü', trip.tractorPlate, trip.cmrNo],
      });
    }
  });

  // 3. Contracts List
  contracts.forEach((contract) => {
    if (contract.signedContractUrl) {
      allArchiveRecords.push({
        id: `contract-doc-${contract.id}`,
        category: 'CONTRACT_CMR',
        categoryLabel: 'Resmi Taşıma Sözleşmesi',
        badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
        title: `Sözleşme No: ${contract.contractNo}`,
        subTitle: `${contract.partyName} • ${contract.origin} ➔ ${contract.destination}`,
        tripCode: contract.tripCmrNo,
        date: contract.createdAt,
        amount: `${contract.agreedPrice.toLocaleString('tr-TR')} ${contract.currency}`,
        imageUrl: contract.signedContractUrl,
        isArchivedLocked: contract.status === 'İmzalandı / Kaşelendi',
        tags: ['Taşıma Sözleşmesi', contract.partyName, contract.contractNo],
      });
    }
  });

  // 4. Pending and reviewed driver receipts
  pendingApprovals.forEach((appr) => {
    if (appr.receiptUrl && !allArchiveRecords.some((r) => r.id.includes(appr.id))) {
      allArchiveRecords.push({
        id: `appr-receipt-${appr.id}`,
        category: 'EXPENSE',
        categoryLabel: 'Kaptan Masraf Bildirimi',
        badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
        title: `${appr.type} (${appr.driverName})`,
        subTitle: `${appr.tractorPlate} • ${appr.location}`,
        plate: appr.tractorPlate,
        driverName: appr.driverName,
        date: appr.date,
        amount: `${appr.amount.toLocaleString('tr-TR')} ${appr.currency}`,
        imageUrl: appr.receiptUrl,
        isArchivedLocked: appr.status === 'approved',
        tags: [appr.type, appr.tractorPlate, appr.status === 'approved' ? 'Onaylandı' : 'İncelemede'],
      });
    }
  });

  // 5. Invoices
  invoices.forEach((inv) => {
    if (inv.fileUrl) {
      allArchiveRecords.push({
        id: `inv-visual-${inv.id}`,
        category: 'INVOICE',
        categoryLabel: inv.direction === 'incoming' ? 'Gelen Fatura (Alınan)' : 'Giden Fatura (Kesilen)',
        badgeColor:
          inv.direction === 'incoming'
            ? 'bg-orange-50 text-orange-800 border-orange-200'
            : 'bg-cyan-50 text-cyan-800 border-cyan-200',
        title: `${inv.invoiceNo} • ${inv.customerName}`,
        subTitle: `VKN: ${inv.customerTaxId || '-'} • KDV Md. 14 İstisnası`,
        tripCode: inv.tripCmrNo,
        date: inv.date,
        amount: `${inv.totalAmount.toLocaleString('tr-TR')} ${inv.currency}`,
        imageUrl: inv.fileUrl,
        isArchivedLocked: inv.status === 'Fatura Kesildi' || inv.status === 'Tahsil Edildi / Ödendi',
        tags: [inv.type, inv.status, inv.customerTaxId ? `VKN: ${inv.customerTaxId}` : ''].filter(Boolean),
      });
    }
  });

  // 6. Expirable approvals / registration documents
  expirableApprovals.forEach((doc) => {
    if (doc.fileUrl) {
      allArchiveRecords.push({
        id: `doc-file-${doc.id}`,
        category: 'DOC',
        categoryLabel: 'Süreli Belge / Ruhsat',
        badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
        title: `${doc.docType} (${doc.entityName})`,
        subTitle: `Belge No: ${doc.docNo} • Son Geçerlilik: ${doc.expiryDate}`,
        plate: doc.entityName,
        date: doc.issueDate,
        imageUrl: doc.fileUrl,
        isArchivedLocked: doc.status === 'approved',
        tags: [doc.docType, doc.entityName, doc.status === 'approved' ? 'Resmi Onaylı' : 'Beklemede'],
      });
    }
  });

  // Filtered Archive Records
  const filteredArchiveRecords = allArchiveRecords.filter((item) => {
    if (archiveFilterType !== 'ALL' && item.category !== archiveFilterType) {
      return false;
    }
    if (archiveStatusFilter === 'COMPLETED_ONLY') {
      if (item.tripStatus && item.tripStatus !== 'Teslim Edildi' && !item.isArchivedLocked) return false;
    } else if (archiveStatusFilter === 'ACTIVE_ONLY') {
      if (item.tripStatus === 'Teslim Edildi' || item.isArchivedLocked) return false;
    }
    if (archiveSearchTerm.trim()) {
      const term = archiveSearchTerm.toLowerCase();
      const matchText = `${item.title} ${item.subTitle} ${item.plate || ''} ${item.tripCode || ''} ${item.driverName || ''} ${item.tags.join(' ')}`.toLowerCase();
      return matchText.includes(term);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Operasyonel &amp; Mali Denetim Merkezi</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Merkezi Onay Masası (Fiş, Fatura &amp; Süreli Evrak)
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Sürücü yol harcırahları, akıllı VKN tespitli faturalar ve süreli resmi belgeleri inceleyin, görselini teyit edip onaylayın veya gerekçeli reddedin
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border ${
                totalPending > 0
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{totalPending} Onay Bekleyen İşlem</span>
            </span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-200 mt-6 pt-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveCategory('driver_expenses')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeCategory === 'driver_expenses'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Şoför Masraf &amp; Harcırah Fişleri</span>
            {pendingDriverList.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] bg-amber-100 text-amber-800 rounded-full font-bold">
                {pendingDriverList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveCategory('invoices')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeCategory === 'invoices'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Akıllı Faturalar &amp; VKN Tespiti</span>
            {pendingInvoiceList.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] bg-indigo-100 text-indigo-800 rounded-full font-bold">
                {pendingInvoiceList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveCategory('expirable_docs')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeCategory === 'expirable_docs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Süreli Resmi Evraklar (Ehliyet / SRC / TÜV)</span>
            {pendingDocList.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] bg-teal-100 text-teal-800 rounded-full font-bold">
                {pendingDocList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveCategory('visual_archive')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeCategory === 'visual_archive'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderArchive className="w-4 h-4 text-purple-600" />
            <span>Geçmiş Dahil Tüm Fiş &amp; Resmi Evrak Arşivi</span>
            <span className="px-2 py-0.5 text-[10px] bg-purple-100 text-purple-800 rounded-full font-bold">
              Fotoğraflı
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('history')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeCategory === 'history'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>İşlem Geçmişi (Onay &amp; Ret)</span>
          </button>
        </div>
      </div>

      {/* ---------------- 1. ŞOFÖR MASRAF & HARCIRAH FİŞLERİ ---------------- */}
      {activeCategory === 'driver_expenses' && (
        <div className="space-y-4">
          {pendingDriverList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-base">Bekleyen Şoför Talebi Yok</h3>
              <p className="text-xs text-slate-500 mt-1">
                Kaptanlardan gelen tüm yol masrafları, akaryakıt fişleri ve harcırah talepleri sonuçlandırıldı.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingDriverList.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                          <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">{item.type}</span>
                          <span className="text-xs text-slate-500">
                            Kaptan: <strong>{item.driverName}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-indigo-900 block">
                          {item.amount.toLocaleString('tr-TR')} {item.currency}
                        </span>
                        <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Onay Bekliyor
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-700 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Çekici Plaka:</span>
                        <span className="font-mono font-bold text-slate-900">{item.tractorPlate}</span>
                      </div>
                      {item.tripCmrNo && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">İlişkili CMR:</span>
                          <span className="font-mono font-semibold text-indigo-700">{item.tripCmrNo}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Konum / İstasyon:</span>
                        <span className="font-medium text-slate-800">{item.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Bildirim Zamanı:</span>
                        <span className="text-slate-600">{item.date}</span>
                      </div>
                      <div className="pt-1.5 border-t border-slate-200 text-slate-600 italic">
                        "{item.description}"
                      </div>
                    </div>
                  </div>

                  {/* Document preview button & Action buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() =>
                        setVisualPreview({
                          title: item.type,
                          subTitle: `${item.driverName} • ${item.tractorPlate}`,
                          imageUrl:
                            item.receiptUrl ||
                            'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&auto=format&fit=crop&q=80',
                          details: `${item.amount} ${item.currency} — ${item.location} (${item.date})`,
                        })
                      }
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1.5 hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Fiş Görselini İncele</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          openRejectModal(
                            'driver',
                            item.id,
                            item.type,
                            item.driverName,
                            `${item.amount} ${item.currency}`
                          )
                        }
                        className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reddet</span>
                      </button>

                      <button
                        onClick={() => approveDriverRequest(item.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Onayla</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- 2. AKILLI FATURALAR & VKN TESPİTİ ---------------- */}
      {activeCategory === 'invoices' && (
        <div className="space-y-4">
          {pendingInvoiceList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-base">Onay Bekleyen Fatura Yok</h3>
              <p className="text-xs text-slate-500 mt-1">
                Yüklenen tüm e-faturalar ve taranmış belgeler incelendi ve kayıtlara işlendi.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingInvoiceList.map((inv) => {
                const isOutgoing = inv.direction === 'outgoing' || inv.type === 'Gelir';

                return (
                  <div
                    key={inv.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-2.5 rounded-xl ${
                              isOutgoing
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {isOutgoing ? (
                              <ArrowUpRight className="w-5 h-5" />
                            ) : (
                              <ArrowDownLeft className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">
                              {inv.invoiceNo}
                            </span>
                            <span className="text-xs text-slate-500">
                              {isOutgoing ? 'Giden Fatura (Gelir)' : 'Gelen Fatura (Alınan / Gider)'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-black text-slate-900 block">
                            {inv.totalAmount.toLocaleString('tr-TR')} {inv.currency}
                          </span>
                          <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                            VKN Tespiti Yapıldı
                          </span>
                        </div>
                      </div>

                      {/* VKN and Party Details Box */}
                      <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Karşı Cari Firma:</span>
                          <span className="font-bold text-slate-900">{inv.customerName}</span>
                        </div>
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-slate-400">Satıcı VKN:</span>
                          <span className="font-semibold text-slate-800">
                            {inv.detectedSellerVkn || '-'}{' '}
                            {inv.detectedSellerVkn === companySettings.companyTaxId && (
                              <span className="text-emerald-700 font-bold">(Keser Lojistik)</span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-slate-400">Alıcı VKN:</span>
                          <span className="font-semibold text-slate-800">
                            {inv.detectedBuyerVkn || '-'}{' '}
                            {inv.detectedBuyerVkn === companySettings.companyTaxId && (
                              <span className="text-blue-700 font-bold">(Keser Lojistik)</span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Fatura Tarihi / Vade:</span>
                          <span className="text-slate-700">
                            {inv.date} (Vade: {inv.dueDate})
                          </span>
                        </div>
                        <div className="pt-1.5 border-t border-slate-200 text-slate-600 italic">
                          "{inv.notes}"
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() =>
                          setVisualPreview({
                            title: inv.invoiceNo,
                            subTitle: inv.customerName,
                            imageUrl:
                              inv.fileUrl ||
                              'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&auto=format&fit=crop&q=80',
                            details: `Tutar: ${inv.totalAmount} ${inv.currency} • Vade: ${inv.dueDate}`,
                          })
                        }
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1.5 hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Fatura Belgesini İncele</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            openRejectModal(
                              'invoice',
                              inv.id,
                              inv.invoiceNo,
                              inv.customerName,
                              `${inv.totalAmount} ${inv.currency}`
                            )
                          }
                          className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reddet</span>
                        </button>

                        <button
                          onClick={() => approveInvoice(inv.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Cariye İşle ve Onayla</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------- 3. SÜRELİ RESMİ EVRAKLAR (EHLİYET / SRC / TÜV) ---------------- */}
      {activeCategory === 'expirable_docs' && (
        <div className="space-y-4">
          {pendingDocList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-base">Onay Bekleyen Resmi Evrak Yok</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tüm ehliyet, SRC belgeleri, TÜV muayeneleri ve vizeler denetlendi ve geçerlilik tarihlerine göre işlendi.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingDocList.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">
                            {doc.docType}
                          </span>
                          <span className="text-xs text-slate-500">
                            {doc.entityName}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        Evrak İnceleme
                      </span>
                    </div>

                    <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Belge / Ruhsat No:</span>
                        <span className="font-mono font-bold text-slate-900">{doc.docNo}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Düzenlenme Tarihi:</span>
                        <span className="text-slate-700">{doc.issueDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Geçerlilik Bitiş Tarihi:</span>
                        <span className="font-bold text-indigo-700">{doc.expiryDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Yüklenme Zamanı:</span>
                        <span className="text-slate-500">{doc.submittedAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() =>
                        setVisualPreview({
                          title: doc.docType,
                          subTitle: doc.entityName,
                          imageUrl: doc.fileUrl,
                          details: `Belge No: ${doc.docNo} • Bitiş Tarihi: ${doc.expiryDate}`,
                        })
                      }
                      className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1.5 hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Belgeyi İncele</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          openRejectModal(
                            'doc',
                            doc.id,
                            doc.docType,
                            doc.entityName,
                            doc.docNo
                          )
                        }
                        className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reddet</span>
                      </button>

                      <button
                        onClick={() => approveExpirableDoc(doc.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Onayla ve Sisteme İşle</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- 4. İŞLEM GEÇMİŞİ (ONAYLANAN & REDDEDİLENLER) ---------------- */}
      {activeCategory === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">
            Son Tamamlanan Onay ve Ret İşlemleri Tarihçesi
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {/* Driver History */}
            {historyDriverList.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.status === 'approved' ? 'ONAYLANDI' : 'REDDEDİLDİ'}
                    </span>
                    <span className="font-bold text-slate-800">{item.type}</span>
                    <span className="text-slate-500">({item.driverName} - {item.tractorPlate})</span>
                  </div>
                  {item.rejectionReason && (
                    <p className="text-[11px] text-rose-600 mt-0.5">
                      Ret Gerekçesi: "{item.rejectionReason}"
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">
                    {item.amount.toLocaleString('tr-TR')} {item.currency}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    İnceleyen: {item.reviewedBy || 'Yetkili'}
                  </span>
                </div>
              </div>
            ))}

            {/* Invoices History */}
            {historyInvoiceList.map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'Fatura Kesildi'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {inv.status === 'Fatura Kesildi' ? 'ONAYLANDI' : 'İPTAL / RET'}
                    </span>
                    <span className="font-mono font-bold text-slate-800">{inv.invoiceNo}</span>
                    <span className="text-slate-600">({inv.customerName})</span>
                  </div>
                  {inv.rejectionReason && (
                    <p className="text-[11px] text-rose-600 mt-0.5">
                      Ret Gerekçesi: "{inv.rejectionReason}"
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">
                    {inv.totalAmount.toLocaleString('tr-TR')} {inv.currency}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    İnceleyen: {inv.reviewedBy || 'Muhasebe'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- 5. GEÇMİŞ DAHİL TÜM FİŞ VE RESMİ GÖRSELLERİN ARŞİVİ ---------------- */}
      {activeCategory === 'visual_archive' && (
        <div className="space-y-4">
          {/* Top Search & Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Plaka, Sefer Kodu, Harcama Cinsi, Şoför veya Cari Adı ile filtrele..."
                  value={archiveSearchTerm}
                  onChange={(e) => setArchiveSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {archiveSearchTerm && (
                  <button
                    onClick={() => setArchiveSearchTerm('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Temizle
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={archiveStatusFilter}
                  onChange={(e) => setArchiveStatusFilter(e.target.value as any)}
                  className="border border-slate-300 rounded-xl px-3 py-2 text-xs bg-slate-50 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">Tüm Seferler (Aktif + Tamamlanmış)</option>
                  <option value="COMPLETED_ONLY">Sadece Tamamlanmış / Yasal Arşivlenmişler</option>
                  <option value="ACTIVE_ONLY">Sadece Aktif Sefer Görselleri</option>
                </select>
              </div>
            </div>

            {/* Quick Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
              {[
                { key: 'ALL', label: 'Tüm Arşiv Nüshaları', count: allArchiveRecords.length },
                {
                  key: 'EXPENSE',
                  label: 'Yol & Mazot Fişleri',
                  count: allArchiveRecords.filter((r) => r.category === 'EXPENSE').length,
                },
                {
                  key: 'INVOICE',
                  label: 'Akıllı Faturalar',
                  count: allArchiveRecords.filter((r) => r.category === 'INVOICE').length,
                },
                {
                  key: 'CONTRACT_CMR',
                  label: 'CMR & Sözleşmeler',
                  count: allArchiveRecords.filter((r) => r.category === 'CONTRACT_CMR').length,
                },
                {
                  key: 'DOC',
                  label: 'Ruhsat & Süreli Evrak',
                  count: allArchiveRecords.filter((r) => r.category === 'DOC').length,
                },
              ].map((chip) => (
                <button
                  key={chip.key}
                  onClick={() => setArchiveFilterType(chip.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    archiveFilterType === chip.key
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{chip.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      archiveFilterType === chip.key ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {chip.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* KPI Mini-bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 block text-[11px]">Listelenen Evrak</span>
              <span className="text-lg font-bold text-slate-900">{filteredArchiveRecords.length} Adet</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 block text-[11px]">Yasal Arşiv Kilitli (Read-Only)</span>
              <span className="text-lg font-bold text-emerald-700">
                {filteredArchiveRecords.filter((r) => r.isArchivedLocked).length} Adet
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 block text-[11px]">Tamamlanan Seferler</span>
              <span className="text-lg font-bold text-indigo-700">
                {trips.filter((t) => t.status === 'Teslim Edildi').length} Sefer
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 block text-[11px]">Mazot / Yakıt Kayıtları</span>
              <span className="text-lg font-bold text-amber-700">
                {filteredArchiveRecords.filter((r) => r.categoryLabel.includes('Mazot')).length} Fiş
              </span>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredArchiveRecords.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <FolderArchive className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">Filtreye Uygun Görsel Evrak Bulunamadı</h3>
              <p className="text-xs text-slate-500 mt-1">
                Arama kriterlerinizi değiştirin veya diğer evrak kategorilerini inceleyin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArchiveRecords.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col overflow-hidden group"
                >
                  {/* Thumbnail Banner */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition duration-300"
                    />

                    {/* Category Tag */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${item.badgeColor} shadow-xs backdrop-blur-xs`}
                      >
                        {item.categoryLabel}
                      </span>
                    </div>

                    {/* Legal Archive Lock Tag */}
                    {item.isArchivedLocked && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/90 text-emerald-400 border border-emerald-500/30 shadow-xs flex items-center gap-1 backdrop-blur-xs">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Yasal Arşiv Kilidi</span>
                        </span>
                      </div>
                    )}

                    {/* Quick Preview Hover Button */}
                    <button
                      onClick={() =>
                        setVisualPreview({
                          title: item.title,
                          subTitle: item.subTitle,
                          imageUrl: item.imageUrl,
                          details: `${item.categoryLabel} • ${item.date} ${item.amount ? `• ${item.amount}` : ''}`,
                        })
                      }
                      className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white font-semibold text-xs"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Tam Ekran İncele</span>
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.subTitle}</p>

                      {/* Tag badges */}
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              tag.includes('Uyarısı')
                                ? 'bg-rose-100 text-rose-800 font-bold'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Tarih:</span>
                        <span className="text-slate-700 font-medium text-[11px]">{item.date}</span>
                      </div>

                      <div className="text-right">
                        {item.amount && (
                          <>
                            <span className="text-[10px] text-slate-400 block">Tutar:</span>
                            <span className="font-bold text-slate-900 text-xs">{item.amount}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() =>
                        setVisualPreview({
                          title: item.title,
                          subTitle: item.subTitle,
                          imageUrl: item.imageUrl,
                          details: `${item.categoryLabel} • ${item.date} ${item.amount ? `• ${item.amount}` : ''}`,
                        })
                      }
                      className="mt-3 w-full py-1.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Belgeyi Büyüt &amp; Doğrula</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- MODAL: REJECTION WITH MANDATORY REASON ---------------- */}
      {rejectingTarget && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Talebi Gerekçeli Reddet</h3>
                <p className="text-xs text-slate-500">
                  {rejectingTarget.title} — {rejectingTarget.entityName}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Reddetme Gerekçesi (Kullanıcıya/Şoföre Anlık Bildirilir) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Reddedilme sebebini detaylıca yazınız..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-xs"
                />
              </div>

              {/* Quick Reason Suggestions */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Hızlı Şablonlar:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRejectionReason('Fiş görseli okunaklı değil, lütfen net fotoğrafını yeniden yükleyin.')}
                    className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                  >
                    Görsel Okunaklı Değil
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectionReason('Fatura VKN veya KDV tutarı uyuşmuyor, lütfen kontrol edip düzeltin.')}
                    className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                  >
                    VKN / Tutar Uyuşmazlığı
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectionReason('Belge süresi dolmuş veya resmi kurum onay mührü eksik.')}
                    className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                  >
                    Süresi Dolmuş Evrak
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectingTarget(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Gerekçeyi İlet ve Reddet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: VISUAL DOCUMENT PREVIEW ---------------- */}
      {visualPreview && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{visualPreview.title}</h3>
                <p className="text-xs text-slate-400">{visualPreview.subTitle}</p>
              </div>
              <button
                onClick={() => setVisualPreview(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 max-h-[60vh] overflow-auto rounded-xl border border-slate-200 bg-slate-900 flex items-center justify-center p-2">
              <img
                src={visualPreview.imageUrl}
                alt="Belge Önizleme"
                className="max-h-[55vh] object-contain rounded-lg shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-600 font-medium">{visualPreview.details}</span>
              <button
                onClick={() => setVisualPreview(null)}
                className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
