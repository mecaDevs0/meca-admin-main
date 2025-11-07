# 🚀 Como Rodar o Admin MECA

## 📋 Pré-requisitos

- Node.js 20+ instalado
- npm ou yarn instalado

## 🔧 Instalação

1. **Navegue para o diretório do admin:**
   ```bash
   cd meca-admin-nextjs
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

## ▶️ Executar o Admin

### Modo Desenvolvimento

```bash
npm run dev
```

O admin estará disponível em:
```
http://localhost:3000
```

### Modo Produção

```bash
# Build
npm run build

# Iniciar
npm start
```

## 🔐 Acessar o Admin

1. **Acesse a URL:**
   ```
   http://localhost:3000
   ```

2. **Faça login:**
   - **Email:** `admin@mecabr.com` (ou qualquer email de admin criado)
   - **Senha:** A senha que você configurou via link de setup
   
   **OU**
   
   - **Login com Código:** Clique em "Login com Código", insira o email e clique em "Enviar Código". Verifique seu email para o código de 6 dígitos.

## 📊 Páginas Disponíveis

Após login, você terá acesso a:

- **Dashboard** (`/dashboard`) - Métricas e gráficos
- **Oficinas** (`/dashboard/workshops`) - Gerenciar oficinas
- **Serviços** (`/dashboard/services`) - Gerenciar serviços
- **Notificações** (`/dashboard/notifications`) - Enviar notificações
- **Usuários** (`/dashboard/users`) - Listar usuários
- **Relatórios** (`/dashboard/reports`) - Relatórios
- **Agendamentos** (`/dashboard/bookings`) - Gerenciar agendamentos
- **Status API** (`/dashboard/api-status`) - Status da API
- **Perfil** (`/dashboard/profile`) - Perfil do admin

## 🎨 Features

- ✅ Tema Dark/Light (toggle na sidebar)
- ✅ Tabelas com filtros e paginação (ShadCN)
- ✅ Gráficos interativos (Recharts + Framer Motion)
- ✅ Notificações toast (Sonner)
- ✅ Sidebar modular com gradiente
- ✅ Design mobile-first

## 🔧 Troubleshooting

### Erro: Porta 3000 já em uso
```bash
# Use outra porta
PORT=3001 npm run dev
```

### Erro: Módulos não encontrados
```bash
# Reinstale dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: API não conecta
Verifique se a API está rodando na EC2:
```
http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000
```


