import { EmpresaConfig, Produto, Lead, Cliente, Deal, Proposta, Atividade, Visita, UserAccount } from '../types/crm';

export const DEFAULT_USERS: UserAccount[] = [
  { id: 'u1', nome: 'Administrador', user: 'admin', pass: 'admin123', role: 'admin' },
  { id: 'u2', nome: 'Consultor Comercial', user: 'vendas', pass: 'vendas123', role: 'user' }
];

export const DEFAULT_EMPRESA: EmpresaConfig = {
  razaoSocial: 'FERA SISTEMA DO BRASIL',
  nomeFantasia: 'FERA SISTEMA DO BRASIL — LINX/TOTVS',
  cnpj: '08.323.625/0001-04',
  inscricaoEstadual: '123.456.789.000',
  telefone: '(11) 98765-4321',
  email: 'comercial@ferasistemas.com.br',
  site: 'https://ferasistemas.com.br',
  endereco: 'Av. Paulista, 1000 - Bela Vista',
  cidade: 'São Paulo',
  uf: 'SP',
  cep: '01310-100',
  responsavel: 'Diretoria Comercial',
  slogan: 'Sistemas inteligentes para postos de combustíveis e conveniências',
  logo: ''
};

export const DEFAULT_PRODUCTS: Produto[] = [
  {
    id: 'p-linx-autosystem',
    nome: 'Linx- TOTVS-Autosystem PRO + GLOUD',
    descricao: 'Suite em nuvem com Autosystem pro, emissão fiscal, TEF, conciliação e app gestor.',
    preco: 0,
    implantacao: 3000,
    mensalidade: 1340,
    categoria: 'ambos',
    icone: 'Layers',
    modulos: [
      { nome: 'Autosystem pro', preco: 0 },
      { nome: 'SNAST-POS', preco: 0 },
      { nome: 'NAFC-E MENSAL', preco: 0 },
      { nome: 'Equals', preco: 0 },
      { nome: 'QR code', preco: 0 },
      { nome: 'Linx-autosystem GLOUD (NUVEM)', preco: 0 },
      { nome: 'Gestor app', preco: 0 }
    ]
  },
  {
    id: 'p1',
    nome: 'Sistema PDV Posto',
    descricao: 'Ponto de venda completo para bombas, com integração de tanques, nota fiscal e controle de turno.',
    preco: 8900,
    implantacao: 2500,
    mensalidade: 350,
    categoria: 'posto',
    icone: 'CashRegister',
    modulos: [
      { nome: 'Frente de caixa', preco: 0 },
      { nome: 'Controle de bombas', preco: 500 },
      { nome: 'Nota fiscal (NFC-e / SAT)', preco: 0 },
      { nome: 'Controle de turno e sangria', preco: 0 },
      { nome: 'Relatórios gerenciais de venda', preco: 0 },
      { nome: 'Integração direta com tanques', preco: 400 }
    ]
  },
  {
    id: 'p2',
    nome: 'Gestão de Combustível',
    descricao: 'Controle de estoque de combustível, medição de tanques, alertas de reposição e conciliação.',
    preco: 6500,
    implantacao: 1800,
    mensalidade: 280,
    categoria: 'posto',
    icone: 'Fuel',
    modulos: [
      { nome: 'Estoque de combustível LMC', preco: 0 },
      { nome: 'Medição automática de tanques', preco: 600 },
      { nome: 'Alertas de reposição e estoque mínimo', preco: 0 },
      { nome: 'Conciliação de volume físico x contábil', preco: 300 },
      { nome: 'Entrada de cargas com nota eletrônica', preco: 0 },
      { nome: 'Controle de perdas e sobras térmicas', preco: 450 }
    ]
  },
  {
    id: 'p3',
    nome: 'PDV Conveniência',
    descricao: 'Sistema de frente de caixa para loja de conveniência com balança, código de barras e promoções.',
    preco: 4900,
    implantacao: 1200,
    mensalidade: 220,
    categoria: 'conveniencia',
    icone: 'Store',
    modulos: [
      { nome: 'Frente de caixa ágil', preco: 0 },
      { nome: 'Integração com balança checkout', preco: 250 },
      { nome: 'Promoções e combos automáticos', preco: 200 },
      { nome: 'Controle de estoque básico', preco: 0 },
      { nome: 'NFC-e com contingência offline', preco: 0 },
      { nome: 'Sangria, suprimento e fechamento cego', preco: 0 }
    ]
  },
  {
    id: 'p4',
    nome: 'Gestão de Estoque Avançado',
    descricao: 'Controle completo de estoque, compras, fornecedores, inventário com coletor e curva ABC para conveniência.',
    preco: 3200,
    implantacao: 800,
    mensalidade: 150,
    categoria: 'conveniencia',
    icone: 'Boxes',
    modulos: [
      { nome: 'Cadastro com tributação por NCM', preco: 0 },
      { nome: 'Sugestão de compra inteligente', preco: 350 },
      { nome: 'Inventário com leitor móvel', preco: 400 },
      { nome: 'Curva ABC de produtos e lucratividade', preco: 0 },
      { nome: 'Transferência entre postos da rede', preco: 300 }
    ]
  },
  {
    id: 'p5',
    nome: 'Suite Completa Posto + Loja',
    descricao: 'Pacote integrado: PDV posto + gestão de combustível + PDV conveniência + estoque unificado.',
    preco: 18900,
    implantacao: 4500,
    mensalidade: 690,
    categoria: 'ambos',
    icone: 'Layers',
    modulos: [
      { nome: 'PDV Posto Integrado', preco: 0 },
      { nome: 'Gestão de Combustível e LMC', preco: 0 },
      { nome: 'PDV Loja de Conveniência', preco: 0 },
      { nome: 'Gestão de Estoque e Compras', preco: 0 },
      { nome: 'Relatórios consolidados matriz/filiais', preco: 800 },
      { nome: 'Multi-empresa e retaguarda web', preco: 1000 }
    ]
  },
  {
    id: 'p6',
    nome: 'App Mobile Gestor',
    descricao: 'Aplicativo para o dono acompanhar faturamento, volume vendido e estoque em tempo real pelo celular.',
    preco: 1500,
    implantacao: 0,
    mensalidade: 99,
    categoria: 'ambos',
    icone: 'Smartphone',
    modulos: [
      { nome: 'Dashboard em tempo real', preco: 0 },
      { nome: 'Alertas de tanques e sangrias', preco: 0 },
      { nome: 'Preços de bomba e alteração remota', preco: 250 }
    ]
  },
  {
    id: 'p7',
    nome: 'Automação de Bombas (Concentrador)',
    descricao: 'Automação homologada para concentradores Wayne, Gilbarco, Laser, Companytec. Bloqueio e pré-determinação.',
    preco: 14500,
    implantacao: 4500,
    mensalidade: 450,
    categoria: 'posto',
    icone: 'Cpu',
    modulos: [
      { nome: 'Comunicação direta com concentrador', preco: 0 },
      { nome: 'Pré-determinação de abastecimento', preco: 500 },
      { nome: 'Captura automática de volume e valor', preco: 0 },
      { nome: 'Bloqueio de bombas após abastecer', preco: 400 },
      { nome: 'Identificação de frentista por tag RFID', preco: 600 }
    ]
  },
  {
    id: 'p8',
    nome: 'Medidor Automático de Tanques (ATG)',
    descricao: 'Sistema de medição ATG: nível milimétrico, volume compensado, temperatura, borra e alertas de vazamento.',
    preco: 9800,
    implantacao: 3200,
    mensalidade: 320,
    categoria: 'posto',
    icone: 'Gauge',
    modulos: [
      { nome: 'Nível e volume em tempo real', preco: 0 },
      { nome: 'Sensor de temperatura e densidade', preco: 300 },
      { nome: 'Detecção de água no fundo do tanque', preco: 350 },
      { nome: 'Alerta ambiental de vazamento', preco: 500 },
      { nome: 'Histórico de descargas de caminhão tanque', preco: 0 }
    ]
  }
];

export const SEED_LEADS: Lead[] = [
  {
    id: 'lead-1',
    nome: 'Carlos Mendes',
    empresa: 'Posto Estrela do Sul',
    tipo: 'posto',
    telefone: '(11) 98765-4321',
    email: 'carlos@estreladosul.com.br',
    cidade: 'São Paulo / SP',
    cnpj: '12.345.678/0001-90',
    filiais: [
      { cnpj: '12.345.678/0002-71', nome: 'Posto Estrela do Sul - Filial Aeroporto' }
    ],
    bombas: '8 bombas',
    tamanhoLoja: '',
    origem: 'Indicação',
    status: 'proposta',
    valorEstimado: 23400,
    valorImplantacao: 6000,
    valorMensalidade: 890,
    observacoes: 'Interessado na automação completa + PDV de pista para 2 postos.',
    historico: [
      { data: new Date(Date.now() - 86400000 * 4).toISOString(), texto: 'Lead cadastrado no sistema' },
      { data: new Date(Date.now() - 86400000 * 2).toISOString(), texto: 'Visita técnica realizada no posto' },
      { data: new Date(Date.now() - 86400000).toISOString(), texto: 'Proposta PROP-2026-001 gerada com 2 unidades' }
    ],
    criadoEm: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'lead-2',
    nome: 'Ana Paula Rocha',
    empresa: 'Conveniência 24 Horas Centro',
    tipo: 'conveniencia',
    telefone: '(21) 99887-6655',
    email: 'ana@conv24h.com.br',
    cidade: 'Rio de Janeiro / RJ',
    cnpj: '98.765.432/0001-10',
    filiais: [],
    bombas: '',
    tamanhoLoja: '120m²',
    origem: 'Site',
    status: 'qualificado',
    valorEstimado: 8100,
    valorImplantacao: 2000,
    valorMensalidade: 370,
    observacoes: 'Precisa de PDV + controle de estoque com leitor de código de barras.',
    historico: [
      { data: new Date(Date.now() - 86400000 * 6).toISOString(), texto: 'Lead cadastrado via formulário' },
      { data: new Date(Date.now() - 86400000 * 3).toISOString(), texto: 'Qualificação aprovada pelo consultor' }
    ],
    criadoEm: new Date(Date.now() - 86400000 * 6).toISOString()
  },
  {
    id: 'lead-3',
    nome: 'Roberto Lima',
    empresa: 'Rede Postos Horizonte',
    tipo: 'ambos',
    telefone: '(31) 97777-1234',
    email: 'roberto@horizontepostos.com.br',
    cidade: 'Belo Horizonte / MG',
    cnpj: '11.222.333/0001-44',
    filiais: [
      { cnpj: '11.222.333/0002-25', nome: 'Posto Horizonte Contagem' },
      { cnpj: '11.222.333/0003-06', nome: 'Posto Horizonte Betim' }
    ],
    bombas: '18 bombas',
    tamanhoLoja: '3 lojas',
    origem: 'Feira / Evento',
    status: 'negociacao',
    valorEstimado: 56700,
    valorImplantacao: 13500,
    valorMensalidade: 2070,
    observacoes: 'Negociação com desconto para padronizar toda a rede de 3 postos com suite integrada.',
    historico: [
      { data: new Date(Date.now() - 86400000 * 10).toISOString(), texto: 'Contato inicial na feira de combustíveis' },
      { data: new Date(Date.now() - 86400000 * 5).toISOString(), texto: 'Demonstração do ERP e Automação' },
      { data: new Date(Date.now() - 86400000 * 1).toISOString(), texto: 'Em negociação de fechamento com a diretoria' }
    ],
    criadoEm: new Date(Date.now() - 86400000 * 10).toISOString()
  }
];

export const SEED_CLIENTES: Cliente[] = [
  {
    id: 'cli-1',
    leadId: null,
    nome: 'Fernando Alves',
    empresa: 'Auto Posto Bandeira Branca',
    tipo: 'posto',
    telefone: '(19) 95555-0001',
    email: 'fernando@bandeirabranca.com.br',
    cidade: 'Campinas / SP',
    cnpj: '22.333.444/0001-55',
    bombas: '6 bombas',
    tamanhoLoja: '',
    status: 'ativo',
    sistemas: ['Sistema PDV Posto', 'Gestão de Combustível'],
    produtosIds: ['p1', 'p2'],
    modulos: ['Frente de caixa', 'Controle de bombas', 'LMC', 'Medição de tanques'],
    valorContrato: 15400,
    valorImplantacao: 4300,
    valorMensalidade: 630,
    dataFechamento: new Date(Date.now() - 86400000 * 60).toISOString(),
    observacoes: 'Cliente ativo em dia. Suporte técnico via WhatsApp.'
  },
  {
    id: 'cli-2',
    leadId: null,
    nome: 'Mariana Souza',
    empresa: 'Mini Mercado & Conveniência Express',
    tipo: 'conveniencia',
    telefone: '(19) 94444-3322',
    email: 'mariana@expresstore.com.br',
    cidade: 'Piracicaba / SP',
    cnpj: '33.444.555/0001-66',
    bombas: '',
    tamanhoLoja: '80m²',
    status: 'ativo',
    sistemas: ['PDV Conveniência', 'Gestão de Estoque Avançado'],
    produtosIds: ['p3', 'p4'],
    modulos: ['Frente de caixa', 'Balança', 'Controle de estoque'],
    valorContrato: 8100,
    valorImplantacao: 2000,
    valorMensalidade: 370,
    dataFechamento: new Date(Date.now() - 86400000 * 90).toISOString(),
    observacoes: 'Excelente relação. Sugerido App mobile para o gestor.'
  }
];

export const SEED_DEALS: Deal[] = SEED_LEADS.map(l => ({
  id: 'deal-' + l.id,
  leadId: l.id,
  titulo: l.empresa,
  contato: l.nome,
  valor: l.valorEstimado,
  stage: l.status,
  tipo: l.tipo,
  criadoEm: l.criadoEm
}));

export const SEED_PROPOSTAS: Proposta[] = [
  {
    id: 'prop-1',
    numero: 'PROP-2026-001',
    leadId: 'lead-1',
    empresa: 'Posto Estrela do Sul',
    contato: 'Carlos Mendes',
    telefone: '(11) 98765-4321',
    email: 'carlos@estreladosul.com.br',
    cnpj: '12.345.678/0001-90',
    cnpjs: [
      { cnpj: '12.345.678/0001-90', nome: 'Matriz' },
      { cnpj: '12.345.678/0002-71', nome: 'Filial Aeroporto' }
    ],
    itens: [
      {
        produtoId: 'p7',
        nome: 'Automação de Bombas (Concentrador)',
        preco: 14500,
        implantacao: 4500,
        mensalidade: 450,
        qtd: 1,
        modulos: [
          { nome: 'Comunicação direta com concentrador', preco: 0 },
          { nome: 'Pré-determinação de abastecimento', preco: 500 }
        ]
      },
      {
        produtoId: 'p1',
        nome: 'Sistema PDV Posto',
        preco: 8900,
        implantacao: 2500,
        mensalidade: 350,
        qtd: 1,
        modulos: [
          { nome: 'Frente de caixa', preco: 0 },
          { nome: 'Controle de bombas', preco: 500 }
        ]
      }
    ],
    desconto: 5,
    descontoImplantacao: 10,
    descontoMensalidade: 0,
    replicarFiliais: false,
    unidadesRede: 1,
    status: 'enviada',
    validade: new Date(Date.now() + 86400000 * 15).toISOString(),
    observacoes: 'Instalação física com concentrador Companytec homologado.',
    criadoEm: new Date(Date.now() - 86400000).toISOString()
  }
];

export const SEED_VISITAS: Visita[] = [
  {
    id: 'vis-1',
    data: new Date(Date.now() - 86400000 * 2).toISOString(),
    tipoVisita: 'Visita presencial',
    empresa: 'Posto Boa Vista',
    contato: 'Roberto Lima',
    cnpj: '45.678.901/0001-23',
    telefone: '(11) 97777-6666',
    email: 'contato@postoboavista.com.br',
    cidade: 'Guarulhos / SP',
    endereco: 'Rodovia Presidente Dutra, km 220',
    lat: -23.4628,
    lng: -46.5333,
    tipo: 'posto',
    bombas: '8 bombas',
    tamanhoLoja: '',
    sistemaAtual: 'Sistema legado em DOS sem suporte',
    interesse: 'alto',
    produtosIds: ['p1', 'p7'],
    produtosNomes: ['Sistema PDV Posto', 'Automação de Bombas (Concentrador)'],
    resultado: 'Demonstrou alto interesse em trocar o sistema antigo pelo FERA. Solicitou visita com demonstração da automação.',
    observacoes: 'Posto com bandeira branca, 8 bicos de abastecimento.',
    leadId: null,
    clienteId: null,
    criadoEm: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'vis-2',
    data: new Date(Date.now() - 86400000 * 5).toISOString(),
    tipoVisita: 'Cold call no local',
    empresa: 'Auto Posto Central da Rodovia',
    contato: 'Fernanda Oliveira',
    telefone: '(11) 96666-5555',
    email: 'fernanda@postocentral.com.br',
    cidade: 'São Paulo / SP',
    endereco: 'Av. Marginal Tietê, 4500',
    lat: -23.5187,
    lng: -46.6234,
    tipo: 'ambos',
    bombas: '12 bombas',
    tamanhoLoja: '60m²',
    sistemaAtual: 'Planilha Excel e PDV avulso',
    interesse: 'medio',
    produtosIds: ['p5'],
    produtosNomes: ['Suite Completa Posto + Loja'],
    resultado: 'Proprietária pediu envio de apresentação e retorno na próxima semana.',
    observacoes: 'Grande fluxo de veículos de passeio e caminhões.',
    leadId: null,
    clienteId: null,
    criadoEm: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

export const SEED_ATIVIDADES: Atividade[] = [
  {
    id: 'ativ-1',
    tipo: 'ligacao',
    titulo: 'Ligação de follow-up da proposta PROP-2026-001',
    descricao: 'Verificar se Carlos Mendes tirou dúvidas sobre os prazos de entrega do concentrador.',
    resultado: 'positivo',
    relacionado: 'Posto Estrela do Sul',
    leadId: 'lead-1',
    data: new Date(Date.now() + 86400000 * 1).toISOString(),
    concluida: false
  },
  {
    id: 'ativ-2',
    tipo: 'reuniao',
    titulo: 'Demonstração online da Suite Completa',
    descricao: 'Apresentar módulo de conveniência e controle de estoque para Ana Paula.',
    resultado: '',
    relacionado: 'Conveniência 24 Horas Centro',
    leadId: 'lead-2',
    data: new Date(Date.now() + 86400000 * 2).toISOString(),
    concluida: false
  },
  {
    id: 'ativ-3',
    tipo: 'whatsapp',
    titulo: 'Envio de catálogo em PDF para Posto Boa Vista',
    descricao: 'Enviar comparativo técnico do concentrador de bombas.',
    resultado: 'positivo',
    relacionado: 'Posto Boa Vista',
    data: new Date(Date.now() - 86400000).toISOString(),
    concluida: true
  }
];
