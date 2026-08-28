/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Calendar,
  User,
  Layers,
  Flag,
  Target,
  Edit2,
  Sparkles,
  Search,
  BarChart2,
  ListOrdered
} from "lucide-react";
import {
  DiretrizSupervisorTurno,
  PrioridadeDiretriz,
  StatusDiretriz,
  CircuitoTipo,
  AlocacaoSemanalTurnos,
  DIAS_CHAVES_GANTT,
  normalizarAlocacaoTurnos,
  obterDiasAlocadosNumeros,
  formatarResumoAlocacao
} from "../typesAdm";
import { AdmGanttChartView } from "./AdmGanttChartView";

interface AdmDirectivesManagerProps {
  circuitoTipo?: CircuitoTipo;
  diretrizes: DiretrizSupervisorTurno[];
  onChange: (diretrizes: DiretrizSupervisorTurno[]) => void;
}

export const AdmDirectivesManager: React.FC<AdmDirectivesManagerProps> = ({ circuitoTipo = "seco", diretrizes, onChange }) => {
  const isSeco = circuitoTipo === "seco";
  const [activeSubTab, setActiveSubTab] = useState<"lista" | "gantt">("lista");
  const [mostrarFiltros, setMostrarFiltros] = useState<boolean>(false);
  const [filtroTurma, setFiltroTurma] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("todos");
  const [busca, setBusca] = useState<string>("");
  
  // Estado para modal/formulário de nova diretriz
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formSetor, setFormSetor] = useState<string>(isSeco ? "Britagem Primária" : "Moagem & Ciclones");
  const [formAcao, setFormAcao] = useState<string>("");
  const [formTurma, setFormTurma] = useState<string>("Todas as Turmas");
  const [formSupervisor, setFormSupervisor] = useState<string>("");
  const [formPrazo, setFormPrazo] = useState<string>("");
  const [formDateTime, setFormDateTime] = useState<string>("");
  const [formPrioridade, setFormPrioridade] = useState<PrioridadeDiretriz>("alta");
  const [formMeta, setFormMeta] = useState<string>("");
  const [formObs, setFormObs] = useState<string>("");
  const [formDiaInicio, setFormDiaInicio] = useState<number>(1);
  const [formDiaFim, setFormDiaFim] = useState<number>(7);
  const [formProgresso, setFormProgresso] = useState<number>(0);
  const [formRecursosPessoais, setFormRecursosPessoais] = useState<string>("ADM / OPERAÇÃO");
  const [formAlocacaoTurnos, setFormAlocacaoTurnos] = useState<AlocacaoSemanalTurnos>({
    seg: { diurno: true, noturno: false },
    ter: { diurno: true, noturno: false },
    qua: { diurno: true, noturno: false },
    qui: { diurno: true, noturno: false },
    sex: { diurno: true, noturno: false },
    sab: { diurno: false, noturno: false },
    dom: { diurno: false, noturno: false }
  });

  const toggleTurnoDia = (diaKey: keyof AlocacaoSemanalTurnos, turno: "diurno" | "noturno") => {
    setFormAlocacaoTurnos(prev => {
      const diaAtual = prev[diaKey] || { diurno: false, noturno: false };
      return {
        ...prev,
        [diaKey]: {
          ...diaAtual,
          [turno]: !diaAtual[turno]
        }
      };
    });
  };

  const toggleDiaCompleto = (diaKey: keyof AlocacaoSemanalTurnos) => {
    setFormAlocacaoTurnos(prev => {
      const diaAtual = prev[diaKey] || { diurno: false, noturno: false };
      const ambosAtivos = diaAtual.diurno && diaAtual.noturno;
      return {
        ...prev,
        [diaKey]: {
          diurno: !ambosAtivos,
          noturno: !ambosAtivos
        }
      };
    });
  };

  // Helper para formatar datetime-local para texto amigável de turno
  const formatDateTimeToPrazo = (dtStr: string): string => {
    if (!dtStr) return "";
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return dtStr;

    const now = new Date();
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow =
      d.getFullYear() === tomorrow.getFullYear() &&
      d.getMonth() === tomorrow.getMonth() &&
      d.getDate() === tomorrow.getDate();

    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");

    if (isToday) {
      return `Hoje até ${hh}:${mm}`;
    }
    if (isTomorrow) {
      return `Amanhã até ${hh}:${mm}`;
    }
    return `${dia}/${mes} às ${hh}:${mm}`;
  };

  const getDayOfWeek1to7 = (d: Date): number => {
    const day = d.getDay(); // 0 = Domingo, 1 = Segunda, ...
    return day === 0 ? 7 : day;
  };

  const handleDateTimeChange = (val: string) => {
    setFormDateTime(val);
    if (val) {
      const formatted = formatDateTimeToPrazo(val);
      setFormPrazo(formatted);
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        const dayNum = getDayOfWeek1to7(d);
        setFormDiaFim(dayNum);
        if (formDiaInicio > dayNum) {
          setFormDiaInicio(dayNum);
        }
      }
    }
  };

  // Setores de acordo com o circuito
  const setoresOpcoes = isSeco
    ? [
        "Britagem Primária",
        "Rebritagem & Peneiramento",
        "Pátios ROM & Pilhas",
        "Silos de Finos & Alimentação",
        "Blindagem Fim de Semana",
        "Segurança & Meio Ambiente",
        "Manutenção Mecânica / Elétrica"
      ]
    : [
        "Moagem & Ciclones",
        "Flotação de Cobre",
        "Espessamento Concentrado",
        "Espessamento Rejeito",
        "Filtragem & Desaguamento",
        "ETA — Estação de Tratamento de Água",
        "Planejamento Fim de Semana",
        "Segurança & Meio Ambiente",
        "Laboratório & Metalurgia"
      ];

  const turmasOpcoes = [
    "Todas as Turmas",
    "Turma A",
    "Turma B",
    "Turma C",
    "Turma D",
    "Supervisão Diurna",
    "Supervisão Noturna",
    "Plantão Final de Semana"
  ];

  const diasNomes = [
    { num: 1, label: "Segunda-feira" },
    { num: 2, label: "Terça-feira" },
    { num: 3, label: "Quarta-feira" },
    { num: 4, label: "Quinta-feira" },
    { num: 5, label: "Sexta-feira" },
    { num: 6, label: "Sábado" },
    { num: 7, label: "Domingo" }
  ];

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormSetor(isSeco ? "Britagem Primária" : "Moagem & Ciclones");
    setFormAcao("");
    setFormTurma("Todas as Turmas");
    setFormSupervisor("");
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    setFormDateTime(`${yyyy}-${mm}-${dd}T18:00`);
    setFormPrazo("Hoje até 18:00");
    setFormPrioridade("alta");
    setFormMeta("");
    setFormObs("");
    setFormDiaInicio(1);
    setFormDiaFim(7);
    setFormProgresso(0);
    setFormRecursosPessoais("ADM / OPERAÇÃO");
    setFormAlocacaoTurnos({
      seg: { diurno: true, noturno: false },
      ter: { diurno: true, noturno: false },
      qua: { diurno: true, noturno: false },
      qui: { diurno: true, noturno: false },
      sex: { diurno: true, noturno: false },
      sab: { diurno: false, noturno: false },
      dom: { diurno: false, noturno: false }
    });
    setShowModal(true);
  };

  const handleOpenEdit = (d: DiretrizSupervisorTurno) => {
    setEditingId(d.id);
    setFormSetor(d.setor);
    setFormAcao(d.acaoEstrategica);
    setFormTurma(d.responsavelTurma);
    setFormSupervisor(d.supervisorNome || "");
    setFormPrazo(d.prazoLimite);
    setFormDateTime("");
    setFormPrioridade(d.prioridade);
    setFormMeta(d.metaEsperada);
    setFormObs(d.observacoes || "");
    setFormDiaInicio(d.diaInicioNum || 1);
    setFormDiaFim(d.diaFimNum || 7);
    setFormProgresso(d.progresso !== undefined ? d.progresso : (d.status === "concluido" ? 100 : d.status === "em_andamento" ? 50 : 0));
    setFormRecursosPessoais(d.recursosPessoais || "ADM / OPERAÇÃO");
    setFormAlocacaoTurnos(normalizarAlocacaoTurnos(d.alocacaoTurnos, d.diaInicioNum, d.diaFimNum, d.diasAlocados));
    setShowModal(true);
  };

  const handleSaveDiretriz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAcao.trim() || !formPrazo.trim()) return;

    const diasAlocadosCalc = obterDiasAlocadosNumeros(formAlocacaoTurnos);
    const diaIniCalc = diasAlocadosCalc.length > 0 ? Math.min(...diasAlocadosCalc) : formDiaInicio;
    const diaFimCalc = diasAlocadosCalc.length > 0 ? Math.max(...diasAlocadosCalc) : formDiaFim;

    if (editingId) {
      onChange(
        diretrizes.map(d =>
          d.id === editingId
            ? {
                ...d,
                setor: formSetor,
                acaoEstrategica: formAcao.trim(),
                responsavelTurma: formTurma,
                supervisorNome: formSupervisor.trim(),
                prazoLimite: formPrazo.trim(),
                prioridade: formPrioridade,
                metaEsperada: formMeta.trim(),
                observacoes: formObs.trim(),
                diaInicioNum: diaIniCalc,
                diaFimNum: diaFimCalc,
                diasAlocados: diasAlocadosCalc,
                alocacaoTurnos: formAlocacaoTurnos,
                recursosPessoais: formRecursosPessoais.trim() || "ADM / OPERAÇÃO",
                progresso: Number(formProgresso),
                status: Number(formProgresso) >= 100 ? "concluido" : Number(formProgresso) > 0 ? "em_andamento" : d.status
              }
            : d
        )
      );
    } else {
      const nova: DiretrizSupervisorTurno = {
        id: "dir_" + Date.now(),
        setor: formSetor,
        acaoEstrategica: formAcao.trim(),
        responsavelTurma: formTurma,
        supervisorNome: formSupervisor.trim(),
        prazoLimite: formPrazo.trim(),
        prioridade: formPrioridade,
        metaEsperada: formMeta.trim(),
        status: Number(formProgresso) >= 100 ? "concluido" : Number(formProgresso) > 0 ? "em_andamento" : "pendente",
        diaInicioNum: diaIniCalc,
        diaFimNum: diaFimCalc,
        diasAlocados: diasAlocadosCalc,
        alocacaoTurnos: formAlocacaoTurnos,
        recursosPessoais: formRecursosPessoais.trim() || "ADM / OPERAÇÃO",
        progresso: Number(formProgresso),
        observacoes: formObs.trim()
      };
      onChange([...diretrizes, nova]);
    }
    setShowModal(false);
  };

  const toggleStatus = (id: string) => {
    onChange(
      diretrizes.map(d => {
        if (d.id !== id) return d;
        const nextStatus: StatusDiretriz =
          d.status === "pendente"
            ? "em_andamento"
            : d.status === "em_andamento"
            ? "concluido"
            : "pendente";
        const nextProg = nextStatus === "concluido" ? 100 : nextStatus === "em_andamento" ? 50 : 0;
        return { ...d, status: nextStatus, progresso: nextProg };
      })
    );
  };

  // Estado para confirmação de exclusão
  const [deleteCandidate, setDeleteCandidate] = useState<DiretrizSupervisorTurno | null>(null);

  const confirmDelete = () => {
    if (deleteCandidate) {
      onChange(diretrizes.filter(d => d.id !== deleteCandidate.id));
      setDeleteCandidate(null);
    }
  };

  const filteredDiretrizes = diretrizes.filter(d => {
    if (filtroTurma !== "todos" && d.responsavelTurma !== filtroTurma) return false;
    if (filtroStatus !== "todos" && d.status !== filtroStatus) return false;
    if (filtroPrioridade !== "todos" && d.prioridade !== filtroPrioridade) return false;
    if (busca.trim()) {
      const termo = busca.toLowerCase();
      const matchSetor = d.setor.toLowerCase().includes(termo);
      const matchAcao = d.acaoEstrategica.toLowerCase().includes(termo);
      const matchTurma = d.responsavelTurma.toLowerCase().includes(termo);
      const matchSup = (d.supervisorNome || "").toLowerCase().includes(termo);
      return matchSetor || matchAcao || matchTurma || matchSup;
    }
    return true;
  });

  const countCriticas = diretrizes.filter(d => d.prioridade === "critica" && d.status !== "concluido").length;
  const countEmAndamento = diretrizes.filter(d => d.status === "em_andamento").length;
  const countConcluidas = diretrizes.filter(d => d.status === "concluido").length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Bar */}
      <div className="bg-white text-slate-900 rounded-2xl p-6 border border-slate-200 shadow-xs border-l-4 border-l-[#007369]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#007369] text-white text-[11px] font-bold px-2.5 py-0.5 rounded flex items-center gap-1 shadow-xs">
                <Target className="w-3.5 h-3.5" />
                MATRIZ ESTRATÉGICA &amp; CRONOGRAMA GANTT
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                {isSeco ? "Circuito Seco (Cominuição)" : "Circuito Úmido (Beneficiamento)"}
              </span>
            </div>
            <h2 className="text-xl font-black mt-1.5 text-slate-900 tracking-tight">
              Diretrizes Táticas de Turno &amp; Acompanhamento Semanal
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
              Definição de prioridades, metas de processo, prazos por turma e cronograma Gantt para execução rigorosa dos turnos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Alternador Lista / Gantt */}
            <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveSubTab("lista")}
                className={`px-3 py-1.5 rounded-md font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === "lista"
                    ? "bg-[#0A2028] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Lista de Diretrizes</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab("gantt")}
                className={`px-3 py-1.5 rounded-md font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === "gantt"
                    ? "bg-[#0A2028] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Gráfico de Gantt</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                  mostrarFiltros || busca || filtroTurma !== "todos" || filtroPrioridade !== "todos" || filtroStatus !== "todos"
                    ? "bg-teal-50 border-teal-300 text-[#007369]"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                title={mostrarFiltros ? "Ocultar filtros e busca" : "Mostrar filtros e busca"}
              >
                <Search className="w-3.5 h-3.5" />
                <span>{mostrarFiltros ? "Ocultar Filtros" : "Filtrar & Buscar"}</span>
                {(busca || filtroTurma !== "todos" || filtroPrioridade !== "todos" || filtroStatus !== "todos") && (
                  <span className="w-2 h-2 rounded-full bg-teal-600 ml-0.5"></span>
                )}
              </button>

              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 bg-[#007369] hover:bg-[#00897B] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Diretriz</span>
              </button>
            </div>
          </div>
        </div>

        {/* Resumo Rápido de Status */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Total de Ações:</span>
            <span className="text-slate-900 font-bold">{diretrizes.length}</span>
          </div>
          <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-200 flex items-center justify-between">
            <span className="text-rose-700 font-medium">Críticas Pendentes:</span>
            <span className="text-rose-900 font-bold">{countCriticas}</span>
          </div>
          <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 flex items-center justify-between">
            <span className="text-amber-700 font-medium">Em Andamento:</span>
            <span className="text-amber-900 font-bold">{countEmAndamento}</span>
          </div>
          <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between">
            <span className="text-emerald-700 font-medium">Concluídas:</span>
            <span className="text-emerald-900 font-bold">{countConcluidas}</span>
          </div>
        </div>
      </div>

      {/* RENDERIZAÇÃO DA SUB-ABA ATIVA */}
      {activeSubTab === "gantt" ? (
        <AdmGanttChartView
          circuitoTipo={circuitoTipo}
          diretrizes={diretrizes}
        />
      ) : (
        <>
          {/* Filters and Search Bar (Ocultável) */}
          {mostrarFiltros && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 animate-in fade-in duration-150">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search Box */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar ação, setor, responsável ou supervisor..."
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white transition"
                  />
                </div>

                {/* Filtro Turma */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="font-semibold text-slate-500 whitespace-nowrap">Turma:</span>
                  <select
                    value={filtroTurma}
                    onChange={e => setFiltroTurma(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
                  >
                    <option value="todos">Todas as Turmas</option>
                    {turmasOpcoes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro Prioridade */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="font-semibold text-slate-500 whitespace-nowrap">Prioridade:</span>
                  <select
                    value={filtroPrioridade}
                    onChange={e => setFiltroPrioridade(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
                  >
                    <option value="todos">Todas</option>
                    <option value="critica">🔴 Crítica</option>
                    <option value="alta">🟡 Alta</option>
                    <option value="media">🔵 Média</option>
                  </select>
                </div>

                {/* Filtro Status */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="font-semibold text-slate-500 whitespace-nowrap">Status:</span>
                  <select
                    value={filtroStatus}
                    onChange={e => setFiltroStatus(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
                  >
                    <option value="todos">Todos</option>
                    <option value="pendente">📌 Pendente</option>
                    <option value="em_andamento">⏳ Em Andamento</option>
                    <option value="concluido">✅ Concluído</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Directives Cards List */}
          <div className="space-y-3">
            {filteredDiretrizes.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center">
                <Target className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Nenhuma diretriz encontrada com os filtros selecionados</p>
                <p className="text-xs text-slate-500 mt-1">Adicione novas ações ou redefina os filtros acima para visualizar as tarefas.</p>
              </div>
            ) : (
              filteredDiretrizes.map((dir) => {
                const isCritica = dir.prioridade === "critica";
                const isAlta = dir.prioridade === "alta";
                const isConcluido = dir.status === "concluido";
                const isEmAndamento = dir.status === "em_andamento";
                const progresso = dir.progresso !== undefined ? dir.progresso : (isConcluido ? 100 : isEmAndamento ? 50 : 0);

                return (
                  <div
                    key={dir.id}
                    className={`bg-white rounded-xl p-4 border transition duration-150 ${
                      isConcluido
                        ? "border-emerald-200 bg-emerald-50/20 opacity-80"
                        : isCritica
                        ? "border-rose-300 shadow-xs ring-1 ring-rose-200"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        {/* Header tags */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-slate-200">
                            {dir.setor}
                          </span>

                          {/* Prioridade Badge */}
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 ${
                              isCritica
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : isAlta
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-blue-100 text-blue-800 border border-blue-200"
                            }`}
                          >
                            <Flag className="w-3 h-3" />
                            {isCritica ? "CRÍTICA" : isAlta ? "ALTA" : "MÉDIA"}
                          </span>

                          {/* Responsável Turma Badge */}
                          <span className="bg-slate-800 text-teal-300 text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                            <User className="w-3 h-3 text-teal-400" />
                            <span>{dir.responsavelTurma}</span>
                            {dir.supervisorNome && (
                              <span className="text-slate-300 font-normal">({dir.supervisorNome})</span>
                            )}
                          </span>

                          {/* Prazo Limite */}
                          <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>Prazo: {dir.prazoLimite}</span>
                          </span>

                          {/* Badge Gantt Dias & Turnos (Alternados / Intervalo) */}
                          <span className="bg-teal-50 text-teal-900 border border-teal-200 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-teal-600" />
                            <span>
                              {dir.alocacaoTurnos
                                ? formatarResumoAlocacao(dir.alocacaoTurnos)
                                : `${diasNomes[(dir.diaInicioNum || 1) - 1]?.label.slice(0, 3)} → ${diasNomes[(dir.diaFimNum || 7) - 1]?.label.slice(0, 3)}`}
                            </span>
                          </span>

                          {/* Badge Recursos Pessoais */}
                          {dir.recursosPessoais && (
                            <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span>👥 {dir.recursosPessoais}</span>
                            </span>
                          )}
                        </div>

                        {/* Ação Estratégica */}
                        <p className={`text-sm font-semibold text-slate-900 leading-relaxed ${isConcluido ? "line-through text-slate-400" : ""}`}>
                          {dir.acaoEstrategica}
                        </p>

                        {/* Meta Esperada */}
                        {dir.metaEsperada && (
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-slate-900">Meta / Critério de Sucesso: </span>
                              <span>{dir.metaEsperada}</span>
                            </div>
                          </div>
                        )}

                        {/* Observações de Apoio */}
                        {dir.observacoes && (
                          <p className="text-[11px] text-slate-500 italic pl-1">
                            Obs: {dir.observacoes}
                          </p>
                        )}

                        {/* Barra de Progresso Gantt */}
                        <div className="pt-1 flex items-center gap-3">
                          <span className="text-[11px] font-bold text-slate-600 shrink-0">Progresso ({progresso}%):</span>
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isConcluido ? "bg-teal-600" : isCritica ? "bg-rose-500" : "bg-[#007369]"
                              }`}
                              style={{ width: `${progresso}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex md:flex-col items-center gap-1.5 shrink-0 self-end md:self-start">
                        <button
                          type="button"
                          onClick={() => toggleStatus(dir.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            isConcluido
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : isEmAndamento
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isConcluido ? "Concluído" : isEmAndamento ? "Em Execução" : "Marcar Execução"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(dir)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          title="Editar Diretriz"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteCandidate(dir)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Excluir Diretriz"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Modal / Formulário de Criação & Edição */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150 text-slate-900 max-h-[94vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold bg-[#0A2028] text-white px-2 py-0.5 rounded">
                  {isSeco ? "CIRCUITO SECO (COMINUIÇÃO)" : "CIRCUITO ÚMIDO (BENEFICIAMENTO)"}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {editingId ? "Editar Diretriz Operacional & Gantt" : "Nova Diretriz Estratégica de Turno"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDiretriz} className="space-y-3.5">
              {/* Setor e Prioridade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Setor Operacional</label>
                  <select
                    value={formSetor}
                    onChange={e => setFormSetor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  >
                    {setoresOpcoes.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Grau de Prioridade</label>
                  <select
                    value={formPrioridade}
                    onChange={e => setFormPrioridade(e.target.value as PrioridadeDiretriz)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  >
                    <option value="critica">🔴 Prioridade Crítica (P1)</option>
                    <option value="alta">🟡 Prioridade Alta (P2)</option>
                    <option value="media">🔵 Prioridade Média (P3)</option>
                  </select>
                </div>
              </div>

              {/* Ação Estratégica */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ação Estratégica / Comando Operacional <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Realizar aferição do britador primário e manter taxa > 1.000 t/h durante o turno diurno..."
                  value={formAcao}
                  onChange={e => setFormAcao(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-normal focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              {/* Responsável Turma e Supervisor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Turma Responsável</label>
                  <select
                    value={formTurma}
                    onChange={e => setFormTurma(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  >
                    {turmasOpcoes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supervisor Específico (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Sup. Roberto / Plantonista"
                    value={formSupervisor}
                    onChange={e => setFormSupervisor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Configuração do Cronograma Gantt Semanal (Alocação em Dias Alternados e Turnos - Conforme Matriz 5S) */}
              <div className="bg-white text-slate-800 p-4 rounded-xl border border-slate-300 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-200 pb-2.5">
                  <div>
                    <span className="text-xs font-extrabold text-[#007369] uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#007369]" />
                      Cronograma Semanal • Alocação em Dias & Horários (Gantt)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Clique nos turnos (07h:19h ou 19h:07h) para alocar a atividade em dias alternados ou contínuos.
                    </p>
                  </div>

                  {/* Resumo da Alocação */}
                  <div className="flex items-center gap-2">
                    <span className="bg-teal-50 text-teal-900 text-[11px] font-bold px-2.5 py-1 rounded-md border border-teal-200 whitespace-nowrap">
                      {formatarResumoAlocacao(formAlocacaoTurnos)}
                    </span>
                  </div>
                </div>

                {/* Matriz Visual Semanal (14 colunas proporcionais com 100% de largura sem cortes) */}
                <div className="w-full rounded-lg border border-slate-300 bg-white overflow-hidden shadow-2xs">
                  <table className="w-full table-fixed text-center border-collapse text-[10px]">
                    <thead>
                      {/* Linha 1: Título dos Dias */}
                      <tr className="bg-[#004D40] text-white font-extrabold uppercase divide-x divide-slate-700 border-b border-slate-700">
                        {DIAS_CHAVES_GANTT.map(dia => {
                          const isFds = dia.num === 6 || dia.num === 7;
                          const diaObj = formAlocacaoTurnos[dia.key];
                          const estaAtivo = diaObj?.diurno || diaObj?.noturno;
                          const siglaCurta = dia.key.toUpperCase();
                          const nomeCompleto = dia.label.split("-")[0];

                          return (
                            <th
                              key={dia.key}
                              colSpan={2}
                              className={`py-1.5 px-0.5 cursor-pointer transition select-none ${
                                isFds ? "bg-[#8D4B12] text-amber-100 hover:bg-[#A35919]" : "bg-[#0A4D54] hover:bg-[#0E626B]"
                              }`}
                              onClick={() => toggleDiaCompleto(dia.key)}
                              title={`Clique para alternar todos os turnos de ${nomeCompleto}`}
                            >
                              <div className="flex items-center justify-center gap-1">
                                <span className="hidden md:inline">{nomeCompleto}</span>
                                <span className="md:hidden">{siglaCurta}</span>
                                {estaAtivo && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />}
                              </div>
                            </th>
                          );
                        })}
                      </tr>

                      {/* Linha 2: Sub-cabeçalhos de Horários (07h:19h e 19h:07h) */}
                      <tr className="bg-slate-100 text-slate-700 font-bold divide-x divide-slate-200 border-b border-slate-300 text-[8.5px] sm:text-[9px]">
                        {DIAS_CHAVES_GANTT.map(dia => {
                          const isFds = dia.num === 6 || dia.num === 7;
                          return (
                            <React.Fragment key={dia.key + "_sub"}>
                              <th className={`py-1 px-0.5 w-[7.142%] ${isFds ? "bg-amber-100/70 text-amber-900" : "bg-slate-100"}`}>
                                07h:19h
                              </th>
                              <th className={`py-1 px-0.5 w-[7.142%] ${isFds ? "bg-amber-100/50 text-amber-800" : "bg-slate-50"}`}>
                                19h:07h
                              </th>
                            </React.Fragment>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Linha de Seleção dos Turnos (Botões Interativos com X em Verde Floresta) */}
                      <tr className="divide-x divide-slate-200 bg-white">
                        {DIAS_CHAVES_GANTT.map(dia => {
                          const diaObj = formAlocacaoTurnos[dia.key] || { diurno: false, noturno: false };
                          const isDiurno = Boolean(diaObj.diurno);
                          const isNoturno = Boolean(diaObj.noturno);

                          return (
                            <React.Fragment key={dia.key + "_cells"}>
                              {/* Célula Diurno (07h:19h) */}
                              <td className="p-0.5 sm:p-1 w-[7.142%]">
                                <button
                                  type="button"
                                  onClick={() => toggleTurnoDia(dia.key, "diurno")}
                                  className={`w-full h-8 sm:h-9 rounded font-black text-xs transition duration-150 cursor-pointer flex items-center justify-center ${
                                    isDiurno
                                      ? "bg-[#1E7E34] hover:bg-[#19692C] text-white shadow-xs"
                                      : "bg-slate-100 hover:bg-slate-200 text-slate-400 border border-slate-200"
                                  }`}
                                  title={`${dia.label} - Turno Diurno (07h:19h)`}
                                >
                                  {isDiurno ? "X" : "+"}
                                </button>
                              </td>

                              {/* Célula Noturno (19h:07h) */}
                              <td className="p-0.5 sm:p-1 w-[7.142%]">
                                <button
                                  type="button"
                                  onClick={() => toggleTurnoDia(dia.key, "noturno")}
                                  className={`w-full h-8 sm:h-9 rounded font-black text-xs transition duration-150 cursor-pointer flex items-center justify-center ${
                                    isNoturno
                                      ? "bg-[#1E7E34] hover:bg-[#19692C] text-white shadow-xs"
                                      : "bg-slate-100 hover:bg-slate-200 text-slate-400 border border-slate-200"
                                  }`}
                                  title={`${dia.label} - Turno Noturno (19h:07h)`}
                                >
                                  {isNoturno ? "X" : "+"}
                                </button>
                              </td>
                            </React.Fragment>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Linha Inferior: Recursos Pessoais + Progresso (%) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      👥 Recursos Pessoais / Equipe Alocada:
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: ADM, Operação, Mecânica, Limpeza 5S..."
                      value={formRecursosPessoais}
                      onChange={e => setFormRecursosPessoais(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Progresso da Execução:
                      </label>
                      <span className="text-xs font-bold text-[#007369]">{formProgresso}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={formProgresso}
                      onChange={e => setFormProgresso(Number(e.target.value))}
                      className="w-full accent-[#007369] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Prazo Limite com Calendário & Horário */}
              <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#007369]" />
                    <span>Prazo Limite & Horário de Conclusão</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Preenchimento automático via calendário com horário
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Seletor de Data & Hora Nativo (Calendário com Horário) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      📅 Selecionar no Calendário com Horário:
                    </label>
                    <input
                      type="datetime-local"
                      value={formDateTime}
                      onChange={e => handleDateTimeChange(e.target.value)}
                      className="w-full bg-white border border-teal-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#007369] focus:ring-1 focus:ring-[#007369] cursor-pointer shadow-2xs"
                    />
                  </div>

                  {/* Texto Formatado / Customizado */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      🏷️ Descrição do Prazo (Texto):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Hoje até 15:30 / Sexta 18h"
                      value={formPrazo}
                      onChange={e => setFormPrazo(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-[#007369]"
                    />
                  </div>
                </div>
              </div>

              {/* Meta Esperada e Observações */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Esperada / Critério de Aceite</label>
                  <input
                    type="text"
                    placeholder="Ex: Manto em 35% e taxa > 1.000 t/h"
                    value={formMeta}
                    onChange={e => setFormMeta(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#007369] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Observações de Apoio / Recursos</label>
                  <input
                    type="text"
                    placeholder="Ex: Alinhar apoio mecânico da equipe de plantão..."
                    value={formObs}
                    onChange={e => setFormObs(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#007369] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#007369] hover:bg-teal-700 text-white rounded-lg transition shadow-xs cursor-pointer"
                >
                  {editingId ? "Salvar Alterações" : "Adicionar Diretriz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Exclusão de Diretriz (Lixo) */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150 text-slate-900">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">Excluir Diretriz de Turno?</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Esta diretriz será removida da matriz tática de turno e do cronograma Gantt.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex flex-wrap items-center gap-1.5 font-bold">
                <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-[10px]">{deleteCandidate.setor}</span>
                <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[10px]">{deleteCandidate.responsavelTurma}</span>
              </div>
              <p className="text-slate-800 font-medium text-xs mt-1 leading-snug">{deleteCandidate.acaoEstrategica}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
