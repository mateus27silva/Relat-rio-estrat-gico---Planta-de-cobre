/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  Hammer,
  Columns,
  Warehouse,
  CircleDot,
  Droplets,
  Filter,
  FilterX,
  Layers,
  Activity,
  Droplet,
  Info,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Gauge,
  Sparkles,
  Zap,
  Calendar,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  FileSpreadsheet,
  ClipboardPaste,
  ClipboardCheck,
  X,
  Check,
  ArrowDown,
  HelpCircle,
  Trash2,
  RotateCcw,
  Wrench
} from "lucide-react";
import {
  DadosSetorBritagemRebritagem,
  DadosSetorConcentradorEta,
  DiretrizSupervisorTurno,
  CircuitoTipo,
  RegistroDiarioIndicadoresBritagem,
  CONFIG_PARAMETROS_BRITAGEM,
  DADOS_DIARIOS_BRITAGEM_PADRAO,
  detectarDesviosBritagem,
  calcularCartasControleBritagem,
  ParametroConfigBritagem,
  parseNumeroBritagem,
  obterLeituraAtualBritagem,
  RegistroDiarioIndicadoresRebritagem,
  CONFIG_PARAMETROS_REBRITAGEM,
  DADOS_DIARIOS_REBRITAGEM_PADRAO,
  detectarDesviosRebritagem,
  calcularCartasControleRebritagem,
  ParametroConfigRebritagem,
  obterLeituraAtualRebritagem,
  RegistroDiarioIndicadoresMoagem,
  CONFIG_PARAMETROS_MOAGEM,
  DADOS_DIARIOS_MOAGEM_PADRAO,
  detectarDesviosMoagem,
  calcularCartasControleMoagem,
  ParametroConfigMoagem,
  obterLeituraAtualMoagem,
  RegistroDiarioIndicadoresRemoagem,
  CONFIG_PARAMETROS_REMOAGEM,
  DADOS_DIARIOS_REMOAGEM_PADRAO,
  ParametroConfigRemoagem,
  detectarDesviosRemoagem,
  RegistroDiarioIndicadoresFlotacao,
  CONFIG_PARAMETROS_FLOTACAO,
  DADOS_DIARIOS_FLOTACAO_PADRAO,
  ParametroConfigFlotacao,
  detectarDesviosFlotacao,
  calcularCartasControleFlotacao,
  RegistroDiarioIndicadoresEspessamentoRejeito,
  CONFIG_PARAMETROS_ESPESSAMENTO_REJEITO,
  DADOS_DIARIOS_ESPESSAMENTO_REJEITO_PADRAO,
  ParametroConfigEspessamentoRejeito,
  detectarDesviosEspessamentoRejeito,
  calcularCartasControleEspessamentoRejeito,
  RegistroDiarioIndicadoresEspessamentoConcentrado,
  CONFIG_PARAMETROS_ESPESSAMENTO_CONCENTRADO,
  DADOS_DIARIOS_ESPESSAMENTO_CONCENTRADO_PADRAO,
  ParametroConfigEspessamentoConcentrado,
  detectarDesviosEspessamentoConcentrado,
  calcularCartasControleEspessamentoConcentrado,
  RegistroDiarioIndicadoresFiltragemConcentrado,
  CONFIG_PARAMETROS_FILTRAGEM_CONCENTRADO,
  DADOS_DIARIOS_FILTRAGEM_CONCENTRADO_PADRAO,
  ParametroConfigFiltragemConcentrado,
  detectarDesviosFiltragemConcentrado,
  calcularCartasControleFiltragemConcentrado,
  RegistroDiarioIndicadoresUtilidadesETA,
  CONFIG_PARAMETROS_UTILIDADES_ETA,
  DADOS_DIARIOS_UTILIDADES_ETA_PADRAO,
  ParametroConfigUtilidadesETA,
  detectarDesviosUtilidadesETA,
  calcularCartasControleUtilidadesETA
} from "../typesAdm";

interface AdmOperationalDataFormProps {
  circuitoTipo?: CircuitoTipo;
  dadosBR: DadosSetorBritagemRebritagem;
  dadosCE: DadosSetorConcentradorEta;
  diretrizes?: DiretrizSupervisorTurno[];
  onChangeBR: (dados: DadosSetorBritagemRebritagem) => void;
  onChangeCE: (dados: DadosSetorConcentradorEta) => void;
  onChangeDiretrizes?: (diretrizes: DiretrizSupervisorTurno[]) => void;
}

export const AdmOperationalDataForm: React.FC<AdmOperationalDataFormProps> = ({
  circuitoTipo = "seco",
  dadosBR,
  dadosCE,
  diretrizes = [],
  onChangeBR,
  onChangeCE,
  onChangeDiretrizes
}) => {
  const isSeco = circuitoTipo === "seco";
  const isUmido = circuitoTipo === "umido";
  const [activeArea, setActiveArea] = useState<"britagem_rebritagem" | "concentrador_eta">(
    isUmido ? "concentrador_eta" : "britagem_rebritagem"
  );

  const [acoesSincronizadasToast, setAcoesSincronizadasToast] = useState<boolean>(false);
  const [toastMensagem, setToastMensagem] = useState<string>("");

  // Estado para Modal de Colar Coluna do Excel (Britagem Primária)
  const [modalColarColunaAberto, setModalColarColunaAberto] = useState<boolean>(false);
  const [colunaSelecionadaParaColar, setColunaSelecionadaParaColar] = useState<string>("posicaoManto");
  const [textoColadoExcel, setTextoColadoExcel] = useState<string>("");

  // Estado para Modal de Colar Coluna do Excel (Rebritagem & Peneiramento)
  const [modalColarColunaRebritagemAberto, setModalColarColunaRebritagemAberto] = useState<boolean>(false);
  const [colunaSelecionadaParaColarRebritagem, setColunaSelecionadaParaColarRebritagem] = useState<string>("tempOleoLub_BR001");
  const [textoColadoExcelRebritagem, setTextoColadoExcelRebritagem] = useState<string>("");

  // Estado para Modal de Colar Coluna do Excel (Moagem MI003, MI004, MI005)
  const [modalColarColunaMoagemAberto, setModalColarColunaMoagemAberto] = useState<boolean>(false);
  const [colunaSelecionadaParaColarMoagem, setColunaSelecionadaParaColarMoagem] = useState<string>("taxa_MI003");
  const [textoColadoExcelMoagem, setTextoColadoExcelMoagem] = useState<string>("");

  // Estado para Modal de Colar Coluna do Excel (Remoagem HIG Mill)
  const [modalColarColunaRemoagemAberto, setModalColarColunaRemoagemAberto] = useState<boolean>(false);
  const [colunaSelecionadaParaColarRemoagem, setColunaSelecionadaParaColarRemoagem] = useState<string>("derrickIsoladas");
  const [textoColadoExcelRemoagem, setTextoColadoExcelRemoagem] = useState<string>("");

  // Estado para Modal de Colar Coluna do Excel (Monitoramento diário da Flotação)
  const [modalColarColunaFlotacaoAberto, setModalColarColunaFlotacaoAberto] = useState<boolean>(false);
  const [colunaSelecionadaParaColarFlotacao, setColunaSelecionadaParaColarFlotacao] = useState<string>("solidosRougher");
  const [textoColadoExcelFlotacao, setTextoColadoExcelFlotacao] = useState<string>("");

  // Estado para Modal de Colar Coluna do Excel (Monitoramento diário do Espessamento de Rejeito)
  const [modalColarColunaEspessamentoRejeitoAberto, setModalColarColunaEspessamentoRejeitoAberto] = useState<boolean>(false);
  const [colunaSelecionadaParaColarEspessamentoRejeito, setColunaSelecionadaParaColarEspessamentoRejeito] = useState<string>("densidadeUnderflowRej");
  const [textoColadoExcelEspessamentoRejeito, setTextoColadoExcelEspessamentoRejeito] = useState<string>("");

  // Estado para Modal de Colar Coluna do Excel (Monitoramento diário do Espessamento de Concentrado)
  const [modalColarColunaEspessamentoConcentradoAberto, setModalColarColunaEspessamentoConcentradoAberto] = useState<boolean>(false);
  const [colunaSelecionadaParaColarEspessamentoConcentrado, setColunaSelecionadaParaColarEspessamentoConcentrado] = useState<string>("densidadeUnderflowConc");
  const [textoColadoExcelEspessamentoConcentrado, setTextoColadoExcelEspessamentoConcentrado] = useState<string>("");

  // Estado para Modal de Colar Coluna do Excel (Monitoramento diário da Filtragem de Concentrado)
  const [modalColarColunaFiltragemAberto, setModalColarColunaFiltragemAberto] = useState<boolean>(false);
  const [colunaSelecionadaParaColarFiltragem, setColunaSelecionadaParaColarFiltragem] = useState<string>("producaoFiltragem");
  const [textoColadoExcelFiltragem, setTextoColadoExcelFiltragem] = useState<string>("");

  // Estado para Modal de Colar Coluna do Excel (Monitoramento diário de Utilidades & ETA)
  const [modalColarColunaUtilidadesAberto, setModalColarColunaUtilidadesAberto] = useState<boolean>(false);
  const [colunaSelecionadaParaColarUtilidades, setColunaSelecionadaParaColarUtilidades] = useState<string>("pressaoAr");
  const [textoColadoExcelUtilidades, setTextoColadoExcelUtilidades] = useState<string>("");

  React.useEffect(() => {
    if (circuitoTipo === "seco") {
      setActiveArea("britagem_rebritagem");
    } else if (circuitoTipo === "umido") {
      setActiveArea("concentrador_eta");
    }
  }, [circuitoTipo]);

  // Garante que o histórico diário exista no estado
  const historicoDiario = useMemo(() => {
    return dadosBR.historicoDiarioBritagem && dadosBR.historicoDiarioBritagem.length === 7
      ? dadosBR.historicoDiarioBritagem
      : DADOS_DIARIOS_BRITAGEM_PADRAO;
  }, [dadosBR.historicoDiarioBritagem]);

  // Estatísticas das Cartas de Controle
  const cartasControle = useMemo(() => {
    return calcularCartasControleBritagem(historicoDiario);
  }, [historicoDiario]);

  // Desvios detectados fora da faixa ideal
  const desviosDetectados = useMemo(() => {
    return detectarDesviosBritagem(historicoDiario, dadosBR.anotacoesDesvios);
  }, [historicoDiario, dadosBR.anotacoesDesvios]);

  // Atualização das anotações de impacto/ação do supervisor para desvios
  const handleUpdateAnotacaoDesvio = (key: string, field: "impactoPerda" | "acaoRecomendada", val: string) => {
    const anotacoesAtuais = dadosBR.anotacoesDesvios || {};
    const itemAtual = anotacoesAtuais[key] || { impactoPerda: "", acaoRecomendada: "" };
    const proximaAnotacao = { ...itemAtual, [field]: val };
    const novasAnotacoes = { ...anotacoesAtuais, [key]: proximaAnotacao };
    onChangeBR({ ...dadosBR, anotacoesDesvios: novasAnotacoes });
  };

  // Helper para sincronizar a leitura atual no dadosBR (Britagem Primária)
  const sincronizarLeiturasAtuais = (nextBR: DadosSetorBritagemRebritagem) => {
    CONFIG_PARAMETROS_BRITAGEM.forEach(paramConfig => {
      const leituraAtual = obterLeituraAtualBritagem(nextBR, paramConfig);
      const dec = paramConfig.decimais;
      if (leituraAtual.numVal !== null) {
        if (paramConfig.chave === "posicaoManto") {
          nextBR.posicaoManto = `${leituraAtual.numVal.toFixed(dec)}%`;
        } else if (paramConfig.chave === "afericaoBritador") {
          nextBR.afericaoBritador = `${leituraAtual.numVal.toFixed(dec)}"`;
        } else if (paramConfig.chave === "produtividadeTph") {
          nextBR.taxaBritagem = leituraAtual.numVal;
        } else {
          (nextBR as any)[paramConfig.chave] = leituraAtual.numVal;
        }
      } else {
        if (paramConfig.chave === "posicaoManto") {
          nextBR.posicaoManto = "";
        } else if (paramConfig.chave === "afericaoBritador") {
          nextBR.afericaoBritador = "";
        } else if (paramConfig.chave === "produtividadeTph") {
          nextBR.taxaBritagem = "";
        } else {
          (nextBR as any)[paramConfig.chave] = "";
        }
      }
    });
  };

  // Atualização de uma célula diária específica
  const handleUpdateDiario = (
    diaIdx: number,
    chave: keyof Omit<RegistroDiarioIndicadoresBritagem, "dia" | "diaLabel" | "observacao">,
    valor: any
  ) => {
    const novoHistorico = [...historicoDiario];
    const parsedNum = parseNumeroBritagem(valor);
    novoHistorico[diaIdx] = {
      ...novoHistorico[diaIdx],
      [chave]: parsedNum !== null ? parsedNum : (valor === "" ? "" : valor)
    };

    const nextBR = { ...dadosBR, historicoDiarioBritagem: novoHistorico };
    sincronizarLeiturasAtuais(nextBR);
    onChangeBR(nextBR);
  };

  // Processa o texto copiado de uma coluna ou tabela do Excel e aplica no histórico
  const aplicarTextoExcelNaTabela = (
    texto: string,
    startDiaIdx: number = 0,
    startColIdx: number = 0
  ) => {
    if (!texto || !texto.trim()) return;

    const linhas = texto.trim().split(/\r\n|\r|\n/);
    if (linhas.length === 0) return;

    const novoHistorico = historicoDiario.map(item => ({ ...item }));
    let valoresAplicados = 0;

    linhas.forEach((linha, rOffset) => {
      const targetDia = startDiaIdx + rOffset;
      if (targetDia >= novoHistorico.length) return;

      // Divide por Tab (padrão de cópia do Excel) ou ponto e vírgula se não houver Tab
      const colunas = linha.includes("\t") ? linha.split("\t") : [linha];

      colunas.forEach((celulaTexto, cOffset) => {
        const targetCol = startColIdx + cOffset;
        if (targetCol >= CONFIG_PARAMETROS_BRITAGEM.length) return;

        const param = CONFIG_PARAMETROS_BRITAGEM[targetCol];
        const parsed = parseNumeroBritagem(celulaTexto);

        if (parsed !== null) {
          (novoHistorico[targetDia] as any)[param.chave] = parsed;
          valoresAplicados++;
        } else if (celulaTexto.trim() === "" || celulaTexto.trim() === "-") {
          (novoHistorico[targetDia] as any)[param.chave] = "";
        }
      });
    });

    if (valoresAplicados > 0) {
      const nextBR = { ...dadosBR, historicoDiarioBritagem: novoHistorico };
      sincronizarLeiturasAtuais(nextBR);
      onChangeBR(nextBR);

      setToastMensagem(`✅ ${valoresAplicados} valor(es) do Excel aplicados na tabela com sucesso!`);
      setAcoesSincronizadasToast(true);
      setTimeout(() => setAcoesSincronizadasToast(false), 4000);
    }
  };

  // Handler de Paste direto em qualquer célula da tabela
  const handlePasteCelula = (
    e: React.ClipboardEvent<HTMLInputElement>,
    diaIdx: number,
    paramIdx: number
  ) => {
    const texto = e.clipboardData.getData("text");
    if (!texto) return;

    // Se tiver quebra de linha ou tab, é colagem estruturada do Excel
    if (texto.includes("\n") || texto.includes("\t") || texto.includes("\r")) {
      e.preventDefault();
      aplicarTextoExcelNaTabela(texto, diaIdx, paramIdx);
    }
  };

  // Handler de navegação por teclado (Setas e Enter)
  const handleKeyDownCelula = (
    e: React.KeyboardEvent<HTMLInputElement>,
    diaIdx: number,
    paramIdx: number
  ) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextDia = Math.min(6, diaIdx + 1);
      const nextInput = document.getElementById(`input-britagem-${nextDia}-${paramIdx}`);
      nextInput?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevDia = Math.max(0, diaIdx - 1);
      const prevInput = document.getElementById(`input-britagem-${prevDia}-${paramIdx}`);
      prevInput?.focus();
    }
  };

  // Limpar todos os dados da tabela diária
  const handleLimparTabela = () => {
    const limpo: RegistroDiarioIndicadoresBritagem[] = DADOS_DIARIOS_BRITAGEM_PADRAO.map(d => ({
      dia: d.dia,
      diaLabel: d.diaLabel,
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
    }));
    const nextBR = {
      ...dadosBR,
      historicoDiarioBritagem: limpo,
      taxaBritagem: "",
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
      temperaturaOleoBuchaInterna: ""
    };
    sincronizarLeiturasAtuais(nextBR);
    onChangeBR(nextBR);

    setToastMensagem("Tabela de monitoramento diário da Britagem limpa com sucesso.");
    setAcoesSincronizadasToast(true);
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  // Abrir Modal para colar coluna específica
  const abrirModalColarColuna = (chaveParametro: string) => {
    setColunaSelecionadaParaColar(chaveParametro);
    setTextoColadoExcel("");
    setModalColarColunaAberto(true);
  };

  // Colar do Clipboard do sistema
  const handleLerClipboardSistema = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setTextoColadoExcel(text);
        }
      }
    } catch (err) {
      console.warn("Não foi possível acessar a área de transferência diretamente:", err);
    }
  };

  // Confirmar colagem pelo modal
  const handleConfirmarColarModal = () => {
    const colIdx = CONFIG_PARAMETROS_BRITAGEM.findIndex(p => p.chave === colunaSelecionadaParaColar);
    if (colIdx >= 0 && textoColadoExcel.trim()) {
      aplicarTextoExcelNaTabela(textoColadoExcel, 0, colIdx);
      setModalColarColunaAberto(false);
      setTextoColadoExcel("");
    }
  };

  // Sincronizar Ações Corretivas com a Matriz de Diretrizes
  const handleSincronizarAcoesCorretivas = () => {
    if (!onChangeDiretrizes) return;

    const novasAcoes: DiretrizSupervisorTurno[] = desviosDetectados.map((desvio, i) => {
      const keyDesvio = `${desvio.chave}_${desvio.dia}`;
      const anotacao = dadosBR.anotacoesDesvios?.[keyDesvio];
      const acaoTexto = anotacao?.acaoRecomendada?.trim() || `Ajuste operacional em ${desvio.parametro.nome}`;
      const impactoTexto = anotacao?.impactoPerda?.trim() || "";

      return {
        id: `ACT-DEV-${Date.now()}-${i}`,
        setor: "Cominuição & Britagem Primária",
        acaoEstrategica: `[DESVIO OPERACIONAL - ${desvio.parametro.nome.toUpperCase()} (${desvio.diaLabel})] ${acaoTexto}`,
        responsavelTurma: "Todas as Turmas",
        supervisorNome: "Supervisão Britagem / Operação",
        prazoLimite: "Imediato / Turno Atual",
        status: "em_andamento",
        prioridade: "critica",
        metaEsperada: impactoTexto ? `Mitigar: ${impactoTexto}` : `Estabilizar ${desvio.parametro.nome} no alvo de ${desvio.parametro.alvo} ${desvio.parametro.unidade}`
      };
    });

    // Mescla com as existentes sem duplicar
    const existentes = (diretrizes || []).filter(
      d => !(d.id && d.id.startsWith("ACT-DEV-")) && !(d.acaoEstrategica && d.acaoEstrategica.startsWith("[DESVIO OPERACIONAL"))
    );
    onChangeDiretrizes([...novasAcoes, ...existentes]);

    setAcoesSincronizadasToast(true);
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  // --- REBRITAGEM & PENEIRAMENTO: HISTÓRICO, DESVIOS & CEP ---
  const historicoDiarioRebritagem = useMemo(() => {
    return dadosBR.historicoDiarioRebritagem && dadosBR.historicoDiarioRebritagem.length === 7
      ? dadosBR.historicoDiarioRebritagem
      : DADOS_DIARIOS_REBRITAGEM_PADRAO;
  }, [dadosBR.historicoDiarioRebritagem]);

  const cartasControleRebritagem = useMemo(() => {
    return calcularCartasControleRebritagem(historicoDiarioRebritagem);
  }, [historicoDiarioRebritagem]);

  const desviosDetectadosRebritagem = useMemo(() => {
    return detectarDesviosRebritagem(historicoDiarioRebritagem, dadosBR.anotacoesDesviosRebritagem);
  }, [historicoDiarioRebritagem, dadosBR.anotacoesDesviosRebritagem]);

  const handleUpdateAnotacaoDesvioRebritagem = (key: string, field: "impactoPerda" | "acaoRecomendada", val: string) => {
    const anotacoesAtuais = dadosBR.anotacoesDesviosRebritagem || {};
    const itemAtual = anotacoesAtuais[key] || { impactoPerda: "", acaoRecomendada: "" };
    const proximaAnotacao = { ...itemAtual, [field]: val };
    const novasAnotacoes = { ...anotacoesAtuais, [key]: proximaAnotacao };
    onChangeBR({ ...dadosBR, anotacoesDesviosRebritagem: novasAnotacoes });
  };

  // Helper para sincronizar a leitura atual no dadosBR (Rebritagem & Peneiramento)
  const sincronizarLeiturasAtuaisRebritagem = (nextBR: DadosSetorBritagemRebritagem) => {
    CONFIG_PARAMETROS_REBRITAGEM.forEach(paramConfig => {
      const leituraAtual = obterLeituraAtualRebritagem(nextBR, paramConfig);
      if (paramConfig.chave === "retidoMeiaPol") {
        nextBR.retidoMeiaPol = leituraAtual.numVal !== null ? leituraAtual.numVal : "";
      } else if (paramConfig.chave === "produtividadeTph") {
        nextBR.produtividadeRebritagem = leituraAtual.numVal !== null ? leituraAtual.numVal : "";
      }
    });
  };

  const handleUpdateDiarioRebritagem = (
    diaIdx: number,
    chave: keyof Omit<RegistroDiarioIndicadoresRebritagem, "dia" | "diaLabel" | "observacao">,
    valor: any
  ) => {
    const novoHistorico = [...historicoDiarioRebritagem];
    const parsedNum = parseNumeroBritagem(valor);
    novoHistorico[diaIdx] = {
      ...novoHistorico[diaIdx],
      [chave]: parsedNum !== null ? parsedNum : (valor === "" ? "" : valor)
    };

    const nextBR = { ...dadosBR, historicoDiarioRebritagem: novoHistorico };
    sincronizarLeiturasAtuaisRebritagem(nextBR);
    onChangeBR(nextBR);
  };

  const aplicarTextoExcelNaTabelaRebritagem = (
    texto: string,
    startDiaIdx: number = 0,
    startColIdx: number = 0
  ) => {
    if (!texto || !texto.trim()) return;

    const linhas = texto.trim().split(/\r\n|\r|\n/);
    if (linhas.length === 0) return;

    const novoHistorico = historicoDiarioRebritagem.map(item => ({ ...item }));
    let valoresAplicados = 0;

    linhas.forEach((linha, rOffset) => {
      const targetDia = startDiaIdx + rOffset;
      if (targetDia >= novoHistorico.length) return;

      const colunas = linha.includes("\t") ? linha.split("\t") : [linha];

      colunas.forEach((celulaTexto, cOffset) => {
        const targetCol = startColIdx + cOffset;
        if (targetCol >= CONFIG_PARAMETROS_REBRITAGEM.length) return;

        const param = CONFIG_PARAMETROS_REBRITAGEM[targetCol];
        const parsed = parseNumeroBritagem(celulaTexto);

        if (parsed !== null) {
          (novoHistorico[targetDia] as any)[param.chave] = parsed;
          valoresAplicados++;
        } else if (celulaTexto.trim() === "" || celulaTexto.trim() === "-") {
          (novoHistorico[targetDia] as any)[param.chave] = "";
        }
      });
    });

    if (valoresAplicados > 0) {
      const nextBR = { ...dadosBR, historicoDiarioRebritagem: novoHistorico };
      sincronizarLeiturasAtuaisRebritagem(nextBR);
      onChangeBR(nextBR);

      setToastMensagem(`✅ ${valoresAplicados} valor(es) do Excel aplicados na tabela de Rebritagem com sucesso!`);
      setAcoesSincronizadasToast(true);
      setTimeout(() => setAcoesSincronizadasToast(false), 4000);
    }
  };

  const handlePasteCelulaRebritagem = (
    e: React.ClipboardEvent<HTMLInputElement>,
    diaIdx: number,
    paramIdx: number
  ) => {
    const texto = e.clipboardData.getData("text");
    if (!texto) return;

    if (texto.includes("\n") || texto.includes("\t") || texto.includes("\r")) {
      e.preventDefault();
      aplicarTextoExcelNaTabelaRebritagem(texto, diaIdx, paramIdx);
    }
  };

  const handleKeyDownCelulaRebritagem = (
    e: React.KeyboardEvent<HTMLInputElement>,
    diaIdx: number,
    paramIdx: number
  ) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextDia = Math.min(6, diaIdx + 1);
      const nextInput = document.getElementById(`input-rebritagem-${nextDia}-${paramIdx}`);
      nextInput?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevDia = Math.max(0, diaIdx - 1);
      const prevInput = document.getElementById(`input-rebritagem-${prevDia}-${paramIdx}`);
      prevInput?.focus();
    }
  };

  const handleLimparTabelaRebritagem = () => {
    const limpo: RegistroDiarioIndicadoresRebritagem[] = DADOS_DIARIOS_REBRITAGEM_PADRAO.map(d => ({
      dia: d.dia,
      diaLabel: d.diaLabel,
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
    }));
    const nextBR = {
      ...dadosBR,
      historicoDiarioRebritagem: limpo,
      retidoMeiaPol: "",
      produtividadeRebritagem: ""
    };
    sincronizarLeiturasAtuaisRebritagem(nextBR);
    onChangeBR(nextBR);

    setToastMensagem("Tabela de monitoramento diário da Rebritagem limpa com sucesso.");
    setAcoesSincronizadasToast(true);
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  const abrirModalColarColunaRebritagem = (chaveParametro: string) => {
    setColunaSelecionadaParaColarRebritagem(chaveParametro);
    setTextoColadoExcelRebritagem("");
    setModalColarColunaRebritagemAberto(true);
  };

  const handleConfirmarColarModalRebritagem = () => {
    const colIdx = CONFIG_PARAMETROS_REBRITAGEM.findIndex(p => p.chave === colunaSelecionadaParaColarRebritagem);
    if (colIdx >= 0 && textoColadoExcelRebritagem.trim()) {
      aplicarTextoExcelNaTabelaRebritagem(textoColadoExcelRebritagem, 0, colIdx);
      setModalColarColunaRebritagemAberto(false);
      setTextoColadoExcelRebritagem("");
    }
  };

  const handleSincronizarAcoesCorretivasRebritagem = () => {
    if (!onChangeDiretrizes) return;

    const novasAcoes: DiretrizSupervisorTurno[] = desviosDetectadosRebritagem.map((desvio, i) => {
      const keyDesvio = `${desvio.chave}_${desvio.dia}`;
      const anotacao = dadosBR.anotacoesDesviosRebritagem?.[keyDesvio];
      const acaoTexto = anotacao?.acaoRecomendada?.trim() || `Ajuste operacional em ${desvio.parametro.nome}`;
      const impactoTexto = anotacao?.impactoPerda?.trim() || "";

      return {
        id: `ACT-DEV-REB-${Date.now()}-${i}`,
        setor: "Cominuição & Rebritagem",
        acaoEstrategica: `[DESVIO OPERACIONAL - ${desvio.parametro.nome.toUpperCase()} (${desvio.diaLabel})] ${acaoTexto}`,
        responsavelTurma: "Todas as Turmas",
        supervisorNome: "Supervisão Rebritagem / Operação",
        prazoLimite: "Imediato / Turno Atual",
        status: "em_andamento",
        prioridade: "critica",
        metaEsperada: impactoTexto ? `Mitigar: ${impactoTexto}` : `Estabilizar ${desvio.parametro.nome} no alvo de ${desvio.parametro.alvo} ${desvio.parametro.unidade}`
      };
    });

    const existentes = (diretrizes || []).filter(
      d => !(d.id && d.id.startsWith("ACT-DEV-REB-")) && !(d.acaoEstrategica && d.acaoEstrategica.startsWith("[DESVIO OPERACIONAL - ") && d.acaoEstrategica.includes("BR00"))
    );
    onChangeDiretrizes([...novasAcoes, ...existentes]);

    setAcoesSincronizadasToast(true);
    setToastMensagem("Ações da Rebritagem sincronizadas com a Matriz de Diretrizes!");
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  // --- MOAGEM: HISTÓRICO DIÁRIO, DESVIOS & CONTROLE OPERACIONAL ---
  const historicoDiarioMoagem = useMemo(() => {
    return dadosCE.historicoDiarioMoagem && dadosCE.historicoDiarioMoagem.length === 7
      ? dadosCE.historicoDiarioMoagem
      : DADOS_DIARIOS_MOAGEM_PADRAO;
  }, [dadosCE.historicoDiarioMoagem]);

  const cartasControleMoagem = useMemo(() => {
    return calcularCartasControleMoagem(historicoDiarioMoagem);
  }, [historicoDiarioMoagem]);

  const desviosDetectadosMoagem = useMemo(() => {
    return detectarDesviosMoagem(historicoDiarioMoagem, dadosCE.anotacoesDesviosMoagem);
  }, [historicoDiarioMoagem, dadosCE.anotacoesDesviosMoagem]);

  const handleUpdateAnotacaoDesvioMoagem = (key: string, field: "impactoPerda" | "acaoRecomendada", val: string) => {
    const anotacoesAtuais = dadosCE.anotacoesDesviosMoagem || {};
    const itemAtual = anotacoesAtuais[key] || { impactoPerda: "", acaoRecomendada: "" };
    const proximaAnotacao = { ...itemAtual, [field]: val };
    const novasAnotacoes = { ...anotacoesAtuais, [key]: proximaAnotacao };
    onChangeCE({ ...dadosCE, anotacoesDesviosMoagem: novasAnotacoes });
  };

  const sincronizarLeiturasAtuaisMoagem = (nextCE: DadosSetorConcentradorEta) => {
    CONFIG_PARAMETROS_MOAGEM.forEach(paramConfig => {
      const leituraAtual = obterLeituraAtualMoagem(nextCE, paramConfig);
      if (paramConfig.chave === "taxa_MI003") {
        nextCE.taxaMi003 = leituraAtual.numVal !== null ? leituraAtual.numVal : "";
      } else if (paramConfig.chave === "taxa_MI004") {
        nextCE.taxaMi004 = leituraAtual.numVal !== null ? leituraAtual.numVal : "";
      } else if (paramConfig.chave === "taxa_MI005") {
        nextCE.taxaMi005 = leituraAtual.numVal !== null ? leituraAtual.numVal : "";
      } else if (paramConfig.chave === "potencia_MI003") {
        nextCE.potenciaMi003 = leituraAtual.numVal !== null ? leituraAtual.numVal : "";
      } else if (paramConfig.chave === "potencia_MI004") {
        nextCE.potenciaMi004 = leituraAtual.numVal !== null ? leituraAtual.numVal : "";
      } else if (paramConfig.chave === "potencia_MI005") {
        nextCE.potenciaMi005 = leituraAtual.numVal !== null ? leituraAtual.numVal : "";
      } else if (paramConfig.chave === "solidosOverflow_MI003") {
        nextCE.solidosOverflowMi003 = leituraAtual.numVal !== null ? leituraAtual.numVal : "";
      } else if (paramConfig.chave === "solidosOverflow_MI004") {
        nextCE.solidosOverflowMi004 = leituraAtual.numVal !== null ? leituraAtual.numVal : "";
      } else if (paramConfig.chave === "solidosOverflow_MI005") {
        nextCE.solidosOverflowMi005 = leituraAtual.numVal !== null ? leituraAtual.numVal : "";
      } else if (paramConfig.chave === "solidosDescarga_MI003") {
        nextCE.solidosDescargaMi003 = leituraAtual.numVal !== null ? leituraAtual.numVal : "";
      } else if (paramConfig.chave === "solidosDescarga_MI004") {
        nextCE.solidosDescargaMi004 = leituraAtual.numVal !== null ? leituraAtual.numVal : "";
      } else if (paramConfig.chave === "solidosDescarga_MI005") {
        nextCE.solidosDescargaMi005 = leituraAtual.numVal !== null ? leituraAtual.numVal : "";
      } else if (paramConfig.chave === "densidade_MI003") {
        nextCE.densidadeMi003 = leituraAtual.numVal !== null ? leituraAtual.numVal : "";
      } else if (paramConfig.chave === "densidade_MI004") {
        nextCE.densidadeMi004 = leituraAtual.numVal !== null ? leituraAtual.numVal : "";
      } else if (paramConfig.chave === "densidade_MI005") {
        nextCE.densidadeMi005 = leituraAtual.numVal !== null ? leituraAtual.numVal : "";
      } else if (paramConfig.chave === "pressaoPsi_MI003") {
        nextCE.pressaoPsiMi003 = leituraAtual.numVal !== null ? leituraAtual.numVal : "";
      } else if (paramConfig.chave === "pressaoPsi_MI004") {
        nextCE.pressaoPsiMi004 = leituraAtual.numVal !== null ? leituraAtual.numVal : "";
      } else if (paramConfig.chave === "pressaoPsi_MI005") {
        nextCE.pressaoPsiMi005 = leituraAtual.numVal !== null ? leituraAtual.numVal : "";
      }
    });

    const t3 = typeof nextCE.taxaMi003 === "number" ? nextCE.taxaMi003 : 0;
    const t4 = typeof nextCE.taxaMi004 === "number" ? nextCE.taxaMi004 : 0;
    const t5 = typeof nextCE.taxaMi005 === "number" ? nextCE.taxaMi005 : 0;
    nextCE.taxaTotalMoagem = +(t3 + t4 + t5).toFixed(1);
  };

  const handleUpdateDiarioMoagem = (
    diaIdx: number,
    chave: keyof Omit<RegistroDiarioIndicadoresMoagem, "dia" | "diaLabel" | "observacao">,
    valor: any
  ) => {
    const novoHistorico = [...historicoDiarioMoagem];
    const parsedNum = parseNumeroBritagem(valor);
    novoHistorico[diaIdx] = {
      ...novoHistorico[diaIdx],
      [chave]: parsedNum !== null ? parsedNum : (valor === "" ? "" : valor)
    };

    const nextCE = { ...dadosCE, historicoDiarioMoagem: novoHistorico };
    sincronizarLeiturasAtuaisMoagem(nextCE);
    onChangeCE(nextCE);
  };

  const aplicarTextoExcelNaTabelaMoagem = (
    texto: string,
    startDiaIdx: number = 0,
    startColIdx: number = 0
  ) => {
    if (!texto || !texto.trim()) return;

    const linhas = texto.trim().split(/\r\n|\r|\n/);
    if (linhas.length === 0) return;

    const novoHistorico = historicoDiarioMoagem.map(item => ({ ...item }));
    let valoresAplicados = 0;

    linhas.forEach((linha, rOffset) => {
      const targetDia = startDiaIdx + rOffset;
      if (targetDia >= novoHistorico.length) return;

      const colunas = linha.includes("\t") ? linha.split("\t") : [linha];

      colunas.forEach((celulaTexto, cOffset) => {
        const targetCol = startColIdx + cOffset;
        if (targetCol >= CONFIG_PARAMETROS_MOAGEM.length) return;

        const param = CONFIG_PARAMETROS_MOAGEM[targetCol];
        const parsed = parseNumeroBritagem(celulaTexto);

        if (parsed !== null) {
          (novoHistorico[targetDia] as any)[param.chave] = parsed;
          valoresAplicados++;
        } else if (celulaTexto.trim() === "" || celulaTexto.trim() === "-") {
          (novoHistorico[targetDia] as any)[param.chave] = "";
        }
      });
    });

    if (valoresAplicados > 0) {
      const nextCE = { ...dadosCE, historicoDiarioMoagem: novoHistorico };
      sincronizarLeiturasAtuaisMoagem(nextCE);
      onChangeCE(nextCE);

      setToastMensagem(`✅ ${valoresAplicados} valor(es) do Excel aplicados na tabela de Moagem com sucesso!`);
      setAcoesSincronizadasToast(true);
      setTimeout(() => setAcoesSincronizadasToast(false), 4000);
    }
  };

  const handlePasteCelulaMoagem = (
    e: React.ClipboardEvent<HTMLInputElement>,
    diaIdx: number,
    paramIdx: number
  ) => {
    const texto = e.clipboardData.getData("text");
    if (!texto) return;

    if (texto.includes("\n") || texto.includes("\t") || texto.includes("\r")) {
      e.preventDefault();
      aplicarTextoExcelNaTabelaMoagem(texto, diaIdx, paramIdx);
    }
  };

  const handleKeyDownCelulaMoagem = (
    e: React.KeyboardEvent<HTMLInputElement>,
    diaIdx: number,
    paramIdx: number
  ) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextDia = Math.min(6, diaIdx + 1);
      const nextInput = document.getElementById(`input-moagem-${nextDia}-${paramIdx}`);
      nextInput?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevDia = Math.max(0, diaIdx - 1);
      const prevInput = document.getElementById(`input-moagem-${prevDia}-${paramIdx}`);
      prevInput?.focus();
    }
  };

  const handleLimparTabelaMoagem = () => {
    const limpo: RegistroDiarioIndicadoresMoagem[] = DADOS_DIARIOS_MOAGEM_PADRAO.map(d => ({
      dia: d.dia,
      diaLabel: d.diaLabel,
      taxa_MI003: "",
      taxa_MI004: "",
      taxa_MI005: "",
      potencia_MI003: "",
      potencia_MI004: "",
      potencia_MI005: "",
      solidosOverflow_MI003: "",
      solidosOverflow_MI004: "",
      solidosOverflow_MI005: "",
      solidosDescarga_MI003: "",
      solidosDescarga_MI004: "",
      solidosDescarga_MI005: "",
      reposicoes_MI003: "",
      reposicoes_MI004: "",
      reposicoes_MI005: "",
      pressaoHidrociclone_MI003: "",
      pressaoHidrociclone_MI004: "",
      pressaoHidrociclone_MI005: "",
      densidade_MI003: "",
      densidade_MI004: "",
      densidade_MI005: "",
      pressaoPsi_MI003: "",
      pressaoPsi_MI004: "",
      pressaoPsi_MI005: "",
      observacao: ""
    }));
    const nextCE: DadosSetorConcentradorEta = {
      ...dadosCE,
      historicoDiarioMoagem: limpo,
      taxaMi003: "",
      taxaMi004: "",
      taxaMi005: "",
      taxaTotalMoagem: 0,
      potenciaMi003: "",
      potenciaMi004: "",
      potenciaMi005: "",
      solidosOverflowMi003: "",
      solidosOverflowMi004: "",
      solidosOverflowMi005: "",
      solidosDescargaMi003: "",
      solidosDescargaMi004: "",
      solidosDescargaMi005: "",
      reposicoesMi003: "",
      reposicoesMi004: "",
      reposicoesMi005: "",
      pressaoHidrocicloneMi003: "",
      pressaoHidrocicloneMi004: "",
      pressaoHidrocicloneMi005: "",
      densidadeMi003: "",
      densidadeMi004: "",
      densidadeMi005: "",
      pressaoPsiMi003: "",
      pressaoPsiMi004: "",
      pressaoPsiMi005: ""
    };
    sincronizarLeiturasAtuaisMoagem(nextCE);
    onChangeCE(nextCE);

    setToastMensagem("Tabela de monitoramento diário da Moagem limpa com sucesso.");
    setAcoesSincronizadasToast(true);
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  const abrirModalColarColunaMoagem = (chaveParametro: string) => {
    setColunaSelecionadaParaColarMoagem(chaveParametro);
    setTextoColadoExcelMoagem("");
    setModalColarColunaMoagemAberto(true);
  };

  const handleConfirmarColarModalMoagem = () => {
    const colIdx = CONFIG_PARAMETROS_MOAGEM.findIndex(p => p.chave === colunaSelecionadaParaColarMoagem);
    if (colIdx >= 0 && textoColadoExcelMoagem.trim()) {
      aplicarTextoExcelNaTabelaMoagem(textoColadoExcelMoagem, 0, colIdx);
      setModalColarColunaMoagemAberto(false);
      setTextoColadoExcelMoagem("");
    }
  };

  const handleSincronizarAcoesCorretivasMoagem = () => {
    if (!onChangeDiretrizes) return;

    const novasAcoes: DiretrizSupervisorTurno[] = desviosDetectadosMoagem.map((desvio, i) => {
      const keyDesvio = `${desvio.chave}_${desvio.dia}`;
      const anotacao = dadosCE.anotacoesDesviosMoagem?.[keyDesvio];
      const acaoTexto = anotacao?.acaoRecomendada?.trim() || `Ajuste operacional em ${desvio.parametro.nome}`;
      const impactoTexto = anotacao?.impactoPerda?.trim() || "";

      return {
        id: `ACT-DEV-MOA-${Date.now()}-${i}`,
        setor: "Planta Concentrador & Moagem",
        acaoEstrategica: `[DESVIO OPERACIONAL - ${desvio.parametro.nome.toUpperCase()} (${desvio.diaLabel})] ${acaoTexto}`,
        responsavelTurma: "Todas as Turmas",
        supervisorNome: "Supervisão Moagem / Concentrador",
        prazoLimite: "Imediato / Turno Atual",
        status: "em_andamento",
        prioridade: "critica",
        metaEsperada: impactoTexto ? `Mitigar: ${impactoTexto}` : `Estabilizar ${desvio.parametro.nome} no alvo de ${desvio.parametro.alvo} ${desvio.parametro.unidade}`
      };
    });

    const existentes = (diretrizes || []).filter(
      d => !(d.id && d.id.startsWith("ACT-DEV-MOA-")) && !(d.acaoEstrategica && d.acaoEstrategica.startsWith("[DESVIO OPERACIONAL - ") && d.acaoEstrategica.includes("MI00"))
    );
    onChangeDiretrizes([...novasAcoes, ...existentes]);

    setAcoesSincronizadasToast(true);
    setToastMensagem("Ações da Moagem sincronizadas com a Matriz de Diretrizes!");
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  // --- REMOAGEM: HISTÓRICO DIÁRIO & CONTROLE OPERACIONAL (HIG MILL) ---
  const historicoDiarioRemoagem = useMemo(() => {
    return dadosCE.historicoDiarioRemoagem && dadosCE.historicoDiarioRemoagem.length === 7
      ? dadosCE.historicoDiarioRemoagem
      : DADOS_DIARIOS_REMOAGEM_PADRAO;
  }, [dadosCE.historicoDiarioRemoagem]);

  const handleUpdateDiarioRemoagem = (
    diaIdx: number,
    chave: keyof Omit<RegistroDiarioIndicadoresRemoagem, "dia" | "diaLabel" | "observacao">,
    valor: any
  ) => {
    const novoHistorico = [...historicoDiarioRemoagem];
    const parsedNum = parseNumeroBritagem(valor);
    novoHistorico[diaIdx] = {
      ...novoHistorico[diaIdx],
      [chave]: parsedNum !== null ? parsedNum : (valor === "" ? "" : valor)
    };

    const nextCE = { ...dadosCE, historicoDiarioRemoagem: novoHistorico };
    onChangeCE(nextCE);
  };

  const aplicarTextoExcelNaTabelaRemoagem = (
    texto: string,
    startDiaIdx: number = 0,
    startColIdx: number = 0
  ) => {
    if (!texto || !texto.trim()) return;

    const linhas = texto
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .filter(l => l.trim().length > 0);

    if (linhas.length === 0) return;

    const novoHistorico = historicoDiarioRemoagem.map(item => ({ ...item }));
    let valoresAplicados = 0;

    linhas.forEach((linha, rOffset) => {
      const targetDia = startDiaIdx + rOffset;
      if (targetDia >= novoHistorico.length) return;

      const colunas = linha.includes("\t") ? linha.split("\t") : [linha];

      colunas.forEach((celulaTexto, cOffset) => {
        const targetCol = startColIdx + cOffset;
        if (targetCol >= CONFIG_PARAMETROS_REMOAGEM.length) return;

        const param = CONFIG_PARAMETROS_REMOAGEM[targetCol];
        const parsed = parseNumeroBritagem(celulaTexto);

        if (parsed !== null) {
          (novoHistorico[targetDia] as any)[param.chave] = parsed;
          valoresAplicados++;
        } else if (celulaTexto.trim() === "" || celulaTexto.trim() === "-") {
          (novoHistorico[targetDia] as any)[param.chave] = "";
        }
      });
    });

    if (valoresAplicados > 0) {
      const nextCE = { ...dadosCE, historicoDiarioRemoagem: novoHistorico };
      onChangeCE(nextCE);

      setToastMensagem(`✅ ${valoresAplicados} valor(es) do Excel aplicados na tabela de Remoagem com sucesso!`);
      setAcoesSincronizadasToast(true);
      setTimeout(() => setAcoesSincronizadasToast(false), 4000);
    }
  };

  const handlePasteCelulaRemoagem = (
    e: React.ClipboardEvent<HTMLInputElement>,
    diaIdx: number,
    paramIdx: number
  ) => {
    const texto = e.clipboardData.getData("text");
    if (!texto) return;

    if (texto.includes("\n") || texto.includes("\t") || texto.includes("\r")) {
      e.preventDefault();
      aplicarTextoExcelNaTabelaRemoagem(texto, diaIdx, paramIdx);
    }
  };

  const handleKeyDownCelulaRemoagem = (
    e: React.KeyboardEvent<HTMLInputElement>,
    diaIdx: number,
    paramIdx: number
  ) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextDia = Math.min(6, diaIdx + 1);
      const nextInput = document.getElementById(`input-remoagem-${nextDia}-${paramIdx}`);
      nextInput?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevDia = Math.max(0, diaIdx - 1);
      const prevInput = document.getElementById(`input-remoagem-${prevDia}-${paramIdx}`);
      prevInput?.focus();
    }
  };

  const handleLimparTabelaRemoagem = () => {
    const limpo = DADOS_DIARIOS_REMOAGEM_PADRAO.map(d => ({
      dia: d.dia,
      diaLabel: d.diaLabel,
      derrickIsoladas: "",
      alimentacaoFeedF80: "",
      produtoHigP80: "",
      densidadeProdutoHig: "",
      produtoHig74: "",
      densidadeAlimDit006: "",
      fluxoAlimFit403072: "",
      fluxoAlimentacao: "",
      potenciaKw: "",
      torquePct: ""
    }));
    const nextCE = { ...dadosCE, historicoDiarioRemoagem: limpo };
    onChangeCE(nextCE);

    setToastMensagem("Tabela de monitoramento diário da Remoagem limpa com sucesso.");
    setAcoesSincronizadasToast(true);
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  const handlePreencherPadraoRemoagem = () => {
    const padrao = DADOS_DIARIOS_REMOAGEM_PADRAO.map(d => ({ ...d }));
    const nextCE = { ...dadosCE, historicoDiarioRemoagem: padrao };
    onChangeCE(nextCE);

    setToastMensagem("Valores de referência da Remoagem carregados.");
    setAcoesSincronizadasToast(true);
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  const abrirModalColarColunaRemoagem = (chaveParametro: string) => {
    setColunaSelecionadaParaColarRemoagem(chaveParametro);
    setTextoColadoExcelRemoagem("");
    setModalColarColunaRemoagemAberto(true);
  };

  const handleConfirmarColarModalRemoagem = () => {
    const colIdx = CONFIG_PARAMETROS_REMOAGEM.findIndex(p => p.chave === colunaSelecionadaParaColarRemoagem);
    if (colIdx >= 0 && textoColadoExcelRemoagem.trim()) {
      aplicarTextoExcelNaTabelaRemoagem(textoColadoExcelRemoagem, 0, colIdx);
      setModalColarColunaRemoagemAberto(false);
      setTextoColadoExcelRemoagem("");
    }
  };

  const desviosDetectadosRemoagem = useMemo(() => {
    return detectarDesviosRemoagem(historicoDiarioRemoagem, dadosCE.anotacoesDesviosRemoagem);
  }, [historicoDiarioRemoagem, dadosCE.anotacoesDesviosRemoagem]);

  const handleUpdateAnotacaoDesvioRemoagem = (key: string, field: "impactoPerda" | "acaoRecomendada", val: string) => {
    const anotacoesAtuais = dadosCE.anotacoesDesviosRemoagem || {};
    const itemAtual = anotacoesAtuais[key] || { impactoPerda: "", acaoRecomendada: "" };
    const proximaAnotacao = { ...itemAtual, [field]: val };
    const novasAnotacoes = { ...anotacoesAtuais, [key]: proximaAnotacao };
    onChangeCE({ ...dadosCE, anotacoesDesviosRemoagem: novasAnotacoes });
  };

  const handleSincronizarAcoesCorretivasRemoagem = () => {
    if (!onChangeDiretrizes) return;

    const novasAcoes: DiretrizSupervisorTurno[] = desviosDetectadosRemoagem.map((desvio, i) => {
      const keyDesvio = `${desvio.chave}_${desvio.dia}`;
      const anotacao = dadosCE.anotacoesDesviosRemoagem?.[keyDesvio];
      const acaoTexto = anotacao?.acaoRecomendada?.trim() || desvio.parametro.acaoRecomendada;
      const impactoTexto = anotacao?.impactoPerda?.trim() || desvio.parametro.impactoDesvio;

      return {
        id: `ACT-DEV-REM-${Date.now()}-${i}`,
        setor: "Planta Concentrador & Remoagem",
        acaoEstrategica: `[DESVIO OPERACIONAL - ${desvio.parametro.nome.toUpperCase()} (${desvio.diaLabel})] ${acaoTexto}`,
        responsavelTurma: "Todas as Turmas",
        supervisorNome: "Supervisão Remoagem / HIG Mill",
        prazoLimite: "Imediato / Turno Atual",
        status: "em_andamento",
        prioridade: "critica",
        metaEsperada: impactoTexto ? `Mitigar: ${impactoTexto}` : `Estabilizar ${desvio.parametro.nome} no alvo de ${desvio.parametro.alvo} ${desvio.parametro.unidade}`
      };
    });

    const existentes = (diretrizes || []).filter(
      d => !(d.id && d.id.startsWith("ACT-DEV-REM-")) && !(d.acaoEstrategica && d.acaoEstrategica.startsWith("[DESVIO OPERACIONAL - ") && d.acaoEstrategica.includes("HIG"))
    );
    onChangeDiretrizes([...novasAcoes, ...existentes]);

    setAcoesSincronizadasToast(true);
    setToastMensagem("Ações da Remoagem sincronizadas com a Matriz de Diretrizes!");
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  // --- FLOTAÇÃO: HISTÓRICO DIÁRIO & CONTROLE OPERACIONAL ---
  const historicoDiarioFlotacao = useMemo(() => {
    return dadosCE.historicoDiarioFlotacao && dadosCE.historicoDiarioFlotacao.length === 7
      ? dadosCE.historicoDiarioFlotacao
      : DADOS_DIARIOS_FLOTACAO_PADRAO;
  }, [dadosCE.historicoDiarioFlotacao]);

  const handleUpdateDiarioFlotacao = (
    diaIdx: number,
    chave: keyof Omit<RegistroDiarioIndicadoresFlotacao, "dia" | "diaLabel" | "observacao">,
    valor: any
  ) => {
    const novoHistorico = [...historicoDiarioFlotacao];
    const parsedNum = parseNumeroBritagem(valor);
    novoHistorico[diaIdx] = {
      ...novoHistorico[diaIdx],
      [chave]: parsedNum !== null ? parsedNum : (valor === "" ? "" : valor)
    };

    const nextCE = { ...dadosCE, historicoDiarioFlotacao: novoHistorico };
    onChangeCE(nextCE);
  };

  const aplicarTextoExcelNaTabelaFlotacao = (
    texto: string,
    startDiaIdx: number = 0,
    startColIdx: number = 0
  ) => {
    if (!texto || !texto.trim()) return;

    const linhas = texto
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .filter(l => l.trim().length > 0);

    if (linhas.length === 0) return;

    const novoHistorico = historicoDiarioFlotacao.map(item => ({ ...item }));
    let valoresAplicados = 0;

    linhas.forEach((linha, rOffset) => {
      const targetDia = startDiaIdx + rOffset;
      if (targetDia >= novoHistorico.length) return;

      const colunas = linha.includes("\t") ? linha.split("\t") : [linha];

      colunas.forEach((celulaTexto, cOffset) => {
        const targetCol = startColIdx + cOffset;
        if (targetCol >= CONFIG_PARAMETROS_FLOTACAO.length) return;

        const param = CONFIG_PARAMETROS_FLOTACAO[targetCol];
        const parsed = parseNumeroBritagem(celulaTexto);

        if (parsed !== null) {
          (novoHistorico[targetDia] as any)[param.chave] = parsed;
          valoresAplicados++;
        } else if (celulaTexto.trim() === "" || celulaTexto.trim() === "-") {
          (novoHistorico[targetDia] as any)[param.chave] = "";
        }
      });
    });

    if (valoresAplicados > 0) {
      const nextCE = { ...dadosCE, historicoDiarioFlotacao: novoHistorico };
      onChangeCE(nextCE);

      setToastMensagem(`✅ ${valoresAplicados} valor(es) do Excel aplicados na tabela de Flotação com sucesso!`);
      setAcoesSincronizadasToast(true);
      setTimeout(() => setAcoesSincronizadasToast(false), 4000);
    }
  };

  const handlePasteCelulaFlotacao = (
    e: React.ClipboardEvent<HTMLInputElement>,
    diaIdx: number,
    paramIdx: number
  ) => {
    const texto = e.clipboardData.getData("text");
    if (!texto) return;

    if (texto.includes("\n") || texto.includes("\t") || texto.includes("\r")) {
      e.preventDefault();
      aplicarTextoExcelNaTabelaFlotacao(texto, diaIdx, paramIdx);
    }
  };

  const handleKeyDownCelulaFlotacao = (
    e: React.KeyboardEvent<HTMLInputElement>,
    diaIdx: number,
    paramIdx: number
  ) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextDia = Math.min(6, diaIdx + 1);
      const nextInput = document.getElementById(`input-flotacao-${nextDia}-${paramIdx}`);
      nextInput?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevDia = Math.max(0, diaIdx - 1);
      const prevInput = document.getElementById(`input-flotacao-${prevDia}-${paramIdx}`);
      prevInput?.focus();
    }
  };

  const handleLimparTabelaFlotacao = () => {
    const limpo = DADOS_DIARIOS_FLOTACAO_PADRAO.map(d => ({
      dia: d.dia,
      diaLabel: d.diaLabel,
      solidosRougher: "",
      solidosCleaner: "",
      solidosRecleaner: "",
      solidosScsRougher: "",
      dosagemCmc: "",
      dosagemAmidex: "",
      dosagemColetor: "",
      dosagemEspumante: "",
      phRougher: "",
      phCleaner: "",
      phJameson: "",
      teorCf: "",
      teorRf: ""
    }));
    const nextCE = { ...dadosCE, historicoDiarioFlotacao: limpo };
    onChangeCE(nextCE);

    setToastMensagem("Tabela de monitoramento diário da Flotação limpa com sucesso.");
    setAcoesSincronizadasToast(true);
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  const handlePreencherPadraoFlotacao = () => {
    const padrao = DADOS_DIARIOS_FLOTACAO_PADRAO.map(d => ({ ...d }));
    const nextCE = { ...dadosCE, historicoDiarioFlotacao: padrao };
    onChangeCE(nextCE);

    setToastMensagem("Valores de referência da Flotação carregados.");
    setAcoesSincronizadasToast(true);
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  const abrirModalColarColunaFlotacao = (chaveParametro: string) => {
    setColunaSelecionadaParaColarFlotacao(chaveParametro);
    setTextoColadoExcelFlotacao("");
    setModalColarColunaFlotacaoAberto(true);
  };

  const handleConfirmarColarModalFlotacao = () => {
    const colIdx = CONFIG_PARAMETROS_FLOTACAO.findIndex(p => p.chave === colunaSelecionadaParaColarFlotacao);
    if (colIdx >= 0 && textoColadoExcelFlotacao.trim()) {
      aplicarTextoExcelNaTabelaFlotacao(textoColadoExcelFlotacao, 0, colIdx);
      setModalColarColunaFlotacaoAberto(false);
      setTextoColadoExcelFlotacao("");
    }
  };

  const desviosDetectadosFlotacao = useMemo(() => {
    return detectarDesviosFlotacao(historicoDiarioFlotacao, dadosCE.anotacoesDesviosFlotacao);
  }, [historicoDiarioFlotacao, dadosCE.anotacoesDesviosFlotacao]);

  const handleUpdateAnotacaoDesvioFlotacao = (key: string, field: "impactoPerda" | "acaoRecomendada", val: string) => {
    const anotacoesAtuais = dadosCE.anotacoesDesviosFlotacao || {};
    const itemAtual = anotacoesAtuais[key] || { impactoPerda: "", acaoRecomendada: "" };
    const proximaAnotacao = { ...itemAtual, [field]: val };
    const novasAnotacoes = { ...anotacoesAtuais, [key]: proximaAnotacao };
    onChangeCE({ ...dadosCE, anotacoesDesviosFlotacao: novasAnotacoes });
  };

  const handleSincronizarAcoesCorretivasFlotacao = () => {
    if (!onChangeDiretrizes) return;

    const novasAcoes: DiretrizSupervisorTurno[] = desviosDetectadosFlotacao.map((desvio, i) => {
      const keyDesvio = `${desvio.chave}_${desvio.dia}`;
      const anotacao = dadosCE.anotacoesDesviosFlotacao?.[keyDesvio];
      const acaoTexto = anotacao?.acaoRecomendada?.trim() || desvio.parametro.acaoRecomendada;
      const impactoTexto = anotacao?.impactoPerda?.trim() || desvio.parametro.impactoDesvio;

      return {
        id: `ACT-DEV-FLOT-${Date.now()}-${i}`,
        setor: "Planta Concentrador & Flotação",
        acaoEstrategica: `[DESVIO OPERACIONAL - ${desvio.parametro.nome.toUpperCase()} (${desvio.diaLabel})] ${acaoTexto}`,
        responsavelTurma: "Todas as Turmas",
        supervisorNome: "Supervisão Flotação de Cobre",
        prazoLimite: "Imediato / Turno Atual",
        status: "em_andamento",
        prioridade: "critica",
        metaEsperada: impactoTexto ? `Mitigar: ${impactoTexto}` : `Estabilizar ${desvio.parametro.nome} no alvo de ${desvio.parametro.alvo} ${desvio.parametro.unidade}`
      };
    });

    const existentes = (diretrizes || []).filter(
      d => !(d.id && d.id.startsWith("ACT-DEV-FLOT-")) && !(d.acaoEstrategica && d.acaoEstrategica.startsWith("[DESVIO OPERACIONAL - ") && (d.acaoEstrategica.includes("ROUGHER") || d.acaoEstrategica.includes("CLEANER") || d.acaoEstrategica.includes("REAGENTES") || d.acaoEstrategica.includes("PH")))
    );
    onChangeDiretrizes([...novasAcoes, ...existentes]);

    setAcoesSincronizadasToast(true);
    setToastMensagem("Ações da Flotação sincronizadas com a Matriz de Diretrizes!");
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  // --- ESPESSAMENTO DE REJEITO: HISTÓRICO DIÁRIO & CONTROLE OPERACIONAL ---
  const historicoDiarioEspessamentoRejeito = useMemo(() => {
    return dadosCE.historicoDiarioEspessamentoRejeito && dadosCE.historicoDiarioEspessamentoRejeito.length === 7
      ? dadosCE.historicoDiarioEspessamentoRejeito
      : DADOS_DIARIOS_ESPESSAMENTO_REJEITO_PADRAO;
  }, [dadosCE.historicoDiarioEspessamentoRejeito]);

  const handleUpdateDiarioEspessamentoRejeito = (
    diaIdx: number,
    chave: keyof Omit<RegistroDiarioIndicadoresEspessamentoRejeito, "dia" | "diaLabel" | "observacao">,
    valor: any
  ) => {
    const novoHistorico = [...historicoDiarioEspessamentoRejeito];
    const parsedNum = parseNumeroBritagem(valor);
    novoHistorico[diaIdx] = {
      ...novoHistorico[diaIdx],
      [chave]: parsedNum !== null ? parsedNum : (valor === "" ? "" : valor)
    };

    const nextCE = { ...dadosCE, historicoDiarioEspessamentoRejeito: novoHistorico };
    onChangeCE(nextCE);
  };

  const aplicarTextoExcelNaTabelaEspessamentoRejeito = (
    texto: string,
    startDiaIdx: number = 0,
    startColIdx: number = 0
  ) => {
    if (!texto || !texto.trim()) return;

    const linhas = texto
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .filter(l => l.trim().length > 0);

    if (linhas.length === 0) return;

    const novoHistorico = historicoDiarioEspessamentoRejeito.map(item => ({ ...item }));
    let valoresAplicados = 0;

    linhas.forEach((linha, rOffset) => {
      const targetDia = startDiaIdx + rOffset;
      if (targetDia >= novoHistorico.length) return;

      const colunas = linha.includes("\t") ? linha.split("\t") : [linha];

      colunas.forEach((celulaTexto, cOffset) => {
        const targetCol = startColIdx + cOffset;
        if (targetCol >= CONFIG_PARAMETROS_ESPESSAMENTO_REJEITO.length) return;

        const param = CONFIG_PARAMETROS_ESPESSAMENTO_REJEITO[targetCol];
        const parsed = parseNumeroBritagem(celulaTexto);

        if (parsed !== null) {
          (novoHistorico[targetDia] as any)[param.chave] = parsed;
          valoresAplicados++;
        } else if (celulaTexto.trim() === "" || celulaTexto.trim() === "-") {
          (novoHistorico[targetDia] as any)[param.chave] = "";
        }
      });
    });

    if (valoresAplicados > 0) {
      const nextCE = { ...dadosCE, historicoDiarioEspessamentoRejeito: novoHistorico };
      onChangeCE(nextCE);

      setToastMensagem(`✅ ${valoresAplicados} valor(es) do Excel aplicados na tabela de Espessamento de Rejeito com sucesso!`);
      setAcoesSincronizadasToast(true);
      setTimeout(() => setAcoesSincronizadasToast(false), 4000);
    }
  };

  const handlePasteCelulaEspessamentoRejeito = (
    e: React.ClipboardEvent<HTMLInputElement>,
    diaIdx: number,
    paramIdx: number
  ) => {
    const texto = e.clipboardData.getData("text");
    if (!texto) return;

    if (texto.includes("\n") || texto.includes("\t") || texto.includes("\r")) {
      e.preventDefault();
      aplicarTextoExcelNaTabelaEspessamentoRejeito(texto, diaIdx, paramIdx);
    }
  };

  const handleKeyDownCelulaEspessamentoRejeito = (
    e: React.KeyboardEvent<HTMLInputElement>,
    diaIdx: number,
    paramIdx: number
  ) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextDia = Math.min(6, diaIdx + 1);
      const nextInput = document.getElementById(`input-espessamento-${nextDia}-${paramIdx}`);
      nextInput?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevDia = Math.max(0, diaIdx - 1);
      const prevInput = document.getElementById(`input-espessamento-${prevDia}-${paramIdx}`);
      prevInput?.focus();
    }
  };

  const handleLimparTabelaEspessamentoRejeito = () => {
    const limpo = DADOS_DIARIOS_ESPESSAMENTO_REJEITO_PADRAO.map(d => ({
      dia: d.dia,
      diaLabel: d.diaLabel,
      densidadeUnderflowRej: "",
      torqueRejEp001: "",
      torqueRejEp002: "",
      solidosRej45ep001: "",
      solidosRej45ep002: "",
      solidosRejBh01: "",
      solidosRejBh02: "",
      solidosRejBh03: "",
      consumoFloculanteRej: "",
      espessadorRejOp: "",
      htrLinha1: "",
      htrLinha2: "",
      htrLinha3: "",
      htrLinha4: "",
      htrPastFill: ""
    }));
    const nextCE = { ...dadosCE, historicoDiarioEspessamentoRejeito: limpo };
    onChangeCE(nextCE);

    setToastMensagem("Tabela de monitoramento diário do Espessamento de Rejeito limpa com sucesso.");
    setAcoesSincronizadasToast(true);
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  const handlePreencherPadraoEspessamentoRejeito = () => {
    const padrao = DADOS_DIARIOS_ESPESSAMENTO_REJEITO_PADRAO.map(d => ({ ...d }));
    const nextCE = { ...dadosCE, historicoDiarioEspessamentoRejeito: padrao };
    onChangeCE(nextCE);

    setToastMensagem("Valores de referência do Espessamento de Rejeito carregados.");
    setAcoesSincronizadasToast(true);
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  const abrirModalColarColunaEspessamentoRejeito = (chaveParametro: string) => {
    setColunaSelecionadaParaColarEspessamentoRejeito(chaveParametro);
    setTextoColadoExcelEspessamentoRejeito("");
    setModalColarColunaEspessamentoRejeitoAberto(true);
  };

  const handleConfirmarColarModalEspessamentoRejeito = () => {
    const colIdx = CONFIG_PARAMETROS_ESPESSAMENTO_REJEITO.findIndex(p => p.chave === colunaSelecionadaParaColarEspessamentoRejeito);
    if (colIdx >= 0 && textoColadoExcelEspessamentoRejeito.trim()) {
      aplicarTextoExcelNaTabelaEspessamentoRejeito(textoColadoExcelEspessamentoRejeito, 0, colIdx);
      setModalColarColunaEspessamentoRejeitoAberto(false);
      setTextoColadoExcelEspessamentoRejeito("");
    }
  };

  const desviosDetectadosEspessamentoRejeito = useMemo(() => {
    return detectarDesviosEspessamentoRejeito(historicoDiarioEspessamentoRejeito, dadosCE.anotacoesDesviosEspessamentoRejeito);
  }, [historicoDiarioEspessamentoRejeito, dadosCE.anotacoesDesviosEspessamentoRejeito]);

  const handleUpdateAnotacaoDesvioEspessamentoRejeito = (key: string, field: "impactoPerda" | "acaoRecomendada", val: string) => {
    const anotacoesAtuais = dadosCE.anotacoesDesviosEspessamentoRejeito || {};
    const itemAtual = anotacoesAtuais[key] || { impactoPerda: "", acaoRecomendada: "" };
    const proximaAnotacao = { ...itemAtual, [field]: val };
    const novasAnotacoes = { ...anotacoesAtuais, [key]: proximaAnotacao };
    onChangeCE({ ...dadosCE, anotacoesDesviosEspessamentoRejeito: novasAnotacoes });
  };

  const handleSincronizarAcoesCorretivasEspessamentoRejeito = () => {
    if (!onChangeDiretrizes) return;

    const novasAcoes: DiretrizSupervisorTurno[] = desviosDetectadosEspessamentoRejeito.map((desvio, i) => {
      const keyDesvio = `${desvio.chave}_${desvio.dia}`;
      const anotacao = dadosCE.anotacoesDesviosEspessamentoRejeito?.[keyDesvio];
      const acaoTexto = anotacao?.acaoRecomendada?.trim() || desvio.parametro.acaoRecomendada;
      const impactoTexto = anotacao?.impactoPerda?.trim() || desvio.parametro.impactoDesvio;

      return {
        id: `ACT-DEV-REJ-${Date.now()}-${i}`,
        setor: "Espessamento & Rejeito",
        acaoEstrategica: `[DESVIO OPERACIONAL - ${desvio.parametro.nome.toUpperCase()} (${desvio.diaLabel})] ${acaoTexto}`,
        responsavelTurma: "Todas as Turmas",
        supervisorNome: "Supervisão Espessamento & Disposição",
        prazoLimite: "Imediato / Turno Atual",
        status: "em_andamento",
        prioridade: "alta",
        metaEsperada: impactoTexto ? `Mitigar: ${impactoTexto}` : `Estabilizar ${desvio.parametro.nome} no alvo de ${desvio.parametro.alvo} ${desvio.parametro.unidade}`
      };
    });

    const existentes = (diretrizes || []).filter(
      d => !(d.id && d.id.startsWith("ACT-DEV-REJ-"))
    );
    onChangeDiretrizes([...novasAcoes, ...existentes]);

    setAcoesSincronizadasToast(true);
    setToastMensagem("Ações do Espessamento de Rejeito sincronizadas com a Matriz de Diretrizes!");
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  // --- ESPESSAMENTO DE CONCENTRADO: HISTÓRICO DIÁRIO & CONTROLE OPERACIONAL ---
  const historicoDiarioEspessamentoConcentrado = useMemo(() => {
    return dadosCE.historicoDiarioEspessamentoConcentrado && dadosCE.historicoDiarioEspessamentoConcentrado.length === 7
      ? dadosCE.historicoDiarioEspessamentoConcentrado
      : DADOS_DIARIOS_ESPESSAMENTO_CONCENTRADO_PADRAO;
  }, [dadosCE.historicoDiarioEspessamentoConcentrado]);

  const handleUpdateDiarioEspessamentoConcentrado = (
    diaIdx: number,
    chave: keyof Omit<RegistroDiarioIndicadoresEspessamentoConcentrado, "dia" | "diaLabel" | "observacao">,
    valor: any
  ) => {
    const novoHistorico = [...historicoDiarioEspessamentoConcentrado];
    const parsedNum = parseNumeroBritagem(valor);
    novoHistorico[diaIdx] = {
      ...novoHistorico[diaIdx],
      [chave]: parsedNum !== null ? parsedNum : (valor === "" ? "" : valor)
    };

    const nextCE = { ...dadosCE, historicoDiarioEspessamentoConcentrado: novoHistorico };
    onChangeCE(nextCE);
  };

  const aplicarTextoExcelNaTabelaEspessamentoConcentrado = (
    texto: string,
    startDiaIdx: number = 0,
    startColIdx: number = 0
  ) => {
    if (!texto || !texto.trim()) return;

    const linhas = texto
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .filter(l => l.trim().length > 0);

    if (linhas.length === 0) return;

    const novoHistorico = historicoDiarioEspessamentoConcentrado.map(item => ({ ...item }));
    let valoresAplicados = 0;

    linhas.forEach((linha, rOffset) => {
      const targetDia = startDiaIdx + rOffset;
      if (targetDia >= novoHistorico.length) return;

      const colunas = linha.includes("\t") ? linha.split("\t") : [linha];

      colunas.forEach((celulaTexto, cOffset) => {
        const targetCol = startColIdx + cOffset;
        if (targetCol >= CONFIG_PARAMETROS_ESPESSAMENTO_CONCENTRADO.length) return;

        const param = CONFIG_PARAMETROS_ESPESSAMENTO_CONCENTRADO[targetCol];
        const parsed = parseNumeroBritagem(celulaTexto);

        if (parsed !== null) {
          (novoHistorico[targetDia] as any)[param.chave] = parsed;
          valoresAplicados++;
        } else if (celulaTexto.trim() === "" || celulaTexto.trim() === "-") {
          (novoHistorico[targetDia] as any)[param.chave] = "";
        }
      });
    });

    if (valoresAplicados > 0) {
      const nextCE = { ...dadosCE, historicoDiarioEspessamentoConcentrado: novoHistorico };
      onChangeCE(nextCE);

      setToastMensagem(`✅ ${valoresAplicados} valor(es) do Excel aplicados na tabela de Espessamento de Concentrado com sucesso!`);
      setAcoesSincronizadasToast(true);
      setTimeout(() => setAcoesSincronizadasToast(false), 4000);
    }
  };

  const handlePasteCelulaEspessamentoConcentrado = (
    e: React.ClipboardEvent<HTMLInputElement>,
    diaIdx: number,
    paramIdx: number
  ) => {
    const texto = e.clipboardData.getData("text");
    if (!texto) return;

    if (texto.includes("\n") || texto.includes("\t") || texto.includes("\r")) {
      e.preventDefault();
      aplicarTextoExcelNaTabelaEspessamentoConcentrado(texto, diaIdx, paramIdx);
    }
  };

  const handleKeyDownCelulaEspessamentoConcentrado = (
    e: React.KeyboardEvent<HTMLInputElement>,
    diaIdx: number,
    paramIdx: number
  ) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextDia = Math.min(6, diaIdx + 1);
      const nextInput = document.getElementById(`input-espessamento-conc-${nextDia}-${paramIdx}`);
      nextInput?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevDia = Math.max(0, diaIdx - 1);
      const prevInput = document.getElementById(`input-espessamento-conc-${prevDia}-${paramIdx}`);
      prevInput?.focus();
    }
  };

  const handleLimparTabelaEspessamentoConcentrado = () => {
    const limpo = DADOS_DIARIOS_ESPESSAMENTO_CONCENTRADO_PADRAO.map(d => ({
      dia: d.dia,
      diaLabel: d.diaLabel,
      espessadorConcOp: "",
      densidadeUnderflowConc: "",
      solidosConc44ep001: "",
      solidosConc44ep002: "",
      nivelTanqueConc: "",
      consumoFloculanteConc: "",
      elevacaoRakeConcEp001: "",
      elevacaoRakeConcEp002: "",
      torqueConcEp001: "",
      torqueConcEp002: ""
    }));
    const nextCE = { ...dadosCE, historicoDiarioEspessamentoConcentrado: limpo };
    onChangeCE(nextCE);

    setToastMensagem("Tabela de monitoramento diário do Espessamento de Concentrado limpa com sucesso.");
    setAcoesSincronizadasToast(true);
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  const handlePreencherPadraoEspessamentoConcentrado = () => {
    const padrao = DADOS_DIARIOS_ESPESSAMENTO_CONCENTRADO_PADRAO.map(d => ({ ...d }));
    const nextCE = { ...dadosCE, historicoDiarioEspessamentoConcentrado: padrao };
    onChangeCE(nextCE);

    setToastMensagem("Valores de referência do Espessamento de Concentrado carregados.");
    setAcoesSincronizadasToast(true);
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  const abrirModalColarColunaEspessamentoConcentrado = (chaveParametro: string) => {
    setColunaSelecionadaParaColarEspessamentoConcentrado(chaveParametro);
    setTextoColadoExcelEspessamentoConcentrado("");
    setModalColarColunaEspessamentoConcentradoAberto(true);
  };

  const handleConfirmarColarModalEspessamentoConcentrado = () => {
    const colIdx = CONFIG_PARAMETROS_ESPESSAMENTO_CONCENTRADO.findIndex(p => p.chave === colunaSelecionadaParaColarEspessamentoConcentrado);
    if (colIdx >= 0 && textoColadoExcelEspessamentoConcentrado.trim()) {
      aplicarTextoExcelNaTabelaEspessamentoConcentrado(textoColadoExcelEspessamentoConcentrado, 0, colIdx);
      setModalColarColunaEspessamentoConcentradoAberto(false);
      setTextoColadoExcelEspessamentoConcentrado("");
    }
  };

  const desviosDetectadosEspessamentoConcentrado = useMemo(() => {
    return detectarDesviosEspessamentoConcentrado(historicoDiarioEspessamentoConcentrado, dadosCE.anotacoesDesviosEspessamentoConcentrado);
  }, [historicoDiarioEspessamentoConcentrado, dadosCE.anotacoesDesviosEspessamentoConcentrado]);

  const handleUpdateAnotacaoDesvioEspessamentoConcentrado = (key: string, field: "impactoPerda" | "acaoRecomendada", val: string) => {
    const anotacoesAtuais = dadosCE.anotacoesDesviosEspessamentoConcentrado || {};
    const itemAtual = anotacoesAtuais[key] || { impactoPerda: "", acaoRecomendada: "" };
    const proximaAnotacao = { ...itemAtual, [field]: val };
    const novasAnotacoes = { ...anotacoesAtuais, [key]: proximaAnotacao };
    onChangeCE({ ...dadosCE, anotacoesDesviosEspessamentoConcentrado: novasAnotacoes });
  };

  const handleSincronizarAcoesCorretivasEspessamentoConcentrado = () => {
    if (!onChangeDiretrizes) return;

    const novasAcoes: DiretrizSupervisorTurno[] = desviosDetectadosEspessamentoConcentrado.map((desvio, i) => {
      const keyDesvio = `${desvio.chave}_${desvio.dia}`;
      const anotacao = dadosCE.anotacoesDesviosEspessamentoConcentrado?.[keyDesvio];
      const acaoTexto = anotacao?.acaoRecomendada?.trim() || desvio.parametro.acaoRecomendada;
      const impactoTexto = anotacao?.impactoPerda?.trim() || desvio.parametro.impactoDesvio;

      return {
        id: `ACT-DEV-CONC-${Date.now()}-${i}`,
        setor: "Espessamento & Concentrado",
        acaoEstrategica: `[DESVIO OPERACIONAL - ${desvio.parametro.nome.toUpperCase()} (${desvio.diaLabel})] ${acaoTexto}`,
        responsavelTurma: "Todas as Turmas",
        supervisorNome: "Supervisão Espessamento & Filtragem",
        prazoLimite: "Imediato / Turno Atual",
        status: "em_andamento",
        prioridade: "alta",
        metaEsperada: impactoTexto ? `Mitigar: ${impactoTexto}` : `Estabilizar ${desvio.parametro.nome} no alvo de ${desvio.parametro.alvo} ${desvio.parametro.unidade}`
      };
    });

    const existentes = (diretrizes || []).filter(
      d => !(d.id && d.id.startsWith("ACT-DEV-CONC-"))
    );
    onChangeDiretrizes([...novasAcoes, ...existentes]);

    setAcoesSincronizadasToast(true);
    setToastMensagem("Ações do Espessamento de Concentrado sincronizadas com a Matriz de Diretrizes!");
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  // --- FILTRAGEM DE CONCENTRADO: HISTÓRICO DIÁRIO & CONTROLE OPERACIONAL ---
  const historicoDiarioFiltragemConcentrado = useMemo(() => {
    return dadosCE.historicoDiarioFiltragemConcentrado && dadosCE.historicoDiarioFiltragemConcentrado.length === 7
      ? dadosCE.historicoDiarioFiltragemConcentrado
      : DADOS_DIARIOS_FILTRAGEM_CONCENTRADO_PADRAO;
  }, [dadosCE.historicoDiarioFiltragemConcentrado]);

  const handleUpdateDiarioFiltragemConcentrado = (
    diaIdx: number,
    chave: keyof Omit<RegistroDiarioIndicadoresFiltragemConcentrado, "dia" | "diaLabel" | "observacao">,
    valor: any
  ) => {
    const novoHistorico = [...historicoDiarioFiltragemConcentrado];
    const parsedNum = parseNumeroBritagem(valor);
    const rowAtual = { ...novoHistorico[diaIdx] };

    (rowAtual as any)[chave] = parsedNum !== null ? parsedNum : (valor === "" ? "" : valor);

    // Se alterou paradas ou produtividade, e não é edição direta de producaoFiltragem, recalcula producaoFiltragem
    if (chave === "paradasManutencaoFiltro" || chave === "paradasOutrosFiltro" || chave === "produtividadeFiltro") {
      const pm = Number(rowAtual.paradasManutencaoFiltro || 0);
      const po = Number(rowAtual.paradasOutrosFiltro || 0);
      const prod = Number(rowAtual.produtividadeFiltro || 0);
      if (prod > 0) {
        rowAtual.producaoFiltragem = Math.round(Math.max(0, 12 - pm - po) * prod);
      }
    }

    novoHistorico[diaIdx] = rowAtual;

    const nextCE = {
      ...dadosCE,
      historicoDiarioFiltragemConcentrado: novoHistorico,
      producaoFiltragem: rowAtual.producaoFiltragem !== undefined ? rowAtual.producaoFiltragem : dadosCE.producaoFiltragem,
      produtividadeFiltro: rowAtual.produtividadeFiltro !== undefined ? rowAtual.produtividadeFiltro : dadosCE.produtividadeFiltro,
      umidadeBolo: rowAtual.umidadeBolo !== undefined ? rowAtual.umidadeBolo : dadosCE.umidadeBolo,
      ciclosFiltro: rowAtual.ciclosFiltro !== undefined ? rowAtual.ciclosFiltro : dadosCE.ciclosFiltro,
      pressaoCompactacao: rowAtual.pressaoCompactacao !== undefined ? rowAtual.pressaoCompactacao : dadosCE.pressaoCompactacao,
      paradasManutencaoFiltro: rowAtual.paradasManutencaoFiltro !== undefined ? rowAtual.paradasManutencaoFiltro : dadosCE.paradasManutencaoFiltro,
      paradasOutrosFiltro: rowAtual.paradasOutrosFiltro !== undefined ? rowAtual.paradasOutrosFiltro : dadosCE.paradasOutrosFiltro,
      filtroConcOp: rowAtual.filtroConcOp || dadosCE.filtroConcOp || "Ambos"
    };
    onChangeCE(nextCE);
  };

  const aplicarTextoExcelNaTabelaFiltragemConcentrado = (
    texto: string,
    startDiaIdx: number = 0,
    startColIdx: number = 0
  ) => {
    if (!texto || !texto.trim()) return;

    const linhas = texto
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .filter(l => l.trim().length > 0);

    if (linhas.length === 0) return;

    const novoHistorico = historicoDiarioFiltragemConcentrado.map(item => ({ ...item }));
    let valoresAplicados = 0;

    linhas.forEach((linha, rOffset) => {
      const targetDia = startDiaIdx + rOffset;
      if (targetDia >= novoHistorico.length) return;

      const colunas = linha.includes("\t") ? linha.split("\t") : [linha];

      colunas.forEach((celulaTexto, cOffset) => {
        const targetCol = startColIdx + cOffset;
        if (targetCol >= CONFIG_PARAMETROS_FILTRAGEM_CONCENTRADO.length) return;

        const param = CONFIG_PARAMETROS_FILTRAGEM_CONCENTRADO[targetCol];
        const parsed = parseNumeroBritagem(celulaTexto);

        if (parsed !== null) {
          (novoHistorico[targetDia] as any)[param.chave] = parsed;
          valoresAplicados++;
        } else if (celulaTexto.trim() === "" || celulaTexto.trim() === "-") {
          (novoHistorico[targetDia] as any)[param.chave] = "";
        }
      });
    });

    if (valoresAplicados > 0) {
      const lastRow = novoHistorico[novoHistorico.length - 1];
      const nextCE = {
        ...dadosCE,
        historicoDiarioFiltragemConcentrado: novoHistorico,
        producaoFiltragem: lastRow.producaoFiltragem !== undefined ? lastRow.producaoFiltragem : dadosCE.producaoFiltragem,
        produtividadeFiltro: lastRow.produtividadeFiltro !== undefined ? lastRow.produtividadeFiltro : dadosCE.produtividadeFiltro,
        umidadeBolo: lastRow.umidadeBolo !== undefined ? lastRow.umidadeBolo : dadosCE.umidadeBolo,
        ciclosFiltro: lastRow.ciclosFiltro !== undefined ? lastRow.ciclosFiltro : dadosCE.ciclosFiltro,
        pressaoCompactacao: lastRow.pressaoCompactacao !== undefined ? lastRow.pressaoCompactacao : dadosCE.pressaoCompactacao,
        paradasManutencaoFiltro: lastRow.paradasManutencaoFiltro !== undefined ? lastRow.paradasManutencaoFiltro : dadosCE.paradasManutencaoFiltro,
        paradasOutrosFiltro: lastRow.paradasOutrosFiltro !== undefined ? lastRow.paradasOutrosFiltro : dadosCE.paradasOutrosFiltro
      };
      onChangeCE(nextCE);

      setToastMensagem(`✅ ${valoresAplicados} valor(es) do Excel aplicados na tabela de Filtragem de Concentrado com sucesso!`);
      setAcoesSincronizadasToast(true);
      setTimeout(() => setAcoesSincronizadasToast(false), 4000);
    }
  };

  const handlePasteCelulaFiltragemConcentrado = (
    e: React.ClipboardEvent<HTMLInputElement>,
    diaIdx: number,
    paramIdx: number
  ) => {
    const texto = e.clipboardData.getData("text");
    if (!texto) return;

    if (texto.includes("\n") || texto.includes("\t") || texto.includes("\r")) {
      e.preventDefault();
      aplicarTextoExcelNaTabelaFiltragemConcentrado(texto, diaIdx, paramIdx);
    }
  };

  const handleKeyDownCelulaFiltragemConcentrado = (
    e: React.KeyboardEvent<HTMLInputElement>,
    diaIdx: number,
    paramIdx: number
  ) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextDia = Math.min(6, diaIdx + 1);
      const nextInput = document.getElementById(`input-filtragem-conc-${nextDia}-${paramIdx}`);
      nextInput?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevDia = Math.max(0, diaIdx - 1);
      const prevInput = document.getElementById(`input-filtragem-conc-${prevDia}-${paramIdx}`);
      prevInput?.focus();
    }
  };

  const handleLimparTabelaFiltragemConcentrado = () => {
    const limpo = DADOS_DIARIOS_FILTRAGEM_CONCENTRADO_PADRAO.map(d => ({
      dia: d.dia,
      diaLabel: d.diaLabel,
      filtroConcOp: "",
      producaoFiltragem: "",
      produtividadeFiltro: "",
      umidadeBolo: "",
      ciclosFiltro: "",
      pressaoCompactacao: "",
      paradasManutencaoFiltro: "",
      paradasOutrosFiltro: ""
    }));
    const nextCE = { ...dadosCE, historicoDiarioFiltragemConcentrado: limpo };
    onChangeCE(nextCE);

    setToastMensagem("Tabela de monitoramento diário da Filtragem de Concentrado limpa com sucesso.");
    setAcoesSincronizadasToast(true);
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  const handlePreencherPadraoFiltragemConcentrado = () => {
    const padrao = DADOS_DIARIOS_FILTRAGEM_CONCENTRADO_PADRAO.map(d => ({ ...d }));
    const nextCE = { ...dadosCE, historicoDiarioFiltragemConcentrado: padrao };
    onChangeCE(nextCE);

    setToastMensagem("Valores de referência da Filtragem de Concentrado carregados.");
    setAcoesSincronizadasToast(true);
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  const abrirModalColarColunaFiltragem = (chaveParam: string) => {
    setColunaSelecionadaParaColarFiltragem(chaveParam);
    setTextoColadoExcelFiltragem("");
    setModalColarColunaFiltragemAberto(true);
  };

  const handleConfirmarColarModalFiltragem = () => {
    if (!textoColadoExcelFiltragem.trim()) return;

    const colIdx = CONFIG_PARAMETROS_FILTRAGEM_CONCENTRADO.findIndex(
      p => p.chave === colunaSelecionadaParaColarFiltragem
    );
    if (colIdx >= 0) {
      aplicarTextoExcelNaTabelaFiltragemConcentrado(textoColadoExcelFiltragem, 0, colIdx);
      setModalColarColunaFiltragemAberto(false);
      setTextoColadoExcelFiltragem("");
    }
  };

  const desviosDetectadosFiltragemConcentrado = useMemo(() => {
    return detectarDesviosFiltragemConcentrado(historicoDiarioFiltragemConcentrado, dadosCE.anotacoesDesviosFiltragemConcentrado);
  }, [historicoDiarioFiltragemConcentrado, dadosCE.anotacoesDesviosFiltragemConcentrado]);

  const handleUpdateAnotacaoDesvioFiltragemConcentrado = (key: string, field: "impactoPerda" | "acaoRecomendada", val: string) => {
    const anotacoesAtuais = dadosCE.anotacoesDesviosFiltragemConcentrado || {};
    const itemAtual = anotacoesAtuais[key] || { impactoPerda: "", acaoRecomendada: "" };
    const proximaAnotacao = { ...itemAtual, [field]: val };
    const nextCE = {
      ...dadosCE,
      anotacoesDesviosFiltragemConcentrado: {
        ...anotacoesAtuais,
        [key]: proximaAnotacao
      }
    };
    onChangeCE(nextCE);
  };

  const handleSincronizarAcoesCorretivasFiltragemConcentrado = () => {
    if (!onChangeDiretrizes || desviosDetectadosFiltragemConcentrado.length === 0) return;

    const novasAcoes: DiretrizSupervisorTurno[] = desviosDetectadosFiltragemConcentrado.map((desvio, i) => {
      const keyDesvio = `${desvio.chave}_${desvio.dia}`;
      const anotacao = dadosCE.anotacoesDesviosFiltragemConcentrado?.[keyDesvio];
      const acaoTexto = anotacao?.acaoRecomendada?.trim() || desvio.parametro.acaoRecomendada;
      const impactoTexto = anotacao?.impactoPerda?.trim() || desvio.parametro.impactoDesvio;

      return {
        id: `ACT-DEV-FILT-${Date.now()}-${i}`,
        setor: "Filtragem & Desaguamento",
        acaoEstrategica: `[DESVIO OPERACIONAL - ${desvio.parametro.nome.toUpperCase()} (${desvio.diaLabel})] ${acaoTexto}`,
        responsavelTurma: "Todas as Turmas",
        supervisorNome: "Supervisão Filtragem & Concentrado",
        prazoLimite: "Imediato / Turno Atual",
        status: "em_andamento",
        prioridade: "alta",
        metaEsperada: impactoTexto ? `Mitigar: ${impactoTexto}` : `Estabilizar ${desvio.parametro.nome} no alvo de ${desvio.parametro.alvo} ${desvio.parametro.unidade}`
      };
    });

    const existentes = (diretrizes || []).filter(
      d => !(d.id && d.id.startsWith("ACT-DEV-FILT-"))
    );
    onChangeDiretrizes([...novasAcoes, ...existentes]);

    setAcoesSincronizadasToast(true);
    setToastMensagem("Ações da Filtragem de Concentrado sincronizadas com a Matriz de Diretrizes!");
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  // --- UTILIDADES & ETA: HISTÓRICO DIÁRIO & CONTROLE OPERACIONAL ---
  const historicoDiarioUtilidadesETA = useMemo(() => {
    return dadosCE.historicoDiarioUtilidadesETA && dadosCE.historicoDiarioUtilidadesETA.length === 7
      ? dadosCE.historicoDiarioUtilidadesETA
      : DADOS_DIARIOS_UTILIDADES_ETA_PADRAO;
  }, [dadosCE.historicoDiarioUtilidadesETA]);

  const handleUpdateDiarioUtilidadesETA = (
    diaIdx: number,
    chave: keyof Omit<RegistroDiarioIndicadoresUtilidadesETA, "dia" | "diaLabel" | "observacao">,
    valor: any
  ) => {
    const novoHistorico = [...historicoDiarioUtilidadesETA];
    const parsedNum = parseNumeroBritagem(valor);
    const rowAtual = { ...novoHistorico[diaIdx] };

    (rowAtual as any)[chave] = parsedNum !== null ? parsedNum : (valor === "" ? "" : valor);
    novoHistorico[diaIdx] = rowAtual;

    const nextCE = {
      ...dadosCE,
      historicoDiarioUtilidadesETA: novoHistorico
    };

    // Sincroniza campos pontuais se for o último registro válido
    if (chave === "captacaoAguaBruta" && parsedNum !== null) {
      nextCE.captacaoAguaBrutaM3h = parsedNum;
    } else if (chave === "volumeTratadoEta" && parsedNum !== null) {
      nextCE.aguaTratadaM3Dia = parsedNum;
    } else if (chave === "taxaRecirculacaoReuso" && parsedNum !== null) {
      nextCE.taxaRecirculacaoReuso = parsedNum;
    } else if (chave === "turbidezAguaTratada" && parsedNum !== null) {
      nextCE.turbidezAguaTratadaNtu = parsedNum;
    } else if (chave === "nivelCamaraA" && parsedNum !== null) {
      nextCE.nivelReservatorioCentral = parsedNum;
    }

    onChangeCE(nextCE);
  };

  const aplicarTextoExcelNaTabelaUtilidadesETA = (
    texto: string,
    startRow: number,
    startCol: number
  ) => {
    const linhas = texto
      .trim()
      .split(/\r\n|\n|\r/)
      .map(linha => linha.split("\t"));

    if (linhas.length === 0) return;

    const novoHistorico = [...historicoDiarioUtilidadesETA];
    linhas.forEach((linhaValores, rowOffset) => {
      const targetRow = startRow + rowOffset;
      if (targetRow >= 7) return;

      const rowObj = { ...novoHistorico[targetRow] };

      linhaValores.forEach((celulaTexto, colOffset) => {
        const targetCol = startCol + colOffset;
        if (targetCol >= CONFIG_PARAMETROS_UTILIDADES_ETA.length) return;

        const param = CONFIG_PARAMETROS_UTILIDADES_ETA[targetCol];
        const valNum = parseNumeroBritagem(celulaTexto.trim());
        (rowObj as any)[param.chave] = valNum !== null ? valNum : (celulaTexto.trim() === "" ? "" : celulaTexto.trim());
      });

      novoHistorico[targetRow] = rowObj;
    });

    const nextCE = {
      ...dadosCE,
      historicoDiarioUtilidadesETA: novoHistorico
    };
    onChangeCE(nextCE);
  };

  const handlePasteCelulaUtilidadesETA = (
    e: React.ClipboardEvent<HTMLInputElement>,
    startRow: number,
    startCol: number
  ) => {
    const pasteData = e.clipboardData.getData("text");
    if (!pasteData) return;

    if (pasteData.includes("\t") || pasteData.includes("\n") || pasteData.includes("\r")) {
      e.preventDefault();
      aplicarTextoExcelNaTabelaUtilidadesETA(pasteData, startRow, startCol);
    }
  };

  const handleKeyDownCelulaUtilidadesETA = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIdx: number,
    colIdx: number
  ) => {
    const totalRows = 7;
    const totalCols = CONFIG_PARAMETROS_UTILIDADES_ETA.length;

    let targetRow = rowIdx;
    let targetCol = colIdx;

    if (e.key === "ArrowDown" || e.key === "Enter") {
      e.preventDefault();
      targetRow = Math.min(totalRows - 1, rowIdx + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      targetRow = Math.max(0, rowIdx - 1);
    } else if (e.key === "ArrowRight" && (e.target as HTMLInputElement).selectionEnd === (e.target as HTMLInputElement).value.length) {
      if (colIdx < totalCols - 1) {
        targetCol = colIdx + 1;
      }
    } else if (e.key === "ArrowLeft" && (e.target as HTMLInputElement).selectionStart === 0) {
      if (colIdx > 0) {
        targetCol = colIdx - 1;
      }
    } else {
      return;
    }

    if (targetRow !== rowIdx || targetCol !== colIdx) {
      const el = document.getElementById(`input-utilidades-${targetRow}-${targetCol}`);
      if (el) {
        (el as HTMLInputElement).focus();
        (el as HTMLInputElement).select();
      }
    }
  };

  const handleLimparTabelaUtilidadesETA = () => {
    const limpo = DADOS_DIARIOS_UTILIDADES_ETA_PADRAO.map(d => ({
      dia: d.dia,
      diaLabel: d.diaLabel,
      compressoresOp: "",
      bombasAguaOp: "",
      pressaoAr: "",
      captacaoAguaBruta: "",
      volumeTratadoEta: "",
      taxaRecirculacaoReuso: "",
      turbidezAguaTratada: "",
      nivelCamaraA: "",
      etaAguaRecuperada: "",
      disponibilidadeUtilidades: "",
      paradasManutencaoUtilidades: ""
    }));
    const nextCE = { ...dadosCE, historicoDiarioUtilidadesETA: limpo as any };
    onChangeCE(nextCE);
    setToastMensagem("Dados diários de Utilidades & ETA zerados.");
    setAcoesSincronizadasToast(true);
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  const handlePreencherPadraoUtilidadesETA = () => {
    const padrao = DADOS_DIARIOS_UTILIDADES_ETA_PADRAO.map(d => ({ ...d }));
    const nextCE = { ...dadosCE, historicoDiarioUtilidadesETA: padrao };
    onChangeCE(nextCE);

    setToastMensagem("Valores de referência de Utilidades & ETA carregados.");
    setAcoesSincronizadasToast(true);
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  const abrirModalColarColunaUtilidades = (chaveParam: string) => {
    setColunaSelecionadaParaColarUtilidades(chaveParam);
    setTextoColadoExcelUtilidades("");
    setModalColarColunaUtilidadesAberto(true);
  };

  const handleConfirmarColarModalUtilidades = () => {
    if (!textoColadoExcelUtilidades.trim()) return;
    const colIdx = CONFIG_PARAMETROS_UTILIDADES_ETA.findIndex(
      p => p.chave === colunaSelecionadaParaColarUtilidades
    );
    if (colIdx >= 0) {
      aplicarTextoExcelNaTabelaUtilidadesETA(textoColadoExcelUtilidades, 0, colIdx);
      setModalColarColunaUtilidadesAberto(false);
      setTextoColadoExcelUtilidades("");
    }
  };

  const desviosDetectadosUtilidadesETA = useMemo(() => {
    return detectarDesviosUtilidadesETA(historicoDiarioUtilidadesETA, dadosCE.anotacoesDesviosUtilidadesETA);
  }, [historicoDiarioUtilidadesETA, dadosCE.anotacoesDesviosUtilidadesETA]);

  const handleUpdateAnotacaoDesvioUtilidadesETA = (key: string, field: "impactoPerda" | "acaoRecomendada", val: string) => {
    const anotacoesAtuais = dadosCE.anotacoesDesviosUtilidadesETA || {};
    const itemAtual = anotacoesAtuais[key] || { impactoPerda: "", acaoRecomendada: "" };
    const proximaAnotacao = { ...itemAtual, [field]: val };
    const nextCE = {
      ...dadosCE,
      anotacoesDesviosUtilidadesETA: {
        ...anotacoesAtuais,
        [key]: proximaAnotacao
      }
    };
    onChangeCE(nextCE);
  };

  const handleSincronizarAcoesCorretivasUtilidadesETA = () => {
    if (!onChangeDiretrizes || desviosDetectadosUtilidadesETA.length === 0) return;

    const novasAcoes: DiretrizSupervisorTurno[] = desviosDetectadosUtilidadesETA.map((desvio, i) => {
      const keyDesvio = `${desvio.chave}_${desvio.dia}`;
      const anotacao = dadosCE.anotacoesDesviosUtilidadesETA?.[keyDesvio];
      const acaoTexto = anotacao?.acaoRecomendada?.trim() || desvio.parametro.acaoRecomendada;
      const impactoTexto = anotacao?.impactoPerda?.trim() || desvio.parametro.impactoDesvio;

      return {
        id: `ACT-DEV-UTIL-${Date.now()}-${i}`,
        setor: "Utilidades & ETA",
        acaoEstrategica: `[DESVIO OPERACIONAL - ${desvio.parametro.nome.toUpperCase()} (${desvio.diaLabel})] ${acaoTexto}`,
        responsavelTurma: "Todas as Turmas",
        supervisorNome: "Supervisão Utilidades & Água",
        prazoLimite: "Imediato / Turno Atual",
        status: "em_andamento",
        prioridade: "alta",
        metaEsperada: impactoTexto ? `Mitigar: ${impactoTexto}` : `Estabilizar ${desvio.parametro.nome} no alvo de ${desvio.parametro.alvo} ${desvio.parametro.unidade}`
      };
    });

    const existentes = (diretrizes || []).filter(
      d => !(d.id && d.id.startsWith("ACT-DEV-UTIL-"))
    );
    onChangeDiretrizes([...novasAcoes, ...existentes]);

    setAcoesSincronizadasToast(true);
    setToastMensagem("Ações de Utilidades & ETA sincronizadas com a Matriz de Diretrizes!");
    setTimeout(() => setAcoesSincronizadasToast(false), 3000);
  };

  // Helper de cálculo automático de ROM
  const setBR = (campo: keyof DadosSetorBritagemRebritagem, val: any) => {
    const next = { ...dadosBR, [campo]: val };

    // Auto-cálculo de estoque total ROM
    if (campo === "estoqueMsb" || campo === "estoqueSurubim" || campo === "estoqueVermelhos" || campo === "estoqueSucuarana") {
      const msb = campo === "estoqueMsb" ? val : next.estoqueMsb || 0;
      const sur = campo === "estoqueSurubim" ? val : next.estoqueSurubim || 0;
      const verm = campo === "estoqueVermelhos" ? val : next.estoqueVermelhos || 0;
      const sucu = campo === "estoqueSucuarana" ? val : next.estoqueSucuarana || 0;
      next.estoqueTotalRom = Number(msb) + Number(sur) + Number(verm) + Number(sucu);
    }

    // Auto-cálculo de produção total rebritagem
    if (campo === "producaoBypass" || campo === "producaoPatio") {
      const byp = campo === "producaoBypass" ? val : next.producaoBypass || 0;
      const pat = campo === "producaoPatio" ? val : next.producaoPatio || 0;
      next.producaoTotalRebritagem = Number(byp) + Number(pat);
    }

    onChangeBR(next);
  };

  const setCE = (campo: keyof DadosSetorConcentradorEta, val: any) => {
    const next = { ...dadosCE, [campo]: val };

    // Auto-cálculo da taxa total de moagem
    if (campo === "taxaMi003" || campo === "taxaMi004" || campo === "taxaMi005") {
      const p3 = campo === "taxaMi003" ? val : next.taxaMi003 || 0;
      const p4 = campo === "taxaMi004" ? val : next.taxaMi004 || 0;
      const p5 = campo === "taxaMi005" ? val : next.taxaMi005 || 0;
      next.taxaTotalMoagem = Number(p3) + Number(p4) + Number(p5);
    }

    // Auto-cálculo de Autonomia de Silos + Pátio
    if (campo === "estoquePatio" || campo === "nivelSilo1" || campo === "nivelSilo2") {
      const est = Number(campo === "estoquePatio" ? val : next.estoquePatio || 0);
      const s1 = Number(campo === "nivelSilo1" ? val : next.nivelSilo1 || 0);
      const s2 = Number(campo === "nivelSilo2" ? val : next.nivelSilo2 || 0);
      const mediaSilos = (s1 + s2) / 2;
      const tSilos = (mediaSilos / 100) * 4800;
      const totalT = est + tSilos;
      next.autonomiaMinérioToneladas = Math.round(totalT);
      const taxa = Number(next.taxaTotalMoagem) || 600;
      next.autonomiaMinérioHoras = Number((totalT / taxa).toFixed(1));
    }

    // Auto-cálculo de Recuperação Metalúrgica da Flotação
    if (campo === "teorAlimentacaoCu" || campo === "teorConcentradoCu" || campo === "teorRejeitoCu") {
      const f = Number(campo === "teorAlimentacaoCu" ? val : next.teorAlimentacaoCu || 0);
      const c = Number(campo === "teorConcentradoCu" ? val : next.teorConcentradoCu || 0);
      const t = Number(campo === "teorRejeitoCu" ? val : next.teorRejeitoCu || 0);

      if (f > 0 && c > 0 && c > t && f > t) {
        const rec = ((c * (f - t)) / (f * (c - t))) * 100;
        next.recuperacaoMetalurgica = Number(Math.min(100, Math.max(0, rec)).toFixed(2));
      }
    }

    // Auto-cálculo de Metal Cobre Contido e Concentrado
    if (campo === "producaoMoagemDia" || campo === "teorAlimentacaoCu" || campo === "teorConcentradoCu" || campo === "recuperacaoMetalurgica") {
      const prodM = Number(campo === "producaoMoagemDia" ? val : next.producaoMoagemDia || 0);
      const taf = Number(campo === "teorAlimentacaoCu" ? val : next.teorAlimentacaoCu || 0);
      const rec = Number(campo === "recuperacaoMetalurgica" ? val : next.recuperacaoMetalurgica || 0);
      const tcf = Number(campo === "teorConcentradoCu" ? val : next.teorConcentradoCu || 0);

      if (prodM > 0 && taf > 0 && rec > 0) {
        const metal = (prodM * taf * rec) / 10000;
        next.metalContidoDia = Number(metal.toFixed(2));
        if (tcf > 0) {
          const conc = metal / (tcf / 100);
          next.concentradoProduzidoDia = Number(conc.toFixed(1));
        }
      }
    }

    // Auto-cálculo de Produção Filtragem: (12h - paradas manutenção - paradas outros) * Produtividade
    if (campo === "paradasManutencaoFiltro" || campo === "paradasOutrosFiltro" || campo === "produtividadeFiltro") {
      const pm = Number(campo === "paradasManutencaoFiltro" ? val : next.paradasManutencaoFiltro || 0);
      const po = Number(campo === "paradasOutrosFiltro" ? val : next.paradasOutrosFiltro || 0);
      const prod = Number(campo === "produtividadeFiltro" ? val : next.produtividadeFiltro || 0);
      const horasEfetivas = Math.max(0, 12 - pm - po);
      next.producaoFiltragem = +(horasEfetivas * prod).toFixed(1);
    }

    onChangeCE(next);
  };

  return (
    <div className="space-y-5">
      {/* ÁREA 1: BRITAGEM + REBRITAGEM (EXCLUSIVO CIRCUITO SECO) */}
      {(isSeco || (!isSeco && !isUmido && activeArea === "britagem_rebritagem")) && (
        <div className="space-y-5">
          {/* Bloco 1.1: Parâmetros Operacionais da Britagem Primária */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Hammer className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Britagem Primária — Desempenho Global</h3>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                Equipamento Principal: 41BR001 / 41TC001
              </span>
            </div>

            {/* TABELA OFICIAL DE INDICADORES OPERACIONAIS (BRITAGEM & REBRITAGEM) - SEGUNDA A DOMINGO */}
            <div className="pt-0 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-teal-700 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Monitoramento Operacional Diário: Britador Primário (41BR001 / 41TC001)
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Leituras diárias de Segunda a Domingo para acompanhamento operacional e Gestão de Desvios
                    </span>
                  </div>
                </div>

                {/* Ações Rápidas de Preenchimento e Excel */}
                <div className="flex items-center flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => abrirModalColarColuna("posicaoManto")}
                    className="px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Abrir assistente para colar dados de coluna do Excel"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
                    <span>Colar Coluna do Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLimparTabela}
                    className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Limpar todos os campos da tabela diária"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Limpar</span>
                  </button>
                </div>
              </div>

              {/* Dica de Agilidade para o Supervisor */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between gap-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <ClipboardPaste className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Preenchimento Fácil com Excel:</strong> Você pode copiar uma coluna (7 valores) ou a planilha inteira no Excel e pressionar <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono font-bold text-slate-700 shadow-2xs">Ctrl + V</kbd> diretamente em qualquer célula da tabela abaixo, ou clicar em <strong>"Colar"</strong> no topo da coluna.
                  </span>
                </div>
              </div>

              {/* Toast de Confirmação de Ações / Colagem */}
              {acoesSincronizadasToast && (
                <div className="bg-teal-50 border border-teal-300 text-teal-900 text-xs font-bold p-3 rounded-xl flex items-center gap-2 shadow-sm animate-fade-in">
                  <CheckCircle className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>{toastMensagem || "Ações corretivas geradas com sucesso e integradas à Matriz de Diretrizes e Horizontes da Semana!"}</span>
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-2xs bg-white">
                <table className="w-full text-center border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold text-[10px]">
                      <th className="p-2 border-r border-slate-700 min-w-[105px] text-left sticky left-0 bg-slate-800 z-10">
                        Dia da Semana
                      </th>
                      {CONFIG_PARAMETROS_BRITAGEM.map((param, paramIdx) => (
                        <th key={param.chave} className="p-2 border-r border-slate-700 min-w-[100px] align-top">
                          <div className="flex flex-col items-center justify-between h-full gap-1">
                            <div>
                              <span>{param.nomeCurto || param.nome}</span><br />
                              <span className="text-[9px] font-normal text-slate-300">
                                {param.minIdeal}-{param.maxIdeal} {param.unidade}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => abrirModalColarColuna(param.chave)}
                              className="mt-1 px-1.5 py-0.5 rounded bg-slate-700 hover:bg-teal-700 text-[9px] text-slate-200 hover:text-white transition flex items-center gap-1 cursor-pointer"
                              title={`Colar valores do Excel na coluna de ${param.nome}`}
                            >
                              <ClipboardPaste className="w-2.5 h-2.5" />
                              <span>Colar</span>
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {historicoDiario.map((item, diaIdx) => {
                      return (
                        <tr key={item.dia} className="border-b border-slate-200 hover:bg-slate-50/80 transition">
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-800 text-left bg-slate-50 sticky left-0 z-10">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                              <span>{item.diaLabel}</span>
                            </div>
                          </td>

                          {CONFIG_PARAMETROS_BRITAGEM.map((param, paramIdx) => {
                            const valor = item[param.chave];
                            const numVal = typeof valor === "number" && !isNaN(valor) ? valor : null;
                            const isFora = numVal !== null && (numVal > param.maxIdeal || numVal < param.minIdeal);
                            const isAlto = numVal !== null && numVal > param.maxIdeal;

                            return (
                              <td
                                key={param.chave}
                                className={`p-1 border-r border-slate-200 ${
                                  isFora
                                    ? "bg-rose-50/80 font-bold text-rose-900"
                                    : "bg-white"
                                }`}
                                title={
                                  isFora
                                    ? `Alerta: Valor de ${numVal} ${param.unidade} está ${isAlto ? "ACIMA" : "ABAIXO"} da faixa ideal (${param.minIdeal} - ${param.maxIdeal} ${param.unidade})`
                                    : `Faixa Ideal: ${param.minIdeal} a ${param.maxIdeal} ${param.unidade}`
                                }
                              >
                                <div className="relative">
                                  <input
                                    id={`input-britagem-${diaIdx}-${paramIdx}`}
                                    type="text"
                                    inputMode="decimal"
                                    value={valor === "" || valor === undefined ? "" : valor}
                                    onChange={e => handleUpdateDiario(diaIdx, param.chave, e.target.value)}
                                    onPaste={e => handlePasteCelula(e, diaIdx, paramIdx)}
                                    onKeyDown={e => handleKeyDownCelula(e, diaIdx, paramIdx)}
                                    placeholder="—"
                                    className={`w-full text-center rounded px-1 py-1 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-teal-600 transition ${
                                      isFora
                                        ? "border border-rose-400 bg-rose-50 text-rose-950 font-bold"
                                        : "border border-slate-200 bg-transparent text-slate-900 hover:border-slate-300"
                                    }`}
                                  />
                                  {isFora && (
                                    <span className="absolute right-0.5 top-0 text-[8px] text-rose-600 font-black">
                                      !
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MODAL: ASSISTENTE DE COLAGEM DE COLUNA DO EXCEL */}
              {modalColarColunaAberto && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    {/* Modal Header */}
                    <div className="bg-teal-900 text-white p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-teal-950 rounded-lg">
                          <FileSpreadsheet className="w-5 h-5 text-teal-300" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold">Colar Coluna do Excel (Britagem Primária)</h3>
                          <p className="text-[11px] text-teal-200">
                            Preenchimento automático para os 7 dias da semana (Segunda a Domingo)
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setModalColarColunaAberto(false)}
                        className="text-teal-200 hover:text-white p-1 rounded-md hover:bg-teal-800 transition cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-5 space-y-4 overflow-y-auto">
                      {/* Seleção do Parâmetro Alvo */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          1. Selecione a Coluna / Parâmetro:
                        </label>
                        <select
                          value={colunaSelecionadaParaColar}
                          onChange={e => setColunaSelecionadaParaColar(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                        >
                          {CONFIG_PARAMETROS_BRITAGEM.map(param => (
                            <option key={param.chave} value={param.chave}>
                              {param.nome} (Faixa: {param.minIdeal} a {param.maxIdeal} {param.unidade})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Caixa de Texto / Paste */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <span>2. Cole os dados copiados do Excel (7 linhas):</span>
                          </label>
                          <button
                            type="button"
                            onClick={handleLerClipboardSistema}
                            className="text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded border border-teal-200 transition flex items-center gap-1 cursor-pointer"
                          >
                            <ClipboardPaste className="w-3 h-3" />
                            <span>Colar do Clipboard</span>
                          </button>
                        </div>

                        <textarea
                          rows={6}
                          value={textoColadoExcel}
                          onChange={e => setTextoColadoExcel(e.target.value)}
                          placeholder={"Copie uma coluna no Excel com 7 linhas e cole aqui (Ctrl+V):\n50,0\n52,5\n49,0\n55,2\n51,0\n48,0\n50,0"}
                          className="w-full font-mono text-xs p-3 rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-slate-50/50"
                        />
                      </div>

                      {/* Pré-visualização dos 7 dias */}
                      {(() => {
                        const paramConfig = CONFIG_PARAMETROS_BRITAGEM.find(p => p.chave === colunaSelecionadaParaColar);
                        const linhas = textoColadoExcel.trim().split(/\r\n|\r|\n/).filter(l => l.trim().length > 0);

                        return (
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                            <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wide">
                              Pré-visualização do Mapeamento (Segunda a Domingo):
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"].map((diaNome, idx) => {
                                const valLinha = linhas[idx] || "";
                                const parsedVal = parseNumeroBritagem(valLinha);
                                const hasVal = parsedVal !== null;
                                const isFora = hasVal && paramConfig && (parsedVal > paramConfig.maxIdeal || parsedVal < paramConfig.minIdeal);

                                return (
                                  <div
                                    key={idx}
                                    className={`p-2 rounded-lg border text-xs flex flex-col justify-between ${
                                      !hasVal
                                        ? "bg-white border-slate-200 text-slate-400"
                                        : isFora
                                        ? "bg-rose-50 border-rose-300 text-rose-950 font-bold"
                                        : "bg-teal-50 border-teal-200 text-teal-950 font-bold"
                                    }`}
                                  >
                                    <span className="text-[10px] text-slate-500 font-semibold">{diaNome}</span>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-xs">{hasVal ? `${parsedVal} ${paramConfig?.unidade || ""}` : "—"}</span>
                                      {hasVal && (
                                        <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                                          isFora ? "bg-rose-200 text-rose-800" : "bg-teal-200 text-teal-800"
                                        }`}>
                                          {isFora ? "Desvio" : "OK"}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Modal Footer */}
                    <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setModalColarColunaAberto(false)}
                        className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={!textoColadoExcel.trim()}
                        onClick={handleConfirmarColarModal}
                        className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Aplicar Valores na Coluna</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PAINEL DE GESTÃO DE DESVIOS E GERAÇÃO DE AÇÕES CORRETIVAS NOS HORIZONTES */}
              <div className="bg-amber-50/80 rounded-xl p-4 border border-amber-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                        Gestão de Desvios & Gatilho de Ações Corretivas para a Semana
                      </h4>
                      <span className="text-[10px] text-amber-800 block">
                        Apenas indicadores fora da faixa ideal são listados. O supervisor registra o impacto/perda e a ação recomendada.
                      </span>
                    </div>
                  </div>

                  {desviosDetectados.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSincronizarAcoesCorretivas}
                      className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer self-start sm:self-auto shrink-0"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Gerar Ações Corretivas nos Horizontes ({desviosDetectados.length})</span>
                    </button>
                  )}
                </div>

                {desviosDetectados.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {desviosDetectados.map((desvio, idx) => {
                        const keyDesvio = `${desvio.chave}_${desvio.dia}`;
                        const anotacao = dadosBR.anotacoesDesvios?.[keyDesvio] || { impactoPerda: "", acaoRecomendada: "" };

                        return (
                          <div
                            key={idx}
                            className="bg-white p-3.5 rounded-lg border border-amber-300 shadow-xs space-y-2.5"
                          >
                            <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-black shrink-0">
                                  {idx + 1}
                                </span>
                                {desvio.parametro.nome} — {desvio.diaLabel}
                              </span>
                              <span className="bg-rose-100 text-rose-800 font-bold text-[10px] px-2 py-0.5 rounded-md">
                                {desvio.valorLido} {desvio.parametro.unidade} ({desvio.tipoDesvio === "alto" ? "LSC" : "LIC"}: {desvio.tipoDesvio === "alto" ? desvio.parametro.maxIdeal : desvio.parametro.minIdeal} {desvio.parametro.unidade})
                              </span>
                            </div>

                            {/* Campo para o supervisor escrever o Impacto / Perda */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700 block">
                                Impacto Operacional / Perda Quantificada:
                              </label>
                              <input
                                type="text"
                                value={anotacao.impactoPerda || ""}
                                onChange={e => handleUpdateAnotacaoDesvio(keyDesvio, "impactoPerda", e.target.value)}
                                placeholder="Descreva o impacto ou perda operacional observada..."
                                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-slate-50/50 focus:bg-white focus:border-amber-500 focus:outline-none"
                              />
                            </div>

                            {/* Campo para o supervisor escrever a Ação Recomendada */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-teal-800 block">
                                Ação Recomendada / Diretriz de Mitigação:
                              </label>
                              <input
                                type="text"
                                value={anotacao.acaoRecomendada || ""}
                                onChange={e => handleUpdateAnotacaoDesvio(keyDesvio, "acaoRecomendada", e.target.value)}
                                placeholder="Descreva a ação recomendada e diretriz para a turma..."
                                className="w-full text-xs px-2.5 py-1.5 border border-teal-300 rounded-md bg-teal-50/30 focus:bg-white focus:border-teal-600 focus:outline-none"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/80 p-3 rounded-lg border border-amber-100 flex items-center gap-2 text-xs font-semibold text-teal-800">
                    <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Nenhum desvio detectado. Todos os indicadores operacionais da britagem (41BR001 / 41TC001) estão rigorosamente dentro da faixa ideal.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bloco 1.3: Rebritagem & Pilhas */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Columns className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Rebritagem & Peneiramento (BR001 a BR006)</h3>
              </div>
              <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                Monitoramento Operacional Diário
              </span>
            </div>

            {/* TABELA DE MONITORAMENTO DIÁRIO: REBRITAGEM */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-blue-600" />
                    Monitoramento Operacional Diário: Rebritagem & Peneiramento (BR001 a BR006)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Preencha ou cole os 7 dias da semana (Segunda a Domingo) para cada circuito e britador cônico/alimentador
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => abrirModalColarColunaRebritagem("tempOleoLub_BR001")}
                    className="px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Abrir assistente para colar dados de coluna do Excel"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
                    <span>Colar Coluna do Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLimparTabelaRebritagem}
                    className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Limpar tabela de rebritagem"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Limpar</span>
                  </button>
                </div>
              </div>

              {/* Dica de Agilidade para o Supervisor */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-lg px-3 py-2 flex items-center justify-between gap-2 text-[11px] text-slate-700">
                <div className="flex items-center gap-2">
                  <ClipboardPaste className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <span>
                    <strong className="text-blue-950">Preenchimento Rápido com Excel:</strong> Copie a coluna no Excel e dê <kbd className="px-1 py-0.5 bg-white border border-blue-300 rounded text-[10px] font-mono font-bold text-slate-800 shadow-2xs">Ctrl + V</kbd> em qualquer célula da Rebritagem, ou clique em <strong>"Colar"</strong> no cabeçalho do indicador correspondente.
                  </span>
                </div>
              </div>

              {/* TABELA DE REBRITAGEM MULTI-COLUNA */}
              <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-2xs bg-white">
                <table className="w-full text-center border-collapse text-[11px]">
                  <thead>
                    {/* Linha 1: Agrupamentos Principais */}
                    <tr className="bg-slate-900 text-white font-bold text-[10px]">
                      <th rowSpan={2} className="p-2 border-r border-slate-700 min-w-[105px] text-left sticky left-0 bg-slate-900 z-20 align-middle">
                        Dia da Semana
                      </th>
                      <th colSpan={6} className="p-1.5 border-r border-slate-700 bg-slate-800 text-teal-200">
                        TEMPERATURA DO ÓLEO LUBRIFICANTE (°C)
                      </th>
                      <th colSpan={4} className="p-1.5 border-r border-slate-700 bg-slate-850 text-cyan-200">
                        PRESSÃO DE ÓLEO NO HYDROSET (MPa)
                      </th>
                      <th colSpan={6} className="p-1.5 border-r border-slate-700 bg-slate-800 text-amber-200">
                        POTÊNCIA (kW)
                      </th>
                      <th colSpan={6} className="p-1.5 border-r border-slate-700 bg-slate-850 text-emerald-200">
                        FREQUÊNCIA DO ALIMENTADOR (Hz)
                      </th>
                      <th colSpan={2} className="p-1.5 border-r border-slate-700 bg-slate-800 text-rose-200">
                        DIF. TEMP (°C)
                      </th>
                      <th colSpan={2} className="p-1.5 border-r border-slate-700 bg-slate-850 text-indigo-200">
                        PRESSÃO CONTRAEIXO (MPa)
                      </th>
                      <th colSpan={2} className="p-1.5 border-r border-slate-700 bg-slate-800 text-orange-200">
                        DIF. PRESSÃO (MPa)
                      </th>
                      <th colSpan={1} className="p-1.5 border-r border-slate-700 bg-slate-850 text-purple-200">
                        GRANULOMETRIA (%)
                      </th>
                      <th colSpan={1} className="p-1.5 border-r border-slate-700 bg-slate-800 text-sky-200">
                        PRODUTIVIDADE (tph)
                      </th>
                    </tr>

                    {/* Linha 2: Equipamentos e Faixas */}
                    <tr className="bg-slate-800 text-white font-bold text-[9.5px]">
                      {CONFIG_PARAMETROS_REBRITAGEM.map((param, paramIdx) => (
                        <th key={param.chave} className="p-1.5 border-r border-slate-700 min-w-[76px] align-top bg-slate-800">
                          <div className="flex flex-col items-center justify-between h-full gap-0.5">
                            <span className="font-extrabold text-white text-[10px]">{param.equipamento}</span>
                            <span className="text-[8.5px] font-normal text-slate-300 whitespace-nowrap">
                              {param.minIdeal}-{param.maxIdeal} {param.unidade}
                            </span>
                            <button
                              type="button"
                              onClick={() => abrirModalColarColunaRebritagem(param.chave)}
                              className="mt-0.5 px-1 py-0.2 rounded bg-slate-700 hover:bg-blue-700 text-[8.5px] text-slate-200 hover:text-white transition flex items-center gap-0.5 cursor-pointer"
                              title={`Colar valores do Excel para ${param.nome}`}
                            >
                              <ClipboardPaste className="w-2.5 h-2.5" />
                              <span>Colar</span>
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {historicoDiarioRebritagem.map((item, diaIdx) => {
                      return (
                        <tr key={item.dia} className="border-b border-slate-200 hover:bg-slate-50/80 transition">
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-800 text-left bg-slate-50 sticky left-0 z-10">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                              <span>{item.diaLabel}</span>
                            </div>
                          </td>

                          {CONFIG_PARAMETROS_REBRITAGEM.map((param, paramIdx) => {
                            const valor = item[param.chave];
                            const numVal = typeof valor === "number" && !isNaN(valor) ? valor : null;
                            const isFora = numVal !== null && (numVal > param.maxIdeal || numVal < param.minIdeal);
                            const isAlto = numVal !== null && numVal > param.maxIdeal;

                            return (
                              <td
                                key={param.chave}
                                className={`p-0.5 border-r border-slate-200 ${
                                  isFora
                                    ? "bg-rose-50/80 font-bold text-rose-900"
                                    : "bg-white"
                                }`}
                                title={
                                  isFora
                                    ? `Alerta: ${param.nome} (${param.equipamento}) = ${numVal} ${param.unidade} está ${isAlto ? "ACIMA" : "ABAIXO"} da faixa ideal (${param.minIdeal} - ${param.maxIdeal} ${param.unidade})`
                                    : `Faixa Ideal: ${param.minIdeal} a ${param.maxIdeal} ${param.unidade}`
                                }
                              >
                                <div className="relative">
                                  <input
                                    id={`input-rebritagem-${diaIdx}-${paramIdx}`}
                                    type="text"
                                    inputMode="decimal"
                                    value={valor === "" || valor === undefined ? "" : valor}
                                    onChange={e => handleUpdateDiarioRebritagem(diaIdx, param.chave, e.target.value)}
                                    onPaste={e => handlePasteCelulaRebritagem(e, diaIdx, paramIdx)}
                                    onKeyDown={e => handleKeyDownCelulaRebritagem(e, diaIdx, paramIdx)}
                                    placeholder="—"
                                    className={`w-full text-center rounded px-1 py-1 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-blue-600 transition ${
                                      isFora
                                        ? "border border-rose-400 bg-rose-50 text-rose-950 font-bold"
                                        : "border border-slate-200 bg-transparent text-slate-900 hover:border-slate-300"
                                    }`}
                                  />
                                  {isFora && (
                                    <span className="absolute right-0.5 top-0 text-[8px] text-rose-600 font-black">
                                      !
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MODAL: ASSISTENTE DE COLAGEM DE COLUNA DO EXCEL PARA REBRITAGEM */}
              {modalColarColunaRebritagemAberto && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    {/* Modal Header */}
                    <div className="bg-teal-900 text-white p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-teal-950 rounded-lg">
                          <FileSpreadsheet className="w-5 h-5 text-teal-300" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold">Colar Coluna do Excel (Rebritagem & Peneiramento)</h3>
                          <p className="text-[11px] text-teal-200">
                            Preenchimento automático para os 7 dias da semana (Segunda a Domingo)
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setModalColarColunaRebritagemAberto(false)}
                        className="text-teal-200 hover:text-white p-1 rounded-md hover:bg-teal-800 transition cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-5 space-y-4 overflow-y-auto">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          1. Selecione a Coluna / Parâmetro da Rebritagem:
                        </label>
                        <select
                          value={colunaSelecionadaParaColarRebritagem}
                          onChange={e => setColunaSelecionadaParaColarRebritagem(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                        >
                          {CONFIG_PARAMETROS_REBRITAGEM.map(param => (
                            <option key={param.chave} value={param.chave}>
                              {param.nome} ({param.equipamento}) - Faixa: {param.minIdeal} a {param.maxIdeal} {param.unidade}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <span>2. Cole os dados copiados do Excel (7 linhas):</span>
                          </label>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                if (navigator.clipboard && navigator.clipboard.readText) {
                                  const text = await navigator.clipboard.readText();
                                  if (text) setTextoColadoExcelRebritagem(text);
                                }
                              } catch (err) {
                                console.warn("Clipboard read error:", err);
                              }
                            }}
                            className="text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded border border-teal-200 transition flex items-center gap-1 cursor-pointer"
                          >
                            <ClipboardPaste className="w-3 h-3" />
                            <span>Colar do Clipboard</span>
                          </button>
                        </div>
                        <textarea
                          rows={6}
                          value={textoColadoExcelRebritagem}
                          onChange={e => setTextoColadoExcelRebritagem(e.target.value)}
                          placeholder={"Copie uma coluna no Excel com 7 linhas e cole aqui (Ctrl+V):\n50,0\n52,5\n49,0\n55,2\n51,0\n48,0\n50,0"}
                          className="w-full font-mono text-xs p-3 rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-slate-50/50"
                        />
                      </div>

                      {/* Pré-visualização dos 7 dias */}
                      {(() => {
                        const paramConfig = CONFIG_PARAMETROS_REBRITAGEM.find(p => p.chave === colunaSelecionadaParaColarRebritagem);
                        const linhas = textoColadoExcelRebritagem.trim().split(/\r\n|\r|\n/).filter(l => l.trim().length > 0);

                        return (
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                            <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wide">
                              Pré-visualização do Mapeamento (Segunda a Domingo):
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"].map((diaNome, idx) => {
                                const valLinha = linhas[idx] || "";
                                const parsedVal = parseNumeroBritagem(valLinha);
                                const hasVal = parsedVal !== null;
                                const isFora = hasVal && paramConfig && (parsedVal > paramConfig.maxIdeal || parsedVal < paramConfig.minIdeal);

                                return (
                                  <div
                                    key={idx}
                                    className={`p-2 rounded-lg border text-xs flex flex-col justify-between ${
                                      !hasVal
                                        ? "bg-white border-slate-200 text-slate-400"
                                        : isFora
                                        ? "bg-rose-50 border-rose-300 text-rose-950 font-bold"
                                        : "bg-teal-50 border-teal-200 text-teal-950 font-bold"
                                    }`}
                                  >
                                    <span className="text-[10px] text-slate-500 font-semibold">{diaNome}</span>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-xs">{hasVal ? `${parsedVal} ${paramConfig?.unidade || ""}` : "—"}</span>
                                      {hasVal && (
                                        <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                                          isFora ? "bg-rose-200 text-rose-800" : "bg-teal-200 text-teal-800"
                                        }`}>
                                          {isFora ? "Desvio" : "OK"}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Modal Footer */}
                    <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setModalColarColunaRebritagemAberto(false)}
                        className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmarColarModalRebritagem}
                        disabled={!textoColadoExcelRebritagem.trim()}
                        className="px-4 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Aplicar Valores na Coluna</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PAINEL DE DESVIOS DETECTADOS & AÇÕES DA REBRITAGEM */}
              {desviosDetectadosRebritagem.length > 0 && (
                <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                      <h4 className="text-xs font-black text-rose-900 uppercase tracking-wide">
                        Desvios Operacionais Identificados na Rebritagem ({desviosDetectadosRebritagem.length} desvios na semana)
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={handleSincronizarAcoesCorretivasRebritagem}
                      className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Sincronizar Ações com Diretrizes da Semana</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-rose-800">
                    Os pontos abaixo ultrapassaram os limites ideais de operação dos britadores cônicos/alimentadores. Registre o impacto e a tratativa técnica:
                  </p>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {desviosDetectadosRebritagem.map((desvio, idx) => {
                      const keyDesvio = `${desvio.chave}_${desvio.dia}`;
                      const anotacao = dadosBR.anotacoesDesviosRebritagem?.[keyDesvio] || {
                        impactoPerda: "",
                        acaoRecomendada: ""
                      };

                      return (
                        <div key={keyDesvio} className="bg-white p-3 rounded-lg border border-rose-200 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">
                              {desvio.parametro.nome} ({desvio.parametro.equipamento}) - {desvio.diaLabel}
                            </span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                              Lido: {desvio.valorLido} {desvio.parametro.unidade} (Faixa: {desvio.parametro.minIdeal} a {desvio.parametro.maxIdeal} {desvio.parametro.unidade})
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Impacto / Causa Raiz:</label>
                              <input
                                type="text"
                                value={anotacao.impactoPerda}
                                onChange={e => handleUpdateAnotacaoDesvioRebritagem(keyDesvio, "impactoPerda", e.target.value)}
                                placeholder="Ex: Sobrecarga por granulometria grossa..."
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Ação Recomendada / Diretriz:</label>
                              <input
                                type="text"
                                value={anotacao.acaoRecomendada}
                                onChange={e => handleUpdateAnotacaoDesvioRebritagem(keyDesvio, "acaoRecomendada", e.target.value)}
                                placeholder="Ex: Ajustar abertura de descarga e inspecionar óleo..."
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bloco 1.4: Gargalos e Contingência */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold text-slate-900">Gargalos Operacionais & Plano de Contingência</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Gargalos Atuais na Britagem / Rebritagem</label>
                <textarea
                  rows={2}
                  value={dadosBR.gargalosAtuais}
                  onChange={e => setBR("gargalosAtuais", e.target.value)}
                  placeholder="Ex: Desgaste na tela da peneira PE002..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Plano de Contingência Operacional</label>
                <textarea
                  rows={2}
                  value={dadosBR.planoContingencia}
                  onChange={e => setBR("planoContingencia", e.target.value)}
                  placeholder="Ex: Operação em modo bypass e desobstrução mecânica..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ÁREA 2: CONCENTRADOR + ETA (EXCLUSIVO CIRCUITO ÚMIDO) */}
      {(isUmido || (!isSeco && !isUmido && activeArea === "concentrador_eta")) && (
        <div className="space-y-5">
          {/* Bloco 2.1: Parâmetros Operacionais da Moagem (MI003, MI004, MI005) */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            {/* Controles do Cabeçalho da Tabela da Moagem */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-teal-700" />
                  Estrutura Diária de Monitoramento Operacional (Segunda a Domingo)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Preencha ou cole os 7 dias da semana para as 3 linhas de moagem (MI003, MI004 e MI005)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => abrirModalColarColunaMoagem("taxa_MI003")}
                  className="px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Abrir assistente para colar dados de coluna do Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
                  <span>Colar Coluna do Excel</span>
                </button>

                <button
                  type="button"
                  onClick={handleLimparTabelaMoagem}
                  className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Limpar tabela de moagem"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Limpar</span>
                </button>
              </div>
            </div>

            {/* Dica de Agilidade */}
            <div className="bg-teal-50/60 border border-teal-200 rounded-lg px-3 py-2 flex items-center justify-between gap-2 text-[11px] text-slate-700">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span>
                  <strong className="text-teal-950">Preenchimento Rápido com Excel:</strong> Copie a coluna no Excel e dê <kbd className="px-1 py-0.5 bg-white border border-teal-300 rounded text-[10px] font-mono font-bold text-slate-800 shadow-2xs">Ctrl + V</kbd> em qualquer célula da Moagem, ou clique em <strong>"Colar"</strong> no cabeçalho do parâmetro.
                </span>
              </div>
            </div>

            {/* Tabela de Monitoramento Diário da Moagem */}
            <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-2xs bg-white">
              <table className="w-full text-center border-collapse text-[11px]">
                <thead>
                  {/* Linha 1: Grupos Principais */}
                  <tr className="bg-slate-900 text-white font-bold text-[10px]">
                    <th rowSpan={2} className="p-2 border-r border-slate-700 min-w-[105px] text-left sticky left-0 bg-slate-900 z-20 align-middle">
                      Dia da Semana
                    </th>
                    <th colSpan={3} className="p-1.5 border-r border-slate-700 bg-teal-900 text-teal-100">
                      TONELAGEM (t/h)
                    </th>
                    <th colSpan={3} className="p-1.5 border-r border-slate-700 bg-slate-850 text-cyan-200">
                      POTÊNCIA (kW)
                    </th>
                    <th colSpan={3} className="p-1.5 border-r border-slate-700 bg-teal-900 text-teal-100">
                      % SÓLIDOS OVERFLOW (%)
                    </th>
                    <th colSpan={3} className="p-1.5 border-r border-slate-700 bg-slate-800 text-emerald-200">
                      % SÓLIDOS DESCARGA (%)
                    </th>
                    <th colSpan={3} className="p-1.5 border-r border-slate-700 bg-slate-850 text-amber-200">
                      REPOSIÇÃO DE BOLAS (g/t)
                    </th>
                    <th colSpan={3} className="p-1.5 border-r border-slate-700 bg-teal-900 text-teal-100">
                      PRESSÃO HIDROCICLONAGEM (kgf/cm²)
                    </th>
                    <th colSpan={3} className="p-1.5 border-r border-slate-700 bg-slate-800 text-indigo-200">
                      DENSIDADE POLPA (g/t)
                    </th>
                    <th colSpan={3} className="p-1.5 bg-slate-850 text-sky-200">
                      PSI 300 - 150# (%)
                    </th>
                  </tr>

                  {/* Linha 2: Equipamentos e Faixas */}
                  <tr className="bg-slate-800 text-white font-bold text-[9.5px]">
                    {CONFIG_PARAMETROS_MOAGEM.map((param, paramIdx) => (
                      <th key={param.chave} className="p-1.5 border-r border-slate-700 min-w-[76px] align-top bg-slate-800">
                        <div className="flex flex-col items-center justify-between h-full gap-0.5">
                          <span className="font-extrabold text-white text-[10px]">{param.equipamento}</span>
                          <span className="text-[8.5px] font-normal text-slate-300 whitespace-nowrap">
                            {param.minIdeal}-{param.maxIdeal} {param.unidade}
                          </span>
                          <button
                            type="button"
                            onClick={() => abrirModalColarColunaMoagem(param.chave)}
                            className="mt-0.5 px-1 py-0.2 rounded bg-slate-700 hover:bg-teal-700 text-[8.5px] text-slate-200 hover:text-white transition flex items-center gap-0.5 cursor-pointer"
                            title={`Colar valores do Excel para ${param.nome}`}
                          >
                            <ClipboardPaste className="w-2.5 h-2.5" />
                            <span>Colar</span>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historicoDiarioMoagem.map((item, diaIdx) => {
                    return (
                      <tr key={item.dia} className="border-b border-slate-200 hover:bg-teal-50/30 transition">
                        <td className="p-2 border-r border-slate-200 font-bold text-slate-800 text-left bg-slate-50 sticky left-0 z-10">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                            <span>{item.diaLabel}</span>
                          </div>
                        </td>

                        {CONFIG_PARAMETROS_MOAGEM.map((param, paramIdx) => {
                          const valor = (item as any)[param.chave];
                          const numVal = typeof valor === "number" && !isNaN(valor) ? valor : null;
                          const isFora = numVal !== null && (numVal > param.maxIdeal || numVal < param.minIdeal);
                          const isAlto = numVal !== null && numVal > param.maxIdeal;

                          return (
                            <td
                              key={param.chave}
                              className={`p-0.5 border-r border-slate-200 ${
                                isFora
                                  ? "bg-rose-50/80 font-bold text-rose-900"
                                  : "bg-white"
                              }`}
                              title={
                                isFora
                                  ? `Alerta: ${param.nome} (${param.equipamento}) = ${numVal} ${param.unidade} está ${isAlto ? "ACIMA" : "ABAIXO"} da faixa ideal (${param.minIdeal} - ${param.maxIdeal} ${param.unidade})`
                                  : `Faixa Ideal: ${param.minIdeal} a ${param.maxIdeal} ${param.unidade}`
                              }
                            >
                              <div className="relative">
                                <input
                                  id={`input-moagem-${diaIdx}-${paramIdx}`}
                                  type="text"
                                  inputMode="decimal"
                                  value={valor === "" || valor === undefined ? "" : valor}
                                  onChange={e => handleUpdateDiarioMoagem(diaIdx, param.chave as any, e.target.value)}
                                  onPaste={e => handlePasteCelulaMoagem(e, diaIdx, paramIdx)}
                                  onKeyDown={e => handleKeyDownCelulaMoagem(e, diaIdx, paramIdx)}
                                  placeholder="—"
                                  className={`w-full text-center rounded px-1 py-1 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-teal-600 transition ${
                                    isFora
                                      ? "border border-rose-400 bg-rose-50 text-rose-950 font-bold"
                                      : "border border-slate-200 bg-transparent text-slate-900 hover:border-slate-300"
                                  }`}
                                />
                                {isFora && (
                                  <span className="absolute right-0.5 top-0 text-[8px] text-rose-600 font-black">
                                    !
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MODAL: ASSISTENTE DE COLAGEM DE COLUNA DO EXCEL PARA MOAGEM */}
            {modalColarColunaMoagemAberto && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Modal Header */}
                  <div className="bg-teal-900 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-teal-950 rounded-lg">
                        <FileSpreadsheet className="w-5 h-5 text-teal-300" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">Colar Coluna do Excel (Moagem MI003, MI004, MI005)</h3>
                        <p className="text-[11px] text-teal-200">
                          Preenchimento automático para os 7 dias da semana (Segunda a Domingo)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalColarColunaMoagemAberto(false)}
                      className="text-teal-200 hover:text-white p-1 rounded-md hover:bg-teal-800 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-5 space-y-4 overflow-y-auto">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        1. Selecione a Coluna / Parâmetro da Moagem:
                      </label>
                      <select
                        value={colunaSelecionadaParaColarMoagem}
                        onChange={e => setColunaSelecionadaParaColarMoagem(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                      >
                        {CONFIG_PARAMETROS_MOAGEM.map(param => (
                          <option key={param.chave} value={param.chave}>
                            {param.nome} ({param.equipamento}) - Faixa: {param.minIdeal} a {param.maxIdeal} {param.unidade}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span>2. Cole os dados copiados do Excel (7 linhas):</span>
                        </label>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              if (navigator.clipboard && navigator.clipboard.readText) {
                                const text = await navigator.clipboard.readText();
                                if (text) setTextoColadoExcelMoagem(text);
                              }
                            } catch {
                              // fallback
                            }
                          }}
                          className="text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded border border-teal-200 transition flex items-center gap-1 cursor-pointer"
                        >
                          <ClipboardPaste className="w-3 h-3" />
                          <span>Colar do Clipboard</span>
                        </button>
                      </div>

                      <textarea
                        rows={6}
                        value={textoColadoExcelMoagem}
                        onChange={e => setTextoColadoExcelMoagem(e.target.value)}
                        placeholder={"Copie uma coluna no Excel com 7 linhas e cole aqui (Ctrl+V):\n228\n230\n225\n235\n229\n226\n228"}
                        className="w-full font-mono text-xs p-3 rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-slate-50/50"
                      />
                    </div>

                    {/* Pré-visualização dos 7 dias */}
                    {(() => {
                      const paramConfig = CONFIG_PARAMETROS_MOAGEM.find(p => p.chave === colunaSelecionadaParaColarMoagem);
                      const linhas = textoColadoExcelMoagem.trim().split(/\r\n|\r|\n/).filter(l => l.trim().length > 0);

                      return (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                          <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wide">
                            Pré-visualização do Mapeamento (Segunda a Domingo):
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"].map((diaNome, idx) => {
                              const valLinha = linhas[idx] || "";
                              const parsedVal = parseNumeroBritagem(valLinha);
                              const hasVal = parsedVal !== null;
                              const isFora = hasVal && paramConfig && (parsedVal > paramConfig.maxIdeal || parsedVal < paramConfig.minIdeal);

                              return (
                                <div
                                  key={idx}
                                  className={`p-2 rounded-lg border text-xs flex flex-col justify-between ${
                                    !hasVal
                                      ? "bg-white border-slate-200 text-slate-400"
                                      : isFora
                                      ? "bg-rose-50 border-rose-300 text-rose-950 font-bold"
                                      : "bg-teal-50 border-teal-200 text-teal-950 font-bold"
                                  }`}
                                >
                                  <span className="text-[10px] text-slate-500 font-semibold">{diaNome}</span>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs">{hasVal ? `${parsedVal} ${paramConfig?.unidade || ""}` : "—"}</span>
                                    {hasVal && (
                                      <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                                        isFora ? "bg-rose-200 text-rose-800" : "bg-teal-200 text-teal-800"
                                      }`}>
                                        {isFora ? "Desvio" : "OK"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Modal Footer */}
                  <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setModalColarColunaMoagemAberto(false)}
                      className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={!textoColadoExcelMoagem.trim()}
                      onClick={handleConfirmarColarModalMoagem}
                      className="px-4 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Aplicar Valores na Coluna</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PAINEL DE GESTÃO DE DESVIOS E GERAÇÃO DE AÇÕES CORRETIVAS DA MOAGEM */}
            <div className="bg-amber-50/80 rounded-xl p-4 border border-amber-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                      Gestão de Desvios & Ações Corretivas: Moagem
                    </h4>
                    <span className="text-[10px] text-amber-800 block">
                      Apenas indicadores de Moagem fora da faixa ideal são listados para intervenção operacional.
                    </span>
                  </div>
                </div>

                {desviosDetectadosMoagem.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSincronizarAcoesCorretivasMoagem}
                    className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Gerar Ações Corretivas da Moagem ({desviosDetectadosMoagem.length})</span>
                  </button>
                )}
              </div>

              {desviosDetectadosMoagem.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {desviosDetectadosMoagem.map((desvio, idx) => {
                    const keyDesvio = `${desvio.chave}_${desvio.dia}`;
                    const anotacao = dadosCE.anotacoesDesviosMoagem?.[keyDesvio] || {
                      impactoPerda: "",
                      acaoRecomendada: ""
                    };

                    return (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-lg border border-amber-300 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between border-b border-amber-100 pb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            <span className="font-extrabold text-xs text-slate-900">
                              {desvio.parametro.nome} ({desvio.parametro.equipamento})
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                              {desvio.diaLabel}
                            </span>
                          </div>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            desvio.tipo === "acima_maximo"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}>
                            {desvio.valorLido} {desvio.parametro.unidade} ({desvio.tipo === "acima_maximo" ? "Acima Máx" : "Abaixo Mín"})
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-500 flex items-center justify-between">
                          <span>Faixa Ideal: <strong>{desvio.parametro.minIdeal} a {desvio.parametro.maxIdeal} {desvio.parametro.unidade}</strong></span>
                          <span>Alvo: <strong>{desvio.parametro.alvo} {desvio.parametro.unidade}</strong></span>
                        </div>

                        <div className="space-y-1 pt-1">
                          <input
                            type="text"
                            value={anotacao.impactoPerda}
                            onChange={e => handleUpdateAnotacaoDesvioMoagem(keyDesvio, "impactoPerda", e.target.value)}
                            placeholder="Impacto / Perda estimada (ex: Redução de 15 t/h de alimentação)..."
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-amber-500"
                          />
                          <input
                            type="text"
                            value={anotacao.acaoRecomendada}
                            onChange={e => handleUpdateAnotacaoDesvioMoagem(keyDesvio, "acaoRecomendada", e.target.value)}
                            placeholder="Ação Corretiva Recomendada (ex: Ajustar pressão nos hidrociclones)..."
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Nenhum desvio detectado. Todos os indicadores operacionais da moagem (MI003 / MI004 / MI005) estão rigorosamente dentro da faixa ideal.</span>
                </div>
              )}
            </div>
          </div>

          {/* Bloco 2.2: Monitoramento diário da remoagem (HIG Mill) */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-purple-700 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    ESTRUTURA DIÁRIA DE MONITORAMENTO OPERACIONAL: REMOAGEM (SEGUNDA A DOMINGO)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Preencha ou cole os 7 dias da semana para o circuito de remoagem e moinho ultrafino HIG
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => abrirModalColarColunaRemoagem("derrickIsoladas")}
                  className="px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Abrir assistente para colar dados de coluna do Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
                  <span>Colar Coluna do Excel</span>
                </button>

                <button
                  type="button"
                  onClick={handleLimparTabelaRemoagem}
                  className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Limpar tabela de remoagem"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Limpar</span>
                </button>
              </div>
            </div>

            {/* Dica de Agilidade */}
            <div className="bg-purple-50/60 border border-purple-200 rounded-lg px-3 py-2 flex items-center justify-between gap-2 text-[11px] text-slate-700">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                <span>
                  <strong className="text-purple-950">Preenchimento Rápido com Excel:</strong> Copie a coluna no Excel e dê <kbd className="px-1 py-0.5 bg-white border border-purple-300 rounded text-[10px] font-mono font-bold text-slate-800 shadow-2xs">Ctrl + V</kbd> em qualquer célula da Remoagem, ou clique em <strong>"Colar"</strong> no cabeçalho do parâmetro.
                </span>
              </div>
            </div>

            {/* Tabela de Monitoramento Diário da Remoagem */}
            <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-2xs bg-white">
              <table className="w-full text-center border-collapse text-[11px]">
                <thead>
                  {/* Linha 1: Grupos Principais com colSpan */}
                  <tr className="bg-slate-900 text-white font-bold text-[10px]">
                    <th rowSpan={2} className="p-2 border-r border-slate-700 min-w-[105px] text-left sticky left-0 bg-slate-900 z-20 align-middle">
                      Dia da Semana
                    </th>
                    <th colSpan={1} className="p-1.5 border-r border-slate-700 bg-purple-900 text-purple-100">
                      PENEIRAMENTO DERRICK (un)
                    </th>
                    <th colSpan={4} className="p-1.5 border-r border-slate-700 bg-slate-850 text-purple-200">
                      GRANULOMETRIA & PRODUTO HIG
                    </th>
                    <th colSpan={3} className="p-1.5 border-r border-slate-700 bg-purple-900 text-purple-100">
                      DENSIDADES & FLUXOS (m³/h / %)
                    </th>
                    <th colSpan={2} className="p-1.5 bg-slate-850 text-amber-200">
                      POTÊNCIA & TORQUE HIG
                    </th>
                  </tr>

                  {/* Linha 2: Indicadores e Faixas */}
                  <tr className="bg-slate-800 text-white font-bold text-[9.5px]">
                    {CONFIG_PARAMETROS_REMOAGEM.map(param => (
                      <th key={param.chave} className="p-1.5 border-r border-slate-700 min-w-[80px] align-top bg-slate-800">
                        <div className="flex flex-col items-center justify-between h-full gap-0.5">
                          <span className="font-extrabold text-white text-[10px] leading-tight text-center">{param.nomeCurto}</span>
                          <span className="text-[8.5px] font-normal text-purple-200 whitespace-nowrap">
                            {param.minIdeal}-{param.maxIdeal} {param.unidade}
                          </span>
                          <button
                            type="button"
                            onClick={() => abrirModalColarColunaRemoagem(param.chave)}
                            className="mt-0.5 px-1 py-0.2 rounded bg-slate-700 hover:bg-purple-700 text-[8.5px] text-slate-200 hover:text-white transition flex items-center gap-0.5 cursor-pointer"
                            title={`Colar valores do Excel para ${param.nome}`}
                          >
                            <ClipboardPaste className="w-2.5 h-2.5" />
                            <span>Colar</span>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historicoDiarioRemoagem.map((diaObj, diaIdx) => {
                    return (
                      <tr key={diaObj.dia} className="border-b border-slate-200 hover:bg-purple-50/30 transition">
                        <td className="p-2 border-r border-slate-200 font-bold text-slate-800 text-left bg-slate-50 sticky left-0 z-10">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                            <span>{diaObj.diaLabel}</span>
                          </div>
                        </td>

                        {CONFIG_PARAMETROS_REMOAGEM.map((param, paramIdx) => {
                          const val = (diaObj as any)[param.chave];
                          const valNum = parseNumeroBritagem(val);
                          const isFora = valNum !== null && (valNum < param.minIdeal || valNum > param.maxIdeal);
                          const isAlto = valNum !== null && valNum > param.maxIdeal;

                          return (
                            <td
                              key={param.chave}
                              className={`p-0.5 border-r border-slate-200 ${
                                isFora
                                  ? "bg-rose-50/80 font-bold text-rose-900"
                                  : "bg-white"
                              }`}
                              title={
                                isFora
                                  ? `Alerta: ${param.nome} = ${valNum} ${param.unidade} está ${isAlto ? "ACIMA" : "ABAIXO"} da faixa ideal (${param.minIdeal} - ${param.maxIdeal} ${param.unidade})`
                                  : `Faixa Ideal: ${param.minIdeal} a ${param.maxIdeal} ${param.unidade}`
                              }
                            >
                              <div className="relative">
                                <input
                                  id={`input-remoagem-${diaIdx}-${paramIdx}`}
                                  type="text"
                                  inputMode="decimal"
                                  value={val === "" || val === undefined ? "" : val}
                                  onChange={e => handleUpdateDiarioRemoagem(diaIdx, param.chave, e.target.value)}
                                  onPaste={e => handlePasteCelulaRemoagem(e, diaIdx, paramIdx)}
                                  onKeyDown={e => handleKeyDownCelulaRemoagem(e, diaIdx, paramIdx)}
                                  placeholder="—"
                                  className={`w-full text-center rounded px-1 py-1 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-purple-600 transition ${
                                    isFora
                                      ? "border border-rose-400 bg-rose-50 text-rose-950 font-bold"
                                      : "border border-slate-200 bg-transparent text-slate-900 hover:border-slate-300"
                                  }`}
                                />
                                {isFora && (
                                  <span className="absolute right-0.5 top-0 text-[8px] text-rose-600 font-black">
                                    !
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal para Colar Coluna do Excel (Remoagem) */}
            {modalColarColunaRemoagemAberto && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Modal Header */}
                  <div className="bg-teal-900 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-teal-950 rounded-lg">
                        <FileSpreadsheet className="w-5 h-5 text-teal-300" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">Colar Coluna do Excel (Remoagem Derrick & Vertimill)</h3>
                        <p className="text-[11px] text-teal-200">
                          Preenchimento automático para os 7 dias da semana (Segunda a Domingo)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalColarColunaRemoagemAberto(false)}
                      className="text-teal-200 hover:text-white p-1 rounded-md hover:bg-teal-800 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-5 space-y-4 overflow-y-auto">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        1. Selecione a Coluna / Parâmetro da Remoagem:
                      </label>
                      <select
                        value={colunaSelecionadaParaColarRemoagem}
                        onChange={e => setColunaSelecionadaParaColarRemoagem(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                      >
                        {CONFIG_PARAMETROS_REMOAGEM.map(param => (
                          <option key={param.chave} value={param.chave}>
                            {param.nome} - Faixa: {param.minIdeal} a {param.maxIdeal} {param.unidade || ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span>2. Cole os dados copiados do Excel (7 linhas):</span>
                        </label>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              if (navigator.clipboard && navigator.clipboard.readText) {
                                const text = await navigator.clipboard.readText();
                                if (text) setTextoColadoExcelRemoagem(text);
                              }
                            } catch (err) {
                              console.warn("Clipboard read error:", err);
                            }
                          }}
                          className="text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded border border-teal-200 transition flex items-center gap-1 cursor-pointer"
                        >
                          <ClipboardPaste className="w-3 h-3" />
                          <span>Colar do Clipboard</span>
                        </button>
                      </div>
                      <textarea
                        rows={6}
                        value={textoColadoExcelRemoagem}
                        onChange={e => setTextoColadoExcelRemoagem(e.target.value)}
                        placeholder={"Copie uma coluna no Excel com 7 linhas e cole aqui (Ctrl+V):\n84,5\n86,0\n83,2\n85,8\n84,0\n83,5\n84,5"}
                        className="w-full font-mono text-xs p-3 rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-slate-50/50"
                      />
                    </div>

                    {/* Pré-visualização dos 7 dias */}
                    {(() => {
                      const paramConfig = CONFIG_PARAMETROS_REMOAGEM.find(p => p.chave === colunaSelecionadaParaColarRemoagem);
                      const linhas = textoColadoExcelRemoagem.trim().split(/\r\n|\r|\n/).filter(l => l.trim().length > 0);

                      return (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                          <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wide">
                            Pré-visualização do Mapeamento (Segunda a Domingo):
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"].map((diaNome, idx) => {
                              const valLinha = linhas[idx] || "";
                              const parsedVal = parseNumeroBritagem(valLinha);
                              const hasVal = parsedVal !== null;
                              const isFora = hasVal && paramConfig && (parsedVal > paramConfig.maxIdeal || parsedVal < paramConfig.minIdeal);

                              return (
                                <div
                                  key={idx}
                                  className={`p-2 rounded-lg border text-xs flex flex-col justify-between ${
                                    !hasVal
                                      ? "bg-white border-slate-200 text-slate-400"
                                      : isFora
                                      ? "bg-rose-50 border-rose-300 text-rose-950 font-bold"
                                      : "bg-teal-50 border-teal-200 text-teal-950 font-bold"
                                  }`}
                                >
                                  <span className="text-[10px] text-slate-500 font-semibold">{diaNome}</span>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs">{hasVal ? `${parsedVal} ${paramConfig?.unidade || ""}` : "—"}</span>
                                    {hasVal && (
                                      <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                                        isFora ? "bg-rose-200 text-rose-800" : "bg-teal-200 text-teal-800"
                                      }`}>
                                        {isFora ? "Desvio" : "OK"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Modal Footer */}
                  <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setModalColarColunaRemoagemAberto(false)}
                      className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmarColarModalRemoagem}
                      disabled={!textoColadoExcelRemoagem.trim()}
                      className="px-4 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Aplicar Valores na Coluna</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PAINEL DE GESTÃO DE DESVIOS E GERAÇÃO DE AÇÕES CORRETIVAS DA REMOAGEM */}
            <div className="bg-amber-50/80 rounded-xl p-4 border border-amber-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                      Gestão de Desvios & Ações Corretivas: Remoagem
                    </h4>
                    <span className="text-[10px] text-amber-800 block">
                      Apenas indicadores de Remoagem fora da faixa ideal são listados para intervenção operacional.
                    </span>
                  </div>
                </div>

                {desviosDetectadosRemoagem.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSincronizarAcoesCorretivasRemoagem}
                    className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Gerar Ações Corretivas da Remoagem ({desviosDetectadosRemoagem.length})</span>
                  </button>
                )}
              </div>

              {desviosDetectadosRemoagem.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {desviosDetectadosRemoagem.map((desvio, idx) => {
                    const keyDesvio = `${desvio.chave}_${desvio.dia}`;
                    const anotacao = dadosCE.anotacoesDesviosRemoagem?.[keyDesvio] || {
                      impactoPerda: "",
                      acaoRecomendada: ""
                    };

                    return (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-lg border border-amber-300 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between border-b border-amber-100 pb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            <span className="font-extrabold text-xs text-slate-900">
                              {desvio.parametro.nome}
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                              {desvio.diaLabel}
                            </span>
                          </div>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            desvio.tipoDesvio === "alto"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}>
                            {desvio.valorLido} {desvio.parametro.unidade} ({desvio.tipoDesvio === "alto" ? "Acima Máx" : "Abaixo Mín"})
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-500 flex items-center justify-between">
                          <span>Faixa Ideal: <strong>{desvio.parametro.minIdeal} a {desvio.parametro.maxIdeal} {desvio.parametro.unidade}</strong></span>
                          <span>Alvo: <strong>{desvio.parametro.alvo} {desvio.parametro.unidade}</strong></span>
                        </div>

                        <div className="space-y-1 pt-1">
                          <input
                            type="text"
                            value={anotacao.impactoPerda}
                            onChange={e => handleUpdateAnotacaoDesvioRemoagem(keyDesvio, "impactoPerda", e.target.value)}
                            placeholder="Impacto / Perda estimada (ex: Sobrecarga no moinho HIG)..."
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-amber-500"
                          />
                          <input
                            type="text"
                            value={anotacao.acaoRecomendada}
                            onChange={e => handleUpdateAnotacaoDesvioRemoagem(keyDesvio, "acaoRecomendada", e.target.value)}
                            placeholder="Ação Corretiva Recomendada (ex: Ajustar fluxo de água ou potência)..."
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Nenhum desvio detectado. Todos os indicadores operacionais da remoagem (circuito HIG e peneiras Derrick) estão rigorosamente dentro da faixa ideal.</span>
                </div>
              )}
            </div>
          </div>

          {/* Bloco 2.4: Monitoramento diário da flotação */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-600 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    ESTRUTURA DIÁRIA DE MONITORAMENTO OPERACIONAL: FLOTAÇÃO (SEGUNDA A DOMINGO)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Preencha ou cole os 7 dias da semana para as etapas de flotação de cobre (sólidos, reagentes e pH)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => abrirModalColarColunaFlotacao("solidosRougher")}
                  className="px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Abrir assistente para colar dados de coluna do Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
                  <span>Colar Coluna do Excel</span>
                </button>

                <button
                  type="button"
                  onClick={handleLimparTabelaFlotacao}
                  className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Limpar tabela de flotação"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Limpar</span>
                </button>
              </div>
            </div>

            {/* Dica de Agilidade */}
            <div className="bg-cyan-50/60 border border-cyan-200 rounded-lg px-3 py-2 flex items-center justify-between gap-2 text-[11px] text-slate-700">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                <span>
                  <strong className="text-cyan-950">Preenchimento Rápido com Excel:</strong> Copie a coluna no Excel e dê <kbd className="px-1 py-0.5 bg-white border border-cyan-300 rounded text-[10px] font-mono font-bold text-slate-800 shadow-2xs">Ctrl + V</kbd> em qualquer célula da Flotação, ou clique em <strong>"Colar"</strong> no cabeçalho do parâmetro correspondente.
                </span>
              </div>
            </div>

            {/* Tabela de Monitoramento Diário da Flotação */}
            <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-2xs bg-white">
              <table className="w-full text-center border-collapse text-[11px]">
                <thead>
                  {/* Linha 1: Grupos Principais com colSpan */}
                  <tr className="bg-slate-900 text-white font-bold text-[10px]">
                    <th rowSpan={2} className="p-2 border-r border-slate-700 min-w-[105px] text-left sticky left-0 bg-slate-900 z-20 align-middle">
                      Dia da Semana
                    </th>
                    <th colSpan={4} className="p-1.5 border-r border-slate-700 bg-cyan-900 text-cyan-100">
                      % SÓLIDOS DAS ETAPAS (%)
                    </th>
                    <th colSpan={4} className="p-1.5 border-r border-slate-700 bg-slate-850 text-emerald-200">
                      DOSAGEM DE REAGENTES (g/t)
                    </th>
                    <th colSpan={3} className="p-1.5 border-r border-slate-700 bg-cyan-900 text-cyan-100">
                      CONTROLE DE pH
                    </th>
                    <th colSpan={2} className="p-1.5 bg-amber-950 text-amber-200">
                      CONTROLE DE TEORES (%)
                    </th>
                  </tr>

                  {/* Linha 2: Indicadores e Faixas */}
                  <tr className="bg-slate-800 text-white font-bold text-[9.5px]">
                    {CONFIG_PARAMETROS_FLOTACAO.map(param => (
                      <th key={param.chave} className="p-1.5 border-r border-slate-700 min-w-[80px] align-top bg-slate-800">
                        <div className="flex flex-col items-center justify-between h-full gap-0.5">
                          <span className="font-extrabold text-white text-[10px] leading-tight text-center">{param.nomeCurto}</span>
                          <span className="text-[8.5px] font-normal text-cyan-200 whitespace-nowrap">
                            {param.rotuloFaixa || `${param.minIdeal}-${param.maxIdeal} ${param.unidade}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => abrirModalColarColunaFlotacao(param.chave)}
                            className="mt-0.5 px-1 py-0.2 rounded bg-slate-700 hover:bg-cyan-700 text-[8.5px] text-slate-200 hover:text-white transition flex items-center gap-0.5 cursor-pointer"
                            title={`Colar valores do Excel para ${param.nome}`}
                          >
                            <ClipboardPaste className="w-2.5 h-2.5" />
                            <span>Colar</span>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historicoDiarioFlotacao.map((diaObj, diaIdx) => {
                    return (
                      <tr key={diaObj.dia} className="border-b border-slate-200 hover:bg-cyan-50/30 transition">
                        <td className="p-2 border-r border-slate-200 font-bold text-slate-800 text-left bg-slate-50 sticky left-0 z-10">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-600"></span>
                            <span>{diaObj.diaLabel}</span>
                          </div>
                        </td>

                        {CONFIG_PARAMETROS_FLOTACAO.map((param, paramIdx) => {
                          const val = (diaObj as any)[param.chave];
                          const valNum = parseNumeroBritagem(val);
                          const isFora = valNum !== null && (
                            param.tipoLimite === "min"
                              ? valNum < param.minIdeal
                              : param.tipoLimite === "max"
                              ? valNum > param.maxIdeal
                              : (valNum < param.minIdeal || valNum > param.maxIdeal)
                          );
                          const isAlto = valNum !== null && (
                            param.tipoLimite === "min"
                              ? false
                              : valNum > param.maxIdeal
                          );

                          return (
                            <td
                              key={param.chave}
                              className={`p-0.5 border-r border-slate-200 ${
                                isFora
                                  ? "bg-rose-50/80 font-bold text-rose-900"
                                  : "bg-white"
                              }`}
                              title={
                                isFora
                                  ? `Alerta: ${param.nome} = ${valNum} ${param.unidade} está ${param.tipoLimite === "min" ? "ABAIXO do limite (> 33,5%)" : param.tipoLimite === "max" ? "ACIMA do limite (< 0,1%)" : isAlto ? "ACIMA" : "ABAIXO"} da faixa ideal (${param.rotuloFaixa || `${param.minIdeal} - ${param.maxIdeal} ${param.unidade}`})`
                                  : `Faixa Ideal: ${param.rotuloFaixa || `${param.minIdeal} a ${param.maxIdeal} ${param.unidade}`}`
                              }
                            >
                              <div className="relative">
                                <input
                                  id={`input-flotacao-${diaIdx}-${paramIdx}`}
                                  type="text"
                                  inputMode="decimal"
                                  value={val === "" || val === undefined ? "" : val}
                                  onChange={e => handleUpdateDiarioFlotacao(diaIdx, param.chave, e.target.value)}
                                  onPaste={e => handlePasteCelulaFlotacao(e, diaIdx, paramIdx)}
                                  onKeyDown={e => handleKeyDownCelulaFlotacao(e, diaIdx, paramIdx)}
                                  placeholder="—"
                                  className={`w-full text-center rounded px-1 py-1 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-cyan-600 transition ${
                                    isFora
                                      ? "border border-rose-400 bg-rose-50 text-rose-950 font-bold"
                                      : "border border-slate-200 bg-transparent text-slate-900 hover:border-slate-300"
                                  }`}
                                />
                                {isFora && (
                                  <span className="absolute right-0.5 top-0 text-[8px] text-rose-600 font-black">
                                    !
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal para Colar Coluna do Excel (Flotação) */}
            {modalColarColunaFlotacaoAberto && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Modal Header */}
                  <div className="bg-teal-900 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-teal-950 rounded-lg">
                        <FileSpreadsheet className="w-5 h-5 text-teal-300" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">Colar Coluna do Excel (Flotação)</h3>
                        <p className="text-[11px] text-teal-200">
                          Preenchimento automático para os 7 dias da semana (Segunda a Domingo)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalColarColunaFlotacaoAberto(false)}
                      className="text-teal-200 hover:text-white p-1 rounded-md hover:bg-teal-800 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-5 space-y-4 overflow-y-auto">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        1. Selecione a Coluna / Parâmetro da Flotação:
                      </label>
                      <select
                        value={colunaSelecionadaParaColarFlotacao}
                        onChange={e => setColunaSelecionadaParaColarFlotacao(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                      >
                        {CONFIG_PARAMETROS_FLOTACAO.map(param => (
                          <option key={param.chave} value={param.chave}>
                            {param.nome} - Faixa: {param.minIdeal} a {param.maxIdeal} {param.unidade || ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span>2. Cole os dados copiados do Excel (7 linhas):</span>
                        </label>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              if (navigator.clipboard && navigator.clipboard.readText) {
                                const text = await navigator.clipboard.readText();
                                if (text) setTextoColadoExcelFlotacao(text);
                              }
                            } catch (err) {
                              console.warn("Clipboard read error:", err);
                            }
                          }}
                          className="text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded border border-teal-200 transition flex items-center gap-1 cursor-pointer"
                        >
                          <ClipboardPaste className="w-3 h-3" />
                          <span>Colar do Clipboard</span>
                        </button>
                      </div>
                      <textarea
                        rows={6}
                        value={textoColadoExcelFlotacao}
                        onChange={e => setTextoColadoExcelFlotacao(e.target.value)}
                        placeholder={"Copie uma coluna no Excel com 7 linhas e cole aqui (Ctrl+V):\n32,2\n32,5\n31,8\n32,8\n32,0\n31,9\n32,1"}
                        className="w-full font-mono text-xs p-3 rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-slate-50/50"
                      />
                    </div>

                    {/* Pré-visualização dos 7 dias */}
                    {(() => {
                      const paramConfig = CONFIG_PARAMETROS_FLOTACAO.find(p => p.chave === colunaSelecionadaParaColarFlotacao);
                      const linhas = textoColadoExcelFlotacao.trim().split(/\r\n|\r|\n/).filter(l => l.trim().length > 0);

                      return (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                          <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wide">
                            Pré-visualização do Mapeamento (Segunda a Domingo):
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"].map((diaNome, idx) => {
                              const valLinha = linhas[idx] || "";
                              const parsedVal = parseNumeroBritagem(valLinha);
                              const hasVal = parsedVal !== null;
                              const isFora = hasVal && paramConfig && (parsedVal > paramConfig.maxIdeal || parsedVal < paramConfig.minIdeal);

                              return (
                                <div
                                  key={idx}
                                  className={`p-2 rounded-lg border text-xs flex flex-col justify-between ${
                                    !hasVal
                                      ? "bg-white border-slate-200 text-slate-400"
                                      : isFora
                                      ? "bg-rose-50 border-rose-300 text-rose-950 font-bold"
                                      : "bg-teal-50 border-teal-200 text-teal-950 font-bold"
                                  }`}
                                >
                                  <span className="text-[10px] text-slate-500 font-semibold">{diaNome}</span>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs">{hasVal ? `${parsedVal} ${paramConfig?.unidade || ""}` : "—"}</span>
                                    {hasVal && (
                                      <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                                        isFora ? "bg-rose-200 text-rose-800" : "bg-teal-200 text-teal-800"
                                      }`}>
                                        {isFora ? "Desvio" : "OK"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Modal Footer */}
                  <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setModalColarColunaFlotacaoAberto(false)}
                      className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmarColarModalFlotacao}
                      disabled={!textoColadoExcelFlotacao.trim()}
                      className="px-4 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Aplicar Valores na Coluna</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PAINEL DE GESTÃO DE DESVIOS E GERAÇÃO DE AÇÕES CORRETIVAS DA FLOTAÇÃO */}
            <div className="bg-amber-50/80 rounded-xl p-4 border border-amber-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                      Gestão de Desvios & Ações Corretivas: Flotação
                    </h4>
                    <span className="text-[10px] text-amber-800 block">
                      Apenas indicadores de Flotação fora da faixa ideal são listados para intervenção operacional.
                    </span>
                  </div>
                </div>

                {desviosDetectadosFlotacao.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSincronizarAcoesCorretivasFlotacao}
                    className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Gerar Ações Corretivas da Flotação ({desviosDetectadosFlotacao.length})</span>
                  </button>
                )}
              </div>

              {desviosDetectadosFlotacao.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {desviosDetectadosFlotacao.map((desvio, idx) => {
                    const keyDesvio = `${desvio.chave}_${desvio.dia}`;
                    const anotacao = dadosCE.anotacoesDesviosFlotacao?.[keyDesvio] || {
                      impactoPerda: "",
                      acaoRecomendada: ""
                    };

                    return (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-lg border border-amber-300 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between border-b border-amber-100 pb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            <span className="font-extrabold text-xs text-slate-900">
                              {desvio.parametro.nome}
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                              {desvio.diaLabel}
                            </span>
                          </div>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            desvio.tipoDesvio === "alto"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}>
                            {desvio.valorLido} {desvio.parametro.unidade} ({desvio.tipoDesvio === "alto" ? "Acima Máx" : "Abaixo Mín"})
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-500 flex items-center justify-between">
                          <span>Faixa Ideal: <strong>{desvio.parametro.minIdeal} a {desvio.parametro.maxIdeal} {desvio.parametro.unidade}</strong></span>
                          <span>Alvo: <strong>{desvio.parametro.alvo} {desvio.parametro.unidade}</strong></span>
                        </div>

                        <div className="space-y-1 pt-1">
                          <input
                            type="text"
                            value={anotacao.impactoPerda}
                            onChange={e => handleUpdateAnotacaoDesvioFlotacao(keyDesvio, "impactoPerda", e.target.value)}
                            placeholder="Impacto / Perda estimada (ex: Perda de seletividade ou recuperação)..."
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-amber-500"
                          />
                          <input
                            type="text"
                            value={anotacao.acaoRecomendada}
                            onChange={e => handleUpdateAnotacaoDesvioFlotacao(keyDesvio, "acaoRecomendada", e.target.value)}
                            placeholder="Ação Corretiva Recomendada (ex: Ajustar dosagem de coletor ou cal)..."
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Nenhum desvio detectado. Todos os indicadores operacionais da flotação (sólidos, reagentes e pH) estão rigorosamente dentro da faixa ideal.</span>
                </div>
              )}
            </div>
          </div>

          {/* Bloco 2.5: Espessamento de Rejeito (Monitoramento Diário & Cartas de Controle) */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-50 border border-teal-200">
                  <Filter className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900">
                      2.5 Espessamento de Rejeito — Monitoramento Diário & Cartas de Controle
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                      7 Dias (Semana)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Controle de densidade underflow, torques dos espessadores 45EP001/002, % sólidos (espessadores e baterias 45BH01/02/03), floculante e linhas HTR / Past Fill.
                  </p>
                </div>
              </div>

              {/* Botões de Ação Rápida */}
              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => abrirModalColarColunaEspessamentoRejeito("densidadeUnderflow")}
                  className="px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Abrir assistente para colar dados de coluna do Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
                  <span>Colar Coluna do Excel</span>
                </button>

                <button
                  type="button"
                  onClick={handleLimparTabelaEspessamentoRejeito}
                  className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Limpar tabela de espessamento de rejeito"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Limpar</span>
                </button>
              </div>
            </div>

            {/* Dica de Agilidade Excel */}
            <div className="bg-teal-50/60 border border-teal-200 rounded-lg px-3 py-2 flex items-center justify-between gap-2 text-[11px] text-slate-700">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span>
                  <strong className="text-teal-950">Preenchimento Rápido com Excel:</strong> Copie a coluna no Excel e dê <kbd className="px-1 py-0.5 bg-white border border-teal-300 rounded text-[10px] font-mono font-bold text-slate-800 shadow-2xs">Ctrl + V</kbd> em qualquer célula do Espessamento de Rejeito, ou clique em <strong>"Colar"</strong> no cabeçalho do parâmetro correspondente.
                </span>
              </div>
            </div>

            {/* Tabela de Monitoramento Diário do Espessamento de Rejeito */}
            <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-2xs bg-white">
              <table className="w-full text-center border-collapse text-[11px]">
                <thead>
                  {/* Linha 1: Grupos Principais com colSpan */}
                  <tr className="bg-slate-900 text-white font-bold text-[10px]">
                    <th rowSpan={2} className="p-2 border-r border-slate-700 min-w-[105px] text-left sticky left-0 bg-slate-900 z-20 align-middle">
                      Dia da Semana
                    </th>
                    <th colSpan={3} className="p-1.5 border-r border-slate-700 bg-teal-900 text-teal-100">
                      DENSIDADE & TORQUES
                    </th>
                    <th colSpan={5} className="p-1.5 border-r border-slate-700 bg-slate-850 text-cyan-200">
                      % SÓLIDOS DO REJEITO (%)
                    </th>
                    <th colSpan={1} className="p-1.5 border-r border-slate-700 bg-emerald-950 text-emerald-200">
                      FLOCULANTE (g/t)
                    </th>
                    <th colSpan={5} className="p-1.5 bg-amber-950 text-amber-200">
                      HTR LINHAS & PAST FILL (h)
                    </th>
                  </tr>

                  {/* Linha 2: Indicadores e Faixas */}
                  <tr className="bg-slate-800 text-white font-bold text-[9.5px]">
                    {CONFIG_PARAMETROS_ESPESSAMENTO_REJEITO.map(param => (
                      <th key={param.chave} className="p-1.5 border-r border-slate-700 min-w-[80px] align-top bg-slate-800">
                        <div className="flex flex-col items-center justify-between h-full gap-0.5">
                          <span className="font-extrabold text-white text-[10px] leading-tight text-center">{param.nomeCurto}</span>
                          <span className="text-[8.5px] font-normal text-teal-200 whitespace-nowrap">
                            {param.rotuloFaixa || `${param.minIdeal}-${param.maxIdeal} ${param.unidade}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => abrirModalColarColunaEspessamentoRejeito(param.chave)}
                            className="mt-0.5 px-1 py-0.2 rounded bg-slate-700 hover:bg-teal-700 text-[8.5px] text-slate-200 hover:text-white transition flex items-center gap-0.5 cursor-pointer"
                            title={`Colar valores do Excel para ${param.nome}`}
                          >
                            <ClipboardPaste className="w-2.5 h-2.5" />
                            <span>Colar</span>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historicoDiarioEspessamentoRejeito.map((diaObj, diaIdx) => {
                    return (
                      <tr key={diaObj.dia} className="border-b border-slate-200 hover:bg-teal-50/30 transition">
                        <td className="p-2 border-r border-slate-200 font-bold text-slate-800 text-left bg-slate-50 sticky left-0 z-10">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                            <span>{diaObj.diaLabel}</span>
                          </div>
                        </td>

                        {CONFIG_PARAMETROS_ESPESSAMENTO_REJEITO.map((param, paramIdx) => {
                          const val = (diaObj as any)[param.chave];
                          const valNum = parseNumeroBritagem(val);
                          const isFora = valNum !== null && (
                            param.tipoLimite === "min"
                              ? valNum < param.minIdeal
                              : param.tipoLimite === "max"
                              ? valNum > param.maxIdeal
                              : (valNum < param.minIdeal || valNum > param.maxIdeal)
                          );
                          const isAlto = valNum !== null && (
                            param.tipoLimite === "min"
                              ? false
                              : valNum > param.maxIdeal
                          );

                          return (
                            <td
                              key={param.chave}
                              className={`p-0.5 border-r border-slate-200 ${
                                isFora
                                  ? "bg-rose-50/80 font-bold text-rose-900"
                                  : "bg-white"
                              }`}
                              title={
                                isFora
                                  ? `Alerta: ${param.nome} = ${valNum} ${param.unidade} está ${param.tipoLimite === "min" ? "ABAIXO do limite" : param.tipoLimite === "max" ? "ACIMA do limite" : isAlto ? "ACIMA" : "ABAIXO"} da faixa ideal (${param.rotuloFaixa || `${param.minIdeal} - ${param.maxIdeal} ${param.unidade}`})`
                                  : `Faixa Ideal: ${param.rotuloFaixa || `${param.minIdeal} a ${param.maxIdeal} ${param.unidade}`}`
                              }
                            >
                              <div className="relative">
                                <input
                                  id={`input-espessamento-${diaIdx}-${paramIdx}`}
                                  type="text"
                                  inputMode="decimal"
                                  value={val === "" || val === undefined ? "" : val}
                                  onChange={e => handleUpdateDiarioEspessamentoRejeito(diaIdx, param.chave, e.target.value)}
                                  onPaste={e => handlePasteCelulaEspessamentoRejeito(e, diaIdx, paramIdx)}
                                  onKeyDown={e => handleKeyDownCelulaEspessamentoRejeito(e, diaIdx, paramIdx)}
                                  placeholder="—"
                                  className={`w-full text-center rounded px-1 py-1 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-teal-600 transition ${
                                    isFora
                                      ? "border border-rose-400 bg-rose-50 text-rose-950 font-bold"
                                      : "border border-slate-200 bg-transparent text-slate-900 hover:border-slate-300"
                                  }`}
                                />
                                {isFora && (
                                  <span className="absolute right-0.5 top-0 text-[8px] text-rose-600 font-black">
                                    !
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal para Colar Coluna do Excel (Espessamento de Rejeito) */}
            {modalColarColunaEspessamentoRejeitoAberto && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Modal Header */}
                  <div className="bg-teal-900 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-teal-950 rounded-lg">
                        <FileSpreadsheet className="w-5 h-5 text-teal-300" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">Colar Coluna do Excel (Espessamento de Rejeito)</h3>
                        <p className="text-[11px] text-teal-200">
                          Preenchimento automático para os 7 dias da semana (Segunda a Domingo)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalColarColunaEspessamentoRejeitoAberto(false)}
                      className="text-teal-200 hover:text-white p-1 rounded-md hover:bg-teal-800 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-5 space-y-4 overflow-y-auto">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        1. Selecione a Coluna / Parâmetro do Espessamento de Rejeito:
                      </label>
                      <select
                        value={colunaSelecionadaParaColarEspessamentoRejeito}
                        onChange={e => setColunaSelecionadaParaColarEspessamentoRejeito(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                      >
                        {CONFIG_PARAMETROS_ESPESSAMENTO_REJEITO.map(param => (
                          <option key={param.chave} value={param.chave}>
                            {param.nome} - Faixa: {param.minIdeal} a {param.maxIdeal} {param.unidade || ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span>2. Cole os dados copiados do Excel (7 linhas):</span>
                        </label>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              if (navigator.clipboard && navigator.clipboard.readText) {
                                const text = await navigator.clipboard.readText();
                                if (text) setTextoColadoExcelEspessamentoRejeito(text);
                              }
                            } catch (err) {
                              console.warn("Clipboard read error:", err);
                            }
                          }}
                          className="text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded border border-teal-200 transition flex items-center gap-1 cursor-pointer"
                        >
                          <ClipboardPaste className="w-3 h-3" />
                          <span>Colar do Clipboard</span>
                        </button>
                      </div>
                      <textarea
                        rows={6}
                        value={textoColadoExcelEspessamentoRejeito}
                        onChange={e => setTextoColadoExcelEspessamentoRejeito(e.target.value)}
                        placeholder={"Copie uma coluna no Excel com 7 linhas e cole aqui (Ctrl+V):\n1720\n1715\n1730\n1725\n1740\n1718\n1722"}
                        className="w-full font-mono text-xs p-3 rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-slate-50/50"
                      />
                    </div>

                    {/* Pré-visualização dos 7 dias */}
                    {(() => {
                      const paramConfig = CONFIG_PARAMETROS_ESPESSAMENTO_REJEITO.find(p => p.chave === colunaSelecionadaParaColarEspessamentoRejeito);
                      const linhas = textoColadoExcelEspessamentoRejeito.trim().split(/\r\n|\r|\n/).filter(l => l.trim().length > 0);

                      return (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                          <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wide">
                            Pré-visualização do Mapeamento (Segunda a Domingo):
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"].map((diaNome, idx) => {
                              const valLinha = linhas[idx] || "";
                              const parsedVal = parseNumeroBritagem(valLinha);
                              const hasVal = parsedVal !== null;
                              const isFora = hasVal && paramConfig && (
                                paramConfig.tipoLimite === "min"
                                  ? parsedVal < paramConfig.minIdeal
                                  : paramConfig.tipoLimite === "max"
                                  ? parsedVal > paramConfig.maxIdeal
                                  : (parsedVal < paramConfig.minIdeal || parsedVal > paramConfig.maxIdeal)
                              );

                              return (
                                <div
                                  key={idx}
                                  className={`p-2 rounded-lg border text-xs flex flex-col justify-between ${
                                    !hasVal
                                      ? "bg-white border-slate-200 text-slate-400"
                                      : isFora
                                      ? "bg-rose-50 border-rose-300 text-rose-950 font-bold"
                                      : "bg-teal-50 border-teal-200 text-teal-950 font-bold"
                                  }`}
                                >
                                  <span className="text-[10px] text-slate-500 font-semibold">{diaNome}</span>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs">{hasVal ? `${parsedVal} ${paramConfig?.unidade || ""}` : "—"}</span>
                                    {hasVal && (
                                      <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                                        isFora ? "bg-rose-200 text-rose-800" : "bg-teal-200 text-teal-800"
                                      }`}>
                                        {isFora ? "Desvio" : "OK"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Modal Footer */}
                  <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setModalColarColunaEspessamentoRejeitoAberto(false)}
                      className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmarColarModalEspessamentoRejeito}
                      disabled={!textoColadoExcelEspessamentoRejeito.trim()}
                      className="px-4 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Aplicar Valores na Coluna</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PAINEL DE GESTÃO DE DESVIOS E GERAÇÃO DE AÇÕES CORRETIVAS DO ESPESSAMENTO DE REJEITO */}
            <div className="bg-teal-50/80 rounded-xl p-4 border border-teal-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-teal-700 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wide">
                      Gestão de Desvios & Ações Corretivas: Espessamento de Rejeito
                    </h4>
                    <span className="text-[10px] text-teal-800 block">
                      Apenas indicadores de espessamento e disposição fora da faixa ideal são listados para intervenção operacional.
                    </span>
                  </div>
                </div>

                {desviosDetectadosEspessamentoRejeito.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSincronizarAcoesCorretivasEspessamentoRejeito}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Gerar Ações Corretivas do Rejeito ({desviosDetectadosEspessamentoRejeito.length})</span>
                  </button>
                )}
              </div>

              {desviosDetectadosEspessamentoRejeito.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {desviosDetectadosEspessamentoRejeito.map((desvio, idx) => {
                    const keyDesvio = `${desvio.chave}_${desvio.dia}`;
                    const anotacao = dadosCE.anotacoesDesviosEspessamentoRejeito?.[keyDesvio] || {
                      impactoPerda: "",
                      acaoRecomendada: ""
                    };

                    return (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-lg border border-teal-300 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between border-b border-teal-100 pb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            <span className="font-extrabold text-xs text-slate-900">
                              {desvio.parametro.nome}
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                              {desvio.diaLabel}
                            </span>
                          </div>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            desvio.tipoDesvio === "alto"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}>
                            {desvio.valorLido} {desvio.parametro.unidade} ({desvio.tipoDesvio === "alto" ? "Acima Máx" : "Abaixo Mín"})
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-500 flex items-center justify-between">
                          <span>Faixa Ideal: <strong>{desvio.parametro.rotuloFaixa || `${desvio.parametro.minIdeal} a ${desvio.parametro.maxIdeal} ${desvio.parametro.unidade}`}</strong></span>
                          <span>Alvo: <strong>{desvio.parametro.alvo} {desvio.parametro.unidade}</strong></span>
                        </div>

                        <div className="space-y-1 pt-1">
                          <input
                            type="text"
                            value={anotacao.impactoPerda}
                            onChange={e => handleUpdateAnotacaoDesvioEspessamentoRejeito(keyDesvio, "impactoPerda", e.target.value)}
                            placeholder="Impacto / Perda estimada (ex: Sobrecarga no espessador, arraste de finos)..."
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-teal-500"
                          />
                          <input
                            type="text"
                            value={anotacao.acaoRecomendada}
                            onChange={e => handleUpdateAnotacaoDesvioEspessamentoRejeito(keyDesvio, "acaoRecomendada", e.target.value)}
                            placeholder="Ação Corretiva Recomendada (ex: Ajustar dosagem de floculante ou bombeamento)..."
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Nenhum desvio detectado. Todos os indicadores operacionais do espessamento de rejeito estão rigorosamente dentro da faixa ideal.</span>
                </div>
              )}
            </div>
          </div>

          {/* Bloco 2.6: Monitoramento Diário do Espessamento de Concentrado */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            {/* Cabeçalho do Bloco 2.6 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <Filter className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900">
                      2.6 Espessamento de Concentrado — Monitoramento Diário & Cartas de Controle
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      7 Dias (Semana)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Controle de densidade underflow, % sólidos 44EP001/002, nível do tanque 44TQ001, floculante, elevação rake e torques de acionamento.
                  </p>
                </div>
              </div>

              {/* Botões de Ação Rápida */}
              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => abrirModalColarColunaEspessamentoConcentrado("densidadeUnderflow")}
                  className="px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Abrir assistente para colar dados de coluna do Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
                  <span>Colar Coluna do Excel</span>
                </button>

                <button
                  type="button"
                  onClick={handleLimparTabelaEspessamentoConcentrado}
                  className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Limpar tabela de espessamento de concentrado"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Limpar</span>
                </button>
              </div>
            </div>

            {/* Dica de Agilidade Excel */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg px-3 py-2 flex items-center justify-between gap-2 text-[11px] text-slate-700">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>
                  <strong className="text-emerald-950">Preenchimento Rápido com Excel:</strong> Copie a coluna no Excel e dê <kbd className="px-1 py-0.5 bg-white border border-emerald-300 rounded text-[10px] font-mono font-bold text-slate-800 shadow-2xs">Ctrl + V</kbd> em qualquer célula do Espessamento de Concentrado, ou clique em <strong>"Colar"</strong> no cabeçalho do parâmetro correspondente.
                </span>
              </div>
            </div>

            {/* Tabela de Monitoramento Diário do Espessamento de Concentrado */}
            <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-2xs bg-white">
              <table className="w-full text-center border-collapse text-[11px]">
                <thead>
                  {/* Linha 1: Grupos Principais com colSpan */}
                  <tr className="bg-slate-900 text-white font-bold text-[10px]">
                    <th rowSpan={2} className="p-2 border-r border-slate-700 min-w-[105px] text-left sticky left-0 bg-slate-900 z-20 align-middle">
                      Dia da Semana
                    </th>
                    <th rowSpan={2} className="p-2 border-r border-slate-700 min-w-[95px] bg-slate-850 text-slate-200 align-middle">
                      OPERAÇÃO
                    </th>
                    <th colSpan={3} className="p-1.5 border-r border-slate-700 bg-emerald-900 text-emerald-100">
                      DENSIDADE & SÓLIDOS
                    </th>
                    <th colSpan={2} className="p-1.5 border-r border-slate-700 bg-slate-800 text-cyan-200">
                      NÍVEL & FLOCULANTE
                    </th>
                    <th colSpan={2} className="p-1.5 border-r border-slate-700 bg-teal-950 text-teal-200">
                      ELEVAÇÃO DO RAKE (Pol)
                    </th>
                    <th colSpan={2} className="p-1.5 bg-cyan-950 text-cyan-200">
                      TORQUE DO ACIONAMENTO (%)
                    </th>
                  </tr>

                  {/* Linha 2: Indicadores e Faixas */}
                  <tr className="bg-slate-800 text-white font-bold text-[9.5px]">
                    {CONFIG_PARAMETROS_ESPESSAMENTO_CONCENTRADO.map(param => (
                      <th key={param.chave} className="p-1.5 border-r border-slate-700 min-w-[85px] align-top bg-slate-800">
                        <div className="flex flex-col items-center justify-between h-full gap-0.5">
                          <span className="font-extrabold text-white text-[10px] leading-tight text-center">{param.nomeCurto}</span>
                          <span className="text-[8.5px] font-normal text-emerald-200 whitespace-nowrap">
                            {param.rotuloFaixa || `${param.minIdeal}-${param.maxIdeal} ${param.unidade}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => abrirModalColarColunaEspessamentoConcentrado(param.chave)}
                            className="mt-0.5 px-1 py-0.2 rounded bg-slate-700 hover:bg-emerald-700 text-[8.5px] text-slate-200 hover:text-white transition flex items-center gap-0.5 cursor-pointer"
                            title={`Colar valores do Excel para ${param.nome}`}
                          >
                            <ClipboardPaste className="w-2.5 h-2.5" />
                            <span>Colar</span>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historicoDiarioEspessamentoConcentrado.map((diaObj, diaIdx) => {
                    return (
                      <tr key={diaObj.dia} className="border-b border-slate-200 hover:bg-emerald-50/30 transition">
                        <td className="p-2 border-r border-slate-200 font-bold text-slate-800 text-left bg-slate-50 sticky left-0 z-10">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            <span>{diaObj.diaLabel}</span>
                          </div>
                        </td>

                        {/* Espessador em Operação */}
                        <td className="p-1 border-r border-slate-200 bg-white">
                          <select
                            value={diaObj.espessadorConcOp || "Ambos"}
                            onChange={e => handleUpdateDiarioEspessamentoConcentrado(diaIdx, "espessadorConcOp" as any, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold text-slate-800 focus:bg-white focus:border-emerald-500 text-center"
                          >
                            <option value="Ambos">Ambos</option>
                            <option value="44EP001">44EP001</option>
                            <option value="44EP002">44EP002</option>
                          </select>
                        </td>

                        {CONFIG_PARAMETROS_ESPESSAMENTO_CONCENTRADO.map((param, paramIdx) => {
                          const val = (diaObj as any)[param.chave];
                          const valNum = parseNumeroBritagem(val);
                          const isFora = valNum !== null && (
                            param.tipoLimite === "min"
                              ? valNum < param.minIdeal
                              : param.tipoLimite === "max"
                              ? valNum > param.maxIdeal
                              : (valNum < param.minIdeal || valNum > param.maxIdeal)
                          );
                          const isAlto = valNum !== null && (
                            param.tipoLimite === "min"
                              ? false
                              : valNum > param.maxIdeal
                          );

                          return (
                            <td
                              key={param.chave}
                              className={`p-0.5 border-r border-slate-200 ${
                                isFora
                                  ? "bg-rose-50/80 font-bold text-rose-900"
                                  : "bg-white"
                              }`}
                              title={
                                isFora
                                  ? `Alerta: ${param.nome} = ${valNum} ${param.unidade} está ${param.tipoLimite === "min" ? "ABAIXO do limite" : param.tipoLimite === "max" ? "ACIMA do limite" : isAlto ? "ACIMA" : "ABAIXO"} da faixa ideal (${param.rotuloFaixa || `${param.minIdeal} - ${param.maxIdeal} ${param.unidade}`})`
                                  : `Faixa Ideal: ${param.rotuloFaixa || `${param.minIdeal} a ${param.maxIdeal} ${param.unidade}`}`
                              }
                            >
                              <div className="relative">
                                <input
                                  id={`input-espessamento-conc-${diaIdx}-${paramIdx}`}
                                  type="text"
                                  value={val === undefined || val === null ? "" : val}
                                  onChange={e => handleUpdateDiarioEspessamentoConcentrado(diaIdx, param.chave, e.target.value)}
                                  onPaste={e => handlePasteCelulaEspessamentoConcentrado(e, diaIdx, paramIdx)}
                                  onKeyDown={e => handleKeyDownCelulaEspessamentoConcentrado(e, diaIdx, paramIdx)}
                                  className={`w-full text-center py-1.5 px-0.5 text-xs font-semibold rounded transition focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white ${
                                    isFora
                                      ? "text-rose-700 bg-rose-50/60 font-black"
                                      : "text-slate-800 hover:bg-slate-50"
                                  }`}
                                  placeholder="—"
                                />
                                {isFora && (
                                  <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500 pointer-events-none" />
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal para Colar Coluna do Excel (Espessamento de Concentrado) */}
            {modalColarColunaEspessamentoConcentradoAberto && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Modal Header */}
                  <div className="bg-teal-900 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-teal-950 rounded-lg">
                        <FileSpreadsheet className="w-5 h-5 text-teal-300" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">Colar Coluna do Excel (Espessamento de Concentrado)</h3>
                        <p className="text-[11px] text-teal-200">
                          Preenchimento automático para os 7 dias da semana (Segunda a Domingo)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalColarColunaEspessamentoConcentradoAberto(false)}
                      className="text-teal-200 hover:text-white p-1 rounded-md hover:bg-teal-800 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-5 space-y-4 overflow-y-auto">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        1. Selecione a Coluna / Parâmetro do Espessamento de Concentrado:
                      </label>
                      <select
                        value={colunaSelecionadaParaColarEspessamentoConcentrado}
                        onChange={e => setColunaSelecionadaParaColarEspessamentoConcentrado(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                      >
                        {CONFIG_PARAMETROS_ESPESSAMENTO_CONCENTRADO.map(param => (
                          <option key={param.chave} value={param.chave}>
                            {param.nome} - Faixa: {param.minIdeal} a {param.maxIdeal} {param.unidade || ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span>2. Cole os dados copiados do Excel (7 linhas):</span>
                        </label>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              if (navigator.clipboard && navigator.clipboard.readText) {
                                const text = await navigator.clipboard.readText();
                                if (text) setTextoColadoExcelEspessamentoConcentrado(text);
                              }
                            } catch (err) {
                              console.warn("Clipboard read error:", err);
                            }
                          }}
                          className="text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded border border-teal-200 transition flex items-center gap-1 cursor-pointer"
                        >
                          <ClipboardPaste className="w-3 h-3" />
                          <span>Colar do Clipboard</span>
                        </button>
                      </div>
                      <textarea
                        rows={6}
                        value={textoColadoExcelEspessamentoConcentrado}
                        onChange={e => setTextoColadoExcelEspessamentoConcentrado(e.target.value)}
                        placeholder={"Copie uma coluna no Excel com 7 linhas e cole aqui (Ctrl+V):\n1850\n1840\n1865\n1855\n1845\n1850\n1860"}
                        className="w-full font-mono text-xs p-3 rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-slate-50/50"
                      />
                    </div>

                    {/* Pré-visualização dos 7 dias */}
                    {(() => {
                      const paramConfig = CONFIG_PARAMETROS_ESPESSAMENTO_CONCENTRADO.find(p => p.chave === colunaSelecionadaParaColarEspessamentoConcentrado);
                      const linhas = textoColadoExcelEspessamentoConcentrado.trim().split(/\r\n|\r|\n/).filter(l => l.trim().length > 0);

                      return (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                          <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wide">
                            Pré-visualização do Mapeamento (Segunda a Domingo):
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"].map((diaNome, idx) => {
                              const valLinha = linhas[idx] || "";
                              const parsedVal = parseNumeroBritagem(valLinha);
                              const hasVal = parsedVal !== null;
                              const isFora = hasVal && paramConfig && (
                                paramConfig.tipoLimite === "min"
                                  ? parsedVal < paramConfig.minIdeal
                                  : paramConfig.tipoLimite === "max"
                                  ? parsedVal > paramConfig.maxIdeal
                                  : (parsedVal < paramConfig.minIdeal || parsedVal > paramConfig.maxIdeal)
                              );

                              return (
                                <div
                                  key={idx}
                                  className={`p-2 rounded-lg border text-xs flex flex-col justify-between ${
                                    !hasVal
                                      ? "bg-white border-slate-200 text-slate-400"
                                      : isFora
                                      ? "bg-rose-50 border-rose-300 text-rose-950 font-bold"
                                      : "bg-teal-50 border-teal-200 text-teal-950 font-bold"
                                  }`}
                                >
                                  <span className="text-[10px] text-slate-500 font-semibold">{diaNome}</span>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs">{hasVal ? `${parsedVal} ${paramConfig?.unidade || ""}` : "—"}</span>
                                    {hasVal && (
                                      <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                                        isFora ? "bg-rose-200 text-rose-800" : "bg-teal-200 text-teal-800"
                                      }`}>
                                        {isFora ? "Desvio" : "OK"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Modal Footer */}
                  <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setModalColarColunaEspessamentoConcentradoAberto(false)}
                      className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmarColarModalEspessamentoConcentrado}
                      disabled={!textoColadoExcelEspessamentoConcentrado.trim()}
                      className="px-4 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Aplicar Valores na Coluna</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PAINEL DE GESTÃO DE DESVIOS E GERAÇÃO DE AÇÕES CORRETIVAS DO ESPESSAMENTO DE CONCENTRADO */}
            <div className="bg-amber-50/80 rounded-xl p-4 border border-amber-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                      Gestão de Desvios & Ações Corretivas: Espessamento de Concentrado
                    </h4>
                    <span className="text-[10px] text-amber-800 block">
                      Apenas indicadores de Espessamento de Concentrado fora da faixa ideal são listados para intervenção operacional.
                    </span>
                  </div>
                </div>

                {desviosDetectadosEspessamentoConcentrado.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSincronizarAcoesCorretivasEspessamentoConcentrado}
                    className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Gerar Ações Corretivas do Espessamento ({desviosDetectadosEspessamentoConcentrado.length})</span>
                  </button>
                )}
              </div>

              {desviosDetectadosEspessamentoConcentrado.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {desviosDetectadosEspessamentoConcentrado.map((desvio, idx) => {
                    const keyDesvio = `${desvio.chave}_${desvio.dia}`;
                    const anotacao = dadosCE.anotacoesDesviosEspessamentoConcentrado?.[keyDesvio] || {
                      impactoPerda: "",
                      acaoRecomendada: ""
                    };

                    return (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-lg border border-amber-300 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between border-b border-amber-100 pb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            <span className="font-extrabold text-xs text-slate-900">
                              {desvio.parametro.nome}
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                              {desvio.diaLabel}
                            </span>
                          </div>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            desvio.tipoDesvio === "alto"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}>
                            {desvio.valorLido} {desvio.parametro.unidade} ({desvio.tipoDesvio === "alto" ? "Acima Máx" : "Abaixo Mín"})
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-500 flex items-center justify-between">
                          <span>Faixa Ideal: <strong>{desvio.parametro.minIdeal} a {desvio.parametro.maxIdeal} {desvio.parametro.unidade}</strong></span>
                          <span>Alvo: <strong>{desvio.parametro.alvo} {desvio.parametro.unidade}</strong></span>
                        </div>

                        <div className="space-y-1 pt-1">
                          <input
                            type="text"
                            value={anotacao.impactoPerda}
                            onChange={e => handleUpdateAnotacaoDesvioEspessamentoConcentrado(keyDesvio, "impactoPerda", e.target.value)}
                            placeholder="Impacto / Perda estimada (ex: Arraste de sólidos para overflow, sobrecarga de rake)..."
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500"
                          />
                          <input
                            type="text"
                            value={anotacao.acaoRecomendada}
                            onChange={e => handleUpdateAnotacaoDesvioEspessamentoConcentrado(keyDesvio, "acaoRecomendada", e.target.value)}
                            placeholder="Ação Corretiva Recomendada (ex: Regular dosagem de floculante ou bombeamento de underflow)..."
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Nenhum desvio detectado. Todos os indicadores operacionais do espessamento de concentrado estão rigorosamente dentro da faixa ideal.</span>
                </div>
              )}
            </div>
          </div>

          {/* Bloco 2.7: Monitoramento Diário da Filtragem de Concentrado */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            {/* Cabeçalho do Bloco 2.7 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-pink-50 border border-pink-200 text-pink-700">
                  <Layers className="w-5 h-5 text-pink-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900">
                      2.7 Filtragem de Concentrado — Monitoramento Diário & Cartas de Controle
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-800">
                      7 Dias (Semana)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Controle de produção por turno, produtividade dos filtros prensa (43-FP-001/002), umidade da torta, ciclos realizados, pressão e paradas.
                  </p>
                </div>
              </div>

              {/* Botões de Ação Rápida */}
              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => abrirModalColarColunaFiltragem("producaoTurno1")}
                  className="px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Abrir assistente para colar dados de coluna do Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
                  <span>Colar Coluna do Excel</span>
                </button>

                <button
                  type="button"
                  onClick={handleLimparTabelaFiltragemConcentrado}
                  className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Limpar tabela de filtragem de concentrado"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Limpar</span>
                </button>
              </div>
            </div>

            {/* Tabela de Monitoramento Diário da Filtragem de Concentrado */}
            <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-2xs bg-white">
              <table className="w-full text-center border-collapse text-[11px]">
                <thead>
                  {/* Linha 1: Grupos Principais com colSpan */}
                  <tr className="bg-slate-900 text-white font-bold text-[10px]">
                    <th rowSpan={2} className="p-2 border-r border-slate-700 min-w-[105px] text-left sticky left-0 bg-slate-900 z-20 align-middle">
                      Dia da Semana
                    </th>
                    <th rowSpan={2} className="p-2 border-r border-slate-700 min-w-[95px] bg-slate-850 text-slate-200 align-middle">
                      OPERAÇÃO
                    </th>
                    <th colSpan={2} className="p-1.5 border-r border-slate-700 bg-pink-900 text-pink-100">
                      PRODUÇÃO & PRODUTIVIDADE
                    </th>
                    <th colSpan={1} className="p-1.5 border-r border-slate-700 bg-rose-950 text-rose-100">
                      QUALIDADE DO BOLO
                    </th>
                    <th colSpan={2} className="p-1.5 border-r border-slate-700 bg-slate-800 text-cyan-200">
                      CICLOS & PRESSÃO
                    </th>
                  </tr>

                  {/* Linha 2: Parâmetros Individuais com botões de Colar */}
                  <tr className="bg-slate-800 text-white font-semibold text-[10px] border-b border-slate-300">
                    {CONFIG_PARAMETROS_FILTRAGEM_CONCENTRADO.map((param, pIdx) => (
                      <th
                        key={param.chave}
                        className="p-1.5 border-r border-slate-700 min-w-[100px] text-center align-top group hover:bg-slate-750 transition"
                        title={`${param.nome} (${param.equipamento} - ${param.subsistema})\nAlvo: ${param.alvo} ${param.unidade} | Faixa Ideal: ${param.rotuloFaixa}`}
                      >
                        <div className="flex flex-col items-center justify-between h-full gap-1">
                          <span className="font-bold text-slate-100 leading-tight">
                            {param.nomeCurto}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {param.rotuloFaixa}
                          </span>
                          <button
                            type="button"
                            onClick={() => abrirModalColarColunaFiltragem(param.chave)}
                            className="mt-0.5 px-1.5 py-0.5 rounded bg-slate-700 hover:bg-pink-600 text-[9px] text-slate-300 hover:text-white flex items-center gap-1 transition cursor-pointer opacity-80 hover:opacity-100"
                            title={`Colar valores do Excel na coluna ${param.nomeCurto}`}
                          >
                            <FileSpreadsheet className="w-2.5 h-2.5" />
                            <span>Colar</span>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historicoDiarioFiltragemConcentrado.map((diaObj, diaIdx) => {
                    return (
                      <tr key={diaObj.dia} className="border-b border-slate-200 hover:bg-pink-50/30 transition">
                        <td className="p-2 border-r border-slate-200 font-bold text-slate-800 text-left bg-slate-50 sticky left-0 z-10">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-600"></span>
                            <span>{diaObj.diaLabel}</span>
                          </div>
                        </td>

                        {/* Equipamento em Operação */}
                        <td className="p-1 border-r border-slate-200 bg-slate-50/60">
                          <select
                            value={diaObj.filtroConcOp || "Ambos"}
                            onChange={e => handleUpdateDiarioFiltragemConcentrado(diaIdx, "filtroConcOp" as any, e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold text-slate-800 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 cursor-pointer"
                          >
                            <option value="Ambos">Ambos (001 e 002)</option>
                            <option value="43FP001">Apenas 43FP001</option>
                            <option value="43FP002">Apenas 43FP002</option>
                          </select>
                        </td>

                        {/* Parâmetros Operacionais */}
                        {CONFIG_PARAMETROS_FILTRAGEM_CONCENTRADO.map((param, pIdx) => {
                          const valRaw = (diaObj as any)[param.chave];
                          const valNum = parseNumeroBritagem(valRaw);

                          let isFora = false;
                          let isAlto = false;
                          let isBaixo = false;

                          if (valNum !== null) {
                            if (param.tipoLimite === "min") {
                              if (valNum < param.minIdeal) {
                                isFora = true;
                                isBaixo = true;
                              }
                            } else if (param.tipoLimite === "max") {
                              if (valNum > param.maxIdeal) {
                                isFora = true;
                                isAlto = true;
                              }
                            } else {
                              if (valNum > param.maxIdeal) {
                                isFora = true;
                                isAlto = true;
                              } else if (valNum < param.minIdeal) {
                                isFora = true;
                                isBaixo = true;
                              }
                            }
                          }

                          return (
                            <td
                              key={param.chave}
                              className={`p-1 border-r border-slate-200 transition ${
                                isFora ? "bg-rose-50/70" : ""
                              }`}
                            >
                              <div className="relative flex items-center">
                                <input
                                  id={`input-filtragem-conc-${diaIdx}-${pIdx}`}
                                  type="number"
                                  step={param.decimais > 0 ? (param.decimais === 1 ? "0.1" : "0.01") : "1"}
                                  value={valRaw !== undefined && valRaw !== null ? valRaw : ""}
                                  placeholder="-"
                                  onChange={e => handleUpdateDiarioFiltragemConcentrado(diaIdx, param.chave, e.target.value)}
                                  onPaste={e => handlePasteCelulaFiltragemConcentrado(e, diaIdx, pIdx)}
                                  onKeyDown={e => handleKeyDownCelulaFiltragemConcentrado(e, diaIdx, pIdx)}
                                  title={
                                    isFora
                                      ? `⚠️ Desvio detectado (${isAlto ? "Acima" : "Abaixo"} do limite ideal: ${param.rotuloFaixa}).\nAlvo: ${param.alvo} ${param.unidade}\nAção: ${param.acaoRecomendada}`
                                      : `${param.nome}\nAlvo: ${param.alvo} ${param.unidade} (Ideal: ${param.rotuloFaixa})`
                                  }
                                  className={`w-full text-center font-bold rounded py-1 px-1 text-xs border transition ${
                                    isFora
                                      ? "bg-rose-100 text-rose-950 border-rose-300 font-black ring-1 ring-rose-400"
                                      : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                                  }`}
                                />
                                {isFora && (
                                  <span
                                    className="absolute right-1 text-[9px] font-black text-rose-700 pointer-events-none"
                                    title={isAlto ? "Acima da meta" : "Abaixo da meta"}
                                  >
                                    {isAlto ? "▲" : "▼"}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal para Colar Coluna do Excel (Filtragem de Concentrado) */}
            {modalColarColunaFiltragemAberto && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Modal Header */}
                  <div className="bg-teal-900 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-teal-950 rounded-lg">
                        <FileSpreadsheet className="w-5 h-5 text-teal-300" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">Colar Coluna do Excel (Filtragem de Concentrado)</h3>
                        <p className="text-[11px] text-teal-200">
                          Preenchimento automático para os 7 dias da semana (Segunda a Domingo)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalColarColunaFiltragemAberto(false)}
                      className="text-teal-200 hover:text-white p-1 rounded-md hover:bg-teal-800 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-5 space-y-4 overflow-y-auto">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        1. Selecione a Coluna / Parâmetro da Filtragem:
                      </label>
                      <select
                        value={colunaSelecionadaParaColarFiltragem}
                        onChange={e => setColunaSelecionadaParaColarFiltragem(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                      >
                        {CONFIG_PARAMETROS_FILTRAGEM_CONCENTRADO.map(param => (
                          <option key={param.chave} value={param.chave}>
                            {param.nome} - Faixa: {param.rotuloFaixa}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span>2. Cole os dados copiados do Excel (7 linhas):</span>
                        </label>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              if (navigator.clipboard && navigator.clipboard.readText) {
                                const text = await navigator.clipboard.readText();
                                if (text) setTextoColadoExcelFiltragem(text);
                              }
                            } catch (err) {
                              console.warn("Clipboard read error:", err);
                            }
                          }}
                          className="text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded border border-teal-200 transition flex items-center gap-1 cursor-pointer"
                        >
                          <ClipboardPaste className="w-3 h-3" />
                          <span>Colar do Clipboard</span>
                        </button>
                      </div>
                      <textarea
                        rows={6}
                        value={textoColadoExcelFiltragem}
                        onChange={e => setTextoColadoExcelFiltragem(e.target.value)}
                        placeholder={"Copie uma coluna no Excel com 7 linhas e cole aqui (Ctrl+V):\n325\n340\n310\n350\n325\n330\n325"}
                        className="w-full font-mono text-xs p-3 rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-slate-50/50"
                      />
                    </div>

                    {/* Pré-visualização dos 7 dias */}
                    {(() => {
                      const paramConfig = CONFIG_PARAMETROS_FILTRAGEM_CONCENTRADO.find(p => p.chave === colunaSelecionadaParaColarFiltragem);
                      const linhas = textoColadoExcelFiltragem.trim().split(/\r\n|\r|\n/).filter(l => l.trim().length > 0);

                      return (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                          <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wide">
                            Pré-visualização do Mapeamento (Segunda a Domingo):
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"].map((diaNome, idx) => {
                              const valLinha = linhas[idx] || "";
                              const parsedVal = parseNumeroBritagem(valLinha);
                              const hasVal = parsedVal !== null;
                              const isFora = hasVal && paramConfig && (
                                paramConfig.tipoLimite === "min"
                                  ? parsedVal < paramConfig.minIdeal
                                  : paramConfig.tipoLimite === "max"
                                  ? parsedVal > paramConfig.maxIdeal
                                  : (parsedVal < paramConfig.minIdeal || parsedVal > paramConfig.maxIdeal)
                              );

                              return (
                                <div
                                  key={idx}
                                  className={`p-2 rounded-lg border text-xs flex flex-col justify-between ${
                                    !hasVal
                                      ? "bg-white border-slate-200 text-slate-400"
                                      : isFora
                                      ? "bg-rose-50 border-rose-300 text-rose-950 font-bold"
                                      : "bg-teal-50 border-teal-200 text-teal-950 font-bold"
                                  }`}
                                >
                                  <span className="text-[10px] text-slate-500 font-semibold">{diaNome}</span>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs">{hasVal ? `${parsedVal} ${paramConfig?.unidade || ""}` : "—"}</span>
                                    {hasVal && (
                                      <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                                        isFora ? "bg-rose-200 text-rose-800" : "bg-teal-200 text-teal-800"
                                      }`}>
                                        {isFora ? "Desvio" : "OK"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Modal Footer */}
                  <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setModalColarColunaFiltragemAberto(false)}
                      className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmarColarModalFiltragem}
                      disabled={!textoColadoExcelFiltragem.trim()}
                      className="px-4 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Aplicar Valores na Coluna</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Painel de Gestão de Desvios & Ações Corretivas (Filtragem) */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Painel de Gestão de Desvios & Ações Corretivas (Filtragem)
                  </h4>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  desviosDetectadosFiltragemConcentrado.length > 0
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}>
                  {desviosDetectadosFiltragemConcentrado.length} desvio(s) ativo(s)
                </span>
              </div>

              {desviosDetectadosFiltragemConcentrado.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {desviosDetectadosFiltragemConcentrado.map(desvio => {
                    const keyDesvio = `${desvio.chave}_${desvio.dia}`;
                    const anotacao = dadosCE.anotacoesDesviosFiltragemConcentrado?.[keyDesvio];

                    return (
                      <div
                        key={keyDesvio}
                        className="bg-rose-50/40 border border-rose-200 rounded-xl p-3 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between border-b border-rose-100 pb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{desvio.diaLabel}</span>
                            <span className="text-slate-400">•</span>
                            <span className="font-extrabold text-pink-900">{desvio.parametro.nome}</span>
                          </div>
                          <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                            {desvio.tipoDesvio === "alto" ? "▲ Acima da faixa" : "▼ Abaixo da faixa"} ({desvio.valorLido} {desvio.parametro.unidade} vs {desvio.parametro.rotuloFaixa})
                          </span>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                            Impacto / Risco Operacional:
                          </label>
                          <input
                            type="text"
                            value={anotacao?.impactoPerda !== undefined ? anotacao.impactoPerda : desvio.parametro.impactoDesvio}
                            onChange={e => handleUpdateAnotacaoDesvioFiltragemConcentrado(keyDesvio, "impactoPerda", e.target.value)}
                            placeholder="Descreva o impacto nas metas ou no processo..."
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                            Ação Corretiva Recomendada:
                          </label>
                          <input
                            type="text"
                            value={anotacao?.acaoRecomendada !== undefined ? anotacao.acaoRecomendada : desvio.parametro.acaoRecomendada}
                            onChange={e => handleUpdateAnotacaoDesvioFiltragemConcentrado(keyDesvio, "acaoRecomendada", e.target.value)}
                            placeholder="Ação corretiva do turno..."
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Nenhum desvio detectado. Todos os indicadores operacionais da filtragem de concentrado estão rigorosamente dentro da faixa ideal.</span>
                </div>
              )}
            </div>
          </div>

          {/* Bloco 2.8: Utilidades & ETA (Estação de Tratamento de Água, Balanço Hídrico & Ar Comprimido) */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            {/* Cabeçalho do Bloco com Ações Rápidas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-700">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>2.8 Utilidades & ETA — Balanço Hídrico, Rede de Ar Comprimido & Tratamento de Água</span>
                    <span className="text-[10px] bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold px-2 py-0.5 rounded-full">
                      COMPRESSORES 47-CO & ETA 47-ET
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Acompanhamento diário contínuo de 9 parâmetros críticos de utilidades, qualidade de água e ar comprimido industrial
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => abrirModalColarColunaUtilidades("pressaoRedeBar")}
                  className="px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Abrir assistente para colar dados de coluna do Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
                  <span>Colar Coluna do Excel</span>
                </button>

                <button
                  type="button"
                  onClick={handleLimparTabelaUtilidadesETA}
                  className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Limpar tabela de Utilidades & ETA"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Limpar</span>
                </button>
              </div>
            </div>

            {/* Dica de usabilidade do Excel */}
            <div className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600">
              <div className="flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  <strong>Dica de Produtividade:</strong> Cole colunas inteiras do Excel ou navegue entre células usando as teclas de setas e Enter.
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Segunda a Domingo (7 dias)</span>
            </div>

            {/* Tabela de Monitoramento Diário de Utilidades & ETA */}
            <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-2xs bg-white">
              <table className="w-full text-center border-collapse text-[11px]">
                <thead>
                  {/* Linha 1: Grupos Principais com colSpan */}
                  <tr className="bg-slate-900 text-white font-bold text-[10px]">
                    <th rowSpan={2} className="p-2 border-r border-slate-700 min-w-[105px] text-left sticky left-0 bg-slate-900 z-20 align-middle">
                      Dia da Semana
                    </th>
                    <th rowSpan={2} className="p-2 border-r border-slate-700 min-w-[95px] bg-slate-850 text-slate-200 align-middle">
                      COMPRESSOR
                    </th>
                    <th rowSpan={2} className="p-2 border-r border-slate-700 min-w-[95px] bg-slate-850 text-slate-200 align-middle">
                      BOMBAS ÁGUA
                    </th>
                    <th colSpan={1} className="p-1.5 border-r border-slate-700 bg-sky-900 text-sky-100">
                      AR COMPRIMIDO
                    </th>
                    <th colSpan={2} className="p-1.5 border-r border-slate-700 bg-cyan-900 text-cyan-100">
                      BALANÇO HÍDRICO GLOBAL
                    </th>
                    <th colSpan={2} className="p-1.5 border-r border-slate-700 bg-teal-950 text-teal-100">
                      QUALIDADE ETA & RESERVATÓRIOS
                    </th>
                  </tr>

                  {/* Linha 2: Parâmetros Individuais com botões de Colar */}
                  <tr className="bg-slate-800 text-white font-semibold text-[10px] border-b border-slate-300">
                    {CONFIG_PARAMETROS_UTILIDADES_ETA.map((param) => (
                      <th
                        key={param.chave}
                        className="p-1.5 border-r border-slate-700 min-w-[100px] text-center align-top group hover:bg-slate-750 transition"
                        title={`${param.nome} (${param.equipamento} - ${param.subsistema})\nAlvo: ${param.alvo} ${param.unidade} | Faixa Ideal: ${param.rotuloFaixa}`}
                      >
                        <div className="flex flex-col items-center justify-between h-full gap-1">
                          <span className="font-bold text-slate-100 leading-tight">
                            {param.nomeCurto}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {param.rotuloFaixa}
                          </span>
                          <button
                            type="button"
                            onClick={() => abrirModalColarColunaUtilidades(param.chave)}
                            className="mt-0.5 px-1.5 py-0.5 rounded bg-slate-700 hover:bg-cyan-600 text-[9px] text-slate-300 hover:text-white flex items-center gap-1 transition cursor-pointer opacity-80 hover:opacity-100"
                            title={`Colar valores do Excel na coluna ${param.nomeCurto}`}
                          >
                            <FileSpreadsheet className="w-2.5 h-2.5" />
                            <span>Colar</span>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {historicoDiarioUtilidadesETA.map((diaObj, diaIdx) => {
                    return (
                      <tr key={diaObj.dia} className="border-b border-slate-200 hover:bg-cyan-50/30 transition">
                        <td className="p-2 border-r border-slate-200 font-bold text-slate-800 text-left bg-slate-50 sticky left-0 z-10">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-600"></span>
                            <span>{diaObj.diaLabel}</span>
                          </div>
                        </td>

                        {/* Status Compressores */}
                        <td className="p-1 border-r border-slate-200 bg-slate-50/60">
                          <select
                            value={diaObj.compressoresOp || "Todos em Operação"}
                            onChange={e => handleUpdateDiarioUtilidadesETA(diaIdx, "compressoresOp" as any, e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-[10px] font-bold text-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                          >
                            <option value="Todos em Operação">Todos Ativos</option>
                            <option value="Comp 01 e 02">01 e 02</option>
                            <option value="Comp 02 e 03">02 e 03</option>
                            <option value="Comp 01 e 03">01 e 03</option>
                            <option value="1 em Manutenção">1 Manut.</option>
                          </select>
                        </td>

                        {/* Status Bombas Água */}
                        <td className="p-1 border-r border-slate-200 bg-slate-50/60">
                          <select
                            value={diaObj.bombasAguaOp || "Ambas em Operação"}
                            onChange={e => handleUpdateDiarioUtilidadesETA(diaIdx, "bombasAguaOp" as any, e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-[10px] font-bold text-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                          >
                            <option value="Ambas em Operação">Ambas Ativas</option>
                            <option value="Apenas Bomba 01">Apenas 01</option>
                            <option value="Apenas Bomba 02">Apenas 02</option>
                            <option value="Rodízio Preventivo">Rodízio</option>
                          </select>
                        </td>

                        {/* Parâmetros Operacionais */}
                        {CONFIG_PARAMETROS_UTILIDADES_ETA.map((param, pIdx) => {
                          const valRaw = (diaObj as any)[param.chave];
                          const valNum = parseNumeroBritagem(valRaw);

                          let isFora = false;
                          let isAlto = false;

                          if (valNum !== null) {
                            if (param.tipoLimite === "min") {
                              if (valNum < param.minIdeal) isFora = true;
                            } else if (param.tipoLimite === "max") {
                              if (valNum > param.maxIdeal) {
                                isFora = true;
                                isAlto = true;
                              }
                            } else {
                              if (valNum > param.maxIdeal) {
                                isFora = true;
                                isAlto = true;
                              } else if (valNum < param.minIdeal) {
                                isFora = true;
                              }
                            }
                          }

                          return (
                            <td
                              key={param.chave}
                              className={`p-1 border-r border-slate-200 transition ${
                                isFora ? "bg-rose-50/70" : ""
                              }`}
                            >
                              <div className="relative flex items-center">
                                <input
                                  id={`input-utilidades-${diaIdx}-${pIdx}`}
                                  type="number"
                                  step={param.decimais > 0 ? (param.decimais === 1 ? "0.1" : "0.01") : "1"}
                                  value={valRaw !== undefined && valRaw !== null ? valRaw : ""}
                                  placeholder="-"
                                  onChange={e => handleUpdateDiarioUtilidadesETA(diaIdx, param.chave, e.target.value)}
                                  onPaste={e => handlePasteCelulaUtilidadesETA(e, diaIdx, pIdx)}
                                  onKeyDown={e => handleKeyDownCelulaUtilidadesETA(e, diaIdx, pIdx)}
                                  title={
                                    isFora
                                      ? `⚠️ Desvio detectado (${isAlto ? "Acima" : "Abaixo"} do limite ideal: ${param.rotuloFaixa}).\nAlvo: ${param.alvo} ${param.unidade}\nAção: ${param.acaoRecomendada}`
                                      : `${param.nome}\nAlvo: ${param.alvo} ${param.unidade} (Ideal: ${param.rotuloFaixa})`
                                  }
                                  className={`w-full text-center font-bold rounded py-1 px-1 text-xs border transition ${
                                    isFora
                                      ? "bg-rose-100 text-rose-950 border-rose-300 font-black ring-1 ring-rose-400"
                                      : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                  }`}
                                />
                                {isFora && (
                                  <span
                                    className="absolute right-1 w-1.5 h-1.5 rounded-full bg-rose-600 pointer-events-none"
                                    title="Ponto fora da faixa operacional recomendada"
                                  />
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal de Colagem Rápida do Excel (Utilidades & ETA) */}
            {modalColarColunaUtilidadesAberto && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Modal Header */}
                  <div className="bg-teal-900 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-teal-950 rounded-lg">
                        <FileSpreadsheet className="w-5 h-5 text-teal-300" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">Colar Coluna do Excel (Utilidades & ETA)</h3>
                        <p className="text-[11px] text-teal-200">
                          Preenchimento automático para os 7 dias da semana (Segunda a Domingo)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalColarColunaUtilidadesAberto(false)}
                      className="text-teal-200 hover:text-white p-1 rounded-md hover:bg-teal-800 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-5 space-y-4 overflow-y-auto">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        1. Selecione a Coluna / Parâmetro de Utilidades & ETA:
                      </label>
                      <select
                        value={colunaSelecionadaParaColarUtilidades}
                        onChange={e => setColunaSelecionadaParaColarUtilidades(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                      >
                        {CONFIG_PARAMETROS_UTILIDADES_ETA.map(param => (
                          <option key={param.chave} value={param.chave}>
                            {param.nome} - Faixa: {param.rotuloFaixa}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span>2. Cole os dados copiados do Excel (7 linhas):</span>
                        </label>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              if (navigator.clipboard && navigator.clipboard.readText) {
                                const text = await navigator.clipboard.readText();
                                if (text) setTextoColadoExcelUtilidades(text);
                              }
                            } catch (err) {
                              console.warn("Clipboard read error:", err);
                            }
                          }}
                          className="text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded border border-teal-200 transition flex items-center gap-1 cursor-pointer"
                        >
                          <ClipboardPaste className="w-3 h-3" />
                          <span>Colar do Clipboard</span>
                        </button>
                      </div>
                      <textarea
                        rows={6}
                        value={textoColadoExcelUtilidades}
                        onChange={e => setTextoColadoExcelUtilidades(e.target.value)}
                        placeholder={"Copie uma coluna no Excel com 7 linhas e cole aqui (Ctrl+V):\n7.0\n7.1\n6.9\n7.2\n7.0\n6.8\n7.0"}
                        className="w-full font-mono text-xs p-3 rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-slate-50/50"
                      />
                    </div>

                    {/* Pré-visualização dos 7 dias */}
                    {(() => {
                      const paramConfig = CONFIG_PARAMETROS_UTILIDADES_ETA.find(p => p.chave === colunaSelecionadaParaColarUtilidades);
                      const linhas = textoColadoExcelUtilidades.trim().split(/\r\n|\r|\n/).filter(l => l.trim().length > 0);

                      return (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                          <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wide">
                            Pré-visualização do Mapeamento (Segunda a Domingo):
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"].map((diaNome, idx) => {
                              const valLinha = linhas[idx] || "";
                              const parsedVal = parseNumeroBritagem(valLinha);
                              const hasVal = parsedVal !== null;
                              const isFora = hasVal && paramConfig && (
                                paramConfig.tipoLimite === "min"
                                  ? parsedVal < paramConfig.minIdeal
                                  : paramConfig.tipoLimite === "max"
                                  ? parsedVal > paramConfig.maxIdeal
                                  : (parsedVal < paramConfig.minIdeal || parsedVal > paramConfig.maxIdeal)
                              );

                              return (
                                <div
                                  key={idx}
                                  className={`p-2 rounded-lg border text-xs flex flex-col justify-between ${
                                    !hasVal
                                      ? "bg-white border-slate-200 text-slate-400"
                                      : isFora
                                      ? "bg-rose-50 border-rose-300 text-rose-950 font-bold"
                                      : "bg-teal-50 border-teal-200 text-teal-950 font-bold"
                                  }`}
                                >
                                  <span className="text-[10px] text-slate-500 font-semibold">{diaNome}</span>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs">{hasVal ? `${parsedVal} ${paramConfig?.unidade || ""}` : "—"}</span>
                                    {hasVal && (
                                      <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                                        isFora ? "bg-rose-200 text-rose-800" : "bg-teal-200 text-teal-800"
                                      }`}>
                                        {isFora ? "Desvio" : "OK"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Modal Footer */}
                  <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setModalColarColunaUtilidadesAberto(false)}
                      className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmarColarModalUtilidades}
                      disabled={!textoColadoExcelUtilidades.trim()}
                      className="px-4 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Aplicar Valores na Coluna</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Painel de Gestão de Desvios & Ações Corretivas (Utilidades & ETA) */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-cyan-700" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Painel de Gestão de Desvios & Ações Corretivas (Utilidades & ETA)
                  </h4>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  desviosDetectadosUtilidadesETA.length > 0
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}>
                  {desviosDetectadosUtilidadesETA.length} desvio(s) ativo(s)
                </span>
              </div>

              {desviosDetectadosUtilidadesETA.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {desviosDetectadosUtilidadesETA.map(desvio => {
                    const keyDesvio = `${desvio.chave}_${desvio.dia}`;
                    const anotacao = dadosCE.anotacoesDesviosUtilidadesETA?.[keyDesvio];

                    return (
                      <div
                        key={keyDesvio}
                        className="bg-rose-50/40 border border-rose-200 rounded-xl p-3 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between border-b border-rose-100 pb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{desvio.diaLabel}</span>
                            <span className="text-slate-400">•</span>
                            <span className="font-extrabold text-cyan-900">{desvio.parametro.nome}</span>
                          </div>
                          <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                            {desvio.tipoDesvio === "alto" ? "▲ Acima da faixa" : "▼ Abaixo da faixa"} ({desvio.valorLido} {desvio.parametro.unidade} vs {desvio.parametro.rotuloFaixa})
                          </span>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                            Impacto / Risco Operacional:
                          </label>
                          <input
                            type="text"
                            value={anotacao?.impactoPerda !== undefined ? anotacao.impactoPerda : desvio.parametro.impactoDesvio}
                            onChange={e => handleUpdateAnotacaoDesvioUtilidadesETA(keyDesvio, "impactoPerda", e.target.value)}
                            placeholder="Descreva o impacto nas metas ou no processo..."
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                            Ação Corretiva Recomendada:
                          </label>
                          <input
                            type="text"
                            value={anotacao?.acaoRecomendada !== undefined ? anotacao.acaoRecomendada : desvio.parametro.acaoRecomendada}
                            onChange={e => handleUpdateAnotacaoDesvioUtilidadesETA(keyDesvio, "acaoRecomendada", e.target.value)}
                            placeholder="Ação corretiva do turno..."
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Nenhum desvio detectado. Todos os indicadores operacionais de utilidades e ETA estão rigorosamente dentro da faixa ideal.</span>
                </div>
              )}
            </div>
          </div>

          {/* Bloco 2.6: Gargalos Operacionais & Plano de Contingência (Circuito Úmido) */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold text-slate-900">Gargalos Operacionais & Plano de Contingência</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Gargalos Atuais no Circuito Úmido (Moagem / Flotação / ETA)
                </label>
                <textarea
                  rows={2}
                  value={dadosCE.gargalosAtuais || ""}
                  onChange={e => setCE("gargalosAtuais", e.target.value)}
                  placeholder="Ex: Oscilação de pressão na água de selagem das bombas, desgaste de telas ou revestimento..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Plano de Contingência Operacional
                </label>
                <textarea
                  rows={2}
                  value={dadosCE.planoContingencia || ""}
                  onChange={e => setCE("planoContingencia", e.target.value)}
                  placeholder="Ex: Operação em modo contingencial, acionamento de bombas/compressores reservas e ajuste de dosagens..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
