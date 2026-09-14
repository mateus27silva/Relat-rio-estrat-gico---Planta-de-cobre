/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Target,
  FileText,
  RotateCcw,
  CheckCircle2,
  BarChart3,
  Hammer,
  Droplets,
  Calendar,
  User,
  ShieldCheck,
  Building2,
  Clock,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Clipboard,
  LogOut,
  ArrowRight,
  Smartphone,
  Monitor,
  FileDown,
  Copy,
  Check,
  Loader2
} from "lucide-react";
import {
  RelatorioAdmPayload,
  CircuitoTipo,
  RELATORIO_ADM_SECO_INICIAL,
  RELATORIO_ADM_UMIDO_INICIAL,
  EstrategiaPorHorizonte,
  HorizontePlanejamento,
  calcularSemanaOperacional,
  gerarWppAdm
} from "../typesAdm";
import { SENHA_SUPERVISOR } from "../types";
import { AdmOperationalDataForm } from "./AdmOperationalDataForm";
import { AdmStrategicHorizons } from "./AdmStrategicHorizons";
import { AdmDirectivesManager } from "./AdmDirectivesManager";
import { AdmExecutiveSummaryView } from "./AdmExecutiveSummaryView";
import { gerarRelatorioAdmPDF } from "../utils/pdfGeneratorAdm";

interface AdmModuleProps {
  circuitoTipo: CircuitoTipo; // "seco" | "umido"
  modoWeb?: boolean;
  toggleModoWeb?: () => void;
}

function mesclarComExemplosCompletos(parsed: any, defaultInitial: RelatorioAdmPayload): RelatorioAdmPayload {
  if (!parsed || typeof parsed !== "object") return defaultInitial;

  const dataRef = parsed.dataEmissao || defaultInitial.dataEmissao;
  const semanaAuto = calcularSemanaOperacional(dataRef);
  const periodoRef =
    parsed.periodoReferencia && !parsed.periodoReferencia.includes("Semana 34") && !parsed.periodoReferencia.includes("Semana Operacional 34")
      ? parsed.periodoReferencia
      : semanaAuto;

  const brPadrao = defaultInitial.dadosBritagemRebritagem;
  const brSalvo = parsed.dadosBritagemRebritagem || {};
  
  const histBritagem = (brSalvo.historicoDiarioBritagem && Array.isArray(brSalvo.historicoDiarioBritagem) && brSalvo.historicoDiarioBritagem.length === 7)
    ? brSalvo.historicoDiarioBritagem.map((reg: any, i: number) => {
        const padraoReg: any = brPadrao.historicoDiarioBritagem[i] || {};
        return {
          ...padraoReg,
          ...reg,
          produtividadeTph: reg.produtividadeTph !== "" && reg.produtividadeTph !== undefined ? reg.produtividadeTph : padraoReg.produtividadeTph,
          posicaoManto: reg.posicaoManto !== "" && reg.posicaoManto !== undefined ? reg.posicaoManto : padraoReg.posicaoManto,
          afericaoBritador: reg.afericaoBritador !== "" && reg.afericaoBritador !== undefined ? reg.afericaoBritador : padraoReg.afericaoBritador,
          vazaoOleoBuchaInterna: reg.vazaoOleoBuchaInterna !== "" && reg.vazaoOleoBuchaInterna !== undefined ? reg.vazaoOleoBuchaInterna : padraoReg.vazaoOleoBuchaInterna,
          vazaoOleoBuchaExterna: reg.vazaoOleoBuchaExterna !== "" && reg.vazaoOleoBuchaExterna !== undefined ? reg.vazaoOleoBuchaExterna : padraoReg.vazaoOleoBuchaExterna,
          pressaoOleoLubrificante: reg.pressaoOleoLubrificante !== "" && reg.pressaoOleoLubrificante !== undefined ? reg.pressaoOleoLubrificante : padraoReg.pressaoOleoLubrificante,
          pressaoArAcumulador: reg.pressaoArAcumulador !== "" && reg.pressaoArAcumulador !== undefined ? reg.pressaoArAcumulador : padraoReg.pressaoArAcumulador,
          pressaoArAc1: reg.pressaoArAc1 !== "" && reg.pressaoArAc1 !== undefined ? reg.pressaoArAc1 : padraoReg.pressaoArAc1,
          pressaoArAc2: reg.pressaoArAc2 !== "" && reg.pressaoArAc2 !== undefined ? reg.pressaoArAc2 : padraoReg.pressaoArAc2,
          pressaoAguaResfriamento: reg.pressaoAguaResfriamento !== "" && reg.pressaoAguaResfriamento !== undefined ? reg.pressaoAguaResfriamento : padraoReg.pressaoAguaResfriamento,
          amperagemMotor41TC001: reg.amperagemMotor41TC001 !== "" && reg.amperagemMotor41TC001 !== undefined ? reg.amperagemMotor41TC001 : padraoReg.amperagemMotor41TC001,
          amperagemMotor41BR001: reg.amperagemMotor41BR001 !== "" && reg.amperagemMotor41BR001 !== undefined ? reg.amperagemMotor41BR001 : padraoReg.amperagemMotor41BR001,
          temperaturaOleoRetorno: reg.temperaturaOleoRetorno !== "" && reg.temperaturaOleoRetorno !== undefined ? reg.temperaturaOleoRetorno : padraoReg.temperaturaOleoRetorno,
          temperaturaOleoBuchaExterna: reg.temperaturaOleoBuchaExterna !== "" && reg.temperaturaOleoBuchaExterna !== undefined ? reg.temperaturaOleoBuchaExterna : padraoReg.temperaturaOleoBuchaExterna,
          temperaturaOleoBuchaInterna: reg.temperaturaOleoBuchaInterna !== "" && reg.temperaturaOleoBuchaInterna !== undefined ? reg.temperaturaOleoBuchaInterna : padraoReg.temperaturaOleoBuchaInterna,
          observacao: reg.observacao || padraoReg.observacao
        };
      })
    : brPadrao.historicoDiarioBritagem;

  const histRebritagem = (brSalvo.historicoDiarioRebritagem && Array.isArray(brSalvo.historicoDiarioRebritagem) && brSalvo.historicoDiarioRebritagem.length === 7)
    ? brSalvo.historicoDiarioRebritagem.map((reg: any, i: number) => {
        const padraoReg: any = brPadrao.historicoDiarioRebritagem[i] || {};
        return {
          ...padraoReg,
          ...reg,
          tempOleoLub_BR001: reg.tempOleoLub_BR001 !== "" && reg.tempOleoLub_BR001 !== undefined ? reg.tempOleoLub_BR001 : padraoReg.tempOleoLub_BR001,
          tempOleoLub_BR002: reg.tempOleoLub_BR002 !== "" && reg.tempOleoLub_BR002 !== undefined ? reg.tempOleoLub_BR002 : padraoReg.tempOleoLub_BR002,
          tempOleoLub_BR003: reg.tempOleoLub_BR003 !== "" && reg.tempOleoLub_BR003 !== undefined ? reg.tempOleoLub_BR003 : padraoReg.tempOleoLub_BR003,
          tempOleoLub_BR004: reg.tempOleoLub_BR004 !== "" && reg.tempOleoLub_BR004 !== undefined ? reg.tempOleoLub_BR004 : padraoReg.tempOleoLub_BR004,
          tempOleoLub_BR005: reg.tempOleoLub_BR005 !== "" && reg.tempOleoLub_BR005 !== undefined ? reg.tempOleoLub_BR005 : padraoReg.tempOleoLub_BR005,
          tempOleoLub_BR006: reg.tempOleoLub_BR006 !== "" && reg.tempOleoLub_BR006 !== undefined ? reg.tempOleoLub_BR006 : padraoReg.tempOleoLub_BR006,
          pressaoHydroset_BR003: reg.pressaoHydroset_BR003 !== "" && reg.pressaoHydroset_BR003 !== undefined ? reg.pressaoHydroset_BR003 : padraoReg.pressaoHydroset_BR003,
          pressaoHydroset_BR004: reg.pressaoHydroset_BR004 !== "" && reg.pressaoHydroset_BR004 !== undefined ? reg.pressaoHydroset_BR004 : padraoReg.pressaoHydroset_BR004,
          pressaoHydroset_BR005: reg.pressaoHydroset_BR005 !== "" && reg.pressaoHydroset_BR005 !== undefined ? reg.pressaoHydroset_BR005 : padraoReg.pressaoHydroset_BR005,
          pressaoHydroset_BR006: reg.pressaoHydroset_BR006 !== "" && reg.pressaoHydroset_BR006 !== undefined ? reg.pressaoHydroset_BR006 : padraoReg.pressaoHydroset_BR006,
          potencia_BR001: reg.potencia_BR001 !== "" && reg.potencia_BR001 !== undefined ? reg.potencia_BR001 : padraoReg.potencia_BR001,
          potencia_BR002: reg.potencia_BR002 !== "" && reg.potencia_BR002 !== undefined ? reg.potencia_BR002 : padraoReg.potencia_BR002,
          potencia_BR003: reg.potencia_BR003 !== "" && reg.potencia_BR003 !== undefined ? reg.potencia_BR003 : padraoReg.potencia_BR003,
          potencia_BR004: reg.potencia_BR004 !== "" && reg.potencia_BR004 !== undefined ? reg.potencia_BR004 : padraoReg.potencia_BR004,
          potencia_BR005: reg.potencia_BR005 !== "" && reg.potencia_BR005 !== undefined ? reg.potencia_BR005 : padraoReg.potencia_BR005,
          potencia_BR006: reg.potencia_BR006 !== "" && reg.potencia_BR006 !== undefined ? reg.potencia_BR006 : padraoReg.potencia_BR006,
          freqAlimentador_BR001: reg.freqAlimentador_BR001 !== "" && reg.freqAlimentador_BR001 !== undefined ? reg.freqAlimentador_BR001 : padraoReg.freqAlimentador_BR001,
          freqAlimentador_BR002: reg.freqAlimentador_BR002 !== "" && reg.freqAlimentador_BR002 !== undefined ? reg.freqAlimentador_BR002 : padraoReg.freqAlimentador_BR002,
          freqAlimentador_BR003: reg.freqAlimentador_BR003 !== "" && reg.freqAlimentador_BR003 !== undefined ? reg.freqAlimentador_BR003 : padraoReg.freqAlimentador_BR003,
          freqAlimentador_BR004: reg.freqAlimentador_BR004 !== "" && reg.freqAlimentador_BR004 !== undefined ? reg.freqAlimentador_BR004 : padraoReg.freqAlimentador_BR004,
          freqAlimentador_BR005: reg.freqAlimentador_BR005 !== "" && reg.freqAlimentador_BR005 !== undefined ? reg.freqAlimentador_BR005 : padraoReg.freqAlimentador_BR005,
          freqAlimentador_BR006: reg.freqAlimentador_BR006 !== "" && reg.freqAlimentador_BR006 !== undefined ? reg.freqAlimentador_BR006 : padraoReg.freqAlimentador_BR006,
          difTemp_BR001: reg.difTemp_BR001 !== "" && reg.difTemp_BR001 !== undefined ? reg.difTemp_BR001 : padraoReg.difTemp_BR001,
          difTemp_BR002: reg.difTemp_BR002 !== "" && reg.difTemp_BR002 !== undefined ? reg.difTemp_BR002 : padraoReg.difTemp_BR002,
          pressaoContraeixo_BR001: reg.pressaoContraeixo_BR001 !== "" && reg.pressaoContraeixo_BR001 !== undefined ? reg.pressaoContraeixo_BR001 : padraoReg.pressaoContraeixo_BR001,
          pressaoContraeixo_BR002: reg.pressaoContraeixo_BR002 !== "" && reg.pressaoContraeixo_BR002 !== undefined ? reg.pressaoContraeixo_BR002 : padraoReg.pressaoContraeixo_BR002,
          difPressao_BR001: reg.difPressao_BR001 !== "" && reg.difPressao_BR001 !== undefined ? reg.difPressao_BR001 : padraoReg.difPressao_BR001,
          difPressao_BR002: reg.difPressao_BR002 !== "" && reg.difPressao_BR002 !== undefined ? reg.difPressao_BR002 : padraoReg.difPressao_BR002,
          retidoMeiaPol: reg.retidoMeiaPol !== "" && reg.retidoMeiaPol !== undefined ? reg.retidoMeiaPol : padraoReg.retidoMeiaPol,
          produtividadeTph: reg.produtividadeTph !== "" && reg.produtividadeTph !== undefined ? reg.produtividadeTph : padraoReg.produtividadeTph,
          observacao: reg.observacao || padraoReg.observacao
        };
      })
    : brPadrao.historicoDiarioRebritagem;

  const dadosBritagemRebritagem = {
    ...brPadrao,
    ...brSalvo,
    posicaoManto: brSalvo.posicaoManto || brPadrao.posicaoManto,
    afericaoBritador: brSalvo.afericaoBritador || brPadrao.afericaoBritador,
    vazaoOleoBuchaInterna: brSalvo.vazaoOleoBuchaInterna || brPadrao.vazaoOleoBuchaInterna,
    vazaoOleoBuchaExterna: brSalvo.vazaoOleoBuchaExterna || brPadrao.vazaoOleoBuchaExterna,
    pressaoOleoLubrificante: brSalvo.pressaoOleoLubrificante || brPadrao.pressaoOleoLubrificante,
    pressaoArAcumulador: brSalvo.pressaoArAcumulador || brPadrao.pressaoArAcumulador,
    pressaoArAc1: brSalvo.pressaoArAc1 || brPadrao.pressaoArAc1,
    pressaoArAc2: brSalvo.pressaoArAc2 || brPadrao.pressaoArAc2,
    pressaoAguaResfriamento: brSalvo.pressaoAguaResfriamento || brPadrao.pressaoAguaResfriamento,
    amperagemMotor41TC001: brSalvo.amperagemMotor41TC001 || brPadrao.amperagemMotor41TC001,
    amperagemMotor41BR001: brSalvo.amperagemMotor41BR001 || brPadrao.amperagemMotor41BR001,
    temperaturaOleoRetorno: brSalvo.temperaturaOleoRetorno || brPadrao.temperaturaOleoRetorno,
    temperaturaOleoBuchaExterna: brSalvo.temperaturaOleoBuchaExterna || brPadrao.temperaturaOleoBuchaExterna,
    temperaturaOleoBuchaInterna: brSalvo.temperaturaOleoBuchaInterna || brPadrao.temperaturaOleoBuchaInterna,
    historicoDiarioBritagem: histBritagem,
    historicoDiarioRebritagem: histRebritagem,
    anotacoesDesvios: brSalvo.anotacoesDesvios && Object.keys(brSalvo.anotacoesDesvios).length > 0
      ? brSalvo.anotacoesDesvios
      : brPadrao.anotacoesDesvios
  };

  const cePadrao = defaultInitial.dadosConcentradorEta;
  const ceSalvo = parsed.dadosConcentradorEta || {};
  const dadosConcentradorEta = {
    ...cePadrao,
    ...ceSalvo,
    potenciaMi005: ceSalvo.potenciaMi005 || cePadrao.potenciaMi005,
    solidosOverflowMi005: ceSalvo.solidosOverflowMi005 || cePadrao.solidosOverflowMi005,
    solidosDescargaMi005: ceSalvo.solidosDescargaMi005 || cePadrao.solidosDescargaMi005,
    reposicoesMi003: ceSalvo.reposicoesMi003 || cePadrao.reposicoesMi003,
    reposicoesMi004: ceSalvo.reposicoesMi004 || cePadrao.reposicoesMi004,
    reposicoesMi005: ceSalvo.reposicoesMi005 || cePadrao.reposicoesMi005,
    hidrociclonesBh005: ceSalvo.hidrociclonesBh005 || cePadrao.hidrociclonesBh005,
    densidadeMi005: ceSalvo.densidadeMi005 || cePadrao.densidadeMi005,
    pressaoPsiMi004: ceSalvo.pressaoPsiMi004 || cePadrao.pressaoPsiMi004,
    pressaoPsiMi005: ceSalvo.pressaoPsiMi005 || cePadrao.pressaoPsiMi005,
    anotacoesDesviosMoagem: ceSalvo.anotacoesDesviosMoagem && Object.keys(ceSalvo.anotacoesDesviosMoagem).length > 0
      ? ceSalvo.anotacoesDesviosMoagem
      : cePadrao.anotacoesDesviosMoagem,
    anotacoesDesviosFlotacao: ceSalvo.anotacoesDesviosFlotacao && Object.keys(ceSalvo.anotacoesDesviosFlotacao).length > 0
      ? ceSalvo.anotacoesDesviosFlotacao
      : cePadrao.anotacoesDesviosFlotacao
  };

  const diretrizesTurno = (parsed.diretrizesTurno && Array.isArray(parsed.diretrizesTurno) && parsed.diretrizesTurno.length >= 4)
    ? parsed.diretrizesTurno
    : defaultInitial.diretrizesTurno;

  return {
    ...defaultInitial,
    ...parsed,
    periodoReferencia: periodoRef,
    circuitoTipo: defaultInitial.circuitoTipo,
    dadosBritagemRebritagem,
    dadosConcentradorEta,
    diretrizesTurno
  };
}

export const AdmModule: React.FC<AdmModuleProps> = ({ circuitoTipo, modoWeb = true, toggleModoWeb }) => {
  const isSeco = circuitoTipo === "seco";
  const storageKey = isSeco ? "relatorio_adm_seco_draft_v2" : "relatorio_adm_umido_draft_v2";
  const authSessionKey = isSeco ? "adm_seco_auth_session" : "adm_umido_auth_session";
  const defaultInitial = isSeco ? RELATORIO_ADM_SECO_INICIAL : RELATORIO_ADM_UMIDO_INICIAL;

  const [autenticado, setAutenticado] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(authSessionKey) === "true";
    } catch {
      return false;
    }
  });

  const [senha, setSenha] = useState<string>("");
  const [showSenha, setShowSenha] = useState<boolean>(false);
  const [senhaErro, setSenhaErro] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<"operacional" | "horizontes" | "diretrizes" | "visualizacao">("operacional");
  const [baixandoPdf, setBaixandoPdf] = useState<boolean>(false);
  const [copiadoWpp, setCopiadoWpp] = useState<boolean>(false);
  
  const [payload, setPayload] = useState<RelatorioAdmPayload>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return mesclarComExemplosCompletos(parsed, defaultInitial);
      }
    } catch (e) {
      console.error(`Erro ao carregar rascunho ADM ${circuitoTipo}`, e);
    }
    return defaultInitial;
  });

  const [savedToast, setSavedToast] = useState<boolean>(false);

  // Manipulador para atualização automática do Período de Referência / Semana Operacional
  const handleDataEmissaoChange = (novaData: string) => {
    const semanaCalculada = calcularSemanaOperacional(novaData);
    setPayload(p => ({
      ...p,
      dataEmissao: novaData,
      periodoReferencia: semanaCalculada || p.periodoReferencia
    }));
  };

  // Recarrega se o circuito mudar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPayload(mesclarComExemplosCompletos(parsed, defaultInitial));
      } else {
        setPayload(defaultInitial);
      }
    } catch (e) {
      setPayload(defaultInitial);
    }

    try {
      setAutenticado(sessionStorage.getItem(authSessionKey) === "true");
    } catch {
      setAutenticado(false);
    }
    setSenha("");
    setSenhaErro(false);
  }, [circuitoTipo, storageKey, authSessionKey]);

  // Auto-save no LocalStorage
  useEffect(() => {
    if (!autenticado) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
      setSavedToast(true);
      const t = setTimeout(() => setSavedToast(false), 1800);
      return () => clearTimeout(t);
    } catch (e) {
      console.error(`Erro ao salvar rascunho ADM ${circuitoTipo}`, e);
    }
  }, [payload, storageKey, circuitoTipo, autenticado]);

  function entrar() {
    if (senha === SENHA_SUPERVISOR) {
      setSenhaErro(false);
      setAutenticado(true);
      try {
        sessionStorage.setItem(authSessionKey, "true");
      } catch (e) {
        console.error(e);
      }
    } else {
      setSenhaErro(true);
      setSenha("");
    }
  }

  function sair() {
    setAutenticado(false);
    setSenha("");
    setSenhaErro(false);
    try {
      sessionStorage.removeItem(authSessionKey);
      sessionStorage.removeItem("adm_seco_auth_session");
      sessionStorage.removeItem("adm_umido_auth_session");
    } catch (e) {
      console.error("Erro ao encerrar sessão:", e);
    }
  }

  const handleUpdateHorizonte = (tipo: HorizontePlanejamento, data: EstrategiaPorHorizonte) => {
    setPayload(prev => ({
      ...prev,
      [tipo === "dia"
        ? "estrategiaDia"
        : tipo === "semana"
        ? "estrategiaSemana"
        : tipo === "fim_de_semana"
        ? "estrategiaFds"
        : tipo === "parada"
        ? "estrategiaParada"
        : "estrategiaMes"]: data
    }));
  };

  const handleBaixarPdf = async () => {
    try {
      setBaixandoPdf(true);
      await new Promise(r => setTimeout(r, 400));
      gerarRelatorioAdmPDF(payload);
    } catch (e) {
      console.error("Erro ao gerar PDF ADM", e);
    } finally {
      setBaixandoPdf(false);
    }
  };

  const handleCopiarWpp = async () => {
    try {
      const textoWpp = gerarWppAdm(payload);
      await navigator.clipboard.writeText(textoWpp);
      setCopiadoWpp(true);
      setTimeout(() => setCopiadoWpp(false), 2500);
    } catch (err) {
      console.error("Falha ao copiar WhatsApp", err);
    }
  };

  const handleReset = () => {
    setPayload(defaultInitial);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.error(e);
    }
  };

  if (!autenticado) {
    return (
      <div
        className={`w-full bg-white transition-all duration-300 flex flex-col justify-between border-0 sm:border border-slate-200 relative overflow-hidden mx-auto ${
          modoWeb
            ? "max-w-6xl sm:rounded-3xl shadow-xl sm:my-2 min-h-[880px]"
            : "w-full max-w-lg sm:max-w-[500px] sm:rounded-3xl shadow-xl min-h-screen sm:min-h-[850px] sm:my-2"
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key="login-adm"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col justify-between h-full flex-1"
          >
            <div>
              {/* Header Banner Ero Brasil */}
              <div className="bg-[#0A2028] p-6 sm:p-8 pt-8 sm:pt-10 rounded-b-[2rem] shadow-lg border-b-4 border-[#007369] text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-white/10 text-teal-200 border border-white/10 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5">
                      {isSeco ? <Hammer className="w-3 h-3 text-[#14B8A6]" /> : <Droplets className="w-3 h-3 text-[#14B8A6]" />}
                      <span>ERO BRASIL • {isSeco ? "SUPERVISÃO CIRCUITO SECO (COMINUIÇÃO)" : "SUPERVISÃO CIRCUITO ÚMIDO (BENEFICIAMENTO)"}</span>
                    </span>
                  </div>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  {isSeco ? "Relatório Estratégico: Circuito de Cominuição" : "Relatório Estratégico: Beneficiamento & Concentrador"}
                </h1>
                <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                  {isSeco
                    ? "Gestão tática e diretrizes de turno para Britagem Primária, Rebritagem, Pátios de ROM, Silos e Estoques Pulmão."
                    : "Gestão tática e diretrizes de turno para Moagem (MI003/004/005), Flotação Cu, Espessadores, Filtragem & Desaguamento e ETA."}
                </p>
              </div>

              {/* Form Fields Container */}
              <div className="p-4 space-y-4">
                {/* Card de Identificação */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-1">
                    <Clipboard className="h-4 w-4 text-teal-600" />
                    <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      Identificação da Emissão Estratégica
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-600 block font-medium">Data de Emissão</label>
                      <input
                        type="date"
                        value={payload.dataEmissao}
                        onChange={e => handleDataEmissaoChange(e.target.value)}
                        className="w-full bg-white border border-slate-250 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-sm text-slate-800 font-medium outline-none transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-600 block font-medium">
                          Período de Referência (Semana Operacional)
                        </label>
                        <span className="text-[10px] text-teal-600 font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Automático
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Ex: Semana Operacional 35 — Agosto/2026"
                          value={payload.periodoReferencia}
                          onChange={e => setPayload(p => ({ ...p, periodoReferencia: e.target.value }))}
                          className="w-full bg-white border border-slate-250 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-3 pr-8 py-2.5 text-sm text-slate-800 placeholder-slate-400 font-medium outline-none transition"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const sem = calcularSemanaOperacional(payload.dataEmissao);
                            if (sem) setPayload(p => ({ ...p, periodoReferencia: sem }));
                          }}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-teal-600 transition cursor-pointer"
                          title="Recalcular Semana Operacional pelo calendário do ano"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-600 block font-medium">
                        Supervisor ADM ({isSeco ? "Circuito Seco" : "Circuito Úmido"})
                      </label>
                      <input
                        type="text"
                        placeholder={isSeco ? "Nome do Supervisor..." : "Nome do Supervisor..."}
                        value={payload.supervisorAdmResponsavel}
                        onChange={e => setPayload(p => ({ ...p, supervisorAdmResponsavel: e.target.value }))}
                        className="w-full bg-white border border-slate-250 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 font-medium outline-none transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-600 block font-medium">Engenharia Responsável</label>
                      <input
                        type="text"
                        placeholder={isSeco ? "Engenharia de Cominuição & Britagem" : "Engenharia de Processo & Moagem"}
                        value={payload.engenheiroProcesso || ""}
                        onChange={e => setPayload(p => ({ ...p, engenheiroProcesso: e.target.value }))}
                        className="w-full bg-white border border-slate-250 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 font-medium outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Password / Login Card */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-3">
                    <Lock className="h-4 w-4 text-teal-600" />
                    <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      Login Supervisor ADM ({isSeco ? "Circuito Seco" : "Circuito Úmido"})
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showSenha ? "text" : "password"}
                        placeholder="Senha do Supervisor..."
                        value={senha}
                        onChange={e => {
                          setSenha(e.target.value);
                          setSenhaErro(false);
                        }}
                        onKeyDown={e => e.key === "Enter" && entrar()}
                        className={`w-full bg-white border focus:ring-1 focus:ring-emerald-500 rounded-xl pl-3 pr-10 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition font-medium ${
                          senhaErro ? "border-red-500" : "border-slate-250 focus:border-emerald-500"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSenha(!showSenha)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      >
                        {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={entrar}
                      disabled={!payload.dataEmissao || !payload.supervisorAdmResponsavel?.trim() || !senha}
                      className={`px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition flex items-center gap-1.5 ${
                        !payload.dataEmissao || !payload.supervisorAdmResponsavel?.trim() || !senha
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-[#007369] hover:bg-[#005F56] text-white shadow-md cursor-pointer"
                      }`}
                    >
                      <span>Acessar</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  {senhaErro && (
                    <p className="text-xs text-red-500 mt-2.5 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Senha operativa de supervisor incorreta ou inválida.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Little bottom hint footer */}
            <div className="text-center p-4 text-[11px] text-slate-400 font-mono tracking-wider border-t border-slate-100 bg-slate-50/50 mt-auto">
              ERO BRASIL STRATEGIC SUITE — GESTÃO &amp; DIRETRIZES ATIVAS
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl pb-10 space-y-6 mx-auto">
      <AnimatePresence mode="wait">
        {/* PAINEL PRINCIPAL DE PREENCHIMENTO DO RELATÓRIO ESTRATÉGICO */}
        <motion.div
          key="dashboard-adm"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
            {/* Header Corporativo do Módulo Estratégico - Ero Brasil */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs border-l-4 border-l-[#007369]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#0A2028] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      {isSeco ? <Hammer className="w-3.5 h-3.5 text-[#14B8A6]" /> : <Droplets className="w-3.5 h-3.5 text-[#14B8A6]" />}
                      <span className="text-[#14B8A6]">ERO BRASIL</span> • {isSeco ? "SUPERVISÃO CIRCUITO SECO (COMINUIÇÃO)" : "SUPERVISÃO CIRCUITO ÚMIDO (BENEFICIAMENTO)"}
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
                    {isSeco
                      ? "Relatório Estratégico: Circuito de Cominuição"
                      : "Relatório Estratégico: Beneficiamento & Concentrador"}
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isSeco
                      ? "Gestão tática e diretrizes de turno para Britagem Primária, Rebritagem, Pátios de ROM, Silos e Estoques Pulmão."
                      : "Gestão tática e diretrizes de turno para Moagem (MI003/004/005), Flotação Cu, Espessadores, Filtragem & Desaguamento e ETA."}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {savedToast && (
                    <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 flex items-center gap-1 animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Salvo automaticamente
                    </span>
                  )}

                  <button
                    onClick={sair}
                    className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 p-2 rounded-lg transition flex items-center gap-1.5 font-bold cursor-pointer"
                    title="Sair / Bloquear Sessão"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Bloquear / Sair</span>
                  </button>
                </div>
              </div>

              {/* Metadados de Cabeçalho do Supervisor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 mt-5">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Data de Emissão
                  </label>
                  <input
                    type="date"
                    value={payload.dataEmissao}
                    onChange={e => handleDataEmissaoChange(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-[#007369] focus:border-[#007369]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase text-slate-500 block">
                      Período de Referência
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const sem = calcularSemanaOperacional(payload.dataEmissao);
                        if (sem) setPayload(p => ({ ...p, periodoReferencia: sem }));
                      }}
                      className="text-[10px] text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-0.5 cursor-pointer"
                      title="Sincronizar com a semana do calendário do ano"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      Auto
                    </button>
                  </div>
                  <input
                    type="text"
                    value={payload.periodoReferencia}
                    onChange={e => setPayload(p => ({ ...p, periodoReferencia: e.target.value }))}
                    placeholder="Ex: Semana Operacional 35 — Agosto/2026"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-[#007369] focus:border-[#007369]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Supervisor ADM ({isSeco ? "Circuito Seco" : "Circuito Úmido"})
                  </label>
                  <input
                    type="text"
                    value={payload.supervisorAdmResponsavel}
                    onChange={e => setPayload(p => ({ ...p, supervisorAdmResponsavel: e.target.value }))}
                    placeholder={isSeco ? "Ex: Sup. Marcos Valério (Cominuição)" : "Ex: Sup. Fernando Alves (Concentrador)"}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-[#007369] focus:border-[#007369]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Engenharia Responsável
                  </label>
                  <input
                    type="text"
                    value={payload.engenheiroProcesso || ""}
                    onChange={e => setPayload(p => ({ ...p, engenheiroProcesso: e.target.value }))}
                    placeholder={isSeco ? "Ex: Engª. Patrícia Mendes (Britagem)" : "Ex: Eng. Rafael Costa (Metalurgia)"}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-[#007369] focus:border-[#007369]"
                  />
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs">
              <button
                onClick={() => setActiveTab("operacional")}
                className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === "operacional"
                    ? "bg-[#0A2028] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {isSeco ? <Hammer className="w-4 h-4 text-[#14B8A6]" /> : <Droplets className="w-4 h-4 text-[#14B8A6]" />}
                <span>1. Dados Operacionais ({isSeco ? "Britagem & Rebritagem" : "Moagem, Flotação & ETA"})</span>
              </button>

              <button
                onClick={() => setActiveTab("horizontes")}
                className={`flex-1 min-w-[190px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === "horizontes"
                    ? "bg-[#0A2028] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Target className="w-4 h-4 text-[#14B8A6]" />
                <span>2. Horizontes (Semana / FDS / Parada / Mês)</span>
              </button>

              <button
                onClick={() => setActiveTab("diretrizes")}
                className={`flex-1 min-w-[190px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === "diretrizes"
                    ? "bg-[#0A2028] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <FileText className="w-4 h-4 text-[#14B8A6]" />
                <span>3. Diretrizes de Turno & Prazos</span>
              </button>

              <button
                onClick={() => setActiveTab("visualizacao")}
                className={`flex-1 min-w-[190px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === "visualizacao"
                    ? "bg-[#0A2028] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Eye className="w-4 h-4 text-[#14B8A6]" />
                <span>4. Pré-visualização do Relatório</span>
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === "operacional" && (
              <AdmOperationalDataForm
                circuitoTipo={circuitoTipo}
                dadosBR={payload.dadosBritagemRebritagem}
                dadosCE={payload.dadosConcentradorEta}
                diretrizes={payload.diretrizesTurno}
                onChangeBR={dados => setPayload(prev => ({ ...prev, dadosBritagemRebritagem: dados }))}
                onChangeCE={dados => setPayload(prev => ({ ...prev, dadosConcentradorEta: dados }))}
                onChangeDiretrizes={dirs => setPayload(prev => ({ ...prev, diretrizesTurno: dirs }))}
              />
            )}

            {activeTab === "horizontes" && (
              <AdmStrategicHorizons
                circuitoTipo={circuitoTipo}
                estrategiaDia={payload.estrategiaDia}
                estrategiaSemana={payload.estrategiaSemana}
                estrategiaFds={payload.estrategiaFds}
                estrategiaParada={payload.estrategiaParada}
                estrategiaMes={payload.estrategiaMes}
                onUpdateHorizonte={handleUpdateHorizonte}
              />
            )}

            {activeTab === "diretrizes" && (
              <AdmDirectivesManager
                circuitoTipo={circuitoTipo}
                diretrizes={payload.diretrizesTurno}
                onChange={diretrizes => setPayload(prev => ({ ...prev, diretrizesTurno: diretrizes }))}
              />
            )}

            {activeTab === "visualizacao" && (
              <AdmExecutiveSummaryView
                payload={payload}
                onPayloadChange={setPayload}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };
