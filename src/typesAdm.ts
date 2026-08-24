/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CircuitoTipo = "seco" | "umido";

export type HorizontePlanejamento = "dia" | "semana" | "fim_de_semana" | "mes";

export type PrioridadeDiretriz = "critica" | "alta" | "media";

export type StatusDiretriz = "pendente" | "em_andamento" | "concluido";

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

export interface DadosSetorBritagemRebritagem {
  // Britagem Primária
  taxaBritagem: number | "";
  metaTaxaBritagem: number;
  disponibilidadeBritagem: number | "";
  utilizacaoBritagem: number | "";
  posicaoManto: string;
  afericaoBritador: string;
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
  recursosManutencao: string;
  alertasOperacionais: string[];
  planoBlindagemFds?: string;
}

export interface RelatorioAdmPayload {
  circuitoTipo: CircuitoTipo; // "seco" (Cominuição) ou "umido" (Beneficiamento)
  dataEmissao: string;
  periodoReferencia: string;
  supervisorAdmResponsavel: string;
  engenheiroProcesso?: string;
  gerentePlanta?: string;
  
  // Setor 1: Britagem + Rebritagem (Circuito Seco)
  dadosBritagemRebritagem: DadosSetorBritagemRebritagem;
  
  // Setor 2: Concentrador + ETA (Circuito Úmido)
  dadosConcentradorEta: DadosSetorConcentradorEta;

  // Estratégias por Horizonte
  estrategiaDia: EstrategiaPorHorizonte;
  estrategiaSemana: EstrategiaPorHorizonte;
  estrategiaFds: EstrategiaPorHorizonte;
  estrategiaMes: EstrategiaPorHorizonte;

  // Diretrizes com Prazos para Supervisores de Turno
  diretrizesTurno: DiretrizSupervisorTurno[];

  // Observações e Recomendações Gerais
  observacoesGerais: string;
  prioridadesImediatas: string[];
}

export const DADOS_PADRAO_BRITAGEM_REBRITAGEM: DadosSetorBritagemRebritagem = {
  taxaBritagem: 980,
  metaTaxaBritagem: 1000,
  disponibilidadeBritagem: 88.5,
  utilizacaoBritagem: 82.0,
  posicaoManto: "35%",
  afericaoBritador: "Conforme",
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
    observacoes: "Manter dosagem de floculante ajustada conforme taxa de alimentação."
  }
];

// RELATÓRIO INICIAL CIRCUITO SECO (COMINUIÇÃO)
export const RELATORIO_ADM_SECO_INICIAL: RelatorioAdmPayload = {
  circuitoTipo: "seco",
  dataEmissao: new Date().toISOString().split("T")[0],
  periodoReferencia: "Semana Operacional 34 — Agosto/2026",
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
      "Priorizar alimentação direta de minério de alta densidade (MSB + Surubim) mantendo taxa horária acima de 1.000 t/h.",
      "Manter estoque dos silos de finos acima de 80% em todas as passagens de turno.",
      "Inspecionar telas da peneira PE002 e estado de desgaste do manto do britador primário."
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
      "Equalizar a pilha intermediária até atingir 12.000 t de pulmão estratégico.",
      "Executar troca de telas desgastadas na parada de manutenção preventiva de quinta-feira.",
      "Reduzir microparadas operacionais nas trocas de turno através do alinhamento prévio dos operadores."
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
      "Sexta-feira às 18:00: Silos 1 e 2 com no mínimo 85% de nível e pátio com 8.000 t.",
      "Garantir autonomia mínima de finos superior a 30 horas para a moagem.",
      "Deixar equipamentos de britagem e correias transportadoras limpos e inspecionados."
    ],
    recursosManutencao: "Equipe de plantão escalada (Mecânico e Eletricista de área seca). Turno de apoio de prontidão.",
    alertasOperacionais: [
      "Proibido iniciar o turno noturno de domingo com silos abaixo de 50%.",
      "Qualquer anomalia no retomador ou correias de finos deve ser comunicada imediatamente ao plantonista ADM."
    ],
    planoBlindagemFds: "Checklist de blindagem do circuito seco deve ser validado pelo supervisor ADM na sexta-feira até as 17:30."
  },
  estrategiaMes: {
    titulo: "Estratégia Mensal Consolidada (MTD) — Circuito Seco",
    focoPrincipal: "Cumprimento integral da meta orçada de 340.000 t de minério britado e cominuído no mês com controle de custos e máxima segurança.",
    metaAlimentacaoBritagem: 340000,
    metaTaxaHoraria: 1020,
    metaDisponibilidade: 89.5,
    diretrizesPrioritarias: [
      "Elevar a utilização global da britagem primária para 85% até o fechamento do mês.",
      "Garantir padrão granulométrico com retido 1/2'' abaixo de 11.5% na alimentação dos moinhos.",
      "Consolidar plano de manutenção preventiva e gestão de peças sobressalentes no SAP."
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
  dataEmissao: new Date().toISOString().split("T")[0],
  periodoReferencia: "Semana Operacional 34 — Agosto/2026",
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
      "Manter taxa horária nos moinhos MI003, MI004 e MI005 com densidade controlada nos ciclones.",
      "Flotação deve manter pH em 9.6 fixo e dosagem de CMC em 190 g/t para garantir recuperação > 89%.",
      "Garantir liberação rápida das tortas de filtro com umidade abaixo de 9.3%."
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
      "Executar lavagem programada das células de flotação na parada de manutenção de quinta-feira.",
      "Otimizar dosagens de reagentes (redução de 5% no consumo específico sem perda de recuperação metalúrgica).",
      "Assegurar que a umidade média da torta no filtro se mantenha abaixo de 9.3%."
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
      "Sexta-feira 18h: Tanques de reagentes da flotação e ETA abastecidos para 72h de operação.",
      "Tanques de concentrado em 50% de nível na sexta-feira à noite.",
      "Caçambas de concentrado e pátio de filtragem organizados com área livre para 3 dias de produção."
    ],
    recursosManutencao: "Equipe de plantão escalada (Eletricista, Mecânico, Instrumentista). Turno de apoio de prontidão.",
    alertasOperacionais: [
      "Proibida a operação com nível de silo abaixo de 40% durante a madrugada.",
      "Supervisor de plantão do ADM deve ser acionado em caso de elevação crítica de torque nos espessadores."
    ],
    planoBlindagemFds: "Checklist de blindagem do circuito úmido deve ser assinado pelo supervisor na sexta-feira até as 17:00."
  },
  estrategiaMes: {
    titulo: "Estratégia Mensal Consolidada (MTD) — Circuito Úmido",
    focoPrincipal: "Cumprimento integral do plano orçado de 2.450 t de metal cobre contido com máxima recuperação (>88.5%) e custos controlados.",
    metaProducaoCobreContido: 2450.0,
    metaAlimentacaoMoagem: 216000,
    metaRecuperacao: 88.5,
    diretrizesPrioritarias: [
      "Elevar a utilização global da moagem de 88% para 91% até o final do mês.",
      "Aumentar o teor do concentrado comercial para 34.0% Cu reduzindo frete rodoviário.",
      "Consolidar a taxa de recirculação de água da ETA em 86.5% para compliance ambiental."
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
