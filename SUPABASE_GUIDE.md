# Guia de Publicação e Integração no Supabase
### FERA SISTEMA DO BRASIL — LINX/TOTVS

Este projeto foi totalmente estruturado e otimizado para rodar com o **Supabase** (PostgreSQL na Nuvem) e com suporte a fallback offline/local storage.

---

## 1. Criar o Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com) e crie uma conta gratuita (caso ainda não tenha).
2. Clique em **"New Project"**.
3. Escolha uma organização, defina um nome (ex: `crm-fera-sistemas`) e uma senha forte para o banco de dados.
4. Escolha a região mais próxima (ex: `South America (São Paulo) - sa-east-1`).
5. Clique em **"Create new project"** e aguarde cerca de 1 minuto até a conclusão.

---

## 2. Criar a Estrutura de Tabelas (Schema SQL)

1. No painel do seu projeto Supabase, clique no menu lateral em **"SQL Editor"** (ícone de terminal/código).
2. Clique em **"New Query"**.
3. Copie todo o conteúdo do arquivo `supabase/schema.sql` (ou use o botão **"Copiar Script SQL"** diretamente na aba **Supabase** dentro deste CRM).
4. Cole no editor do Supabase e clique em **"Run"** (ou aperte `Ctrl + Enter`).
5. Pronto! As tabelas e políticas de acesso (RLS) foram criadas:
   - `crm_empresa`
   - `crm_usuarios`
   - `crm_produtos`
   - `crm_leads`
   - `crm_clientes`
   - `crm_deals`
   - `crm_propostas`
   - `crm_visitas`
   - `crm_atividades`

---

## 3. Obter as Chaves de Acesso (API Keys)

1. No menu lateral do Supabase, clique na engrenagem de configurações **"Project Settings"**.
2. Clique na aba **"API"**.
3. Você precisará de dois valores:
   - **Project URL** (ex: `https://xyzprojectid.supabase.co`)
   - **Project API Keys -> `anon` / `public`** (chave que começa com `eyJhbGci...`)

---

## 4. Conectar o CRM ao Supabase

Você pode conectar de **duas formas**:

### Opção A: Pela interface do próprio CRM (Recomendado)
1. No CRM, clique no botão com ícone do **Supabase** (ou na barra superior/lateral).
2. Cole a **URL do Supabase** e a **Chave Anon**.
3. Clique em **"Testar Conexão"**.
4. Quando estiver verde, clique em **"Salvar e Conectar"**.
5. Clique em **"Enviar Todos os Dados para o Supabase (Push Inicial)"** para subir todos os leads, clientes, visitas e propostas existentes para o seu banco!

### Opção B: Por variáveis de ambiente (`.env`)
No arquivo `.env` da raiz do projeto, adicione:
```env
VITE_SUPABASE_URL="https://sua-url-aqui.supabase.co"
VITE_SUPABASE_ANON_KEY="sua-chave-anon-aqui"
```

---

## 5. Como Publicar o Frontend na Web

O frontend é uma Single Page Application construída com React 19, TypeScript e Tailwind CSS.

### Opções populares de publicação gratuita:
- **Vercel**: Conecte o repositório GitHub e configure as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. O comando de build é `npm run build` e a pasta de saída é `dist`.
- **Netlify**: O mesmo processo, com output em `dist`.
- **Supabase Storage**: Você também pode gerar o build com `npm run build` e hospedar os arquivos estáticos da pasta `dist/`.
- **Docker / Cloud Run**: O projeto já possui script de build pronto para contêiner.

---

## 6. Recursos Inclusos

- **Sincronização Bidirecional**: Envie (`Push`) ou baixe (`Pull`) os dados quando quiser.
- **Modo Offline Resiliente**: Se a internet cair ou o Supabase estiver em manutenção, o sistema continua funcionando gravando no armazenamento local e sincroniza ao reconectar.
- **Relatórios**: Exportação de postos visitados para PDF e planilha Excel (CSV).
- **Propostas Comerciais**: Geração de propostas em layout profissional com logotipo, desconto em licença/implantação/mensalidade e botão direto para WhatsApp.
