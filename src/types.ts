/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Campo {
  id: string;
  label: string;
  type: "number" | "text" | "select" | "atividades" | "pendencias";
  meta?: number;
  un?: string;
  opcoes?: string[];
}

export interface Setor {
  id: string;
  label: string;
  icon: string;
  cor: "teal" | "blue" | "amber" | "purple" | "coral" | "green" | "gray" | "pink";
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
      { id: "disponibilidade", label: "Disponibilidade", type: "number", meta: 85, un: "%" },
      { id: "utilizacao", label: "Utilização", type: "number", meta: 80, un: "%" },
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
        id: "afericao_britador",
        label: "Aferição do britador",
        type: "select",
        opcoes: ["Realizada", "Não realizada", "Conforme", "Ajuste necessário", "Pendente"],
      },
      { id: "paradas_manutencao", label: "Paradas de Manutenção", type: "number", meta: 0, un: "h" },
      { id: "paradas_outros", label: "Paradas de Outros (OUT)", type: "number", meta: 0, un: "h" },
      { id: "estoque_msb", label: "Estoque MSB", type: "number", un: "t" },
      { id: "estoque_surubim", label: "Estoque Surubim", type: "number", un: "t" },
      { id: "estoque_vermelhos", label: "Estoque vermelhos", type: "number", un: "t" },
      { id: "estoque_sucuarana", label: "Estoque Suçuarana", type: "number", un: "t" },
      { id: "estoque_total", label: "Estoque total", type: "number", un: "t" },
      { id: "ocorrencias", label: "Ocorrências", type: "text" },
      { id: "atividades", label: "Atividades realizadas", type: "atividades" },
      { id: "pendencias", label: "Pendências críticas", type: "pendencias" },
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
      { id: "producao_total", label: "Produção total", type: "number", un: "t" },
      { id: "alimentacao", label: "Produtividade", type: "number", meta: 1000, un: "t/h" },
      { id: "disponibilidade", label: "Disponibilidade", type: "number", meta: 88, un: "%" },
      { id: "utilizacao", label: "Utilização", type: "number", meta: 85, un: "%" },
      { id: "retido_meia", label: "% retido em 1/2", type: "number", meta: 12, un: "%" },
      { id: "paradas_manutencao", label: "Paradas de Manutenção", type: "number", meta: 0, un: "h" },
      { id: "paradas_outros", label: "Paradas de Outros (OUT)", type: "number", meta: 0, un: "h" },
      { id: "pilha_intermediaria", label: "Pilha intermediária", type: "number", un: "t" },
      { id: "ocorrencias", label: "Ocorrências", type: "text" },
      { id: "atividades", label: "Atividades realizadas", type: "atividades" },
      { id: "pendencias", label: "Pendências críticas", type: "pendencias" },
    ],
  },
  {
    id: "patio_silos",
    label: "Pátio e Silos",
    icon: "Warehouse",
    cor: "amber",
    campos: [
      { id: "estoque_patio", label: "Estoque Pátio", type: "number", meta: 5000, un: "t" },
      { id: "nivel_silo1", label: "Nível Silo 1", type: "number", meta: 70, un: "%" },
      { id: "nivel_silo2", label: "Nível Silo 2", type: "number", meta: 70, un: "%" },
      { id: "total_autonomia", label: "Total Autonomia minério", type: "number", meta: 8000, un: "t" },
      { id: "retomador", label: "Retomador", type: "select", opcoes: ["Operando", "Parado", "Manutenção", "Standby", "Sim", "Não", "Parcial"] },
      { id: "disponibilidade", label: "Disponibilidade", type: "number", meta: 90, un: "%" },
      { id: "utilizacao", label: "Utilização", type: "number", meta: 85, un: "%" },
      { id: "paradas_manutencao", label: "Paradas de Manutenção", type: "number", meta: 0, un: "h" },
      { id: "paradas_outros", label: "Paradas de Outros (OUT)", type: "number", meta: 0, un: "h" },
      { id: "ocorrencias", label: "Ocorrências", type: "text" },
      { id: "atividades", label: "Atividades realizadas", type: "atividades" },
      { id: "pendencias", label: "Pendências críticas", type: "pendencias" },
    ],
  },
  {
    id: "moagem",
    label: "Moagem",
    icon: "CircleDot",
    cor: "purple",
    campos: [
      { id: "producao_moagem", label: "Produção Moagem", type: "number", meta: 6000, un: "t" },
      { id: "prod_mi003", label: "Produtividade 43MI003", type: "number", meta: 200, un: "t/h" },
      { id: "prod_mi004", label: "Produtividade 43MI004", type: "number", meta: 200, un: "t/h" },
      { id: "prod_mi005", label: "Produtividade 43MI005", type: "number", meta: 200, un: "t/h" },
      { id: "produtividade_total", label: "Produtividade Total", type: "number", meta: 600, un: "t/h" },
      { id: "granulometria_mi03", label: "Percentual 105microns (43MI003)", type: "number", meta: 62, un: "%" },
      { id: "granulometria_mi04", label: "Percentual 105microns (43MI004)", type: "number", meta: 62, un: "%" },
      { id: "granulometria_mi05", label: "Percentual 105microns (43MI005)", type: "number", meta: 62, un: "%" },
      { id: "disponibilidade", label: "Disponibilidade", type: "number", meta: 90, un: "%" },
      { id: "utilizacao", label: "Utilização", type: "number", meta: 85, un: "%" },
      { id: "paradas_manutencao", label: "Paradas de Manutenção", type: "number", meta: 0, un: "h" },
      { id: "paradas_outros", label: "Paradas de Outros (OUT)", type: "number", meta: 0, un: "h" },
      { id: "ocorrencias", label: "Ocorrências", type: "text" },
      { id: "atividades", label: "Atividades realizadas", type: "atividades" },
      { id: "pendencias", label: "Pendências críticas", type: "pendencias" },
    ],
  },
  {
    id: "flotacao",
    label: "Flotação de Cobre",
    icon: "Droplets",
    cor: "coral",
    campos: [
      { id: "circuito", label: "Circuito", type: "select", opcoes: ["CI", "CII", "CIII", "CIV"] },
      { id: "teor_alimentacao", label: "Teor Alim. Cu", type: "number", meta: 1.2, un: "%" },
      { id: "teor_concentrado", label: "Teor Conc. Cu", type: "number", meta: 33.5, un: "%" },
      { id: "teor_rejeito", label: "Teor Rejeito Final Cu", type: "number", meta: 0.10, un: "%" },
      { id: "recuperacao", label: "Recuperação Metalúrgica", type: "number", meta: 88, un: "%" },
      { id: "metal_contido", label: "Metal", type: "number", meta: 63.3, un: "t" },
      { id: "concentrado", label: "Concentrado", type: "number", meta: 189, un: "t" },
      { id: "ph_rougher", label: "pH Linha principal", type: "number", meta: 9.5, un: "" },
      { id: "ph_segunda_linha", label: "pH Segunda linha", type: "number", meta: 9.5, un: "" },
      { id: "consumo_coletor", label: "Coletor", type: "number", meta: 35, un: "g/t" },
      { id: "consumo_espumante", label: "Espumante", type: "number", meta: 25, un: "g/t" },
      { id: "consumo_dispersante", label: "Dispersante", type: "number", meta: 25, un: "g/t" },
      { id: "consumo_cmc", label: "CMC", type: "number", meta: 200, un: "g/t" },
      { id: "consumo_amidex", label: "Amidex", type: "number", meta: 60, un: "g/t" },
      { id: "ocorrencias", label: "Ocorrências", type: "text" },
      { id: "atividades", label: "Atividades realizadas", type: "atividades" },
      { id: "pendencias", label: "Pendências críticas", type: "pendencias" },
    ],
  },
  {
    id: "espessamento_conc",
    label: "Espessamento Conc.",
    icon: "Filter",
    cor: "green",
    campos: [
      { id: "espessador_operacao", label: "Espessador em operação", type: "select", opcoes: ["44EP001", "44EP002", "Ambos"] },
      { id: "densidade_underflow", label: "Dens. Underflow", type: "number", meta: 1850, un: "g/L" },
      { id: "solidos_44ep001", label: "Percentual de sólidos 44EP001", type: "number", meta: 65, un: "%" },
      { id: "solidos_44ep002", label: "Percentual de sólidos 44EP002", type: "number", meta: 65, un: "%" },
      { id: "nivel_tanque", label: "Nível do Tanque", type: "number", meta: 60, un: "%" },
      { id: "consumo_floculante", label: "Floculante", type: "number", meta: 25, un: "g/t" },
      { id: "elevacao_rake_ep001", label: "Elevação do Rake 44EP001", type: "number", meta: 0, un: "mm" },
      { id: "elevacao_rake_ep002", label: "Elevação do Rake 44EP002", type: "number", meta: 0, un: "mm" },
      { id: "corrente_ep001", label: "Corrente 44EP001", type: "number", meta: 15, un: "A" },
      { id: "corrente_ep002", label: "Corrente 44EP002", type: "number", meta: 15, un: "A" },
      { id: "ocorrencias", label: "Ocorrências", type: "text" },
      { id: "atividades", label: "Atividades realizadas", type: "atividades" },
      { id: "pendencias", label: "Pendências críticas", type: "pendencias" },
    ],
  },
  {
    id: "espessamento_rejeito",
    label: "Espessamento Rejeito",
    icon: "FilterX",
    cor: "gray",
    campos: [
      { id: "espessador_operacao", label: "Espessador em operação", type: "select", opcoes: ["45EP001", "45EP002", "Ambos"] },
      { id: "densidade_underflow", label: "Dens. Underflow", type: "number", meta: 1400, un: "g/L" },
      { id: "solidos_45ep001", label: "Percentual de sólidos 45EP001", type: "number", meta: 55, un: "%" },
      { id: "solidos_45ep002", label: "Percentual de sólidos 45EP002", type: "number", meta: 55, un: "%" },
      { id: "solidos_45bh01", label: "Percentual de sólidos 45BH01", type: "number", meta: 55, un: "%" },
      { id: "solidos_45bh02", label: "Percentual de sólidos 45BH02", type: "number", meta: 55, un: "%" },
      { id: "solidos_45bh03", label: "Percentual de sólidos 45BH03", type: "number", meta: 55, un: "%" },
      { id: "consumo_floculante", label: "Floculante", type: "number", meta: 18, un: "g/t" },
      { id: "torque_ep001", label: "Torque 45EP001", type: "number", meta: 40, un: "%" },
      { id: "torque_ep002", label: "Torque 45EP002", type: "number", meta: 40, un: "%" },
      { id: "htr_linha1", label: "HTR Linha 1", type: "number", un: "h" },
      { id: "htr_linha2", label: "HTR Linha 2", type: "number", un: "h" },
      { id: "htr_linha3", label: "HTR Linha 3", type: "number", un: "h" },
      { id: "htr_linha4", label: "HTR Linha 4", type: "number", un: "h" },
      { id: "htr_past_fill", label: "HTR Past Fill", type: "number", un: "h" },
      { id: "ocorrencias", label: "Ocorrências", type: "text" },
      { id: "atividades", label: "Atividades realizadas", type: "atividades" },
      { id: "pendencias", label: "Pendências críticas", type: "pendencias" },
    ],
  },
  {
    id: "filtro_prensa",
    label: "Filtro Prensa Conc.",
    icon: "Layers",
    cor: "pink",
    campos: [
      { id: "umidade", label: "Umidade do Bolo", type: "number", meta: 9.5, un: "%" },
      { id: "producao", label: "Produtividade", type: "number", meta: 30, un: "t/h" },
      { id: "tipo_lavagem", label: "Tipo de lavagem", type: "select", opcoes: ["Simples", "Dupla"] },
      { id: "vazao_fim_compactacao", label: "Vazão ao final da compactação", type: "number", meta: 45, un: "m³/h" },
      { id: "pressao_fim_compactacao", label: "Pressão final da compactação", type: "number", meta: 230, un: "kPa" },
      { id: "setpoint_peso_torta", label: "Setpoint Peso da torta", type: "number", meta: 8000, un: "kg" },
      { id: "ciclos", label: "Ciclos", type: "number", meta: 24, un: "" },
      { id: "disponibilidade", label: "Disponibilidade", type: "number", meta: 90, un: "%" },
      { id: "utilizacao", label: "Utilização", type: "number", meta: 85, un: "%" },
      { id: "paradas_manutencao", label: "Paradas de Manutenção", type: "number", meta: 0, un: "h" },
      { id: "paradas_outros", label: "Paradas de Outros (OUT)", type: "number", meta: 0, un: "h" },
      { id: "ocorrencias", label: "Ocorrências", type: "text" },
      { id: "atividades", label: "Atividades realizadas", type: "atividades" },
      { id: "pendencias", label: "Pendências críticas", type: "pendencias" },
    ],
  },
  {
    id: "eta",
    label: "ETA — Tratamento de Água",
    icon: "Droplets",
    cor: "teal",
    campos: [
      { id: "captacao_bruta", label: "Captação de Água Bruta", type: "number", meta: 400, un: "m³/h" },
      { id: "volume_tratado", label: "Volume Tratado", type: "number", meta: 8500, un: "m³/dia" },
      { id: "taxa_recirculacao", label: "Taxa de Recirculação / Reuso", type: "number", meta: 85, un: "%" },
      { id: "turbidez", label: "Turbidez da Água Tratada", type: "number", meta: 2.0, un: "NTU" },
      { id: "nivel_reservatorio", label: "Nível Reservatório Central", type: "number", meta: 80, un: "%" },
      { id: "dosagem_coagulante", label: "Dosagem Coagulante", type: "number", meta: 15, un: "ppm" },
      { id: "dosagem_polimero", label: "Dosagem Polímero", type: "number", meta: 1.5, un: "ppm" },
      { id: "paradas_manutencao", label: "Paradas de Manutenção", type: "number", meta: 0, un: "h" },
      { id: "paradas_outros", label: "Paradas de Outros (OUT)", type: "number", meta: 0, un: "h" },
      { id: "ocorrencias", label: "Ocorrências", type: "text" },
      { id: "atividades", label: "Atividades realizadas", type: "atividades" },
      { id: "pendencias", label: "Pendências críticas", type: "pendencias" },
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
};

export function st(val: string | number, meta: number | undefined, id: string): StatusType {
  if (val === "" || val === undefined || val === null || meta === undefined) return "nd";
  const v = parseFloat(val as string);
  const m = parseFloat(meta as any);
  if (isNaN(v)) return "nd";
  if (id === "paradas" || id === "paradas_manutencao" || id === "paradas_outros" || id.startsWith("elevacao_rake")) {
    return v === 0 ? "ok" : v <= 50 ? "alerta" : "critico";
  }
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
        const s2 = st(d[c.id], c.meta, c.id);
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
        if (st(d[c.id], c.meta, c.id) === "critico") {
          crits.push(`  • ${s.label} › ${c.label}: *${d[c.id]} ${c.un}* (meta ${c.meta})`);
        }
      });
  });

  if (crits.length > 0) {
    L.push(`🔴 *PARÂMETROS CRÍTICOS*`);
    crits.forEach(l => L.push(l));
    L.push(``);
  }

  // Pendências críticas consolidadas de todos os setores
  const todasPendencias: string[] = [];
  SETORES.forEach(s => {
    const d = dados[s.id] || {};
    const pend = s.campos.find(c => c.type === "pendencias");
    if (pend) {
      const itens = ((d[pend.id] as string[]) || []).filter(x => x && x.trim());
      itens.forEach(it => todasPendencias.push(`  • *${s.label}:* ${it}`));
    }
  });

  if (todasPendencias.length > 0) {
    L.push(`⚠️ *PENDÊNCIAS CRÍTICAS — TODOS OS SETORES*`);
    todasPendencias.forEach(l => L.push(l));
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
      if (c.type === "atividades" || c.type === "pendencias") {
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
      const s2 = st(d[c.id], c.meta, c.id);
      const metaS = c.meta !== undefined ? ` (meta ${c.meta})` : "";
      L.push(`${ST[s2].em} ${c.label}: *${d[c.id]}${c.un ? " " + c.un : ""}*${metaS}`);
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
