# Como Testar o Admin MECA

## 🚀 Iniciando o Admin

1. **Navegue para o diretório do admin:**
   ```bash
   cd meca-admin-nextjs
   ```

2. **Instale as dependências (se necessário):**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse o admin no navegador:**
   ```
   http://localhost:3000
   ```

## 🔐 Login no Admin

1. **Acesse a página de login:**
   ```
   http://localhost:3000/login
   ```

2. **Use as credenciais de teste:**
   - **Email:** admin@meca.com
   - **Senha:** admin123

## 📊 Páginas Disponíveis

### 1. Dashboard Principal
- **URL:** `/dashboard`
- **Funcionalidades:**
  - Métricas gerais do marketplace
  - Total de clientes e oficinas
  - Status das oficinas (pendentes, aprovadas, rejeitadas)
  - Receita e comissões MECA

### 2. Gerenciamento de Oficinas
- **URL:** `/dashboard/workshops`
- **Funcionalidades:**
  - Listar todas as oficinas
  - Filtrar por status (pendente, aprovado, rejeitado)
  - Aprovar/rejeitar oficinas
  - Ver detalhes de cada oficina

### 3. Gerenciamento de Serviços
- **URL:** `/dashboard/services`
- **Funcionalidades:**
  - Listar todos os serviços
  - Criar novos serviços
  - Editar serviços existentes
  - Deletar serviços

### 4. Gerenciamento de Usuários
- **URL:** `/dashboard/users`
- **Funcionalidades:**
  - Listar clientes
  - Listar oficinas
  - Ver detalhes dos usuários

### 5. Gerenciamento de Agendamentos
- **URL:** `/dashboard/bookings`
- **Funcionalidades:**
  - Listar todos os agendamentos
  - Filtrar por status
  - Atualizar status dos agendamentos

### 6. Notificações
- **URL:** `/dashboard/notifications`
- **Funcionalidades:**
  - Enviar notificações
  - Configurar alertas

### 7. Relatórios
- **URL:** `/dashboard/reports`
- **Funcionalidades:**
  - Relatórios de receita
  - Relatórios de comissões
  - Relatórios de agendamentos

### 8. Perfil do Admin
- **URL:** `/dashboard/profile`
- **Funcionalidades:**
  - Editar informações do admin
  - Alterar senha

### 9. Status da API
- **URL:** `/dashboard/api-status`
- **Funcionalidades:**
  - Verificar status da API
  - Testar conectividade

### 10. Teste da API
- **URL:** `/test-api`
- **Funcionalidades:**
  - Testar todos os endpoints
  - Verificar respostas da API

## 🔧 Configuração da API

O admin está configurado para usar a API da EC2:
- **URL da API:** `http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000`
- **Autenticação:** Bearer Token
- **Fallback:** Dados mock em caso de erro

## 📱 Responsividade

O admin é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Mobile

## 🎨 Design

O admin segue o design system MECA:
- **Cores principais:** Verde (#00C977) e Cinza escuro (#252940)
- **Tipografia:** Inter
- **Componentes:** Cards, botões, formulários consistentes

## 🚨 Troubleshooting

### Problemas Comuns:

1. **Erro de conexão com a API:**
   - Verifique se a API está rodando na EC2
   - Teste a conectividade em `/test-api`

2. **Dados não carregam:**
   - O admin usa fallback para dados mock
   - Verifique o console do navegador para erros

3. **Login não funciona:**
   - Use as credenciais: admin@meca.com / admin123
   - Verifique se o token está sendo salvo no localStorage

## 📞 Suporte

Para problemas técnicos:
- Verifique o console do navegador
- Teste a API em `/test-api`
- Verifique se a API da EC2 está funcionando















