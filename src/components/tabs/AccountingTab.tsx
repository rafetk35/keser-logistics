import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  Receipt,
  TrendingUp,
  CreditCard,
  CheckCheck,
  Shield,
  X,
  FileCheck,
  Calendar,
  Layers,
  Coins,
  Download,
  Edit2,
  Trash2,
  Upload,
  FileText,
  Settings,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  Info,
  Check,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Customer, Invoice, InvoiceType, InvoiceStatus, Currency } from '../../types';
import { exportToCsv } from '../../utils/exportToCsv';

export const AccountingTab: React.FC = () => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    invoices,
    addInvoice,
    uploadInvoiceWithVkn,
    approveInvoice,
    rejectInvoice,
    editInvoice,
    updateInvoiceStatus,
    deleteInvoice,
    trips,
    permissions,
    companySettings,
    setIsCompanySettingsModalOpen,
    setIsCurrencyModalOpen,
    setActiveTab,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'customers' | 'invoices' | 'ledger'>('customers');
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'pending' | 'incoming' | 'outgoing'>('all');

  // Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // Manual Invoice Creation Modal
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Smart Invoice Upload Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadInvoiceNo, setUploadInvoiceNo] = useState('');
  const [uploadSellerVkn, setUploadSellerVkn] = useState('');
  const [uploadBuyerVkn, setUploadBuyerVkn] = useState('');
  const [uploadOtherPartyName, setUploadOtherPartyName] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadDueDate, setUploadDueDate] = useState('2026-11-20');
  const [uploadSubtotal, setUploadSubtotal] = useState<number>(3850);
  const [uploadVatRate, setUploadVatRate] = useState<number>(0);
  const [uploadCurrency, setUploadCurrency] = useState<Currency>('EUR');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadFileName, setUploadFileName] = useState('fatura_taranmis_evrak.pdf');
  const [uploadFileUrl, setUploadFileUrl] = useState(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&auto=format&fit=crop&q=80'
  );

  // Edit & Correct Invoice Modal ("Düzenle ve Düzelt")
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editInvNo, setEditInvNo] = useState('');
  const [editSellerVkn, setEditSellerVkn] = useState('');
  const [editBuyerVkn, setEditBuyerVkn] = useState('');
  const [editPartyName, setEditPartyName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editSubtotal, setEditSubtotal] = useState<number>(0);
  const [editVatRate, setEditVatRate] = useState<number>(0);
  const [editCurrency, setEditCurrency] = useState<Currency>('EUR');
  const [editNotes, setEditNotes] = useState('');

  // Document Visual Preview Modal
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Customer form state
  const [custName, setCustName] = useState('');
  const [custContact, setCustContact] = useState('');
  const [custPhone, setCustPhone] = useState('+90 2');
  const [custEmail, setCustEmail] = useState('');
  const [custTaxId, setCustTaxId] = useState('');
  const [custTaxOffice, setCustTaxOffice] = useState('');
  const [custCity, setCustCity] = useState('İstanbul');
  const [custCountry, setCustCountry] = useState('Türkiye');

  // Manual Invoice form state
  const [invType, setInvType] = useState<InvoiceType>('Gelir');
  const [invCustomerId, setInvCustomerId] = useState(customers[0]?.id || '');
  const [invTripId, setInvTripId] = useState('');
  const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [invDueDate, setInvDueDate] = useState('2026-11-10');
  const [invSubtotal, setInvSubtotal] = useState<number>(4500);
  const [invVatRate, setInvVatRate] = useState<number>(0);
  const [invCurrency, setInvCurrency] = useState<Currency>('EUR');
  const [invStatus, setInvStatus] = useState<InvoiceStatus>('Fatura Kesildi');
  const [invNotes, setInvNotes] = useState('3065 sayılı KDV Kanunu 14. Madde Uluslararası Taşımacılık İstisnası.');

  // Open Handlers
  const openCreateCustomerModal = () => {
    setEditingCustomer(null);
    setCustName('');
    setCustContact('');
    setCustPhone('+90 2');
    setCustEmail('');
    setCustTaxId('');
    setCustTaxOffice('İstanbul V.D.');
    setCustCity('İstanbul');
    setCustCountry('Türkiye');
    setIsCustomerModalOpen(true);
  };

  const openEditCustomerModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setCustName(cust.companyName);
    setCustContact(cust.contactPerson);
    setCustPhone(cust.phone);
    setCustEmail(cust.email);
    setCustTaxId(cust.taxId);
    setCustTaxOffice(cust.taxOffice);
    setCustCity(cust.city);
    setCustCountry(cust.country);
    setIsCustomerModalOpen(true);
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        companyName: custName.trim(),
        contactPerson: custContact.trim() || 'Yetkili',
        phone: custPhone.trim() || '-',
        email: custEmail.trim() || '-',
        taxId: custTaxId.trim() || '1111111111',
        taxOffice: custTaxOffice.trim() || 'Merkez V.D.',
        city: custCity.trim(),
        country: custCountry.trim(),
      });
    } else {
      addCustomer({
        companyName: custName.trim(),
        contactPerson: custContact.trim() || 'Yetkili',
        phone: custPhone.trim() || '-',
        email: custEmail.trim() || '-',
        taxId: custTaxId.trim() || '1111111111',
        taxOffice: custTaxOffice.trim() || 'Merkez V.D.',
        city: custCity.trim(),
        country: custCountry.trim(),
        balanceEUR: 0,
        balanceTRY: 0,
        totalTripsCount: 0,
        status: 'Aktif',
      });
    }

    setIsCustomerModalOpen(false);
  };

  const confirmDeleteCustomer = () => {
    if (deletingCustomer) {
      deleteCustomer(deletingCustomer.id);
      setDeletingCustomer(null);
    }
  };

  const openInvoiceModal = () => {
    setInvType('Gelir');
    setInvCustomerId(customers[0]?.id || '');
    setInvTripId('');
    setInvDate(new Date().toISOString().split('T')[0]);
    setInvDueDate('2026-11-15');
    setInvSubtotal(4500);
    setInvVatRate(0);
    setInvCurrency('EUR');
    setInvStatus('Fatura Kesildi');
    setInvNotes('3065 sayılı KDV Kanunu 14. Madde Uluslararası Taşımacılık İstisnası.');
    setIsInvoiceModalOpen(true);
  };

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === invCustomerId);
    const trip = trips.find((t) => t.id === invTripId);
    const vatAmount = (invSubtotal * invVatRate) / 100;
    const totalAmount = invSubtotal + vatAmount;
    const nextNum = invoices.length + 40;
    const invoiceNo = `FAT-2026-00${nextNum}`;

    addInvoice({
      invoiceNo,
      type: invType,
      customerId: invCustomerId,
      customerName: cust?.companyName || 'Müşteri',
      tripId: invTripId || undefined,
      tripCmrNo: trip?.cmrNo || undefined,
      date: invDate,
      dueDate: invDueDate,
      subtotal: invSubtotal,
      vatRate: invVatRate,
      vatAmount,
      totalAmount,
      currency: invCurrency,
      status: invStatus,
      notes: invNotes,
    });

    setIsInvoiceModalOpen(false);
  };

  // Smart Invoice Upload Handlers & Presets
  const openSmartUploadModal = () => {
    // Default preset: Incoming fuel invoice from Shell
    applyUploadPreset('incoming_fuel');
    setIsUploadModalOpen(true);
  };

  const applyUploadPreset = (preset: 'incoming_fuel' | 'outgoing_freight' | 'blank') => {
    if (preset === 'incoming_fuel') {
      setUploadInvoiceNo('SHL-2026-' + Math.floor(10000 + Math.random() * 90000));
      setUploadSellerVkn('7690012345'); // Shell VKN
      setUploadBuyerVkn(companySettings.companyTaxId); // Keser Lojistik VKN
      setUploadOtherPartyName('Shell & Turcas Petrol A.Ş.');
      setUploadSubtotal(34200);
      setUploadVatRate(20);
      setUploadCurrency('TRY');
      setUploadNotes('Ekim 2. Dönem Taşıt Tanıma Filo Motorin İkmal Faturası.');
      setUploadFileName('Shell_Filo_Akaryakit_Faturasi.pdf');
      setUploadFileUrl('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&auto=format&fit=crop&q=80');
    } else if (preset === 'outgoing_freight') {
      setUploadInvoiceNo('KSR-2026-' + Math.floor(1000 + Math.random() * 9000));
      setUploadSellerVkn(companySettings.companyTaxId); // Keser Lojistik VKN
      setUploadBuyerVkn('1800245671'); // Bosch VKN
      setUploadOtherPartyName('Bosch Termoteknik San. Tic. A.Ş.');
      setUploadSubtotal(4850);
      setUploadVatRate(0);
      setUploadCurrency('EUR');
      setUploadNotes('Manisa ↔ Stuttgart Uluslararası Karayolu Navlun Faturası (KDV Md.14/1 İstisna).');
      setUploadFileName('Bosch_Stuttgart_Navlun_Faturasi.pdf');
      setUploadFileUrl('https://images.unsplash.com/photo-1450133064473-71024230f91b?w=900&auto=format&fit=crop&q=80');
    } else {
      setUploadInvoiceNo('FAT-2026-' + Math.floor(1000 + Math.random() * 9000));
      setUploadSellerVkn('');
      setUploadBuyerVkn(companySettings.companyTaxId);
      setUploadOtherPartyName('');
      setUploadSubtotal(2500);
      setUploadVatRate(0);
      setUploadCurrency('EUR');
      setUploadNotes('');
      setUploadFileName('Taranan_Fatura_Evrak.pdf');
      setUploadFileUrl('https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=900&auto=format&fit=crop&q=80');
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadInvoiceNo.trim() || !uploadOtherPartyName.trim()) return;

    uploadInvoiceWithVkn({
      invoiceNo: uploadInvoiceNo.trim(),
      sellerVkn: uploadSellerVkn.trim(),
      buyerVkn: uploadBuyerVkn.trim(),
      otherPartyName: uploadOtherPartyName.trim(),
      date: uploadDate,
      dueDate: uploadDueDate,
      subtotal: uploadSubtotal,
      vatRate: uploadVatRate,
      currency: uploadCurrency,
      notes: uploadNotes.trim(),
      fileName: uploadFileName,
      fileUrl: uploadFileUrl,
    });

    setIsUploadModalOpen(false);
  };

  // Live OCR calculation
  const isOurCompanySeller = uploadSellerVkn.trim() === companySettings.companyTaxId.trim();
  const isOurCompanyBuyer = uploadBuyerVkn.trim() === companySettings.companyTaxId.trim();
  const detectedDirection: 'incoming' | 'outgoing' = isOurCompanySeller ? 'outgoing' : 'incoming';

  // Edit / Correct Invoice
  const openEditInvoiceModal = (inv: Invoice) => {
    setEditingInvoice(inv);
    setEditInvNo(inv.invoiceNo);
    setEditSellerVkn(inv.detectedSellerVkn || (inv.direction === 'outgoing' ? companySettings.companyTaxId : ''));
    setEditBuyerVkn(inv.detectedBuyerVkn || (inv.direction === 'incoming' ? companySettings.companyTaxId : ''));
    setEditPartyName(inv.customerName);
    setEditDate(inv.date);
    setEditDueDate(inv.dueDate);
    setEditSubtotal(inv.subtotal);
    setEditVatRate(inv.vatRate);
    setEditCurrency(inv.currency);
    setEditNotes(inv.notes || '');
  };

  const handleEditInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;

    const vatAmount = Math.round(((editSubtotal * editVatRate) / 100) * 100) / 100;
    const totalAmount = editSubtotal + vatAmount;

    // Recalculate direction if VKN changed
    const ourVkn = companySettings.companyTaxId.trim();
    const isSeller = editSellerVkn.trim() === ourVkn;
    const direction: 'incoming' | 'outgoing' = isSeller ? 'outgoing' : 'incoming';
    const type: InvoiceType = direction === 'outgoing' ? 'Gelir' : 'Gider';

    editInvoice(editingInvoice.id, {
      invoiceNo: editInvNo.trim(),
      type,
      direction,
      customerName: editPartyName.trim(),
      detectedSellerVkn: editSellerVkn.trim(),
      detectedBuyerVkn: editBuyerVkn.trim(),
      date: editDate,
      dueDate: editDueDate,
      subtotal: editSubtotal,
      vatRate: editVatRate,
      vatAmount,
      totalAmount,
      currency: editCurrency,
      notes: editNotes.trim(),
    });

    setEditingInvoice(null);
  };

  // Export Invoices
  const handleExportInvoicesCsv = () => {
    exportToCsv(
      'Keser_Lojistik_Faturalar',
      invoices,
      [
        { header: 'Fatura No', key: 'invoiceNo' },
        { header: 'Yön / Tip', key: (r) => (r.direction === 'incoming' ? 'Gelen (Gider)' : 'Giden (Gelir)') },
        { header: 'Müşteri / Cari', key: 'customerName' },
        { header: 'VKN', key: (r) => r.customerTaxId || r.detectedBuyerVkn || r.detectedSellerVkn || '-' },
        { header: 'İlişkili CMR', key: (r) => r.tripCmrNo || '-' },
        { header: 'Fatura Tarihi', key: 'date' },
        { header: 'Vade Tarihi', key: 'dueDate' },
        { header: 'Matrah', key: 'subtotal' },
        { header: 'KDV (%)', key: 'vatRate' },
        { header: 'KDV Tutarı', key: 'vatAmount' },
        { header: 'Toplam Tutar', key: 'totalAmount' },
        { header: 'Para Birimi', key: 'currency' },
        { header: 'Durum', key: 'status' },
        { header: 'Ödeme Tarihi', key: (r) => r.paymentDate || '-' },
      ]
    );
  };

  // Export Customers
  const handleExportCustomersCsv = () => {
    exportToCsv(
      'Keser_Lojistik_Cari_Listesi',
      customers,
      [
        { header: 'Cari Kod', key: 'code' },
        { header: 'Firma Unvanı', key: 'companyName' },
        { header: 'Yetkili Kişi', key: 'contactPerson' },
        { header: 'Telefon', key: 'phone' },
        { header: 'E-Posta', key: 'email' },
        { header: 'Vergi No (VKN)', key: 'taxId' },
        { header: 'Vergi Dairesi', key: 'taxOffice' },
        { header: 'Şehir', key: 'city' },
        { header: 'Bakiye (EUR)', key: 'balanceEUR' },
        { header: 'Bakiye (TRY)', key: 'balanceTRY' },
        { header: 'Toplam Sefer Sayısı', key: 'totalTripsCount' },
        { header: 'Durum', key: 'status' },
      ]
    );
  };

  // KPI Calculations (Only approved invoices affect receivables)
  const totalReceivablesEUR = customers.reduce((sum, c) => sum + c.balanceEUR, 0);
  const totalReceivablesTRY = customers.reduce((sum, c) => sum + c.balanceTRY, 0);

  const pendingInvoices = invoices.filter((i) => i.status === 'pending_review');
  const approvedInvoices = invoices.filter((i) => i.status !== 'pending_review' && i.status !== 'İptal');

  const totalInvoicedEUR = approvedInvoices
    .filter((i) => i.currency === 'EUR' && (i.type === 'Gelir' || i.direction === 'outgoing'))
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const totalExpenseInvoicesTRY = approvedInvoices
    .filter((i) => i.currency === 'TRY' && (i.type === 'Gider' || i.direction === 'incoming'))
    .reduce((sum, i) => sum + i.totalAmount, 0);

  // Filtered lists
  const filteredCustomers = customers.filter(
    (c) =>
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.taxOffice.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.taxId.includes(searchQuery) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInvoices = invoices.filter((i) => {
    const matchesSearch =
      i.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.customerTaxId && i.customerTaxId.includes(searchQuery)) ||
      (i.tripCmrNo && i.tripCmrNo.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (invoiceFilter === 'pending') return i.status === 'pending_review';
    if (invoiceFilter === 'incoming') return i.direction === 'incoming' || i.type === 'Gider';
    if (invoiceFilter === 'outgoing') return i.direction === 'outgoing' || i.type === 'Gelir';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Finans &amp; Ön Muhasebe Yönetimi</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Cari Hesaplar, Akıllı Fatura &amp; Onay Masası
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              VKN bazlı gelen/giden otomatik tespiti, e-fatura/görsel yükleme ve onay masası entegrasyonu
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Company Tax ID quick indicator & trigger */}
            <button
              onClick={() => setIsCompanySettingsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition border border-slate-200 shadow-2xs"
              title="Şirket Resmi VKN ve Vergi Bilgilerini Düzenle"
            >
              <Settings className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-slate-500 hidden sm:inline">Şirket VKN:</span>
              <span className="font-mono font-bold text-slate-900">{companySettings.companyTaxId}</span>
            </button>

            <button
              onClick={() => setIsCurrencyModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span>TCMB Kurları</span>
            </button>

            {activeSubTab === 'customers' && (
              <button
                onClick={handleExportCustomersCsv}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Carileri Excel İndir</span>
              </button>
            )}

            {activeSubTab === 'invoices' && (
              <button
                onClick={handleExportInvoicesCsv}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Faturaları Excel İndir</span>
              </button>
            )}

            <button
              onClick={openCreateCustomerModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Cari Aç</span>
            </button>

            {/* Smart Upload Invoice Button */}
            <button
              onClick={openSmartUploadModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
              title="PDF veya taranan görsel ile fatura yükle, VKN karşılaştırmasıyla gelen/giden tespiti yap"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Fatura Yükle (PDF / Görsel)</span>
            </button>

            {/* Manual Invoice Creation Button */}
            <button
              onClick={openInvoiceModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Fatura Kes</span>
            </button>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-100">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Toplam Cari Alacak (EUR)
            </span>
            <div className="text-xl font-black text-slate-900 mt-1">
              {totalReceivablesEUR.toLocaleString('tr-TR')} €
            </div>
            <span className="text-[10px] text-amber-600 font-semibold mt-0.5 block">
              Müşterilerden tahsil edilecek net bakiye
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Toplam Cari Alacak (TL)
            </span>
            <div className="text-xl font-black text-slate-900 mt-1">
              {totalReceivablesTRY.toLocaleString('tr-TR')} ₺
            </div>
            <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
              Yurtiçi taşıma cari alacakları
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Toplam Kesilen Fatura (EUR)
            </span>
            <div className="text-xl font-black text-indigo-700 mt-1">
              {totalInvoicedEUR.toLocaleString('tr-TR')} €
            </div>
            <span className="text-[10px] text-indigo-600 font-semibold mt-0.5 block">
              Onaylanmış ihracat/navlun faturaları
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Onay Masasındaki Faturalar
              </span>
              {pendingInvoices.length > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                  {pendingInvoices.length}
                </span>
              )}
            </div>
            <div className="text-xl font-black text-amber-700 mt-1">
              {pendingInvoices.length} Adet Bekliyor
            </div>
            <span className="text-[10px] text-amber-700 font-semibold mt-0.5 block">
              Onaylanmadan cariye işlenmez
            </span>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-4 mt-6 border-b border-slate-200">
          <button
            onClick={() => setActiveSubTab('customers')}
            className={`pb-3 font-bold text-xs flex items-center gap-2 border-b-2 transition ${
              activeSubTab === 'customers'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Müşteriler &amp; Cari Hesaplar ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`pb-3 font-bold text-xs flex items-center gap-2 border-b-2 transition ${
              activeSubTab === 'invoices'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Faturalar ({invoices.length})</span>
            {pendingInvoices.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                {pendingInvoices.length} Onay Bekleyen
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`pb-3 font-bold text-xs flex items-center gap-2 border-b-2 transition ${
              activeSubTab === 'ledger'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Gelir / Gider Mizan Özeti</span>
          </button>
        </div>
      </div>

      {/* ---------------- SUB-TAB 1: CUSTOMERS ---------------- */}
      {activeSubTab === 'customers' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Firma unvanı, cari kod, VKN veya şehir ara..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Toplam {filteredCustomers.length} Cari Kart
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((cust) => (
              <div
                key={cust.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {cust.code}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1 leading-snug">
                        {cust.companyName}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {cust.city}, {cust.country}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditCustomerModal(cust)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Cari Bilgilerini Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingCustomer(cust)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Cari Kartı Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 my-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Yetkili Kişi:</span>
                      <span className="font-semibold text-slate-800">{cust.contactPerson}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Telefon:</span>
                      <span className="font-medium text-slate-700">{cust.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Vergi Dairesi &amp; VKN:</span>
                      <span className="font-mono text-[11px] font-bold text-indigo-950">
                        {cust.taxOffice} / {cust.taxId}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Cari Bakiye</div>
                    <div
                      className={`text-base font-black ${
                        cust.balanceEUR > 0 ? 'text-amber-600' : 'text-slate-900'
                      }`}
                    >
                      {cust.balanceEUR.toLocaleString('tr-TR')} €
                    </div>
                    {cust.balanceTRY > 0 && (
                      <div className="text-xs font-bold text-amber-700">
                        {cust.balanceTRY.toLocaleString('tr-TR')} ₺
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Toplam Sefer</div>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {cust.totalTripsCount} Sefer
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- SUB-TAB 2: INVOICES ---------------- */}
      {activeSubTab === 'invoices' && (
        <div className="space-y-4">
          {/* Pending Approval Notice Banner */}
          {pendingInvoices.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-950 text-xs">
                    {pendingInvoices.length} Adet Fatura Onay Masasında İnceleme Bekliyor
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Yüklenen faturalar otomatik VKN tespiti ile ayrıştırılmıştır. Muhasebe/Yönetici onayı verilmeden cariye ve mizanlara işlenmez.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInvoiceFilter('pending')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Bekleyenleri Filtrele
                </button>
                <button
                  onClick={() => setActiveTab('approvals')}
                  className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 rounded-xl text-xs font-bold transition"
                >
                  Onay Masasına Git
                </button>
              </div>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Fatura no, cari unvanı, VKN veya CMR ara..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setInvoiceFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  invoiceFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tümü ({invoices.length})
              </button>
              <button
                onClick={() => setInvoiceFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  invoiceFilter === 'pending'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Onay Bekleyenler ({pendingInvoices.length})</span>
              </button>
              <button
                onClick={() => setInvoiceFilter('outgoing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  invoiceFilter === 'outgoing'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                <span>Giden Faturalar (Gelir)</span>
              </button>
              <button
                onClick={() => setInvoiceFilter('incoming')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  invoiceFilter === 'incoming'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-blue-600" />
                <span>Gelen Faturalar (Gider)</span>
              </button>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                    <th className="p-3.5">Fatura No &amp; Yön</th>
                    <th className="p-3.5">Cari / Karşı Firma</th>
                    <th className="p-3.5">VKN Karşılaştırma</th>
                    <th className="p-3.5">İlişkili CMR</th>
                    <th className="p-3.5">Tarih / Vade</th>
                    <th className="p-3.5 text-right">Tutar</th>
                    <th className="p-3.5">KDV Notu</th>
                    <th className="p-3.5">Durum</th>
                    <th className="p-3.5 text-center">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => {
                    const isPending = inv.status === 'pending_review';
                    const isOutgoing = inv.direction === 'outgoing' || inv.type === 'Gelir';

                    return (
                      <tr
                        key={inv.id}
                        className={`hover:bg-slate-50 transition ${
                          isPending ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`p-1 rounded-md ${
                                isOutgoing
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                              title={isOutgoing ? 'Giden Fatura (Gelir)' : 'Gelen Fatura (Gider)'}
                            >
                              {isOutgoing ? (
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              ) : (
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                              )}
                            </span>
                            <div>
                              <span className="font-mono font-bold text-slate-900 block">
                                {inv.invoiceNo}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {isOutgoing ? 'Giden (Kesilen)' : 'Gelen (Alınan)'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="font-semibold text-slate-900 block truncate max-w-[180px]">
                            {inv.customerName}
                          </span>
                          {inv.notes && (
                            <span className="text-[10px] text-slate-400 truncate max-w-[180px] block">
                              {inv.notes}
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 font-mono text-[11px]">
                          {inv.detectedSellerVkn && inv.detectedBuyerVkn ? (
                            <div>
                              <div className="text-[10px] text-slate-500">
                                Satıcı: <strong className="text-slate-800">{inv.detectedSellerVkn}</strong>
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Alıcı: <strong className="text-slate-800">{inv.detectedBuyerVkn}</strong>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-600">
                              VKN: {inv.customerTaxId || '-'}
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 font-mono text-indigo-700">
                          {inv.tripCmrNo || '-'}
                        </td>

                        <td className="p-3.5">
                          <div className="text-slate-700">{inv.date}</div>
                          <div className="text-[10px] text-slate-400">Vade: {inv.dueDate}</div>
                        </td>

                        <td className="p-3.5 text-right font-black text-slate-900">
                          <div>
                            {inv.totalAmount.toLocaleString('tr-TR')} {inv.currency}
                          </div>
                          {inv.vatAmount > 0 && (
                            <div className="text-[10px] text-slate-400 font-normal">
                              KDV Dahil (+{inv.vatAmount.toLocaleString('tr-TR')})
                            </div>
                          )}
                        </td>

                        <td className="p-3.5 text-slate-500 max-w-xs truncate" title={inv.notes}>
                          {inv.vatRate === 0 ? '%0 İstisna (Md.14)' : `%${inv.vatRate} KDV`}
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                              inv.status === 'Tahsil Edildi / Ödendi'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.status === 'pending_review'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : inv.status === 'İptal'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {inv.status === 'pending_review' ? 'Onay Bekliyor' : inv.status}
                          </span>
                        </td>

                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Document / File Preview Button */}
                            {inv.fileUrl && (
                              <button
                                onClick={() => setPreviewInvoice(inv)}
                                className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
                                title="Fatura Belgesi / Görselini Önizle"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* "Düzenle ve Düzelt" Button */}
                            <button
                              onClick={() => openEditInvoiceModal(inv)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition flex items-center gap-1"
                              title="Hatalı Algılanan Faturayı Düzenle ve Düzelt"
                            >
                              <Edit2 className="w-3 h-3 text-slate-600" />
                              <span>Düzelt</span>
                            </button>

                            {/* Direct Approval Button for pending review */}
                            {isPending && permissions.canApproveInvoices && (
                              <button
                                onClick={() => approveInvoice(inv.id)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition flex items-center gap-1 shadow-2xs"
                                title="Faturayı Onayla ve Cariye İşle"
                              >
                                <Check className="w-3 h-3" />
                                <span>Onayla</span>
                              </button>
                            )}

                            {inv.status === 'Fatura Kesildi' && (
                              <button
                                onClick={() => updateInvoiceStatus(inv.id, 'Tahsil Edildi / Ödendi')}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[11px] font-semibold transition"
                                title="Tahsil Edildi / Ödendi Olarak İşle"
                              >
                                Tahsil Et
                              </button>
                            )}

                            <button
                              onClick={() => deleteInvoice(inv.id)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded"
                              title="Faturayı Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SUB-TAB 3: LEDGER (MİZAN ÖZETİ) ---------------- */}
      {activeSubTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gelir &amp; Gider Ön Mizan Tablosu</h2>
              <p className="text-xs text-slate-500">
                Resmi onaylanmış faturalar ve araç masraflarının para birimi bazında konsolide mizanı
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200">
                Onaylı Gelirler: {totalInvoicedEUR.toLocaleString('tr-TR')} €
              </span>
              <span className="px-3 py-1 bg-rose-50 text-rose-700 font-bold text-xs rounded-lg border border-rose-200">
                Gelen Fatura Giderleri: {totalExpenseInvoicesTRY.toLocaleString('tr-TR')} ₺
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">
                Gelir Faturaları (Navlun / İhracat)
              </h3>
              <div className="space-y-2">
                {invoices
                  .filter((i) => i.status !== 'pending_review' && (i.type === 'Gelir' || i.direction === 'outgoing'))
                  .map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{inv.customerName}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {inv.invoiceNo} • {inv.date}
                        </span>
                      </div>
                      <span className="font-black text-emerald-700">
                        +{inv.totalAmount.toLocaleString('tr-TR')} {inv.currency}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">
                Gelen Gider Faturaları (Yakıt / Otoyol / Taşeron)
              </h3>
              <div className="space-y-2">
                {invoices
                  .filter((i) => i.status !== 'pending_review' && (i.type === 'Gider' || i.direction === 'incoming'))
                  .map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{inv.customerName}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {inv.invoiceNo} • {inv.date}
                        </span>
                      </div>
                      <span className="font-black text-rose-700">
                        -{inv.totalAmount.toLocaleString('tr-TR')} {inv.currency}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: SMART INVOICE UPLOAD & VKN DETECTION ---------------- */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[92vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl border border-teal-200">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Akıllı Fatura Yükleme &amp; Otomatik VKN Tespiti
                  </h3>
                  <p className="text-xs text-slate-400">
                    PDF veya fiş görselini yükleyin, VKN karşılaştırmasıyla otomatik sınıflandırıp onay masasına sevk edin
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Demo Presets */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Hızlı Örnek Fatura Senaryoları (Canlı Test):</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Şirketimiz VKN: {companySettings.companyTaxId}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyUploadPreset('incoming_fuel')}
                  className="px-2.5 py-1 bg-white border border-teal-300 text-teal-800 rounded-lg text-xs font-semibold hover:bg-teal-50 transition"
                >
                  Örnek 1: Shell Taşıt Tanıma (Gelen Fatura / Gider)
                </button>
                <button
                  type="button"
                  onClick={() => applyUploadPreset('outgoing_freight')}
                  className="px-2.5 py-1 bg-white border border-indigo-300 text-indigo-800 rounded-lg text-xs font-semibold hover:bg-indigo-50 transition"
                >
                  Örnek 2: Bosch Navlun Faturası (Giden Fatura / Gelir)
                </button>
                <button
                  type="button"
                  onClick={() => applyUploadPreset('blank')}
                  className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition"
                >
                  Boş Taslak
                </button>
              </div>
            </div>

            {/* Live VKN Detection Preview Badge */}
            <div
              className={`mt-4 p-4 rounded-xl border flex items-start gap-3 text-xs ${
                detectedDirection === 'outgoing'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-blue-50 border-blue-300 text-blue-950'
              }`}
            >
              {detectedDirection === 'outgoing' ? (
                <ArrowUpRight className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <ArrowDownLeft className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-black text-sm">
                  {detectedDirection === 'outgoing'
                    ? 'GİDEN FATURA (KESİLEN / SATIŞ GELİRİ) TESPİT EDİLDİ'
                    : 'GELEN FATURA (ALINAN / GİDER - MAZOT/OTOYOL) TESPİT EDİLDİ'}
                </div>
                <div className="mt-1 space-y-0.5 text-[11px] opacity-90">
                  <p>
                    {isOurCompanySeller && (
                      <span>
                        • <strong>Satıcı VKN ({uploadSellerVkn})</strong> şirketimiz Keser Lojistik ile eşleşti.
                      </span>
                    )}
                    {isOurCompanyBuyer && (
                      <span>
                        • <strong>Alıcı VKN ({uploadBuyerVkn})</strong> şirketimiz Keser Lojistik ile eşleşti.
                      </span>
                    )}
                  </p>
                  <p className="font-semibold text-amber-900 bg-amber-100/60 px-2 py-0.5 rounded mt-1 inline-block">
                    Onay Masasına 'pending_review' durumuyla sevk edilecektir. Yetkili onay verene kadar cari bakiyeye işlenmez.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleUploadSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fatura Numarası *</label>
                  <input
                    type="text"
                    required
                    value={uploadInvoiceNo}
                    onChange={(e) => setUploadInvoiceNo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Karşı Firma / Cari Unvanı *</label>
                  <input
                    type="text"
                    required
                    value={uploadOtherPartyName}
                    onChange={(e) => setUploadOtherPartyName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                    <span>Satıcı Vergi Kimlik No (VKN)</span>
                    {uploadSellerVkn.trim() === companySettings.companyTaxId && (
                      <span className="text-[10px] text-emerald-700 font-bold">Bizim Şirket</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={uploadSellerVkn}
                    onChange={(e) => setUploadSellerVkn(e.target.value)}
                    placeholder="10 veya 11 Haneli VKN"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                    <span>Alıcı Vergi Kimlik No (VKN)</span>
                    {uploadBuyerVkn.trim() === companySettings.companyTaxId && (
                      <span className="text-[10px] text-blue-700 font-bold">Bizim Şirket</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={uploadBuyerVkn}
                    onChange={(e) => setUploadBuyerVkn(e.target.value)}
                    placeholder="10 veya 11 Haneli VKN"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fatura Tarihi</label>
                  <input
                    type="date"
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Vade Tarihi</label>
                  <input
                    type="date"
                    value={uploadDueDate}
                    onChange={(e) => setUploadDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Matrah (KDV Hariç Tutar) *</label>
                  <input
                    type="number"
                    required
                    value={uploadSubtotal}
                    onChange={(e) => setUploadSubtotal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">KDV Oranı</label>
                    <select
                      value={uploadVatRate}
                      onChange={(e) => setUploadVatRate(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    >
                      <option value={0}>%0 İstisna</option>
                      <option value={10}>%10 KDV</option>
                      <option value={20}>%20 KDV</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Para Birimi</label>
                    <select
                      value={uploadCurrency}
                      onChange={(e) => setUploadCurrency(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="TRY">TRY (₺)</option>
                      <option value="USD">USD ($)</option>
                      <option value="RUB">RUB (₽)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Yüklenen Belge Adı &amp; Görsel URL</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    placeholder="fatura.pdf"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    value={uploadFileUrl}
                    onChange={(e) => setUploadFileUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs truncate"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Muhasebe / Onay Masası Notu</label>
                <input
                  type="text"
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="Ek açıklama veya sefer CMR numarası..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Onay Masasına Sevk Et</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: EDIT & CORRECT INVOICE ("DÜZENLE VE DÜZELT") ---------------- */}
      {editingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Fatura Bilgilerini Düzenle &amp; Düzelt
                </h3>
              </div>
              <button
                onClick={() => setEditingInvoice(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditInvoiceSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fatura No</label>
                  <input
                    type="text"
                    required
                    value={editInvNo}
                    onChange={(e) => setEditInvNo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Cari / Karşı Firma</label>
                  <input
                    type="text"
                    required
                    value={editPartyName}
                    onChange={(e) => setEditPartyName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Satıcı VKN</label>
                  <input
                    type="text"
                    value={editSellerVkn}
                    onChange={(e) => setEditSellerVkn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Alıcı VKN</label>
                  <input
                    type="text"
                    value={editBuyerVkn}
                    onChange={(e) => setEditBuyerVkn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fatura Tarihi</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Vade Tarihi</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Matrah</label>
                  <input
                    type="number"
                    required
                    value={editSubtotal}
                    onChange={(e) => setEditSubtotal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">KDV %</label>
                    <select
                      value={editVatRate}
                      onChange={(e) => setEditVatRate(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    >
                      <option value={0}>%0 İstisna</option>
                      <option value={20}>%20 KDV</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Döviz</label>
                    <select
                      value={editCurrency}
                      onChange={(e) => setEditCurrency(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="TRY">TRY (₺)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Not / Düzeltme Açıklaması</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingInvoice(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Düzeltmeleri Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: VISUAL DOCUMENT PREVIEW ---------------- */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>{previewInvoice.invoiceNo} — Fatura Görseli / PDF</span>
                </h3>
                <p className="text-xs text-slate-400">{previewInvoice.fileName || 'yuklenen_fatura.pdf'}</p>
              </div>
              <button
                onClick={() => setPreviewInvoice(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 max-h-[60vh] overflow-auto rounded-xl border border-slate-200 bg-slate-900 flex items-center justify-center p-2">
              <img
                src={previewInvoice.fileUrl}
                alt="Fatura Görseli"
                className="max-h-[55vh] object-contain rounded-lg shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                Tutar: <strong>{previewInvoice.totalAmount.toLocaleString('tr-TR')} {previewInvoice.currency}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: ADD / EDIT CUSTOMER ---------------- */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">
                {editingCustomer ? 'Müşteri Bilgilerini Düzenle' : 'Yeni Cari Kartı Aç'}
              </h3>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCustomerSubmit} className="space-y-4 mt-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Firma Ticari Unvanı *
                </label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="Bosch Termoteknik San. Tic. A.Ş."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Yetkili Kişi
                  </label>
                  <input
                    type="text"
                    value={custContact}
                    onChange={(e) => setCustContact(e.target.value)}
                    placeholder="Ahmet Yılmaz"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon</label>
                  <input
                    type="text"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="+90 216 444 00 00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-Posta</label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="muhasebe@firma.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Şehir</label>
                  <input
                    type="text"
                    value={custCity}
                    onChange={(e) => setCustCity(e.target.value)}
                    placeholder="İstanbul"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vergi Dairesi
                  </label>
                  <input
                    type="text"
                    value={custTaxOffice}
                    onChange={(e) => setCustTaxOffice(e.target.value)}
                    placeholder="Kozyatağı V.D."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vergi / TC Kimlik No
                  </label>
                  <input
                    type="text"
                    value={custTaxId}
                    onChange={(e) => setCustTaxId(e.target.value)}
                    placeholder="1920194821"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl"
                >
                  {editingCustomer ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: CONFIRM DELETE CUSTOMER ---------------- */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Cari Kartı Silinsin mi?</h3>
                <p className="text-xs text-slate-500">Bu işlem geri alınamaz.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl my-4 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block">{deletingCustomer.companyName}</span>
              <span className="font-mono text-slate-500 block">
                Cari Kod: {deletingCustomer.code} • VKN: {deletingCustomer.taxId}
              </span>
              {(deletingCustomer.balanceEUR !== 0 || deletingCustomer.balanceTRY !== 0) && (
                <span className="text-red-600 font-bold mt-1 block">
                  Dikkat: Bu firmanın açık bakiyesi bulunmaktadır (EUR: {deletingCustomer.balanceEUR}€ / TRY: {deletingCustomer.balanceTRY}₺)!
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={confirmDeleteCustomer}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Evet, Cariyi Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: MANUAL INVOICE ---------------- */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Yeni Fatura Kes</h3>
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvoiceSubmit} className="space-y-4 mt-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fatura Türü
                  </label>
                  <select
                    value={invType}
                    onChange={(e) => setInvType(e.target.value as InvoiceType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value="Gelir">Gelir (Kesilen Navlun)</option>
                    <option value="Gider">Gider (Alınan Masraf)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Müşteri / Cari Seçimi *
                  </label>
                  <select
                    value={invCustomerId}
                    onChange={(e) => setInvCustomerId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  İlişkili Sefer / CMR (Opsiyonel)
                </label>
                <select
                  value={invTripId}
                  onChange={(e) => {
                    const tId = e.target.value;
                    setInvTripId(tId);
                    const t = trips.find((item) => item.id === tId);
                    if (t) {
                      setInvSubtotal(t.freightPrice);
                      setInvCurrency(t.currency);
                      if (t.customerId) setInvCustomerId(t.customerId);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="">Sefer Seçimi Yapılmadı</option>
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.cmrNo}: {t.originCity} → {t.destinationCity} ({t.freightPrice} {t.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fatura Tarihi</label>
                  <input
                    type="date"
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Son Ödeme (Vade)</label>
                  <input
                    type="date"
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Matrah *</label>
                  <input
                    type="number"
                    required
                    value={invSubtotal}
                    onChange={(e) => setInvSubtotal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">KDV Oranı</label>
                  <select
                    value={invVatRate}
                    onChange={(e) => setInvVatRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value={0}>%0 Uluslararası (Md. 14)</option>
                    <option value={20}>%20 KDV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Para Birimi</label>
                  <select
                    value={invCurrency}
                    onChange={(e) => setInvCurrency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="TRY">TRY (₺)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fatura Notu</label>
                <input
                  type="text"
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl"
                >
                  Faturayı Kes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
