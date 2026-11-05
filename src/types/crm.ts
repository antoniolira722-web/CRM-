export type Role = 'admin' | 'gerente' | 'vendedor' | 'operador' | 'user';

export interface UserPermissions {
  dashboard: boolean;
  leads: boolean;
  visitas: boolean;
  clientes: boolean;
  pipeline: boolean;
  produtos: boolean;
  propostas: boolean;
  atividades: boolean;
  empresa: boolean;
}

export const MODULOS_SISTEMA: { id: keyof UserPermissions; label: string; descricao: string }[] = [
  { id: 'dashboard', label: 'Painel / Dashboard', descricao: 'Visão geral com gráficos e métricas de desempenho' },
  { id: 'leads', label: 'Gestão de Leads', descricao: 'Cadastro, edição e histórico de prospecção de postos' },
  { id: 'visitas', label: 'Postos Visitados', descricao: 'Registro de visitas a campo e interesses de postos' },
  { id: 'clientes', label: 'Clientes / Contratos', descricao: 'Carteira de clientes ativos e contratos fechados' },
  { id: 'pipeline', label: 'Funil de Vendas (Kanban)', descricao: 'Visualização e movimentação dos estágios de negociação' },
  { id: 'produtos', label: 'Catálogo de Sistemas', descricao: 'Lista de soluções Linx/TOTVS e valores de tabelas' },
  { id: 'propostas', label: 'Gerador de Propostas', descricao: 'Emissão e personalização de propostas comerciais em PDF' },
  { id: 'atividades', label: 'Atividades e Tarefas', descricao: 'Agendamentos de ligações, reuniões e follow-ups' },
  { id: 'empresa', label: 'Empresa e Configurações', descricao: 'Configurações gerais, logotipo, usuários e banco de dados' }
];

export const DEFAULT_PERMISSIONS_BY_ROLE: Record<Role, UserPermissions> = {
  admin: {
    dashboard: true,
    leads: true,
    visitas: true,
    clientes: true,
    pipeline: true,
    produtos: true,
    propostas: true,
    atividades: true,
    empresa: true
  },
  gerente: {
    dashboard: true,
    leads: true,
    visitas: true,
    clientes: true,
    pipeline: true,
    produtos: true,
    propostas: true,
    atividades: true,
    empresa: true
  },
  vendedor: {
    dashboard: true,
    leads: true,
    visitas: true,
    clientes: true,
    pipeline: true,
    produtos: true,
    propostas: true,
    atividades: true,
    empresa: true
  },
  operador: {
    dashboard: true,
    leads: false,
    visitas: true,
    clientes: true,
    pipeline: false,
    produtos: false,
    propostas: false,
    atividades: true,
    empresa: true
  },
  user: {
    dashboard: true,
    leads: true,
    visitas: true,
    clientes: true,
    pipeline: true,
    produtos: true,
    propostas: true,
    atividades: true,
    empresa: true
  }
};

export function hasUserPermission(user: UserAccount | null | undefined, pageId: string): boolean {
  if (!user) return true;
  if (user.role === 'admin' || user.role === 'gerente') return true;
  // Menu empresa deve estar sempre visível para configuração do sistema e logomarca
  if (pageId === 'empresa') {
    if (user.permissoes && user.permissoes.empresa === false) return false;
    return true;
  }
  if (user.permissoes && typeof (user.permissoes as any)[pageId] === 'boolean') {
    return (user.permissoes as any)[pageId];
  }
  const defaultPerms = DEFAULT_PERMISSIONS_BY_ROLE[user.role] || DEFAULT_PERMISSIONS_BY_ROLE.user;
  return (defaultPerms as any)[pageId] ?? true;
}

export interface UserAccount {
  id: string;
  nome: string;
  user: string;
  pass?: string;
  senha?: string;
  email?: string;
  cargo?: string;
  telefone?: string;
  role: Role;
  ativo?: boolean;
  permissoes?: Partial<UserPermissions>;
  criadoEm?: string;
}

export type Usuario = UserAccount;

export interface Filial {
  cnpj: string;
  nome: string;
}

export interface Modulo {
  nome: string;
  preco?: number;
  descricao?: string;
}

export type ModuloProduto = Modulo;

export type TipoEstabelecimento = 'posto' | 'conveniencia' | 'ambos';

export type LeadStage = 'lead' | 'qualificado' | 'proposta' | 'negociacao' | 'fechado' | 'perdido';

export interface HistoricoItem {
  data: string;
  texto: string;
}

export interface Lead {
  id: string;
  nome: string;
  empresa: string;
  tipo: TipoEstabelecimento;
  cnpj: string;
  filiais?: Filial[];
  telefone: string;
  email: string;
  cidade: string;
  endereco?: string;
  lat?: number | string;
  lng?: number | string;
  bombas?: string;
  tamanhoLoja?: string;
  origem: string;
  status: LeadStage;
  valorEstimado: number;
  valorImplantacao: number;
  valorMensalidade: number;
  observacoes?: string;
  historico: HistoricoItem[];
  criadoEm: string;
}

export interface Cliente {
  id: string;
  leadId?: string | null;
  nome: string;
  empresa: string;
  tipo: TipoEstabelecimento;
  cnpj: string;
  filiais?: Filial[];
  telefone: string;
  email: string;
  cidade: string;
  bombas?: string;
  tamanhoLoja?: string;
  status: 'ativo' | 'inativo';
  sistemas: string[];
  produtosIds?: string[];
  modulos?: string[];
  valorContrato: number;
  valorImplantacao: number;
  valorMensalidade: number;
  dataFechamento?: string;
  observacoes?: string;
}

export interface Deal {
  id: string;
  leadId: string;
  titulo: string;
  contato: string;
  valor: number;
  stage: LeadStage;
  tipo: TipoEstabelecimento;
  criadoEm: string;
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  implantacao: number;
  mensalidade: number;
  categoria?: TipoEstabelecimento;
  tipo?: TipoEstabelecimento;
  icone?: string;
  modulos: Modulo[];
}

export interface PropostaItem {
  produtoId: string;
  nome: string;
  descricao?: string;
  preco?: number;
  precoUnitario?: number;
  implantacao: number;
  mensalidade: number;
  qtd?: number;
  quantidade?: number;
  tipo?: TipoEstabelecimento;
  modulos?: Modulo[];
  modulosDisponiveis?: Modulo[];
  modulosInclusos?: string[];
}

export type ItemProposta = {
  produtoId: string;
  nome: string;
  descricao?: string;
  tipo?: TipoEstabelecimento;
  quantidade: number;
  precoUnitario: number;
  implantacao: number;
  mensalidade: number;
  modulosInclusos?: string[];
};

export interface VinculoProposta {
  key: string;
  tipo: 'lead' | 'cliente';
  id: string;
  empresa: string;
  contato: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  cidade?: string;
}

export type StatusProposta = 'rascunho' | 'enviada' | 'aceita' | 'aprovada' | 'recusada';

export interface Proposta {
  id: string;
  numero: string;
  leadId?: string | null;
  clienteId?: string | null;
  leadIds?: string[];
  clienteIds?: string[];
  vinculos?: VinculoProposta[];
  empresa?: string;
  contato?: string;
  clienteNome?: string;
  clienteEmpresa?: string;
  clienteCnpj?: string;
  clienteTelefone?: string;
  clienteEmail?: string;
  clienteCidade?: string;
  telefone?: string;
  email?: string;
  cnpj?: string;
  cnpjs?: { cnpj: string; nome?: string }[];
  cidade?: string;
  filiais?: { cnpj: string; nome: string }[];
  itens: any[];
  desconto?: number;
  descontoValor?: number;
  descontoPercentual?: number;
  descontoAplicarEm?: 'investimento' | 'licenca' | 'implantacao' | 'mensalidade';
  descontoLicencaPercentual?: number;
  descontoLicencaValor?: number;
  descontoImplantacaoPercentual?: number;
  descontoImplantacaoValor?: number;
  descontoMensalidadePercentual?: number;
  descontoMensalidadeValor?: number;
  valorLicencaLiquida?: number;
  valorImplantacaoLiquida?: number;
  valorMensalidadeLiquida?: number;
  descontoImplantacao?: number;
  descontoMensalidade?: number;
  valorTotalLiquido?: number;
  replicarFiliais?: boolean;
  unidadesRede?: number;
  status: StatusProposta;
  validade?: string | null;
  validadeDias?: number;
  condicoesPagamento?: string;
  observacoes?: string;
  valorLicencaCadastro?: number;
  valorImplantacaoCadastro?: number;
  valorMensalidadeCadastro?: number;
  valorTotalLicenca?: number;
  valorTotalImplantacao?: number;
  valorTotalMensalidade?: number;
  dataCriacao?: string;
  criadoEm?: string;
}

export type TipoAtividade = 'ligacao' | 'reuniao' | 'email' | 'whatsapp' | 'tarefa' | 'visita';
export type ResultadoAtividade = 'positivo' | 'neutro' | 'negativo' | 'reagendar' | '';

export interface Atividade {
  id: string;
  tipo: TipoAtividade;
  titulo: string;
  descricao?: string;
  resultado?: ResultadoAtividade;
  relacionado: string;
  leadId?: string | null;
  clienteId?: string | null;
  propostaId?: string | null;
  data: string;
  concluida: boolean;
  proximoDias?: number | null;
}

export type NivelInteresse = 'alto' | 'medio' | 'baixo' | 'nenhum';

export interface Visita {
  id: string;
  data: string;
  tipoVisita: string;
  empresa: string;
  contato: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  cidade: string;
  endereco?: string;
  lat?: number | string;
  lng?: number | string;
  tipo: TipoEstabelecimento;
  bombas?: string;
  tamanhoLoja?: string;
  sistemaAtual?: string;
  interesse: NivelInteresse;
  produtosIds?: string[];
  produtosNomes?: string[];
  resultado?: string;
  observacoes?: string;
  leadId?: string | null;
  clienteId?: string | null;
  criadoEm?: string;
}

export interface EmpresaConfig {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual?: string;
  telefone: string;
  email: string;
  site?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  responsavel?: string;
  slogan: string;
  logo?: string;
}

export type DadosEmpresa = EmpresaConfig;

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  enabled: boolean;
  realtime: boolean;
  lastSync?: string | null;
}

export type ThemeId =
  | 'ocean'
  | 'emerald'
  | 'amber'
  | 'crimson'
  | 'gold'
  | 'indigo'
  | 'violet'
  | 'rose'
  | 'teal'
  | 'slate'
  | 'coffee'
  | 'midnight'
  | 'light'
  | 'light-emerald'
  | 'light-warm';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  label: string;
  description: string;
  primaryColor: string;
  primaryBg: string;
  previewBg: string;
  previewCard: string;
  previewBorder: string;
  isDark: boolean;
  category?: 'escuro' | 'claro' | 'especial';
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'ocean',
    name: 'Azul Petróleo',
    label: 'Azul Petróleo (Linx / TOTVS)',
    description: 'Visual moderno corporativo em azul petróleo de alta tecnologia e confiança.',
    primaryColor: '#2563eb',
    primaryBg: '#3b82f6',
    previewBg: '#080d1a',
    previewCard: '#0e1626',
    previewBorder: '#1e293b',
    isDark: true,
    category: 'escuro'
  },
  {
    id: 'emerald',
    name: 'Verde Posto',
    label: 'Verde Posto & Energia',
    description: 'Verde vibrante automotivo, ecológico e sustentável para postos e conveniências.',
    primaryColor: '#10b981',
    primaryBg: '#34d399',
    previewBg: '#06100e',
    previewCard: '#0a1b17',
    previewBorder: '#17362e',
    isDark: true,
    category: 'escuro'
  },
  {
    id: 'amber',
    name: 'Laranja Combustível',
    label: 'Laranja Combustível & Âmbar',
    description: 'Energia dinâmica e acolhedora inspirada em redes de combustíveis e conveniências.',
    primaryColor: '#f97316',
    primaryBg: '#fb923c',
    previewBg: '#130e0b',
    previewCard: '#1d1612',
    previewBorder: '#38281f',
    isDark: true,
    category: 'escuro'
  },
  {
    id: 'crimson',
    name: 'Vermelho Shell',
    label: 'Vermelho Shell & Rubis',
    description: 'Vermelho automotivo potente com fundo carvão sofisticado e alto contraste.',
    primaryColor: '#ef4444',
    primaryBg: '#f87171',
    previewBg: '#12090b',
    previewCard: '#1c1013',
    previewBorder: '#3b1d24',
    isDark: true,
    category: 'escuro'
  },
  {
    id: 'gold',
    name: 'Dourado & Amarelo',
    label: 'Dourado & Amarelo Ipiranga',
    description: 'Amarelo solar e dourado corporativo, enérgico e com excelente visibilidade.',
    primaryColor: '#eab308',
    primaryBg: '#facc15',
    previewBg: '#121008',
    previewCard: '#1d190d',
    previewBorder: '#383018',
    isDark: true,
    category: 'escuro'
  },
  {
    id: 'indigo',
    name: 'Índigo Executivo',
    label: 'Índigo Real & Noturno',
    description: 'Profundidade roxa refinada para uma experiência de luxo e sofisticação executiva.',
    primaryColor: '#6366f1',
    primaryBg: '#818cf8',
    previewBg: '#0b0a17',
    previewCard: '#131129',
    previewBorder: '#272252',
    isDark: true,
    category: 'escuro'
  },
  {
    id: 'violet',
    name: 'Roxo Cyberpunk',
    label: 'Roxo Cyberpunk & Neon',
    description: 'Púrpura elétrico vibrante sobre preto profundo com estilo futurista inovador.',
    primaryColor: '#a855f7',
    primaryBg: '#c084fc',
    previewBg: '#0e0717',
    previewCard: '#180d26',
    previewBorder: '#351954',
    isDark: true,
    category: 'escuro'
  },
  {
    id: 'rose',
    name: 'Rosa Magenta',
    label: 'Rosa Magenta & Fintech',
    description: 'Tons de magenta sofisticado e moderno estilo startups e fintechs de alta velocidade.',
    primaryColor: '#f43f5e',
    primaryBg: '#fb7185',
    previewBg: '#13080e',
    previewCard: '#200d17',
    previewBorder: '#42162a',
    isDark: true,
    category: 'escuro'
  },
  {
    id: 'teal',
    name: 'Turquesa Oceânica',
    label: 'Turquesa & Menta Oceânica',
    description: 'Turquesa refrescante e serena com alta nitidez para jornadas longas de gestão.',
    primaryColor: '#14b8a6',
    primaryBg: '#2dd4bf',
    previewBg: '#061110',
    previewCard: '#0b1c1b',
    previewBorder: '#143836',
    isDark: true,
    category: 'escuro'
  },
  {
    id: 'slate',
    name: 'Grafite & Ciano',
    label: 'Grafite Moderno & Ciano',
    description: 'Estilo clean hi-tech em grafite profundo com realces luminosos em ciano.',
    primaryColor: '#06b6d4',
    primaryBg: '#22d3ee',
    previewBg: '#090c10',
    previewCard: '#101620',
    previewBorder: '#1e2a3b',
    isDark: true,
    category: 'escuro'
  },
  {
    id: 'coffee',
    name: 'Café & Caramelo',
    label: 'Café Espresso & Conveniência',
    description: 'Aconchegante e quente, inspirado nas cafeterias e lojas de conveniência dos postos.',
    primaryColor: '#d97706',
    primaryBg: '#f59e0b',
    previewBg: '#120e0b',
    previewCard: '#1d1712',
    previewBorder: '#382a20',
    isDark: true,
    category: 'escuro'
  },
  {
    id: 'midnight',
    name: 'Preto OLED Puro',
    label: 'Preto OLED Puro & Prata',
    description: 'Preto absoluto verdadeiro #000000 com detalhes prateados, contraste máximo e economia de energia.',
    primaryColor: '#e2e8f0',
    primaryBg: '#f8fafc',
    previewBg: '#000000',
    previewCard: '#0a0a0a',
    previewBorder: '#27272a',
    isDark: true,
    category: 'especial'
  },
  {
    id: 'light',
    name: 'Modo Claro Azul',
    label: 'Executivo Claro (Daylight Blue)',
    description: 'Ambiente diurno de alto contraste, fundo branco níveo e leitura ultra nítida.',
    primaryColor: '#2563eb',
    primaryBg: '#3b82f6',
    previewBg: '#f8fafc',
    previewCard: '#ffffff',
    previewBorder: '#e2e8f0',
    isDark: false,
    category: 'claro'
  },
  {
    id: 'light-emerald',
    name: 'Modo Claro Verde',
    label: 'Modo Claro Verde Fresh (Daylight Mint)',
    description: 'Fundo claro com realces em verde esmeralda revigorante e botões energéticos.',
    primaryColor: '#059669',
    primaryBg: '#10b981',
    previewBg: '#f8fbf9',
    previewCard: '#ffffff',
    previewBorder: '#d1fae5',
    isDark: false,
    category: 'claro'
  },
  {
    id: 'light-warm',
    name: 'Modo Claro Areia',
    label: 'Modo Claro Areia & Âmbar (Daylight Warm)',
    description: 'Tons suaves e acolhedores estilo papel nobre com botões e acentos em bronze e âmbar.',
    primaryColor: '#d97706',
    primaryBg: '#f59e0b',
    previewBg: '#faf8f5',
    previewCard: '#ffffff',
    previewBorder: '#f0e6da',
    isDark: false,
    category: 'claro'
  }
];
