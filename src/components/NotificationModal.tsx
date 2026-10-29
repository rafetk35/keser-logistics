import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  X,
  Check,
  Trash2,
  Mail,
  Send,
  AlertTriangle,
  Clock,
  Truck,
  FileText,
  Wrench,
  CheckCheck,
  Settings,
  PlusCircle,
} from 'lucide-react';
import { NotificationType, UserRole } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const {
    roleNotifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    notificationSettings,
    updateNotificationSettings,
    sendSimulatedEmail,
    createNotification,
    setActiveTab,
    showToast,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'list' | 'settings' | 'simulate'>('list');
  const [filterType, setFilterType] = useState<string>('all');

  // Simulator state
  const [simType, setSimType] = useState<NotificationType>('trip_status');
  const [simTitle, setSimTitle] = useState('');
  const [simMessage, setSimMessage] = useState('');
  const [simPriority, setSimPriority] = useState<'normal' | 'urgent'>('normal');
  const [simSendEmail, setSimSendEmail] = useState(true);

  // Settings state
  const [emailInput, setEmailInput] = useState(notificationSettings.notificationEmail);

  if (!isOpen) return null;

  const filteredNotifs = roleNotifications.filter((n) => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'trip_status':
        return <Truck className="w-4 h-4 text-emerald-600" />;
      case 'invoice_due':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'vehicle_maintenance':
        return <Wrench className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getBadgeColor = (type: NotificationType) => {
    switch (type) {
      case 'trip_status':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'invoice_due':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'vehicle_maintenance':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'trip_status':
        return 'Sefer & Yük';
      case 'invoice_due':
        return 'Fatura Vadesi';
      case 'vehicle_maintenance':
        return 'Araç Bakımı';
      default:
        return 'Sistem';
    }
  };

  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simTitle.trim() || !simMessage.trim()) {
      showToast('Lütfen başlık ve açıklama giriniz.', 'warning');
      return;
    }

    const targetRoles: UserRole[] =
      simType === 'trip_status'
        ? ['admin', 'operations', 'accounting']
        : simType === 'invoice_due'
        ? ['admin', 'accounting']
        : ['admin', 'operations'];

    createNotification({
      type: simType,
      title: simTitle,
      message: simMessage,
      priority: simPriority,
      targetRoles,
      emailSent: simSendEmail && notificationSettings.emailEnabled,
      actionTab: simType === 'trip_status' ? 'trips' : simType === 'invoice_due' ? 'accounting' : 'vehicles',
    });

    if (simSendEmail && notificationSettings.emailEnabled) {
      await sendSimulatedEmail(
        notificationSettings.notificationEmail,
        `[Keser] ${simTitle}`,
        simMessage,
        simType
      );
    }

    showToast('Yeni bildirim başarıyla oluşturuldu ve yayınlandı.', 'success');
    setSimTitle('');
    setSimMessage('');
    setActiveSubTab('list');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationSettings({ notificationEmail: emailInput });
  };

  const handleQuickPreset = (preset: 'trip' | 'invoice' | 'maintenance') => {
    if (preset === 'trip') {
      setSimType('trip_status');
      setSimTitle('Kapıkule Gümrük Çıkışı Yapıldı: 34 TL 4501');
      setSimMessage('34 TL 4501 plakalı tır Kapıkule çıkış gümrük işlemlerini tamamladı, Bulgaristan Kaptan Andreevo yönüne hareket etti.');
      setSimPriority('normal');
    } else if (preset === 'invoice') {
      setSimType('invoice_due');
      setSimTitle('Vadesi Yaklaşan Fatura: FAT-2026-0043 (Siemens Lojistik)');
      setSimMessage('Siemens firmasına kesilen 4.200 € navlun faturasının son ödeme tarihi yarındır. Lütfen cari mutabakat yapınız.');
      setSimPriority('urgent');
    } else {
      setSimType('vehicle_maintenance');
      setSimTitle('Periyodik Bakım Zamanı: 35 LGT 992');
      setSimMessage('35 LGT 992 nolu Scania çekici 150.000 km sınırına yaklaştı. Retarder ve fren balata bakımı planlanmalı.');
      setSimPriority('urgent');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30 relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Bildirim &amp; Hatırlatma Merkezi</span>
                {unreadCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-600 text-white font-semibold">
                    {unreadCount} Okunmamış
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Uygulama içi anlık bildirimler, e-posta uyarıları ve vade hatırlatmaları
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-6">
          <button
            onClick={() => setActiveSubTab('list')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeSubTab === 'list'
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Gelen Bildirimler ({roleNotifications.length})
            {activeSubTab === 'list' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('settings')}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeSubTab === 'settings'
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            E-Posta &amp; Bildirim Tercihleri
            {activeSubTab === 'settings' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('simulate')}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeSubTab === 'simulate'
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Test Bildirimi Tetikle
            {activeSubTab === 'simulate' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab 1: List */}
        {activeSubTab === 'list' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter bar */}
            <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 px-6">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'Tümü' },
                  { id: 'trip_status', label: 'Sefer Durumu' },
                  { id: 'invoice_due', label: 'Fatura Vadesi' },
                  { id: 'vehicle_maintenance', label: 'Araç Bakımı' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      filterType === f.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Tümünü Okundu Say</span>
                </button>
              )}
            </div>

            {/* List items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {filteredNotifs.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">Bu filtrede herhangi bir bildirim bulunamadı.</p>
                </div>
              ) : (
                filteredNotifs.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!item.read) markNotificationAsRead(item.id);
                      if (item.actionTab) {
                        setActiveTab(item.actionTab);
                        onClose();
                      }
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      item.read
                        ? 'bg-white border-slate-200 opacity-80 hover:opacity-100 hover:border-slate-300'
                        : 'bg-indigo-50/40 border-indigo-200 shadow-xs ring-1 ring-indigo-200/50'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs shrink-0">
                      {getIconForType(item.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getBadgeColor(
                              item.type
                            )}`}
                          >
                            {getTypeLabel(item.type)}
                          </span>
                          {item.priority === 'urgent' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" />
                              Acil
                            </span>
                          )}
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600" />
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {item.date}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
                        {item.emailSent && (
                          <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            E-posta bildirimi iletildi
                          </span>
                        )}
                        <div className="flex items-center gap-2 ml-auto">
                          {!item.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markNotificationAsRead(item.id);
                              }}
                              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium px-2 py-0.5 rounded hover:bg-indigo-50"
                            >
                              Okundu
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(item.id);
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Settings */}
        {activeSubTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Bildirim Dağıtım Kanalları &amp; E-Posta Ayarları
              </h3>
              <p className="text-xs text-slate-500">
                Lojistik operasyonlarında sefer gecikmeleri, fatura vadesi ve araç muayene süreleri otomatik takip edilir.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Uygulama İçi Bildirimler (In-App)</div>
                    <div className="text-[11px] text-slate-500">
                      Sistem panelinde zil simgesi ve toast uyarıları gösterilir
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.inAppEnabled}
                    onChange={(e) =>
                      updateNotificationSettings({ inAppEnabled: e.target.checked })
                    }
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                  />
                </div>

                <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">E-Posta Bildirimleri (Opsiyonel)</div>
                    <div className="text-[11px] text-slate-500">
                      Kritik sefer değişiklikleri ve fatura hatırlatmaları için e-posta gönder
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailEnabled}
                    onChange={(e) =>
                      updateNotificationSettings({ emailEnabled: e.target.checked })
                    }
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bildirimlerin İletileceği E-Posta Adresi
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="operasyon@translogix.com"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Kaydet
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <h4 className="text-xs font-bold text-slate-900 mb-2">Otomatik Bildirim Türleri</h4>

                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.notifyTripStatus}
                    onChange={(e) =>
                      updateNotificationSettings({ notifyTripStatus: e.target.checked })
                    }
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                  />
                  <span>
                    <strong>Sefer Durumu Güncellemeleri:</strong> Araç sınıra varış, gümrük tescil ve varışta teslim teyidi
                  </span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.notifyInvoiceDue}
                    onChange={(e) =>
                      updateNotificationSettings({ notifyInvoiceDue: e.target.checked })
                    }
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                  />
                  <span>
                    <strong>Yaklaşan Fatura Son Ödeme Tarihleri:</strong> Vadesine 3 gün kalan ve vadesi geçmiş faturalar
                  </span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.notifyVehicleMaintenance}
                    onChange={(e) =>
                      updateNotificationSettings({
                        notifyVehicleMaintenance: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                  />
                  <span>
                    <strong>Araç Bakım &amp; Muayene Hatırlatmaları:</strong> TÜVTÜRK muayenesi ve periyodik servis uyarıları
                  </span>
                </label>
              </div>

              <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-indigo-900">E-Posta Servis Simülasyonu</div>
                  <div className="text-[11px] text-indigo-700">
                    Sistemin e-posta gönderim fonksiyonunu anında test edin
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    sendSimulatedEmail(
                      emailInput,
                      '[Keser] Bildirim Test Mesajı',
                      'Bu bir test bildirimidir. Uluslararası nakliye takip ve muhasebe bildirim motoru aktif çalışmaktadır.',
                      'system'
                    )
                  }
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  Test E-Postası Gönder
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Simulate / Create */}
        {activeSubTab === 'simulate' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Manuel / Simüle Bildirim Tetikleme Aracı
              </h3>
              <p className="text-xs text-slate-500">
                Sefer durumu, fatura vadesi ve araç bakım olaylarını anında test edebilir ve sisteme bildirim ekleyebilirsiniz.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">Hızlı Hazır Şablonlar:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickPreset('trip')}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium transition-colors"
                >
                  🚛 Kapıkule Çıkış Bildirimi
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('invoice')}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium transition-colors"
                >
                  📄 Fatura Vadesi Uyarısı
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('maintenance')}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-medium transition-colors"
                >
                  🔧 Araç Muayene Uyarısı
                </button>
              </div>
            </div>

            <form onSubmit={handleSimulateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bildirim Türü
                  </label>
                  <select
                    value={simType}
                    onChange={(e) => setSimType(e.target.value as NotificationType)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="trip_status">Sefer Durumu Güncellemesi</option>
                    <option value="invoice_due">Yaklaşan Fatura Son Ödeme Tarihi</option>
                    <option value="vehicle_maintenance">Araç Bakım &amp; Muayene Hatırlatması</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Öncelik Seviyesi
                  </label>
                  <select
                    value={simPriority}
                    onChange={(e) => setSimPriority(e.target.value as 'normal' | 'urgent')}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="normal">Normal Öncelik</option>
                    <option value="urgent">Acil (Kırmızı Uyarı)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bildirim Başlığı
                </label>
                <input
                  type="text"
                  value={simTitle}
                  onChange={(e) => setSimTitle(e.target.value)}
                  placeholder="örn: Kapıkule Gümrüğü Tescil Tamamlandı"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bildirim Mesajı / Açıklama
                </label>
                <textarea
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  rows={3}
                  placeholder="Detaylı durum ve operasyon/muhasebe aksiyon bilgisi..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simSendEmail}
                    onChange={(e) => setSimSendEmail(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                  />
                  <span>Eş zamanlı e-posta gönderimini de tetikle ({notificationSettings.notificationEmail})</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('list')}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Bildirimi Sisteme Gönder
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Aktif Rol: <strong>{roleNotifications.length} bildirim</strong> erişilebilir.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Pencereyi Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
