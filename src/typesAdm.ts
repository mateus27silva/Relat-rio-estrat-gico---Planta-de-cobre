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

  // Moagem
  producaoMoagemDia: number | "";
  metaProducaoMoagemDia: number;
  producaoMoagemSemana: number | "";
  metaProducaoMoagemSemana: number;
  producaoMoagemMes: number | "";
  metaProducaoMoagemMes: number;
  taxaMi003: number | "";
  taxaMi004: number | "";
  taxaMi005: number | "";
  taxaTotalMoagem: number | "";
  granulometria105: number | "";
  disponibilidadeMoagem: number | "";
  utilizacaoMoagem: number | "";

  // Flotação
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

  // Espessamento Rejeito
  espessadorRejEmOperacao: string;
  densidadeUnderflowRej: number | "";
  solidosRej45ep001: number | "";
  solidosRej45ep002: number | "";
  torqueRejEp001: number | "";
  torqueRejEp002: number | "";
  consumoFloculanteRej: number | "";
  htrLinhas: string;

  // Filtragem
  umidadeBolo: number | "";
  metaUmidadeBolo: number;
  produtividadeFiltro: number | "";
  ciclosFiltro: number | "";
  pesoTortaKg: number | "";
  pressaoCompactacao: number | "";

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

export const DADOS_PADRAO_CONCENTRADOR_ETA: DadosSetorConcentradorEta = {
  estoquePatio: 6800,
  nivelSilo1: 82,
  nivelSilo2: 78,
  autonomiaMinérioHoras: 31.5,
  autonomiaMinérioToneladas: 10560,
  statusRetomador: "Operando",

  producaoMoagemDia: 7100,
  metaProducaoMoagemDia: 7200,
  producaoMoagemSemana: 47800,
  metaProducaoMoagemSemana: 50400,
  producaoMoagemMes: 198000,
  metaProducaoMoagemMes: 216000,
  taxaMi003: 205,
  taxaMi004: 198,
  taxaMi005: 202,
  taxaTotalMoagem: 605,
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

  espessadorRejEmOperacao: "Ambos",
  densidadeUnderflowRej: 1420,
  solidosRej45ep001: 56.5,
  solidosRej45ep002: 57.0,
  torqueRejEp001: 34,
  torqueRejEp002: 36,
  consumoFloculanteRej: 17.5,
  htrLinhas: "Linhas 1, 2 e 3 em operação estável. Past Fill ativo.",

  umidadeBolo: 9.1,
  metaUmidadeBolo: 9.5,
  produtividadeFiltro: 32.5,
  ciclosFiltro: 26,
  pesoTortaKg: 8200,
  pressaoCompactacao: 235,

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
    L.push(`📊 *DESEMPENHO DO CIRCUITO ÚMIDO (REALIZADO VS METAS)*`);
    L.push(`────────────────────────────`);
    L.push(`• Moagem Dia: *${ce.producaoMoagemDia ? ce.producaoMoagemDia.toLocaleString("pt-BR") : "-"} t* (Meta: ${ce.metaProducaoMoagemDia.toLocaleString("pt-BR")} t)`);
    L.push(`• Moagem Semana: *${ce.producaoMoagemSemana ? ce.producaoMoagemSemana.toLocaleString("pt-BR") : "-"} t* (Meta: ${ce.metaProducaoMoagemSemana.toLocaleString("pt-BR")} t)`);
    L.push(`• Moagem Mês: *${ce.producaoMoagemMes ? ce.producaoMoagemMes.toLocaleString("pt-BR") : "-"} t* (Meta: ${ce.metaProducaoMoagemMes.toLocaleString("pt-BR")} t)`);
    L.push(`• Metal Cobre Dia: *${ce.metalContidoDia || "-"} t Cu* (Meta: ${ce.metaMetalContidoDia} t Cu)`);
    L.push(`• Metal Cobre Semana: *${ce.metalContidoSemana || "-"} t Cu* (Meta: ${ce.metaMetalContidoSemana} t Cu)`);
    L.push(`• Metal Cobre Mês: *${ce.metalContidoMes || "-"} t Cu* (Meta: ${ce.metaMetalContidoMes} t Cu)`);
    L.push(`• Recuperação Metalúrgica: *${ce.recuperacaoMetalurgica || "-"}%* (Meta: ${ce.metaRecuperacao}%)`);
    L.push(`• Teores Cu: Alimentação: *${ce.teorAlimentacaoCu || "-"}%* | Conc: *${ce.teorConcentradoCu || "-"}%* | Rej: *${ce.teorRejeitoCu || "-"}%*`);
    L.push(`• Autonomia Silos/Pátio: *${ce.autonomiaMinérioHoras || "-"} h* (${ce.autonomiaMinérioToneladas ? ce.autonomiaMinérioToneladas.toLocaleString("pt-BR") : "-"} t)`);
    L.push(`• Umidade Bolo Filtro: *${ce.umidadeBolo || "-"}%* (Meta: ≤ ${ce.metaUmidadeBolo}%) | ETA Reuso: *${ce.taxaRecirculacaoReuso || "-"}%*`);
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
