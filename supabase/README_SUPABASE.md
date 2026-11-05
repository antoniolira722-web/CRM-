# Guia de Publicação e Integração com Supabase
### FERA SISTEMA DO BRASIL — CRM Postos & Conveniências (Linx / TOTVS)

Este projeto está 100% preparado para ser conectado e publicado com o **Supabase** (PostgreSQL na nuvem com autenticação, Row Level Security e Realtime).

---

## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta ou faça login.
2. Clique em **"New Project"**.
3. Escolha uma organização, defina o nome do projeto (ex: `fera-crm-postos`), senha do banco de dados e a região mais próxima (ex: `São Paulo - South America`).
4. Aguarde o provisionamento do projeto (cerca de 1 a 2 minutos).

---

## 2. Criar as Tabelas e Políticas de Segurança (RLS)

1. No painel do seu projeto no Supabase, acesse o menu **SQL Editor** na barra lateral esquerda.
2. Clique em **"New Query"**.
3. Abra o arquivo `supabase/schema.sql` deste projeto (ou copie direto do CRM em *Configurações > Copiar Script SQL*).
4. Cole o script SQL no editor e clique no botão **"Run"** (ou `Ctrl + Enter`).
5. Você verá o retorno `Success. No rows returned`.
6. Todas as tabelas foram criadas com sucesso:
   - `crm_empresa`
   - `crm_usuarios`
   - `crm_produtos`
   - `crm_leads`
   - `crm_clientes`
   - `crm_deals`
   - `crm_propostas`
   - `crm_visitas`
   - `crm_atividades`
   - Políticas de RLS habilitadas
   - Supabase Realtime ativado para sincronização em tempo real.

---

## 3. Obter as Chaves de Conexão do Supabase

1. No painel do Supabase, vá em **Project Settings** (ícone de engrenagem) > **API**.
2. Copie:
   - **Project URL** (ex: `https://xyzcompany.supabase.co`)
   - **anon / public key** (chave pública do cliente)

---

## 4. Conectar o CRM ao Supabase

Você pode conectar de duas formas simples:

### Opção A: Pela Interface do CRM (Recomendado para uso imediato)
1. Abra o CRM.
2. No topo ou em *Configurações*, clique no botão **"Supabase"** (ícone de banco de dados).
3. Cole a **Project URL** e a **Anon Public Key**.
4. Clique em **"Testar Conexão"**.
5. Clique em **"Salvar e Ativar"**.
6. Em seguida, clique em **"Enviar Dados Locais para o Supabase (Push)"** para migrar todos os leads, catálogo Linx/TOTVS, clientes e visitas pré-cadastrados para o seu banco na nuvem!

### Opção B: Por Variáveis de Ambiente (.env)
Crie ou configure seu arquivo `.env` na raiz do projeto:
```env
VITE_SUPABASE_URL="https://SEU_PROJETO.supabase.co"
VITE_SUPABASE_ANON_KEY="SUA_CHAVE_ANON_PUBLICA"
```

---

## 5. Publicação do Front-end (Deploy)

Para publicar o sistema online para a sua equipe comercial acessar de qualquer lugar:

### Publicar no Vercel:
1. Conecte o repositório GitHub à [Vercel](https://vercel.com).
2. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. O comando de build padrão é `npm run build` e a pasta de saída é `dist`.

### Publicar no Netlify:
1. Importe o repositório no [Netlify](https://netlify.com).
2. Configure as mesmas variáveis de ambiente em **Site configuration > Environment variables**.
3. Comando de build: `npm run build`, diretório de publicação: `dist`.

---

## 6. Recursos Inclusos na Integração
- **Realtime Listener**: Atualizações ao vivo refletem automaticamente nos painéis de outros vendedores.
- **Sincronização Bidirecional**: Funções de Push e Pull direto pela tela de configurações.
- **Backup e Restauração**: Exportação e importação em JSON para segurança total dos dados.
