import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Truck,
  LayoutDashboard,
  Navigation,
  FileSpreadsheet,
  Receipt,
  Sparkles,
  Bell,
  Shield,
  RotateCcw,
  ChevronDown,
  User,
  Menu,
  X,
  Coins,
  BarChart3,
  ShieldCheck,
  UserCheck,
  Building2,
  Layers,
  LogIn,
  Users,
  Database,
  Settings,
  Lock,
  HardDrive,
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  onOpenNotifications: () => void;
  onOpenRoleMatrix: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications, onOpenRoleMatrix }) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    currentRole,
    permissions,
    users,
    switchUser,
    unreadCount,
    resetToDemoData,
    tcmbData,
    setIsCurrencyModalOpen,
    pendingApprovals,
    invoices,
    expirableApprovals,
    setIsLoginModalOpen,
    setIsUserManagementModalOpen,
    companySettings,
    setIsCompanySettingsModalOpen,
    setIsAuditModalOpen,
    setIsBackupRestoreModalOpen,
  } = useApp();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Total pending approvals across all 3 modules
  const pendingDriverCount = pendingApprovals.filter((a) => a.status === 'pending').length;
  const pendingInvoiceCount = invoices.filter((i) => i.status === 'pending_review').length;
  const pendingDocCount = expirableApprovals.filter((e) => e.status === 'pending').length;
  const totalPendingCount = pendingDriverCount + pendingInvoiceCount + pendingDocCount;

  // Modern ve Kısa Başlıklar (Tek satıra sığması için optimize edildi)
  const allNavItems = [
    { id: 'dashboard', label: 'Özet', fullLabel: 'Genel Durum', icon: LayoutDashboard },
    { id: 'vehicles', label: 'Filo', fullLabel: 'Çekici & Dorse', icon: Truck },
    { id: 'trips', label: 'Seferler', fullLabel: 'Sefer & CMR', icon: Navigation },
    { id: 'expenses', label: 'Masraflar', fullLabel: 'Masraflar & Fişler', icon: Receipt },
    { id: 'approvals', label: 'Onaylar', fullLabel: 'Onay Masası', icon: ShieldCheck, badge: totalPendingCount > 0 ? totalPendingCount : undefined },
    { id: 'reports', label: 'Raporlar', fullLabel: 'Raporlar & Analiz', icon: BarChart3 },
    { id: 'accounting', label: 'Muhasebe', fullLabel: 'Cari & Fatura', icon: FileSpreadsheet },
    { id: 'driver_portal', label: 'Kaptan', fullLabel: 'Kaptan Portalı', icon: UserCheck },
    { id: 'customer_portal', label: 'Müşteri', fullLabel: 'Müşteri Portalı', icon: Building2 },
    { id: 'supplier_portal', label: 'Taşeron', fullLabel: 'Taşeron Portalı', icon: Layers },
    { id: 'ai_advisor', label: 'AI Danışman', fullLabel: 'Akıllı Danışman', icon: Sparkles, highlight: true },
  ];

  const allowedTabs = permissions?.allowedTabs || ['dashboard'];
  const visibleNavItems = allNavItems.filter((item) => allowedTabs.includes(item.id));

  const roleLabels: Record<string, string> = {
    admin: 'Yönetici',
    manager: 'Müdür',
    operations: 'Operasyon',
    accounting: 'Muhasebe',
    driver: 'Kaptan Sürücü',
    customer: 'Müşteri Portalı',
    supplier: 'Taşeron Portalı',
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top Banner / Utility Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-indigo-400/30 group-hover:scale-105 transition-transform">
              <span className="font-black text-xl text-white tracking-tighter drop-shadow-sm font-sans">
                K
              </span>
              <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-0.5 border border-slate-900 shadow-xs">
                <Truck className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                  Keser
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-400/30">
                  Uluslararası ERP
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">
                Lojistik Takip, Filo &amp; Ön Muhasebe Sistemi
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Supabase Status indicator */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-700 rounded-lg text-[11px] text-slate-300"
              title={isSupabaseConfigured ? 'Supabase Canlı Veritabanı Bağlı' : 'Supabase Entegrasyonu Hazır'}
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span>{isSupabaseConfigured ? 'Bulut Canlı' : 'Supabase Hazır'}</span>
            </div>

            {/* TCMB Currency Converter Button */}
            <button
              onClick={() => setIsCurrencyModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 transition-all shadow-xs"
              title="TCMB Otomatik Döviz Çevirici"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">TCMB Kurları</span>
              <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-200 px-1.5 py-0.2 rounded hidden xl:inline">
                EUR: {tcmbData?.rates?.EUR?.forexBuying?.toFixed(2) || '39.85'}₺
              </span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
              title="Bildirimler & Hatırlatmalar"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full bg-rose-600 text-white px-1 shadow-sm ring-2 ring-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Demo Reset */}
            <button
              onClick={() => {
                if (window.confirm('Tüm filo kartları, dorseler ve demo verileri varsayılan haline sıfırlamak istiyor musunuz?')) {
                  resetToDemoData();
                }
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors hidden sm:flex items-center"
              title="Demo Verilerini Sıfırla"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* User Dropdown / Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-all"
              >
                <div
                  className={`w-7 h-7 rounded-lg ${currentUser.avatarColor} flex items-center justify-center text-xs font-bold text-white shadow-xs`}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{currentUser.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-indigo-950 text-indigo-300 border border-indigo-700 uppercase">
                      {roleLabels[currentRole] || currentRole}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                    {currentUser.title}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 text-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Aktif Kullanıcı &amp; Profil
                      </div>
                      <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setIsLoginModalOpen(true);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      <LogIn className="w-3 h-3" />
                      Giriş Yap
                    </button>
                  </div>

                  <div className="p-1 space-y-1 max-h-56 overflow-y-auto">
                    {users.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition-colors ${
                            isSelected
                              ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg ${u.avatarColor} text-white flex items-center justify-center text-xs font-bold shrink-0`}
                          >
                            {u.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold flex items-center justify-between">
                              <span className="truncate">{u.name}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-slate-100 text-slate-600">
                                {u.role}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{u.title}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {permissions.canManageRoles && (
                    <div className="p-2 border-t border-slate-100 mt-1 space-y-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setIsUserManagementModalOpen(true);
                        }}
                        className="w-full text-left text-xs text-indigo-700 hover:text-indigo-900 font-semibold py-1.5 px-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
                      >
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Kullanıcı Yönetimi (Admin &amp; Müdür)</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setIsCompanySettingsModalOpen(true);
                        }}
                        className="w-full text-left text-xs text-slate-700 hover:text-slate-900 font-semibold py-1.5 px-2 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-600" />
                        <span>Şirket VKN &amp; Fatura Ayarları</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setIsAuditModalOpen(true);
                        }}
                        className="w-full text-left text-xs text-indigo-700 hover:text-indigo-900 font-semibold py-1.5 px-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Siber Güvenlik &amp; Audit Logları</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setIsBackupRestoreModalOpen(true);
                        }}
                        className="w-full text-left text-xs text-blue-700 hover:text-blue-900 font-semibold py-1.5 px-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                      >
                        <Database className="w-3.5 h-3.5 text-blue-600" />
                        <span>Veritabanı Yedeği &amp; Geri Yükle</span>
                      </button>
                    </div>
                  )}

                  {/* Yalnızca Yönetici (Admin) ve Müdür (Manager) rollerine gösterilir */}
                  {(currentRole === 'admin' || currentRole === 'manager') && (
                    <div className="p-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenRoleMatrix();
                        }}
                        className="w-full text-center text-xs text-slate-700 hover:text-slate-900 font-semibold py-1.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Shield className="w-3.5 h-3.5 text-indigo-600" />
                        {permissions.canManageRoles
                          ? 'Dinamik Rol & Yetki Matrisi (Yönet)'
                          : 'Yetki Kısıtlarımı Görüntüle'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 lg:hidden text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Bar: Tam ekran esnek yerleşim ve şık pill (hap) tasarım */}
      <div className="bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
        <div className="w-full flex items-center justify-between py-2 overflow-x-auto gap-1">
          <nav className="hidden lg:flex items-center justify-between w-full max-w-7xl mx-auto gap-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={item.fullLabel}
                  className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex-1 whitespace-nowrap ${
                    isActive
                      ? item.highlight
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm ring-1 ring-indigo-400 scale-[1.02]'
                        : 'bg-indigo-600 text-white shadow-sm scale-[1.02]'
                      : item.highlight
                      ? 'text-purple-300 hover:bg-purple-950/40 hover:text-purple-200 border border-purple-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-white' : item.highlight ? 'text-purple-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-full shrink-0">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && (
                    <span className="text-[8px] bg-purple-500/30 text-purple-200 px-1 py-0.2 rounded-full font-bold uppercase shrink-0">
                      AI
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden w-full py-3 space-y-1.5 border-t border-slate-800 animate-in fade-in duration-150">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.fullLabel}</span>
                      {item.badge !== undefined && (
                        <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};