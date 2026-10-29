import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Plus,
  Shield,
  Trash2,
  Edit2,
  X,
  Mail,
  User,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';

export const UserManagementModal: React.FC = () => {
  const {
    isUserManagementModalOpen,
    setIsUserManagementModalOpen,
    users,
    addUser,
    updateUser,
    deleteUser,
    currentUser,
    roles,
  } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [role, setRole] = useState<UserRole>('operations');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');

  if (!isUserManagementModalOpen) return null;

  const openCreateForm = () => {
    setEditingUser(null);
    setName('');
    setTitle('Operasyon Uzmanı');
    setRole('operations');
    setEmail('');
    setPassword('password123');
    setIsFormOpen(true);
  };

  const openEditForm = (u: UserProfile) => {
    setEditingUser(u);
    setName(u.name);
    setTitle(u.title);
    setRole(u.role);
    setEmail(u.email);
    setPassword(u.password || 'password123');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, {
        name,
        title,
        role,
        email,
        password,
      });
    } else {
      addUser({
        name,
        title,
        role,
        email,
        password,
        avatarColor:
          role === 'admin'
            ? 'bg-indigo-600'
            : role === 'manager'
            ? 'bg-teal-600'
            : role === 'operations'
            ? 'bg-emerald-600'
            : role === 'accounting'
            ? 'bg-amber-600'
            : role === 'driver'
            ? 'bg-blue-600'
            : role === 'customer'
            ? 'bg-purple-600'
            : 'bg-orange-600',
      });
    }
    setIsFormOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Kullanıcı &amp; Yetki Yönetim Paneli</h3>
              <p className="text-xs text-slate-500">Sistem kullanıcıları, rolleri ve erişim yetkileri</p>
            </div>
          </div>
          <button
            onClick={() => setIsUserManagementModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isFormOpen ? (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Kayıtlı Kullanıcılar ({users.length})
              </span>
              <button
                onClick={openCreateForm}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yeni Kullanıcı Ekle</span>
              </button>
            </div>

            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl ${u.avatarColor} text-white flex items-center justify-center font-bold text-sm`}
                    >
                      {u.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{u.name}</span>
                        {u.id === currentUser.id && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                            Aktif Oturum
                          </span>
                        )}
                      </div>
                      <span className="text-slate-500">{u.title} • {u.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-white border border-slate-200">
                      {u.role}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditForm(u)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white"
                        title="Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {users.length > 1 && (
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 mt-4 text-xs">
            <h4 className="font-bold text-slate-800 text-sm">
              {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Oluştur'}
            </h4>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ad Soyad *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Mehmet Demir"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ünvan / Görev *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Filo Operatörü"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kullanıcı Rolü *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                >
                  {Object.keys(roles).map((rKey) => (
                    <option key={rKey} value={rKey}>
                      {roles[rKey]?.name || rKey}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Şifre</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">E-Posta Adresi *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kullanici@translogix.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
              >
                {editingUser ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
