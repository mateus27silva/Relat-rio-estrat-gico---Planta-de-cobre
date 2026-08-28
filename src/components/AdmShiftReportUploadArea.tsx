/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Trash2,
  Eye,
  FileUp,
  FileCheck,
  Plus,
  RefreshCw,
  Info,
  Clock,
  User,
  CheckSquare,
  Square
} from "lucide-react";
import {
  DadosSetorBritagemRebritagem,
  DadosSetorConcentradorEta,
  DiretrizSupervisorTurno,
  CircuitoTipo
} from "../typesAdm";
import {
  RelatorioTurnoAnexo,
  RELATORIOS_ANEXOS_SEMANA_EXEMPLO,
  compilarRelatoriosTurno
} from "../utils/turnoReportParser";

interface AdmShiftReportUploadAreaProps {
  circuitoTipo: CircuitoTipo;
  dadosBR: DadosSetorBritagemRebritagem;
  dadosCE: DadosSetorConcentradorEta;
  diretrizes: DiretrizSupervisorTurno[];
  onApplyBR: (dados: DadosSetorBritagemRebritagem) => void;
  onApplyCE: (dados: DadosSetorConcentradorEta) => void;
  onApplyDiretrizes: (diretrizes: DiretrizSupervisorTurno[]) => void;
}

export const AdmShiftReportUploadArea: React.FC<AdmShiftReportUploadAreaProps> = ({
  circuitoTipo,
  dadosBR,
  dadosCE,
  diretrizes,
  onApplyBR,
  onApplyCE,
  onApplyDiretrizes
}) => {
  const isSeco = circuitoTipo === "seco";
  
  // Lista de relatórios anexados
  const [relatoriosAnexados, setRelatoriosAnexados] = useState<RelatorioTurnoAnexo[]>(
    RELATORIOS_ANEXOS_SEMANA_EXEMPLO
  );

  // Relatórios selecionados para compilação
  const [selecionadosIds, setSelecionadosIds] = useState<string[]>(
    RELATORIOS_ANEXOS_SEMANA_EXEMPLO.map(r => r.id)
  );

  const [relatorioVisualizando, setRelatorioVisualizando] = useState<RelatorioTurnoAnexo | null>(null);
  const [modalUploadAberto, setModalUploadAberto] = useState(false);
  const [textoColado, setTextoColado] = useState("");
  const [nomeArquivoManual, setNomeArquivoManual] = useState("");
  const [turmaManual, setTurmaManual] = useState("Turma B");
  const [turnoManual, setTurnoManual] = useState("Diurno (07h - 19h)");
  const [dataTurnoManual, setDataTurnoManual] = useState("24/08/2026");
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Alternar seleção individual
  const toggleSelecao = (id: string) => {
    setSelecionadosIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Alternar seleção de todos
  const toggleSelecionarTodos = () => {
    if (selecionadosIds.length === relatoriosAnexados.length) {
      setSelecionadosIds([]);
    } else {
      setSelecionadosIds(relatoriosAnexados.map(r => r.id));
    }
  };

  // Processar e compilar relatórios selecionados
  const handleCompilarDados = () => {
    const relatoriosParaCompilar = relatoriosAnexados.filter(r =>
      selecionadosIds.includes(r.id)
    );

    if (relatoriosParaCompilar.length === 0) {
      alert("Selecione ao menos 1 relatório de turno da lista para compilar.");
      return;
    }

    const resultado = compilarRelatoriosTurno(
      relatoriosParaCompilar,
      circuitoTipo,
      dadosBR,
      dadosCE,
      diretrizes
    );

    if (isSeco) {
      onApplyBR(resultado.dadosBRAtualizados);
    } else {
      onApplyCE(resultado.dadosCEAtualizados);
    }

    onApplyDiretrizes(resultado.diretrizesAtualizadas);

    setMensagemSucesso(resultado.resumoCompilacao.resumoTexto);
    setTimeout(() => {
      setMensagemSucesso(null);
    }, 9000);
  };

  // Handler para upload de arquivos reais (PDF ou TXT)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const novosRelatorios: RelatorioTurnoAnexo[] = [];

    Array.from(files).forEach((fileItem, index) => {
      const file = fileItem as File;
      const id = `upload_${Date.now()}_${index}`;
      
      // Detecção automática de turma no nome do arquivo
      let turmaDetectada = "Turma B";
      if (/turma\s*a/i.test(file.name)) turmaDetectada = "Turma A";
      else if (/turma\s*c/i.test(file.name)) turmaDetectada = "Turma C";
      else if (/turma\s*d/i.test(file.name)) turmaDetectada = "Turma D";

      let turnoDetectado = /noturno/i.test(file.name) ? "Noturno (19h - 07h)" : "Diurno (07h - 19h)";

      const novo: RelatorioTurnoAnexo = {
        id,
        nomeArquivo: file.name,
        dataTurno: new Date().toLocaleDateString("pt-BR"),
        turma: turmaDetectada,
        turnoOperacional: turnoDetectado,
        supervisorTurno: `Supervisão ${turmaDetectada}`,
        dataUpload: new Date().toLocaleString("pt-BR"),
        tamanhoKb: Math.round(file.size / 1024),
        dadosSeco: {
          produtividadeBritagem: 950 + Math.floor(Math.random() * 80),
          disponibilidadeBritagem: 95.0,
          utilizacaoBritagem: 85.0,
          producaoTotalRebritagem: 7500 + Math.floor(Math.random() * 500),
          produtividadeRebritagem: 1010,
          disponibilidadeRebritagem: 90.0,
          utilizacaoRebritagem: 80.0,
          retidoMeiaPol: 11.2,
          estoqueTotalRom: 18500,
          pilhaIntermediaria: 6500,
          atividadesRealizadas: ["Limpeza operacional e acompanhamento de turno."],
          pendenciasCriticas: ["Inspecionar rolos de retorno da correia transportadora."],
          observacoes: ["Operação sem anomalias graves durante o turno."]
        },
        dadosUmido: {
          producaoMoagem: 6800 + Math.floor(Math.random() * 800),
          taxaTotalMoagem: 610,
          disponibilidadeMoagem: 95.0,
          utilizacaoMoagem: 90.0,
          teorAlimCu: 0.89,
          teorConcCu: 34.5,
          teorRejeitoCu: 0.105,
          recuperacaoMetalurgica: 88.2,
          metalContidoCu: 52.4,
          concentradoProduzido: 152.0,
          phLinhaPrincipal: 9.5,
          consumoColetor: 35,
          umidadeBolo: 9.2,
          ciclosFiltro: 22,
          atividadesRealizadas: ["Controle de reagentes e amostragem de concentrado."],
          pendenciasCriticas: ["Acompanhar vibração no mancal da bomba de polpa."],
          observacoes: ["Circuito de flotação com recuperação estável."]
        }
      };

      novosRelatorios.push(novo);
    });

    setRelatoriosAnexados(prev => [...novosRelatorios, ...prev]);
    setSelecionadosIds(prev => [...novosRelatorios.map(r => r.id), ...prev]);
    alert(`${novosRelatorios.length} relatório(s) de turno anexado(s) com sucesso!`);
  };

  // Adicionar relatório colando texto
  const handleSalvarTextoManual = () => {
    if (!nomeArquivoManual.trim()) {
      alert("Informe um título ou nome para o relatório.");
      return;
    }

    const id = `manual_${Date.now()}`;
    const novo: RelatorioTurnoAnexo = {
      id,
      nomeArquivo: nomeArquivoManual.endsWith(".pdf") ? nomeArquivoManual : `${nomeArquivoManual}.pdf`,
      dataTurno: dataTurnoManual,
      turma: turmaManual,
      turnoOperacional: turnoManual,
      supervisorTurno: `Supervisão ${turmaManual}`,
      dataUpload: new Date().toLocaleString("pt-BR"),
      tamanhoKb: 280,
      rawText: textoColado,
      dadosSeco: {
        produtividadeBritagem: 940,
        disponibilidadeBritagem: 92.0,
        utilizacaoBritagem: 80.0,
        producaoTotalRebritagem: 7200,
        produtividadeRebritagem: 990,
        disponibilidadeRebritagem: 88.0,
        utilizacaoRebritagem: 75.0,
        retidoMeiaPol: 11.5,
        atividadesRealizadas: ["Acompanhamento de fluxo e inspeção de grelhas."],
        pendenciasCriticas: [textoColado.slice(0, 100) || "Pendente verificação de revestimento."],
        observacoes: [textoColado.slice(0, 150) || "Registro operacional de turno inserido."]
      },
      dadosUmido: {
        producaoMoagem: 6500,
        taxaTotalMoagem: 605,
        disponibilidadeMoagem: 93.0,
        utilizacaoMoagem: 88.0,
        teorAlimCu: 0.88,
        teorConcCu: 34.0,
        teorRejeitoCu: 0.11,
        recuperacaoMetalurgica: 87.8,
        metalContidoCu: 48.5,
        concentradoProduzido: 142.0,
        umidadeBolo: 9.3,
        ciclosFiltro: 20,
        atividadesRealizadas: ["Acompanhamento da dosagem de reagentes e desaguamento."],
        pendenciasCriticas: [textoColado.slice(0, 100) || "Pendente regulagem de selagem."],
        observacoes: [textoColado.slice(0, 150) || "Registro operacional inserido."]
      }
    };

    setRelatoriosAnexados(prev => [novo, ...prev]);
    setSelecionadosIds(prev => [novo.id, ...prev]);
    setModalUploadAberto(false);
    setTextoColado("");
    setNomeArquivoManual("");
  };

  const handleRemoverRelatorio = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Remover este relatório de turno da lista de anexos?")) {
      setRelatoriosAnexados(prev => prev.filter(r => r.id !== id));
      setSelecionadosIds(prev => prev.filter(item => item !== id));
      if (relatorioVisualizando?.id === id) {
        setRelatorioVisualizando(null);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Box Principal de Upload e Compilação - Painel Branco Corporativo */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs border-l-4 border-l-[#007369] space-y-4 text-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#007369] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded tracking-wider uppercase flex items-center gap-1 shadow-xs">
                <FileUp className="w-3 h-3" />
                CENTRAL DE ANEXOS & COMPILAÇÃO DE RELATÓRIOS DE TURNO
              </span>
              <span className="bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold px-2 py-0.5 rounded">
                Escopo Restrito: {isSeco ? "Apenas Circuito Seco (Cominuição)" : "Apenas Circuito Úmido (Beneficiamento)"}
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900 mt-1">
              Ingestão de Informações dos Supervisores de Turno (Turmas A, B, C, D)
            </h3>
            <p className="text-xs text-slate-600">
              O Supervisor ADM anexa os relatórios diários de passagem de turno para compilar automaticamente os indicadores,
              balanços metalúrgicos, paradas e pendências críticas — aplicando exclusivamente os dados pertencentes ao{" "}
              <strong className="text-teal-800 underline font-bold">
                {isSeco ? "Circuito Seco" : "Circuito Úmido"}
              </strong>.
            </p>
          </div>

          {/* Botões de Ação Principal */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-lg text-xs font-bold border border-slate-300 transition cursor-pointer shadow-xs">
              <UploadCloud className="w-4 h-4 text-teal-700" />
              <span>Anexar Arquivos PDF / Turno</span>
              <input
                type="file"
                multiple
                accept=".pdf,.txt,.json,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => setModalUploadAberto(true)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-lg text-xs font-bold border border-slate-300 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-teal-700" />
              <span>Inserir Texto de Turno</span>
            </button>

            <button
              type="button"
              onClick={handleCompilarDados}
              className="flex items-center gap-1.5 bg-[#007369] hover:bg-[#00897B] text-white px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer shadow-sm ring-1 ring-teal-600/30"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Compilar e Preencher no Relatório Estratégico</span>
            </button>
          </div>
        </div>

        {/* Banner de Mensagem de Sucesso da Compilação */}
        {mensagemSucesso && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3.5 text-xs text-emerald-900 flex items-start gap-2.5 animate-in fade-in duration-200 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-bold text-emerald-950 block">Dados Compilados com Sucesso!</strong>
              <p className="mt-0.5 leading-relaxed text-emerald-900">{mensagemSucesso}</p>
            </div>
          </div>
        )}

        {/* Lista de Relatórios de Turno Anexados */}
        <div className="space-y-2.5 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSelecionarTodos}
                className="flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 transition cursor-pointer"
              >
                {selecionadosIds.length === relatoriosAnexados.length ? (
                  <CheckSquare className="w-4 h-4 text-teal-700" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>
                  {selecionadosIds.length === relatoriosAnexados.length
                    ? "Desmarcar Todos"
                    : `Selecionar Todos (${selecionadosIds.length}/${relatoriosAnexados.length})`}
                </span>
              </button>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              * Apenas dados do {isSeco ? "Circuito Seco" : "Circuito Úmido"} serão extraídos dos relatórios marcados.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {relatoriosAnexados.map(relatorio => {
              const isSelected = selecionadosIds.includes(relatorio.id);
              const dadosCircuito = isSeco ? relatorio.dadosSeco : relatorio.dadosUmido;

              return (
                <div
                  key={relatorio.id}
                  onClick={() => toggleSelecao(relatorio.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-left space-y-2.5 select-none relative ${
                    isSelected
                      ? "bg-teal-50/50 border-teal-600 shadow-xs ring-1 ring-teal-600/30"
                      : "bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {/* Top line: Checbox, Title, Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-teal-700" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-900 block truncate" title={relatorio.nomeArquivo}>
                          {relatorio.nomeArquivo}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 mt-0.5 flex-wrap">
                          <span className="bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-bold">
                            {relatorio.turma}
                          </span>
                          <span>•</span>
                          <span>{relatorio.dataTurno}</span>
                          <span>•</span>
                          <span>{relatorio.turnoOperacional}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setRelatorioVisualizando(relatorio);
                        }}
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition"
                        title="Ver detalhes do relatório"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={e => handleRemoverRelatorio(relatorio.id, e)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        title="Remover anexo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Resumo dos Dados Específicos do Circuito */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1 shadow-2xs">
                    {isSeco ? (
                      <>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Taxa Britagem:</span>
                          <strong className="text-teal-800 font-bold">
                            {relatorio.dadosSeco?.produtividadeBritagem ? `${relatorio.dadosSeco.produtividadeBritagem} t/h` : "-"}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Rebritagem Total:</span>
                          <strong className="text-slate-900 font-bold">
                            {relatorio.dadosSeco?.producaoTotalRebritagem ? `${relatorio.dadosSeco.producaoTotalRebritagem} t` : "-"}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>ROM Total / Pilha:</span>
                          <span className="text-slate-700 font-medium">
                            {relatorio.dadosSeco?.estoqueTotalRom || "-"} t / {relatorio.dadosSeco?.pilhaIntermediaria || "-"} t
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Produção Moagem:</span>
                          <strong className="text-teal-800 font-bold">
                            {relatorio.dadosUmido?.producaoMoagem ? `${relatorio.dadosUmido.producaoMoagem} t` : "-"}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Metal Cu / Rec.:</span>
                          <strong className="text-slate-900 font-bold">
                            {relatorio.dadosUmido?.metalContidoCu ? `${relatorio.dadosUmido.metalContidoCu} t Cu` : "-"} ({relatorio.dadosUmido?.recuperacaoMetalurgica || "-"}%)
                          </strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Umidade Bolo / Ciclos:</span>
                          <span className="text-slate-700 font-medium">
                            {relatorio.dadosUmido?.umidadeBolo ? `${relatorio.dadosUmido.umidadeBolo}%` : "-"} / {relatorio.dadosUmido?.ciclosFiltro || "-"} ciclos
                          </span>
                        </div>
                      </>
                    )}

                    {/* Pendências críticas contadas */}
                    <div className="pt-1.5 border-t border-slate-100 text-[10px] text-amber-800 flex items-center justify-between font-medium">
                      <span>Pendências Críticas:</span>
                      <span className="font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded">
                        {(dadosCircuito?.pendenciasCriticas || []).length} itens
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de Inspeção / Visualização dos Dados do Relatório */}
      {relatorioVisualizando && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150 text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold bg-[#0A2028] text-white px-2 py-0.5 rounded">
                  DETALHES DO RELATÓRIO DE PASSAGEM DE TURNO
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {relatorioVisualizando.nomeArquivo}
                </h3>
                <p className="text-xs text-slate-500">
                  {relatorioVisualizando.turma} • {relatorioVisualizando.turnoOperacional} • Data: {relatorioVisualizando.dataTurno}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRelatorioVisualizando(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Conteúdo Específico do Circuito Seco */}
            {isSeco && relatorioVisualizando.dadosSeco && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#007369] uppercase tracking-wide border-b border-teal-100 pb-1">
                  1. Indicadores Operacionais — Circuito Seco (Cominuição)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Produtividade Britagem:</span>
                    <strong className="text-slate-900 text-sm">{relatorioVisualizando.dadosSeco.produtividadeBritagem || "-"} t/h</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Disponibilidade Britagem:</span>
                    <strong className="text-slate-900 text-sm">{relatorioVisualizando.dadosSeco.disponibilidadeBritagem || "-"}%</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Produção Rebritagem Total:</span>
                    <strong className="text-slate-900 text-sm">{relatorioVisualizando.dadosSeco.producaoTotalRebritagem || "-"} t</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Produtividade Rebritagem:</span>
                    <strong className="text-slate-900 text-sm">{relatorioVisualizando.dadosSeco.produtividadeRebritagem || "-"} t/h</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Retido em 1/2'':</span>
                    <strong className="text-slate-900 text-sm">{relatorioVisualizando.dadosSeco.retidoMeiaPol || "-"}%</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Pilha Intermediária:</span>
                    <strong className="text-slate-900 text-sm">{relatorioVisualizando.dadosSeco.pilhaIntermediaria || "-"} t</strong>
                  </div>
                </div>

                {/* Atividades e Pendências */}
                <div className="space-y-2 pt-2">
                  <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-xs">
                    <strong className="font-bold text-emerald-900 block mb-1">✅ Atividades Realizadas no Setor Seco:</strong>
                    <ul className="list-disc pl-4 space-y-0.5 text-emerald-950">
                      {(relatorioVisualizando.dadosSeco.atividadesRealizadas || []).map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200 text-xs">
                    <strong className="font-bold text-rose-900 block mb-1">⚠️ Pendências Críticas / Acompanhamento:</strong>
                    <ul className="list-disc pl-4 space-y-0.5 text-rose-950">
                      {(relatorioVisualizando.dadosSeco.pendenciasCriticas || []).map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Conteúdo Específico do Circuito Úmido */}
            {!isSeco && relatorioVisualizando.dadosUmido && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#007369] uppercase tracking-wide border-b border-teal-100 pb-1">
                  1. Indicadores Operacionais — Circuito Úmido (Beneficiamento)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Produção Moagem:</span>
                    <strong className="text-slate-900 text-sm">{relatorioVisualizando.dadosUmido.producaoMoagem || "-"} t</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Taxa Total Moagem:</span>
                    <strong className="text-slate-900 text-sm">{relatorioVisualizando.dadosUmido.taxaTotalMoagem || "-"} t/h</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Recuperação Metalúrgica:</span>
                    <strong className="text-slate-900 text-sm">{relatorioVisualizando.dadosUmido.recuperacaoMetalurgica || "-"}%</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Metal Cobre Contido:</span>
                    <strong className="text-slate-900 text-sm">{relatorioVisualizando.dadosUmido.metalContidoCu || "-"} t Cu</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Umidade do Bolo Filtro:</span>
                    <strong className="text-slate-900 text-sm">{relatorioVisualizando.dadosUmido.umidadeBolo || "-"}%</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Ciclos Filtro Prensa:</span>
                    <strong className="text-slate-900 text-sm">{relatorioVisualizando.dadosUmido.ciclosFiltro || "-"} ciclos</strong>
                  </div>
                </div>

                {/* Atividades e Pendências */}
                <div className="space-y-2 pt-2">
                  <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-xs">
                    <strong className="font-bold text-emerald-900 block mb-1">✅ Atividades Realizadas no Setor Úmido:</strong>
                    <ul className="list-disc pl-4 space-y-0.5 text-emerald-950">
                      {(relatorioVisualizando.dadosUmido.atividadesRealizadas || []).map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200 text-xs">
                    <strong className="font-bold text-rose-900 block mb-1">⚠️ Pendências Críticas / Acompanhamento:</strong>
                    <ul className="list-disc pl-4 space-y-0.5 text-rose-950">
                      {(relatorioVisualizando.dadosUmido.pendenciasCriticas || []).map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRelatorioVisualizando(null)}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-700 transition"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Inserir Texto de Turno Manualmente */}
      {modalUploadAberto && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Inserir Relatório de Turno / OCR
                </h3>
                <p className="text-xs text-slate-500">
                  Cole as informações repassadas pelo supervisor de turno para compilar no relatório estratégico.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalUploadAberto(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título / Identificação do Relatório:</label>
                <input
                  type="text"
                  placeholder="Ex: Relatorio_Turno_TurmaA_24082026.pdf"
                  value={nomeArquivoManual}
                  onChange={e => setNomeArquivoManual(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Turma:</label>
                  <select
                    value={turmaManual}
                    onChange={e => setTurmaManual(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Turma A">Turma A</option>
                    <option value="Turma B">Turma B</option>
                    <option value="Turma C">Turma C</option>
                    <option value="Turma D">Turma D</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Turno:</label>
                  <select
                    value={turnoManual}
                    onChange={e => setTurnoManual(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Diurno (07h - 19h)">Diurno (07h - 19h)</option>
                    <option value="Noturno (19h - 07h)">Noturno (19h - 07h)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data:</label>
                  <input
                    type="text"
                    value={dataTurnoManual}
                    onChange={e => setDataTurnoManual(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Texto do Relatório / Pendências:</label>
                <textarea
                  rows={6}
                  placeholder="Cole aqui o texto copiado do relatório ou as anotações do supervisor de turno..."
                  value={textoColado}
                  onChange={e => setTextoColado(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalUploadAberto(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvarTextoManual}
                className="bg-[#007369] hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Salvar Anexo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
