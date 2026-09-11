/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CircuitoTipo = "seco" | "umido";

export type HorizontePlanejamento = "dia" | "semana" | "fim_de_semana" | "parada" | "mes";

export type PrioridadeDiretriz = "critica" | "alta" | "media";

export type StatusDiretriz = "pendente" | "em_andamento" | "concluido";

export interface AlocacaoTurnoDia {
  diurno?: boolean; // 07h às 19h (Diurno)
  noturno?: boolean; // 19h às 07h (Noturno)
}

export interface AlocacaoSemanalTurnos {
  seg?: AlocacaoTurnoDia;
  ter?: AlocacaoTurnoDia;
  qua?: AlocacaoTurnoDia;
  qui?: AlocacaoTurnoDia;
  sex?: AlocacaoTurnoDia;
  sab?: AlocacaoTurnoDia;
  dom?: AlocacaoTurnoDia;
}

export interface DiretrizSupervisorTurno {
  id: string;
  setor: string;
  acaoEstrategica: string;
  responsavelTurma: string; // "Turma A", "Turma B", "Turma C", "Turma D", "Todas as Turmas", "Supervisão Diurna", "Supervisão Noturna"
  supervisorNome?: string;
  prazoLimite: string; // Ex: "Hoje até 15:30", "Turno Noturno", "Até Fim do FDS"
  prioridade: PrioridadeDiretriz;
  metaEsperada: string; // Ex: "Manter taxa > 610 t/h e granulometria 105µm > 62%"
  status: StatusDiretriz;
  observacoes?: string;
  // Propriedades do Cronograma Gantt Semanal
  diaInicioNum?: number; // 1 = Seg, 2 = Ter, 3 = Qua, 4 = Qui, 5 = Sex, 6 = Sáb, 7 = Dom
  diaFimNum?: number; // 1 = Seg ... 7 = Dom
  dataInicio?: string;
  progresso?: number; // 0 a 100%
  // Alocação em Dias Alternados e Turnos (ex: Seg/Ter/Qui/Sex 07h:19h)
  diasAlocados?: number[]; // [1, 2, 4, 5]
  alocacaoTurnos?: AlocacaoSemanalTurnos;
  recursosPessoais?: string; // Ex: "ADM", "Operação", "Mecânica", "Limpeza"
  modoAlocacao?: "alternado" | "intervalo";
}

export const DIAS_CHAVES_GANTT: Array<{ key: keyof AlocacaoSemanalTurnos; num: number; sigla: string; label: string }> = [
  { key: "seg", num: 1, sigla: "SEG", label: "Segunda-feira" },
  { key: "ter", num: 2, sigla: "TER", label: "Terça-feira" },
  { key: "qua", num: 3, sigla: "QUA", label: "Quarta-feira" },
  { key: "qui", num: 4, sigla: "QUI", label: "Quinta-feira" },
  { key: "sex", num: 5, sigla: "SEX", label: "Sexta-feira" },
  { key: "sab", num: 6, sigla: "SÁB", label: "Sábado" },
  { key: "dom", num: 7, sigla: "DOM", label: "Domingo" }
];

export function normalizarAlocacaoTurnos(
  alocacao?: AlocacaoSemanalTurnos,
  diaInicioNum?: number,
  diaFimNum?: number,
  diasAlocados?: number[]
): AlocacaoSemanalTurnos {
  if (alocacao && Object.keys(alocacao).length > 0) {
    return {
      seg: { diurno: Boolean(alocacao.seg?.diurno), noturno: Boolean(alocacao.seg?.noturno) },
      ter: { diurno: Boolean(alocacao.ter?.diurno), noturno: Boolean(alocacao.ter?.noturno) },
      qua: { diurno: Boolean(alocacao.qua?.diurno), noturno: Boolean(alocacao.qua?.noturno) },
      qui: { diurno: Boolean(alocacao.qui?.diurno), noturno: Boolean(alocacao.qui?.noturno) },
      sex: { diurno: Boolean(alocacao.sex?.diurno), noturno: Boolean(alocacao.sex?.noturno) },
      sab: { diurno: Boolean(alocacao.sab?.diurno), noturno: Boolean(alocacao.sab?.noturno) },
      dom: { diurno: Boolean(alocacao.dom?.diurno), noturno: Boolean(alocacao.dom?.noturno) }
    };
  }

  const res: AlocacaoSemanalTurnos = {
    seg: { diurno: false, noturno: false },
    ter: { diurno: false, noturno: false },
    qua: { diurno: false, noturno: false },
    qui: { diurno: false, noturno: false },
    sex: { diurno: false, noturno: false },
    sab: { diurno: false, noturno: false },
    dom: { diurno: false, noturno: false }
  };

  if (diasAlocados && diasAlocados.length > 0) {
    DIAS_CHAVES_GANTT.forEach(d => {
      if (diasAlocados.includes(d.num)) {
        res[d.key] = { diurno: true, noturno: false };
      }
    });
    return res;
  }

  const ini = Math.max(1, Math.min(7, diaInicioNum || 1));
  const fim = Math.max(ini, Math.min(7, diaFimNum || 5));
  DIAS_CHAVES_GANTT.forEach(d => {
    if (d.num >= ini && d.num <= fim) {
      res[d.key] = { diurno: true, noturno: false };
    }
  });

  return res;
}

export function obterDiasAlocadosNumeros(alocacao?: AlocacaoSemanalTurnos): number[] {
  if (!alocacao) return [1, 2, 3, 4, 5];
  const list: number[] = [];
  DIAS_CHAVES_GANTT.forEach(d => {
    const diaObj = alocacao[d.key];
    if (diaObj?.diurno || diaObj?.noturno) {
      list.push(d.num);
    }
  });
  return list.length > 0 ? list : [1];
}

export function formatarResumoAlocacao(alocacao?: AlocacaoSemanalTurnos): string {
  if (!alocacao) return "Nenhum dia alocado";
  const ativos: string[] = [];
  DIAS_CHAVES_GANTT.forEach(d => {
    const val = alocacao[d.key];
    if (val?.diurno && val?.noturno) {
      ativos.push(`${d.sigla} (24h)`);
    } else if (val?.diurno) {
      ativos.push(`${d.sigla} (07-19h)`);
    } else if (val?.noturno) {
      ativos.push(`${d.sigla} (19-07h)`);
    }
  });
  if (ativos.length === 0) return "Nenhum turno selecionado";
  if (ativos.length === 7 && ativos.every(a => a.includes("07-19h"))) return "Seg a Dom (Diurno 07h:19h)";
  if (ativos.length === 5 && !ativos.some(a => a.startsWith("SÁB") || a.startsWith("DOM")) && ativos.every(a => a.includes("07-19h"))) {
    return "Segunda a Sexta (Diurno 07h:19h)";
  }
  return ativos.join(", ");
}

export interface KpiOperacionalAdm {
  id: string;
  nome: string;
  unidade: string;
  setorGrupo: "britagem_rebritagem" | "concentrador_eta";
  setorEspecifico: string;
  metaDiaria: number;
  realizadoDiario: number;
  metaSemanal: number;
  realizadoSemanal: number;
  metaMensal: number;
  realizadoMensal: number;
  acumuladoFds?: number;
  metaFds?: number;
  pesoEstrategico?: "alto" | "critico" | "normal";
}

export interface RegistroDiarioIndicadoresBritagem {
  dia: "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
  diaLabel: string; // "Segunda-feira", "Terça-feira", etc.
  produtividadeTph: number | ""; // Produtividade (tph)
  posicaoManto: number | ""; // Posição do Manto (%)
  afericaoBritador: number | ""; // Aferição (")
  vazaoOleoBuchaInterna: number | ""; // Vazão de Óleo (l/m) - Bucha Interna
  vazaoOleoBuchaExterna: number | ""; // Vazão de Óleo (l/m) - Bucha Externa
  pressaoOleoLubrificante: number | ""; // Pressão do Óleo Lubrificante (Kg/cm²)
  pressaoArAcumulador: number | ""; // Pressão de Ar Acumulador (kg/cm²)
  pressaoArAc1: number | ""; // Pressão Ar - Ac. 1 (kg/cm²)
  pressaoArAc2: number | ""; // Pressão Ar - Ac. 2 (kg/cm²)
  pressaoAguaResfriamento: number | ""; // Pressão da água de resfriamento (Kg/cm²)
  amperagemMotor41TC001: number | ""; // 41TC001 - Amperagem do Motor (A)
  amperagemMotor41BR001: number | ""; // 41BR001 - Amperagem do Motor (A)
  temperaturaOleoRetorno: number | ""; // Temperatura Óleo (ºC) - Retorno
  temperaturaOleoBuchaExterna: number | ""; // Temperatura Óleo (ºC) - Bucha Externa
  temperaturaOleoBuchaInterna: number | ""; // Temperatura Óleo (ºC) - Bucha Interna
  observacao?: string;
}

export interface RegistroDiarioIndicadoresRebritagem {
  dia: "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
  diaLabel: string; // "Segunda-feira", "Terça-feira", etc.

  // 1. TEMPERATURA DO ÓLEO LUBRIFICANTE (°C) (BR001 a BR006)
  tempOleoLub_BR001: number | "";
  tempOleoLub_BR002: number | "";
  tempOleoLub_BR003: number | "";
  tempOleoLub_BR004: number | "";
  tempOleoLub_BR005: number | "";
  tempOleoLub_BR006: number | "";

  // 2. PRESSÃO DE ÓLEO NO HYDROSET (MPa) (BR003 a BR006)
  pressaoHydroset_BR003: number | "";
  pressaoHydroset_BR004: number | "";
  pressaoHydroset_BR005: number | "";
  pressaoHydroset_BR006: number | "";

  // 3. POTÊNCIA (kW) (BR001 a BR006)
  potencia_BR001: number | "";
  potencia_BR002: number | "";
  potencia_BR003: number | "";
  potencia_BR004: number | "";
  potencia_BR005: number | "";
  potencia_BR006: number | "";

  // 4. FREQUÊNCIA DO ALIMENTADOR (Hz) (BR001 a BR006)
  freqAlimentador_BR001: number | "";
  freqAlimentador_BR002: number | "";
  freqAlimentador_BR003: number | "";
  freqAlimentador_BR004: number | "";
  freqAlimentador_BR005: number | "";
  freqAlimentador_BR006: number | "";

  // 5. DIF. TEMP (°C) (BR001 e BR002)
  difTemp_BR001: number | "";
  difTemp_BR002: number | "";

  // 6. PRESSÃO CONTRAEIXO (MPa) (BR001 e BR002)
  pressaoContraeixo_BR001: number | "";
  pressaoContraeixo_BR002: number | "";

  // 7. DIF. PRESSÃO (MPa) (BR001 e BR002)
  difPressao_BR001: number | "";
  difPressao_BR002: number | "";

  // 8. % RETIDO EM 1/2" (%)
  retidoMeiaPol: number | "";

  // 9. PRODUTIVIDADE (tph)
  produtividadeTph: number | "";

  observacao?: string;
}

export interface ParametroConfigBritagem {
  chave: keyof Omit<RegistroDiarioIndicadoresBritagem, "dia" | "diaLabel" | "observacao">;
  equipamento: string; // Ex: "41BR001", "41TC001"
  nome: string;
  nomeCurto: string;
  subsistema: string;
  unidade: string;
  minIdeal: number;
  maxIdeal: number;
  alvo: number;
  decimais: number;
  impactoDesvio: string;
  acaoRecomendada: string;
}

export interface ParametroConfigRebritagem {
  chave: keyof Omit<RegistroDiarioIndicadoresRebritagem, "dia" | "diaLabel" | "observacao">;
  grupo: string; // Ex: "TEMPERATURA DO ÓLEO LUBRIFICANTE (°C)"
  equipamento: string; // Ex: "BR001", "BR002", etc.
  nome: string;
  nomeCurto: string;
  subsistema: string;
  unidade: string;
  minIdeal: number;
  maxIdeal: number;
  alvo: number;
  decimais: number;
  impactoDesvio: string;
  acaoRecomendada: string;
}

export const CONFIG_PARAMETROS_BRITAGEM: ParametroConfigBritagem[] = [
  {
    chave: "produtividadeTph",
    equipamento: "41BR001",
    nome: "Produtividade (tph)",
    nomeCurto: "Produtividade",
    subsistema: "Desempenho Britagem",
    unidade: "tph",
    minIdeal: 850,
    maxIdeal: 1400,
    alvo: 1000,
    decimais: 0,
    impactoDesvio: "Produtividade do Britador Primário fora da faixa esperada (850 a 1.400 tph) compromete a taxa de alimentação global da planta.",
    acaoRecomendada: "Ajustar cadência de basculamento dos caminhões de mina, regular alimentador de sapatas e monitorar fragmentação do ROM."
  },
  {
    chave: "posicaoManto",
    equipamento: "41BR001",
    nome: "Posição do Manto (%)",
    nomeCurto: "Pos. Manto",
    subsistema: "Câmara de Britagem",
    unidade: "%",
    minIdeal: 15,
    maxIdeal: 100,
    alvo: 50,
    decimais: 0,
    impactoDesvio: "Manto fora da faixa (15% a 100%) indica desgaste severo do revestimento ou desajuste mecânico do conjunto excêntrico.",
    acaoRecomendada: "Calibrar posição do manto hidraulicamente e inspecionar perfil de desgaste da câmara de britagem."
  },
  {
    chave: "afericaoBritador",
    equipamento: "41BR001",
    nome: "Aferição do Britador (\")",
    nomeCurto: "Aferição",
    subsistema: "GAP Hidráulico",
    unidade: '"',
    minIdeal: 5.5,
    maxIdeal: 6.5,
    alvo: 6.0,
    decimais: 1,
    impactoDesvio: "Aferição fora de 5,5\" a 6,5\" descalibra a distribuição granulométrica da alimentação para a rebritagem.",
    acaoRecomendada: "Realizar aferição com chumbo e recalibrar posição do manto hidraulicamente."
  },
  {
    chave: "vazaoOleoBuchaInterna",
    equipamento: "41BR001",
    nome: "Vazão de Óleo - Bucha Interna (l/m)",
    nomeCurto: "Vazão B. Interna",
    subsistema: "Conjunto Excêntrico",
    unidade: "l/m",
    minIdeal: 140,
    maxIdeal: 150,
    alvo: 145,
    decimais: 0,
    impactoDesvio: "Vazão abaixo de 140 l/m gera sublubrificação crítica; acima de 150 l/m eleva risco de transbordo e sobrepressão de selagem.",
    acaoRecomendada: "Regular válvula de fluxo de óleo da bucha interna e verificar estado dos elementos filtrantes da unidade lubrificante."
  },
  {
    chave: "vazaoOleoBuchaExterna",
    equipamento: "41BR001",
    nome: "Vazão de Óleo - Bucha Externa (l/m)",
    nomeCurto: "Vazão B. Externa",
    subsistema: "Mancal Cônico Externo",
    unidade: "l/m",
    minIdeal: 150,
    maxIdeal: 160,
    alvo: 155,
    decimais: 0,
    impactoDesvio: "Vazão fora da janela de 150 a 160 l/m compromete a hidrodinâmica do mancal de bronze externo.",
    acaoRecomendada: "Ajustar dosagem de vazão nas derivações e purgar eventuais bolsas de ar no circuito de retorno."
  },
  {
    chave: "pressaoOleoLubrificante",
    equipamento: "41BR001",
    nome: "Pressão do Óleo Lubrificante (Kg/cm²)",
    nomeCurto: "Pressão Óleo Lub.",
    subsistema: "Skid de Lubrificação",
    unidade: "Kg/cm²",
    minIdeal: 4.2,
    maxIdeal: 7.0,
    alvo: 5.6,
    decimais: 1,
    impactoDesvio: "Pressão < 4,2 Kg/cm² desprotege mancais cônicos; > 7,0 Kg/cm² indica restrição severa ou saturação de galerias.",
    acaoRecomendada: "Inspecionar pressostatos, bomba de lubrificação e manômetro diferencial do skid de óleo."
  },
  {
    chave: "pressaoArAcumulador",
    equipamento: "41BR001",
    nome: "Pressão Óleo Hidráulico (kg/cm²)",
    nomeCurto: "Pressão Óleo Hidr.",
    subsistema: "Sistema Hidráulico",
    unidade: "kg/cm²",
    minIdeal: 2.0,
    maxIdeal: 5.0,
    alvo: 3.5,
    decimais: 1,
    impactoDesvio: "Pressão hidráulica fora de 2,0 a 5,0 kg/cm² prejudica sustentação do eixo e alívio hidropneumático contra inquebráveis.",
    acaoRecomendada: "Verificar circuito hidráulico de pressurização e estanqueidade das válvulas direcionais."
  },
  {
    chave: "pressaoArAc1",
    equipamento: "41BR001",
    nome: "Pressão Ar - Acumulador 1 (kg/cm²)",
    nomeCurto: "Pressão Ar Ac. 1",
    subsistema: "Banco de Alívio (Ac. 1)",
    unidade: "kg/cm²",
    minIdeal: 5.0,
    maxIdeal: 7.0,
    alvo: 6.0,
    decimais: 1,
    impactoDesvio: "Pressão fora de 5 a 7 kg/cm² no Acumulador 1 causa assimetria no amortecimento de esforços dinâmicos.",
    acaoRecomendada: "Aferir pré-carga do acumulador 1 e verificar vedação da válvula de retenção."
  },
  {
    chave: "pressaoArAc2",
    equipamento: "41BR001",
    nome: "Pressão Ar - Acumulador 2 (kg/cm²)",
    nomeCurto: "Pressão Ar Ac. 2",
    subsistema: "Banco de Alívio (Ac. 2)",
    unidade: "kg/cm²",
    minIdeal: 5.0,
    maxIdeal: 7.0,
    alvo: 6.0,
    decimais: 1,
    impactoDesvio: "Pressão fora de 5 a 7 kg/cm² no Acumulador 2 descalibra a resposta de alívio do conjunto.",
    acaoRecomendada: "Equalizar pré-carga de nitrogênio/ar do acumulador 2 com o banco de alívio."
  },
  {
    chave: "pressaoAguaResfriamento",
    equipamento: "41BR001",
    nome: "Pressão da Água de Resfriamento (Kg/cm²)",
    nomeCurto: "Pressão Água Resfr.",
    subsistema: "Trocador de Calor",
    unidade: "Kg/cm²",
    minIdeal: 1.2,
    maxIdeal: 2.5,
    alvo: 1.8,
    decimais: 1,
    impactoDesvio: "Pressão de resfriamento insuficiente eleva a temperatura de trabalho do óleo lubrificante.",
    acaoRecomendada: "Checar bomba d'água de selagem/resfriamento e retrolavar trocador de calor de placas."
  },
  {
    chave: "amperagemMotor41TC001",
    equipamento: "41TC001",
    nome: "41TC001 - Amperagem do Motor (A)",
    nomeCurto: "Amp. 41TC001",
    subsistema: "Transportador 41TC001",
    unidade: "A",
    minIdeal: 0,
    maxIdeal: 37,
    alvo: 28,
    decimais: 0,
    impactoDesvio: "Amperagem do TC001 acima de 37 A indica sobrecarga de correia, atrito de guias ou material acumulado no chute.",
    acaoRecomendada: "Inspecionar alinhamento da correia, rotação livre de roletes e desobstruir transferência."
  },
  {
    chave: "amperagemMotor41BR001",
    equipamento: "41BR001",
    nome: "41BR001 - Amperagem do Motor (A)",
    nomeCurto: "Amp. 41BR001",
    subsistema: "Britador 41BR001",
    unidade: "A",
    minIdeal: 54,
    maxIdeal: 83,
    alvo: 72,
    decimais: 0,
    impactoDesvio: "Amperagem fora da faixa normal (54 a 83 A) indica subalimentação ou sobrecarga por blocos de alta dureza (pico crítico >170 A).",
    acaoRecomendada: "Ajustar taxa de alimentação da britagem, verificar blend de dureza do ROM e conferir esticamento de correias de acionamento."
  },
  {
    chave: "temperaturaOleoRetorno",
    equipamento: "41BR001",
    nome: "Temperatura Óleo - Retorno (ºC)",
    nomeCurto: "Temp. Retorno",
    subsistema: "Circuito de Retorno",
    unidade: "ºC",
    minIdeal: 35.0,
    maxIdeal: 50.0,
    alvo: 44.0,
    decimais: 1,
    impactoDesvio: "Temperatura de retorno acima de 50ºC degrada a viscosidade cinemática do óleo lubrificante.",
    acaoRecomendada: "Aumentar vazão do trocador de calor e programar limpeza preventiva de feixes."
  },
  {
    chave: "temperaturaOleoBuchaExterna",
    equipamento: "41BR001",
    nome: "Temperatura Óleo - Bucha Externa (ºC)",
    nomeCurto: "Temp. B. Externa",
    subsistema: "Mancal Externo",
    unidade: "ºC",
    minIdeal: 38.0,
    maxIdeal: 52.0,
    alvo: 48.0,
    decimais: 1,
    impactoDesvio: "Aquecimento na bucha externa (> 52ºC) indica atrito anormal e risco de fundição do mancal.",
    acaoRecomendada: "Monitorar termografia infravermelha periódica e colher amostra para análise ferrografia."
  },
  {
    chave: "temperaturaOleoBuchaInterna",
    equipamento: "41BR001",
    nome: "Temperatura Óleo - Bucha Interna (ºC)",
    nomeCurto: "Temp. B. Interna",
    subsistema: "Mancal Interno",
    unidade: "ºC",
    minIdeal: 50.0,
    maxIdeal: 57.0,
    alvo: 53.5,
    decimais: 1,
    impactoDesvio: "Temperatura na bucha interna acima de 57ºC é condição de alarme crítico contra engripamento do eixo.",
    acaoRecomendada: "Alinhar janela de inspeção imediata, checar circulação e comunicar supervisão de manutenção."
  }
];

export const CONFIG_PARAMETROS_REBRITAGEM: ParametroConfigRebritagem[] = [
  // 1. TEMPERATURA DO ÓLEO LUBRIFICANTE (°C) (BR001 a BR006)
  {
    chave: "tempOleoLub_BR001",
    grupo: "TEMPERATURA DO ÓLEO LUBRIFICANTE (°C)",
    equipamento: "BR001",
    nome: "Temp. Óleo Lubrificante - BR001",
    nomeCurto: "BR001",
    subsistema: "Lubrificação BR001",
    unidade: "°C",
    minIdeal: 35.0,
    maxIdeal: 55.0,
    alvo: 45.0,
    decimais: 1,
    impactoDesvio: "Temperatura do óleo lubrificante do BR001 acima de 55°C reduz a viscosidade do óleo e eleva risco de desgaste nos mancais e buchas.",
    acaoRecomendada: "Verificar vazão de resfriamento do trocador de calor e inspecionar circuito de lubrificação do BR001."
  },
  {
    chave: "tempOleoLub_BR002",
    grupo: "TEMPERATURA DO ÓLEO LUBRIFICANTE (°C)",
    equipamento: "BR002",
    nome: "Temp. Óleo Lubrificante - BR002",
    nomeCurto: "BR002",
    subsistema: "Lubrificação BR002",
    unidade: "°C",
    minIdeal: 35.0,
    maxIdeal: 55.0,
    alvo: 45.0,
    decimais: 1,
    impactoDesvio: "Temperatura do óleo lubrificante do BR002 acima de 55°C reduz a viscosidade do óleo e eleva risco de desgaste nos mancais e buchas.",
    acaoRecomendada: "Verificar vazão de resfriamento do trocador de calor e inspecionar circuito de lubrificação do BR002."
  },
  {
    chave: "tempOleoLub_BR003",
    grupo: "TEMPERATURA DO ÓLEO LUBRIFICANTE (°C)",
    equipamento: "BR003",
    nome: "Temp. Óleo Lubrificante - BR003",
    nomeCurto: "BR003",
    subsistema: "Lubrificação BR003",
    unidade: "°C",
    minIdeal: 35.0,
    maxIdeal: 55.0,
    alvo: 45.0,
    decimais: 1,
    impactoDesvio: "Temperatura do óleo lubrificante do BR003 acima de 55°C reduz a viscosidade do óleo e eleva risco de desgaste nos mancais e buchas.",
    acaoRecomendada: "Verificar vazão de resfriamento do trocador de calor e inspecionar circuito de lubrificação do BR003."
  },
  {
    chave: "tempOleoLub_BR004",
    grupo: "TEMPERATURA DO ÓLEO LUBRIFICANTE (°C)",
    equipamento: "BR004",
    nome: "Temp. Óleo Lubrificante - BR004",
    nomeCurto: "BR004",
    subsistema: "Lubrificação BR004",
    unidade: "°C",
    minIdeal: 35.0,
    maxIdeal: 55.0,
    alvo: 45.0,
    decimais: 1,
    impactoDesvio: "Temperatura do óleo lubrificante do BR004 acima de 55°C reduz a viscosidade do óleo e eleva risco de desgaste nos mancais e buchas.",
    acaoRecomendada: "Verificar vazão de resfriamento do trocador de calor e inspecionar circuito de lubrificação do BR004."
  },
  {
    chave: "tempOleoLub_BR005",
    grupo: "TEMPERATURA DO ÓLEO LUBRIFICANTE (°C)",
    equipamento: "BR005",
    nome: "Temp. Óleo Lubrificante - BR005",
    nomeCurto: "BR005",
    subsistema: "Lubrificação BR005",
    unidade: "°C",
    minIdeal: 35.0,
    maxIdeal: 55.0,
    alvo: 45.0,
    decimais: 1,
    impactoDesvio: "Temperatura do óleo lubrificante do BR005 acima de 55°C reduz a viscosidade do óleo e eleva risco de desgaste nos mancais e buchas.",
    acaoRecomendada: "Verificar vazão de resfriamento do trocador de calor e inspecionar circuito de lubrificação do BR005."
  },
  {
    chave: "tempOleoLub_BR006",
    grupo: "TEMPERATURA DO ÓLEO LUBRIFICANTE (°C)",
    equipamento: "BR006",
    nome: "Temp. Óleo Lubrificante - BR006",
    nomeCurto: "BR006",
    subsistema: "Lubrificação BR006",
    unidade: "°C",
    minIdeal: 35.0,
    maxIdeal: 55.0,
    alvo: 45.0,
    decimais: 1,
    impactoDesvio: "Temperatura do óleo lubrificante do BR006 acima de 55°C reduz a viscosidade do óleo e eleva risco de desgaste nos mancais e buchas.",
    acaoRecomendada: "Verificar vazão de resfriamento do trocador de calor e inspecionar circuito de lubrificação do BR006."
  },

  // 2. PRESSÃO DE ÓLEO NO HYDROSET (MPa) (BR003 a BR006)
  {
    chave: "pressaoHydroset_BR003",
    grupo: "PRESSÃO DE ÓLEO NO HYDROSET (MPa)",
    equipamento: "BR003",
    nome: "Pressão Hydroset - BR003",
    nomeCurto: "BR003",
    subsistema: "Hydroset BR003",
    unidade: "MPa",
    minIdeal: 2.0,
    maxIdeal: 5.5,
    alvo: 3.5,
    decimais: 2,
    impactoDesvio: "Pressão de Hydroset do BR003 fora da faixa operacional (2,0 a 5,5 MPa) prejudica o ajuste de fenda e alívio hidropneumático.",
    acaoRecomendada: "Checar estanqueidade do cilindro Hydroset, carga de nitrogênio dos acumuladores e recalibrar posição do manto."
  },
  {
    chave: "pressaoHydroset_BR004",
    grupo: "PRESSÃO DE ÓLEO NO HYDROSET (MPa)",
    equipamento: "BR004",
    nome: "Pressão Hydroset - BR004",
    nomeCurto: "BR004",
    subsistema: "Hydroset BR004",
    unidade: "MPa",
    minIdeal: 2.0,
    maxIdeal: 5.5,
    alvo: 3.5,
    decimais: 2,
    impactoDesvio: "Pressão de Hydroset do BR004 fora da faixa operacional (2,0 a 5,5 MPa) prejudica o ajuste de fenda e alívio hidropneumático.",
    acaoRecomendada: "Checar estanqueidade do cilindro Hydroset, carga de nitrogênio dos acumuladores e recalibrar posição do manto."
  },
  {
    chave: "pressaoHydroset_BR005",
    grupo: "PRESSÃO DE ÓLEO NO HYDROSET (MPa)",
    equipamento: "BR005",
    nome: "Pressão Hydroset - BR005",
    nomeCurto: "BR005",
    subsistema: "Hydroset BR005",
    unidade: "MPa",
    minIdeal: 2.0,
    maxIdeal: 5.5,
    alvo: 3.5,
    decimais: 2,
    impactoDesvio: "Pressão de Hydroset do BR005 fora da faixa operacional (2,0 a 5,5 MPa) prejudica o ajuste de fenda e alívio hidropneumático.",
    acaoRecomendada: "Checar estanqueidade do cilindro Hydroset, carga de nitrogênio dos acumuladores e recalibrar posição do manto."
  },
  {
    chave: "pressaoHydroset_BR006",
    grupo: "PRESSÃO DE ÓLEO NO HYDROSET (MPa)",
    equipamento: "BR006",
    nome: "Pressão Hydroset - BR006",
    nomeCurto: "BR006",
    subsistema: "Hydroset BR006",
    unidade: "MPa",
    minIdeal: 2.0,
    maxIdeal: 5.5,
    alvo: 3.5,
    decimais: 2,
    impactoDesvio: "Pressão de Hydroset do BR006 fora da faixa operacional (2,0 a 5,5 MPa) prejudica o ajuste de fenda e alívio hidropneumático.",
    acaoRecomendada: "Checar estanqueidade do cilindro Hydroset, carga de nitrogênio dos acumuladores e recalibrar posição do manto."
  },

  // 3. POTÊNCIA (kW) (BR001 a BR006)
  {
    chave: "potencia_BR001",
    grupo: "POTÊNCIA (kW)",
    equipamento: "BR001",
    nome: "Potência do Motor - BR001",
    nomeCurto: "BR001",
    subsistema: "Acionamento BR001",
    unidade: "kW",
    minIdeal: 180,
    maxIdeal: 350,
    alvo: 250,
    decimais: 0,
    impactoDesvio: "Potência do BR001 acima de 350 kW indica sobrecarga na câmara de britagem; abaixo de 180 kW indica subalimentação.",
    acaoRecomendada: "Ajustar taxa de alimentação pelo alimentador vibratório e monitorar dureza do minério alimentado."
  },
  {
    chave: "potencia_BR002",
    grupo: "POTÊNCIA (kW)",
    equipamento: "BR002",
    nome: "Potência do Motor - BR002",
    nomeCurto: "BR002",
    subsistema: "Acionamento BR002",
    unidade: "kW",
    minIdeal: 180,
    maxIdeal: 350,
    alvo: 250,
    decimais: 0,
    impactoDesvio: "Potência do BR002 acima de 350 kW indica sobrecarga na câmara de britagem; abaixo de 180 kW indica subalimentação.",
    acaoRecomendada: "Ajustar taxa de alimentação pelo alimentador vibratório e monitorar dureza do minério alimentado."
  },
  {
    chave: "potencia_BR003",
    grupo: "POTÊNCIA (kW)",
    equipamento: "BR003",
    nome: "Potência do Motor - BR003",
    nomeCurto: "BR003",
    subsistema: "Acionamento BR003",
    unidade: "kW",
    minIdeal: 180,
    maxIdeal: 350,
    alvo: 250,
    decimais: 0,
    impactoDesvio: "Potência do BR003 acima de 350 kW indica sobrecarga na câmara de britagem; abaixo de 180 kW indica subalimentação.",
    acaoRecomendada: "Ajustar taxa de alimentação pelo alimentador vibratório e monitorar dureza do minério alimentado."
  },
  {
    chave: "potencia_BR004",
    grupo: "POTÊNCIA (kW)",
    equipamento: "BR004",
    nome: "Potência do Motor - BR004",
    nomeCurto: "BR004",
    subsistema: "Acionamento BR004",
    unidade: "kW",
    minIdeal: 180,
    maxIdeal: 350,
    alvo: 250,
    decimais: 0,
    impactoDesvio: "Potência do BR004 acima de 350 kW indica sobrecarga na câmara de britagem; abaixo de 180 kW indica subalimentação.",
    acaoRecomendada: "Ajustar taxa de alimentação pelo alimentador vibratório e monitorar dureza do minério alimentado."
  },
  {
    chave: "potencia_BR005",
    grupo: "POTÊNCIA (kW)",
    equipamento: "BR005",
    nome: "Potência do Motor - BR005",
    nomeCurto: "BR005",
    subsistema: "Acionamento BR005",
    unidade: "kW",
    minIdeal: 180,
    maxIdeal: 350,
    alvo: 250,
    decimais: 0,
    impactoDesvio: "Potência do BR005 acima de 350 kW indica sobrecarga na câmara de britagem; abaixo de 180 kW indica subalimentação.",
    acaoRecomendada: "Ajustar taxa de alimentação pelo alimentador vibratório e monitorar dureza do minério alimentado."
  },
  {
    chave: "potencia_BR006",
    grupo: "POTÊNCIA (kW)",
    equipamento: "BR006",
    nome: "Potência do Motor - BR006",
    nomeCurto: "BR006",
    subsistema: "Acionamento BR006",
    unidade: "kW",
    minIdeal: 180,
    maxIdeal: 350,
    alvo: 250,
    decimais: 0,
    impactoDesvio: "Potência do BR006 acima de 350 kW indica sobrecarga na câmara de britagem; abaixo de 180 kW indica subalimentação.",
    acaoRecomendada: "Ajustar taxa de alimentação pelo alimentador vibratório e monitorar dureza do minério alimentado."
  },

  // 4. FREQUÊNCIA DO ALIMENTADOR (Hz) (BR001 a BR006)
  {
    chave: "freqAlimentador_BR001",
    grupo: "FREQUÊNCIA DO ALIMENTADOR (Hz)",
    equipamento: "BR001",
    nome: "Freq. Alimentador - BR001",
    nomeCurto: "BR001",
    subsistema: "Alimentador BR001",
    unidade: "Hz",
    minIdeal: 30.0,
    maxIdeal: 60.0,
    alvo: 50.0,
    decimais: 1,
    impactoDesvio: "Frequência do alimentador fora de 30 a 60 Hz gera instabilidade volumétrica na câmara do britador.",
    acaoRecomendada: "Ajustar sintonia do controle PID do alimentador e checar integridade de molas e excitadores."
  },
  {
    chave: "freqAlimentador_BR002",
    grupo: "FREQUÊNCIA DO ALIMENTADOR (Hz)",
    equipamento: "BR002",
    nome: "Freq. Alimentador - BR002",
    nomeCurto: "BR002",
    subsistema: "Alimentador BR002",
    unidade: "Hz",
    minIdeal: 30.0,
    maxIdeal: 60.0,
    alvo: 50.0,
    decimais: 1,
    impactoDesvio: "Frequência do alimentador fora de 30 a 60 Hz gera instabilidade volumétrica na câmara do britador.",
    acaoRecomendada: "Ajustar sintonia do controle PID do alimentador e checar integridade de molas e excitadores."
  },
  {
    chave: "freqAlimentador_BR003",
    grupo: "FREQUÊNCIA DO ALIMENTADOR (Hz)",
    equipamento: "BR003",
    nome: "Freq. Alimentador - BR003",
    nomeCurto: "BR003",
    subsistema: "Alimentador BR003",
    unidade: "Hz",
    minIdeal: 30.0,
    maxIdeal: 60.0,
    alvo: 50.0,
    decimais: 1,
    impactoDesvio: "Frequência do alimentador fora de 30 a 60 Hz gera instabilidade volumétrica na câmara do britador.",
    acaoRecomendada: "Ajustar sintonia do controle PID do alimentador e checar integridade de molas e excitadores."
  },
  {
    chave: "freqAlimentador_BR004",
    grupo: "FREQUÊNCIA DO ALIMENTADOR (Hz)",
    equipamento: "BR004",
    nome: "Freq. Alimentador - BR004",
    nomeCurto: "BR004",
    subsistema: "Alimentador BR004",
    unidade: "Hz",
    minIdeal: 30.0,
    maxIdeal: 60.0,
    alvo: 50.0,
    decimais: 1,
    impactoDesvio: "Frequência do alimentador fora de 30 a 60 Hz gera instabilidade volumétrica na câmara do britador.",
    acaoRecomendada: "Ajustar sintonia do controle PID do alimentador e checar integridade de molas e excitadores."
  },
  {
    chave: "freqAlimentador_BR005",
    grupo: "FREQUÊNCIA DO ALIMENTADOR (Hz)",
    equipamento: "BR005",
    nome: "Freq. Alimentador - BR005",
    nomeCurto: "BR005",
    subsistema: "Alimentador BR005",
    unidade: "Hz",
    minIdeal: 30.0,
    maxIdeal: 60.0,
    alvo: 50.0,
    decimais: 1,
    impactoDesvio: "Frequência do alimentador fora de 30 a 60 Hz gera instabilidade volumétrica na câmara do britador.",
    acaoRecomendada: "Ajustar sintonia do controle PID do alimentador e checar integridade de molas e excitadores."
  },
  {
    chave: "freqAlimentador_BR006",
    grupo: "FREQUÊNCIA DO ALIMENTADOR (Hz)",
    equipamento: "BR006",
    nome: "Freq. Alimentador - BR006",
    nomeCurto: "BR006",
    subsistema: "Alimentador BR006",
    unidade: "Hz",
    minIdeal: 30.0,
    maxIdeal: 60.0,
    alvo: 50.0,
    decimais: 1,
    impactoDesvio: "Frequência do alimentador fora de 30 a 60 Hz gera instabilidade volumétrica na câmara do britador.",
    acaoRecomendada: "Ajustar sintonia do controle PID do alimentador e checar integridade de molas e excitadores."
  },

  // 5. DIF. TEMP (°C) (BR001 e BR002)
  {
    chave: "difTemp_BR001",
    grupo: "DIF. TEMP (°C)",
    equipamento: "BR001",
    nome: "Dif. Temp - BR001",
    nomeCurto: "BR001",
    subsistema: "Térmico BR001",
    unidade: "°C",
    minIdeal: 0.0,
    maxIdeal: 8.0,
    alvo: 4.0,
    decimais: 1,
    impactoDesvio: "Diferencial de temperatura do BR001 acima de 8,0°C indica atrito excessivo no conjunto excêntrico/mancais.",
    acaoRecomendada: "Executar termografia infravermelha, checar folgas mecânicas e verificar lubrificação."
  },
  {
    chave: "difTemp_BR002",
    grupo: "DIF. TEMP (°C)",
    equipamento: "BR002",
    nome: "Dif. Temp - BR002",
    nomeCurto: "BR002",
    subsistema: "Térmico BR002",
    unidade: "°C",
    minIdeal: 0.0,
    maxIdeal: 8.0,
    alvo: 4.0,
    decimais: 1,
    impactoDesvio: "Diferencial de temperatura do BR002 acima de 8,0°C indica atrito excessivo no conjunto excêntrico/mancais.",
    acaoRecomendada: "Executar termografia infravermelha, checar folgas mecânicas e verificar lubrificação."
  },

  // 6. PRESSÃO CONTRAEIXO (MPa) (BR001 e BR002)
  {
    chave: "pressaoContraeixo_BR001",
    grupo: "PRESSÃO CONTRAEIXO (MPa)",
    equipamento: "BR001",
    nome: "Pressão Contraeixo - BR001",
    nomeCurto: "BR001",
    subsistema: "Contraeixo BR001",
    unidade: "MPa",
    minIdeal: 0.15,
    maxIdeal: 0.45,
    alvo: 0.25,
    decimais: 2,
    impactoDesvio: "Pressão de óleo do contraeixo do BR001 fora de 0,15 a 0,45 MPa compromete a durabilidade dos rolamentos e engrenagens.",
    acaoRecomendada: "Ajustar válvula reguladora da linha do contraeixo e checar vedação de retentores."
  },
  {
    chave: "pressaoContraeixo_BR002",
    grupo: "PRESSÃO CONTRAEIXO (MPa)",
    equipamento: "BR002",
    nome: "Pressão Contraeixo - BR002",
    nomeCurto: "BR002",
    subsistema: "Contraeixo BR002",
    unidade: "MPa",
    minIdeal: 0.15,
    maxIdeal: 0.45,
    alvo: 0.25,
    decimais: 2,
    impactoDesvio: "Pressão de óleo do contraeixo do BR002 fora de 0,15 a 0,45 MPa compromete a durabilidade dos rolamentos e engrenagens.",
    acaoRecomendada: "Ajustar válvula reguladora da linha do contraeixo e checar vedação de retentores."
  },

  // 7. DIF. PRESSÃO (MPa) (BR001 e BR002)
  {
    chave: "difPressao_BR001",
    grupo: "DIF. PRESSÃO (MPa)",
    equipamento: "BR001",
    nome: "Dif. Pressão - BR001",
    nomeCurto: "BR001",
    subsistema: "Filtros BR001",
    unidade: "MPa",
    minIdeal: 0.00,
    maxIdeal: 0.15,
    alvo: 0.05,
    decimais: 2,
    impactoDesvio: "Diferencial de pressão acima de 0,15 MPa no BR001 indica saturação/obstrução do elemento filtrante de óleo.",
    acaoRecomendada: "Comutar para o filtro reserva do skid duplex e substituir elemento filtrante saturado."
  },
  {
    chave: "difPressao_BR002",
    grupo: "DIF. PRESSÃO (MPa)",
    equipamento: "BR002",
    nome: "Dif. Pressão - BR002",
    nomeCurto: "BR002",
    subsistema: "Filtros BR002",
    unidade: "MPa",
    minIdeal: 0.00,
    maxIdeal: 0.15,
    alvo: 0.05,
    decimais: 2,
    impactoDesvio: "Diferencial de pressão acima de 0,15 MPa no BR002 indica saturação/obstrução do elemento filtrante de óleo.",
    acaoRecomendada: "Comutar para o filtro reserva do skid duplex e substituir elemento filtrante saturado."
  },
  // 8. % RETIDO EM 1/2" (%)
  {
    chave: "retidoMeiaPol",
    grupo: "GRANULOMETRIA (%)",
    equipamento: "Peneiras",
    nome: "% Retido em 1/2\"",
    nomeCurto: "% Ret. 1/2\"",
    subsistema: "Classificação Peneiras",
    unidade: "%",
    minIdeal: 6.0,
    maxIdeal: 12.0,
    alvo: 11.0,
    decimais: 1,
    impactoDesvio: "Percentual retido em 1/2'' acima de 12,0% sobrecarrega a moagem primária e reduz a taxa de tratamento dos moinhos.",
    acaoRecomendada: "Revisar abertura de fenda (CSS) dos britadores quaternários/terciários e inspecionar integridade mecânica das telas das peneiras."
  },
  // 9. PRODUTIVIDADE (tph)
  {
    chave: "produtividadeTph",
    grupo: "PRODUTIVIDADE (tph)",
    equipamento: "Rebritagem",
    nome: "Produtividade (tph)",
    nomeCurto: "Produtividade",
    subsistema: "Circuito Rebritagem",
    unidade: "tph",
    minIdeal: 850,
    maxIdeal: 1300,
    alvo: 1020,
    decimais: 0,
    impactoDesvio: "Produtividade da rebritagem abaixo de 850 tph restringe o abastecimento contínuo dos silos de finos da moagem.",
    acaoRecomendada: "Otimizar velocidade dos alimentadores vibratórios, balancear alimentação dos britadores cônicos e manter nível estável da pilha intermediária."
  }
];

// ==========================================
// 3. MONITORAMENTO OPERACIONAL DIÁRIO: MOAGEM (MI003, MI004, MI005)
// ==========================================

export interface RegistroDiarioIndicadoresMoagem {
  dia: "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
  diaLabel: string; // "Segunda-feira", "Terça-feira", etc.

  // 1. TONELAGEM (t/h)
  taxa_MI003: number | "";
  taxa_MI004: number | "";
  taxa_MI005: number | "";

  // 2. POTÊNCIA (KW)
  potencia_MI003: number | "";
  potencia_MI004: number | "";
  potencia_MI005: number | "";

  // 4. PERCENTUAL DE SÓLIDOS - OVERFLOW (%)
  solidosOverflow_MI003: number | "";
  solidosOverflow_MI004: number | "";
  solidosOverflow_MI005: number | "";

  // 5. PERCENTUAL DE SÓLIDOS - DESCARGA (%)
  solidosDescarga_MI003: number | "";
  solidosDescarga_MI004: number | "";
  solidosDescarga_MI005: number | "";

  // 6. CONTROLE DE REPOSIÇÕES
  reposicoes_MI003: number | string | "";
  reposicoes_MI004: number | string | "";
  reposicoes_MI005: number | string | "";

  // 7. PRESSÃO HIDROCICLONAGEM (kgf/cm²)
  pressaoHidrociclone_MI003: number | string | "";
  pressaoHidrociclone_MI004: number | string | "";
  pressaoHidrociclone_MI005: number | string | "";

  // 8. DENSIDADE (g/cm³)
  densidade_MI003: number | "";
  densidade_MI004: number | "";
  densidade_MI005: number | "";

  // 9. PSI300 / PSI500
  pressaoPsi_MI003: number | string | "";
  pressaoPsi_MI004: number | string | "";
  pressaoPsi_MI005: number | string | "";

  observacao?: string;
}

export interface ParametroConfigMoagem {
  chave: keyof Omit<RegistroDiarioIndicadoresMoagem, "dia" | "diaLabel" | "observacao">;
  grupo: string;
  equipamento: string;
  nome: string;
  nomeCurto: string;
  subsistema: string;
  unidade: string;
  minIdeal: number;
  maxIdeal: number;
  alvo: number;
  decimais: number;
  impactoDesvio: string;
  acaoRecomendada: string;
}

export const CONFIG_PARAMETROS_MOAGEM: ParametroConfigMoagem[] = [
  // 1. TONELAGEM (t/h)
  {
    chave: "taxa_MI003",
    grupo: "TONELAGEM (t/h)",
    equipamento: "MI003",
    nome: "Taxa Alimentação - MI003",
    nomeCurto: "MI003",
    subsistema: "Moagem Linha 1",
    unidade: "t/h",
    minIdeal: 180,
    maxIdeal: 245,
    alvo: 205,
    decimais: 0,
    impactoDesvio: "Taxa de alimentação do MI003 fora da faixa planejada afeta a capacidade horária e a estabilidade da flotação.",
    acaoRecomendada: "Regular velocidade dos alimentadores do silo de finos e calibrar balança integradora de alimentação."
  },
  {
    chave: "taxa_MI004",
    grupo: "TONELAGEM (t/h)",
    equipamento: "MI004",
    nome: "Taxa Alimentação - MI004",
    nomeCurto: "MI004",
    subsistema: "Moagem Linha 2",
    unidade: "t/h",
    minIdeal: 175,
    maxIdeal: 235,
    alvo: 198,
    decimais: 0,
    impactoDesvio: "Taxa de alimentação do MI004 fora da faixa planejada afeta a capacidade horária e a estabilidade da flotação.",
    acaoRecomendada: "Regular velocidade dos alimentadores do silo de finos e calibrar balança integradora de alimentação."
  },
  {
    chave: "taxa_MI005",
    grupo: "TONELAGEM (t/h)",
    equipamento: "MI005",
    nome: "Taxa Alimentação - MI005",
    nomeCurto: "MI005",
    subsistema: "Moagem Linha 3",
    unidade: "t/h",
    minIdeal: 180,
    maxIdeal: 240,
    alvo: 202,
    decimais: 0,
    impactoDesvio: "Taxa de alimentação do MI005 fora da faixa planejada afeta a capacidade horária e a estabilidade da flotação.",
    acaoRecomendada: "Regular velocidade dos alimentadores do silo de finos e calibrar balança integradora de alimentação."
  },

  // 2. POTÊNCIA (KW)
  {
    chave: "potencia_MI003",
    grupo: "POTÊNCIA (KW)",
    equipamento: "MI003",
    nome: "Potência - MI003",
    nomeCurto: "MI003",
    subsistema: "Motor MI003",
    unidade: "kW",
    minIdeal: 2400,
    maxIdeal: 3500,
    alvo: 2921,
    decimais: 0,
    impactoDesvio: "Potência fora da faixa (2400-3500 kW) indica sobrecarga mecânica ou subcarga de corpos moedores.",
    acaoRecomendada: "Avaliar nível de carga de bolas do moinho e balancear taxa de alimentação."
  },
  {
    chave: "potencia_MI004",
    grupo: "POTÊNCIA (KW)",
    equipamento: "MI004",
    nome: "Potência - MI004",
    nomeCurto: "MI004",
    subsistema: "Motor MI004",
    unidade: "kW",
    minIdeal: 2400,
    maxIdeal: 3500,
    alvo: 3263,
    decimais: 0,
    impactoDesvio: "Potência fora da faixa (2400-3500 kW) indica sobrecarga mecânica ou subcarga de corpos moedores.",
    acaoRecomendada: "Avaliar nível de carga de bolas do moinho e balancear taxa de alimentação."
  },
  {
    chave: "potencia_MI005",
    grupo: "POTÊNCIA (KW)",
    equipamento: "MI005",
    nome: "Potência - MI005",
    nomeCurto: "MI005",
    subsistema: "Motor MI005",
    unidade: "kW",
    minIdeal: 2400,
    maxIdeal: 3500,
    alvo: 3100,
    decimais: 0,
    impactoDesvio: "Potência fora da faixa (2400-3500 kW) indica sobrecarga mecânica ou subcarga de corpos moedores.",
    acaoRecomendada: "Avaliar nível de carga de bolas do moinho e balancear taxa de alimentação."
  },

  // 4. PERCENTUAL DE SÓLIDOS - OVERFLOW (%)
  {
    chave: "solidosOverflow_MI003",
    grupo: "PERCENTUAL DE SÓLIDOS - OVERFLOW (%)",
    equipamento: "MI003",
    nome: "% Sólidos OF - MI003",
    nomeCurto: "MI003",
    subsistema: "Hidrociclones BH003",
    unidade: "%",
    minIdeal: 32.0,
    maxIdeal: 44.0,
    alvo: 40.0,
    decimais: 1,
    impactoDesvio: "% Sólidos no overflow acima de 44% prejudica o P80 e reduz a recuperação metalúrgica da flotação.",
    acaoRecomendada: "Ajustar água de diluição na caixa de alimentação dos hidrociclones."
  },
  {
    chave: "solidosOverflow_MI004",
    grupo: "PERCENTUAL DE SÓLIDOS - OVERFLOW (%)",
    equipamento: "MI004",
    nome: "% Sólidos OF - MI004",
    nomeCurto: "MI004",
    subsistema: "Hidrociclones BH004",
    unidade: "%",
    minIdeal: 32.0,
    maxIdeal: 44.0,
    alvo: 43.0,
    decimais: 1,
    impactoDesvio: "% Sólidos no overflow acima de 44% prejudica o P80 e reduz a recuperação metalúrgica da flotação.",
    acaoRecomendada: "Ajustar água de diluição na caixa de alimentação dos hidrociclones."
  },
  {
    chave: "solidosOverflow_MI005",
    grupo: "PERCENTUAL DE SÓLIDOS - OVERFLOW (%)",
    equipamento: "MI005",
    nome: "% Sólidos OF - MI005",
    nomeCurto: "MI005",
    subsistema: "Hidrociclones BH005",
    unidade: "%",
    minIdeal: 32.0,
    maxIdeal: 44.0,
    alvo: 40.0,
    decimais: 1,
    impactoDesvio: "% Sólidos no overflow acima de 44% prejudica o P80 e reduz a recuperação metalúrgica da flotação.",
    acaoRecomendada: "Ajustar água de diluição na caixa de alimentação dos hidrociclones."
  },

  // 5. PERCENTUAL DE SÓLIDOS - DESCARGA (%)
  {
    chave: "solidosDescarga_MI003",
    grupo: "PERCENTUAL DE SÓLIDOS - DESCARGA (%)",
    equipamento: "MI003",
    nome: "% Sólidos Desc. - MI003",
    nomeCurto: "MI003",
    subsistema: "Descarga MI003",
    unidade: "%",
    minIdeal: 70.0,
    maxIdeal: 83.0,
    alvo: 79.0,
    decimais: 1,
    impactoDesvio: "% Sólidos na descarga fora da janela de 70 a 83% altera a viscosidade e a eficiência de quebra no moinho.",
    acaoRecomendada: "Regular vazão de água de alimentação primária na bica de entrada do moinho."
  },
  {
    chave: "solidosDescarga_MI004",
    grupo: "PERCENTUAL DE SÓLIDOS - DESCARGA (%)",
    equipamento: "MI004",
    nome: "% Sólidos Desc. - MI004",
    nomeCurto: "MI004",
    subsistema: "Descarga MI004",
    unidade: "%",
    minIdeal: 70.0,
    maxIdeal: 83.0,
    alvo: 80.0,
    decimais: 1,
    impactoDesvio: "% Sólidos na descarga fora da janela de 70 a 83% altera a viscosidade e a eficiência de quebra no moinho.",
    acaoRecomendada: "Regular vazão de água de alimentação primária na bica de entrada do moinho."
  },
  {
    chave: "solidosDescarga_MI005",
    grupo: "PERCENTUAL DE SÓLIDOS - DESCARGA (%)",
    equipamento: "MI005",
    nome: "% Sólidos Desc. - MI005",
    nomeCurto: "MI005",
    subsistema: "Descarga MI005",
    unidade: "%",
    minIdeal: 70.0,
    maxIdeal: 83.0,
    alvo: 78.0,
    decimais: 1,
    impactoDesvio: "% Sólidos na descarga fora da janela de 70 a 83% altera a viscosidade e a eficiência de quebra no moinho.",
    acaoRecomendada: "Regular vazão de água de alimentação primária na bica de entrada do moinho."
  },

  // 6. CONTROLE DE REPOSIÇÕES
  {
    chave: "reposicoes_MI003",
    grupo: "CONTROLE DE REPOSIÇÕES",
    equipamento: "MI003",
    nome: "Reposição Bolas - MI003",
    nomeCurto: "MI003",
    subsistema: "Carga Bolas MI003",
    unidade: "t/recarga",
    minIdeal: 0,
    maxIdeal: 15,
    alvo: 5,
    decimais: 1,
    impactoDesvio: "Falta de reposição periódica de bolas reduz a energia de cominuição e eleva o P80.",
    acaoRecomendada: "Executar recarga de bolas de aço conforme programação metalúrgica."
  },
  {
    chave: "reposicoes_MI004",
    grupo: "CONTROLE DE REPOSIÇÕES",
    equipamento: "MI004",
    nome: "Reposição Bolas - MI004",
    nomeCurto: "MI004",
    subsistema: "Carga Bolas MI004",
    unidade: "t/recarga",
    minIdeal: 0,
    maxIdeal: 15,
    alvo: 5,
    decimais: 1,
    impactoDesvio: "Falta de reposição periódica de bolas reduz a energia de cominuição e eleva o P80.",
    acaoRecomendada: "Executar recarga de bolas de aço conforme programação metalúrgica."
  },
  {
    chave: "reposicoes_MI005",
    grupo: "CONTROLE DE REPOSIÇÕES",
    equipamento: "MI005",
    nome: "Reposição Bolas - MI005",
    nomeCurto: "MI005",
    subsistema: "Carga Bolas MI005",
    unidade: "t/recarga",
    minIdeal: 0,
    maxIdeal: 15,
    alvo: 5,
    decimais: 1,
    impactoDesvio: "Falta de reposição periódica de bolas reduz a energia de cominuição e eleva o P80.",
    acaoRecomendada: "Executar recarga de bolas de aço conforme programação metalúrgica."
  },

  // 7. PRESSÃO HIDROCICLONAGEM (kgf/cm²)
  {
    chave: "pressaoHidrociclone_MI003",
    grupo: "PRESSÃO HIDROCICLONAGEM (kgf/cm²)",
    equipamento: "MI003",
    nome: "Pressão Hidrociclone - MI003",
    nomeCurto: "MI003",
    subsistema: "Bateria 43BH003",
    unidade: "kgf/cm²",
    minIdeal: 0.8,
    maxIdeal: 2.2,
    alvo: 1.4,
    decimais: 2,
    impactoDesvio: "Pressão fora da janela de 0,8 a 2,2 kgf/cm² descalibra a classificação nos hidrociclones gerando by-pass de grossos ou sobremoagem.",
    acaoRecomendada: "Manobrar válvulas de gaveta/mangote dos hidrociclones e desobstruir bicos apex/vortex."
  },
  {
    chave: "pressaoHidrociclone_MI004",
    grupo: "PRESSÃO HIDROCICLONAGEM (kgf/cm²)",
    equipamento: "MI004",
    nome: "Pressão Hidrociclone - MI004",
    nomeCurto: "MI004",
    subsistema: "Bateria 43BH004",
    unidade: "kgf/cm²",
    minIdeal: 0.8,
    maxIdeal: 2.2,
    alvo: 1.4,
    decimais: 2,
    impactoDesvio: "Pressão fora da janela de 0,8 a 2,2 kgf/cm² descalibra a classificação nos hidrociclones gerando by-pass de grossos ou sobremoagem.",
    acaoRecomendada: "Manobrar válvulas de gaveta/mangote dos hidrociclones e desobstruir bicos apex/vortex."
  },
  {
    chave: "pressaoHidrociclone_MI005",
    grupo: "PRESSÃO HIDROCICLONAGEM (kgf/cm²)",
    equipamento: "MI005",
    nome: "Pressão Hidrociclone - MI005",
    nomeCurto: "MI005",
    subsistema: "Bateria 43BH005",
    unidade: "kgf/cm²",
    minIdeal: 0.8,
    maxIdeal: 2.2,
    alvo: 1.4,
    decimais: 2,
    impactoDesvio: "Pressão fora da janela de 0,8 a 2,2 kgf/cm² descalibra a classificação nos hidrociclones gerando by-pass de grossos ou sobremoagem.",
    acaoRecomendada: "Manobrar válvulas de gaveta/mangote dos hidrociclones e desobstruir bicos apex/vortex."
  },

  // 8. DENSIDADE (g/cm³)
  {
    chave: "densidade_MI003",
    grupo: "DENSIDADE (g/cm³)",
    equipamento: "MI003",
    nome: "Densidade Polpa - MI003",
    nomeCurto: "MI003",
    subsistema: "Polpa MI003",
    unidade: "g/cm³",
    minIdeal: 1.50,
    maxIdeal: 1.85,
    alvo: 1.68,
    decimais: 2,
    impactoDesvio: "Densidade da polpa fora da faixa de 1,50 a 1,85 g/cm³ altera a viscosidade e a dinâmica de corte dos ciclones.",
    acaoRecomendada: "Ajustar água de diluição no poço da bomba de alimentação dos ciclones."
  },
  {
    chave: "densidade_MI004",
    grupo: "DENSIDADE (g/cm³)",
    equipamento: "MI004",
    nome: "Densidade Polpa - MI004",
    nomeCurto: "MI004",
    subsistema: "Polpa MI004",
    unidade: "g/cm³",
    minIdeal: 1.50,
    maxIdeal: 1.85,
    alvo: 1.70,
    decimais: 2,
    impactoDesvio: "Densidade da polpa fora da faixa de 1,50 a 1,85 g/cm³ altera a viscosidade e a dinâmica de corte dos ciclones.",
    acaoRecomendada: "Ajustar água de diluição no poço da bomba de alimentação dos ciclones."
  },
  {
    chave: "densidade_MI005",
    grupo: "DENSIDADE (g/cm³)",
    equipamento: "MI005",
    nome: "Densidade Polpa - MI005",
    nomeCurto: "MI005",
    subsistema: "Polpa MI005",
    unidade: "g/cm³",
    minIdeal: 1.50,
    maxIdeal: 1.85,
    alvo: 1.68,
    decimais: 2,
    impactoDesvio: "Densidade da polpa fora da faixa de 1,50 a 1,85 g/cm³ altera a viscosidade e a dinâmica de corte dos ciclones.",
    acaoRecomendada: "Ajustar água de diluição no poço da bomba de alimentação dos ciclones."
  },

  // 9. PSI300 / PSI500
  {
    chave: "pressaoPsi_MI003",
    grupo: "PSI300 / PSI500",
    equipamento: "MI003",
    nome: "Pressão PSI - MI003",
    nomeCurto: "MI003",
    subsistema: "Pressão PSI300",
    unidade: "PSI",
    minIdeal: 40.0,
    maxIdeal: 80.0,
    alvo: 60.2,
    decimais: 1,
    impactoDesvio: "Pressão PSI fora da faixa normal (40 a 80 PSI) indica oscilação na vazão de bombeamento ou restrição de linha.",
    acaoRecomendada: "Inspecionar bombas de polpa, manômetros e tubulação de recalque."
  },
  {
    chave: "pressaoPsi_MI004",
    grupo: "PSI300 / PSI500",
    equipamento: "MI004",
    nome: "Pressão PSI - MI004",
    nomeCurto: "MI004",
    subsistema: "Pressão PSI300",
    unidade: "PSI",
    minIdeal: 40.0,
    maxIdeal: 80.0,
    alvo: 60.0,
    decimais: 1,
    impactoDesvio: "Pressão PSI fora da faixa normal (40 a 80 PSI) indica oscilação na vazão de bombeamento ou restrição de linha.",
    acaoRecomendada: "Inspecionar bombas de polpa, manômetros e tubulação de recalque."
  },
  {
    chave: "pressaoPsi_MI005",
    grupo: "PSI300 / PSI500",
    equipamento: "MI005",
    nome: "Pressão PSI - MI005",
    nomeCurto: "MI005",
    subsistema: "Pressão PSI500",
    unidade: "PSI",
    minIdeal: 40.0,
    maxIdeal: 80.0,
    alvo: 60.0,
    decimais: 1,
    impactoDesvio: "Pressão PSI fora da faixa normal (40 a 80 PSI) indica oscilação na vazão de bombeamento ou restrição de linha.",
    acaoRecomendada: "Inspecionar bombas de polpa, manômetros e tubulação de recalque."
  }
];

// ==========================================
// 2.3 MONITORAMENTO DIÁRIO DA REMOAGEM (HIG MILL)
// ==========================================

export interface RegistroDiarioIndicadoresRemoagem {
  dia: "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
  diaLabel: string; // "Segunda-feira", "Terça-feira", etc.

  // 1. Derrick isoladas/by pass
  derrickIsoladas: number | string | "";

  // 2. Alimentação Feed F80 (µm)
  alimentacaoFeedF80: number | "";

  // 3. Produto HIG p80 micron (µm)
  produtoHigP80: number | "";

  // 4. Densidade Produto Hig (g/cm³)
  densidadeProdutoHig: number | "";

  // 5. Produto HIG > 74 micron (%)
  produtoHig74: number | "";

  // 6. Densidade Alimentação % Sólidos (m) DIT-006 (%)
  densidadeAlimDit006: number | "";

  // 7. Fluxo de alimentação FIT-403-072 (m3/h)
  fluxoAlimFit403072: number | "";

  // 8. Fluxo de alimentação (m3/h)
  fluxoAlimentacao: number | "";

  // 9. Potência kW
  potenciaKw: number | "";

  // 10. Torque %
  torquePct: number | "";

  observacao?: string;
}

export interface ParametroConfigRemoagem {
  chave: keyof Omit<RegistroDiarioIndicadoresRemoagem, "dia" | "diaLabel" | "observacao">;
  nome: string;
  nomeCurto: string;
  unidade: string;
  minIdeal: number;
  maxIdeal: number;
  alvo: number;
  decimais: number;
  impactoDesvio: string;
  acaoRecomendada: string;
  equipamento?: string;
  subsistema?: string;
  grupo?: string;
}

export const CONFIG_PARAMETROS_REMOAGEM: ParametroConfigRemoagem[] = [
  {
    chave: "derrickIsoladas",
    nome: "Derrick Isoladas / By Pass",
    nomeCurto: "Derrick isoladas/by pass",
    unidade: "un",
    minIdeal: 0,
    maxIdeal: 2,
    alvo: 0,
    decimais: 0,
    impactoDesvio: "Peneiras Derrick em bypass aumentam o corte granulométrico e sobrecarregam o moinho de remoagem HIG.",
    acaoRecomendada: "Inspecionar integridade das telas Derrick, limpar painéis entupidos e retomar fluxo normal."
  },
  {
    chave: "alimentacaoFeedF80",
    nome: "Alimentação Feed F80",
    nomeCurto: "Alimentação Feed F80",
    unidade: "µm",
    minIdeal: 60,
    maxIdeal: 120,
    alvo: 85,
    decimais: 1,
    impactoDesvio: "F80 acima de 120µm reduz a liberação mineral e satura o meio moedor cerâmico do HIG.",
    acaoRecomendada: "Ajustar classificação primária e pressão dos hidrociclones de remoagem."
  },
  {
    chave: "produtoHigP80",
    nome: "Produto HIG P80",
    nomeCurto: "Produto HIG p80 micron",
    unidade: "µm",
    minIdeal: 25,
    maxIdeal: 50,
    alvo: 38,
    decimais: 1,
    impactoDesvio: "P80 acima da meta (>50µm) prejudica a seletividade e recuperação na flotação cleaner de cobre.",
    acaoRecomendada: "Ajustar velocidade do eixo/potência específica do HIG e taxa de alimentação."
  },
  {
    chave: "densidadeProdutoHig",
    nome: "Densidade Produto HIG",
    nomeCurto: "Densidade Produto Hig",
    unidade: "g/cm³",
    minIdeal: 1.15,
    maxIdeal: 1.45,
    alvo: 1.28,
    decimais: 2,
    impactoDesvio: "Densidade fora de controle altera viscosidade, cinética de quebra e tempo de residência.",
    acaoRecomendada: "Controlar dosagem de água de processo na entrada e saída do circuito de remoagem."
  },
  {
    chave: "produtoHig74",
    nome: "Produto HIG > 74µm",
    nomeCurto: "Produto HIG > 74 micron",
    unidade: "%",
    minIdeal: 0.5,
    maxIdeal: 6.0,
    alvo: 2.2,
    decimais: 1,
    impactoDesvio: "Fração retida >74µm elevada no produto do HIG causa perdas por não liberação no concentrado final.",
    acaoRecomendada: "Verificar carga de bolas cerâmicas no HIG e desgaste dos rotores/estatores."
  },
  {
    chave: "densidadeAlimDit006",
    nome: "Densidade Alimentação DIT-006",
    nomeCurto: "Densidade Alimentação % Sólidos (m) DIT-006",
    unidade: "%",
    minIdeal: 30,
    maxIdeal: 50,
    alvo: 42,
    decimais: 1,
    impactoDesvio: "% Sólidos fora da faixa no DIT-006 desestabiliza a eficiência de classificação e alimentação.",
    acaoRecomendada: "Modular água de diluição na caixa de bomba do DIT-006."
  },
  {
    chave: "fluxoAlimFit403072",
    nome: "Fluxo Alimentação FIT-403-072",
    nomeCurto: "Fluxo de alimentação FIT-403-072 (m3/h)",
    unidade: "m³/h",
    minIdeal: 100,
    maxIdeal: 280,
    alvo: 180,
    decimais: 1,
    impactoDesvio: "Oscilação no transmissor FIT-403-072 gera variações bruscas de carga hidráulica.",
    acaoRecomendada: "Calibrar transmissor de vazão e verificar estabilidade da bomba de polpa."
  },
  {
    chave: "fluxoAlimentacao",
    nome: "Fluxo de Alimentação",
    nomeCurto: "Fluxo de alimentação (m3/h)",
    unidade: "m³/h",
    minIdeal: 100,
    maxIdeal: 290,
    alvo: 185,
    decimais: 1,
    impactoDesvio: "Vazão excessiva reduz o tempo de contato mineral-esfera moedora no HIG.",
    acaoRecomendada: "Ajustar setpoint de vazão e controlar nível da caixa de alimentação."
  },
  {
    chave: "potenciaKw",
    nome: "Potência HIG",
    nomeCurto: "Potência kW",
    unidade: "kW",
    minIdeal: 350,
    maxIdeal: 850,
    alvo: 580,
    decimais: 0,
    impactoDesvio: "Potência anormal reflete falta de carga moedora (baixa) ou empacotamento/bloqueio (alta).",
    acaoRecomendada: "Efetuar recarga de microesferas cerâmicas ou verificar bloqueios no vaso do HIG."
  },
  {
    chave: "torquePct",
    nome: "Torque HIG",
    nomeCurto: "Torque %",
    unidade: "%",
    minIdeal: 45,
    maxIdeal: 88,
    alvo: 68,
    decimais: 1,
    impactoDesvio: "Torque elevado (>88%) indica risco iminente de desarme elétrico por sobretorque.",
    acaoRecomendada: "Reduzir alimentação instantânea e injetar água de lavagem para desobstrução."
  }
];

export interface EstatisticaCartaControleRemoagem {
  parametro: ParametroConfigRemoagem;
  media: number;
  desvioPadrao: number;
  minimo: number;
  maximo: number;
  lsc: number;
  lic: number;
  lc: number;
  valoresPorDia: { dia: string; diaLabel: string; valor: number | null; status: "normal" | "alerta_alto" | "alerta_baixo" }[];
  pontosForaFaixa: number;
  estabilidade: "estavel" | "instavel_sob_alerta" | "critico";
}

export const DADOS_DIARIOS_REMOAGEM_PADRAO: RegistroDiarioIndicadoresRemoagem[] = [
  {
    dia: "seg",
    diaLabel: "Segunda-feira",
    derrickIsoladas: 0,
    alimentacaoFeedF80: 84.5,
    produtoHigP80: 37.8,
    densidadeProdutoHig: 1.28,
    produtoHig74: 2.1,
    densidadeAlimDit006: 41.5,
    fluxoAlimFit403072: 182.0,
    fluxoAlimentacao: 185.5,
    potenciaKw: 585,
    torquePct: 67.4
  },
  {
    dia: "ter",
    diaLabel: "Terça-feira",
    derrickIsoladas: 0,
    alimentacaoFeedF80: 86.0,
    produtoHigP80: 38.2,
    densidadeProdutoHig: 1.29,
    produtoHig74: 2.3,
    densidadeAlimDit006: 42.0,
    fluxoAlimFit403072: 184.5,
    fluxoAlimentacao: 188.0,
    potenciaKw: 590,
    torquePct: 68.2
  },
  {
    dia: "qua",
    diaLabel: "Quarta-feira",
    derrickIsoladas: 1,
    alimentacaoFeedF80: 83.2,
    produtoHigP80: 36.9,
    densidadeProdutoHig: 1.27,
    produtoHig74: 1.9,
    densidadeAlimDit006: 41.0,
    fluxoAlimFit403072: 180.0,
    fluxoAlimentacao: 183.0,
    potenciaKw: 578,
    torquePct: 66.5
  },
  {
    dia: "qui",
    diaLabel: "Quinta-feira",
    derrickIsoladas: 0,
    alimentacaoFeedF80: 85.8,
    produtoHigP80: 38.5,
    densidadeProdutoHig: 1.30,
    produtoHig74: 2.4,
    densidadeAlimDit006: 42.5,
    fluxoAlimFit403072: 186.0,
    fluxoAlimentacao: 189.5,
    potenciaKw: 595,
    torquePct: 69.0
  },
  {
    dia: "sex",
    diaLabel: "Sexta-feira",
    derrickIsoladas: 0,
    alimentacaoFeedF80: 84.0,
    produtoHigP80: 37.4,
    densidadeProdutoHig: 1.28,
    produtoHig74: 2.0,
    densidadeAlimDit006: 41.8,
    fluxoAlimFit403072: 183.0,
    fluxoAlimentacao: 186.0,
    potenciaKw: 582,
    torquePct: 67.0
  },
  {
    dia: "sab",
    diaLabel: "Sábado",
    derrickIsoladas: 0,
    alimentacaoFeedF80: 83.5,
    produtoHigP80: 37.1,
    densidadeProdutoHig: 1.27,
    produtoHig74: 2.0,
    densidadeAlimDit006: 41.2,
    fluxoAlimFit403072: 181.5,
    fluxoAlimentacao: 184.0,
    potenciaKw: 580,
    torquePct: 66.8
  },
  {
    dia: "dom",
    diaLabel: "Domingo",
    derrickIsoladas: 0,
    alimentacaoFeedF80: 84.5,
    produtoHigP80: 37.8,
    densidadeProdutoHig: 1.28,
    produtoHig74: 2.1,
    densidadeAlimDit006: 41.5,
    fluxoAlimFit403072: 182.0,
    fluxoAlimentacao: 185.0,
    potenciaKw: 585,
    torquePct: 67.5
  }
];

export function calcularCartasControleRemoagem(
  historico?: RegistroDiarioIndicadoresRemoagem[]
): EstatisticaCartaControleRemoagem[] {
  const lista = historico && historico.length > 0 ? historico : DADOS_DIARIOS_REMOAGEM_PADRAO;

  return CONFIG_PARAMETROS_REMOAGEM.map(param => {
    const valoresValidos: number[] = [];
    const valoresPorDia = lista.map(item => {
      const v = item[param.chave];
      const valNum = parseNumeroBritagem(v);
      if (valNum !== null) valoresValidos.push(valNum);

      let status: "normal" | "alerta_alto" | "alerta_baixo" = "normal";
      if (valNum !== null) {
        if (valNum > param.maxIdeal) status = "alerta_alto";
        else if (valNum < param.minIdeal) status = "alerta_baixo";
      }

      return {
        dia: item.dia,
        diaLabel: item.diaLabel,
        valor: valNum,
        status
      };
    });

    const n = valoresValidos.length;
    const media = n > 0 ? valoresValidos.reduce((a, b) => a + b, 0) / n : param.alvo;
    const variancia = n > 1
      ? valoresValidos.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / (n - 1)
      : 0;
    const desvioPadrao = Math.sqrt(variancia);
    const minimo = n > 0 ? Math.min(...valoresValidos) : param.minIdeal;
    const maximo = n > 0 ? Math.max(...valoresValidos) : param.maxIdeal;
    const pontosFora = valoresPorDia.filter(p => p.status !== "normal").length;

    let estabilidade: "estavel" | "instavel_sob_alerta" | "critico" = "estavel";
    if (pontosFora >= 2) estabilidade = "critico";
    else if (pontosFora === 1) estabilidade = "instavel_sob_alerta";

    return {
      parametro: param,
      media: +media.toFixed(param.decimais),
      desvioPadrao: +desvioPadrao.toFixed(2),
      minimo: +minimo.toFixed(param.decimais),
      maximo: +maximo.toFixed(param.decimais),
      lsc: param.maxIdeal,
      lic: param.minIdeal,
      lc: param.alvo,
      valoresPorDia,
      pontosForaFaixa: pontosFora,
      estabilidade
    };
  });
}

// ==========================================
// 2.4 MONITORAMENTO DIÁRIO DA FLOTAÇÃO
// ==========================================

export interface RegistroDiarioIndicadoresFlotacao {
  dia: "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
  diaLabel: string; // "Segunda-feira", "Terça-feira", etc.

  // 1. %sólidos Rougher
  solidosRougher: number | "";

  // 2. %sólidos Cleaner
  solidosCleaner: number | "";

  // 3. %sólidos Recleaner
  solidosRecleaner: number | "";

  // 4. %sólidos Scs-Rougher
  solidosScsRougher: number | "";

  // 5. Dosagem de CMC (g/t)
  dosagemCmc: number | "";

  // 6. Dosagem de AMIDEX (g/t)
  dosagemAmidex: number | "";

  // 7. Dosagem de Coletor (g/t)
  dosagemColetor: number | "";

  // 8. Dosagem de Espumante (g/t)
  dosagemEspumante: number | "";

  // 9. pH Rougher
  phRougher: number | "";

  // 10. pH Cleaner
  phCleaner: number | "";

  // 11. pH Jameson
  phJameson: number | "";

  // 12. Teor de CF (%) (limite > 33,5)
  teorCf: number | "";

  // 13. Teor de RF (%) (limite < 0,1%)
  teorRf: number | "";

  observacao?: string;
}

export interface ParametroConfigFlotacao {
  chave: keyof Omit<RegistroDiarioIndicadoresFlotacao, "dia" | "diaLabel" | "observacao">;
  nome: string;
  nomeCurto: string;
  unidade: string;
  minIdeal: number;
  maxIdeal: number;
  alvo: number;
  decimais: number;
  impactoDesvio: string;
  acaoRecomendada: string;
  equipamento?: string;
  subsistema?: string;
  grupo?: string;
  tipoLimite?: "faixa" | "min" | "max";
  rotuloFaixa?: string;
}

export const CONFIG_PARAMETROS_FLOTACAO: ParametroConfigFlotacao[] = [
  {
    chave: "solidosRougher",
    nome: "% Sólidos Rougher",
    nomeCurto: "%sólidos Rougher",
    unidade: "%",
    minIdeal: 28.0,
    maxIdeal: 36.0,
    alvo: 32.0,
    decimais: 1,
    impactoDesvio: "% Sólidos fora da faixa no Rougher altera o tempo de residência e hidrodinâmica das células.",
    acaoRecomendada: "Regular água de processo na caixa de alimentação das células Rougher."
  },
  {
    chave: "solidosCleaner",
    nome: "% Sólidos Cleaner",
    nomeCurto: "%sólidos Cleaner",
    unidade: "%",
    minIdeal: 15.0,
    maxIdeal: 26.0,
    alvo: 20.0,
    decimais: 1,
    impactoDesvio: "Excesso de sólidos no Cleaner arrasta ganga insolúvel para as etapas seguintes de limpeza.",
    acaoRecomendada: "Ajustar água de lavagem de espuma e alimentação do circuito Cleaner."
  },
  {
    chave: "solidosRecleaner",
    nome: "% Sólidos Recleaner",
    nomeCurto: "%sólidos Recleaner",
    unidade: "%",
    minIdeal: 12.0,
    maxIdeal: 22.0,
    alvo: 16.5,
    decimais: 1,
    impactoDesvio: "% Sólidos desregulado no Recleaner afeta a seletividade e o teor final do concentrado.",
    acaoRecomendada: "Modular vazão de diluição e aeração das colunas/células Recleaner."
  },
  {
    chave: "solidosScsRougher",
    nome: "% Sólidos Scs-Rougher",
    nomeCurto: "%sólidos Scs-Rougher",
    unidade: "%",
    minIdeal: 25.0,
    maxIdeal: 35.0,
    alvo: 30.0,
    decimais: 1,
    impactoDesvio: "Desvio na etapa Scavenger-Rougher causa perdas de partículas lentas para o rejeito final.",
    acaoRecomendada: "Controlar nível de polpa e taxa de ar no banco Scavenger-Rougher."
  },
  {
    chave: "dosagemCmc",
    nome: "Dosagem de CMC (g/t)",
    nomeCurto: "Dosagem de CMC (g/t)",
    unidade: "g/t",
    minIdeal: 140,
    maxIdeal: 240,
    alvo: 195,
    decimais: 0,
    impactoDesvio: "Subdosagem de CMC não deprime talco/silicatos; sobredosagem pode deprimir calcopirita.",
    acaoRecomendada: "Calibrar bomba dosadora de CMC e aferir viscosidade da solução preparada."
  },
  {
    chave: "dosagemAmidex",
    nome: "Dosagem de AMIDEX (g/t)",
    nomeCurto: "Dosagem de AMIDEX (g/t)",
    unidade: "g/t",
    minIdeal: 35,
    maxIdeal: 80,
    alvo: 58,
    decimais: 0,
    impactoDesvio: "Variações no depressor Amidex alteram a seletividade pirita/calcopirita.",
    acaoRecomendada: "Ajustar dosagem de Amidex conforme teor de ferro/pirita na alimentação."
  },
  {
    chave: "dosagemColetor",
    nome: "Dosagem de Coletor (g/t)",
    nomeCurto: "Dosagem de Coletor (g/t)",
    unidade: "g/t",
    minIdeal: 20,
    maxIdeal: 45,
    alvo: 33,
    decimais: 0,
    impactoDesvio: "Falta de coletor aumenta teor de cobre no rejeito; excesso reduz o teor do concentrado.",
    acaoRecomendada: "Adequar dosagem específica de coletor em função da massa alimentada e teor de Cu."
  },
  {
    chave: "dosagemEspumante",
    nome: "Dosagem de Espumante (g/t)",
    nomeCurto: "Dosagem de Espumante (g/t)",
    unidade: "g/t",
    minIdeal: 15,
    maxIdeal: 35,
    alvo: 24,
    decimais: 0,
    impactoDesvio: "Espumante desregulado desestabiliza a espessura e velocidade de transbordo do colchão de espuma.",
    acaoRecomendada: "Regular vazão dosadora de espumante e inspecionar estabilidade da espuma."
  },
  {
    chave: "phRougher",
    nome: "pH Rougher",
    nomeCurto: "pH Rougher",
    unidade: "",
    minIdeal: 8.8,
    maxIdeal: 10.8,
    alvo: 9.6,
    decimais: 1,
    impactoDesvio: "pH fora da faixa ótima diminui a depressão de sulfetos de ferro e a recuperação do cobre.",
    acaoRecomendada: "Ajustar adição de leite de cal na caixa de condicionamento / alimentação Rougher."
  },
  {
    chave: "phCleaner",
    nome: "pH Cleaner",
    nomeCurto: "pH Cleaner",
    unidade: "",
    minIdeal: 9.8,
    maxIdeal: 11.5,
    alvo: 10.4,
    decimais: 1,
    impactoDesvio: "pH baixo na limpeza compromete a rejeição de pirita no circuito cleaner.",
    acaoRecomendada: "Adicionar leite de cal na caixa de bombeamento do concentrado rougher/remoído."
  },
  {
    chave: "phJameson",
    nome: "pH Jameson",
    nomeCurto: "pH Jameson",
    unidade: "",
    minIdeal: 9.8,
    maxIdeal: 11.8,
    alvo: 10.8,
    decimais: 1,
    impactoDesvio: "pH na célula Jameson fora do setpoint reduz a eficiência de recuperação de ultrafinos.",
    acaoRecomendada: "Verificar dosagem de cal e razão ar/polpa no downcomer Jameson.",
    equipamento: "Célula Jameson",
    subsistema: "Flotação Cu",
    grupo: "pH"
  },
  {
    chave: "teorCf",
    nome: "Teor de CF (%)",
    nomeCurto: "Teor de CF (%)",
    unidade: "%",
    minIdeal: 33.5,
    maxIdeal: 40.0,
    alvo: 34.0,
    decimais: 2,
    tipoLimite: "min",
    rotuloFaixa: "> 33,5%",
    impactoDesvio: "Teor de concentrado final abaixo de 33,5% acarreta penalidades contratuais e custos adicionais de frete e fundição.",
    acaoRecomendada: "Ajustar taxa de lavagem nas colunas Recleaner e regular dosagem de depressores de pirita e ganga.",
    equipamento: "Recleaner / Colunas",
    subsistema: "Concentrado Cu",
    grupo: "Teores"
  },
  {
    chave: "teorRf",
    nome: "Teor de RF (%)",
    nomeCurto: "Teor de RF (%)",
    unidade: "%",
    minIdeal: 0.0,
    maxIdeal: 0.1,
    alvo: 0.08,
    decimais: 3,
    tipoLimite: "max",
    rotuloFaixa: "< 0,1%",
    impactoDesvio: "Teor de cobre no rejeito final acima de 0,1% acarreta perdas irrecuperáveis de cobre metal e queda de recuperação metalúrgica.",
    acaoRecomendada: "Aumentar dosagem de coletor secundário na etapa Scavenger e verificar aeração e nível de polpa.",
    equipamento: "Scavenger / Rejeito",
    subsistema: "Rejeito Cu",
    grupo: "Teores"
  }
];

export interface EstatisticaCartaControleFlotacao {
  parametro: ParametroConfigFlotacao;
  media: number;
  desvioPadrao: number;
  minimo: number;
  maximo: number;
  lsc: number;
  lic: number;
  lc: number;
  valoresPorDia: { dia: string; diaLabel: string; valor: number | null; status: "normal" | "alerta_alto" | "alerta_baixo" }[];
  pontosForaFaixa: number;
  estabilidade: "estavel" | "instavel_sob_alerta" | "critico";
}

export const DADOS_DIARIOS_FLOTACAO_PADRAO: RegistroDiarioIndicadoresFlotacao[] = [
  {
    dia: "seg",
    diaLabel: "Segunda-feira",
    solidosRougher: 32.2,
    solidosCleaner: 20.1,
    solidosRecleaner: 16.4,
    solidosScsRougher: 29.8,
    dosagemCmc: 195,
    dosagemAmidex: 58,
    dosagemColetor: 33,
    dosagemEspumante: 24,
    phRougher: 9.6,
    phCleaner: 10.4,
    phJameson: 10.8,
    teorCf: 33.8,
    teorRf: 0.095
  },
  {
    dia: "ter",
    diaLabel: "Terça-feira",
    solidosRougher: 32.5,
    solidosCleaner: 20.4,
    solidosRecleaner: 16.8,
    solidosScsRougher: 30.2,
    dosagemCmc: 198,
    dosagemAmidex: 60,
    dosagemColetor: 34,
    dosagemEspumante: 25,
    phRougher: 9.7,
    phCleaner: 10.5,
    phJameson: 10.9,
    teorCf: 33.9,
    teorRf: 0.092
  },
  {
    dia: "qua",
    diaLabel: "Quarta-feira",
    solidosRougher: 31.8,
    solidosCleaner: 19.8,
    solidosRecleaner: 16.2,
    solidosScsRougher: 29.5,
    dosagemCmc: 192,
    dosagemAmidex: 56,
    dosagemColetor: 32,
    dosagemEspumante: 23,
    phRougher: 9.5,
    phCleaner: 10.3,
    phJameson: 10.7,
    teorCf: 33.6,
    teorRf: 0.098
  },
  {
    dia: "qui",
    diaLabel: "Quinta-feira",
    solidosRougher: 32.8,
    solidosCleaner: 20.6,
    solidosRecleaner: 16.9,
    solidosScsRougher: 30.5,
    dosagemCmc: 196,
    dosagemAmidex: 59,
    dosagemColetor: 33,
    dosagemEspumante: 24,
    phRougher: 9.6,
    phCleaner: 10.4,
    phJameson: 10.8,
    teorCf: 34.0,
    teorRf: 0.091
  },
  {
    dia: "sex",
    diaLabel: "Sexta-feira",
    solidosRougher: 32.0,
    solidosCleaner: 20.0,
    solidosRecleaner: 16.5,
    solidosScsRougher: 30.0,
    dosagemCmc: 194,
    dosagemAmidex: 57,
    dosagemColetor: 33,
    dosagemEspumante: 24,
    phRougher: 9.6,
    phCleaner: 10.4,
    phJameson: 10.8,
    teorCf: 33.7,
    teorRf: 0.096
  },
  {
    dia: "sab",
    diaLabel: "Sábado",
    solidosRougher: 31.9,
    solidosCleaner: 19.9,
    solidosRecleaner: 16.3,
    solidosScsRougher: 29.7,
    dosagemCmc: 193,
    dosagemAmidex: 58,
    dosagemColetor: 32,
    dosagemEspumante: 23,
    phRougher: 9.5,
    phCleaner: 10.3,
    phJameson: 10.7,
    teorCf: 33.8,
    teorRf: 0.094
  },
  {
    dia: "dom",
    diaLabel: "Domingo",
    solidosRougher: 32.1,
    solidosCleaner: 20.2,
    solidosRecleaner: 16.6,
    solidosScsRougher: 30.1,
    dosagemCmc: 195,
    dosagemAmidex: 58,
    dosagemColetor: 33,
    dosagemEspumante: 24,
    phRougher: 9.6,
    phCleaner: 10.4,
    phJameson: 10.8,
    teorCf: 33.9,
    teorRf: 0.093
  }
];

export function calcularCartasControleFlotacao(
  historico?: RegistroDiarioIndicadoresFlotacao[]
): EstatisticaCartaControleFlotacao[] {
  const lista = historico && historico.length > 0 ? historico : DADOS_DIARIOS_FLOTACAO_PADRAO;

  return CONFIG_PARAMETROS_FLOTACAO.map(param => {
    const valoresValidos: number[] = [];
    const valoresPorDia = lista.map(item => {
      const v = item[param.chave];
      const valNum = parseNumeroBritagem(v);
      if (valNum !== null) valoresValidos.push(valNum);

      let status: "normal" | "alerta_alto" | "alerta_baixo" = "normal";
      if (valNum !== null) {
        if (param.tipoLimite === "min") {
          if (valNum < param.minIdeal) status = "alerta_baixo";
        } else if (param.tipoLimite === "max") {
          if (valNum > param.maxIdeal) status = "alerta_alto";
        } else {
          if (valNum > param.maxIdeal) status = "alerta_alto";
          else if (valNum < param.minIdeal) status = "alerta_baixo";
        }
      }

      return {
        dia: item.dia,
        diaLabel: item.diaLabel,
        valor: valNum,
        status
      };
    });

    const n = valoresValidos.length;
    const media = n > 0 ? valoresValidos.reduce((a, b) => a + b, 0) / n : param.alvo;
    const variancia = n > 1
      ? valoresValidos.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / (n - 1)
      : 0;
    const desvioPadrao = Math.sqrt(variancia);
    const minimo = n > 0 ? Math.min(...valoresValidos) : param.minIdeal;
    const maximo = n > 0 ? Math.max(...valoresValidos) : param.maxIdeal;
    const pontosFora = valoresPorDia.filter(p => p.status !== "normal").length;

    let estabilidade: "estavel" | "instavel_sob_alerta" | "critico" = "estavel";
    if (pontosFora >= 2) estabilidade = "critico";
    else if (pontosFora === 1) estabilidade = "instavel_sob_alerta";

    return {
      parametro: param,
      media: +media.toFixed(param.decimais),
      desvioPadrao: +desvioPadrao.toFixed(2),
      minimo: +minimo.toFixed(param.decimais),
      maximo: +maximo.toFixed(param.decimais),
      lsc: param.tipoLimite === "min" ? 0 : param.maxIdeal,
      lic: param.tipoLimite === "max" ? 0 : param.minIdeal,
      lc: param.alvo,
      valoresPorDia,
      pontosForaFaixa: pontosFora,
      estabilidade
    };
  });
}

// ==========================================
// MONITORAMENTO OPERACIONAL: ESPESSAMENTO DE REJEITO (TURNO & DIÁRIO)
// ==========================================

export interface RegistroDiarioIndicadoresEspessamentoRejeito {
  dia: string;
  diaLabel: string;
  // DENSIDADE & TORQUES
  densidadeUnderflowRej: number | "";
  torqueRejEp001: number | "";
  torqueRejEp002: number | "";

  // % SÓLIDOS DO REJEITO
  solidosRej45ep001: number | "";
  solidosRej45ep002: number | "";
  solidosRejBh01: number | "";
  solidosRejBh02: number | "";
  solidosRejBh03: number | "";

  // FLOCULANTE & OPERAÇÃO
  consumoFloculanteRej: number | "";
  espessadorRejOp?: string;

  // HTR LINHAS & PAST FILL (Horas)
  htrLinha1: number | "";
  htrLinha2: number | "";
  htrLinha3: number | "";
  htrLinha4: number | "";
  htrPastFill: number | "";

  observacao?: string;
}

export interface ParametroConfigEspessamentoRejeito {
  chave: keyof Omit<RegistroDiarioIndicadoresEspessamentoRejeito, "dia" | "diaLabel" | "observacao" | "espessadorRejOp">;
  nome: string;
  nomeCurto: string;
  unidade: string;
  minIdeal: number;
  maxIdeal: number;
  alvo: number;
  decimais: number;
  impactoDesvio: string;
  acaoRecomendada: string;
  equipamento?: string;
  subsistema?: string;
  grupo?: string;
  tipoLimite?: "faixa" | "min" | "max";
  rotuloFaixa?: string;
}

export const CONFIG_PARAMETROS_ESPESSAMENTO_REJEITO: ParametroConfigEspessamentoRejeito[] = [
  {
    chave: "densidadeUnderflowRej",
    nome: "Densidade Underflow Rejeito (g/L)",
    nomeCurto: "Dens. Underflow",
    unidade: "g/L",
    minIdeal: 1400,
    maxIdeal: 1750,
    alvo: 1700,
    decimais: 0,
    equipamento: "45-EP-001 / 002",
    subsistema: "Underflow Rejeito",
    grupo: "Densidade & Torques",
    impactoDesvio: "Densidade fora da faixa compromete o descarte na pilha de rejeito ou transporte e adensamento.",
    acaoRecomendada: "Regular vazão das bombas de underflow e dosagem de floculante no poço central."
  },
  {
    chave: "torqueRejEp001",
    nome: "Torque 45EP001 (%)",
    nomeCurto: "Torque 45EP001",
    unidade: "%",
    minIdeal: 0,
    maxIdeal: 35,
    alvo: 12,
    decimais: 1,
    tipoLimite: "max",
    rotuloFaixa: "< 35%",
    equipamento: "45-EP-001",
    subsistema: "Acionamento EP001",
    grupo: "Densidade & Torques",
    impactoDesvio: "Torque elevado no 45EP001 indica acúmulo excessivo ou compactação de sólidos na câmara de sedimentação.",
    acaoRecomendada: "Aumentar bombeamento de underflow e acionar o sistema de elevação de braços (rake)."
  },
  {
    chave: "torqueRejEp002",
    nome: "Torque 45EP002 (%)",
    nomeCurto: "Torque 45EP002",
    unidade: "%",
    minIdeal: 0,
    maxIdeal: 35,
    alvo: 12,
    decimais: 1,
    tipoLimite: "max",
    rotuloFaixa: "< 35%",
    equipamento: "45-EP-002",
    subsistema: "Acionamento EP002",
    grupo: "Densidade & Torques",
    impactoDesvio: "Torque elevado no 45EP002 indica resistência no leito de lama e risco de desarme do redutor.",
    acaoRecomendada: "Monitorar amperagem, descarregar underflow e elevar rake se > 30%."
  },
  {
    chave: "solidosRej45ep001",
    nome: "% Sólidos 45EP001",
    nomeCurto: "% Sólidos EP001",
    unidade: "%",
    minIdeal: 60.0,
    maxIdeal: 68.0,
    alvo: 63.0,
    decimais: 1,
    equipamento: "45-EP-001",
    subsistema: "Sedimentação EP001",
    grupo: "% Sólidos",
    impactoDesvio: "% Sólidos fora da faixa ideal no 45EP001 afeta a reologia e a consistência da lama.",
    acaoRecomendada: "Ajustar taxa de floculação e tempo de retenção hidráulico."
  },
  {
    chave: "solidosRej45ep002",
    nome: "% Sólidos 45EP002",
    nomeCurto: "% Sólidos EP002",
    unidade: "%",
    minIdeal: 60.0,
    maxIdeal: 68.0,
    alvo: 63.0,
    decimais: 1,
    equipamento: "45-EP-002",
    subsistema: "Sedimentação EP002",
    grupo: "% Sólidos",
    impactoDesvio: "% Sólidos fora da faixa ideal no 45EP002 desestabiliza o fluxo de polpa adensada.",
    acaoRecomendada: "Verificar alimentação e taxa de decantação."
  },
  {
    chave: "solidosRejBh01",
    nome: "% Sólidos 45BH01",
    nomeCurto: "% Sólidos BH01",
    unidade: "%",
    minIdeal: 60.0,
    maxIdeal: 68.0,
    alvo: 63.0,
    decimais: 1,
    equipamento: "45-BH-001",
    subsistema: "Classificação Rejeito",
    grupo: "% Sólidos",
    impactoDesvio: "Variação de sólidos na bateria 45BH01 altera a granulometria e split de massa para os espessadores.",
    acaoRecomendada: "Aferir pressão de entrada do ninho e inspecionar condição dos ciclones."
  },
  {
    chave: "solidosRejBh02",
    nome: "% Sólidos 45BH02",
    nomeCurto: "% Sólidos BH02",
    unidade: "%",
    minIdeal: 65.0,
    maxIdeal: 75.0,
    alvo: 70.0,
    decimais: 1,
    equipamento: "45-BH-002",
    subsistema: "Classificação Rejeito",
    grupo: "% Sólidos",
    impactoDesvio: "Desvio na bateria 45BH02 prejudica a densidade do underflow direcionado para a planta.",
    acaoRecomendada: "Regular distribuição entre ciclones em operação."
  },
  {
    chave: "solidosRejBh03",
    nome: "% Sólidos 45BH03",
    nomeCurto: "% Sólidos BH03",
    unidade: "%",
    minIdeal: 60.0,
    maxIdeal: 70.0,
    alvo: 65.0,
    decimais: 1,
    equipamento: "45-BH-003",
    subsistema: "Classificação Rejeito",
    grupo: "% Sólidos",
    impactoDesvio: "Flutuações de sólidos na bateria 45BH03 alteram a consistência da polpa de rejeito.",
    acaoRecomendada: "Inspecionar desgaste de bicos apex e vortex finders."
  },
  {
    chave: "consumoFloculanteRej",
    nome: "Consumo Floculante (g/t)",
    nomeCurto: "Floculante (g/t)",
    unidade: "g/t",
    minIdeal: 15,
    maxIdeal: 35,
    alvo: 22,
    decimais: 0,
    equipamento: "45-DS-001",
    subsistema: "Reagentes Espessamento",
    grupo: "Floculante",
    impactoDesvio: "Subdosagem eleva turbidez do overflow; excesso eleva a viscosidade da polpa adensada e custo.",
    acaoRecomendada: "Calibrar bomba dosadora e testar taxa de sedimentação (teste de proveta)."
  },
  {
    chave: "htrLinha1",
    nome: "HTR Linha 1 (h)",
    nomeCurto: "HTR L1 (h)",
    unidade: "h",
    minIdeal: 0,
    maxIdeal: 12,
    alvo: 12,
    decimais: 1,
    tipoLimite: "faixa",
    rotuloFaixa: "≤ 12 h",
    equipamento: "Linha 1 Rejeito",
    subsistema: "Disposição Rejeito",
    grupo: "HTR Linhas (h)",
    impactoDesvio: "Horas de operação da Linha 1 abaixo da meta podem indicar restrição de bombeamento.",
    acaoRecomendada: "Verificar bombas de polpa da Linha 1 e vazão manométrica."
  },
  {
    chave: "htrLinha2",
    nome: "HTR Linha 2 (h)",
    nomeCurto: "HTR L2 (h)",
    unidade: "h",
    minIdeal: 0,
    maxIdeal: 12,
    alvo: 12,
    decimais: 1,
    tipoLimite: "faixa",
    rotuloFaixa: "≤ 12 h",
    equipamento: "Linha 2 Rejeito",
    subsistema: "Disposição Rejeito",
    grupo: "HTR Linhas (h)",
    impactoDesvio: "Parada na Linha 2 de transporte de rejeito.",
    acaoRecomendada: "Checar integridade da tubulação e gaxetas de vedação."
  },
  {
    chave: "htrLinha3",
    nome: "HTR Linha 3 (h)",
    nomeCurto: "HTR L3 (h)",
    unidade: "h",
    minIdeal: 0,
    maxIdeal: 12,
    alvo: 12,
    decimais: 1,
    tipoLimite: "faixa",
    rotuloFaixa: "≤ 12 h",
    equipamento: "Linha 3 Rejeito",
    subsistema: "Disposição Rejeito",
    grupo: "HTR Linhas (h)",
    impactoDesvio: "Linha 3 com tempo operacional divergente do planejamento de disposição.",
    acaoRecomendada: "Acompanhar ciclo de bombeamento para os setores de empilhamento."
  },
  {
    chave: "htrLinha4",
    nome: "HTR Linha 4 (h)",
    nomeCurto: "HTR L4 (h)",
    unidade: "h",
    minIdeal: 0,
    maxIdeal: 12,
    alvo: 8,
    decimais: 1,
    tipoLimite: "faixa",
    rotuloFaixa: "≤ 12 h",
    equipamento: "Linha 4 Rejeito",
    subsistema: "Disposição Rejeito",
    grupo: "HTR Linhas (h)",
    impactoDesvio: "Linha 4 com horas reduzidas de transporte.",
    acaoRecomendada: "Inspecionar válvulas de manobra e descarte."
  },
  {
    chave: "htrPastFill",
    nome: "HTR Past Fill (h)",
    nomeCurto: "HTR Past Fill (h)",
    unidade: "h",
    minIdeal: 0,
    maxIdeal: 12,
    alvo: 5,
    decimais: 1,
    tipoLimite: "faixa",
    rotuloFaixa: "≤ 12 h",
    equipamento: "Planta Past Fill",
    subsistema: "Enchimento Mina",
    grupo: "HTR Linhas (h)",
    impactoDesvio: "Baixo envio de polpa para a planta de Past Fill impacta o ciclo de enchimento de realces na mina.",
    acaoRecomendada: "Alinhar disponibilidade de furo/tubulação de descida para o subsolo com a equipe de mina."
  }
];

export interface EstatisticaCartaControleEspessamentoRejeito {
  parametro: ParametroConfigEspessamentoRejeito;
  media: number;
  desvioPadrao: number;
  minimo: number;
  maximo: number;
  lsc: number;
  lic: number;
  lc: number;
  valoresPorDia: { dia: string; diaLabel: string; valor: number | null; status: "normal" | "alerta_alto" | "alerta_baixo" }[];
  pontosForaFaixa: number;
  estabilidade: "estavel" | "instavel_sob_alerta" | "critico";
}

export const DADOS_DIARIOS_ESPESSAMENTO_REJEITO_PADRAO: RegistroDiarioIndicadoresEspessamentoRejeito[] = [
  {
    dia: "seg",
    diaLabel: "Segunda-feira",
    densidadeUnderflowRej: 1420,
    torqueRejEp001: 34,
    torqueRejEp002: 12,
    solidosRej45ep001: 63,
    solidosRej45ep002: 65,
    solidosRejBh01: 63,
    solidosRejBh02: 72,
    solidosRejBh03: 63,
    consumoFloculanteRej: 22,
    espessadorRejOp: "Ambos",
    htrLinha1: 12,
    htrLinha2: 12,
    htrLinha3: 12,
    htrLinha4: 8,
    htrPastFill: 4
  },
  {
    dia: "ter",
    diaLabel: "Terça-feira",
    densidadeUnderflowRej: 1680,
    torqueRejEp001: 10,
    torqueRejEp002: 9,
    solidosRej45ep001: 64,
    solidosRej45ep002: 64,
    solidosRejBh01: 64,
    solidosRejBh02: 71,
    solidosRejBh03: 64,
    consumoFloculanteRej: 20,
    espessadorRejOp: "Ambos",
    htrLinha1: 12,
    htrLinha2: 12,
    htrLinha3: 12,
    htrLinha4: 8,
    htrPastFill: 5
  },
  {
    dia: "qua",
    diaLabel: "Quarta-feira",
    densidadeUnderflowRej: 1700,
    torqueRejEp001: 9,
    torqueRejEp002: 8,
    solidosRej45ep001: 66,
    solidosRej45ep002: 66,
    solidosRejBh01: 65,
    solidosRejBh02: 70,
    solidosRejBh03: 62,
    consumoFloculanteRej: 24,
    espessadorRejOp: "Ambos",
    htrLinha1: 12,
    htrLinha2: 12,
    htrLinha3: 12,
    htrLinha4: 8,
    htrPastFill: 4.5
  },
  {
    dia: "qui",
    diaLabel: "Quinta-feira",
    densidadeUnderflowRej: 1720,
    torqueRejEp001: 8,
    torqueRejEp002: 10,
    solidosRej45ep001: 64,
    solidosRej45ep002: 65,
    solidosRejBh01: 63,
    solidosRejBh02: 72,
    solidosRejBh03: 65,
    consumoFloculanteRej: 21,
    espessadorRejOp: "Ambos",
    htrLinha1: 12,
    htrLinha2: 12,
    htrLinha3: 12,
    htrLinha4: 8,
    htrPastFill: 5
  },
  {
    dia: "sex",
    diaLabel: "Sexta-feira",
    densidadeUnderflowRej: 1690,
    torqueRejEp001: 12,
    torqueRejEp002: 8,
    solidosRej45ep001: 68,
    solidosRej45ep002: 67,
    solidosRejBh01: 66,
    solidosRejBh02: 76,
    solidosRejBh03: 71,
    consumoFloculanteRej: 25,
    espessadorRejOp: "Ambos",
    htrLinha1: 12,
    htrLinha2: 12,
    htrLinha3: 12,
    htrLinha4: 8,
    htrPastFill: 5.6
  },
  {
    dia: "sab",
    diaLabel: "Sábado",
    densidadeUnderflowRej: 1710,
    torqueRejEp001: 9,
    torqueRejEp002: 9,
    solidosRej45ep001: 65,
    solidosRej45ep002: 65,
    solidosRejBh01: 64,
    solidosRejBh02: 73,
    solidosRejBh03: 64,
    consumoFloculanteRej: 22,
    espessadorRejOp: "Ambos",
    htrLinha1: 12,
    htrLinha2: 12,
    htrLinha3: 12,
    htrLinha4: 8,
    htrPastFill: 4
  },
  {
    dia: "dom",
    diaLabel: "Domingo",
    densidadeUnderflowRej: 1700,
    torqueRejEp001: 9,
    torqueRejEp002: 8,
    solidosRej45ep001: 64,
    solidosRej45ep002: 64,
    solidosRejBh01: 63,
    solidosRejBh02: 71,
    solidosRejBh03: 63,
    consumoFloculanteRej: 21,
    espessadorRejOp: "Ambos",
    htrLinha1: 12,
    htrLinha2: 12,
    htrLinha3: 12,
    htrLinha4: 8,
    htrPastFill: 4
  }
];

export function calcularCartasControleEspessamentoRejeito(
  historico?: RegistroDiarioIndicadoresEspessamentoRejeito[]
): EstatisticaCartaControleEspessamentoRejeito[] {
  const lista = historico && historico.length > 0 ? historico : DADOS_DIARIOS_ESPESSAMENTO_REJEITO_PADRAO;

  return CONFIG_PARAMETROS_ESPESSAMENTO_REJEITO.map(param => {
    const valoresValidos: number[] = [];
    const valoresPorDia = lista.map(item => {
      const v = item[param.chave];
      const valNum = parseNumeroBritagem(v);
      if (valNum !== null) valoresValidos.push(valNum);

      let status: "normal" | "alerta_alto" | "alerta_baixo" = "normal";
      if (valNum !== null) {
        if (param.tipoLimite === "min") {
          if (valNum < param.minIdeal) status = "alerta_baixo";
        } else if (param.tipoLimite === "max") {
          if (valNum > param.maxIdeal) status = "alerta_alto";
        } else {
          if (valNum > param.maxIdeal) status = "alerta_alto";
          else if (valNum < param.minIdeal) status = "alerta_baixo";
        }
      }

      return {
        dia: item.dia,
        diaLabel: item.diaLabel,
        valor: valNum,
        status
      };
    });

    const n = valoresValidos.length;
    const media = n > 0 ? valoresValidos.reduce((a, b) => a + b, 0) / n : param.alvo;
    const variancia = n > 1
      ? valoresValidos.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / (n - 1)
      : 0;
    const desvioPadrao = Math.sqrt(variancia);
    const minimo = n > 0 ? Math.min(...valoresValidos) : param.minIdeal;
    const maximo = n > 0 ? Math.max(...valoresValidos) : param.maxIdeal;
    const pontosFora = valoresPorDia.filter(p => p.status !== "normal").length;

    let estabilidade: "estavel" | "instavel_sob_alerta" | "critico" = "estavel";
    if (pontosFora >= 2) estabilidade = "critico";
    else if (pontosFora === 1) estabilidade = "instavel_sob_alerta";

    return {
      parametro: param,
      media: +media.toFixed(param.decimais),
      desvioPadrao: +desvioPadrao.toFixed(2),
      minimo: +minimo.toFixed(param.decimais),
      maximo: +maximo.toFixed(param.decimais),
      lsc: param.tipoLimite === "min" ? 0 : param.maxIdeal,
      lic: param.tipoLimite === "max" ? 0 : param.minIdeal,
      lc: param.alvo,
      valoresPorDia,
      pontosForaFaixa: pontosFora,
      estabilidade
    };
  });
}

// ==========================================
// MONITORAMENTO OPERACIONAL: ESPESSAMENTO DE CONCENTRADO (TURNO & DIÁRIO)
// ==========================================

export interface RegistroDiarioIndicadoresEspessamentoConcentrado {
  dia: string;
  diaLabel: string;
  espessadorConcOp?: string;

  // DENSIDADE & % SÓLIDOS
  densidadeUnderflowConc: number | "";
  solidosConc44ep001: number | "";
  solidosConc44ep002: number | "";

  // NÍVEL & FLOCULANTE
  nivelTanqueConc: number | "";
  consumoFloculanteConc: number | "";

  // ELEVAÇÃO RAKE & TORQUES
  elevacaoRakeConcEp001: number | "";
  elevacaoRakeConcEp002: number | "";
  torqueConcEp001: number | "";
  torqueConcEp002: number | "";

  observacao?: string;
}

export interface ParametroConfigEspessamentoConcentrado {
  chave: keyof Omit<RegistroDiarioIndicadoresEspessamentoConcentrado, "dia" | "diaLabel" | "observacao" | "espessadorConcOp">;
  nome: string;
  nomeCurto: string;
  unidade: string;
  minIdeal: number;
  maxIdeal: number;
  alvo: number;
  decimais: number;
  impactoDesvio: string;
  acaoRecomendada: string;
  equipamento?: string;
  subsistema?: string;
  grupo?: string;
  tipoLimite?: "faixa" | "min" | "max";
  rotuloFaixa?: string;
}

export const CONFIG_PARAMETROS_ESPESSAMENTO_CONCENTRADO: ParametroConfigEspessamentoConcentrado[] = [
  {
    chave: "densidadeUnderflowConc",
    nome: "Densidade Underflow Conc (g/L)",
    nomeCurto: "Dens. Underflow",
    unidade: "g/L",
    minIdeal: 1750,
    maxIdeal: 1950,
    alvo: 1850,
    decimais: 0,
    equipamento: "44-EP-001 / 002",
    subsistema: "Underflow Concentrado",
    grupo: "Densidade & Sólidos",
    impactoDesvio: "Densidade baixa eleva o volume de água para os filtros, sobrecarregando a filtragem; densidade excessiva causa risco de entupimento nas linhas.",
    acaoRecomendada: "Ajustar bombeamento de underflow e dosagem de floculante."
  },
  {
    chave: "solidosConc44ep001",
    nome: "% Sólidos 44EP001",
    nomeCurto: "% Sólidos EP001",
    unidade: "%",
    minIdeal: 60.0,
    maxIdeal: 70.0,
    alvo: 65.0,
    decimais: 1,
    equipamento: "44-EP-001",
    subsistema: "Sedimentação Conc. EP001",
    grupo: "Densidade & Sólidos",
    impactoDesvio: "% Sólidos abaixo de 60% reduz eficiência de filtragem e aumenta tempo de ciclo nos filtros prensa.",
    acaoRecomendada: "Verificar alimentação e taxa de dosagem de floculante no 44EP001."
  },
  {
    chave: "solidosConc44ep002",
    nome: "% Sólidos 44EP002",
    nomeCurto: "% Sólidos EP002",
    unidade: "%",
    minIdeal: 60.0,
    maxIdeal: 70.0,
    alvo: 65.0,
    decimais: 1,
    equipamento: "44-EP-002",
    subsistema: "Sedimentação Conc. EP002",
    grupo: "Densidade & Sólidos",
    impactoDesvio: "% Sólidos fora da faixa no 44EP002 desestabiliza a alimentação dos filtros de concentrado.",
    acaoRecomendada: "Controlar taxa de alimentação e rotação do rake no 44EP002."
  },
  {
    chave: "nivelTanqueConc",
    nome: "Nível Tanque 44TQ001 (%)",
    nomeCurto: "Nível 44TQ001",
    unidade: "%",
    minIdeal: 30.0,
    maxIdeal: 80.0,
    alvo: 50.0,
    decimais: 0,
    equipamento: "44-TQ-001",
    subsistema: "Estocagem Polpa Concentrado",
    grupo: "Níveis & Reagentes",
    impactoDesvio: "Nível acima de 80% gera risco iminente de transbordo; abaixo de 30% causa cavitação nas bombas dos filtros.",
    acaoRecomendada: "Adequar taxa de filtragem para balancear o nível do tanque pulmão 44TQ001."
  },
  {
    chave: "consumoFloculanteConc",
    nome: "Consumo Floculante (mL/min)",
    nomeCurto: "Floculante",
    unidade: "mL/min",
    minIdeal: 15.0,
    maxIdeal: 35.0,
    alvo: 25.0,
    decimais: 0,
    equipamento: "44-EP-001 / 002",
    subsistema: "Dosagem Floculante",
    grupo: "Níveis & Reagentes",
    impactoDesvio: "Sobredosagem causa cegamento prematuro das lonas dos filtros; subdosagem gera turbidez no overflow.",
    acaoRecomendada: "Regular vazão da bomba dosadora de floculante conforme claridade do overflow."
  },
  {
    chave: "elevacaoRakeConcEp001",
    nome: "Elevação Rake 44EP001 (Pol)",
    nomeCurto: "Rake 44EP001",
    unidade: "Pol",
    minIdeal: 0.0,
    maxIdeal: 7.0,
    tipoLimite: "max",
    rotuloFaixa: "< 7 Pol (Atenção 7-11 / Crítico > 11)",
    alvo: 0.0,
    decimais: 1,
    equipamento: "44-EP-001",
    subsistema: "Mecanismo Rake EP001",
    grupo: "Rake & Torques",
    impactoDesvio: "Rake elevado indica acúmulo de leito compacto no fundo do espessador com risco mecânico.",
    acaoRecomendada: "Aumentar descarga de underflow para desobstruir o fundo e permitir descida suave do braço."
  },
  {
    chave: "elevacaoRakeConcEp002",
    nome: "Elevação Rake 44EP002 (Pol)",
    nomeCurto: "Rake 44EP002",
    unidade: "Pol",
    minIdeal: 0.0,
    maxIdeal: 7.0,
    tipoLimite: "max",
    rotuloFaixa: "< 7 Pol (Atenção 7-11 / Crítico > 11)",
    alvo: 0.0,
    decimais: 1,
    equipamento: "44-EP-002",
    subsistema: "Mecanismo Rake EP002",
    grupo: "Rake & Torques",
    impactoDesvio: "Rake do 44EP002 em elevação constante reduz a eficiência de raspagem e transporte de lama.",
    acaoRecomendada: "Monitorar amperagem e forçar bombeamento de underflow no 44EP002."
  },
  {
    chave: "torqueConcEp001",
    nome: "Torque 44EP001 (%)",
    nomeCurto: "Torque 44EP001",
    unidade: "%",
    minIdeal: 0.0,
    maxIdeal: 12.0,
    tipoLimite: "max",
    rotuloFaixa: "< 12% (Atenção 12-20 / Crítico > 20)",
    alvo: 8.0,
    decimais: 1,
    equipamento: "44-EP-001",
    subsistema: "Acionamento 44EP001",
    grupo: "Rake & Torques",
    impactoDesvio: "Torque > 12% indica sobrecarga mecânica; acima de 20% aciona alarme e risco de desarme.",
    acaoRecomendada: "Elevar o rake imediatamente e maximizar a taxa de bombeamento de underflow."
  },
  {
    chave: "torqueConcEp002",
    nome: "Torque 44EP002 (%)",
    nomeCurto: "Torque 44EP002",
    unidade: "%",
    minIdeal: 0.0,
    maxIdeal: 12.0,
    tipoLimite: "max",
    rotuloFaixa: "< 12% (Atenção 12-20 / Crítico > 20)",
    alvo: 8.0,
    decimais: 1,
    equipamento: "44-EP-002",
    subsistema: "Acionamento 44EP002",
    grupo: "Rake & Torques",
    impactoDesvio: "Torque elevado no 44EP002 pode causar cisalhamento no pino de segurança e parada do circuito.",
    acaoRecomendada: "Acionar elevação de braços e recircular polpa se necessário."
  }
];

export const DADOS_DIARIOS_ESPESSAMENTO_CONCENTRADO_PADRAO: RegistroDiarioIndicadoresEspessamentoConcentrado[] = [
  {
    dia: "seg",
    diaLabel: "Segunda-feira",
    espessadorConcOp: "Ambos",
    densidadeUnderflowConc: 1850,
    solidosConc44ep001: 65.5,
    solidosConc44ep002: 65.0,
    nivelTanqueConc: 52,
    consumoFloculanteConc: 24,
    elevacaoRakeConcEp001: 0.0,
    elevacaoRakeConcEp002: 0.0,
    torqueConcEp001: 7.8,
    torqueConcEp002: 8.1
  },
  {
    dia: "ter",
    diaLabel: "Terça-feira",
    espessadorConcOp: "Ambos",
    densidadeUnderflowConc: 1860,
    solidosConc44ep001: 66.0,
    solidosConc44ep002: 65.5,
    nivelTanqueConc: 55,
    consumoFloculanteConc: 25,
    elevacaoRakeConcEp001: 0.0,
    elevacaoRakeConcEp002: 0.0,
    torqueConcEp001: 8.2,
    torqueConcEp002: 8.5
  },
  {
    dia: "qua",
    diaLabel: "Quarta-feira",
    espessadorConcOp: "Ambos",
    densidadeUnderflowConc: 1845,
    solidosConc44ep001: 64.8,
    solidosConc44ep002: 65.2,
    nivelTanqueConc: 48,
    consumoFloculanteConc: 23,
    elevacaoRakeConcEp001: 0.5,
    elevacaoRakeConcEp002: 0.0,
    torqueConcEp001: 8.8,
    torqueConcEp002: 8.0
  },
  {
    dia: "qui",
    diaLabel: "Quinta-feira",
    espessadorConcOp: "Ambos",
    densidadeUnderflowConc: 1870,
    solidosConc44ep001: 66.5,
    solidosConc44ep002: 66.0,
    nivelTanqueConc: 60,
    consumoFloculanteConc: 26,
    elevacaoRakeConcEp001: 0.0,
    elevacaoRakeConcEp002: 0.0,
    torqueConcEp001: 9.1,
    torqueConcEp002: 8.7
  },
  {
    dia: "sex",
    diaLabel: "Sexta-feira",
    espessadorConcOp: "Ambos",
    densidadeUnderflowConc: 1855,
    solidosConc44ep001: 65.2,
    solidosConc44ep002: 65.8,
    nivelTanqueConc: 54,
    consumoFloculanteConc: 25,
    elevacaoRakeConcEp001: 0.0,
    elevacaoRakeConcEp002: 0.0,
    torqueConcEp001: 8.4,
    torqueConcEp002: 8.3
  },
  {
    dia: "sab",
    diaLabel: "Sábado",
    espessadorConcOp: "Ambos",
    densidadeUnderflowConc: 1865,
    solidosConc44ep001: 66.1,
    solidosConc44ep002: 65.9,
    nivelTanqueConc: 58,
    consumoFloculanteConc: 24,
    elevacaoRakeConcEp001: 0.0,
    elevacaoRakeConcEp002: 0.0,
    torqueConcEp001: 8.6,
    torqueConcEp002: 8.9
  },
  {
    dia: "dom",
    diaLabel: "Domingo",
    espessadorConcOp: "Ambos",
    densidadeUnderflowConc: 1850,
    solidosConc44ep001: 65.4,
    solidosConc44ep002: 65.1,
    nivelTanqueConc: 50,
    consumoFloculanteConc: 23,
    elevacaoRakeConcEp001: 0.0,
    elevacaoRakeConcEp002: 0.0,
    torqueConcEp001: 7.9,
    torqueConcEp002: 8.2
  }
];

export interface EstatisticaCartaControleEspessamentoConcentrado {
  parametro: ParametroConfigEspessamentoConcentrado;
  media: number;
  desvioPadrao: number;
  minimo: number;
  maximo: number;
  lsc: number;
  lic: number;
  lc: number;
  valoresPorDia: { dia: string; diaLabel: string; valor: number | null; status: "normal" | "alerta_alto" | "alerta_baixo" }[];
  pontosForaFaixa: number;
  estabilidade: "estavel" | "instavel_sob_alerta" | "critico";
}

export function calcularCartasControleEspessamentoConcentrado(
  historico?: RegistroDiarioIndicadoresEspessamentoConcentrado[]
): EstatisticaCartaControleEspessamentoConcentrado[] {
  const lista = historico && historico.length > 0 ? historico : DADOS_DIARIOS_ESPESSAMENTO_CONCENTRADO_PADRAO;

  return CONFIG_PARAMETROS_ESPESSAMENTO_CONCENTRADO.map(param => {
    const valoresValidos: number[] = [];
    const valoresPorDia = lista.map(item => {
      const v = item[param.chave];
      const valNum = parseNumeroBritagem(v);
      if (valNum !== null) valoresValidos.push(valNum);

      let status: "normal" | "alerta_alto" | "alerta_baixo" = "normal";
      if (valNum !== null) {
        if (param.tipoLimite === "min") {
          if (valNum < param.minIdeal) status = "alerta_baixo";
        } else if (param.tipoLimite === "max") {
          if (valNum > param.maxIdeal) status = "alerta_alto";
        } else {
          if (valNum > param.maxIdeal) status = "alerta_alto";
          else if (valNum < param.minIdeal) status = "alerta_baixo";
        }
      }

      return {
        dia: item.dia,
        diaLabel: item.diaLabel,
        valor: valNum,
        status
      };
    });

    const n = valoresValidos.length;
    const media = n > 0 ? valoresValidos.reduce((a, b) => a + b, 0) / n : param.alvo;
    const variancia = n > 1
      ? valoresValidos.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / (n - 1)
      : 0;
    const desvioPadrao = Math.sqrt(variancia);
    const minimo = n > 0 ? Math.min(...valoresValidos) : param.minIdeal;
    const maximo = n > 0 ? Math.max(...valoresValidos) : param.maxIdeal;
    const pontosFora = valoresPorDia.filter(p => p.status !== "normal").length;

    let estabilidade: "estavel" | "instavel_sob_alerta" | "critico" = "estavel";
    if (pontosFora >= 2) estabilidade = "critico";
    else if (pontosFora === 1) estabilidade = "instavel_sob_alerta";

    return {
      parametro: param,
      media: +media.toFixed(param.decimais),
      desvioPadrao: +desvioPadrao.toFixed(2),
      minimo: +minimo.toFixed(param.decimais),
      maximo: +maximo.toFixed(param.decimais),
      lsc: param.tipoLimite === "min" ? 0 : param.maxIdeal,
      lic: param.tipoLimite === "max" ? 0 : param.minIdeal,
      lc: param.alvo,
      valoresPorDia,
      pontosForaFaixa: pontosFora,
      estabilidade
    };
  });
}

// -------------------------------------------------------------
// FILTRAGEM DE CONCENTRADO: CONFIGURAÇÕES, DADOS DIÁRIOS & CEP
// -------------------------------------------------------------

export type ChaveParametroFiltragemConcentrado =
  | "producaoFiltragem"
  | "produtividadeFiltro"
  | "umidadeBolo"
  | "ciclosFiltro"
  | "pressaoCompactacao"
  | "paradasManutencaoFiltro"
  | "paradasOutrosFiltro";

export interface ParametroConfigFiltragemConcentrado {
  chave: ChaveParametroFiltragemConcentrado;
  nome: string;
  nomeCurto: string;
  unidade: string;
  minIdeal: number;
  maxIdeal: number;
  alvo: number;
  tipoLimite?: "faixa" | "max" | "min";
  rotuloFaixa?: string;
  decimais: number;
  equipamento: string;
  subsistema: string;
  grupo: string;
  impactoDesvio: string;
  acaoRecomendada: string;
}

export interface RegistroDiarioIndicadoresFiltragemConcentrado {
  dia: "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
  diaLabel: string;
  filtroConcOp?: string; // "Ambos" | "43FP001" | "43FP002"
  producaoFiltragem?: number | "";
  produtividadeFiltro?: number | "";
  umidadeBolo?: number | "";
  ciclosFiltro?: number | "";
  pressaoCompactacao?: number | "";
  paradasManutencaoFiltro?: number | "";
  paradasOutrosFiltro?: number | "";
  observacao?: string;
}

export const CONFIG_PARAMETROS_FILTRAGEM_CONCENTRADO: ParametroConfigFiltragemConcentrado[] = [
  {
    chave: "producaoFiltragem",
    nome: "Produção Concentrado Filtrado (t)",
    nomeCurto: "Produção (t)",
    unidade: "t",
    minIdeal: 280.0,
    maxIdeal: 400.0,
    alvo: 325.0,
    decimais: 0,
    equipamento: "43-FP-001 / 002",
    subsistema: "Desaguamento",
    grupo: "Produção & Produtividade",
    rotuloFaixa: "280 - 400 t",
    impactoDesvio: "Produção abaixo do alvo gera acúmulo de polpa no espessador de concentrado e risco de perda de recuperação.",
    acaoRecomendada: "Elevar taxa de alimentação do filtro e reduzir tempo de ciclo entre prensagens."
  },
  {
    chave: "produtividadeFiltro",
    nome: "Produtividade do Filtro Prensa (t/h)",
    nomeCurto: "Produtividade",
    unidade: "t/h",
    minIdeal: 28.0,
    maxIdeal: 38.0,
    alvo: 32.5,
    decimais: 1,
    equipamento: "43-FP-001 / 002",
    subsistema: "Filtros Prensa",
    grupo: "Produção & Produtividade",
    rotuloFaixa: "28,0 - 38,0 t/h",
    impactoDesvio: "Queda de produtividade indica lonas colmatadas ou torta com perda de permeabilidade hidráulica.",
    acaoRecomendada: "Executar lavagem ácida e inspecionar pressão do ar de sopro/compressão."
  },
  {
    chave: "umidadeBolo",
    nome: "Umidade do Bolo de Concentrado (%)",
    nomeCurto: "Umidade Bolo",
    unidade: "%",
    minIdeal: 7.0,
    maxIdeal: 9.5,
    tipoLimite: "max",
    alvo: 8.8,
    decimais: 1,
    equipamento: "43-FP-001 / 002",
    subsistema: "Desaguamento",
    grupo: "Qualidade do Bolo",
    rotuloFaixa: "≤ 9,5% (Crítico > 9,5%)",
    impactoDesvio: "Umidade acima de 9,5% penaliza o frete rodoviário, empelota o minério e traz risco marítimo (TML).",
    acaoRecomendada: "Prolongar o tempo de sopro de ar desaguador e verificar membranas de compressão."
  },
  {
    chave: "ciclosFiltro",
    nome: "Ciclos Realizados (Turno)",
    nomeCurto: "Ciclos Realizados",
    unidade: "ciclos",
    minIdeal: 20,
    maxIdeal: 32,
    alvo: 26,
    decimais: 0,
    equipamento: "43-FP-001 / 002",
    subsistema: "Filtros Prensa",
    grupo: "Ciclos & Pressão",
    rotuloFaixa: "20 - 32 ciclos",
    impactoDesvio: "Baixo número de ciclos no turno reduz o escoamento diário e sobrecarrega o estoque de polpa.",
    acaoRecomendada: "Agilizar liberação de torta na esteira e verificar sensores de fechamento de placa."
  },
  {
    chave: "pressaoCompactacao",
    nome: "Pressão de Compactação / Membrana (kPa)",
    nomeCurto: "Pressão Compact.",
    unidade: "kPa",
    minIdeal: 210,
    maxIdeal: 260,
    alvo: 235,
    decimais: 0,
    equipamento: "43-FP-001 / 002",
    subsistema: "Sistema Hidráulico",
    grupo: "Ciclos & Pressão",
    rotuloFaixa: "210 - 260 kPa",
    impactoDesvio: "Pressão de compactação inadequada deixa torta úmida e frouxa, dificultando o desprendimento.",
    acaoRecomendada: "Calibrar válvula redutora proporcional e checar circuito hidráulico de compressão."
  },
  {
    chave: "paradasManutencaoFiltro",
    nome: "Paradas Manutenção Filtro (h)",
    nomeCurto: "Paradas Manut.",
    unidade: "h",
    minIdeal: 0.0,
    maxIdeal: 1.5,
    tipoLimite: "max",
    alvo: 0.5,
    decimais: 1,
    equipamento: "43-FP-001 / 002",
    subsistema: "Disponibilidade",
    grupo: "Paradas de Filtro (h)",
    rotuloFaixa: "≤ 1,5 h",
    impactoDesvio: "Parada excessiva de manutenção paralisa o desaguamento e força redução de carga na moagem.",
    acaoRecomendada: "Programar trocas de lonas e reparos de vedação em janelas sincronizadas com a moagem."
  },
  {
    chave: "paradasOutrosFiltro",
    nome: "Paradas Operacionais / Outros (h)",
    nomeCurto: "Paradas Outros",
    unidade: "h",
    minIdeal: 0.0,
    maxIdeal: 1.0,
    tipoLimite: "max",
    alvo: 0.5,
    decimais: 1,
    equipamento: "43-FP-001 / 002",
    subsistema: "Disponibilidade",
    grupo: "Paradas de Filtro (h)",
    rotuloFaixa: "≤ 1,0 h",
    impactoDesvio: "Paradas por falta de ar de compressão ou pátio cheio geram ociosidade nos filtros prensa.",
    acaoRecomendada: "Monitorar compressores de ar e manter fluxo contínuo de pás-carregadeiras no galpão."
  }
];

export const DADOS_DIARIOS_FILTRAGEM_CONCENTRADO_PADRAO: RegistroDiarioIndicadoresFiltragemConcentrado[] = [
  {
    dia: "seg",
    diaLabel: "Segunda-feira",
    filtroConcOp: "Ambos",
    producaoFiltragem: 325,
    produtividadeFiltro: 32.5,
    umidadeBolo: 9.1,
    ciclosFiltro: 26,
    pressaoCompactacao: 235,
    paradasManutencaoFiltro: 1.0,
    paradasOutrosFiltro: 1.0
  },
  {
    dia: "ter",
    diaLabel: "Terça-feira",
    filtroConcOp: "Ambos",
    producaoFiltragem: 340,
    produtividadeFiltro: 32.4,
    umidadeBolo: 9.0,
    ciclosFiltro: 27,
    pressaoCompactacao: 238,
    paradasManutencaoFiltro: 0.5,
    paradasOutrosFiltro: 1.0
  },
  {
    dia: "qua",
    diaLabel: "Quarta-feira",
    filtroConcOp: "Ambos",
    producaoFiltragem: 310,
    produtividadeFiltro: 31.0,
    umidadeBolo: 9.2,
    ciclosFiltro: 25,
    pressaoCompactacao: 230,
    paradasManutencaoFiltro: 1.0,
    paradasOutrosFiltro: 1.0
  },
  {
    dia: "qui",
    diaLabel: "Quinta-feira",
    filtroConcOp: "Ambos",
    producaoFiltragem: 350,
    produtividadeFiltro: 33.3,
    umidadeBolo: 8.8,
    ciclosFiltro: 28,
    pressaoCompactacao: 240,
    paradasManutencaoFiltro: 0.5,
    paradasOutrosFiltro: 1.0
  },
  {
    dia: "sex",
    diaLabel: "Sexta-feira",
    filtroConcOp: "Ambos",
    producaoFiltragem: 325,
    produtividadeFiltro: 32.5,
    umidadeBolo: 8.9,
    ciclosFiltro: 26,
    pressaoCompactacao: 235,
    paradasManutencaoFiltro: 1.0,
    paradasOutrosFiltro: 1.0
  },
  {
    dia: "sab",
    diaLabel: "Sábado",
    filtroConcOp: "Ambos",
    producaoFiltragem: 330,
    produtividadeFiltro: 33.0,
    umidadeBolo: 9.0,
    ciclosFiltro: 26,
    pressaoCompactacao: 236,
    paradasManutencaoFiltro: 1.0,
    paradasOutrosFiltro: 1.0
  },
  {
    dia: "dom",
    diaLabel: "Domingo",
    filtroConcOp: "Ambos",
    producaoFiltragem: 325,
    produtividadeFiltro: 32.5,
    umidadeBolo: 9.1,
    ciclosFiltro: 26,
    pressaoCompactacao: 235,
    paradasManutencaoFiltro: 1.0,
    paradasOutrosFiltro: 1.0
  }
];

export interface EstatisticaCartaControleFiltragemConcentrado {
  parametro: ParametroConfigFiltragemConcentrado;
  media: number;
  desvioPadrao: number;
  minimo: number;
  maximo: number;
  lsc: number;
  lic: number;
  lc: number;
  valoresPorDia: { dia: string; diaLabel: string; valor: number | null; status: "normal" | "alerta_alto" | "alerta_baixo" }[];
  pontosForaFaixa: number;
  estabilidade: "estavel" | "instavel_sob_alerta" | "critico";
}

export function calcularCartasControleFiltragemConcentrado(
  historico?: RegistroDiarioIndicadoresFiltragemConcentrado[]
): EstatisticaCartaControleFiltragemConcentrado[] {
  const lista = historico && historico.length > 0 ? historico : DADOS_DIARIOS_FILTRAGEM_CONCENTRADO_PADRAO;

  return CONFIG_PARAMETROS_FILTRAGEM_CONCENTRADO.map(param => {
    const valoresValidos: number[] = [];
    const valoresPorDia = lista.map(item => {
      const v = item[param.chave];
      const valNum = parseNumeroBritagem(v);
      if (valNum !== null) valoresValidos.push(valNum);

      let status: "normal" | "alerta_alto" | "alerta_baixo" = "normal";
      if (valNum !== null) {
        if (param.tipoLimite === "min") {
          if (valNum < param.minIdeal) status = "alerta_baixo";
        } else if (param.tipoLimite === "max") {
          if (valNum > param.maxIdeal) status = "alerta_alto";
        } else {
          if (valNum > param.maxIdeal) status = "alerta_alto";
          else if (valNum < param.minIdeal) status = "alerta_baixo";
        }
      }

      return {
        dia: item.dia,
        diaLabel: item.diaLabel,
        valor: valNum,
        status
      };
    });

    const n = valoresValidos.length;
    const media = n > 0 ? valoresValidos.reduce((a, b) => a + b, 0) / n : param.alvo;
    const variancia = n > 1
      ? valoresValidos.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / (n - 1)
      : 0;
    const desvioPadrao = Math.sqrt(variancia);
    const minimo = n > 0 ? Math.min(...valoresValidos) : param.minIdeal;
    const maximo = n > 0 ? Math.max(...valoresValidos) : param.maxIdeal;
    const pontosFora = valoresPorDia.filter(p => p.status !== "normal").length;

    let estabilidade: "estavel" | "instavel_sob_alerta" | "critico" = "estavel";
    if (pontosFora >= 2) estabilidade = "critico";
    else if (pontosFora === 1) estabilidade = "instavel_sob_alerta";

    return {
      parametro: param,
      media: +media.toFixed(param.decimais),
      desvioPadrao: +desvioPadrao.toFixed(2),
      minimo: +minimo.toFixed(param.decimais),
      maximo: +maximo.toFixed(param.decimais),
      lsc: param.tipoLimite === "min" ? 0 : param.maxIdeal,
      lic: param.tipoLimite === "max" ? 0 : param.minIdeal,
      lc: param.alvo,
      valoresPorDia,
      pontosForaFaixa: pontosFora,
      estabilidade
    };
  });
}

// ---------------------------------------------------------------------------
// UTILIDADES & ETA (ESTAÇÃO DE TRATAMENTO DE ÁGUA & BALANÇO HÍDRICO)
// ---------------------------------------------------------------------------

export interface ParametroConfigUtilidadesETA {
  chave: keyof Omit<RegistroDiarioIndicadoresUtilidadesETA, "dia" | "diaLabel" | "compressoresOp" | "bombasAguaOp" | "observacao">;
  nome: string;
  nomeCurto: string;
  unidade: string;
  minIdeal: number;
  maxIdeal: number;
  alvo: number;
  tipoLimite?: "faixa" | "max" | "min";
  rotuloFaixa?: string;
  decimais: number;
  equipamento: string;
  subsistema: string;
  grupo: string;
  impactoDesvio: string;
  acaoRecomendada: string;
}

export interface RegistroDiarioIndicadoresUtilidadesETA {
  dia: "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
  diaLabel: string;
  compressoresOp?: string;
  bombasAguaOp?: string;
  pressaoAr?: number | "";
  captacaoAguaBruta?: number | "";
  volumeTratadoEta?: number | "";
  taxaRecirculacaoReuso?: number | "";
  turbidezAguaTratada?: number | "";
  nivelCamaraA?: number | "";
  etaAguaRecuperada?: number | "";
  disponibilidadeUtilidades?: number | "";
  paradasManutencaoUtilidades?: number | "";
  observacao?: string;
}

export const CONFIG_PARAMETROS_UTILIDADES_ETA: ParametroConfigUtilidadesETA[] = [
  {
    chave: "pressaoAr",
    nome: "Pressão de Ar Comprimido (bar)",
    nomeCurto: "Pressão Ar (bar)",
    unidade: "bar",
    minIdeal: 6.5,
    maxIdeal: 7.8,
    alvo: 7.0,
    decimais: 1,
    equipamento: "Compressores 47-CO",
    subsistema: "Rede Ar Industrial",
    grupo: "Utilidades & Ar",
    rotuloFaixa: "6,5 - 7,8 bar",
    impactoDesvio: "Queda de pressão de ar pneumático paralisa válvulas automáticas da flotação e afeta a prensagem dos filtros.",
    acaoRecomendada: "Partir compressor reserva 47-CO-003 e verificar estanqueidade nos purgadores da rede."
  },
  {
    chave: "captacaoAguaBruta",
    nome: "Captação Água Bruta / Nova (m³/h)",
    nomeCurto: "Captação (m³/h)",
    unidade: "m³/h",
    tipoLimite: "max",
    minIdeal: 280,
    maxIdeal: 380,
    alvo: 350,
    decimais: 0,
    equipamento: "Captação Nova 47-CP",
    subsistema: "Recursos Hídricos",
    grupo: "Balanço Hídrico",
    rotuloFaixa: "≤ 380 m³/h",
    impactoDesvio: "Captação acima de 380 m³/h excede limites de outorga ambiental e sinaliza baixa recuperação nos espessadores.",
    acaoRecomendada: "Aumentar reaproveitamento de água clarificada dos espessadores e inspecionar boias da bacia."
  },
  {
    chave: "volumeTratadoEta",
    nome: "Volume Tratado ETA (m³/dia)",
    nomeCurto: "Volume ETA (m³/dia)",
    unidade: "m³/dia",
    minIdeal: 7500,
    maxIdeal: 9500,
    alvo: 8640,
    decimais: 0,
    equipamento: "ETA 47-ET-001",
    subsistema: "Tratamento de Água",
    grupo: "Balanço Hídrico",
    rotuloFaixa: "7.500 - 9.500 m³/dia",
    impactoDesvio: "Variações no volume tratado desestabilizam o nível dos reservatórios centrais de água de processo.",
    acaoRecomendada: "Regular vazão de alimentação dos filtros de areia e decantadores da ETA."
  },
  {
    chave: "taxaRecirculacaoReuso",
    nome: "Taxa de Reúso / Recirculação (%)",
    nomeCurto: "Taxa Reúso (%)",
    unidade: "%",
    tipoLimite: "min",
    minIdeal: 85.0,
    maxIdeal: 95.0,
    alvo: 86.5,
    decimais: 1,
    equipamento: "Planta Global / ETA",
    subsistema: "Balanço Hídrico",
    grupo: "Sustentabilidade Hídrica",
    rotuloFaixa: "≥ 85,0%",
    impactoDesvio: "Recirculação abaixo de 85% eleva o custo de outorga e o consumo de água nova dos mananciais.",
    acaoRecomendada: "Maximizar clarificação no overflow dos espessadores 45EP e 44EP ajustando floculante."
  },
  {
    chave: "turbidezAguaTratada",
    nome: "Turbidez Água Tratada (NTU)",
    nomeCurto: "Turbidez (NTU)",
    unidade: "NTU",
    tipoLimite: "max",
    minIdeal: 0.5,
    maxIdeal: 2.0,
    alvo: 1.5,
    decimais: 1,
    equipamento: "ETA 47-ET-001",
    subsistema: "Qualidade Hídrica",
    grupo: "Tratamento ETA",
    rotuloFaixa: "≤ 2,0 NTU",
    impactoDesvio: "Turbidez acima de 2,0 NTU acelera o desgaste em selos de bombas de processo e compromete reagentes.",
    acaoRecomendada: "Ajustar dosagem de coagulante/polímero e executar retrolavagem dos leitos filtrantes."
  },
  {
    chave: "nivelCamaraA",
    nome: "Nível da Câmara A (%)",
    nomeCurto: "Nível Câmara A (%)",
    unidade: "%",
    tipoLimite: "min",
    minIdeal: 70,
    maxIdeal: 100,
    alvo: 80,
    decimais: 0,
    equipamento: "Câmara A 47-TQ",
    subsistema: "Reservatórios Centrais",
    grupo: "Armazenamento Hídrico",
    rotuloFaixa: "≥ 70% (Meta 80-100%)",
    impactoDesvio: "Nível crítico (< 70%) gera risco de cavitação em bombas de alimentação e perda de pressão de selagem.",
    acaoRecomendada: "Partir bombas de transferência do poço de acumulação e restringir consumos não essenciais."
  },
  {
    chave: "etaAguaRecuperada",
    nome: "ETA Água Recuperada (%)",
    nomeCurto: "Água Recuperada (%)",
    unidade: "%",
    tipoLimite: "min",
    minIdeal: 70,
    maxIdeal: 85,
    alvo: 75,
    decimais: 0,
    equipamento: "ETA 47-ET-001",
    subsistema: "Recuperação Hídrica",
    grupo: "Tratamento ETA",
    rotuloFaixa: "≥ 70% (Meta 75%)",
    impactoDesvio: "Baixa recuperação de água na ETA sobrecarrega o efluente e eleva custos de descarte.",
    acaoRecomendada: "Otimizar tempo de retenção hidráulica e dosagem de polímero auxiliar de decantação."
  },
  {
    chave: "disponibilidadeUtilidades",
    nome: "Disponibilidade Utilidades (%)",
    nomeCurto: "Disponibilidade (%)",
    unidade: "%",
    tipoLimite: "min",
    minIdeal: 92.0,
    maxIdeal: 100.0,
    alvo: 95.0,
    decimais: 1,
    equipamento: "Sistema Utilidades",
    subsistema: "Confiabilidade",
    grupo: "Operação Utilidades",
    rotuloFaixa: "≥ 92,0% (Meta 95%)",
    impactoDesvio: "Indisponibilidade em compressores ou bombas de água paralisa de imediato a moagem e flotação.",
    acaoRecomendada: "Revisar prontidão das bombas reservas e executar check de óleo nos compressores."
  },
  {
    chave: "paradasManutencaoUtilidades",
    nome: "Paradas de Manutenção (h)",
    nomeCurto: "Paradas Manut. (h)",
    unidade: "h",
    tipoLimite: "max",
    minIdeal: 0.0,
    maxIdeal: 1.5,
    alvo: 0.5,
    decimais: 1,
    equipamento: "Sistema Utilidades",
    subsistema: "Disponibilidade",
    grupo: "Operação Utilidades",
    rotuloFaixa: "≤ 1,5 h",
    impactoDesvio: "Paradas não programadas em utilidades despressurizam a rede e causam disparos de intertravamento.",
    acaoRecomendada: "Executar manutenções preventivas sincronizadas com as paradas de manutenção da moagem."
  }
];

export const DADOS_DIARIOS_UTILIDADES_ETA_PADRAO: RegistroDiarioIndicadoresUtilidadesETA[] = [
  {
    dia: "seg",
    diaLabel: "Segunda-feira",
    compressoresOp: "Todos em Operação",
    bombasAguaOp: "Ambas em Operação",
    pressaoAr: 7.0,
    captacaoAguaBruta: 380,
    volumeTratadoEta: 8640,
    taxaRecirculacaoReuso: 86.5,
    turbidezAguaTratada: 1.8,
    nivelCamaraA: 84,
    etaAguaRecuperada: 75,
    disponibilidadeUtilidades: 98.5,
    paradasManutencaoUtilidades: 0.5
  },
  {
    dia: "ter",
    diaLabel: "Terça-feira",
    compressoresOp: "Todos em Operação",
    bombasAguaOp: "Ambas em Operação",
    pressaoAr: 7.1,
    captacaoAguaBruta: 375,
    volumeTratadoEta: 8520,
    taxaRecirculacaoReuso: 87.0,
    turbidezAguaTratada: 1.7,
    nivelCamaraA: 82,
    etaAguaRecuperada: 76,
    disponibilidadeUtilidades: 100.0,
    paradasManutencaoUtilidades: 0.0
  },
  {
    dia: "qua",
    diaLabel: "Quarta-feira",
    compressoresOp: "Comp 01 e 02",
    bombasAguaOp: "Ambas em Operação",
    pressaoAr: 6.9,
    captacaoAguaBruta: 360,
    volumeTratadoEta: 8700,
    taxaRecirculacaoReuso: 86.0,
    turbidezAguaTratada: 1.9,
    nivelCamaraA: 85,
    etaAguaRecuperada: 74,
    disponibilidadeUtilidades: 96.0,
    paradasManutencaoUtilidades: 1.0
  },
  {
    dia: "qui",
    diaLabel: "Quinta-feira",
    compressoresOp: "Todos em Operação",
    bombasAguaOp: "Ambas em Operação",
    pressaoAr: 7.2,
    captacaoAguaBruta: 370,
    volumeTratadoEta: 8640,
    taxaRecirculacaoReuso: 88.0,
    turbidezAguaTratada: 1.6,
    nivelCamaraA: 80,
    etaAguaRecuperada: 77,
    disponibilidadeUtilidades: 100.0,
    paradasManutencaoUtilidades: 0.0
  },
  {
    dia: "sex",
    diaLabel: "Sexta-feira",
    compressoresOp: "Todos em Operação",
    bombasAguaOp: "Ambas em Operação",
    pressaoAr: 7.0,
    captacaoAguaBruta: 380,
    volumeTratadoEta: 8800,
    taxaRecirculacaoReuso: 86.5,
    turbidezAguaTratada: 1.8,
    nivelCamaraA: 84,
    etaAguaRecuperada: 75,
    disponibilidadeUtilidades: 98.0,
    paradasManutencaoUtilidades: 0.5
  },
  {
    dia: "sab",
    diaLabel: "Sábado",
    compressoresOp: "Todos em Operação",
    bombasAguaOp: "Ambas em Operação",
    pressaoAr: 6.8,
    captacaoAguaBruta: 365,
    volumeTratadoEta: 8600,
    taxaRecirculacaoReuso: 87.2,
    turbidezAguaTratada: 1.7,
    nivelCamaraA: 83,
    etaAguaRecuperada: 76,
    disponibilidadeUtilidades: 100.0,
    paradasManutencaoUtilidades: 0.0
  },
  {
    dia: "dom",
    diaLabel: "Domingo",
    compressoresOp: "Todos em Operação",
    bombasAguaOp: "Ambas em Operação",
    pressaoAr: 7.0,
    captacaoAguaBruta: 350,
    volumeTratadoEta: 8640,
    taxaRecirculacaoReuso: 86.8,
    turbidezAguaTratada: 1.8,
    nivelCamaraA: 85,
    etaAguaRecuperada: 75,
    disponibilidadeUtilidades: 99.0,
    paradasManutencaoUtilidades: 0.0
  }
];

export interface EstatisticaCartaControleUtilidadesETA {
  parametro: ParametroConfigUtilidadesETA;
  media: number;
  desvioPadrao: number;
  minimo: number;
  maximo: number;
  lsc: number;
  lic: number;
  lc: number;
  valoresPorDia: { dia: string; diaLabel: string; valor: number | null; status: "normal" | "alerta_alto" | "alerta_baixo" }[];
  pontosForaFaixa: number;
  estabilidade: "estavel" | "instavel_sob_alerta" | "critico";
}

export function calcularCartasControleUtilidadesETA(
  historico?: RegistroDiarioIndicadoresUtilidadesETA[]
): EstatisticaCartaControleUtilidadesETA[] {
  const lista = historico && historico.length > 0 ? historico : DADOS_DIARIOS_UTILIDADES_ETA_PADRAO;

  return CONFIG_PARAMETROS_UTILIDADES_ETA.map(param => {
    const valoresValidos: number[] = [];
    const valoresPorDia = lista.map(item => {
      const v = item[param.chave];
      const valNum = parseNumeroBritagem(v);
      if (valNum !== null) valoresValidos.push(valNum);

      let status: "normal" | "alerta_alto" | "alerta_baixo" = "normal";
      if (valNum !== null) {
        if (param.tipoLimite === "min") {
          if (valNum < param.minIdeal) status = "alerta_baixo";
        } else if (param.tipoLimite === "max") {
          if (valNum > param.maxIdeal) status = "alerta_alto";
        } else {
          if (valNum > param.maxIdeal) status = "alerta_alto";
          else if (valNum < param.minIdeal) status = "alerta_baixo";
        }
      }

      return {
        dia: item.dia,
        diaLabel: item.diaLabel,
        valor: valNum,
        status
      };
    });

    const n = valoresValidos.length;
    const media = n > 0 ? valoresValidos.reduce((a, b) => a + b, 0) / n : param.alvo;
    const variancia = n > 1
      ? valoresValidos.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / (n - 1)
      : 0;
    const desvioPadrao = Math.sqrt(variancia);
    const minimo = n > 0 ? Math.min(...valoresValidos) : param.minIdeal;
    const maximo = n > 0 ? Math.max(...valoresValidos) : param.maxIdeal;
    const pontosFora = valoresPorDia.filter(p => p.status !== "normal").length;

    let estabilidade: "estavel" | "instavel_sob_alerta" | "critico" = "estavel";
    if (pontosFora >= 2) estabilidade = "critico";
    else if (pontosFora === 1) estabilidade = "instavel_sob_alerta";

    return {
      parametro: param,
      media: +media.toFixed(param.decimais),
      desvioPadrao: +desvioPadrao.toFixed(2),
      minimo: +minimo.toFixed(param.decimais),
      maximo: +maximo.toFixed(param.decimais),
      lsc: param.tipoLimite === "min" ? 0 : param.maxIdeal,
      lic: param.tipoLimite === "max" ? 0 : param.minIdeal,
      lc: param.alvo,
      valoresPorDia,
      pontosForaFaixa: pontosFora,
      estabilidade
    };
  });
}

export interface AnotacaoDesvioOperacional {
  impactoPerda: string;
  acaoRecomendada: string;
}

export interface DadosSetorBritagemRebritagem {
  // Britagem Primária - Desempenho
  taxaBritagem: number | "";
  metaTaxaBritagem: number;
  disponibilidadeBritagem: number | "";
  utilizacaoBritagem: number | "";

  // Indicadores Operacionais da Britagem (41BR001 / 41TC001) - Valores Instantâneos / Médios
  posicaoManto: string | number; // Posição do Manto (%)
  afericaoBritador: string | number; // Aferição (")
  vazaoOleoBuchaInterna: number | ""; // Vazão de Óleo (l/m) - Bucha Interna
  vazaoOleoBuchaExterna: number | ""; // Vazão de Óleo (l/m) - Bucha Externa
  pressaoOleoLubrificante: number | ""; // Pressão do Óleo Lubrificante (Kg/cm²)
  pressaoArAcumulador: number | ""; // Pressão de Ar Acumulador (kg/cm²)
  pressaoArAc1: number | ""; // Pressão Ar - Ac. 1
  pressaoArAc2: number | ""; // Pressão Ar - Ac. 2
  pressaoAguaResfriamento: number | ""; // Pressão da água de resfriamento
  amperagemMotor41TC001: number | ""; // 41TC001 - Amperagem do Motor (A)
  amperagemMotor41BR001: number | ""; // 41BR001 - Amperagem do Motor (A)
  temperaturaOleoRetorno: number | ""; // Temperatura Óleo (ºC) - Retorno
  temperaturaOleoBuchaExterna: number | ""; // Temperatura Óleo (ºC) - Bucha Externa
  temperaturaOleoBuchaInterna: number | ""; // Temperatura Óleo (ºC) - Bucha Interna

  // Histórico Diário de Segunda a Domingo para Cartas de Controle
  historicoDiarioBritagem?: RegistroDiarioIndicadoresBritagem[];
  
  // Anotações e Ações do Supervisor para Desvios Detectados na Britagem Primária
  anotacoesDesvios?: Record<string, AnotacaoDesvioOperacional>;

  // Indicadores Operacionais da Rebritagem & Peneiramento (BR001 a BR006)
  historicoDiarioRebritagem?: RegistroDiarioIndicadoresRebritagem[];
  anotacoesDesviosRebritagem?: Record<string, AnotacaoDesvioOperacional>;

  // Pátios & Estoques de ROM
  estoqueMsb: number | "";
  estoqueSurubim: number | "";
  estoqueVermelhos: number | "";
  estoqueSucuarana: number | "";
  estoqueTotalRom: number | "";
  
  // Rebritagem
  producaoBypass: number | "";
  producaoPatio: number | "";
  producaoTotalRebritagem: number | "";
  produtividadeRebritagem: number | "";
  disponibilidadeRebritagem: number | "";
  utilizacaoRebritagem: number | "";
  retidoMeiaPol: number | "";
  pilhaIntermediaria: number | "";

  // Dados Acumulados
  producaoDiaTotal: number | "";
  metaProducaoDia: number;
  producaoSemanaAcum: number | "";
  metaProducaoSemana: number;
  producaoMesAcum: number | "";
  metaProducaoMes: number;

  // Diretrizes Específicas do Setor
  diretrizDia: string;
  diretrizSemana: string;
  diretrizFds: string;
  diretrizMes: string;
  gargalosAtuais: string;
  planoContingencia: string;
}

export interface DadosSetorConcentradorEta {
  // Pátio e Silos
  estoquePatio: number | "";
  nivelSilo1: number | "";
  nivelSilo2: number | "";
  autonomiaMinérioHoras: number | "";
  autonomiaMinérioToneladas: number | "";
  statusRetomador: string;

  // Moagem - Parâmetros Operacionais Diários (MI003, MI004, MI005)
  historicoDiarioMoagem?: RegistroDiarioIndicadoresMoagem[];
  anotacoesDesviosMoagem?: Record<string, AnotacaoDesvioOperacional>;

  // Remoagem - Parâmetros Operacionais Diários (HIG Mill)
  historicoDiarioRemoagem?: RegistroDiarioIndicadoresRemoagem[];
  anotacoesDesviosRemoagem?: Record<string, AnotacaoDesvioOperacional>;

  producaoMoagemDia?: number | "";
  metaProducaoMoagemDia?: number;
  producaoMoagemSemana?: number | "";
  metaProducaoMoagemSemana?: number;
  producaoMoagemMes?: number | "";
  metaProducaoMoagemMes?: number;
  taxaMi003: number | "";
  taxaMi004: number | "";
  taxaMi005: number | "";
  taxaTotalMoagem: number | "";
  potenciaMi003: number | "";
  potenciaMi004: number | "";
  potenciaMi005: number | "";
  solidosOverflowMi003: number | "";
  solidosOverflowMi004: number | "";
  solidosOverflowMi005: number | "";
  solidosDescargaMi003: number | "";
  solidosDescargaMi004: number | "";
  solidosDescargaMi005: number | "";
  reposicoesMi003: string | number | "";
  reposicoesMi004: string | number | "";
  reposicoesMi005: string | number | "";
  hidrociclonesBh003: string;
  hidrociclonesBh004: string;
  hidrociclonesBh005: string;
  densidadeMi003: number | "";
  densidadeMi004: number | "";
  densidadeMi005: number | "";
  pressaoPsiMi003: number | string | "";
  pressaoPsiMi004: number | string | "";
  pressaoPsiMi005: number | string | "";
  granulometria105: number | "";
  disponibilidadeMoagem: number | "";
  utilizacaoMoagem: number | "";

  // Flotação
  historicoDiarioFlotacao?: RegistroDiarioIndicadoresFlotacao[];
  anotacoesDesviosFlotacao?: Record<string, AnotacaoDesvioOperacional>;
  teorAlimentacaoCu: number | "";
  teorConcentradoCu: number | "";
  teorRejeitoCu: number | "";
  recuperacaoMetalurgica: number | "";
  metaRecuperacao: number;
  metalContidoDia: number | "";
  metaMetalContidoDia: number;
  metalContidoSemana: number | "";
  metaMetalContidoSemana: number;
  metalContidoMes: number | "";
  metaMetalContidoMes: number;
  concentradoProduzidoDia: number | "";
  metaConcentradoDia: number;
  phRougher: number | "";
  consumoColetor: number | "";
  consumoEspumante: number | "";
  consumoDispersante: number | "";
  consumoCmc: number | "";
  consumoAmidex: number | "";

  // Espessamento Concentrado
  espessadorConcEmOperacao: string;
  densidadeUnderflowConc: number | "";
  solidosConc44ep001: number | "";
  solidosConc44ep002: number | "";
  nivelTanqueConc: number | "";
  consumoFloculanteConc: number | "";
  elevacaoRakeConc: number | "";
  elevacaoRakeConcEp001?: number | "";
  elevacaoRakeConcEp002?: number | "";
  torqueConcEp001?: number | "";
  torqueConcEp002?: number | "";
  historicoDiarioEspessamentoConcentrado?: RegistroDiarioIndicadoresEspessamentoConcentrado[];
  anotacoesDesviosEspessamentoConcentrado?: Record<string, AnotacaoDesvioOperacional>;

  // Espessamento Rejeito
  espessadorRejEmOperacao: string;
  densidadeUnderflowRej: number | "";
  solidosRej45ep001: number | "";
  solidosRej45ep002: number | "";
  torqueRejEp001: number | "";
  torqueRejEp002: number | "";
  consumoFloculanteRej: number | "";
  htrLinhas: string;
  historicoDiarioEspessamentoRejeito?: RegistroDiarioIndicadoresEspessamentoRejeito[];
  anotacoesDesviosEspessamentoRejeito?: Record<string, AnotacaoDesvioOperacional>;

  // Filtragem
  filtroConcOp?: string;
  producaoFiltragem?: number | "";
  paradasManutencaoFiltro?: number | "";
  paradasOutrosFiltro?: number | "";
  umidadeBolo: number | "";
  metaUmidadeBolo: number;
  produtividadeFiltro: number | "";
  ciclosFiltro: number | "";
  pesoTortaKg: number | "";
  pressaoCompactacao: number | "";
  historicoDiarioFiltragemConcentrado?: RegistroDiarioIndicadoresFiltragemConcentrado[];
  anotacoesDesviosFiltragemConcentrado?: Record<string, AnotacaoDesvioOperacional>;

  // ETA (Estação de Tratamento de Água)
  captacaoAguaBrutaM3h: number | "";
  aguaTratadaM3Dia: number | "";
  taxaRecirculacaoReuso: number | "";
  metaRecirculacao: number;
  turbidezAguaTratadaNtu: number | "";
  nivelReservatorioCentral: number | "";
  dosagemCoagulantePpm: number | "";
  dosagemPolimeroPpm: number | "";
  consumoHipocloritoKg: number | "";
  balancoHidricoStatus: string;
  compressoresOp?: string;
  bombasAguaOp?: string;
  historicoDiarioUtilidadesETA?: RegistroDiarioIndicadoresUtilidadesETA[];
  anotacoesDesviosUtilidadesETA?: Record<string, AnotacaoDesvioOperacional>;

  // Diretrizes Específicas
  diretrizDia: string;
  diretrizSemana: string;
  diretrizFds: string;
  diretrizMes: string;
  gargalosAtuais: string;
  planoContingencia: string;
}

export interface EstrategiaPorHorizonte {
  titulo: string;
  focoPrincipal: string;
  metaProducaoCobreContido?: number;
  metaAlimentacaoMoagem?: number;
  metaAlimentacaoBritagem?: number;
  metaTaxaHoraria?: number;
  metaDisponibilidade?: number;
  metaRecuperacao?: number;
  diretrizesPrioritarias: string[];
  recursosManutencao: string | string[];
  alertasOperacionais: string[];
  planoBlindagemFds?: string;
  planoAlinhamentoParada?: string;
}

export interface SecoesVisiveisRelatorio {
  responsaveisTecnicos: boolean;
  balancoOperacional: boolean;
  horizonteDia: boolean;
  horizonteSemana: boolean;
  horizonteFds: boolean;
  horizonteParada?: boolean;
  horizonteMes: boolean;
  matrizDiretrizes: boolean;
  cronogramaGantt: boolean;
  diagnosticoGargalos: boolean;
  planoContingencia: boolean;
}

export const SECOES_VISIVEIS_PADRAO: SecoesVisiveisRelatorio = {
  responsaveisTecnicos: true,
  balancoOperacional: true,
  horizonteDia: true,
  horizonteSemana: true,
  horizonteFds: true,
  horizonteParada: true,
  horizonteMes: true,
  matrizDiretrizes: true,
  cronogramaGantt: true,
  diagnosticoGargalos: true,
  planoContingencia: true,
};

export interface RelatorioAdmPayload {
  circuitoTipo: CircuitoTipo; // "seco" (Cominuição) ou "umido" (Beneficiamento)
  dataEmissao: string;
  periodoReferencia: string;
  supervisorAdmResponsavel: string;
  engenheiroProcesso?: string;
  gerentePlanta?: string;
  
  // Seções e Itens Visíveis Selecionados pelo Supervisor
  secoesVisiveis?: SecoesVisiveisRelatorio;
  
  // Setor 1: Britagem + Rebritagem (Circuito Seco)
  dadosBritagemRebritagem: DadosSetorBritagemRebritagem;
  
  // Setor 2: Concentrador + ETA (Circuito Úmido)
  dadosConcentradorEta: DadosSetorConcentradorEta;

  // Estratégias por Horizonte
  estrategiaDia: EstrategiaPorHorizonte;
  estrategiaSemana: EstrategiaPorHorizonte;
  estrategiaFds: EstrategiaPorHorizonte;
  estrategiaParada?: EstrategiaPorHorizonte;
  estrategiaMes: EstrategiaPorHorizonte;

  // Diretrizes com Prazos para Supervisores de Turno
  diretrizesTurno: DiretrizSupervisorTurno[];

  // Observações e Recomendações Gerais
  observacoesGerais: string;
  prioridadesImediatas: string[];
}

export const DADOS_DIARIOS_BRITAGEM_PADRAO: RegistroDiarioIndicadoresBritagem[] = [
  {
    dia: "seg",
    diaLabel: "Segunda-feira",
    produtividadeTph: "",
    posicaoManto: "",
    afericaoBritador: "",
    vazaoOleoBuchaInterna: "",
    vazaoOleoBuchaExterna: "",
    pressaoOleoLubrificante: "",
    pressaoArAcumulador: "",
    pressaoArAc1: "",
    pressaoArAc2: "",
    pressaoAguaResfriamento: "",
    amperagemMotor41TC001: "",
    amperagemMotor41BR001: "",
    temperaturaOleoRetorno: "",
    temperaturaOleoBuchaExterna: "",
    temperaturaOleoBuchaInterna: "",
    observacao: ""
  },
  {
    dia: "ter",
    diaLabel: "Terça-feira",
    produtividadeTph: "",
    posicaoManto: "",
    afericaoBritador: "",
    vazaoOleoBuchaInterna: "",
    vazaoOleoBuchaExterna: "",
    pressaoOleoLubrificante: "",
    pressaoArAcumulador: "",
    pressaoArAc1: "",
    pressaoArAc2: "",
    pressaoAguaResfriamento: "",
    amperagemMotor41TC001: "",
    amperagemMotor41BR001: "",
    temperaturaOleoRetorno: "",
    temperaturaOleoBuchaExterna: "",
    temperaturaOleoBuchaInterna: "",
    observacao: ""
  },
  {
    dia: "qua",
    diaLabel: "Quarta-feira",
    produtividadeTph: "",
    posicaoManto: "",
    afericaoBritador: "",
    vazaoOleoBuchaInterna: "",
    vazaoOleoBuchaExterna: "",
    pressaoOleoLubrificante: "",
    pressaoArAcumulador: "",
    pressaoArAc1: "",
    pressaoArAc2: "",
    pressaoAguaResfriamento: "",
    amperagemMotor41TC001: "",
    amperagemMotor41BR001: "",
    temperaturaOleoRetorno: "",
    temperaturaOleoBuchaExterna: "",
    temperaturaOleoBuchaInterna: "",
    observacao: ""
  },
  {
    dia: "qui",
    diaLabel: "Quinta-feira",
    produtividadeTph: "",
    posicaoManto: "",
    afericaoBritador: "",
    vazaoOleoBuchaInterna: "",
    vazaoOleoBuchaExterna: "",
    pressaoOleoLubrificante: "",
    pressaoArAcumulador: "",
    pressaoArAc1: "",
    pressaoArAc2: "",
    pressaoAguaResfriamento: "",
    amperagemMotor41TC001: "",
    amperagemMotor41BR001: "",
    temperaturaOleoRetorno: "",
    temperaturaOleoBuchaExterna: "",
    temperaturaOleoBuchaInterna: "",
    observacao: ""
  },
  {
    dia: "sex",
    diaLabel: "Sexta-feira",
    produtividadeTph: "",
    posicaoManto: "",
    afericaoBritador: "",
    vazaoOleoBuchaInterna: "",
    vazaoOleoBuchaExterna: "",
    pressaoOleoLubrificante: "",
    pressaoArAcumulador: "",
    pressaoArAc1: "",
    pressaoArAc2: "",
    pressaoAguaResfriamento: "",
    amperagemMotor41TC001: "",
    amperagemMotor41BR001: "",
    temperaturaOleoRetorno: "",
    temperaturaOleoBuchaExterna: "",
    temperaturaOleoBuchaInterna: "",
    observacao: ""
  },
  {
    dia: "sab",
    diaLabel: "Sábado",
    produtividadeTph: "",
    posicaoManto: "",
    afericaoBritador: "",
    vazaoOleoBuchaInterna: "",
    vazaoOleoBuchaExterna: "",
    pressaoOleoLubrificante: "",
    pressaoArAcumulador: "",
    pressaoArAc1: "",
    pressaoArAc2: "",
    pressaoAguaResfriamento: "",
    amperagemMotor41TC001: "",
    amperagemMotor41BR001: "",
    temperaturaOleoRetorno: "",
    temperaturaOleoBuchaExterna: "",
    temperaturaOleoBuchaInterna: "",
    observacao: ""
  },
  {
    dia: "dom",
    diaLabel: "Domingo",
    produtividadeTph: "",
    posicaoManto: "",
    afericaoBritador: "",
    vazaoOleoBuchaInterna: "",
    vazaoOleoBuchaExterna: "",
    pressaoOleoLubrificante: "",
    pressaoArAcumulador: "",
    pressaoArAc1: "",
    pressaoArAc2: "",
    pressaoAguaResfriamento: "",
    amperagemMotor41TC001: "",
    amperagemMotor41BR001: "",
    temperaturaOleoRetorno: "",
    temperaturaOleoBuchaExterna: "",
    temperaturaOleoBuchaInterna: "",
    observacao: ""
  }
];

export const DADOS_DIARIOS_REBRITAGEM_PADRAO: RegistroDiarioIndicadoresRebritagem[] = [
  {
    dia: "seg",
    diaLabel: "Segunda-feira",
    tempOleoLub_BR001: "",
    tempOleoLub_BR002: "",
    tempOleoLub_BR003: "",
    tempOleoLub_BR004: "",
    tempOleoLub_BR005: "",
    tempOleoLub_BR006: "",
    pressaoHydroset_BR003: "",
    pressaoHydroset_BR004: "",
    pressaoHydroset_BR005: "",
    pressaoHydroset_BR006: "",
    potencia_BR001: "",
    potencia_BR002: "",
    potencia_BR003: "",
    potencia_BR004: "",
    potencia_BR005: "",
    potencia_BR006: "",
    freqAlimentador_BR001: "",
    freqAlimentador_BR002: "",
    freqAlimentador_BR003: "",
    freqAlimentador_BR004: "",
    freqAlimentador_BR005: "",
    freqAlimentador_BR006: "",
    difTemp_BR001: "",
    difTemp_BR002: "",
    pressaoContraeixo_BR001: "",
    pressaoContraeixo_BR002: "",
    difPressao_BR001: "",
    difPressao_BR002: "",
    retidoMeiaPol: "",
    produtividadeTph: "",
    observacao: ""
  },
  {
    dia: "ter",
    diaLabel: "Terça-feira",
    tempOleoLub_BR001: "",
    tempOleoLub_BR002: "",
    tempOleoLub_BR003: "",
    tempOleoLub_BR004: "",
    tempOleoLub_BR005: "",
    tempOleoLub_BR006: "",
    pressaoHydroset_BR003: "",
    pressaoHydroset_BR004: "",
    pressaoHydroset_BR005: "",
    pressaoHydroset_BR006: "",
    potencia_BR001: "",
    potencia_BR002: "",
    potencia_BR003: "",
    potencia_BR004: "",
    potencia_BR005: "",
    potencia_BR006: "",
    freqAlimentador_BR001: "",
    freqAlimentador_BR002: "",
    freqAlimentador_BR003: "",
    freqAlimentador_BR004: "",
    freqAlimentador_BR005: "",
    freqAlimentador_BR006: "",
    difTemp_BR001: "",
    difTemp_BR002: "",
    pressaoContraeixo_BR001: "",
    pressaoContraeixo_BR002: "",
    difPressao_BR001: "",
    difPressao_BR002: "",
    retidoMeiaPol: "",
    produtividadeTph: "",
    observacao: ""
  },
  {
    dia: "qua",
    diaLabel: "Quarta-feira",
    tempOleoLub_BR001: "",
    tempOleoLub_BR002: "",
    tempOleoLub_BR003: "",
    tempOleoLub_BR004: "",
    tempOleoLub_BR005: "",
    tempOleoLub_BR006: "",
    pressaoHydroset_BR003: "",
    pressaoHydroset_BR004: "",
    pressaoHydroset_BR005: "",
    pressaoHydroset_BR006: "",
    potencia_BR001: "",
    potencia_BR002: "",
    potencia_BR003: "",
    potencia_BR004: "",
    potencia_BR005: "",
    potencia_BR006: "",
    freqAlimentador_BR001: "",
    freqAlimentador_BR002: "",
    freqAlimentador_BR003: "",
    freqAlimentador_BR004: "",
    freqAlimentador_BR005: "",
    freqAlimentador_BR006: "",
    difTemp_BR001: "",
    difTemp_BR002: "",
    pressaoContraeixo_BR001: "",
    pressaoContraeixo_BR002: "",
    difPressao_BR001: "",
    difPressao_BR002: "",
    retidoMeiaPol: "",
    produtividadeTph: "",
    observacao: ""
  },
  {
    dia: "qui",
    diaLabel: "Quinta-feira",
    tempOleoLub_BR001: "",
    tempOleoLub_BR002: "",
    tempOleoLub_BR003: "",
    tempOleoLub_BR004: "",
    tempOleoLub_BR005: "",
    tempOleoLub_BR006: "",
    pressaoHydroset_BR003: "",
    pressaoHydroset_BR004: "",
    pressaoHydroset_BR005: "",
    pressaoHydroset_BR006: "",
    potencia_BR001: "",
    potencia_BR002: "",
    potencia_BR003: "",
    potencia_BR004: "",
    potencia_BR005: "",
    potencia_BR006: "",
    freqAlimentador_BR001: "",
    freqAlimentador_BR002: "",
    freqAlimentador_BR003: "",
    freqAlimentador_BR004: "",
    freqAlimentador_BR005: "",
    freqAlimentador_BR006: "",
    difTemp_BR001: "",
    difTemp_BR002: "",
    pressaoContraeixo_BR001: "",
    pressaoContraeixo_BR002: "",
    difPressao_BR001: "",
    difPressao_BR002: "",
    retidoMeiaPol: "",
    produtividadeTph: "",
    observacao: ""
  },
  {
    dia: "sex",
    diaLabel: "Sexta-feira",
    tempOleoLub_BR001: "",
    tempOleoLub_BR002: "",
    tempOleoLub_BR003: "",
    tempOleoLub_BR004: "",
    tempOleoLub_BR005: "",
    tempOleoLub_BR006: "",
    pressaoHydroset_BR003: "",
    pressaoHydroset_BR004: "",
    pressaoHydroset_BR005: "",
    pressaoHydroset_BR006: "",
    potencia_BR001: "",
    potencia_BR002: "",
    potencia_BR003: "",
    potencia_BR004: "",
    potencia_BR005: "",
    potencia_BR006: "",
    freqAlimentador_BR001: "",
    freqAlimentador_BR002: "",
    freqAlimentador_BR003: "",
    freqAlimentador_BR004: "",
    freqAlimentador_BR005: "",
    freqAlimentador_BR006: "",
    difTemp_BR001: "",
    difTemp_BR002: "",
    pressaoContraeixo_BR001: "",
    pressaoContraeixo_BR002: "",
    difPressao_BR001: "",
    difPressao_BR002: "",
    retidoMeiaPol: "",
    produtividadeTph: "",
    observacao: ""
  },
  {
    dia: "sab",
    diaLabel: "Sábado",
    tempOleoLub_BR001: "",
    tempOleoLub_BR002: "",
    tempOleoLub_BR003: "",
    tempOleoLub_BR004: "",
    tempOleoLub_BR005: "",
    tempOleoLub_BR006: "",
    pressaoHydroset_BR003: "",
    pressaoHydroset_BR004: "",
    pressaoHydroset_BR005: "",
    pressaoHydroset_BR006: "",
    potencia_BR001: "",
    potencia_BR002: "",
    potencia_BR003: "",
    potencia_BR004: "",
    potencia_BR005: "",
    potencia_BR006: "",
    freqAlimentador_BR001: "",
    freqAlimentador_BR002: "",
    freqAlimentador_BR003: "",
    freqAlimentador_BR004: "",
    freqAlimentador_BR005: "",
    freqAlimentador_BR006: "",
    difTemp_BR001: "",
    difTemp_BR002: "",
    pressaoContraeixo_BR001: "",
    pressaoContraeixo_BR002: "",
    difPressao_BR001: "",
    difPressao_BR002: "",
    retidoMeiaPol: "",
    produtividadeTph: "",
    observacao: ""
  },
  {
    dia: "dom",
    diaLabel: "Domingo",
    tempOleoLub_BR001: "",
    tempOleoLub_BR002: "",
    tempOleoLub_BR003: "",
    tempOleoLub_BR004: "",
    tempOleoLub_BR005: "",
    tempOleoLub_BR006: "",
    pressaoHydroset_BR003: "",
    pressaoHydroset_BR004: "",
    pressaoHydroset_BR005: "",
    pressaoHydroset_BR006: "",
    potencia_BR001: "",
    potencia_BR002: "",
    potencia_BR003: "",
    potencia_BR004: "",
    potencia_BR005: "",
    potencia_BR006: "",
    freqAlimentador_BR001: "",
    freqAlimentador_BR002: "",
    freqAlimentador_BR003: "",
    freqAlimentador_BR004: "",
    freqAlimentador_BR005: "",
    freqAlimentador_BR006: "",
    difTemp_BR001: "",
    difTemp_BR002: "",
    pressaoContraeixo_BR001: "",
    pressaoContraeixo_BR002: "",
    difPressao_BR001: "",
    difPressao_BR002: "",
    retidoMeiaPol: "",
    produtividadeTph: "",
    observacao: ""
  }
];

export interface DesvioIndicadorDetectado {
  chave: keyof Omit<RegistroDiarioIndicadoresBritagem, "dia" | "diaLabel" | "observacao">;
  parametro: ParametroConfigBritagem;
  diaLabel: string;
  dia: string;
  valorLido: number;
  tipoDesvio: "alto" | "baixo";
  delta: number;
  impactoPerda: string;
  acaoCorretiva: string;
}

export interface DesvioIndicadorRebritagemDetectado {
  chave: keyof Omit<RegistroDiarioIndicadoresRebritagem, "dia" | "diaLabel" | "observacao">;
  parametro: ParametroConfigRebritagem;
  diaLabel: string;
  dia: string;
  valorLido: number;
  tipoDesvio: "alto" | "baixo";
  delta: number;
  impactoPerda: string;
  acaoCorretiva: string;
}

export function parseNumeroBritagem(val: any): number | null {
  if (val === null || val === undefined || val === "") return null;
  if (typeof val === "number") return isNaN(val) ? null : val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.,-]/g, "").replace(",", ".");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

export function obterLeituraAtualBritagem(
  dadosBR?: Partial<DadosSetorBritagemRebritagem>,
  param?: ParametroConfigBritagem
): { numVal: number | null; leituraFormatada: string; origem: "diario" | "direto" | "padrao" } {
  if (!param) return { numVal: null, leituraFormatada: "-", origem: "padrao" };

  const hist = dadosBR?.historicoDiarioBritagem;
  
  // 1. Se existe a tabela de histórico diário (Segunda a Domingo), ela é a fonte oficial de verdade
  if (hist && Array.isArray(hist) && hist.length > 0) {
    for (let i = hist.length - 1; i >= 0; i--) {
      const row = hist[i];
      if (row) {
        const valRaw = row[param.chave];
        const parsed = parseNumeroBritagem(valRaw);
        if (parsed !== null) {
          let str = `${param.decimais > 0 ? parsed.toFixed(param.decimais).replace(".", ",") : parsed} ${param.unidade}`;
          if (param.unidade === "%") str = `${param.decimais > 0 ? parsed.toFixed(param.decimais).replace(".", ",") : parsed}%`;
          if (param.unidade === '"') str = `${param.decimais > 0 ? parsed.toFixed(param.decimais).replace(".", ",") : parsed}"`;
          return { numVal: parsed, leituraFormatada: str, origem: "diario" };
        }
      }
    }
    // Se a tabela diária existe mas não possui nenhum valor preenchido para este parâmetro, retorna vazio
    return { numVal: null, leituraFormatada: "", origem: "padrao" };
  }

  // 2. Se NÃO houver tabela diária configurada (legado isolado), verifica o campo direto em dadosBR
  let valDireto = dadosBR ? (dadosBR as any)[param.chave] : undefined;
  if ((valDireto === undefined || valDireto === "") && param.chave === "produtividadeTph") {
    valDireto = dadosBR?.taxaBritagem;
  }
  const parsedDireto = parseNumeroBritagem(valDireto);
  if (parsedDireto !== null) {
    let str = `${param.decimais > 0 ? parsedDireto.toFixed(param.decimais).replace(".", ",") : parsedDireto} ${param.unidade}`;
    if (param.unidade === "%") str = `${param.decimais > 0 ? parsedDireto.toFixed(param.decimais).replace(".", ",") : parsedDireto}%`;
    if (param.unidade === '"') str = `${param.decimais > 0 ? parsedDireto.toFixed(param.decimais).replace(".", ",") : parsedDireto}"`;
    return { numVal: parsedDireto, leituraFormatada: str, origem: "direto" };
  }

  // 3. Se não tiver sido lançado pelo supervisor, retorna vazio (sem fallback fictício)
  return { numVal: null, leituraFormatada: "", origem: "padrao" };
}

export function obterAcaoEstrategicaBritagem(
  dadosBR?: Partial<DadosSetorBritagemRebritagem>,
  param?: ParametroConfigBritagem
): string {
  if (!param) return "";

  // 1. Procura nas anotações de desvios cadastradas pelo supervisor (Ações Recomendadas / Diretrizes de Mitigação)
  const anotacoes = dadosBR?.anotacoesDesvios;
  if (anotacoes && typeof anotacoes === "object") {
    // Procura por chaves vinculadas ao parâmetro (ex: "posicaoManto", "posicaoManto_dom", "posicaoManto_seg", etc.)
    const chavesRelevantes = Object.keys(anotacoes).filter(
      k => k === param.chave || k.startsWith(`${param.chave}_`)
    );

    const acoesPreenchidas: string[] = [];
    chavesRelevantes.forEach(k => {
      const txt = anotacoes[k]?.acaoRecomendada?.trim();
      if (txt && !acoesPreenchidas.includes(txt)) {
        acoesPreenchidas.push(txt);
      }
    });

    if (acoesPreenchidas.length > 0) {
      return acoesPreenchidas.join(" | ");
    }
  }

  // 2. Se o supervisor não lançou nenhuma informação, retorna vazio ("")
  return "";
}

export function detectarDesviosBritagem(
  historico?: RegistroDiarioIndicadoresBritagem[],
  anotacoes?: Record<string, AnotacaoDesvioOperacional>
): DesvioIndicadorDetectado[] {
  const lista = historico && historico.length > 0 ? historico : DADOS_DIARIOS_BRITAGEM_PADRAO;
  const desvios: DesvioIndicadorDetectado[] = [];

  CONFIG_PARAMETROS_BRITAGEM.forEach(param => {
    lista.forEach(item => {
      const v = item[param.chave];
      const val = parseNumeroBritagem(v);
      if (val !== null) {
        const keyDesvio = `${param.chave}_${item.dia}`;
        const anotacao = anotacoes?.[keyDesvio];
        const impactoUser = anotacao?.impactoPerda || "";
        const acaoUser = anotacao?.acaoRecomendada || "";

        if (val > param.maxIdeal) {
          desvios.push({
            chave: param.chave,
            parametro: param,
            diaLabel: item.diaLabel,
            dia: item.dia,
            valorLido: val,
            tipoDesvio: "alto",
            delta: +(val - param.maxIdeal).toFixed(2),
            impactoPerda: impactoUser,
            acaoCorretiva: acaoUser
          });
        } else if (val < param.minIdeal) {
          desvios.push({
            chave: param.chave,
            parametro: param,
            diaLabel: item.diaLabel,
            dia: item.dia,
            valorLido: val,
            tipoDesvio: "baixo",
            delta: +(param.minIdeal - val).toFixed(2),
            impactoPerda: impactoUser,
            acaoCorretiva: acaoUser
          });
        }
      }
    });
  });

  return desvios;
}

export interface EstatisticaCartaControle {
  parametro: ParametroConfigBritagem;
  media: number;
  desvioPadrao: number;
  minimo: number;
  maximo: number;
  lsc: number; // Limite Superior de Controle (Ideal Max)
  lic: number; // Limite Inferior de Controle (Ideal Min)
  lc: number; // Linha Central (Alvo)
  valoresPorDia: { dia: string; diaLabel: string; valor: number | null; status: "normal" | "alerta_alto" | "alerta_baixo" }[];
  pontosForaFaixa: number;
  estabilidade: "estavel" | "instavel_sob_alerta" | "critico";
}

export function calcularCartasControleBritagem(
  historico?: RegistroDiarioIndicadoresBritagem[]
): EstatisticaCartaControle[] {
  const lista = historico && historico.length > 0 ? historico : DADOS_DIARIOS_BRITAGEM_PADRAO;

  return CONFIG_PARAMETROS_BRITAGEM.map(param => {
    const valoresValidos: number[] = [];
    const valoresPorDia = lista.map(item => {
      const v = item[param.chave];
      const valNum = parseNumeroBritagem(v);
      if (valNum !== null) valoresValidos.push(valNum);

      let status: "normal" | "alerta_alto" | "alerta_baixo" = "normal";
      if (valNum !== null) {
        if (valNum > param.maxIdeal) status = "alerta_alto";
        else if (valNum < param.minIdeal) status = "alerta_baixo";
      }

      return {
        dia: item.dia,
        diaLabel: item.diaLabel,
        valor: valNum,
        status
      };
    });

    const n = valoresValidos.length;
    const media = n > 0 ? valoresValidos.reduce((a, b) => a + b, 0) / n : param.alvo;
    const variancia = n > 1
      ? valoresValidos.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / (n - 1)
      : 0;
    const desvioPadrao = Math.sqrt(variancia);
    const minimo = n > 0 ? Math.min(...valoresValidos) : param.minIdeal;
    const maximo = n > 0 ? Math.max(...valoresValidos) : param.maxIdeal;
    const pontosFora = valoresPorDia.filter(p => p.status !== "normal").length;

    let estabilidade: "estavel" | "instavel_sob_alerta" | "critico" = "estavel";
    if (pontosFora >= 2) estabilidade = "critico";
    else if (pontosFora === 1) estabilidade = "instavel_sob_alerta";

    return {
      parametro: param,
      media: +media.toFixed(param.decimais),
      desvioPadrao: +desvioPadrao.toFixed(2),
      minimo: +minimo.toFixed(param.decimais),
      maximo: +maximo.toFixed(param.decimais),
      lsc: param.maxIdeal,
      lic: param.minIdeal,
      lc: param.alvo,
      valoresPorDia,
      pontosForaFaixa: pontosFora,
      estabilidade
    };
  });
}

export function obterLeituraAtualRebritagem(
  dadosBR?: Partial<DadosSetorBritagemRebritagem>,
  param?: ParametroConfigRebritagem
): { numVal: number | null; leituraFormatada: string; origem: "diario" | "direto" | "padrao" } {
  if (!param) return { numVal: null, leituraFormatada: "-", origem: "padrao" };

  const hist = dadosBR?.historicoDiarioRebritagem;
  
  // 1. Se existe a tabela de histórico diário (Segunda a Domingo), ela é a fonte oficial de verdade
  if (hist && Array.isArray(hist) && hist.length > 0) {
    for (let i = hist.length - 1; i >= 0; i--) {
      const row = hist[i];
      if (row) {
        const valRaw = row[param.chave];
        const parsed = parseNumeroBritagem(valRaw);
        if (parsed !== null) {
          let str = `${param.decimais > 0 ? parsed.toFixed(param.decimais).replace(".", ",") : parsed} ${param.unidade}`;
          if (param.unidade === "%") str = `${param.decimais > 0 ? parsed.toFixed(param.decimais).replace(".", ",") : parsed}%`;
          return { numVal: parsed, leituraFormatada: str, origem: "diario" };
        }
      }
    }
    // Se a tabela diária existe mas não possui nenhum valor preenchido para este parâmetro, retorna vazio
    return { numVal: null, leituraFormatada: "", origem: "padrao" };
  }

  // 2. Se NÃO houver tabela diária configurada (legado isolado), verifica o campo direto em dadosBR
  let valDireto = dadosBR ? (dadosBR as any)[param.chave] : undefined;
  if ((valDireto === undefined || valDireto === "") && param.chave === "retidoMeiaPol") {
    valDireto = dadosBR?.retidoMeiaPol;
  } else if ((valDireto === undefined || valDireto === "") && param.chave === "produtividadeTph") {
    valDireto = dadosBR?.produtividadeRebritagem;
  }
  const parsedDireto = parseNumeroBritagem(valDireto);
  if (parsedDireto !== null) {
    let str = `${param.decimais > 0 ? parsedDireto.toFixed(param.decimais).replace(".", ",") : parsedDireto} ${param.unidade}`;
    if (param.unidade === "%") str = `${param.decimais > 0 ? parsedDireto.toFixed(param.decimais).replace(".", ",") : parsedDireto}%`;
    return { numVal: parsedDireto, leituraFormatada: str, origem: "direto" };
  }

  return { numVal: null, leituraFormatada: "", origem: "padrao" };
}

export function obterAcaoEstrategicaRebritagem(
  dadosBR?: Partial<DadosSetorBritagemRebritagem>,
  param?: ParametroConfigRebritagem
): string {
  if (!param) return "";

  const anotacoes = dadosBR?.anotacoesDesviosRebritagem;
  if (anotacoes && typeof anotacoes === "object") {
    const chavesRelevantes = Object.keys(anotacoes).filter(
      k => k === param.chave || k.startsWith(`${param.chave}_`)
    );

    const acoesPreenchidas: string[] = [];
    chavesRelevantes.forEach(k => {
      const txt = anotacoes[k]?.acaoRecomendada?.trim();
      if (txt && !acoesPreenchidas.includes(txt)) {
        acoesPreenchidas.push(txt);
      }
    });

    if (acoesPreenchidas.length > 0) {
      return acoesPreenchidas.join(" | ");
    }
  }

  return "";
}

export function detectarDesviosRebritagem(
  historico?: RegistroDiarioIndicadoresRebritagem[],
  anotacoes?: Record<string, AnotacaoDesvioOperacional>
): DesvioIndicadorRebritagemDetectado[] {
  const lista = historico && historico.length > 0 ? historico : DADOS_DIARIOS_REBRITAGEM_PADRAO;
  const desvios: DesvioIndicadorRebritagemDetectado[] = [];

  CONFIG_PARAMETROS_REBRITAGEM.forEach(param => {
    lista.forEach(item => {
      const v = item[param.chave];
      const val = parseNumeroBritagem(v);
      if (val !== null) {
        const keyDesvio = `${param.chave}_${item.dia}`;
        const anotacao = anotacoes?.[keyDesvio];
        const impactoUser = anotacao?.impactoPerda || "";
        const acaoUser = anotacao?.acaoRecomendada || "";

        if (val > param.maxIdeal) {
          desvios.push({
            chave: param.chave,
            parametro: param,
            diaLabel: item.diaLabel,
            dia: item.dia,
            valorLido: val,
            tipoDesvio: "alto",
            delta: +(val - param.maxIdeal).toFixed(2),
            impactoPerda: impactoUser,
            acaoCorretiva: acaoUser
          });
        } else if (val < param.minIdeal) {
          desvios.push({
            chave: param.chave,
            parametro: param,
            diaLabel: item.diaLabel,
            dia: item.dia,
            valorLido: val,
            tipoDesvio: "baixo",
            delta: +(param.minIdeal - val).toFixed(2),
            impactoPerda: impactoUser,
            acaoCorretiva: acaoUser
          });
        }
      }
    });
  });

  return desvios;
}

export interface EstatisticaCartaControleRebritagem {
  parametro: ParametroConfigRebritagem;
  media: number;
  desvioPadrao: number;
  minimo: number;
  maximo: number;
  lsc: number; // Limite Superior de Controle (Ideal Max)
  lic: number; // Limite Inferior de Controle (Ideal Min)
  lc: number; // Linha Central (Alvo)
  valoresPorDia: { dia: string; diaLabel: string; valor: number | null; status: "normal" | "alerta_alto" | "alerta_baixo" }[];
  pontosForaFaixa: number;
  estabilidade: "estavel" | "instavel_sob_alerta" | "critico";
}

export function calcularCartasControleRebritagem(
  historico?: RegistroDiarioIndicadoresRebritagem[]
): EstatisticaCartaControleRebritagem[] {
  const lista = historico && historico.length > 0 ? historico : DADOS_DIARIOS_REBRITAGEM_PADRAO;

  return CONFIG_PARAMETROS_REBRITAGEM.map(param => {
    const valoresValidos: number[] = [];
    const valoresPorDia = lista.map(item => {
      const v = item[param.chave];
      const valNum = parseNumeroBritagem(v);
      if (valNum !== null) valoresValidos.push(valNum);

      let status: "normal" | "alerta_alto" | "alerta_baixo" = "normal";
      if (valNum !== null) {
        if (valNum > param.maxIdeal) status = "alerta_alto";
        else if (valNum < param.minIdeal) status = "alerta_baixo";
      }

      return {
        dia: item.dia,
        diaLabel: item.diaLabel,
        valor: valNum,
        status
      };
    });

    const n = valoresValidos.length;
    const media = n > 0 ? valoresValidos.reduce((a, b) => a + b, 0) / n : param.alvo;
    const variancia = n > 1
      ? valoresValidos.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / (n - 1)
      : 0;
    const desvioPadrao = Math.sqrt(variancia);
    const minimo = n > 0 ? Math.min(...valoresValidos) : param.minIdeal;
    const maximo = n > 0 ? Math.max(...valoresValidos) : param.maxIdeal;
    const pontosFora = valoresPorDia.filter(p => p.status !== "normal").length;

    let estabilidade: "estavel" | "instavel_sob_alerta" | "critico" = "estavel";
    if (pontosFora >= 2) estabilidade = "critico";
    else if (pontosFora === 1) estabilidade = "instavel_sob_alerta";

    return {
      parametro: param,
      media: +media.toFixed(param.decimais),
      desvioPadrao: +desvioPadrao.toFixed(2),
      minimo: +minimo.toFixed(param.decimais),
      maximo: +maximo.toFixed(param.decimais),
      lsc: param.maxIdeal,
      lic: param.minIdeal,
      lc: param.alvo,
      valoresPorDia,
      pontosForaFaixa: pontosFora,
      estabilidade
    };
  });
}

// ==========================================
// 3.1 DADOS DIÁRIOS PADRÃO E HELPERS: MOAGEM (MI003, MI004, MI005)
// ==========================================

export const DADOS_DIARIOS_MOAGEM_PADRAO: RegistroDiarioIndicadoresMoagem[] = [
  {
    dia: "seg",
    diaLabel: "Segunda-feira",
    taxa_MI003: 205,
    taxa_MI004: 198,
    taxa_MI005: 202,
    potencia_MI003: 2921,
    potencia_MI004: 3263,
    potencia_MI005: 3100,
    solidosOverflow_MI003: 40.0,
    solidosOverflow_MI004: 43.0,
    solidosOverflow_MI005: 40.0,
    solidosDescarga_MI003: 79.0,
    solidosDescarga_MI004: 80.0,
    solidosDescarga_MI005: 78.0,
    reposicoes_MI003: 5.0,
    reposicoes_MI004: 5.0,
    reposicoes_MI005: 5.0,
    pressaoHidrociclone_MI003: 1.40,
    pressaoHidrociclone_MI004: 1.40,
    pressaoHidrociclone_MI005: 1.35,
    densidade_MI003: 1.68,
    densidade_MI004: 1.70,
    densidade_MI005: 1.68,
    pressaoPsi_MI003: 60.2,
    pressaoPsi_MI004: 60.0,
    pressaoPsi_MI005: 60.0,
    observacao: ""
  },
  {
    dia: "ter",
    diaLabel: "Terça-feira",
    taxa_MI003: 208,
    taxa_MI004: 200,
    taxa_MI005: 204,
    potencia_MI003: 2940,
    potencia_MI004: 3280,
    potencia_MI005: 3120,
    solidosOverflow_MI003: 39.5,
    solidosOverflow_MI004: 42.5,
    solidosOverflow_MI005: 39.8,
    solidosDescarga_MI003: 78.5,
    solidosDescarga_MI004: 79.5,
    solidosDescarga_MI005: 78.0,
    reposicoes_MI003: "",
    reposicoes_MI004: "",
    reposicoes_MI005: "",
    pressaoHidrociclone_MI003: 1.42,
    pressaoHidrociclone_MI004: 1.38,
    pressaoHidrociclone_MI005: 1.36,
    densidade_MI003: 1.67,
    densidade_MI004: 1.69,
    densidade_MI005: 1.68,
    pressaoPsi_MI003: 60.0,
    pressaoPsi_MI004: 59.8,
    pressaoPsi_MI005: 60.1,
    observacao: ""
  },
  {
    dia: "qua",
    diaLabel: "Quarta-feira",
    taxa_MI003: 202,
    taxa_MI004: 195,
    taxa_MI005: 200,
    potencia_MI003: 2910,
    potencia_MI004: 3250,
    potencia_MI005: 3090,
    solidosOverflow_MI003: 40.2,
    solidosOverflow_MI004: 43.1,
    solidosOverflow_MI005: 40.1,
    solidosDescarga_MI003: 79.2,
    solidosDescarga_MI004: 80.2,
    solidosDescarga_MI005: 78.2,
    reposicoes_MI003: 5.0,
    reposicoes_MI004: 5.0,
    reposicoes_MI005: 5.0,
    pressaoHidrociclone_MI003: 1.38,
    pressaoHidrociclone_MI004: 1.41,
    pressaoHidrociclone_MI005: 1.34,
    densidade_MI003: 1.68,
    densidade_MI004: 1.71,
    densidade_MI005: 1.67,
    pressaoPsi_MI003: 60.5,
    pressaoPsi_MI004: 60.2,
    pressaoPsi_MI005: 59.9,
    observacao: ""
  },
  {
    dia: "qui",
    diaLabel: "Quinta-feira",
    taxa_MI003: 210,
    taxa_MI004: 202,
    taxa_MI005: 205,
    potencia_MI003: 2950,
    potencia_MI004: 3290,
    potencia_MI005: 3140,
    solidosOverflow_MI003: 39.8,
    solidosOverflow_MI004: 42.8,
    solidosOverflow_MI005: 39.9,
    solidosDescarga_MI003: 78.8,
    solidosDescarga_MI004: 79.8,
    solidosDescarga_MI005: 78.1,
    reposicoes_MI003: "",
    reposicoes_MI004: "",
    reposicoes_MI005: "",
    pressaoHidrociclone_MI003: 1.45,
    pressaoHidrociclone_MI004: 1.42,
    pressaoHidrociclone_MI005: 1.38,
    densidade_MI003: 1.69,
    densidade_MI004: 1.70,
    densidade_MI005: 1.69,
    pressaoPsi_MI003: 61.0,
    pressaoPsi_MI004: 60.5,
    pressaoPsi_MI005: 60.4,
    observacao: ""
  },
  {
    dia: "sex",
    diaLabel: "Sexta-feira",
    taxa_MI003: 206,
    taxa_MI004: 199,
    taxa_MI005: 203,
    potencia_MI003: 2930,
    potencia_MI004: 3270,
    potencia_MI005: 3110,
    solidosOverflow_MI003: 40.1,
    solidosOverflow_MI004: 43.0,
    solidosOverflow_MI005: 40.2,
    solidosDescarga_MI003: 79.0,
    solidosDescarga_MI004: 80.0,
    solidosDescarga_MI005: 78.3,
    reposicoes_MI003: 5.0,
    reposicoes_MI004: 5.0,
    reposicoes_MI005: 5.0,
    pressaoHidrociclone_MI003: 1.40,
    pressaoHidrociclone_MI004: 1.39,
    pressaoHidrociclone_MI005: 1.35,
    densidade_MI003: 1.68,
    densidade_MI004: 1.70,
    densidade_MI005: 1.68,
    pressaoPsi_MI003: 60.2,
    pressaoPsi_MI004: 60.0,
    pressaoPsi_MI005: 60.0,
    observacao: ""
  },
  {
    dia: "sab",
    diaLabel: "Sábado",
    taxa_MI003: 204,
    taxa_MI004: 197,
    taxa_MI005: 201,
    potencia_MI003: 2920,
    potencia_MI004: 3260,
    potencia_MI005: 3100,
    solidosOverflow_MI003: 40.0,
    solidosOverflow_MI004: 42.9,
    solidosOverflow_MI005: 40.0,
    solidosDescarga_MI003: 79.1,
    solidosDescarga_MI004: 80.1,
    solidosDescarga_MI005: 78.0,
    reposicoes_MI003: "",
    reposicoes_MI004: "",
    reposicoes_MI005: "",
    pressaoHidrociclone_MI003: 1.39,
    pressaoHidrociclone_MI004: 1.40,
    pressaoHidrociclone_MI005: 1.36,
    densidade_MI003: 1.68,
    densidade_MI004: 1.70,
    densidade_MI005: 1.68,
    pressaoPsi_MI003: 60.1,
    pressaoPsi_MI004: 59.9,
    pressaoPsi_MI005: 60.0,
    observacao: ""
  },
  {
    dia: "dom",
    diaLabel: "Domingo",
    taxa_MI003: 205,
    taxa_MI004: 198,
    taxa_MI005: 202,
    potencia_MI003: 2925,
    potencia_MI004: 3265,
    potencia_MI005: 3105,
    solidosOverflow_MI003: 40.0,
    solidosOverflow_MI004: 43.0,
    solidosOverflow_MI005: 40.0,
    solidosDescarga_MI003: 79.0,
    solidosDescarga_MI004: 80.0,
    solidosDescarga_MI005: 78.0,
    reposicoes_MI003: 5.0,
    reposicoes_MI004: 5.0,
    reposicoes_MI005: 5.0,
    pressaoHidrociclone_MI003: 1.40,
    pressaoHidrociclone_MI004: 1.40,
    pressaoHidrociclone_MI005: 1.35,
    densidade_MI003: 1.68,
    densidade_MI004: 1.70,
    densidade_MI005: 1.68,
    pressaoPsi_MI003: 60.2,
    pressaoPsi_MI004: 60.0,
    pressaoPsi_MI005: 60.0,
    observacao: ""
  }
];

export interface DesvioIndicadorMoagemDetectado {
  chave: keyof Omit<RegistroDiarioIndicadoresMoagem, "dia" | "diaLabel" | "observacao">;
  parametro: ParametroConfigMoagem;
  diaLabel: string;
  dia: string;
  valorLido: number;
  tipoDesvio: "alto" | "baixo";
  delta: number;
  impactoPerda: string;
  acaoCorretiva: string;
}

export function detectarDesviosMoagem(
  historico?: RegistroDiarioIndicadoresMoagem[],
  anotacoes?: Record<string, AnotacaoDesvioOperacional>
): DesvioIndicadorMoagemDetectado[] {
  const lista = historico && historico.length > 0 ? historico : DADOS_DIARIOS_MOAGEM_PADRAO;
  const desvios: DesvioIndicadorMoagemDetectado[] = [];

  CONFIG_PARAMETROS_MOAGEM.forEach(param => {
    lista.forEach(item => {
      const v = item[param.chave];
      const val = parseNumeroBritagem(v);
      if (val !== null) {
        const keyDesvio = `${param.chave}_${item.dia}`;
        const anotacao = anotacoes?.[keyDesvio];
        const impactoUser = anotacao?.impactoPerda || "";
        const acaoUser = anotacao?.acaoRecomendada || "";

        if (val > param.maxIdeal) {
          desvios.push({
            chave: param.chave,
            parametro: param,
            diaLabel: item.diaLabel,
            dia: item.dia,
            valorLido: val,
            tipoDesvio: "alto",
            delta: +(val - param.maxIdeal).toFixed(2),
            impactoPerda: impactoUser,
            acaoCorretiva: acaoUser
          });
        } else if (val < param.minIdeal) {
          desvios.push({
            chave: param.chave,
            parametro: param,
            diaLabel: item.diaLabel,
            dia: item.dia,
            valorLido: val,
            tipoDesvio: "baixo",
            delta: +(param.minIdeal - val).toFixed(2),
            impactoPerda: impactoUser,
            acaoCorretiva: acaoUser
          });
        }
      }
    });
  });

  return desvios;
}

export interface DesvioIndicadorRemoagemDetectado {
  chave: string;
  parametro: ParametroConfigRemoagem;
  diaLabel: string;
  dia: string;
  valorLido: number;
  tipoDesvio: "alto" | "baixo";
  delta: number;
  impactoPerda: string;
  acaoCorretiva: string;
}

export function detectarDesviosRemoagem(
  historico?: RegistroDiarioIndicadoresRemoagem[],
  anotacoes?: Record<string, AnotacaoDesvioOperacional>
): DesvioIndicadorRemoagemDetectado[] {
  const lista = historico && historico.length > 0 ? historico : DADOS_DIARIOS_REMOAGEM_PADRAO;
  const desvios: DesvioIndicadorRemoagemDetectado[] = [];

  CONFIG_PARAMETROS_REMOAGEM.forEach(param => {
    lista.forEach(item => {
      const v = item[param.chave];
      const val = parseNumeroBritagem(v);
      if (val !== null) {
        const keyDesvio = `${param.chave}_${item.dia}`;
        const anotacao = anotacoes?.[keyDesvio];
        const impactoUser = anotacao?.impactoPerda || "";
        const acaoUser = anotacao?.acaoRecomendada || "";

        if (val > param.maxIdeal) {
          desvios.push({
            chave: param.chave,
            parametro: param,
            diaLabel: item.diaLabel,
            dia: item.dia,
            valorLido: val,
            tipoDesvio: "alto",
            delta: +(val - param.maxIdeal).toFixed(2),
            impactoPerda: impactoUser,
            acaoCorretiva: acaoUser
          });
        } else if (val < param.minIdeal) {
          desvios.push({
            chave: param.chave,
            parametro: param,
            diaLabel: item.diaLabel,
            dia: item.dia,
            valorLido: val,
            tipoDesvio: "baixo",
            delta: +(param.minIdeal - val).toFixed(2),
            impactoPerda: impactoUser,
            acaoCorretiva: acaoUser
          });
        }
      }
    });
  });

  return desvios;
}

export interface DesvioIndicadorFlotacaoDetectado {
  chave: string;
  parametro: ParametroConfigFlotacao;
  diaLabel: string;
  dia: string;
  valorLido: number;
  tipoDesvio: "alto" | "baixo";
  delta: number;
  impactoPerda: string;
  acaoCorretiva: string;
}

export function detectarDesviosFlotacao(
  historico?: RegistroDiarioIndicadoresFlotacao[],
  anotacoes?: Record<string, AnotacaoDesvioOperacional>
): DesvioIndicadorFlotacaoDetectado[] {
  const lista = historico && historico.length > 0 ? historico : DADOS_DIARIOS_FLOTACAO_PADRAO;
  const desvios: DesvioIndicadorFlotacaoDetectado[] = [];

  CONFIG_PARAMETROS_FLOTACAO.forEach(param => {
    lista.forEach(item => {
      const v = item[param.chave];
      const val = parseNumeroBritagem(v);
      if (val !== null) {
        const keyDesvio = `${param.chave}_${item.dia}`;
        const anotacao = anotacoes?.[keyDesvio];
        const impactoUser = anotacao?.impactoPerda || "";
        const acaoUser = anotacao?.acaoRecomendada || "";

        if (param.tipoLimite === "min") {
          if (val < param.minIdeal) {
            desvios.push({
              chave: param.chave,
              parametro: param,
              diaLabel: item.diaLabel,
              dia: item.dia,
              valorLido: val,
              tipoDesvio: "baixo",
              delta: +(param.minIdeal - val).toFixed(param.decimais || 2),
              impactoPerda: impactoUser,
              acaoCorretiva: acaoUser
            });
          }
        } else if (param.tipoLimite === "max") {
          if (val > param.maxIdeal) {
            desvios.push({
              chave: param.chave,
              parametro: param,
              diaLabel: item.diaLabel,
              dia: item.dia,
              valorLido: val,
              tipoDesvio: "alto",
              delta: +(val - param.maxIdeal).toFixed(param.decimais || 2),
              impactoPerda: impactoUser,
              acaoCorretiva: acaoUser
            });
          }
        } else {
          if (val > param.maxIdeal) {
            desvios.push({
              chave: param.chave,
              parametro: param,
              diaLabel: item.diaLabel,
              dia: item.dia,
              valorLido: val,
              tipoDesvio: "alto",
              delta: +(val - param.maxIdeal).toFixed(2),
              impactoPerda: impactoUser,
              acaoCorretiva: acaoUser
            });
          } else if (val < param.minIdeal) {
            desvios.push({
              chave: param.chave,
              parametro: param,
              diaLabel: item.diaLabel,
              dia: item.dia,
              valorLido: val,
              tipoDesvio: "baixo",
              delta: +(param.minIdeal - val).toFixed(2),
              impactoPerda: impactoUser,
              acaoCorretiva: acaoUser
            });
          }
        }
      }
    });
  });

  return desvios;
}

export interface DesvioIndicadorEspessamentoRejeitoDetectado {
  chave: keyof Omit<RegistroDiarioIndicadoresEspessamentoRejeito, "dia" | "diaLabel" | "observacao" | "espessadorRejOp">;
  parametro: ParametroConfigEspessamentoRejeito;
  diaLabel: string;
  dia: string;
  valorLido: number;
  tipoDesvio: "alto" | "baixo";
  delta: number;
  impactoPerda: string;
  acaoCorretiva: string;
}

export function detectarDesviosEspessamentoRejeito(
  historico?: RegistroDiarioIndicadoresEspessamentoRejeito[],
  anotacoes?: Record<string, AnotacaoDesvioOperacional>
): DesvioIndicadorEspessamentoRejeitoDetectado[] {
  const lista = historico && historico.length > 0 ? historico : DADOS_DIARIOS_ESPESSAMENTO_REJEITO_PADRAO;
  const desvios: DesvioIndicadorEspessamentoRejeitoDetectado[] = [];

  CONFIG_PARAMETROS_ESPESSAMENTO_REJEITO.forEach(param => {
    lista.forEach(item => {
      const v = item[param.chave];
      const val = parseNumeroBritagem(v);
      if (val !== null) {
        const keyDesvio = `${param.chave}_${item.dia}`;
        const anotacao = anotacoes?.[keyDesvio];
        const impactoUser = anotacao?.impactoPerda || "";
        const acaoUser = anotacao?.acaoRecomendada || "";

        if (param.tipoLimite === "min") {
          if (val < param.minIdeal) {
            desvios.push({
              chave: param.chave,
              parametro: param,
              diaLabel: item.diaLabel,
              dia: item.dia,
              valorLido: val,
              tipoDesvio: "baixo",
              delta: +(param.minIdeal - val).toFixed(param.decimais || 2),
              impactoPerda: impactoUser,
              acaoCorretiva: acaoUser
            });
          }
        } else if (param.tipoLimite === "max") {
          if (val > param.maxIdeal) {
            desvios.push({
              chave: param.chave,
              parametro: param,
              diaLabel: item.diaLabel,
              dia: item.dia,
              valorLido: val,
              tipoDesvio: "alto",
              delta: +(val - param.maxIdeal).toFixed(param.decimais || 2),
              impactoPerda: impactoUser,
              acaoCorretiva: acaoUser
            });
          }
        } else {
          if (val > param.maxIdeal) {
            desvios.push({
              chave: param.chave,
              parametro: param,
              diaLabel: item.diaLabel,
              dia: item.dia,
              valorLido: val,
              tipoDesvio: "alto",
              delta: +(val - param.maxIdeal).toFixed(param.decimais || 2),
              impactoPerda: impactoUser,
              acaoCorretiva: acaoUser
            });
          } else if (val < param.minIdeal) {
            desvios.push({
              chave: param.chave,
              parametro: param,
              diaLabel: item.diaLabel,
              dia: item.dia,
              valorLido: val,
              tipoDesvio: "baixo",
              delta: +(param.minIdeal - val).toFixed(param.decimais || 2),
              impactoPerda: impactoUser,
              acaoCorretiva: acaoUser
            });
          }
        }
      }
    });
  });

  return desvios;
}

export interface DesvioIndicadorEspessamentoConcentradoDetectado {
  chave: string;
  parametro: ParametroConfigEspessamentoConcentrado;
  diaLabel: string;
  dia: string;
  valorLido: number;
  tipoDesvio: "alto" | "baixo";
  delta: number;
  impactoPerda: string;
  acaoCorretiva: string;
}

export function detectarDesviosEspessamentoConcentrado(
  historico?: RegistroDiarioIndicadoresEspessamentoConcentrado[],
  anotacoes?: Record<string, AnotacaoDesvioOperacional>
): DesvioIndicadorEspessamentoConcentradoDetectado[] {
  const lista = historico && historico.length > 0 ? historico : DADOS_DIARIOS_ESPESSAMENTO_CONCENTRADO_PADRAO;
  const desvios: DesvioIndicadorEspessamentoConcentradoDetectado[] = [];

  CONFIG_PARAMETROS_ESPESSAMENTO_CONCENTRADO.forEach(param => {
    lista.forEach(item => {
      const v = item[param.chave];
      const val = parseNumeroBritagem(v);
      if (val !== null) {
        const keyDesvio = `${param.chave}_${item.dia}`;
        const anotacao = anotacoes?.[keyDesvio];
        const impactoUser = anotacao?.impactoPerda || "";
        const acaoUser = anotacao?.acaoRecomendada || "";

        if (param.tipoLimite === "min") {
          if (val < param.minIdeal) {
            desvios.push({
              chave: param.chave,
              parametro: param,
              diaLabel: item.diaLabel,
              dia: item.dia,
              valorLido: val,
              tipoDesvio: "baixo",
              delta: +(param.minIdeal - val).toFixed(param.decimais || 2),
              impactoPerda: impactoUser,
              acaoCorretiva: acaoUser
            });
          }
        } else if (param.tipoLimite === "max") {
          if (val > param.maxIdeal) {
            desvios.push({
              chave: param.chave,
              parametro: param,
              diaLabel: item.diaLabel,
              dia: item.dia,
              valorLido: val,
              tipoDesvio: "alto",
              delta: +(val - param.maxIdeal).toFixed(param.decimais || 2),
              impactoPerda: impactoUser,
              acaoCorretiva: acaoUser
            });
          }
        } else {
          if (val > param.maxIdeal) {
            desvios.push({
              chave: param.chave,
              parametro: param,
              diaLabel: item.diaLabel,
              dia: item.dia,
              valorLido: val,
              tipoDesvio: "alto",
              delta: +(val - param.maxIdeal).toFixed(param.decimais || 2),
              impactoPerda: impactoUser,
              acaoCorretiva: acaoUser
            });
          } else if (val < param.minIdeal) {
            desvios.push({
              chave: param.chave,
              parametro: param,
              diaLabel: item.diaLabel,
              dia: item.dia,
              valorLido: val,
              tipoDesvio: "baixo",
              delta: +(param.minIdeal - val).toFixed(param.decimais || 2),
              impactoPerda: impactoUser,
              acaoCorretiva: acaoUser
            });
          }
        }
      }
    });
  });

  return desvios;
}

export interface DesvioIndicadorFiltragemConcentradoDetectado {
  chave: ChaveParametroFiltragemConcentrado;
  parametro: ParametroConfigFiltragemConcentrado;
  diaLabel: string;
  dia: string;
  valorLido: number;
  tipoDesvio: "alto" | "baixo";
  delta: number;
  impactoPerda: string;
  acaoCorretiva: string;
}

export function detectarDesviosFiltragemConcentrado(
  historico?: RegistroDiarioIndicadoresFiltragemConcentrado[],
  anotacoes?: Record<string, AnotacaoDesvioOperacional>
): DesvioIndicadorFiltragemConcentradoDetectado[] {
  const lista = historico && historico.length > 0 ? historico : DADOS_DIARIOS_FILTRAGEM_CONCENTRADO_PADRAO;
  const desvios: DesvioIndicadorFiltragemConcentradoDetectado[] = [];

  CONFIG_PARAMETROS_FILTRAGEM_CONCENTRADO.forEach(param => {
    lista.forEach(item => {
      const v = item[param.chave];
      const val = parseNumeroBritagem(v);
      if (val !== null) {
        const keyDesvio = `${param.chave}_${item.dia}`;
        const anotacao = anotacoes?.[keyDesvio];
        const impactoUser = anotacao?.impactoPerda || "";
        const acaoUser = anotacao?.acaoRecomendada || "";

        if (param.tipoLimite === "min") {
          if (val < param.minIdeal) {
            desvios.push({
              chave: param.chave,
              parametro: param,
              diaLabel: item.diaLabel,
              dia: item.dia,
              valorLido: val,
              tipoDesvio: "baixo",
              delta: +(param.minIdeal - val).toFixed(param.decimais || 2),
              impactoPerda: impactoUser,
              acaoCorretiva: acaoUser
            });
          }
        } else if (param.tipoLimite === "max") {
          if (val > param.maxIdeal) {
            desvios.push({
              chave: param.chave,
              parametro: param,
              diaLabel: item.diaLabel,
              dia: item.dia,
              valorLido: val,
              tipoDesvio: "alto",
              delta: +(val - param.maxIdeal).toFixed(param.decimais || 2),
              impactoPerda: impactoUser,
              acaoCorretiva: acaoUser
            });
          }
        } else {
          if (val > param.maxIdeal) {
            desvios.push({
              chave: param.chave,
              parametro: param,
              diaLabel: item.diaLabel,
              dia: item.dia,
              valorLido: val,
              tipoDesvio: "alto",
              delta: +(val - param.maxIdeal).toFixed(param.decimais || 2),
              impactoPerda: impactoUser,
              acaoCorretiva: acaoUser
            });
          } else if (val < param.minIdeal) {
            desvios.push({
              chave: param.chave,
              parametro: param,
              diaLabel: item.diaLabel,
              dia: item.dia,
              valorLido: val,
              tipoDesvio: "baixo",
              delta: +(param.minIdeal - val).toFixed(param.decimais || 2),
              impactoPerda: impactoUser,
              acaoCorretiva: acaoUser
            });
          }
        }
      }
    });
  });

  return desvios;
}

export interface DesvioIndicadorUtilidadesETADetectado {
  chave: keyof Omit<RegistroDiarioIndicadoresUtilidadesETA, "dia" | "diaLabel" | "compressoresOp" | "bombasAguaOp" | "observacao">;
  parametro: ParametroConfigUtilidadesETA;
  diaLabel: string;
  dia: string;
  valorLido: number;
  tipoDesvio: "alto" | "baixo";
  delta: number;
  impactoPerda: string;
  acaoCorretiva: string;
}

export function detectarDesviosUtilidadesETA(
  historico?: RegistroDiarioIndicadoresUtilidadesETA[],
  anotacoes?: Record<string, AnotacaoDesvioOperacional>
): DesvioIndicadorUtilidadesETADetectado[] {
  const lista = historico && historico.length > 0 ? historico : DADOS_DIARIOS_UTILIDADES_ETA_PADRAO;
  const desvios: DesvioIndicadorUtilidadesETADetectado[] = [];

  CONFIG_PARAMETROS_UTILIDADES_ETA.forEach(param => {
    lista.forEach(item => {
      const v = item[param.chave];
      const val = parseNumeroBritagem(v);
      if (val !== null) {
        const keyDesvio = `${param.chave}_${item.dia}`;
        const anotacao = anotacoes?.[keyDesvio];
        const impactoUser = anotacao?.impactoPerda || "";
        const acaoUser = anotacao?.acaoRecomendada || "";

        if (param.tipoLimite === "min") {
          if (val < param.minIdeal) {
            desvios.push({
              chave: param.chave,
              parametro: param,
              diaLabel: item.diaLabel,
              dia: item.dia,
              valorLido: val,
              tipoDesvio: "baixo",
              delta: +(param.minIdeal - val).toFixed(param.decimais || 2),
              impactoPerda: impactoUser,
              acaoCorretiva: acaoUser
            });
          }
        } else if (param.tipoLimite === "max") {
          if (val > param.maxIdeal) {
            desvios.push({
              chave: param.chave,
              parametro: param,
              diaLabel: item.diaLabel,
              dia: item.dia,
              valorLido: val,
              tipoDesvio: "alto",
              delta: +(val - param.maxIdeal).toFixed(param.decimais || 2),
              impactoPerda: impactoUser,
              acaoCorretiva: acaoUser
            });
          }
        } else {
          if (val > param.maxIdeal) {
            desvios.push({
              chave: param.chave,
              parametro: param,
              diaLabel: item.diaLabel,
              dia: item.dia,
              valorLido: val,
              tipoDesvio: "alto",
              delta: +(val - param.maxIdeal).toFixed(param.decimais || 2),
              impactoPerda: impactoUser,
              acaoCorretiva: acaoUser
            });
          } else if (val < param.minIdeal) {
            desvios.push({
              chave: param.chave,
              parametro: param,
              diaLabel: item.diaLabel,
              dia: item.dia,
              valorLido: val,
              tipoDesvio: "baixo",
              delta: +(param.minIdeal - val).toFixed(param.decimais || 2),
              impactoPerda: impactoUser,
              acaoCorretiva: acaoUser
            });
          }
        }
      }
    });
  });

  return desvios;
}

export interface EstatisticaCartaControleMoagem {
  parametro: ParametroConfigMoagem;
  media: number;
  desvioPadrao: number;
  minimo: number;
  maximo: number;
  lsc: number;
  lic: number;
  lc: number;
  valoresPorDia: { dia: string; diaLabel: string; valor: number | null; status: "normal" | "alerta_alto" | "alerta_baixo" }[];
  pontosForaFaixa: number;
  estabilidade: "estavel" | "instavel_sob_alerta" | "critico";
}

export function calcularCartasControleMoagem(
  historico?: RegistroDiarioIndicadoresMoagem[]
): EstatisticaCartaControleMoagem[] {
  const lista = historico && historico.length > 0 ? historico : DADOS_DIARIOS_MOAGEM_PADRAO;

  return CONFIG_PARAMETROS_MOAGEM.map(param => {
    const valoresValidos: number[] = [];
    const valoresPorDia = lista.map(item => {
      const v = item[param.chave];
      const valNum = parseNumeroBritagem(v);
      if (valNum !== null) valoresValidos.push(valNum);

      let status: "normal" | "alerta_alto" | "alerta_baixo" = "normal";
      if (valNum !== null) {
        if (valNum > param.maxIdeal) status = "alerta_alto";
        else if (valNum < param.minIdeal) status = "alerta_baixo";
      }

      return {
        dia: item.dia,
        diaLabel: item.diaLabel,
        valor: valNum,
        status
      };
    });

    const n = valoresValidos.length;
    const media = n > 0 ? valoresValidos.reduce((a, b) => a + b, 0) / n : param.alvo;
    const variancia = n > 1
      ? valoresValidos.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / (n - 1)
      : 0;
    const desvioPadrao = Math.sqrt(variancia);
    const minimo = n > 0 ? Math.min(...valoresValidos) : param.minIdeal;
    const maximo = n > 0 ? Math.max(...valoresValidos) : param.maxIdeal;
    const pontosFora = valoresPorDia.filter(p => p.status !== "normal").length;

    let estabilidade: "estavel" | "instavel_sob_alerta" | "critico" = "estavel";
    if (pontosFora >= 2) estabilidade = "critico";
    else if (pontosFora === 1) estabilidade = "instavel_sob_alerta";

    return {
      parametro: param,
      media: +media.toFixed(param.decimais),
      desvioPadrao: +desvioPadrao.toFixed(2),
      minimo: +minimo.toFixed(param.decimais),
      maximo: +maximo.toFixed(param.decimais),
      lsc: param.maxIdeal,
      lic: param.minIdeal,
      lc: param.alvo,
      valoresPorDia,
      pontosForaFaixa: pontosFora,
      estabilidade
    };
  });
}

export function obterLeituraAtualMoagem(
  dadosCE?: Partial<DadosSetorConcentradorEta>,
  param?: ParametroConfigMoagem
): { numVal: number | null; leituraFormatada: string; origem: "diario" | "direto" | "padrao" } {
  if (!param) return { numVal: null, leituraFormatada: "-", origem: "padrao" };

  const hist = dadosCE?.historicoDiarioMoagem;
  if (hist && Array.isArray(hist) && hist.length > 0) {
    for (let i = hist.length - 1; i >= 0; i--) {
      const row = hist[i];
      if (row) {
        const valRaw = row[param.chave];
        const parsed = parseNumeroBritagem(valRaw);
        if (parsed !== null) {
          let str = `${param.decimais > 0 ? parsed.toFixed(param.decimais).replace(".", ",") : parsed} ${param.unidade}`;
          if (param.unidade === "%") str = `${param.decimais > 0 ? parsed.toFixed(param.decimais).replace(".", ",") : parsed}%`;
          return { numVal: parsed, leituraFormatada: str, origem: "diario" };
        }
      }
    }
    return { numVal: null, leituraFormatada: "", origem: "padrao" };
  }

  return { numVal: null, leituraFormatada: "", origem: "padrao" };
}

export function obterAcaoEstrategicaMoagem(
  dadosCE?: Partial<DadosSetorConcentradorEta>,
  param?: ParametroConfigMoagem
): string {
  if (!param) return "";

  const anotacoes = dadosCE?.anotacoesDesviosMoagem;
  if (anotacoes && typeof anotacoes === "object") {
    const chavesRelevantes = Object.keys(anotacoes).filter(
      k => k === param.chave || k.startsWith(`${param.chave}_`)
    );

    const acoesPreenchidas: string[] = [];
    chavesRelevantes.forEach(k => {
      const txt = anotacoes[k]?.acaoRecomendada?.trim();
      if (txt && !acoesPreenchidas.includes(txt)) {
        acoesPreenchidas.push(txt);
      }
    });

    if (acoesPreenchidas.length > 0) {
      return acoesPreenchidas.join(" | ");
    }
  }

  return "";
}

export function obterLeituraAtualRemoagem(
  dadosCE?: Partial<DadosSetorConcentradorEta>,
  param?: ParametroConfigRemoagem
): { numVal: number | null; leituraFormatada: string; origem: "diario" | "direto" | "padrao" } {
  if (!param) return { numVal: null, leituraFormatada: "-", origem: "padrao" };

  const hist = dadosCE?.historicoDiarioRemoagem;
  if (hist && Array.isArray(hist) && hist.length > 0) {
    for (let i = hist.length - 1; i >= 0; i--) {
      const row = hist[i];
      if (row) {
        const valRaw = (row as any)[param.chave];
        const parsed = parseNumeroBritagem(valRaw);
        if (parsed !== null) {
          let str = `${param.decimais > 0 ? parsed.toFixed(param.decimais).replace(".", ",") : parsed} ${param.unidade}`;
          if (param.unidade === "%") str = `${param.decimais > 0 ? parsed.toFixed(param.decimais).replace(".", ",") : parsed}%`;
          return { numVal: parsed, leituraFormatada: str, origem: "diario" };
        }
      }
    }
    return { numVal: null, leituraFormatada: "", origem: "padrao" };
  }

  return { numVal: null, leituraFormatada: "", origem: "padrao" };
}

export function obterAcaoEstrategicaRemoagem(
  dadosCE?: Partial<DadosSetorConcentradorEta>,
  param?: ParametroConfigRemoagem
): string {
  if (!param) return "";

  const anotacoes = dadosCE?.anotacoesDesviosRemoagem;
  if (anotacoes && typeof anotacoes === "object") {
    const chavesRelevantes = Object.keys(anotacoes).filter(
      k => k === param.chave || k.startsWith(`${param.chave}_`)
    );

    const acoesPreenchidas: string[] = [];
    chavesRelevantes.forEach(k => {
      const txt = anotacoes[k]?.acaoRecomendada?.trim();
      if (txt && !acoesPreenchidas.includes(txt)) {
        acoesPreenchidas.push(txt);
      }
    });

    if (acoesPreenchidas.length > 0) {
      return acoesPreenchidas.join(" | ");
    }
  }

  return "";
}

export function obterLeituraAtualFlotacao(
  dadosCE?: Partial<DadosSetorConcentradorEta>,
  param?: ParametroConfigFlotacao
): { numVal: number | null; leituraFormatada: string; origem: "diario" | "direto" | "padrao" } {
  if (!param) return { numVal: null, leituraFormatada: "-", origem: "padrao" };

  const hist = dadosCE?.historicoDiarioFlotacao;
  if (hist && Array.isArray(hist) && hist.length > 0) {
    for (let i = hist.length - 1; i >= 0; i--) {
      const row = hist[i];
      if (row) {
        const valRaw = (row as any)[param.chave];
        const parsed = parseNumeroBritagem(valRaw);
        if (parsed !== null) {
          let str = `${param.decimais > 0 ? parsed.toFixed(param.decimais).replace(".", ",") : parsed} ${param.unidade}`;
          if (param.unidade === "%") str = `${param.decimais > 0 ? parsed.toFixed(param.decimais).replace(".", ",") : parsed}%`;
          return { numVal: parsed, leituraFormatada: str, origem: "diario" };
        }
      }
    }
  }

  // Fallback direto aos KPIs se histórico diário não preenchido
  if (param.chave === "teorCf" && dadosCE?.teorConcentradoCu !== undefined && dadosCE?.teorConcentradoCu !== "") {
    const parsed = parseNumeroBritagem(dadosCE.teorConcentradoCu);
    if (parsed !== null) {
      return { numVal: parsed, leituraFormatada: `${parsed.toFixed(param.decimais).replace(".", ",")}%`, origem: "direto" };
    }
  }
  if (param.chave === "teorRf" && dadosCE?.teorRejeitoCu !== undefined && dadosCE?.teorRejeitoCu !== "") {
    const parsed = parseNumeroBritagem(dadosCE.teorRejeitoCu);
    if (parsed !== null) {
      return { numVal: parsed, leituraFormatada: `${parsed.toFixed(param.decimais).replace(".", ",")}%`, origem: "direto" };
    }
  }

  return { numVal: null, leituraFormatada: "", origem: "padrao" };
}

export function obterAcaoEstrategicaFlotacao(
  dadosCE?: Partial<DadosSetorConcentradorEta>,
  param?: ParametroConfigFlotacao
): string {
  if (!param) return "";

  const anotacoes = dadosCE?.anotacoesDesviosFlotacao;
  if (anotacoes && typeof anotacoes === "object") {
    const chavesRelevantes = Object.keys(anotacoes).filter(
      k => k === param.chave || k.startsWith(`${param.chave}_`)
    );

    const acoesPreenchidas: string[] = [];
    chavesRelevantes.forEach(k => {
      const txt = anotacoes[k]?.acaoRecomendada?.trim();
      if (txt && !acoesPreenchidas.includes(txt)) {
        acoesPreenchidas.push(txt);
      }
    });

    if (acoesPreenchidas.length > 0) {
      return acoesPreenchidas.join(" | ");
    }
  }

  return "";
}

export function obterLeituraAtualEspessamentoRejeito(
  dadosCE?: Partial<DadosSetorConcentradorEta>,
  param?: ParametroConfigEspessamentoRejeito
): { numVal: number | null; leituraFormatada: string; origem: "diario" | "direto" | "padrao" } {
  if (!param) return { numVal: null, leituraFormatada: "-", origem: "padrao" };

  const hist = dadosCE?.historicoDiarioEspessamentoRejeito;
  if (hist && Array.isArray(hist) && hist.length > 0) {
    for (let i = hist.length - 1; i >= 0; i--) {
      const row = hist[i];
      if (row) {
        const valRaw = (row as any)[param.chave];
        const parsed = parseNumeroBritagem(valRaw);
        if (parsed !== null) {
          let str = `${param.decimais > 0 ? parsed.toFixed(param.decimais).replace(".", ",") : parsed} ${param.unidade}`;
          if (param.unidade === "%") str = `${param.decimais > 0 ? parsed.toFixed(param.decimais).replace(".", ",") : parsed}%`;
          return { numVal: parsed, leituraFormatada: str, origem: "diario" };
        }
      }
    }
  }

  // Fallbacks diretos
  if (param.chave === "densidadeUnderflowRej" && dadosCE?.densidadeUnderflowRej !== undefined && dadosCE?.densidadeUnderflowRej !== "") {
    const parsed = parseNumeroBritagem(dadosCE.densidadeUnderflowRej);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed} g/L`, origem: "direto" };
  }
  if (param.chave === "torqueRejEp001" && dadosCE?.torqueRejEp001 !== undefined && dadosCE?.torqueRejEp001 !== "") {
    const parsed = parseNumeroBritagem(dadosCE.torqueRejEp001);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed.toFixed(param.decimais).replace(".", ",")}%`, origem: "direto" };
  }
  if (param.chave === "torqueRejEp002" && dadosCE?.torqueRejEp002 !== undefined && dadosCE?.torqueRejEp002 !== "") {
    const parsed = parseNumeroBritagem(dadosCE.torqueRejEp002);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed.toFixed(param.decimais).replace(".", ",")}%`, origem: "direto" };
  }
  if (param.chave === "solidosRej45ep001" && dadosCE?.solidosRej45ep001 !== undefined && dadosCE?.solidosRej45ep001 !== "") {
    const parsed = parseNumeroBritagem(dadosCE.solidosRej45ep001);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed.toFixed(param.decimais).replace(".", ",")}%`, origem: "direto" };
  }
  if (param.chave === "solidosRej45ep002" && dadosCE?.solidosRej45ep002 !== undefined && dadosCE?.solidosRej45ep002 !== "") {
    const parsed = parseNumeroBritagem(dadosCE.solidosRej45ep002);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed.toFixed(param.decimais).replace(".", ",")}%`, origem: "direto" };
  }
  if (param.chave === "consumoFloculanteRej" && dadosCE?.consumoFloculanteRej !== undefined && dadosCE?.consumoFloculanteRej !== "") {
    const parsed = parseNumeroBritagem(dadosCE.consumoFloculanteRej);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed} g/t`, origem: "direto" };
  }

  return { numVal: null, leituraFormatada: "", origem: "padrao" };
}

export function obterAcaoEstrategicaEspessamentoRejeito(
  dadosCE?: Partial<DadosSetorConcentradorEta>,
  param?: ParametroConfigEspessamentoRejeito
): string {
  if (!param) return "";

  const anotacoes = dadosCE?.anotacoesDesviosEspessamentoRejeito;
  if (anotacoes && typeof anotacoes === "object") {
    const chavesRelevantes = Object.keys(anotacoes).filter(
      k => k === param.chave || k.startsWith(`${param.chave}_`)
    );

    const acoesPreenchidas: string[] = [];
    chavesRelevantes.forEach(k => {
      const txt = anotacoes[k]?.acaoRecomendada?.trim();
      if (txt && !acoesPreenchidas.includes(txt)) {
        acoesPreenchidas.push(txt);
      }
    });

    if (acoesPreenchidas.length > 0) {
      return acoesPreenchidas.join(" | ");
    }
  }

  return "";
}

export function obterLeituraAtualEspessamentoConcentrado(
  dadosCE?: Partial<DadosSetorConcentradorEta>,
  param?: ParametroConfigEspessamentoConcentrado
): { numVal: number | null; leituraFormatada: string; origem: "diario" | "direto" | "padrao" } {
  if (!param) return { numVal: null, leituraFormatada: "-", origem: "padrao" };

  const hist = dadosCE?.historicoDiarioEspessamentoConcentrado;
  if (hist && Array.isArray(hist) && hist.length > 0) {
    for (let i = hist.length - 1; i >= 0; i--) {
      const row = hist[i];
      if (row) {
        const valRaw = (row as any)[param.chave];
        const parsed = parseNumeroBritagem(valRaw);
        if (parsed !== null) {
          let str = `${param.decimais > 0 ? parsed.toFixed(param.decimais).replace(".", ",") : parsed} ${param.unidade}`;
          if (param.unidade === "%") str = `${param.decimais > 0 ? parsed.toFixed(param.decimais).replace(".", ",") : parsed}%`;
          return { numVal: parsed, leituraFormatada: str, origem: "diario" };
        }
      }
    }
  }

  // Fallbacks diretos
  if (param.chave === "densidadeUnderflowConc" && dadosCE?.densidadeUnderflowConc !== undefined && dadosCE?.densidadeUnderflowConc !== "") {
    const parsed = parseNumeroBritagem(dadosCE.densidadeUnderflowConc);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed} g/L`, origem: "direto" };
  }
  if (param.chave === "solidosConc44ep001" && dadosCE?.solidosConc44ep001 !== undefined && dadosCE?.solidosConc44ep001 !== "") {
    const parsed = parseNumeroBritagem(dadosCE.solidosConc44ep001);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed.toFixed(param.decimais).replace(".", ",")}%`, origem: "direto" };
  }
  if (param.chave === "solidosConc44ep002" && dadosCE?.solidosConc44ep002 !== undefined && dadosCE?.solidosConc44ep002 !== "") {
    const parsed = parseNumeroBritagem(dadosCE.solidosConc44ep002);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed.toFixed(param.decimais).replace(".", ",")}%`, origem: "direto" };
  }
  if (param.chave === "nivelTanqueConc" && dadosCE?.nivelTanqueConc !== undefined && dadosCE?.nivelTanqueConc !== "") {
    const parsed = parseNumeroBritagem(dadosCE.nivelTanqueConc);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed.toFixed(param.decimais).replace(".", ",")}%`, origem: "direto" };
  }
  if (param.chave === "consumoFloculanteConc" && dadosCE?.consumoFloculanteConc !== undefined && dadosCE?.consumoFloculanteConc !== "") {
    const parsed = parseNumeroBritagem(dadosCE.consumoFloculanteConc);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed} mL/min`, origem: "direto" };
  }
  if (param.chave === "elevacaoRakeConcEp001" && dadosCE?.elevacaoRakeConcEp001 !== undefined && dadosCE?.elevacaoRakeConcEp001 !== "") {
    const parsed = parseNumeroBritagem(dadosCE.elevacaoRakeConcEp001);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed.toFixed(param.decimais).replace(".", ",")} Pol`, origem: "direto" };
  }
  if (param.chave === "elevacaoRakeConcEp002" && dadosCE?.elevacaoRakeConcEp002 !== undefined && dadosCE?.elevacaoRakeConcEp002 !== "") {
    const parsed = parseNumeroBritagem(dadosCE.elevacaoRakeConcEp002);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed.toFixed(param.decimais).replace(".", ",")} Pol`, origem: "direto" };
  }
  if (param.chave === "torqueConcEp001" && dadosCE?.torqueConcEp001 !== undefined && dadosCE?.torqueConcEp001 !== "") {
    const parsed = parseNumeroBritagem(dadosCE.torqueConcEp001);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed.toFixed(param.decimais).replace(".", ",")}%`, origem: "direto" };
  }
  if (param.chave === "torqueConcEp002" && dadosCE?.torqueConcEp002 !== undefined && dadosCE?.torqueConcEp002 !== "") {
    const parsed = parseNumeroBritagem(dadosCE.torqueConcEp002);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed.toFixed(param.decimais).replace(".", ",")}%`, origem: "direto" };
  }

  return { numVal: null, leituraFormatada: "", origem: "padrao" };
}

export function obterAcaoEstrategicaEspessamentoConcentrado(
  dadosCE?: Partial<DadosSetorConcentradorEta>,
  param?: ParametroConfigEspessamentoConcentrado
): string {
  if (!param) return "";

  const anotacoes = dadosCE?.anotacoesDesviosEspessamentoConcentrado;
  if (anotacoes && typeof anotacoes === "object") {
    const chavesRelevantes = Object.keys(anotacoes).filter(
      k => k === param.chave || k.startsWith(`${param.chave}_`)
    );

    const acoesPreenchidas: string[] = [];
    chavesRelevantes.forEach(k => {
      const txt = anotacoes[k]?.acaoRecomendada?.trim();
      if (txt && !acoesPreenchidas.includes(txt)) {
        acoesPreenchidas.push(txt);
      }
    });

    if (acoesPreenchidas.length > 0) {
      return acoesPreenchidas.join(" | ");
    }
  }

  return "";
}

export function obterLeituraAtualFiltragemConcentrado(
  dadosCE?: Partial<DadosSetorConcentradorEta>,
  param?: ParametroConfigFiltragemConcentrado
): { numVal: number | null; leituraFormatada: string; origem: "diario" | "direto" | "padrao" } {
  if (!param) return { numVal: null, leituraFormatada: "-", origem: "padrao" };

  const hist = dadosCE?.historicoDiarioFiltragemConcentrado;
  if (hist && Array.isArray(hist) && hist.length > 0) {
    for (let i = hist.length - 1; i >= 0; i--) {
      const row = hist[i];
      if (row) {
        const valRaw = (row as any)[param.chave];
        const parsed = parseNumeroBritagem(valRaw);
        if (parsed !== null) {
          let str = `${param.decimais > 0 ? parsed.toFixed(param.decimais).replace(".", ",") : parsed} ${param.unidade}`;
          if (param.unidade === "%") str = `${param.decimais > 0 ? parsed.toFixed(param.decimais).replace(".", ",") : parsed}%`;
          return { numVal: parsed, leituraFormatada: str, origem: "diario" };
        }
      }
    }
  }

  // Fallbacks diretos
  if (param.chave === "producaoFiltragem" && dadosCE?.producaoFiltragem !== undefined && dadosCE?.producaoFiltragem !== "") {
    const parsed = parseNumeroBritagem(dadosCE.producaoFiltragem);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed} t`, origem: "direto" };
  }
  if (param.chave === "produtividadeFiltro" && dadosCE?.produtividadeFiltro !== undefined && dadosCE?.produtividadeFiltro !== "") {
    const parsed = parseNumeroBritagem(dadosCE.produtividadeFiltro);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed.toFixed(param.decimais).replace(".", ",")} t/h`, origem: "direto" };
  }
  if (param.chave === "umidadeBolo" && dadosCE?.umidadeBolo !== undefined && dadosCE?.umidadeBolo !== "") {
    const parsed = parseNumeroBritagem(dadosCE.umidadeBolo);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed.toFixed(param.decimais).replace(".", ",")}%`, origem: "direto" };
  }
  if (param.chave === "ciclosFiltro" && dadosCE?.ciclosFiltro !== undefined && dadosCE?.ciclosFiltro !== "") {
    const parsed = parseNumeroBritagem(dadosCE.ciclosFiltro);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed} ciclos`, origem: "direto" };
  }
  if (param.chave === "pressaoCompactacao" && dadosCE?.pressaoCompactacao !== undefined && dadosCE?.pressaoCompactacao !== "") {
    const parsed = parseNumeroBritagem(dadosCE.pressaoCompactacao);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed} kPa`, origem: "direto" };
  }
  if (param.chave === "paradasManutencaoFiltro" && dadosCE?.paradasManutencaoFiltro !== undefined && dadosCE?.paradasManutencaoFiltro !== "") {
    const parsed = parseNumeroBritagem(dadosCE.paradasManutencaoFiltro);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed.toFixed(param.decimais).replace(".", ",")} h`, origem: "direto" };
  }
  if (param.chave === "paradasOutrosFiltro" && dadosCE?.paradasOutrosFiltro !== undefined && dadosCE?.paradasOutrosFiltro !== "") {
    const parsed = parseNumeroBritagem(dadosCE.paradasOutrosFiltro);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed.toFixed(param.decimais).replace(".", ",")} h`, origem: "direto" };
  }

  return { numVal: null, leituraFormatada: "", origem: "padrao" };
}

export function obterAcaoEstrategicaFiltragemConcentrado(
  dadosCE?: Partial<DadosSetorConcentradorEta>,
  param?: ParametroConfigFiltragemConcentrado
): string {
  if (!param) return "";

  const anotacoes = dadosCE?.anotacoesDesviosFiltragemConcentrado;
  if (anotacoes && typeof anotacoes === "object") {
    const chavesRelevantes = Object.keys(anotacoes).filter(
      k => k === param.chave || k.startsWith(`${param.chave}_`)
    );

    const acoesPreenchidas: string[] = [];
    chavesRelevantes.forEach(k => {
      const txt = anotacoes[k]?.acaoRecomendada?.trim();
      if (txt && !acoesPreenchidas.includes(txt)) {
        acoesPreenchidas.push(txt);
      }
    });

    if (acoesPreenchidas.length > 0) {
      return acoesPreenchidas.join(" | ");
    }
  }

  return "";
}

export function obterLeituraAtualUtilidadesETA(
  dadosCE?: Partial<DadosSetorConcentradorEta>,
  param?: ParametroConfigUtilidadesETA
): { numVal: number | null; leituraFormatada: string; origem: "diario" | "direto" | "padrao" } {
  if (!param) return { numVal: null, leituraFormatada: "-", origem: "padrao" };

  const hist = dadosCE?.historicoDiarioUtilidadesETA;
  if (hist && Array.isArray(hist) && hist.length > 0) {
    for (let i = hist.length - 1; i >= 0; i--) {
      const row = hist[i];
      if (row) {
        const valRaw = (row as any)[param.chave];
        const parsed = parseNumeroBritagem(valRaw);
        if (parsed !== null) {
          let str = `${param.decimais > 0 ? parsed.toFixed(param.decimais).replace(".", ",") : parsed} ${param.unidade}`;
          if (param.unidade === "%") str = `${param.decimais > 0 ? parsed.toFixed(param.decimais).replace(".", ",") : parsed}%`;
          return { numVal: parsed, leituraFormatada: str, origem: "diario" };
        }
      }
    }
  }

  // Fallbacks diretos
  if (param.chave === "captacaoAguaBruta" && dadosCE?.captacaoAguaBrutaM3h !== undefined && dadosCE?.captacaoAguaBrutaM3h !== "") {
    const parsed = parseNumeroBritagem(dadosCE.captacaoAguaBrutaM3h);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed} m³/h`, origem: "direto" };
  }
  if (param.chave === "volumeTratadoEta" && dadosCE?.aguaTratadaM3Dia !== undefined && dadosCE?.aguaTratadaM3Dia !== "") {
    const parsed = parseNumeroBritagem(dadosCE.aguaTratadaM3Dia);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed} m³/dia`, origem: "direto" };
  }
  if (param.chave === "taxaRecirculacaoReuso" && dadosCE?.taxaRecirculacaoReuso !== undefined && dadosCE?.taxaRecirculacaoReuso !== "") {
    const parsed = parseNumeroBritagem(dadosCE.taxaRecirculacaoReuso);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed.toFixed(param.decimais).replace(".", ",")}%`, origem: "direto" };
  }
  if (param.chave === "turbidezAguaTratada" && dadosCE?.turbidezAguaTratadaNtu !== undefined && dadosCE?.turbidezAguaTratadaNtu !== "") {
    const parsed = parseNumeroBritagem(dadosCE.turbidezAguaTratadaNtu);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed.toFixed(param.decimais).replace(".", ",")} NTU`, origem: "direto" };
  }
  if (param.chave === "nivelCamaraA" && dadosCE?.nivelReservatorioCentral !== undefined && dadosCE?.nivelReservatorioCentral !== "") {
    const parsed = parseNumeroBritagem(dadosCE.nivelReservatorioCentral);
    if (parsed !== null) return { numVal: parsed, leituraFormatada: `${parsed}%`, origem: "direto" };
  }

  return { numVal: null, leituraFormatada: "", origem: "padrao" };
}

export function obterAcaoEstrategicaUtilidadesETA(
  dadosCE?: Partial<DadosSetorConcentradorEta>,
  param?: ParametroConfigUtilidadesETA
): string {
  if (!param) return "";

  const anotacoes = dadosCE?.anotacoesDesviosUtilidadesETA;
  if (anotacoes && typeof anotacoes === "object") {
    const chavesRelevantes = Object.keys(anotacoes).filter(
      k => k === param.chave || k.startsWith(`${param.chave}_`)
    );

    const acoesPreenchidas: string[] = [];
    chavesRelevantes.forEach(k => {
      const txt = anotacoes[k]?.acaoRecomendada?.trim();
      if (txt && !acoesPreenchidas.includes(txt)) {
        acoesPreenchidas.push(txt);
      }
    });

    if (acoesPreenchidas.length > 0) {
      return acoesPreenchidas.join(" | ");
    }
  }

  return "";
}

export const DADOS_PADRAO_BRITAGEM_REBRITAGEM: DadosSetorBritagemRebritagem = {
  taxaBritagem: 980,
  metaTaxaBritagem: 1000,
  disponibilidadeBritagem: 88.5,
  utilizacaoBritagem: 82.0,

  // Indicadores Operacionais da Britagem (41BR001 / 41TC001)
  posicaoManto: "",
  afericaoBritador: "",
  vazaoOleoBuchaInterna: "",
  vazaoOleoBuchaExterna: "",
  pressaoOleoLubrificante: "",
  pressaoArAcumulador: "",
  pressaoArAc1: "",
  pressaoArAc2: "",
  pressaoAguaResfriamento: "",
  amperagemMotor41TC001: "",
  amperagemMotor41BR001: "",
  temperaturaOleoRetorno: "",
  temperaturaOleoBuchaExterna: "",
  temperaturaOleoBuchaInterna: "",

  historicoDiarioBritagem: DADOS_DIARIOS_BRITAGEM_PADRAO,
  anotacoesDesvios: {},

  historicoDiarioRebritagem: DADOS_DIARIOS_REBRITAGEM_PADRAO,
  anotacoesDesviosRebritagem: {},

  estoqueMsb: 12500,
  estoqueSurubim: 8400,
  estoqueVermelhos: 4200,
  estoqueSucuarana: 3100,
  estoqueTotalRom: 28200,

  producaoBypass: 4800,
  producaoPatio: 7200,
  producaoTotalRebritagem: 12000,
  produtividadeRebritagem: 1020,
  disponibilidadeRebritagem: 91.0,
  utilizacaoRebritagem: 86.5,
  retidoMeiaPol: 11.2,
  pilhaIntermediaria: 9500,

  producaoDiaTotal: 12000,
  metaProducaoDia: 12500,
  producaoSemanaAcum: 78500,
  metaProducaoSemana: 84000,
  producaoMesAcum: 315000,
  metaProducaoMes: 340000,

  diretrizDia: "Priorizar alimentação direta de minério de alta densidade (MSB + Surubim) mantendo taxa horária estável acima de 1.000 t/h. Monitorar peneiras e desgaste do manto.",
  diretrizSemana: "Equalizar a pilha intermediária para atingir 12.000 t de pulmão e programar inspeção de revestimentos da rebritagem na parada de quinta-feira.",
  diretrizFds: "Blindar estoques dos silos e pátio para garantir autonomia mínima de 28 horas sem depender de manobras de pátio complexas no final de semana.",
  diretrizMes: "Recuperar o gap de 25.000 t acumulado no mês através de estabilidade operacional nas trocas de turno e redução das paradas operacionais não programadas.",
  gargalosAtuais: "Desgaste acelerado na tela da peneira PE002 e oscilação de umidade no ROM da mina vermelhos.",
  planoContingencia: "Em caso de entupimento do chute de alimentação, acionar modo bypass imediatamente e contatar equipe de desobstrução mecânica."
};

export function calcularProducaoFiltragem(
  paradasManutencao: number | "",
  paradasOutros: number | "",
  produtividade: number | ""
): number {
  const pm = typeof paradasManutencao === "number" ? paradasManutencao : 0;
  const po = typeof paradasOutros === "number" ? paradasOutros : 0;
  const prod = typeof produtividade === "number" ? produtividade : 0;
  const horasEfetivas = Math.max(0, 12 - pm - po);
  return +(horasEfetivas * prod).toFixed(2);
}

export const DADOS_PADRAO_CONCENTRADOR_ETA: DadosSetorConcentradorEta = {
  estoquePatio: 6800,
  nivelSilo1: 82,
  nivelSilo2: 78,
  autonomiaMinérioHoras: 31.5,
  autonomiaMinérioToneladas: 10560,
  statusRetomador: "Operando",

  historicoDiarioMoagem: DADOS_DIARIOS_MOAGEM_PADRAO,
  anotacoesDesviosMoagem: {},

  historicoDiarioRemoagem: DADOS_DIARIOS_REMOAGEM_PADRAO,
  anotacoesDesviosRemoagem: {},

  historicoDiarioFlotacao: DADOS_DIARIOS_FLOTACAO_PADRAO,
  anotacoesDesviosFlotacao: {},

  historicoDiarioEspessamentoRejeito: DADOS_DIARIOS_ESPESSAMENTO_REJEITO_PADRAO,
  anotacoesDesviosEspessamentoRejeito: {},

  historicoDiarioEspessamentoConcentrado: DADOS_DIARIOS_ESPESSAMENTO_CONCENTRADO_PADRAO,
  anotacoesDesviosEspessamentoConcentrado: {},

  producaoMoagemDia: 7100,
  metaProducaoMoagemDia: 7200,
  producaoMoagemSemana: 47800,
  metaProducaoMoagemSemana: 50400,
  producaoMoagemMes: 198000,
  metaProducaoMoagemMes: 216000,
  taxaMi003: 228,
  taxaMi004: 211,
  taxaMi005: 0,
  taxaTotalMoagem: 439,
  potenciaMi003: 2921,
  potenciaMi004: 3263,
  potenciaMi005: "",
  solidosOverflowMi003: 40,
  solidosOverflowMi004: 43,
  solidosOverflowMi005: "",
  solidosDescargaMi003: 79,
  solidosDescargaMi004: 80,
  solidosDescargaMi005: "",
  reposicoesMi003: "",
  reposicoesMi004: "",
  reposicoesMi005: "",
  hidrociclonesBh003: "02/04/05",
  hidrociclonesBh004: "10/12",
  hidrociclonesBh005: "",
  densidadeMi003: 1.68,
  densidadeMi004: 1.70,
  densidadeMi005: "",
  pressaoPsiMi003: 60.20,
  pressaoPsiMi004: "",
  pressaoPsiMi005: "",
  granulometria105: 63.8,
  disponibilidadeMoagem: 92.4,
  utilizacaoMoagem: 88.0,

  teorAlimentacaoCu: 1.28,
  teorConcentradoCu: 33.8,
  teorRejeitoCu: 0.095,
  recuperacaoMetalurgica: 89.2,
  metaRecuperacao: 88.5,
  metalContidoDia: 81.06,
  metaMetalContidoDia: 81.5,
  metalContidoSemana: 545.2,
  metaMetalContidoSemana: 570.0,
  metalContidoMes: 2260.0,
  metaMetalContidoMes: 2450.0,
  concentradoProduzidoDia: 239.8,
  metaConcentradoDia: 242.0,
  phRougher: 9.6,
  consumoColetor: 33,
  consumoEspumante: 24,
  consumoDispersante: 22,
  consumoCmc: 195,
  consumoAmidex: 58,

  espessadorConcEmOperacao: "Ambos",
  densidadeUnderflowConc: 1860,
  solidosConc44ep001: 66.2,
  solidosConc44ep002: 65.8,
  nivelTanqueConc: 55,
  consumoFloculanteConc: 23,
  elevacaoRakeConc: 0,
  elevacaoRakeConcEp001: 0,
  elevacaoRakeConcEp002: 0,
  torqueConcEp001: 8.2,
  torqueConcEp002: 8.5,

  espessadorRejEmOperacao: "Ambos",
  densidadeUnderflowRej: 1420,
  solidosRej45ep001: 56.5,
  solidosRej45ep002: 57.0,
  torqueRejEp001: 34,
  torqueRejEp002: 36,
  consumoFloculanteRej: 17.5,
  htrLinhas: "Linhas 1, 2 e 3 em operação estável. Past Fill ativo.",

  filtroConcOp: "Ambos",
  producaoFiltragem: 325,
  paradasManutencaoFiltro: 1.0,
  paradasOutrosFiltro: 1.0,
  umidadeBolo: 9.1,
  metaUmidadeBolo: 9.5,
  produtividadeFiltro: 32.5,
  ciclosFiltro: 26,
  pesoTortaKg: 8200,
  pressaoCompactacao: 235,
  historicoDiarioFiltragemConcentrado: DADOS_DIARIOS_FILTRAGEM_CONCENTRADO_PADRAO,
  anotacoesDesviosFiltragemConcentrado: {},

  captacaoAguaBrutaM3h: 380,
  aguaTratadaM3Dia: 8640,
  taxaRecirculacaoReuso: 86.5,
  metaRecirculacao: 85.0,
  turbidezAguaTratadaNtu: 1.8,
  nivelReservatorioCentral: 84,
  dosagemCoagulantePpm: 12.5,
  dosagemPolimeroPpm: 1.2,
  consumoHipocloritoKg: 45,
  balancoHidricoStatus: "Superavitário e estável com alta taxa de recirculação dos espessadores.",
  compressoresOp: "Todos em Operação",
  bombasAguaOp: "Ambas em Operação",
  historicoDiarioUtilidadesETA: DADOS_DIARIOS_UTILIDADES_ETA_PADRAO,
  anotacoesDesviosUtilidadesETA: {},

  diretrizDia: "Manter taxa de moagem em 605 t/h com controle rigoroso de densidade nos ciclones. Flotação deve manter pH em 9.6 para garantir recuperação acima de 89%.",
  diretrizSemana: "Otimizar dosagens de reagentes (CMC e Coletor) e assegurar que a umidade da torta no filtro se mantenha abaixo de 9.3% para transporte rodoviário.",
  diretrizFds: "Garantir níveis dos tanques de concentrado em 50% na sexta-feira à noite. Manter monitoramento contínuo de torque dos espessadores de rejeito.",
  diretrizMes: "Foco total na elevação do metal contido para atingir a meta mensal de 2.450 t Cu. Acelerar drenagem e ciclos de filtragem.",
  gargalosAtuais: "Oscilação de pressão no manifold de água de selagem das bombas de polpa da flotação.",
  planoContingencia: "Em caso de elevação súbita de torque no 45EP001, elevar imediatamente o rake em 50mm e ajustar a dosagem de floculante."
};

// DIRETRIZES PADRÃO CIRCUITO SECO
export const DIRETRIZES_PADRAO_SECO: DiretrizSupervisorTurno[] = [
  {
    id: "dir_seco_1",
    setor: "Britagem Primária",
    acaoEstrategica: "Realizar aferição do britador primário e limpeza preventiva do chute durante a janela operacional programada.",
    responsavelTurma: "Turma A",
    supervisorNome: "Sup. Roberto Lima",
    prazoLimite: "Hoje até 15:30",
    prioridade: "alta",
    metaEsperada: "Manto calibrado em 35% e taxa horária restabelecida > 1.000 t/h sem restrições de fluxo.",
    status: "em_andamento",
    diaInicioNum: 1,
    diaFimNum: 3,
    dataInicio: "Seg",
    progresso: 65,
    observacoes: "Alinhar parada de 45 min com a equipe de manutenção mecânica."
  },
  {
    id: "dir_seco_2",
    setor: "Rebritagem & Peneiramento",
    acaoEstrategica: "Equalizar alimentação do circuito terciário e monitorar telas da peneira PE002 contra entupimento por umidade.",
    responsavelTurma: "Turma B",
    supervisorNome: "Sup. Carlos Eduardo",
    prazoLimite: "Turno Diurno e Noturno",
    prioridade: "alta",
    metaEsperada: "Produção de rebritagem > 12.000 t/dia com retido 1/2'' < 12.0%.",
    status: "em_andamento",
    diaInicioNum: 2,
    diaFimNum: 5,
    dataInicio: "Ter",
    progresso: 50,
    observacoes: "Inspecionar bicos de aspersão e desobstruir canaletas de finos."
  },
  {
    id: "dir_seco_3",
    setor: "Pátios ROM & Pilhas",
    acaoEstrategica: "Executar blend de alimentação de ROM com proporção 60% MSB / 40% Surubim para garantir densidade e fluidez.",
    responsavelTurma: "Turma C",
    supervisorNome: "Sup. Mariana Souza",
    prazoLimite: "Hoje até 20:00",
    prioridade: "critica",
    metaEsperada: "Estoque de ROM mantido acima de 25.000 t e Pilha Intermediária em 10.000 t.",
    status: "pendente",
    diaInicioNum: 3,
    diaFimNum: 6,
    dataInicio: "Qua",
    progresso: 25,
    observacoes: "Evitar alimentação exclusiva da mina vermelhos em períodos de chuva."
  },
  {
    id: "dir_seco_4",
    setor: "Blindagem Fim de Semana",
    acaoEstrategica: "Executar protocolo de abastecimento máximo dos silos 1 e 2 (mínimo 85% de nível) e pulmão intermediário na sexta-feira.",
    responsavelTurma: "Todas as Turmas",
    supervisorNome: "Supervisores do Circuito Seco",
    prazoLimite: "Sexta-feira 18:00",
    prioridade: "critica",
    metaEsperada: "Autonomia de finos > 30 horas para garantir operação contínua da moagem no FDS.",
    status: "pendente",
    diaInicioNum: 5,
    diaFimNum: 7,
    dataInicio: "Sex",
    progresso: 0,
    observacoes: "Inspecionar correias transportadoras CV001 e CV002 na sexta à tarde."
  }
];

// DIRETRIZES PADRÃO CIRCUITO ÚMIDO
export const DIRETRIZES_PADRAO_UMIDO: DiretrizSupervisorTurno[] = [
  {
    id: "dir_umido_1",
    setor: "Moagem & Ciclones",
    acaoEstrategica: "Manter taxa horária combinada de 605 t/h nos moinhos MI003, MI004 e MI005, com controle de densidade nos ciclones.",
    responsavelTurma: "Todas as Turmas",
    supervisorNome: "Supervisores de Turno",
    prazoLimite: "Turno Diurno e Noturno",
    prioridade: "critica",
    metaEsperada: "Garantir P80 < 105µm acima de 62% e produção diária consolidada > 7.200 t.",
    status: "em_andamento",
    diaInicioNum: 1,
    diaFimNum: 7,
    dataInicio: "Seg",
    progresso: 80,
    observacoes: "Monitorar carga de bolas e ruído dos mancais a cada 2 horas."
  },
  {
    id: "dir_umido_2",
    setor: "Flotação de Cobre",
    acaoEstrategica: "Ajustar dosagem de CMC para 190 g/t e controlar pH da linha Rougher em 9.6 fixo.",
    responsavelTurma: "Turma B",
    supervisorNome: "Sup. Carlos Eduardo",
    prazoLimite: "Hoje até 21:00",
    prioridade: "alta",
    metaEsperada: "Recuperação metalúrgica sustentada acima de 89.0% e teor de rejeito < 0.095% Cu.",
    status: "em_andamento",
    diaInicioNum: 2,
    diaFimNum: 5,
    dataInicio: "Ter",
    progresso: 60,
    observacoes: "Coletar amostras de corte a cada 1 hora para validação no analisador de raios-X."
  },
  {
    id: "dir_umido_3",
    setor: "Filtragem & Desaguamento",
    acaoEstrategica: "Garantir 26 ciclos completos no filtro prensa com lavagem dupla programada a cada 6 ciclos.",
    responsavelTurma: "Turma C",
    supervisorNome: "Sup. Mariana Souza",
    prazoLimite: "Madrugada até 05:00",
    prioridade: "alta",
    metaEsperada: "Umidade média da torta rigorosamente abaixo de 9.3% para liberação de transporte.",
    status: "pendente",
    diaInicioNum: 3,
    diaFimNum: 6,
    dataInicio: "Qua",
    progresso: 30,
    observacoes: "Verificar integridade das lonas e pressão de ar comprimido."
  },
  {
    id: "dir_umido_4",
    setor: "Espessamento & ETA",
    acaoEstrategica: "Monitorar torque do espessador 45EP001 e assegurar recirculação de água clarificada > 85% para a moagem.",
    responsavelTurma: "Turma D",
    supervisorNome: "Sup. Fernando Alves",
    prazoLimite: "Amanhã até 07:00",
    prioridade: "critica",
    metaEsperada: "Densidade de underflow em 1.420 g/L e turbidez da ETA < 2.0 NTU.",
    status: "pendente",
    diaInicioNum: 4,
    diaFimNum: 7,
    dataInicio: "Qui",
    progresso: 15,
    observacoes: "Manter dosagem de floculante ajustada conforme taxa de alimentação."
  }
];

// Função utilitária para cálculo automático da Semana Operacional conforme semanas do calendário
export function calcularSemanaOperacional(dataIso?: string): string {
  if (!dataIso) return "";
  try {
    const parts = dataIso.split("-");
    if (parts.length !== 3) return "";
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const date = new Date(year, month, day);
    if (isNaN(date.getTime())) return "";

    // Cálculo da semana do ano padrão calendário (ISO-8601)
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7; // Segunda = 0, Domingo = 6
    target.setDate(target.getDate() - dayNr + 3); // Quinta-feira da semana
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);

    const nomesMeses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const mesNome = nomesMeses[month];

    return `Semana Operacional ${weekNum.toString().padStart(2, "0")} — ${mesNome}/${year}`;
  } catch {
    return "";
  }
}

const DATA_HOJE_INICIAL = new Date().toISOString().split("T")[0];

// RELATÓRIO INICIAL CIRCUITO SECO (COMINUIÇÃO)
export const RELATORIO_ADM_SECO_INICIAL: RelatorioAdmPayload = {
  circuitoTipo: "seco",
  dataEmissao: DATA_HOJE_INICIAL,
  periodoReferencia: calcularSemanaOperacional(DATA_HOJE_INICIAL) || "Semana Operacional Vigente",
  supervisorAdmResponsavel: "Supervisor ADM — Circuito Seco (Cominuição)",
  engenheiroProcesso: "Engenharia de Cominuição & Britagem",
  gerentePlanta: "Gerência de Operações Industriais",
  dadosBritagemRebritagem: DADOS_PADRAO_BRITAGEM_REBRITAGEM,
  dadosConcentradorEta: DADOS_PADRAO_CONCENTRADOR_ETA,
  estrategiaDia: {
    titulo: "Estratégia Operacional do Dia (24 Horas) — Circuito Seco",
    focoPrincipal: "Estabilidade da alimentação de ROM, taxa horária da britagem primária > 1.000 t/h e produção contínua da rebritagem para abastecimento dos silos.",
    metaAlimentacaoBritagem: 12500,
    metaTaxaHoraria: 1000,
    metaDisponibilidade: 88.0,
    diretrizesPrioritarias: [
      "[Britagem Primária] Priorizar alimentação direta de minério de alta densidade (MSB + Surubim) mantendo taxa horária acima de 1.000 t/h.",
      "[Silos de Finos & Alimentação] Manter estoque dos silos de finos acima de 80% em todas as passagens de turno.",
      "[Rebritagem & Peneiramento] Inspecionar telas da peneira PE002 e estado de desgaste do manto do britador primário."
    ],
    recursosManutencao: "Equipe mecânica de prontidão para inspeção no chute PE006 e aferição do britador primário às 14h.",
    alertasOperacionais: [
      "Atenção à umidade do ROM vindo da mina vermelhos para evitar entupimento de grelhas.",
      "Monitorar nível da pilha intermediária de rebritagem (manter acima de 9.000 t)."
    ]
  },
  estrategiaSemana: {
    titulo: "Estratégia Semanal de Produção (Semana Vigente) — Circuito Seco",
    focoPrincipal: "Atingimento da meta semanal de 84.000 t com elevação da disponibilidade física da rebritagem e recomposição da pilha intermediária.",
    metaAlimentacaoBritagem: 84000,
    metaTaxaHoraria: 1000,
    metaDisponibilidade: 90.0,
    diretrizesPrioritarias: [
      "[Pátios ROM & Pilhas] Equalizar a pilha intermediária até atingir 12.000 t de pulmão estratégico.",
      "[Rebritagem & Peneiramento] Executar troca de telas desgastadas na parada de manutenção preventiva de quinta-feira.",
      "[Geral - Cominuição] Reduzir microparadas operacionais nas trocas de turno através do alinhamento prévio dos operadores."
    ],
    recursosManutencao: "Parada preventiva programada para quinta-feira das 08h às 12h (Rebritagem e Peneiramento).",
    alertasOperacionais: [
      "Previsão de chuva moderada na quarta-feira: manter lonas de cobertura e drenagem de pátio ativas.",
      "Acompanhar consumo de revestimentos e desgaste dos martelos/manto."
    ]
  },
  estrategiaFds: {
    titulo: "Blindagem Operacional de Final de Semana — Circuito Seco",
    focoPrincipal: "Garantir estoque pleno nos silos 1 e 2 (mínimo 85%) e pátio pulmão abastecido para assegurar travessia contínua do FDS com equipe de plantão.",
    metaAlimentacaoBritagem: 36000,
    metaTaxaHoraria: 980,
    metaDisponibilidade: 85.0,
    diretrizesPrioritarias: [
      "[Silos de Finos & Alimentação] Sexta-feira às 18:00: Silos 1 e 2 com no mínimo 85% de nível e pátio com 8.000 t.",
      "[Transporte de Minério (CVs)] Garantir autonomia mínima de finos superior a 30 horas para a moagem.",
      "[Britagem Primária] Deixar equipamentos de britagem e correias transportadoras limpos e inspecionados."
    ],
    recursosManutencao: "Equipe de plantão escalada (Mecânico e Eletricista de área seca). Turno de apoio de prontidão.",
    alertasOperacionais: [
      "Proibido iniciar o turno noturno de domingo com silos abaixo de 50%.",
      "Qualquer anomalia no retomador ou correias de finos deve ser comunicada imediatamente ao plantonista ADM."
    ],
    planoBlindagemFds: "Checklist de blindagem do circuito seco deve ser validado pelo supervisor ADM na sexta-feira até as 17:30."
  },
  estrategiaParada: {
    titulo: "Alinhamento de Parada de Manutenção — Circuito Seco",
    focoPrincipal: "Alinhamento prévio, isolamento seguro e liberação de equipamentos para parada programada de manutenção (Britagem e Rebritagem).",
    metaAlimentacaoBritagem: 0,
    metaTaxaHoraria: 0,
    metaDisponibilidade: 0,
    diretrizesPrioritarias: [
      "[Britagem Primária] Drenar alimentador de sapatas e câmara de britagem antes do bloqueio eletromecânico.",
      "[Rebritagem & Peneiramento] Esvaziar silos intermediários e inspecionar estado das telas e revestimentos.",
      "[Segurança & SSMA] Realizar bloqueio LOTO conjunto (Operação + Manutenção) e validar permissões de trabalho (PT)."
    ],
    recursosManutencao: "Equipes mecânica e elétrica mobilizadas com guindastes e peças sobressalentes preparadas.",
    alertasOperacionais: [
      "Garantir nível máximo nos silos de finos antes de iniciar o corte de alimentação.",
      "Despressurização e travamento mecânico dos acumuladores hidráulicos devem ser conferidos."
    ],
    planoAlinhamentoParada: "Reunião de alinhamento com PCM e Manutenção 1 hora antes da parada. Inspeção pós-liberação obrigatória."
  },
  estrategiaMes: {
    titulo: "Estratégia Mensal Consolidada (MTD) — Circuito Seco",
    focoPrincipal: "Cumprimento integral da meta orçada de 340.000 t de minério britado e cominuído no mês com controle de custos e máxima segurança.",
    metaAlimentacaoBritagem: 340000,
    metaTaxaHoraria: 1020,
    metaDisponibilidade: 89.5,
    diretrizesPrioritarias: [
      "[Britagem Primária] Elevar a utilização global da britagem primária para 85% até o fechamento do mês.",
      "[Rebritagem & Peneiramento] Garantir padrão granulométrico com retido 1/2'' abaixo de 11.5% na alimentação dos moinhos.",
      "[Manutenção Mecânica / Elétrica] Consolidar plano de manutenção preventiva e gestão de peças sobressalentes no SAP."
    ],
    recursosManutencao: "Planejamento das ordens de serviço do SAP para a grande parada do próximo mês concluído em 95%.",
    alertasOperacionais: [
      "Gap acumulado no mês requer estabilidade operacional máxima nas próximas semanas.",
      "Monitorar curvas de desgaste dos revestimentos do britador primário e rebritadores cônicos."
    ]
  },
  diretrizesTurno: DIRETRIZES_PADRAO_SECO,
  observacoesGerais: "O foco da supervisão do Circuito Seco é garantir a alimentação estável e contínua dos silos e pátios, mantendo alta taxa horária e granulometria adequada para a moagem.",
  prioridadesImediatas: [
    "Aferição do britador primário (Hoje até 15:30) — Turma A",
    "Manter taxa da rebritagem acima de 1.000 t/h — Turma B",
    "Blindagem dos silos para o Final de Semana (Sexta 18h) — Todas as Turmas"
  ]
};

// RELATÓRIO INICIAL CIRCUITO ÚMIDO (BENEFICIAMENTO)
export const RELATORIO_ADM_UMIDO_INICIAL: RelatorioAdmPayload = {
  circuitoTipo: "umido",
  dataEmissao: DATA_HOJE_INICIAL,
  periodoReferencia: calcularSemanaOperacional(DATA_HOJE_INICIAL) || "Semana Operacional Vigente",
  supervisorAdmResponsavel: "Supervisor ADM — Circuito Úmido (Beneficiamento)",
  engenheiroProcesso: "Engenharia Metalúrgica & Processos",
  gerentePlanta: "Gerência de Operações Industriais",
  dadosBritagemRebritagem: DADOS_PADRAO_BRITAGEM_REBRITAGEM,
  dadosConcentradorEta: DADOS_PADRAO_CONCENTRADOR_ETA,
  estrategiaDia: {
    titulo: "Estratégia Operacional do Dia (24 Horas) — Circuito Úmido",
    focoPrincipal: "Maximização de alimentação contínua na moagem (605 t/h) com controle rigoroso de recuperação na flotação (>89%) e descarte de rejeito.",
    metaProducaoCobreContido: 81.5,
    metaAlimentacaoMoagem: 7200,
    metaRecuperacao: 88.5,
    diretrizesPrioritarias: [
      "[Moagem & Ciclones] Manter taxa horária nos moinhos MI003, MI004 e MI005 com densidade controlada nos ciclones.",
      "[Flotação de Cobre] Flotação deve manter pH em 9.6 fixo e dosagem de CMC em 190 g/t para garantir recuperação > 89%.",
      "[Filtragem & Desaguamento] Garantir liberação rápida das tortas de filtro com umidade abaixo de 9.3%."
    ],
    recursosManutencao: "Equipe de instrumentação a postos para calibragem do analisador de raios-X e medidores de pH.",
    alertasOperacionais: [
      "Atenção ao torque no espessador de rejeito 45EP001 durante elevação de taxa de moagem.",
      "Monitorar nível do tanque de concentrado (manter abaixo de 60%)."
    ]
  },
  estrategiaSemana: {
    titulo: "Estratégia Semanal de Produção (Semana Vigente) — Circuito Úmido",
    focoPrincipal: "Atingimento da meta semanal de 570 t de cobre contido através da eficiência da flotação e redução de perdas no rejeito.",
    metaProducaoCobreContido: 570.0,
    metaAlimentacaoMoagem: 50400,
    metaRecuperacao: 88.8,
    diretrizesPrioritarias: [
      "[Flotação de Cobre] Executar lavagem programada das células de flotação na parada de manutenção de quinta-feira.",
      "[Laboratório & Metalurgia] Otimizar dosagens de reagentes (redução de 5% no consumo específico sem perda de recuperação metalúrgica).",
      "[Filtragem & Desaguamento] Assegurar que a umidade média da torta no filtro se mantenha abaixo de 9.3%."
    ],
    recursosManutencao: "Parada preventiva programada para quinta-feira das 08h às 12h (Flotação e Espessamento).",
    alertasOperacionais: [
      "Controlar rigorosamente a turbidez da água clarificada da ETA (< 2.0 NTU).",
      "Manter estoque de bolas de moagem monitorado no depósito central."
    ]
  },
  estrategiaFds: {
    titulo: "Blindagem Operacional de Final de Semana — Circuito Úmido",
    focoPrincipal: "Blindagem de reagentes, níveis de tanques de concentrado e estabilidade de espessadores para travessia do FDS com equipe de plantão.",
    metaProducaoCobreContido: 245.0,
    metaAlimentacaoMoagem: 21600,
    metaRecuperacao: 88.5,
    diretrizesPrioritarias: [
      "[Flotação de Cobre] Sexta-feira 18h: Tanques de reagentes da flotação e ETA abastecidos para 72h de operação.",
      "[Espessamento Concentrado] Tanques de concentrado em 50% de nível na sexta-feira à noite.",
      "[Filtragem & Desaguamento] Caçambas de concentrado e pátio de filtragem organizados com área livre para 3 dias de produção."
    ],
    recursosManutencao: "Equipe de plantão escalada (Eletricista, Mecânico, Instrumentista). Turno de apoio de prontidão.",
    alertasOperacionais: [
      "Proibida a operação com nível de silo abaixo de 40% durante a madrugada.",
      "Supervisor de plantão do ADM deve ser acionado em caso de elevação crítica de torque nos espessadores."
    ],
    planoBlindagemFds: "Checklist de blindagem do circuito úmido deve ser assinado pelo supervisor na sexta-feira até as 17:00."
  },
  estrategiaParada: {
    titulo: "Alinhamento de Parada de Manutenção — Circuito Úmido",
    focoPrincipal: "Protocolo de parada programada de flotação e moagem com foco em drenagem controlada, mitigação de arraste e manutenção preventiva.",
    metaProducaoCobreContido: 0,
    metaAlimentacaoMoagem: 0,
    metaRecuperacao: 0,
    diretrizesPrioritarias: [
      "[Moagem & Ciclones] Realizar descarte seguro de polpa e parada dos moinhos em vazio com acionamento do virador.",
      "[Flotação de Cobre] Cortar alimentação de reagentes e drenar caixas de alimentação para manutenção de rotores/estatores.",
      "[ETA — Estação de Água] Manter recirculação de água clarificada e monitorar nível de água de processo."
    ],
    recursosManutencao: "Equipe de manutenção mecânica e instrumentação mobilizada para calibração de sensores e inspeção interna.",
    alertasOperacionais: [
      "Atenção ao risco de sobretorque no espessador de rejeito durante o esvaziamento das linhas.",
      "Verificar estanqueidade das válvulas de corte e bombas de polpa."
    ],
    planoAlinhamentoParada: "Validação do checklist de segurança e liberação para manutenção com supervisores de turno e equipe técnica."
  },
  estrategiaMes: {
    titulo: "Estratégia Mensal Consolidada (MTD) — Circuito Úmido",
    focoPrincipal: "Cumprimento integral do plano orçado de 2.450 t de metal cobre contido com máxima recuperação (>88.5%) e custos controlados.",
    metaProducaoCobreContido: 2450.0,
    metaAlimentacaoMoagem: 216000,
    metaRecuperacao: 88.5,
    diretrizesPrioritarias: [
      "[Moagem & Ciclones] Elevar a utilização global da moagem de 88% para 91% até o final do mês.",
      "[Flotação de Cobre] Aumentar o teor do concentrado comercial para 34.0% Cu reduzindo frete rodoviário.",
      "[ETA — Estação de Água] Consolidar a taxa de recirculação de água da ETA em 86.5% para compliance ambiental."
    ],
    recursosManutencao: "Planejamento das ordens de serviço do SAP para a grande parada do próximo mês concluído em 90%.",
    alertasOperacionais: [
      "Gap atual de metal contido requer regime de máxima eficiência operacional nos próximos dias.",
      "Monitorar curvas de desgaste de revestimento dos moinhos MI004 e MI005."
    ]
  },
  diretrizesTurno: DIRETRIZES_PADRAO_UMIDO,
  observacoesGerais: "O foco da supervisão do Circuito Úmido é maximizar a recuperação metalúrgica e a produção de metal contido, garantindo desaguamento eficiente do concentrado e reuso hídrico sustentável na ETA.",
  prioridadesImediatas: [
    "Estabilização da taxa de moagem em 605 t/h — Todas as Turmas",
    "Ajuste fino de reagentes da flotação (pH 9.6) — Turma B",
    "Garantir umidade do bolo do filtro prensa < 9.3% — Turma C"
  ]
};

export const fmtData = (dateStr?: string): string => {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

// GERADOR WHATSAPP ESPECÍFICO POR CIRCUITO
export function gerarWppAdm(payload: RelatorioAdmPayload): string {
  const hr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const L: string[] = [];
  const isSeco = payload.circuitoTipo === "seco";

  if (isSeco) {
    L.push(`🏛️ *DIRETRIZ ESTRATÉGICA ADM — CIRCUITO SECO (COMINUIÇÃO)*`);
    L.push(`🏷️ *ERO BRASIL | MINERAÇÃO CARAÍBA & TUCUMÃ*`);
    L.push(`📅 *Data:* ${fmtData(payload.dataEmissao)} | 🕐 *Emitido às:* ${hr}`);
    L.push(`👤 *Supervisor ADM (Circuito Seco):* ${payload.supervisorAdmResponsavel}`);
    if (payload.engenheiroProcesso) L.push(`⚙️ *Engenharia:* ${payload.engenheiroProcesso}`);
    if (payload.periodoReferencia) L.push(`📌 *Referência:* ${payload.periodoReferencia}`);
    L.push(``);

    const br = payload.dadosBritagemRebritagem;
    L.push(`📊 *DESEMPENHO DO CIRCUITO SECO (REALIZADO VS METAS)*`);
    L.push(`────────────────────────────`);
    L.push(`• Prod. Britagem Dia: *${br.producaoDiaTotal ? br.producaoDiaTotal.toLocaleString("pt-BR") : "-"} t* (Meta: ${br.metaProducaoDia.toLocaleString("pt-BR")} t)`);
    L.push(`• Prod. Britagem Semana: *${br.producaoSemanaAcum ? br.producaoSemanaAcum.toLocaleString("pt-BR") : "-"} t* (Meta: ${br.metaProducaoSemana.toLocaleString("pt-BR")} t)`);
    L.push(`• Prod. Britagem Mês: *${br.producaoMesAcum ? br.producaoMesAcum.toLocaleString("pt-BR") : "-"} t* (Meta: ${br.metaProducaoMes.toLocaleString("pt-BR")} t)`);
    L.push(`• Taxa Britador Primário: *${br.taxaBritagem || "-"} t/h* (Meta: ${br.metaTaxaBritagem} t/h)`);
    L.push(`• Disp / Util Britagem: *${br.disponibilidadeBritagem || "-"}%* / *${br.utilizacaoBritagem || "-"}%*`);
    L.push(`• Posição Manto / Aferição: *${br.posicaoManto || "-"}* | *${br.afericaoBritador || "-"}*`);
    L.push(`• Estoque Total ROM: *${br.estoqueTotalRom ? br.estoqueTotalRom.toLocaleString("pt-BR") : "-"} t* (MSB: ${br.estoqueMsb || "-"}t, Surubim: ${br.estoqueSurubim || "-"}t)`);
    L.push(`• Pilha Intermediária: *${br.pilhaIntermediaria ? br.pilhaIntermediaria.toLocaleString("pt-BR") : "-"} t* | Rebritagem Total: *${br.producaoTotalRebritagem ? br.producaoTotalRebritagem.toLocaleString("pt-BR") : "-"} t*`);
    L.push(``);
  } else {
    L.push(`🏛️ *DIRETRIZ ESTRATÉGICA ADM — CIRCUITO ÚMIDO (BENEFICIAMENTO)*`);
    L.push(`🏷️ *ERO BRASIL | MINERAÇÃO CARAÍBA & TUCUMÃ*`);
    L.push(`📅 *Data:* ${fmtData(payload.dataEmissao)} | 🕐 *Emitido às:* ${hr}`);
    L.push(`👤 *Supervisor ADM (Circuito Úmido):* ${payload.supervisorAdmResponsavel}`);
    if (payload.engenheiroProcesso) L.push(`⚙️ *Engenharia:* ${payload.engenheiroProcesso}`);
    if (payload.periodoReferencia) L.push(`📌 *Referência:* ${payload.periodoReferencia}`);
    L.push(``);

    const ce = payload.dadosConcentradorEta;
    L.push(`📊 *DESEMPENHO DO CIRCUITO ÚMIDO (PARÂMETROS & BALANÇO)*`);
    L.push(`────────────────────────────`);
    L.push(`• Taxa Total Moagem: *${ce.taxaTotalMoagem || "-"} t/h* (MI003: ${ce.taxaMi003 || "-"} t/h | MI004: ${ce.taxaMi004 || "-"} t/h | MI005: ${ce.taxaMi005 || "-"} t/h)`);
    L.push(`• Potência Moinhos: MI03: *${ce.potenciaMi003 || "-"} kW* | MI04: *${ce.potenciaMi004 || "-"} kW* | MI05: *${ce.potenciaMi005 || "-"} kW*`);
    L.push(`• % Sólidos (Overflow / Descarga): MI03: *${ce.solidosOverflowMi003 || "-"}% / ${ce.solidosDescargaMi003 || "-"}%* | MI04: *${ce.solidosOverflowMi004 || "-"}% / ${ce.solidosDescargaMi004 || "-"}%*`);
    L.push(`• Pressão Hidrociclonagem (kgf/cm²): BH003: *${ce.hidrociclonesBh003 || "-"}* | BH004: *${ce.hidrociclonesBh004 || "-"}* | BH005: *${ce.hidrociclonesBh005 || "-"}*`);
    L.push(`• Densidade Polpa: MI03: *${ce.densidadeMi003 || "-"} g/cm³* | MI04: *${ce.densidadeMi004 || "-"} g/cm³* | MI05: *${ce.densidadeMi005 || "-"} g/cm³*`);
    L.push(`• Granulometria P80 (<105µm): *${ce.granulometria105 || "-"}%* | Disp / Util: *${ce.disponibilidadeMoagem || "-"}%* / *${ce.utilizacaoMoagem || "-"}%*`);
    L.push(`• Recuperação Metalúrgica: *${ce.recuperacaoMetalurgica || "-"}%* (Meta: ${ce.metaRecuperacao}%)`);
    L.push(`• Teores Cu: Alimentação: *${ce.teorAlimentacaoCu || "-"}%* | Conc: *${ce.teorConcentradoCu || "-"}%* | Rej: *${ce.teorRejeitoCu || "-"}%*`);
    L.push(`• Filtragem Concentrado: Produção: *${ce.producaoFiltragem !== undefined && ce.producaoFiltragem !== "" ? `${ce.producaoFiltragem} t` : "-"}* | Umidade: *${ce.umidadeBolo || "-"}%*`);
    L.push(`• Autonomia Silos/Pátio: *${ce.autonomiaMinérioHoras || "-"} h* (${ce.autonomiaMinérioToneladas ? ce.autonomiaMinérioToneladas.toLocaleString("pt-BR") : "-"} t) | ETA Reuso: *${ce.taxaRecirculacaoReuso || "-"}%*`);
    L.push(``);
  }

  // Horizontes Estratégicos
  L.push(`🎯 *DIRETRIZES ESTRATÉGICAS POR HORIZONTE*`);
  L.push(`────────────────────────────`);
  L.push(`☀️ *ESTRATÉGIA DO DIA (24H):*`);
  L.push(`${payload.estrategiaDia.focoPrincipal}`);
  L.push(``);

  L.push(`📅 *ESTRATÉGIA DA SEMANA (WTD):*`);
  L.push(`${payload.estrategiaSemana.focoPrincipal}`);
  L.push(``);

  L.push(`🏖️ *ESTRATÉGIA FINAL DE SEMANA (BLINDAGEM):*`);
  L.push(`${payload.estrategiaFds.focoPrincipal}`);
  L.push(``);

  if (payload.estrategiaParada?.focoPrincipal) {
    L.push(`🛑 *ALINHAMENTO DE PARADA (MANUTENÇÃO):*`);
    L.push(`${payload.estrategiaParada.focoPrincipal}`);
    L.push(``);
  }

  L.push(`📈 *ESTRATÉGIA DO MÊS (MTD):*`);
  L.push(`${payload.estrategiaMes.focoPrincipal}`);
  L.push(``);

  // Diretrizes Direcionadas aos Supervisores de Turno
  L.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  L.push(`📋 *DIRECIONAMENTO DIRETO PARA SUPERVISORES DE TURNO*`);
  L.push(`*(Com Prazos e Metas de Entrega)*`);
  L.push(``);

  const diretrizes = payload.diretrizesTurno || [];
  if (diretrizes.length === 0) {
    L.push(`_Nenhuma diretriz cadastrada no momento._`);
  } else {
    diretrizes.forEach((dir, i) => {
      const iconPrio = dir.prioridade === "critica" ? "🔴 [CRÍTICA]" : dir.prioridade === "alta" ? "🟡 [ALTA]" : "🔵 [MÉDIA]";
      const iconStatus = dir.status === "concluido" ? "✅ Concluído" : dir.status === "em_andamento" ? "⏳ Em Andamento" : "📌 Pendente";
      
      L.push(`*${i + 1}. [${dir.setor.toUpperCase()}] ${iconPrio}*`);
      L.push(`   🎯 *Ação:* ${dir.acaoEstrategica}`);
      L.push(`   👤 *Responsável:* ${dir.responsavelTurma}${dir.supervisorNome ? ` (${dir.supervisorNome})` : ""}`);
      L.push(`   ⏰ *Prazo Limite:* *${dir.prazoLimite}*`);
      if (dir.metaEsperada) L.push(`   🎯 *Meta:* ${dir.metaEsperada}`);
      L.push(`   📊 *Status:* ${iconStatus}`);
      if (dir.observacoes) L.push(`   💬 *Obs:* ${dir.observacoes}`);
      L.push(``);
    });
  }

  if (payload.prioridadesImediatas && payload.prioridadesImediatas.length > 0) {
    L.push(`⚡ *PRIORIDADES IMEDIATAS:*`);
    payload.prioridadesImediatas.forEach((p, idx) => L.push(`  ${idx + 1}. ${p}`));
    L.push(``);
  }

  if (payload.observacoesGerais) {
    L.push(`💬 *RECOMENDAÇÕES ADM:*`);
    L.push(payload.observacoesGerais);
    L.push(``);
  }

  L.push(`_Documento Gerado pelo Sistema de Gestão Estratégica ADM — Ero Brasil_`);
  return L.join("\n");
}
