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
  Trash2
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
  obterLeituraAtualRebritagem
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
    if (window.confirm("Deseja realmente limpar todos os dados da tabela de monitoramento diário da britagem?")) {
      const limpo = DADOS_DIARIOS_BRITAGEM_PADRAO.map(d => ({ ...d }));
      const nextBR = { ...dadosBR, historicoDiarioBritagem: limpo };
      sincronizarLeiturasAtuais(nextBR);
      onChangeBR(nextBR);

      setToastMensagem("Tabela de monitoramento diário limpa com sucesso.");
      setAcoesSincronizadasToast(true);
      setTimeout(() => setAcoesSincronizadasToast(false), 3000);
    }
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
    if (window.confirm("Deseja realmente limpar todos os dados da tabela de monitoramento diário da Rebritagem?")) {
      const limpo = DADOS_DIARIOS_REBRITAGEM_PADRAO.map(d => ({ ...d }));
      const nextBR = { ...dadosBR, historicoDiarioRebritagem: limpo };
      sincronizarLeiturasAtuaisRebritagem(nextBR);
      onChangeBR(nextBR);

      setToastMensagem("Tabela de monitoramento diário da Rebritagem limpa com sucesso.");
      setAcoesSincronizadasToast(true);
      setTimeout(() => setAcoesSincronizadasToast(false), 3000);
    }
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
                    className="px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Abrir assistente para colar dados de coluna do Excel"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
                    <span>Colar Coluna do Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLimparTabela}
                    className="px-2 py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                    title="Limpar todos os campos da tabela diária"
                  >
                    <Trash2 className="w-3 h-3" />
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
                    <div className="bg-teal-800 text-white p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-teal-900 rounded-lg">
                          <FileSpreadsheet className="w-5 h-5 text-teal-300" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold">Colar Coluna do Excel na Tabela</h3>
                          <p className="text-[11px] text-teal-200">
                            Preenchimento automático para os 7 dias da semana (Segunda a Domingo)
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setModalColarColunaAberto(false)}
                        className="text-teal-200 hover:text-white p-1 rounded-md hover:bg-teal-700 transition cursor-pointer"
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
                    onClick={handleLimparTabelaRebritagem}
                    className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 border border-slate-300 hover:border-rose-300 rounded-lg transition flex items-center gap-1 cursor-pointer"
                    title="Limpar tabela de rebritagem"
                  >
                    <Trash2 className="w-3 h-3 text-slate-500 hover:text-rose-600" />
                    <span>Limpar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => abrirModalColarColunaRebritagem("tempOleoLub_BR001")}
                    className="px-3 py-1 text-[11px] font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5 text-blue-600" />
                    <span>Colar Coluna do Excel</span>
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
                    <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-950 rounded-lg">
                          <FileSpreadsheet className="w-5 h-5 text-blue-300" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold">Colar Coluna do Excel (Rebritagem & Peneiramento)</h3>
                          <p className="text-[11px] text-blue-200">
                            Preenchimento automático para os 7 dias da semana (Segunda a Domingo)
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setModalColarColunaRebritagemAberto(false)}
                        className="text-blue-200 hover:text-white p-1 rounded-md hover:bg-blue-800 transition cursor-pointer"
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
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
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
                            className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition flex items-center gap-1 cursor-pointer"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            <span>Ler da Área de Transferência</span>
                          </button>
                        </div>
                        <textarea
                          rows={6}
                          value={textoColadoExcelRebritagem}
                          onChange={e => setTextoColadoExcelRebritagem(e.target.value)}
                          placeholder="Cole aqui a coluna copiada do Excel (ex: 7 valores separados por linha)..."
                          className="w-full font-mono text-xs p-3 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        />
                      </div>

                      {/* Preview das Linhas Identificadas */}
                      {textoColadoExcelRebritagem.trim() && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-700 block">Pré-visualização do Mapeamento Diário:</span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((diaLabel, i) => {
                              const linhas = textoColadoExcelRebritagem.trim().split(/\r\n|\r|\n/);
                              const valLinha = linhas[i] ? linhas[i].split("\t")[0] : "";
                              const parsed = parseNumeroBritagem(valLinha);
                              return (
                                <div key={diaLabel} className="bg-white p-1.5 rounded border border-slate-200 flex justify-between items-center">
                                  <span className="font-bold text-slate-600">{diaLabel}:</span>
                                  <span className={parsed !== null ? "font-bold text-blue-700" : "text-slate-400"}>
                                    {parsed !== null ? parsed : (valLinha || "—")}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Modal Footer */}
                    <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setModalColarColunaRebritagemAberto(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmarColarModalRebritagem}
                        disabled={!textoColadoExcelRebritagem.trim()}
                        className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>Aplicar na Rebritagem</span>
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
          {/* Bloco 2.1: Produção Moagem e Cobre Contido Acumulado */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Desempenho Acumulado: Moagem e Cobre Contido (Dia / Semana / Mês)
                </h3>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Planta Concentrador
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Diário */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Desempenho do Dia (24h)</span>
                <div>
                  <label className="text-[10px] text-slate-500 block">Produção Moagem (t)</label>
                  <input
                    type="number"
                    value={dadosCE.producaoMoagemDia || ""}
                    onChange={e => setCE("producaoMoagemDia", parseFloat(e.target.value) || "")}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Metal Cobre Contido (t Cu)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={dadosCE.metalContidoDia || ""}
                    onChange={e => setCE("metalContidoDia", parseFloat(e.target.value) || "")}
                    className="w-full bg-emerald-50/70 border border-emerald-300 rounded-lg px-2.5 py-1 text-xs font-extrabold text-emerald-900"
                  />
                </div>
              </div>

              {/* Semanal */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Semanal (WTD)</span>
                <div>
                  <label className="text-[10px] text-slate-500 block">Moagem Semanal (t)</label>
                  <input
                    type="number"
                    value={dadosCE.producaoMoagemSemana || ""}
                    onChange={e => setCE("producaoMoagemSemana", parseFloat(e.target.value) || "")}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Metal Cu Semanal (t Cu)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={dadosCE.metalContidoSemana || ""}
                    onChange={e => setCE("metalContidoSemana", parseFloat(e.target.value) || "")}
                    className="w-full bg-emerald-50/70 border border-emerald-300 rounded-lg px-2.5 py-1 text-xs font-extrabold text-emerald-900"
                  />
                </div>
              </div>

              {/* Mensal */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Mensal (MTD)</span>
                <div>
                  <label className="text-[10px] text-slate-500 block">Moagem Mês (t)</label>
                  <input
                    type="number"
                    value={dadosCE.producaoMoagemMes || ""}
                    onChange={e => setCE("producaoMoagemMes", parseFloat(e.target.value) || "")}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Metal Cu Mês (t Cu)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={dadosCE.metalContidoMes || ""}
                    onChange={e => setCE("metalContidoMes", parseFloat(e.target.value) || "")}
                    className="w-full bg-emerald-50/70 border border-emerald-300 rounded-lg px-2.5 py-1 text-xs font-extrabold text-emerald-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bloco 2.2: Pátio & Silos (Autonomia) */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Pátio de Finos & Silos (Autonomia)</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Estoque Pátio (t)</label>
                <input
                  type="number"
                  value={dadosCE.estoquePatio || ""}
                  onChange={e => setCE("estoquePatio", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nível Silo 1 (%)</label>
                <input
                  type="number"
                  value={dadosCE.nivelSilo1 || ""}
                  onChange={e => setCE("nivelSilo1", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nível Silo 2 (%)</label>
                <input
                  type="number"
                  value={dadosCE.nivelSilo2 || ""}
                  onChange={e => setCE("nivelSilo2", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
                <label className="text-[10px] font-bold text-amber-800 block">Autonomia (Toneladas)</label>
                <span className="text-xs font-extrabold text-amber-900 block mt-1">
                  {dadosCE.autonomiaMinérioToneladas || 0} t
                </span>
              </div>

              <div className="bg-amber-100/80 p-2 rounded-lg border border-amber-300">
                <label className="text-[10px] font-bold text-amber-900 block">Autonomia (Horas)</label>
                <span className="text-sm font-extrabold text-amber-950 block mt-0.5">
                  {dadosCE.autonomiaMinérioHoras || 0} horas
                </span>
              </div>
            </div>
          </div>

          {/* Bloco 2.3: Moagem MI003, MI004, MI005 */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CircleDot className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Moagem de Minério</h3>
              </div>
              <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                Taxa Total: {dadosCE.taxaTotalMoagem || 0} t/h
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Taxa 43MI003 (t/h)</label>
                <input
                  type="number"
                  value={dadosCE.taxaMi003 || ""}
                  onChange={e => setCE("taxaMi003", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Taxa 43MI004 (t/h)</label>
                <input
                  type="number"
                  value={dadosCE.taxaMi004 || ""}
                  onChange={e => setCE("taxaMi004", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Taxa 43MI005 (t/h)</label>
                <input
                  type="number"
                  value={dadosCE.taxaMi005 || ""}
                  onChange={e => setCE("taxaMi005", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">% &lt; 105µm (P80)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dadosCE.granulometria105 || ""}
                  onChange={e => setCE("granulometria105", parseFloat(e.target.value) || "")}
                  placeholder="Meta: > 62%"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-purple-900"
                />
              </div>
            </div>
          </div>

          {/* Bloco 2.4: Flotação de Cobre & Balanço Metalúrgico */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-coral-600" />
                <h3 className="text-sm font-bold text-slate-900">Flotação de Cobre & Reagentes</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Teor Alim Cu (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={dadosCE.teorAlimentacaoCu || ""}
                  onChange={e => setCE("teorAlimentacaoCu", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Teor Conc Cu (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dadosCE.teorConcentradoCu || ""}
                  onChange={e => setCE("teorConcentradoCu", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Teor Rejeito Cu (%)</label>
                <input
                  type="number"
                  step="0.001"
                  value={dadosCE.teorRejeitoCu || ""}
                  onChange={e => setCE("teorRejeitoCu", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <label className="text-[10px] font-bold text-emerald-800 block">Recuperação Metalúrgica</label>
                <span className="text-sm font-extrabold text-emerald-900 block mt-0.5">
                  {dadosCE.recuperacaoMetalurgica || 0}%
                </span>
              </div>
            </div>

            {/* Reagentes */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-800 block mb-2">Consumo Específico de Reagentes (g/t)</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block">Coletor (g/t)</label>
                  <input
                    type="number"
                    value={dadosCE.consumoColetor || ""}
                    onChange={e => setCE("consumoColetor", parseFloat(e.target.value) || "")}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block">Espumante (g/t)</label>
                  <input
                    type="number"
                    value={dadosCE.consumoEspumante || ""}
                    onChange={e => setCE("consumoEspumante", parseFloat(e.target.value) || "")}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block">Dispersante (g/t)</label>
                  <input
                    type="number"
                    value={dadosCE.consumoDispersante || ""}
                    onChange={e => setCE("consumoDispersante", parseFloat(e.target.value) || "")}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block">CMC (g/t)</label>
                  <input
                    type="number"
                    value={dadosCE.consumoCmc || ""}
                    onChange={e => setCE("consumoCmc", parseFloat(e.target.value) || "")}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block">Amidex (g/t)</label>
                  <input
                    type="number"
                    value={dadosCE.consumoAmidex || ""}
                    onChange={e => setCE("consumoAmidex", parseFloat(e.target.value) || "")}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bloco 2.5: Espessadores & Filtro Prensa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Espessamentos */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Filter className="w-4 h-4 text-green-700" />
                <h4 className="text-xs font-bold text-slate-900">Espessamento Concentrado & Rejeito</h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 block">Dens. Underflow Conc (g/L)</label>
                  <input
                    type="number"
                    value={dadosCE.densidadeUnderflowConc || ""}
                    onChange={e => setCE("densidadeUnderflowConc", parseFloat(e.target.value) || "")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Dens. Underflow Rej (g/L)</label>
                  <input
                    type="number"
                    value={dadosCE.densidadeUnderflowRej || ""}
                    onChange={e => setCE("densidadeUnderflowRej", parseFloat(e.target.value) || "")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Torque Rejeito EP001 (%)</label>
                  <input
                    type="number"
                    value={dadosCE.torqueRejEp001 || ""}
                    onChange={e => setCE("torqueRejEp001", parseFloat(e.target.value) || "")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Elevação Rake Conc (mm)</label>
                  <input
                    type="number"
                    value={dadosCE.elevacaoRakeConc || ""}
                    onChange={e => setCE("elevacaoRakeConc", parseFloat(e.target.value) || "")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Filtragem */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Layers className="w-4 h-4 text-pink-700" />
                <h4 className="text-xs font-bold text-slate-900">Filtragem de Concentrado</h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 block">Umidade do Bolo (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={dadosCE.umidadeBolo || ""}
                    onChange={e => setCE("umidadeBolo", parseFloat(e.target.value) || "")}
                    placeholder="Meta: < 9.5%"
                    className="w-full bg-pink-50/60 border border-pink-200 rounded-md p-1 font-bold text-pink-950"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Ciclos Realizados</label>
                  <input
                    type="number"
                    value={dadosCE.ciclosFiltro || ""}
                    onChange={e => setCE("ciclosFiltro", parseFloat(e.target.value) || "")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Produtividade Filtro (t/h)</label>
                  <input
                    type="number"
                    value={dadosCE.produtividadeFiltro || ""}
                    onChange={e => setCE("produtividadeFiltro", parseFloat(e.target.value) || "")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Pressão Compactação (kPa)</label>
                  <input
                    type="number"
                    value={dadosCE.pressaoCompactacao || ""}
                    onChange={e => setCE("pressaoCompactacao", parseFloat(e.target.value) || "")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bloco 2.6: ETA (Estação de Tratamento de Água) */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  ETA — Estação de Tratamento de Água & Balanço Hídrico
                </h3>
              </div>
              <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-md border border-cyan-200">
                Recirculação: {dadosCE.taxaRecirculacaoReuso || 0}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Captação Água Bruta (m³/h)</label>
                <input
                  type="number"
                  value={dadosCE.captacaoAguaBrutaM3h || ""}
                  onChange={e => setCE("captacaoAguaBrutaM3h", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Volume Tratado (m³/dia)</label>
                <input
                  type="number"
                  value={dadosCE.aguaTratadaM3Dia || ""}
                  onChange={e => setCE("aguaTratadaM3Dia", parseFloat(e.target.value) || "")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Taxa de Reuso / Recirculação (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dadosCE.taxaRecirculacaoReuso || ""}
                  onChange={e => setCE("taxaRecirculacaoReuso", parseFloat(e.target.value) || "")}
                  placeholder="Meta: > 85%"
                  className="w-full bg-cyan-50 border border-cyan-300 rounded-lg px-2.5 py-1.5 text-xs font-extrabold text-cyan-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Turbidez Água Tratada (NTU)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dadosCE.turbidezAguaTratadaNtu || ""}
                  onChange={e => setCE("turbidezAguaTratadaNtu", parseFloat(e.target.value) || "")}
                  placeholder="Meta: < 2.0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Status do Balanço Hídrico & Dosagens ETA</label>
              <input
                type="text"
                value={dadosCE.balancoHidricoStatus}
                onChange={e => setCE("balancoHidricoStatus", e.target.value)}
                placeholder="Ex: Operação superavitária com recirculação estável dos espessadores..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
