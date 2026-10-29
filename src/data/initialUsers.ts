import { UserProfile } from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'u1',
    name: 'Rafet Keser',
    title: 'Şirket Sahibi / Yönetici',
    role: 'admin',
    email: 'admin@keserlojistik.com.tr',
    avatarColor: 'bg-blue-600',
    password: 'rafetk35'
  },
  {
    id: 'u2',
    name: 'Genel Koordinasyon',
    title: 'Genel Koordinatör & Operasyon Müdürü',
    role: 'manager',
    email: 'koordinasyon@keserlojistik.com.tr',
    avatarColor: 'bg-emerald-600',
    password: 'rafetk35'
  },
  {
    id: 'u3',
    name: 'Operasyon Birimi',
    title: 'Uluslararası Filo & Sefer Operasyon Şefi',
    role: 'operations',
    email: 'operasyon@keserlojistik.com.tr',
    avatarColor: 'bg-indigo-600',
    password: 'rafetk35'
  },
  {
    id: 'u4',
    name: 'Muhasebe Birimi',
    title: 'Mali İşler & Cari Muhasebe Uzmanı',
    role: 'accounting',
    email: 'muhasebe@keserlojistik.com.tr',
    avatarColor: 'bg-amber-600',
    password: 'rafetk35'
  }
];