/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Hammer,
  Columns,
  Warehouse,
  CircleDot,
  Droplets,
  Filter,
  FilterX,
  Layers,
  Activity,
  Droplet,
  Info,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Gauge
} from "lucide-react";
import {
  DadosSetorBritagemRebritagem,
  DadosSetorConcentradorEta,
  CircuitoTipo
} from "../typesAdm";

interface AdmOperationalDataFormProps {
  circuitoTipo?: CircuitoTipo;
  dadosBR: DadosSetorBritagemRebritagem;
  dadosCE: DadosSetorConcentradorEta;
  onChangeBR: (dados: DadosSetorBritagemRebritagem) => void;
  onChangeCE: (dados: DadosSetorConcentradorEta) => void;
}

export const AdmOperationalDataForm: React.FC<AdmOperationalDataFormProps> = ({
  circuitoTipo,
  dadosBR,
  dadosCE,
  onChangeBR,
  onChangeCE
}) => {
  const [activeArea, setActiveArea] = useState<"britagem_rebritagem" | "concentrador_eta">(
    circuitoTipo === "umido" ? "concentrador_eta" : "britagem_rebritagem"
  );

  React.useEffect(() => {
    if (circuitoTipo === "seco") {
      setActiveArea("britagem_rebritagem");
    } else if (circuitoTipo === "umido") {
      setActiveArea("concentrador_eta");
    }
  }, [circuitoTipo]);

  // Helper de cálculo automático
  const setBR = (campo: keyof DadosSetorBritagemRebritagem, val: any) => {
    const next = { ...dadosBR, [campo]: val };

    // Auto-cálculo de estoque total ROM
    if (campo === "estoqueMsb" || campo === "estoqueSurubim" || campo === "estoqueVermelhos" || campo === "estoqueSucuarana") {
      const msb = campo === "estoqueMsb" ? val : next.estoqueMsb || 0;
      const sur = campo === "estoqueSurubim" ? val : next.estoqueSurubim || 0;
      const verm = campo === "estoqueVermelhos" ? val : next.estoqueVermelhos || 0;
      const sucu = campo === "estoqueSucuarana" ? val : next.estoqueSucuarana || 0;
      next.estoqueTotalRom = Number(msb) + Number(sur) + Number(verm) + Number(sucu);
    }

    // Auto-cálculo de produção total rebritagem
    if (campo === "producaoBypass" || campo === "producaoPatio") {
      const byp = campo === "producaoBypass" ? val : next.producaoBypass || 0;
      const pat = campo === "producaoPatio" ? val : next.producaoPatio || 0;
      next.producaoTotalRebritagem = Number(byp) + Number(pat);
    }

    onChangeBR(next);
  };

  const setCE = (campo: keyof DadosSetorConcentradorEta, val: any) => {
    const next = { ...dadosCE, [campo]: val };

    // Auto-cálculo da taxa total de moagem
    if (campo === "taxaMi003" || campo === "taxaMi004" || campo === "taxaMi005") {
      const p3 = campo === "taxaMi003" ? val : next.taxaMi003 || 0;
      const p4 = campo === "taxaMi004" ? val : next.taxaMi004 || 0;
      const p5 = campo === "taxaMi005" ? val : next.taxaMi005 || 0;
      next.taxaTotalMoagem = Number(p3) + Number(p4) + Number(p5);
    }

    // Auto-cálculo de Autonomia de Silos + Pátio
    if (campo === "estoquePatio" || campo === "nivelSilo1" || campo === "nivelSilo2") {
      const est = Number(campo === "estoquePatio" ? val : next.estoquePatio || 0);
      const s1 = Number(campo === "nivelSilo1" ? val : next.nivelSilo1 || 0);
      const s2 = Number(campo === "nivelSilo2" ? val : next.nivelSilo2 || 0);
      const mediaSilos = (s1 + s2) / 2;
      const tSilos = (mediaSilos / 100) * 4800;
      const totalT = est + tSilos;
      next.autonomiaMinérioToneladas = Math.round(totalT);
      const taxa = Number(next.taxaTotalMoagem) || 600;
      next.autonomiaMinérioHoras = Number((totalT / taxa).toFixed(1));
    }

    // Auto-cálculo de Recuperação Metalúrgica da Flotação
    if (campo === "teorAlimentacaoCu" || campo === "teorConcentradoCu" || campo === "teorRejeitoCu") {
      const f = Number(campo === "teorAlimentacaoCu" ? val : next.teorAlimentacaoCu || 0);
      const c = Number(campo === "teorConcentradoCu" ? val : next.teorConcentradoCu || 0);
      const t = Number(campo === "teorRejeitoCu" ? val : next.teorRejeitoCu || 0);

      if (f > 0 && c > 0 && c > t && f > t) {
        const rec = ((c * (f - t)) / (f * (c - t))) * 100;
        next.recuperacaoMetalurgica = Number(Math.min(100, Math.max(0, rec)).toFixed(2));
      }
    }

    // Auto-cálculo de Metal Cobre Contido e Concentrado
    if (campo === "producaoMoagemDia" || campo === "teorAlimentacaoCu" || campo === "teorConcentradoCu" || campo === "recuperacaoMetalurgica") {
      const prodM = Number(campo === "producaoMoagemDia" ? val : next.producaoMoagemDia || 0);
      const taf = Number(campo === "teorAlimentacaoCu" ? val : next.teorAlimentacaoCu || 0);
      const rec = Number(campo === "recuperacaoMetalurgica" ? val : next.recuperacaoMetalurgica || 0);
      const tcf = Number(campo === "teorConcentradoCu" ? val : next.teorConcentradoCu || 0);

      if (prodM > 0 && taf > 0 && rec > 0) {
        const metal = (prodM * taf * rec) / 10000;
        next.metalContidoDia = Number(metal.toFixed(2));
        if (tcf > 0) {
          const conc = metal / (tcf / 100);
          next.concentradoProduzidoDia = Number(conc.toFixed(1));
        }
      }
    }

    onChangeCE(next);
  };

  return (
    <div className="space-y-5">
      {/* Selector de Grande Área Industrial */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => setActiveArea("britagem_rebritagem")}
          className={`flex-1 p-4 rounded-xl border text-left transition cursor-pointer flex items-center gap-3.5 ${
            activeArea === "britagem_rebritagem"
              ? "bg-slate-900 text-white border-slate-800 shadow-sm"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <div
            className={`p-2.5 rounded-lg ${
              activeArea === "britagem_rebritagem" ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-700"
            }`}
          >
            <Hammer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
              CIRCUITO DE COMINUIÇÃO
            </span>
            <span className="font-bold text-sm">Área 1: Britagem + Rebritagem</span>
            <span className="text-xs block opacity-85 mt-0.5">
              Britagem Primária, Rebritagem, Peneiramento e Estoques ROM
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveArea("concentrador_eta")}
          className={`flex-1 p-4 rounded-xl border text-left transition cursor-pointer flex items-center gap-3.5 ${
            activeArea === "concentrador_eta"
              ? "bg-slate-900 text-white border-slate-800 shadow-sm"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <div
            className={`p-2.5 rounded-lg ${
              activeArea === "concentrador_eta" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
              BENEFICIAMENTO, DESAGUAMENTO & RECURSOS HÍDRICOS
            </span>
            <span className="font-bold text-sm">Área 2: Concentrador + ETA</span>
            <span className="text-xs block opacity-85 mt-0.5">
              Pátio, Moagem, Flotação, Filtragem, Espessadores e ETA
            </span>
          </div>
        </button>
      </div>

      {/* ÁREA 1: BRITAGEM + REBRITAGEM */}
      {activeArea === "britagem_rebritagem" && (
        <div className="space-y-5">
          {/* Bloco 1.1: Produção Diária, Semanal e Mensal (Acumulados) */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Desempenho de Produção Acumulada: Diário, Semanal e Mensal
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                Cominuição Total
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Diário */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-2">Produção do Dia (24h)</span>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block">Realizado Dia (t)</label>
                    <input
                      type="number"
                      value={dadosBR.producaoDiaTotal || ""}
                      onChange={e => setBR("producaoDiaTotal", parseFloat(e.target.value) || "")}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">Meta Dia (t)</label>
                    <input
                      type="number"
                      value={dadosBR.metaProducaoDia || ""}
                      onChange={e => setBR("metaProducaoDia", parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-600 focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                </div>
              </div>

              {/* Semanal */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-2">Produção Semanal (WTD)</span>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block">Acumulado Semana (t)</label>
                    <input
                      type="number"
                      value={dadosBR.producaoSemanaAcum || ""}
                      onChange={e => setBR("producaoSemanaAcum", parseFloat(e.target.value) || "")}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">Meta Semanal (t)</label>
                    <input
                      type="number"
                      value={dadosBR.metaProducaoSemana || ""}
                      onChange={e => setBR("metaProducaoSemana", parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-600 focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                </div>
              </div>

              {/* Mensal */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-2">Produção Mensal (MTD)</span>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block">Acumulado Mês (t)</label>
                    <input
                      type="number"
                      value={dadosBR.producaoMesAcum || ""}
                      onChange={e => setBR("producaoMesAcum", parseFloat(e.target.value) || "")}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">Meta Mensal (t)</label>
                    <input
                      type="number"
                      value={dadosBR.metaProducaoMes || ""}
                      onChange={e => setBR("metaProducaoMes", parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-600 focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bloco 1.2: Parâmetros Operacionais da Britagem Primária */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Hammer className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Britagem Primária</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Taxa Britagem (t/h)</label>
                <input
                  type="number"
                  value={dadosBR.taxaBritagem || ""}
                  onChange={e => setBR("taxaBritagem", parseFloat(e.target.value) || "")}
                  placeholder="Meta: 1000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Disponibilidade (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dadosBR.disponibilidadeBritagem || ""}
                  onChange={e => setBR("disponibilidadeBritagem", parseFloat(e.target.value) || "")}
                  placeholder="Meta: 85%"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Utilização (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dadosBR.utilizacaoBritagem || ""}
                  onChange={e => setBR("utilizacaoBritagem", parseFloat(e.target.value) || "")}
                  placeholder="Meta: 80%"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Posição do Manto</label>
                <select
                  value={dadosBR.posicaoManto}
                  onChange={e => setBR("posicaoManto", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-teal-600"
                >
                  {["0%", "10%", "20%", "30%", "35%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Estoques de ROM por Mina e Total */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-800 block mb-2">Estoques de ROM no Pátio Primário (t)</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block">Estoque MSB</label>
                  <input
                    type="number"
                    value={dadosBR.estoqueMsb || ""}
                    onChange={e => setBR("estoqueMsb", parseFloat(e.target.value) || "")}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block">Estoque Surubim</label>
                  <input
                    type="number"
                    value={dadosBR.estoqueSurubim || ""}
                    onChange={e => setBR("estoqueSurubim", parseFloat(e.target.value) || "")}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block">Estoque Vermelhos</label>
                  <input
                    type="number"
                    value={dadosBR.estoqueVermelhos || ""}
                    onChange={e => setBR("estoqueVermelhos", parseFloat(e.target.value) || "")}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block">Estoque Suçuarana</label>
                  <input
                    type="number"
                    value={dadosBR.estoqueSucuarana || ""}
                    onChange={e => setBR("estoqueSucuarana", parseFloat(e.target.value) || "")}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-semibold"
                  />
                </div>
                <div className="bg-teal-50/80 p-1.5 rounded-lg border border-teal-200">
                  <label className="text-[10px] font-bold text-teal-800 block">Estoque Total ROM</label>
                  <span className="text-sm font-extrabold text-teal-900 block mt-0.5">
                    {dadosBR.estoqueTotalRom || 0} t
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bloco 1.3: Rebritagem & Pilhas */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Columns className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Rebritagem & Peneiramento</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Produção Bypass (t)</label>
                <input
                  type="number"
                  value={dadosBR.producaoBypass || ""}
                  onChange={e => setBR("producaoBypass", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Produção Pátio (t)</label>
                <input
                  type="number"
                  value={dadosBR.producaoPatio || ""}
                  onChange={e => setBR("producaoPatio", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">% Retido em 1/2&quot;</label>
                <input
                  type="number"
                  step="0.1"
                  value={dadosBR.retidoMeiaPol || ""}
                  onChange={e => setBR("retidoMeiaPol", parseFloat(e.target.value) || "")}
                  placeholder="Meta: < 12%"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Pilha Intermediária (t)</label>
                <input
                  type="number"
                  value={dadosBR.pilhaIntermediaria || ""}
                  onChange={e => setBR("pilhaIntermediaria", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-blue-900 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Bloco 1.4: Gargalos e Contingência */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold text-slate-900">Gargalos Operacionais & Plano de Contingência</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Gargalos Atuais na Britagem / Rebritagem</label>
                <textarea
                  rows={2}
                  value={dadosBR.gargalosAtuais}
                  onChange={e => setBR("gargalosAtuais", e.target.value)}
                  placeholder="Ex: Desgaste na tela da peneira PE002..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Plano de Contingência Operacional</label>
                <textarea
                  rows={2}
                  value={dadosBR.planoContingencia}
                  onChange={e => setBR("planoContingencia", e.target.value)}
                  placeholder="Ex: Operação em modo bypass e desobstrução mecânica..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ÁREA 2: CONCENTRADOR + ETA */}
      {activeArea === "concentrador_eta" && (
        <div className="space-y-5">
          {/* Bloco 2.1: Produção Moagem e Cobre Contido Acumulado */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Desempenho Acumulado: Moagem e Cobre Contido (Dia / Semana / Mês)
                </h3>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Planta Concentrador
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Diário */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Desempenho do Dia (24h)</span>
                <div>
                  <label className="text-[10px] text-slate-500 block">Produção Moagem (t)</label>
                  <input
                    type="number"
                    value={dadosCE.producaoMoagemDia || ""}
                    onChange={e => setCE("producaoMoagemDia", parseFloat(e.target.value) || "")}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Metal Cobre Contido (t Cu)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={dadosCE.metalContidoDia || ""}
                    onChange={e => setCE("metalContidoDia", parseFloat(e.target.value) || "")}
                    className="w-full bg-emerald-50/70 border border-emerald-300 rounded-lg px-2.5 py-1 text-xs font-extrabold text-emerald-900"
                  />
                </div>
              </div>

              {/* Semanal */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Semanal (WTD)</span>
                <div>
                  <label className="text-[10px] text-slate-500 block">Moagem Semanal (t)</label>
                  <input
                    type="number"
                    value={dadosCE.producaoMoagemSemana || ""}
                    onChange={e => setCE("producaoMoagemSemana", parseFloat(e.target.value) || "")}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Metal Cu Semanal (t Cu)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={dadosCE.metalContidoSemana || ""}
                    onChange={e => setCE("metalContidoSemana", parseFloat(e.target.value) || "")}
                    className="w-full bg-emerald-50/70 border border-emerald-300 rounded-lg px-2.5 py-1 text-xs font-extrabold text-emerald-900"
                  />
                </div>
              </div>

              {/* Mensal */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Mensal (MTD)</span>
                <div>
                  <label className="text-[10px] text-slate-500 block">Moagem Mês (t)</label>
                  <input
                    type="number"
                    value={dadosCE.producaoMoagemMes || ""}
                    onChange={e => setCE("producaoMoagemMes", parseFloat(e.target.value) || "")}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Metal Cu Mês (t Cu)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={dadosCE.metalContidoMes || ""}
                    onChange={e => setCE("metalContidoMes", parseFloat(e.target.value) || "")}
                    className="w-full bg-emerald-50/70 border border-emerald-300 rounded-lg px-2.5 py-1 text-xs font-extrabold text-emerald-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bloco 2.2: Pátio & Silos (Autonomia) */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Pátio de Finos & Silos (Autonomia)</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Estoque Pátio (t)</label>
                <input
                  type="number"
                  value={dadosCE.estoquePatio || ""}
                  onChange={e => setCE("estoquePatio", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nível Silo 1 (%)</label>
                <input
                  type="number"
                  value={dadosCE.nivelSilo1 || ""}
                  onChange={e => setCE("nivelSilo1", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nível Silo 2 (%)</label>
                <input
                  type="number"
                  value={dadosCE.nivelSilo2 || ""}
                  onChange={e => setCE("nivelSilo2", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
                <label className="text-[10px] font-bold text-amber-800 block">Autonomia (Toneladas)</label>
                <span className="text-xs font-extrabold text-amber-900 block mt-1">
                  {dadosCE.autonomiaMinérioToneladas || 0} t
                </span>
              </div>

              <div className="bg-amber-100/80 p-2 rounded-lg border border-amber-300">
                <label className="text-[10px] font-bold text-amber-900 block">Autonomia (Horas)</label>
                <span className="text-sm font-extrabold text-amber-950 block mt-0.5">
                  {dadosCE.autonomiaMinérioHoras || 0} horas
                </span>
              </div>
            </div>
          </div>

          {/* Bloco 2.3: Moagem MI003, MI004, MI005 */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CircleDot className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Moagem de Minério</h3>
              </div>
              <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                Taxa Total: {dadosCE.taxaTotalMoagem || 0} t/h
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Taxa 43MI003 (t/h)</label>
                <input
                  type="number"
                  value={dadosCE.taxaMi003 || ""}
                  onChange={e => setCE("taxaMi003", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Taxa 43MI004 (t/h)</label>
                <input
                  type="number"
                  value={dadosCE.taxaMi004 || ""}
                  onChange={e => setCE("taxaMi004", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Taxa 43MI005 (t/h)</label>
                <input
                  type="number"
                  value={dadosCE.taxaMi005 || ""}
                  onChange={e => setCE("taxaMi005", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">% &lt; 105µm (P80)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dadosCE.granulometria105 || ""}
                  onChange={e => setCE("granulometria105", parseFloat(e.target.value) || "")}
                  placeholder="Meta: > 62%"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-purple-900"
                />
              </div>
            </div>
          </div>

          {/* Bloco 2.4: Flotação de Cobre & Balanço Metalúrgico */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-coral-600" />
                <h3 className="text-sm font-bold text-slate-900">Flotação de Cobre & Reagentes</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Teor Alim Cu (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={dadosCE.teorAlimentacaoCu || ""}
                  onChange={e => setCE("teorAlimentacaoCu", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Teor Conc Cu (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dadosCE.teorConcentradoCu || ""}
                  onChange={e => setCE("teorConcentradoCu", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Teor Rejeito Cu (%)</label>
                <input
                  type="number"
                  step="0.001"
                  value={dadosCE.teorRejeitoCu || ""}
                  onChange={e => setCE("teorRejeitoCu", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <label className="text-[10px] font-bold text-emerald-800 block">Recuperação Metalúrgica</label>
                <span className="text-sm font-extrabold text-emerald-900 block mt-0.5">
                  {dadosCE.recuperacaoMetalurgica || 0}%
                </span>
              </div>
            </div>

            {/* Reagentes */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-800 block mb-2">Consumo Específico de Reagentes (g/t)</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block">Coletor (g/t)</label>
                  <input
                    type="number"
                    value={dadosCE.consumoColetor || ""}
                    onChange={e => setCE("consumoColetor", parseFloat(e.target.value) || "")}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block">Espumante (g/t)</label>
                  <input
                    type="number"
                    value={dadosCE.consumoEspumante || ""}
                    onChange={e => setCE("consumoEspumante", parseFloat(e.target.value) || "")}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block">Dispersante (g/t)</label>
                  <input
                    type="number"
                    value={dadosCE.consumoDispersante || ""}
                    onChange={e => setCE("consumoDispersante", parseFloat(e.target.value) || "")}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block">CMC (g/t)</label>
                  <input
                    type="number"
                    value={dadosCE.consumoCmc || ""}
                    onChange={e => setCE("consumoCmc", parseFloat(e.target.value) || "")}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block">Amidex (g/t)</label>
                  <input
                    type="number"
                    value={dadosCE.consumoAmidex || ""}
                    onChange={e => setCE("consumoAmidex", parseFloat(e.target.value) || "")}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bloco 2.5: Espessadores & Filtro Prensa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Espessamentos */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Filter className="w-4 h-4 text-green-700" />
                <h4 className="text-xs font-bold text-slate-900">Espessamento Concentrado & Rejeito</h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 block">Dens. Underflow Conc (g/L)</label>
                  <input
                    type="number"
                    value={dadosCE.densidadeUnderflowConc || ""}
                    onChange={e => setCE("densidadeUnderflowConc", parseFloat(e.target.value) || "")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Dens. Underflow Rej (g/L)</label>
                  <input
                    type="number"
                    value={dadosCE.densidadeUnderflowRej || ""}
                    onChange={e => setCE("densidadeUnderflowRej", parseFloat(e.target.value) || "")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Torque Rejeito EP001 (%)</label>
                  <input
                    type="number"
                    value={dadosCE.torqueRejEp001 || ""}
                    onChange={e => setCE("torqueRejEp001", parseFloat(e.target.value) || "")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Elevação Rake Conc (mm)</label>
                  <input
                    type="number"
                    value={dadosCE.elevacaoRakeConc || ""}
                    onChange={e => setCE("elevacaoRakeConc", parseFloat(e.target.value) || "")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Filtragem */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Layers className="w-4 h-4 text-pink-700" />
                <h4 className="text-xs font-bold text-slate-900">Filtragem de Concentrado</h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 block">Umidade do Bolo (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={dadosCE.umidadeBolo || ""}
                    onChange={e => setCE("umidadeBolo", parseFloat(e.target.value) || "")}
                    placeholder="Meta: < 9.5%"
                    className="w-full bg-pink-50/60 border border-pink-200 rounded-md p-1 font-bold text-pink-950"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Ciclos Realizados</label>
                  <input
                    type="number"
                    value={dadosCE.ciclosFiltro || ""}
                    onChange={e => setCE("ciclosFiltro", parseFloat(e.target.value) || "")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Produtividade Filtro (t/h)</label>
                  <input
                    type="number"
                    value={dadosCE.produtividadeFiltro || ""}
                    onChange={e => setCE("produtividadeFiltro", parseFloat(e.target.value) || "")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Pressão Compactação (kPa)</label>
                  <input
                    type="number"
                    value={dadosCE.pressaoCompactacao || ""}
                    onChange={e => setCE("pressaoCompactacao", parseFloat(e.target.value) || "")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bloco 2.6: ETA (Estação de Tratamento de Água) */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  ETA — Estação de Tratamento de Água & Balanço Hídrico
                </h3>
              </div>
              <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-md border border-cyan-200">
                Recirculação: {dadosCE.taxaRecirculacaoReuso || 0}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Captação Água Bruta (m³/h)</label>
                <input
                  type="number"
                  value={dadosCE.captacaoAguaBrutaM3h || ""}
                  onChange={e => setCE("captacaoAguaBrutaM3h", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Volume Tratado (m³/dia)</label>
                <input
                  type="number"
                  value={dadosCE.aguaTratadaM3Dia || ""}
                  onChange={e => setCE("aguaTratadaM3Dia", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Taxa de Reuso / Recirculação (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dadosCE.taxaRecirculacaoReuso || ""}
                  onChange={e => setCE("taxaRecirculacaoReuso", parseFloat(e.target.value) || "")}
                  placeholder="Meta: > 85%"
                  className="w-full bg-cyan-50 border border-cyan-300 rounded-lg px-2.5 py-1.5 text-xs font-extrabold text-cyan-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Turbidez Água Tratada (NTU)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dadosCE.turbidezAguaTratadaNtu || ""}
                  onChange={e => setCE("turbidezAguaTratadaNtu", parseFloat(e.target.value) || "")}
                  placeholder="Meta: < 2.0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Status do Balanço Hídrico & Dosagens ETA</label>
              <input
                type="text"
                value={dadosCE.balancoHidricoStatus}
                onChange={e => setCE("balancoHidricoStatus", e.target.value)}
                placeholder="Ex: Operação superavitária com recirculação estável dos espessadores..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
