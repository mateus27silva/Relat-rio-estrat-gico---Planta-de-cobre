/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  FileDown,
  Copy,
  Check,
  TrendingUp,
  Target,
  Clock,
  User,
  ShieldAlert,
  Droplets,
  Hammer,
  AlertTriangle,
  FileText,
  Loader2,
  Calendar,
  Layers,
  Eye,
  CheckCircle2,
  Sparkles,
  Edit3,
  ShieldCheck,
  ChevronRight,
  Info,
  Award,
  Building,
  Lock
} from "lucide-react";
import { RelatorioAdmPayload, gerarWppAdm, fmtData } from "../typesAdm";
import { gerarRelatorioAdmPDF } from "../utils/pdfGeneratorAdm";

interface AdmExecutiveSummaryViewProps {
  payload: RelatorioAdmPayload;
  onPayloadChange: (next: RelatorioAdmPayload) => void;
}

export const AdmExecutiveSummaryView: React.FC<AdmExecutiveSummaryViewProps> = ({
  payload,
  onPayloadChange
}) => {
  const [copiado, setCopiado] = useState<boolean>(false);
  const [baixandoPdf, setBaixandoPdf] = useState<boolean>(false);
  const [modoEdicaoRapida, setModoEdicaoRapida] = useState<boolean>(false);

  const isSeco = payload.circuitoTipo === "seco";
  const textoWpp = gerarWppAdm(payload);

  const handleCopiarWpp = async () => {
    try {
      await navigator.clipboard.writeText(textoWpp);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch (err) {
      console.error("Falha ao copiar", err);
    }
  };

  const handleBaixarPdf = async () => {
    try {
      setBaixandoPdf(true);
      await new Promise(r => setTimeout(r, 400));
      gerarRelatorioAdmPDF(payload);
    } catch (e) {
      console.error("Erro ao gerar PDF ADM", e);
    } finally {
      setBaixandoPdf(false);
    }
  };

  const { dadosBritagemRebritagem: br, dadosConcentradorEta: ce, diretrizesTurno: dt } = payload;

  const totalDiretrizes = dt.length;
  const concluidas = dt.filter(d => d.status === "concluido").length;
  const emAndamento = dt.filter(d => d.status === "em_andamento").length;
  const pendentes = dt.filter(d => d.status === "pendente").length;
  const criticas = dt.filter(d => d.prioridade === "critica").length;

  // Helper para cálculo de % atingimento e status
  const calcAtingimento = (real?: number | string | null, meta?: number | null) => {
    if (!real || !meta || typeof meta !== "number" || meta <= 0) return { pct: "-", ok: true };
    const realNum = typeof real === "number" ? real : parseFloat(String(real).replace(/\./g, "").replace(",", "."));
    if (isNaN(realNum)) return { pct: "-", ok: true };
    const pctVal = (realNum / meta) * 100;
    return {
      pct: `${pctVal.toFixed(1)}%`,
      ok: pctVal >= 95
    };
  };

  // Tabela Operacional Formal (Igual ao PDF Corporativo Padrão Vale / Ero Brasil)
  const tableDataOperacional = isSeco
    ? [
        {
          indicador: "Britagem Total (ROM + Rebritagem)",
          setor: "Cominuição",
          realDia: `${br.producaoDiaTotal ? br.producaoDiaTotal.toLocaleString("pt-BR") : "-"} t`,
          metaDia: `${br.metaProducaoDia ? br.metaProducaoDia.toLocaleString("pt-BR") : "-"} t`,
          ating: calcAtingimento(br.producaoDiaTotal, br.metaProducaoDia).pct,
          realSemana: `${br.producaoSemanaAcum ? br.producaoSemanaAcum.toLocaleString("pt-BR") : "-"} t`,
          metaSemana: `${br.metaProducaoSemana ? br.metaProducaoSemana.toLocaleString("pt-BR") : "-"} t`,
          realMes: `${br.producaoMesAcum ? br.producaoMesAcum.toLocaleString("pt-BR") : "-"} t`,
          metaMes: `${br.metaProducaoMes ? br.metaProducaoMes.toLocaleString("pt-BR") : "-"} t`,
          destaque: true
        },
        {
          indicador: "Taxa Alimentação Britagem Primária",
          setor: "Britagem",
          realDia: `${br.taxaBritagem || "-"} t/h`,
          metaDia: `${br.metaTaxaBritagem || "-"} t/h`,
          ating: calcAtingimento(br.taxaBritagem, br.metaTaxaBritagem).pct,
          realSemana: "-",
          metaSemana: "-",
          realMes: "-",
          metaMes: "-",
          destaque: false
        },
        {
          indicador: "Disponibilidade / Utilização Física",
          setor: "Britagem",
          realDia: `${br.disponibilidadeBritagem || "-"}% / ${br.utilizacaoBritagem || "-"}%`,
          metaDia: "88,0% / 82,0%",
          ating: "Conforme",
          realSemana: "-",
          metaSemana: "-",
          realMes: "-",
          metaMes: "-",
          destaque: false
        },
        {
          indicador: "Rebritagem Total (Bypass + Pátio)",
          setor: "Rebritagem",
          realDia: `${br.producaoTotalRebritagem ? br.producaoTotalRebritagem.toLocaleString("pt-BR") : "-"} t`,
          metaDia: "12.000 t",
          ating: calcAtingimento(br.producaoTotalRebritagem, 12000).pct,
          realSemana: "-",
          metaSemana: "-",
          realMes: "-",
          metaMes: "-",
          destaque: false
        },
        {
          indicador: "Produtividade / Retido Peneira 1/2''",
          setor: "Rebritagem",
          realDia: `${br.produtividadeRebritagem || "-"} t/h (${br.retidoMeiaPol || "-"}%)`,
          metaDia: "1.020 t/h (≤ 12%)",
          ating: "Em Meta",
          realSemana: "-",
          metaSemana: "-",
          realMes: "-",
          metaMes: "-",
          destaque: false
        },
        {
          indicador: "Posição do Manto / Aferição Britador",
          setor: "Equipamentos",
          realDia: `${br.posicaoManto || "-"} (${br.afericaoBritador || "-"})`,
          metaDia: "35% (Calibrado)",
          ating: "Monitorado",
          realSemana: "-",
          metaSemana: "-",
          realMes: "-",
          metaMes: "-",
          destaque: false
        },
        {
          indicador: "Estoques Totais ROM: MSB + Sur + Verm",
          setor: "Pátios / ROM",
          realDia: `${br.estoqueTotalRom ? br.estoqueTotalRom.toLocaleString("pt-BR") : "-"} t`,
          metaDia: "25.000 t",
          ating: calcAtingimento(br.estoqueTotalRom, 25000).pct,
          realSemana: `MSB: ${br.estoqueMsb || "-"} t`,
          metaSemana: `Sur: ${br.estoqueSurubim || "-"} t`,
          realMes: "-",
          metaMes: "-",
          destaque: false
        },
        {
          indicador: "Pilha Intermediária / Pulmão Finos",
          setor: "Autonomia",
          realDia: `${br.pilhaIntermediaria ? br.pilhaIntermediaria.toLocaleString("pt-BR") : "-"} t`,
          metaDia: "10.000 t",
          ating: "Autonomia OK",
          realSemana: "-",
          metaSemana: "-",
          realMes: "-",
          metaMes: "-",
          destaque: false
        }
      ]
    : [
        {
          indicador: "Alimentação Moagem (Tratamento Planta)",
          setor: "Moagem",
          realDia: `${ce.producaoMoagemDia ? ce.producaoMoagemDia.toLocaleString("pt-BR") : "-"} t`,
          metaDia: `${ce.metaProducaoMoagemDia ? ce.metaProducaoMoagemDia.toLocaleString("pt-BR") : "-"} t`,
          ating: calcAtingimento(ce.producaoMoagemDia, ce.metaProducaoMoagemDia).pct,
          realSemana: `${ce.producaoMoagemSemana ? ce.producaoMoagemSemana.toLocaleString("pt-BR") : "-"} t`,
          metaSemana: `${ce.metaProducaoMoagemSemana ? ce.metaProducaoMoagemSemana.toLocaleString("pt-BR") : "-"} t`,
          realMes: `${ce.producaoMoagemMes ? ce.producaoMoagemMes.toLocaleString("pt-BR") : "-"} t`,
          metaMes: `${ce.metaProducaoMoagemMes ? ce.metaProducaoMoagemMes.toLocaleString("pt-BR") : "-"} t`,
          destaque: true
        },
        {
          indicador: "Cobre Contido Líquido Produzido",
          setor: "Metalurgia",
          realDia: `${ce.metalContidoDia || "-"} t Cu`,
          metaDia: `${ce.metaMetalContidoDia || "-"} t Cu`,
          ating: calcAtingimento(ce.metalContidoDia, ce.metaMetalContidoDia).pct,
          realSemana: `${ce.metalContidoSemana || "-"} t Cu`,
          metaSemana: `${ce.metaMetalContidoSemana || "-"} t Cu`,
          realMes: `${ce.metalContidoMes || "-"} t Cu`,
          metaMes: `${ce.metaMetalContidoMes || "-"} t Cu`,
          destaque: true
        },
        {
          indicador: "Taxa Total Moagem / Granulometria P80",
          setor: "Moagem",
          realDia: `${ce.taxaTotalMoagem || "-"} t/h (${ce.granulometria105 || "-"}%)`,
          metaDia: "605 t/h (≥ 62%)",
          ating: "Em Meta",
          realSemana: "-",
          metaSemana: "-",
          realMes: "-",
          metaMes: "-",
          destaque: false
        },
        {
          indicador: "Recuperação Metalúrgica Global Cu",
          setor: "Flotação",
          realDia: `${ce.recuperacaoMetalurgica || "-"}%`,
          metaDia: `${ce.metaRecuperacao || "-"}%`,
          ating: calcAtingimento(ce.recuperacaoMetalurgica, ce.metaRecuperacao).pct,
          realSemana: `${ce.recuperacaoMetalurgica || "-"}%`,
          metaSemana: `${ce.metaRecuperacao || "-"}%`,
          realMes: `${ce.recuperacaoMetalurgica || "-"}%`,
          metaMes: `${ce.metaRecuperacao || "-"}%`,
          destaque: false
        },
        {
          indicador: "Teores: Alimentação / Conc. / Rejeito",
          setor: "Flotação",
          realDia: `${ce.teorAlimentacaoCu || "-"}% / ${ce.teorConcentradoCu || "-"}% / ${ce.teorRejeitoCu || "-"}%`,
          metaDia: "1,28% / 33,5% / 0,10%",
          ating: "Conforme",
          realSemana: "-",
          metaSemana: "-",
          realMes: "-",
          metaMes: "-",
          destaque: false
        },
        {
          indicador: "Autonomia de Finos: Silos + Pátio",
          setor: "Alimentação",
          realDia: `${ce.autonomiaMinérioHoras || "-"} h (${ce.autonomiaMinérioToneladas ? ce.autonomiaMinérioToneladas.toLocaleString("pt-BR") : "-"} t)`,
          metaDia: "24,0 h (8.000 t)",
          ating: "Estável",
          realSemana: "-",
          metaSemana: "-",
          realMes: "-",
          metaMes: "-",
          destaque: false
        },
        {
          indicador: "Umidade Bolo Filtro Prensa / Ciclos",
          setor: "Filtragem",
          realDia: `${ce.umidadeBolo || "-"}% (${ce.ciclosFiltro || "-"} ciclos)`,
          metaDia: `≤ ${ce.metaUmidadeBolo || "9,5"}% (26 ciclos)`,
          ating: "Aderente",
          realSemana: "-",
          metaSemana: "-",
          realMes: "-",
          metaMes: "-",
          destaque: false
        },
        {
          indicador: "ETA: Taxa de Reuso / Recirculação Hídrica",
          setor: "Rec. Hídricos",
          realDia: `${ce.taxaRecirculacaoReuso || "-"}% (Turb: ${ce.turbidezAguaTratadaNtu || "-"} NTU)`,
          metaDia: `≥ ${ce.metaRecirculacao || "85"}% (≤ 2,0 NTU)`,
          ating: "Conforme",
          realSemana: "-",
          metaSemana: "-",
          realMes: "-",
          metaMes: "-",
          destaque: false
        }
      ];

  const gargalosTexto = isSeco
    ? br.gargalosAtuais || "Operação do circuito seco sem restrições ou desvios limitantes declarados."
    : ce.gargalosAtuais || "Circuito úmido operando em regime regular sem gargalos críticos no momento.";

  const contingTexto = payload.observacoesGerais || "Cumprir rigorosamente os padrões operacionais, monitorar taxas horárias, estabilidade de pilhas/silos e acionar imediatamente a manutenção em caso de anomalia.";

  return (
    <div className="space-y-6">
      {/* Top Action & Status Banner */}
      <div className="bg-[#0A2028] text-white rounded-2xl p-6 border border-slate-800 shadow-md border-t-4 border-t-[#007369]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#007369]/30 text-[#2DD4BF] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#007369]/50 flex items-center gap-1">
                {isSeco ? <Hammer className="w-3.5 h-3.5 text-[#2DD4BF]" /> : <Droplets className="w-3.5 h-3.5 text-[#2DD4BF]" />}
                ERO BRASIL • {isSeco ? "RELATÓRIO GERENCIAL CIRCUITO SECO (RGE-OP-SEC-01)" : "RELATÓRIO GERENCIAL CIRCUITO ÚMIDO (RGE-OP-UMI-02)"}
              </span>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400" />
                Classificação: USO INTERNO / ESTRATÉGICO
              </span>
            </div>
            <h2 className="text-2xl font-black mt-1.5 text-slate-50 tracking-tight">
              {isSeco
                ? "Painel Executivo & Governança: Circuito Seco"
                : "Painel Executivo & Governança: Circuito Úmido"}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Estrutura formal de governança operacional e controle físico-metalúrgico (padrão corporativo Vale / Ero Brasil). Visualize abaixo o espelho exato do relatório em PDF oficial antes do download.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Alternar Edição Rápida */}
            <button
              onClick={() => setModoEdicaoRapida(!modoEdicaoRapida)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                modoEdicaoRapida
                  ? "bg-slate-700 text-teal-300 border-teal-500/50"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
              }`}
              title="Ajustar assinaturas e observações finais antes de exportar"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{modoEdicaoRapida ? "Fechar Edição Rápida" : "Editar Assinaturas & Parecer"}</span>
            </button>

            {/* Botão WhatsApp */}
            <button
              onClick={handleCopiarWpp}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                copiado
                  ? "bg-emerald-600 text-white"
                  : "bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950"
              }`}
            >
              {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiado ? "Copiado para WhatsApp!" : "Copiar WhatsApp"}</span>
            </button>

            {/* Botão PDF */}
            <button
              onClick={handleBaixarPdf}
              disabled={baixandoPdf}
              className="flex items-center gap-2 bg-[#007369] hover:bg-[#005F56] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50"
            >
              {baixandoPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <FileDown className="w-4 h-4 text-white" />
              )}
              <span>{baixandoPdf ? "Exportando PDF..." : isSeco ? "Baixar PDF Circuito Seco" : "Baixar PDF Circuito Úmido"}</span>
            </button>
          </div>
        </div>

        {/* Resumo Rápido de Governança */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Total Diretrizes Registradas</span>
            <span className="text-xl font-black text-white mt-0.5 block">{totalDiretrizes}</span>
            <span className="text-[10px] text-teal-400">{concluidas} concluídas • {emAndamento} em execução</span>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Ações Críticas (P1)</span>
            <span className="text-xl font-black text-rose-400 mt-0.5 block">{criticas}</span>
            <span className="text-[10px] text-slate-400">Com prazo fatal imediato</span>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Supervisão ADM Responsável</span>
            <span className="text-sm font-bold text-slate-200 mt-0.5 block truncate">
              {payload.supervisorAdmResponsavel || "Não informado"}
            </span>
            <span className="text-[10px] text-slate-400 truncate block">{isSeco ? "Cominuição & Britagem" : "Beneficiamento & Moagem"}</span>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Controle Documental</span>
            <span className="text-sm font-bold text-[#2DD4BF] mt-0.5 block truncate">
              {isSeco ? "RGE-OP-SEC-01" : "RGE-OP-UMI-02"}
            </span>
            <span className="text-[10px] text-slate-400">Emissão: {fmtData(payload.dataEmissao)}</span>
          </div>
        </div>
      </div>

      {/* Caixa de Edição Rápida (quando ativada) */}
      {modoEdicaoRapida && (
        <div className="bg-teal-900/20 border border-teal-600/40 rounded-2xl p-5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-teal-600/30 pb-3">
            <h3 className="text-sm font-bold text-teal-950 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-teal-700" />
              Edição Rápida de Governança & Parecer Técnico
            </h3>
            <span className="text-[11px] text-teal-800 font-medium">
              Sincronização em tempo real no documento visual abaixo e na exportação do PDF.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Supervisor de Operações ADM</label>
              <input
                type="text"
                value={payload.supervisorAdmResponsavel}
                onChange={e => onPayloadChange({ ...payload, supervisorAdmResponsavel: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-[#007369]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Engenharia de Processo / Metalurgia</label>
              <input
                type="text"
                value={payload.engenheiroProcesso || ""}
                onChange={e => onPayloadChange({ ...payload, engenheiroProcesso: e.target.value })}
                placeholder="Ex: Eng. Rafael Costa (CREA/Processos)"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-[#007369]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Gerência Geral de Operações</label>
              <input
                type="text"
                value={payload.gerentePlanta || ""}
                onChange={e => onPayloadChange({ ...payload, gerentePlanta: e.target.value })}
                placeholder="Ex: Gerência de Operações Industriais"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-[#007369]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Diagnóstico de Gargalos & Restrições ({isSeco ? "Circuito Seco" : "Circuito Úmido"})
              </label>
              <textarea
                rows={2}
                value={isSeco ? payload.dadosBritagemRebritagem.gargalosAtuais : payload.dadosConcentradorEta.gargalosAtuais}
                onChange={e => {
                  if (isSeco) {
                    onPayloadChange({
                      ...payload,
                      dadosBritagemRebritagem: { ...payload.dadosBritagemRebritagem, gargalosAtuais: e.target.value }
                    });
                  } else {
                    onPayloadChange({
                      ...payload,
                      dadosConcentradorEta: { ...payload.dadosConcentradorEta, gargalosAtuais: e.target.value }
                    });
                  }
                }}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium text-slate-900 focus:ring-1 focus:ring-[#007369]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Plano de Contingência & Recomendações Estratégicas ADM
              </label>
              <textarea
                rows={2}
                value={payload.observacoesGerais || ""}
                onChange={e => onPayloadChange({ ...payload, observacoesGerais: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium text-slate-900 focus:ring-1 focus:ring-[#007369]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- ESTRUTURA VISUAL FORMAL DO RELATÓRIO PDF (PADRÃO CORPORATIVO VALE) --- */}
      {/* ========================================================================= */}
      <div className="bg-slate-100 p-2 sm:p-5 rounded-3xl border border-slate-300/80 shadow-inner">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#0A2028] text-white text-[11px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shadow-xs border border-slate-700">
              <Eye className="w-3.5 h-3.5 text-[#2DD4BF]" />
              VISUALIZAÇÃO OFICIAL DO RELATÓRIO GERENCIAL (A4)
            </span>
            <span className="text-xs text-slate-600 font-bold hidden sm:inline">
              Padrão Formal de Governança Operacional • Idêntico ao PDF
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBaixarPdf}
              disabled={baixandoPdf}
              className="text-xs font-bold text-white bg-[#007369] hover:bg-[#00554E] px-3.5 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>

        {/* Folha Branca com Estilo e Proporção de Documento Corporativo de Mineração */}
        <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-8 shadow-xl border border-slate-300 space-y-6 max-w-5xl mx-auto font-sans">
          
          {/* ======================================================= */}
          {/* 1. CABEÇALHO CORPORATIVO FORMAL (PADRÃO VALE / ERO BRASIL) */}
          {/* ======================================================= */}
          <div className="border border-slate-900 rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-300">
            
            {/* Coluna 1: Logo & Unidade */}
            <div className="md:col-span-3 p-3.5 bg-slate-50 flex flex-col justify-between space-y-2">
              <div className="bg-[#0A2028] text-white px-3 py-1.5 rounded flex items-center gap-1 font-black text-xs w-fit shadow-xs">
                <span className="text-[#14B8A6]">ERO</span>
                <span>BRASIL</span>
              </div>
              <div className="space-y-0.5 text-[10px]">
                <span className="font-black text-slate-900 block">COMPLEXO INDUSTRIAL COBRE</span>
                <span className="text-slate-600 block">Mineração Caraíba S/A • Operações</span>
                <span className="text-slate-500 italic block text-[9px]">SGI - Sistema de Gestão Integrada</span>
              </div>
            </div>

            {/* Coluna 2: Título Central Oficial */}
            <div className="md:col-span-6 p-3.5 flex flex-col justify-center space-y-1 bg-white">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                DIRETORIA DE OPERAÇÕES • RELATÓRIO GERENCIAL
              </span>
              <h1 className="text-sm sm:text-base font-black text-[#0A2028] leading-tight">
                RELATÓRIO GERENCIAL ESTRATÉGICO DE OPERAÇÕES
              </h1>
              <h2 className="text-xs font-bold text-[#007369]">
                {isSeco
                  ? "DIRETRIZES TÁTICAS: CIRCUITO SECO (COMINUIÇÃO & BRITAGEM)"
                  : "DIRETRIZES TÁTICAS: CIRCUITO ÚMIDO (BENEFICIAMENTO & MOAGEM)"}
              </h2>
              <p className="text-[10px] text-slate-600 font-medium">
                {isSeco
                  ? "Escopo: Britagem Primária, Rebritagem, Pátios de ROM, Silos de Finos e Peneiramento"
                  : "Escopo: Moagem, Flotação Cu, Espessamento, Filtragem Prensa/Desaguamento e ETA"}
              </p>
            </div>

            {/* Coluna 3: Metadados Formais / Controle Documental */}
            <div className="md:col-span-3 p-3 bg-slate-50 text-[10px] space-y-1.5 flex flex-col justify-center">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <span className="font-bold text-slate-500">CÓDIGO:</span>
                <span className="font-black text-slate-900">{isSeco ? "RGE-OP-SEC-01" : "RGE-OP-UMI-02"}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <span className="font-bold text-slate-500">CLASSIFICAÇÃO:</span>
                <span className="font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded text-[9px]">USO RESTRITO</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <span className="font-bold text-slate-500">EMISSÃO / REV:</span>
                <span className="font-bold text-slate-800">{fmtData(payload.dataEmissao)} | R01</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">PERÍODO REF:</span>
                <span className="font-black text-[#00554E] truncate">{payload.periodoReferencia || "Semana Atual"}</span>
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* 2. PAINEL DE IDENTIFICAÇÃO DOS RESPONSÁVEIS TÉCNICOS */}
          {/* ======================================================= */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs divide-y sm:divide-y-0 sm:divide-x divide-slate-300">
            <div className="sm:pr-3">
              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">SUPERVISÃO DE OPERAÇÕES ADM</span>
              <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">
                {payload.supervisorAdmResponsavel || (isSeco ? "Supervisor ADM (Circuito Seco)" : "Supervisor ADM (Circuito Úmido)")}
              </span>
            </div>

            <div className="sm:px-3 pt-2 sm:pt-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">ENGENHARIA DE PROCESSO / METALURGIA</span>
              <span className="font-bold text-[#00554E] text-xs mt-0.5 block truncate">
                {payload.engenheiroProcesso || "Eng. Processos & Metalurgia (CREA)"}
              </span>
            </div>

            <div className="sm:pl-3 pt-2 sm:pt-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">GERÊNCIA DE PLANTA & OPERAÇÕES</span>
              <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">
                {payload.gerentePlanta || "Gerência Geral de Beneficiamento"}
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. SEÇÃO 1: PAINEL DE DESEMPENHO FÍSICO-OPERACIONAL (REAL VS PROGRAMADO) */}
          {/* ========================================================================= */}
          <div className="space-y-2">
            {/* Section Header Bar Formal */}
            <div className="bg-[#0A2028] text-white px-3.5 py-1.5 rounded flex items-center justify-between border-l-4 border-l-[#007369]">
              <span className="font-bold text-xs tracking-wide">
                1.0 {isSeco ? "BALANÇO FÍSICO-OPERACIONAL: CIRCUITO SECO (REALIZADO VS PROGRAMADO)" : "BALANÇO METALÚRGICO-OPERACIONAL: CIRCUITO ÚMIDO (REALIZADO VS PROGRAMADO)"}
              </span>
              <span className="text-[10px] font-bold text-[#A7F3D0] uppercase tracking-wider">
                DESEMPENHO TÁTICO
              </span>
            </div>

            {/* Table com % Atingimento */}
            <div className="overflow-x-auto rounded border border-slate-300">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-[#0A2028] text-white font-bold text-[10px]">
                    <th className="p-2 border-r border-slate-800">Variável / Indicador de Processo</th>
                    <th className="p-2 border-r border-slate-800">Área</th>
                    <th className="p-2 text-center border-r border-slate-800">Realizado Dia</th>
                    <th className="p-2 text-center border-r border-slate-800 text-slate-300 font-semibold">Meta Dia</th>
                    <th className="p-2 text-center border-r border-slate-800 text-[#2DD4BF]">Ating. (%)</th>
                    <th className="p-2 text-center border-r border-slate-800">Acum. Semana</th>
                    <th className="p-2 text-center border-r border-slate-800 text-slate-300 font-semibold">Meta Sem.</th>
                    <th className="p-2 text-center border-r border-slate-800">Acum. Mês</th>
                    <th className="p-2 text-center text-slate-300 font-semibold">Meta Mês</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {tableDataOperacional.map((row, idx) => (
                    <tr
                      key={idx}
                      className={
                        row.destaque
                          ? "bg-teal-50/80 font-semibold text-slate-900"
                          : idx % 2 === 1
                          ? "bg-slate-50/70"
                          : "bg-white"
                      }
                    >
                      <td className={`p-2 border-r border-slate-300 ${row.destaque ? "font-bold text-[#00554E]" : "font-medium text-slate-900"}`}>
                        {row.indicador}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-600">{row.setor}</td>
                      <td className={`p-2 text-center border-r border-slate-300 font-bold ${row.destaque ? "text-[#00554E]" : "text-slate-900"}`}>
                        {row.realDia}
                      </td>
                      <td className="p-2 text-center border-r border-slate-300 text-slate-500 font-normal">
                        {row.metaDia}
                      </td>
                      <td className="p-2 text-center border-r border-slate-300 font-black text-[#007369]">
                        {row.ating}
                      </td>
                      <td className={`p-2 text-center border-r border-slate-300 font-bold ${row.destaque ? "text-[#00554E]" : "text-slate-900"}`}>
                        {row.realSemana}
                      </td>
                      <td className="p-2 text-center border-r border-slate-300 text-slate-500 font-normal">
                        {row.metaSemana}
                      </td>
                      <td className={`p-2 text-center border-r border-slate-300 font-bold ${row.destaque ? "text-[#00554E]" : "text-slate-900"}`}>
                        {row.realMes}
                      </td>
                      <td className="p-2 text-center text-slate-500 font-normal">
                        {row.metaMes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. SEÇÃO 2: DIRECIONAMENTO ESTRATÉGICO POR HORIZONTE DE GESTÃO */}
          {/* ========================================================================= */}
          <div className="space-y-3">
            {/* Section Header Bar Formal */}
            <div className="bg-[#0A2028] text-white px-3.5 py-1.5 rounded flex items-center justify-between border-l-4 border-l-[#007369]">
              <span className="font-bold text-xs tracking-wide">
                2.0 DIRECIONAMENTO ESTRATÉGICO & BALIZAMENTO POR HORIZONTE DE PLANEJAMENTO
              </span>
              <span className="text-[10px] font-bold text-[#A7F3D0] uppercase tracking-wider">
                GOVERNANÇA TÁTICA (24H • WTD • FDS • MTD)
              </span>
            </div>

            {/* 4 Cartões de Horizonte Idênticos ao PDF Formal */}
            <div className="space-y-2.5">
              
              {/* Card 1: Dia */}
              <div className="bg-[#F0FDF4] border-l-4 border-l-[#0D9488] border border-teal-200 rounded-lg p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F766E] text-xs flex items-center gap-1.5">
                    HORIZONTE 24H: PLANO OPERACIONAL DO DIA (24 HORAS)
                  </span>
                  <span className="text-[10px] font-bold text-[#0F766E] bg-teal-100 px-2 py-0.5 rounded">
                    DIÁRIO
                  </span>
                </div>
                <p className="font-bold text-slate-900 leading-snug">
                  • Diretriz Principal & Foco Tático: <span className="font-semibold text-slate-800">{payload.estrategiaDia.focoPrincipal}</span>
                </p>
                <p className="text-slate-700 leading-snug">
                  • Balizamento Numérico:{" "}
                  {isSeco ? (
                    <span>
                      Britagem ROM: <strong>{payload.estrategiaDia.metaAlimentacaoBritagem ? payload.estrategiaDia.metaAlimentacaoBritagem.toLocaleString("pt-BR") : "-"} t</strong> | Taxa Alimentação: <strong>{payload.estrategiaDia.metaTaxaHoraria || "-"} t/h</strong> | Disponibilidade: <strong>{payload.estrategiaDia.metaDisponibilidade || "-"}%</strong>
                    </span>
                  ) : (
                    <span>
                      Moagem Planta: <strong>{payload.estrategiaDia.metaAlimentacaoMoagem ? payload.estrategiaDia.metaAlimentacaoMoagem.toLocaleString("pt-BR") : "-"} t</strong> | Metal Cu Contido: <strong>{payload.estrategiaDia.metaProducaoCobreContido || "-"} t Cu</strong> | Rec. Global: <strong>{payload.estrategiaDia.metaRecuperacao || "-"}%</strong>
                    </span>
                  )}
                </p>
                <div className="text-slate-700 leading-snug">
                  <span className="font-semibold">• Procedimentos & Diretrizes Prioritárias:</span>
                  <ul className="list-none pl-1 text-[11px] mt-0.5 space-y-0.5 text-slate-800">
                    {(payload.estrategiaDia.diretrizesPrioritarias || []).map((dir, i) => (
                      <li key={i}>  [{i + 1}] {dir}</li>
                    ))}
                  </ul>
                </div>
                {payload.estrategiaDia.recursosManutencao && (
                  <p className="text-[11px] text-[#00554E] font-semibold">
                    • Intervenções de Manutenção / Gestão de Ativos: {payload.estrategiaDia.recursosManutencao}
                  </p>
                )}
                {payload.estrategiaDia.alertasOperacionais && payload.estrategiaDia.alertasOperacionais.length > 0 && (
                  <p className="text-[11px] text-amber-800">
                    • Pontos Críticos & Gerenciamento de Risco: {payload.estrategiaDia.alertasOperacionais.join("; ")}
                  </p>
                )}
              </div>

              {/* Card 2: Semana */}
              <div className="bg-[#EFF6FF] border-l-4 border-l-[#3B82F6] border border-blue-200 rounded-lg p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1D4ED8] text-xs flex items-center gap-1.5">
                    HORIZONTE WTD: ESTRATÉGIA DA SEMANA (WEEK TO DATE)
                  </span>
                  <span className="text-[10px] font-bold text-[#1D4ED8] bg-blue-100 px-2 py-0.5 rounded">
                    SEMANAL
                  </span>
                </div>
                <p className="font-bold text-slate-900 leading-snug">
                  • Diretriz Principal & Foco Tático: <span className="font-semibold text-slate-800">{payload.estrategiaSemana.focoPrincipal}</span>
                </p>
                <p className="text-slate-700 leading-snug">
                  • Balizamento Numérico:{" "}
                  {isSeco ? (
                    <span>
                      Britagem ROM: <strong>{payload.estrategiaSemana.metaAlimentacaoBritagem ? payload.estrategiaSemana.metaAlimentacaoBritagem.toLocaleString("pt-BR") : "-"} t</strong> | Taxa Alimentação: <strong>{payload.estrategiaSemana.metaTaxaHoraria || "-"} t/h</strong> | Disponibilidade: <strong>{payload.estrategiaSemana.metaDisponibilidade || "-"}%</strong>
                    </span>
                  ) : (
                    <span>
                      Moagem Planta: <strong>{payload.estrategiaSemana.metaAlimentacaoMoagem ? payload.estrategiaSemana.metaAlimentacaoMoagem.toLocaleString("pt-BR") : "-"} t</strong> | Metal Cu Contido: <strong>{payload.estrategiaSemana.metaProducaoCobreContido || "-"} t Cu</strong> | Rec. Global: <strong>{payload.estrategiaSemana.metaRecuperacao || "-"}%</strong>
                    </span>
                  )}
                </p>
                <div className="text-slate-700 leading-snug">
                  <span className="font-semibold">• Procedimentos & Diretrizes Prioritárias:</span>
                  <ul className="list-none pl-1 text-[11px] mt-0.5 space-y-0.5 text-slate-800">
                    {(payload.estrategiaSemana.diretrizesPrioritarias || []).map((dir, i) => (
                      <li key={i}>  [{i + 1}] {dir}</li>
                    ))}
                  </ul>
                </div>
                {payload.estrategiaSemana.recursosManutencao && (
                  <p className="text-[11px] text-blue-900 font-semibold">
                    • Intervenções de Manutenção / Gestão de Ativos: {payload.estrategiaSemana.recursosManutencao}
                  </p>
                )}
              </div>

              {/* Card 3: Fim de Semana */}
              <div className="bg-[#FEF3C7] border-l-4 border-l-[#F59E0B] border border-amber-200 rounded-lg p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#B45309] text-xs flex items-center gap-1.5">
                    HORIZONTE FDS: BLINDAGEM OPERACIONAL & PLANTÃO DE FINAL DE SEMANA
                  </span>
                  <span className="text-[10px] font-bold text-[#B45309] bg-amber-100 px-2 py-0.5 rounded">
                    PLANTÃO FDS
                  </span>
                </div>
                <p className="font-bold text-slate-900 leading-snug">
                  • Diretriz Principal & Foco Tático: <span className="font-semibold text-slate-800">{payload.estrategiaFds.focoPrincipal}</span>
                </p>
                <p className="text-slate-700 leading-snug">
                  • Balizamento Numérico:{" "}
                  {isSeco ? (
                    <span>
                      Britagem ROM: <strong>{payload.estrategiaFds.metaAlimentacaoBritagem ? payload.estrategiaFds.metaAlimentacaoBritagem.toLocaleString("pt-BR") : "-"} t</strong> | Taxa Alimentação: <strong>{payload.estrategiaFds.metaTaxaHoraria || "-"} t/h</strong> | Disponibilidade: <strong>{payload.estrategiaFds.metaDisponibilidade || "-"}%</strong>
                    </span>
                  ) : (
                    <span>
                      Moagem Planta: <strong>{payload.estrategiaFds.metaAlimentacaoMoagem ? payload.estrategiaFds.metaAlimentacaoMoagem.toLocaleString("pt-BR") : "-"} t</strong> | Metal Cu Contido: <strong>{payload.estrategiaFds.metaProducaoCobreContido || "-"} t Cu</strong> | Rec. Global: <strong>{payload.estrategiaFds.metaRecuperacao || "-"}%</strong>
                    </span>
                  )}
                </p>
                {payload.estrategiaFds.planoBlindagemFds && (
                  <p className="text-[11px] text-amber-950 font-bold bg-amber-100/80 p-1.5 rounded border border-amber-300">
                    • Protocolo Formal de Blindagem FDS: {payload.estrategiaFds.planoBlindagemFds}
                  </p>
                )}
              </div>

              {/* Card 4: Mês */}
              <div className="bg-[#F5F3FF] border-l-4 border-l-[#8B5CF6] border border-purple-200 rounded-lg p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#6D28D9] text-xs flex items-center gap-1.5">
                    HORIZONTE MTD: PLANEJAMENTO MENSAL & FORECAST (MONTH TO DATE)
                  </span>
                  <span className="text-[10px] font-bold text-[#6D28D9] bg-purple-100 px-2 py-0.5 rounded">
                    MENSAL
                  </span>
                </div>
                <p className="font-bold text-slate-900 leading-snug">
                  • Diretriz Principal & Foco Tático: <span className="font-semibold text-slate-800">{payload.estrategiaMes.focoPrincipal}</span>
                </p>
                <p className="text-slate-700 leading-snug">
                  • Balizamento Numérico:{" "}
                  {isSeco ? (
                    <span>
                      Britagem ROM: <strong>{payload.estrategiaMes.metaAlimentacaoBritagem ? payload.estrategiaMes.metaAlimentacaoBritagem.toLocaleString("pt-BR") : "-"} t</strong> | Taxa Alimentação: <strong>{payload.estrategiaMes.metaTaxaHoraria || "-"} t/h</strong> | Disponibilidade: <strong>{payload.estrategiaMes.metaDisponibilidade || "-"}%</strong>
                    </span>
                  ) : (
                    <span>
                      Moagem Planta: <strong>{payload.estrategiaMes.metaAlimentacaoMoagem ? payload.estrategiaMes.metaAlimentacaoMoagem.toLocaleString("pt-BR") : "-"} t</strong> | Metal Cu Contido: <strong>{payload.estrategiaMes.metaProducaoCobreContido || "-"} t Cu</strong> | Rec. Global: <strong>{payload.estrategiaMes.metaRecuperacao || "-"}%</strong>
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5. SEÇÃO 3: MATRIZ TÁTICA DE DIRETRIZES & RESPONSABILIDADES (RACI) */}
          {/* ========================================================================= */}
          <div className="space-y-2">
            {/* Section Header Bar Formal */}
            <div className="bg-[#0A2028] text-white px-3.5 py-1.5 rounded flex items-center justify-between border-l-4 border-l-[#007369]">
              <span className="font-bold text-xs tracking-wide">
                3.0 MATRIZ DE DIRETRIZES TÁTICAS & PLANO DE AÇÃO PARA SUPERVISÕES DE TURNO
              </span>
              <span className="text-[10px] font-bold text-[#A7F3D0] uppercase tracking-wider">
                CONTROLE DE EXECUÇÃO & PRAZOS
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded border border-slate-300">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-[#0A2028] text-white font-bold text-[10px]">
                    <th className="p-2 border-r border-slate-800">Código / Setor</th>
                    <th className="p-2 border-r border-slate-800">Ação Estratégica / Procedimento de Turno</th>
                    <th className="p-2 border-r border-slate-800">Turma / Supervisor</th>
                    <th className="p-2 text-center border-r border-slate-800">Prazo Limite</th>
                    <th className="p-2 text-center border-r border-slate-800">Prioridade</th>
                    <th className="p-2 border-r border-slate-800">Critério de Aceite / Meta</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {dt.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-500 italic">
                        Nenhuma diretriz registrada para este circuito.
                      </td>
                    </tr>
                  ) : (
                    dt.map((dir, idx) => {
                      const isCritica = dir.prioridade === "critica";
                      const isAlta = dir.prioridade === "alta";
                      const isConcluido = dir.status === "concluido";
                      const isAndamento = dir.status === "em_andamento";
                      const codAcao = `ACT-${String(idx + 1).padStart(2, "0")}`;

                      return (
                        <tr key={dir.id || idx} className={idx % 2 === 1 ? "bg-slate-50/70" : "bg-white"}>
                          <td className="p-2 border-r border-slate-300 font-bold text-slate-900 whitespace-nowrap">
                            {codAcao}
                            <span className="block font-medium text-slate-600 text-[10px]">{dir.setor}</span>
                          </td>
                          <td className="p-2 border-r border-slate-300 text-slate-800 leading-snug">
                            {dir.acaoEstrategica || "-"}
                          </td>
                          <td className="p-2 border-r border-slate-300 text-slate-700 whitespace-nowrap">
                            <span className="font-semibold block">{dir.responsavelTurma}</span>
                            {dir.supervisorNome && <span className="text-[10px] text-slate-500 block">{dir.supervisorNome}</span>}
                          </td>
                          <td className="p-2 text-center border-r border-slate-300 font-bold text-slate-900 whitespace-nowrap">
                            {dir.prazoLimite || "Turno Vigente"}
                          </td>
                          <td className="p-2 text-center border-r border-slate-300 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isCritica
                                  ? "bg-rose-100 text-rose-800 font-bold"
                                  : isAlta
                                  ? "bg-amber-100 text-amber-800 font-bold"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {isCritica ? "CRÍTICA (P1)" : isAlta ? "ALTA (P2)" : "MÉDIA (P3)"}
                            </span>
                          </td>
                          <td className="p-2 border-r border-slate-300 text-slate-700 text-[10px]">
                            {dir.metaEsperada || "-"}
                          </td>
                          <td className="p-2 text-center whitespace-nowrap">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isConcluido
                                  ? "bg-teal-100 text-teal-800"
                                  : isAndamento
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {isConcluido ? "CONCLUÍDO" : isAndamento ? "EM EXECUÇÃO" : "PENDENTE"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 6. SEÇÃO 4: GESTÃO DE RESTRIÇÕES, GARGALOS & CONTINGÊNCIAS */}
          {/* ========================================================================= */}
          <div className="space-y-2">
            {/* Section Header Bar Formal */}
            <div className="bg-[#0A2028] text-white px-3.5 py-1.5 rounded flex items-center justify-between border-l-4 border-l-[#007369]">
              <span className="font-bold text-xs tracking-wide">
                4.0 ANÁLISE DE RESTRIÇÕES OPERACIONAIS, GARGALOS E PLANO DE CONTINGÊNCIA ADM
              </span>
              <span className="text-[10px] font-bold text-[#A7F3D0] uppercase tracking-wider">
                GESTÃO DE RISCO OPERACIONAL
              </span>
            </div>

            {/* Content Box */}
            <div className="bg-slate-50 border-l-4 border-l-[#007369] border border-slate-300 rounded-lg p-4 space-y-3 text-xs">
              <div>
                <span className="font-bold text-[#00554E] block mb-0.5">
                  • Diagnóstico de Gargalos & Restrições ({isSeco ? "Circuito Seco - Cominuição" : "Circuito Úmido - Beneficiamento"}):
                </span>
                <p className="text-slate-800 pl-3 leading-relaxed font-medium bg-white p-2 rounded border border-slate-300">
                  {gargalosTexto}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-0.5">
                  • Plano de Contingência & Recomendações Estratégicas da Supervisão ADM:
                </span>
                <p className="text-slate-800 pl-3 leading-relaxed font-medium bg-white p-2 rounded border border-slate-300">
                  {contingTexto}
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 7. PROTOCOLO FORMAL DE VALIDAÇÃO TÉCNICA E APROVAÇÃO GERENCIAL */}
          {/* ========================================================================= */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300">
              <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wide">
                PROTOCOLO DE VALIDAÇÃO TÉCNICA E APROVAÇÃO GERENCIAL (GOVERNANÇA OPERACIONAL)
              </span>
            </div>

            <div className="p-4 bg-white grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {/* Campo 1 */}
              <div className="space-y-1 pt-6 border-t border-slate-300">
                <span className="text-xs font-bold text-slate-900 block">
                  {payload.supervisorAdmResponsavel || (isSeco ? "Supervisor ADM (Circuito Seco)" : "Supervisor ADM (Circuito Úmido)")}
                </span>
                <span className="text-[10px] text-slate-500 block">Supervisão de Operações ADM</span>
                <span className="text-[9px] text-teal-800 font-semibold block">Validação de Diretrizes Táticas</span>
              </div>

              {/* Campo 2 */}
              <div className="space-y-1 pt-6 border-t border-slate-300">
                <span className="text-xs font-bold text-slate-900 block">
                  {payload.engenheiroProcesso || (isSeco ? "Engenharia de Cominuição" : "Engenharia de Processos")}
                </span>
                <span className="text-[10px] text-slate-500 block">Engenharia de Processos & Metalurgia</span>
                <span className="text-[9px] text-teal-800 font-semibold block">Aprovação Técnica / CREA</span>
              </div>

              {/* Campo 3 */}
              <div className="space-y-1 pt-6 border-t border-slate-300">
                <span className="text-xs font-bold text-slate-900 block">
                  {payload.gerentePlanta || "Gerência Geral de Operações"}
                </span>
                <span className="text-[10px] text-slate-500 block">Gerência de Planta & Operações Industriais</span>
                <span className="text-[9px] text-teal-800 font-semibold block">Alinhamento Executivo</span>
              </div>
            </div>
          </div>

          {/* Rodapé da Folha */}
          <div className="border-t border-slate-300 pt-3 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500">
            <span>
              <strong>ERO BRASIL</strong> | Planta Cobre • Gestão Estratégica ADM — {isSeco ? "Circuito Seco (Cominuição)" : "Circuito Úmido (Beneficiamento)"}
            </span>
            <span className="font-semibold text-slate-700">
              Classificação da Informação: USO INTERNO / ESTRATÉGICO
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
