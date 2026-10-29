import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  Check,
  X,
  UserCheck,
  AlertCircle,
  Plus,
  Trash2,
  Lock,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { RolePermission } from '../types';

interface RoleMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleMatrixModal: React.FC<RoleMatrixModalProps> = ({ isOpen, onClose }) => {
  const {
    currentRole,
    permissions,
    roles,
    addCustomRole,
    updateRolePermission,
    deleteCustomRole,
    switchRole,
    users,
    switchUser,
  } = useApp();

  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [newRoleKey, setNewRoleKey] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleTabs, setNewRoleTabs] = useState<string[]>(['dashboard', 'trips']);

  if (!isOpen) return null;

  const canEdit = permissions.canManageRoles; // Admin & Manager only!
  const roleKeys = Object.keys(roles);

  const availableTabsList = [
    { id: 'dashboard', label: 'Genel Durum' },
    { id: 'vehicles', label: 'Çekici & Dorse' },
    { id: 'trips', label: 'Sefer & CMR' },
    { id: 'expenses', label: 'Masraflar' },
    { id: 'approvals', label: 'Onay Masası' },
    { id: 'reports', label: 'Raporlar' },
    { id: 'accounting', label: 'Cari & Fatura' },
    { id: 'driver_portal', label: 'Kaptan Portalı' },
    { id: 'customer_portal', label: 'Müşteri Portalı' },
    { id: 'supplier_portal', label: 'Taşeron Portalı' },
    { id: 'ai_advisor', label: 'Akıllı Danışman' },
  ];

  const permissionRows: {
    key: keyof Omit<RolePermission, 'role' | 'name' | 'description' | 'allowedTabs' | 'isCustom'>;
    title: string;
    description: string;
    category: string;
  }[] = [
    {
      key: 'canViewDashboard',
      title: 'Genel Gösterge & Ciro Özeti',
      description: 'Filo durumu, toplam sefer ve ana göstergeleri görme',
      category: 'Genel & Raporlama',
    },
    {
      key: 'canViewFreightRates',
      title: 'Navlun & Kâr/Zarar Rakamları',
      description: 'Anlaşmalı navlun tutarlarını ve finansal analizleri görme',
      category: 'Genel & Raporlama',
    },
    {
      key: 'canManageVehicles',
      title: 'Çekici & Dorse Yönetimi',
      description: 'Araç ekleme, düzenleme, silme ve servis durumu değiştirme',
      category: 'Filo & Donanım',
    },
    {
      key: 'canManageTrips',
      title: 'Sefer Açma & Ekipman Atama',
      description: 'Yeni sefer başlatma, yol ortasında çekici/dorse/şoför değiştirme',
      category: 'Sefer & Operasyon',
    },
    {
      key: 'canManageExpenses',
      title: 'Masraf & Yakıt Fişi Girişi',
      description: 'Yakıt, harcırah, Ro-Ro ve otoyol giderlerini sisteme işleme',
      category: 'Masraf & Harcırah',
    },
    {
      key: 'canApproveInvoices',
      title: 'Fatura & Onay Masası Yetkisi',
      description: 'Gelen/giden faturaları onaylama ve cariye resmi işleme',
      category: 'Muhasebe & Maliye',
    },
    {
      key: 'canManageAccounting',
      title: 'Cari Kart & Fatura Kesme',
      description: 'Müşteri cari ekstresi, fatura düzenleme ve tahsilat takibi',
      category: 'Muhasebe & Maliye',
    },
    {
      key: 'canManageRoles',
      title: 'Dinamik Rol & Kullanıcı Yönetimi',
      description: 'Sistem rollerini, menü kısıtlarını ve kullanıcıları yönetme (Admin & Müdür)',
      category: 'Sistem & Güvenlik',
    },
    {
      key: 'canConfigureSystem',
      title: 'Sistem & Şirket VKN Ayarları',
      description: 'Şirket VKN, vergi dairesi ve genel parametreleri yapılandırma',
      category: 'Sistem & Güvenlik',
    },
  ];

  const handleToggle = (roleKey: string, permKey: keyof RolePermission) => {
    if (!canEdit) return;
    // Don't let admin lock themselves out of everything
    if (roleKey === 'admin' && permKey === 'canManageRoles') return;

    const currentVal = Boolean(roles[roleKey]?.[permKey]);
    updateRolePermission(roleKey, { [permKey]: !currentVal });
  };

  const handleAddRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleKey.trim() || !newRoleName.trim()) return;

    const sanitizedKey = newRoleKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (roles[sanitizedKey]) {
      alert('Bu rol anahtarı zaten mevcut!');
      return;
    }

    const newRole: RolePermission = {
      role: sanitizedKey,
      name: newRoleName.trim(),
      description: newRoleDesc.trim() || 'Özel tanımlanmış şirket rolü.',
      canViewDashboard: true,
      canManageVehicles: false,
      canManageTrips: false,
      canViewFreightRates: false,
      canManageExpenses: true,
      canManageAccounting: false,
      canConfigureSystem: false,
      canManageRoles: false,
      canApproveInvoices: false,
      allowedTabs: newRoleTabs,
      isCustom: true,
    };

    addCustomRole(newRole);
    setIsAddRoleOpen(false);
    setNewRoleKey('');
    setNewRoleName('');
    setNewRoleDesc('');
  };

  const toggleTabForNewRole = (tabId: string) => {
    setNewRoleTabs((prev) =>
      prev.includes(tabId) ? prev.filter((t) => t !== tabId) : [...prev, tabId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Dinamik Rol &amp; Yetki Matrisi (RBAC)
                </h2>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-bold">
                  {roleKeys.length} Tanımlı Rol
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Rol bazlı menü gizleme ve modül erişim yetkileri. Sadece <strong>Yönetici (Admin)</strong> ve <strong>Müdür</strong> rollerince düzenlenebilir.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => setIsAddRoleOpen(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yeni Rol Ekle</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security / Edit Info Bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              {canEdit ? (
                <span className="font-semibold text-emerald-700">
                  Yetkili Oturum ({roles[currentRole]?.name || currentRole}): Tablodaki kutucuklara tıklayarak yetkileri anında değiştirebilirsiniz.
                </span>
              ) : (
                <span className="text-slate-600">
                  Yetki Kısıtı: Rol yetkilerini değiştirme ve yeni rol tanımlama sadece <strong>Yönetici (Admin)</strong> ve <strong>Müdür</strong> yetkisindedir.
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Aktif Rolünüz:</span>
            <span className="font-bold text-slate-900 bg-white border border-slate-300 px-2 py-0.5 rounded-lg">
              {roles[currentRole]?.name || currentRole}
            </span>
          </div>
        </div>

        {/* Role Matrix Table Container */}
        <div className="flex-1 overflow-auto p-4 sm:p-5">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider divide-x divide-slate-800">
                  <th className="py-3 px-4 w-[260px] sticky left-0 z-20 bg-slate-900 shadow-sm">
                    Yetki &amp; Modül Kapsamı
                  </th>
                  {roleKeys.map((rKey) => {
                    const roleObj = roles[rKey];
                    const isProtected = ['admin', 'manager', 'operations', 'accounting', 'driver', 'customer', 'supplier'].includes(rKey);
                    const isCurrent = currentRole === rKey;

                    return (
                      <th
                        key={rKey}
                        className={`py-3 px-3 text-center min-w-[120px] transition-colors ${
                          isCurrent ? 'bg-indigo-950/90 text-indigo-200 ring-2 ring-indigo-400 inset-0' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-xs truncate max-w-[110px]" title={roleObj?.name}>
                            {roleObj?.name || rKey}
                          </span>
                          <span className="text-[9px] font-mono opacity-60">({rKey})</span>

                          {/* Quick test / switch button */}
                          <div className="flex items-center gap-1 mt-1">
                            <button
                              onClick={() => switchRole(rKey as any)}
                              className={`text-[10px] px-2 py-0.5 rounded font-semibold transition ${
                                isCurrent
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white'
                              }`}
                              title={`${roleObj?.name} rolüne geçerek menü ve buton kısıtlarını canlı test et`}
                            >
                              {isCurrent ? 'Aktif' : 'Rolü Test Et'}
                            </button>

                            {canEdit && !isProtected && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`"${roleObj?.name}" rolünü silmek istediğinize emin misiniz?`)) {
                                    deleteCustomRole(rKey);
                                  }
                                }}
                                className="text-rose-400 hover:text-rose-200 p-0.5"
                                title="Rolü Sil"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
                {/* 1. Module Capabilities */}
                {permissionRows.map((row) => (
                  <tr key={row.key} className="hover:bg-slate-50 divide-x divide-slate-100 transition-colors">
                    <td className="py-2.5 px-4 font-medium sticky left-0 z-10 bg-white">
                      <div className="font-bold text-slate-900 text-xs">{row.title}</div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{row.description}</div>
                    </td>

                    {roleKeys.map((rKey) => {
                      const isAllowed = Boolean(roles[rKey]?.[row.key]);
                      const isCurrent = currentRole === rKey;

                      return (
                        <td
                          key={rKey}
                          className={`py-2.5 px-3 text-center ${isCurrent ? 'bg-indigo-50/40' : ''}`}
                        >
                          <button
                            type="button"
                            disabled={!canEdit || (rKey === 'admin' && row.key === 'canManageRoles')}
                            onClick={() => handleToggle(rKey, row.key)}
                            className={`inline-flex items-center justify-center p-1.5 rounded-lg font-bold transition ${
                              isAllowed
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            } ${!canEdit ? 'cursor-default' : 'cursor-pointer hover:scale-105 active:scale-95'}`}
                            title={
                              canEdit
                                ? isAllowed
                                  ? 'Yetkiyi Kaldır'
                                  : 'Yetki Ver'
                                : isAllowed
                                ? 'Yetkili'
                                : 'Yetkisiz'
                            }
                          >
                            {isAllowed ? (
                              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                            ) : (
                              <X className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* 2. Menu Tabs Isolation Row */}
                <tr className="bg-slate-100/70 divide-x divide-slate-200 border-t-2 border-slate-300">
                  <td className="py-3 px-4 font-bold sticky left-0 z-10 bg-slate-100 text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>Erişilebilir Üst Sekmeler (Menü Kapsamı)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-normal mt-0.5">
                      Bu sekmelerin dışındaki menü butonları ekrandan tamamen gizlenir
                    </p>
                  </td>

                  {roleKeys.map((rKey) => {
                    const allowed = roles[rKey]?.allowedTabs || [];
                    const isCurrent = currentRole === rKey;

                    return (
                      <td
                        key={rKey}
                        className={`py-3 px-2 text-center align-top ${isCurrent ? 'bg-indigo-50/50' : ''}`}
                      >
                        <div className="flex flex-wrap gap-1 justify-center max-w-[130px] mx-auto">
                          {allowed.length === 0 ? (
                            <span className="text-[10px] text-slate-400 italic">Sekme yok</span>
                          ) : (
                            allowed.map((tId) => {
                              const tabInfo = availableTabsList.find((t) => t.id === tId);
                              return (
                                <span
                                  key={tId}
                                  className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium truncate"
                                  title={tabInfo?.label || tId}
                                >
                                  {tabInfo?.label || tId}
                                </span>
                              );
                            })
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick User Tester Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-200">
              Kullanıcı Profili Seçerek Menü Gizlemesini Hemen Test Edin:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {users.map((u) => {
              const isSelected = u.id === users.find((item) => item.role === currentRole)?.id;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${u.avatarColor}`} />
                  <span>{u.name.split(' ')[0]}</span>
                  <span className="text-[9px] opacity-70">({u.role})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add New Role Submodal */}
      {isAddRoleOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Yeni Dinamik Rol Ekle</h3>
              </div>
              <button
                onClick={() => setIsAddRoleOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Rol Kod / Anahtarı (İngilizce &amp; Benzersiz)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: customs_broker veya junior_ops"
                  value={newRoleKey}
                  onChange={(e) => setNewRoleKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Rol Başlığı / Unvanı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Gümrük &amp; Sınır Müşaviri"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Açıklama / Görev Tanımı</label>
                <input
                  type="text"
                  placeholder="Bu role sahip kullanıcının operasyondaki sorumluluğu..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Erişebileceği Üst Menü Sekmeleri (Yetki İzolasyonu):
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {availableTabsList.map((tab) => {
                    const isChecked = newRoleTabs.includes(tab.id);
                    return (
                      <label
                        key={tab.id}
                        className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-indigo-900"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTabForNewRole(tab.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                        />
                        <span className="font-medium text-[11px]">{tab.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRoleOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Rolü Oluştur ve Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
