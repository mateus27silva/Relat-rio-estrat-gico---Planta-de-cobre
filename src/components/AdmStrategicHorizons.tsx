/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Sun,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Target,
  Wrench,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Hammer,
  Droplets,
  Layers
} from "lucide-react";
import { EstrategiaPorHorizonte, HorizontePlanejamento, CircuitoTipo } from "../typesAdm";

interface AdmStrategicHorizonsProps {
  circuitoTipo?: CircuitoTipo;
  estrategiaDia: EstrategiaPorHorizonte;
  estrategiaSemana: EstrategiaPorHorizonte;
  estrategiaFds: EstrategiaPorHorizonte;
  estrategiaParada?: EstrategiaPorHorizonte;
  estrategiaMes: EstrategiaPorHorizonte;
  onUpdateHorizonte: (tipo: HorizontePlanejamento, data: EstrategiaPorHorizonte) => void;
}

export const AdmStrategicHorizons: React.FC<AdmStrategicHorizonsProps> = ({
  circuitoTipo = "seco",
  estrategiaDia,
  estrategiaSemana,
  estrategiaFds,
  estrategiaParada,
  estrategiaMes,
  onUpdateHorizonte
}) => {
  const [activeTab, setActiveTab] = useState<HorizontePlanejamento>("dia");
  const isSeco = circuitoTipo === "seco";

  const setoresOpcoes = isSeco
    ? [
        "Britagem Primária",
        "Rebritagem & Peneiramento",
        "Pátios ROM & Pilhas",
        "Silos de Finos & Alimentação",
        "Transporte de Minério (CVs)",
        "Manutenção Mecânica / Elétrica",
        "Segurança & SSMA",
        "Geral - Cominuição"
      ]
    : [
        "Moagem & Ciclones",
        "Flotação de Cobre",
        "Espessamento Concentrado",
        "Espessamento Rejeito",
        "Filtragem & Desaguamento",
        "ETA — Estação de Água",
        "Laboratório & Metalurgia",
        "Manutenção Mecânica / Elétrica",
        "Segurança & SSMA",
        "Geral - Beneficiamento"
      ];

  const defaultSetor = setoresOpcoes[0];

  const parseItemSetorTexto = (itemStr: string) => {
    if (!itemStr) return { setor: defaultSetor, texto: "" };
    const match = itemStr.match(/^\[(.*?)\]\s*(.*)$/);
    if (match) {
      return {
        setor: match[1].trim(),
        texto: match[2].trim()
      };
    }
    return {
      setor: defaultSetor,
      texto: itemStr.trim()
    };
  };

  const formatItemSetorTexto = (setor: string, texto: string) => {
    const cleanSetor = setor && setor.trim().length > 0 ? setor.trim() : defaultSetor;
    const cleanTexto = texto || "";
    return `[${cleanSetor}] ${cleanTexto}`;
  };

  const horizonData: Record<HorizontePlanejamento, { data: EstrategiaPorHorizonte; label: string; icon: any; color: string; badge: string }> = {
    dia: {
      data: estrategiaDia,
      label: "Estratégia do Dia (24h)",
      icon: Sun,
      color: "emerald",
      badge: "ALINHAMENTO 24H"
    },
    semana: {
      data: estrategiaSemana,
      label: "Estratégia da Semana (WTD)",
      icon: Calendar,
      color: "blue",
      badge: "META SEMANAL"
    },
    fim_de_semana: {
      data: estrategiaFds,
      label: "Final de Semana (Blindagem FDS)",
      icon: ShieldCheck,
      color: "amber",
      badge: "PLANTÃO & BLINDAGEM"
    },
    parada: {
      data: estrategiaParada || {
        titulo: "Alinhamento de Parada de Manutenção",
        focoPrincipal: "",
        diretrizesPrioritarias: [formatItemSetorTexto(isSeco ? "Britagem Primária" : "Moagem & Ciclones", "")],
        recursosManutencao: "",
        alertasOperacionais: [],
        planoAlinhamentoParada: ""
      },
      label: "Alinhamento de Parada",
      icon: Wrench,
      color: "rose",
      badge: "ALINHAMENTO DE PARADA"
    },
    mes: {
      data: estrategiaMes,
      label: "Estratégia do Mês (MTD)",
      icon: TrendingUp,
      color: "purple",
      badge: "ORÇADO VS FORECAST"
    }
  };

  const current = horizonData[activeTab].data;

  const updateField = (field: keyof EstrategiaPorHorizonte, val: any) => {
    onUpdateHorizonte(activeTab, {
      ...current,
      [field]: val
    });
  };

  const addDiretriz = () => {
    const list = current.diretrizesPrioritarias || [];
    const novoItem = formatItemSetorTexto(defaultSetor, "");
    updateField("diretrizesPrioritarias", [...list, novoItem]);
  };

  const updateDiretrizTexto = (idx: number, novoTexto: string) => {
    const list = [...(current.diretrizesPrioritarias || [])];
    const { setor } = parseItemSetorTexto(list[idx] || "");
    list[idx] = formatItemSetorTexto(setor, novoTexto);
    updateField("diretrizesPrioritarias", list);
  };

  const updateDiretrizSetor = (idx: number, novoSetor: string) => {
    const list = [...(current.diretrizesPrioritarias || [])];
    const { texto } = parseItemSetorTexto(list[idx] || "");
    list[idx] = formatItemSetorTexto(novoSetor, texto);
    updateField("diretrizesPrioritarias", list);
  };

  const removeDiretriz = (idx: number) => {
    const list = (current.diretrizesPrioritarias || []).filter((_, i) => i !== idx);
    updateField("diretrizesPrioritarias", list.length ? list : [formatItemSetorTexto(defaultSetor, "")]);
  };

  const addRecursoManutencao = () => {
    const list = getRecursosList(current.recursosManutencao);
    const novoItem = formatItemSetorTexto(defaultSetor, "");
    updateField("recursosManutencao", [...list, novoItem]);
  };

  const updateRecursoManutencaoTexto = (idx: number, novoTexto: string) => {
    const list = [...getRecursosList(current.recursosManutencao)];
    const { setor } = parseItemSetorTexto(list[idx] || "");
    list[idx] = formatItemSetorTexto(setor, novoTexto);
    updateField("recursosManutencao", list);
  };

  const updateRecursoManutencaoSetor = (idx: number, novoSetor: string) => {
    const list = [...getRecursosList(current.recursosManutencao)];
    const { texto } = parseItemSetorTexto(list[idx] || "");
    list[idx] = formatItemSetorTexto(novoSetor, texto);
    updateField("recursosManutencao", list);
  };

  const removeRecursoManutencao = (idx: number) => {
    const list = getRecursosList(current.recursosManutencao).filter((_, i) => i !== idx);
    updateField("recursosManutencao", list.length ? list : [formatItemSetorTexto(defaultSetor, "")]);
  };

  const addAlerta = () => {
    const list = current.alertasOperacionais || [];
    const novoItem = formatItemSetorTexto(defaultSetor, "");
    updateField("alertasOperacionais", [...list, novoItem]);
  };

  const updateAlertaTexto = (idx: number, novoTexto: string) => {
    const list = [...(current.alertasOperacionais || [])];
    const { setor } = parseItemSetorTexto(list[idx] || "");
    list[idx] = formatItemSetorTexto(setor, novoTexto);
    updateField("alertasOperacionais", list);
  };

  const updateAlertaSetor = (idx: number, novoSetor: string) => {
    const list = [...(current.alertasOperacionais || [])];
    const { texto } = parseItemSetorTexto(list[idx] || "");
    list[idx] = formatItemSetorTexto(novoSetor, texto);
    updateField("alertasOperacionais", list);
  };

  const removeAlerta = (idx: number) => {
    const list = (current.alertasOperacionais || []).filter((_, i) => i !== idx);
    updateField("alertasOperacionais", list.length ? list : [formatItemSetorTexto(defaultSetor, "")]);
  };

  const getRecursosList = (val: string | string[] | undefined): string[] => {
    if (Array.isArray(val)) return val.length ? val : [formatItemSetorTexto(defaultSetor, "")];
    if (typeof val === "string" && val.trim().length > 0) return [val];
    return [formatItemSetorTexto(defaultSetor, "")];
  };

  return (
    <div className="space-y-5">
      {/* Horizon Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        {(["dia", "semana", "fim_de_semana", "parada", "mes"] as HorizontePlanejamento[]).map(tab => {
          const item = horizonData[tab];
          const Icon = item.icon;
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2.5 p-3 rounded-lg text-left transition cursor-pointer ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              <div
                className={`p-2 rounded-md ${
                  isActive
                    ? item.color === "emerald"
                      ? "bg-teal-50 text-teal-700"
                      : item.color === "blue"
                      ? "bg-blue-50 text-blue-700"
                      : item.color === "amber"
                      ? "bg-amber-50 text-amber-700"
                      : item.color === "rose"
                      ? "bg-rose-50 text-rose-700"
                      : "bg-purple-50 text-purple-700"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                  {item.badge}
                </span>
                <span className="font-bold text-xs truncate block">{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Horizon Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-5">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Horizonte Selecionado:
              </span>
              <span className="bg-[#0A2028] text-white text-xs font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                {isSeco ? <Hammer className="w-3 h-3 text-[#14B8A6]" /> : <Droplets className="w-3 h-3 text-[#14B8A6]" />}
                {horizonData[activeTab].label} — {isSeco ? "Circuito Seco" : "Circuito Úmido"}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Direcionamento Estratégico da Supervisão ADM
            </h3>
          </div>
        </div>

        {/* Diretrizes Prioritárias da Lista */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-teal-700" />
              Diretrizes Prioritárias e Procedimentos Operacionais
            </label>
            <button
              onClick={addDiretriz}
              className="text-[11px] font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 bg-teal-50 px-2 py-1 rounded-md border border-teal-200 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              Adicionar Linha
            </button>
          </div>

          <div className="space-y-2.5">
            {(current.diretrizesPrioritarias || []).map((dir, idx) => {
              const { setor, texto } = parseItemSetorTexto(dir);
              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50/90 p-2 rounded-xl border border-slate-200 hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 w-5 text-right shrink-0">{idx + 1}.</span>
                    <div className="relative shrink-0">
                      <select
                        value={setoresOpcoes.includes(setor) ? setor : defaultSetor}
                        onChange={e => updateDiretrizSetor(idx, e.target.value)}
                        className="bg-white border border-teal-300 text-[#007369] font-bold text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-[#007369] cursor-pointer shadow-2xs hover:bg-teal-50/50"
                        title="Selecione a área / setor que deve atender esta diretriz"
                      >
                        {setoresOpcoes.map(s => (
                          <option key={s} value={s} className="text-slate-900 font-medium">
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={texto}
                    onChange={e => updateDiretrizTexto(idx, e.target.value)}
                    placeholder={`Ação / Procedimento operacional para ${setor}...`}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900 focus:ring-1 focus:ring-[#007369] placeholder:text-slate-400"
                  />
                  <button
                    onClick={() => removeDiretriz(idx)}
                    title="Excluir diretriz"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer self-end sm:self-center shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Intervenções de Manutenção */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-slate-600" />
              Recursos e Intervenções de Manutenção Programada
            </label>
            <button
              onClick={addRecursoManutencao}
              className="text-[11px] font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 bg-teal-50 px-2 py-1 rounded-md border border-teal-200 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              Adicionar Linha
            </button>
          </div>

          <div className="space-y-2.5">
            {getRecursosList(current.recursosManutencao).map((rec, idx) => {
              const { setor, texto } = parseItemSetorTexto(rec);
              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50/90 p-2 rounded-xl border border-slate-200 hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 w-5 text-right shrink-0">{idx + 1}.</span>
                    <div className="relative shrink-0">
                      <select
                        value={setoresOpcoes.includes(setor) ? setor : defaultSetor}
                        onChange={e => updateRecursoManutencaoSetor(idx, e.target.value)}
                        className="bg-white border border-slate-300 text-slate-800 font-bold text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-[#007369] cursor-pointer shadow-2xs hover:bg-slate-50"
                        title="Selecione o setor da intervenção de manutenção"
                      >
                        {setoresOpcoes.map(s => (
                          <option key={s} value={s} className="text-slate-900 font-medium">
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={texto}
                    onChange={e => updateRecursoManutencaoTexto(idx, e.target.value)}
                    placeholder={`Intervenção de manutenção programada / recurso para ${setor}...`}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900 focus:ring-1 focus:ring-[#007369] placeholder:text-slate-400"
                  />
                  <button
                    onClick={() => removeRecursoManutencao(idx)}
                    title="Excluir intervenção"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer self-end sm:self-center shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alertas Operacionais & Pontos de Atenção */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Alertas Operacionais & Pontos Críticos de Atenção
            </label>
            <button
              onClick={addAlerta}
              className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              Adicionar Alerta
            </button>
          </div>

          <div className="space-y-2.5">
            {(current.alertasOperacionais || []).map((alerta, idx) => {
              const { setor, texto } = parseItemSetorTexto(alerta);
              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-amber-50/40 p-2 rounded-xl border border-amber-200/80 hover:border-amber-300 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 ml-1" />
                    <span className="text-xs font-bold text-slate-500 w-4 text-right shrink-0">{idx + 1}.</span>
                    <div className="relative shrink-0">
                      <select
                        value={setoresOpcoes.includes(setor) ? setor : defaultSetor}
                        onChange={e => updateAlertaSetor(idx, e.target.value)}
                        className="bg-white border border-amber-300 text-amber-900 font-bold text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-2xs hover:bg-amber-50/50"
                        title="Selecione o setor do ponto de atenção"
                      >
                        {setoresOpcoes.map(s => (
                          <option key={s} value={s} className="text-slate-900 font-medium">
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={texto}
                    onChange={e => updateAlertaTexto(idx, e.target.value)}
                    placeholder={`Ponto de atenção crítico / risco operacional para ${setor}...`}
                    className="flex-1 bg-white border border-amber-200/80 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900 focus:ring-1 focus:ring-amber-500 placeholder:text-slate-400"
                  />
                  <button
                    onClick={() => removeAlerta(idx)}
                    title="Excluir alerta"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer self-end sm:self-center shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plano de Blindagem FDS (Se aplicável) */}
        {activeTab === "fim_de_semana" && (
          <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 space-y-1.5">
            <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              Protocolo de Blindagem de Final de Semana
            </label>
            <input
              type="text"
              value={current.planoBlindagemFds || ""}
              onChange={e => updateField("planoBlindagemFds", e.target.value)}
              placeholder="Ex: Checklist de blindagem deve ser assinado na sexta-feira até as 17:00..."
              className="w-full bg-white border border-amber-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900 focus:ring-1 focus:ring-amber-500"
            />
          </div>
        )}

        {/* Protocolo de Alinhamento de Parada (Se aplicável) */}
        {activeTab === "parada" && (
          <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200/80 space-y-1.5">
            <label className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-rose-700" />
              Protocolo de Alinhamento de Parada de Manutenção
            </label>
            <input
              type="text"
              value={current.planoAlinhamentoParada || ""}
              onChange={e => updateField("planoAlinhamentoParada", e.target.value)}
              placeholder="Ex: Reunião de alinhamento com Manutenção 1h antes, bloqueio LOTO conferido e liberação segura..."
              className="w-full bg-white border border-rose-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900 focus:ring-1 focus:ring-rose-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};
