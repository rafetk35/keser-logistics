import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/tabs/DashboardTab';
import { VehiclesTab } from './components/tabs/VehiclesTab';
import { TripsTab } from './components/tabs/TripsTab';
import { ExpensesTab } from './components/tabs/ExpensesTab';
import { ApprovalDeskTab } from './components/tabs/ApprovalDeskTab';
import { ReportsTab } from './components/tabs/ReportsTab';
import { AccountingTab } from './components/tabs/AccountingTab';
import { AiAdvisorTab } from './components/tabs/AiAdvisorTab';
import { DriverPortal } from './components/portals/DriverPortal';
import { CustomerPortal } from './components/portals/CustomerPortal';
import { SupplierPortal } from './components/portals/SupplierPortal';
import { NotificationModal } from './components/NotificationModal';
import { RoleMatrixModal } from './components/RoleMatrixModal';
import { CurrencyCalculatorModal } from './components/CurrencyCalculatorModal';
import { DocumentArchiveModal } from './components/DocumentArchiveModal';
import { WhatsAppAutomationModal } from './components/WhatsAppAutomationModal';
import { LoginModal } from './components/auth/LoginModal';
import { UserManagementModal } from './components/auth/UserManagementModal';
import { CompanySettingsModal } from './components/CompanySettingsModal';
import { TransportContractModal } from './components/TransportContractModal';
import { AuditTrailModal } from './components/AuditTrailModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { Toast } from './components/Toast';
import { Login } from './components/Login'; // <--- Yeni eklediğimiz Login ekranı
import { INITIAL_USERS } from './data/initialUsers'; // <--- Varsayılan kullanıcılar
import { UserProfile } from './types';
import { Truck } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, currentRole } = useApp();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isRoleMatrixOpen, setIsRoleMatrixOpen] = useState(false);

  // Oturum açmış kullanıcıyı localStorage'dan alıyoruz
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('keser_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  // Kullanıcı listesi
  const [users] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('keser_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('keser_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('keser_current_user');
  };

  // EĞER KULLANICI GİRİŞ YAPMADIYSA SADECE LOGIN EKRANINI GÖSTER
  if (!currentUser) {
    return <Login users={users} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Header and Nav */}
      <Navbar
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenRoleMatrix={() => setIsRoleMatrixOpen(true)}
      />

      {/* Çıkış Yap Butonu Eklenmiş Üst Bilgi Şeridi */}
      <div className="bg-slate-900 text-white px-6 py-2 flex justify-between items-center text-xs">
        <div>
          Hoş geldiniz, <strong className="text-blue-400">{currentUser.name}</strong> ({currentUser.title})
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded font-medium transition-colors"
        >
          Güvenli Çıkış Yap
        </button>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'vehicles' && <VehiclesTab />}
        {activeTab === 'trips' && <TripsTab />}
        {activeTab === 'expenses' && <ExpensesTab />}
        {activeTab === 'approvals' && <ApprovalDeskTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'accounting' && <AccountingTab />}
        {activeTab === 'driver_portal' && <DriverPortal />}
        {activeTab === 'customer_portal' && <CustomerPortal />}
        {activeTab === 'supplier_portal' && <SupplierPortal />}
        {activeTab === 'ai_advisor' && <AiAdvisorTab />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <Truck className="w-4 h-4 text-indigo-600" />
            <span>Keser Uluslararası Lojistik &amp; Ön Muhasebe ERP v3.0 Pro</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">CMR &amp; KDV Md. 14 Uyumlu • VKN &amp; Supabase Entegrasyonu Hazır</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>
              Aktif Profil:{' '}
              <strong className="text-slate-800">
                {currentUser.role}
              </strong>
            </span>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setIsRoleMatrixOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Yetki Kısıtlarını İncele
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals & Toasts */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
      <RoleMatrixModal
        isOpen={isRoleMatrixOpen}
        onClose={() => setIsRoleMatrixOpen(false)}
      />
      <CompanySettingsModal />
      <CurrencyCalculatorModal />
      <DocumentArchiveModal />
      <WhatsAppAutomationModal />
      <TransportContractModal />
      <AuditTrailModal />
      <BackupRestoreModal />
      <LoginModal />
      <UserManagementModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}