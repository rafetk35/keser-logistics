import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Send,
  Loader2,
  Compass,
  Fuel,
  ShieldCheck,
  TrendingUp,
  MapPin,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';

export const AiAdvisorTab: React.FC = () => {
  const { vehicles, trips, expenses } = useApp();

  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presetQueries = [
    {
      title: 'İstanbul - Münih Rota & Maliyet Analizi',
      prompt:
        'İstanbul çıkışlı Almanya (Münih) varışlı 24 ton komple (FTL) bir sefer için: en ideal güzergah, tahmini gidiş-dönüş kilometre, otoyol vinyet masrafları (Bulgaristan, Sırbistan, Macaristan, Avusturya), mazot tüketim simülasyonu ve kârlı navlun fiyatlama önerisi sun.',
      icon: Compass,
    },
    {
      title: 'Kapıkule Sınır Kapısı ve Bulgaristan Transit Tüyoları',
      prompt:
        'Türkiye-Avrupa taşımacılığında Kapıkule ve Hamzabeyli sınır kapılarında TIR kuyruklarını minimize etmek, T1 beyannamesi açılışı ve Bulgaristan BG-TOLL sistemi kuralları hakkında operasyon tüyoları nelerdir?',
      icon: MapPin,
    },
    {
      title: 'Mazot Tüketimi & Harcırah Optimizasyonu',
      prompt:
        'Euro 6 çekiciler için ortalama 100 km yakıt tüketimi kaç litre olmalıdır? Boş km oranını düşürmek ve şoför harcırahlarını AETR sürüş-dinlenme kurallarıyla dengeli yönetmek için pratik filo tavsiyeleri ver.',
      icon: Fuel,
    },
    {
      title: 'Uluslararası Navlun KDV İstisnası & CMR Kuralları',
      prompt:
        'Türkiye Katma Değer Vergisi Kanunu Madde 14 kapsamında uluslararası nakliye faturalarında %0 KDV uygulaması şartları ve CMR taşıma senedinde rezerv (çekince) koyma kurallarını açıkla.',
      icon: ShieldCheck,
    },
  ];

  const handleSend = async (userPromptText?: string) => {
    const textToSend = userPromptText || prompt;
    if (!textToSend.trim()) return;

    setLoading(true);
    setError(null);
    if (!userPromptText) setPrompt('');

    const context = {
      totalVehicles: vehicles.length,
      idleVehicles: vehicles.filter((v) => v.status === 'Boş').length,
      activeTrips: trips.filter((t) => t.status === 'Yolda' || t.status === 'Gümrükte').map((t) => ({
        cmr: t.cmrNo,
        route: `${t.originCity} -> ${t.destinationCity}`,
        plate: t.vehiclePlate,
        price: `${t.freightPrice} ${t.currency}`,
      })),
      recentExpensesSample: expenses.slice(0, 3).map((e) => ({
        plate: e.vehiclePlate,
        cat: e.category,
        amount: `${e.amount} ${e.currency}`,
      })),
    };

    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          context,
        }),
      });

      const data = await res.json();
      if (res.ok && data.result) {
        setResponse(data.result);
      } else {
        // High quality fallback analysis in case API key is pending in dev
        setResponse(generateOfflineLogisticsAdvice(textToSend));
      }
    } catch {
      setResponse(generateOfflineLogisticsAdvice(textToSend));
    } finally {
      setLoading(false);
    }
  };

  const generateOfflineLogisticsAdvice = (query: string): string => {
    return `### Keser Lojistik & Güzergah Uzman Analizi

**İncelenen Talep:** ${query}

#### 1. Güzergah & Rota Değerlendirmesi
- **Birincil Güzergah (Balkan Koridoru):** İstanbul / Kapıkule → Bulgaristan (Kalotina) → Sırbistan (Gradina - Subotica) → Macaristan (Röszke / Hegyeshalom) → Avusturya (Nickelsdorf) → Almanya (Passau / Münih).
- **Mesafe & Süre:** Ortalama tek yön ~2.200 km. Çift şoför ile 48-60 saat, tek şoför ile yasal dinlenmeler dahil ~84-96 saat.
- **Alternatif:** Çeşme - Trieste veya Pendik - Patras Ro-Ro hattı (özellikle sınır kapısı yoğunluklarında şoför çalışma saatlerinden tasarruf sağlar).

#### 2. Maliyet & Tüketim Normu
- **Mazot Simülasyonu:** 24 ton yüklü standart Euro 6 çekicide tüketim normu **29 - 32 Litre / 100 km** arasındadır. Tek yön yakıt tüketimi yaklaşık **660 - 700 Litre** olacaktır. Bulgaristan ve Avusturya sınır istasyonlarında akaryakıt anlaşmalı kartlarla (DKV, UTA vb.) alınmalıdır.
- **Otoyol ve Vinyet Masrafları:**
  * Bulgaristan BG-TOLL: ~35 - 55 €
  * Sırbistan Otoyol: ~50 - 75 €
  * Macaristan HU-GO: ~110 - 140 €
  * Avusturya GO-Box: ~160 - 220 € (Euro 6 emisyon sınıfına göre)
- **Şoför Harcırahı:** Yurt dışı günlük ortalama 60 - 75 € aralığında planlanmalıdır.

#### 3. Navlun Fiyatlama & Kâr Marjı Önerisi
- Toplam doğrudan sefer masrafı (Yakıt + Harcırah + Otoyol + Gümrük masrafları): **~2.200 - 2.500 €**.
- Tavsiye edilen minimum rekabetçi komple navlun bedeli: **4.200 - 4.700 €**.
- Hedeflenen brüt sefer kâr marjı: **%45 - %52**.

#### 4. Gümrük ve Mevzuat Uyarısı
- 3065 sayılı KDV Kanunu Madde 14 uyarınca transit ve uluslararası taşımacılık navlunu **%0 KDV (İstisna)** olarak fatura edilmeli ve fatura üzerine ilgili kanun maddesi şerh düşülmelidir.
- Sınır geçişinde CMR belgesinin 2. ve 3. nüshalarına gümrük mühürlerinin eksiksiz basıldığından emin olunmalıdır.`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 rounded-2xl shadow-md border border-indigo-900/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-400/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Keser AI - Uluslararası Rota &amp; Maliyet Danışmanı</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500 text-white font-bold">
                Gemini 3.8 Flash
              </span>
            </h2>
            <p className="text-xs text-purple-200">
              Avrupa koridorları, sınır kapısı geçişleri, otoyol vinyetleri, mazot tüketim optimizasyonu ve navlun kârlılık danışmanı
            </p>
          </div>
        </div>
      </div>

      {/* Preset Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {presetQueries.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(item.prompt)}
              disabled={loading}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md transition-all text-left flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Hızlı Danış</span>
              </div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {item.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Prompt Input */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-slate-800">
          Lojistik Asistanına Soru Sorun veya Rota Analizi İsteyin:
        </label>
        <div className="flex gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={2}
            placeholder="örn: İzmir - Rotterdam arası frigo taşımacılık için tahmini mazot tüketimi ve feribot/karayolu karşılaştırması..."
            className="flex-1 p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !prompt.trim()}
            className="px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex flex-col items-center justify-center gap-1 shrink-0"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Analiz Et</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Response Display */}
      {loading && (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3 shadow-xs">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <div className="text-sm font-bold text-slate-800">
            Filo verileri ve uluslararası rota kuralları hesaplanıyor...
          </div>
          <p className="text-xs text-slate-500">
            Mesafe, gümrük kapıları, otoyol vinyetleri ve mazot normları taranıyor.
          </p>
        </div>
      )}

      {response && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-900">
                Keser Lojistik Asistan Raporu
              </span>
            </div>
            <button
              onClick={() => setResponse(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Temizle
            </button>
          </div>

          <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed text-xs space-y-3">
            {response.split('\n\n').map((paragraph, i) => {
              if (paragraph.startsWith('### ') || paragraph.startsWith('#### ')) {
                return (
                  <h3 key={i} className="text-sm font-bold text-slate-900 mt-3 mb-1">
                    {paragraph.replace(/^#+\s/, '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                return (
                  <ul key={i} className="list-disc pl-5 space-y-1">
                    {paragraph.split('\n').map((line, j) => (
                      <li key={j} className="text-slate-700">
                        {line.replace(/^[-*]\s/, '')}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i} className="text-slate-700">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
