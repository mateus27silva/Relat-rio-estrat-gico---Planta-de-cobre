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
  Lock,
  Sliders,
  CheckSquare,
  Square,
  Gauge
} from "lucide-react";
import {
  RelatorioAdmPayload,
  gerarWppAdm,
  fmtData,
  SECOES_VISIVEIS_PADRAO,
  SecoesVisiveisRelatorio,
  detectarDesviosBritagem,
  calcularCartasControleBritagem,
  CONFIG_PARAMETROS_BRITAGEM,
  DADOS_DIARIOS_BRITAGEM_PADRAO,
  obterLeituraAtualBritagem,
  obterAcaoEstrategicaBritagem,
  parseNumeroBritagem,
  CONFIG_PARAMETROS_REBRITAGEM,
  DADOS_DIARIOS_REBRITAGEM_PADRAO,
  obterLeituraAtualRebritagem,
  obterAcaoEstrategicaRebritagem,
  calcularCartasControleRebritagem
} from "../typesAdm";
import { gerarRelatorioAdmPDF } from "../utils/pdfGeneratorAdm";
import { AdmGanttChartView } from "./AdmGanttChartView";

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

  const secoes: SecoesVisiveisRelatorio = {
    ...SECOES_VISIVEIS_PADRAO,
    ...(payload.secoesVisiveis || {})
  };

  const handleToggleSecao = (key: keyof SecoesVisiveisRelatorio) => {
    const updated = {
      ...secoes,
      [key]: !secoes[key]
    };
    onPayloadChange({
      ...payload,
      secoesVisiveis: updated
    });
  };

  const handleSelecionarTodas = (status: boolean) => {
    const updated: SecoesVisiveisRelatorio = {
      responsaveisTecnicos: status,
      balancoOperacional: status,
      horizonteDia: status,
      horizonteSemana: status,
      horizonteFds: status,
      horizonteParada: status,
      horizonteMes: status,
      matrizDiretrizes: status,
      cronogramaGantt: status,
      diagnosticoGargalos: status,
      planoContingencia: status,
    };
    onPayloadChange({
      ...payload,
      secoesVisiveis: updated
    });
  };

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
    if (!real || !meta || typeof meta !== "number" || meta <= 0) return { pct: "-", val: 0, ok: true, status: "good" as const };
    const realNum = typeof real === "number" ? real : parseFloat(String(real).replace(/\./g, "").replace(",", "."));
    if (isNaN(realNum)) return { pct: "-", val: 0, ok: true, status: "good" as const };
    const pctVal = (realNum / meta) * 100;
    const delta = pctVal - 100;
    return {
      pct: `${pctVal.toFixed(1)}%`,
      val: pctVal,
      delta: `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`,
      ok: pctVal >= 95,
      status: pctVal >= 100 ? ("good" as const) : pctVal >= 90 ? ("warn" as const) : ("alert" as const)
    };
  };

  // KPIs Estratégicos Específicos para cada Circuito (Padrão Scoreboard GEBEN)
  const kpisSeco = [
    {
      label: "Britagem Total (ROM + Rebrit)",
      valor: br.producaoDiaTotal ? `${br.producaoDiaTotal.toLocaleString("pt-BR")}` : "14.850",
      unidade: "t/dia",
      budget: `Budget: ${br.metaProducaoDia ? br.metaProducaoDia.toLocaleString("pt-BR") : "14.500"} t`,
      delta: br.producaoDiaTotal && br.metaProducaoDia
        ? calcAtingimento(br.producaoDiaTotal, br.metaProducaoDia).delta
        : "+2,4%",
      isPos: (br.producaoDiaTotal && br.metaProducaoDia ? Number(br.producaoDiaTotal) >= br.metaProducaoDia : true),
      pctFill: br.producaoDiaTotal && br.metaProducaoDia ? Math.min(100, Math.round((Number(br.producaoDiaTotal) / br.metaProducaoDia) * 100)) : 102,
      status: "good" as const
    },
    {
      label: "Taxa Britagem Primária",
      valor: br.taxaBritagem ? `${br.taxaBritagem}` : "1.250",
      unidade: "t/h",
      budget: `Budget: ${br.metaTaxaBritagem || 1300} t/h`,
      delta: br.taxaBritagem && br.metaTaxaBritagem
        ? calcAtingimento(br.taxaBritagem, br.metaTaxaBritagem).delta
        : "-3,8%",
      isPos: (br.taxaBritagem && br.metaTaxaBritagem ? Number(br.taxaBritagem) >= br.metaTaxaBritagem : false),
      pctFill: br.taxaBritagem && br.metaTaxaBritagem ? Math.min(100, Math.round((Number(br.taxaBritagem) / br.metaTaxaBritagem) * 100)) : 96,
      status: "warn" as const
    },
    {
      label: "Produção Rebritagem",
      valor: br.producaoTotalRebritagem ? `${br.producaoTotalRebritagem.toLocaleString("pt-BR")}` : "14.836",
      unidade: "t/dia",
      budget: `Ref. diária: 15.000 t`,
      delta: "-1,1%",
      isPos: false,
      pctFill: 98,
      status: "good" as const
    },
    {
      label: "Disponibilidade Brit. Primária",
      valor: br.disponibilidadeBritagem ? `${br.disponibilidadeBritagem}` : "88,5",
      unidade: "%",
      budget: "Meta: ≥ 90,0%",
      delta: "-1,5 pp",
      isPos: false,
      pctFill: 88.5,
      status: "warn" as const
    },
    {
      label: "Disponibilidade Rebritagem",
      valor: br.disponibilidadeRebritagem ? `${br.disponibilidadeRebritagem}` : "57,5",
      unidade: "%",
      budget: "Meta: 75,0% (BR001: 34,3%)",
      delta: "▼ -17,5 pp",
      isPos: false,
      pctFill: 57.5,
      status: "alert" as const
    },
    {
      label: "Estoque Total ROM (Pátios)",
      valor: br.estoqueTotalRom ? `${br.estoqueTotalRom.toLocaleString("pt-BR")}` : "48.500",
      unidade: "t",
      budget: "Meta Mínima: 40.000 t",
      delta: "▲ +8.500 t",
      isPos: true,
      pctFill: 100,
      status: "good" as const
    }
  ];

  const kpisUmido = [
    {
      label: "Metal Fino Cu (Planta)",
      valor: ce.metalContidoMes ? `${ce.metalContidoMes.toLocaleString("pt-BR")}` : "3.435",
      unidade: "t Cu",
      budget: `Budget: ${ce.metaMetalContidoMes ? ce.metaMetalContidoMes.toLocaleString("pt-BR") : "3.355"} t`,
      delta: "▲ +80 t (+2,4%)",
      isPos: true,
      pctFill: 102.4,
      status: "good" as const
    },
    {
      label: "Massa Moagem (Feed)",
      valor: ce.producaoMoagemMes ? `${ce.producaoMoagemMes.toLocaleString("pt-BR")}` : "398.560",
      unidade: "t",
      budget: `Budget: ${ce.metaProducaoMoagemMes ? ce.metaProducaoMoagemMes.toLocaleString("pt-BR") : "407.671"} t`,
      delta: "▼ -9.111 t (-2,2%)",
      isPos: false,
      pctFill: 97.8,
      status: "warn" as const
    },
    {
      label: "Recuperação Metalúrgica",
      valor: ce.recuperacaoMetalurgica ? `${ce.recuperacaoMetalurgica}` : "89,46",
      unidade: "%",
      budget: `Budget: ${ce.metaRecuperacao || 87.98}%`,
      delta: "▲ +1,48 pp",
      isPos: true,
      pctFill: 89.5,
      status: "good" as const
    },
    {
      label: "Teor Cu Alimentação (CuT)",
      valor: ce.teorAlimentacaoCu ? `${ce.teorAlimentacaoCu}` : "0,963",
      unidade: "%",
      budget: "Budget: 0,935%",
      delta: "▲ +0,028 pp",
      isPos: true,
      pctFill: 96.3,
      status: "good" as const
    },
    {
      label: "Concentrado Produzido",
      valor: ce.concentradoProduzidoDia ? `${ce.concentradoProduzidoDia.toLocaleString("pt-BR")}` : "9.912",
      unidade: "t",
      budget: `Budget: 10.014 t`,
      delta: "▼ -102 t (-1,0%)",
      isPos: false,
      pctFill: 99.0,
      status: "good" as const
    },
    {
      label: "Filtro Prensa (Disp / Util)",
      valor: "97,7 / 53,7",
      unidade: "%",
      budget: "Meta Util: ≥ 65% (Disp ≥ 90%)",
      delta: "▼ -11,3 pp (Util)",
      isPos: false,
      pctFill: 53.7,
      status: "warn" as const
    }
  ];

  const kpisAtivos = isSeco ? kpisSeco : kpisUmido;

  // Dados verticais do Monitoramento Mecânico & Operacional do Britador Primário (41BR001 / 41TC001)
  const tableDataBritadorVertical = CONFIG_PARAMETROS_BRITAGEM.map(param => {
    const infoLeitura = obterLeituraAtualBritagem(br, param);
    const numVal = infoLeitura.numVal;
    const leituraFormatada = infoLeitura.leituraFormatada;
    const acaoEstrategica = obterAcaoEstrategicaBritagem(br, param);

    let statusTipo: "good" | "warn" | "alert" | "none" = "none";
    let statusLabel = "-";

    if (numVal !== null && !isNaN(numVal)) {
      if (numVal < param.minIdeal || numVal > param.maxIdeal) {
        const deltaRel = Math.max(
          param.minIdeal - numVal,
          numVal - param.maxIdeal
        ) / ((param.maxIdeal - param.minIdeal) || 1);

        if (deltaRel > 0.25) {
          statusTipo = "alert";
          statusLabel = "Crítico / Desvio";
        } else {
          statusTipo = "warn";
          statusLabel = "Atenção / Desvio";
        }
      } else {
        statusTipo = "good";
        statusLabel = "Conforme";
      }
    }

    const faixaIdeal = `${param.decimais > 0 ? param.minIdeal.toFixed(param.decimais).replace(".", ",") : param.minIdeal} - ${param.decimais > 0 ? param.maxIdeal.toFixed(param.decimais).replace(".", ",") : param.maxIdeal} ${param.unidade}`;
    const alvoFormatado = `${param.decimais > 0 ? param.alvo.toFixed(param.decimais).replace(".", ",") : param.alvo} ${param.unidade}`;

    return {
      chave: param.chave,
      nome: param.nome,
      equipamento: param.equipamento,
      subsistema: param.subsistema,
      unidade: param.unidade,
      numVal,
      leituraFormatada,
      faixaIdeal,
      alvoFormatado,
      statusTipo,
      statusLabel,
      acaoEstrategica,
      acaoRecomendada: acaoEstrategica,
      impactoDesvio: param.impactoDesvio
    };
  });

  // Dados verticais do Monitoramento Mecânico & Operacional da Rebritagem & Peneiramento (BR001 a BR006)
  const tableDataRebritagemVertical = CONFIG_PARAMETROS_REBRITAGEM.map(param => {
    const infoLeitura = obterLeituraAtualRebritagem(br, param);
    const numVal = infoLeitura.numVal;
    const leituraFormatada = infoLeitura.leituraFormatada;
    const acaoEstrategica = obterAcaoEstrategicaRebritagem(br, param);

    let statusTipo: "good" | "warn" | "alert" | "none" = "none";
    let statusLabel = "-";

    if (numVal !== null && !isNaN(numVal)) {
      if (numVal < param.minIdeal || numVal > param.maxIdeal) {
        const deltaRel = Math.max(
          param.minIdeal - numVal,
          numVal - param.maxIdeal
        ) / ((param.maxIdeal - param.minIdeal) || 1);

        if (deltaRel > 0.25) {
          statusTipo = "alert";
          statusLabel = "Crítico / Desvio";
        } else {
          statusTipo = "warn";
          statusLabel = "Atenção / Desvio";
        }
      } else {
        statusTipo = "good";
        statusLabel = "Conforme";
      }
    }

    const faixaIdeal = `${param.decimais > 0 ? param.minIdeal.toFixed(param.decimais).replace(".", ",") : param.minIdeal} - ${param.decimais > 0 ? param.maxIdeal.toFixed(param.decimais).replace(".", ",") : param.maxIdeal} ${param.unidade}`;
    const alvoFormatado = `${param.decimais > 0 ? param.alvo.toFixed(param.decimais).replace(".", ",") : param.alvo} ${param.unidade}`;

    return {
      chave: param.chave,
      nome: param.nome,
      equipamento: param.equipamento,
      subsistema: param.subsistema,
      unidade: param.unidade,
      numVal,
      leituraFormatada,
      faixaIdeal,
      alvoFormatado,
      statusTipo,
      statusLabel,
      acaoEstrategica,
      acaoRecomendada: acaoEstrategica,
      impactoDesvio: param.impactoDesvio
    };
  });

  // Tabela Operacional Formal (Circuito Úmido)
  const tableDataOperacional = [
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
    ? br.gargalosAtuais || ""
    : ce.gargalosAtuais || "";

  const contingTexto =
    (isSeco ? br.planoContingencia : ce.planoContingencia) ||
    payload.planoContingencia ||
    payload.observacoesGerais ||
    "";

  return (
    <div className="space-y-6">
      {/* SELETOR DE ITENS E SEÇÕES VISÍVEIS NO RELATÓRIO EXECUTIVO */}
      <div className="bg-[#0A2028] text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#2DD4BF]" />
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Seletor de Seções e Conteúdos do Relatório
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              (Marque ou desmarque os itens para personalizar a visualização e o PDF)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelecionarTodas(true)}
              className="text-[10px] font-bold text-teal-300 hover:text-teal-200 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded border border-slate-700 transition flex items-center gap-1 cursor-pointer"
            >
              <CheckSquare className="w-3 h-3 text-[#2DD4BF]" />
              Marcar Todos
            </button>
            <button
              type="button"
              onClick={() => handleSelecionarTodas(false)}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-300 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded border border-slate-700 transition flex items-center gap-1 cursor-pointer"
            >
              <Square className="w-3 h-3 text-slate-400" />
              Desmarcar Todos
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 pt-1">
            {/* 1. Responsáveis Técnicos */}
            <label
              className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition select-none ${
                secoes.responsaveisTecnicos
                  ? "bg-teal-950/40 border-teal-500/60 text-teal-200 shadow-xs"
                  : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <input
                type="checkbox"
                checked={secoes.responsaveisTecnicos}
                onChange={() => handleToggleSecao("responsaveisTecnicos")}
                className="rounded border-slate-700 text-[#007369] focus:ring-[#007369] w-3.5 h-3.5 cursor-pointer accent-[#007369]"
              />
              <span className="truncate">👤 Responsáveis Técnicos</span>
            </label>

            {/* 2. Balanço Operacional */}
            <label
              className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition select-none ${
                secoes.balancoOperacional
                  ? "bg-teal-950/40 border-teal-500/60 text-teal-200 shadow-xs"
                  : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <input
                type="checkbox"
                checked={secoes.balancoOperacional}
                onChange={() => handleToggleSecao("balancoOperacional")}
                className="rounded border-slate-700 text-[#007369] focus:ring-[#007369] w-3.5 h-3.5 cursor-pointer accent-[#007369]"
              />
              <span className="truncate">📊 1.0 Balanço Operacional</span>
            </label>

            {/* 3. Horizonte WTD */}
            <label
              className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition select-none ${
                secoes.horizonteSemana
                  ? "bg-teal-950/40 border-teal-500/60 text-teal-200 shadow-xs"
                  : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <input
                type="checkbox"
                checked={secoes.horizonteSemana}
                onChange={() => handleToggleSecao("horizonteSemana")}
                className="rounded border-slate-700 text-[#007369] focus:ring-[#007369] w-3.5 h-3.5 cursor-pointer accent-[#007369]"
              />
              <span className="truncate">📈 Horizonte WTD (Semanal)</span>
            </label>

            {/* 5. Horizonte FDS */}
            <label
              className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition select-none ${
                secoes.horizonteFds
                  ? "bg-teal-950/40 border-teal-500/60 text-teal-200 shadow-xs"
                  : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <input
                type="checkbox"
                checked={secoes.horizonteFds}
                onChange={() => handleToggleSecao("horizonteFds")}
                className="rounded border-slate-700 text-[#007369] focus:ring-[#007369] w-3.5 h-3.5 cursor-pointer accent-[#007369]"
              />
              <span className="truncate">🛡️ Horizonte FDS (Plantão)</span>
            </label>

            {/* 6. Alinhamento de Parada */}
            <label
              className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition select-none ${
                secoes.horizonteParada
                  ? "bg-teal-950/40 border-teal-500/60 text-teal-200 shadow-xs"
                  : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <input
                type="checkbox"
                checked={secoes.horizonteParada !== false}
                onChange={() => handleToggleSecao("horizonteParada")}
                className="rounded border-slate-700 text-[#007369] focus:ring-[#007369] w-3.5 h-3.5 cursor-pointer accent-[#007369]"
              />
              <span className="truncate">🛑 Alinhamento de Parada</span>
            </label>

            {/* 7. Horizonte MTD */}
            <label
              className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition select-none ${
                secoes.horizonteMes
                  ? "bg-teal-950/40 border-teal-500/60 text-teal-200 shadow-xs"
                  : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <input
                type="checkbox"
                checked={secoes.horizonteMes}
                onChange={() => handleToggleSecao("horizonteMes")}
                className="rounded border-slate-700 text-[#007369] focus:ring-[#007369] w-3.5 h-3.5 cursor-pointer accent-[#007369]"
              />
              <span className="truncate">📅 Horizonte MTD (Mensal)</span>
            </label>

            {/* 7. Matriz de Diretrizes */}
            <label
              className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition select-none ${
                secoes.matrizDiretrizes
                  ? "bg-teal-950/40 border-teal-500/60 text-teal-200 shadow-xs"
                  : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <input
                type="checkbox"
                checked={secoes.matrizDiretrizes}
                onChange={() => handleToggleSecao("matrizDiretrizes")}
                className="rounded border-slate-700 text-[#007369] focus:ring-[#007369] w-3.5 h-3.5 cursor-pointer accent-[#007369]"
              />
              <span className="truncate">📋 3.0 Matriz Diretrizes</span>
            </label>

            {/* 7.1. Gráfico de Gantt */}
            <label
              className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition select-none ${
                secoes.cronogramaGantt
                  ? "bg-teal-950/40 border-teal-500/60 text-teal-200 shadow-xs"
                  : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <input
                type="checkbox"
                checked={secoes.cronogramaGantt}
                onChange={() => handleToggleSecao("cronogramaGantt")}
                className="rounded border-slate-700 text-[#007369] focus:ring-[#007369] w-3.5 h-3.5 cursor-pointer accent-[#007369]"
              />
              <span className="truncate">📊 3.1 Cronograma Gantt</span>
            </label>

            {/* 8. Diagnóstico de Gargalos */}
            <label
              className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition select-none ${
                secoes.diagnosticoGargalos
                  ? "bg-teal-950/40 border-teal-500/60 text-teal-200 shadow-xs"
                  : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <input
                type="checkbox"
                checked={secoes.diagnosticoGargalos}
                onChange={() => handleToggleSecao("diagnosticoGargalos")}
                className="rounded border-slate-700 text-[#007369] focus:ring-[#007369] w-3.5 h-3.5 cursor-pointer accent-[#007369]"
              />
              <span className="truncate">⚠️ 4.0 Diagnóstico Gargalos</span>
            </label>

            {/* 9. Plano de Contingência */}
            <label
              className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition select-none ${
                secoes.planoContingencia
                  ? "bg-teal-950/40 border-teal-500/60 text-teal-200 shadow-xs"
                  : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <input
                type="checkbox"
                checked={secoes.planoContingencia}
                onChange={() => handleToggleSecao("planoContingencia")}
                className="rounded border-slate-700 text-[#007369] focus:ring-[#007369] w-3.5 h-3.5 cursor-pointer accent-[#007369]"
              />
              <span className="truncate">💡 Plano de Contingência</span>
            </label>
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
        <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-7 shadow-xl border border-slate-300 space-y-6 max-w-6xl xl:max-w-7xl w-full mx-auto font-sans">
          
          {/* ======================================================= */}
          {/* 1. CABEÇALHO CORPORATIVO FORMAL (PADRÃO GEBEN / ERO BRASIL) */}
          {/* ======================================================= */}
          <div className="bg-[#0A2028] text-white p-5 rounded-xl border border-slate-700 shadow-md flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#C9A84C] rounded-lg flex items-center justify-center font-black text-xl text-[#0A2028] tracking-tight shadow-md">
                ERO
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#2DD4BF] uppercase tracking-widest block">
                  GERÊNCIA DE BENEFICIAMENTO — GEBEN • CARAÍBA
                </span>
                <h1 className="text-base sm:text-lg font-black leading-tight text-white mt-0.5">
                  Análise Crítica & Relatório Estratégico de Operações
                </h1>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  {isSeco
                    ? "Circuito Seco (Cominuição, Britagem Primária, Rebritagem & Pátios de ROM)"
                    : "Circuito Úmido (Moagem, Flotação Cu, Filtro Prensa, Espessamento & ETA)"}
                </p>
              </div>
            </div>

            <div className="text-left md:text-right text-xs text-slate-300 border-t md:border-t-0 border-slate-700 pt-2 md:pt-0 w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end">
              <div>
                <strong className="text-sm font-bold text-white block">
                  {payload.periodoReferencia || "Competência Atual"}
                </strong>
                <span className="text-[11px] text-slate-400">
                  {isSeco ? "31 dias calendário • Cominuição Contínua" : "31 dias calendário • 29 dias c/ produção"}
                </span>
              </div>
              <div className="md:mt-1.5 flex items-center gap-2">
                <span className="bg-[#007369] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {isSeco ? "RGE-OP-SEC-01" : "RGE-OP-UMI-02"}
                </span>
                <span className="text-[10px] text-amber-300 font-semibold bg-amber-900/50 border border-amber-600/40 px-1.5 py-0.5 rounded">
                  USO INTERNO
                </span>
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* 2. PAINEL DE IDENTIFICAÇÃO DOS RESPONSÁVEIS TÉCNICOS */}
          {/* ======================================================= */}
          {secoes.responsaveisTecnicos && (
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
                <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">GERÊNCIA DE PLANTA & OPERAÇÕES (GEBEN)</span>
                <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">
                  {payload.gerentePlanta || "Gerência Geral de Beneficiamento"}
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. SEÇÃO 1: MONITORAMENTO BRITADOR (SECO) / BALANÇO METALÚRGICO (ÚMIDO)   */}
          {/* ========================================================================= */}
          {secoes.balancoOperacional && (
            <div className="space-y-2">
              {isSeco ? (
                /* TABELA NO MODELO DE BALANÇO: MONITORAMENTO OPERACIONAL E MECÂNICO BRITADOR PRIMÁRIO */
                <div className="space-y-2">
                  {/* Section Header Bar Formal */}
                  <div className="flex items-center justify-between border-l-4 border-l-[#007369] pl-3 py-1 bg-slate-50 rounded-r">
                    <span className="font-black text-xs text-[#0A2028] uppercase tracking-wide flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-[#007369]" />
                      1.0 Monitoramento Operacional e Mecânico: Britador Primário (41BR001 / 41TC001)
                    </span>
                    <span className="text-[10px] font-bold text-[#007369] uppercase tracking-wider">
                      CONTROLE OPERACIONAL & MECÂNICO
                    </span>
                  </div>

                  {/* Tabela de Monitoramento Estilo Balanço Físico-Operacional (Cabeçalho Teal #007369) */}
                  <div className="overflow-x-auto rounded-lg border border-slate-300 shadow-2xs">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-[#007369] text-white font-bold text-[10px]">
                          <th className="p-2 border-r border-teal-800">Variável / Indicador de Processo</th>
                          <th className="p-2 border-r border-teal-800 text-center">Equipamento</th>
                          <th className="p-2 border-r border-teal-800">Subsistema</th>
                          <th className="p-2 text-center border-r border-teal-800">Leitura Atual</th>
                          <th className="p-2 text-center border-r border-teal-800 text-teal-100 font-semibold">Faixa Operacional</th>
                          <th className="p-2 text-center border-r border-teal-800 text-[#A7F3D0]">Status / Condição</th>
                          <th className="p-2 text-left">Ação estratégica</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        {tableDataBritadorVertical.map((row, idx) => (
                          <tr
                            key={idx}
                            className={
                              row.statusTipo === "alert"
                                ? "bg-rose-50/80 font-medium text-slate-900"
                                : row.statusTipo === "warn"
                                ? "bg-amber-50/80 font-medium text-slate-900"
                                : idx % 2 === 1
                                ? "bg-slate-50/70"
                                : "bg-white"
                            }
                          >
                            <td className="p-2 border-r border-slate-300 font-bold text-slate-900">
                              {row.nome}
                            </td>
                            <td className="p-2 border-r border-slate-300 text-center font-extrabold text-blue-900">
                              <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded text-[10px]">
                                {row.equipamento}
                              </span>
                            </td>
                            <td className="p-2 border-r border-slate-300 text-slate-600 font-medium">
                              {row.subsistema}
                            </td>
                            <td className={`p-2 text-center border-r border-slate-300 font-bold ${
                              row.statusTipo === "alert"
                                ? "text-rose-700 font-black"
                                : row.statusTipo === "warn"
                                ? "text-amber-800 font-bold"
                                : row.statusTipo === "good"
                                ? "text-[#00554E]"
                                : "text-slate-400 font-normal"
                            }`}>
                              {row.leituraFormatada ? row.leituraFormatada : <span className="text-slate-400 font-normal">-</span>}
                            </td>
                            <td className="p-2 text-center border-r border-slate-300 text-slate-600 font-normal">
                              {row.faixaIdeal}
                            </td>
                            <td className="p-2 text-center border-r border-slate-300">
                              {row.statusTipo === "none" ? (
                                <span className="text-slate-400 font-semibold text-xs">-</span>
                              ) : (
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                  row.statusTipo === "alert"
                                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                                    : row.statusTipo === "warn"
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                }`}>
                                  {row.statusLabel}
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-slate-700 text-[10.5px] font-medium leading-tight">
                              {row.acaoEstrategica ? row.acaoEstrategica : <span className="text-slate-400 font-normal">-</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* TABELA DE BALANÇO METALÚRGICO (CIRCUITO ÚMIDO) */
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-l-4 border-l-[#007369] pl-3 py-1 bg-slate-50 rounded-r">
                    <span className="font-black text-xs text-[#0A2028] uppercase tracking-wide">
                      1.0 Balanço Metalúrgico-Operacional: Circuito Úmido (Realizado vs Programado)
                    </span>
                    <span className="text-[10px] font-bold text-[#007369] uppercase tracking-wider">
                      DESEMPENHO TÁTICO
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-300">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-[#007369] text-white font-bold text-[10px]">
                          <th className="p-2 border-r border-teal-800">Variável / Indicador de Processo</th>
                          <th className="p-2 border-r border-teal-800">Área</th>
                          <th className="p-2 text-center border-r border-teal-800">Realizado Dia</th>
                          <th className="p-2 text-center border-r border-teal-800 text-teal-100 font-semibold">Meta Dia</th>
                          <th className="p-2 text-center border-r border-teal-800 text-[#A7F3D0]">Ating. (%)</th>
                          <th className="p-2 text-center border-r border-teal-800">Acum. Semana</th>
                          <th className="p-2 text-center border-r border-teal-800 text-teal-100 font-semibold">Meta Sem.</th>
                          <th className="p-2 text-center border-r border-teal-800">Acum. Mês</th>
                          <th className="p-2 text-center text-teal-100 font-semibold">Meta Mês</th>
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
              )}

              {/* 1.1 CARTAS DE CONTROLE ESTATÍSTICO (CEP) & MONITORAMENTO INDIVIDUAL */}
              {isSeco && (
                <div className="pt-3 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-[11px] font-black text-[#0A2028] uppercase tracking-wide flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#007369]" />
                        1.1 Cartas de Controle Estatístico (CEP) — Monitoramento Individual (41BR001 / 41TC001)
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        14 Parâmetros • Curva Diária 7 Dias (Seg-Dom) • Sem Médias
                      </span>
                    </div>

                    {(() => {
                      const histDiario = br.historicoDiarioBritagem && br.historicoDiarioBritagem.length === 7
                        ? br.historicoDiarioBritagem
                        : DADOS_DIARIOS_BRITAGEM_PADRAO;
                      const estatisticasCartas = calcularCartasControleBritagem(histDiario);
                      const dayLabelsMin = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {estatisticasCartas.map((stat, idx) => {
                            const p = stat.parametro;
                            const temDesvio = stat.pontosForaFaixa > 0;
                            const valoresValidos = stat.valoresPorDia
                              .map(v => v.valor)
                              .filter((v): v is number => v !== null && !isNaN(v));
                            const minLido = valoresValidos.length > 0 ? Math.min(...valoresValidos) : p.minIdeal;
                            const maxLido = valoresValidos.length > 0 ? Math.max(...valoresValidos) : p.maxIdeal;
                            const yMin = Math.min(p.minIdeal * 0.94, minLido * 0.97);
                            const yMax = Math.max(p.maxIdeal * 1.06, maxLido * 1.03);
                            const ySpan = yMax - yMin || 1;

                            // SVG dimensions
                            const svgW = 320;
                            const svgH = 95;
                            const padL = 32;
                            const padR = 18;
                            const padT = 14;
                            const padB = 22;
                            const plotW = svgW - padL - padR;
                            const plotH = svgH - padT - padB;

                            const getY = (val: number) => {
                              const clamped = Math.max(yMin, Math.min(yMax, val));
                              return padT + plotH - ((clamped - yMin) / ySpan) * plotH;
                            };

                            const lscY = getY(p.maxIdeal);
                            const lcY = getY(p.alvo);
                            const licY = getY(p.minIdeal);

                            const points = stat.valoresPorDia.map((item, d) => {
                              const x = padL + (d / 6) * plotW;
                              const val = item.valor;
                              const isFora = val !== null && (val > p.maxIdeal || val < p.minIdeal);
                              const y = val !== null ? getY(val) : null;
                              return { x, y, val, isFora, diaLabel: dayLabelsMin[d] };
                            });

                            const validPoints = points.filter((pt): pt is { x: number; y: number; val: number; isFora: boolean; diaLabel: string } => pt.val !== null && pt.y !== null);
                            const polylinePts = validPoints.map(pt => `${pt.x},${pt.y}`).join(" ");

                            return (
                              <div
                                key={p.chave}
                                className={`bg-white rounded-lg border p-3 shadow-2xs space-y-2 ${
                                  temDesvio ? "border-rose-300 bg-rose-50/20" : "border-slate-300"
                                }`}
                              >
                                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                  <span className="font-bold text-xs text-slate-900 truncate">
                                    {idx + 1}. {p.nomeCurto} ({p.unidade})
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-semibold text-slate-500">
                                      Média: {stat.media} {p.unidade}
                                    </span>
                                    <span
                                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md ${
                                        temDesvio
                                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                                          : "bg-teal-50 text-teal-800 border border-teal-200"
                                      }`}
                                    >
                                      {temDesvio ? `Desvio (${stat.pontosForaFaixa}x)` : "Controlado"}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-[10px] font-semibold flex-wrap gap-1">
                                  <span className="text-blue-600 flex items-center gap-1">
                                    <span className="w-2.5 h-0.5 bg-blue-500 inline-block border-t border-dashed"></span>
                                    LIC: {p.minIdeal} {p.unidade}
                                  </span>
                                  <span className="text-rose-600 flex items-center gap-1">
                                    <span className="w-2.5 h-0.5 bg-rose-500 inline-block border-t border-dashed"></span>
                                    LSC: {p.maxIdeal} {p.unidade}
                                  </span>
                                  <span className="text-emerald-800 font-bold flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                                    Realizado (Curva Diária)
                                  </span>
                                </div>

                                {/* Gráfico SVG da Carta de Shewhart */}
                                <div className="w-full overflow-hidden bg-slate-50/90 rounded border border-slate-200 p-1">
                                  <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto">
                                    {/* Linhas de Limite */}
                                    {/* LSC */}
                                    <line
                                      x1={padL}
                                      y1={lscY}
                                      x2={svgW - padR}
                                      y2={lscY}
                                      stroke="#f43f5e"
                                      strokeWidth="1"
                                      strokeDasharray="4 2"
                                    />
                                    <text x={padL - 4} y={lscY + 3} textAnchor="end" fontSize="7.5" fill="#f43f5e" fontWeight="bold">
                                      LSC
                                    </text>

                                    {/* LIC */}
                                    <line
                                      x1={padL}
                                      y1={licY}
                                      x2={svgW - padR}
                                      y2={licY}
                                      stroke="#2563eb"
                                      strokeWidth="1"
                                      strokeDasharray="4 2"
                                    />
                                    <text x={padL - 4} y={licY + 3} textAnchor="end" fontSize="7.5" fill="#2563eb" fontWeight="bold">
                                      LIC
                                    </text>

                                    {/* Linha da Série do Realizado */}
                                    {polylinePts && (
                                      <polyline
                                        fill="none"
                                        stroke="#047857"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        points={polylinePts}
                                      />
                                    )}

                                    {/* Pontos diários */}
                                    {points.map((pt, pIdx) => (
                                      <g key={pIdx}>
                                        {/* Eixo X Rótulo */}
                                        <text
                                          x={pt.x}
                                          y={svgH - 4}
                                          textAnchor="middle"
                                          fontSize="8"
                                          fontWeight="600"
                                          fill="#475569"
                                        >
                                          {pt.diaLabel}
                                        </text>

                                        {pt.val !== null && pt.y !== null && (
                                          <>
                                            <circle
                                              cx={pt.x}
                                              cy={pt.y}
                                              r={pt.isFora ? "4" : "3"}
                                              fill={pt.isFora ? "#e11d48" : "#047857"}
                                              stroke="#ffffff"
                                              strokeWidth="1.5"
                                            />
                                            <text
                                              x={pt.x}
                                              y={pt.y < (lscY + licY) / 2 ? pt.y - 6 : pt.y + 11}
                                              textAnchor="middle"
                                              fontSize="7.5"
                                              fontWeight={pt.isFora ? "bold" : "600"}
                                              fill={pt.isFora ? "#be123c" : "#0f172a"}
                                            >
                                              {p.decimais > 0 ? pt.val.toFixed(p.decimais).replace(".", ",") : pt.val}
                                            </text>
                                          </>
                                        )}
                                      </g>
                                    ))}
                                  </svg>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 1.2 MONITORAMENTO OPERACIONAL E MECÂNICO: REBRITAGEM & PENEIRAMENTO (BR001 a BR006) */}
                {isSeco && (
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center justify-between border-l-4 border-l-[#007369] pl-3 py-1 bg-slate-50 rounded-r">
                      <span className="font-black text-xs text-[#0A2028] uppercase tracking-wide flex items-center gap-1.5">
                        <Gauge className="w-4 h-4 text-[#007369]" />
                        1.2 Monitoramento Operacional e Mecânico: Rebritagem & Peneiramento (BR001 a BR006)
                      </span>
                      <span className="text-[10px] font-bold text-[#007369] uppercase tracking-wider">
                        CONTROLE REBRITAGEM CÔNICA
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-300 shadow-2xs">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-[#007369] text-white font-bold text-[10px]">
                            <th className="p-2 border-r border-teal-800">Variável / Indicador de Processo</th>
                            <th className="p-2 border-r border-teal-800 text-center">Equipamento</th>
                            <th className="p-2 border-r border-teal-800">Subsistema</th>
                            <th className="p-2 text-center border-r border-teal-800">Leitura Atual</th>
                            <th className="p-2 text-center border-r border-teal-800 text-teal-100 font-semibold">Faixa Operacional</th>
                            <th className="p-2 text-center border-r border-teal-800 text-[#A7F3D0]">Status / Condição</th>
                            <th className="p-2 text-left">Ação estratégica</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300">
                          {tableDataRebritagemVertical.map((row, idx) => (
                            <tr
                              key={idx}
                              className={
                                row.statusTipo === "alert"
                                  ? "bg-rose-50/80 font-medium text-slate-900"
                                  : row.statusTipo === "warn"
                                  ? "bg-amber-50/80 font-medium text-slate-900"
                                  : idx % 2 === 1
                                  ? "bg-slate-50/70"
                                  : "bg-white"
                              }
                            >
                              <td className="p-2 border-r border-slate-300 font-bold text-slate-900">
                                {row.nome}
                              </td>
                              <td className="p-2 border-r border-slate-300 text-center font-extrabold text-blue-900">
                                <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded text-[10px]">
                                  {row.equipamento}
                                </span>
                              </td>
                              <td className="p-2 border-r border-slate-300 text-slate-600 font-medium">
                                {row.subsistema}
                              </td>
                              <td className={`p-2 text-center border-r border-slate-300 font-bold ${
                                row.statusTipo === "alert"
                                  ? "text-rose-700 font-black"
                                  : row.statusTipo === "warn"
                                  ? "text-amber-800 font-bold"
                                  : row.statusTipo === "good"
                                  ? "text-[#00554E]"
                                  : "text-slate-400 font-normal"
                              }`}>
                                {row.leituraFormatada ? row.leituraFormatada : <span className="text-slate-400 font-normal">-</span>}
                              </td>
                              <td className="p-2 text-center border-r border-slate-300 text-slate-600 font-normal">
                                {row.faixaIdeal}
                              </td>
                              <td className="p-2 text-center border-r border-slate-300">
                                {row.statusTipo === "none" ? (
                                  <span className="text-slate-400 font-semibold text-xs">-</span>
                                ) : (
                                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                    row.statusTipo === "alert"
                                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                                      : row.statusTipo === "warn"
                                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  }`}>
                                    {row.statusLabel}
                                  </span>
                                )}
                              </td>
                              <td className="p-2 text-slate-700 text-[10.5px] font-medium leading-tight">
                                {row.acaoEstrategica ? row.acaoEstrategica : <span className="text-slate-400 font-normal">-</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 1.3 CARTAS DE CONTROLE ESTATÍSTICO (CEP) & MONITORAMENTO REBRITAGEM */}
                {isSeco && (
                  <div className="pt-3 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-[11px] font-black text-[#0A2028] uppercase tracking-wide flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#007369]" />
                        1.3 Cartas de Controle Estatístico (CEP) — Rebritagem & Peneiramento (BR001 a BR006)
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        28 Parâmetros • Curva Diária 7 Dias (Seg-Dom) • Sem Médias
                      </span>
                    </div>

                    {(() => {
                      const histDiario = br.historicoDiarioRebritagem && br.historicoDiarioRebritagem.length === 7
                        ? br.historicoDiarioRebritagem
                        : DADOS_DIARIOS_REBRITAGEM_PADRAO;
                      const estatisticasCartas = calcularCartasControleRebritagem(histDiario);
                      const dayLabelsMin = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {estatisticasCartas.map((stat, idx) => {
                            const p = stat.parametro;
                            const temDesvio = stat.pontosForaFaixa > 0;
                            const valoresValidos = stat.valoresPorDia
                              .map(v => v.valor)
                              .filter((v): v is number => v !== null && !isNaN(v));
                            const minLido = valoresValidos.length > 0 ? Math.min(...valoresValidos) : p.minIdeal;
                            const maxLido = valoresValidos.length > 0 ? Math.max(...valoresValidos) : p.maxIdeal;
                            const yMin = Math.min(p.minIdeal * 0.94, minLido * 0.97);
                            const yMax = Math.max(p.maxIdeal * 1.06, maxLido * 1.03);
                            const ySpan = yMax - yMin || 1;

                            // SVG dimensions
                            const svgW = 320;
                            const svgH = 95;
                            const padL = 32;
                            const padR = 18;
                            const padT = 14;
                            const padB = 22;
                            const plotW = svgW - padL - padR;
                            const plotH = svgH - padT - padB;

                            const getY = (val: number) => {
                              const clamped = Math.max(yMin, Math.min(yMax, val));
                              return padT + plotH - ((clamped - yMin) / ySpan) * plotH;
                            };

                            const lscY = getY(p.maxIdeal);
                            const licY = getY(p.minIdeal);

                            const points = stat.valoresPorDia.map((item, d) => {
                              const x = padL + (d / 6) * plotW;
                              const val = item.valor;
                              const isFora = val !== null && (val > p.maxIdeal || val < p.minIdeal);
                              const y = val !== null ? getY(val) : null;
                              return { x, y, val, isFora, diaLabel: dayLabelsMin[d] };
                            });

                            const validPoints = points.filter((pt): pt is { x: number; y: number; val: number; isFora: boolean; diaLabel: string } => pt.val !== null && pt.y !== null);
                            const polylinePts = validPoints.map(pt => `${pt.x},${pt.y}`).join(" ");

                            return (
                              <div
                                key={p.chave}
                                className={`bg-white rounded-lg border p-3 shadow-2xs space-y-2 ${
                                  temDesvio ? "border-rose-300 bg-rose-50/20" : "border-slate-300"
                                }`}
                              >
                                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                  <span className="font-bold text-xs text-slate-900 truncate">
                                    {idx + 1}. {p.nome} ({p.equipamento})
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                        temDesvio
                                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                                          : "bg-teal-100 text-teal-800 border border-teal-200"
                                      }`}
                                    >
                                      {temDesvio ? `Desvio (${stat.pontosForaFaixa}x)` : "Controlado"}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex justify-between text-[10px] font-mono">
                                  <span className="text-blue-700 font-bold">
                                    LIC: {p.minIdeal} {p.unidade}
                                  </span>
                                  <span className="text-red-700 font-bold">
                                    LSC: {p.maxIdeal} {p.unidade}
                                  </span>
                                </div>

                                <div className="w-full overflow-hidden">
                                  <svg
                                    viewBox={`0 0 ${svgW} ${svgH}`}
                                    className="w-full h-auto max-h-[110px]"
                                  >
                                    {/* Faixa Ideal */}
                                    <rect
                                      x={padL}
                                      y={Math.min(lscY, licY)}
                                      width={plotW}
                                      height={Math.abs(licY - lscY)}
                                      fill="#f0fdf4"
                                      opacity="0.9"
                                    />

                                    {/* Linhas de Limite */}
                                    <line
                                      x1={padL}
                                      y1={lscY}
                                      x2={padL + plotW}
                                      y2={lscY}
                                      stroke="#ef4444"
                                      strokeWidth="1.2"
                                      strokeDasharray="3,2"
                                    />
                                    <line
                                      x1={padL}
                                      y1={licY}
                                      x2={padL + plotW}
                                      y2={licY}
                                      stroke="#3b82f6"
                                      strokeWidth="1.2"
                                      strokeDasharray="3,2"
                                    />

                                    {/* Polyline */}
                                    {polylinePts && (
                                      <polyline
                                        fill="none"
                                        stroke="#0f766e"
                                        strokeWidth="2.2"
                                        points={polylinePts}
                                      />
                                    )}

                                    {/* Pontos Diários */}
                                    {points.map((pt, d) => (
                                      <g key={d}>
                                        <text
                                          x={pt.x}
                                          y={svgH - 4}
                                          textAnchor="middle"
                                          fontSize="8.5"
                                          fontWeight="600"
                                          fill="#475569"
                                        >
                                          {pt.diaLabel}
                                        </text>

                                        {pt.val !== null && pt.y !== null && (
                                          <>
                                            <circle
                                              cx={pt.x}
                                              cy={pt.y}
                                              r={pt.isFora ? "4" : "3"}
                                              fill={pt.isFora ? "#e11d48" : "#047857"}
                                              stroke="#ffffff"
                                              strokeWidth="1.5"
                                            />
                                            <text
                                              x={pt.x}
                                              y={pt.y < (lscY + licY) / 2 ? pt.y - 6 : pt.y + 11}
                                              textAnchor="middle"
                                              fontSize="7.5"
                                              fontWeight={pt.isFora ? "bold" : "600"}
                                              fill={pt.isFora ? "#be123c" : "#0f172a"}
                                            >
                                              {p.decimais > 0 ? pt.val.toFixed(p.decimais).replace(".", ",") : pt.val}
                                            </text>
                                          </>
                                        )}
                                      </g>
                                    ))}
                                  </svg>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. SEÇÃO 2: ANÁLISE GRÁFICA & VISUALIZAÇÃO POR PROCESSO ESPECÍFICO (APENAS CIRCUITO ÚMIDO) */}
          {/* ========================================================================= */}
          {!isSeco && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-l-4 border-l-[#007369] pl-3 py-1 bg-slate-50 rounded-r">
                <span className="font-black text-xs text-[#0A2028] uppercase tracking-wide">
                  ▶ Análise por Processo & Evolução Tática (Circuito Úmido - Beneficiamento)
                </span>
                <span className="text-[10px] font-bold text-[#007369] uppercase tracking-wider">
                  COMPARAÇÃO COM BUDGET
                </span>
              </div>

              {/* --- GRÁFICOS DO CIRCUITO ÚMIDO --- */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Moagem por Moinho */}
                  <div className="bg-white p-3 rounded-lg border border-slate-300 space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold text-[#00554E] uppercase tracking-wider block">
                      Moagem — Produção por Moinho (t/mês)
                    </span>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-semibold text-slate-700">MI03 (Linha 1):</span>
                        <span className="font-bold text-slate-900">134.245 t (210,3 t/h)</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-semibold text-slate-700">MI04 (Linha 2):</span>
                        <span className="font-bold text-slate-900">131.848 t (201,8 t/h)</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-semibold text-slate-700">MI05 (Linha 3):</span>
                        <span className="font-bold text-slate-900">132.467 t (201,9 t/h)</span>
                      </div>
                      <div className="pt-1 border-t border-slate-200 flex justify-between text-[10px] text-slate-600">
                        <span>Disp. MI03: <strong>90,35%</strong></span>
                        <span>P80 Global: <strong>105 µm (62%)</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Flotação Teores e Recuperação */}
                  <div className="bg-white p-3 rounded-lg border border-slate-300 space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold text-[#00554E] uppercase tracking-wider block">
                      Flotação — Teores & Recuperação Cu
                    </span>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-600">Teor Alimentação:</span>
                        <span className="font-bold text-emerald-800">0,963% CuT (Budget: 0,935%)</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-600">Teor Concentrado:</span>
                        <span className="font-bold text-slate-900">{ce.teorConcentradoCu || "34,65"}% Cu</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-600">Teor Rejeito:</span>
                        <span className="font-bold text-slate-900">{ce.teorRejeitoCu || "0,108"}% Cu</span>
                      </div>
                      <div className="pt-1 border-t border-slate-200 flex justify-between text-[10px] text-[#00554E] font-bold">
                        <span>Recuperação Metalúrgica:</span>
                        <span className="text-emerald-700 font-black">89,46% (▲ +1,48 pp)</span>
                      </div>
                    </div>
                  </div>

                  {/* Filtro Prensa */}
                  <div className="bg-white p-3 rounded-lg border border-slate-300 space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold text-[#00554E] uppercase tracking-wider block">
                      Filtro Prensa & ETA — Desempenho
                    </span>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-600">Disponibilidade Filtro:</span>
                        <span className="font-bold text-emerald-700">97,70% (Meta ≥ 90%)</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-600">Utilização Filtro:</span>
                        <span className="font-bold text-amber-700">53,66% (Meta ≥ 65%)</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-600">Umidade do Bolo:</span>
                        <span className="font-bold text-slate-900">{ce.umidadeBolo || "8,45"}% (Meta ≤ 9,0%)</span>
                      </div>
                      <div className="pt-1 border-t border-slate-200 flex justify-between text-[10px] text-slate-600">
                        <span>Reuso Água ETA: <strong>{ce.taxaRecirculacaoReuso || "88,5"}%</strong></span>
                        <span>Turbidez: <strong>{ce.turbidezAguaTratadaNtu || "4,2"} NTU</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. SEÇÃO 3: PRINCIPAIS PERDAS & CAUSAS-RAIZ (PADRÃO FORMAL GEBEN) */}
          {/* ========================================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-l-4 border-l-[#007369] pl-3 py-1 bg-slate-50 rounded-r">
              <span className="font-black text-xs text-[#0A2028] uppercase tracking-wide">
                ▶ Principais Perdas, Causas-Raiz & Ações Recomendadas ({isSeco ? "Circuito Seco" : "Circuito Úmido"})
              </span>
              <span className="text-[10px] font-bold text-[#007369] uppercase tracking-wider">
                DIAGNÓSTICO TÉCNICO
              </span>
            </div>

            {/* Coluna 1: Perdas Quantificadas & Impactos */}
            {(() => {
              const histDiario = isSeco
                ? (payload.dadosBritagemRebritagem.historicoDiarioBritagem && payload.dadosBritagemRebritagem.historicoDiarioBritagem.length === 7
                    ? payload.dadosBritagemRebritagem.historicoDiarioBritagem
                    : DADOS_DIARIOS_BRITAGEM_PADRAO)
                : [];
              const desviosDetectados = isSeco
                ? detectarDesviosBritagem(histDiario, payload.dadosBritagemRebritagem.anotacoesDesvios)
                : [];

              const acoesP1 = (payload.diretrizesTurno || [])
                .filter(d => d.prioridade === "critica" || d.acaoEstrategica.includes("P1") || d.setor.includes("P1"))
                .slice(0, 5);
              const acoesFinaisP1 = acoesP1.length > 0 ? acoesP1 : (payload.diretrizesTurno || []).slice(0, 5);

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Coluna 1: Perdas Quantificadas */}
                  <div className="bg-white rounded-lg border border-slate-300 p-3.5 space-y-3">
                    <span className="text-[11px] font-black text-[#00554E] uppercase tracking-wider block border-b border-slate-200 pb-1.5">
                      PERDAS QUANTIFICADAS ({isSeco ? "Impactos por Indicadores Fora da Faixa Ideal" : "Impacto em Metal Cu Contido"})
                    </span>

                    {isSeco ? (
                      desviosDetectados.length > 0 ? (
                        <div className="space-y-2.5 text-xs">
                          {desviosDetectados.map((desv, idx) => (
                            <div key={idx} className={`flex gap-2.5 items-start ${idx > 0 ? "pt-2 border-t border-slate-100" : ""}`}>
                              <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                                {idx + 1}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 text-xs">
                                    {desv.parametro.nome} — {desv.diaLabel}
                                  </span>
                                  <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                                    desvio {desv.tipoDesvio === "alto" ? "LSC" : "LIC"}
                                  </span>
                                </div>
                                <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                                  Leitura: <strong>{desv.valorLido} {desv.parametro.unidade}</strong> (Faixa ideal: {desv.parametro.minIdeal} a {desv.parametro.maxIdeal} {desv.parametro.unidade}).
                                </p>
                                {desv.impactoPerda ? (
                                  <span className="text-rose-700 font-bold text-[11px] block mt-0.5">
                                    ▼ {desv.impactoPerda}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px] block mt-0.5">
                                    Impacto/perda a ser registrado pela supervisão no formulário operacional
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2.5 text-xs">
                          <div className="flex gap-2.5 items-start">
                            <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                              ✓
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 text-xs">Operação Estável na Faixa Ideal</span>
                              <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                                Todos os 14 indicadores operacionais e mecânicos da britagem operando estritamente dentro dos limites de controle estatístico (CEP).
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="space-y-2.5 text-xs">
                        {/* Item 1 */}
                        <div className="flex gap-2.5 items-start">
                          <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                            1
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-xs">Parada Moagem/Planta — Dia 28</span>
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">manutenção</span>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                              Produção reduzida para 6.168 t (vs ~14.500 t esperado). Filtro Prensa com 8h MCM. Moinhos MI03, MI04 e MI05 com taxa reduzida.
                            </p>
                            <span className="text-rose-700 font-bold text-[11px] block mt-0.5">
                              ▼ ~70–75 t Cu | Produção no dia: 43,6 t Cu (meta ~108 t Cu)
                            </span>
                          </div>
                        </div>

                        {/* Item 2 */}
                        <div className="flex gap-2.5 items-start pt-2 border-t border-slate-100">
                          <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                            2
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-xs">Queda de Teor CuT — Semana 4 (dias 22-27)</span>
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">blend</span>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                              Teor médio de 0,80% CuT na 4ª semana vs 1,11% na 1ª semana. Queda de 0,31pp reduz metal gerado mesmo mantendo throughput de moagem.
                            </p>
                            <span className="text-rose-700 font-bold text-[11px] block mt-0.5">
                              ▼ ~45–55 t Cu abaixo do potencial máximo da semana
                            </span>
                          </div>
                        </div>

                        {/* Item 3 */}
                        <div className="flex gap-2.5 items-start pt-2 border-t border-slate-100">
                          <div className="w-5 h-5 rounded-full bg-[#C9A84C] text-[#0A2028] flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                            3
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-xs">Utilização Filtro Prensa Reduzida</span>
                              <span className="bg-teal-100 text-teal-800 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">capacidade</span>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                              Utilização média de 53,7% indica capacidade ociosa significativa no desaguamento.
                            </p>
                            <span className="text-slate-700 font-bold text-[11px] block mt-0.5">
                              ℹ️ Oportunidade de expansão de ciclos e maior flexibilidade operacional
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Coluna 2: Ações Recomendadas & Diretrizes Táticas (TOP 5 AÇÕES P1) */}
                  <div className="bg-white rounded-lg border border-slate-300 p-3.5 space-y-3">
                    <span className="text-[11px] font-black text-[#00554E] uppercase tracking-wider block border-b border-slate-200 pb-1.5">
                      AÇÕES RECOMENDADAS & DIRETRIZES TÁTICAS (5 AÇÕES P1 PRIORITÁRIAS)
                    </span>

                    <div className="space-y-2 text-xs">
                      {acoesFinaisP1.map((acao, idx) => (
                        <div key={idx} className={`flex gap-2 items-start ${idx > 0 ? "pt-2 border-t border-slate-100" : ""}`}>
                          <span className="w-5 h-5 rounded bg-[#007369] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            P1-{idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-xs">{acao.acaoEstrategica}</span>
                              <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                                {acao.setor || "P1"}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                              Resp: <strong>{acao.supervisorNome || acao.responsavelTurma}</strong> • Prazo: {acao.prazoLimite || "Imediato"}
                              {acao.metaEsperada ? ` • Meta: ${acao.metaEsperada}` : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>


          {/* ========================================================================= */}
          {/* 4. SEÇÃO 2: DIRECIONAMENTO ESTRATÉGICO POR HORIZONTE DE GESTÃO */}
          {/* ========================================================================= */}
          {(secoes.horizonteSemana || secoes.horizonteFds || secoes.horizonteParada || secoes.horizonteMes) && (
            <div className="space-y-3">
              {/* Section Header Bar Formal */}
              <div className="bg-[#0A2028] text-white px-3.5 py-1.5 rounded flex items-center justify-between border-l-4 border-l-[#007369]">
                <span className="font-bold text-xs tracking-wide">
                  2.0 DIRECIONAMENTO ESTRATÉGICO & BALIZAMENTO POR HORIZONTE DE PLANEJAMENTO
                </span>
                <span className="text-[10px] font-bold text-[#A7F3D0] uppercase tracking-wider">
                  GOVERNANÇA TÁTICA (WTD • FDS • PARADA • MTD)
                </span>
              </div>

              {/* Cartões de Horizonte Idênticos ao PDF Formal */}
              <div className="space-y-2.5">
                {/* Card 1: Semana */}
                {secoes.horizonteSemana && (
                  <div className="bg-[#EFF6FF] border-l-4 border-l-[#3B82F6] border border-blue-200 rounded-lg p-3.5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1D4ED8] text-xs flex items-center gap-1.5">
                        HORIZONTE WTD: ESTRATÉGIA DA SEMANA (WEEK TO DATE)
                      </span>
                      <span className="text-[10px] font-bold text-[#1D4ED8] bg-blue-100 px-2 py-0.5 rounded">
                        SEMANAL
                      </span>
                    </div>
                    {payload.estrategiaSemana.focoPrincipal && (
                      <p className="font-bold text-slate-900 leading-snug">
                        • Diretriz Principal & Foco Tático: <span className="font-semibold text-slate-800">{payload.estrategiaSemana.focoPrincipal}</span>
                      </p>
                    )}
                    {(isSeco ? (payload.estrategiaSemana.metaAlimentacaoBritagem || payload.estrategiaSemana.metaTaxaHoraria || payload.estrategiaSemana.metaDisponibilidade) : (payload.estrategiaSemana.metaAlimentacaoMoagem || payload.estrategiaSemana.metaProducaoCobreContido || payload.estrategiaSemana.metaRecuperacao)) && (
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
                    )}
                    <div className="text-slate-700 leading-snug">
                      <span className="font-semibold">• Procedimentos & Diretrizes Prioritárias:</span>
                      <ul className="list-none pl-1 text-[11px] mt-1 space-y-1 text-slate-800">
                        {(payload.estrategiaSemana.diretrizesPrioritarias || []).map((dir, i) => {
                          const match = dir.match(/^\[(.*?)\]\s*(.*)$/);
                          if (match) {
                            return (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="font-bold text-blue-800 text-[10px] shrink-0 mt-0.5">[{i + 1}]</span>
                                <span className="bg-blue-100/90 text-blue-900 border border-blue-300 font-bold px-1.5 py-0.2 rounded text-[10px] uppercase shrink-0 mt-0.5">
                                  {match[1]}
                                </span>
                                <span className="text-slate-800 font-medium">{match[2]}</span>
                              </li>
                            );
                          }
                          return (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="font-bold text-blue-800 text-[10px] shrink-0 mt-0.5">[{i + 1}]</span>
                              <span className="text-slate-800 font-medium">{dir}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    {payload.estrategiaSemana.recursosManutencao && (
                      <p className="text-[11px] text-blue-900 font-semibold">
                        • Intervenções de Manutenção / Gestão de Ativos:{" "}
                        {Array.isArray(payload.estrategiaSemana.recursosManutencao)
                          ? payload.estrategiaSemana.recursosManutencao.filter(Boolean).join("; ")
                          : payload.estrategiaSemana.recursosManutencao}
                      </p>
                    )}
                  </div>
                )}

                {/* Card 3: Fim de Semana */}
                {secoes.horizonteFds && (
                  <div className="bg-[#FEF3C7] border-l-4 border-l-[#F59E0B] border border-amber-200 rounded-lg p-3.5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#B45309] text-xs flex items-center gap-1.5">
                        HORIZONTE FDS: BLINDAGEM OPERACIONAL & PLANTÃO DE FINAL DE SEMANA
                      </span>
                      <span className="text-[10px] font-bold text-[#B45309] bg-amber-100 px-2 py-0.5 rounded">
                        PLANTÃO FDS
                      </span>
                    </div>
                    {payload.estrategiaFds.focoPrincipal && (
                      <p className="font-bold text-slate-900 leading-snug">
                        • Diretriz Principal & Foco Tático: <span className="font-semibold text-slate-800">{payload.estrategiaFds.focoPrincipal}</span>
                      </p>
                    )}
                    {(isSeco ? (payload.estrategiaFds.metaAlimentacaoBritagem || payload.estrategiaFds.metaTaxaHoraria || payload.estrategiaFds.metaDisponibilidade) : (payload.estrategiaFds.metaAlimentacaoMoagem || payload.estrategiaFds.metaProducaoCobreContido || payload.estrategiaFds.metaRecuperacao)) && (
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
                    )}
                    {payload.estrategiaFds.diretrizesPrioritarias && payload.estrategiaFds.diretrizesPrioritarias.length > 0 && (
                      <div className="text-slate-700 leading-snug">
                        <span className="font-semibold">• Procedimentos & Diretrizes Prioritárias:</span>
                        <ul className="list-none pl-1 text-[11px] mt-1 space-y-1 text-slate-800">
                          {payload.estrategiaFds.diretrizesPrioritarias.map((dir, i) => {
                            const match = dir.match(/^\[(.*?)\]\s*(.*)$/);
                            if (match) {
                              return (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="font-bold text-amber-800 text-[10px] shrink-0 mt-0.5">[{i + 1}]</span>
                                  <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.2 rounded text-[10px] uppercase shrink-0 mt-0.5">
                                    {match[1]}
                                  </span>
                                  <span className="text-slate-800 font-medium">{match[2]}</span>
                                </li>
                              );
                            }
                            return (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="font-bold text-amber-800 text-[10px] shrink-0 mt-0.5">[{i + 1}]</span>
                                <span className="text-slate-800 font-medium">{dir}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {payload.estrategiaFds.planoBlindagemFds && (
                      <p className="text-[11px] text-amber-950 font-bold bg-amber-100/80 p-1.5 rounded border border-amber-300">
                        • Protocolo Formal de Blindagem FDS: {payload.estrategiaFds.planoBlindagemFds}
                      </p>
                    )}
                  </div>
                )}

                {/* Card: Alinhamento de Parada */}
                {secoes.horizonteParada && payload.estrategiaParada && (
                  <div className="bg-[#FFF1F2] border-l-4 border-l-[#E11D48] border border-rose-200 rounded-lg p-3.5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#BE123C] text-xs flex items-center gap-1.5">
                        ALINHAMENTO DE PARADA: PLANEJAMENTO & PROTOCOLO DE INTERVENÇÃO
                      </span>
                      <span className="text-[10px] font-bold text-[#BE123C] bg-rose-100 px-2 py-0.5 rounded">
                        ALINHAMENTO DE PARADA
                      </span>
                    </div>
                    {payload.estrategiaParada.focoPrincipal && (
                      <p className="font-bold text-slate-900 leading-snug">
                        • Diretriz Principal & Foco Tático: <span className="font-semibold text-slate-800">{payload.estrategiaParada.focoPrincipal}</span>
                      </p>
                    )}
                    {(isSeco ? (payload.estrategiaParada.metaAlimentacaoBritagem || payload.estrategiaParada.metaTaxaHoraria || payload.estrategiaParada.metaDisponibilidade) : (payload.estrategiaParada.metaAlimentacaoMoagem || payload.estrategiaParada.metaProducaoCobreContido || payload.estrategiaParada.metaRecuperacao)) ? (
                      <p className="text-slate-700 leading-snug">
                        • Balizamento Numérico:{" "}
                        {isSeco ? (
                          <span>
                            Britagem ROM: <strong>{payload.estrategiaParada.metaAlimentacaoBritagem ? payload.estrategiaParada.metaAlimentacaoBritagem.toLocaleString("pt-BR") : "-"} t</strong> | Taxa Alimentação: <strong>{payload.estrategiaParada.metaTaxaHoraria || "-"} t/h</strong> | Disponibilidade: <strong>{payload.estrategiaParada.metaDisponibilidade || "-"}%</strong>
                          </span>
                        ) : (
                          <span>
                            Moagem Planta: <strong>{payload.estrategiaParada.metaAlimentacaoMoagem ? payload.estrategiaParada.metaAlimentacaoMoagem.toLocaleString("pt-BR") : "-"} t</strong> | Metal Cu Contido: <strong>{payload.estrategiaParada.metaProducaoCobreContido || "-"} t Cu</strong> | Rec. Global: <strong>{payload.estrategiaParada.metaRecuperacao || "-"}%</strong>
                          </span>
                        )}
                      </p>
                    ) : null}
                    {payload.estrategiaParada.diretrizesPrioritarias && payload.estrategiaParada.diretrizesPrioritarias.length > 0 && (
                      <div className="text-slate-700 leading-snug">
                        <span className="font-semibold">• Procedimentos & Diretrizes Prioritárias:</span>
                        <ul className="list-none pl-1 text-[11px] mt-1 space-y-1 text-slate-800">
                          {payload.estrategiaParada.diretrizesPrioritarias.map((dir, i) => {
                            const match = dir.match(/^\[(.*?)\]\s*(.*)$/);
                            if (match) {
                              return (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="font-bold text-rose-800 text-[10px] shrink-0 mt-0.5">[{i + 1}]</span>
                                  <span className="bg-rose-100 text-rose-900 border border-rose-300 font-bold px-1.5 py-0.2 rounded text-[10px] uppercase shrink-0 mt-0.5">
                                    {match[1]}
                                  </span>
                                  <span className="text-slate-800 font-medium">{match[2]}</span>
                                </li>
                              );
                            }
                            return (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="font-bold text-rose-800 text-[10px] shrink-0 mt-0.5">[{i + 1}]</span>
                                <span className="text-slate-800 font-medium">{dir}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {payload.estrategiaParada.recursosManutencao && (
                      <p className="text-slate-700 leading-snug">
                        • Intervenções de Manutenção / Gestão de Ativos:{" "}
                        {Array.isArray(payload.estrategiaParada.recursosManutencao)
                          ? payload.estrategiaParada.recursosManutencao.filter(Boolean).join("; ")
                          : payload.estrategiaParada.recursosManutencao}
                      </p>
                    )}
                    {payload.estrategiaParada.alertasOperacionais && payload.estrategiaParada.alertasOperacionais.length > 0 && (
                      <p className="text-slate-700 leading-snug">
                        • Pontos Críticos & Gerenciamento de Risco: {payload.estrategiaParada.alertasOperacionais.join("; ")}
                      </p>
                    )}
                    {(payload.estrategiaParada.planoAlinhamentoParada || payload.estrategiaParada.planoBlindagemFds) && (
                      <p className="text-[11px] text-rose-950 font-bold bg-rose-100/80 p-1.5 rounded border border-rose-300">
                        • Protocolo Formal de Alinhamento de Parada: {payload.estrategiaParada.planoAlinhamentoParada || payload.estrategiaParada.planoBlindagemFds}
                      </p>
                    )}
                  </div>
                )}

                {/* Card 4: Mês */}
                {secoes.horizonteMes && (
                  <div className="bg-[#F5F3FF] border-l-4 border-l-[#8B5CF6] border border-purple-200 rounded-lg p-3.5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#6D28D9] text-xs flex items-center gap-1.5">
                        HORIZONTE MTD: PLANEJAMENTO MENSAL & FORECAST (MONTH TO DATE)
                      </span>
                      <span className="text-[10px] font-bold text-[#6D28D9] bg-purple-100 px-2 py-0.5 rounded">
                        MENSAL
                      </span>
                    </div>
                    {payload.estrategiaMes.focoPrincipal && (
                      <p className="font-bold text-slate-900 leading-snug">
                        • Diretriz Principal & Foco Tático: <span className="font-semibold text-slate-800">{payload.estrategiaMes.focoPrincipal}</span>
                      </p>
                    )}
                    {(isSeco ? (payload.estrategiaMes.metaAlimentacaoBritagem || payload.estrategiaMes.metaTaxaHoraria || payload.estrategiaMes.metaDisponibilidade) : (payload.estrategiaMes.metaAlimentacaoMoagem || payload.estrategiaMes.metaProducaoCobreContido || payload.estrategiaMes.metaRecuperacao)) && (
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
                    )}
                    {payload.estrategiaMes.diretrizesPrioritarias && payload.estrategiaMes.diretrizesPrioritarias.length > 0 && (
                      <div className="text-slate-700 leading-snug">
                        <span className="font-semibold">• Procedimentos & Diretrizes Prioritárias:</span>
                        <ul className="list-none pl-1 text-[11px] mt-1 space-y-1 text-slate-800">
                          {payload.estrategiaMes.diretrizesPrioritarias.map((dir, i) => {
                            const match = dir.match(/^\[(.*?)\]\s*(.*)$/);
                            if (match) {
                              return (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="font-bold text-purple-800 text-[10px] shrink-0 mt-0.5">[{i + 1}]</span>
                                  <span className="bg-purple-100 text-purple-900 border border-purple-300 font-bold px-1.5 py-0.2 rounded text-[10px] uppercase shrink-0 mt-0.5">
                                    {match[1]}
                                  </span>
                                  <span className="text-slate-800 font-medium">{match[2]}</span>
                                </li>
                              );
                            }
                            return (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="font-bold text-purple-800 text-[10px] shrink-0 mt-0.5">[{i + 1}]</span>
                                <span className="text-slate-800 font-medium">{dir}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. SEÇÃO 3: MATRIZ TÁTICA DE DIRETRIZES & RESPONSABILIDADES (RACI) */}
          {/* ========================================================================= */}
          {secoes.matrizDiretrizes && (
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
          )}

          {/* ========================================================================= */}
          {/* 5.1 SEÇÃO GANTT: CRONOGRAMA DE EXECUÇÃO SEMANAL POR TURMA & SUPERVISOR */}
          {/* ========================================================================= */}
          {secoes.cronogramaGantt && (
            <div className="space-y-2">
              <AdmGanttChartView
                circuitoTipo={payload.circuitoTipo}
                diretrizes={dt}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. SEÇÃO 4: GESTÃO DE RESTRIÇÕES, GARGALOS & CONTINGÊNCIAS */}
          {/* ========================================================================= */}
          {(secoes.diagnosticoGargalos || secoes.planoContingencia) && (
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
                {secoes.diagnosticoGargalos && (
                  <div>
                    <span className="font-bold text-[#00554E] block mb-0.5">
                      • Diagnóstico de Gargalos & Restrições ({isSeco ? "Circuito Seco - Cominuição" : "Circuito Úmido - Beneficiamento"}):
                    </span>
                    <p className="text-slate-800 pl-3 leading-relaxed font-medium bg-white p-2 rounded border border-slate-300">
                      {gargalosTexto || <span className="text-slate-400 font-normal italic">Nenhum gargalo operacional preenchido pela supervisão.</span>}
                    </p>
                  </div>
                )}

                {secoes.planoContingencia && (
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">
                      • Plano de Contingência & Recomendações Estratégicas da Supervisão ADM:
                    </span>
                    <p className="text-slate-800 pl-3 leading-relaxed font-medium bg-white p-2 rounded border border-slate-300">
                      {contingTexto || <span className="text-slate-400 font-normal italic">Nenhum plano de contingência operacional preenchido pela supervisão.</span>}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

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
