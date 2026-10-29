export type UserRole =
  | 'admin'
  | 'manager'
  | 'operations'
  | 'accounting'
  | 'driver'
  | 'customer'
  | 'supplier'
  | string;

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  role: UserRole;
  email: string;
  avatarColor: string;
  password?: string;
  linkedDriverId?: string;
  linkedCustomerId?: string;
  linkedSupplierId?: string;
}

export interface RolePermission {
  role: string;
  name: string;
  description: string;
  canViewDashboard: boolean;
  canManageVehicles: boolean;
  canManageTrips: boolean;
  canViewFreightRates: boolean;
  canManageExpenses: boolean;
  canManageAccounting: boolean;
  canConfigureSystem: boolean;
  canManageRoles: boolean;
  canApproveInvoices: boolean;
  allowedTabs: string[];
  isCustom?: boolean;
}

export interface CompanySettings {
  companyName: string;
  companyTaxId: string;
  companyTaxOffice: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyIbanEUR: string;
  companyIbanTRY: string;
  defaultVatRate: number;
}

// ----------------------------------------------------
// ARAÇ VE DORSE RESMİ EVRAKLARI (TRAILER & TRACTOR DOCS)
// ----------------------------------------------------
export type VehicleDocType =
  | 'Trafik Sigortası'
  | 'Kasko'
  | 'Yeşil Sigorta'
  | 'TÜV / Muayene'
  | 'Ruhsat'
  | 'ADR Uygunluk Belgesi'
  | 'Diğer';

export interface VehicleOfficialDoc {
  id: string;
  type: VehicleDocType;
  documentNo?: string;
  issueDate?: string;
  expiryDate: string;
  status: 'Geçerli' | 'Yakında Bitiyor' | 'Süresi Doldu';
  fileUrl?: string; // PDF veya JPEG / Görsel
  fileName?: string;
}

// ----------------------------------------------------
// ÇEKİCİ (TRACTOR)
// ----------------------------------------------------
export interface Tractor {
  id: string;
  plate: string;
  ownership: 'Öz Mal' | 'Kiralık' | 'İş Ortağı';
  brandModel: string;
  modelYear: number;
  odometerKm: number;
  status: 'Boş' | 'Yolda' | 'Bakımda';
  supplierName?: string;
  assignedTrailerPlate?: string;
  assignedDriverName?: string;
  currentLocationCity: string;
  currentLocationCountry: string;
  countryCode: string;
  lastMaintenanceDate: string;
  nextInspectionDate: string;
  fuelCardNo?: string;
  notes?: string;
  registrationDocUrl?: string;
  documents?: VehicleOfficialDoc[]; // Çekiciye ait resmi evrak listesi
  isEmptyAndAvailable?: boolean;
  availableRegion?: string;
  availableDate?: string;
  fuelType?: string;
  vehicleType?: string;
  fuelTankCapacity?: number;
  fuelNormPer100Km?: number;
}

// ----------------------------------------------------
// DORSE (TRAILER)
// ----------------------------------------------------
export type TrailerCategory =
  | 'Tenteli Orta'
  | 'Pilot'
  | 'Mega'
  | 'Frigorifik (Termo)'
  | 'Konteyner Taşıyıcı'
  | 'Damper'
  | 'Lowbed'
  | 'Sal Kasa';

export interface Trailer {
  id: string;
  plate: string;
  ownership: 'Öz Mal' | 'Kiralık' | 'İş Ortağı';
  type: TrailerCategory;
  capacityTons: number;
  capacityVolumeM3: number;
  modelYear: number;
  brandModel: string;
  status: 'Boş' | 'Yolda' | 'Bakımda';
  assignedTractorPlate?: string;
  coolingUnit?: string;
  thermoKingFuelTankCapacity?: number;
  tuvInspectionDate: string;
  insuranceDate: string;
  supplierName?: string;
  notes?: string;
  registrationDocUrl?: string;
  documents?: VehicleOfficialDoc[]; // Dorseye ait resmi evrak listesi
}

// ----------------------------------------------------
// SÜRÜCÜ (DRIVER) & RESMİ EVRAKLAR
// ----------------------------------------------------
export interface DriverOfficialDoc {
  id: string;
  type:
    | 'Ehliyet (CE)'
    | 'SRC-3 / SRC-4'
    | 'Psikoteknik'
    | 'Pasaport'
    | 'Schengen Vizesi'
    | 'Rusya/Kafkasya Vizesi'
    | 'Sağlık Raporu'
    | 'Kimlik';
  documentNo: string;
  issueDate: string;
  expiryDate: string;
  status: 'Geçerli' | 'Yakında Bitiyor' | 'Süresi Doldu';
  fileUrl?: string;
}

export interface Driver {
  id: string;
  fullName: string;
  phone: string;
  tcOrPassportNo: string;
  licenseClass: string;
  status: 'Aktif' | 'Seferde' | 'İzinli';
  currentTripId?: string;
  currentTractorPlate?: string;
  email?: string;
  emergencyContact?: string;
  totalTripsCount: number;
  documents: DriverOfficialDoc[];
}

export type VehicleType = 'Öz Mal' | 'Kiralık' | 'İş Ortağı';
export type VehicleStatus = 'Boş' | 'Yolda' | 'Bakımda';
export type TrailerType = TrailerCategory;

export interface Vehicle {
  id: string;
  plate: string;
  trailerPlate?: string;
  type: VehicleType;
  status: VehicleStatus;
  currentLocationCity: string;
  currentLocationCountry: string;
  countryCode: string;
  driverName: string;
  driverPhone: string;
  trailerType: TrailerType;
  capacityTons: number;
  capacityVolumeM3: number;
  modelYear: number;
  brandModel: string;
  lastMaintenanceDate: string;
  nextInspectionDate: string;
  odometerKm: number;
}

export type ShipmentType = 'Komple' | 'Parsiyel';
export type TripStatus = 'Hazırlanıyor' | 'Yolda' | 'Gümrükte' | 'Teslim Edildi' | 'İptal';
export type Currency = 'EUR' | 'USD' | 'TRY' | 'RUB';

export type Region =
  | 'Yurtiçi'
  | 'Avrupa'
  | 'Asya / Orta Asya'
  | 'Kafkasya'
  | 'Orta Doğu'
  | 'Rusya & Beyaz Rusya';

export type TransportMode =
  | 'Karayolu Standart'
  | 'Ro-Ro / Gemi'
  | 'Transit Koridor';

export interface TripAssignmentChange {
  id: string;
  tripId: string;
  changeDate: string;
  changedBy: string;
  location: string;
  reason: string;
  previousTractorPlate: string;
  newTractorPlate: string;
  previousTrailerPlate: string;
  newTrailerPlate: string;
  previousDriverName: string;
  newDriverName: string;
}

export interface Trip {
  id: string;
  cmrNo: string;
  customerId: string;
  customerName: string;
  shipmentType: ShipmentType;
  region: Region;
  transportMode: TransportMode;
  roRoRoute?: string;
  isDomestic?: boolean;
  domesticTransferType?: 'Şehirlerarası' | 'Liman Transferi' | 'Serbest Bölge / Antrepo';
  originCountry: string;
  originCity: string;
  destinationCountry: string;
  destinationCity: string;
  freightPrice: number;
  customerFreightPrice?: number;
  supplierFreightCost?: number;
  freightMarginEUR?: number;
  freightMarginPct?: number;
  currency: Currency;

  tractorId?: string;
  tractorPlate: string;
  trailerId?: string;
  trailerPlate: string;
  trailerType: TrailerCategory;
  ownership: 'Öz Mal' | 'Kiralık' | 'İş Ortağı';
  driverId?: string;
  driverName: string;
  driverPhone?: string;

  vehicleId?: string;
  vehiclePlate?: string;
  assignmentHistory?: TripAssignmentChange[];

  status: TripStatus;
  currentMilestone: string;
  departureDate: string;
  etaDate: string;
  deliveredDate?: string;
  cargoDescription: string;
  weightKg: number;
  palletCount: number;
  borderCrossings: string[];
  notes?: string;

  borderWaitHours?: number;
  demurrageFreeHours?: number;
  demurrageDailyRateEUR?: number;
  demurrageTotalEUR?: number;
  demurrageStatus?: 'Normal' | 'Demoraj Başladı' | 'Demoraj Faturalandı';

  extraExpenses?: TripExtraExpense[];
  signedContractUrl?: string;
  hasSignedContract?: boolean;
  contractId?: string;
  isArchivedLocked?: boolean;
}

export type TripExtraExpenseType =
  | 'Fazla Kilometre'
  | 'Gümrük Bekleme / Demoraj'
  | 'Acil Yük Masrafı'
  | 'Liman / Vinç Ek Ücreti'
  | 'Tartı / Kantar / Ceza'
  | 'Diğer Ek Masraf';

export type TripExtraExpenseStatus =
  | 'Beklemede'
  | 'Müşteriye Yansıtıldı'
  | 'Keser Karşıladı'
  | 'Reddedildi';

export interface TripExtraExpense {
  id: string;
  tripId: string;
  tripCmrNo: string;
  type: TripExtraExpenseType;
  submittedBy: string;
  submitterRole: 'driver' | 'supplier' | 'operations';
  amount: number;
  currency: Currency;
  description: string;
  receiptUrl?: string;
  date: string;
  status: TripExtraExpenseStatus;
  decision?: 'rebill_customer' | 'absorb_keser' | 'reject';
  rebillAmount?: number;
  rebillCurrency?: Currency;
  rebillInvoiceNo?: string;
  rejectionReason?: string;
  decisionNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export type ExpenseCategory =
  | 'Yakıt'
  | 'Ro-Ro / Gemi Bileti'
  | 'Otoyol'
  | 'Harcırah'
  | 'Gümrük'
  | 'Bakım'
  | 'Diğer';

export type ExpenseLocationGroup =
  | 'Türkiye İçi'
  | 'Ro-Ro / Gemi'
  | 'Transit Ülke'
  | 'Hedef Ülke';

export interface VehicleExpense {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  tripId?: string;
  tripCmrNo?: string;
  driverName: string;
  date: string;
  category: ExpenseCategory;
  locationGroup: ExpenseLocationGroup;
  countryOrPort: string;
  amount: number;
  currency: Currency;
  receiptNo: string;
  description: string;
  liters?: number;
  fuelStation?: string;
  km?: number;
  status?: 'approved' | 'pending';
  fuelNormExceeded?: boolean;
  actualConsumptionPer100Km?: number;
  consumptionVariancePct?: number;
  fuelAlertNote?: string;
  isArchivedLocked?: boolean;
}

export interface DriverPendingApproval {
  id: string;
  driverId: string;
  driverName: string;
  tractorPlate: string;
  tripId?: string;
  tripCmrNo?: string;
  type: 'Harcırah Avansı' | 'Yakıt Masrafı' | 'Otoyol / Vinyet' | 'Acil Tamir / Lastik' | 'Kantar / Belge' | 'Ceza';
  amount: number;
  currency: Currency;
  location: string;
  description: string;
  date: string;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface Customer {
  id: string;
  code: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  taxId: string;
  taxOffice: string;
  city: string;
  country: string;
  balanceEUR: number;
  balanceTRY: number;
  balances?: Partial<Record<Currency, number>>;
  totalTripsCount: number;
  status: 'Aktif' | 'Pasif';
}

export interface Supplier {
  id: string;
  code: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  taxId: string;
  city: string;
  country: string;
  payableBalanceEUR: number;
  payableBalanceTRY: number;
  balances?: Partial<Record<Currency, number>>;
  leasedTractorsCount: number;
  leasedTrailersCount: number;
  status: 'Aktif' | 'Pasif';
}

export type InvoiceType = 'Gelir' | 'Gider';
export type InvoiceStatus =
  | 'Taslak'
  | 'Fatura Kesildi'
  | 'Beklemede'
  | 'Tahsil Edildi / Ödendi'
  | 'pending_review'
  | 'İptal';

export interface Invoice {
  id: string;
  invoiceNo: string;
  type: InvoiceType;
  direction?: 'incoming' | 'outgoing';
  customerId: string;
  customerName: string;
  customerTaxId?: string;
  tripId?: string;
  tripCmrNo?: string;
  date: string;
  dueDate: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  currency: Currency;
  status: InvoiceStatus;
  paymentDate?: string;
  notes?: string;
  fileUrl?: string;
  fileName?: string;
  detectedSellerVkn?: string;
  detectedBuyerVkn?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export type NotificationType =
  | 'trip_status'
  | 'invoice_due'
  | 'vehicle_maintenance'
  | 'driver_approval'
  | 'freight_request'
  | 'contract'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
  priority: 'normal' | 'urgent';
  targetRoles: UserRole[];
  emailSent?: boolean;
  relatedEntityId?: string;
  actionTab?: string;
}

export interface NotificationSettings {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  notifyTripStatus: boolean;
  notifyInvoiceDue: boolean;
  notifyVehicleMaintenance: boolean;
  notifyDriverApprovals: boolean;
  notificationEmail: string;
}

export type TcmbRateType = 'forexBuying' | 'forexSelling' | 'banknoteBuying' | 'banknoteSelling';

export interface TcmbCurrencyRate {
  code: string;
  name: string;
  currencyName?: string;
  unit: number;
  forexBuying: number;
  forexSelling: number;
  banknoteBuying: number;
  banknoteSelling: number;
  crossRateUSD?: number;
}

export interface TcmbRatesData {
  success: boolean;
  date: string;
  bulletinNo: string;
  updatedAt: string;
  source: string;
  isFallback?: boolean;
  rates: Record<string, TcmbCurrencyRate>;
}

export type DocumentType =
  | 'CMR / Taşıma Belgesi'
  | 'Gümrük Beyannamesi'
  | 'Yakıt Fişi'
  | 'Otoyol & Vinyet Makbuzu'
  | 'Kantar / VGM Fişi'
  | 'Ro-Ro Gemi Bileti'
  | 'Ehliyet / SRC Belgesi'
  | 'Vize / Pasaport Belgesi'
  | 'Diğer Evrak';

export interface ArchivedDocument {
  id: string;
  title: string;
  type: DocumentType;
  relatedEntityType: 'trip' | 'expense' | 'vehicle' | 'driver' | 'customer' | 'general';
  relatedEntityId: string;
  relatedReferenceNo?: string;
  uploadDate: string;
  uploadedBy: string;
  fileUrl: string;
  fileName: string;
  fileSize?: string;
  notes?: string;
}

export interface WhatsAppLog {
  id: string;
  direction: 'outgoing' | 'incoming';
  phone: string;
  driverName: string;
  plate: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'received' | 'auto_parsed';
  parsedLocation?: string;
}

export interface WhatsAppMessageTemplate {
  id: string;
  title: string;
  text: string;
}

export type FreightRequestStatus = 'Yeni Talep' | 'İnceleniyor' | 'Sefer Planlandı' | 'Reddedildi';

export interface CustomerFreightRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerTaxId?: string;
  originCountry: string;
  originCity: string;
  destinationCountry: string;
  destinationCity: string;
  readyDate: string;
  cargoDescription: string;
  tonnage: number;
  palletCount?: number;
  trailerType: TrailerCategory;
  targetBudgetEUR?: number;
  notes?: string;
  status: FreightRequestStatus;
  createdAt: string;
  convertedTripId?: string;
  convertedTripCmrNo?: string;
}

export interface TransportContract {
  id: string;
  contractNo: string;
  partyType: 'customer' | 'supplier';
  partyId: string;
  partyName: string;
  partyTaxId: string;
  partyTaxOffice?: string;
  partyAddress?: string;
  tripId?: string;
  tripCmrNo?: string;
  origin: string;
  destination: string;
  cargoDescription: string;
  agreedPrice: number;
  currency: Currency;
  paymentTerms: string;
  demurrageTerms: string;
  specialClauses: string[];
  status: 'Taslak' | 'Onay Bekliyor' | 'İmzalandı / Kaşelendi' | 'İptal';
  signedContractUrl?: string;
  signedAt?: string;
  createdAt: string;
  createdByName: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'RESTORE' | 'BACKUP' | 'LOGIN';
  entityType: 'Trip' | 'Invoice' | 'Expense' | 'Vehicle' | 'Driver' | 'User' | 'Contract' | 'FreightRequest' | 'System';
  entityId: string;
  entityDescription: string;
  ipAddress?: string;
  details?: string;
}