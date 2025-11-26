# Como Testar o Admin MECA

## 1. Instalação e Configuração

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### Passos para executar:

```bash
cd meca-admin-nextjs
npm install
npm run dev
```

O admin estará disponível em: `http://localhost:3000`

## 2. Login no Admin

1. Acesse `http://localhost:3000`
2. Você será redirecionado para a página de login
3. Use qualquer email/senha (o sistema está em modo de desenvolvimento)
4. Clique em "Entrar"

## 3. Páginas Disponíveis

### Dashboard Principal (`/dashboard`)
- **Métricas do Sistema**: Total de clientes, oficinas, agendamentos
- **Status das Oficinas**: Aprovadas, pendentes, rejeitadas
- **Receita e Comissões**: Dados financeiros do último mês
- **Cards Visuais**: Interface moderna com cores MECA

### Oficinas (`/dashboard/workshops`)
- **Lista de Oficinas**: Visualizar todas as oficinas cadastradas
- **Filtros por Status**: Pendentes, aprovadas, rejeitadas
- **Ações**: Aprovar ou rejeitar oficinas
- **Detalhes**: Informações completas de cada oficina

### Serviços (`/dashboard/services`)
- **Gerenciar Serviços**: Criar, editar, excluir serviços
- **Categorias**: Organizar serviços por categoria
- **Status**: Ativar/desativar serviços

### Usuários (`/dashboard/users`)
- **Clientes**: Lista de todos os clientes cadastrados
- **Oficinas**: Lista de oficinas (usuários)
- **Filtros**: Buscar por tipo de usuário
- **Detalhes**: Informações completas de cada usuário

### Notificações (`/dashboard/notifications`)
- **Enviar Notificações**: Para clientes ou oficinas
- **Histórico**: Notificações enviadas
- **Templates**: Mensagens pré-definidas

### Relatórios (`/dashboard/reports`)
- **Relatórios Financeiros**: Receita, comissões, pagamentos
- **Relatórios de Uso**: Agendamentos, oficinas mais populares
- **Exportação**: Download em PDF/Excel

### Status API (`/dashboard/api-status`)
- **Status da API**: Verificar se a API da EC2 está funcionando
- **Métricas de Performance**: Tempo de resposta, disponibilidade
- **Logs**: Últimas requisições e erros

### Teste API (`/test-api`)
- **Teste Completo**: Testar todos os endpoints da API
- **Resultados em Tempo Real**: Ver respostas da API
- **Debug**: Identificar problemas de conectividade

## 4. Funcionalidades Principais

### ✅ Implementadas
- **Dashboard com Métricas**: Dados mock funcionais
- **Interface Responsiva**: Funciona em desktop e mobile
- **Navegação Intuitiva**: Sidebar colapsível
- **Design MECA**: Cores e identidade visual
- **Teste de API**: Verificar conectividade com EC2

### 🔄 Em Desenvolvimento
- **Integração Real com API**: Conectar com endpoints da EC2
- **Autenticação Real**: Sistema de login funcional
- **Dados em Tempo Real**: Substituir dados mock
- **Ações Administrativas**: Aprovar/rejeitar oficinas

## 5. Configuração da API

### URL da API
A API está configurada para apontar para:
```
http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000
```

### Endpoints Testados
- `/health` - Status da API
- `/workshops` - Lista de oficinas
- `/services` - Lista de serviços
- `/customers` - Lista de clientes
- `/bookings` - Lista de agendamentos

## 6. Troubleshooting

### Problemas Comuns

1. **API não responde**
   - Verifique se a API da EC2 está rodando
   - Teste a conectividade em `/test-api`
   - Verifique o status em `/dashboard/api-status`

2. **Erro de CORS**
   - A API da EC2 precisa permitir requisições do admin
   - Verificar configuração de CORS no servidor

3. **Dados não carregam**
   - Verificar se o banco RDS está populado
   - Testar endpoints individualmente
   - Verificar logs da API

## 7. Próximos Passos

1. **Configurar Domínio Público**: Usar GoDaddy para hospedar
2. **SSL/HTTPS**: Configurar certificado SSL
3. **Autenticação Real**: Implementar login seguro
4. **Dados Reais**: Conectar com banco RDS
5. **Deploy**: Configurar CI/CD

## 8. Contato

Para dúvidas ou problemas:
- Verificar logs do console do navegador
- Testar endpoints em `/test-api`
- Verificar status da API em `/dashboard/api-status`

















