import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  Mail,
  X,
  ArrowRight,
  KeyRound,
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    users,
    switchUser,
    login,
    currentUser,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = login(email, password);
    if (success) {
      setIsLoginModalOpen(false); // Giriş başarılı olunca modal tek hamlede kapanır
    } else {
      setErrorMsg('Geçersiz e-posta veya şifre.');
    }
  };

  const quickLoginAs = (userId: string) => {
    switchUser(userId);
    setIsLoginModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Keser ERP Kullanıcı Girişi</h3>
              <p className="text-[11px] text-slate-500">Güvenli Oturum Açma Ekranı</p>
            </div>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Standard Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">E-Posta Adresi</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@keserlojistik.com.tr"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Şifre</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
          >
            <span>Oturum Aç</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Hazır Kapsamlı Kullanıcı ve Rol Listesi - Sadece Admin Rolü İçin Görünür */}
        {currentUser?.role === 'admin' && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Hızlı Test Rolü Seçin (Tek Tıkla Giriş):
            </span>

            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {users.map((u) => {
                const isActive = u.id === currentUser.id;

                return (
                  <button
                    key={u.id}
                    onClick={() => quickLoginAs(u.id)}
                    className={`w-full p-2 rounded-xl text-left flex items-center justify-between border text-xs transition ${
                      isActive
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg ${u.avatarColor} text-white flex items-center justify-center font-bold text-xs`}
                      >
                        {u.name[0]}
                      </div>
                      <div>
                        <span className="font-bold block leading-tight">{u.name}</span>
                        <span className="text-[10px] text-slate-500">{u.title}</span>
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white border border-slate-200 uppercase">
                      {u.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};