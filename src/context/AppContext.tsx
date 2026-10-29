import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  RolePermission,
  Vehicle,
  Trip,
  VehicleExpense,
  Customer,
  Supplier,
  Invoice,
  InvoiceType,
  AppNotification,
  NotificationSettings,
  TripStatus,
  InvoiceStatus,
  TcmbRatesData,
  TcmbRateType,
  ArchivedDocument,
  DocumentType,
  WhatsAppLog,
  WhatsAppMessageTemplate,
  Tractor,
  Trailer,
  Driver,
  DriverOfficialDoc,
  DriverPendingApproval,
  TrailerCategory,
  TripAssignmentChange,
  CompanySettings,
  ExpirableDocApproval,
  Currency,
  CustomerFreightRequest,
  FreightRequestStatus,
  TransportContract,
  AuditLog,
} from '../types';
import {
  INITIAL_USERS,
  ROLE_PERMISSIONS,
  INITIAL_VEHICLES,
  INITIAL_TRIPS,
  INITIAL_EXPENSES,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_INVOICES,
  INITIAL_NOTIFICATIONS,
  INITIAL_NOTIFICATION_SETTINGS,
  INITIAL_DOCUMENTS,
  INITIAL_WHATSAPP_TEMPLATES,
  INITIAL_WHATSAPP_LOGS,
  INITIAL_TRACTORS,
  INITIAL_TRAILERS,
  INITIAL_DRIVERS,
  INITIAL_APPROVALS,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_EXPIRABLE_APPROVALS,
  INITIAL_FREIGHT_REQUESTS,
  INITIAL_CONTRACTS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import { syncEntityToSupabase } from '../lib/supabase';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'info' | 'error' | 'warning';
}

export interface DocumentUploadTarget {
  relatedEntityType: 'trip' | 'expense' | 'vehicle' | 'driver' | 'customer' | 'general';
  relatedEntityId: string;
  referenceNo?: string;
  defaultType?: DocumentType;
}

interface AppContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  permissions: RolePermission;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  users: UserProfile[];
  addUser: (user: Omit<UserProfile, 'id'>) => void;
  updateUser: (id: string, updates: Partial<UserProfile>) => void;
  deleteUser: (id: string) => void;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isUserManagementModalOpen: boolean;
  setIsUserManagementModalOpen: (open: boolean) => void;

  // Dynamic Roles & Permissions
  roles: Record<string, RolePermission>;
  addCustomRole: (role: RolePermission) => void;
  updateRolePermission: (roleKey: string, updates: Partial<RolePermission>) => void;
  deleteCustomRole: (roleKey: string) => boolean;

  // Company Settings (VKN, Adres vb.)
  companySettings: CompanySettings;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;
  isCompanySettingsModalOpen: boolean;
  setIsCompanySettingsModalOpen: (open: boolean) => void;

  // Smart Invoices & Approvals
  uploadInvoiceWithVkn: (invoiceData: {
    invoiceNo: string;
    sellerVkn: string;
    buyerVkn: string;
    otherPartyName: string;
    date: string;
    dueDate: string;
    subtotal: number;
    vatRate: number;
    currency: Currency;
    notes?: string;
    fileUrl?: string;
    fileName?: string;
  }) => Invoice;
  approveInvoice: (id: string) => void;
  rejectInvoice: (id: string, reason: string) => void;
  editInvoice: (id: string, updates: Partial<Invoice>) => void;

  // Expirable Documents Approvals (Ehliyet, SRC, TÜV, Vize)
  expirableApprovals: ExpirableDocApproval[];
  addExpirableApprovalRequest: (req: Omit<ExpirableDocApproval, 'id' | 'status' | 'submittedAt'>) => void;
  approveExpirableDoc: (id: string) => void;
  rejectExpirableDoc: (id: string, reason: string) => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Tractors (Çekiciler)
  tractors: Tractor[];
  addTractor: (tractor: Omit<Tractor, 'id'>) => void;
  updateTractor: (id: string, updates: Partial<Tractor>) => void;
  deleteTractor: (id: string) => void;

  // Trailers (Dorseler)
  trailers: Trailer[];
  addTrailer: (trailer: Omit<Trailer, 'id'>) => void;
  updateTrailer: (id: string, updates: Partial<Trailer>) => void;
  deleteTrailer: (id: string) => void;

  // Drivers (Sürücüler)
  drivers: Driver[];
  addDriver: (driver: Omit<Driver, 'id' | 'totalTripsCount'>) => void;
  updateDriver: (id: string, updates: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
  addDriverDocument: (driverId: string, doc: Omit<DriverOfficialDoc, 'id'>) => void;

  // Suppliers (Tedarikçi / Taşeronlar)
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'code'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Legacy vehicles compatibility
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  // Trips & Dynamic Series
  trips: Trip[];
  generateDynamicTripCode: (trailerType: string, ownership: 'Öz Mal' | 'Kiralık') => string;
  addTrip: (trip: Omit<Trip, 'id' | 'cmrNo'>) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  updateTripStatus: (tripId: string, status: TripStatus, milestone?: string) => void;
  deleteTrip: (id: string) => void;
  reassignTripEquipment: (tripId: string, params: {
    newTractorPlate?: string;
    newTrailerPlate?: string;
    newTrailerType?: TrailerCategory;
    newDriverName?: string;
    newDriverPhone?: string;
    reason: string;
    location: string;
  }) => void;

  // Expenses
  expenses: VehicleExpense[];
  addExpense: (expense: Omit<VehicleExpense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  // Operations Approval Desk (Onay/Red Masası)
  pendingApprovals: DriverPendingApproval[];
  addDriverApprovalRequest: (req: Omit<DriverPendingApproval, 'id' | 'date' | 'status'>) => void;
  approveDriverRequest: (id: string) => void;
  rejectDriverRequest: (id: string, reason: string) => void;

  // Customers (Cari Hesaplar)
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'code'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => boolean;

  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoiceStatus: (id: string, status: InvoiceStatus, paymentDate?: string) => void;
  deleteInvoice: (id: string) => void;

  // Notifications
  notifications: AppNotification[];
  roleNotifications: AppNotification[];
  unreadCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  createNotification: (notif: Omit<AppNotification, 'id' | 'date' | 'read'>) => void;

  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  sendSimulatedEmail: (to: string, subject: string, body: string, type: string) => Promise<boolean>;

  // Toast
  toast: ToastState;
  showToast: (message: string, type?: ToastState['type']) => void;
  hideToast: () => void;

  // TCMB Exchange Rates
  tcmbData: TcmbRatesData | null;
  loadingRates: boolean;
  fetchTcmbRates: () => Promise<void>;
  convertCurrency: (amount: number, from: string, to: string, rateType?: TcmbRateType) => number;
  isCurrencyModalOpen: boolean;
  setIsCurrencyModalOpen: (open: boolean) => void;

  // Document & Receipt Archive
  documents: ArchivedDocument[];
  addDocument: (doc: Omit<ArchivedDocument, 'id' | 'uploadDate'>) => void;
  deleteDocument: (id: string) => void;
  activeDocumentPreview: ArchivedDocument | null;
  setActiveDocumentPreview: (doc: ArchivedDocument | null) => void;
  isDocumentUploadModalOpen: boolean;
  setIsDocumentUploadModalOpen: (open: boolean) => void;
  documentUploadTarget: DocumentUploadTarget | null;
  openDocumentUpload: (target: DocumentUploadTarget) => void;
  closeDocumentUpload: () => void;

  // WhatsApp Driver Automation
  whatsAppLogs: WhatsAppLog[];
  whatsAppTemplates: WhatsAppMessageTemplate[];
  isWhatsAppModalOpen: boolean;
  setIsWhatsAppModalOpen: (open: boolean) => void;
  selectedVehicleForWhatsApp: Vehicle | null;
  setSelectedVehicleForWhatsApp: (v: Vehicle | null) => void;
  openWhatsAppQuery: (vehicle?: Vehicle) => void;
  sendWhatsAppQuery: (plate: string, templateText?: string) => void;
  sendBulkWhatsAppQuery: (plates: string[], templateText?: string) => void;
  simulateIncomingWhatsAppMessage: (rawMessage: string) => {
    success: boolean;
    plate?: string;
    location?: string;
    message: string;
  };

  // Customer Freight Requests (Müşteri Yük Talepleri)
  freightRequests: CustomerFreightRequest[];
  addFreightRequest: (req: Omit<CustomerFreightRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateFreightRequestStatus: (id: string, status: FreightRequestStatus, tripId?: string, tripCmrNo?: string) => void;

  // Dynamic Transport Contracts (Taşıma Sözleşmeleri)
  contracts: TransportContract[];
  addContract: (contract: Omit<TransportContract, 'id' | 'createdAt' | 'contractNo'>) => TransportContract;
  updateContract: (id: string, updates: Partial<TransportContract>) => void;
  uploadSignedContract: (contractId: string, signedContractUrl: string, tripId?: string) => void;
  isContractModalOpen: boolean;
  setIsContractModalOpen: (open: boolean) => void;
  contractModalTrip: Trip | null;
  openContractModalForTrip: (trip?: Trip | null) => void;

  // Subcontractor Vehicle Availability & Registration (Ruhsat)
  setTractorAvailability: (tractorId: string, isAvailable: boolean, region?: string) => void;

  // Demurrage (Gümrük Bekleme) & Trip Updates
  updateTripDemurrage: (tripId: string, waitHours: number, freeHours?: number, dailyRate?: number) => void;

  // Audit Logs & Cybersecurity (KVKK Maskeleme & RLS)
  auditLogs: AuditLog[];
  addAuditLog: (entry: Omit<AuditLog, 'id' | 'timestamp' | 'userId' | 'userName' | 'userRole'>) => void;
  isAuditModalOpen: boolean;
  setIsAuditModalOpen: (open: boolean) => void;
  isKvkkMaskingActive: boolean;
  setIsKvkkMaskingActive: React.Dispatch<React.SetStateAction<boolean>>;
  maskSensitiveText: (val: string, type?: 'tc' | 'phone' | 'vkn' | 'iban') => string;

  // Backup & Restore
  isBackupRestoreModalOpen: boolean;
  setIsBackupRestoreModalOpen: (open: boolean) => void;
  exportBackupJson: () => string;
  restoreBackupJson: (jsonString: string) => boolean;

  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Users & Auth
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('translogix_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('translogix_user_id') || 'user-admin';
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];
  const currentRole = currentUser.role;

  // Dynamic Roles (RBAC)
  const [roles, setRoles] = useState<Record<string, RolePermission>>(() => {
    const saved = localStorage.getItem('translogix_role_permissions');
    return saved ? JSON.parse(saved) : ROLE_PERMISSIONS;
  });

  const permissions = roles[currentRole] || roles.admin || ROLE_PERMISSIONS.admin;

  // Company Settings (VKN, Vergi Dairesi, İban)
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem('translogix_company_settings');
    return saved ? JSON.parse(saved) : INITIAL_COMPANY_SETTINGS;
  });
  const [isCompanySettingsModalOpen, setIsCompanySettingsModalOpen] = useState(false);

  // Expirable Official Documents Approvals (Ehliyet, SRC, Muayene, Vize)
  const [expirableApprovals, setExpirableApprovals] = useState<ExpirableDocApproval[]>(() => {
    const saved = localStorage.getItem('translogix_expirable_approvals');
    return saved ? JSON.parse(saved) : INITIAL_EXPIRABLE_APPROVALS;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Enforce role-based menu isolation: auto-switch away from unauthorized tabs
  useEffect(() => {
    const allowed = permissions.allowedTabs || [];
    if (allowed.length > 0 && !allowed.includes(activeTab)) {
      setActiveTab(allowed[0]);
    }
  }, [currentRole, permissions, activeTab]);

  // Discrete Entities: Tractors, Trailers, Drivers, Suppliers
  const [tractors, setTractors] = useState<Tractor[]>(() => {
    const saved = localStorage.getItem('translogix_tractors');
    return saved ? JSON.parse(saved) : INITIAL_TRACTORS;
  });

  const [trailers, setTrailers] = useState<Trailer[]>(() => {
    const saved = localStorage.getItem('translogix_trailers');
    return saved ? JSON.parse(saved) : INITIAL_TRAILERS;
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('translogix_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('translogix_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  // Backward compatibility vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('translogix_vehicles');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem('translogix_trips');
    return saved ? JSON.parse(saved) : INITIAL_TRIPS;
  });

  const [expenses, setExpenses] = useState<VehicleExpense[]>(() => {
    const saved = localStorage.getItem('translogix_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [pendingApprovals, setPendingApprovals] = useState<DriverPendingApproval[]>(() => {
    const saved = localStorage.getItem('translogix_approvals');
    return saved ? JSON.parse(saved) : INITIAL_APPROVALS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('translogix_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('translogix_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('translogix_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('translogix_settings');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATION_SETTINGS;
  });

  // Document Archive State
  const [documents, setDocuments] = useState<ArchivedDocument[]>(() => {
    const saved = localStorage.getItem('translogix_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });
  const [activeDocumentPreview, setActiveDocumentPreview] = useState<ArchivedDocument | null>(null);
  const [isDocumentUploadModalOpen, setIsDocumentUploadModalOpen] = useState(false);
  const [documentUploadTarget, setDocumentUploadTarget] = useState<DocumentUploadTarget | null>(null);

  // WhatsApp Automation State
  const [whatsAppLogs, setWhatsAppLogs] = useState<WhatsAppLog[]>(() => {
    const saved = localStorage.getItem('translogix_whatsapp_logs');
    return saved ? JSON.parse(saved) : INITIAL_WHATSAPP_LOGS;
  });
  const [whatsAppTemplates] = useState<WhatsAppMessageTemplate[]>(INITIAL_WHATSAPP_TEMPLATES);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedVehicleForWhatsApp, setSelectedVehicleForWhatsApp] = useState<Vehicle | null>(null);

  // TCMB Exchange Rates State
  const [tcmbData, setTcmbData] = useState<TcmbRatesData | null>(() => {
    const saved = localStorage.getItem('translogix_tcmb_rates');
    return saved ? JSON.parse(saved) : null;
  });
  const [loadingRates, setLoadingRates] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info',
  });

  const showToast = (message: string, type: ToastState['type'] = 'info') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  // Customer Freight Requests (Müşteri Yük Talepleri)
  const [freightRequests, setFreightRequests] = useState<CustomerFreightRequest[]>(() => {
    const saved = localStorage.getItem('translogix_freight_requests');
    return saved ? JSON.parse(saved) : INITIAL_FREIGHT_REQUESTS;
  });

  // Dynamic Transport Contracts (Taşıma Sözleşmeleri)
  const [contracts, setContracts] = useState<TransportContract[]>(() => {
    const saved = localStorage.getItem('translogix_contracts');
    return saved ? JSON.parse(saved) : INITIAL_CONTRACTS;
  });
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractModalTrip, setContractModalTrip] = useState<Trip | null>(null);

  // Audit Logs & KVKK Data Masking
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('translogix_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isKvkkMaskingActive, setIsKvkkMaskingActive] = useState(false);

  // Backup & Restore Modal State
  const [isBackupRestoreModalOpen, setIsBackupRestoreModalOpen] = useState(false);

  // Persistent Storage Sync
  useEffect(() => {
    localStorage.setItem('translogix_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('translogix_user_id', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('translogix_tractors', JSON.stringify(tractors));
  }, [tractors]);

  useEffect(() => {
    localStorage.setItem('translogix_trailers', JSON.stringify(trailers));
  }, [trailers]);

  useEffect(() => {
    localStorage.setItem('translogix_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('translogix_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('translogix_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('translogix_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('translogix_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('translogix_approvals', JSON.stringify(pendingApprovals));
  }, [pendingApprovals]);

  useEffect(() => {
    localStorage.setItem('translogix_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('translogix_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('translogix_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('translogix_settings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  useEffect(() => {
    localStorage.setItem('translogix_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('translogix_whatsapp_logs', JSON.stringify(whatsAppLogs));
  }, [whatsAppLogs]);

  useEffect(() => {
    localStorage.setItem('translogix_role_permissions', JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem('translogix_company_settings', JSON.stringify(companySettings));
  }, [companySettings]);

  useEffect(() => {
    localStorage.setItem('translogix_expirable_approvals', JSON.stringify(expirableApprovals));
  }, [expirableApprovals]);

  useEffect(() => {
    localStorage.setItem('translogix_freight_requests', JSON.stringify(freightRequests));
  }, [freightRequests]);

  useEffect(() => {
    localStorage.setItem('translogix_contracts', JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem('translogix_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Auth & User Management Methods
  const login = (email: string, password?: string): boolean => {
    const matched = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (matched) {
      if (password && matched.password && matched.password !== password) {
        showToast('Hatalı şifre girdiniz.', 'error');
        return false;
      }
      setCurrentUserId(matched.id);
      setIsLoginModalOpen(false);
      showToast(`Giriş başarılı: Hoş geldiniz Sayın ${matched.name}`, 'success');
      return true;
    }
    showToast('Kullanıcı e-posta adresi bulunamadı.', 'error');
    return false;
  };

  const logout = () => {
    setCurrentUserId('user-admin');
    showToast('Oturum kapatıldı, demo yönetici profiline geçildi.', 'info');
  };

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUserId(userId);
      showToast(`Kullanıcı profili: ${found.name} (${ROLE_PERMISSIONS[found.role]?.name || found.role})`, 'info');
    }
  };

  const switchRole = (role: UserRole) => {
    const userForRole = users.find((u) => u.role === role);
    if (userForRole) {
      setCurrentUserId(userForRole.id);
      showToast(`Rol aktif edildi: ${ROLE_PERMISSIONS[role]?.name || role}`, 'info');
    }
  };

  const addUser = (userData: Omit<UserProfile, 'id'>) => {
    const newUser: UserProfile = {
      ...userData,
      id: 'user-' + Date.now(),
    };
    setUsers((prev) => [...prev, newUser]);
    showToast(`${newUser.name} kullanıcısı sisteme eklendi.`, 'success');
  };

  const updateUser = (id: string, updates: Partial<UserProfile>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    showToast('Kullanıcı yetki ve profil bilgileri güncellendi.', 'success');
  };

  const deleteUser = (id: string) => {
    if (users.length <= 1) {
      showToast('Sistemde en az bir yönetici kullanıcı bulunmalıdır.', 'error');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast('Kullanıcı hesabı silindi.', 'warning');
  };

  // RBAC Role Management (Admin & Manager only)
  const addCustomRole = (newRole: RolePermission) => {
    if (currentRole !== 'admin' && currentRole !== 'manager') {
      showToast('Rol oluşturma işlemi yalnızca Yönetici (Admin) ve Müdür yetkisindedir!', 'error');
      return;
    }
    setRoles((prev) => ({
      ...prev,
      [newRole.role]: newRole,
    }));
    showToast(`"${newRole.name}" yeni rol matrisine eklendi.`, 'success');
  };

  const updateRolePermission = (roleKey: string, updates: Partial<RolePermission>) => {
    if (currentRole !== 'admin' && currentRole !== 'manager') {
      showToast('Yetki değiştirme işlemi yalnızca Yönetici (Admin) ve Müdür yetkisindedir!', 'error');
      return;
    }
    setRoles((prev) => {
      if (!prev[roleKey]) return prev;
      return {
        ...prev,
        [roleKey]: {
          ...prev[roleKey],
          ...updates,
        },
      };
    });
    showToast(`"${roles[roleKey]?.name || roleKey}" rol yetkileri güncellendi.`, 'success');
  };

  const deleteCustomRole = (roleKey: string): boolean => {
    if (currentRole !== 'admin' && currentRole !== 'manager') {
      showToast('Rol silme işlemi yalnızca Yönetici (Admin) ve Müdür yetkisindedir!', 'error');
      return false;
    }
    const protectedRoles = ['admin', 'manager', 'operations', 'accounting', 'driver', 'customer', 'supplier'];
    if (protectedRoles.includes(roleKey)) {
      showToast('Sistem çekirdek rolleri (Admin, Müdür, Operasyon vb.) silinemez!', 'error');
      return false;
    }
    setRoles((prev) => {
      const copy = { ...prev };
      delete copy[roleKey];
      return copy;
    });
    showToast(`"${roleKey}" rolü sistemden silindi.`, 'warning');
    return true;
  };

  // Company Settings
  const updateCompanySettings = (settings: Partial<CompanySettings>) => {
    if (currentRole !== 'admin' && currentRole !== 'manager') {
      showToast('Şirket VKN ve mali ayarları yalnızca Yönetici ve Müdür değiştirebilir!', 'error');
      return;
    }
    setCompanySettings((prev) => ({ ...prev, ...settings }));
    showToast('Şirket VKN ve resmi ayarları güncellendi.', 'success');
  };

  // Dynamic Series Code Generator
  const generateDynamicTripCode = (trailerType: string, ownership: 'Öz Mal' | 'Kiralık'): string => {
    let typePrefix = 'TNT';
    const t = (trailerType || '').toLowerCase();
    if (t.includes('frig') || t.includes('termo')) typePrefix = 'FRG';
    else if (t.includes('tent') || t.includes('mega')) typePrefix = 'TNT';
    else if (t.includes('damp')) typePrefix = 'DMP';
    else if (t.includes('kont')) typePrefix = 'KNT';
    else if (t.includes('low')) typePrefix = 'LWB';
    else if (t.includes('sal')) typePrefix = 'SAL';

    const ownPrefix = ownership === 'Öz Mal' ? 'OZ' : 'KR';
    const year = 2026;
    const prefix = `${typePrefix}-${ownPrefix}-${year}`;
    const count = trips.filter((tr) => tr.cmrNo?.startsWith(prefix)).length + 1;
    const seq = String(count).padStart(3, '0');
    return `${prefix}-${seq}`;
  };

  // Tractor CRUD
  const addTractor = (tData: Omit<Tractor, 'id'>) => {
    const newTractor: Tractor = {
      ...tData,
      id: 'trc-' + Date.now(),
    };
    setTractors((prev) => [newTractor, ...prev]);
    syncEntityToSupabase('tractors', newTractor);
    showToast(`${newTractor.plate} çekici aracı filoya eklendi.`, 'success');
  };

  const updateTractor = (id: string, updates: Partial<Tractor>) => {
    setTractors((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    showToast('Çekici bilgileri güncellendi.', 'success');
  };

  const deleteTractor = (id: string) => {
    const activeTrip = trips.find((t) => t.tractorPlate === tractors.find((tr) => tr.id === id)?.plate && t.status !== 'Teslim Edildi');
    if (activeTrip) {
      showToast('Aktif seferde olan çekici silinemez! Önce seferi tamamlayın veya araç değişimi yapın.', 'error');
      return;
    }
    setTractors((prev) => prev.filter((t) => t.id !== id));
    showToast('Çekici araç kaydı silindi.', 'warning');
  };

  // Trailer CRUD
  const addTrailer = (trlData: Omit<Trailer, 'id'>) => {
    const newTrailer: Trailer = {
      ...trlData,
      id: 'trl-' + Date.now(),
    };
    setTrailers((prev) => [newTrailer, ...prev]);
    syncEntityToSupabase('trailers', newTrailer);
    showToast(`${newTrailer.plate} (${newTrailer.type}) dorse filoya eklendi.`, 'success');
  };

  const updateTrailer = (id: string, updates: Partial<Trailer>) => {
    setTrailers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    showToast('Dorse bilgileri güncellendi.', 'success');
  };

  const deleteTrailer = (id: string) => {
    setTrailers((prev) => prev.filter((t) => t.id !== id));
    showToast('Dorse kaydı silindi.', 'warning');
  };

  // Driver CRUD
  const addDriver = (drvData: Omit<Driver, 'id' | 'totalTripsCount'>) => {
    const newDriver: Driver = {
      ...drvData,
      id: 'drv-' + Date.now(),
      totalTripsCount: 0,
    };
    setDrivers((prev) => [newDriver, ...prev]);
    syncEntityToSupabase('drivers', newDriver);
    showToast(`${newDriver.fullName} kaptan sisteme kaydedildi.`, 'success');
  };

  const updateDriver = (id: string, updates: Partial<Driver>) => {
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    showToast('Şoför bilgileri güncellendi.', 'success');
  };

  const deleteDriver = (id: string) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
    showToast('Şoför kaydı silindi.', 'warning');
  };

  const addDriverDocument = (driverId: string, docData: Omit<DriverOfficialDoc, 'id'>) => {
    const newDoc: DriverOfficialDoc = {
      ...docData,
      id: 'doc-drv-' + Date.now(),
    };
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, documents: [newDoc, ...d.documents] } : d))
    );
    showToast(`${docData.type} evrakı şoför dosyasına eklendi.`, 'success');
  };

  // Supplier CRUD
  const addSupplier = (sData: Omit<Supplier, 'id' | 'code'>) => {
    const code = `TED-${2000 + suppliers.length + 1}`;
    const newSupplier: Supplier = {
      ...sData,
      id: 'supp-' + Date.now(),
      code,
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
    showToast(`${newSupplier.companyName} taşeron/tedarikçi kaydı açıldı.`, 'success');
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    showToast('Tedarikçi bilgileri güncellendi.', 'success');
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    showToast('Tedarikçi kaydı silindi.', 'warning');
  };

  // Legacy Vehicle methods
  const addVehicle = (newVehData: Omit<Vehicle, 'id'>) => {
    const newVeh: Vehicle = {
      ...newVehData,
      id: 'veh-' + Date.now(),
    };
    setVehicles((prev) => [newVeh, ...prev]);
    showToast(`${newVeh.plate} plakalı araç eklendi.`, 'success');
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
    showToast('Araç güncellendi.', 'success');
  };

  const deleteVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    showToast('Araç silindi.', 'warning');
  };

  // Trip operations
  const addTrip = (newTripData: Omit<Trip, 'id' | 'cmrNo'>) => {
    const cmrNo = generateDynamicTripCode(newTripData.trailerType, newTripData.ownership);
    const newTrip: Trip = {
      ...newTripData,
      id: 'trip-' + Date.now(),
      cmrNo,
    };

    setTrips((prev) => [newTrip, ...prev]);
    syncEntityToSupabase('trips', newTrip);

    // Update tractor & trailer status to "Yolda"
    if (newTrip.tractorPlate) {
      setTractors((prev) =>
        prev.map((t) => (t.plate === newTrip.tractorPlate ? { ...t, status: 'Yolda' } : t))
      );
    }
    if (newTrip.trailerPlate) {
      setTrailers((prev) =>
        prev.map((t) => (t.plate === newTrip.trailerPlate ? { ...t, status: 'Yolda' } : t))
      );
    }

    if (notificationSettings.notifyTripStatus) {
      createNotification({
        type: 'trip_status',
        title: `Yeni Sefer Başlatıldı: ${cmrNo}`,
        message: `${newTrip.tractorPlate} / ${newTrip.trailerPlate} (${newTrip.trailerType}) -> ${newTrip.originCity} - ${newTrip.destinationCity}`,
        priority: 'normal',
        targetRoles: ['admin', 'operations', 'accounting'],
        actionTab: 'trips',
        relatedEntityId: newTrip.id,
      });
    }

    showToast(`${cmrNo} nolu sefer dinamik seri kodu ile oluşturuldu.`, 'success');
  };

  const updateTrip = (id: string, updates: Partial<Trip>) => {
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    showToast('Sefer ayrıntıları güncellendi.', 'success');
  };

  const updateTripStatus = (tripId: string, status: TripStatus, milestone?: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    const updates: Partial<Trip> = { status };
    if (milestone) updates.currentMilestone = milestone;
    if (status === 'Teslim Edildi') {
      updates.deliveredDate = new Date().toISOString().split('T')[0];
      // Free the tractor & trailer
      if (trip.tractorPlate) {
        setTractors((prev) =>
          prev.map((t) =>
            t.plate === trip.tractorPlate
              ? {
                  ...t,
                  status: 'Boş',
                  currentLocationCity: trip.destinationCity,
                  currentLocationCountry: trip.destinationCountry,
                }
              : t
          )
        );
      }
      if (trip.trailerPlate) {
        setTrailers((prev) =>
          prev.map((t) => (t.plate === trip.trailerPlate ? { ...t, status: 'Boş' } : t))
        );
      }
    }

    setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, ...updates } : t)));

    createNotification({
      type: 'trip_status',
      title: `${trip.cmrNo}: ${status}`,
      message: `${trip.tractorPlate} - ${trip.originCity} -> ${trip.destinationCity}: ${milestone || status}`,
      priority: status === 'Teslim Edildi' ? 'normal' : 'normal',
      targetRoles: ['admin', 'operations', 'accounting', 'customer'],
      actionTab: 'trips',
      relatedEntityId: trip.id,
    });

    showToast(`Sefer durumu "${status}" olarak güncellendi.`, 'success');
  };

  const deleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
    showToast('Sefer kaydı silindi.', 'warning');
  };

  // Mid-Trip Equipment Reassignment
  const reassignTripEquipment = (
    tripId: string,
    params: {
      newTractorPlate?: string;
      newTrailerPlate?: string;
      newTrailerType?: TrailerCategory;
      newDriverName?: string;
      newDriverPhone?: string;
      reason: string;
      location: string;
    }
  ) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    const changeRecord: TripAssignmentChange = {
      id: 'chg-' + Date.now(),
      tripId,
      changeDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      changedBy: `${currentUser.name} (${ROLE_PERMISSIONS[currentRole].name})`,
      location: params.location || 'Yol Güzergahı',
      reason: params.reason || 'Operasyonel ekipman değişimi',
      previousTractorPlate: trip.tractorPlate,
      newTractorPlate: params.newTractorPlate || trip.tractorPlate,
      previousTrailerPlate: trip.trailerPlate,
      newTrailerPlate: params.newTrailerPlate || trip.trailerPlate,
      previousDriverName: trip.driverName,
      newDriverName: params.newDriverName || trip.driverName,
    };

    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId
          ? {
              ...t,
              tractorPlate: params.newTractorPlate || t.tractorPlate,
              trailerPlate: params.newTrailerPlate || t.trailerPlate,
              trailerType: params.newTrailerType || t.trailerType,
              driverName: params.newDriverName || t.driverName,
              driverPhone: params.newDriverPhone || t.driverPhone,
              assignmentHistory: [changeRecord, ...(t.assignmentHistory || [])],
            }
          : t
      )
    );

    // Update equipment statuses
    if (params.newTractorPlate && params.newTractorPlate !== trip.tractorPlate) {
      setTractors((prev) =>
        prev.map((tr) => {
          if (tr.plate === trip.tractorPlate) return { ...tr, status: 'Boş' };
          if (tr.plate === params.newTractorPlate) return { ...tr, status: 'Yolda' };
          return tr;
        })
      );
    }

    if (params.newTrailerPlate && params.newTrailerPlate !== trip.trailerPlate) {
      setTrailers((prev) =>
        prev.map((tr) => {
          if (tr.plate === trip.trailerPlate) return { ...tr, status: 'Boş' };
          if (tr.plate === params.newTrailerPlate) return { ...tr, status: 'Yolda' };
          return tr;
        })
      );
    }

    createNotification({
      type: 'trip_status',
      title: `Sefer Ekipman Değişimi: ${trip.cmrNo}`,
      message: `${params.location} noktasında araç/dorse/şoför değişikliği yapıldı: ${params.reason}`,
      priority: 'urgent',
      targetRoles: ['admin', 'operations'],
      actionTab: 'trips',
      relatedEntityId: trip.id,
    });

    showToast('Sefer ekipman ve şoför ataması güncellendi, tarihçeye işlendi.', 'success');
  };

  // Expenses with Fuel Norm Analysis
  const addExpense = (expData: Omit<VehicleExpense, 'id'>) => {
    let fuelNormExceeded = false;
    let actualConsumptionPer100Km: number | undefined;
    let consumptionVariancePct: number | undefined;
    let fuelAlertNote: string | undefined;

    // Yakıt Tüketim ve Kilometre Analizi
    if (expData.category === 'Yakıt' && expData.liters && expData.liters > 0) {
      const tractor = tractors.find((t) => t.plate === expData.vehiclePlate);
      const norm = tractor?.fuelNormPer100Km || 29.5; // Standard 29.5 L/100km
      // If trip distance or km provided
      const estimatedKm = 1000; // baseline distance per refueling batch
      const calculatedConsumption = Math.round(((expData.liters / estimatedKm) * 100) * 10) / 10;
      actualConsumptionPer100Km = calculatedConsumption;
      
      // Check if exceeds standard norm by > 15%
      if (calculatedConsumption > norm * 1.15) {
        fuelNormExceeded = true;
        consumptionVariancePct = Math.round(((calculatedConsumption - norm) / norm) * 100);
        fuelAlertNote = `Standart Norm: ${norm} L/100km • Fiili: ${calculatedConsumption} L/100km (+%${consumptionVariancePct} Anormal Tüketim)`;

        createNotification({
          type: 'vehicle_maintenance',
          title: `🚨 Anormal Yakıt Tüketim Uyarısı: ${expData.vehiclePlate}`,
          message: `${expData.vehiclePlate} plakalı araçta ${expData.liters} Lt yakıt alımı normu (+%${consumptionVariancePct}) aştı! ${fuelAlertNote}`,
          priority: 'urgent',
          targetRoles: ['admin', 'manager', 'accounting', 'operations'],
          actionTab: 'expenses',
        });
      }
    }

    const newExp: VehicleExpense = {
      ...expData,
      id: 'exp-' + Date.now(),
      fuelNormExceeded,
      actualConsumptionPer100Km,
      consumptionVariancePct,
      fuelAlertNote,
    };
    setExpenses((prev) => [newExp, ...prev]);
    syncEntityToSupabase('expenses', newExp);

    addAuditLog({
      action: 'CREATE',
      entityType: 'Expense',
      entityId: newExp.id,
      entityDescription: `${newExp.vehiclePlate} için ${newExp.amount} ${newExp.currency} ${newExp.category} masrafı işlendi`,
      details: fuelAlertNote || `${newExp.description} (${newExp.countryOrPort})`,
    });

    if (fuelNormExceeded) {
      showToast(`DİKKAT: ${newExp.vehiclePlate} yakıt tüketim normunu %${consumptionVariancePct} oranında aştı!`, 'warning');
    } else {
      showToast(`${newExp.vehiclePlate} için ${newExp.amount} ${newExp.currency} ${newExp.category} masrafı işlendi.`, 'success');
    }
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('Masraf kaydı silindi.', 'warning');
  };

  // Operations Approval Desk (Onay / Red Masası)
  const addDriverApprovalRequest = (req: Omit<DriverPendingApproval, 'id' | 'date' | 'status'>) => {
    const newReq: DriverPendingApproval = {
      ...req,
      id: 'appr-' + Date.now(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'pending',
    };
    setPendingApprovals((prev) => [newReq, ...prev]);

    createNotification({
      type: 'driver_approval',
      title: `Kaptan Masraf Talebi: ${newReq.driverName}`,
      message: `${newReq.tractorPlate} plakalı araç için ${newReq.amount} ${newReq.currency} ${newReq.type} talebi onay bekliyor.`,
      priority: 'urgent',
      targetRoles: ['admin', 'operations', 'accounting'],
      actionTab: 'approvals',
      relatedEntityId: newReq.id,
    });

    showToast('Masraf/avans talebiniz operasyon onay masasına iletildi.', 'success');
  };

  const approveDriverRequest = (id: string) => {
    const req = pendingApprovals.find((a) => a.id === id);
    if (!req) return;

    // 1. Mark as approved
    setPendingApprovals((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'approved',
              reviewedBy: currentUser.name,
              reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : a
      )
    );

    // 2. Map type to ExpenseCategory
    let category: any = 'Diğer';
    if (req.type === 'Yakıt Masrafı') category = 'Yakıt';
    else if (req.type === 'Harcırah Avansı') category = 'Harcırah';
    else if (req.type === 'Otoyol / Vinyet') category = 'Otoyol';
    else if (req.type === 'Acil Tamir / Lastik') category = 'Bakım';
    else if (req.type === 'Kantar / Belge') category = 'Gümrük';

    // 3. Create expense record automatically
    const newExp: VehicleExpense = {
      id: 'exp-' + Date.now(),
      vehicleId: req.tractorPlate,
      vehiclePlate: req.tractorPlate,
      tripId: req.tripId,
      tripCmrNo: req.tripCmrNo,
      driverName: req.driverName,
      date: req.date.split(' ')[0],
      category,
      locationGroup: req.location.includes('Türkiye') ? 'Türkiye İçi' : 'Transit Ülke',
      countryOrPort: req.location,
      amount: req.amount,
      currency: req.currency,
      receiptNo: 'ONAY-' + req.id.slice(-6).toUpperCase(),
      description: `[Kaptan Onaylandı] ${req.description}`,
      status: 'approved',
    };
    setExpenses((prev) => [newExp, ...prev]);

    // 4. Notify Driver
    createNotification({
      type: 'driver_approval',
      title: `Talebiniz Onaylandı: ${req.amount} ${req.currency}`,
      message: `${req.type} talebiniz ${currentUser.name} tarafından onaylanarak muhasebeye aktarıldı.`,
      priority: 'normal',
      targetRoles: ['driver', 'admin', 'operations'],
      actionTab: 'driver_portal',
    });

    showToast(`Talep onaylandı ve ${newExp.amount} ${newExp.currency} masraf kaydı açıldı.`, 'success');
  };

  const rejectDriverRequest = (id: string, reason: string) => {
    const req = pendingApprovals.find((a) => a.id === id);
    if (!req) return;

    setPendingApprovals((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'rejected',
              rejectionReason: reason || 'Belge eksikliği veya yetersiz açıklama.',
              reviewedBy: currentUser.name,
              reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : a
      )
    );

    createNotification({
      type: 'driver_approval',
      title: `Talebiniz Reddedildi: ${req.type}`,
      message: `${req.amount} ${req.currency} tutarındaki talebiniz reddedildi. Gerekçe: "${reason}"`,
      priority: 'urgent',
      targetRoles: ['driver', 'admin', 'operations'],
      actionTab: 'driver_portal',
    });

    showToast('Talep gerekçeli olarak reddedildi, şoföre bildirildi.', 'warning');
  };

  // Customer CRUD
  const addCustomer = (custData: Omit<Customer, 'id' | 'code'>) => {
    const code = `CAR-${1000 + customers.length + 1}`;
    const newCust: Customer = {
      ...custData,
      id: 'cust-' + Date.now(),
      code,
    };
    setCustomers((prev) => [newCust, ...prev]);
    syncEntityToSupabase('customers', newCust);
    showToast(`${newCust.companyName} (${code}) cari kartı açıldı.`, 'success');
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Cari hesap bilgileri güncellendi.', 'success');
  };

  const deleteCustomer = (id: string): boolean => {
    const target = customers.find((c) => c.id === id);
    if (!target) return false;

    // Check if customer has active trips
    const hasActiveTrips = trips.some(
      (t) => (t.customerId === id || t.customerName === target.companyName) && t.status !== 'Teslim Edildi' && t.status !== 'İptal'
    );
    if (hasActiveTrips) {
      showToast(`${target.companyName} firmasına ait devam eden aktif seferler bulunmaktadır. Cari silinemez!`, 'error');
      return false;
    }

    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showToast(`${target.companyName} cari kartı başarıyla silindi.`, 'warning');
    return true;
  };

  // Invoices & Smart Detection
  const addInvoice = (invData: Omit<Invoice, 'id'>) => {
    const newInv: Invoice = {
      ...invData,
      id: 'inv-' + Date.now(),
    };
    setInvoices((prev) => [newInv, ...prev]);
    syncEntityToSupabase('invoices', newInv);

    // Only approved/active invoices affect customer balance immediately
    if (newInv.status !== 'pending_review' && newInv.type === 'Gelir' && newInv.customerId) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === newInv.customerId) {
            const addEUR = newInv.currency === 'EUR' ? newInv.totalAmount : 0;
            const addTRY = newInv.currency === 'TRY' ? newInv.totalAmount : 0;
            return {
              ...c,
              balanceEUR: c.balanceEUR + addEUR,
              balanceTRY: c.balanceTRY + addTRY,
            };
          }
          return c;
        })
      );
    }

    showToast(`${newInv.invoiceNo} faturası kaydedildi.`, 'success');
  };

  const uploadInvoiceWithVkn = (data: {
    invoiceNo: string;
    sellerVkn: string;
    buyerVkn: string;
    otherPartyName: string;
    date: string;
    dueDate: string;
    subtotal: number;
    vatRate: number;
    currency: Currency;
    notes?: string;
    fileUrl?: string;
    fileName?: string;
  }): Invoice => {
    const ourVkn = companySettings.companyTaxId.trim();
    const isOurCompanySeller = data.sellerVkn.trim() === ourVkn;
    const isOurCompanyBuyer = data.buyerVkn.trim() === ourVkn;

    // Automatic direction detection:
    // If our company is seller -> Giden Fatura (Kesilen) / Gelir
    // Else if our company is buyer -> Gelen Fatura (Alınan) / Gider
    const direction: 'incoming' | 'outgoing' = isOurCompanySeller ? 'outgoing' : 'incoming';
    const type: InvoiceType = direction === 'outgoing' ? 'Gelir' : 'Gider';
    const vatAmount = Math.round(((data.subtotal * data.vatRate) / 100) * 100) / 100;
    const totalAmount = data.subtotal + vatAmount;

    // Match existing customer if any
    const searchVkn = direction === 'outgoing' ? data.buyerVkn.trim() : data.sellerVkn.trim();
    const matchedCustomer = customers.find(
      (c) => c.taxId === searchVkn || c.companyName.toLowerCase().includes(data.otherPartyName.toLowerCase())
    );

    const newInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      invoiceNo: data.invoiceNo,
      type,
      direction,
      customerId: matchedCustomer ? matchedCustomer.id : 'cust-auto',
      customerName: data.otherPartyName || (matchedCustomer ? matchedCustomer.companyName : 'Bilinmeyen Cari / Firma'),
      customerTaxId: searchVkn,
      detectedSellerVkn: data.sellerVkn,
      detectedBuyerVkn: data.buyerVkn,
      date: data.date,
      dueDate: data.dueDate,
      subtotal: data.subtotal,
      vatRate: data.vatRate,
      vatAmount,
      totalAmount,
      currency: data.currency,
      status: 'pending_review', // Directly routes to Approval Desk! Not in balance yet.
      fileUrl: data.fileUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&auto=format&fit=crop&q=80',
      fileName: data.fileName || 'yuklenen_fatura.pdf',
      notes: data.notes || (direction === 'incoming'
        ? `Akıllı VKN Tespiti: Alıcı VKN Şirketimiz (${ourVkn}) ile eşleşti. Gelen Fatura (Gider) olarak Onay Masasına aktarıldı.`
        : `Akıllı VKN Tespiti: Satıcı VKN Şirketimiz (${ourVkn}) ile eşleşti. Kesilen/Giden Fatura (Gelir) teyidi için Onay Masasında.`),
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    syncEntityToSupabase('invoices', newInvoice);

    createNotification({
      type: 'invoice_due',
      title: `Yeni Fatura İncelemede: ${newInvoice.invoiceNo}`,
      message: `${direction === 'incoming' ? 'Gelen Fatura (Gider)' : 'Giden Fatura (Gelir)'} - ${newInvoice.customerName} (${totalAmount.toLocaleString('tr-TR')} ${data.currency}) onay masasında.`,
      priority: 'urgent',
      targetRoles: ['admin', 'manager', 'accounting'],
      actionTab: 'approvals',
      relatedEntityId: newInvoice.id,
    });

    showToast(`Fatura yüklendi. ${direction === 'incoming' ? 'Gelen Fatura (Gider)' : 'Giden Fatura (Gelir)'} olarak tespit edildi ve Onay Masasına sevk edildi.`, 'info');
    return newInvoice;
  };

  const approveInvoice = (id: string) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;

    setInvoices((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: 'Fatura Kesildi',
              reviewedBy: currentUser.name,
              reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : i
      )
    );

    // Now post to customer balance
    if (inv.type === 'Gelir' && inv.customerId) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === inv.customerId) {
            const addEUR = inv.currency === 'EUR' ? inv.totalAmount : 0;
            const addTRY = inv.currency === 'TRY' ? inv.totalAmount : 0;
            return {
              ...c,
              balanceEUR: c.balanceEUR + addEUR,
              balanceTRY: c.balanceTRY + addTRY,
            };
          }
          return c;
        })
      );
    }

    createNotification({
      type: 'invoice_due',
      title: `Fatura Onaylandı: ${inv.invoiceNo}`,
      message: `${inv.customerName} firmasına ait ${inv.totalAmount.toLocaleString('tr-TR')} ${inv.currency} tutarındaki fatura ${currentUser.name} tarafından onaylanarak resmi kayıtlara işlendi.`,
      priority: 'normal',
      targetRoles: ['admin', 'manager', 'accounting'],
      actionTab: 'accounting',
      relatedEntityId: inv.id,
    });

    showToast(`Fatura (${inv.invoiceNo}) onaylandı ve resmi cari hareketlere işlendi.`, 'success');
  };

  const rejectInvoice = (id: string, reason: string) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;

    setInvoices((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: 'İptal',
              rejectionReason: reason || 'Hatalı fatura / VKN veya tutar uyuşmazlığı.',
              reviewedBy: currentUser.name,
              reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : i
      )
    );

    createNotification({
      type: 'invoice_due',
      title: `Fatura Reddedildi: ${inv.invoiceNo}`,
      message: `${inv.invoiceNo} numaralı fatura incelendi ve reddedildi. Gerekçe: "${reason}"`,
      priority: 'urgent',
      targetRoles: ['admin', 'manager', 'accounting'],
      actionTab: 'accounting',
      relatedEntityId: inv.id,
    });

    showToast(`Fatura reddedildi: ${reason}`, 'warning');
  };

  const editInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    showToast('Fatura bilgileri güncellendi ve düzeltildi.', 'success');
  };

  const updateInvoiceStatus = (id: string, status: InvoiceStatus, paymentDate?: string) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;

    setInvoices((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status,
              paymentDate: status === 'Tahsil Edildi / Ödendi' ? (paymentDate || new Date().toISOString().split('T')[0]) : i.paymentDate,
            }
          : i
      )
    );

    if (status === 'Tahsil Edildi / Ödendi' && inv.type === 'Gelir' && inv.customerId) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === inv.customerId) {
            const subEUR = inv.currency === 'EUR' ? inv.totalAmount : 0;
            const subTRY = inv.currency === 'TRY' ? inv.totalAmount : 0;
            return {
              ...c,
              balanceEUR: Math.max(0, c.balanceEUR - subEUR),
              balanceTRY: Math.max(0, c.balanceTRY - subTRY),
            };
          }
          return c;
        })
      );
    }

    showToast(`Fatura ${inv.invoiceNo} durumu "${status}" yapıldı.`, 'success');
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    showToast('Fatura kaydı silindi.', 'warning');
  };

  // Expirable Documents Approval Methods
  const addExpirableApprovalRequest = (req: Omit<ExpirableDocApproval, 'id' | 'status' | 'submittedAt'>) => {
    const newDoc: ExpirableDocApproval = {
      ...req,
      id: 'exp-doc-' + Date.now(),
      status: 'pending',
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setExpirableApprovals((prev) => [newDoc, ...prev]);

    createNotification({
      type: 'vehicle_maintenance',
      title: `Süreli Evrak Onayı: ${newDoc.entityName}`,
      message: `${newDoc.docType} (${newDoc.docNo}) belgesi incelenmek üzere onay masasına yüklendi.`,
      priority: 'normal',
      targetRoles: ['admin', 'manager', 'operations'],
      actionTab: 'approvals',
      relatedEntityId: newDoc.id,
    });

    showToast('Süreli resmi evrak incelenmek üzere onay masasına iletildi.', 'success');
  };

  const approveExpirableDoc = (id: string) => {
    const doc = expirableApprovals.find((d) => d.id === id);
    if (!doc) return;

    setExpirableApprovals((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'approved',
              reviewedBy: currentUser.name,
              reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : d
      )
    );

    // If driver doc, update driver official doc list or dates
    if (doc.entityType === 'driver') {
      setDrivers((prev) =>
        prev.map((drv) => {
          if (drv.id === doc.entityId || drv.fullName.includes(doc.entityName.split(' ')[0])) {
            return {
              ...drv,
              documents: [
                {
                  id: 'doc-auto-' + Date.now(),
                  type: doc.docType.includes('Ehliyet') ? 'Ehliyet (CE)' : 'SRC-3 / SRC-4',
                  documentNo: doc.docNo,
                  issueDate: doc.issueDate,
                  expiryDate: doc.expiryDate,
                  status: 'Geçerli',
                  fileUrl: doc.fileUrl,
                },
                ...drv.documents,
              ],
            };
          }
          return drv;
        })
      );
    }

    createNotification({
      type: 'vehicle_maintenance',
      title: `Evrak Onaylandı: ${doc.docType}`,
      message: `${doc.entityName} için yüklenen ${doc.docType} belgesi ${currentUser.name} tarafından onaylandı.`,
      priority: 'normal',
      targetRoles: ['admin', 'manager', 'operations', 'driver'],
      actionTab: 'approvals',
    });

    showToast('Süreli resmi evrak onaylandı ve kayıtlara işlendi.', 'success');
  };

  const rejectExpirableDoc = (id: string, reason: string) => {
    const doc = expirableApprovals.find((d) => d.id === id);
    if (!doc) return;

    setExpirableApprovals((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'rejected',
              rejectionReason: reason || 'Belge okunamıyor veya süresi geçersiz.',
              reviewedBy: currentUser.name,
              reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : d
      )
    );

    createNotification({
      type: 'vehicle_maintenance',
      title: `Evrak Reddedildi: ${doc.docType}`,
      message: `${doc.entityName} için yüklenen ${doc.docType} belgesi reddedildi. Gerekçe: "${reason}"`,
      priority: 'urgent',
      targetRoles: ['admin', 'manager', 'operations', 'driver'],
      actionTab: 'approvals',
    });

    showToast('Evrak reddedildi ve ilgili birime bildirildi.', 'warning');
  };

  // Notification methods
  const roleNotifications = notifications.filter(
    (n) => n.targetRoles.includes(currentRole) || currentRole === 'admin'
  );
  const unreadCount = roleNotifications.filter((n) => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.targetRoles.includes(currentRole) || currentRole === 'admin' ? { ...n, read: true } : n
      )
    );
    showToast('Tüm bildirimler okundu olarak işaretlendi.', 'info');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const createNotification = (notifData: Omit<AppNotification, 'id' | 'date' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notifData,
      id: 'notif-' + Date.now() + Math.random().toString(36).substring(2, 6),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettings((prev) => ({ ...prev, ...settings }));
    showToast('Bildirim tercihleri güncellendi.', 'success');
  };

  const sendSimulatedEmail = async (
    to: string,
    subject: string,
    body: string,
    type: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/notifications/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body, type }),
      });
      if (res.ok) {
        showToast(`E-posta bildirimi gönderildi: ${to}`, 'info');
        return true;
      }
    } catch {
      console.log(`[E-Posta Simülasyonu] ${to} -> ${subject}`);
    }
    return true;
  };

  // Document Archive Methods
  const addDocument = (docData: Omit<ArchivedDocument, 'id' | 'uploadDate'>) => {
    const newDoc: ArchivedDocument = {
      ...docData,
      id: 'doc-' + Date.now(),
      uploadDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      uploadedBy: docData.uploadedBy || `${currentUser.name} (${ROLE_PERMISSIONS[currentRole]?.name || currentRole})`,
    };
    setDocuments((prev) => [newDoc, ...prev]);
    showToast(`"${newDoc.title}" evrakı arşive kaydedildi.`, 'success');
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    showToast('Evrak arşivden kaldırıldı.', 'warning');
  };

  const openDocumentUpload = (target: DocumentUploadTarget) => {
    setDocumentUploadTarget(target);
    setIsDocumentUploadModalOpen(true);
  };

  const closeDocumentUpload = () => {
    setIsDocumentUploadModalOpen(false);
    setDocumentUploadTarget(null);
  };

  // WhatsApp Automation Methods
  const openWhatsAppQuery = (vehicle?: Vehicle) => {
    setSelectedVehicleForWhatsApp(vehicle || null);
    setIsWhatsAppModalOpen(true);
  };

  const sendWhatsAppQuery = (plate: string, templateText?: string) => {
    const v = vehicles.find((item) => item.plate === plate);
    const text = (templateText || whatsAppTemplates[0].text).replace('[Plaka]', plate);

    const log: WhatsAppLog = {
      id: 'wlog-' + Date.now(),
      direction: 'outgoing',
      phone: v?.driverPhone || '+90 532 000 0000',
      driverName: v?.driverName || 'Şoför',
      plate,
      message: text,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'sent',
    };

    setWhatsAppLogs((prev) => [log, ...prev]);
    showToast(`WhatsApp mesajı gönderildi -> ${plate} (${log.driverName})`, 'success');
  };

  const sendBulkWhatsAppQuery = (plates: string[], templateText?: string) => {
    plates.forEach((plate) => {
      sendWhatsAppQuery(plate, templateText);
    });
    showToast(`${plates.length} araca toplu WhatsApp durum sorgusu gönderildi.`, 'success');
  };

  const simulateIncomingWhatsAppMessage = (rawMessage: string) => {
    const trimmed = rawMessage.trim();
    if (!trimmed) {
      return { success: false, message: 'Mesaj metni boş olamaz.' };
    }

    let matchedPlate = '';
    for (const v of vehicles) {
      const cleanPlate = v.plate.replace(/\s+/g, '').toUpperCase();
      const cleanMsg = trimmed.replace(/\s+/g, '').toUpperCase();
      if (cleanMsg.includes(cleanPlate)) {
        matchedPlate = v.plate;
        break;
      }
    }

    let extractedLocation = trimmed;
    const splitParts = trimmed.split(/[-:–—]/);
    if (splitParts.length > 1) {
      extractedLocation = splitParts.slice(1).join('-').trim();
    }

    if (matchedPlate) {
      setVehicles((prev) =>
        prev.map((v) => (v.plate === matchedPlate ? { ...v, currentLocationCity: extractedLocation } : v))
      );
      setTractors((prev) =>
        prev.map((t) => (t.plate === matchedPlate ? { ...t, currentLocationCity: extractedLocation } : t))
      );

      const activeTrip = trips.find(
        (t) =>
          (t.tractorPlate === matchedPlate || t.vehiclePlate === matchedPlate) &&
          t.status !== 'Teslim Edildi' &&
          t.status !== 'İptal'
      );

      if (activeTrip) {
        const lower = extractedLocation.toLowerCase();
        let newStatus: TripStatus = activeTrip.status;
        if (lower.includes('gümrük') || lower.includes('kapıkule') || lower.includes('sınır')) {
          newStatus = 'Gümrükte';
        } else if (lower.includes('teslim') || lower.includes('vardım') || lower.includes('tamam')) {
          newStatus = 'Teslim Edildi';
        } else if (lower.includes('yoldayım') || lower.includes('çıktım')) {
          newStatus = 'Yolda';
        }

        setTrips((prev) =>
          prev.map((t) =>
            t.id === activeTrip.id ? { ...t, status: newStatus, currentMilestone: extractedLocation } : t
          )
        );
      }
    }

    const log: WhatsAppLog = {
      id: 'wlog-' + Date.now(),
      direction: 'incoming',
      phone: '+90 532 444 1234',
      driverName: 'Kaptan Şoför',
      plate: matchedPlate || 'Bilinmeyen Plaka',
      message: trimmed,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'auto_parsed',
      parsedLocation: extractedLocation,
    };
    setWhatsAppLogs((prev) => [log, ...prev]);

    createNotification({
      type: 'trip_status',
      title: `Konum Güncellendi: ${matchedPlate || 'Şoför Yanıtı'}`,
      message: `WhatsApp gelen bildirim otomatik işlendi: "${extractedLocation}"`,
      priority: 'urgent',
      targetRoles: ['admin', 'operations'],
      actionTab: 'vehicles',
    });

    showToast(`WhatsApp konumu işlendi: ${extractedLocation}`, 'success');
    return { success: true, plate: matchedPlate, location: extractedLocation, message: 'İşlendi' };
  };

  // TCMB Exchange Rates Methods
  const fetchTcmbRates = async () => {
    setLoadingRates(true);
    try {
      const res = await fetch('/api/currency/tcmb');
      if (res.ok) {
        const data = await res.json();
        setTcmbData(data);
        localStorage.setItem('translogix_tcmb_rates', JSON.stringify(data));
        showToast('TCMB canlı kurları başarıyla güncellendi.', 'success');
        return;
      }
    } catch (err) {
      console.warn('TCMB API direct call error, loading fallback rates:', err);
    } finally {
      setLoadingRates(false);
    }

    // Default resilient fallback
    const fallbackData: TcmbRatesData = {
      success: true,
      date: new Date().toISOString().split('T')[0],
      bulletinNo: '2026/GÜNCEL',
      updatedAt: new Date().toLocaleTimeString('tr-TR'),
      source: 'TCMB Resmi Gösterge Kurları',
      isFallback: true,
      rates: {
        EUR: {
          code: 'EUR',
          name: 'Euro',
          currencyName: 'EURO',
          unit: 1,
          forexBuying: 39.85,
          forexSelling: 39.92,
          banknoteBuying: 39.81,
          banknoteSelling: 39.98,
        },
        USD: {
          code: 'USD',
          name: 'ABD Doları',
          currencyName: 'US DOLLAR',
          unit: 1,
          forexBuying: 36.42,
          forexSelling: 36.48,
          banknoteBuying: 36.38,
          banknoteSelling: 36.54,
        },
        RUB: {
          code: 'RUB',
          name: 'Rus Rublesi',
          currencyName: 'RUSSIAN ROUBLE',
          unit: 1,
          forexBuying: 0.38,
          forexSelling: 0.39,
          banknoteBuying: 0.37,
          banknoteSelling: 0.40,
        },
        GBP: {
          code: 'GBP',
          name: 'İngiliz Sterlini',
          currencyName: 'POUND STERLING',
          unit: 1,
          forexBuying: 47.15,
          forexSelling: 47.25,
          banknoteBuying: 47.05,
          banknoteSelling: 47.35,
        },
      },
    };
    setTcmbData(fallbackData);
    localStorage.setItem('translogix_tcmb_rates', JSON.stringify(fallbackData));
  };

  useEffect(() => {
    if (!tcmbData) {
      fetchTcmbRates();
    }
  }, []);

  const convertCurrency = (
    amount: number,
    from: string,
    to: string,
    rateType: TcmbRateType = 'forexSelling'
  ): number => {
    if (from === to || amount === 0) return amount;
    const rates = tcmbData?.rates || {};

    let fromInTRY = amount;
    if (from !== 'TRY') {
      const fromRate = rates[from]?.[rateType] || (from === 'EUR' ? 39.92 : from === 'USD' ? 36.48 : from === 'RUB' ? 0.39 : 1);
      fromInTRY = amount * fromRate;
    }

    if (to === 'TRY') return fromInTRY;

    const toRate = rates[to]?.[rateType] || (to === 'EUR' ? 39.92 : to === 'USD' ? 36.48 : to === 'RUB' ? 0.39 : 1);
    return fromInTRY / toRate;
  };

  // Audit Logs
  const addAuditLog = (entry: Omit<AuditLog, 'id' | 'timestamp' | 'userId' | 'userName' | 'userRole'>) => {
    const newLog: AuditLog = {
      ...entry,
      id: 'aud-' + Date.now() + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole,
      ipAddress: '195.175.22.' + Math.floor(Math.random() * 50 + 10),
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 199)]);
  };

  // KVKK / GDPR Data Masking
  const maskSensitiveText = (val: string, type: 'tc' | 'phone' | 'vkn' | 'iban' = 'tc'): string => {
    if (!isKvkkMaskingActive || !val) return val;
    const str = String(val).trim();
    if (type === 'tc') {
      if (str.length >= 6) {
        return str.slice(0, 2) + '*'.repeat(Math.max(4, str.length - 4)) + str.slice(-2);
      }
      return '***masked***';
    }
    if (type === 'phone') {
      if (str.length >= 8) {
        return str.slice(0, 7) + ' *** ** ' + str.slice(-2);
      }
      return '***masked***';
    }
    if (type === 'vkn') {
      if (str.length >= 6) {
        return str.slice(0, 3) + '****' + str.slice(-3);
      }
      return '****';
    }
    if (type === 'iban') {
      if (str.length >= 10) {
        return str.slice(0, 9) + ' **** **** **** **' + str.slice(-2);
      }
      return 'TR** ****';
    }
    return val;
  };

  // Demurrage (Sınır Kapısı Bekleme)
  const updateTripDemurrage = (tripId: string, waitHours: number, freeHours: number = 48, dailyRate: number = 150) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          const excessHours = Math.max(0, waitHours - freeHours);
          const excessDays = Math.ceil(excessHours / 24);
          const demurrageTotalEUR = excessDays * dailyRate;
          const demurrageStatus = excessHours > 0 ? (t.demurrageStatus === 'Demoraj Faturalandı' ? 'Demoraj Faturalandı' : 'Demoraj Başladı') : 'Normal';

          return {
            ...t,
            borderWaitHours: waitHours,
            demurrageFreeHours: freeHours,
            demurrageDailyRateEUR: dailyRate,
            demurrageTotalEUR,
            demurrageStatus,
          };
        }
        return t;
      })
    );
    addAuditLog({
      action: 'UPDATE',
      entityType: 'Trip',
      entityId: tripId,
      entityDescription: `Sınır Kapısı Bekleme Süresi Güncellendi: ${waitHours} Saat`,
      details: `Ücretsiz: ${freeHours}s, Günlük Bedel: ${dailyRate} EUR`,
    });
    showToast('Sınır kapısı bekleme süresi ve demoraj hesabı güncellendi.', 'info');
  };

  // Subcontractor Available Truck Declaration
  const setTractorAvailability = (tractorId: string, isAvailable: boolean, region?: string) => {
    setTractors((prev) =>
      prev.map((trc) =>
        trc.id === tractorId
          ? {
              ...trc,
              isEmptyAndAvailable: isAvailable,
              availableRegion: region || trc.availableRegion || 'Marmara / İstanbul',
              availableDate: isAvailable ? new Date().toISOString().split('T')[0] : undefined,
            }
          : trc
      )
    );
    addAuditLog({
      action: 'UPDATE',
      entityType: 'Vehicle',
      entityId: tractorId,
      entityDescription: `Boştaki Araç Bildirimi: ${isAvailable ? 'Boşta / Yük Arıyor' : 'Meşgul'} (${region || 'Marmara'})`,
    });
    showToast(isAvailable ? 'Boştaki araç bildirimi operasyon masasına kaydedildi.' : 'Araç meşgule alındı.', 'success');
  };

  // Dynamic Transport Contracts (Taşıma Sözleşmeleri)
  const addContract = (contractData: Omit<TransportContract, 'id' | 'createdAt' | 'contractNo'>): TransportContract => {
    const contractNo = `SOZ-2026-${String(contracts.length + 1).padStart(3, '0')}`;
    const newContract: TransportContract = {
      ...contractData,
      id: 'soz-' + Date.now(),
      contractNo,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setContracts((prev) => [newContract, ...prev]);

    if (newContract.tripId) {
      setTrips((prev) =>
        prev.map((t) =>
          t.id === newContract.tripId
            ? { ...t, contractId: newContract.id, hasSignedContract: newContract.status === 'İmzalandı / Kaşelendi' }
            : t
        )
      );
    }

    addAuditLog({
      action: 'CREATE',
      entityType: 'Contract',
      entityId: newContract.id,
      entityDescription: `${contractNo} Taşıma Sözleşmesi Hazırlandı (${newContract.partyName})`,
      details: `${newContract.agreedPrice} ${newContract.currency} Navlun, Güzergah: ${newContract.origin} -> ${newContract.destination}`,
    });

    createNotification({
      type: 'contract',
      title: `Yeni Sözleşme Hazırlandı: ${contractNo}`,
      message: `${newContract.partyName} için ${newContract.agreedPrice} ${newContract.currency} bedelli sözleşme düzenlendi.`,
      priority: 'normal',
      targetRoles: ['admin', 'manager', 'operations'],
      actionTab: 'trips',
      relatedEntityId: newContract.id,
    });

    showToast(`${contractNo} nolu Taşıma Sözleşmesi hazırlandı.`, 'success');
    return newContract;
  };

  const updateContract = (id: string, updates: Partial<TransportContract>) => {
    setContracts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Sözleşme güncellendi.', 'success');
  };

  const uploadSignedContract = (contractId: string, signedContractUrl: string, tripId?: string) => {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? {
              ...c,
              status: 'İmzalandı / Kaşelendi',
              signedContractUrl,
              signedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : c
      )
    );

    if (tripId) {
      setTrips((prev) =>
        prev.map((t) =>
          t.id === tripId ? { ...t, signedContractUrl, hasSignedContract: true, contractId } : t
        )
      );
    }

    addAuditLog({
      action: 'APPROVE',
      entityType: 'Contract',
      entityId: contractId,
      entityDescription: `Sözleşmeye Islak İmzalı / Kaşeli Belge Yüklendi ve Arşivlendi`,
    });

    showToast('İmzalı sözleşme başarıyla yüklendi ve arşivlendi.', 'success');
  };

  const openContractModalForTrip = (trip?: Trip | null) => {
    setContractModalTrip(trip || null);
    setIsContractModalOpen(true);
  };

  // Customer Freight Requests (Müşteri Yük Talepleri)
  const addFreightRequest = (reqData: Omit<CustomerFreightRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: CustomerFreightRequest = {
      ...reqData,
      id: 'req-' + Date.now(),
      status: 'Yeni Talep',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setFreightRequests((prev) => [newReq, ...prev]);

    addAuditLog({
      action: 'CREATE',
      entityType: 'FreightRequest',
      entityId: newReq.id,
      entityDescription: `Müşteri Yük Talebi: ${newReq.customerName} (${newReq.originCity} -> ${newReq.destinationCity})`,
      details: `${newReq.tonnage} Ton ${newReq.trailerType}, Bütçe: ${newReq.targetBudgetEUR ? newReq.targetBudgetEUR + ' EUR' : 'Belirtilmedi'}`,
    });

    createNotification({
      type: 'freight_request',
      title: `Yeni Yük Talebi: ${newReq.customerName}`,
      message: `${newReq.originCity} -> ${newReq.destinationCity} arası ${newReq.tonnage} Ton ${newReq.trailerType} talebi alındı.`,
      priority: 'urgent',
      targetRoles: ['admin', 'manager', 'operations'],
      actionTab: 'trips',
      relatedEntityId: newReq.id,
    });

    showToast('Yük talebiniz operasyon masasına iletildi.', 'success');
  };

  const updateFreightRequestStatus = (id: string, status: FreightRequestStatus, tripId?: string, tripCmrNo?: string) => {
    setFreightRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              convertedTripId: tripId || r.convertedTripId,
              convertedTripCmrNo: tripCmrNo || r.convertedTripCmrNo,
            }
          : r
      )
    );
    showToast(`Yük talebi "${status}" olarak güncellendi.`, 'info');
  };

  // Backup & Restore
  const exportBackupJson = (): string => {
    const backupData = {
      version: '3.0.0-enterprise',
      companySettings,
      users,
      roles,
      tractors,
      trailers,
      drivers,
      suppliers,
      vehicles,
      trips,
      expenses,
      invoices,
      customers,
      contracts,
      freightRequests,
      auditLogs,
      documents,
      timestamp: new Date().toISOString(),
    };
    addAuditLog({
      action: 'BACKUP',
      entityType: 'System',
      entityId: 'backup-' + Date.now(),
      entityDescription: 'Sistem Veritabanı Tam Yedeği İndirildi (JSON)',
      details: `${trips.length} Sefer, ${invoices.length} Fatura, ${contracts.length} Sözleşme yedeklendi.`,
    });
    return JSON.stringify(backupData, null, 2);
  };

  const restoreBackupJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        showToast('Geçersiz yedek dosyası formatı!', 'error');
        return false;
      }
      if (data.companySettings) setCompanySettings(data.companySettings);
      if (data.users) setUsers(data.users);
      if (data.roles) setRoles(data.roles);
      if (data.tractors) setTractors(data.tractors);
      if (data.trailers) setTrailers(data.trailers);
      if (data.drivers) setDrivers(data.drivers);
      if (data.suppliers) setSuppliers(data.suppliers);
      if (data.vehicles) setVehicles(data.vehicles);
      if (data.trips) setTrips(data.trips);
      if (data.expenses) setExpenses(data.expenses);
      if (data.invoices) setInvoices(data.invoices);
      if (data.customers) setCustomers(data.customers);
      if (data.contracts) setContracts(data.contracts);
      if (data.freightRequests) setFreightRequests(data.freightRequests);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      if (data.documents) setDocuments(data.documents);

      addAuditLog({
        action: 'RESTORE',
        entityType: 'System',
        entityId: 'restore-' + Date.now(),
        entityDescription: 'Sistem Veritabanı Yedekten Geri Yüklendi',
        details: 'Kullanıcı tarafından yüklenen harici JSON yedeği başarıyla sisteme aktarıldı.',
      });

      showToast('Tüm veritabanı başarıyla yedekten geri yüklendi!', 'success');
      return true;
    } catch (err) {
      showToast('Yedek geri yüklenirken hata oluştu. Dosya bozuk olabilir.', 'error');
      return false;
    }
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setTractors(INITIAL_TRACTORS);
    setTrailers(INITIAL_TRAILERS);
    setDrivers(INITIAL_DRIVERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setVehicles(INITIAL_VEHICLES);
    setTrips(INITIAL_TRIPS);
    setExpenses(INITIAL_EXPENSES);
    setPendingApprovals(INITIAL_APPROVALS);
    setCustomers(INITIAL_CUSTOMERS);
    setInvoices(INITIAL_INVOICES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setNotificationSettings(INITIAL_NOTIFICATION_SETTINGS);
    setDocuments(INITIAL_DOCUMENTS);
    setWhatsAppLogs(INITIAL_WHATSAPP_LOGS);
    setUsers(INITIAL_USERS);
    setCurrentUserId('user-admin');
    setRoles(ROLE_PERMISSIONS);
    setCompanySettings(INITIAL_COMPANY_SETTINGS);
    setExpirableApprovals(INITIAL_EXPIRABLE_APPROVALS);
    setContracts(INITIAL_CONTRACTS);
    setFreightRequests(INITIAL_FREIGHT_REQUESTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    showToast('Tüm filo kartları, dorseler, seferler ve demo veriler sıfırlandı.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        permissions,
        switchUser,
        switchRole,
        users,
        addUser,
        updateUser,
        deleteUser,
        login,
        logout,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isUserManagementModalOpen,
        setIsUserManagementModalOpen,
        roles,
        addCustomRole,
        updateRolePermission,
        deleteCustomRole,
        companySettings,
        updateCompanySettings,
        isCompanySettingsModalOpen,
        setIsCompanySettingsModalOpen,
        uploadInvoiceWithVkn,
        approveInvoice,
        rejectInvoice,
        editInvoice,
        expirableApprovals,
        addExpirableApprovalRequest,
        approveExpirableDoc,
        rejectExpirableDoc,
        activeTab,
        setActiveTab,
        tractors,
        addTractor,
        updateTractor,
        deleteTractor,
        trailers,
        addTrailer,
        updateTrailer,
        deleteTrailer,
        drivers,
        addDriver,
        updateDriver,
        deleteDriver,
        addDriverDocument,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        vehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        trips,
        generateDynamicTripCode,
        addTrip,
        updateTrip,
        updateTripStatus,
        deleteTrip,
        reassignTripEquipment,
        expenses,
        addExpense,
        deleteExpense,
        pendingApprovals,
        addDriverApprovalRequest,
        approveDriverRequest,
        rejectDriverRequest,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        invoices,
        addInvoice,
        updateInvoiceStatus,
        deleteInvoice,
        notifications,
        roleNotifications,
        unreadCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        createNotification,
        notificationSettings,
        updateNotificationSettings,
        sendSimulatedEmail,
        toast,
        showToast,
        hideToast,
        tcmbData,
        loadingRates,
        fetchTcmbRates,
        convertCurrency,
        isCurrencyModalOpen,
        setIsCurrencyModalOpen,
        documents,
        addDocument,
        deleteDocument,
        activeDocumentPreview,
        setActiveDocumentPreview,
        isDocumentUploadModalOpen,
        setIsDocumentUploadModalOpen,
        documentUploadTarget,
        openDocumentUpload,
        closeDocumentUpload,
        whatsAppLogs,
        whatsAppTemplates,
        isWhatsAppModalOpen,
        setIsWhatsAppModalOpen,
        selectedVehicleForWhatsApp,
        setSelectedVehicleForWhatsApp,
        openWhatsAppQuery,
        sendWhatsAppQuery,
        sendBulkWhatsAppQuery,
        simulateIncomingWhatsAppMessage,
        // Freight Requests
        freightRequests,
        addFreightRequest,
        updateFreightRequestStatus,
        // Contracts
        contracts,
        addContract,
        updateContract,
        uploadSignedContract,
        isContractModalOpen,
        setIsContractModalOpen,
        contractModalTrip,
        openContractModalForTrip,
        // Subcontractor Availability
        setTractorAvailability,
        // Demurrage
        updateTripDemurrage,
        // Audit Logs & KVKK
        auditLogs,
        addAuditLog,
        isAuditModalOpen,
        setIsAuditModalOpen,
        isKvkkMaskingActive,
        setIsKvkkMaskingActive,
        maskSensitiveText,
        // Backup & Restore
        isBackupRestoreModalOpen,
        setIsBackupRestoreModalOpen,
        exportBackupJson,
        restoreBackupJson,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
