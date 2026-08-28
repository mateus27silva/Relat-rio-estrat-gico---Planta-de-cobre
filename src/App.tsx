/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sun,
  Moon,
  Hammer,
  Columns,
  Warehouse,
  CircleDot,
  Droplets,
  Filter,
  FilterX,
  Layers,
  Lock,
  X,
  Plus,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  RotateCcw,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Clipboard,
  CheckSquare,
  MessageSquare,
  ChevronDown,
  Monitor,
  Smartphone,
  FileDown,
  Loader2,
  RotateCw,
  Wrench
} from "lucide-react";

import {
  SETORES,
  TURNOS,
  TURMAS,
  COR,
  st,
  ST,
  fmtData,
  gerarWpp,
  SENHA_SUPERVISOR,
  OcorrenciaPerdaSeguranca,
  EXEMPLO_OCORRENCIA
} from "./types";
import { gerarRelatorioPDF } from "./utils/pdfGenerator";
import { AdmModule } from "./components/AdmModule";
import { Building2, Calendar } from "lucide-react";

// Dynamic Icon rendering helper matching our Lucide imports
const IconComponent = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case "Sun": return <Sun className={className} />;
    case "Moon": return <Moon className={className} />;
    case "Hammer": return <Hammer className={className} />;
    case "Columns": return <Columns className={className} />;
    case "Warehouse": return <Warehouse className={className} />;
    case "CircleDot": return <CircleDot className={className} />;
    case "RotateCw": return <RotateCw className={className} />;
    case "Droplets": return <Droplets className={className} />;
    case "Filter": return <Filter className={className} />;
    case "FilterX": return <FilterX className={className} />;
    case "Layers": return <Layers className={className} />;
    case "Wrench": return <Wrench className={className} />;
    default: return <Hammer className={className} />;
  }
};

const LRAFT_KEY = "relatorio_turno_draft";

export default function App() {
  const [moduloAtivo, setModuloAtivo] = useState<"seco" | "umido" | "turno">("seco");
  const [tela, setTela] = useState<"inicio" | "form" | "finalizar" | "relatorio">("inicio");
  const [turno, setTurno] = useState<"diurno" | "noturno" | null>(null);
  const [turma, setTurma] = useState<string | null>(null);
  const [data, setData] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [sup, setSup] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [senhaErro, setSenhaErro] = useState<boolean>(false);
  const [showSenha, setShowSenha] = useState<boolean>(false);
  const [idx, setIdx] = useState<number>(0);
  const [temaDds, setTemaDds] = useState<string>("");
  const [dados, setDados] = useState<Record<string, Record<string, any>>>({});
  const [acoes, setAcoes] = useState<string[]>([""]);
  const [obs, setObs] = useState<string>("");
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaPerdaSeguranca[]>([]);
  const [copiado, setCopiado] = useState<boolean>(false);
  const [baixandoPdf, setBaixandoPdf] = useState<boolean>(false);
  const [wpp, setWpp] = useState<string>("");
  const [modoWeb, setModoWeb] = useState<boolean>(() => {
    try {
      return localStorage.getItem("relatorio_view_mode") === "web";
    } catch {
      return false;
    }
  });

  const toggleModoWeb = () => {
    setModoWeb(prev => {
      const next = !prev;
      try {
        localStorage.setItem("relatorio_view_mode", next ? "web" : "mobile");
      } catch {}
      return next;
    });
  };

  // Restore autosaved draft if exists
  useEffect(() => {
    const saved = localStorage.getItem(LRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.data) setData(parsed.data);
        if (parsed.turno) setTurno(parsed.turno);
        if (parsed.turma) setTurma(parsed.turma);
        if (parsed.sup) setSup(parsed.sup);
        if (parsed.temaDds) setTemaDds(parsed.temaDds);
        if (parsed.dados) setDados(parsed.dados);
        if (parsed.acoes) setAcoes(parsed.acoes);
        if (parsed.obs) setObs(parsed.obs);
        if (parsed.ocorrencias) setOcorrencias(parsed.ocorrencias);
      } catch (e) {
        console.error("Erro ao ler rascunho salvo", e);
      }
    }
  }, []);

  // Sync draft to LocalStorage whenever things change
  useEffect(() => {
    if (tela !== "inicio") {
      localStorage.setItem(
        LRAFT_KEY,
        JSON.stringify({ data, turno, turma, sup, temaDds, dados, acoes, obs, ocorrencias })
      );
    }
  }, [data, turno, turma, sup, temaDds, dados, acoes, obs, ocorrencias, tela]);

  const setor = SETORES[idx];
  const c = COR[setor?.cor || "teal"];
  const d = dados[setor?.id] || {};

  const calcDisp = (pmStr: any): string => {
    const pm = pmStr !== "" && pmStr !== undefined && pmStr !== null ? parseFloat(pmStr) : 0;
    const horasPM = isNaN(pm) ? 0 : (pm > 12 ? pm / 60 : pm);
    const disp = Math.max(0, Math.min(100, ((12 - horasPM) / 12) * 100));
    return (Math.round(disp * 10) / 10).toString();
  };

  const calcUtil = (pmStr: any, pOutStr: any): string => {
    const pm = pmStr !== "" && pmStr !== undefined && pmStr !== null ? parseFloat(pmStr) : 0;
    const pOut = pOutStr !== "" && pOutStr !== undefined && pOutStr !== null ? parseFloat(pOutStr) : 0;
    const horasPM = isNaN(pm) ? 0 : (pm > 12 ? pm / 60 : pm);
    const horasOut = isNaN(pOut) ? 0 : (pOut > 12 ? pOut / 60 : pOut);
    const operadas = Math.max(0, 12 - horasPM - horasOut);
    const util = Math.max(0, Math.min(100, (operadas / 12) * 100));
    return (Math.round(util * 10) / 10).toString();
  };

  const calcAutonomia = (estoquePatioStr: any, silo1Str: any, silo2Str: any): string => {
    const est = estoquePatioStr !== "" && estoquePatioStr !== undefined && estoquePatioStr !== null ? parseFloat(estoquePatioStr) : 0;
    const s1 = silo1Str !== "" && silo1Str !== undefined && silo1Str !== null ? parseFloat(silo1Str) : null;
    const s2 = silo2Str !== "" && silo2Str !== undefined && silo2Str !== null ? parseFloat(silo2Str) : null;

    let mediaSilos = 0;
    if (s1 !== null && s2 !== null) {
      mediaSilos = (s1 + s2) / 2;
    } else if (s1 !== null) {
      mediaSilos = s1;
    } else if (s2 !== null) {
      mediaSilos = s2;
    }

    const fracSilos = mediaSilos > 1 ? mediaSilos / 100 : mediaSilos;
    const total = (isNaN(est) ? 0 : est) + (fracSilos * 4800);
    return (Math.round(total * 10) / 10).toString();
  };

  const calcProdTotal = (mi3Str: any, mi4Str: any, mi5Str: any): string => {
    const p3 = mi3Str !== "" && mi3Str !== undefined && mi3Str !== null ? parseFloat(mi3Str) : 0;
    const p4 = mi4Str !== "" && mi4Str !== undefined && mi4Str !== null ? parseFloat(mi4Str) : 0;
    const p5 = mi5Str !== "" && mi5Str !== undefined && mi5Str !== null ? parseFloat(mi5Str) : 0;
    const total = (isNaN(p3) ? 0 : p3) + (isNaN(p4) ? 0 : p4) + (isNaN(p5) ? 0 : p5);
    return (Math.round(total * 10) / 10).toString();
  };

  const calcRecuperacao = (alimStr: any, concStr: any, rejStr: any): string => {
    const f = alimStr !== "" && alimStr !== undefined && alimStr !== null ? parseFloat(alimStr) : null;
    const c = concStr !== "" && concStr !== undefined && concStr !== null ? parseFloat(concStr) : null;
    const t = rejStr !== "" && rejStr !== undefined && rejStr !== null ? parseFloat(rejStr) : null;

    if (f === null || c === null || t === null || isNaN(f) || isNaN(c) || isNaN(t)) return "";
    if (f <= 0 || c <= 0 || c <= t || f <= t) return "";

    const num = c * (f - t);
    const den = f * (c - t);
    if (den <= 0) return "";

    const rec = (num / den) * 100;
    const clamped = Math.max(0, Math.min(100, rec));
    return (Math.round(clamped * 10) / 10).toString();
  };

  const calcMetal = (prodMoagemStr: any, teorAlimStr: any, recStr: any): string => {
    const prod = prodMoagemStr !== "" && prodMoagemStr !== undefined && prodMoagemStr !== null ? parseFloat(prodMoagemStr) : 0;
    const taf = teorAlimStr !== "" && teorAlimStr !== undefined && teorAlimStr !== null ? parseFloat(teorAlimStr) : 0;
    const rec = recStr !== "" && recStr !== undefined && recStr !== null ? parseFloat(recStr) : 0;

    if (!prod || !taf || !rec) return "0";
    const metal = (prod * taf * rec) / 10000;
    return (Math.round(metal * 100) / 100).toString();
  };

  const calcConcentrado = (metalStr: any, teorConcStr: any): string => {
    const metal = metalStr !== "" && metalStr !== undefined && metalStr !== null ? parseFloat(metalStr) : 0;
    const tcf = teorConcStr !== "" && teorConcStr !== undefined && teorConcStr !== null ? parseFloat(teorConcStr) : 0;

    if (!metal || !tcf) return "0";
    const conc = metal / (tcf / 100);
    return (Math.round(conc * 10) / 10).toString();
  };

  const calcEstoqueTotal = (msbStr: any, surubimStr: any, vermStr: any, sucuStr: any): string => {
    const msb = msbStr !== "" && msbStr !== undefined && msbStr !== null ? parseFloat(msbStr) : null;
    const sur = surubimStr !== "" && surubimStr !== undefined && surubimStr !== null ? parseFloat(surubimStr) : null;
    const verm = vermStr !== "" && vermStr !== undefined && vermStr !== null ? parseFloat(vermStr) : null;
    const sucu = sucuStr !== "" && sucuStr !== undefined && sucuStr !== null ? parseFloat(sucuStr) : null;

    if (msb === null && sur === null && verm === null && sucu === null) return "";
    const total = (isNaN(msb as any) || msb === null ? 0 : msb) +
      (isNaN(sur as any) || sur === null ? 0 : sur) +
      (isNaN(verm as any) || verm === null ? 0 : verm) +
      (isNaN(sucu as any) || sucu === null ? 0 : sucu);
    return (Math.round(total * 10) / 10).toString();
  };

  const calcProducaoTotalRebritagem = (bypassStr: any, patioStr: any): string => {
    const byp = bypassStr !== "" && bypassStr !== undefined && bypassStr !== null ? parseFloat(bypassStr) : null;
    const pat = patioStr !== "" && patioStr !== undefined && patioStr !== null ? parseFloat(patioStr) : null;

    if (byp === null && pat === null) return "";
    const total = (isNaN(byp as any) || byp === null ? 0 : byp) +
      (isNaN(pat as any) || pat === null ? 0 : pat);
    return (Math.round(total * 10) / 10).toString();
  };

  const calcProducaoFiltro = (pmStr: any, pOutStr: any, prodStr: any): string => {
    const pm = pmStr !== "" && pmStr !== undefined && pmStr !== null ? parseFloat(pmStr) : 0;
    const pOut = pOutStr !== "" && pOutStr !== undefined && pOutStr !== null ? parseFloat(pOutStr) : 0;
    const prod = prodStr !== "" && prodStr !== undefined && prodStr !== null ? parseFloat(prodStr) : null;

    const horasPM = isNaN(pm) ? 0 : (pm > 12 ? pm / 60 : pm);
    const horasOut = isNaN(pOut) ? 0 : (pOut > 12 ? pOut / 60 : pOut);
    const horasOperadas = Math.max(0, 12 - horasPM - horasOut);
    const produtividade = (prod === null || isNaN(prod)) ? 30 : prod;
    if (produtividade <= 0) return "";
    const total = horasOperadas * produtividade;
    return (Math.round(total * 10) / 10).toString();
  };

  const setDado = (sId: string, campoId: string, v: any) => {
    setDados(p => {
      const currentSector = { ...(p[sId] || {}) };
      currentSector[campoId] = v;
      const updatedAll = { ...p, [sId]: currentSector };

      // Cálculo automático de Estoque Total na Britagem Primária
      if (sId === "britagem_primaria" && (campoId === "estoque_msb" || campoId === "estoque_surubim" || campoId === "estoque_vermelhos" || campoId === "estoque_sucuarana")) {
        const msb = campoId === "estoque_msb" ? v : currentSector["estoque_msb"];
        const sur = campoId === "estoque_surubim" ? v : currentSector["estoque_surubim"];
        const verm = campoId === "estoque_vermelhos" ? v : currentSector["estoque_vermelhos"];
        const sucu = campoId === "estoque_sucuarana" ? v : currentSector["estoque_sucuarana"];

        currentSector["estoque_total"] = calcEstoqueTotal(msb, sur, verm, sucu);
      }

      // Cálculo automático de Produção Total na Rebritagem (bypass + pátio)
      if (sId === "rebritagem" && (campoId === "producao_bypass" || campoId === "producao_patio")) {
        const byp = campoId === "producao_bypass" ? v : currentSector["producao_bypass"];
        const pat = campoId === "producao_patio" ? v : currentSector["producao_patio"];

        currentSector["producao_total"] = calcProducaoTotalRebritagem(byp, pat);
      }

      // Cálculo automático de Disponibilidade e Utilização com base no turno de 12h
      if (campoId === "paradas_manutencao" || campoId === "paradas_outros") {
        const pm = campoId === "paradas_manutencao" ? v : currentSector["paradas_manutencao"];
        const pOut = campoId === "paradas_outros" ? v : currentSector["paradas_outros"];

        currentSector["disponibilidade"] = calcDisp(pm);
        currentSector["utilizacao"] = calcUtil(pm, pOut);
      }

      // Cálculo automático de Produção do Filtro (t) = (12h - paradas_manutencao - paradas_outros) * produtividade
      if (sId === "filtro_prensa" && (campoId === "paradas_manutencao" || campoId === "paradas_outros" || campoId === "producao" || campoId === "producao_filtro")) {
        const pm = campoId === "paradas_manutencao" ? v : currentSector["paradas_manutencao"];
        const pOut = campoId === "paradas_outros" ? v : currentSector["paradas_outros"];
        const prod = campoId === "producao" ? v : currentSector["producao"];

        currentSector["producao_filtro"] = calcProducaoFiltro(pm, pOut, prod);
      }

      // Cálculo automático de Total Autonomia minério
      if (sId === "patio_silos" && (campoId === "estoque_patio" || campoId === "nivel_silo1" || campoId === "nivel_silo2")) {
        const est = campoId === "estoque_patio" ? v : currentSector["estoque_patio"];
        const s1 = campoId === "nivel_silo1" ? v : currentSector["nivel_silo1"];
        const s2 = campoId === "nivel_silo2" ? v : currentSector["nivel_silo2"];

        currentSector["total_autonomia"] = calcAutonomia(est, s1, s2);
      }

      // Cálculo automático de Produtividade Total Moagem e atualização de Metal e Concentrado
      if (sId === "moagem") {
        if (campoId === "prod_mi003" || campoId === "prod_mi004" || campoId === "prod_mi005") {
          const p3 = campoId === "prod_mi003" ? v : currentSector["prod_mi003"];
          const p4 = campoId === "prod_mi004" ? v : currentSector["prod_mi004"];
          const p5 = campoId === "prod_mi005" ? v : currentSector["prod_mi005"];

          currentSector["produtividade_total"] = calcProdTotal(p3, p4, p5);
        }
        if (campoId === "producao_moagem") {
          const flotSector = { ...(p["flotacao"] || {}) };
          const taf = flotSector["teor_alimentacao"];
          const tcf = flotSector["teor_concentrado"];
          const rec = flotSector["recuperacao"] || calcRecuperacao(taf, tcf, flotSector["teor_rejeito"]);
          const metal = calcMetal(v, taf, rec);
          flotSector["metal_contido"] = metal;
          flotSector["concentrado"] = calcConcentrado(metal, tcf);
          updatedAll["flotacao"] = flotSector;
        }
      }

      // Cálculo automático de Recuperação Metalúrgica, Metal e Concentrado da Flotação
      if (sId === "flotacao" && (campoId === "teor_alimentacao" || campoId === "teor_concentrado" || campoId === "teor_rejeito" || campoId === "recuperacao" || campoId === "metal_contido")) {
        const f = campoId === "teor_alimentacao" ? v : currentSector["teor_alimentacao"];
        const c = campoId === "teor_concentrado" ? v : currentSector["teor_concentrado"];
        const t = campoId === "teor_rejeito" ? v : currentSector["teor_rejeito"];

        let rec = campoId === "recuperacao" ? v : currentSector["recuperacao"];
        const calcRec = calcRecuperacao(f, c, t);
        if (calcRec) {
          rec = calcRec;
          currentSector["recuperacao"] = rec;
        }

        const prodMoagem = p["moagem"]?.["producao_moagem"];
        const metal = campoId === "metal_contido" ? v : calcMetal(prodMoagem, f, rec);
        currentSector["metal_contido"] = metal;
        currentSector["concentrado"] = calcConcentrado(metal, c);
      }

      return updatedAll;
    });
  };

  const preenchidos = SETORES.filter(s =>
    s.campos.some(c => {
      const v = dados[s.id]?.[c.id];
      if (c.type === "atividades" || c.type === "pendencias" || c.type === "pendencias_programacao") {
        return Array.isArray(v) && v.some(x => x && x.trim());
      }
      return c.type === "number" ? v !== "" && v !== undefined : v && v.trim();
    })
  ).length;

  // helpers para campos de lista (atividades / pendencias)
  const getLista = (setorId: string, campoId: string): string[] => dados[setorId]?.[campoId] || [""];
  const setLista = (setorId: string, campoId: string, lista: string[]) => {
    setDados(p => ({
      ...p,
      [setorId]: {
        ...(p[setorId] || {}),
        [campoId]: lista
      }
    }));
  };
  const addItem = (setorId: string, campoId: string) => {
    setLista(setorId, campoId, [...getLista(setorId, campoId), ""]);
  };
  const setItem = (setorId: string, campoId: string, i: number, v: string) => {
    setLista(
      setorId,
      campoId,
      getLista(setorId, campoId).map((x, j) => (j === i ? v : x))
    );
  };
  const delItem = (setorId: string, campoId: string, i: number) => {
    const list = getLista(setorId, campoId);
    if (list.length === 1) {
      setLista(setorId, campoId, [""]);
    } else {
      setLista(
        setorId,
        campoId,
        list.filter((_, j) => j !== i)
      );
    }
  };

  function entrar() {
    if (senha === SENHA_SUPERVISOR) {
      setSenhaErro(false);
      setTela("form");
    } else {
      setSenhaErro(true);
      setSenha("");
    }
  }

  function reiniciar() {
    if (window.confirm("Deseja realmente limpar todos os campos e iniciar um novo relatório?")) {
      localStorage.removeItem(LRAFT_KEY);
      setTela("inicio");
      setTurno(null);
      setTurma(null);
      setSup("");
      setSenha("");
      setTemaDds("");
      setIdx(0);
      setDados({});
      setAcoes([""]);
      setObs("");
      setOcorrencias([]);
      setWpp("");
    }
  }

  function handleGerarRelatorio() {
    // Ensure all sectors with paradas have their calculated disponibilidade and utilizacao synced
    const syncedDados: Record<string, Record<string, any>> = {};
    SETORES.forEach(s => {
      const sDados = { ...(dados[s.id] || {}) };
      const hasAnyField = Object.keys(sDados).length > 0;
      if (hasAnyField) {
        if (s.campos.some(c => c.id === "disponibilidade") && (sDados.disponibilidade === undefined || sDados.disponibilidade === "")) {
          sDados.disponibilidade = calcDisp(sDados.paradas_manutencao);
        }
        if (s.campos.some(c => c.id === "utilizacao") && (sDados.utilizacao === undefined || sDados.utilizacao === "")) {
          sDados.utilizacao = calcUtil(sDados.paradas_manutencao, sDados.paradas_outros);
        }
        if (s.id === "britagem_primaria" && (sDados.estoque_total === undefined || sDados.estoque_total === "")) {
          sDados.estoque_total = calcEstoqueTotal(sDados.estoque_msb, sDados.estoque_surubim, sDados.estoque_vermelhos, sDados.estoque_sucuarana);
        }
        if (s.id === "rebritagem" && (sDados.producao_total === undefined || sDados.producao_total === "")) {
          sDados.producao_total = calcProducaoTotalRebritagem(sDados.producao_bypass, sDados.producao_patio);
        }
        if (s.id === "patio_silos" && (sDados.total_autonomia === undefined || sDados.total_autonomia === "")) {
          sDados.total_autonomia = calcAutonomia(sDados.estoque_patio, sDados.nivel_silo1, sDados.nivel_silo2);
        }
        if (s.id === "moagem" && (sDados.produtividade_total === undefined || sDados.produtividade_total === "")) {
          sDados.produtividade_total = calcProdTotal(sDados.prod_mi003, sDados.prod_mi004, sDados.prod_mi005);
        }
        if (s.id === "filtro_prensa" && (sDados.producao_filtro === undefined || sDados.producao_filtro === "")) {
          sDados.producao_filtro = calcProducaoFiltro(sDados.paradas_manutencao, sDados.paradas_outros, sDados.producao);
        }
        if (s.id === "flotacao") {
          if (sDados.recuperacao === undefined || sDados.recuperacao === "") {
            sDados.recuperacao = calcRecuperacao(sDados.teor_alimentacao, sDados.teor_concentrado, sDados.teor_rejeito);
          }
          if (sDados.metal_contido === undefined || sDados.metal_contido === "") {
            const prodM = syncedDados["moagem"]?.producao_moagem || dados["moagem"]?.producao_moagem;
            sDados.metal_contido = calcMetal(prodM, sDados.teor_alimentacao, sDados.recuperacao);
          }
          if (sDados.concentrado === undefined || sDados.concentrado === "") {
            sDados.concentrado = calcConcentrado(sDados.metal_contido, sDados.teor_concentrado);
          }
        }
      }
      syncedDados[s.id] = sDados;
    });

    const text = gerarWpp({
      data,
      turno: turno || "diurno",
      turma: turma || "A",
      supervisor: sup,
      temaDds,
      dados: syncedDados,
      acoes,
      obs,
      ocorrenciasCriticas: ocorrencias
    });
    setWpp(text);
    setTela("relatorio");
  }

  function copiar() {
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = wpp;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    };
    (navigator.clipboard?.writeText(wpp) || Promise.reject())
      .then(() => {})
      .catch(fallback);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  }

  function handleBaixarPdf() {
    try {
      setBaixandoPdf(true);
      const syncedDados: Record<string, Record<string, any>> = {};
      SETORES.forEach(s => {
        const sDados = { ...(dados[s.id] || {}) };
        if (s.campos) {
          if (s.campos.some(c => c.id === "disponibilidade") && (sDados.disponibilidade === undefined || sDados.disponibilidade === "")) {
            sDados.disponibilidade = calcDisp(sDados.paradas_manutencao);
          }
          if (s.campos.some(c => c.id === "utilizacao") && (sDados.utilizacao === undefined || sDados.utilizacao === "")) {
            sDados.utilizacao = calcUtil(sDados.paradas_manutencao, sDados.paradas_outros);
          }
          if (s.id === "britagem_primaria" && (sDados.estoque_total === undefined || sDados.estoque_total === "")) {
            sDados.estoque_total = calcEstoqueTotal(sDados.estoque_msb, sDados.estoque_surubim, sDados.estoque_vermelhos, sDados.estoque_sucuarana);
          }
          if (s.id === "rebritagem" && (sDados.producao_total === undefined || sDados.producao_total === "")) {
            sDados.producao_total = calcProducaoTotalRebritagem(sDados.producao_bypass, sDados.producao_patio);
          }
          if (s.id === "patio_silos" && (sDados.total_autonomia === undefined || sDados.total_autonomia === "")) {
            sDados.total_autonomia = calcAutonomia(sDados.estoque_patio, sDados.nivel_silo1, sDados.nivel_silo2);
          }
          if (s.id === "moagem") {
            if (sDados.produtividade_total === undefined || sDados.produtividade_total === "") {
              sDados.produtividade_total = calcProdTotal(sDados.taxa_alimentacao_l1, sDados.taxa_alimentacao_l2, sDados.taxa_alimentacao_l3);
            }
          }
          if (s.id === "filtro_prensa" && (sDados.producao_filtro === undefined || sDados.producao_filtro === "")) {
            sDados.producao_filtro = calcProducaoFiltro(sDados.paradas_manutencao, sDados.paradas_outros, sDados.producao);
          }
          if (s.id === "flotacao") {
            if (sDados.recuperacao === undefined || sDados.recuperacao === "") {
              sDados.recuperacao = calcRecuperacao(sDados.teor_alimentacao, sDados.teor_concentrado, sDados.teor_rejeito);
            }
            if (sDados.metal_contido === undefined || sDados.metal_contido === "") {
              const prodM = syncedDados["moagem"]?.producao_moagem || dados["moagem"]?.producao_moagem;
              sDados.metal_contido = calcMetal(prodM, sDados.teor_alimentacao, sDados.recuperacao);
            }
            if (sDados.concentrado === undefined || sDados.concentrado === "") {
              sDados.concentrado = calcConcentrado(sDados.metal_contido, sDados.teor_concentrado);
            }
          }
        }
        syncedDados[s.id] = sDados;
      });

      gerarRelatorioPDF({
        data,
        turno: turno || "diurno",
        turma: turma || "A",
        temaDds,
        dados: syncedDados,
        ocorrencias,
        acoes,
        obs,
      });
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
    } finally {
      setTimeout(() => setBaixandoPdf(false), 800);
    }
  }

  // Count parameters states for overview card
  const getOverviewCounts = () => {
    let ok = 0, al = 0, cr = 0;
    SETORES.forEach(s => {
      const sDados = dados[s.id] || {};
      const hasAnyField = Object.keys(sDados).length > 0;
      if (!hasAnyField) return;

      s.campos
        .filter(c => c.type === "number")
        .forEach(c => {
          let v = sDados[c.id];
          if ((v === "" || v === undefined || v === null)) {
            if (c.id === "disponibilidade") v = calcDisp(sDados.paradas_manutencao);
            else if (c.id === "utilizacao") v = calcUtil(sDados.paradas_manutencao, sDados.paradas_outros);
            else if (c.id === "total_autonomia" && s.id === "patio_silos") v = calcAutonomia(sDados.estoque_patio, sDados.nivel_silo1, sDados.nivel_silo2);
            else if (c.id === "produtividade_total" && s.id === "moagem") v = calcProdTotal(sDados.prod_mi003, sDados.prod_mi004, sDados.prod_mi005);
            else if (c.id === "producao_filtro" && s.id === "filtro_prensa") v = calcProducaoFiltro(sDados.paradas_manutencao, sDados.paradas_outros, sDados.producao);
            else if (c.id === "recuperacao" && s.id === "flotacao") v = calcRecuperacao(sDados.teor_alimentacao, sDados.teor_concentrado, sDados.teor_rejeito);
            else if (c.id === "metal_contido" && s.id === "flotacao") {
              const prodM = dados["moagem"]?.producao_moagem;
              const rec = sDados.recuperacao || calcRecuperacao(sDados.teor_alimentacao, sDados.teor_concentrado, sDados.teor_rejeito);
              v = calcMetal(prodM, sDados.teor_alimentacao, rec);
            }
            else if (c.id === "concentrado" && s.id === "flotacao") {
              const prodM = dados["moagem"]?.producao_moagem;
              const rec = sDados.recuperacao || calcRecuperacao(sDados.teor_alimentacao, sDados.teor_concentrado, sDados.teor_rejeito);
              const metal = sDados.metal_contido || calcMetal(prodM, sDados.teor_alimentacao, rec);
              v = calcConcentrado(metal, sDados.teor_concentrado);
            }
            else return;
          }
          const s2 = st(v, c.meta, c.id, s.id);
          if (s2 === "ok") ok++;
          else if (s2 === "alerta") al++;
          else if (s2 === "critico") cr++;
        });
    });
    return { ok, al, cr };
  };

  const counts = getOverviewCounts();
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col items-center justify-start p-0 sm:p-4 overflow-x-hidden select-none">
      
      {/* Top Application Header / Switcher */}
      <header className="w-full max-w-6xl mb-3 sm:mb-4 px-2 sm:px-0 pt-2 sm:pt-0">
        <div className="bg-[#0A2028] text-white rounded-2xl px-4 py-3 sm:py-3.5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
          {/* Brand Ero Brasil */}
          <div className="flex items-center gap-3">
            <div className="bg-white px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs border border-slate-700">
              <span className="font-black text-sm text-[#007369] tracking-tight">ERO</span>
              <span className="font-bold text-xs text-[#0A2028] tracking-tight">BRASIL</span>
            </div>
            <div>
              <span className="font-bold text-sm text-slate-100 tracking-tight block">
                Planta de Beneficiamento de Cobre
              </span>
              <span className="text-[10px] text-teal-200/80 font-medium block">
                Relatórios operacionais - Gestão / Estratégico / KPIS
              </span>
            </div>
          </div>

          {/* Module Selector - Separado por Circuito Seco (Cominuição) e Circuito Úmido (Beneficiamento) */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setModuloAtivo("seco")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                moduloAtivo === "seco"
                  ? "bg-[#007369] text-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
              title="Relatório Estratégico do Circuito de Cominuição (Britagem, Rebritagem, Pátios)"
            >
              <Hammer className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span>Circuito Seco</span>
            </button>

            <button
              onClick={() => setModuloAtivo("umido")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                moduloAtivo === "umido"
                  ? "bg-[#007369] text-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
              title="Relatório Estratégico do Circuito de Beneficiamento (Moagem, Flotação, Filtragem, ETA)"
            >
              <Droplets className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span>Circuito Úmido</span>
            </button>

            <button
              onClick={() => setModuloAtivo("turno")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                moduloAtivo === "turno"
                  ? "bg-[#007369] text-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
              title="Relatório Operacional de Passagem de Turno"
            >
              <Clipboard className="w-3.5 h-3.5 text-teal-300" />
              <span>Relatório de Turno</span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <button
            type="button"
            onClick={toggleModoWeb}
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-800 transition cursor-pointer"
            title={modoWeb ? "Alternar para modo móvel" : "Configurar página para Web / Desktop"}
          >
            {modoWeb ? (
              <>
                <Smartphone className="h-3.5 w-3.5 text-[#14B8A6]" />
                <span>Celular</span>
              </>
            ) : (
              <>
                <Monitor className="h-3.5 w-3.5 text-[#14B8A6]" />
                <span>Modo Web</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* RENDERIZAÇÃO DO MÓDULO CIRCUITO SECO, CIRCUITO ÚMIDO OU TURNO */}
      {moduloAtivo === "seco" ? (
        <AdmModule circuitoTipo="seco" modoWeb={modoWeb} toggleModoWeb={toggleModoWeb} />
      ) : moduloAtivo === "umido" ? (
        <AdmModule circuitoTipo="umido" modoWeb={modoWeb} toggleModoWeb={toggleModoWeb} />
      ) : (
        /* Container Device Wrapper for mobile simulation or full web desktop layout */
        <div className={`w-full bg-white transition-all duration-300 flex flex-col justify-between border-0 sm:border border-slate-200 relative overflow-hidden ${
          modoWeb
            ? "max-w-6xl sm:rounded-3xl shadow-xl sm:my-2 min-h-[880px]"
            : "w-full max-w-lg sm:max-w-[500px] sm:rounded-3xl shadow-xl min-h-screen sm:min-h-[850px] sm:my-2"
        }`}>
          
          <AnimatePresence mode="wait">
            
            {/* TELA: INICIO */}
            {tela === "inicio" && (
              <motion.div
                key="inicio"
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
                        <span className="bg-white/10 text-teal-200 border border-white/10 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase">
                          ERO BRASIL • OPERAÇÕES
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={toggleModoWeb}
                        className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 shadow-sm border border-white/20 cursor-pointer"
                        title={modoWeb ? "Alternar para modo móvel" : "Configurar página para Web / Desktop"}
                      >
                        {modoWeb ? (
                          <>
                            <Smartphone className="h-3.5 w-3.5 text-[#14B8A6]" />
                            <span>Modo Celular</span>
                          </>
                        ) : (
                          <>
                            <Monitor className="h-3.5 w-3.5 text-[#14B8A6]" />
                            <span>Configurar para Web</span>
                          </>
                        )}
                      </button>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">
                      Relatório de Turno
                    </h1>
                    <p className="text-slate-300 text-xs mt-1">
                      Registro oficial de operação, parâmetros dos setores, segurança e passagem de turno
                    </p>
                  </div>

                  {/* Form Fields Container */}
                  <div className="p-4 space-y-4">
                  
                  {/* Identificacao Card */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-1">
                      <Clipboard className="h-4 w-4 text-teal-600" />
                      <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                        Identificação
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-550 block font-medium">Data</label>
                        <input
                          type="date"
                          value={data}
                          onChange={e => setData(e.target.value)}
                          className="w-full bg-white border border-slate-250 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-555 block font-medium">Supervisor</label>
                        <input
                          type="text"
                          placeholder="Nome..."
                          value={sup}
                          onChange={e => setSup(e.target.value)}
                          className="w-full bg-white border border-slate-250 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Turno Selector Card */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-3">
                      <Sun className="h-4 w-4 text-teal-600" />
                      <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                        Turno Operacional
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {TURNOS.map(t => {
                        const isSel = turno === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setTurno(t.id)}
                            className={`flex flex-col items-start p-4 rounded-xl border text-left transition ${
                              isSel
                                ? "bg-teal-50 border-emerald-500 text-teal-900 shadow-sm"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {t.id === "diurno" ? (
                              <Sun className={`h-6 w-6 mb-2 ${isSel ? "text-emerald-600" : "text-slate-400"}`} />
                            ) : (
                              <Moon className={`h-6 w-6 mb-2 ${isSel ? "text-indigo-600" : "text-slate-400"}`} />
                            )}
                            <span className="font-bold text-sm tracking-tight">{t.label}</span>
                            <span className="text-[11px] text-slate-500 font-medium mt-0.5">{t.hora}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Turma Selector Card */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-3">
                      <CheckSquare className="h-4 w-4 text-teal-600" />
                      <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                        Turma de Trabalho
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {TURMAS.map(t => {
                        const isSel = turma === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTurma(t)}
                            className={`py-3.5 rounded-xl border text-center transition ${
                              isSel
                                ? "bg-teal-50 border-teal-500 text-teal-900 font-extrabold shadow-sm"
                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"
                            }`}
                          >
                            <span className="text-[9px] block text-slate-400 uppercase font-bold">Turma</span>
                            <span className="text-xl leading-none mt-0.5 block">{t}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Password Card */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-3">
                      <Lock className="h-4 w-4 text-teal-600" />
                      <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                        Login Supervisor
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showSenha ? "text" : "password"}
                          placeholder="Senha..."
                          value={senha}
                          onChange={e => {
                            setSenha(e.target.value);
                            setSenhaErro(false);
                          }}
                          onKeyDown={e => e.key === "Enter" && entrar()}
                          className={`w-full bg-white border focus:ring-1 focus:ring-emerald-500 rounded-xl pl-3 pr-10 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition ${
                            senhaErro ? "border-red-500" : "border-slate-250 focus:border-emerald-500"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSenha(!showSenha)}
                          className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition"
                        >
                          {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={entrar}
                        disabled={!turno || !turma || !sup.trim() || !senha}
                        className={`px-5 py-3 rounded-xl font-bold text-sm tracking-wide transition flex items-center gap-1.5 ${
                          !turno || !turma || !sup.trim() || !senha
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-teal-600 hover:bg-teal-500 text-white shadow-md cursor-pointer"
                        }`}
                      >
                        Entrar
                      </button>
                    </div>

                    {senhaErro && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Senha operativa incorreta ou inválida.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Little bottom hint footer */}
              <div className="text-center p-3 text-[10px] text-slate-400 font-mono tracking-wider">
                VERSION 2.4.0 — AUTO-GENERATION SYS ACTIVE
              </div>
            </motion.div>
          )}

          {/* TELA: FORMULARIO */}
          {tela === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col justify-between h-full flex-1"
            >
              <div>
                {/* Header Navbar */}
                <div className="bg-white sticky top-0 z-30 px-4 py-3 border-b border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded text-[11px] tracking-wide border border-teal-200">
                      Turma {turma}
                    </span>
                    <span className="text-xs text-slate-550 font-medium">
                      {turno === "diurno" ? "☀️ Diurno" : "🌙 Noturno"} · {fmtData(data)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleModoWeb}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 border border-slate-250 transition cursor-pointer"
                      title={modoWeb ? "Alternar para modo móvel" : "Configurar página para Web / Desktop"}
                    >
                      {modoWeb ? (
                        <>
                          <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="hidden sm:inline">Modo Celular</span>
                        </>
                      ) : (
                        <>
                          <Monitor className="h-3.5 w-3.5 text-teal-600" />
                          <span className="hidden sm:inline">Configurar Web</span>
                        </>
                      )}
                    </button>
                    <span className="text-xs text-slate-600 font-bold bg-slate-50 px-2 py-1 rounded-full border border-slate-200 text-[11px]">
                      {preenchidos}/{SETORES.length} Setores
                    </span>
                  </div>
                </div>

                {/* Subheader: Sector Abas Horizontal Scrolling */}
                <div className="flex gap-2 p-3 overflow-x-auto bg-slate-50 border-b border-slate-200 scrollbar-none">
                  {SETORES.map((s, i) => {
                    const sc = COR[s.cor];
                    const isSelected = i === idx;
                    // Check if this sector has any filled field
                    const hasData = s.campos.some(c => {
                      const v = dados[s.id]?.[c.id];
                      if (c.type === "atividades" || c.type === "pendencias" || c.type === "pendencias_programacao") {
                        return Array.isArray(v) && v.some(x => x && x.trim());
                      }
                      return c.type === "number" ? v !== "" && v !== undefined : v && v.trim();
                    });

                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setIdx(i)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-150 relative ${
                          isSelected
                            ? `${sc.bg} ${sc.bd} ${sc.tx} scale-102`
                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {s.label.split(" ")[0]}
                        {hasData && (
                          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border border-white" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Sector Main Heading Badge */}
                <div className={`m-4 p-4 rounded-2xl border ${c.bg} ${c.bd} flex items-center gap-3.5 transition`}>
                  <div className={`p-2 rounded-xl bg-white/40 shadow-sm`}>
                    <IconComponent name={setor.icon} className={`h-6 w-6 ${c.tx}`} />
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase font-bold tracking-widest leading-none ${c.tx} opacity-80`}>
                      Setor {idx + 1} de {SETORES.length}
                    </span>
                    <h2 className={`text-xl font-black tracking-tight mt-0.5 leading-none ${c.tx}`}>
                      {setor.label}
                    </h2>
                  </div>
                </div>

                {/* Fields List */}
                <div className={`p-4 ${modoWeb ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}`}>
                  {setor.campos.map(campo => {
                    
                    // ATIVIDADES REALIZADAS FIELD LIST
                    if (campo.type === "atividades") {
                      const list = getLista(setor.id, campo.id);
                      const activeCount = list.filter(x => x && x.trim()).length;
                      return (
                        <div key={campo.id} className={`bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 space-y-3 shadow-sm ${modoWeb ? "col-span-full" : ""}`}>
                          <div className="flex items-center justify-between border-b border-emerald-100 pb-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-600">✔️</span>
                              <label className="text-xs font-bold uppercase tracking-wider text-emerald-800">Atividades Realizadas</label>
                            </div>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-200">
                              {activeCount}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {list.map((item, i) => (
                              <div key={i} className="flex gap-2 items-center">
                                <span className="text-xs text-emerald-600 font-bold font-mono">{i + 1}.</span>
                                <input
                                  type="text"
                                  placeholder="Descrição da atividade..."
                                  value={item}
                                  onChange={e => setItem(setor.id, campo.id, i, e.target.value)}
                                  className="flex-1 bg-white border border-emerald-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none transition"
                                />
                                {list.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => delItem(setor.id, campo.id, i)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => addItem(setor.id, campo.id)}
                            className="bg-emerald-50 hover:bg-emerald-100 border border-dashed border-emerald-300 text-emerald-700 text-xs font-extrabold w-full py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                          >
                            <Plus className="h-3.5 w-3.5" /> Adicionar Atividade
                          </button>
                        </div>
                      );
                    }

                    // PENDENCIAS CRITICAS FIELD LIST
                    if (campo.type === "pendencias") {
                      const list = getLista(setor.id, campo.id);
                      const activeCount = list.filter(x => x && x.trim()).length;
                      return (
                        <div key={campo.id} className={`bg-red-50/50 border border-red-200 rounded-2xl p-4 space-y-3 shadow-sm ${modoWeb ? "col-span-full" : ""}`}>
                          <div className="flex items-center justify-between border-b border-red-100 pb-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-red-600">🔴</span>
                              <label className="text-xs font-bold uppercase tracking-wider text-red-800">Pendências Críticas</label>
                            </div>
                            {activeCount > 0 && (
                              <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-red-200 animate-pulse">
                                {activeCount} {activeCount > 1 ? "críticas" : "crítica"}
                              </span>
                            )}
                          </div>

                          <div className="space-y-2">
                            {list.map((item, i) => (
                              <div key={i} className="flex gap-2 items-center">
                                <span className="text-xs text-red-600 font-bold font-mono">{i + 1}.</span>
                                <input
                                  type="text"
                                  placeholder="Descrição da pendência crítica..."
                                  value={item}
                                  onChange={e => setItem(setor.id, campo.id, i, e.target.value)}
                                  className="flex-1 bg-white border border-red-200 focus:border-red-500 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none transition"
                                />
                                {list.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => delItem(setor.id, campo.id, i)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => addItem(setor.id, campo.id)}
                            className="bg-red-50 hover:bg-red-100 border border-dashed border-red-300 text-red-700 text-xs font-extrabold w-full py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                          >
                            <Plus className="h-3.5 w-3.5" /> Adicionar Pendência Crítica
                          </button>
                        </div>
                      );
                    }

                    // PENDENCIAS DE ACOMPANHAMENTO / PROGRAMACAO FIELD LIST
                    if (campo.type === "pendencias_programacao") {
                      const list = getLista(setor.id, campo.id);
                      const activeCount = list.filter(x => x && x.trim()).length;
                      return (
                        <div key={campo.id} className={`bg-sky-50/50 border border-sky-200 rounded-2xl p-4 space-y-3 shadow-sm ${modoWeb ? "col-span-full" : ""}`}>
                          <div className="flex items-center justify-between border-b border-sky-100 pb-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sky-600">📋</span>
                              <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-sky-800 block">Pendências de Acompanhamento</label>
                                <span className="text-[10px] text-sky-600 font-medium">Pendências para programação semanal / preventiva</span>
                              </div>
                            </div>
                            {activeCount > 0 ? (
                              <span className="bg-sky-100 text-sky-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-sky-200">
                                {activeCount} {activeCount > 1 ? "itens" : "item"}
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                0
                              </span>
                            )}
                          </div>

                          <div className="space-y-2">
                            {list.map((item, i) => (
                              <div key={i} className="flex gap-2 items-center">
                                <span className="text-xs text-sky-600 font-bold font-mono">{i + 1}.</span>
                                <input
                                  type="text"
                                  placeholder="Descrição da pendência para programação..."
                                  value={item}
                                  onChange={e => setItem(setor.id, campo.id, i, e.target.value)}
                                  className="flex-1 bg-white border border-sky-200 focus:border-sky-500 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none transition"
                                />
                                {list.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => delItem(setor.id, campo.id, i)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => addItem(setor.id, campo.id)}
                            className="bg-sky-50 hover:bg-sky-100 border border-dashed border-sky-300 text-sky-700 text-xs font-extrabold w-full py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                          >
                            <Plus className="h-3.5 w-3.5" /> Adicionar Pendência de Acompanhamento
                          </button>
                        </div>
                      );
                    }

                    // SPECIAL REBRITAGEM CRUSHER AFERIÇÃO TABLE (42BR001 to 42BR006)
                    if (setor.id === "rebritagem" && (
                      campo.id === "afericao_42br002" || 
                      campo.id === "afericao_42br003" || 
                      campo.id === "afericao_42br004" || 
                      campo.id === "afericao_42br005" || 
                      campo.id === "afericao_42br006"
                    )) {
                      return null;
                    }

                    if (setor.id === "rebritagem" && campo.id === "afericao_42br001") {
                      const britadores = [
                        { id: "afericao_42br001", label: "42BR001" },
                        { id: "afericao_42br002", label: "42BR002" },
                        { id: "afericao_42br003", label: "42BR003" },
                        { id: "afericao_42br004", label: "42BR004" },
                        { id: "afericao_42br005", label: "42BR005" },
                        { id: "afericao_42br006", label: "42BR006" },
                      ];

                      return (
                        <div
                          key="tabela_afericao_rebritagem"
                          className={`bg-blue-50/40 border border-blue-200/90 rounded-2xl p-4 shadow-sm space-y-3 ${
                            modoWeb ? "col-span-full" : ""
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-blue-100 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-base text-blue-600">⚙️</span>
                              <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-blue-950 block">
                                  Tabela de Aferição dos Britadores (Pós-Checagem)
                                </label>
                                <span className="text-[11px] text-slate-500 font-medium">
                                  Informe para quanto ficou aferido cada britador após a checagem operacional (mm)
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                              <thead>
                                <tr className="bg-white text-[11px] font-bold text-slate-700 uppercase tracking-wider border border-blue-200">
                                  {britadores.map(b => (
                                    <th key={b.id} className="py-2.5 px-3 text-center border-r border-blue-200 last:border-r-0 font-extrabold text-blue-900">
                                      {b.label}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border border-blue-200 bg-white">
                                  {britadores.map(b => (
                                    <td key={b.id} className="p-2 border-r border-blue-200 last:border-r-0">
                                      <div className="relative">
                                        <input
                                          type="number"
                                          step="any"
                                          inputMode="decimal"
                                          placeholder="0.0 mm"
                                          value={d[b.id] || ""}
                                          onChange={e => setDado(setor.id, b.id, e.target.value)}
                                          className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-2.5 py-2 text-center text-sm font-bold text-slate-800 outline-none transition"
                                        />
                                      </div>
                                    </td>
                                  ))}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    }

                    // STANDARD FIELD CARD TYPES (NUMBER / TEXT / SELECT)
                    const isDispField = campo.id === "disponibilidade";
                    const isUtilField = campo.id === "utilizacao";
                    const isEstoqueTotalField = campo.id === "estoque_total" && setor.id === "britagem_primaria";
                    const isProdTotalRebritagemField = campo.id === "producao_total" && setor.id === "rebritagem";
                    const isAutonomiaField = campo.id === "total_autonomia";
                    const isProdTotalField = campo.id === "produtividade_total";
                    const isRecuperacaoField = campo.id === "recuperacao" && setor.id === "flotacao";
                    const isMetalField = campo.id === "metal_contido" && setor.id === "flotacao";
                    const isConcentradoField = campo.id === "concentrado" && setor.id === "flotacao";
                    const isProducaoFiltroField = campo.id === "producao_filtro" && setor.id === "filtro_prensa";
                    const isCalcField = isDispField || isUtilField || isEstoqueTotalField || isProdTotalRebritagemField || isAutonomiaField || isProdTotalField || isRecuperacaoField || isMetalField || isConcentradoField || isProducaoFiltroField;

                    const rawVal = d[campo.id] ?? "";
                    const val = (campo.type === "number" && isCalcField && (rawVal === "" || rawVal === undefined))
                      ? (isDispField 
                          ? calcDisp(d.paradas_manutencao) 
                          : isUtilField 
                          ? calcUtil(d.paradas_manutencao, d.paradas_outros)
                          : isEstoqueTotalField
                          ? calcEstoqueTotal(d.estoque_msb, d.estoque_surubim, d.estoque_vermelhos, d.estoque_sucuarana)
                          : isProdTotalRebritagemField
                          ? calcProducaoTotalRebritagem(d.producao_bypass, d.producao_patio)
                          : isAutonomiaField
                          ? calcAutonomia(d.estoque_patio, d.nivel_silo1, d.nivel_silo2)
                          : isProdTotalField
                          ? calcProdTotal(d.prod_mi003, d.prod_mi004, d.prod_mi005)
                          : isRecuperacaoField
                          ? calcRecuperacao(d.teor_alimentacao, d.teor_concentrado, d.teor_rejeito)
                          : isMetalField
                          ? calcMetal(dados["moagem"]?.producao_moagem, d.teor_alimentacao, d.recuperacao || calcRecuperacao(d.teor_alimentacao, d.teor_concentrado, d.teor_rejeito))
                          : isConcentradoField
                          ? calcConcentrado(
                              d.metal_contido || calcMetal(dados["moagem"]?.producao_moagem, d.teor_alimentacao, d.recuperacao || calcRecuperacao(d.teor_alimentacao, d.teor_concentrado, d.teor_rejeito)),
                              d.teor_concentrado
                            )
                          : calcProducaoFiltro(d.paradas_manutencao, d.paradas_outros, d.producao))
                      : rawVal;

                    // Calculate average silo percentage for formula explanation
                    const s1Val = parseFloat(d.nivel_silo1 || "0");
                    const s2Val = parseFloat(d.nivel_silo2 || "0");
                    const mediaSilosPerc = (d.nivel_silo1 !== undefined && d.nivel_silo2 !== undefined)
                      ? ((s1Val + s2Val) / 2).toFixed(1)
                      : (d.nivel_silo1 !== undefined ? s1Val.toFixed(1) : (d.nivel_silo2 !== undefined ? s2Val.toFixed(1) : "0"));

                    return (
                      <div key={campo.id} className={`bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5 flex flex-col justify-between ${
                        campo.type === "text" && modoWeb ? "col-span-full" : ""
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <label className="text-xs font-semibold text-slate-700">
                              {campo.label}{campo.un ? ` (${campo.un})` : ""}
                            </label>
                            {isCalcField && (
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                                Auto
                              </span>
                            )}
                          </div>
                          {campo.type === "number" && campo.meta !== undefined && val !== "" && (
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              st(val, campo.meta, campo.id, setor.id) === "ok"
                                ? "bg-emerald-50 text-emerald-800"
                                : st(val, campo.meta, campo.id, setor.id) === "alerta"
                                ? "bg-amber-50 text-amber-800"
                                : "bg-red-50 text-red-800"
                            }`}>
                              {st(val, campo.meta, campo.id, setor.id).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {campo.type === "number" && (
                          <div className="space-y-1.5">
                            <input
                              type="number"
                              step="any"
                              inputMode="decimal"
                              placeholder={campo.meta !== undefined ? `Meta: ${campo.meta}` : "0"}
                              value={val}
                              onChange={e => setDado(setor.id, campo.id, e.target.value)}
                              className="w-full bg-white border border-slate-250 focus:border-teal-500 rounded-xl px-3.5 py-3 font-semibold text-[17px] text-slate-800 outline-none transition"
                            />
                            {/* Campo dinâmico de Tratativa / Ação do Supervisor para Alerta ou Crítico */}
                            {val !== "" && val !== undefined && (st(val, campo.meta, campo.id, setor.id) === "alerta" || st(val, campo.meta, campo.id, setor.id) === "critico") && (
                              <div className="mt-2.5 p-3 bg-amber-50/95 border border-amber-300 rounded-xl space-y-1.5 shadow-2xs">
                                <div className="flex items-center justify-between">
                                  <label className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                                    <span>Tratativa do Supervisor (Meta não atingida):</span>
                                  </label>
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                                    {st(val, campo.meta, campo.id, setor.id) === "critico" ? "Crítico" : "Alerta"}
                                  </span>
                                </div>
                                <textarea
                                  rows={2}
                                  placeholder="Descreva a tratativa realizada para retorno à meta..."
                                  value={d[`acao_${campo.id}`] || ""}
                                  onChange={e => setDado(setor.id, `acao_${campo.id}`, e.target.value)}
                                  className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium resize-none"
                                />
                              </div>
                            )}
                            {isDispField && (
                              <p className="text-[11px] text-teal-700 bg-teal-50/80 border border-teal-200/60 rounded-lg px-2.5 py-1.5 font-medium">
                                Resultado: ((12h - {d.paradas_manutencao ? `${d.paradas_manutencao}h Manut.` : "0h Manut."}) / 12h) × 100 = <strong className="font-bold text-teal-900">{val}%</strong>
                              </p>
                            )}
                            {isUtilField && (
                              <p className="text-[11px] text-blue-700 bg-blue-50/80 border border-blue-200/60 rounded-lg px-2.5 py-1.5 font-medium">
                                Resultado: ((12h - {d.paradas_manutencao ? `${d.paradas_manutencao}h Manut.` : "0h"} - {d.paradas_outros ? `${d.paradas_outros}h OUT` : "0h"}) / 12h) × 100 = <strong className="font-bold text-blue-900">{val}%</strong>
                              </p>
                            )}
                            {isEstoqueTotalField && (
                              <p className="text-[11px] text-teal-800 bg-teal-50/80 border border-teal-200/60 rounded-lg px-2.5 py-1.5 font-medium">
                                Resultado: ({d.estoque_msb || 0}t MSB + {d.estoque_surubim || 0}t Surubim + {d.estoque_vermelhos || 0}t Vermelhos + {d.estoque_sucuarana || 0}t Suçuarana) = <strong className="font-bold text-teal-950">{val || "0"} t</strong>
                              </p>
                            )}
                            {isProdTotalRebritagemField && (
                              <p className="text-[11px] text-blue-800 bg-blue-50/80 border border-blue-200/60 rounded-lg px-2.5 py-1.5 font-medium">
                                Resultado: ({d.producao_bypass || 0}t bypass + {d.producao_patio || 0}t pátio) = <strong className="font-bold text-blue-950">{val || "0"} t</strong>
                              </p>
                            )}
                            {isAutonomiaField && (
                              <p className="text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200/60 rounded-lg px-2.5 py-1.5 font-medium">
                                Resultado: ({d.estoque_patio || 0}t pátio + {mediaSilosPerc}% média silos × 4800) = <strong className="font-bold text-amber-950">{val} t</strong>
                              </p>
                            )}
                            {isProdTotalField && (
                              <p className="text-[11px] text-purple-800 bg-purple-50/80 border border-purple-200/60 rounded-lg px-2.5 py-1.5 font-medium">
                                Resultado: ({d.prod_mi003 || 0} + {d.prod_mi004 || 0} + {d.prod_mi005 || 0} t/h) = <strong className="font-bold text-purple-950">{val} t/h</strong>
                              </p>
                            )}
                            {isRecuperacaoField && (
                              <p className="text-[11px] text-orange-800 bg-orange-50/80 border border-orange-200/60 rounded-lg px-2.5 py-1.5 font-medium">
                                Resultado: [({d.teor_concentrado || 0}% × ({d.teor_alimentacao || 0}% - {d.teor_rejeito || 0}%)) / ({d.teor_alimentacao || 0}% × ({d.teor_concentrado || 0}% - {d.teor_rejeito || 0}%))] × 100 = <strong className="font-bold text-orange-950">{val || "0"}%</strong>
                              </p>
                            )}
                            {isMetalField && (
                              <p className="text-[11px] text-amber-900 bg-amber-50/80 border border-amber-200/60 rounded-lg px-2.5 py-1.5 font-medium">
                                Resultado: ({dados["moagem"]?.producao_moagem ? `${dados["moagem"].producao_moagem}t moagem` : "0t moagem"} × {d.teor_alimentacao || 0}% teor AF × {d.recuperacao || "0"}% rec.) / 10000 = <strong className="font-bold text-amber-950">{val || "0"} t</strong>
                              </p>
                            )}
                            {isConcentradoField && (
                              <p className="text-[11px] text-emerald-800 bg-emerald-50/80 border border-emerald-200/60 rounded-lg px-2.5 py-1.5 font-medium">
                                Resultado: {d.metal_contido || "0"}t metal / ({d.teor_concentrado || 0}% teor CF / 100) = <strong className="font-bold text-emerald-950">{val || "0"} t</strong>
                              </p>
                            )}
                            {isProducaoFiltroField && (
                              <p className="text-[11px] text-pink-800 bg-pink-50/80 border border-pink-200/60 rounded-lg px-2.5 py-1.5 font-medium">
                                Resultado: ((12h - {d.paradas_manutencao ? `${d.paradas_manutencao}h Manut.` : "0h"} - {d.paradas_outros ? `${d.paradas_outros}h OUT` : "0h"}) × {d.producao ? `${d.producao} t/h` : "30 t/h"}) = <strong className="font-bold text-pink-950">{val || "0"} t</strong>
                              </p>
                            )}
                            {campo.id === "paradas_manutencao" && (
                              <p className="text-[10px] text-slate-500 font-medium pl-1">
                                Horas de paradas de manutenção (impacta na Disponibilidade)
                              </p>
                            )}
                            {campo.id === "paradas_outros" && (
                              <p className="text-[10px] text-slate-500 font-medium pl-1">
                                Horas de paradas operacionais/outros (impacta na Utilização)
                              </p>
                            )}
                          </div>
                        )}

                        {campo.type === "text" && (
                          <textarea
                            rows={3}
                            placeholder="Anormalidades, paradas significativas, desvios operacionais ou sugestões..."
                            value={val}
                            onChange={e => setDado(setor.id, campo.id, e.target.value)}
                            className="w-full bg-white border border-slate-250 focus:border-teal-500 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none transition resize-none focus:ring-1 focus:ring-teal-500"
                          />
                        )}

                        {campo.type === "select" && (
                          <div className="space-y-2">
                            <div className="relative">
                              <select
                                value={val}
                                onChange={e => setDado(setor.id, campo.id, e.target.value)}
                                className="w-full bg-white border border-slate-250 focus:border-teal-500 rounded-xl px-3.5 py-3 font-semibold text-[15px] text-slate-800 outline-none transition cursor-pointer appearance-none pr-10"
                              >
                                <option value="">Selecione uma opção...</option>
                                {campo.opcoes?.map(opt => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                                <ChevronDown className="h-4 w-4" />
                              </div>
                            </div>

                            {/* Tratativa obrigatória se Pendente */}
                            {val === "Pendente" && (
                              <div className="mt-2 p-3 bg-amber-50/95 border border-amber-300 rounded-xl space-y-1.5 shadow-2xs">
                                <div className="flex items-center justify-between">
                                  <label className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                                    <span>Tratativa do Supervisor (Aferição Pendente):</span>
                                  </label>
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                                    Pendente
                                  </span>
                                </div>
                                <textarea
                                  rows={2}
                                  placeholder="Descreva a tratativa / motivo pelo qual a aferição ficou pendente e planejamento de execução..."
                                  value={d[`acao_${campo.id}`] || ""}
                                  onChange={e => setDado(setor.id, `acao_${campo.id}`, e.target.value)}
                                  className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium resize-none"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Sticky Action Row */}
              <div className="sticky bottom-0 bg-white border-t border-slate-200/80 px-4 py-3 flex gap-3 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => setIdx(i => i - 1)}
                    className="flex-1 border border-slate-250 text-slate-600 bg-slate-50 rounded-xl py-3 font-bold text-xs tracking-wider uppercase transition hover:bg-slate-100 flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" /> Anterior
                  </button>
                )}

                {idx < SETORES.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setIdx(i => i + 1)}
                    className="flex-[2] bg-teal-600 hover:bg-teal-500 text-white rounded-xl py-3 font-bold text-xs tracking-wider uppercase transition shadow-md flex items-center justify-center gap-1"
                  >
                    Próximo <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTela("finalizar")}
                    className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 font-bold text-xs tracking-wider uppercase transition shadow-md flex items-center justify-center gap-1.5"
                  >
                    Finalizar <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* TELA: FINALIZAR */}
          {tela === "finalizar" && (
            <motion.div
              key="finalizar"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col justify-between h-full flex-1"
            >
              <div>
                {/* Header Navbar banner */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => setTela("form")}
                      className="bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-1.5 rounded-lg text-xs leading-none transition flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="h-3 w-3" /> Voltar
                    </button>
                    <button
                      type="button"
                      onClick={toggleModoWeb}
                      className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 border border-white/20 cursor-pointer"
                      title={modoWeb ? "Alternar para modo móvel" : "Configurar página para Web / Desktop"}
                    >
                      {modoWeb ? (
                        <>
                          <Smartphone className="h-3.5 w-3.5 text-blue-200" />
                          <span>Modo Celular</span>
                        </>
                      ) : (
                        <>
                          <Monitor className="h-3.5 w-3.5 text-blue-200" />
                          <span>Configurar Web</span>
                        </>
                      )}
                    </button>
                  </div>
                  <h2 className="text-2xl font-black text-white leading-none">Revisão Final</h2>
                  <p className="text-xs text-blue-100 opacity-80 mt-1.5 font-medium">
                    {fmtData(data)} · Turno {turno === "diurno" ? "Diurno" : "Noturno"} · Turma {turma}
                  </p>
                </div>

                {/* Main section */}
                <div className="p-4 space-y-4">
                  
                  {/* Performance Indicators Overview */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-center shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">OK</span>
                      <span className="text-3xl font-black block mt-0.5 text-emerald-600">{counts.ok}</span>
                    </div>
                    <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-center shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Alertas</span>
                      <span className="text-3xl font-black block mt-0.5 text-amber-600">{counts.al}</span>
                    </div>
                    <div className="bg-red-50 border border-red-200/80 rounded-xl p-3 text-center shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-red-800 tracking-wider">Críticos</span>
                      <span className="text-3xl font-black block mt-0.5 text-red-600">{counts.cr}</span>
                    </div>
                  </div>

                  {/* Tema do DDS (Diálogo Diário de Segurança) */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-blue-200/80 shadow-sm space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Tema do DDS
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Diálogo Diário de Segurança realizado no alinhamento do turno
                        </p>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Ex: Bloqueio e Etiquetagem (LOTO), Trabalho em Altura, Isolamento de Áreas..."
                      value={temaDds}
                      onChange={e => setTemaDds(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none transition font-medium placeholder:text-slate-400 shadow-2xs"
                    />
                  </div>

                  {/* Ocorrências de Perda de Produção ou Segurança */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-red-200/80 shadow-sm space-y-3.5">
                    <div className="flex items-center justify-between border-b border-red-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-red-600 shrink-0" />
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Perda de Produção / Segurança
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Estrutura para eventos críticos, impactos, ações e restrições
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 whitespace-nowrap shrink-0">
                        {ocorrencias.length} {ocorrencias.length === 1 ? "registro" : "registros"}
                      </span>
                    </div>

                    {/* Action bar to add or load template */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setOcorrencias(p => [
                            ...p,
                            {
                              id: Date.now().toString(),
                              eventoPrincipal: "",
                              impactosDanos: "",
                              acoesRealizadas: "",
                              linhaDoTempo: "",
                              condicaoRestricoes: "",
                            },
                          ])
                        }
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Plus className="h-4 w-4" /> Adicionar Ocorrência
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOcorrencias(p => [
                            ...p,
                            {
                              ...EXEMPLO_OCORRENCIA,
                              id: Date.now().toString(),
                            },
                          ]);
                        }}
                        className="bg-white border border-red-200 text-red-700 hover:bg-red-50 rounded-xl py-2.5 px-3 text-xs font-bold transition flex items-center gap-1 shadow-2xs whitespace-nowrap"
                        title="Carregar exemplo prático com o formato completo"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Carregar Exemplo
                      </button>
                    </div>

                    {ocorrencias.length === 0 ? (
                      <div className="bg-white/90 border border-dashed border-slate-300 rounded-xl p-3.5 text-center text-xs text-slate-500 font-medium">
                        Nenhuma ocorrência crítica cadastrada. Clique em <strong className="text-red-700 font-bold">Adicionar Ocorrência</strong> para registrar paradas ou eventos de segurança com a estrutura padronizada.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {ocorrencias.map((oc, i) => (
                          <div
                            key={oc.id}
                            className="bg-white rounded-xl border border-red-200/90 p-3.5 space-y-3 relative shadow-2xs"
                          >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-xs font-black text-red-700 uppercase tracking-wide flex items-center gap-1">
                                🚨 Ocorrência #{i + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => setOcorrencias(p => p.filter(item => item.id !== oc.id))}
                                className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition"
                                title="Excluir ocorrência"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {/* 1. Evento Principal */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Evento Principal:
                              </label>
                              <textarea
                                rows={2}
                                placeholder="Ex: Parada por transbordo do Silo 01, causado por falsa indicação de nível no sensor da posição 02."
                                value={oc.eventoPrincipal}
                                onChange={e => {
                                  const val = e.target.value;
                                  setOcorrencias(p =>
                                    p.map(item => (item.id === oc.id ? { ...item, eventoPrincipal: val } : item))
                                  );
                                }}
                                className="w-full bg-slate-50/70 border border-slate-250 focus:border-red-500 focus:bg-white rounded-lg p-2.5 text-xs text-slate-800 outline-none transition resize-none leading-relaxed"
                              />
                            </div>

                            {/* 2. Impactos e Danos */}
                            <div>
                              <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700 mb-1">
                                <span>🛑</span> Impactos e Danos:
                              </label>
                              <textarea
                                rows={3}
                                placeholder="* Acúmulo de Material e Travamento: O transbordo gerou acúmulo de minério no retorno do transportador TC001 e no seu tambor de acionamento, travando o equipamento.&#10;* Dano Físico: Rompimento do cabo da chave de emergência da correia do TC001."
                                value={oc.impactosDanos}
                                onChange={e => {
                                  const val = e.target.value;
                                  setOcorrencias(p =>
                                    p.map(item => (item.id === oc.id ? { ...item, impactosDanos: val } : item))
                                  );
                                }}
                                className="w-full bg-slate-50/70 border border-slate-250 focus:border-red-500 focus:bg-white rounded-lg p-2.5 text-xs text-slate-800 outline-none transition resize-none leading-relaxed"
                              />
                            </div>

                            {/* 3. Ações Realizadas */}
                            <div>
                              <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700 mb-1">
                                <span>🔧</span> Ações Realizadas:
                              </label>
                              <textarea
                                rows={4}
                                placeholder="* Limpeza Mecânica/Operacional: Realizada a limpeza do minério no retorno e no acionamento do TC001.&#10;* Desobstrução: Chutes de descarga do TC005 e da PE006 foram totalmente desobstruídos.&#10;* Atuação da Elétrica:&#10;  ◦ Reparo e liberação da chave de emergência do TC001.&#10;  ◦ Manutenção no sensor da posição 02 do Silo 01..."
                                value={oc.acoesRealizadas}
                                onChange={e => {
                                  const val = e.target.value;
                                  setOcorrencias(p =>
                                    p.map(item => (item.id === oc.id ? { ...item, acoesRealizadas: val } : item))
                                  );
                                }}
                                className="w-full bg-slate-50/70 border border-slate-250 focus:border-red-500 focus:bg-white rounded-lg p-2.5 text-xs text-slate-800 outline-none transition resize-none leading-relaxed"
                              />
                            </div>

                            {/* 4. Linha do Tempo */}
                            <div>
                              <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700 mb-1">
                                <span>⏱️</span> Linha do Tempo:
                              </label>
                              <textarea
                                rows={3}
                                placeholder="* 18h44: Rebritagem parada (transbordo e travamento do TC001).&#10;* 20h00: Manutenção elétrica finalizada na chave de emergência.&#10;* 20h55: Equipamentos liberados e rebritagem retoma operação em modo by-pass."
                                value={oc.linhaDoTempo}
                                onChange={e => {
                                  const val = e.target.value;
                                  setOcorrencias(p =>
                                    p.map(item => (item.id === oc.id ? { ...item, linhaDoTempo: val } : item))
                                  );
                                }}
                                className="w-full bg-slate-50/70 border border-slate-250 focus:border-red-500 focus:bg-white rounded-lg p-2.5 text-xs text-slate-800 outline-none transition resize-none leading-relaxed"
                              />
                            </div>

                            {/* 5. Condição Operacional e Restrições (Status Atual) */}
                            <div>
                              <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700 mb-1">
                                <span>⚠️</span> Condição Operacional e Restrições (Status Atual):
                              </label>
                              <textarea
                                rows={3}
                                placeholder="A rebritagem encontra-se em operação no modo by-pass. Devido à falha contínua do sensor do Silo 01 (posição 02), a operação está rodando sob controle manual: o nível no supervisório está sendo mantido abaixo de 40% para compensar a divergência de leitura e evitar um novo transbordo."
                                value={oc.condicaoRestricoes}
                                onChange={e => {
                                  const val = e.target.value;
                                  setOcorrencias(p =>
                                    p.map(item => (item.id === oc.id ? { ...item, condicaoRestricoes: val } : item))
                                  );
                                }}
                                className="w-full bg-slate-50/70 border border-slate-250 focus:border-red-500 focus:bg-white rounded-lg p-2.5 text-xs text-slate-800 outline-none transition resize-none leading-relaxed"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Acoes Proximo Turno list */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-blue-600" />
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Ações Recomendadas (Próximo Turno)
                      </p>
                    </div>

                    <div className="space-y-2">
                      {acoes.map((acao, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            type="text"
                            placeholder={`Ação recomendada nº ${i + 1}...`}
                            value={acao}
                            onChange={e =>
                              setAcoes(p => p.map((val, idx) => (idx === i ? e.target.value : val)))
                            }
                            className="flex-1 bg-white border border-slate-250 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none transition"
                          />
                          {acoes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setAcoes(p => p.filter((_, idx) => idx !== i))}
                              className="p-2 border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setAcoes(p => [...p, ""])}
                      className="text-blue-600 font-bold text-xs hover:text-blue-500 transition-all flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Adicionar Ação Operativa
                    </button>
                  </div>

                  {/* Observacao Textarea Card */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Comentários Operacionais Gerais
                      </p>
                    </div>
                    <textarea
                      rows={4}
                      placeholder="Contexto adicional, destaques positivos de segurança, produtividade e alertas gerais para supervisão e gerência..."
                      value={obs}
                      onChange={e => setObs(e.target.value)}
                      className="w-full bg-white border border-slate-250 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-3 text-sm text-slate-800 outline-none transition resize-none leading-relaxed"
                    />
                  </div>

                  {/* Action buttons: WhatsApp copy and PDF Download */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleGerarRelatorio}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-4 font-black tracking-normal text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Clipboard className="h-5 w-5" />
                      Gerar e Copiar para WhatsApp
                    </button>

                    <button
                      type="button"
                      onClick={handleBaixarPdf}
                      disabled={baixandoPdf}
                      className="w-full bg-blue-700 hover:bg-blue-600 text-white rounded-xl py-4 font-black tracking-normal text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                    >
                      {baixandoPdf ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Gerando PDF...</span>
                        </>
                      ) : (
                        <>
                          <FileDown className="h-5 w-5" />
                          <span>Baixar Relatório em PDF</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TELA: RELATORIO GENERATED PREVIEW */}
          {tela === "relatorio" && (
            <motion.div
              key="relatorio"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col justify-between h-full flex-1"
            >
              <div>
                {/* Header Navbar copy status banner */}
                <div className={`p-6 shadow-md transition-all duration-400 ${
                  copiado
                    ? "bg-gradient-to-br from-emerald-600 to-teal-700"
                    : "bg-gradient-to-br from-teal-500 to-emerald-600"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => setTela("finalizar")}
                      className="bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-1.5 rounded-lg text-xs leading-none transition flex items-center gap-1 border-0 outline-none cursor-pointer"
                    >
                      <ArrowLeft className="h-3 w-3" /> Voltar
                    </button>
                    <button
                      type="button"
                      onClick={toggleModoWeb}
                      className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 border border-white/20 cursor-pointer"
                      title={modoWeb ? "Alternar para modo móvel" : "Configurar página para Web / Desktop"}
                    >
                      {modoWeb ? (
                        <>
                          <Smartphone className="h-3.5 w-3.5 text-emerald-200" />
                          <span>Modo Celular</span>
                        </>
                      ) : (
                        <>
                          <Monitor className="h-3.5 w-3.5 text-emerald-200" />
                          <span>Configurar Web</span>
                        </>
                      )}
                    </button>
                  </div>
                  <h2 className="text-2xl font-black text-white leading-none">
                    {copiado ? "✅ Texto Copiado!" : "Relatório Pronto"}
                  </h2>
                  <p className="text-xs text-teal-100/85 mt-1.5 font-medium">
                    {copiado ? "Cole agora diretamente no seu grupo operativo" : "Toque para copiar o relatório e colar no grupo ou baixe o PDF"}
                  </p>
                </div>

                <div className={`p-4 ${modoWeb ? "grid grid-cols-1 lg:grid-cols-2 gap-6 items-start" : "space-y-4"}`}>
                  <div className="space-y-4">
                    {/* Copiado Quick Instruction card */}
                    {copiado && (
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3.5 items-start"
                      >
                        <div className="text-2xl leading-none">📱</div>
                        <div>
                          <p className="text-xs font-bold text-emerald-800">Instruções de Como Colar:</p>
                          <ul className="text-xs text-emerald-700 mt-1 space-y-0.5 leading-relaxed font-semibold font-mono">
                            <li>1. Abra o <strong className="text-emerald-900 font-bold">WhatsApp</strong></li>
                            <li>2. Entre no canal/grupo do turno</li>
                            <li>3. Pressione a caixa de mensagem e toque em <strong className="text-emerald-900 font-bold">Colar</strong></li>
                          </ul>
                        </div>
                      </motion.div>
                    )}

                    {/* Main Master Copier Action Trigger */}
                    <button
                      type="button"
                      onClick={copiar}
                      className={`w-full py-4 text-sm font-black rounded-xl border flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-md active:scale-98 ${
                        copiado
                          ? "bg-emerald-800 text-white border-emerald-600"
                          : "bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-400"
                      }`}
                    >
                      <Copy className="h-5 w-5" />
                      {copiado ? "Texto Copiado com Sucesso!" : "Copiar para o Clipboard"}
                    </button>

                    {/* Download Shift Report PDF Button */}
                    <button
                      type="button"
                      onClick={handleBaixarPdf}
                      disabled={baixandoPdf}
                      className="w-full bg-blue-700 hover:bg-blue-600 text-white rounded-xl py-3.5 font-bold tracking-normal text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-75"
                    >
                      {baixandoPdf ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Gerando PDF Oficial...</span>
                        </>
                      ) : (
                        <>
                          <FileDown className="h-5 w-5 text-blue-200" />
                          <span>Baixar Relatório de Turno em PDF</span>
                        </>
                      )}
                    </button>

                    {/* Reset New shift form button */}
                    <button
                      type="button"
                      onClick={reiniciar}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 hover:text-slate-800 font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2.5 cursor-pointer text-xs uppercase tracking-wider"
                    >
                      <RotateCcw className="h-4 w-4" /> Iniciar Novo Turno
                    </button>
                  </div>

                  {/* Code-styled raw content preview card */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-1.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Visualização Prévia do Relatório
                      </p>
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded border border-slate-250">
                        {wpp.length} CHARS
                      </span>
                    </div>
                    <pre className={`text-left font-mono text-[12px] leading-relaxed text-slate-700 select-all whitespace-pre-wrap word-break break-all overflow-y-auto pr-1 bg-white p-3 rounded-xl border border-slate-200 scrollbar-thin ${
                      modoWeb ? "max-h-[550px]" : "max-h-[350px]"
                    }`}>
                      {wpp}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      )}

      {/* Floating Web / Mobile view mode toggle */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          type="button"
          onClick={toggleModoWeb}
          className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-900 text-white px-4 py-2.5 rounded-full shadow-xl border border-slate-700/80 backdrop-blur-md text-xs font-bold transition-all transform hover:scale-105 active:scale-95 cursor-pointer group"
          title={modoWeb ? "Alternar para visualização móvel compacta" : "Configurar layout expandido para Web / Desktop"}
        >
          {modoWeb ? (
            <>
              <Smartphone className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition" />
              <span>Modo Celular</span>
            </>
          ) : (
            <>
              <Monitor className="h-4 w-4 text-teal-400 group-hover:scale-110 transition" />
              <span>Configurar para Web</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
