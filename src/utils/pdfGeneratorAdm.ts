/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { RelatorioAdmPayload, fmtData } from "../typesAdm";

/**
 * Gerador de Relatório Gerencial Estratégico em PDF (Padrão Corporativo Vale / Ero Brasil)
 * Modelo formal de Governança Operacional, Controle Metalúrgico e Alinhamento Tático
 */
export function gerarRelatorioAdmPDF(payload: RelatorioAdmPayload) {
  const {
    circuitoTipo,
    dataEmissao,
    periodoReferencia,
    supervisorAdmResponsavel,
    engenheiroProcesso,
    gerentePlanta,
    dadosBritagemRebritagem: br,
    dadosConcentradorEta: ce,
    estrategiaDia,
    estrategiaSemana,
    estrategiaFds,
    estrategiaMes,
    diretrizesTurno,
    observacoesGerais,
  } = payload;

  const isSeco = circuitoTipo === "seco";

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  let currentY = margin;

  // Paleta Corporativa Formal de Mineração (Padrão Executivo Vale / Ero Brasil)
  const corpPrimary: [number, number, number] = [10, 32, 40]; // #0A2028 - Azul Profundo Corporativo
  const corpTeal: [number, number, number] = [0, 115, 105]; // #007369 - Verde/Teal Oficial
  const corpTealDark: [number, number, number] = [0, 85, 78]; // #00554E
  const corpTealLight: [number, number, number] = [238, 248, 247]; // Fundo suave tabelas destaque
  const corpSlateDark: [number, number, number] = [15, 23, 42]; // #0F172A - Texto Principal
  const corpSlateText: [number, number, number] = [51, 65, 85]; // #334155 - Texto Secundário
  const corpSlateMuted: [number, number, number] = [100, 116, 139]; // #64748B - Rótulos
  const corpBorder: [number, number, number] = [203, 213, 225]; // #CBD5E1 - Linhas
  const corpBgHeader: [number, number, number] = [241, 245, 249]; // #F1F5F9 - Cabeçalhos
  const corpGold: [number, number, number] = [180, 83, 9]; // #B45309 - Atenção

  // Helper para Quebra de Página Segura com Margem Superior
  const checkPageBreak = (neededHeight: number): boolean => {
    if (currentY + neededHeight > pageHeight - 14) {
      doc.addPage();
      currentY = margin + 6;
      return true;
    }
    return false;
  };

  // Helper para Cabeçalho de Seção Formal
  const drawFormalSectionHeader = (code: string, title: string, subTag?: string) => {
    checkPageBreak(12);

    // Barra de Fundo Corporativo
    doc.setFillColor(...corpPrimary);
    doc.rect(margin, currentY, pageWidth - margin * 2, 6.5, "F");

    // Filete Indicador
    doc.setFillColor(...corpTeal);
    doc.rect(margin, currentY, 3, 6.5, "F");

    // Código da Seção e Título
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`${code}  ${title}`, margin + 5, currentY + 4.5);

    // Tag Lateral
    if (subTag) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(167, 243, 208);
      doc.text(subTag.toUpperCase(), pageWidth - margin - 4, currentY + 4.5, { align: "right" });
    }

    currentY += 8.5;
  };

  // =========================================================================
  // --- 1. CABEÇALHO FORMAL CORPORATIVO (PADRÃO VALE / ERO BRASIL) ---
  // =========================================================================
  const headerHeight = 24;
  const headerWidth = pageWidth - margin * 2;

  // Moldura Externa do Cabeçalho
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...corpPrimary);
  doc.setLineWidth(0.6);
  doc.rect(margin, currentY, headerWidth, headerHeight, "FD");

  // Coluna 1: Logo & Unidade (Largura: 46mm)
  const colLogoW = 46;
  doc.setDrawColor(...corpBorder);
  doc.setLineWidth(0.3);
  doc.line(margin + colLogoW, currentY, margin + colLogoW, currentY + headerHeight);

  // Logo Ero Brasil Box
  doc.setFillColor(...corpPrimary);
  doc.roundedRect(margin + 4, currentY + 3.5, 38, 7, 0.8, 0.8, "F");
  doc.setFont("helvetica", "black");
  doc.setFontSize(8.5);
  doc.setTextColor(20, 184, 166);
  doc.text("ERO", margin + 7, currentY + 8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("BRASIL", margin + 16, currentY + 8.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(...corpSlateDark);
  doc.text("COMPLEXO INDUSTRIAL COBRE", margin + 4, currentY + 14.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(...corpSlateMuted);
  doc.text("Mineração Caraíba S/A • Operações", margin + 4, currentY + 18);
  doc.text("SGI - Sistema de Gestão Integrada", margin + 4, currentY + 21);

  // Coluna 2: Título Central Oficial (Largura: 94mm)
  const colTitleW = 94;
  doc.line(margin + colLogoW + colTitleW, currentY, margin + colLogoW + colTitleW, currentY + headerHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...corpPrimary);
  doc.text("RELATÓRIO GERENCIAL ESTRATÉGICO DE OPERAÇÕES", margin + colLogoW + 4, currentY + 6.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...corpTeal);
  const circTitle = isSeco
    ? "DIRETRIZES TÁTICAS: CIRCUITO SECO (COMINUIÇÃO & BRITAGEM)"
    : "DIRETRIZES TÁTICAS: CIRCUITO ÚMIDO (BENEFICIAMENTO & MOAGEM)";
  doc.text(circTitle, margin + colLogoW + 4, currentY + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(...corpSlateText);
  const circSub = isSeco
    ? "Escopo: Britagem Primária, Rebritagem, Pátios de ROM, Silos de Finos e Peneiramento"
    : "Escopo: Moagem, Flotação Cu, Espessamento, Filtragem Prensa/Desaguamento e ETA";
  doc.text(circSub, margin + colLogoW + 4, currentY + 17);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(5.8);
  doc.setTextColor(...corpSlateMuted);
  doc.text("Governança Operacional • Balanço Físico-Metalúrgico • Metas 24h / WTD / FDS / MTD", margin + colLogoW + 4, currentY + 21.5);

  // Coluna 3: Metadados Formais / Controle Documental (Restante da Largura)
  const colMetaX = margin + colLogoW + colTitleW;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.8);
  doc.setTextColor(...corpSlateMuted);
  doc.text("CÓDIGO DOC:", colMetaX + 3, currentY + 4.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...corpPrimary);
  doc.text(isSeco ? "RGE-OP-SEC-01" : "RGE-OP-UMI-02", colMetaX + 22, currentY + 4.5);

  doc.line(colMetaX, currentY + 6.2, margin + headerWidth, currentY + 6.2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.8);
  doc.setTextColor(...corpSlateMuted);
  doc.text("CLASSIFICAÇÃO:", colMetaX + 3, currentY + 9.5);
  doc.setFontSize(6);
  doc.setTextColor(180, 83, 9);
  doc.text("USO INTERNO / RESTRITO", colMetaX + 22, currentY + 9.5);

  doc.line(colMetaX, currentY + 11.2, margin + headerWidth, currentY + 11.2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.8);
  doc.setTextColor(...corpSlateMuted);
  doc.text("EMISSÃO / REV:", colMetaX + 3, currentY + 14.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(...corpSlateDark);
  doc.text(`${fmtData(dataEmissao)} | Rev. 01`, colMetaX + 22, currentY + 14.5);

  doc.line(colMetaX, currentY + 16.2, margin + headerWidth, currentY + 16.2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.8);
  doc.setTextColor(...corpSlateMuted);
  doc.text("PERÍODO REF:", colMetaX + 3, currentY + 19.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  doc.setTextColor(...corpTealDark);
  doc.text(periodoReferencia || "Semana Atual", colMetaX + 22, currentY + 19.5);

  currentY += headerHeight + 3.5;

  // =========================================================================
  // --- 2. PAINEL FORMAL DE IDENTIFICAÇÃO DOS RESPONSÁVEIS TÉCNICOS ---
  // =========================================================================
  const respHeight = 10;
  doc.setFillColor(...corpBgHeader);
  doc.setDrawColor(...corpBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, headerWidth, respHeight, 0.8, 0.8, "FD");

  const rColW = headerWidth / 3;

  // Resp 1: Supervisor ADM
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(...corpSlateMuted);
  doc.text("SUPERVISÃO DE OPERAÇÕES ADM:", margin + 3, currentY + 3.8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...corpPrimary);
  doc.text(supervisorAdmResponsavel || (isSeco ? "Supervisor ADM (Circuito Seco)" : "Supervisor ADM (Circuito Úmido)"), margin + 3, currentY + 7.8);

  doc.line(margin + rColW, currentY, margin + rColW, currentY + respHeight);

  // Resp 2: Engenharia de Processo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(...corpSlateMuted);
  doc.text("ENGENHARIA DE PROCESSO / METALURGIA:", margin + rColW + 3, currentY + 3.8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...corpPrimary);
  doc.text(engenheiroProcesso || (isSeco ? "Eng. de Cominuição & Britagem" : "Eng. de Processos & Metalurgia"), margin + rColW + 3, currentY + 7.8);

  doc.line(margin + rColW * 2, currentY, margin + rColW * 2, currentY + respHeight);

  // Resp 3: Gerência de Planta
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(...corpSlateMuted);
  doc.text("GERÊNCIA DE OPERAÇÕES & PLANTA:", margin + rColW * 2 + 3, currentY + 3.8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...corpPrimary);
  doc.text(gerentePlanta || "Gerência Geral de Beneficiamento", margin + rColW * 2 + 3, currentY + 7.8);

  currentY += respHeight + 5;

  // =========================================================================
  // --- 3. SEÇÃO 1: PAINEL DE DESEMPENHO FÍSICO-OPERACIONAL (REAL vs META) ---
  // =========================================================================
  drawFormalSectionHeader(
    "1.0",
    isSeco
      ? "BALANÇO FÍSICO-OPERACIONAL: CIRCUITO SECO (REALIZADO VS PROGRAMADO)"
      : "BALANÇO METALÚRGICO-OPERACIONAL: CIRCUITO ÚMIDO (REALIZADO VS PROGRAMADO)",
    "DESEMPENHO TÁTICO"
  );

  // Helper para cálculo de % atingimento e desvio
  const calcAtingimento = (real?: number | string | null, meta?: number | null) => {
    if (!real || !meta || typeof meta !== "number" || meta <= 0) return { pct: "-", desvio: "-", ok: true };
    const realNum = typeof real === "number" ? real : parseFloat(String(real).replace(/\./g, "").replace(",", "."));
    if (isNaN(realNum)) return { pct: "-", desvio: "-", ok: true };
    const pctVal = (realNum / meta) * 100;
    const diff = realNum - meta;
    const diffStr = diff >= 0 ? `+${diff.toLocaleString("pt-BR")}` : `${diff.toLocaleString("pt-BR")}`;
    return {
      pct: `${pctVal.toFixed(1)}%`,
      desvio: diffStr,
      ok: pctVal >= 95
    };
  };

  const tableDataOperacional = isSeco
    ? [
        [
          "Britagem Total (ROM + Rebritagem)",
          "Cominuição",
          `${br.producaoDiaTotal ? br.producaoDiaTotal.toLocaleString("pt-BR") : "-"} t`,
          `${br.metaProducaoDia ? br.metaProducaoDia.toLocaleString("pt-BR") : "-"} t`,
          calcAtingimento(br.producaoDiaTotal, br.metaProducaoDia).pct,
          `${br.producaoSemanaAcum ? br.producaoSemanaAcum.toLocaleString("pt-BR") : "-"} t`,
          `${br.metaProducaoSemana ? br.metaProducaoSemana.toLocaleString("pt-BR") : "-"} t`,
          `${br.producaoMesAcum ? br.producaoMesAcum.toLocaleString("pt-BR") : "-"} t`,
          `${br.metaProducaoMes ? br.metaProducaoMes.toLocaleString("pt-BR") : "-"} t`
        ],
        [
          "Taxa Alimentação Britagem Primária",
          "Britagem",
          `${br.taxaBritagem || "-"} t/h`,
          `${br.metaTaxaBritagem || "-"} t/h`,
          calcAtingimento(br.taxaBritagem, br.metaTaxaBritagem).pct,
          "-",
          "-",
          "-",
          "-"
        ],
        [
          "Disponibilidade / Utilização Física",
          "Britagem",
          `${br.disponibilidadeBritagem || "-"}% / ${br.utilizacaoBritagem || "-"}%`,
          "88,0% / 82,0%",
          "Conforme",
          "-",
          "-",
          "-",
          "-"
        ],
        [
          "Rebritagem Total (Bypass + Pátio)",
          "Rebritagem",
          `${br.producaoTotalRebritagem ? br.producaoTotalRebritagem.toLocaleString("pt-BR") : "-"} t`,
          "12.000 t",
          calcAtingimento(br.producaoTotalRebritagem, 12000).pct,
          "-",
          "-",
          "-",
          "-"
        ],
        [
          "Produtividade / Retido Peneira 1/2''",
          "Rebritagem",
          `${br.produtividadeRebritagem || "-"} t/h (${br.retidoMeiaPol || "-"}%)`,
          "1.020 t/h (≤ 12%)",
          "Em Meta",
          "-",
          "-",
          "-",
          "-"
        ],
        [
          "Posição do Manto / Aferição do Britador",
          "Equipamentos",
          `${br.posicaoManto || "-"} (${br.afericaoBritador || "-"})`,
          "35% (Calibrado)",
          "Monitorado",
          "-",
          "-",
          "-",
          "-"
        ],
        [
          "Estoques Totais ROM: MSB + Sur + Verm",
          "Pátios / ROM",
          `${br.estoqueTotalRom ? br.estoqueTotalRom.toLocaleString("pt-BR") : "-"} t`,
          "25.000 t",
          calcAtingimento(br.estoqueTotalRom, 25000).pct,
          `MSB: ${br.estoqueMsb || "-"} t`,
          `Sur: ${br.estoqueSurubim || "-"} t`,
          "-",
          "-"
        ],
        [
          "Pilha Intermediária / Pulmão Finos",
          "Autonomia",
          `${br.pilhaIntermediaria ? br.pilhaIntermediaria.toLocaleString("pt-BR") : "-"} t`,
          "10.000 t",
          "Autonomia OK",
          "-",
          "-",
          "-",
          "-"
        ]
      ]
    : [
        [
          "Alimentação Moagem (Tratamento Planta)",
          "Moagem",
          `${ce.producaoMoagemDia ? ce.producaoMoagemDia.toLocaleString("pt-BR") : "-"} t`,
          `${ce.metaProducaoMoagemDia ? ce.metaProducaoMoagemDia.toLocaleString("pt-BR") : "-"} t`,
          calcAtingimento(ce.producaoMoagemDia, ce.metaProducaoMoagemDia).pct,
          `${ce.producaoMoagemSemana ? ce.producaoMoagemSemana.toLocaleString("pt-BR") : "-"} t`,
          `${ce.metaProducaoMoagemSemana ? ce.metaProducaoMoagemSemana.toLocaleString("pt-BR") : "-"} t`,
          `${ce.producaoMoagemMes ? ce.producaoMoagemMes.toLocaleString("pt-BR") : "-"} t`,
          `${ce.metaProducaoMoagemMes ? ce.metaProducaoMoagemMes.toLocaleString("pt-BR") : "-"} t`
        ],
        [
          "Cobre Contido Líquido Produzido",
          "Metalurgia",
          `${ce.metalContidoDia || "-"} t Cu`,
          `${ce.metaMetalContidoDia || "-"} t Cu`,
          calcAtingimento(ce.metalContidoDia, ce.metaMetalContidoDia).pct,
          `${ce.metalContidoSemana || "-"} t Cu`,
          `${ce.metaMetalContidoSemana || "-"} t Cu`,
          `${ce.metalContidoMes || "-"} t Cu`,
          `${ce.metaMetalContidoMes || "-"} t Cu`
        ],
        [
          "Taxa Total Moagem / Granulometria P80",
          "Moagem",
          `${ce.taxaTotalMoagem || "-"} t/h (${ce.granulometria105 || "-"}%)`,
          "605 t/h (≥ 62%)",
          "Em Meta",
          "-",
          "-",
          "-",
          "-"
        ],
        [
          "Recuperação Metalúrgica Global Cu",
          "Flotação",
          `${ce.recuperacaoMetalurgica || "-"}%`,
          `${ce.metaRecuperacao || "-"}%`,
          calcAtingimento(ce.recuperacaoMetalurgica, ce.metaRecuperacao).pct,
          `${ce.recuperacaoMetalurgica || "-"}%`,
          `${ce.metaRecuperacao || "-"}%`,
          `${ce.recuperacaoMetalurgica || "-"}%`,
          `${ce.metaRecuperacao || "-"}%`
        ],
        [
          "Teores: Alimentação / Conc. / Rejeito",
          "Flotação",
          `${ce.teorAlimentacaoCu || "-"}% / ${ce.teorConcentradoCu || "-"}% / ${ce.teorRejeitoCu || "-"}%`,
          "1,28% / 33,5% / 0,10%",
          "Conforme",
          "-",
          "-",
          "-",
          "-"
        ],
        [
          "Autonomia de Finos: Silos + Pátio",
          "Alimentação",
          `${ce.autonomiaMinérioHoras || "-"} h (${ce.autonomiaMinérioToneladas ? ce.autonomiaMinérioToneladas.toLocaleString("pt-BR") : "-"} t)`,
          "24,0 h (8.000 t)",
          "Estável",
          "-",
          "-",
          "-",
          "-"
        ],
        [
          "Umidade Bolo Filtro Prensa / Ciclos",
          "Filtragem",
          `${ce.umidadeBolo || "-"}% (${ce.ciclosFiltro || "-"} ciclos)`,
          `≤ ${ce.metaUmidadeBolo || "9,5"}% (26 ciclos)`,
          "Aderente",
          "-",
          "-",
          "-",
          "-"
        ],
        [
          "ETA: Taxa de Reuso / Recirculação Hídrica",
          "Rec. Hídricos",
          `${ce.taxaRecirculacaoReuso || "-"}% (Turb: ${ce.turbidezAguaTratadaNtu || "-"} NTU)`,
          `≥ ${ce.metaRecirculacao || "85"}% (≤ 2,0 NTU)`,
          "Conforme",
          "-",
          "-",
          "-",
          "-"
        ]
      ];

  autoTable(doc, {
    startY: currentY,
    head: [
      [
        { content: "Variável / Indicador de Processo", styles: { halign: "left" } },
        { content: "Área", styles: { halign: "left" } },
        { content: "Realizado Dia", styles: { halign: "center" } },
        { content: "Meta Dia", styles: { halign: "center" } },
        { content: "Ating. (%)", styles: { halign: "center" } },
        { content: "Acum. Semana", styles: { halign: "center" } },
        { content: "Meta Sem.", styles: { halign: "center" } },
        { content: "Acum. Mês", styles: { halign: "center" } },
        { content: "Meta Mês", styles: { halign: "center" } },
      ]
    ],
    body: tableDataOperacional,
    theme: "grid",
    headStyles: {
      fillColor: [...corpPrimary],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 6.5,
      cellPadding: 1.8,
      lineWidth: 0.2,
      lineColor: [...corpBorder],
    },
    styles: {
      fontSize: 6.2,
      cellPadding: 1.4,
      textColor: [...corpSlateDark],
      valign: "middle",
      lineColor: [...corpBorder],
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 44, fontStyle: "bold" },
      1: { cellWidth: 18, fontStyle: "normal", textColor: [...corpSlateText] },
      2: { cellWidth: 20, halign: "center", fontStyle: "bold" },
      3: { cellWidth: 17, halign: "center", textColor: [...corpSlateMuted] },
      4: { cellWidth: 15, halign: "center", fontStyle: "bold" },
      5: { cellWidth: 20, halign: "center", fontStyle: "bold" },
      6: { cellWidth: 17, halign: "center", textColor: [...corpSlateMuted] },
      7: { cellWidth: 20, halign: "center", fontStyle: "bold" },
      8: { cellWidth: 19, halign: "center", textColor: [...corpSlateMuted] },
    },
    didParseCell: function(data) {
      if (data.section === "body") {
        if (data.row.index === 0 || data.row.index === 1) {
          data.cell.styles.fillColor = [...corpTealLight];
          if ([0, 2, 4, 5, 7].includes(data.column.index)) {
            data.cell.styles.textColor = [...corpTealDark];
          }
        }
      }
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // =========================================================================
  // --- 4. SEÇÃO 2: DIRECIONAMENTO ESTRATÉGICO POR HORIZONTE DE GESTÃO ---
  // =========================================================================
  drawFormalSectionHeader(
    "2.0",
    "DIRECIONAMENTO ESTRATÉGICO & BALIZAMENTO POR HORIZONTE DE PLANEJAMENTO",
    "GOVERNANÇA TÁTICA (24H • WTD • FDS • MTD)"
  );

  const horizontesConfig = [
    {
      codigo: "HORIZONTE 24H",
      titulo: "PLANO OPERACIONAL DO DIA (24 HORAS)",
      data: estrategiaDia,
      corBorda: [13, 148, 136] as [number, number, number],
      corHeader: [15, 118, 110] as [number, number, number],
      corFundo: [240, 253, 250] as [number, number, number],
      badge: "DIÁRIO",
    },
    {
      codigo: "HORIZONTE WTD",
      titulo: "ESTRATÉGIA DA SEMANA (WEEK TO DATE)",
      data: estrategiaSemana,
      corBorda: [59, 130, 246] as [number, number, number],
      corHeader: [29, 78, 216] as [number, number, number],
      corFundo: [239, 246, 255] as [number, number, number],
      badge: "SEMANAL",
    },
    {
      codigo: "HORIZONTE FDS",
      titulo: "BLINDAGEM OPERACIONAL & PLANTÃO DE FINAL DE SEMANA",
      data: estrategiaFds,
      corBorda: [245, 158, 11] as [number, number, number],
      corHeader: [180, 83, 9] as [number, number, number],
      corFundo: [254, 243, 199] as [number, number, number],
      badge: "PLANTÃO FDS",
    },
    {
      codigo: "HORIZONTE MTD",
      titulo: "PLANEJAMENTO MENSAL & FORECAST (MONTH TO DATE)",
      data: estrategiaMes,
      corBorda: [139, 92, 246] as [number, number, number],
      corHeader: [109, 40, 217] as [number, number, number],
      corFundo: [245, 243, 255] as [number, number, number],
      badge: "MENSAL",
    }
  ];

  horizontesConfig.forEach(hz => {
    const d = hz.data;
    const boxWidth = pageWidth - margin * 2;
    const contentWidth = boxWidth - 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    const focoText = `• Diretriz Principal & Foco Tático: ${d.focoPrincipal || "Alinhamento operacional regular conforme programa de produção."}`;
    const splitFoco = doc.splitTextToSize(focoText, contentWidth);

    let metasText = "";
    if (isSeco) {
      metasText = `• Balizamento Numérico: Britagem ROM: ${d.metaAlimentacaoBritagem ? d.metaAlimentacaoBritagem.toLocaleString("pt-BR") : "-"} t | Taxa Alimentação: ${d.metaTaxaHoraria || "-"} t/h | Disponibilidade: ${d.metaDisponibilidade || "-"}%`;
    } else {
      metasText = `• Balizamento Numérico: Moagem Planta: ${d.metaAlimentacaoMoagem ? d.metaAlimentacaoMoagem.toLocaleString("pt-BR") : "-"} t | Metal Cu Contido: ${d.metaProducaoCobreContido || "-"} t Cu | Rec. Global: ${d.metaRecuperacao || "-"}%`;
    }
    const splitMetas = doc.splitTextToSize(metasText, contentWidth);

    const dirsList = (d.diretrizesPrioritarias || []).filter(x => x && x.trim().length > 0);
    const dirsFormatted = dirsList.length > 0
      ? dirsList.map((dir, idx) => `  [${idx + 1}] ${dir}`).join("\n")
      : "  [1] Executar rotinas padrão de SSMA e controle de processo.";
    const splitDirs = doc.splitTextToSize(`• Procedimentos & Diretrizes Prioritárias:\n${dirsFormatted}`, contentWidth);

    let extraText = "";
    if (d.recursosManutencao) {
      extraText += `• Intervenções de Manutenção / Gestão de Ativos: ${d.recursosManutencao}\n`;
    }
    if (d.alertasOperacionais && d.alertasOperacionais.length > 0) {
      extraText += `• Pontos Críticos & Gerenciamento de Risco: ${d.alertasOperacionais.join("; ")}\n`;
    }
    if (d.planoBlindagemFds) {
      extraText += `• Protocolo Formal de Blindagem FDS: ${d.planoBlindagemFds}\n`;
    }
    const splitExtra = extraText ? doc.splitTextToSize(extraText.trim(), contentWidth) : [];

    const lineH = 3.3;
    const headerH = 6;
    const totalLines = splitFoco.length + splitMetas.length + splitDirs.length + splitExtra.length;
    const calculatedHeight = headerH + (totalLines * lineH) + 4;

    checkPageBreak(calculatedHeight + 2);

    // Moldura do Cartão
    doc.setFillColor(hz.corFundo[0], hz.corFundo[1], hz.corFundo[2]);
    doc.setDrawColor(hz.corBorda[0], hz.corBorda[1], hz.corBorda[2]);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, currentY, boxWidth, calculatedHeight, 1, 1, "FD");

    // Filete Indicador
    doc.setFillColor(hz.corBorda[0], hz.corBorda[1], hz.corBorda[2]);
    doc.rect(margin, currentY, 3, calculatedHeight, "F");

    // Cabeçalho do Cartão
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(hz.corHeader[0], hz.corHeader[1], hz.corHeader[2]);
    doc.text(`${hz.codigo}: ${hz.titulo}`, margin + 5, currentY + 4.2);

    let innerY = currentY + 7.5;

    // Foco
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.8);
    doc.setTextColor(...corpSlateDark);
    doc.text(splitFoco, margin + 5, innerY);
    innerY += splitFoco.length * lineH;

    // Metas
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...corpSlateText);
    doc.text(splitMetas, margin + 5, innerY);
    innerY += splitMetas.length * lineH;

    // Diretrizes
    doc.setFont("helvetica", "normal");
    doc.text(splitDirs, margin + 5, innerY);
    innerY += splitDirs.length * lineH;

    // Extra
    if (splitExtra.length > 0) {
      doc.setFont("helvetica", "bolditalic");
      doc.setTextColor(...corpTealDark);
      doc.text(splitExtra, margin + 5, innerY);
    }

    currentY += calculatedHeight + 3.5;
  });

  currentY += 2;

  // =========================================================================
  // --- 5. SEÇÃO 3: MATRIZ TÁTICA DE DIRETRIZES & RESPONSABILIDADES (RACI) ---
  // =========================================================================
  drawFormalSectionHeader(
    "3.0",
    "MATRIZ DE DIRETRIZES TÁTICAS & PLANO DE AÇÃO PARA SUPERVISÕES DE TURNO",
    "CONTROLE DE EXECUÇÃO & PRAZOS"
  );

  const tableDataDiretrizes = (diretrizesTurno || []).map((d, index) => {
    const prioLabel = d.prioridade === "critica" ? "CRÍTICA (P1)" : d.prioridade === "alta" ? "ALTA (P2)" : "MÉDIA (P3)";
    const statusLabel = d.status === "concluido" ? "CONCLUÍDO" : d.status === "em_andamento" ? "EM EXECUÇÃO" : "PENDENTE";
    const codAcao = `ACT-${String(index + 1).padStart(2, "0")}`;

    return [
      `${codAcao}\n${d.setor}`,
      d.acaoEstrategica || "-",
      `${d.responsavelTurma}\n${d.supervisorNome || "-"}`,
      d.prazoLimite || "Turno Vigente",
      prioLabel,
      d.metaEsperada || "-",
      statusLabel
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [
      [
        { content: "Código / Setor", styles: { halign: "left" } },
        { content: "Ação Estratégica / Procedimento de Turno", styles: { halign: "left" } },
        { content: "Turma / Supervisor", styles: { halign: "left" } },
        { content: "Prazo Limite", styles: { halign: "center" } },
        { content: "Prioridade", styles: { halign: "center" } },
        { content: "Critério de Aceite / Meta", styles: { halign: "left" } },
        { content: "Status", styles: { halign: "center" } },
      ]
    ],
    body: tableDataDiretrizes.length > 0 ? tableDataDiretrizes : [
      ["ACT-00\nGeral", "Cumprir as diretrizes gerais de SSMA e parâmetros operacionais de turno.", "Todas as Turmas", "Turno Vigente", "MÉDIA (P3)", "100% de Aderência", "EM EXECUÇÃO"]
    ],
    theme: "grid",
    headStyles: {
      fillColor: [...corpPrimary],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 6.5,
      cellPadding: 1.8,
      lineColor: [...corpBorder],
      lineWidth: 0.2,
    },
    styles: {
      fontSize: 6.2,
      cellPadding: 1.5,
      textColor: [...corpSlateDark],
      valign: "middle",
      lineColor: [...corpBorder],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: "bold" },
      1: { cellWidth: 54 },
      2: { cellWidth: 26 },
      3: { cellWidth: 20, halign: "center", fontStyle: "bold" },
      4: { cellWidth: 18, halign: "center" },
      5: { cellWidth: 28 },
      6: { cellWidth: 22, halign: "center", fontStyle: "bold" },
    },
    didParseCell: function(data) {
      if (data.section === "body") {
        if (data.column.index === 4) {
          const val = String(data.cell.raw);
          if (val.includes("CRÍTICA")) {
            data.cell.styles.textColor = [185, 28, 28];
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [254, 242, 242];
          } else if (val.includes("ALTA")) {
            data.cell.styles.textColor = [194, 65, 12];
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [255, 247, 237];
          }
        }
        if (data.column.index === 6) {
          const val = String(data.cell.raw);
          if (val === "CONCLUÍDO") {
            data.cell.styles.textColor = [13, 148, 136];
            data.cell.styles.fillColor = [240, 253, 250];
          } else if (val === "EM EXECUÇÃO") {
            data.cell.styles.textColor = [37, 99, 235];
            data.cell.styles.fillColor = [239, 246, 255];
          }
        }
      }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // =========================================================================
  // --- 6. SEÇÃO 4: GESTÃO DE RESTRIÇÕES, GARGALOS & PLANO DE CONTINGÊNCIA ---
  // =========================================================================
  drawFormalSectionHeader(
    "4.0",
    "ANÁLISE DE RESTRIÇÕES OPERACIONAIS, GARGALOS E PLANO DE CONTINGÊNCIA ADM",
    "GESTÃO DE RISCO OPERACIONAL"
  );

  const boxWidth = pageWidth - margin * 2;
  const contentWidth = boxWidth - 8;

  const gargalosTexto = isSeco
    ? br.gargalosAtuais || "Operação do circuito seco sem restrições ou desvios limitantes declarados."
    : ce.gargalosAtuais || "Circuito úmido operando em regime regular sem gargalos críticos no momento.";

  const gargalosFull = `• Diagnóstico de Gargalos & Restrições (${isSeco ? "Circuito Seco - Cominuição" : "Circuito Úmido - Beneficiamento"}):\n  ${gargalosTexto}`;
  const splitGarg = doc.splitTextToSize(gargalosFull, contentWidth);

  const contingFull = `• Plano de Contingência & Recomendações Estratégicas da Supervisão ADM:\n  ${observacoesGerais || "Cumprir rigorosamente os padrões operacionais, monitorar taxas horárias, estabilidade de pilhas/silos e acionar imediatamente a manutenção em caso de anomalia."}`;
  const splitConting = doc.splitTextToSize(contingFull, contentWidth);

  const sec4Lines = splitGarg.length + splitConting.length;
  const sec4Height = (sec4Lines * 3.3) + 7;

  checkPageBreak(sec4Height + 2);

  doc.setFillColor(...corpBgHeader);
  doc.setDrawColor(...corpBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, boxWidth, sec4Height, 1, 1, "FD");

  doc.setFillColor(...corpTeal);
  doc.rect(margin, currentY, 3, sec4Height, "F");

  let sec4Y = currentY + 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(...corpTealDark);
  doc.text(splitGarg, margin + 5, sec4Y);
  sec4Y += splitGarg.length * 3.3 + 1.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(...corpSlateDark);
  doc.text(splitConting, margin + 5, sec4Y);

  currentY += sec4Height + 8;

  // =========================================================================
  // --- 7. PROTOCOLO FORMAL DE VALIDAÇÃO TÉCNICA E APROVAÇÃO GERENCIAL ---
  // =========================================================================
  checkPageBreak(25);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...corpBorder);
  doc.setLineWidth(0.3);
  doc.rect(margin, currentY, boxWidth, 22, "FD");

  doc.setFillColor(...corpBgHeader);
  doc.rect(margin, currentY, boxWidth, 5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  doc.setTextColor(...corpPrimary);
  doc.text("PROTOCOLO DE VALIDAÇÃO TÉCNICA E APROVAÇÃO GERENCIAL (GOVERNANÇA OPERACIONAL)", margin + 3, currentY + 3.5);

  const signWidth = boxWidth / 3;

  // Campo 1: Supervisor ADM
  doc.setDrawColor(...corpBorder);
  doc.line(margin + 5, currentY + 14.5, margin + signWidth - 5, currentY + 14.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(...corpSlateDark);
  doc.text(supervisorAdmResponsavel || (isSeco ? "Supervisor ADM (Circuito Seco)" : "Supervisor ADM (Circuito Úmido)"), margin + signWidth / 2, currentY + 17.5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(...corpSlateMuted);
  doc.text("Supervisão de Operações ADM", margin + signWidth / 2, currentY + 20.5, { align: "center" });

  doc.line(margin + signWidth, currentY + 5, margin + signWidth, currentY + 22);

  // Campo 2: Engenheiro de Processos
  doc.line(margin + signWidth + 5, currentY + 14.5, margin + signWidth * 2 - 5, currentY + 14.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(...corpSlateDark);
  doc.text(engenheiroProcesso || (isSeco ? "Engenharia de Cominuição" : "Engenharia de Processos"), margin + signWidth * 1.5, currentY + 17.5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(...corpSlateMuted);
  doc.text("Engenharia de Processos & Metalurgia", margin + signWidth * 1.5, currentY + 20.5, { align: "center" });

  doc.line(margin + signWidth * 2, currentY + 5, margin + signWidth * 2, currentY + 22);

  // Campo 3: Gerência de Operações
  doc.line(margin + signWidth * 2 + 5, currentY + 14.5, margin + signWidth * 3 - 5, currentY + 14.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(...corpSlateDark);
  doc.text(gerentePlanta || "Gerência Geral de Operações", margin + signWidth * 2.5, currentY + 17.5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(...corpSlateMuted);
  doc.text("Gerência de Planta & Operações Industriais", margin + signWidth * 2.5, currentY + 20.5, { align: "center" });

  // =========================================================================
  // --- 8. CABEÇALHO SUPERIOR (A PARTIR DA PÁGINA 2) & RODAPÉ FORMAL ---
  // =========================================================================
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Running Header a partir da Página 2
    if (i > 1) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(...corpSlateMuted);
      doc.text("ERO BRASIL • MINERAÇÃO CARAÍBA S/A", margin, margin - 1.5);
      
      const docHeaderRun = isSeco
        ? "RELATÓRIO GERENCIAL ESTRATÉGICO • CIRCUITO SECO (RGE-OP-SEC-01)"
        : "RELATÓRIO GERENCIAL ESTRATÉGICO • CIRCUITO ÚMIDO (RGE-OP-UMI-02)";
      doc.text(docHeaderRun, pageWidth - margin, margin - 1.5, { align: "right" });

      doc.setDrawColor(...corpBorder);
      doc.setLineWidth(0.2);
      doc.line(margin, margin, pageWidth - margin, margin);
    }

    // Rodapé Formal em Todas as Páginas (Padrão Vale / Corporativo)
    doc.setDrawColor(...corpBorder);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 8.5, pageWidth - margin, pageHeight - 8.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(...corpTealDark);
    doc.text("ERO BRASIL", margin, pageHeight - 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(...corpSlateMuted);
    const circuitoNome = isSeco ? "Circuito Seco (Cominuição)" : "Circuito Úmido (Beneficiamento)";
    doc.text(
      ` | Planta Cobre • Gestão Estratégica ADM — ${circuitoNome} • Emissão: ${fmtData(dataEmissao)} • Classificação: USO INTERNO`,
      margin + 15,
      pageHeight - 4.5
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(...corpSlateDark);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - margin,
      pageHeight - 4.5,
      { align: "right" }
    );
  }

  // Download do Arquivo PDF Formatado
  const cleanDate = (dataEmissao || "2026").replace(/[^0-9]/g, "_");
  const fileName = isSeco
    ? `EroBrasil_RGE_Circuito_Seco_Cominuicao_${cleanDate}.pdf`
    : `EroBrasil_RGE_Circuito_Umido_Beneficiamento_${cleanDate}.pdf`;
  doc.save(fileName);
}
