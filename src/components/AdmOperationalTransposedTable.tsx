/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  ClipboardPaste,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Check,
  X,
  Sparkles,
  Info,
  Calendar,
  Layers
} from "lucide-react";
import { parseNumeroBritagem } from "../typesAdm";

export interface GenericParametroConfig {
  chave: string;
  nome: string;
  nomeCurto?: string;
  equipamento?: string;
  subsistema?: string;
  grupo?: string;
  unidade: string;
  minIdeal: number;
  maxIdeal: number;
  alvo?: number;
  decimais: number;
  rotuloFaixa?: string;
  impactoDesvio?: string;
  acaoRecomendada?: string;
}

export interface AdmOperationalTransposedTableProps {
  titulo?: string;
  subtitulo?: string;
  prefixId: string;
  accentColor?: "teal" | "blue" | "emerald" | "purple" | "cyan" | "pink" | "sky" | "amber" | "indigo";
  parametros: GenericParametroConfig[];
  historico: Record<string, any>[];
  onUpdateCell: (diaIdx: number, chave: string, valor: any) => void;
  onBulkUpdate: (novoHistorico: Record<string, any>[], valoresAplicados: number) => void;
  onAbrirModalColar?: (chave: string) => void;
}

const DIAS_SEMANA = [
  { chave: "seg", labelCurto: "Seg", labelCompleto: "Segunda-feira" },
  { chave: "ter", labelCurto: "Ter", labelCompleto: "Terça-feira" },
  { chave: "qua", labelCurto: "Qua", labelCompleto: "Quarta-feira" },
  { chave: "qui", labelCurto: "Qui", labelCompleto: "Quinta-feira" },
  { chave: "sex", labelCurto: "Sex", labelCompleto: "Sexta-feira" },
  { chave: "sab", labelCurto: "Sáb", labelCompleto: "Sábado" },
  { chave: "dom", labelCurto: "Dom", labelCompleto: "Domingo" },
];

const THEMES = {
  teal: {
    headerSubBg: "bg-teal-950/60",
    badgeBg: "bg-teal-50 text-teal-800 border-teal-200",
    btnHover: "hover:bg-teal-600 hover:text-white",
    ringFocus: "focus:ring-teal-500",
    groupBg: "bg-teal-50/70 border-teal-200 text-teal-900",
    groupDot: "bg-teal-600",
  },
  blue: {
    headerSubBg: "bg-blue-950/60",
    badgeBg: "bg-blue-50 text-blue-800 border-blue-200",
    btnHover: "hover:bg-blue-600 hover:text-white",
    ringFocus: "focus:ring-blue-500",
    groupBg: "bg-blue-50/70 border-blue-200 text-blue-900",
    groupDot: "bg-blue-600",
  },
  emerald: {
    headerSubBg: "bg-emerald-950/60",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    btnHover: "hover:bg-emerald-600 hover:text-white",
    ringFocus: "focus:ring-emerald-500",
    groupBg: "bg-emerald-50/70 border-emerald-200 text-emerald-900",
    groupDot: "bg-emerald-600",
  },
  purple: {
    headerSubBg: "bg-purple-950/60",
    badgeBg: "bg-purple-50 text-purple-800 border-purple-200",
    btnHover: "hover:bg-purple-600 hover:text-white",
    ringFocus: "focus:ring-purple-500",
    groupBg: "bg-purple-50/70 border-purple-200 text-purple-900",
    groupDot: "bg-purple-600",
  },
  cyan: {
    headerSubBg: "bg-cyan-950/60",
    badgeBg: "bg-cyan-50 text-cyan-800 border-cyan-200",
    btnHover: "hover:bg-cyan-600 hover:text-white",
    ringFocus: "focus:ring-cyan-500",
    groupBg: "bg-cyan-50/70 border-cyan-200 text-cyan-900",
    groupDot: "bg-cyan-600",
  },
  pink: {
    headerSubBg: "bg-pink-950/60",
    badgeBg: "bg-pink-50 text-pink-800 border-pink-200",
    btnHover: "hover:bg-pink-600 hover:text-white",
    ringFocus: "focus:ring-pink-500",
    groupBg: "bg-pink-50/70 border-pink-200 text-pink-900",
    groupDot: "bg-pink-600",
  },
  sky: {
    headerSubBg: "bg-sky-950/60",
    badgeBg: "bg-sky-50 text-sky-800 border-sky-200",
    btnHover: "hover:bg-sky-600 hover:text-white",
    ringFocus: "focus:ring-sky-500",
    groupBg: "bg-sky-50/70 border-sky-200 text-sky-900",
    groupDot: "bg-sky-600",
  },
  amber: {
    headerSubBg: "bg-amber-950/60",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    btnHover: "hover:bg-amber-600 hover:text-white",
    ringFocus: "focus:ring-amber-500",
    groupBg: "bg-amber-50/70 border-amber-200 text-amber-900",
    groupDot: "bg-amber-600",
  },
  indigo: {
    headerSubBg: "bg-indigo-950/60",
    badgeBg: "bg-indigo-50 text-indigo-800 border-indigo-200",
    btnHover: "hover:bg-indigo-600 hover:text-white",
    ringFocus: "focus:ring-indigo-500",
    groupBg: "bg-indigo-50/70 border-indigo-200 text-indigo-900",
    groupDot: "bg-indigo-600",
  },
};

export const AdmOperationalTransposedTable: React.FC<AdmOperationalTransposedTableProps> = ({
  titulo,
  subtitulo,
  prefixId,
  accentColor = "teal",
  parametros,
  historico,
  onUpdateCell,
  onBulkUpdate,
  onAbrirModalColar,
}) => {
  const theme = THEMES[accentColor] || THEMES.teal;
  const [modalColarParamChave, setModalColarParamChave] = useState<string | null>(null);
  const [textoColado, setTextoColado] = useState("");

  // Handler para colar direto no teclado em qualquer célula
  const handlePasteCelula = (
    e: React.ClipboardEvent<HTMLInputElement>,
    paramIdx: number,
    diaIdx: number
  ) => {
    const texto = e.clipboardData.getData("text");
    if (!texto) return;

    if (texto.includes("\n") || texto.includes("\t") || texto.includes("\r")) {
      e.preventDefault();
      aplicarTextoExcel(texto, paramIdx, diaIdx);
    }
  };

  // Aplicação de texto do Excel
  const aplicarTextoExcel = (texto: string, startParamIdx: number, startDiaIdx: number) => {
    if (!texto || !texto.trim()) return;

    const linhas = texto
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .filter(l => l.trim().length > 0);

    if (linhas.length === 0) return;

    const novoHistorico = historico.map(item => ({ ...item }));
    let valoresAplicados = 0;

    // Caso 1: Usuário copiou uma coluna única com 2 a 7 linhas do Excel (dias consecutivos para a linha atual)
    if (linhas.length > 1 && !linhas.some(l => l.includes("\t"))) {
      const param = parametros[startParamIdx];
      linhas.forEach((linha, rOffset) => {
        const targetDia = startDiaIdx + rOffset;
        if (targetDia >= 7) return;
        const parsed = parseNumeroBritagem(linha);
        if (parsed !== null) {
          novoHistorico[targetDia][param.chave] = parsed;
          valoresAplicados++;
        } else if (linha.trim() === "" || linha.trim() === "-") {
          novoHistorico[targetDia][param.chave] = "";
        }
      });
    } else {
      // Caso 2: Colagem com tabs (uma linha de 7 dias, ou uma matriz de vários parâmetros por vários dias)
      linhas.forEach((linha, rOffset) => {
        const targetParamIdx = startParamIdx + rOffset;
        if (targetParamIdx >= parametros.length) return;
        const param = parametros[targetParamIdx];

        const colunas = linha.includes("\t") ? linha.split("\t") : [linha];
        colunas.forEach((celulaTexto, cOffset) => {
          const targetDia = startDiaIdx + cOffset;
          if (targetDia >= 7) return;

          const parsed = parseNumeroBritagem(celulaTexto);
          if (parsed !== null) {
            novoHistorico[targetDia][param.chave] = parsed;
            valoresAplicados++;
          } else if (celulaTexto.trim() === "" || celulaTexto.trim() === "-") {
            novoHistorico[targetDia][param.chave] = "";
          }
        });
      });
    }

    if (valoresAplicados > 0) {
      onBulkUpdate(novoHistorico, valoresAplicados);
    }
  };

  // Navegação rápida pelo teclado (Setas e Enter)
  const handleKeyDownCelula = (
    e: React.KeyboardEvent<HTMLInputElement>,
    paramIdx: number,
    diaIdx: number
  ) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextParam = Math.min(parametros.length - 1, paramIdx + 1);
      document.getElementById(`input-${prefixId}-${nextParam}-${diaIdx}`)?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevParam = Math.max(0, paramIdx - 1);
      document.getElementById(`input-${prefixId}-${prevParam}-${diaIdx}`)?.focus();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (diaIdx < 6) {
        document.getElementById(`input-${prefixId}-${paramIdx}-${diaIdx + 1}`)?.focus();
      } else if (paramIdx < parametros.length - 1) {
        document.getElementById(`input-${prefixId}-${paramIdx + 1}-0`)?.focus();
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (diaIdx > 0) {
        document.getElementById(`input-${prefixId}-${paramIdx}-${diaIdx - 1}`)?.focus();
      } else if (paramIdx > 0) {
        document.getElementById(`input-${prefixId}-${paramIdx - 1}-6`)?.focus();
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      // Avança para o próximo dia na mesma linha
      if (diaIdx < 6) {
        document.getElementById(`input-${prefixId}-${paramIdx}-${diaIdx + 1}`)?.focus();
      } else if (paramIdx < parametros.length - 1) {
        document.getElementById(`input-${prefixId}-${paramIdx + 1}-0`)?.focus();
      }
    }
  };

  // Abrir modal de colagem rápida para um parâmetro específico
  const abrirModalColar = (chave: string) => {
    if (onAbrirModalColar) {
      onAbrirModalColar(chave);
    } else {
      setModalColarParamChave(chave);
      setTextoColado("");
    }
  };

  const handleConfirmarModalLocal = () => {
    if (!modalColarParamChave || !textoColado.trim()) return;
    const pIdx = parametros.findIndex(p => p.chave === modalColarParamChave);
    if (pIdx >= 0) {
      aplicarTextoExcel(textoColado, pIdx, 0);
    }
    setModalColarParamChave(null);
    setTextoColado("");
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-2xs bg-white">
      {titulo && (
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>{titulo}</span>
            </h4>
            {subtitulo && (
              <p className="text-[11px] text-slate-300 mt-0.5">{subtitulo}</p>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Formato Transposto: Parâmetros em linhas × 7 dias em colunas
          </span>
        </div>
      )}

      <table className="w-full text-center border-collapse text-[11px]">
        <thead>
          <tr className="bg-slate-900 text-white font-bold text-[10px] border-b border-slate-700">
            <th className="p-2 border-r border-slate-700 w-9 text-center bg-slate-900 sticky left-0 z-20">
              #
            </th>
            <th className="p-2 border-r border-slate-700 min-w-[210px] text-left bg-slate-900 sticky left-9 z-20">
              Parâmetro / Indicador
            </th>
            <th className="p-2 border-r border-slate-700 min-w-[110px] text-center bg-slate-850">
              Faixa Ideal
            </th>
            {DIAS_SEMANA.map((dia, dIdx) => (
              <th
                key={dia.chave}
                className={`p-2 border-r border-slate-700 min-w-[68px] text-center ${
                  dIdx >= 5 ? "bg-slate-850 text-amber-200" : "bg-slate-900 text-slate-100"
                }`}
                title={dia.labelCompleto}
              >
                <div className="flex flex-col items-center">
                  <span className="font-extrabold text-[11px]">{dia.labelCurto}</span>
                  <span className="text-[8px] font-normal text-slate-400">Dia {dIdx + 1}</span>
                </div>
              </th>
            ))}
            <th className="p-2 border-r border-slate-700 min-w-[74px] text-center bg-slate-850 text-teal-200">
              Média
            </th>
            <th className="p-2 border-r border-slate-700 min-w-[85px] text-center bg-slate-850 text-slate-200">
              Status CEP
            </th>
            <th className="p-2 min-w-[65px] text-center bg-slate-900">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {parametros.map((param, paramIdx) => {
            // Verificar se há troca de grupo de parâmetros (categoria / subsistema)
            const prevParam = paramIdx > 0 ? parametros[paramIdx - 1] : null;
            const currentGroup = param.grupo || param.subsistema;
            const prevGroup = prevParam ? (prevParam.grupo || prevParam.subsistema) : null;
            const showGroupHeader = currentGroup && currentGroup !== prevGroup;

            // Calcular média e desvios para este parâmetro
            const valoresValidos: number[] = [];
            let desviosCount = 0;

            for (let d = 0; d < 7; d++) {
              const val = historico[d]?.[param.chave];
              const num = parseNumeroBritagem(val);
              if (num !== null) {
                valoresValidos.push(num);
                if (num < param.minIdeal || num > param.maxIdeal) {
                  desviosCount++;
                }
              }
            }

            const mediaCalculada = valoresValidos.length > 0
              ? (valoresValidos.reduce((a, b) => a + b, 0) / valoresValidos.length)
                  .toFixed(param.decimais)
                  .replace(".", ",")
              : "—";

            return (
              <React.Fragment key={param.chave}>
                {showGroupHeader && (
                  <tr className="border-y border-slate-300">
                    <td
                      colSpan={13}
                      className={`px-3 py-1.5 text-left font-bold text-[10.5px] uppercase tracking-wider ${theme.groupBg}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${theme.groupDot}`}></span>
                        <span>{currentGroup}</span>
                      </div>
                    </td>
                  </tr>
                )}

                <tr className="border-b border-slate-200 hover:bg-slate-50/80 transition group">
                  {/* # Index */}
                  <td className="p-1.5 border-r border-slate-200 text-slate-400 font-mono text-[10px] text-center bg-slate-50/60 sticky left-0 z-10">
                    {paramIdx + 1}
                  </td>

                  {/* Nome e Equipamento */}
                  <td className="p-2 border-r border-slate-200 text-left bg-white sticky left-9 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                    <div className="flex flex-col justify-center">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {param.equipamento && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {param.equipamento}
                          </span>
                        )}
                        <span className="font-bold text-slate-900 text-xs leading-tight">
                          {param.nomeCurto || param.nome}
                        </span>
                      </div>
                      <span className="text-[9.5px] text-slate-500 font-medium mt-0.5">
                        {param.nome !== (param.nomeCurto || param.nome) ? param.nome : ""} ({param.unidade})
                      </span>
                    </div>
                  </td>

                  {/* Faixa Ideal */}
                  <td className="p-1.5 border-r border-slate-200 bg-slate-50/40 text-center font-mono text-[10px] text-slate-700">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-slate-800">
                        {param.rotuloFaixa || `${param.minIdeal} a ${param.maxIdeal} ${param.unidade}`}
                      </span>
                      {param.alvo !== undefined && (
                        <span className="text-[8.5px] text-slate-500">
                          Alvo: {param.alvo} {param.unidade}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 7 Dias (Segunda a Domingo) */}
                  {DIAS_SEMANA.map((dia, diaIdx) => {
                    const diaObj = historico[diaIdx] || {};
                    const valor = diaObj[param.chave];
                    const numVal = parseNumeroBritagem(valor);
                    const isFora = numVal !== null && (numVal > param.maxIdeal || numVal < param.minIdeal);
                    const isAlto = numVal !== null && numVal > param.maxIdeal;

                    return (
                      <td
                        key={dia.chave}
                        className={`p-1 border-r border-slate-200 ${
                          isFora
                            ? "bg-rose-50/80 font-bold text-rose-900"
                            : diaIdx >= 5
                            ? "bg-amber-50/30"
                            : "bg-white"
                        }`}
                        title={
                          isFora
                            ? `Alerta: ${param.nomeCurto || param.nome} (${dia.labelCurto}) = ${numVal} ${param.unidade} está ${
                                isAlto ? "ACIMA" : "ABAIXO"
                              } da faixa ideal (${param.minIdeal} - ${param.maxIdeal} ${param.unidade})`
                            : `Faixa Ideal: ${param.minIdeal} a ${param.maxIdeal} ${param.unidade}`
                        }
                      >
                        <div className="relative">
                          <input
                            id={`input-${prefixId}-${paramIdx}-${diaIdx}`}
                            type="text"
                            inputMode="decimal"
                            value={valor === "" || valor === undefined ? "" : valor}
                            onChange={e => onUpdateCell(diaIdx, param.chave, e.target.value)}
                            onPaste={e => handlePasteCelula(e, paramIdx, diaIdx)}
                            onKeyDown={e => handleKeyDownCelula(e, paramIdx, diaIdx)}
                            placeholder="—"
                            className={`w-full text-center rounded px-1 py-1 text-xs font-semibold focus:bg-white focus:ring-1 ${
                              theme.ringFocus
                            } transition ${
                              isFora
                                ? "border border-rose-400 bg-rose-50 text-rose-950 font-bold"
                                : "border border-slate-200 bg-transparent text-slate-900 hover:border-slate-300"
                            }`}
                          />
                          {isFora && (
                            <span className="absolute right-0.5 top-0 text-[8px] text-rose-600 font-black">
                              !
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}

                  {/* Média Semanal */}
                  <td className="p-1.5 border-r border-slate-200 bg-slate-50/70 text-center font-bold font-mono text-xs text-slate-800">
                    {mediaCalculada}
                  </td>

                  {/* Status CEP */}
                  <td className="p-1.5 border-r border-slate-200 text-center">
                    {desviosCount > 0 ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-rose-100 text-rose-800 border border-rose-200 whitespace-nowrap">
                        Desvio ({desviosCount}x)
                      </span>
                    ) : valoresValidos.length > 0 ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-teal-100 text-teal-800 border border-teal-200 whitespace-nowrap">
                        Controlado
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono text-[10px]">—</span>
                    )}
                  </td>

                  {/* Ação Colar 7 Dias */}
                  <td className="p-1 text-center">
                    <button
                      type="button"
                      onClick={() => abrirModalColar(param.chave)}
                      className={`p-1 rounded text-slate-600 ${theme.btnHover} border border-slate-200 transition cursor-pointer flex items-center justify-center mx-auto`}
                      title={`Colar valores do Excel para ${param.nomeCurto || param.nome}`}
                    >
                      <ClipboardPaste className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* Modal Local Rápido de Colar (fallback quando onAbrirModalColar não for informado) */}
      {modalColarParamChave && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">
                  Colar Valores do Excel (7 Dias da Semana)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalColarParamChave(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-600">
                Copie os 7 valores diários (Segunda a Domingo) no Excel e cole no campo abaixo. Os valores serão distribuídos na linha do indicador selecionado:
              </p>

              <textarea
                value={textoColado}
                onChange={e => setTextoColado(e.target.value)}
                placeholder={"Cole aqui os 7 valores copiados do Excel...\nEx:\n195,4\n200,1\n198,0\n202,5\n201,0\n204,2\n199,8"}
                rows={6}
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-slate-50"
              />
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalColarParamChave(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarModalLocal}
                className="px-4 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Aplicar na Linha</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
