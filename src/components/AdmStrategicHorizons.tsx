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
  Droplets
} from "lucide-react";
import { EstrategiaPorHorizonte, HorizontePlanejamento, CircuitoTipo } from "../typesAdm";

interface AdmStrategicHorizonsProps {
  circuitoTipo?: CircuitoTipo;
  estrategiaDia: EstrategiaPorHorizonte;
  estrategiaSemana: EstrategiaPorHorizonte;
  estrategiaFds: EstrategiaPorHorizonte;
  estrategiaMes: EstrategiaPorHorizonte;
  onUpdateHorizonte: (tipo: HorizontePlanejamento, data: EstrategiaPorHorizonte) => void;
}

export const AdmStrategicHorizons: React.FC<AdmStrategicHorizonsProps> = ({
  circuitoTipo = "seco",
  estrategiaDia,
  estrategiaSemana,
  estrategiaFds,
  estrategiaMes,
  onUpdateHorizonte
}) => {
  const [activeTab, setActiveTab] = useState<HorizontePlanejamento>("dia");
  const isSeco = circuitoTipo === "seco";

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
    updateField("diretrizesPrioritarias", [...list, ""]);
  };

  const updateDiretriz = (idx: number, val: string) => {
    const list = [...(current.diretrizesPrioritarias || [])];
    list[idx] = val;
    updateField("diretrizesPrioritarias", list);
  };

  const removeDiretriz = (idx: number) => {
    const list = (current.diretrizesPrioritarias || []).filter((_, i) => i !== idx);
    updateField("diretrizesPrioritarias", list.length ? list : [""]);
  };

  const addAlerta = () => {
    const list = current.alertasOperacionais || [];
    updateField("alertasOperacionais", [...list, ""]);
  };

  const updateAlerta = (idx: number, val: string) => {
    const list = [...(current.alertasOperacionais || [])];
    list[idx] = val;
    updateField("alertasOperacionais", list);
  };

  const removeAlerta = (idx: number) => {
    const list = (current.alertasOperacionais || []).filter((_, i) => i !== idx);
    updateField("alertasOperacionais", list.length ? list : [""]);
  };

  return (
    <div className="space-y-5">
      {/* Horizon Selector Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        {(["dia", "semana", "fim_de_semana", "mes"] as HorizontePlanejamento[]).map(tab => {
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

        {/* Foco Principal */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            🎯 Foco Principal & Diretriz Macro de Produção ({isSeco ? "Cominuição & Britagem" : "Concentrador & ETA"})
          </label>
          <textarea
            rows={2}
            value={current.focoPrincipal}
            onChange={e => updateField("focoPrincipal", e.target.value)}
            placeholder="Descreva a meta prioritária e foco deste período..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-[#007369] transition"
          />
        </div>

        {/* Metas Numéricas do Período - Adaptadas por Circuito */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          {isSeco ? (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Meta Produção Britagem / Alimentação (t)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={current.metaAlimentacaoBritagem || ""}
                    onChange={e => updateField("metaAlimentacaoBritagem", parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#007369]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-400">t</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Meta Taxa Horária Britador (t/h)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={current.metaTaxaHoraria || ""}
                    onChange={e => updateField("metaTaxaHoraria", parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#007369]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-400">t/h</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Meta Disponibilidade Britagem (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={current.metaDisponibilidade || ""}
                    onChange={e => updateField("metaDisponibilidade", parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#007369]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-400">%</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Meta Metal Cu Contido (t Cu)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={current.metaProducaoCobreContido || ""}
                    onChange={e => updateField("metaProducaoCobreContido", parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#007369]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-400">t Cu</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Meta Alimentação Moagem (t)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={current.metaAlimentacaoMoagem || ""}
                    onChange={e => updateField("metaAlimentacaoMoagem", parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#007369]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-400">t</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Meta Recuperação Metalúrgica (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={current.metaRecuperacao || ""}
                    onChange={e => updateField("metaRecuperacao", parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#007369]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-400">%</span>
                </div>
              </div>
            </>
          )}
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

          <div className="space-y-2">
            {(current.diretrizesPrioritarias || []).map((dir, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 w-5 text-right">{idx + 1}.</span>
                <input
                  type="text"
                  value={dir}
                  onChange={e => updateDiretriz(idx, e.target.value)}
                  placeholder={`Diretriz #${idx + 1} para o ${isSeco ? "Circuito Seco" : "Circuito Úmido"}...`}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-[#007369]"
                />
                <button
                  onClick={() => removeDiretriz(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Intervenções de Manutenção */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-slate-600" />
            Recursos e Intervenções de Manutenção Programada
          </label>
          <input
            type="text"
            value={current.recursosManutencao || ""}
            onChange={e => updateField("recursosManutencao", e.target.value)}
            placeholder="Ex: Parada de 4h na quinta-feira para troca de telas e inspeção do britador..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-[#007369]"
          />
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

          <div className="space-y-2">
            {(current.alertasOperacionais || []).map((alerta, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <input
                  type="text"
                  value={alerta}
                  onChange={e => updateAlerta(idx, e.target.value)}
                  placeholder={`Ponto de atenção #${idx + 1}...`}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-[#007369]"
                />
                <button
                  onClick={() => removeAlerta(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
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
      </div>
    </div>
  );
};
