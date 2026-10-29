import { UserProfile } from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'u1',
    name: 'Serkan Erdem',
    title: 'Şirket Sahibi / Yönetici',
    role: 'admin',
    email: 'serkan@keserlogistics.com',
    avatarColor: 'bg-blue-600',
    password: '123'
  },
  {
    id: 'u2',
    name: 'Kemal Keser',
    title: 'Genel Koordinatör & Operasyon Müdürü',
    role: 'manager',
    email: 'kemal@keserlogistics.com',
    avatarColor: 'bg-emerald-600',
    password: '123'
  },
  {
    id: 'u3',
    name: 'Burak Korkmaz',
    title: 'Uluslararası Filo & Sefer Operasyon Şefi',
    role: 'operations',
    email: 'burak@keserlogistics.com',
    avatarColor: 'bg-indigo-600',
    password: '123'
  },
  {
    id: 'u4',
    name: 'Meltem Yıldız',
    title: 'Mali İşler & Cari Muhasebe Uzmanı',
    role: 'accounting',
    email: 'meltem@keserlogistics.com',
    avatarColor: 'bg-amber-600',
    password: '123'
  }
];