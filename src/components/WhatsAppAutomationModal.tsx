import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquare,
  X,
  Send,
  Truck,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Bot,
  MapPin,
  Clock,
  Sparkles,
  RefreshCw,
  Users,
  Smartphone,
  Check,
} from 'lucide-react';
import { Vehicle } from '../types';

export const WhatsAppAutomationModal: React.FC = () => {
  const {
    isWhatsAppModalOpen,
    setIsWhatsAppModalOpen,
    vehicles,
    trips,
    whatsAppLogs,
    whatsAppTemplates,
    selectedVehicleForWhatsApp,
    setSelectedVehicleForWhatsApp,
    sendWhatsAppQuery,
    sendBulkWhatsAppQuery,
    simulateIncomingWhatsAppMessage,
    showToast,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'send' | 'simulate' | 'logs'>('send');

  // Send state
  const [targetPlate, setTargetPlate] = useState<string>(
    selectedVehicleForWhatsApp?.plate || vehicles[0]?.plate || ''
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-1');
  const [customMessage, setCustomMessage] = useState<string>(
    `Hayırlı sabahlar Kaptan, ${selectedVehicleForWhatsApp?.plate || vehicles[0]?.plate || '34 TL 4501'} plakalı araç için güncel konumun nedir? Bir sorun var mı?`
  );
  const [isBulkMode, setIsBulkMode] = useState<boolean>(false);
  const [selectedBulkPlates, setSelectedBulkPlates] = useState<string[]>(
    vehicles.filter((v) => v.status === 'Yükte').map((v) => v.plate)
  );

  // Incoming Simulate state
  const [incomingRawMessage, setIncomingRawMessage] = useState<string>(
    '34 TL 4501 - Sırbistan Gradina gümrük kapısına girdim, sıra az 1 saate geçerim.'
  );
  const [simulationResult, setSimulationResult] = useState<{
    success: boolean;
    plate?: string;
    location?: string;
    message: string;
  } | null>(null);

  if (!isWhatsAppModalOpen) return null;

  const currentVeh = vehicles.find((v) => v.plate === targetPlate) || vehicles[0];

  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = whatsAppTemplates.find((t) => t.id === tplId);
    if (tpl) {
      setCustomMessage(tpl.text.replace('[Plaka]', targetPlate));
    }
  };

  const handlePlateChange = (plate: string) => {
    setTargetPlate(plate);
    const tpl = whatsAppTemplates.find((t) => t.id === selectedTemplateId);
    if (tpl) {
      setCustomMessage(tpl.text.replace('[Plaka]', plate));
    }
  };

  const handleSendSingle = () => {
    if (!targetPlate) return;
    sendWhatsAppQuery(targetPlate, customMessage);
  };

  const handleSendBulk = () => {
    if (selectedBulkPlates.length === 0) {
      showToast('Lütfen en az bir araç seçiniz.', 'warning');
      return;
    }
    sendBulkWhatsAppQuery(selectedBulkPlates, customMessage);
  };

  const handleOpenWhatsAppWeb = () => {
    const phone = currentVeh?.driverPhone?.replace(/[^0-9]/g, '') || '905320000000';
    const encoded = encodeURIComponent(customMessage);
    const url = `https://wa.me/${phone}?text=${encoded}`;
    window.open(url, '_blank');
    sendWhatsAppQuery(targetPlate, customMessage);
  };

  const handleRunSimulation = () => {
    const res = simulateIncomingWhatsAppMessage(incomingRawMessage);
    setSimulationResult(res);
  };

  const quickSamples = [
    {
      title: 'Gradina Gümrük Sırası',
      text: '34 TL 4501 - Sırbistan Gradina gümrük kapısına girdim, sıra az 1 saate geçerim.',
    },
    {
      title: 'Osmangazi Köprüsü Geçildi',
      text: '34 EUR 610 - Osmangazi köprüsünden geçtim, İstanbul Ambarlı limanına doğru devam ediyorum.',
    },
    {
      title: 'Viyana Teslimat Yapıldı',
      text: '35 LGT 992 - Viyana merkez antrepoya vardım, boşaltma tamamlandı teslim tutanağı imzalandı.',
    },
    {
      title: 'Kapıkule T1 Tescil',
      text: '16 BST 77 - Kapıkule TIR sahasında tescil sırasındayım, T1 belgesi çıktı.',
    },
    {
      title: 'Novorossiysk Ro-Ro Tahliyesi',
      text: '34 TL 4501 - Karadeniz Ro-Ro gemisinden Novorossiysk limanına tahliye olduk, Rus gümrüğündeyiz.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-400/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  WhatsApp Sürücü Otomasyonu &amp; Canlı Konum Simülatörü
                </h2>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                  Canlı Entegre
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                Şoförlere otomatik durum sorgulama, yanıt ayrıştırma ve sistem konumu otomatik güncelleme
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsWhatsAppModalOpen(false)}
            className="text-emerald-300 hover:text-white p-2 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubTab('send')}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'send' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            1. Şoföre Durum Sorgula (Tekli / Toplu WhatsApp)
            {activeSubTab === 'send' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('simulate')}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'simulate' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            2. Gelen Yanıtı Ayrıştır &amp; Konum Güncelle
            {activeSubTab === 'simulate' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('logs')}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'logs' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            3. WhatsApp İletişim Geçmişi ({whatsAppLogs.length})
            {activeSubTab === 'logs' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab 1: Send Message */}
        {activeSubTab === 'send' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Mode Toggle: Single vs Bulk */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-800">
                Gönderim Modu:
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkMode(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    !isBulkMode
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  Tekli Araç Sorgula
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkMode(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isBulkMode
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Toplu Araç Sorgula ({vehicles.filter((v) => v.status === 'Yükte').length} Yükte)
                </button>
              </div>
            </div>

            {/* Target Vehicle Selector */}
            {!isBulkMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sorgulanacak Araç &amp; Şoför *
                  </label>
                  <select
                    value={targetPlate}
                    onChange={(e) => handlePlateChange(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl bg-white font-bold text-slate-900 focus:outline-none"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.plate}>
                        {v.plate} — {v.driverName} ({v.currentLocationCity}) [{v.status}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Şoför İletişim Bilgisi
                  </label>
                  <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{currentVeh?.driverName}</span>
                    <span className="font-mono text-emerald-700 font-bold">{currentVeh?.driverPhone}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Toplu Sorgu Yapılacak Araçlar:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedBulkPlates(vehicles.map((v) => v.plate))}
                      className="text-indigo-600 hover:underline text-[11px]"
                    >
                      Tümünü Seç ({vehicles.length})
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedBulkPlates(vehicles.filter((v) => v.status === 'Yükte').map((v) => v.plate))}
                      className="text-indigo-600 hover:underline text-[11px]"
                    >
                      Sadece Yüktekiler
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {vehicles.map((v) => {
                    const isChecked = selectedBulkPlates.includes(v.plate);
                    return (
                      <label
                        key={v.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBulkPlates([...selectedBulkPlates, v.plate]);
                            } else {
                              setSelectedBulkPlates(selectedBulkPlates.filter((p) => p !== v.plate));
                            }
                          }}
                          className="rounded text-emerald-600"
                        />
                        <span className="truncate">{v.plate} ({v.driverName})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Template Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hazır Şablon Mesajlar
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {whatsAppTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleTemplateChange(tpl.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedTemplateId === tpl.id
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{tpl.title}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{tpl.text}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Body Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gönderilecek WhatsApp Mesaj Metni *
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium text-slate-800"
              />
            </div>

            {/* Action Buttons */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-emerald-900">
                <span className="font-bold">WhatsApp İletişim Hattı:</span> Şoförün telefonuna hazır şablon bildirim iletilir.
              </div>

              <div className="flex items-center gap-2">
                {!isBulkMode ? (
                  <>
                    <button
                      type="button"
                      onClick={handleOpenWhatsAppWeb}
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                      title="Şoförün telefonuna doğrudan WhatsApp Web'de mesaj aç"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Web&apos;de Aç</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSendSingle}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Simüle Et &amp; Kaydet</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendBulk}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Users className="w-4 h-4" />
                    <span>Seçili {selectedBulkPlates.length} Araca Toplu Gönder</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Incoming Message / Auto Parser Simulation */}
        {activeSubTab === 'simulate' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
              <Bot className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Otomatik Konum &amp; Durum Ayrıştırma Motoru:</strong>
                <p className="mt-0.5 text-blue-800">
                  Şoförün WhatsApp üzerinden gönderdiği cevabı bu ekrana yapıştırdığınızda sistem plaka ve konumu otomatik tespit eder, ilgili çekicinin konumunu ve aktif seferinin aşamasını günceller.
                </p>
              </div>
            </div>

            {/* Quick Test Samples */}
            <div>
              <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Tek Tıkla Hızlı Test Örnekleri (Şoför Cevapları):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickSamples.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIncomingRawMessage(s.text);
                      setSimulationResult(null);
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-colors"
                  >
                    <div className="text-xs font-bold text-slate-800">{s.title}</div>
                    <div className="text-[11px] text-slate-600 truncate mt-0.5">{s.text}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Şoförden Gelen WhatsApp Cevabını Buraya Yapıştırın *
              </label>
              <textarea
                value={incomingRawMessage}
                onChange={(e) => setIncomingRawMessage(e.target.value)}
                rows={3}
                placeholder="Örn: 34 TL 4501 - Sırbistan Gradina gümrük kapısına girdim veya 35 LGT 992 Viyana teslim edildi"
                className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRunSimulation}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Bot className="w-4 h-4" />
                <span>Mesajı Ayrıştır &amp; Konumu Otomatik Güncelle</span>
              </button>
            </div>

            {/* Simulation Result Box */}
            {simulationResult && (
              <div
                className={`p-4 rounded-xl border animate-in fade-in duration-200 space-y-3 ${
                  simulationResult.success
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  {simulationResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{simulationResult.message}</span>
                </div>

                {simulationResult.success && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-200/60 text-xs">
                    <div>
                      <span className="text-[10px] text-emerald-700 font-bold block uppercase">
                        Tespit Edilen Plaka:
                      </span>
                      <strong className="text-sm font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                        {simulationResult.plate}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-emerald-700 font-bold block uppercase">
                        Güncellenen Konum:
                      </span>
                      <strong className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        {simulationResult.location}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-emerald-700 font-bold block uppercase">
                        Yönetici Bildirimi:
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded mt-1 inline-block">
                        ✓ &quot;Konum Güncellendi&quot; bildirimi düştü
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Logs */}
        {activeSubTab === 'logs' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Gönderilen ve Gelen WhatsApp Mesaj Kayıtları</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Toplam {whatsAppLogs.length} hareket
              </span>
            </div>

            <div className="space-y-2.5">
              {whatsAppLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-colors ${
                    log.direction === 'incoming'
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          log.direction === 'incoming'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {log.direction === 'incoming' ? '← Gelen Yanıt' : '→ Giden Sorgu'}
                      </span>
                      <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {log.plate}
                      </span>
                      <span className="font-semibold text-slate-700">{log.driverName}</span>
                      <span className="font-mono text-slate-400 text-[11px]">({log.phone})</span>
                    </div>

                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {log.timestamp}
                    </span>
                  </div>

                  <p className="text-slate-800 bg-white/70 p-2 rounded-lg border border-slate-100">
                    {log.message}
                  </p>

                  {log.parsedLocation && (
                    <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Otomatik Ayrıştırılan Konum: &quot;{log.parsedLocation}&quot;</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>Keser Lojistik WhatsApp API &amp; Otomasyon Entegrasyonu</span>
          </div>

          <button
            onClick={() => setIsWhatsAppModalOpen(false)}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
