/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SETORES, OcorrenciaPerdaSeguranca, fmtData } from "../types";

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

export function gerarRelatorioPDF(payload: PDFDataPayload) {
  const { data, turno, turma, temaDds, dados, ocorrencias, acoes, obs } = payload;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  let currentY = margin;

  // Ero Brasil Corporate Palette (Azul-Petróleo / Verde-Água / Teal Corporativo)
  const eroNavy: [number, number, number] = [10, 32, 40]; // #0A2028 (Deep Petrol Navy)
  const eroTeal: [number, number, number] = [0, 115, 105]; // #007369 (Ero Blue-Green / Teal)
  const eroTealDark: [number, number, number] = [0, 85, 78]; // #00554E
  const eroTealAccent: [number, number, number] = [20, 184, 166]; // #14B8A6 (Cyan Teal)
  const textDark: [number, number, number] = [15, 23, 42]; // #0F172A
  const textMuted: [number, number, number] = [100, 116, 139]; // #64748B
  const borderLight: [number, number, number] = [226, 232, 240]; // #E2E8F0
  const bgLight: [number, number, number] = [248, 250, 252]; // #F8FAFC

  // Helper for adding new page with header/footer
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 16) {
      doc.addPage();
      currentY = margin + 4;
    }
  };

  // --- HEADER BANNER ERO BRASIL ---
  doc.setFillColor(...eroNavy);
  doc.rect(margin, currentY, pageWidth - margin * 2, 26, "F");

  // Accent stripe teal/azul-verde
  doc.setFillColor(...eroTeal);
  doc.rect(margin, currentY, 4, 26, "F");

  // Logo Ero Brasil
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin + 7, currentY + 4, 30, 8, 1, 1, "F");
  doc.setFont("helvetica", "black");
  doc.setFontSize(10);
  doc.setTextColor(...eroTeal);
  doc.text("ERO", margin + 9, currentY + 10);
  doc.setTextColor(...eroNavy);
  doc.text("BRASIL", margin + 18.5, currentY + 10);

  // Title text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.text("RELATÓRIO OPERACIONAL DE PASSAGEM DE TURNO", margin + 42, currentY + 9.5);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(226, 232, 240);
  doc.text("Planta de Beneficiamento de Cobre | Mineração Caraíba & Complexo Tucumã", margin + 7, currentY + 17);

  doc.setFontSize(7);
  doc.setTextColor(165, 214, 210);
  doc.text("Registro Oficial de Produção, Desvios, Segurança, Indicadores dos Setores e Continuidade", margin + 7, currentY + 22.5);

  // Turma badge on header
  doc.setFillColor(15, 46, 56);
  doc.roundedRect(pageWidth - margin - 30, currentY + 4, 26, 18, 1.5, 1.5, "F");
  doc.setDrawColor(...eroTealAccent);
  doc.setLineWidth(0.4);
  doc.roundedRect(pageWidth - margin - 30, currentY + 4, 26, 18, 1.5, 1.5, "S");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("TURMA", pageWidth - margin - 26, currentY + 9.5);
  doc.setFontSize(12);
  doc.setTextColor(153, 246, 228);
  doc.text(turma || "-", pageWidth - margin - 21, currentY + 16.5);

  currentY += 29.5;

  // --- METADATA STRIP ---
  doc.setFillColor(...bgLight);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 13, 1.5, 1.5, "F");
  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 13, 1.5, 1.5, "S");

  const colWidth = (pageWidth - margin * 2) / 3;

  // Data
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textMuted);
  doc.text("DATA DO TURNO", margin + 4, currentY + 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);
  doc.text(fmtData(data) || "-", margin + 4, currentY + 9.5);

  // Turno
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textMuted);
  doc.text("TURNO OPERACIONAL", margin + colWidth + 4, currentY + 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);
  const turnoLabel = turno === "diurno" ? "☀️ Diurno (07h - 19h)" : "🌙 Noturno (19h - 07h)";
  doc.text(turnoLabel, margin + colWidth + 4, currentY + 9.5);

  // Emissão
  const now = new Date();
  const emissoStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} às ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textMuted);
  doc.text("EMISSÃO DO RELATÓRIO", margin + colWidth * 2 + 4, currentY + 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...eroTealDark);
  doc.text(emissoStr, margin + colWidth * 2 + 4, currentY + 9.5);

  currentY += 16.5;

  // --- SEÇÃO 1: SEGURANÇA E MEIO AMBIENTE ---
  checkPageBreak(30);
  doc.setFillColor(...eroNavy);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 7, 1, 1, "F");
  doc.setFillColor(...eroTeal);
  doc.rect(margin, currentY, 3.5, 7, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("1. SEGURANÇA, MEIO AMBIENTE E DDS", margin + 6, currentY + 4.8);

  currentY += 9.5;

  // Tema do DDS
  if (temaDds && temaDds.trim()) {
    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(153, 246, 228);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 8, 1, 1, "FD");

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 118, 110);
    doc.text("TEMA DO DDS:", margin + 4, currentY + 5.2);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textDark);
    const splitDds = doc.splitTextToSize(temaDds.trim(), pageWidth - margin * 2 - 32);
    doc.text(splitDds, margin + 28, currentY + 5.2);

    currentY += 10.5;
  }

  const validOcs = (ocorrencias || []).filter(
    oc => oc.eventoPrincipal?.trim() || oc.impactosDanos?.trim() || oc.acoesRealizadas?.trim() || oc.linhaDoTempo?.trim() || oc.condicaoRestricoes?.trim()
  );

  if (validOcs.length === 0) {
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 9, 1.5, 1.5, "FD");
    doc.setTextColor(6, 95, 70);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("✅ Turno Concluído Sem Ocorrências de Segurança, Quase-Acidentes ou Perdas de Processo.", margin + 4, currentY + 6);
    currentY += 12;
  } else {
    validOcs.forEach((oc, i) => {
      checkPageBreak(35);
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(254, 202, 202);

      const ocStartY = currentY;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(185, 28, 28);
      doc.text(`🚨 OCORRÊNCIA #${i + 1}: ${oc.eventoPrincipal || "Ocorrência Crítica Registrada"}`, margin + 4, currentY + 4);
      currentY += 7;

      if (oc.impactosDanos?.trim()) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.2);
        doc.setTextColor(153, 27, 27);
        doc.text("• Impactos e Danos:", margin + 4, currentY);
        currentY += 3.8;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85);
        const splitText = doc.splitTextToSize(oc.impactosDanos.trim(), pageWidth - margin * 2 - 8);
        doc.text(splitText, margin + 6, currentY);
        currentY += splitText.length * 3.5 + 2;
      }

      if (oc.acoesRealizadas?.trim()) {
        checkPageBreak(15);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.2);
        doc.setTextColor(153, 27, 27);
        doc.text("• Ações Realizadas:", margin + 4, currentY);
        currentY += 3.8;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85);
        const splitText = doc.splitTextToSize(oc.acoesRealizadas.trim(), pageWidth - margin * 2 - 8);
        doc.text(splitText, margin + 6, currentY);
        currentY += splitText.length * 3.5 + 2;
      }

      if (oc.linhaDoTempo?.trim()) {
        checkPageBreak(15);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.2);
        doc.setTextColor(153, 27, 27);
        doc.text("• Linha do Tempo:", margin + 4, currentY);
        currentY += 3.8;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85);
        const splitText = doc.splitTextToSize(oc.linhaDoTempo.trim(), pageWidth - margin * 2 - 8);
        doc.text(splitText, margin + 6, currentY);
        currentY += splitText.length * 3.5 + 2;
      }

      if (oc.condicaoRestricoes?.trim()) {
        checkPageBreak(15);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.2);
        doc.setTextColor(153, 27, 27);
        doc.text("• Condição Operacional e Restrições Atuais:", margin + 4, currentY);
        currentY += 3.8;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85);
        const splitText = doc.splitTextToSize(oc.condicaoRestricoes.trim(), pageWidth - margin * 2 - 8);
        doc.text(splitText, margin + 6, currentY);
        currentY += splitText.length * 3.5 + 2;
      }

      const boxHeight = currentY - ocStartY + 1;
      doc.roundedRect(margin, ocStartY, pageWidth - margin * 2, boxHeight, 1, 1, "S");
      currentY += 4;
    });
  }

  // --- SEÇÃO 2: DESEMPENHO OPERACIONAL DOS SETORES ---
  checkPageBreak(30);
  doc.setFillColor(...eroNavy);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 7, 1, 1, "F");
  doc.setFillColor(...eroTeal);
  doc.rect(margin, currentY, 3.5, 7, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("2. DESEMPENHO OPERACIONAL POR SETOR", margin + 6, currentY + 4.8);

  currentY += 10;

  // Iterate over sectors
  SETORES.forEach((setor, index) => {
    checkPageBreak(35);

    const sDados = dados[setor.id] || {};
    const setorNumber = index + 1;

    // Sector Banner Header
    doc.setFillColor(...bgLight);
    doc.setDrawColor(...borderLight);
    doc.rect(margin, currentY, pageWidth - margin * 2, 6, "FD");

    doc.setFillColor(...eroTeal);
    doc.rect(margin, currentY, 3.5, 6, "F");

    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`${setorNumber}. ${setor.label.toUpperCase()}`, margin + 6, currentY + 4.2);

    currentY += 8;

    const paramRows: Array<[string, string, string, string]> = [];
    let atividadesList: string[] = [];
    let pendenciasList: string[] = [];
    let ocorrenciaText = "";

    setor.campos.forEach(campo => {
      const val = sDados[campo.id];

      if (campo.type === "atividades") {
        if (Array.isArray(val)) {
          atividadesList = val.filter(x => typeof x === "string" && x.trim().length > 0);
        }
      } else if (campo.type === "pendencias") {
        if (Array.isArray(val)) {
          pendenciasList = val.filter(x => typeof x === "string" && x.trim().length > 0);
        }
      } else if (campo.id === "ocorrencias") {
        if (typeof val === "string" && val.trim().length > 0) {
          ocorrenciaText = val.trim();
        }
      } else {
        let displayVal = val !== undefined && val !== null && val !== "" ? `${val}` : "-";
        if (displayVal !== "-" && campo.un) {
          displayVal = `${displayVal} ${campo.un}`;
        }

        let metaStr = campo.meta !== undefined ? `${campo.meta}${campo.un ? ` ${campo.un}` : ""}` : "-";
        let status = "-";

        if (campo.meta !== undefined && val !== undefined && val !== "" && !isNaN(Number(val))) {
          const numVal = Number(val);
          if (campo.id === "paradas_manutencao" || campo.id === "paradas_outros") {
            status = numVal === 0 ? "OK (0h)" : `${numVal}h Parada`;
          } else if (numVal >= campo.meta) {
            status = "Atingida";
          } else {
            status = "Abaixo Meta";
          }
        } else if (val !== undefined && val !== "") {
          status = "Apurado";
        }

        paramRows.push([campo.label, displayVal, metaStr, status]);
      }
    });

    if (paramRows.length > 0) {
      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [["Parâmetro / Indicador", "Valor Realizado", "Meta Referência", "Situação"]],
        body: paramRows,
        theme: "grid",
        headStyles: {
          fillColor: [...eroNavy],
          textColor: [255, 255, 255],
          fontSize: 6.8,
          fontStyle: "bold",
          cellPadding: 1.6,
        },
        styles: {
          fontSize: 6.8,
          cellPadding: 1.4,
          textColor: [...textDark],
          lineColor: [...borderLight],
          lineWidth: 0.2,
        },
        alternateRowStyles: {
          fillColor: [...bgLight],
        },
        columnStyles: {
          0: { cellWidth: 70, fontStyle: "bold" },
          1: { cellWidth: 40, fontStyle: "bold", halign: "center" },
          2: { cellWidth: 35, halign: "center", textColor: [...textMuted] },
          3: { cellWidth: "auto", halign: "center", fontStyle: "bold" },
        },
        didParseCell: (dataCell) => {
          if (dataCell.section === "body" && dataCell.column.index === 3) {
            const txt = String(dataCell.cell.raw);
            if (txt === "Atingida" || txt.startsWith("OK")) {
              dataCell.cell.styles.textColor = [13, 148, 136];
            } else if (txt === "Abaixo Meta" || txt.includes("Parada")) {
              dataCell.cell.styles.textColor = [220, 38, 38];
            }
          }
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 4;
    }

    // Atividades Realizadas Box
    if (atividadesList.length > 0) {
      checkPageBreak(12 + atividadesList.length * 4);
      doc.setFillColor(240, 253, 250);
      doc.setDrawColor(153, 246, 228);

      doc.setFontSize(7.2);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 118, 110);
      doc.text("✔️ ATIVIDADES REALIZADAS:", margin + 3, currentY + 3.5);
      currentY += 5.5;

      atividadesList.forEach(atv => {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(17, 94, 89);
        doc.setFontSize(7.2);
        const splitText = doc.splitTextToSize(`• ${atv}`, pageWidth - margin * 2 - 8);
        doc.text(splitText, margin + 4, currentY);
        currentY += splitText.length * 3.5;
      });

      currentY += 2;
    }

    // Pendências Críticas Box
    if (pendenciasList.length > 0) {
      checkPageBreak(12 + pendenciasList.length * 4);
      doc.setFillColor(255, 247, 237);
      doc.setDrawColor(254, 215, 170);

      doc.setFontSize(7.2);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(154, 52, 18);
      doc.text("🔴 PENDÊNCIAS CRÍTICAS / ACOMPANHAMENTO:", margin + 3, currentY + 3.5);
      currentY += 5.5;

      pendenciasList.forEach(pend => {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(194, 65, 12);
        doc.setFontSize(7.2);
        const splitText = doc.splitTextToSize(`• ${pend}`, pageWidth - margin * 2 - 8);
        doc.text(splitText, margin + 4, currentY);
        currentY += splitText.length * 3.5;
      });

      currentY += 2;
    }

    // Ocorrências do Setor
    if (ocorrenciaText) {
      checkPageBreak(10);
      doc.setFontSize(7.2);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textMuted);
      doc.text("Observações do Setor:", margin + 2, currentY + 3);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...textDark);
      const splitText = doc.splitTextToSize(ocorrenciaText, pageWidth - margin * 2 - 4);
      doc.text(splitText, margin + 2, currentY + 7);
      currentY += 8 + splitText.length * 3.5;
    }

    currentY += 4;
  });

  // --- SEÇÃO 3: AÇÕES OPERATIVAS PARA O PRÓXIMO TURNO ---
  const acoesValidas = (acoes || []).filter(a => a && a.trim().length > 0);
  if (acoesValidas.length > 0) {
    checkPageBreak(25 + acoesValidas.length * 5);
    doc.setFillColor(...eroNavy);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 7, 1, 1, "F");
    doc.setFillColor(...eroTeal);
    doc.rect(margin, currentY, 3.5, 7, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("3. AÇÕES OPERATIVAS PARA O PRÓXIMO TURNO", margin + 6, currentY + 4.8);

    currentY += 9.5;

    acoesValidas.forEach((acao, i) => {
      doc.setFillColor(...bgLight);
      doc.setDrawColor(...borderLight);
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 7, 1, 1, "FD");

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...eroTealDark);
      doc.text(`[AÇÃO ${i + 1}]`, margin + 3, currentY + 4.8);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...textDark);
      const splitText = doc.splitTextToSize(acao, pageWidth - margin * 2 - 25);
      doc.text(splitText, margin + 22, currentY + 4.8);

      currentY += 8.5;
    });

    currentY += 3;
  }

  // --- SEÇÃO 4: COMENTÁRIOS E OBSERVAÇÕES GERAIS ---
  if (obs && obs.trim().length > 0) {
    checkPageBreak(25);
    doc.setFillColor(...eroNavy);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 7, 1, 1, "F");
    doc.setFillColor(...eroTeal);
    doc.rect(margin, currentY, 3.5, 7, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("4. COMENTÁRIOS OPERACIONAIS E DIRETRIZES GERAIS", margin + 6, currentY + 4.8);

    currentY += 9.5;

    doc.setFillColor(...bgLight);
    doc.setDrawColor(...borderLight);

    const splitObs = doc.splitTextToSize(obs.trim(), pageWidth - margin * 2 - 8);
    const boxH = Math.max(12, splitObs.length * 4 + 6);

    doc.roundedRect(margin, currentY, pageWidth - margin * 2, boxH, 1, 1, "FD");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textDark);
    doc.text(splitObs, margin + 4, currentY + 5);

    currentY += boxH + 6;
  }

  // --- RODAPÉ CORPORATIVO ERO BRASIL EM TODAS AS PÁGINAS ---
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Linha divisória do rodapé
    doc.setDrawColor(...borderLight);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 9, pageWidth - margin, pageHeight - 9);

    // Texto do rodapé
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...eroTealDark);
    doc.text("ERO BRASIL", margin, pageHeight - 5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textMuted);
    doc.text(
      ` | Planta Cobre • Relatório Operacional de Passagem de Turno • Turma ${turma || "-"} (${turno === "diurno" ? "DIURNO" : "NOTURNO"}) • ${fmtData(data)}`,
      margin + 17,
      pageHeight - 5
    );

    doc.setFont("helvetica", "bold");
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - margin,
      pageHeight - 5,
      { align: "right" }
    );
  }

  const cleanDate = (data || "turno").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `EroBrasil_Relatorio_Turno_${turma || "A"}_${turno || "diurno"}_${cleanDate}.pdf`;
  doc.save(fileName);
}
