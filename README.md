# MECA Admin - Painel Administrativo

Painel administrativo para gerenciamento da plataforma MECA v2.0.

## 🚀 Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilização
- **API REST** - Integração com backend Medusa

## 🎨 Paleta de Cores

- **Verde Principal**: #00c977
- **Azul Principal**: #252940
- **Preto/Azul Escuro**: #1B1D2E
- **Tons de Cinza**: #EEEEEE, #DBDBDB
- **Branco**: #FFFFFF

## 📦 Instalação

```bash
npm install
```

## ⚙️ Configuração

Configure a URL da API no arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:9000
```

## 🏃‍♂️ Executar

```bash
npm run dev
```

Acesse: http://localhost:3000

## 🔐 Login de Desenvolvimento

- **Email**: admin@meca.com
- **Senha**: admin123

## 📱 Funcionalidades

### Dashboard Principal
- Métricas gerais da plataforma
- Total de clientes e oficinas
- Agendamentos do mês
- Receita e comissão MECA

### Gestão de Oficinas
- Listar oficinas por status (pendente, aprovado, rejeitado)
- Aprovar novos cadastros
- Rejeitar com motivo
- Visualizar detalhes completos

### Gestão de Serviços
- CRUD completo de serviços base
- Categorização de serviços
- Serviços que as oficinas podem oferecer

## 🌐 Estrutura de Rotas

- `/` - Redireciona para login
- `/login` - Página de autenticação
- `/dashboard` - Dashboard principal
- `/dashboard/workshops` - Gestão de oficinas
- `/dashboard/services` - Gestão de serviços

## 🔌 Integração com API

O cliente API está em `lib/api.ts` e comunica com:

- `GET /admin/dashboard-metrics` - Métricas do dashboard
- `GET /admin/workshops` - Listar oficinas
- `POST /admin/workshops/:id/approve` - Aprovar oficina
- `POST /admin/workshops/:id/reject` - Rejeitar oficina
- `GET /admin/master-services` - Listar serviços
- `POST /admin/master-services` - Criar serviço
- `PUT /admin/master-services/:id` - Atualizar serviço
- `DELETE /admin/master-services/:id` - Excluir serviço

## 🚀 Build para Produção

```bash
npm run build
npm start
```

## 📝 Notas

- O sistema usa localStorage para armazenar o token de autenticação
- Em produção, implementar autenticação JWT real
- Mock data é usado quando a API não responde (para desenvolvimento)
