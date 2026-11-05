import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig, Lead, Cliente, Deal, Produto, Proposta, Visita, Atividade, EmpresaConfig } from '../types/crm';

const CONFIG_STORAGE_KEY = 'crm_supabase_config_v1';

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        url: parsed.url || envUrl,
        anonKey: parsed.anonKey || envKey,
        enabled: parsed.enabled ?? (Boolean(parsed.url || envUrl)),
        realtime: parsed.realtime ?? true,
        lastSync: parsed.lastSync || null
      };
    }
  } catch (e) {
    console.error('Erro ao ler config do Supabase do localStorage', e);
  }

  return {
    url: envUrl,
    anonKey: envKey,
    enabled: Boolean(envUrl && envKey),
    realtime: true,
    lastSync: null
  };
}

export function saveSupabaseConfig(cfg: SupabaseConfig) {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(cfg));
  cachedClient = null; // force re-creation
  // Also persist to backend server so all computers and browsers get the config automatically!
  try {
    fetch('/api/crm/supabase-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg)
    }).catch(() => {});
  } catch {}
}

let cachedClient: SupabaseClient | null = null;
let currentClientKey: string = '';

export function getSupabaseClient(): SupabaseClient | null {
  const cfg = getSupabaseConfig();
  if (!cfg.enabled || !cfg.url || !cfg.anonKey) {
    return null;
  }

  const clientKey = `${cfg.url}:${cfg.anonKey}`;
  if (cachedClient && currentClientKey === clientKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(cfg.url, cfg.anonKey, {
      auth: { persistSession: true }
    });
    currentClientKey = clientKey;
    return cachedClient;
  } catch (err) {
    console.error('Falha ao instanciar cliente Supabase:', err);
    return null;
  }
}

export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<{ ok: boolean; message: string; tablesFound?: string[] }> {
  const url = customUrl || getSupabaseConfig().url;
  const anonKey = customKey || getSupabaseConfig().anonKey;

  if (!url || !anonKey) {
    return { ok: false, message: 'URL e Chave Anon do Supabase são obrigatórias.' };
  }

  try {
    const client = createClient(url, anonKey);
    // Testa leitura na tabela crm_leads ou crm_empresa
    const { data, error } = await client.from('crm_empresa').select('id').limit(1);

    if (error) {
      // Se a tabela ainda não foi criada no Supabase
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          ok: false,
          message: 'Conexão efetuada com o Supabase, porém as tabelas ainda não foram criadas. Copie e execute o Script SQL no SQL Editor do Supabase.'
        };
      }
      return { ok: false, message: `Erro do Supabase: ${error.message} (${error.code || ''})` };
    }

    // Tenta checar outras tabelas
    const tables = ['crm_empresa', 'crm_leads', 'crm_produtos', 'crm_propostas', 'crm_visitas'];
    return {
      ok: true,
      message: 'Conexão com o Supabase estabelecida com sucesso! Tabelas acessíveis.',
      tablesFound: tables
    };
  } catch (err: any) {
    return { ok: false, message: `Falha na requisição: ${err.message || String(err)}` };
  }
}

// Envia dados locais para o Supabase (Push / Seed inicial)
export async function pushAllDataToSupabase(payload: {
  leads: Lead[];
  clientes: Cliente[];
  deals: Deal[];
  produtos: Produto[];
  propostas: Proposta[];
  visitas: Visita[];
  atividades: Atividade[];
  empresa: EmpresaConfig;
}): Promise<{ ok: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, message: 'Supabase não está configurado ou ativado.' };
  }

  try {
    // 1. Empresa
    if (payload.empresa) {
      await client.from('crm_empresa').upsert({
        id: 'empresa-default',
        razao_social: payload.empresa.razaoSocial,
        nome_fantasia: payload.empresa.nomeFantasia,
        cnpj: payload.empresa.cnpj,
        inscricao_estadual: payload.empresa.inscricaoEstadual || '',
        telefone: payload.empresa.telefone,
        email: payload.empresa.email,
        site: payload.empresa.site || '',
        endereco: payload.empresa.endereco || '',
        cidade: payload.empresa.cidade || '',
        uf: payload.empresa.uf || '',
        cep: payload.empresa.cep || '',
        responsavel: payload.empresa.responsavel || '',
        slogan: payload.empresa.slogan,
        logo: payload.empresa.logo || '',
        updated_at: new Date().toISOString()
      });
    }

    // 2. Produtos
    if (payload.produtos && payload.produtos.length > 0) {
      const prodRows = payload.produtos.map(p => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao || '',
        preco: p.preco || 0,
        implantacao: p.implantacao || 0,
        mensalidade: p.mensalidade || 0,
        categoria: p.categoria || 'posto',
        icone: p.icone || 'CashRegister',
        modulos: p.modulos || []
      }));
      await client.from('crm_produtos').upsert(prodRows);
    }

    // 3. Leads
    if (payload.leads && payload.leads.length > 0) {
      const leadRows = payload.leads.map(l => ({
        id: l.id,
        nome: l.nome,
        empresa: l.empresa,
        tipo: l.tipo || 'posto',
        cnpj: l.cnpj || '',
        filiais: l.filiais || [],
        telefone: l.telefone || '',
        email: l.email || '',
        cidade: l.cidade || '',
        endereco: l.endereco || '',
        lat: typeof l.lat === 'number' ? l.lat : (parseFloat(String(l.lat)) || null),
        lng: typeof l.lng === 'number' ? l.lng : (parseFloat(String(l.lng)) || null),
        bombas: l.bombas || '',
        tamanho_loja: l.tamanhoLoja || '',
        origem: l.origem || 'Indicação',
        status: l.status || 'lead',
        valor_estimado: l.valorEstimado || 0,
        valor_implantacao: l.valorImplantacao || 0,
        valor_mensalidade: l.valorMensalidade || 0,
        observacoes: l.observacoes || '',
        historico: l.historico || [],
        criado_em: l.criadoEm || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      await client.from('crm_leads').upsert(leadRows);
    }

    // 4. Clientes
    if (payload.clientes && payload.clientes.length > 0) {
      const cliRows = payload.clientes.map(c => ({
        id: c.id,
        lead_id: c.leadId || null,
        nome: c.nome,
        empresa: c.empresa,
        tipo: c.tipo || 'posto',
        cnpj: c.cnpj || '',
        filiais: c.filiais || [],
        telefone: c.telefone || '',
        email: c.email || '',
        cidade: c.cidade || '',
        bombas: c.bombas || '',
        tamanho_loja: c.tamanhoLoja || '',
        status: c.status || 'ativo',
        sistemas: c.sistemas || [],
        produtos_ids: c.produtosIds || [],
        modulos: c.modulos || [],
        valor_contrato: c.valorContrato || 0,
        valor_implantacao: c.valorImplantacao || 0,
        valor_mensalidade: c.valorMensalidade || 0,
        data_fechamento: c.dataFechamento || new Date().toISOString(),
        observacoes: c.observacoes || '',
        updated_at: new Date().toISOString()
      }));
      await client.from('crm_clientes').upsert(cliRows);
    }

    // 5. Deals
    if (payload.deals && payload.deals.length > 0) {
      const dealRows = payload.deals.map(d => ({
        id: d.id,
        lead_id: d.leadId,
        titulo: d.titulo,
        contato: d.contato,
        valor: d.valor || 0,
        stage: d.stage || 'lead',
        tipo: d.tipo || 'posto',
        criado_em: d.criadoEm || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      await client.from('crm_deals').upsert(dealRows);
    }

    // 6. Propostas
    if (payload.propostas && payload.propostas.length > 0) {
      const propRows = payload.propostas.map(p => ({
        id: p.id,
        numero: p.numero,
        lead_id: p.leadId || null,
        cliente_id: p.clienteId || null,
        lead_ids: p.leadIds || [],
        cliente_ids: p.clienteIds || [],
        vinculos: p.vinculos || [],
        empresa: p.empresa,
        contato: p.contato,
        telefone: p.telefone || '',
        email: p.email || '',
        cnpj: p.cnpj || '',
        cnpjs: p.cnpjs || [],
        cidade: p.cidade || '',
        itens: p.itens || [],
        desconto: p.descontoValor ?? p.desconto ?? 0,
        desconto_valor: p.descontoValor ?? p.desconto ?? 0,
        desconto_percentual: p.descontoPercentual ?? 0,
        desconto_aplicar_em: p.descontoAplicarEm || 'investimento',
        desconto_licenca_percentual: p.descontoLicencaPercentual ?? 0,
        desconto_licenca_valor: p.descontoLicencaValor ?? 0,
        desconto_implantacao_percentual: p.descontoImplantacaoPercentual ?? 0,
        desconto_implantacao_valor: p.descontoImplantacaoValor ?? (p.descontoImplantacao || 0),
        desconto_mensalidade_percentual: p.descontoMensalidadePercentual ?? 0,
        desconto_mensalidade_valor: p.descontoMensalidadeValor ?? (p.descontoMensalidade || 0),
        valor_licenca_liquida: p.valorLicencaLiquida ?? 0,
        valor_implantacao_liquida: p.valorImplantacaoLiquida ?? 0,
        valor_mensalidade_liquida: p.valorMensalidadeLiquida ?? 0,
        valor_total_liquido: p.valorTotalLiquido ?? 0,
        desconto_implantacao: p.descontoImplantacaoValor ?? p.descontoImplantacao ?? 0,
        desconto_mensalidade: p.descontoMensalidadeValor ?? p.descontoMensalidade ?? 0,
        replicar_filiais: p.replicarFiliais || false,
        unidades_rede: p.unidadesRede || 1,
        status: p.status || 'rascunho',
        validade: p.validade || null,
        observacoes: p.observacoes || '',
        valor_licenca_cadastro: p.valorLicencaCadastro || 0,
        valor_implantacao_cadastro: p.valorImplantacaoCadastro || 0,
        valor_mensalidade_cadastro: p.valorMensalidadeCadastro || 0,
        criado_em: p.criadoEm || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      await client.from('crm_propostas').upsert(propRows);
    }

    // 7. Visitas
    if (payload.visitas && payload.visitas.length > 0) {
      const visRows = payload.visitas.map(v => ({
        id: v.id,
        data: v.data || new Date().toISOString(),
        tipo_visita: v.tipoVisita || 'Visita presencial',
        empresa: v.empresa,
        contato: v.contato,
        cnpj: v.cnpj || '',
        telefone: v.telefone || '',
        email: v.email || '',
        cidade: v.cidade || '',
        endereco: v.endereco || '',
        lat: typeof v.lat === 'number' ? v.lat : (parseFloat(String(v.lat)) || null),
        lng: typeof v.lng === 'number' ? v.lng : (parseFloat(String(v.lng)) || null),
        tipo: v.tipo || 'posto',
        bombas: v.bombas || '',
        tamanho_loja: v.tamanhoLoja || '',
        sistema_atual: v.sistemaAtual || '',
        interesse: v.interesse || 'medio',
        produtos_ids: v.produtosIds || [],
        produtos_nomes: v.produtosNomes || [],
        resultado: v.resultado || '',
        observacoes: v.observacoes || '',
        lead_id: v.leadId || null,
        cliente_id: v.clienteId || null,
        criado_em: v.criadoEm || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      await client.from('crm_visitas').upsert(visRows);
    }

    // 8. Atividades
    if (payload.atividades && payload.atividades.length > 0) {
      const ativRows = payload.atividades.map(a => ({
        id: a.id,
        tipo: a.tipo || 'tarefa',
        titulo: a.titulo,
        descricao: a.descricao || '',
        resultado: a.resultado || '',
        relacionado: a.relacionado || '',
        lead_id: a.leadId || null,
        cliente_id: a.clienteId || null,
        proposta_id: a.propostaId || null,
        data: a.data || new Date().toISOString(),
        concluida: a.concluida || false,
        proximo_dias: a.proximoDias || null,
        updated_at: new Date().toISOString()
      }));
      await client.from('crm_atividades').upsert(ativRows);
    }

    // Atualiza lastSync
    const cfg = getSupabaseConfig();
    saveSupabaseConfig({ ...cfg, lastSync: new Date().toLocaleTimeString('pt-BR') });

    return { ok: true, message: 'Todos os dados foram publicados no Supabase com sucesso!' };
  } catch (err: any) {
    console.error('Erro ao enviar dados para o Supabase:', err);
    return { ok: false, message: `Erro ao gravar no Supabase: ${err.message || String(err)}` };
  }
}

// Puxa dados do Supabase para o app
export async function pullAllDataFromSupabase(): Promise<{
  ok: boolean;
  message: string;
  data?: {
    empresa?: EmpresaConfig;
    produtos?: Produto[];
    leads?: Lead[];
    clientes?: Cliente[];
    deals?: Deal[];
    propostas?: Proposta[];
    visitas?: Visita[];
    atividades?: Atividade[];
  };
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, message: 'Supabase não configurado.' };
  }

  try {
    const [
      { data: empData },
      { data: prodData },
      { data: leadData },
      { data: cliData },
      { data: dealData },
      { data: propData },
      { data: visData },
      { data: ativData }
    ] = await Promise.all([
      client.from('crm_empresa').select('*').limit(1),
      client.from('crm_produtos').select('*').order('created_at', { ascending: true }),
      client.from('crm_leads').select('*').order('criado_em', { ascending: false }),
      client.from('crm_clientes').select('*').order('data_fechamento', { ascending: false }),
      client.from('crm_deals').select('*'),
      client.from('crm_propostas').select('*').order('criado_em', { ascending: false }),
      client.from('crm_visitas').select('*').order('data', { ascending: false }),
      client.from('crm_atividades').select('*').order('data', { ascending: false })
    ]);

    const result: any = {};

    if (empData && empData.length > 0) {
      const e = empData[0];
      result.empresa = {
        razaoSocial: e.razao_social,
        nomeFantasia: e.nome_fantasia,
        cnpj: e.cnpj,
        inscricaoEstadual: e.inscricao_estadual,
        telefone: e.telefone,
        email: e.email,
        site: e.site,
        endereco: e.endereco,
        cidade: e.cidade,
        uf: e.uf,
        cep: e.cep,
        responsavel: e.responsavel,
        slogan: e.slogan,
        logo: e.logo
      };
    }

    if (prodData && prodData.length > 0) {
      result.produtos = prodData.map((p: any) => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao,
        preco: Number(p.preco) || 0,
        implantacao: Number(p.implantacao) || 0,
        mensalidade: Number(p.mensalidade) || 0,
        categoria: p.categoria,
        icone: p.icone,
        modulos: p.modulos || []
      }));
    }

    if (leadData) {
      result.leads = leadData.map((l: any) => ({
        id: l.id,
        nome: l.nome,
        empresa: l.empresa,
        tipo: l.tipo,
        cnpj: l.cnpj,
        filiais: l.filiais || [],
        telefone: l.telefone,
        email: l.email,
        cidade: l.cidade,
        endereco: l.endereco,
        lat: l.lat,
        lng: l.lng,
        bombas: l.bombas,
        tamanhoLoja: l.tamanho_loja,
        origem: l.origem,
        status: l.status,
        valorEstimado: Number(l.valor_estimado) || 0,
        valorImplantacao: Number(l.valor_implantacao) || 0,
        valorMensalidade: Number(l.valor_mensalidade) || 0,
        observacoes: l.observacoes,
        historico: l.historico || [],
        criadoEm: l.criado_em
      }));
    }

    if (cliData) {
      result.clientes = cliData.map((c: any) => ({
        id: c.id,
        leadId: c.lead_id,
        nome: c.nome,
        empresa: c.empresa,
        tipo: c.tipo,
        cnpj: c.cnpj,
        filiais: c.filiais || [],
        telefone: c.telefone,
        email: c.email,
        cidade: c.cidade,
        bombas: c.bombas,
        tamanhoLoja: c.tamanho_loja,
        status: c.status,
        sistemas: c.sistemas || [],
        produtosIds: c.produtos_ids || [],
        modulos: c.modulos || [],
        valorContrato: Number(c.valor_contrato) || 0,
        valorImplantacao: Number(c.valor_implantacao) || 0,
        valorMensalidade: Number(c.valor_mensalidade) || 0,
        dataFechamento: c.data_fechamento,
        observacoes: c.observacoes
      }));
    }

    if (dealData) {
      result.deals = dealData.map((d: any) => ({
        id: d.id,
        leadId: d.lead_id,
        titulo: d.titulo,
        contato: d.contato,
        valor: Number(d.valor) || 0,
        stage: d.stage,
        tipo: d.tipo,
        criadoEm: d.criado_em
      }));
    }

    if (propData) {
      result.propostas = propData.map((p: any) => ({
        id: p.id,
        numero: p.numero,
        leadId: p.lead_id,
        clienteId: p.cliente_id,
        leadIds: p.lead_ids || [],
        clienteIds: p.cliente_ids || [],
        vinculos: p.vinculos || [],
        empresa: p.empresa,
        contato: p.contato,
        telefone: p.telefone,
        email: p.email,
        cnpj: p.cnpj,
        cnpjs: p.cnpjs || [],
        cidade: p.cidade,
        itens: p.itens || [],
        desconto: Number(p.desconto_valor ?? p.desconto) || 0,
        descontoValor: Number(p.desconto_valor ?? p.desconto) || 0,
        descontoPercentual: Number(p.desconto_percentual) || 0,
        descontoAplicarEm: p.desconto_aplicar_em || 'investimento',
        descontoLicencaPercentual: Number(p.desconto_licenca_percentual) || 0,
        descontoLicencaValor: Number(p.desconto_licenca_valor) || 0,
        descontoImplantacaoPercentual: Number(p.desconto_implantacao_percentual) || 0,
        descontoImplantacaoValor: Number(p.desconto_implantacao_valor ?? p.desconto_implantacao) || 0,
        descontoMensalidadePercentual: Number(p.desconto_mensalidade_percentual) || 0,
        descontoMensalidadeValor: Number(p.desconto_mensalidade_valor ?? p.desconto_mensalidade) || 0,
        valorLicencaLiquida: Number(p.valor_licenca_liquida) || 0,
        valorImplantacaoLiquida: Number(p.valor_implantacao_liquida) || 0,
        valorMensalidadeLiquida: Number(p.valor_mensalidade_liquida) || 0,
        valorTotalLiquido: Number(p.valor_total_liquido) || 0,
        descontoImplantacao: Number(p.desconto_implantacao_valor ?? p.desconto_implantacao) || 0,
        descontoMensalidade: Number(p.desconto_mensalidade_valor ?? p.desconto_mensalidade) || 0,
        replicarFiliais: p.replicar_filiais,
        unidadesRede: p.unidades_rede || 1,
        status: p.status,
        validade: p.validade,
        observacoes: p.observacoes,
        valorLicencaCadastro: Number(p.valor_licenca_cadastro) || 0,
        valorImplantacaoCadastro: Number(p.valor_implantacao_cadastro) || 0,
        valorMensalidadeCadastro: Number(p.valor_mensalidade_cadastro) || 0,
        criadoEm: p.criado_em
      }));
    }

    if (visData) {
      result.visitas = visData.map((v: any) => ({
        id: v.id,
        data: v.data,
        tipoVisita: v.tipo_visita,
        empresa: v.empresa,
        contato: v.contato,
        cnpj: v.cnpj,
        telefone: v.telefone,
        email: v.email,
        cidade: v.cidade,
        endereco: v.endereco,
        lat: v.lat,
        lng: v.lng,
        tipo: v.tipo,
        bombas: v.bombas,
        tamanhoLoja: v.tamanho_loja,
        sistemaAtual: v.sistema_atual,
        interesse: v.interesse,
        produtosIds: v.produtos_ids || [],
        produtosNomes: v.produtos_nomes || [],
        resultado: v.resultado,
        observacoes: v.observacoes,
        leadId: v.lead_id,
        clienteId: v.cliente_id,
        criadoEm: v.criado_em
      }));
    }

    if (ativData) {
      result.atividades = ativData.map((a: any) => ({
        id: a.id,
        tipo: a.tipo,
        titulo: a.titulo,
        descricao: a.descricao,
        resultado: a.resultado,
        relacionado: a.relacionado,
        leadId: a.lead_id,
        clienteId: a.cliente_id,
        propostaId: a.proposta_id,
        data: a.data,
        concluida: a.concluida,
        proximoDias: a.proximo_dias
      }));
    }

    const cfg = getSupabaseConfig();
    saveSupabaseConfig({ ...cfg, lastSync: new Date().toLocaleTimeString('pt-BR') });

    return { ok: true, message: 'Dados sincronizados do Supabase!', data: result };
  } catch (err: any) {
    return { ok: false, message: `Erro ao buscar do Supabase: ${err.message || String(err)}` };
  }
}
