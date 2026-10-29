import { UserProfile } from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'u1',
    name: 'Rafet Keser',
    title: 'Şirket Sahibi / Yönetici',
    role: 'admin',
    email: 'admin@test.com.tr',
    avatarColor: 'bg-blue-600',
    password: '123'
  },
  {
    id: 'u2',
    name: 'özcan Keser',
    title: 'Genel Koordinatör & Operasyon Müdürü',
    role: 'manager',
    email: 'müdür@test.com.tr',
    avatarColor: 'bg-emerald-600',
    password: '123'
  },
  {
    id: 'u3',
    name: 'Burak',
    title: 'Uluslararası Filo & Sefer Operasyon Şefi',
    role: 'operations',
    email: 'operasyon@test.com.tr',
    avatarColor: 'bg-indigo-600',
    password: '123'
  },
  {
    id: 'u4',
    name: 'Meltem ',
    title: 'Mali İşler & Cari Muhasebe Uzmanı',
    role: 'accounting',
    email: 'muhasebe@test.com.tr',
    avatarColor: 'bg-amber-600',
    password: '123'
  }
];