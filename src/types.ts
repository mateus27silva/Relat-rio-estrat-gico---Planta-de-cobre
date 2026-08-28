/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Campo {
  id: string;
  label: string;
  type: "number" | "text" | "select" | "atividades" | "pendencias" | "pendencias_programacao";
  meta?: number;
  un?: string;
  opcoes?: string[];
}

export interface Setor {
  id: string;
  label: string;
  icon: string;
  cor: "teal" | "blue" | "amber" | "purple" | "coral" | "green" | "gray" | "pink" | "indigo" | "cyan";
  campos: Campo[];
}

export interface TurnoOption {
  id: "diurno" | "noturno";
  label: string;
  hora: string;
  icon: string;
}

export type StatusType = "ok" | "alerta" | "critico" | "nd";

export const SENHA_SUPERVISOR = "Supervisor0101";

export const TURNOS: TurnoOption[] = [
  { id: "diurno", label: "Diurno", hora: "07:00 → 19:00", icon: "Sun" },
  { id: "noturno", label: "Noturno", hora: "19:00 → 07:00", icon: "Moon" },
];

export const TURMAS = ["A", "B", "C", "D"];

export const SETORES: Setor[] = [
  {
    id: "britagem_primaria",
    label: "Britagem Primária",
    icon: "Hammer",
    cor: "teal",
    campos: [
      { id: "alimentacao", label: "Produtividade", type: "number", meta: 1000, un: "t/h" },
      {
        id: "posicao_manto",
        label: "Posição do manto",
        type: "select",
        opcoes: [
          "0%", "5%", "10%", "15%", "20%", "25%", "30%", "35%", "40%", "45%", 
          "50%", "55%", "60%", "65%", "70%", "75%", "80%", "85%", "90%", "95%", "100%"
        ],
      },
      {
        id: "afericao_britadores",
        label: "Aferição dos britadores",
        type: "select",
        opcoes: ["Realizado", "Pendente"],
      },
      { id: "paradas_manutencao", label: "Paradas de Manutenção", type: "number", un: "h" },
      { id: "paradas_outros", label: "Paradas de Outros (OUT)", type: "number", un: "h" },
      { id: "estoque_msb", label: "Estoque MSB", type: "number", un: "t" },
      { id: "estoque_surubim", label: "Estoque Surubim", type: "number", un: "t" },
      { id: "estoque_vermelhos", label: "Estoque vermelhos", type: "number", un: "t" },
      { id: "estoque_sucuarana", label: "Estoque Suçuarana", type: "number", un: "t" },
      { id: "estoque_total", label: "Estoque total", type: "number", un: "t" },
      { id: "disponibilidade", label: "Disponibilidade", type: "number", meta: 85, un: "%" },
      { id: "utilizacao", label: "Utilização", type: "number", meta: 80, un: "%" },
      { id: "ocorrencias", label: "Ocorrências", type: "text" },
      { id: "atividades", label: "Atividades realizadas", type: "atividades" },
      { id: "pendencias", label: "Pendências críticas", type: "pendencias" },
      { id: "pendencias_programacao", label: "Pendências de acompanhamento (Programação)", type: "pendencias_programacao" },
    ],
  },
  {
    id: "rebritagem",
    label: "Rebritagem",
    icon: "Columns",
    cor: "blue",
    campos: [
      { id: "producao_bypass", label: "Produção bypass", type: "number", un: "t" },
      { id: "producao_patio", label: "Produção pátio", type: "number", un: "t" },
      { id: "alimentacao", label: "Produtividade", type: "number", meta: 1000, un: "t/h" },
      { id: "retido_meia", label: "% retido em 1/2", type: "number", meta: 11, un: "%" },
      { id: "pilha_intermediaria", label: "Pilha intermediária", type: "number", un: "t" },
      {
        id: "afericao_britadores",
        label: "Aferição dos britadores",
        type: "select",
        opcoes: ["Realizado", "Pendente"],
      },
      { id: "afericao_42br001", label: "42BR001 (Aferição)", type: "number", un: "mm" },
      { id: "afericao_42br002", label: "42BR002 (Aferição)", type: "number", un: "mm" },
      { id: "afericao_42br003", label: "42BR003 (Aferição)", type: "number", un: "mm" },
      { id: "afericao_42br004", label: "42BR004 (Aferição)", type: "number", un: "mm" },
      { id: "afericao_42br005", label: "42BR005 (Aferição)", type: "number", un: "mm" },
      { id: "afericao_42br006", label: "42BR006 (Aferição)", type: "number", un: "mm" },
      { id: "paradas_manutencao", label: "Paradas de Manutenção", type: "number", un: "h" },
      { id: "paradas_outros", label: "Paradas de Outros (OUT)", type: "number", un: "h" },
      { id: "producao_total", label: "Produção total", type: "number", un: "t" },
      { id: "disponibilidade", label: "Disponibilidade", type: "number", meta: 88, un: "%" },
      { id: "utilizacao", label: "Utilização", type: "number", meta: 85, un: "%" },
      { id: "ocorrencias", label: "Ocorrências", type: "text" },
      { id: "atividades", label: "Atividades realizadas", type: "atividades" },
      { id: "pendencias", label: "Pendências críticas", type: "pendencias" },
      { id: "pendencias_programacao", label: "Pendências de acompanhamento (Programação)", type: "pendencias_programacao" },
    ],
  },
  {
    id: "patio_silos",
    label: "Pátio e Silos",
    icon: "Warehouse",
    cor: "amber",
    campos: [
      { id: "estoque_patio", label: "Estoque Pátio", type: "number", un: "t" },
      { id: "nivel_silo1", label: "Nível Silo 1", type: "number", un: "%" },
      { id: "nivel_silo2", label: "Nível Silo 2", type: "number", un: "%" },
      { id: "retomador", label: "Retomador", type: "select", opcoes: ["Operando", "Parado", "Manutenção", "Standby", "Sim", "Não", "Parcial"] },
      { id: "paradas_manutencao", label: "Paradas de Manutenção", type: "number", un: "h" },
      { id: "paradas_outros", label: "Paradas de Outros (OUT)", type: "number", un: "h" },
      { id: "total_autonomia", label: "Total Autonomia minério", type: "number", meta: 4800, un: "t" },
      { id: "disponibilidade", label: "Disponibilidade", type: "number", meta: 90, un: "%" },
      { id: "utilizacao", label: "Utilização", type: "number", meta: 85, un: "%" },
      { id: "ocorrencias", label: "Ocorrências", type: "text" },
      { id: "atividades", label: "Atividades realizadas", type: "atividades" },
      { id: "pendencias", label: "Pendências críticas", type: "pendencias" },
      { id: "pendencias_programacao", label: "Pendências de acompanhamento (Programação)", type: "pendencias_programacao" },
    ],
  },
  {
    id: "moagem",
    label: "Moagem",
    icon: "CircleDot",
    cor: "purple",
    campos: [
      { id: "producao_moagem", label: "Produção Moagem", type: "number", meta: 7200, un: "t" },
      { id: "prod_mi003", label: "Produtividade 43MI003", type: "number", meta: 200, un: "t/h" },
      { id: "prod_mi004", label: "Produtividade 43MI004", type: "number", meta: 200, un: "t/h" },
      { id: "prod_mi005", label: "Produtividade 43MI005", type: "number", meta: 200, un: "t/h" },
      { id: "granulometria_mi03", label: "Percentual 105microns (43MI003)", type: "number", meta: 62, un: "%" },
      { id: "granulometria_mi04", label: "Percentual 105microns (43MI004)", type: "number", meta: 62, un: "%" },
      { id: "granulometria_mi05", label: "Percentual 105microns (43MI005)", type: "number", meta: 62, un: "%" },
      { id: "solidos_ovf_mi03", label: "% Sólidos overflow (43MI003)", type: "number", un: "%" },
      { id: "solidos_ovf_mi04", label: "% Sólidos overflow (43MI004)", type: "number", un: "%" },
      { id: "solidos_ovf_mi05", label: "% Sólidos overflow (43MI005)", type: "number", un: "%" },
      { id: "paradas_manutencao", label: "Paradas de Manutenção", type: "number", un: "h" },
      { id: "paradas_outros", label: "Paradas de Outros (OUT)", type: "number", un: "h" },
      { id: "produtividade_total", label: "Produtividade Total", type: "number", meta: 600, un: "t/h" },
      { id: "disponibilidade", label: "Disponibilidade", type: "number", meta: 90, un: "%" },
      { id: "utilizacao", label: "Utilização", type: "number", meta: 85, un: "%" },
      { id: "ocorrencias", label: "Ocorrências", type: "text" },
      { id: "atividades", label: "Atividades realizadas", type: "atividades" },
      { id: "pendencias", label: "Pendências críticas", type: "pendencias" },
      { id: "pendencias_programacao", label: "Pendências de acompanhamento (Programação)", type: "pendencias_programacao" },
    ],
  },
  {
    id: "remoagem",
    label: "Remoagem",
    icon: "RotateCw",
    cor: "indigo",
    campos: [
      { id: "produtividade", label: "Produtividade", type: "number", meta: 275, un: "t/h" },
      { id: "densidade", label: "Densidade", type: "number", un: "g/t" },
      { id: "torque", label: "Torque", type: "number", un: "%" },
      { id: "granulometria_p80", label: "P80", type: "number", un: "microns" },
      { id: "potencia_moinho", label: "Potência do moinho", type: "number", un: "kWh" },
      { id: "peneiras_operacao", label: "Número de peneiras em operação", type: "number", un: "" },
      { id: "decks_parados", label: "Número de decks parados", type: "number", un: "" },
      { id: "paradas_manutencao", label: "Paradas de Manutenção", type: "number", un: "h" },
      { id: "paradas_outros", label: "Paradas de Outros (OUT)", type: "number", un: "h" },
      { id: "disponibilidade", label: "Disponibilidade", type: "number", meta: 90, un: "%" },
      { id: "utilizacao", label: "Utilização", type: "number", meta: 85, un: "%" },
      { id: "ocorrencias", label: "Ocorrências", type: "text" },
      { id: "atividades", label: "Atividades realizadas", type: "atividades" },
      { id: "pendencias", label: "Pendências críticas", type: "pendencias" },
      { id: "pendencias_programacao", label: "Pendências de acompanhamento (Programação)", type: "pendencias_programacao" },
    ],
  },
  {
    id: "flotacao",
    label: "Flotação de Cobre",
    icon: "Droplets",
    cor: "coral",
    campos: [
      { id: "circuito", label: "Circuito", type: "select", opcoes: ["CI", "CII", "CIII", "CIV"] },
      { id: "teor_alimentacao", label: "Teor Alim. Cu", type: "number", un: "%" },
      { id: "teor_concentrado", label: "Teor Conc. Cu", type: "number", meta: 33.5, un: "%" },
      { id: "teor_rejeito", label: "Teor Rejeito Final Cu", type: "number", meta: 0.10, un: "%" },
      { id: "ph_rougher", label: "pH Linha principal", type: "number", meta: 9.5, un: "" },
      { id: "ph_segunda_linha", label: "pH Segunda linha", type: "number", meta: 10.5, un: "" },
      { id: "consumo_coletor", label: "Coletor", type: "number", meta: 35, un: "g/t" },
      { id: "consumo_espumante", label: "Espumante", type: "number", meta: 25, un: "g/t" },
      { id: "consumo_dispersante", label: "Dispersante", type: "number", meta: 25, un: "g/t" },
      { id: "consumo_cmc", label: "CMC", type: "number", meta: 200, un: "g/t" },
      { id: "consumo_amidex", label: "Amidex", type: "number", meta: 60, un: "g/t" },
      { id: "recuperacao", label: "Recuperação Metalúrgica", type: "number", un: "%" },
      { id: "metal_contido", label: "Metal", type: "number", un: "t" },
      { id: "concentrado", label: "Concentrado", type: "number", un: "t" },
      { id: "ocorrencias", label: "Ocorrências", type: "text" },
      { id: "atividades", label: "Atividades realizadas", type: "atividades" },
      { id: "pendencias", label: "Pendências críticas", type: "pendencias" },
      { id: "pendencias_programacao", label: "Pendências de acompanhamento (Programação)", type: "pendencias_programacao" },
    ],
  },
  {
    id: "espessamento_conc",
    label: "Espessamento Conc.",
    icon: "Filter",
    cor: "green",
    campos: [
      { id: "espessador_operacao", label: "Espessador em operação", type: "select", opcoes: ["44EP001", "44EP002", "Ambos"] },
      { id: "densidade_underflow", label: "Dens. Underflow", type: "number", meta: 1.85, un: "t/m³" },
      { id: "solidos_44ep001", label: "Percentual de sólidos 44EP001", type: "number", meta: 65, un: "%" },
      { id: "solidos_44ep002", label: "Percentual de sólidos 44EP002", type: "number", meta: 65, un: "%" },
      { id: "nivel_tanque", label: "Nível 44TQ001", type: "number", un: "%" },
      { id: "consumo_floculante", label: "Floculante", type: "number", meta: 25, un: "mL/min" },
      { id: "elevacao_rake_ep001", label: "Elevação do Rake 44EP001", type: "number", meta: 7, un: "Pol" },
      { id: "elevacao_rake_ep002", label: "Elevação do Rake 44EP002", type: "number", meta: 7, un: "Pol" },
      { id: "torque_ep001", label: "Torque 44EP001", type: "number", meta: 12, un: "%" },
      { id: "torque_ep002", label: "Torque 44EP002", type: "number", meta: 12, un: "%" },
      { id: "ocorrencias", label: "Ocorrências", type: "text" },
      { id: "atividades", label: "Atividades realizadas", type: "atividades" },
      { id: "pendencias", label: "Pendências críticas", type: "pendencias" },
      { id: "pendencias_programacao", label: "Pendências de acompanhamento (Programação)", type: "pendencias_programacao" },
    ],
  },
  {
    id: "espessamento_rejeito",
    label: "Espessamento Rejeito",
    icon: "FilterX",
    cor: "gray",
    campos: [
      { id: "espessador_operacao", label: "Espessador em operação", type: "select", opcoes: ["45EP001", "45EP002", "Ambos"] },
      { id: "densidade_underflow", label: "Dens. Underflow", type: "number", meta: 1.70, un: "t/m³" },
      { id: "solidos_45ep001", label: "Percentual de sólidos 45EP001", type: "number", meta: 63, un: "%" },
      { id: "solidos_45ep002", label: "Percentual de sólidos 45EP002", type: "number", meta: 63, un: "%" },
      { id: "solidos_45bh01", label: "Percentual de sólidos 45BH01", type: "number", meta: 63, un: "%" },
      { id: "solidos_45bh02", label: "Percentual de sólidos 45BH02", type: "number", meta: 63, un: "%" },
      { id: "solidos_45bh03", label: "Percentual de sólidos 45BH03", type: "number", meta: 63, un: "%" },
      { id: "consumo_floculante", label: "Floculante", type: "number", meta: 18, un: "mL/min" },
      { id: "torque_ep001", label: "Torque 45EP001", type: "number", meta: 12, un: "%" },
      { id: "torque_ep002", label: "Torque 45EP002", type: "number", meta: 12, un: "%" },
      { id: "htr_linha1", label: "HTR Linha 1", type: "number", un: "h" },
      { id: "htr_linha2", label: "HTR Linha 2", type: "number", un: "h" },
      { id: "htr_linha3", label: "HTR Linha 3", type: "number", un: "h" },
      { id: "htr_linha4", label: "HTR Linha 4", type: "number", un: "h" },
      { id: "htr_past_fill", label: "HTR Past Fill", type: "number", un: "h" },
      { id: "ocorrencias", label: "Ocorrências", type: "text" },
      { id: "atividades", label: "Atividades realizadas", type: "atividades" },
      { id: "pendencias", label: "Pendências críticas", type: "pendencias" },
      { id: "pendencias_programacao", label: "Pendências de acompanhamento (Programação)", type: "pendencias_programacao" },
    ],
  },
  {
    id: "filtro_prensa",
    label: "Filtro Prensa Conc.",
    icon: "Layers",
    cor: "pink",
    campos: [
      { id: "umidade", label: "Umidade do Bolo", type: "number", meta: 9.5, un: "%" },
      { id: "producao_filtro", label: "Produção do filtro", type: "number", un: "t" },
      { id: "producao", label: "Produtividade", type: "number", meta: 30, un: "t/h" },
      { id: "tempo_sopro", label: "Tempo de sopro", type: "number", un: "min" },
      { id: "vazao_fim_compactacao", label: "Vazão ao final da compactação", type: "number", meta: 45, un: "m³/h" },
      { id: "pressao_fim_compactacao", label: "Pressão final da compactação", type: "number", meta: 230, un: "kPa" },
      { id: "setpoint_peso_torta", label: "Setpoint Peso da torta", type: "number", meta: 8000, un: "kg" },
      { id: "solido_overflow", label: "Sólido do overflow", type: "number", un: "ppm" },
      { id: "paradas_manutencao", label: "Paradas de Manutenção", type: "number", un: "h" },
      { id: "paradas_outros", label: "Paradas de Outros (OUT)", type: "number", un: "h" },
      { id: "disponibilidade", label: "Disponibilidade", type: "number", meta: 90, un: "%" },
      { id: "utilizacao", label: "Utilização", type: "number", meta: 85, un: "%" },
      { id: "ocorrencias", label: "Ocorrências", type: "text" },
      { id: "atividades", label: "Atividades realizadas", type: "atividades" },
      { id: "pendencias", label: "Pendências críticas", type: "pendencias" },
      { id: "pendencias_programacao", label: "Pendências de acompanhamento (Programação)", type: "pendencias_programacao" },
    ],
  },
  {
    id: "utilidades",
    label: "Utilidades",
    icon: "Wrench",
    cor: "cyan",
    campos: [
      { id: "pressao_ar", label: "Pressão Ar Comprimido", type: "number", meta: 7.0, un: "bar" },
      { id: "eta_agua_recuperada", label: "ETA água recuperada", type: "number", meta: 75, un: "%" },
      { id: "eta_agua_bruta", label: "ETA água bruta", type: "number", meta: 70, un: "%" },
      { id: "nivel_camara_a", label: "Nível da câmara A", type: "number", meta: 80, un: "%" },
      { id: "vazao_agua_nova", label: "Vazão Captação Água Nova", type: "number", un: "m³/h" },
      { id: "compressores", label: "Compressores em Operação", type: "select", opcoes: ["Comp 01", "Comp 02", "Comp 03", "Comp 01 e 02", "Comp 01 e 03", "Comp 02 e 03", "Todos em Operação"] },
      { id: "bombas_agua", label: "Bombas Água de Processo", type: "select", opcoes: ["Bomba 01", "Bomba 02", "Ambas em Operação"] },
      { id: "paradas_manutencao", label: "Paradas de Manutenção", type: "number", un: "h" },
      { id: "paradas_outros", label: "Paradas de Outros (OUT)", type: "number", un: "h" },
      { id: "disponibilidade", label: "Disponibilidade", type: "number", meta: 95, un: "%" },
      { id: "utilizacao", label: "Utilização", type: "number", meta: 90, un: "%" },
      { id: "ocorrencias", label: "Ocorrências", type: "text" },
      { id: "atividades", label: "Atividades realizadas", type: "atividades" },
      { id: "pendencias", label: "Pendências críticas", type: "pendencias" },
      { id: "pendencias_programacao", label: "Pendências de acompanhamento (Programação)", type: "pendencias_programacao" },
    ],
  },
];

export const COR = {
  teal:   { bg: "bg-[#E1F5EE]", bd: "border-[#0F6E56]", tx: "text-[#085041]", hover: "hover:bg-[#d0f0e4]", textNormal: "#085041", primary: "#0F6E56" },
  blue:   { bg: "bg-[#E6F1FB]", bd: "border-[#185FA5]", tx: "text-[#0C447C]", hover: "hover:bg-[#d3e7f8]", textNormal: "#0C447C", primary: "#185FA5" },
  amber:  { bg: "bg-[#FAEEDA]", bd: "border-[#854F0B]", tx: "text-[#633806]", hover: "hover:bg-[#f6ebd4]", textNormal: "#633806", primary: "#854F0B" },
  purple: { bg: "bg-[#EEEDFE]", bd: "border-[#534AB7]", tx: "text-[#3C3489]", hover: "hover:bg-[#e4e1fc]", textNormal: "#3C3489", primary: "#534AB7" },
  coral:  { bg: "bg-[#FAECE7]", bd: "border-[#993C1D]", tx: "text-[#712B13]", hover: "hover:bg-[#f8ded4]", textNormal: "#712B13", primary: "#993C1D" },
  green:  { bg: "bg-[#EAF3DE]", bd: "border-[#3B6D11]", tx: "text-[#27500A]", hover: "hover:bg-[#dfedce]", textNormal: "#27500A", primary: "#3B6D11" },
  gray:   { bg: "bg-[#F1EFE8]", bd: "border-[#5F5E5A]", tx: "text-[#444441]", hover: "hover:bg-[#e8e4db]", textNormal: "#444441", primary: "#5F5E5A" },
  pink:   { bg: "bg-[#FBEAF0]", bd: "border-[#993556]", tx: "text-[#72243E]", hover: "hover:bg-[#f9d8e5]", textNormal: "#72243E", primary: "#993556" },
  indigo: { bg: "bg-[#EEF2FF]", bd: "border-[#4338CA]", tx: "text-[#312E81]", hover: "hover:bg-[#e0e7ff]", textNormal: "#312E81", primary: "#4338CA" },
  cyan:   { bg: "bg-[#ECFEFF]", bd: "border-[#0891B2]", tx: "text-[#155E75]", hover: "hover:bg-[#cffafe]", textNormal: "#155E75", primary: "#0891B2" },
};

export function st(val: string | number, meta: number | undefined, id: string, setorId?: string): StatusType {
  if (val === "" || val === undefined || val === null) return "nd";
  const v = parseFloat(val as string);
  if (isNaN(v)) return "nd";

  // Paradas não possuem meta (apenas registro de horas)
  if (id.startsWith("paradas")) {
    return "nd";
  }

  // Elevação do Rake (Espessadores de Concentrado)
  // Acima de 11" é crítico, entre 11 e 7 é atenção e abaixo ok (< 7)
  if (id.startsWith("elevacao_rake")) {
    if (v > 11) return "critico";
    if (v >= 7) return "alerta";
    return "ok";
  }

  // Percentual de sólidos dos espessadores de rejeito
  // Acima de 66% crítico, entre 66% e 63% é ok, e abaixo de 63% atenção
  if (id.startsWith("solidos_45") || (setorId === "espessamento_rejeito" && id.startsWith("solidos_"))) {
    if (v > 66) return "critico";
    if (v >= 63) return "ok";
    return "alerta";
  }

  // Produtividade Remoagem: até 275tph OK, acima disso Crítico
  if (setorId === "remoagem" && (id === "produtividade" || id === "alimentacao")) {
    return v <= 275 ? "ok" : "critico";
  }

  // % retido em 1/2" (Rebritagem)
  // Acima de 12% Crítico, entre 12% e 11% atenção, e abaixo de 11% OK
  if (id === "retido_meia" || id.startsWith("retido_meia")) {
    if (v > 12) return "critico";
    if (v >= 11) return "alerta";
    return "ok";
  }

  // Total Autonomia minério (Pátio e Silos)
  // Abaixo de 3500t crítico, entre 3500 e 4800t atenção e acima de 4800t ok
  if (id === "total_autonomia" || id.startsWith("total_autonomia")) {
    if (v < 3500) return "critico";
    if (v <= 4800) return "alerta";
    return "ok";
  }

  // Produção Moagem (Turno 12h)
  // Acima de 7200t OK, abaixo é fora da meta (Crítico)
  if (id === "producao_moagem" || (setorId === "moagem" && id.startsWith("producao"))) {
    return v >= 7200 ? "ok" : "critico";
  }

  // Nível da câmara A (Utilidades)
  // Entre 100% e 80% ok, entre 80% e 70% Atenção, e abaixo de 70% crítico
  if (id === "nivel_camara_a" || id.startsWith("nivel_camara_a")) {
    if (v < 70) return "critico";
    if (v < 80) return "alerta";
    return "ok";
  }

  // Torque dos espessadores (Concentrado 44EP e Rejeito 45EP)
  // Acima de 20% é crítico, entre 20% e 12% é atenção e abaixo é ok (< 12)
  if (id.startsWith("torque_ep") || (setorId === "espessamento_rejeito" && id.startsWith("torque")) || (setorId === "espessamento_conc" && id.startsWith("torque"))) {
    if (v > 20) return "critico";
    if (v >= 12) return "alerta";
    return "ok";
  }

  if (meta === undefined) return "nd";
  const m = parseFloat(meta as any);
  if (isNaN(m) || m === 0) return "nd";

  const p = (v / m) * 100;
  return p >= 95 ? "ok" : p >= 80 ? "alerta" : "critico";
}

export interface StatusStyle {
  bg: string;
  co: string;
  em: string;
  lb: string;
}

export const ST: Record<StatusType, StatusStyle> = {
  ok:      { bg: "bg-[#EAF3DE]", co: "text-[#27500A]", em: "✅", lb: "OK" },
  alerta:  { bg: "bg-[#FAEEDA]", co: "text-[#633806]", em: "⚠️", lb: "Alerta" },
  critico: { bg: "bg-[#FCEBEB]", co: "text-[#791F1F]", em: "🔴", lb: "Crítico" },
  nd:      { bg: "bg-[#f0f0f0]", co: "text-[#9ca3af]", em: "—", lb: "—" },
};

export function fmtData(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export interface OcorrenciaPerdaSeguranca {
  id: string;
  eventoPrincipal: string;
  impactosDanos: string;
  acoesRealizadas: string;
  linhaDoTempo: string;
  condicaoRestricoes: string;
}

export const EXEMPLO_OCORRENCIA: OcorrenciaPerdaSeguranca = {
  id: "exemplo_1",
  eventoPrincipal: "Parada por transbordo do Silo 01, causado por falsa indicação de nível no sensor da posição 02.",
  impactosDanos: `* Acúmulo de Material e Travamento: O transbordo gerou acúmulo de minério no retorno do transportador TC001 e no seu tambor de acionamento, travando o equipamento.\n* Dano Físico: Rompimento do cabo da chave de emergência da correia do TC001.`,
  acoesRealizadas: `* Limpeza Mecânica/Operacional: Realizada a limpeza do minério no retorno e no acionamento do TC001.\n* Desobstrução: Chutes de descarga do TC005 e da PE006 foram totalmente desobstruídos.\n* Atuação da Elétrica:\n  ◦ Reparo e liberação da chave de emergência do TC001.\n  ◦ Manutenção no sensor da posição 02 do Silo 01. Atenção: O sensor não normalizou. Atualmente, o sistema supervisório indica 68%, mas a verificação visual em campo confirma que o silo está em 100%.`,
  linhaDoTempo: `* 18h44: Rebritagem parada (transbordo e travamento do TC001).\n* 20h00: Manutenção elétrica finalizada na chave de emergência.\n* 20h55: Equipamentos liberados e rebritagem retoma operação em modo by-pass.`,
  condicaoRestricoes: `A rebritagem encontra-se em operação no modo by-pass. Devido à falha contínua do sensor do Silo 01 (posição 02), a operação está rodando sob controle manual: o nível no supervisório está sendo mantido abaixo de 40% para compensar a divergência de leitura e evitar um novo transbordo.`,
};

export interface GerarWppParams {
  data: string;
  turno: "diurno" | "noturno";
  turma: string;
  supervisor: string;
  temaDds?: string;
  dados: Record<string, Record<string, any>>;
  acoes: string[];
  obs: string;
  ocorrenciasCriticas?: OcorrenciaPerdaSeguranca[];
}

export function gerarWpp({ data, turno, turma, supervisor, temaDds, dados, acoes, obs, ocorrenciasCriticas }: GerarWppParams): string {
  const tl = turno === "diurno" ? "☀️ Diurno (07h–19h)" : "🌙 Noturno (19h–07h)";
  const hr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const L: string[] = [];
  L.push(`🏭 *RELATÓRIO DE TURNO — PLANTA COBRE*`);
  L.push(`📅 ${fmtData(data)} | ${tl}`);
  L.push(`👥 Turma ${turma} | Supervisor: ${supervisor}`);
  if (temaDds && temaDds.trim()) {
    L.push(`🛡️ *Tema do DDS:* ${temaDds.trim()}`);
  }
  L.push(`🕐 Gerado às ${hr}`);
  L.push(``);

  let ok = 0;
  let al = 0;
  let cr = 0;
  let pr = 0;

  SETORES.forEach(s => {
    const d = dados[s.id] || {};
    if (s.campos.some(c => c.type === "number" && d[c.id] !== "" && d[c.id] !== undefined)) pr++;
    s.campos
      .filter(c => c.type === "number" && d[c.id] !== "" && d[c.id] !== undefined)
      .forEach(c => {
        const s2 = st(d[c.id], c.meta, c.id, s.id);
        if (s2 === "ok") ok++;
        else if (s2 === "alerta") al++;
        else if (s2 === "critico") cr++;
      });
  });

  L.push(`📊 *RESUMO*`);
  L.push(`✅ OK: ${ok}  ⚠️ Alerta: ${al}  🔴 Crítico: ${cr}`);
  L.push(`📋 Áreas Lançadas: ${pr}/${SETORES.length}`);
  L.push(``);

  const crits: string[] = [];
  SETORES.forEach(s => {
    const d = dados[s.id] || {};
    s.campos
      .filter(c => c.type === "number")
      .forEach(c => {
        if (st(d[c.id], c.meta, c.id, s.id) === "critico") {
          let refStr = c.meta !== undefined ? `meta ${c.meta}` : "";
          if (c.id.startsWith("elevacao_rake")) refStr = "crítico > 11 Pol";
          else if (c.id === "retido_meia" || c.id.startsWith("retido_meia")) refStr = "crítico > 12%";
          else if (c.id === "total_autonomia" || c.id.startsWith("total_autonomia")) refStr = "crítico < 3500 t";
          else if (c.id === "producao_moagem" || (s.id === "moagem" && c.id.startsWith("producao"))) refStr = "meta ≥ 7200 t";
          else if (c.id === "nivel_camara_a" || c.id.startsWith("nivel_camara_a")) refStr = "crítico < 70%";
          else if (c.id.startsWith("solidos_45") || (s.id === "espessamento_rejeito" && c.id.startsWith("solidos_"))) refStr = "crítico > 66%";
          else if (c.id.startsWith("torque_ep") || (s.id === "espessamento_rejeito" && c.id.startsWith("torque")) || (s.id === "espessamento_conc" && c.id.startsWith("torque"))) refStr = "crítico > 20%";
          else if (s.id === "remoagem" && (c.id === "produtividade" || c.id === "alimentacao")) refStr = "crítico > 275 t/h";

          crits.push(`  • ${s.label} › ${c.label}: *${d[c.id]} ${c.un || ""}*${refStr ? ` (${refStr})` : ""}`);
        }
      });
  });

  if (crits.length > 0) {
    L.push(`🔴 *PARÂMETROS CRÍTICOS*`);
    crits.forEach(l => L.push(l));
    L.push(``);
  }

  // Pendências críticas consolidadas de todos os setores
  const todasPendenciasCriticas: string[] = [];
  const todasPendenciasAcomp: string[] = [];
  SETORES.forEach(s => {
    const d = dados[s.id] || {};
    const pendCrit = s.campos.find(c => c.type === "pendencias");
    if (pendCrit) {
      const itens = ((d[pendCrit.id] as string[]) || []).filter(x => x && x.trim());
      itens.forEach(it => todasPendenciasCriticas.push(`  • *${s.label}:* ${it}`));
    }
    const pendAcomp = s.campos.find(c => c.type === "pendencias_programacao");
    if (pendAcomp) {
      const itens = ((d[pendAcomp.id] as string[]) || []).filter(x => x && x.trim());
      itens.forEach(it => todasPendenciasAcomp.push(`  • *${s.label}:* ${it}`));
    }
  });

  if (todasPendenciasCriticas.length > 0) {
    L.push(`⚠️ *PENDÊNCIAS CRÍTICAS — TODOS OS SETORES*`);
    todasPendenciasCriticas.forEach(l => L.push(l));
    L.push(``);
  }

  if (todasPendenciasAcomp.length > 0) {
    L.push(`📋 *PENDÊNCIAS DE ACOMPANHAMENTO (PROGRAMAÇÃO) — TODOS OS SETORES*`);
    todasPendenciasAcomp.forEach(l => L.push(l));
    L.push(``);
  }

  // Ocorrências estruturadas de Perda de Produção / Segurança
  if (ocorrenciasCriticas && ocorrenciasCriticas.length > 0) {
    const validOcs = ocorrenciasCriticas.filter(
      oc => oc.eventoPrincipal?.trim() || oc.impactosDanos?.trim() || oc.acoesRealizadas?.trim() || oc.linhaDoTempo?.trim() || oc.condicaoRestricoes?.trim()
    );
    if (validOcs.length > 0) {
      L.push(`━━━━━━━━━━━━━━━━━━`);
      L.push(`🚨 *OCORRÊNCIAS DE PERDA DE PRODUÇÃO / SEGURANÇA*`);
      L.push(``);
      validOcs.forEach((oc, i) => {
        if (validOcs.length > 1) {
          L.push(`*Ocorrência #${i + 1}*`);
        }
        if (oc.eventoPrincipal?.trim()) {
          L.push(`*Evento Principal:* ${oc.eventoPrincipal.trim()}`);
          L.push(``);
        }
        if (oc.impactosDanos?.trim()) {
          L.push(`🛑 *Impactos e Danos*`);
          L.push(oc.impactosDanos.trim());
          L.push(``);
        }
        if (oc.acoesRealizadas?.trim()) {
          L.push(`🔧 *Ações Realizadas*`);
          L.push(oc.acoesRealizadas.trim());
          L.push(``);
        }
        if (oc.linhaDoTempo?.trim()) {
          L.push(`⏱️ *Linha do Tempo*`);
          L.push(oc.linhaDoTempo.trim());
          L.push(``);
        }
        if (oc.condicaoRestricoes?.trim()) {
          L.push(`⚠️ *Condição Operacional e Restrições (Status Atual)*`);
          L.push(oc.condicaoRestricoes.trim());
          L.push(``);
        }
      });
    }
  }

  SETORES.forEach(s => {
    const d = dados[s.id] || {};
    const campos = s.campos.filter(c => {
      if (c.type === "text") return d[c.id] && d[c.id].trim();
      if (c.type === "atividades" || c.type === "pendencias" || c.type === "pendencias_programacao") {
        return Array.isArray(d[c.id]) && d[c.id].some((x: string) => x && x.trim());
      }
      return d[c.id] !== "" && d[c.id] !== undefined;
    });

    if (!campos.length) return;
    L.push(`━━━━━━━━━━━━━━━━━━`);
    L.push(`*${s.label.toUpperCase()}*`);
    campos.forEach(c => {
      if (c.type === "text") {
        L.push(`📝 ${d[c.id]}`);
        return;
      }
      if (c.type === "select") {
        L.push(`🔹 ${c.label}: *${d[c.id]}*`);
        if (d[`acao_${c.id}`] && String(d[`acao_${c.id}`]).trim()) {
          L.push(`   ↳ 🛠️ *Tratativa:* ${String(d[`acao_${c.id}`]).trim()}`);
        }
        return;
      }
      if (c.type === "atividades") {
        const itens = ((d[c.id] as string[]) || []).filter(x => x && x.trim());
        if (!itens.length) return;
        L.push(`✅ *Atividades realizadas:*`);
        itens.forEach((it, i) => L.push(`   ${i + 1}. ${it}`));
        return;
      }
      if (c.type === "pendencias") {
        const itens = ((d[c.id] as string[]) || []).filter(x => x && x.trim());
        if (!itens.length) return;
        L.push(`🔴 *Pendências críticas:*`);
        itens.forEach((it, i) => L.push(`   ${i + 1}. ${it}`));
        return;
      }
      if (c.type === "pendencias_programacao") {
        const itens = ((d[c.id] as string[]) || []).filter(x => x && x.trim());
        if (!itens.length) return;
        L.push(`📋 *Pendências de acompanhamento (Programação):*`);
        itens.forEach((it, i) => L.push(`   ${i + 1}. ${it}`));
        return;
      }
      const s2 = st(d[c.id], c.meta, c.id, s.id);
      let metaS = c.meta !== undefined ? ` (meta ${c.meta})` : "";
      if (c.id.startsWith("elevacao_rake")) metaS = " (ref <7 Pol)";
      else if (c.id === "retido_meia" || c.id.startsWith("retido_meia")) metaS = " (meta <11%)";
      else if (c.id === "total_autonomia" || c.id.startsWith("total_autonomia")) metaS = " (meta >4800 t)";
      else if (c.id === "producao_moagem" || (s.id === "moagem" && c.id.startsWith("producao"))) metaS = " (meta ≥ 7200 t)";
      else if (c.id === "nivel_camara_a" || c.id.startsWith("nivel_camara_a")) metaS = " (meta 80-100%)";
      else if (c.id.startsWith("solidos_45") || (s.id === "espessamento_rejeito" && c.id.startsWith("solidos_"))) metaS = " (meta 63-66%)";
      else if (c.id.startsWith("torque_ep") || (s.id === "espessamento_rejeito" && c.id.startsWith("torque")) || (s.id === "espessamento_conc" && c.id.startsWith("torque"))) metaS = " (meta <12%)";
      else if (s.id === "remoagem" && (c.id === "produtividade" || c.id === "alimentacao")) metaS = " (meta ≤ 275 t/h)";
      else if (c.id === "nivel_tanque") metaS = "";

      L.push(`${ST[s2].em} ${c.label}: *${d[c.id]}${c.un ? " " + c.un : ""}*${metaS}`);
      if ((s2 === "alerta" || s2 === "critico") && d[`acao_${c.id}`] && String(d[`acao_${c.id}`]).trim()) {
        L.push(`   ↳ 🛠️ *Tratativa:* ${String(d[`acao_${c.id}`]).trim()}`);
      }
    });
    L.push(``);
  });

  const av = acoes.filter(a => a && a.trim());
  if (av.length > 0) {
    L.push(`━━━━━━━━━━━━━━━━━━`);
    L.push(`📌 *AÇÕES — PRÓXIMO TURNO*`);
    av.forEach((a, i) => L.push(`${i + 1}. ${a}`));
    L.push(``);
  }

  if (obs && obs.trim()) {
    L.push(`━━━━━━━━━━━━━━━━━━`);
    L.push(`💬 *COMENTÁRIO*`);
    L.push(obs.trim());
    L.push(``);
  }

  L.push(`_Relatório gerado automaticamente_`);
  return L.join("\n");
}
