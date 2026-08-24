/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Layers,
  Target,
  FileText,
  RotateCcw,
  CheckCircle2,
  BarChart3,
  Hammer,
  Droplets,
  Calendar,
  User,
  ShieldCheck,
  Building2,
  Clock
} from "lucide-react";
import {
  RelatorioAdmPayload,
  CircuitoTipo,
  RELATORIO_ADM_SECO_INICIAL,
  RELATORIO_ADM_UMIDO_INICIAL,
  EstrategiaPorHorizonte,
  HorizontePlanejamento
} from "../typesAdm";
import { AdmOperationalDataForm } from "./AdmOperationalDataForm";
import { AdmStrategicHorizons } from "./AdmStrategicHorizons";
import { AdmDirectivesManager } from "./AdmDirectivesManager";
import { AdmExecutiveSummaryView } from "./AdmExecutiveSummaryView";

interface AdmModuleProps {
  circuitoTipo: CircuitoTipo; // "seco" | "umido"
}

export const AdmModule: React.FC<AdmModuleProps> = ({ circuitoTipo }) => {
  const isSeco = circuitoTipo === "seco";
  const storageKey = isSeco ? "relatorio_adm_seco_draft_v2" : "relatorio_adm_umido_draft_v2";
  const defaultInitial = isSeco ? RELATORIO_ADM_SECO_INICIAL : RELATORIO_ADM_UMIDO_INICIAL;

  const [activeTab, setActiveTab] = useState<"operacional" | "horizontes" | "diretrizes" | "executivo">("operacional");
  
  const [payload, setPayload] = useState<RelatorioAdmPayload>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultInitial, ...parsed, circuitoTipo };
      }
    } catch (e) {
      console.error(`Erro ao carregar rascunho ADM ${circuitoTipo}`, e);
    }
    return defaultInitial;
  });

  const [savedToast, setSavedToast] = useState<boolean>(false);

  // Recarrega se o circuito mudar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPayload({ ...defaultInitial, ...parsed, circuitoTipo });
      } else {
        setPayload(defaultInitial);
      }
    } catch (e) {
      setPayload(defaultInitial);
    }
  }, [circuitoTipo, storageKey]);

  // Auto-save no LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
      setSavedToast(true);
      const t = setTimeout(() => setSavedToast(false), 1800);
      return () => clearTimeout(t);
    } catch (e) {
      console.error(`Erro ao salvar rascunho ADM ${circuitoTipo}`, e);
    }
  }, [payload, storageKey, circuitoTipo]);

  const handleUpdateHorizonte = (tipo: HorizontePlanejamento, data: EstrategiaPorHorizonte) => {
    setPayload(prev => ({
      ...prev,
      [tipo === "dia"
        ? "estrategiaDia"
        : tipo === "semana"
        ? "estrategiaSemana"
        : tipo === "fim_de_semana"
        ? "estrategiaFds"
        : "estrategiaMes"]: data
    }));
  };

  const handleReset = () => {
    const nomeCircuito = isSeco ? "Circuito Seco (Cominuição)" : "Circuito Úmido (Beneficiamento)";
    if (window.confirm(`Deseja restaurar as diretrizes e parâmetros padrão do Relatório Estratégico do ${nomeCircuito}?`)) {
      setPayload(defaultInitial);
      localStorage.removeItem(storageKey);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Corporativo do Módulo Estratégico - Ero Brasil */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs border-l-4 border-l-[#007369]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#0A2028] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                {isSeco ? <Hammer className="w-3.5 h-3.5 text-[#14B8A6]" /> : <Droplets className="w-3.5 h-3.5 text-[#14B8A6]" />}
                <span className="text-[#14B8A6]">ERO BRASIL</span> • {isSeco ? "SUPERVISÃO CIRCUITO SECO (COMINUIÇÃO)" : "SUPERVISÃO CIRCUITO ÚMIDO (BENEFICIAMENTO)"}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight flex items-center gap-2">
              {isSeco ? (
                <>
                  <span>Relatório Estratégico: Circuito de Cominuição</span>
                  <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    Circuito Seco
                  </span>
                </>
              ) : (
                <>
                  <span>Relatório Estratégico: Beneficiamento & Concentrador</span>
                  <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    Circuito Úmido
                  </span>
                </>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isSeco
                ? "Gestão tática e diretrizes de turno para Britagem Primária, Rebritagem, Pátios de ROM, Silos e Estoques Pulmão."
                : "Gestão tática e diretrizes de turno para Moagem (MI003/004/005), Flotação Cu, Espessadores, Filtragem & Desaguamento e ETA."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {savedToast && (
              <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Salvo automaticamente
              </span>
            )}

            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 p-2 rounded-lg transition flex items-center gap-1 font-medium cursor-pointer"
              title="Restaurar valores de referência padrão deste circuito"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restaurar Padrão</span>
            </button>
          </div>
        </div>

        {/* Metadados de Cabeçalho do Supervisor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 mt-5">
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
              Data de Emissão
            </label>
            <input
              type="date"
              value={payload.dataEmissao}
              onChange={e => setPayload(p => ({ ...p, dataEmissao: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-[#007369] focus:border-[#007369]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
              Período de Referência
            </label>
            <input
              type="text"
              value={payload.periodoReferencia}
              onChange={e => setPayload(p => ({ ...p, periodoReferencia: e.target.value }))}
              placeholder="Ex: Semana 34 — Agosto/2026"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-[#007369] focus:border-[#007369]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
              Supervisor ADM ({isSeco ? "Circuito Seco" : "Circuito Úmido"})
            </label>
            <input
              type="text"
              value={payload.supervisorAdmResponsavel}
              onChange={e => setPayload(p => ({ ...p, supervisorAdmResponsavel: e.target.value }))}
              placeholder={isSeco ? "Ex: Sup. Marcos Valério (Cominuição)" : "Ex: Sup. Fernando Alves (Concentrador)"}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-[#007369] focus:border-[#007369]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
              Engenharia Responsável
            </label>
            <input
              type="text"
              value={payload.engenheiroProcesso || ""}
              onChange={e => setPayload(p => ({ ...p, engenheiroProcesso: e.target.value }))}
              placeholder={isSeco ? "Ex: Engª. Patrícia Mendes (Britagem)" : "Ex: Eng. Rafael Costa (Metalurgia)"}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-[#007369] focus:border-[#007369]"
            />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 bg-slate-200/80 p-1.5 rounded-xl border border-slate-300">
        <button
          onClick={() => setActiveTab("operacional")}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === "operacional"
              ? "bg-[#0A2028] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          {isSeco ? <Hammer className="w-4 h-4 text-[#14B8A6]" /> : <Droplets className="w-4 h-4 text-[#14B8A6]" />}
          <span>1. Dados Operacionais ({isSeco ? "Britagem & Rebritagem" : "Moagem, Flotação & ETA"})</span>
        </button>

        <button
          onClick={() => setActiveTab("horizontes")}
          className={`flex-1 min-w-[190px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === "horizontes"
              ? "bg-[#0A2028] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Target className="w-4 h-4 text-[#14B8A6]" />
          <span>2. Horizontes (Dia / Semana / FDS / Mês)</span>
        </button>

        <button
          onClick={() => setActiveTab("diretrizes")}
          className={`flex-1 min-w-[190px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === "diretrizes"
              ? "bg-[#0A2028] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-4 h-4 text-[#14B8A6]" />
          <span>3. Diretrizes de Turno & Prazos</span>
        </button>

        <button
          onClick={() => setActiveTab("executivo")}
          className={`flex-1 min-w-[190px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === "executivo"
              ? "bg-[#007369] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-teal-200" />
          <span>4. Painel Executivo & Exportar PDF</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "operacional" && (
        <AdmOperationalDataForm
          circuitoTipo={circuitoTipo}
          dadosBR={payload.dadosBritagemRebritagem}
          dadosCE={payload.dadosConcentradorEta}
          onChangeBR={dados => setPayload(prev => ({ ...prev, dadosBritagemRebritagem: dados }))}
          onChangeCE={dados => setPayload(prev => ({ ...prev, dadosConcentradorEta: dados }))}
        />
      )}

      {activeTab === "horizontes" && (
        <AdmStrategicHorizons
          circuitoTipo={circuitoTipo}
          estrategiaDia={payload.estrategiaDia}
          estrategiaSemana={payload.estrategiaSemana}
          estrategiaFds={payload.estrategiaFds}
          estrategiaMes={payload.estrategiaMes}
          onUpdateHorizonte={handleUpdateHorizonte}
        />
      )}

      {activeTab === "diretrizes" && (
        <AdmDirectivesManager
          circuitoTipo={circuitoTipo}
          diretrizes={payload.diretrizesTurno}
          onChange={diretrizes => setPayload(prev => ({ ...prev, diretrizesTurno: diretrizes }))}
        />
      )}

      {activeTab === "executivo" && (
        <AdmExecutiveSummaryView
          payload={payload}
          onPayloadChange={setPayload}
        />
      )}
    </div>
  );
};
