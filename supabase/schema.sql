-- ============================================================
-- FERA SISTEMA DO BRASIL — LINX/TOTVS
-- SCHEMA POSTGRESQL PARA SUPABASE
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE CONFIGURAÇÃO DA EMPRESA
CREATE TABLE IF NOT EXISTS public.crm_empresa (
    id TEXT PRIMARY KEY DEFAULT 'empresa-default',
    razao_social TEXT NOT NULL DEFAULT 'FERA SISTEMA DO BRASIL LTDA',
    nome_fantasia TEXT NOT NULL DEFAULT 'FERA SISTEMA DO BRASIL — LINX/TOTVS',
    cnpj TEXT DEFAULT '',
    inscricao_estadual TEXT DEFAULT '',
    telefone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    site TEXT DEFAULT '',
    endereco TEXT DEFAULT '',
    cidade TEXT DEFAULT '',
    uf VARCHAR(2) DEFAULT '',
    cep TEXT DEFAULT '',
    responsavel TEXT DEFAULT '',
    slogan TEXT DEFAULT 'Sistemas inteligentes para postos de combustíveis e conveniências',
    logo TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE USUÁRIOS E EQUIPE DO CRM
CREATE TABLE IF NOT EXISTS public.crm_usuarios (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE PRODUTOS E SISTEMAS
CREATE TABLE IF NOT EXISTS public.crm_produtos (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT DEFAULT '',
    preco NUMERIC(12, 2) NOT NULL DEFAULT 0,
    implantacao NUMERIC(12, 2) NOT NULL DEFAULT 0,
    mensalidade NUMERIC(12, 2) NOT NULL DEFAULT 0,
    categoria VARCHAR(30) NOT NULL DEFAULT 'posto',
    icone TEXT DEFAULT 'CashRegister',
    modulos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE LEADS / PROSPECTS
CREATE TABLE IF NOT EXISTS public.crm_leads (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    empresa TEXT NOT NULL,
    tipo VARCHAR(30) NOT NULL DEFAULT 'posto',
    cnpj TEXT DEFAULT '',
    filiais JSONB DEFAULT '[]'::jsonb,
    telefone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    cidade TEXT DEFAULT '',
    endereco TEXT DEFAULT '',
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    bombas TEXT DEFAULT '',
    tamanho_loja TEXT DEFAULT '',
    origem TEXT DEFAULT 'Indicação',
    status VARCHAR(30) NOT NULL DEFAULT 'lead',
    valor_estimado NUMERIC(12, 2) DEFAULT 0,
    valor_implantacao NUMERIC(12, 2) DEFAULT 0,
    valor_mensalidade NUMERIC(12, 2) DEFAULT 0,
    observacoes TEXT DEFAULT '',
    historico JSONB DEFAULT '[]'::jsonb,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE CLIENTES
CREATE TABLE IF NOT EXISTS public.crm_clientes (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES public.crm_leads(id) ON DELETE SET NULL,
    nome TEXT NOT NULL,
    empresa TEXT NOT NULL,
    tipo VARCHAR(30) NOT NULL DEFAULT 'posto',
    cnpj TEXT DEFAULT '',
    filiais JSONB DEFAULT '[]'::jsonb,
    telefone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    cidade TEXT DEFAULT '',
    bombas TEXT DEFAULT '',
    tamanho_loja TEXT DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'ativo',
    sistemas TEXT[] DEFAULT '{}',
    produtos_ids TEXT[] DEFAULT '{}',
    modulos TEXT[] DEFAULT '{}',
    valor_contrato NUMERIC(12, 2) DEFAULT 0,
    valor_implantacao NUMERIC(12, 2) DEFAULT 0,
    valor_mensalidade NUMERIC(12, 2) DEFAULT 0,
    data_fechamento TIMESTAMPTZ DEFAULT NOW(),
    observacoes TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABELA DE DEALS (FUNIL / PIPELINE)
CREATE TABLE IF NOT EXISTS public.crm_deals (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    contato TEXT NOT NULL,
    valor NUMERIC(12, 2) DEFAULT 0,
    stage VARCHAR(30) NOT NULL DEFAULT 'lead',
    tipo VARCHAR(30) NOT NULL DEFAULT 'posto',
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABELA DE PROPOSTAS COMERCIAIS
CREATE TABLE IF NOT EXISTS public.crm_propostas (
    id TEXT PRIMARY KEY,
    numero TEXT NOT NULL UNIQUE,
    lead_id TEXT REFERENCES public.crm_leads(id) ON DELETE SET NULL,
    cliente_id TEXT REFERENCES public.crm_clientes(id) ON DELETE SET NULL,
    lead_ids TEXT[] DEFAULT '{}',
    cliente_ids TEXT[] DEFAULT '{}',
    vinculos JSONB DEFAULT '[]'::jsonb,
    empresa TEXT NOT NULL,
    contato TEXT NOT NULL,
    telefone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    cnpj TEXT DEFAULT '',
    cnpjs JSONB DEFAULT '[]'::jsonb,
    cidade TEXT DEFAULT '',
    itens JSONB NOT NULL DEFAULT '[]'::jsonb,
    desconto NUMERIC(5, 2) DEFAULT 0,
    desconto_implantacao NUMERIC(5, 2) DEFAULT 0,
    desconto_mensalidade NUMERIC(5, 2) DEFAULT 0,
    replicar_filiais BOOLEAN DEFAULT FALSE,
    unidades_rede INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'rascunho',
    validade TIMESTAMPTZ,
    observacoes TEXT DEFAULT '',
    valor_licenca_cadastro NUMERIC(12, 2) DEFAULT 0,
    valor_implantacao_cadastro NUMERIC(12, 2) DEFAULT 0,
    valor_mensalidade_cadastro NUMERIC(12, 2) DEFAULT 0,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABELA DE POSTOS VISITADOS (PROSPECÇÃO / VISITAS)
CREATE TABLE IF NOT EXISTS public.crm_visitas (
    id TEXT PRIMARY KEY,
    data TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tipo_visita TEXT DEFAULT 'Visita presencial',
    empresa TEXT NOT NULL,
    contato TEXT NOT NULL,
    cnpj TEXT DEFAULT '',
    telefone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    cidade TEXT DEFAULT '',
    endereco TEXT DEFAULT '',
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    tipo VARCHAR(30) DEFAULT 'posto',
    bombas TEXT DEFAULT '',
    tamanho_loja TEXT DEFAULT '',
    sistema_atual TEXT DEFAULT '',
    interesse VARCHAR(20) DEFAULT 'medio',
    produtos_ids TEXT[] DEFAULT '{}',
    produtos_nomes TEXT[] DEFAULT '{}',
    resultado TEXT DEFAULT '',
    observacoes TEXT DEFAULT '',
    lead_id TEXT REFERENCES public.crm_leads(id) ON DELETE SET NULL,
    cliente_id TEXT REFERENCES public.crm_clientes(id) ON DELETE SET NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABELA DE ATIVIDADES E FOLLOW-UPS
CREATE TABLE IF NOT EXISTS public.crm_atividades (
    id TEXT PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL DEFAULT 'tarefa',
    titulo TEXT NOT NULL,
    descricao TEXT DEFAULT '',
    resultado VARCHAR(20) DEFAULT '',
    relacionado TEXT DEFAULT '',
    lead_id TEXT REFERENCES public.crm_leads(id) ON DELETE SET NULL,
    cliente_id TEXT REFERENCES public.crm_clientes(id) ON DELETE SET NULL,
    proposta_id TEXT REFERENCES public.crm_propostas(id) ON DELETE SET NULL,
    data TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    concluida BOOLEAN DEFAULT FALSE,
    proximo_dias INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- POLÍTICAS RLS (Acesso habilitado para CRM)
ALTER TABLE public.crm_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_propostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_atividades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir acesso total crm_empresa" ON public.crm_empresa;
CREATE POLICY "Permitir acesso total crm_empresa" ON public.crm_empresa FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso total crm_usuarios" ON public.crm_usuarios;
CREATE POLICY "Permitir acesso total crm_usuarios" ON public.crm_usuarios FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso total crm_produtos" ON public.crm_produtos;
CREATE POLICY "Permitir acesso total crm_produtos" ON public.crm_produtos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso total crm_leads" ON public.crm_leads;
CREATE POLICY "Permitir acesso total crm_leads" ON public.crm_leads FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso total crm_clientes" ON public.crm_clientes;
CREATE POLICY "Permitir acesso total crm_clientes" ON public.crm_clientes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso total crm_deals" ON public.crm_deals;
CREATE POLICY "Permitir acesso total crm_deals" ON public.crm_deals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso total crm_propostas" ON public.crm_propostas;
CREATE POLICY "Permitir acesso total crm_propostas" ON public.crm_propostas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso total crm_visitas" ON public.crm_visitas;
CREATE POLICY "Permitir acesso total crm_visitas" ON public.crm_visitas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso total crm_atividades" ON public.crm_atividades;
CREATE POLICY "Permitir acesso total crm_atividades" ON public.crm_atividades FOR ALL USING (true) WITH CHECK (true);

-- ÍNDICES DE DESEMPENHO
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON public.crm_leads(status);
CREATE INDEX IF NOT EXISTS idx_crm_clientes_status ON public.crm_clientes(status);
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON public.crm_deals(stage);
CREATE INDEX IF NOT EXISTS idx_crm_propostas_numero ON public.crm_propostas(numero);
CREATE INDEX IF NOT EXISTS idx_crm_propostas_status ON public.crm_propostas(status);
CREATE INDEX IF NOT EXISTS idx_crm_visitas_data ON public.crm_visitas(data);
CREATE INDEX IF NOT EXISTS idx_crm_atividades_concluida ON public.crm_atividades(concluida);

-- HABILITAÇÃO DO SUPABASE REALTIME
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_empresa;
      ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_usuarios;
      ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_produtos;
      ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_leads;
      ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_clientes;
      ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_deals;
      ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_propostas;
      ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_visitas;
      ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_atividades;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;
