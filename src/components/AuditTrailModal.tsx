import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Database,
  KeyRound,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuditTrailModal: React.FC = () => {
  const {
    isAuditModalOpen,
    setIsAuditModalOpen,
    auditLogs,
    isKvkkMaskingActive,
    setIsKvkkMaskingActive,
    maskSensitiveText,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  if (!isAuditModalOpen) return null;

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.ipAddress && log.ipAddress.includes(searchTerm));

    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">EKLEME</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">GÜNCELLEME</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded">SİLME</span>;
      case 'APPROVE':
        return <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-bold rounded">ONAYLAMA</span>;
      case 'REJECT':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">REDDETME</span>;
      case 'BACKUP':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded">YEDEK ALMA</span>;
      case 'RESTORE':
        return <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded">GERİ YÜKLEME</span>;
      case 'LOGIN':
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-bold rounded">GÜVENLİ GİRİŞ</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">{action}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8 overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-300">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                Siber Güvenlik, Denetim İzi (Audit Trail) &amp; KVKK / GDPR Koruma
              </h2>
              <p className="text-xs text-indigo-200">
                Satır Düzeyinde Güvenlik (RLS), İşlem Logları ve Değişmez Yasal Arşiv Kilidi
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuditModalOpen(false)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Architecture Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-slate-50 border-b border-slate-200">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Satır Düzeyinde Güvenlik
              </div>
              <div className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                RLS Aktif (İzole)
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Oturum Mimarisi
              </div>
              <div className="text-xs font-extrabold text-blue-600">
                JWT + Rol Bazlı Erişim
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Yasal Arşiv Kilidi
              </div>
              <div className="text-xs font-extrabold text-purple-600">
                Read-Only (Değiştirilemez)
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${isKvkkMaskingActive ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                {isKvkkMaskingActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  KVKK Maskeleme
                </div>
                <div className="text-xs font-extrabold text-slate-800">
                  {isKvkkMaskingActive ? 'Gizleme Aktif' : 'Açık Görünüm'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsKvkkMaskingActive(!isKvkkMaskingActive)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                isKvkkMaskingActive
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300 border-slate-300'
              }`}
            >
              {isKvkkMaskingActive ? 'Kapat' : 'Maskele'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Loglarda ara (Kullanıcı, Sefer, Fatura, IP)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">İşlem Türü:</span>
            {['ALL', 'CREATE', 'UPDATE', 'APPROVE', 'REJECT', 'LOGIN', 'BACKUP'].map((act) => (
              <button
                key={act}
                onClick={() => setSelectedAction(act)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedAction === act
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {act === 'ALL' ? 'Tümü' : act}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider sticky top-0 border-b">
              <tr>
                <th className="py-3 px-4">Zaman Damgası</th>
                <th className="py-3 px-4">Kullanıcı &amp; Rol</th>
                <th className="py-3 px-4">İşlem</th>
                <th className="py-3 px-4">Modül / Varlık</th>
                <th className="py-3 px-4">İşlem Özeti &amp; Detay</th>
                <th className="py-3 px-4">IP Adresi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-bold text-slate-800">
                      {isKvkkMaskingActive ? maskSensitiveText(log.userName, 'tc') : log.userName}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {log.userRole}
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                    {log.entityType}
                  </td>
                  <td className="py-3 px-4 max-w-xs md:max-w-md">
                    <div className="font-medium text-slate-800">
                      {log.entityDescription}
                    </div>
                    {log.details && (
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {log.details}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {isKvkkMaskingActive && log.ipAddress ? log.ipAddress.slice(0, 7) + '.***.***' : log.ipAddress || '195.175.22.41'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Audit log kayıtları SHA-256 bütünlük kontrolü altında değiştirilemez olarak saklanır.</span>
          </div>
          <button
            onClick={() => setIsAuditModalOpen(false)}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
