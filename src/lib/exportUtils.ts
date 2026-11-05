import JSZip from 'jszip';
import {
  Lead,
  Cliente,
  Proposta,
  Visita,
  Produto,
  Atividade,
  EmpresaConfig,
  UserAccount,
  Deal
} from '../types/crm';

export interface CrmBackupPayload {
  version?: string;
  exportedAt?: string;
  empresa: EmpresaConfig;
  produtos: Produto[];
  leads: Lead[];
  clientes: Cliente[];
  deals: Deal[];
  propostas: Proposta[];
  visitas: Visita[];
  atividades: Atividade[];
  users?: UserAccount[];
}

/**
 * Utilitário de escape e formatação de células CSV para Excel (Brasil)
 * Utiliza ponto e vírgula (;) como separador padrão brasileiro e UTF-8 BOM
 */
export function formatCsvCell(val: any): string {
  if (val === null || val === undefined) return '""';
  let str = String(val).trim();
  // Escape de aspas duplas
  str = str.replace(/"/g, '""');
  // Se contiver ponto-e-vírgula, quebra de linha ou aspas, precisa ficar entre aspas
  return `"${str}"`;
}

/**
 * Constrói uma linha CSV separada por ponto e vírgula
 */
export function buildCsvLine(cells: any[]): string {
  return cells.map(formatCsvCell).join(';');
}

/**
 * Baixa um arquivo no navegador do usuário
 */
export function triggerFileDownload(content: string | Blob, filename: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Adiciona o BOM UTF-8 (\uFEFF) para garantir que o Excel abra acentos perfeitamente no Windows e Mac
 */
export function withUtf8Bom(csvContent: string): string {
  return '\uFEFF' + csvContent;
}

/**
 * 1. GERAÇÃO DE CSV DE LEADS
 */
export function generateLeadsCsv(leads: Lead[]): string {
  const headers = [
    'ID',
    'Contato',
    'Empresa / Posto',
    'CNPJ Matriz',
    'Filiais / Unidades',
    'Tipo de Negócio',
    'Telefone / WhatsApp',
    'E-mail',
    'Cidade / UF',
    'Endereço',
    'Status no Funil',
    'Origem',
    'Bombas / Bicos',
    'Área Loja',
    'Valor Estimado (R$)',
    'Valor Implantação (R$)',
    'Mensalidade (R$)',
    'Observações',
    'Data de Cadastro'
  ];

  const lines = [buildCsvLine(headers)];

  for (const l of leads) {
    const filiaisStr = (l.filiais || []).map(f => `${f.nome} (${f.cnpj})`).join(' | ');
    const tipoLabel =
      l.tipo === 'posto' ? 'Posto de Combustível' : l.tipo === 'conveniencia' ? 'Conveniência' : 'Posto + Conveniência';

    lines.push(
      buildCsvLine([
        l.id,
        l.nome,
        l.empresa,
        l.cnpj || '',
        filiaisStr,
        tipoLabel,
        l.telefone || '',
        l.email || '',
        l.cidade || '',
        l.endereco || '',
        l.status?.toUpperCase() || '',
        l.origem || '',
        l.bombas || '',
        l.tamanhoLoja || '',
        l.valorEstimado ? Number(l.valorEstimado).toFixed(2) : '0.00',
        l.valorImplantacao ? Number(l.valorImplantacao).toFixed(2) : '0.00',
        l.valorMensalidade ? Number(l.valorMensalidade).toFixed(2) : '0.00',
        l.observacoes || '',
        l.criadoEm ? new Date(l.criadoEm).toLocaleDateString('pt-BR') : ''
      ])
    );
  }

  return withUtf8Bom(lines.join('\r\n'));
}

/**
 * 2. GERAÇÃO DE CSV DE CLIENTES
 */
export function generateClientesCsv(clientes: Cliente[]): string {
  const headers = [
    'ID',
    'Empresa',
    'Contato Principal',
    'CNPJ Matriz',
    'Filiais Cadastradas',
    'Tipo de Negócio',
    'Telefone',
    'E-mail',
    'Cidade',
    'Status do Contrato',
    'Bombas / Estrutura',
    'Loja / Conveniência',
    'Valor Contrato (R$)',
    'Valor Implantação (R$)',
    'Mensalidade / Fee (R$)',
    'Sistemas Ativos',
    'Data de Fechamento',
    'Observações'
  ];

  const lines = [buildCsvLine(headers)];

  for (const c of clientes) {
    const filiaisStr = (c.filiais || []).map(f => `${f.nome} (${f.cnpj})`).join(' | ');
    const tipoLabel =
      c.tipo === 'posto' ? 'Posto de Combustível' : c.tipo === 'conveniencia' ? 'Conveniência' : 'Posto + Conveniência';
    const sistemasStr = (c.sistemas || []).join(' | ');

    lines.push(
      buildCsvLine([
        c.id,
        c.empresa,
        c.nome,
        c.cnpj || '',
        filiaisStr,
        tipoLabel,
        c.telefone || '',
        c.email || '',
        c.cidade || '',
        c.status === 'ativo' ? 'ATIVO' : 'INATIVO',
        c.bombas || '',
        c.tamanhoLoja || '',
        c.valorContrato ? Number(c.valorContrato).toFixed(2) : '0.00',
        c.valorImplantacao ? Number(c.valorImplantacao).toFixed(2) : '0.00',
        c.valorMensalidade ? Number(c.valorMensalidade).toFixed(2) : '0.00',
        sistemasStr,
        c.dataFechamento ? new Date(c.dataFechamento).toLocaleDateString('pt-BR') : '',
        c.observacoes || ''
      ])
    );
  }

  return withUtf8Bom(lines.join('\r\n'));
}

/**
 * 3. GERAÇÃO DE CSV DE PROPOSTAS
 */
export function generatePropostasCsv(propostas: Proposta[]): string {
  const headers = [
    'Número',
    'Cliente / Lead',
    'CNPJ',
    'Status',
    'Unidades / Filiais',
    'Qtd de Sistemas/Itens',
    'Produtos Inclusos',
    'Valor Implantação (R$)',
    'Valor Mensalidade (R$)',
    'Desconto (%)',
    'Data de Criação',
    'Validade',
    'Condições de Pagamento',
    'Observações'
  ];

  const lines = [buildCsvLine(headers)];

  for (const p of propostas) {
    const clienteNome = p.clienteEmpresa || p.empresa || p.clienteNome || p.contato || 'Cliente';
    const cnpj = p.clienteCnpj || p.cnpj || '';
    const itensStr = (p.itens || []).map((it: any) => `${it.nome || 'Item'} (qtd: ${it.qtd || it.quantidade || 1})`).join(' | ');

    lines.push(
      buildCsvLine([
        p.numero || p.id,
        clienteNome,
        cnpj,
        p.status?.toUpperCase() || 'RASCUNHO',
        p.unidadesRede || 1,
        p.itens?.length || 0,
        itensStr,
        p.valorTotalImplantacao ? Number(p.valorTotalImplantacao).toFixed(2) : '0.00',
        p.valorTotalMensalidade ? Number(p.valorTotalMensalidade).toFixed(2) : '0.00',
        p.desconto ? `${p.desconto}%` : '0%',
        p.criadoEm || p.dataCriacao ? new Date(p.criadoEm || p.dataCriacao!).toLocaleDateString('pt-BR') : '',
        p.validade ? new Date(p.validade).toLocaleDateString('pt-BR') : '',
        p.condicoesPagamento || '',
        p.observacoes || ''
      ])
    );
  }

  return withUtf8Bom(lines.join('\r\n'));
}

/**
 * 4. GERAÇÃO DE CSV DE VISITAS
 */
export function generateVisitasCsv(visitas: Visita[]): string {
  const headers = [
    'ID',
    'Data da Visita',
    'Tipo de Visita',
    'Empresa / Posto',
    'Contato',
    'CNPJ',
    'Telefone',
    'E-mail',
    'Cidade',
    'Endereço',
    'Tipo de Estabelecimento',
    'Bombas / Pista',
    'Sistema Legado Atual',
    'Nível de Interesse',
    'Sistemas de Interesse',
    'Resultado / Feedback',
    'Observações'
  ];

  const lines = [buildCsvLine(headers)];

  for (const v of visitas) {
    const tipoLabel =
      v.tipo === 'posto' ? 'Posto de Combustível' : v.tipo === 'conveniencia' ? 'Conveniência' : 'Posto + Conveniência';
    const produtosStr = (v.produtosNomes || []).join(' | ');

    lines.push(
      buildCsvLine([
        v.id,
        v.data ? new Date(v.data).toLocaleString('pt-BR') : '',
        v.tipoVisita || 'Visita presencial',
        v.empresa,
        v.contato,
        v.cnpj || '',
        v.telefone || '',
        v.email || '',
        v.cidade || '',
        v.endereco || '',
        tipoLabel,
        v.bombas || '',
        v.sistemaAtual || '',
        v.interesse?.toUpperCase() || 'MÉDIO',
        produtosStr,
        v.resultado || '',
        v.observacoes || ''
      ])
    );
  }

  return withUtf8Bom(lines.join('\r\n'));
}

/**
 * 5. GERAÇÃO DE CSV DE PRODUTOS
 */
export function generateProdutosCsv(produtos: Produto[]): string {
  const headers = [
    'ID',
    'Nome do Produto / Sistema',
    'Categoria',
    'Preço Base (R$)',
    'Taxa de Implantação (R$)',
    'Mensalidade (R$)',
    'Módulos Inclusos',
    'Descrição'
  ];

  const lines = [buildCsvLine(headers)];

  for (const p of produtos) {
    const modulosStr = (p.modulos || []).map(m => m.nome).join(' | ');
    const catLabel =
      p.categoria === 'posto' || p.tipo === 'posto'
        ? 'Posto'
        : p.categoria === 'conveniencia' || p.tipo === 'conveniencia'
        ? 'Conveniência'
        : 'Geral / Ambos';

    lines.push(
      buildCsvLine([
        p.id,
        p.nome,
        catLabel,
        p.preco ? Number(p.preco).toFixed(2) : '0.00',
        p.implantacao ? Number(p.implantacao).toFixed(2) : '0.00',
        p.mensalidade ? Number(p.mensalidade).toFixed(2) : '0.00',
        modulosStr,
        p.descricao || ''
      ])
    );
  }

  return withUtf8Bom(lines.join('\r\n'));
}

/**
 * 6. GERAÇÃO DE CSV DE ATIVIDADES
 */
export function generateAtividadesCsv(atividades: Atividade[]): string {
  const headers = [
    'ID',
    'Data / Horário',
    'Tipo de Atividade',
    'Título',
    'Status',
    'Relacionado A',
    'Resultado',
    'Descrição'
  ];

  const lines = [buildCsvLine(headers)];

  for (const a of atividades) {
    lines.push(
      buildCsvLine([
        a.id,
        a.data ? new Date(a.data).toLocaleString('pt-BR') : '',
        a.tipo?.toUpperCase() || '',
        a.titulo,
        a.concluida ? 'CONCLUÍDA' : 'PENDENTE',
        a.relacionado || '',
        a.resultado?.toUpperCase() || '',
        a.descricao || ''
      ])
    );
  }

  return withUtf8Bom(lines.join('\r\n'));
}

/**
 * 7. EXPORTAR BACKUP COMPLETO JSON
 */
export function exportCrmBackupJson(crmData: CrmBackupPayload, customName?: string) {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = `${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;

  const payload: CrmBackupPayload = {
    version: '5.0.0',
    exportedAt: now.toISOString(),
    empresa: crmData.empresa,
    produtos: crmData.produtos || [],
    leads: crmData.leads || [],
    clientes: crmData.clientes || [],
    deals: crmData.deals || [],
    propostas: crmData.propostas || [],
    visitas: crmData.visitas || [],
    atividades: crmData.atividades || [],
    users: crmData.users || []
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const filename = customName || `fera-crm-backup-${dateStr}-${timeStr}.json`;
  triggerFileDownload(jsonStr, filename, 'application/json;charset=utf-8;');
  return filename;
}

/**
 * 8. EXPORTAR PACOTE COMPLETO (.ZIP) COM TODAS AS PLANILHAS E BACKUP JSON
 */
export async function exportAllAsZip(crmData: CrmBackupPayload): Promise<string> {
  const zip = new JSZip();
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);

  // 1. Backup JSON completo
  const backupJson = JSON.stringify(
    {
      version: '5.0.0',
      exportedAt: now.toISOString(),
      ...crmData
    },
    null,
    2
  );
  zip.file('backup_completo_fera_crm.json', backupJson);

  // 2. Planilhas CSV (compatíveis com Excel BR com ponto e vírgula e UTF-8 BOM)
  zip.file('01_leads_e_oportunidades.csv', generateLeadsCsv(crmData.leads || []));
  zip.file('02_clientes_e_contratos.csv', generateClientesCsv(crmData.clientes || []));
  zip.file('03_propostas_comerciais.csv', generatePropostasCsv(crmData.propostas || []));
  zip.file('04_visitas_tecnicas_campo.csv', generateVisitasCsv(crmData.visitas || []));
  zip.file('05_catalogo_produtos_servicos.csv', generateProdutosCsv(crmData.produtos || []));
  zip.file('06_historico_de_atividades.csv', generateAtividadesCsv(crmData.atividades || []));

  // 3. Arquivo LEIAME com metadados
  const readme = `=======================================================================
EXPORTAÇÃO COMPLETA DE DADOS - FERA SISTEMA DO BRASIL
Data de Exportação: ${now.toLocaleString('pt-BR')}
=======================================================================

Conteúdo do Pacote:
1. backup_completo_fera_crm.json  -> Arquivo de restauração integral do sistema
2. 01_leads_e_oportunidades.csv    -> Planilha Excel de Leads (${crmData.leads?.length || 0} registros)
3. 02_clientes_e_contratos.csv     -> Planilha Excel de Clientes (${crmData.clientes?.length || 0} registros)
4. 03_propostas_comerciais.csv     -> Planilha Excel de Propostas (${crmData.propostas?.length || 0} propostas)
5. 04_visitas_tecnicas_campo.csv   -> Planilha Excel de Visitas de Campo (${crmData.visitas?.length || 0} visitas)
6. 05_catalogo_produtos_servicos.csv -> Catálogo de Softwares e Módulos (${crmData.produtos?.length || 0} produtos)
7. 06_historico_de_atividades.csv  -> Histórico de Ligações, Reuniões e Tarefas (${crmData.atividades?.length || 0} atividades)

Observação para abertura no Microsoft Excel:
Todas as planilhas CSV utilizam codificação UTF-8 com BOM e delimitador ponto e vírgula (;),
prontas para abertura direta com dupla clique no Excel em computadores Windows ou Mac.
`;
  zip.file('LEIAME_EXPORTACAO.txt', readme);

  // Gera o arquivo ZIP
  const content = await zip.generateAsync({ type: 'blob' });
  const filename = `fera-crm-exportacao-completa-${dateStr}.zip`;
  triggerFileDownload(content, filename, 'application/zip');
  return filename;
}

/**
 * 9. VALIDAÇÃO DE ARQUIVO DE BACKUP JSON
 */
export function validateBackupJson(rawText: string): {
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
} {
  try {
    const data = JSON.parse(rawText);
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'O arquivo não é um objeto JSON válido.' };
    }

    // Suporte tanto ao formato unificado quanto a legados
    const leads = Array.isArray(data.leads) ? data.leads : [];
    const clientes = Array.isArray(data.clientes) ? data.clientes : [];
    const propostas = Array.isArray(data.propostas) ? data.propostas : [];
    const visitas = Array.isArray(data.visitas) ? data.visitas : [];
    const produtos = Array.isArray(data.produtos) ? data.produtos : [];
    const atividades = Array.isArray(data.atividades) ? data.atividades : [];

    const totalRegistros =
      leads.length + clientes.length + propostas.length + visitas.length + produtos.length + atividades.length;

    if (totalRegistros === 0 && !data.empresa) {
      return {
        valid: false,
        error: 'Nenhum dado do CRM (Leads, Clientes, Propostas, etc.) foi encontrado neste arquivo.'
      };
    }

    return {
      valid: true,
      parsed: {
        empresa: data.empresa || {},
        produtos,
        leads,
        clientes,
        deals: Array.isArray(data.deals) ? data.deals : [],
        propostas,
        visitas,
        atividades,
        users: Array.isArray(data.users) ? data.users : []
      },
      counts: {
        leads: leads.length,
        clientes: clientes.length,
        propostas: propostas.length,
        visitas: visitas.length,
        produtos: produtos.length,
        atividades: atividades.length
      },
      summary: `${leads.length} leads, ${clientes.length} clientes, ${propostas.length} propostas, ${visitas.length} visitas, ${produtos.length} produtos.`
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Erro ao interpretar JSON: ${err?.message || 'Arquivo corrompido ou formato inválido'}`
    };
  }
}
