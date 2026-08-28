/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DadosSetorBritagemRebritagem,
  DadosSetorConcentradorEta,
  DiretrizSupervisorTurno,
  CircuitoTipo
} from "../typesAdm";

export interface RelatorioTurnoAnexo {
  id: string;
  nomeArquivo: string;
  dataTurno: string;
  turma: string; // "Turma A" | "Turma B" | "Turma C" | "Turma D"
  turnoOperacional: string; // "Diurno (07h - 19h)" | "Noturno (19h - 07h)"
  supervisorTurno?: string;
  dataUpload: string;
  tamanhoKb?: number;
  rawText?: string;
  
  // Dados extraídos por setor
  dadosSeco?: {
    // Britagem Primária
    produtividadeBritagem?: number;
    disponibilidadeBritagem?: number;
    utilizacaoBritagem?: number;
    posicaoManto?: string;
    afericaoBritador?: string;
    paradasManutencaoBrit?: number;
    paradasOutBrit?: number;
    estoqueMsb?: number;
    estoqueSurubim?: number;
    estoqueVermelhos?: number;
    estoqueSucuarana?: number;
    estoqueTotalRom?: number;

    // Rebritagem
    producaoBypass?: number;
    producaoPatio?: number;
    producaoTotalRebritagem?: number;
    produtividadeRebritagem?: number;
    disponibilidadeRebritagem?: number;
    utilizacaoRebritagem?: number;
    retidoMeiaPol?: number;
    pilhaIntermediaria?: number;
    paradasManutencaoReb?: number;
    paradasOutReb?: number;

    // Pátio e Silos
    estoquePatio?: number;
    nivelSilo1?: number;
    nivelSilo2?: number;
    autonomiaMinério?: number;
    statusRetomador?: string;
    disponibilidadePatioSilos?: number;

    // Itens Críticos Seco
    atividadesRealizadas?: string[];
    pendenciasCriticas?: string[];
    observacoes?: string[];
  };

  dadosUmido?: {
    // Moagem
    producaoMoagem?: number;
    taxaMi003?: number;
    taxaMi004?: number;
    taxaMi005?: number;
    taxaTotalMoagem?: number;
    percentual105um?: number;
    disponibilidadeMoagem?: number;
    utilizacaoMoagem?: number;

    // Remoagem
    taxaRemoagem?: number;
    densidadeRemoagem?: number;
    torqueRemoagem?: number;
    potenciaMoinhoKwh?: number;

    // Flotação Cu
    teorAlimCu?: number;
    teorConcCu?: number;
    teorRejeitoCu?: number;
    recuperacaoMetalurgica?: number;
    metalContidoCu?: number;
    concentradoProduzido?: number;
    phLinhaPrincipal?: number;
    consumoColetor?: number;
    consumoEspumante?: number;
    consumoDispersante?: number;
    consumoCmc?: number;
    consumoAmidex?: number;

    // Espessamento Conc
    espessadorConcOp?: string;
    densidadeUnderflowConc?: number;
    solidosConc44ep001?: number;
    solidosConc44ep002?: number;
    nivelTanqueConc?: number;
    consumoFloculanteConc?: number;
    elevacaoRakeConc?: number;

    // Espessamento Rejeito
    espessadorRejOp?: string;
    densidadeUnderflowRej?: number;
    solidosRej45ep001?: number;
    solidosRej45ep002?: number;
    solidosRejBh02?: number;
    solidosRejBh03?: number;
    torqueRejEp001?: number;
    torqueRejEp002?: number;
    consumoFloculanteRej?: number;
    htrLinhasRej?: string;

    // Filtro Prensa
    umidadeBolo?: number;
    produtividadeFiltro?: number;
    ciclosFiltro?: number;
    pesoTortaKg?: number;
    pressaoCompactacao?: number;
    disponibilidadeFiltro?: number;
    utilizacaoFiltro?: number;

    // Utilidades / ETA
    pressaoAr?: number;
    etaAguaRecuperada?: number;
    etaAguaBruta?: number;
    nivelCamaraA?: number;

    // Itens Críticos Úmido
    atividadesRealizadas?: string[];
    pendenciasCriticas?: string[];
    observacoes?: string[];
  };
}

// Relatórios de exemplo reais baseados nos PDFs de passagem de turno fornecidos
export const RELATORIOS_ANEXOS_SEMANA_EXEMPLO: RelatorioTurnoAnexo[] = [
  {
    id: "turno_b_2008_diurno",
    nomeArquivo: "Relatorio_Turno_TurmaB_20082026_Diurno.pdf",
    dataTurno: "20/08/2026",
    turma: "Turma B",
    turnoOperacional: "Diurno (07h - 19h)",
    supervisorTurno: "Supervisor Turma B",
    dataUpload: "21/08/2026 às 07:01",
    tamanhoKb: 420,
    dadosSeco: {
      produtividadeBritagem: 933,
      disponibilidadeBritagem: 100,
      utilizacaoBritagem: 66.7,
      posicaoManto: "10%",
      afericaoBritador: "Conforme",
      paradasManutencaoBrit: 0,
      paradasOutBrit: 4.0,
      estoqueMsb: 3404.50,
      estoqueSurubim: 1850.46,
      estoqueVermelhos: 809.78,
      estoqueSucuarana: 1850.46,
      estoqueTotalRom: 7915.2,
      producaoBypass: 4410,
      producaoPatio: 0,
      producaoTotalRebritagem: 4410,
      produtividadeRebritagem: 1000,
      disponibilidadeRebritagem: 100,
      utilizacaoRebritagem: 100,
      retidoMeiaPol: 12.0,
      pilhaIntermediaria: 11000,
      estoquePatio: 0,
      nivelSilo1: 50,
      nivelSilo2: 60,
      autonomiaMinério: 2640,
      statusRetomador: "Standby",
      atividadesRealizadas: [
        "Realizada limpeza no batedor, na cauda da 41TC001 e nos filtros de água.",
        "Retirado placas que travaram no eletroímã da 41TC002 e desobstruído shut da 42TC004.",
        "Finalizada a pilha 44 e recuado o retomador 43RM001."
      ],
      pendenciasCriticas: [
        "41BR001 Vazamento de óleo nos acumuladores hidráulico.",
        "41TC001 Furo na tubulação de ar comprimido próximo ao shut de alimentação.",
        "41TC001 Vazamento de óleo hidráulico no contra eixo e vários refletores apagados no túnel.",
        "43RM001 Tambor da correia da ponte sem revestimento e emenda danificada."
      ],
      observacoes: [
        "Britagem: Produção parada devido nível alto da pilha intermediária.",
        "Rebritagem: Das 00h37 às 01h47 falha na chave de desalinhamento lado B da 42TC004."
      ]
    },
    dadosUmido: {
      producaoMoagem: 4839,
      taxaMi003: 204,
      taxaMi004: 201,
      taxaMi005: 202,
      taxaTotalMoagem: 607,
      percentual105um: 62.2,
      disponibilidadeMoagem: 100,
      utilizacaoMoagem: 100,
      teorAlimCu: 0.8694,
      teorConcCu: 35.76,
      teorRejeitoCu: 0.1230,
      recuperacaoMetalurgica: 86.1,
      metalContidoCu: 36.22,
      concentradoProduzido: 101.3,
      phLinhaPrincipal: 9.4,
      consumoColetor: 38,
      consumoEspumante: 32,
      consumoDispersante: 26,
      consumoCmc: 218,
      consumoAmidex: 55,
      espessadorConcOp: "44EP002",
      solidosConc44ep002: 65,
      nivelTanqueConc: 40,
      elevacaoRakeConc: 0,
      espessadorRejOp: "Ambos",
      solidosRej45ep001: 63,
      solidosRej45ep002: 65,
      solidosRejBh02: 72,
      solidosRejBh03: 63,
      torqueRejEp001: 8.8,
      torqueRejEp002: 9.0,
      consumoFloculanteRej: 2800,
      htrLinhasRej: "Linha 1 (3h), Linha 2 (7h), Linha 3 (7h), Past Fill (4h)",
      umidadeBolo: 10.13,
      produtividadeFiltro: 28,
      ciclosFiltro: 14,
      pesoTortaKg: 7000,
      pressaoCompactacao: 230,
      disponibilidadeFiltro: 100,
      utilizacaoFiltro: 73.6,
      atividadesRealizadas: [
        "Colocados 43BC004 e 43BC005 em operação e moinho 43MI005 ajustado para 600 t/h.",
        "43BB017 substituída a gaxeta e lavagem dupla das lonas no filtro prensa."
      ],
      pendenciasCriticas: [
        "43HC024 furo no cone inferior e 43HC026 apex furado.",
        "43BB013 carretel de sucção furado e 43BB020 vazamento no carretel.",
        "44FL004 substituir placas 04, 12 e 30 com membranas danificadas.",
        "45BB05/026 tubulações de selagem com furos e 45BB34 em operação apenas manual."
      ],
      observacoes: [
        "Filtro prensa com 3.17h de paradas por outros aguardando densidade.",
        "Flotação: 43MF035 quebrou as correias de acionamento."
      ]
    }
  },
  {
    id: "turno_c_2208_noturno",
    nomeArquivo: "Relatorio_Turno_TurmaC_22082026_Noturno.pdf",
    dataTurno: "22/08/2026",
    turma: "Turma C",
    turnoOperacional: "Noturno (19h - 07h)",
    supervisorTurno: "Supervisor Turma C",
    dataUpload: "22/08/2026 às 19:44",
    tamanhoKb: 380,
    dadosSeco: {
      produtividadeBritagem: 3179,
      disponibilidadeBritagem: 100,
      utilizacaoBritagem: 91.7,
      posicaoManto: "10%",
      afericaoBritador: "Conforme",
      paradasManutencaoBrit: 0,
      paradasOutBrit: 1.0,
      estoqueMsb: 3132,
      estoqueSurubim: 5596,
      estoqueVermelhos: 741,
      estoqueSucuarana: 5669,
      estoqueTotalRom: 6418.7,
      producaoBypass: 5911,
      producaoPatio: 861,
      producaoTotalRebritagem: 6772,
      produtividadeRebritagem: 1064,
      disponibilidadeRebritagem: 100,
      utilizacaoRebritagem: 100,
      retidoMeiaPol: 11.0,
      pilhaIntermediaria: 4000,
      estoquePatio: 861,
      nivelSilo1: 81,
      nivelSilo2: 82,
      autonomiaMinério: 4773,
      statusRetomador: "Manutenção",
      atividadesRealizadas: [
        "Remoção de um tirante preso no alimentador da britagem.",
        "Reposição de proteção de ventoinha na 42PE007/42PE005 e tela no 1° deck PE009."
      ],
      pendenciasCriticas: [
        "42BR004 Necessidade de substituição do revestimento de desgaste.",
        "43RM001 Retomador indisponível por manutenção mecânica."
      ],
      observacoes: [
        "Rebritagem manteve ritmo de 1.064 t/h sustentando abastecimento dos silos."
      ]
    },
    dadosUmido: {
      producaoMoagem: 4318,
      taxaMi003: 208,
      taxaMi004: 204,
      taxaMi005: 206,
      taxaTotalMoagem: 618,
      disponibilidadeMoagem: 100,
      utilizacaoMoagem: 100,
      taxaRemoagem: 275,
      teorAlimCu: 0.85,
      teorConcCu: 32.6,
      teorRejeitoCu: 0.10,
      recuperacaoMetalurgica: 88.5,
      metalContidoCu: 32.48,
      concentradoProduzido: 99.6,
      phLinhaPrincipal: 9.5,
      consumoColetor: 35,
      espessadorConcOp: "44EP002",
      densidadeUnderflowConc: 1900,
      nivelTanqueConc: 38,
      elevacaoRakeConc: 0,
      espessadorRejOp: "Ambos",
      densidadeUnderflowRej: 1700,
      solidosRej45ep001: 64,
      solidosRej45ep002: 64,
      torqueRejEp001: 9.0,
      torqueRejEp002: 8.0,
      consumoFloculanteRej: 2800,
      atividadesRealizadas: [
        "Ajuste da flotação mantendo recuperação em 88.5% e pH em 9.5."
      ],
      pendenciasCriticas: [
        "pH da segunda linha em 9.5 (alerta, meta 10.5).",
        "Corrente do 44EP002 em 2.93 A abaixo da referência nominal."
      ],
      observacoes: [
        "Utilidades: 100% de disponibilidade em ar comprimido e água de processo."
      ]
    }
  },
  {
    id: "turno_c_2308_noturno",
    nomeArquivo: "Relatorio_Turno_TurmaC_23082026_Noturno.pdf",
    dataTurno: "23/08/2026",
    turma: "Turma C",
    turnoOperacional: "Noturno (19h - 07h)",
    supervisorTurno: "Supervisor Turma C",
    dataUpload: "23/08/2026 às 07:11",
    tamanhoKb: 450,
    dadosSeco: {
      produtividadeBritagem: 703,
      disponibilidadeBritagem: 100,
      utilizacaoBritagem: 83.3,
      posicaoManto: "10%",
      afericaoBritador: "Conforme",
      paradasManutencaoBrit: 0,
      paradasOutBrit: 2.0,
      estoqueMsb: 958,
      estoqueSurubim: 4212,
      estoqueVermelhos: 286.99,
      estoqueSucuarana: 5669,
      estoqueTotalRom: 6918.2,
      producaoBypass: 6714,
      producaoPatio: 1448,
      producaoTotalRebritagem: 8162,
      produtividadeRebritagem: 961,
      disponibilidadeRebritagem: 100,
      utilizacaoRebritagem: 92.3,
      retidoMeiaPol: 10.5,
      pilhaIntermediaria: 5000,
      estoquePatio: 2524,
      nivelSilo1: 75,
      nivelSilo2: 75,
      autonomiaMinério: 6124,
      statusRetomador: "Parado (12h Out)",
      atividadesRealizadas: [
        "Transporte de minério de Surubim e Vermelhos e retorno do transporte MSB às 20h.",
        "Iniciada retomada de Surubim e comporta virada para formação de cabeção."
      ],
      pendenciasCriticas: [
        "42BR004 Substituição de revestimento pendente.",
        "42BR001 MCM para substituir mangote de envio de óleo lubrificante.",
        "42EV-001 Tambor de acionamento das lanças sem revestimento."
      ],
      observacoes: [
        "Das 19h30 às 19h55 baixando nível do silo 03 e aferindo britadores secundários."
      ]
    },
    dadosUmido: {
      producaoMoagem: 8558,
      taxaMi003: 206,
      taxaMi004: 204,
      taxaMi005: 205,
      taxaTotalMoagem: 615,
      percentual105um: 62.0,
      disponibilidadeMoagem: 100,
      utilizacaoMoagem: 100,
      taxaRemoagem: 275,
      densidadeRemoagem: 1.58,
      torqueRemoagem: 76,
      teorAlimCu: 0.8143,
      teorConcCu: 34.09,
      teorRejeitoCu: 0.0986,
      recuperacaoMetalurgica: 88.1,
      metalContidoCu: 61.39,
      concentradoProduzido: 180.1,
      phLinhaPrincipal: 9.5,
      consumoColetor: 35,
      consumoEspumante: 26,
      consumoDispersante: 25,
      consumoCmc: 200,
      consumoAmidex: 60,
      espessadorConcOp: "44EP002",
      densidadeUnderflowConc: 1900,
      solidosConc44ep001: 65,
      solidosConc44ep002: 65,
      nivelTanqueConc: 55,
      consumoFloculanteConc: 25,
      elevacaoRakeConc: 0,
      espessadorRejOp: "Ambos",
      densidadeUnderflowRej: 1700,
      solidosRej45ep001: 66,
      solidosRej45ep002: 66,
      solidosRejBh02: 71,
      solidosRejBh03: 62,
      torqueRejEp001: 9.0,
      torqueRejEp002: 8.0,
      consumoFloculanteRej: 2800,
      htrLinhasRej: "Linhas 1, 2 e 3 (12h cada), Linha 4 (8h), Past Fill (3h)",
      umidadeBolo: 8.18,
      produtividadeFiltro: 29,
      ciclosFiltro: 36,
      pesoTortaKg: 8000,
      pressaoCompactacao: 230,
      disponibilidadeFiltro: 100,
      utilizacaoFiltro: 100,
      pressaoAr: 7.0,
      etaAguaRecuperada: 75,
      atividadesRealizadas: [
        "43BB039 desobstrução de mangotes de sucção e recalque.",
        "Desobstruídos 04 downcomers (01, 03, 17 e 21) e 43MF044 reposto correias.",
        "Limpeza da baia de concentrado e atingidos 36 ciclos no filtro prensa."
      ],
      pendenciasCriticas: [
        "43BB018 vazamento na bomba e 43BB051/052 bombas inoperantes travadas.",
        "44EP001 em manutenção no sistema de elevação do rake.",
        "45BB018 baixa eficiência na pressão de água de selagem."
      ],
      observacoes: [
        "Moagem atingiu produção recorde de 8.558 t com taxa sustentada de 615 t/h.",
        "Umidade do bolo no filtro em 8.18% (excelente padrão operacional)."
      ]
    }
  },
  {
    id: "turno_d_2108_diurno",
    nomeArquivo: "Relatorio_Turno_TurmaD_21082026_Diurno.pdf",
    dataTurno: "21/08/2026",
    turma: "Turma D",
    turnoOperacional: "Diurno (07h - 19h)",
    supervisorTurno: "Supervisor Turma D",
    dataUpload: "21/08/2026 às 18:50",
    tamanhoKb: 430,
    dadosSeco: {
      produtividadeBritagem: 5438,
      disponibilidadeBritagem: 91.7,
      utilizacaoBritagem: 91.7,
      posicaoManto: "10%",
      afericaoBritador: "Conforme",
      paradasManutencaoBrit: 1.0,
      paradasOutBrit: 0,
      estoqueMsb: 5488,
      estoqueSurubim: 3516,
      estoqueVermelhos: 1818,
      estoqueSucuarana: 5669,
      estoqueTotalRom: 16500,
      producaoBypass: 5889,
      producaoPatio: 0,
      producaoTotalRebritagem: 5889,
      produtividadeRebritagem: 913,
      disponibilidadeRebritagem: 83.3,
      utilizacaoRebritagem: 50.0,
      retidoMeiaPol: 11.1,
      pilhaIntermediaria: 3000,
      estoquePatio: 0,
      nivelSilo1: 35,
      nivelSilo2: 30,
      autonomiaMinério: 1560,
      statusRetomador: "Manutenção",
      atividadesRealizadas: [
        "Limpeza nos trilhos da empilhadeira e liberação da britagem após manutenção."
      ],
      pendenciasCriticas: [
        "42TC010 rasgou 15 metros aproximadamente por conta de haste travada no shut.",
        "Válvula de spray da britagem dando passagem e furo na tubulação de ar comprimido."
      ],
      observacoes: [
        "Parada programada da britagem de 08:30h às 16:50h para manutenção mecânica.",
        "Substituição da correia da TC da ponte em andamento."
      ]
    },
    dadosUmido: {
      producaoMoagem: 14400,
      taxaMi003: 198,
      taxaMi004: 198,
      taxaMi005: 198,
      taxaTotalMoagem: 594,
      disponibilidadeMoagem: 100,
      utilizacaoMoagem: 100,
      teorAlimCu: 0.9045,
      teorConcCu: 31.41,
      teorRejeitoCu: 0.1290,
      recuperacaoMetalurgica: 86.1,
      metalContidoCu: 112.14,
      concentradoProduzido: 357.0,
      phLinhaPrincipal: 9.3,
      consumoColetor: 35,
      consumoEspumante: 25,
      consumoDispersante: 25,
      consumoCmc: 160,
      consumoAmidex: 60,
      espessadorConcOp: "44EP002",
      densidadeUnderflowConc: 1820,
      solidosConc44ep002: 65,
      espessadorRejOp: "Ambos",
      solidosRej45ep001: 64,
      solidosRej45ep002: 65,
      torqueRejEp001: 8.0,
      torqueRejEp002: 10.0,
      atividadesRealizadas: [
        "45HC012 colocado flange na válvula danificada e eliminado vazamento.",
        "Substituídas correias de acionamento da 43BB087."
      ],
      pendenciasCriticas: [
        "44FL004 vazamento de óleo hidráulico e bandeja coletora com vazamentos.",
        "44EP002 com válvula mestre travada aberta.",
        "44EP001 motor de elevação com sobrecarga quando passa de 9 polegadas.",
        "45EP001 redutor com vazamento de óleo no lado A."
      ],
      observacoes: [
        "43MI004 parado às 16h30 por baixo estoque nos silos decorrente da 42TC010.",
        "Filtro prensa recebido parado por baixa densidade, normalizado às 10h45."
      ]
    }
  },
  {
    id: "turno_d_2208_diurno",
    nomeArquivo: "Relatorio_Turno_TurmaD_22082026_Diurno.pdf",
    dataTurno: "22/08/2026",
    turma: "Turma D",
    turnoOperacional: "Diurno (07:00 - 19:00)",
    supervisorTurno: "Supervisor Turma D",
    dataUpload: "22/08/2026 às 18:36",
    tamanhoKb: 460,
    dadosSeco: {
      produtividadeBritagem: 566,
      disponibilidadeBritagem: 91.7,
      utilizacaoBritagem: 83.3,
      posicaoManto: "10%",
      afericaoBritador: "Conforme",
      paradasManutencaoBrit: 1.0,
      paradasOutBrit: 1.0,
      estoqueMsb: 3847,
      estoqueSurubim: 0,
      estoqueVermelhos: 287,
      estoqueSucuarana: 5669,
      estoqueTotalRom: 9803,
      producaoBypass: 7947,
      producaoPatio: 423,
      producaoTotalRebritagem: 8370,
      produtividadeRebritagem: 1009,
      disponibilidadeRebritagem: 83.3,
      utilizacaoRebritagem: 66.7,
      retidoMeiaPol: 10.3,
      pilhaIntermediaria: 4000,
      estoquePatio: 1359,
      nivelSilo1: 85,
      nivelSilo2: 85,
      autonomiaMinério: 5439,
      statusRetomador: "Standby (Liberado às 16h)",
      atividadesRealizadas: [
        "Limpeza de material acumulado sob a 42TC004 e retirada de tirante preso na 41TC001.",
        "Manutenção substituiu correia da TC da ponte, liberada e testada às 16h."
      ],
      pendenciasCriticas: [
        "42TC010 com parte grampeada aguardando vulcanização definitiva.",
        "Redução de ritmo do BR004 para substituição de revestimentos.",
        "41TQ001 recuperar spray danificado e válvula solenoide dando passagem."
      ],
      observacoes: [
        "Rebritagem produziu 8.370 t atingindo 1.009 t/h de taxa horária.",
        "Silos da usina reabastecidos para 85% garantindo autonomia de 5.439 t."
      ]
    },
    dadosUmido: {
      producaoMoagem: 7300,
      taxaMi003: 203,
      taxaMi004: 203,
      taxaMi005: 203,
      taxaTotalMoagem: 609,
      disponibilidadeMoagem: 91.7,
      utilizacaoMoagem: 91.7,
      taxaRemoagem: 190,
      densidadeRemoagem: 1.52,
      torqueRemoagem: 78,
      potenciaMoinhoKwh: 2650,
      teorAlimCu: 0.9484,
      teorConcCu: 35.57,
      teorRejeitoCu: 0.1128,
      recuperacaoMetalurgica: 88.4,
      metalContidoCu: 61.2,
      concentradoProduzido: 172.1,
      phLinhaPrincipal: 9.4,
      consumoColetor: 35.66,
      consumoEspumante: 22,
      consumoDispersante: 26,
      consumoCmc: 140,
      consumoAmidex: 55,
      espessadorConcOp: "44EP002",
      densidadeUnderflowConc: 1900,
      solidosConc44ep002: 65,
      nivelTanqueConc: 50,
      consumoFloculanteConc: 800,
      elevacaoRakeConc: 0,
      espessadorRejOp: "Ambos",
      solidosRej45ep001: 68,
      solidosRej45ep002: 67,
      solidosRejBh02: 76,
      solidosRejBh03: 71,
      torqueRejEp001: 12.0,
      torqueRejEp002: 8.0,
      consumoFloculanteRej: 2800,
      htrLinhasRej: "Linha 1, 2, 3 (12h cada), Linha 4 (8h), Past Fill (5.66h)",
      umidadeBolo: 9.77,
      produtividadeFiltro: 32,
      ciclosFiltro: 4,
      pesoTortaKg: 7000,
      pressaoCompactacao: 230,
      disponibilidadeFiltro: 100,
      utilizacaoFiltro: 91.7,
      pressaoAr: 8.0,
      etaAguaRecuperada: 80,
      etaAguaBruta: 40,
      nivelCamaraA: 70,
      atividadesRealizadas: [
        "Substituída a gaxeta da 43BB077 e eliminado furo no distribuidor 07.",
        "Limpeza da baia de concentrado e troca de gaxeta da 43BB078 durante janela operacional."
      ],
      pendenciasCriticas: [
        "43DP007 válvula 43XV117 com vazamento pelo reparo.",
        "43BB039 sem recalcar, manutenção atuando no circuito de moinhos.",
        "44FL004 placas 04, 12, 30 isoladas e placas 06, 32, 34, 40 com acúmulo de concentrado.",
        "45EP001 vazamento pelo redutor lado A e 45BB007 substituir chave de fluxo."
      ],
      observacoes: [
        "Moagem atingiu 7.300 t com taxa média de 609 t/h.",
        "Filtro prensa com 4 ciclos devido espera para elevação de densidade no espessador 02."
      ]
    }
  }
];

/**
 * Compila os dados dos relatórios de turno selecionados aplicando estritamente
 * o filtro de escopo do circuito (Seco vs Úmido).
 */
export function compilarRelatoriosTurno(
  relatorios: RelatorioTurnoAnexo[],
  circuito: CircuitoTipo,
  dadosAtuaisBR: DadosSetorBritagemRebritagem,
  dadosAtuaisCE: DadosSetorConcentradorEta,
  diretrizesAtuais: DiretrizSupervisorTurno[]
): {
  dadosBRAtualizados: DadosSetorBritagemRebritagem;
  dadosCEAtualizados: DadosSetorConcentradorEta;
  diretrizesAtualizadas: DiretrizSupervisorTurno[];
  resumoCompilacao: {
    totalRelatorios: number;
    turmasPresentes: string[];
    setoresCompilados: string[];
    acoesGeradas: number;
    resumoTexto: string;
  };
} {
  if (relatorios.length === 0) {
    return {
      dadosBRAtualizados: dadosAtuaisBR,
      dadosCEAtualizados: dadosAtuaisCE,
      diretrizesAtualizadas: diretrizesAtuais,
      resumoCompilacao: {
        totalRelatorios: 0,
        turmasPresentes: [],
        setoresCompilados: [],
        acoesGeradas: 0,
        resumoTexto: "Nenhum relatório selecionado para compilação."
      }
    };
  }

  const turmasSet = new Set<string>();
  relatorios.forEach(r => turmasSet.add(r.turma));
  const turmasList = Array.from(turmasSet);

  if (circuito === "seco") {
    // COMPILAR ESTRITAMENTE CIRCUITO SECO
    const relatoriosComSeco = relatorios.filter(r => !!r.dadosSeco);
    let totalTaxaBrit = 0;
    let countTaxaBrit = 0;
    let totalDispBrit = 0;
    let totalUtilBrit = 0;
    let totalProdReb = 0;
    let totalTaxaReb = 0;
    let countTaxaReb = 0;
    let totalDispReb = 0;
    let totalUtilReb = 0;
    let totalRetido = 0;
    let countRetido = 0;

    // Últimos estoques informados
    let lastEstoqueMsb = dadosAtuaisBR.estoqueMsb;
    let lastEstoqueSurubim = dadosAtuaisBR.estoqueSurubim;
    let lastEstoqueVermelhos = dadosAtuaisBR.estoqueVermelhos;
    let lastEstoqueSucuarana = dadosAtuaisBR.estoqueSucuarana;
    let lastPilhaInter = dadosAtuaisBR.pilhaIntermediaria;

    const pendenciasSeco: Array<{ turma: string; supervisor?: string; texto: string }> = [];
    const observacoesSeco: string[] = [];

    relatoriosComSeco.forEach(r => {
      const s = r.dadosSeco!;
      if (s.produtividadeBritagem) {
        totalTaxaBrit += s.produtividadeBritagem;
        countTaxaBrit++;
      }
      if (s.disponibilidadeBritagem !== undefined) totalDispBrit += s.disponibilidadeBritagem;
      if (s.utilizacaoBritagem !== undefined) totalUtilBrit += s.utilizacaoBritagem;

      if (s.producaoTotalRebritagem) totalProdReb += s.producaoTotalRebritagem;
      if (s.produtividadeRebritagem) {
        totalTaxaReb += s.produtividadeRebritagem;
        countTaxaReb++;
      }
      if (s.disponibilidadeRebritagem !== undefined) totalDispReb += s.disponibilidadeRebritagem;
      if (s.utilizacaoRebritagem !== undefined) totalUtilReb += s.utilizacaoRebritagem;
      if (s.retidoMeiaPol) {
        totalRetido += s.retidoMeiaPol;
        countRetido++;
      }

      if (s.estoqueMsb !== undefined) lastEstoqueMsb = s.estoqueMsb;
      if (s.estoqueSurubim !== undefined) lastEstoqueSurubim = s.estoqueSurubim;
      if (s.estoqueVermelhos !== undefined) lastEstoqueVermelhos = s.estoqueVermelhos;
      if (s.estoqueSucuarana !== undefined) lastEstoqueSucuarana = s.estoqueSucuarana;
      if (s.pilhaIntermediaria !== undefined) lastPilhaInter = s.pilhaIntermediaria;

      if (s.pendenciasCriticas && s.pendenciasCriticas.length > 0) {
        s.pendenciasCriticas.forEach(p => {
          pendenciasSeco.push({ turma: r.turma, supervisor: r.supervisorTurno, texto: p });
        });
      }
      if (s.observacoes && s.observacoes.length > 0) {
        observacoesSeco.push(`[${r.turma} • ${r.dataTurno}]: ${s.observacoes.join(" | ")}`);
      }
    });

    const n = relatoriosComSeco.length || 1;
    const mediaTaxaBrit = countTaxaBrit > 0 ? Math.round(totalTaxaBrit / countTaxaBrit) : dadosAtuaisBR.taxaBritagem;
    const mediaDispBrit = totalDispBrit > 0 ? Number((totalDispBrit / n).toFixed(1)) : dadosAtuaisBR.disponibilidadeBritagem;
    const mediaUtilBrit = totalUtilBrit > 0 ? Number((totalUtilBrit / n).toFixed(1)) : dadosAtuaisBR.utilizacaoBritagem;
    const mediaTaxaReb = countTaxaReb > 0 ? Math.round(totalTaxaReb / countTaxaReb) : dadosAtuaisBR.produtividadeRebritagem;
    const mediaDispReb = totalDispReb > 0 ? Number((totalDispReb / n).toFixed(1)) : dadosAtuaisBR.disponibilidadeRebritagem;
    const mediaUtilReb = totalUtilReb > 0 ? Number((totalUtilReb / n).toFixed(1)) : dadosAtuaisBR.utilizacaoRebritagem;
    const mediaRetido = countRetido > 0 ? Number((totalRetido / countRetido).toFixed(1)) : dadosAtuaisBR.retidoMeiaPol;

    const estoqueTotal = Number(lastEstoqueMsb || 0) + Number(lastEstoqueSurubim || 0) + Number(lastEstoqueVermelhos || 0) + Number(lastEstoqueSucuarana || 0);

    const dadosBRAtualizados: DadosSetorBritagemRebritagem = {
      ...dadosAtuaisBR,
      taxaBritagem: mediaTaxaBrit,
      disponibilidadeBritagem: mediaDispBrit,
      utilizacaoBritagem: mediaUtilBrit,
      producaoTotalRebritagem: totalProdReb > 0 ? totalProdReb : dadosAtuaisBR.producaoTotalRebritagem,
      produtividadeRebritagem: mediaTaxaReb,
      disponibilidadeRebritagem: mediaDispReb,
      utilizacaoRebritagem: mediaUtilReb,
      retidoMeiaPol: mediaRetido,
      estoqueMsb: lastEstoqueMsb,
      estoqueSurubim: lastEstoqueSurubim,
      estoqueVermelhos: lastEstoqueVermelhos,
      estoqueSucuarana: lastEstoqueSucuarana,
      estoqueTotalRom: estoqueTotal,
      pilhaIntermediaria: lastPilhaInter,
      gargalosAtuais: observacoesSeco.length > 0 ? observacoesSeco.join("\n") : dadosAtuaisBR.gargalosAtuais
    };

    // Gerar ou enriquecer diretrizes com base nas pendências críticas reais da cominuição
    const novasDiretrizesSeco: DiretrizSupervisorTurno[] = [...diretrizesAtuais];
    pendenciasSeco.forEach((pend, idx) => {
      const exists = novasDiretrizesSeco.some(d => d.acaoEstrategica.toLowerCase().includes(pend.texto.slice(0, 25).toLowerCase()));
      if (!exists && idx < 5) {
        novasDiretrizesSeco.push({
          id: `dir_upload_seco_${Date.now()}_${idx}`,
          setor: pend.texto.includes("41") || pend.texto.includes("Britagem") ? "Britagem Primária" : "Rebritagem & Peneiramento",
          acaoEstrategica: `Atuar na pendência operacional: ${pend.texto}`,
          responsavelTurma: pend.turma || "Turma B",
          supervisorNome: pend.supervisor || `Supervisão ${pend.turma}`,
          prazoLimite: "Turno Vigente",
          prioridade: "critica",
          metaEsperada: "Eliminar vazamento/anomalia mecânica sem impactar taxa de cominuição.",
          status: "em_andamento",
          diaInicioNum: 1 + (idx % 3),
          diaFimNum: 4 + (idx % 3),
          progresso: 40,
          observacoes: "Compilado automaticamente via Relatório de Passagem de Turno."
        });
      }
    });

    return {
      dadosBRAtualizados,
      dadosCEAtualizados: dadosAtuaisCE,
      diretrizesAtualizadas: novasDiretrizesSeco,
      resumoCompilacao: {
        totalRelatorios: relatoriosComSeco.length,
        turmasPresentes: turmasList,
        setoresCompilados: ["Britagem Primária", "Rebritagem", "Pátios de ROM", "Pilha Intermediária"],
        acoesGeradas: pendenciasSeco.length,
        resumoTexto: `Compilados com sucesso ${relatoriosComSeco.length} relatórios de turno para o CIRCUITO SECO. Atualizadas taxas de britagem/rebritagem, estoques de pátio e pendências mecânicas da cominuição.`
      }
    };
  } else {
    // COMPILAR ESTRITAMENTE CIRCUITO ÚMIDO
    const relatoriosComUmido = relatorios.filter(r => !!r.dadosUmido);
    let totalProdMoagem = 0;
    let totalTaxaMoagem = 0;
    let countTaxaMoagem = 0;
    let totalDispMoagem = 0;
    let totalUtilMoagem = 0;
    let totalTeorAlim = 0;
    let countTeorAlim = 0;
    let totalTeorConc = 0;
    let countTeorConc = 0;
    let totalTeorRej = 0;
    let countTeorRej = 0;
    let totalRec = 0;
    let countRec = 0;
    let totalMetal = 0;
    let totalConc = 0;
    let totalCiclosFiltro = 0;
    let totalUmidade = 0;
    let countUmidade = 0;

    const pendenciasUmido: Array<{ turma: string; supervisor?: string; texto: string }> = [];
    const observacoesUmido: string[] = [];

    relatoriosComUmido.forEach(r => {
      const u = r.dadosUmido!;
      if (u.producaoMoagem) totalProdMoagem += u.producaoMoagem;
      if (u.taxaTotalMoagem) {
        totalTaxaMoagem += u.taxaTotalMoagem;
        countTaxaMoagem++;
      }
      if (u.disponibilidadeMoagem !== undefined) totalDispMoagem += u.disponibilidadeMoagem;
      if (u.utilizacaoMoagem !== undefined) totalUtilMoagem += u.utilizacaoMoagem;

      if (u.teorAlimCu) {
        totalTeorAlim += u.teorAlimCu;
        countTeorAlim++;
      }
      if (u.teorConcCu) {
        totalTeorConc += u.teorConcCu;
        countTeorConc++;
      }
      if (u.teorRejeitoCu) {
        totalTeorRej += u.teorRejeitoCu;
        countTeorRej++;
      }
      if (u.recuperacaoMetalurgica) {
        totalRec += u.recuperacaoMetalurgica;
        countRec++;
      }
      if (u.metalContidoCu) totalMetal += u.metalContidoCu;
      if (u.concentradoProduzido) totalConc += u.concentradoProduzido;
      if (u.ciclosFiltro) totalCiclosFiltro += u.ciclosFiltro;
      if (u.umidadeBolo) {
        totalUmidade += u.umidadeBolo;
        countUmidade++;
      }

      if (u.pendenciasCriticas && u.pendenciasCriticas.length > 0) {
        u.pendenciasCriticas.forEach(p => {
          pendenciasUmido.push({ turma: r.turma, supervisor: r.supervisorTurno, texto: p });
        });
      }
      if (u.observacoes && u.observacoes.length > 0) {
        observacoesUmido.push(`[${r.turma} • ${r.dataTurno}]: ${u.observacoes.join(" | ")}`);
      }
    });

    const n = relatoriosComUmido.length || 1;
    const mediaTaxaMoagem = countTaxaMoagem > 0 ? Math.round(totalTaxaMoagem / countTaxaMoagem) : dadosAtuaisCE.taxaTotalMoagem;
    const mediaDispMoagem = totalDispMoagem > 0 ? Number((totalDispMoagem / n).toFixed(1)) : dadosAtuaisCE.disponibilidadeMoagem;
    const mediaUtilMoagem = totalUtilMoagem > 0 ? Number((totalUtilMoagem / n).toFixed(1)) : dadosAtuaisCE.utilizacaoMoagem;
    const mediaTeorAlim = countTeorAlim > 0 ? Number((totalTeorAlim / countTeorAlim).toFixed(4)) : dadosAtuaisCE.teorAlimentacaoCu;
    const mediaTeorConc = countTeorConc > 0 ? Number((totalTeorConc / countTeorConc).toFixed(2)) : dadosAtuaisCE.teorConcentradoCu;
    const mediaTeorRej = countTeorRej > 0 ? Number((totalTeorRej / countTeorRej).toFixed(4)) : dadosAtuaisCE.teorRejeitoCu;
    const mediaRec = countRec > 0 ? Number((totalRec / countRec).toFixed(2)) : dadosAtuaisCE.recuperacaoMetalurgica;
    const mediaUmidade = countUmidade > 0 ? Number((totalUmidade / countUmidade).toFixed(2)) : dadosAtuaisCE.umidadeBolo;

    const dadosCEAtualizados: DadosSetorConcentradorEta = {
      ...dadosAtuaisCE,
      producaoMoagemDia: totalProdMoagem > 0 ? Math.round(totalProdMoagem / n) : dadosAtuaisCE.producaoMoagemDia,
      taxaTotalMoagem: mediaTaxaMoagem,
      disponibilidadeMoagem: mediaDispMoagem,
      utilizacaoMoagem: mediaUtilMoagem,
      teorAlimentacaoCu: mediaTeorAlim,
      teorConcentradoCu: mediaTeorConc,
      teorRejeitoCu: mediaTeorRej,
      recuperacaoMetalurgica: mediaRec,
      metalContidoDia: totalMetal > 0 ? Number((totalMetal / n).toFixed(2)) : dadosAtuaisCE.metalContidoDia,
      concentradoProduzidoDia: totalConc > 0 ? Number((totalConc / n).toFixed(1)) : dadosAtuaisCE.concentradoProduzidoDia,
      ciclosFiltro: totalCiclosFiltro > 0 ? Math.round(totalCiclosFiltro / n) : dadosAtuaisCE.ciclosFiltro,
      umidadeBolo: mediaUmidade,
      gargalosAtuais: observacoesUmido.length > 0 ? observacoesUmido.join("\n") : dadosAtuaisCE.gargalosAtuais
    };

    // Gerar diretrizes de turno a partir das pendências críticas da flotação, moagem e filtragem
    const novasDiretrizesUmido: DiretrizSupervisorTurno[] = [...diretrizesAtuais];
    pendenciasUmido.forEach((pend, idx) => {
      const exists = novasDiretrizesUmido.some(d => d.acaoEstrategica.toLowerCase().includes(pend.texto.slice(0, 25).toLowerCase()));
      if (!exists && idx < 5) {
        let setorNome = "Moagem & Ciclones";
        if (pend.texto.includes("FL") || pend.texto.includes("placas") || pend.texto.includes("Filtro")) {
          setorNome = "Filtragem & Desaguamento";
        } else if (pend.texto.includes("43MF") || pend.texto.includes("Flotação") || pend.texto.includes("downcomer") || pend.texto.includes("reagentes")) {
          setorNome = "Flotação de Cobre";
        } else if (pend.texto.includes("EP") || pend.texto.includes("rake") || pend.texto.includes("espessador")) {
          setorNome = "Espessamento Concentrado";
        }

        novasDiretrizesUmido.push({
          id: `dir_upload_umido_${Date.now()}_${idx}`,
          setor: setorNome,
          acaoEstrategica: `Resolver restrição operacional: ${pend.texto}`,
          responsavelTurma: pend.turma || "Turma C",
          supervisorNome: pend.supervisor || `Supervisão ${pend.turma}`,
          prazoLimite: "Turno Vigente",
          prioridade: "critica",
          metaEsperada: "Garantir recuperação metalúrgica > 88% e estabilidade de flotação/filtragem.",
          status: "em_andamento",
          diaInicioNum: 1 + (idx % 3),
          diaFimNum: 4 + (idx % 3),
          progresso: 50,
          observacoes: "Extraído automaticamente do Relatório de Passagem de Turno."
        });
      }
    });

    return {
      dadosBRAtualizados: dadosAtuaisBR,
      dadosCEAtualizados,
      diretrizesAtualizadas: novasDiretrizesUmido,
      resumoCompilacao: {
        totalRelatorios: relatoriosComUmido.length,
        turmasPresentes: turmasList,
        setoresCompilados: ["Moagem", "Flotação Cu", "Espessamento", "Filtro Prensa", "Utilidades"],
        acoesGeradas: pendenciasUmido.length,
        resumoTexto: `Compilados com sucesso ${relatoriosComUmido.length} relatórios de turno para o CIRCUITO ÚMIDO. Atualizadas taxas de moagem, balanço metalúrgico de Cu, parâmetros dos espessadores/filtros e pendências da planta química.`
      }
    };
  }
}
