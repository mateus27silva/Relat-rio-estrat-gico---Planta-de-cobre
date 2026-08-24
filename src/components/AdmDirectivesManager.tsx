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
  Search
} from "lucide-react";
import { DiretrizSupervisorTurno, PrioridadeDiretriz, StatusDiretriz, CircuitoTipo } from "../typesAdm";

interface AdmDirectivesManagerProps {
  circuitoTipo?: CircuitoTipo;
  diretrizes: DiretrizSupervisorTurno[];
  onChange: (diretrizes: DiretrizSupervisorTurno[]) => void;
}

export const AdmDirectivesManager: React.FC<AdmDirectivesManagerProps> = ({ circuitoTipo = "seco", diretrizes, onChange }) => {
  const isSeco = circuitoTipo === "seco";
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
  const [formPrioridade, setFormPrioridade] = useState<PrioridadeDiretriz>("alta");
  const [formMeta, setFormMeta] = useState<string>("");
  const [formObs, setFormObs] = useState<string>("");

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

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormSetor(isSeco ? "Britagem Primária" : "Moagem & Ciclones");
    setFormAcao("");
    setFormTurma("Todas as Turmas");
    setFormSupervisor("");
    setFormPrazo("Hoje até 18:00");
    setFormPrioridade("alta");
    setFormMeta("");
    setFormObs("");
    setShowModal(true);
  };

  const handleOpenEdit = (d: DiretrizSupervisorTurno) => {
    setEditingId(d.id);
    setFormSetor(d.setor);
    setFormAcao(d.acaoEstrategica);
    setFormTurma(d.responsavelTurma);
    setFormSupervisor(d.supervisorNome || "");
    setFormPrazo(d.prazoLimite);
    setFormPrioridade(d.prioridade);
    setFormMeta(d.metaEsperada);
    setFormObs(d.observacoes || "");
    setShowModal(true);
  };

  const handleSaveDiretriz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAcao.trim() || !formPrazo.trim()) return;

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
                observacoes: formObs.trim()
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
        status: "pendente",
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
        return { ...d, status: nextStatus };
      })
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Remover esta diretriz da lista de ações dos supervisores?")) {
      onChange(diretrizes.filter(d => d.id !== id));
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
      if (!matchSetor && !matchAcao && !matchTurma && !matchSup) return false;
    }
    return true;
  });

  const totalConcluidas = diretrizes.filter(d => d.status === "concluido").length;
  const totalEmAndamento = diretrizes.filter(d => d.status === "em_andamento").length;
  const totalPendentes = diretrizes.filter(d => d.status === "pendente").length;
  const totalCriticas = diretrizes.filter(d => d.prioridade === "critica").length;

  return (
    <div className="space-y-5">
      {/* Header & Stats Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                GESTÃO TÁTICA & OPERACIONAL
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-slate-100">
              Diretrizes & Ações com Prazos para Supervisores de Turno
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Direcionamento estratégico da supervisão ADM com responsáveis, critérios de sucesso e prazos firmes de entrega.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Diretriz com Prazo</span>
          </button>
        </div>

        {/* Mini Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <span className="text-xs text-slate-400 block font-medium">Total de Ações</span>
            <span className="text-xl font-bold text-white mt-0.5 block">{diretrizes.length}</span>
          </div>
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <span className="text-xs text-amber-400 block font-medium">⏳ Em Andamento</span>
            <span className="text-xl font-bold text-amber-300 mt-0.5 block">{totalEmAndamento}</span>
          </div>
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <span className="text-xs text-emerald-400 block font-medium">✅ Concluídas</span>
            <span className="text-xl font-bold text-emerald-300 mt-0.5 block">{totalConcluidas}</span>
          </div>
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <span className="text-xs text-rose-400 block font-medium">🔴 Prioridade Crítica</span>
            <span className="text-xl font-bold text-rose-300 mt-0.5 block">{totalCriticas}</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Busca */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por ação, setor ou supervisor..."
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

      {/* Directives Cards List */}
      <div className="space-y-3">
        {filteredDiretrizes.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center">
            <Target className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Nenhuma diretriz encontrada com os filtros selecionados</p>
            <p className="text-xs text-slate-500 mt-1">Adicione novas ações ou redefina os filtros acima para visualizar as tarefas.</p>
          </div>
        ) : (
          filteredDiretrizes.map((dir, index) => {
            const isCritica = dir.prioridade === "critica";
            const isAlta = dir.prioridade === "alta";
            const isConcluido = dir.status === "concluido";
            const isEmAndamento = dir.status === "em_andamento";

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
                      <span className="bg-emerald-50 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        <User className="w-3 h-3 text-emerald-600" />
                        {dir.responsavelTurma} {dir.supervisorNome ? `• ${dir.supervisorNome}` : ""}
                      </span>

                      {/* Prazo Limite Badge (Highlighted) */}
                      <span className="bg-slate-900 text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                        <Clock className="w-3 h-3 text-amber-400" />
                        Prazo: {dir.prazoLimite}
                      </span>
                    </div>

                    {/* Ação Estratégica Descrição */}
                    <div className="pt-0.5">
                      <p className={`text-sm font-semibold leading-snug ${isConcluido ? "line-through text-slate-500" : "text-slate-900"}`}>
                        {dir.acaoEstrategica}
                      </p>
                    </div>

                    {/* Meta Esperada / Critério de Sucesso */}
                    {dir.metaEsperada && (
                      <div className="flex items-start gap-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-150">
                        <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800 font-semibold">Meta / Critério de Aceite:</strong>{" "}
                          <span>{dir.metaEsperada}</span>
                        </div>
                      </div>
                    )}

                    {/* Observações / Suporte */}
                    {dir.observacoes && (
                      <p className="text-xs text-slate-500 italic pl-1">
                        Obs: {dir.observacoes}
                      </p>
                    )}
                  </div>

                  {/* Right Actions & Status Toggler */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={() => toggleStatus(dir.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                        isConcluido
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : isEmAndamento
                          ? "bg-amber-500 hover:bg-amber-600 text-white"
                          : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                      }`}
                      title="Clique para alternar o status"
                    >
                      {isConcluido ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Concluído</span>
                        </>
                      ) : isEmAndamento ? (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Em Andamento</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Pendente</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(dir)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
                        title="Editar Diretriz"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(dir.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                        title="Excluir Diretriz"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal / Formulário de Cadastro e Edição */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingId ? "Editar Diretriz Estratégica" : "Nova Diretriz Operacional para Supervisores"}
                </h3>
                <p className="text-xs text-slate-500">Defina a ação tática, responsável de turno, prazo limite e meta esperada.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDiretriz} className="space-y-4">
              {/* Setor e Prioridade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Setor / Equipamento</label>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prioridade</label>
                  <select
                    value={formPrioridade}
                    onChange={e => setFormPrioridade(e.target.value as PrioridadeDiretriz)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  >
                    <option value="critica">🔴 Crítica (Urgente / Risco Alto)</option>
                    <option value="alta">🟡 Alta (Prioridade do Dia)</option>
                    <option value="media">🔵 Média (Rotina / Ajuste Fino)</option>
                  </select>
                </div>
              </div>

              {/* Ação Estratégica */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ação Estratégica / Diretriz Operacional <span className="text-rose-500">*</span>
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

              {/* Prazo Limite e Meta Esperada */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prazo Limite de Entrega <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Hoje até 16:00 / Sexta 18h"
                    value={formPrazo}
                    onChange={e => setFormPrazo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Esperada / Critério de Aceite</label>
                  <input
                    type="text"
                    placeholder="Ex: Manto em 35% e taxa > 1.000 t/h"
                    value={formMeta}
                    onChange={e => setFormMeta(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações de Apoio / Recursos</label>
                <input
                  type="text"
                  placeholder="Ex: Alinhar apoio mecânico da equipe de plantão..."
                  value={formObs}
                  onChange={e => setFormObs(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs"
                >
                  {editingId ? "Salvar Alterações" : "Adicionar Diretriz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
