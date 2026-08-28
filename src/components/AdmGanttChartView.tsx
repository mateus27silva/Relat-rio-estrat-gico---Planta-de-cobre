/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Layers,
  ChevronRight,
  Table
} from "lucide-react";
import {
  DiretrizSupervisorTurno,
  CircuitoTipo,
  DIAS_CHAVES_GANTT,
  normalizarAlocacaoTurnos,
  formatarResumoAlocacao
} from "../typesAdm";

interface AdmGanttChartViewProps {
  circuitoTipo?: CircuitoTipo;
  diretrizes: DiretrizSupervisorTurno[];
  onUpdateProgresso?: (id: string, novoProgresso: number) => void;
}

export const AdmGanttChartView: React.FC<AdmGanttChartViewProps> = ({
  circuitoTipo = "seco",
  diretrizes,
  onUpdateProgresso
}) => {
  const isSeco = circuitoTipo === "seco";

  // Agrupamento fixo por Setor Operacional
  const setoresUnicos: string[] = Array.from(
    new Set(diretrizes.map(d => d.setor || "Geral"))
  );

  // Grupos organizados por Setor
  const gruposMap: Record<string, DiretrizSupervisorTurno[]> = {};
  setoresUnicos.forEach(s => {
    gruposMap[s] = diretrizes.filter(d => (d.setor || "Geral") === s);
  });

  return (
    <div className="space-y-4">
      {/* Barra Superior do Gantt: Controles e Legenda */}
      <div className="bg-[#0A2028] text-white p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#007369] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded tracking-wider uppercase flex items-center gap-1">
              <Table className="w-3 h-3" />
              CRONOGRAMA GANTT SEMANAL
            </span>
            <span className="text-xs text-teal-300 font-semibold">
              {isSeco ? "Circuito Seco (Cominuição & Britagem)" : "Circuito Úmido (Beneficiamento & Moagem)"}
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            Plano Semanal de Ações Operacionais & Alocação de Turnos
          </h3>
          <p className="text-xs text-slate-300">
            Acompanhe a distribuição de atividades por setor em dias alternados ou contínuos (Turnos 07h:19h e 19h:07h).
          </p>
        </div>

        {/* Indicador de Agrupamento Fixo por Setor */}
        <div className="flex items-center gap-2">
          <span className="bg-slate-900/90 text-teal-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-teal-500/40 flex items-center gap-1.5 shadow-xs">
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span>Por Setor</span>
          </span>
        </div>
      </div>

      {/* MATRIZ DE TURNOS SEMANAL (07h:19h / 19h:07h COM MARCAÇÃO "X" VERDE) */}
      <div className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-xs w-full">
          <div className="w-full overflow-x-auto">
            <table className="w-full table-fixed text-left border-collapse text-xs">
              <colgroup>
                {/* 1. Local / Setor */}
                <col style={{ width: "12%" }} />
                {/* 2. Atividade / Diretriz */}
                <col style={{ width: "26%" }} />
                {/* 3. Recursos Pessoais */}
                <col style={{ width: "8.5%" }} />
                {/* 4 a 17. 14 Turnos (7 dias x 2 turnos = 14 * 3.25% = 45.5%) */}
                {Array.from({ length: 14 }).map((_, i) => (
                  <col key={i} style={{ width: "3.25%" }} />
                ))}
                {/* 18. Progresso */}
                <col style={{ width: "8%" }} />
              </colgroup>

              <thead>
                {/* Linha 1 do Cabeçalho: Categorias Principais e Dias */}
                <tr className="bg-[#0A2028] text-white font-extrabold uppercase divide-x divide-slate-700 border-b border-slate-700">
                  <th rowSpan={2} className="py-2 px-1 text-center bg-[#07161B] text-[10px] sm:text-[11px] tracking-tight">
                    LOCAL / SETOR
                  </th>
                  <th rowSpan={2} className="py-2 px-2 text-center text-[10px] sm:text-[11px] tracking-tight">
                    ATIVIDADE OPERACIONAL / DIRETRIZ
                  </th>
                  <th rowSpan={2} className="py-2 px-1 text-center text-[10px] sm:text-[11px] tracking-tight">
                    RECURSOS
                  </th>
                  <th colSpan={14} className="py-1.5 px-1 text-center bg-[#004D40] text-[#A7F3D0] text-[11px] tracking-wider">
                    CRONOGRAMA SEMANAL (DIAS E HORÁRIOS)
                  </th>
                  <th rowSpan={2} className="py-2 px-1 text-center bg-[#07161B] text-[10px] sm:text-[11px] tracking-tight">
                    PROGRESSO
                  </th>
                </tr>

                {/* Linha 2 do Cabeçalho: Dias da Semana */}
                <tr className="bg-[#0A4D54] text-white font-bold uppercase divide-x divide-slate-700 border-b border-slate-700 text-[10px]">
                  {DIAS_CHAVES_GANTT.map(dia => {
                    const isFds = dia.num === 6 || dia.num === 7;
                    const nomeCompleto = dia.label.split("-")[0];
                    const siglaCurta = dia.key.toUpperCase();
                    return (
                      <th
                        key={dia.key}
                        colSpan={2}
                        className={`py-1 px-0.5 text-center ${
                          isFds ? "bg-[#8D4B12] text-amber-100 font-extrabold" : "bg-[#0A4D54] text-white"
                        }`}
                        title={nomeCompleto}
                      >
                        <span className="hidden md:inline">{nomeCompleto}</span>
                        <span className="md:hidden">{siglaCurta}</span>
                      </th>
                    );
                  })}
                </tr>

                {/* Linha 3 do Cabeçalho: Sub-horários 07h:19h e 19h:07h */}
                <tr className="bg-slate-100 text-slate-700 font-bold divide-x divide-slate-200 border-b border-slate-300 text-[8px] sm:text-[9px] text-center">
                  <th className="py-1 px-1 bg-slate-200" />
                  <th className="py-1 px-1 bg-slate-200" />
                  <th className="py-1 px-1 bg-slate-200" />
                  {DIAS_CHAVES_GANTT.map(dia => {
                    const isFds = dia.num === 6 || dia.num === 7;
                    return (
                      <React.Fragment key={dia.key + "_sub"}>
                        <th className={`py-1 px-0.5 ${isFds ? "bg-amber-100/70 text-amber-900" : "bg-slate-100"}`} title="Turno Diurno (07h:19h)">
                          07h:19h
                        </th>
                        <th className={`py-1 px-0.5 ${isFds ? "bg-amber-100/50 text-amber-800" : "bg-slate-50"}`} title="Turno Noturno (19h:07h)">
                          19h:07h
                        </th>
                      </React.Fragment>
                    );
                  })}
                  <th className="py-1 px-1 bg-slate-200" />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {Object.entries(gruposMap).map(([grupo, acoes]) => {
                  if (acoes.length === 0) return null;

                  return (
                    <React.Fragment key={grupo}>
                      {/* Sub-cabeçalho do Grupo */}
                      <tr className="bg-slate-800 text-white font-bold text-[11px]">
                        <td colSpan={18} className="py-1.5 px-3 bg-slate-800 text-teal-300">
                          <div className="flex items-center gap-2">
                            <ChevronRight className="w-3.5 h-3.5 text-teal-400" />
                            <span className="uppercase tracking-wide">{grupo}</span>
                            <span className="bg-slate-700 text-slate-200 px-2 py-0.2 rounded-full text-[10px] font-normal">
                              {acoes.length} {acoes.length === 1 ? "ação alocada" : "ações alocadas"}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Linhas das Diretrizes */}
                      {acoes.map((dir, idx) => {
                        const aloc = normalizarAlocacaoTurnos(
                          dir.alocacaoTurnos,
                          dir.diaInicioNum,
                          dir.diaFimNum,
                          dir.diasAlocados
                        );
                        const isCritica = dir.prioridade === "critica";
                        const isAlta = dir.prioridade === "alta";
                        const isConcluido = dir.status === "concluido";
                        const progresso = dir.progresso !== undefined ? dir.progresso : (isConcluido ? 100 : dir.status === "em_andamento" ? 50 : 0);

                        return (
                          <tr key={dir.id || idx} className="hover:bg-teal-50/30 transition duration-150 divide-x divide-slate-200">
                            {/* Local / Setor */}
                            <td className="py-2 px-1.5 font-bold text-slate-800 text-center uppercase text-[10px] sm:text-[11px] bg-slate-50/50 break-words leading-tight">
                              {dir.setor}
                            </td>

                            {/* Atividade Operacional */}
                            <td className="py-2 px-2 text-slate-900 break-words">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span
                                    className={`text-[8.5px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                      isCritica
                                        ? "bg-rose-100 text-rose-800"
                                        : isAlta
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {isCritica ? "P1 - CRÍTICA" : isAlta ? "P2 - ALTA" : "P3 - MÉDIA"}
                                  </span>
                                  <span className="text-[9.5px] sm:text-[10px] text-slate-500 font-semibold truncate max-w-full">
                                    Prazo: {dir.prazoLimite}
                                  </span>
                                </div>
                                <p className={`text-[11px] sm:text-xs font-semibold leading-snug break-words ${isConcluido ? "line-through text-slate-400" : "text-slate-900"}`}>
                                  {dir.acaoEstrategica}
                                </p>
                              </div>
                            </td>

                            {/* Recursos Pessoais */}
                            <td className="py-2 px-1 text-center text-[9px] sm:text-[10px] font-bold text-slate-700 bg-slate-50/30 break-words">
                              <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200 inline-block text-[9.5px] leading-tight">
                                {dir.recursosPessoais || "ADM / OPERAÇÃO"}
                              </span>
                            </td>

                            {/* Células dos 7 Dias da Semana (07h:19h e 19h:07h com X em Verde Floresta) */}
                            {DIAS_CHAVES_GANTT.map(dia => {
                              const diaObj = aloc[dia.key] || { diurno: false, noturno: false };
                              const isDiurno = Boolean(diaObj.diurno);
                              const isNoturno = Boolean(diaObj.noturno);

                              return (
                                <React.Fragment key={dia.key + "_render"}>
                                  {/* Turno Diurno 07h:19h */}
                                  <td
                                    className={`py-1.5 px-0.5 text-center font-black text-xs transition select-none ${
                                      isDiurno
                                        ? "bg-[#1E7E34] text-white font-extrabold shadow-inner"
                                        : "bg-white text-transparent"
                                    }`}
                                    title={`${dia.label} 07h:19h - ${isDiurno ? "Atividade Alocada" : "Sem alocação"}`}
                                  >
                                    {isDiurno ? "X" : ""}
                                  </td>

                                  {/* Turno Noturno 19h:07h */}
                                  <td
                                    className={`py-1.5 px-0.5 text-center font-black text-xs transition select-none ${
                                      isNoturno
                                        ? "bg-[#1E7E34] text-white font-extrabold shadow-inner"
                                        : "bg-slate-50/50 text-transparent"
                                    }`}
                                    title={`${dia.label} 19h:07h - ${isNoturno ? "Atividade Alocada" : "Sem alocação"}`}
                                  >
                                    {isNoturno ? "X" : ""}
                                  </td>
                                </React.Fragment>
                              );
                            })}

                            {/* Progresso / Status */}
                            <td className="py-2 px-1.5 text-center bg-slate-50/50">
                              <div className="space-y-1">
                                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800">{progresso}%</span>
                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      isConcluido ? "bg-teal-600" : isCritica ? "bg-rose-500" : "bg-[#007369]"
                                    }`}
                                    style={{ width: `${progresso}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      {/* Legenda do Gráfico */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-bold text-slate-800">Legenda da Matriz 5S:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-[#1E7E34] text-white font-black text-[9px] flex items-center justify-center">X</span>
            <span>Turno Alocado (07h:19h ou 19h:07h)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
            <span>Prioridade P1 (Crítica)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
            <span>Prioridade P2 (Alta)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#007369] inline-block" />
            <span>Execução Operacional</span>
          </span>
        </div>

        <div className="text-[10px] text-slate-500 font-medium">
          * A alocação por setor sincroniza diretamente com o relatório de supervisão e o PDF executivo.
        </div>
      </div>
    </div>
  );
};
