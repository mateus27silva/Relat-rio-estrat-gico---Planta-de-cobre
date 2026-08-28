/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  RelatorioAdmPayload,
  EstrategiaPorHorizonte,
  fmtData,
  detectarDesviosBritagem,
  calcularCartasControleBritagem,
  EstatisticaCartaControle,
  CONFIG_PARAMETROS_BRITAGEM,
  DADOS_DIARIOS_BRITAGEM_PADRAO,
  obterLeituraAtualBritagem,
  obterAcaoEstrategicaBritagem,
  parseNumeroBritagem,
  CONFIG_PARAMETROS_REBRITAGEM,
  DADOS_DIARIOS_REBRITAGEM_PADRAO,
  obterLeituraAtualRebritagem,
  obterAcaoEstrategicaRebritagem,
  calcularCartasControleRebritagem,
  EstatisticaCartaControleRebritagem,
  obterDiasAlocadosNumeros,
  normalizarAlocacaoTurnos,
  formatarResumoAlocacao,
  DIAS_CHAVES_GANTT,
  DiretrizSupervisorTurno
} from "../typesAdm";

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
    estrategiaParada,
    estrategiaMes,
    diretrizesTurno,
    observacoesGerais,
    secoesVisiveis,
  } = payload;

  const sec = {
    responsaveisTecnicos: secoesVisiveis?.responsaveisTecnicos !== false,
    balancoOperacional: secoesVisiveis?.balancoOperacional !== false,
    horizonteDia: secoesVisiveis?.horizonteDia !== false,
    horizonteSemana: secoesVisiveis?.horizonteSemana !== false,
    horizonteFds: secoesVisiveis?.horizonteFds !== false,
    horizonteParada: secoesVisiveis?.horizonteParada !== false,
    horizonteMes: secoesVisiveis?.horizonteMes !== false,
    matrizDiretrizes: secoesVisiveis?.matrizDiretrizes !== false,
    cronogramaGantt: secoesVisiveis?.cronogramaGantt !== false,
    diagnosticoGargalos: secoesVisiveis?.diagnosticoGargalos !== false,
    planoContingencia: secoesVisiveis?.planoContingencia !== false,
  };

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

    const barW = pageWidth - margin * 2;
    const barH = 6.5;

    // Barra de Fundo Corporativo
    doc.setFillColor(...corpPrimary);
    doc.rect(margin, currentY, barW, barH, "F");

    // Filete Indicador
    doc.setFillColor(...corpTeal);
    doc.rect(margin, currentY, 3, barH, "F");

    // Tag Lateral (se houver) com medição de largura para reservar espaço
    let reservedRightW = 0;
    if (subTag) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.8);
      const tagUpper = subTag.toUpperCase();
      const tagW = doc.getTextWidth(tagUpper);
      reservedRightW = tagW + 6;
      doc.setTextColor(167, 243, 208);
      doc.text(tagUpper, pageWidth - margin - 4, currentY + 4.3, { align: "right" });
    }

    // Código da Seção e Título com redimensionamento dinâmico
    const maxTitleW = barW - 10 - reservedRightW;
    const fullTitle = `${code}  ${title}`;

    let titleFontSize = 7.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(titleFontSize);
    while (doc.getTextWidth(fullTitle) > maxTitleW && titleFontSize > 5.2) {
      titleFontSize -= 0.2;
      doc.setFontSize(titleFontSize);
    }

    doc.setTextColor(255, 255, 255);
    doc.text(fullTitle, margin + 5, currentY + 4.3);

    currentY += barH + 2.0;
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

  // Coluna 1: Logo & Unidade (Largura: 42mm)
  const colLogoW = 42;
  doc.setDrawColor(...corpBorder);
  doc.setLineWidth(0.3);
  doc.line(margin + colLogoW, currentY, margin + colLogoW, currentY + headerHeight);

  // Logo Ero Brasil Box
  doc.setFillColor(...corpPrimary);
  doc.roundedRect(margin + 4, currentY + 3.5, 34, 7, 0.8, 0.8, "F");
  doc.setFont("helvetica", "black");
  doc.setFontSize(8.5);
  doc.setTextColor(20, 184, 166);
  doc.text("ERO", margin + 6.5, currentY + 8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("BRASIL", margin + 15, currentY + 8.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(...corpSlateDark);
  doc.text("COMPLEXO INDUSTRIAL COBRE", margin + 4, currentY + 14.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(...corpSlateMuted);
  doc.text("ONEEro - Caraíba", margin + 4, currentY + 18);
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
  doc.text("Governança Operacional • Balanço Físico-Metalúrgico • Metas WTD / FDS / MTD", margin + colLogoW + 4, currentY + 21.5);

  // Coluna 3: Metadados Formais / Controle Documental (Restante da Largura)
  const colMetaX = margin + colLogoW + colTitleW;
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.8);
    doc.setTextColor(...corpSlateMuted);
    doc.text("REVISÃO:", colMetaX + 3, currentY + 4.5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.2);
    doc.setTextColor(...corpPrimary);
    doc.text("Revisão 01", colMetaX + 18, currentY + 4.5);

    doc.line(colMetaX, currentY + 6.2, margin + headerWidth, currentY + 6.2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.8);
    doc.setTextColor(...corpSlateMuted);
    doc.text("CLASSIFICAÇÃO:", colMetaX + 3, currentY + 9.5);
    doc.setFontSize(5.8);
    doc.setTextColor(180, 83, 9);
    doc.text("USO INTERNO / RESTRITO", colMetaX + 22, currentY + 9.5);

    doc.line(colMetaX, currentY + 11.2, margin + headerWidth, currentY + 11.2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.8);
    doc.setTextColor(...corpSlateMuted);
    doc.text("EMISSÃO:", colMetaX + 3, currentY + 14.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.0);
    doc.setTextColor(...corpSlateDark);
    doc.text(fmtData(dataEmissao), colMetaX + 18, currentY + 14.5);

    doc.line(colMetaX, currentY + 16.2, margin + headerWidth, currentY + 16.2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.6);
    doc.setTextColor(...corpSlateMuted);
    doc.text("PERÍODO REF:", colMetaX + 3, currentY + 19.5);

    const periodoStr = periodoReferencia || "Semana Atual";
    let perFontSize = 5.6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(perFontSize);
    const maxValWidth = (headerWidth - (colLogoW + colTitleW)) - 20;
    while (doc.getTextWidth(periodoStr) > maxValWidth && perFontSize > 4.0) {
      perFontSize -= 0.2;
      doc.setFontSize(perFontSize);
    }
    doc.setTextColor(...corpTealDark);
    doc.text(periodoStr, colMetaX + 18, currentY + 19.5);

  currentY += headerHeight + 3.5;

  // =========================================================================
  // --- 2. PAINEL FORMAL DE IDENTIFICAÇÃO DOS RESPONSÁVEIS TÉCNICOS ---
  // =========================================================================
  if (sec.responsaveisTecnicos) {
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
  }

  // =========================================================================
  // --- 3. SEÇÃO 1: MONITORAMENTO BRITADOR (SECO) / BALANÇO METALÚRGICO (ÚMIDO) ---
  // =========================================================================
  if (sec.balancoOperacional) {
    if (isSeco) {
      drawFormalSectionHeader(
        "1.0",
        "MONITORAMENTO OPERACIONAL E MECÂNICO: BRITADOR PRIMÁRIO (41BR001 / 41TC001)",
        "CONTROLE OPERACIONAL & MECÂNICO"
      );

      const tableDataBritadorPdf = CONFIG_PARAMETROS_BRITAGEM.map(param => {
        const infoLeitura = obterLeituraAtualBritagem(br, param);
        const numVal = infoLeitura.numVal;
        const leituraFormatada = infoLeitura.leituraFormatada;

        let statusLabel = "-";
        if (numVal !== null && !isNaN(numVal)) {
          if (numVal < param.minIdeal || numVal > param.maxIdeal) {
            const deltaRel = Math.max(param.minIdeal - numVal, numVal - param.maxIdeal) / ((param.maxIdeal - param.minIdeal) || 1);
            statusLabel = deltaRel > 0.25 ? "Crítico / Desvio" : "Atenção / Desvio";
          } else {
            statusLabel = "Conforme";
          }
        }

        const faixaIdeal = `${param.decimais > 0 ? param.minIdeal.toFixed(param.decimais).replace(".", ",") : param.minIdeal} - ${param.decimais > 0 ? param.maxIdeal.toFixed(param.decimais).replace(".", ",") : param.maxIdeal} ${param.unidade}`;
        const acaoEstrategica = obterAcaoEstrategicaBritagem(br, param);

        return [
          param.nome,
          param.equipamento,
          param.subsistema,
          leituraFormatada || "-",
          faixaIdeal,
          statusLabel,
          acaoEstrategica || "-"
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [
          [
            { content: "Variável / Indicador de Processo", styles: { halign: "left" } },
            { content: "Equipamento", styles: { halign: "center" } },
            { content: "Subsistema", styles: { halign: "left" } },
            { content: "Leitura Atual", styles: { halign: "center" } },
            { content: "Faixa Operacional", styles: { halign: "center" } },
            { content: "Status / Condição", styles: { halign: "center" } },
            { content: "Ação estratégica", styles: { halign: "left" } },
          ]
        ],
        body: tableDataBritadorPdf,
        theme: "grid",
        headStyles: {
          fillColor: [...corpPrimary],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 6.2,
          cellPadding: 1.5,
          lineWidth: 0.2,
          lineColor: [...corpBorder],
        },
        styles: {
          fontSize: 5.8,
          cellPadding: 1.2,
          textColor: [...corpSlateDark],
          valign: "middle",
          lineColor: [...corpBorder],
          lineWidth: 0.2,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 38, fontStyle: "bold" },
          1: { cellWidth: 18, halign: "center", fontStyle: "bold", textColor: [30, 58, 138] },
          2: { cellWidth: 26, fontStyle: "normal", textColor: [...corpSlateText] },
          3: { cellWidth: 18, halign: "center", fontStyle: "bold", textColor: [...corpTealDark] },
          4: { cellWidth: 22, halign: "center", textColor: [...corpSlateMuted] },
          5: { cellWidth: 22, halign: "center", fontStyle: "bold" },
          6: { cellWidth: "auto", halign: "left", fontSize: 5.5, textColor: [...corpSlateText] },
        },
        didParseCell: function(data) {
          if (data.section === "body" && data.column.index === 5) {
            const val = String(data.cell.raw);
            if (val.includes("Crítico")) {
              data.cell.styles.textColor = [190, 18, 60];
              data.cell.styles.fillColor = [255, 241, 242];
            } else if (val.includes("Atenção")) {
              data.cell.styles.textColor = [180, 83, 9];
              data.cell.styles.fillColor = [254, 243, 199];
            } else if (val.includes("Conforme")) {
              data.cell.styles.textColor = [4, 120, 87];
              data.cell.styles.fillColor = [236, 253, 245];
            } else {
              data.cell.styles.textColor = [148, 163, 184];
              data.cell.styles.fillColor = [248, 250, 252];
            }
          }
        },
        margin: { left: margin, right: margin },
      });

      currentY = (doc as any).lastAutoTable.finalY + 3.5;

      const histDiario = br.historicoDiarioBritagem && br.historicoDiarioBritagem.length === 7
        ? br.historicoDiarioBritagem
        : DADOS_DIARIOS_BRITAGEM_PADRAO;

      const estatisticasCartas = calcularCartasControleBritagem(histDiario);

      // Título da Seção de Cartas de Controle CEP
      checkPageBreak(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.2);
      doc.setTextColor(...corpPrimary);
      doc.text("1.1 CARTAS DE CONTROLE ESTATÍSTICO (CEP) & MONITORAMENTO INDIVIDUAL (41BR001 / 41TC001):", margin, currentY);
      currentY += 2.5;

      // Renderiza as Cartas de Controle Individuais (2 por linha) para cada um dos 14 itens
      const fullW = pageWidth - margin * 2;
      const chartW = (fullW - 4) / 2; // ~93mm
      const chartH = 28; // mm
      const dayLabelsMin = ["S", "T", "Q", "Q", "S", "S", "D"];

      for (let idx = 0; idx < estatisticasCartas.length; idx += 2) {
        checkPageBreak(chartH + 3);

        // Item da esquerda
        const stat1 = estatisticasCartas[idx];
        renderCartaControlePdf(doc, margin, currentY, chartW, chartH, stat1, idx + 1, dayLabelsMin);

        // Item da direita (se houver)
        if (idx + 1 < estatisticasCartas.length) {
          const stat2 = estatisticasCartas[idx + 1];
          renderCartaControlePdf(doc, margin + chartW + 4, currentY, chartW, chartH, stat2, idx + 2, dayLabelsMin);
        }

        currentY += chartH + 3;
      }

      currentY += 4;

      // -------------------------------------------------------------------------
      // 1.2 TABELA DE MONITORAMENTO MECÂNICO & OPERACIONAL: REBRITAGEM & PENEIRAMENTO
      // -------------------------------------------------------------------------
      checkPageBreak(35);
      drawFormalSectionHeader(
        "1.2",
        "MONITORAMENTO OPERACIONAL E MECÂNICO: REBRITAGEM & PENEIRAMENTO (BR001 A BR006)",
        "CONTROLE REBRITAGEM CÔNICA"
      );

      const tableDataRebritagemPdf = CONFIG_PARAMETROS_REBRITAGEM.map(param => {
        const infoLeitura = obterLeituraAtualRebritagem(br, param);
        const numVal = infoLeitura.numVal;
        const leituraFormatada = infoLeitura.leituraFormatada;

        let statusLabel = "-";
        if (numVal !== null && !isNaN(numVal)) {
          if (numVal < param.minIdeal || numVal > param.maxIdeal) {
            const deltaRel = Math.max(param.minIdeal - numVal, numVal - param.maxIdeal) / ((param.maxIdeal - param.minIdeal) || 1);
            statusLabel = deltaRel > 0.25 ? "Crítico / Desvio" : "Atenção / Desvio";
          } else {
            statusLabel = "Conforme";
          }
        }

        const faixaIdeal = `${param.decimais > 0 ? param.minIdeal.toFixed(param.decimais).replace(".", ",") : param.minIdeal} - ${param.decimais > 0 ? param.maxIdeal.toFixed(param.decimais).replace(".", ",") : param.maxIdeal} ${param.unidade}`;
        const acaoEstrategica = obterAcaoEstrategicaRebritagem(br, param);

        return [
          param.nome,
          param.equipamento,
          param.subsistema,
          leituraFormatada || "-",
          faixaIdeal,
          statusLabel,
          acaoEstrategica || "-"
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [
          [
            { content: "Variável / Indicador de Processo", styles: { halign: "left" } },
            { content: "Equipamento", styles: { halign: "center" } },
            { content: "Subsistema", styles: { halign: "left" } },
            { content: "Leitura Atual", styles: { halign: "center" } },
            { content: "Faixa Operacional", styles: { halign: "center" } },
            { content: "Status / Condição", styles: { halign: "center" } },
            { content: "Ação estratégica", styles: { halign: "left" } },
          ]
        ],
        body: tableDataRebritagemPdf,
        theme: "grid",
        headStyles: {
          fillColor: [...corpPrimary],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 6.2,
          cellPadding: 1.5,
          lineWidth: 0.2,
          lineColor: [...corpBorder],
        },
        styles: {
          fontSize: 5.8,
          cellPadding: 1.2,
          textColor: [...corpSlateDark],
          valign: "middle",
          lineColor: [...corpBorder],
          lineWidth: 0.2,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 38, fontStyle: "bold" },
          1: { cellWidth: 18, halign: "center", fontStyle: "bold", textColor: [30, 58, 138] },
          2: { cellWidth: 26, fontStyle: "normal", textColor: [...corpSlateText] },
          3: { cellWidth: 18, halign: "center", fontStyle: "bold", textColor: [...corpTealDark] },
          4: { cellWidth: 22, halign: "center", textColor: [...corpSlateMuted] },
          5: { cellWidth: 22, halign: "center", fontStyle: "bold" },
          6: { cellWidth: "auto", halign: "left", fontSize: 5.5, textColor: [...corpSlateText] },
        },
        didParseCell: function(data) {
          if (data.section === "body" && data.column.index === 5) {
            const val = String(data.cell.raw);
            if (val.includes("Crítico")) {
              data.cell.styles.textColor = [190, 18, 60];
              data.cell.styles.fillColor = [255, 241, 242];
            } else if (val.includes("Atenção")) {
              data.cell.styles.textColor = [180, 83, 9];
              data.cell.styles.fillColor = [254, 243, 199];
            } else if (val.includes("Conforme")) {
              data.cell.styles.textColor = [4, 120, 87];
              data.cell.styles.fillColor = [236, 253, 245];
            } else {
              data.cell.styles.textColor = [148, 163, 184];
              data.cell.styles.fillColor = [248, 250, 252];
            }
          }
        },
        margin: { left: margin, right: margin },
      });

      currentY = (doc as any).lastAutoTable.finalY + 3.5;

      const histDiarioReb = br.historicoDiarioRebritagem && br.historicoDiarioRebritagem.length === 7
        ? br.historicoDiarioRebritagem
        : DADOS_DIARIOS_REBRITAGEM_PADRAO;

      const estatisticasCartasReb = calcularCartasControleRebritagem(histDiarioReb);

      // Título da Seção de Cartas de Controle CEP Rebritagem
      checkPageBreak(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.2);
      doc.setTextColor(...corpPrimary);
      doc.text("1.3 CARTAS DE CONTROLE ESTATÍSTICO (CEP) & MONITORAMENTO REBRITAGEM (BR001 A BR006):", margin, currentY);
      currentY += 2.5;

      for (let idx = 0; idx < estatisticasCartasReb.length; idx += 2) {
        checkPageBreak(chartH + 3);

        // Item da esquerda
        const stat1 = estatisticasCartasReb[idx];
        renderCartaControlePdf(doc, margin, currentY, chartW, chartH, stat1, idx + 1, dayLabelsMin);

        // Item da direita (se houver)
        if (idx + 1 < estatisticasCartasReb.length) {
          const stat2 = estatisticasCartasReb[idx + 1];
          renderCartaControlePdf(doc, margin + chartW + 4, currentY, chartW, chartH, stat2, idx + 2, dayLabelsMin);
        }

        currentY += chartH + 3;
      }

      currentY += 2;
    } else {
      drawFormalSectionHeader(
        "1.0",
        "BALANÇO METALÚRGICO-OPERACIONAL: CIRCUITO ÚMIDO (REALIZADO VS PROGRAMADO)",
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

      const tableDataOperacional = [
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

      currentY = (doc as any).lastAutoTable.finalY + 5;
    }
  }

  // =========================================================================
  // --- 4. SEÇÃO 2: DIRECIONAMENTO ESTRATÉGICO POR HORIZONTE DE GESTÃO ---
  // =========================================================================
  const hasAnyHorizonte = sec.horizonteSemana || sec.horizonteFds || sec.horizonteParada || sec.horizonteMes;
  if (hasAnyHorizonte) {
    drawFormalSectionHeader(
      "2.0",
      "DIRECIONAMENTO ESTRATÉGICO & BALIZAMENTO POR HORIZONTE DE PLANEJAMENTO",
      "GOVERNANÇA TÁTICA (WTD • FDS • PARADA • MTD)"
    );

    const allHorizontes = [
      {
        ativo: sec.horizonteSemana,
        codigo: "HORIZONTE WTD",
        titulo: "ESTRATÉGIA DA SEMANA (WEEK TO DATE)",
        data: estrategiaSemana,
        corBorda: [59, 130, 246] as [number, number, number],
        corHeader: [29, 78, 216] as [number, number, number],
        corFundo: [239, 246, 255] as [number, number, number],
        badge: "SEMANAL",
      },
      {
        ativo: sec.horizonteFds,
        codigo: "HORIZONTE FDS",
        titulo: "BLINDAGEM OPERACIONAL & PLANTÃO DE FINAL DE SEMANA",
        data: estrategiaFds,
        corBorda: [245, 158, 11] as [number, number, number],
        corHeader: [180, 83, 9] as [number, number, number],
        corFundo: [254, 243, 199] as [number, number, number],
        badge: "PLANTÃO FDS",
      },
      {
        ativo: sec.horizonteParada && !!estrategiaParada,
        codigo: "ALINHAMENTO DE PARADA",
        titulo: "PLANEJAMENTO & PROTOCOLO DE INTERVENÇÃO (PARADA DE MANUTENÇÃO)",
        data: estrategiaParada || ({} as EstrategiaPorHorizonte),
        corBorda: [225, 29, 72] as [number, number, number],
        corHeader: [190, 18, 60] as [number, number, number],
        corFundo: [255, 241, 242] as [number, number, number],
        badge: "PARADA",
      },
      {
        ativo: sec.horizonteMes,
        codigo: "HORIZONTE MTD",
        titulo: "PLANEJAMENTO MENSAL & FORECAST (MONTH TO DATE)",
        data: estrategiaMes,
        corBorda: [139, 92, 246] as [number, number, number],
        corHeader: [109, 40, 217] as [number, number, number],
        corFundo: [245, 243, 255] as [number, number, number],
        badge: "MENSAL",
      }
    ];

    const activeHorizontes = allHorizontes.filter(h => h.ativo);

    activeHorizontes.forEach(hz => {
      const d = hz.data;
      const boxWidth = pageWidth - margin * 2;
      const contentWidth = boxWidth - 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);

      const splitFoco = d.focoPrincipal && d.focoPrincipal.trim().length > 0
        ? doc.splitTextToSize(`• Diretriz Principal & Foco Tático: ${d.focoPrincipal}`, contentWidth)
        : [];

      let metasText = "";
      if (isSeco) {
        if (d.metaAlimentacaoBritagem || d.metaTaxaHoraria || d.metaDisponibilidade) {
          metasText = `• Balizamento Numérico: Britagem ROM: ${d.metaAlimentacaoBritagem ? d.metaAlimentacaoBritagem.toLocaleString("pt-BR") : "-"} t | Taxa Alimentação: ${d.metaTaxaHoraria || "-"} t/h | Disponibilidade: ${d.metaDisponibilidade || "-"}%`;
        }
      } else {
        if (d.metaAlimentacaoMoagem || d.metaProducaoCobreContido || d.metaRecuperacao) {
          metasText = `• Balizamento Numérico: Moagem Planta: ${d.metaAlimentacaoMoagem ? d.metaAlimentacaoMoagem.toLocaleString("pt-BR") : "-"} t | Metal Cu Contido: ${d.metaProducaoCobreContido || "-"} t Cu | Rec. Global: ${d.metaRecuperacao || "-"}%`;
        }
      }
      const splitMetas = metasText ? doc.splitTextToSize(metasText, contentWidth) : [];

      const dirsList = (d.diretrizesPrioritarias || []).filter(x => x && x.trim().length > 0);
      const dirsFormatted = dirsList.length > 0
        ? dirsList.map((dir, idx) => `  [${idx + 1}] ${dir}`).join("\n")
        : "  [1] Executar rotinas padrão de SSMA e controle de processo.";
      const splitDirs = doc.splitTextToSize(`• Procedimentos & Diretrizes Prioritárias:\n${dirsFormatted}`, contentWidth);

      let extraText = "";
      if (d.recursosManutencao) {
        const recText = Array.isArray(d.recursosManutencao)
          ? d.recursosManutencao.filter(x => x && x.trim().length > 0).join("; ")
          : d.recursosManutencao;
        if (recText && recText.trim().length > 0) {
          extraText += `• Intervenções de Manutenção / Gestão de Ativos: ${recText}\n`;
        }
      }
      if (d.alertasOperacionais && d.alertasOperacionais.length > 0) {
        extraText += `• Pontos Críticos & Gerenciamento de Risco: ${d.alertasOperacionais.join("; ")}\n`;
      }
      if (d.planoAlinhamentoParada || (hz.codigo === "ALINHAMENTO DE PARADA" && d.planoBlindagemFds)) {
        extraText += `• Protocolo Formal de Alinhamento de Parada: ${d.planoAlinhamentoParada || d.planoBlindagemFds}\n`;
      } else if (d.planoBlindagemFds) {
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

      // Foco (se houver)
      if (splitFoco.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.8);
        doc.setTextColor(...corpSlateDark);
        doc.text(splitFoco, margin + 5, innerY);
        innerY += splitFoco.length * lineH;
      }

      // Metas (se houver)
      if (splitMetas.length > 0) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...corpSlateText);
        doc.text(splitMetas, margin + 5, innerY);
        innerY += splitMetas.length * lineH;
      }

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
  }

  // =========================================================================
  // --- 5. SEÇÃO 3: MATRIZ TÁTICA DE DIRETRIZES & RESPONSABILIDADES (RACI) ---
  // =========================================================================
  if (sec.matrizDiretrizes) {
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
  }

  // =========================================================================
  // --- 5.1 CRONOGRAMA GANTT SEMANAL: ACOMPANHAMENTO POR TURMA E SETOR ---
  // =========================================================================
  if (sec.cronogramaGantt && diretrizesTurno && diretrizesTurno.length > 0) {
    drawFormalSectionHeader(
      "3.1",
      "CRONOGRAMA GANTT: PLANO SEMANAL DE AÇÕES OPERACIONAIS & ALOCAÇÃO DE TURNOS",
      "DISTRIBUIÇÃO DE TURNOS (07H:19H E 19H:07H) & CONTROLE DE EXECUÇÃO"
    );

    const fullWidth = pageWidth - margin * 2; // 190 mm
    const colSetorW = 22; // mm
    const colAtividadeW = 55; // mm
    const colRecursosW = 18; // mm
    const colTurnoW = 5.6; // mm (14 turnos x 5.6 = 78.4 mm)
    const colGanttW = 78.4; // mm (7 dias x 11.2 mm)
    const colProgressoW = fullWidth - colSetorW - colAtividadeW - colRecursosW - colGanttW; // 16.6 mm

    // Agrupamento por Setor
    const setoresUnicos: string[] = Array.from(
      new Set(diretrizesTurno.map(d => d.setor || "Geral"))
    );
    const gruposMap: Record<string, DiretrizSupervisorTurno[]> = {};
    setoresUnicos.forEach(s => {
      gruposMap[s] = diretrizesTurno.filter(d => (d.setor || "Geral") === s);
    });

    const renderGanttHeader = (yPos: number) => {
      const hRow1 = 4.2;
      const hRow2 = 3.6;
      const hRow3 = 3.2;
      const totalHeaderH = hRow1 + hRow2 + hRow3;

      // --- LINHA 1 ---
      // Coluna 1: LOCAL / SETOR (fundo #07161B)
      doc.setFillColor(7, 22, 27);
      doc.rect(margin, yPos, colSetorW, totalHeaderH, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.2);
      doc.setTextColor(255, 255, 255);
      doc.text("LOCAL / SETOR", margin + colSetorW / 2, yPos + 4.5, { align: "center" });

      // Coluna 2: ATIVIDADE OPERACIONAL / DIRETRIZ (fundo #0A2028)
      doc.setFillColor(10, 32, 40);
      doc.rect(margin + colSetorW, yPos, colAtividadeW, totalHeaderH, "F");
      doc.text("ATIVIDADE OPERACIONAL / DIRETRIZ", margin + colSetorW + colAtividadeW / 2, yPos + 4.5, { align: "center" });

      // Coluna 3: RECURSOS (fundo #0A2028)
      doc.setFillColor(10, 32, 40);
      doc.rect(margin + colSetorW + colAtividadeW, yPos, colRecursosW, totalHeaderH, "F");
      doc.text("RECURSOS", margin + colSetorW + colAtividadeW + colRecursosW / 2, yPos + 4.5, { align: "center" });

      // Coluna 4: CRONOGRAMA SEMANAL (DIAS E HORÁRIOS) (fundo #004D40)
      const ganttX = margin + colSetorW + colAtividadeW + colRecursosW;
      doc.setFillColor(0, 77, 64);
      doc.rect(ganttX, yPos, colGanttW, hRow1, "F");
      doc.setFontSize(5.5);
      doc.setTextColor(167, 243, 208); // mint
      doc.text("CRONOGRAMA SEMANAL (DIAS E HORÁRIOS)", ganttX + colGanttW / 2, yPos + 3.0, { align: "center" });

      // Coluna 5: PROGRESSO (fundo #07161B)
      const progX = ganttX + colGanttW;
      doc.setFillColor(7, 22, 27);
      doc.rect(progX, yPos, colProgressoW, totalHeaderH, "F");
      doc.setFontSize(5.2);
      doc.setTextColor(255, 255, 255);
      doc.text("PROGRESSO", progX + colProgressoW / 2, yPos + 4.5, { align: "center" });

      // --- LINHA 2: DIAS DA SEMANA ---
      const diasLabels = [
        { label: "SEGUNDA", fds: false },
        { label: "TERÇA", fds: false },
        { label: "QUARTA", fds: false },
        { label: "QUINTA", fds: false },
        { label: "SEXTA", fds: false },
        { label: "SÁBADO", fds: true },
        { label: "DOMINGO", fds: true },
      ];

      diasLabels.forEach((d, idx) => {
        const diaX = ganttX + idx * (colTurnoW * 2);
        const diaW = colTurnoW * 2; // 11.2 mm
        if (d.fds) {
          doc.setFillColor(141, 75, 18); // #8D4B12
          doc.rect(diaX, yPos + hRow1, diaW, hRow2, "F");
          doc.setTextColor(254, 243, 199);
        } else {
          doc.setFillColor(10, 77, 84); // #0A4D54
          doc.rect(diaX, yPos + hRow1, diaW, hRow2, "F");
          doc.setTextColor(255, 255, 255);
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(4.8);
        doc.text(d.label, diaX + diaW / 2, yPos + hRow1 + 2.5, { align: "center" });
      });

      // --- LINHA 3: SUB-HORÁRIOS (07h:19h e 19h:07h) ---
      // Fundo das colunas laterais na linha 3
      doc.setFillColor(226, 232, 240);
      doc.rect(margin, yPos + hRow1 + hRow2, colSetorW + colAtividadeW + colRecursosW, hRow3, "F");
      doc.rect(progX, yPos + hRow1 + hRow2, colProgressoW, hRow3, "F");

      for (let i = 0; i < 14; i++) {
        const tX = ganttX + i * colTurnoW;
        const isFds = i >= 10; // Sábado e Domingo (turnos 10, 11, 12, 13)
        const isDiurno = i % 2 === 0;

        if (isFds) {
          doc.setFillColor(isDiurno ? 254 : 253, isDiurno ? 243 : 230, isDiurno ? 199 : 138); // amber-100/200
          doc.rect(tX, yPos + hRow1 + hRow2, colTurnoW, hRow3, "F");
          doc.setTextColor(isDiurno ? 146 : 120, isDiurno ? 64 : 53, isDiurno ? 14 : 15);
        } else {
          doc.setFillColor(isDiurno ? 241 : 248, isDiurno ? 245 : 250, isDiurno ? 249 : 252); // slate-100/50
          doc.rect(tX, yPos + hRow1 + hRow2, colTurnoW, hRow3, "F");
          doc.setTextColor(isDiurno ? 51 : 71, isDiurno ? 65 : 85, isDiurno ? 85 : 105);
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(3.8);
        doc.text(isDiurno ? "07:19" : "19:07", tX + colTurnoW / 2, yPos + hRow1 + hRow2 + 2.2, { align: "center" });

        // Divisórias verticais
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.12);
        doc.line(tX, yPos + hRow1 + hRow2, tX, yPos + totalHeaderH);
      }

      // Linhas divisórias verticais principais do cabeçalho
      doc.setDrawColor(51, 65, 85);
      doc.setLineWidth(0.2);
      doc.line(margin + colSetorW, yPos, margin + colSetorW, yPos + totalHeaderH);
      doc.line(margin + colSetorW + colAtividadeW, yPos, margin + colSetorW + colAtividadeW, yPos + totalHeaderH);
      doc.line(ganttX, yPos, ganttX, yPos + totalHeaderH);
      doc.line(progX, yPos, progX, yPos + totalHeaderH);

      // Borda inferior do cabeçalho completo
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.25);
      doc.line(margin, yPos + totalHeaderH, margin + fullWidth, yPos + totalHeaderH);

      return yPos + totalHeaderH;
    };

    checkPageBreak(35);
    let tableY = renderGanttHeader(currentY);

    // Iterar pelos grupos de setor
    Object.entries(gruposMap).forEach(([grupo, acoes]) => {
      if (acoes.length === 0) return;

      // Linha de Cabeçalho do Grupo de Setor
      const groupHeaderH = 4.2;
      if (checkPageBreak(groupHeaderH + 10)) {
        tableY = renderGanttHeader(currentY);
      }

      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(margin, tableY, fullWidth, groupHeaderH, "F");

      // Chevron e Nome do Grupo
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.2);
      doc.setTextColor(45, 212, 191); // teal-400
      doc.text(">", margin + 2.5, tableY + 2.9);

      doc.setTextColor(94, 234, 212); // teal-300
      doc.text(grupo.toUpperCase(), margin + 5.5, tableY + 2.9);

      // Badge com contagem de ações
      const countLabel = acoes.length === 1 ? "1 ação alocada" : `${acoes.length} ações alocadas`;
      doc.setFontSize(4.4);
      const countW = doc.getTextWidth(countLabel) + 3.5;
      const countX = margin + 6.5 + doc.getTextWidth(grupo.toUpperCase());
      doc.setFillColor(51, 65, 85); // slate-700
      doc.roundedRect(countX, tableY + 0.8, countW, 2.6, 0.5, 0.5, "F");
      doc.setTextColor(226, 232, 240); // slate-200
      doc.setFont("helvetica", "normal");
      doc.text(countLabel, countX + countW / 2, tableY + 2.6, { align: "center" });

      tableY += groupHeaderH;

      // Linhas das Diretrizes do Grupo
      acoes.forEach((d, idx) => {
        const isCritica = d.prioridade === "critica";
        const isAlta = d.prioridade === "alta";
        const isConcluido = d.status === "concluido";
        const progresso = d.progresso !== undefined ? d.progresso : (isConcluido ? 100 : d.status === "em_andamento" ? 50 : 0);

        // Calcular quebra de texto da Ação Estratégica
        const acaoLimpa = (d.acaoEstrategica || "").replace(/[\r\n]+/g, " ").trim();
        doc.setFont("helvetica", isConcluido ? "normal" : "bold");
        doc.setFontSize(4.8);
        const acaoLines = doc.splitTextToSize(acaoLimpa, colAtividadeW - 4);
        
        // Calcular quebra de texto do Setor
        doc.setFont("helvetica", "bold");
        doc.setFontSize(4.6);
        const setorLines = doc.splitTextToSize(d.setor || grupo, colSetorW - 3);

        // Altura dinâmica confortável da linha
        const textBlockHeight = acaoLines.length * 2.2;
        const rowHeight = Math.max(9.0, 3.8 + textBlockHeight + 1.2);

        if (checkPageBreak(rowHeight + 3)) {
          tableY = renderGanttHeader(currentY);
        }

        const isEven = idx % 2 === 0;
        doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
        doc.rect(margin, tableY, fullWidth, rowHeight, "F");

        // --- COLUNA 1: LOCAL / SETOR ---
        doc.setFillColor(248, 250, 252); // slate-50/50
        doc.rect(margin, tableY, colSetorW, rowHeight, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(4.6);
        doc.setTextColor(30, 41, 59);
        const setorStartY = tableY + (rowHeight - (setorLines.length * 2.2)) / 2 + 1.6;
        setorLines.forEach((sLine: string, sIdx: number) => {
          doc.text(sLine.toUpperCase(), margin + colSetorW / 2, setorStartY + sIdx * 2.2, { align: "center" });
        });

        // --- COLUNA 2: ATIVIDADE OPERACIONAL / DIRETRIZ ---
        const ativX = margin + colSetorW;
        
        // Badge de Prioridade (P1 / P2 / P3)
        let prioBg: [number, number, number] = [219, 234, 254];
        let prioColor: [number, number, number] = [30, 64, 175];
        let prioLabel = "P3 - MÉDIA";
        if (isCritica) {
          prioBg = [255, 228, 230];
          prioColor = [159, 18, 57];
          prioLabel = "P1 - CRÍTICA";
        } else if (isAlta) {
          prioBg = [254, 243, 199];
          prioColor = [146, 64, 14];
          prioLabel = "P2 - ALTA";
        }

        doc.setFillColor(...prioBg);
        doc.roundedRect(ativX + 1.5, tableY + 1.2, 14.5, 2.2, 0.4, 0.4, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(4.2);
        doc.setTextColor(...prioColor);
        doc.text(prioLabel, ativX + 8.75, tableY + 2.75, { align: "center" });

        // Prazo Limite
        doc.setFont("helvetica", "normal");
        doc.setFontSize(4.2);
        doc.setTextColor(100, 116, 139); // slate-500
        const prazoStr = `Prazo: ${d.prazoLimite || "Turno Atual"}`;
        doc.text(prazoStr, ativX + 17.5, tableY + 2.75);

        // Texto da Ação
        doc.setFont("helvetica", isConcluido ? "normal" : "bold");
        doc.setFontSize(4.8);
        doc.setTextColor(isConcluido ? 148 : 15, isConcluido ? 163 : 23, isConcluido ? 184 : 42);
        acaoLines.forEach((aLine: string, aIdx: number) => {
          doc.text(aLine, ativX + 1.5, tableY + 5.0 + aIdx * 2.2);
        });

        // --- COLUNA 3: RECURSOS ---
        const recX = ativX + colAtividadeW;
        doc.setFillColor(248, 250, 252);
        doc.rect(recX, tableY, colRecursosW, rowHeight, "F");

        const recursoStr = d.recursosPessoais || "ADM / OPERAÇÃO";
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.12);
        doc.roundedRect(recX + 1.2, tableY + (rowHeight - 3.2) / 2, colRecursosW - 2.4, 3.2, 0.4, 0.4, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(4.2);
        doc.setTextColor(30, 41, 59);
        doc.text(recursoStr, recX + colRecursosW / 2, tableY + rowHeight / 2 + 1.0, { align: "center" });

        // --- COLUNAS 4 A 17: 14 TURNOS COM MARCAÇÃO "X" VERDE FLORESTA ---
        const ganttX = recX + colRecursosW;
        const aloc = normalizarAlocacaoTurnos(d.alocacaoTurnos, d.diaInicioNum, d.diaFimNum, d.diasAlocados);
        const diaKeys = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"] as const;

        diaKeys.forEach((diaKey, diaIdx) => {
          const diaObj = aloc[diaKey] || { diurno: false, noturno: false };
          const isDiurno = Boolean(diaObj.diurno);
          const isNoturno = Boolean(diaObj.noturno);

          const diurnoX = ganttX + (diaIdx * 2) * colTurnoW;
          const noturnoX = ganttX + (diaIdx * 2 + 1) * colTurnoW;

          // Turno Diurno
          if (isDiurno) {
            doc.setFillColor(30, 126, 52); // #1E7E34 Verde Floresta
            doc.rect(diurnoX + 0.15, tableY + 0.15, colTurnoW - 0.3, rowHeight - 0.3, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(5.5);
            doc.setTextColor(255, 255, 255);
            doc.text("X", diurnoX + colTurnoW / 2, tableY + rowHeight / 2 + 1.6, { align: "center" });
          }

          // Turno Noturno
          if (isNoturno) {
            doc.setFillColor(30, 126, 52); // #1E7E34 Verde Floresta
            doc.rect(noturnoX + 0.15, tableY + 0.15, colTurnoW - 0.3, rowHeight - 0.3, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(5.5);
            doc.setTextColor(255, 255, 255);
            doc.text("X", noturnoX + colTurnoW / 2, tableY + rowHeight / 2 + 1.6, { align: "center" });
          }

          // Linhas verticais dos turnos
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.12);
          doc.line(diurnoX, tableY, diurnoX, tableY + rowHeight);
          doc.line(noturnoX, tableY, noturnoX, tableY + rowHeight);
        });

        // --- COLUNA 18: PROGRESSO ---
        const progX = ganttX + colGanttW;
        doc.setFillColor(248, 250, 252);
        doc.rect(progX, tableY, colProgressoW, rowHeight, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(4.8);
        doc.setTextColor(15, 23, 42);
        doc.text(`${progresso}%`, progX + colProgressoW / 2, tableY + rowHeight / 2 - 0.6, { align: "center" });

        // Mini Barra de Progresso
        const barW = 12;
        const barH = 1.3;
        const barX = progX + (colProgressoW - barW) / 2;
        const barY = tableY + rowHeight / 2 + 0.8;

        doc.setFillColor(226, 232, 240);
        doc.roundedRect(barX, barY, barW, barH, 0.4, 0.4, "F");

        if (progresso > 0) {
          const filledW = Math.max(0.5, (barW * Math.min(100, progresso)) / 100);
          if (isConcluido) {
            doc.setFillColor(13, 148, 136); // teal-600
          } else if (isCritica) {
            doc.setFillColor(244, 63, 94); // rose-500
          } else {
            doc.setFillColor(0, 115, 105); // corpPrimary
          }
          doc.roundedRect(barX, barY, filledW, barH, 0.4, 0.4, "F");
        }

        // Borda inferior da linha da tabela
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.12);
        doc.line(margin, tableY + rowHeight, margin + fullWidth, tableY + rowHeight);

        // Linhas verticais delimitadoras das colunas principais
        doc.line(ativX, tableY, ativX, tableY + rowHeight);
        doc.line(recX, tableY, recX, tableY + rowHeight);
        doc.line(ganttX, tableY, ganttX, tableY + rowHeight);
        doc.line(progX, tableY, progX, tableY + rowHeight);
        doc.line(margin + fullWidth, tableY, margin + fullWidth, tableY + rowHeight);

        tableY += rowHeight;
      });
    });

    // --- LEGENDA DA MATRIZ 5S (IDÊNTICA À VISUALIZAÇÃO) ---
    const legendH = 5.5;
    if (checkPageBreak(legendH + 4)) {
      tableY = currentY;
    }

    const legendY = tableY + 2.0;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.15);
    doc.roundedRect(margin, legendY, fullWidth, legendH, 0.8, 0.8, "FD");

    // Título da Legenda
    doc.setFont("helvetica", "bold");
    doc.setFontSize(4.6);
    doc.setTextColor(30, 41, 59);
    doc.text("Legenda da Matriz 5S:", margin + 2.5, legendY + 3.5);

    // Item 1: [X] Turno Alocado (07h:19h ou 19h:07h)
    const leg1X = margin + 25;
    doc.setFillColor(30, 126, 52);
    doc.roundedRect(leg1X, legendY + 1.5, 2.8, 2.5, 0.3, 0.3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(4.2);
    doc.setTextColor(255, 255, 255);
    doc.text("X", leg1X + 1.4, legendY + 3.3, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(4.4);
    doc.setTextColor(71, 85, 105);
    doc.text("Turno Alocado (07h:19h ou 19h:07h)", leg1X + 3.6, legendY + 3.5);

    // Item 2: P1 Crítica (Rose)
    const leg2X = leg1X + 44;
    doc.setFillColor(244, 63, 94);
    doc.roundedRect(leg2X, legendY + 1.7, 2.2, 2.2, 0.3, 0.3, "F");
    doc.text("Prioridade P1 (Crítica)", leg2X + 3.0, legendY + 3.5);

    // Item 3: P2 Alta (Amber)
    const leg3X = leg2X + 27;
    doc.setFillColor(245, 158, 11);
    doc.roundedRect(leg3X, legendY + 1.7, 2.2, 2.2, 0.3, 0.3, "F");
    doc.text("Prioridade P2 (Alta)", leg3X + 3.0, legendY + 3.5);

    // Item 4: Execução Operacional (Teal)
    const leg4X = leg3X + 24;
    doc.setFillColor(0, 115, 105);
    doc.roundedRect(leg4X, legendY + 1.7, 2.2, 2.2, 0.3, 0.3, "F");
    doc.text("Execução Operacional", leg4X + 3.0, legendY + 3.5);

    // Subtexto à direita
    doc.setFont("helvetica", "italic");
    doc.setFontSize(3.8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "* A alocação por setor sincroniza diretamente com o relatório de supervisão e o PDF executivo.",
      margin + fullWidth - 2.5,
      legendY + 3.5,
      { align: "right" }
    );

    currentY = legendY + legendH + 3.5;
  }

  // =========================================================================
  // --- 6. SEÇÃO 4: PERDAS QUANTIFICADAS, GARGALOS & AÇÕES RECOMENDADAS P1 ---
  // =========================================================================
  const hasGargalosOrConting = sec.diagnosticoGargalos || sec.planoContingencia;
  if (hasGargalosOrConting) {
    drawFormalSectionHeader(
      "4.0",
      "PERDAS QUANTIFICADAS, DIAGNÓSTICO DE DESVIOS & AÇÕES RECOMENDADAS P1",
      "ANÁLISE DE IMPACTOS & DIRETRIZES TÁTICAS"
    );

    const histDiario = br.historicoDiarioBritagem && br.historicoDiarioBritagem.length === 7
      ? br.historicoDiarioBritagem
      : DADOS_DIARIOS_BRITAGEM_PADRAO;
    const desviosDetectados = isSeco ? detectarDesviosBritagem(histDiario, br.anotacoesDesvios) : [];

    // --- 4.1 QUADRO DE PERDAS QUANTIFICADAS (IMPACTOS POR DESVIOS OPERACIONAIS) ---
    if (sec.diagnosticoGargalos) {
      checkPageBreak(25);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...corpPrimary);
      doc.text("4.1 PERDAS QUANTIFICADAS & IMPACTOS DE INDICADORES FORA DA FAIXA IDEAL:", margin, currentY);
      currentY += 2.5;

      const perdasRows = isSeco && desviosDetectados.length > 0
        ? desviosDetectados.map((desv, idx) => [
            `[${idx + 1}] ${desv.parametro.nome} (${desv.diaLabel})`,
            `Lido: ${desv.valorLido} ${desv.parametro.unidade} (Ideal: ${desv.parametro.minIdeal}-${desv.parametro.maxIdeal})`,
            desv.impactoPerda || "A ser quantificado pela supervisão",
            desv.acaoCorretiva || "A ser definida pela supervisão"
          ])
        : isSeco
        ? [
            [
              "Britagem Primária (41BR001)",
              "Disponibilidade 34,3% (Meta 88%)",
              "Perda de taxa instantânea e redução de pulmão intermediário de finos",
              "Execução do plano de confiabilidade mecânica e troca de revestimentos"
            ],
            [
              "Cominuição & Pátios de ROM",
              "Oscilação de dureza MSB/Surubim",
              "Variação de produtividade na rebritagem e aumento de finos",
              "Equalização rigorosa da proporção de blend no pátio primário"
            ]
          ]
        : [
            [
              "Parada Moagem/Planta (Dia 28)",
              "Produção 6.168 t (vs ~14.500 t)",
              "Impacto negativo de ~70-75 t de Cu contido no dia",
              "Revisão do PMOC do filtro prensa e sincronização de janelas"
            ],
            [
              "Queda de Teor CuT (Semana 4)",
              "Teor 0,80% CuT (vs 1,11% Sem. 1)",
              "Impacto de ~45-55 t de Cu contido abaixo do potencial semanal",
              "Ajuste da proporção de frentes subterrâneas e pilhas de alto teor"
            ]
          ];

      autoTable(doc, {
        startY: currentY,
        head: [
          [
            { content: "Indicador / Evento com Desvio", styles: { halign: "left" } },
            { content: "Desvio Registrado", styles: { halign: "left" } },
            { content: "Impacto Operacional / Perda Quantificada", styles: { halign: "left" } },
            { content: "Diretriz de Mitigação", styles: { halign: "left" } },
          ]
        ],
        body: perdasRows,
        theme: "grid",
        headStyles: {
          fillColor: [185, 28, 28], // Vermelho corporativo de perdas
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 5.5,
          cellPadding: 1.2,
          lineWidth: 0.15,
          lineColor: [...corpBorder],
        },
        styles: {
          fontSize: 5.2,
          cellPadding: 1.2,
          textColor: [...corpSlateDark],
          lineColor: [...corpBorder],
          lineWidth: 0.15,
          valign: "middle",
        },
        alternateRowStyles: {
          fillColor: [254, 242, 242],
        },
        columnStyles: {
          0: { cellWidth: 42, fontStyle: "bold" },
          1: { cellWidth: 38, textColor: [185, 28, 28], fontStyle: "bold" },
          2: { cellWidth: 62 },
          3: { cellWidth: 48, fontStyle: "italic", textColor: [15, 118, 110] },
        },
        margin: { left: margin, right: margin },
      });

      currentY = (doc as any).lastAutoTable.finalY + 4;
    }

    // --- 4.2 QUADRO DE AÇÕES RECOMENDADAS & DIRETRIZES TÁTICAS (LISTAGEM DAS 5 AÇÕES P1) ---
    if (sec.planoContingencia) {
      checkPageBreak(30);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...corpPrimary);
      doc.text("4.2 AÇÕES RECOMENDADAS & DIRETRIZES TÁTICAS (TOP 5 AÇÕES PRIORITÁRIAS P1):", margin, currentY);
      currentY += 2.5;

      // Filtra as ações P1 (prioridade crítica / P1) da matriz de diretrizes
      const acoesP1 = (diretrizesTurno || [])
        .filter(d => d.prioridade === "critica" || (d.acaoEstrategica && d.acaoEstrategica.includes("P1")) || (d.setor && d.setor.includes("P1")))
        .slice(0, 5);

      // Fallback caso não haja 5 ações cadastradas explicitamente
      const acoesFinalP1 = acoesP1.length > 0
        ? acoesP1
        : (diretrizesTurno || []).slice(0, 5);

      const acoesRows = acoesFinalP1.map((ac, idx) => [
        `P1-${idx + 1}`,
        ac.setor || "Geral",
        ac.acaoEstrategica,
        ac.supervisorNome || ac.responsavelTurma,
        ac.prazoLimite || "Imediato / Turno",
        ac.metaEsperada || "Estabilidade operacional e conformidade metalúrgica"
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [
          [
            { content: "Código", styles: { halign: "center" } },
            { content: "Setor", styles: { halign: "left" } },
            { content: "Ação Recomendada & Diretriz Tática P1", styles: { halign: "left" } },
            { content: "Responsável", styles: { halign: "left" } },
            { content: "Prazo", styles: { halign: "center" } },
            { content: "Meta Associada / Resultado Esperado", styles: { halign: "left" } },
          ]
        ],
        body: acoesRows,
        theme: "grid",
        headStyles: {
          fillColor: [...corpTeal],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 5.5,
          cellPadding: 1.2,
          lineWidth: 0.15,
          lineColor: [...corpBorder],
        },
        styles: {
          fontSize: 5.2,
          cellPadding: 1.2,
          textColor: [...corpSlateDark],
          lineColor: [...corpBorder],
          lineWidth: 0.15,
          valign: "middle",
        },
        alternateRowStyles: {
          fillColor: [240, 253, 250],
        },
        columnStyles: {
          0: { cellWidth: 14, halign: "center", fontStyle: "bold", textColor: [185, 28, 28] },
          1: { cellWidth: 26, fontStyle: "bold" },
          2: { cellWidth: 68 },
          3: { cellWidth: 28 },
          4: { cellWidth: 18, halign: "center", fontStyle: "bold" },
          5: { cellWidth: 36, textColor: [...corpSlateText] },
        },
        margin: { left: margin, right: margin },
      });

      currentY = (doc as any).lastAutoTable.finalY + 4;
    }

    // --- 4.3 PLANO DE CONTINGÊNCIA OPERACIONAL & DIAGNÓSTICO DE GARGALOS (SUPERVISÃO) ---
    if (sec.planoContingencia || sec.diagnosticoGargalos) {
      checkPageBreak(25);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...corpPrimary);
      doc.text("4.3 PLANO DE CONTINGÊNCIA OPERACIONAL & DIAGNÓSTICO DE GARGALOS (SUPERVISÃO):", margin, currentY);
      currentY += 2.5;

      const textoGargalos = (isSeco ? br.gargalosAtuais : ce.gargalosAtuais) || "Nenhum gargalo crítico registrado pelo supervisor.";
      const textoContingencia = (isSeco ? br.planoContingencia : ce.planoContingencia) || payload.observacoesGerais || "Nenhum plano de contingência operacional registrado pelo supervisor.";

      const boxWidth = pageWidth - 2 * margin;

      // Diagnóstico de Gargalos
      if (sec.diagnosticoGargalos) {
        doc.setFillColor(254, 242, 242);
        doc.setDrawColor(254, 202, 202);
        doc.roundedRect(margin, currentY, boxWidth, 8, 1, 1, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(5.5);
        doc.setTextColor(185, 28, 28);
        doc.text("• DIAGNÓSTICO DE GARGALOS & RESTRIÇÕES OPERACIONAIS:", margin + 2, currentY + 2.8);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(5.2);
        doc.setTextColor(...corpSlateDark);
        const splitGargalos = doc.splitTextToSize(textoGargalos, boxWidth - 4);
        doc.text(splitGargalos.slice(0, 2), margin + 2, currentY + 5.8);

        currentY += 9.5;
      }

      // Plano de Contingência
      if (sec.planoContingencia) {
        doc.setFillColor(240, 253, 250);
        doc.setDrawColor(204, 251, 241);
        doc.roundedRect(margin, currentY, boxWidth, 8, 1, 1, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(5.5);
        doc.setTextColor(...corpPrimary);
        doc.text("• PLANO DE CONTINGÊNCIA OPERACIONAL & RECOMENDAÇÕES DA SUPERVISÃO:", margin + 2, currentY + 2.8);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(5.2);
        doc.setTextColor(...corpSlateDark);
        const splitConting = doc.splitTextToSize(textoContingencia, boxWidth - 4);
        doc.text(splitConting.slice(0, 2), margin + 2, currentY + 5.8);

        currentY += 9.5;
      }
    }

    // Fim da Seção de Contingências
  }

  // =========================================================================
  // --- 7. CABEÇALHO SUPERIOR (A PARTIR DA PÁGINA 2) & RODAPÉ FORMAL ---
  // =========================================================================
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Running Header a partir da Página 2
    if (i > 1) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(...corpSlateMuted);
      doc.text("ERO BRASIL • ONEEro - Caraíba", margin, margin - 1.5);
      
      const docHeaderRun = isSeco
        ? "RELATÓRIO GERENCIAL ESTRATÉGICO • CIRCUITO SECO (Revisão 01)"
        : "RELATÓRIO GERENCIAL ESTRATÉGICO • CIRCUITO ÚMIDO (Revisão 01)";
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

/**
 * Renderiza uma Carta de Controle Estatístico de Processo (CEP - Shewhart) individual no PDF.
 * Não exibe médias nem LC (Alvo), apresentando rigorosamente LIC, LSC e a curva diária de 7 dias.
 */
function renderCartaControlePdf(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  stat: EstatisticaCartaControle | EstatisticaCartaControleRebritagem | any,
  numIndex: number,
  dayLabels: string[]
) {
  const p = stat.parametro;
  const temDesvio = stat.pontosForaFaixa > 0;

  // 1. Caixa estrutural do card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, w, h, 1.2, 1.2, "FD");

  // 2. Cabeçalho do Card
  doc.setFillColor(temDesvio ? 254 : 240, temDesvio ? 242 : 253, temDesvio ? 242 : 250);
  doc.roundedRect(x, y, w, 5.0, 1.2, 1.2, "F");

  doc.setDrawColor(temDesvio ? 254 : 204, temDesvio ? 202 : 251, temDesvio ? 202 : 241);
  doc.setLineWidth(0.15);
  doc.line(x, y + 5.0, x + w, y + 5.0);

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(4.8);
  doc.setTextColor(15, 23, 42); // slate-900
  const nomeDisplay = p.nomeCurto || p.nome;
  const equipSuffix = p.equipamento ? ` [${p.equipamento}]` : "";
  const titleText = `${numIndex}. ${nomeDisplay}${equipSuffix} (${p.unidade})`;
  doc.text(titleText, x + 2, y + 3.5);

  // Badge de Status
  doc.setFontSize(4.4);
  if (temDesvio) {
    doc.setTextColor(185, 28, 28);
    doc.text(`DESVIO (${stat.pontosForaFaixa}x)`, x + w - 2, y + 3.5, { align: "right" });
  } else {
    doc.setTextColor(13, 148, 136);
    doc.text("CONTROLADO", x + w - 2, y + 3.5, { align: "right" });
  }

  // 3. Faixa de Limites (LIC • LSC) - Sem LC / Médias
  doc.setFont("helvetica", "bold");
  doc.setFontSize(4.4);
  
  doc.setTextColor(37, 99, 235); // LIC blue
  doc.text(`LIC: ${p.minIdeal}`, x + 2, y + 7.8);

  doc.setTextColor(225, 29, 72); // LSC rose
  doc.text(`LSC: ${p.maxIdeal}`, x + w - 2, y + 7.8, { align: "right" });

  // 4. Área de Plotagem Gráfica
  const plotLeft = x + 5.5;
  const plotTop = y + 9.5;
  const plotW = w - 11;
  const plotH = 13.5;

  // Background da plotagem
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(plotLeft, plotTop, plotW, plotH, "F");
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.12);
  doc.rect(plotLeft, plotTop, plotW, plotH, "S");

  // Escala Y
  const valoresValidos = stat.valoresPorDia
    .map(v => v.valor)
    .filter((v): v is number => v !== null && !isNaN(v));

  const minLido = valoresValidos.length > 0 ? Math.min(...valoresValidos) : p.minIdeal;
  const maxLido = valoresValidos.length > 0 ? Math.max(...valoresValidos) : p.maxIdeal;

  const yMin = Math.min(p.minIdeal * 0.95, minLido * 0.98);
  const yMax = Math.max(p.maxIdeal * 1.05, maxLido * 1.02);
  const ySpan = yMax - yMin || 1;

  const getYCoord = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    return plotTop + plotH - ((clamped - yMin) / ySpan) * plotH;
  };

  // Linhas Guia dos Limites de Controle (LSC e LIC)
  // LSC (Rose)
  const lscY = getYCoord(p.maxIdeal);
  doc.setDrawColor(244, 63, 94);
  doc.setLineWidth(0.18);
  doc.line(plotLeft, lscY, plotLeft + plotW, lscY);

  // LIC (Blue)
  const licY = getYCoord(p.minIdeal);
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.18);
  doc.line(plotLeft, licY, plotLeft + plotW, licY);

  // 5. Plotagem dos 7 pontos diários (Segunda a Domingo)
  const numPts = 7;
  const xStep = plotW / (numPts - 1);
  const midY = (lscY + licY) / 2;
  const pointsCoords: { x: number; y: number; val: number | null; fora: boolean }[] = [];

  for (let d = 0; d < numPts; d++) {
    const ptX = plotLeft + d * xStep;
    const item = stat.valoresPorDia[d];
    const val = item ? item.valor : null;
    const isFora = val !== null && (val > p.maxIdeal || val < p.minIdeal);
    const ptY = val !== null ? getYCoord(val) : midY;

    pointsCoords.push({ x: ptX, y: ptY, val, fora: isFora });
  }

  // Linha conectando os pontos
  doc.setDrawColor(15, 118, 110); // teal-700
  doc.setLineWidth(0.3);
  for (let d = 0; d < numPts - 1; d++) {
    const p1 = pointsCoords[d];
    const p2 = pointsCoords[d + 1];
    if (p1.val !== null && p2.val !== null) {
      doc.line(p1.x, p1.y, p2.x, p2.y);
    }
  }

  // Marcadores e Rótulos de Valores
  pointsCoords.forEach((pt, d) => {
    // Letra do dia da semana abaixo do eixo X
    doc.setFont("helvetica", "normal");
    doc.setFontSize(3.8);
    doc.setTextColor(100, 116, 139);
    doc.text(dayLabels[d] || `${d + 1}`, pt.x, plotTop + plotH + 3.0, { align: "center" });

    if (pt.val !== null) {
      if (pt.fora) {
        // Ponto de Alerta Fora da Faixa
        doc.setFillColor(225, 29, 72);
        doc.circle(pt.x, pt.y, 0.9, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(4.0);
        doc.setTextColor(185, 28, 28);
        const yOffset = pt.val > p.maxIdeal ? -1.3 : 2.4;
        doc.text(`${pt.val}`, pt.x, pt.y + yOffset, { align: "center" });
      } else {
        // Ponto Normal Conforme
        doc.setFillColor(13, 148, 136);
        doc.circle(pt.x, pt.y, 0.6, "F");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(3.6);
        doc.setTextColor(51, 65, 85);
        doc.text(`${pt.val}`, pt.x, pt.y - 1.1, { align: "center" });
      }
    }
  });
}
