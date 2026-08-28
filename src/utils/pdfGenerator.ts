/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SETORES, OcorrenciaPerdaSeguranca, fmtData, st } from "../types";

export interface PDFDataPayload {
  data: string;
  turno: string;
  turma: string;
  temaDds?: string;
  dados: Record<string, Record<string, any>>;
  ocorrencias: OcorrenciaPerdaSeguranca[];
  acoes: string[];
  obs: string;
}

/**
 * Sanitizes strings for jsPDF built-in fonts (Helvetica / WinAnsi).
 * Converts Unicode symbols, bullets, smart quotes, dashes, non-breaking spaces,
 * and emojis into 100% clean ASCII / Latin-1 text to prevent encoding glitches,
 * corrupted character sequences like '%æ', and letter-spacing expansion bugs.
 */
export function sanitizePdfText(str: any): string {
  if (str === undefined || str === null) return "";
  let s = String(str);

  // Normalize Unicode bullets, arrows, list symbols to clean standard markers
  s = s
    .replace(/[\u2022\u2023\u25E6\u2043\u2219\u25CB\u25CF\u25AA\u25AB\u25A0\u25A1\u25B6\u25B8\u25BA\u27A4\u279C\u2794\u2192]/g, "- ")
    .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u2013\u2014\u2015]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, " ") // Non-breaking & special whitespace
    .replace(/[\u2705\u2713\u2714]/g, "[OK]")
    .replace(/[\u274C\u274E\u2716\u2717\u2718]/g, "[X]")
    .replace(/[\u26A0\u26A1\u2699\u2692\uD800-\uDFFF]/g, ""); // Emojis and surrogate pairs

  // Replace any other unsupported high-unicode characters (> 255)
  s = s.replace(/[^\x00-\xFF]/g, " ");

  return s;
}

export function gerarRelatorioPDF(payload: PDFDataPayload) {
  const { data, turno, turma, temaDds, dados, ocorrencias, acoes, obs } = payload;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  // Theme Colors
  const primaryColor: [number, number, number] = [13, 148, 136]; // #0d9488 (Teal)
  const headerBg: [number, number, number] = [15, 23, 42]; // #0f172a (Slate 900)
  const textDark: [number, number, number] = [15, 23, 42]; // Slate 900
  const textMuted: [number, number, number] = [71, 85, 105]; // Slate 600

  // Helper for adding new page with proper top margin
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 16) {
      doc.addPage();
      currentY = margin + 6;
    }
  };

  // Helper to draw section header bar
  const drawSectionHeader = (title: string) => {
    checkPageBreak(14);
    doc.setFillColor(...headerBg);
    doc.roundedRect(margin, currentY, contentWidth, 7.5, 1, 1, "F");

    // Teal small left marker
    doc.setFillColor(...primaryColor);
    doc.rect(margin, currentY, 2.5, 7.5, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(sanitizePdfText(title), margin + 5, currentY + 5.2);
    currentY += 10.5;
  };

  // --- 1. HEADER BANNER ---
  doc.setFillColor(...headerBg);
  doc.rect(margin, currentY, contentWidth, 22, "F");

  // Accent stripe
  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY, 3.5, 22, "F");

  // Title text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("PLANTA DE BENEFICIAMENTO DE COBRE", margin + 7, currentY + 8.5);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text("RELATÓRIO OPERACIONAL DE PASSAGEM DE TURNO", margin + 7, currentY + 15.5);

  // Turma badge on header
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(pageWidth - margin - 26, currentY + 4, 22, 14, 1.5, 1.5, "F");
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("TURMA", pageWidth - margin - 22, currentY + 9);
  doc.setFontSize(11);
  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.text(turma ? `TURMA ${sanitizePdfText(turma)}` : "-", pageWidth - margin - 24, currentY + 15);

  currentY += 25;

  // --- 2. METADATA STRIP ---
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(margin, currentY, contentWidth, 13, 1.5, 1.5, "F");
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(margin, currentY, contentWidth, 13, 1.5, 1.5, "S");

  const colWidth = contentWidth / 3;

  // Data
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textMuted);
  doc.text("DATA DO TURNO", margin + 4, currentY + 4.8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);
  doc.text(fmtData(data) || "-", margin + 4, currentY + 9.8);

  // Turno
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textMuted);
  doc.text("TURNO OPERACIONAL", margin + colWidth + 4, currentY + 4.8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);
  const turnoLabel = turno === "diurno" ? "Diurno (07:00 - 19:00)" : "Noturno (19:00 - 07:00)";
  doc.text(turnoLabel, margin + colWidth + 4, currentY + 9.8);

  // Emissão
  const now = new Date();
  const emissoStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} às ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textMuted);
  doc.text("EMISSÃO DO RELATÓRIO", margin + colWidth * 2 + 4, currentY + 4.8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...textDark);
  doc.text(emissoStr, margin + colWidth * 2 + 4, currentY + 9.8);

  currentY += 16.5;

  // --- SEÇÃO 1: SEGURANÇA E MEIO AMBIENTE ---
  drawSectionHeader("1. SEGURANÇA, MEIO AMBIENTE E DDS");

  // Tema do DDS (se preenchido)
  if (temaDds && temaDds.trim()) {
    const cleanDds = sanitizePdfText(temaDds.trim());
    doc.setFillColor(239, 246, 255); // Blue 50
    doc.setDrawColor(191, 219, 254); // Blue 200

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    const splitDds = doc.splitTextToSize(cleanDds, contentWidth - 34);
    const ddsHeight = Math.max(7.5, splitDds.length * 3.4 + 4);

    doc.roundedRect(margin, currentY, contentWidth, ddsHeight, 1, 1, "FD");

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 64, 175); // Blue 800
    doc.text("TEMA DO DDS:", margin + 3, currentY + 4.8);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(splitDds, margin + 28, currentY + 4.8);

    currentY += ddsHeight + 2.5;
  }

  const validOcs = (ocorrencias || []).filter(
    oc => oc.eventoPrincipal?.trim() || oc.impactosDanos?.trim() || oc.acoesRealizadas?.trim() || oc.linhaDoTempo?.trim() || oc.condicaoRestricoes?.trim()
  );

  if (validOcs.length === 0) {
    doc.setFillColor(240, 253, 244); // Emerald 50
    doc.setDrawColor(187, 247, 208); // Emerald 200
    doc.roundedRect(margin, currentY, contentWidth, 8.5, 1.5, 1.5, "FD");

    // Left green accent
    doc.setFillColor(16, 185, 129); // Emerald 500
    doc.rect(margin, currentY, 2.5, 8.5, "F");

    doc.setTextColor(6, 95, 70); // Emerald 800
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("[STATUS OK] Turno Concluído Sem Ocorrências de Segurança, Quase-Acidentes ou Perdas de Processo.", margin + 5, currentY + 5.4);
    currentY += 12;
  } else {
    validOcs.forEach((oc, i) => {
      const evento = sanitizePdfText(oc.eventoPrincipal || "Ocorrência Crítica Registrada");
      const impactos = sanitizePdfText(oc.impactosDanos || "");
      const acoesReal = sanitizePdfText(oc.acoesRealizadas || "");
      const timeline = sanitizePdfText(oc.linhaDoTempo || "");
      const condicoes = sanitizePdfText(oc.condicaoRestricoes || "");

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      const textWrapWidth = contentWidth - 10;

      const splitEvento = doc.splitTextToSize(`[OCORRÊNCIA #${i + 1}] ${evento}`, textWrapWidth);
      const splitImpactos = impactos ? doc.splitTextToSize(impactos, textWrapWidth - 4) : [];
      const splitAcoes = acoesReal ? doc.splitTextToSize(acoesReal, textWrapWidth - 4) : [];
      const splitTimeline = timeline ? doc.splitTextToSize(timeline, textWrapWidth - 4) : [];
      const splitCondicoes = condicoes ? doc.splitTextToSize(condicoes, textWrapWidth - 4) : [];

      let totalOcHeight = 6 + splitEvento.length * 3.6;
      if (splitImpactos.length > 0) totalOcHeight += 4 + splitImpactos.length * 3.4 + 2;
      if (splitAcoes.length > 0) totalOcHeight += 4 + splitAcoes.length * 3.4 + 2;
      if (splitTimeline.length > 0) totalOcHeight += 4 + splitTimeline.length * 3.4 + 2;
      if (splitCondicoes.length > 0) totalOcHeight += 4 + splitCondicoes.length * 3.4 + 2;
      totalOcHeight += 2;

      checkPageBreak(Math.min(totalOcHeight, 50));

      const ocStartY = currentY;
      doc.setFillColor(254, 242, 242); // Red 50
      doc.setDrawColor(254, 202, 202); // Red 200

      // Title
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(185, 28, 28); // Red 700
      doc.text(splitEvento, margin + 4, currentY + 4.5);
      currentY += 4.5 + splitEvento.length * 3.6;

      const renderOcSection = (title: string, lines: string[]) => {
        if (lines.length === 0) return;
        checkPageBreak(lines.length * 3.4 + 6);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(153, 27, 27);
        doc.text(title, margin + 4, currentY);
        currentY += 3.4;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85);
        doc.text(lines, margin + 6, currentY);
        currentY += lines.length * 3.4 + 2;
      };

      renderOcSection("• Impactos e Danos:", splitImpactos);
      renderOcSection("• Ações Realizadas:", splitAcoes);
      renderOcSection("• Linha do Tempo:", splitTimeline);
      renderOcSection("• Condição Operacional e Restrições Atuais:", splitCondicoes);

      const actualBoxHeight = Math.max(12, currentY - ocStartY + 1);
      doc.roundedRect(margin, ocStartY, contentWidth, actualBoxHeight, 1, 1, "S");
      currentY += 4;
    });
  }

  // --- SEÇÃO 2: DESEMPENHO OPERACIONAL DOS SETORES ---
  drawSectionHeader("2. DESEMPENHO OPERACIONAL POR SETOR");

  // Iterate over sectors
  SETORES.forEach((setor, index) => {
    checkPageBreak(30);

    const sDados = dados[setor.id] || {};
    const setorNumber = index + 1;

    // Sector Banner Header
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.rect(margin, currentY, contentWidth, 6.5, "FD");

    doc.setFillColor(...primaryColor);
    doc.rect(margin, currentY, 2.5, 6.5, "F");

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`${setorNumber}. ${sanitizePdfText(setor.label.toUpperCase())}`, margin + 5, currentY + 4.5);

    currentY += 7.5;

    // Extract regular fields vs list fields (atividades / pendencias / pendencias_programacao)
    const paramRows: Array<[string, string, string, string, string]> = [];
    let atividadesList: string[] = [];
    let pendenciasList: string[] = [];
    let pendenciasProgramacaoList: string[] = [];
    let ocorrenciaText = "";

    setor.campos.forEach(campo => {
      const val = sDados[campo.id];

      if (campo.type === "atividades") {
        if (Array.isArray(val)) {
          atividadesList = val
            .filter(x => typeof x === "string" && x.trim().length > 0)
            .map(x => sanitizePdfText(x));
        }
      } else if (campo.type === "pendencias") {
        if (Array.isArray(val)) {
          pendenciasList = val
            .filter(x => typeof x === "string" && x.trim().length > 0)
            .map(x => sanitizePdfText(x));
        }
      } else if (campo.type === "pendencias_programacao") {
        if (Array.isArray(val)) {
          pendenciasProgramacaoList = val
            .filter(x => typeof x === "string" && x.trim().length > 0)
            .map(x => sanitizePdfText(x));
        }
      } else if (campo.id === "ocorrencias") {
        if (typeof val === "string" && val.trim().length > 0) {
          ocorrenciaText = sanitizePdfText(val.trim());
        }
      } else {
        // Regular number, text, or select
        let displayVal = val !== undefined && val !== null && val !== "" ? `${val}` : "-";
        if (displayVal !== "-" && campo.un) {
          displayVal = `${displayVal} ${campo.un}`;
        }

        let metaStr = campo.meta !== undefined ? `${campo.meta}${campo.un ? ` ${campo.un}` : ""}` : "-";
        if (campo.id.startsWith("elevacao_rake")) metaStr = "< 7 Pol (Atenção 7-11 / Crítico > 11)";
        else if (campo.id === "retido_meia" || campo.id.startsWith("retido_meia")) metaStr = "< 11% (Atenção 11-12 / Crítico > 12)";
        else if (campo.id === "total_autonomia" || campo.id.startsWith("total_autonomia")) metaStr = "> 4800 t (Atenção 3500-4800 / Crítico < 3500)";
        else if (campo.id === "producao_moagem" || (setor.id === "moagem" && campo.id.startsWith("producao"))) metaStr = "≥ 7200 t (Crítico < 7200)";
        else if (campo.id === "nivel_camara_a" || campo.id.startsWith("nivel_camara_a")) metaStr = "80 - 100% (Atenção 70-80 / Crítico < 70)";
        else if (campo.id.startsWith("solidos_45") || (setor.id === "espessamento_rejeito" && campo.id.startsWith("solidos_"))) metaStr = "63 - 66% (Crítico > 66%)";
        else if (campo.id.startsWith("torque_ep") || (setor.id === "espessamento_rejeito" && campo.id.startsWith("torque")) || (setor.id === "espessamento_conc" && campo.id.startsWith("torque"))) metaStr = "< 12% (Atenção 12-20 / Crítico > 20)";
        else if (setor.id === "remoagem" && campo.id === "produtividade") metaStr = "≤ 275 t/h (Crítico > 275)";
        else if (campo.id === "afericao_britadores") metaStr = "Realizado";
        else if (campo.id === "nivel_tanque" || campo.id === "ciclos") metaStr = "-";

        let status = "-";
        const rawAcao = sDados[`acao_${campo.id}`];
        let acaoText = rawAcao && String(rawAcao).trim() ? sanitizePdfText(String(rawAcao).trim()) : "-";

        if (val !== undefined && val !== "" && !isNaN(Number(val))) {
          const sType = st(val, campo.meta, campo.id, setor.id);

          if (campo.id.startsWith("paradas")) {
            status = "Apurado";
          } else if (campo.id.startsWith("elevacao_rake")) {
            status = sType === "ok" ? "OK (<7 Pol)" : sType === "alerta" ? "Atenção (7-11 Pol)" : "Crítico (>11 Pol)";
          } else if (campo.id === "retido_meia" || campo.id.startsWith("retido_meia")) {
            status = sType === "ok" ? "OK (<11%)" : sType === "alerta" ? "Atenção (11-12%)" : "Crítico (>12%)";
          } else if (campo.id === "total_autonomia" || campo.id.startsWith("total_autonomia")) {
            status = sType === "ok" ? "OK (>4800 t)" : sType === "alerta" ? "Atenção (3500-4800 t)" : "Crítico (<3500 t)";
          } else if (campo.id === "producao_moagem" || (setor.id === "moagem" && campo.id.startsWith("producao"))) {
            status = sType === "ok" ? "Atingida (≥7200 t)" : "Abaixo Meta (<7200 t)";
          } else if (campo.id === "nivel_camara_a" || campo.id.startsWith("nivel_camara_a")) {
            status = sType === "ok" ? "OK (80-100%)" : sType === "alerta" ? "Atenção (70-80%)" : "Crítico (<70%)";
          } else if (campo.id.startsWith("solidos_45") || (setor.id === "espessamento_rejeito" && campo.id.startsWith("solidos_"))) {
            status = sType === "ok" ? "OK (63-66%)" : sType === "alerta" ? "Atenção (<63%)" : "Crítico (>66%)";
          } else if (campo.id.startsWith("torque_ep") || (setor.id === "espessamento_rejeito" && campo.id.startsWith("torque")) || (setor.id === "espessamento_conc" && campo.id.startsWith("torque"))) {
            status = sType === "ok" ? "OK (<12%)" : sType === "alerta" ? "Atenção (12-20%)" : "Crítico (>20%)";
          } else if (setor.id === "remoagem" && campo.id === "produtividade") {
            status = sType === "ok" ? "OK (≤275 t/h)" : "Crítico (>275 t/h)";
          } else if (sType === "ok") {
            status = "Atingida";
          } else if (sType === "alerta") {
            status = "Alerta";
          } else if (sType === "critico") {
            status = "Abaixo Meta";
          } else {
            status = "Apurado";
          }

          if ((sType === "alerta" || sType === "critico") && acaoText === "-") {
            acaoText = "Pendente de tratativa";
          }
        } else if (val !== undefined && val !== "") {
          if (val === "Pendente") {
            status = "Pendente";
            if (acaoText === "-") {
              acaoText = "Pendente de tratativa";
            }
          } else if (val === "Realizado") {
            status = "Conforme";
          } else {
            status = "Apurado";
          }
        }

        paramRows.push([
          sanitizePdfText(campo.label),
          sanitizePdfText(displayVal),
          sanitizePdfText(metaStr),
          sanitizePdfText(status),
          acaoText,
        ]);
      }
    });

    // Draw Param Table
    if (paramRows.length > 0) {
      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [["Parâmetro / Indicador", "Valor Realizado", "Meta Referência", "Situação", "Tratativa"]],
        body: paramRows,
        theme: "striped",
        headStyles: {
          fillColor: [51, 65, 85], // Slate 700
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 7,
          cellPadding: 1.5,
          textColor: [30, 41, 59],
        },
        columnStyles: {
          0: { cellWidth: 46, fontStyle: "bold" },
          1: { cellWidth: 26, fontStyle: "bold", halign: "center" },
          2: { cellWidth: 32, halign: "center", textColor: [100, 116, 139] },
          3: { cellWidth: 26, halign: "center" },
          4: { cellWidth: "auto", halign: "left" },
        },
        didParseCell: (dataCell) => {
          if (dataCell.section === "body" && dataCell.column.index === 3) {
            const txt = String(dataCell.cell.raw);
            if (txt === "Atingida" || txt.startsWith("OK")) {
              dataCell.cell.styles.textColor = [16, 185, 129];
              dataCell.cell.styles.fontStyle = "bold";
            } else if (txt === "Alerta" || txt.startsWith("Atenção")) {
              dataCell.cell.styles.textColor = [217, 119, 6];
              dataCell.cell.styles.fontStyle = "bold";
            } else if (txt === "Abaixo Meta" || txt.startsWith("Crítico") || txt.includes("Parada")) {
              dataCell.cell.styles.textColor = [220, 38, 38];
              dataCell.cell.styles.fontStyle = "bold";
            }
          }
          if (dataCell.section === "body" && dataCell.column.index === 4) {
            const txt = String(dataCell.cell.raw);
            if (txt === "-" || !txt) {
              dataCell.cell.styles.textColor = [148, 163, 184];
              dataCell.cell.styles.halign = "center";
            } else if (txt === "Pendente de tratativa") {
              dataCell.cell.styles.textColor = [185, 28, 28];
              dataCell.cell.styles.fontStyle = "italic";
            } else {
              dataCell.cell.styles.textColor = [15, 23, 42];
              dataCell.cell.styles.fontStyle = "normal";
            }
          }
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 3;
    }

    // Atividades Realizadas Box
    if (atividadesList.length > 0) {
      checkPageBreak(10 + atividadesList.length * 4);
      doc.setFillColor(240, 253, 244); // Green 50
      doc.setDrawColor(187, 247, 208); // Green 200

      const atvStartY = currentY;
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(22, 101, 52); // Green 800
      doc.text("[ATIVIDADES REALIZADAS]", margin + 3, currentY + 3.5);
      currentY += 5.5;

      atividadesList.forEach(atv => {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(21, 128, 61);
        doc.setFontSize(7.5);
        const splitText = doc.splitTextToSize(`• ${atv}`, contentWidth - 8);
        doc.text(splitText, margin + 4, currentY);
        currentY += splitText.length * 3.4;
      });

      const atvBoxHeight = currentY - atvStartY + 1.5;
      doc.roundedRect(margin, atvStartY, contentWidth, atvBoxHeight, 1, 1, "S");
      currentY += 3;
    }

    // Pendências Críticas Box
    if (pendenciasList.length > 0) {
      checkPageBreak(10 + pendenciasList.length * 4);
      doc.setFillColor(254, 242, 242); // Red 50
      doc.setDrawColor(254, 202, 202); // Red 200

      const pendStartY = currentY;
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(185, 28, 28); // Red 700
      doc.text("[PENDÊNCIAS CRÍTICAS]", margin + 3, currentY + 3.5);
      currentY += 5.5;

      pendenciasList.forEach(pend => {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(153, 27, 27);
        doc.setFontSize(7.5);
        const splitText = doc.splitTextToSize(`• ${pend}`, contentWidth - 8);
        doc.text(splitText, margin + 4, currentY);
        currentY += splitText.length * 3.4;
      });

      const pendBoxHeight = currentY - pendStartY + 1.5;
      doc.roundedRect(margin, pendStartY, contentWidth, pendBoxHeight, 1, 1, "S");
      currentY += 3;
    }

    // Pendências de Acompanhamento (Programação) Box
    if (pendenciasProgramacaoList.length > 0) {
      checkPageBreak(10 + pendenciasProgramacaoList.length * 4);
      doc.setFillColor(240, 249, 255); // Sky 50
      doc.setDrawColor(186, 230, 253); // Sky 200

      const progStartY = currentY;
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(3, 105, 161); // Sky 700
      doc.text("[PENDÊNCIAS DE ACOMPANHAMENTO (PROGRAMAÇÃO)]", margin + 3, currentY + 3.5);
      currentY += 5.5;

      pendenciasProgramacaoList.forEach(pend => {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(12, 74, 110); // Sky 900
        doc.setFontSize(7.5);
        const splitText = doc.splitTextToSize(`• ${pend}`, contentWidth - 8);
        doc.text(splitText, margin + 4, currentY);
        currentY += splitText.length * 3.4;
      });

      const progBoxHeight = currentY - progStartY + 1.5;
      doc.roundedRect(margin, progStartY, contentWidth, progBoxHeight, 1, 1, "S");
      currentY += 3;
    }

    // Ocorrências do Setor (se houver texto)
    if (ocorrenciaText) {
      checkPageBreak(10);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text("Observações do Setor:", margin + 2, currentY + 3);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      const splitText = doc.splitTextToSize(ocorrenciaText, contentWidth - 4);
      doc.text(splitText, margin + 2, currentY + 6.5);
      currentY += 7.5 + splitText.length * 3.4;
    }

    currentY += 3.5;
  });

  // --- SEÇÃO 3: AÇÕES OPERATIVAS PARA O PRÓXIMO TURNO ---
  const acoesValidas = (acoes || [])
    .filter(a => a && a.trim().length > 0)
    .map(a => sanitizePdfText(a.trim()));

  if (acoesValidas.length > 0) {
    drawSectionHeader("3. AÇÕES OPERATIVAS PARA O PRÓXIMO TURNO");

    acoesValidas.forEach((acao, i) => {
      checkPageBreak(10);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);

      const splitText = doc.splitTextToSize(acao, contentWidth - 24);
      const rowHeight = Math.max(7, splitText.length * 3.5 + 3);
      doc.roundedRect(margin, currentY, contentWidth, rowHeight, 1, 1, "FD");

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      doc.text(`[AÇÃO ${i + 1}]`, margin + 3, currentY + 4.5);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(splitText, margin + 21, currentY + 4.5);

      currentY += rowHeight + 2;
    });

    currentY += 3;
  }

  // --- SEÇÃO 4: COMENTÁRIOS E OBSERVAÇÕES GERAIS ---
  if (obs && obs.trim().length > 0) {
    drawSectionHeader("4. COMENTÁRIOS OPERACIONAIS E DIRETRIZES GERAIS");

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);

    const cleanObs = sanitizePdfText(obs.trim());
    const splitObs = doc.splitTextToSize(cleanObs, contentWidth - 8);
    const boxH = Math.max(10, splitObs.length * 3.6 + 5);

    doc.roundedRect(margin, currentY, contentWidth, boxH, 1, 1, "FD");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    doc.text(splitObs, margin + 4, currentY + 4.5);

    currentY += boxH + 6;
  }

  // --- RODAPÉ EM TODAS AS PÁGINAS ---
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Top subtle bar on subsequent pages
    if (i > 1) {
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, 6, contentWidth, 5, "F");
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      const subTurnoLabel = turno === "diurno" ? "DIURNO" : "NOTURNO";
      doc.text(`RELATÓRIO DE TURNO · TURMA ${turma || "-"} · ${fmtData(data)} (${subTurnoLabel})`, margin + 2, 9.5);
    }

    // Bottom footer line
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text("Planta de Beneficiamento de Cobre · Sistema de Relatório de Turno", margin, pageHeight - 6);

    const pageStr = `Página ${i} de ${totalPages}`;
    doc.text(pageStr, pageWidth - margin - doc.getTextWidth(pageStr), pageHeight - 6);
  }

  // Save the PDF file with a clean timestamped filename
  const cleanDate = (data || "turno").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `Relatorio_Turno_${turma || "A"}_${turno || "diurno"}_${cleanDate}.pdf`;
  doc.save(fileName);
}
