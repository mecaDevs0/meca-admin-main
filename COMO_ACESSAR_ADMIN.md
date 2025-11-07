# 🚀 Como Acessar o Admin MECA

## 📍 URL Local (Desenvolvimento)

### Passo 1: Iniciar o Admin
```bash
cd meca-admin-nextjs
npm run dev
```

### Passo 2: Acessar no Navegador
```
http://localhost:3000
```

O admin redireciona automaticamente para `/login` se você não estiver autenticado.

## 🔐 Login

### Opção 1: Login com Senha
1. Acesse `http://localhost:3000/login`
2. Selecione "Login com Senha"
3. Use um dos emails de admin:
   - `admin@mecabr.com`
   - `pedro.santana@mecabr.com`
   - `ff@mecabr.com`
   - `jp@mecabr.com`
   - `contato@mecabr.com`
4. Digite a senha que você criou após receber o email de boas-vindas

### Opção 2: Login com Código
1. Acesse `http://localhost:3000/login`
2. Selecione "Login com Código"
3. Digite seu email de admin
4. Clique em "Enviar Código"
5. Verifique seu email e use o código de 6 dígitos recebido
6. Clique em "Entrar com Código"

## 📱 Primeira Vez (Setup de Senha)

Se você recebeu um email de boas-vindas:

1. Clique no link do email (ou acesse `http://localhost:3000/setup-password?token=SEU_TOKEN`)
2. Digite sua nova senha
3. Confirme a senha
4. Clique em "Criar Senha"
5. Você será redirecionado para o login

## 🎯 Páginas Disponíveis

Após o login, você terá acesso a:

- **Dashboard**: `/dashboard` - Métricas gerais
- **Oficinas**: `/dashboard/workshops` - Gerenciar oficinas
- **Agendamentos**: `/dashboard/bookings` - Gerenciar agendamentos
- **Serviços**: `/dashboard/services` - Gerenciar serviços
- **Notificações**: `/dashboard/notifications` - Enviar notificações
- **Usuários**: `/dashboard/users` - Gerenciar usuários
- **Relatórios**: `/dashboard/reports` - Relatórios
- **Status API**: `/dashboard/api-status` - Status da API
- **Perfil**: `/dashboard/profile` - Seu perfil

## 🔧 Troubleshooting

### Admin não inicia
```bash
# Verificar se a porta 3000 está livre
lsof -ti:3000 | xargs kill -9

# Reiniciar
npm run dev
```

### Erro de autenticação
- Verifique se você criou a senha após receber o email
- Use o fluxo de "Login com Código" se não lembrar a senha
- Verifique se o token JWT está válido no localStorage

### API não conecta
- Verifique se a API está rodando na EC2
- URL da API: `http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000`
- Teste: `curl http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000/health`



## 📍 URL Local (Desenvolvimento)

### Passo 1: Iniciar o Admin
```bash
cd meca-admin-nextjs
npm run dev
```

### Passo 2: Acessar no Navegador
```
http://localhost:3000
```

O admin redireciona automaticamente para `/login` se você não estiver autenticado.

## 🔐 Login

### Opção 1: Login com Senha
1. Acesse `http://localhost:3000/login`
2. Selecione "Login com Senha"
3. Use um dos emails de admin:
   - `admin@mecabr.com`
   - `pedro.santana@mecabr.com`
   - `ff@mecabr.com`
   - `jp@mecabr.com`
   - `contato@mecabr.com`
4. Digite a senha que você criou após receber o email de boas-vindas

### Opção 2: Login com Código
1. Acesse `http://localhost:3000/login`
2. Selecione "Login com Código"
3. Digite seu email de admin
4. Clique em "Enviar Código"
5. Verifique seu email e use o código de 6 dígitos recebido
6. Clique em "Entrar com Código"

## 📱 Primeira Vez (Setup de Senha)

Se você recebeu um email de boas-vindas:

1. Clique no link do email (ou acesse `http://localhost:3000/setup-password?token=SEU_TOKEN`)
2. Digite sua nova senha
3. Confirme a senha
4. Clique em "Criar Senha"
5. Você será redirecionado para o login

## 🎯 Páginas Disponíveis

Após o login, você terá acesso a:

- **Dashboard**: `/dashboard` - Métricas gerais
- **Oficinas**: `/dashboard/workshops` - Gerenciar oficinas
- **Agendamentos**: `/dashboard/bookings` - Gerenciar agendamentos
- **Serviços**: `/dashboard/services` - Gerenciar serviços
- **Notificações**: `/dashboard/notifications` - Enviar notificações
- **Usuários**: `/dashboard/users` - Gerenciar usuários
- **Relatórios**: `/dashboard/reports` - Relatórios
- **Status API**: `/dashboard/api-status` - Status da API
- **Perfil**: `/dashboard/profile` - Seu perfil

## 🔧 Troubleshooting

### Admin não inicia
```bash
# Verificar se a porta 3000 está livre
lsof -ti:3000 | xargs kill -9

# Reiniciar
npm run dev
```

### Erro de autenticação
- Verifique se você criou a senha após receber o email
- Use o fluxo de "Login com Código" se não lembrar a senha
- Verifique se o token JWT está válido no localStorage

### API não conecta
- Verifique se a API está rodando na EC2
- URL da API: `http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000`
- Teste: `curl http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000/health`



## 📍 URL Local (Desenvolvimento)

### Passo 1: Iniciar o Admin
```bash
cd meca-admin-nextjs
npm run dev
```

### Passo 2: Acessar no Navegador
```
http://localhost:3000
```

O admin redireciona automaticamente para `/login` se você não estiver autenticado.

## 🔐 Login

### Opção 1: Login com Senha
1. Acesse `http://localhost:3000/login`
2. Selecione "Login com Senha"
3. Use um dos emails de admin:
   - `admin@mecabr.com`
   - `pedro.santana@mecabr.com`
   - `ff@mecabr.com`
   - `jp@mecabr.com`
   - `contato@mecabr.com`
4. Digite a senha que você criou após receber o email de boas-vindas

### Opção 2: Login com Código
1. Acesse `http://localhost:3000/login`
2. Selecione "Login com Código"
3. Digite seu email de admin
4. Clique em "Enviar Código"
5. Verifique seu email e use o código de 6 dígitos recebido
6. Clique em "Entrar com Código"

## 📱 Primeira Vez (Setup de Senha)

Se você recebeu um email de boas-vindas:

1. Clique no link do email (ou acesse `http://localhost:3000/setup-password?token=SEU_TOKEN`)
2. Digite sua nova senha
3. Confirme a senha
4. Clique em "Criar Senha"
5. Você será redirecionado para o login

## 🎯 Páginas Disponíveis

Após o login, você terá acesso a:

- **Dashboard**: `/dashboard` - Métricas gerais
- **Oficinas**: `/dashboard/workshops` - Gerenciar oficinas
- **Agendamentos**: `/dashboard/bookings` - Gerenciar agendamentos
- **Serviços**: `/dashboard/services` - Gerenciar serviços
- **Notificações**: `/dashboard/notifications` - Enviar notificações
- **Usuários**: `/dashboard/users` - Gerenciar usuários
- **Relatórios**: `/dashboard/reports` - Relatórios
- **Status API**: `/dashboard/api-status` - Status da API
- **Perfil**: `/dashboard/profile` - Seu perfil

## 🔧 Troubleshooting

### Admin não inicia
```bash
# Verificar se a porta 3000 está livre
lsof -ti:3000 | xargs kill -9

# Reiniciar
npm run dev
```

### Erro de autenticação
- Verifique se você criou a senha após receber o email
- Use o fluxo de "Login com Código" se não lembrar a senha
- Verifique se o token JWT está válido no localStorage

### API não conecta
- Verifique se a API está rodando na EC2
- URL da API: `http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000`
- Teste: `curl http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000/health`



## 📍 URL Local (Desenvolvimento)

### Passo 1: Iniciar o Admin
```bash
cd meca-admin-nextjs
npm run dev
```

### Passo 2: Acessar no Navegador
```
http://localhost:3000
```

O admin redireciona automaticamente para `/login` se você não estiver autenticado.

## 🔐 Login

### Opção 1: Login com Senha
1. Acesse `http://localhost:3000/login`
2. Selecione "Login com Senha"
3. Use um dos emails de admin:
   - `admin@mecabr.com`
   - `pedro.santana@mecabr.com`
   - `ff@mecabr.com`
   - `jp@mecabr.com`
   - `contato@mecabr.com`
4. Digite a senha que você criou após receber o email de boas-vindas

### Opção 2: Login com Código
1. Acesse `http://localhost:3000/login`
2. Selecione "Login com Código"
3. Digite seu email de admin
4. Clique em "Enviar Código"
5. Verifique seu email e use o código de 6 dígitos recebido
6. Clique em "Entrar com Código"

## 📱 Primeira Vez (Setup de Senha)

Se você recebeu um email de boas-vindas:

1. Clique no link do email (ou acesse `http://localhost:3000/setup-password?token=SEU_TOKEN`)
2. Digite sua nova senha
3. Confirme a senha
4. Clique em "Criar Senha"
5. Você será redirecionado para o login

## 🎯 Páginas Disponíveis

Após o login, você terá acesso a:

- **Dashboard**: `/dashboard` - Métricas gerais
- **Oficinas**: `/dashboard/workshops` - Gerenciar oficinas
- **Agendamentos**: `/dashboard/bookings` - Gerenciar agendamentos
- **Serviços**: `/dashboard/services` - Gerenciar serviços
- **Notificações**: `/dashboard/notifications` - Enviar notificações
- **Usuários**: `/dashboard/users` - Gerenciar usuários
- **Relatórios**: `/dashboard/reports` - Relatórios
- **Status API**: `/dashboard/api-status` - Status da API
- **Perfil**: `/dashboard/profile` - Seu perfil

## 🔧 Troubleshooting

### Admin não inicia
```bash
# Verificar se a porta 3000 está livre
lsof -ti:3000 | xargs kill -9

# Reiniciar
npm run dev
```

### Erro de autenticação
- Verifique se você criou a senha após receber o email
- Use o fluxo de "Login com Código" se não lembrar a senha
- Verifique se o token JWT está válido no localStorage

### API não conecta
- Verifique se a API está rodando na EC2
- URL da API: `http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000`
- Teste: `curl http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000/health`



## 📍 URL Local (Desenvolvimento)

### Passo 1: Iniciar o Admin
```bash
cd meca-admin-nextjs
npm run dev
```

### Passo 2: Acessar no Navegador
```
http://localhost:3000
```

O admin redireciona automaticamente para `/login` se você não estiver autenticado.

## 🔐 Login

### Opção 1: Login com Senha
1. Acesse `http://localhost:3000/login`
2. Selecione "Login com Senha"
3. Use um dos emails de admin:
   - `admin@mecabr.com`
   - `pedro.santana@mecabr.com`
   - `ff@mecabr.com`
   - `jp@mecabr.com`
   - `contato@mecabr.com`
4. Digite a senha que você criou após receber o email de boas-vindas

### Opção 2: Login com Código
1. Acesse `http://localhost:3000/login`
2. Selecione "Login com Código"
3. Digite seu email de admin
4. Clique em "Enviar Código"
5. Verifique seu email e use o código de 6 dígitos recebido
6. Clique em "Entrar com Código"

## 📱 Primeira Vez (Setup de Senha)

Se você recebeu um email de boas-vindas:

1. Clique no link do email (ou acesse `http://localhost:3000/setup-password?token=SEU_TOKEN`)
2. Digite sua nova senha
3. Confirme a senha
4. Clique em "Criar Senha"
5. Você será redirecionado para o login

## 🎯 Páginas Disponíveis

Após o login, você terá acesso a:

- **Dashboard**: `/dashboard` - Métricas gerais
- **Oficinas**: `/dashboard/workshops` - Gerenciar oficinas
- **Agendamentos**: `/dashboard/bookings` - Gerenciar agendamentos
- **Serviços**: `/dashboard/services` - Gerenciar serviços
- **Notificações**: `/dashboard/notifications` - Enviar notificações
- **Usuários**: `/dashboard/users` - Gerenciar usuários
- **Relatórios**: `/dashboard/reports` - Relatórios
- **Status API**: `/dashboard/api-status` - Status da API
- **Perfil**: `/dashboard/profile` - Seu perfil

## 🔧 Troubleshooting

### Admin não inicia
```bash
# Verificar se a porta 3000 está livre
lsof -ti:3000 | xargs kill -9

# Reiniciar
npm run dev
```

### Erro de autenticação
- Verifique se você criou a senha após receber o email
- Use o fluxo de "Login com Código" se não lembrar a senha
- Verifique se o token JWT está válido no localStorage

### API não conecta
- Verifique se a API está rodando na EC2
- URL da API: `http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000`
- Teste: `curl http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000/health`


