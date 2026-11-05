import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  FileJson,
  Archive,
  CheckCircle2,
  AlertTriangle,
  Database,
  Building2,
  Users,
  Briefcase,
  FileText,
  MapPin,
  Package,
  CalendarCheck,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import {
  exportCrmBackupJson,
  exportAllAsZip,
  generateLeadsCsv,
  generateClientesCsv,
  generatePropostasCsv,
  generateVisitasCsv,
  generateProdutosCsv,
  generateAtividadesCsv,
  triggerFileDownload,
  validateBackupJson,
  CrmBackupPayload
} from '../lib/exportUtils';

interface BackupExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'backup' | 'planilhas';
}

export const BackupExportModal: React.FC<BackupExportModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'backup'
}) => {
  const {
    empresa,
    produtos,
    leads,
    clientes,
    deals,
    propostas,
    visitas,
    atividades,
    users,
    restoreBackup,
    addToast
  } = useCrm();

  const [activeTab, setActiveTab] = useState<'backup' | 'planilhas'>(defaultTab);
  const [isZipping, setIsZipping] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Selected restore file state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    parsed?: CrmBackupPayload;
    summary?: string;
    counts?: {
      leads: number;
      clientes: number;
      propostas: number;
      visitas: number;
      produtos: number;
      atividades: number;
    };
    error?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentPayload: CrmBackupPayload = {
    empresa,
    produtos,
    leads,
    clientes,
    deals,
    propostas,
    visitas,
    atividades,
    users
  };

  // 1. Download Backup JSON
  const handleDownloadBackupJson = () => {
    try {
      const filename = exportCrmBackupJson(currentPayload);
      addToast(`Backup gerado: ${filename}`, 'success');
    } catch (err: any) {
      addToast(`Erro ao exportar backup: ${err?.message}`, 'error');
    }
  };

  // 2. Download Pacote ZIP Completo
  const handleDownloadAllZip = async () => {
    try {
      setIsZipping(true);
      const filename = await exportAllAsZip(currentPayload);
      addToast(`Pacote de exportação gerado: ${filename}`, 'success');
    } catch (err: any) {
      addToast(`Erro ao gerar arquivo ZIP: ${err?.message}`, 'error');
    } finally {
      setIsZipping(false);
    }
  };

  // 3. Downloads de CSVs individuais
  const handleDownloadCsv = (type: 'leads' | 'clientes' | 'propostas' | 'visitas' | 'produtos' | 'atividades') => {
    const dateStr = new Date().toISOString().slice(0, 10);
    try {
      switch (type) {
        case 'leads': {
          const csv = generateLeadsCsv(leads);
          triggerFileDownload(csv, `fera-crm-leads-${dateStr}.csv`, 'text/csv;charset=utf-8;');
          addToast('Planilha de Leads (CSV) exportada com sucesso!', 'success');
          break;
        }
        case 'clientes': {
          const csv = generateClientesCsv(clientes);
          triggerFileDownload(csv, `fera-crm-clientes-${dateStr}.csv`, 'text/csv;charset=utf-8;');
          addToast('Planilha de Clientes (CSV) exportada com sucesso!', 'success');
          break;
        }
        case 'propostas': {
          const csv = generatePropostasCsv(propostas);
          triggerFileDownload(csv, `fera-crm-propostas-${dateStr}.csv`, 'text/csv;charset=utf-8;');
          addToast('Planilha de Propostas (CSV) exportada com sucesso!', 'success');
          break;
        }
        case 'visitas': {
          const csv = generateVisitasCsv(visitas);
          triggerFileDownload(csv, `fera-crm-visitas-${dateStr}.csv`, 'text/csv;charset=utf-8;');
          addToast('Planilha de Visitas (CSV) exportada com sucesso!', 'success');
          break;
        }
        case 'produtos': {
          const csv = generateProdutosCsv(produtos);
          triggerFileDownload(csv, `fera-crm-produtos-${dateStr}.csv`, 'text/csv;charset=utf-8;');
          addToast('Catálogo de Produtos (CSV) exportado com sucesso!', 'success');
          break;
        }
        case 'atividades': {
          const csv = generateAtividadesCsv(atividades);
          triggerFileDownload(csv, `fera-crm-atividades-${dateStr}.csv`, 'text/csv;charset=utf-8;');
          addToast('Histórico de Atividades (CSV) exportado com sucesso!', 'success');
          break;
        }
      }
    } catch (err: any) {
      addToast(`Erro ao exportar planilha: ${err?.message}`, 'error');
    }
  };

  // 4. File input change for restore
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      const res = validateBackupJson(content);
      setValidationResult(res);
    };
    reader.readAsText(file);
  };

  // 5. Execute restore
  const handleConfirmRestore = async () => {
    if (!validationResult || !validationResult.valid || !validationResult.parsed) {
      addToast('Nenhum backup válido selecionado.', 'error');
      return;
    }

    try {
      setIsRestoring(true);
      const res = await restoreBackup(validationResult.parsed);
      if (res.ok) {
        setSelectedFile(null);
        setValidationResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onClose();
      }
    } catch (err: any) {
      addToast(`Erro ao restaurar: ${err?.message}`, 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  const cancelRestore = () => {
    setSelectedFile(null);
    setValidationResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#3ecf8e]/10 text-[#3ecf8e] border border-[#3ecf8e]/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                Central de Backup & Exportação de Dados
              </h2>
              <p className="text-xs text-zinc-400">
                Gere cópias de segurança integrais em JSON ou planilhas formatadas para Excel (CSV)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Status Pills */}
        <div className="bg-zinc-950/60 border-b border-zinc-800 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-zinc-400 font-medium flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#3ecf8e]" />
            Volume atual no CRM:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
              <strong className="text-emerald-400">{leads.length}</strong> Leads
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
              <strong className="text-emerald-400">{clientes.length}</strong> Clientes
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
              <strong className="text-emerald-400">{propostas.length}</strong> Propostas
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
              <strong className="text-emerald-400">{visitas.length}</strong> Visitas
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
              <strong className="text-emerald-400">{produtos.length}</strong> Produtos
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 px-6 bg-zinc-900/50">
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-xs border-b-2 transition-colors ${
              activeTab === 'backup'
                ? 'border-[#3ecf8e] text-[#3ecf8e]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileJson className="w-4 h-4" />
            Backup Completo (.JSON)
          </button>
          <button
            onClick={() => setActiveTab('planilhas')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-xs border-b-2 transition-colors ${
              activeTab === 'planilhas'
                ? 'border-[#3ecf8e] text-[#3ecf8e]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar para Excel / Planilhas (.CSV / .ZIP)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BACKUP JSON */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              {/* Export Backup Card */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Recomendado
                      </span>
                      <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                        <Download className="w-4 h-4 text-[#3ecf8e]" />
                        Baixar Cópia de Segurança Integral (Backup .JSON)
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Gera um arquivo JSON completo contendo todos os cadastros: Leads, Postos e Lojas, Clientes ativos,
                      propostas comerciais emitidas, visitas de campo realizadas, catálogo de softwares, histórico e contas de usuários.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadBackupJson}
                    className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Backup Agora
                  </button>
                </div>
              </div>

              {/* Restore Backup Card */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-bold text-zinc-100">
                    Restaurar / Importar Cópia de Segurança (.JSON)
                  </h3>
                </div>
                <p className="text-xs text-zinc-400">
                  Carregue um arquivo JSON de backup exportado anteriormente para recuperar todos os dados. O sistema
                  atualizará o banco local e sincronizará automaticamente com o Servidor Central para todos os computadores.
                </p>

                {/* Upload zone */}
                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-800 hover:border-[#3ecf8e]/50 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors"
                  >
                    <div className="p-3 rounded-full bg-zinc-800 text-zinc-300">
                      <Upload className="w-6 h-6 text-[#3ecf8e]" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-zinc-200">
                        Clique aqui para selecionar o arquivo de backup (.json)
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Arquivos gerados pelo FERA CRM (fera-crm-backup-*.json)
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="border border-zinc-800 bg-zinc-900 rounded-xl p-4 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <FileJson className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-100">{selectedFile.name}</p>
                          <p className="text-[11px] text-zinc-400">
                            Tamanho: {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={cancelRestore}
                        className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700"
                      >
                        Trocar arquivo
                      </button>
                    </div>

                    {/* Validation Message */}
                    {validationResult && validationResult.valid && (
                      <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          Arquivo validado com sucesso!
                        </div>
                        <p className="text-xs text-emerald-200/90">{validationResult.summary}</p>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                          <div className="bg-emerald-900/30 rounded p-1.5 text-center">
                            <span className="block text-emerald-400 font-bold text-xs">
                              {validationResult.counts?.leads}
                            </span>
                            <span className="text-[10px] text-zinc-400">Leads</span>
                          </div>
                          <div className="bg-emerald-900/30 rounded p-1.5 text-center">
                            <span className="block text-emerald-400 font-bold text-xs">
                              {validationResult.counts?.clientes}
                            </span>
                            <span className="text-[10px] text-zinc-400">Clientes</span>
                          </div>
                          <div className="bg-emerald-900/30 rounded p-1.5 text-center">
                            <span className="block text-emerald-400 font-bold text-xs">
                              {validationResult.counts?.propostas}
                            </span>
                            <span className="text-[10px] text-zinc-400">Propostas</span>
                          </div>
                          <div className="bg-emerald-900/30 rounded p-1.5 text-center">
                            <span className="block text-emerald-400 font-bold text-xs">
                              {validationResult.counts?.visitas}
                            </span>
                            <span className="text-[10px] text-zinc-400">Visitas</span>
                          </div>
                          <div className="bg-emerald-900/30 rounded p-1.5 text-center">
                            <span className="block text-emerald-400 font-bold text-xs">
                              {validationResult.counts?.produtos}
                            </span>
                            <span className="text-[10px] text-zinc-400">Produtos</span>
                          </div>
                          <div className="bg-emerald-900/30 rounded p-1.5 text-center">
                            <span className="block text-emerald-400 font-bold text-xs">
                              {validationResult.counts?.atividades}
                            </span>
                            <span className="text-[10px] text-zinc-400">Atividades</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {validationResult && !validationResult.valid && (
                      <div className="bg-rose-950/30 border border-rose-800/50 rounded-lg p-3 text-xs text-rose-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        {validationResult.error}
                      </div>
                    )}

                    {/* Action buttons */}
                    {validationResult?.valid && (
                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={cancelRestore}
                          className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          disabled={isRestoring}
                          onClick={handleConfirmRestore}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 text-zinc-950 font-bold text-xs shadow transition-all disabled:opacity-50"
                        >
                          {isRestoring ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Restaurando e sincronizando...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Confirmar e Restaurar Dados
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PLANILHAS EXCEL (CSV / ZIP) */}
          {activeTab === 'planilhas' && (
            <div className="space-y-6">
              {/* Highlight Card: ZIP Package */}
              <div className="bg-gradient-to-r from-emerald-950/30 to-zinc-900 border border-emerald-500/30 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Mais Prático
                      </span>
                      <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                        <Archive className="w-4 h-4 text-[#3ecf8e]" />
                        Exportar Pacote Completo (.ZIP)
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-300/90 leading-relaxed">
                      Baixe em um único clique um arquivo ZIP compactado contendo <strong>todas as 6 planilhas</strong>{' '}
                      (Leads, Clientes, Propostas, Visitas, Produtos, Atividades) em formato CSV (Excel) + o arquivo de
                      Backup JSON integral e documento LEIAME explicativo.
                    </p>
                  </div>

                  <button
                    disabled={isZipping}
                    onClick={handleDownloadAllZip}
                    className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 text-zinc-950 font-bold text-xs shadow transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isZipping ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Compactando...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Baixar Pacote Completo (.ZIP)
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Individual Modules Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Planilhas Individuais para Excel (CSV formatado com separador ponto e vírgula)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Leads */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-zinc-100">Leads & Oportunidades</h5>
                        <p className="text-[11px] text-zinc-400">
                          {leads.length} leads (CNPJ, contatos, bombas, funil, valores)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadCsv('leads')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#3ecf8e]" />
                      CSV
                    </button>
                  </div>

                  {/* Clientes */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-zinc-100">Clientes & Contratos</h5>
                        <p className="text-[11px] text-zinc-400">
                          {clientes.length} clientes (Razão Social, CNPJs, mensalidade, sistemas)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadCsv('clientes')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#3ecf8e]" />
                      CSV
                    </button>
                  </div>

                  {/* Propostas */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-zinc-100">Propostas Comerciais</h5>
                        <p className="text-[11px] text-zinc-400">
                          {propostas.length} propostas (valores de implantação, fee, status)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadCsv('propostas')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#3ecf8e]" />
                      CSV
                    </button>
                  </div>

                  {/* Visitas */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-zinc-100">Visitas Técnicas de Campo</h5>
                        <p className="text-[11px] text-zinc-400">
                          {visitas.length} visitas (checklists, sistema legado, interesse, feedback)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadCsv('visitas')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#3ecf8e]" />
                      CSV
                    </button>
                  </div>

                  {/* Produtos */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-zinc-100">Catálogo de Softwares & Módulos</h5>
                        <p className="text-[11px] text-zinc-400">
                          {produtos.length} produtos cadastrados com tabela de preços
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadCsv('produtos')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#3ecf8e]" />
                      CSV
                    </button>
                  </div>

                  {/* Atividades */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <CalendarCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-zinc-100">Histórico de Atividades</h5>
                        <p className="text-[11px] text-zinc-400">
                          {atividades.length} tarefas, reuniões e contatos comerciais
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadCsv('atividades')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#3ecf8e]" />
                      CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* Informative Note */}
              <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-zinc-400">
                <span className="text-emerald-400 font-bold">ℹ️ Dica de Compatibilidade:</span>
                <span>
                  Todas as planilhas CSV geradas utilizam codificação UTF-8 com BOM e ponto e vírgula como delimitador,
                  garantindo que o <strong>Microsoft Excel</strong> abra nomes, acentos e números decimais perfeitamente em
                  qualquer versão do Windows ou macOS sem necessidade de assistente de importação.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-400">
          <span>FERA Sistemas Comercial — Gestão de Dados Segura</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
