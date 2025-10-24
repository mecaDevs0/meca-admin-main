# Como Configurar o Admin MECA na GoDaddy

## 🌐 Configuração do Domínio

### 1. Preparação do Projeto

1. **Build do projeto para produção:**
   ```bash
   cd meca-admin-nextjs
   npm run build
   ```

2. **Teste local do build:**
   ```bash
   npm start
   ```

### 2. Configuração na GoDaddy

#### Opção A: Hospedagem Compartilhada (Recomendada)

1. **Acesse o painel da GoDaddy:**
   - Faça login em sua conta GoDaddy
   - Vá para "Meus Produtos" > "Hospedagem"

2. **Configure o domínio:**
   - Escolha um domínio (ex: admin.meca.com.br)
   - Configure o DNS para apontar para o servidor de hospedagem

3. **Upload dos arquivos:**
   - Acesse o File Manager da GoDaddy
   - Faça upload da pasta `out` (gerada pelo build)
   - Configure o arquivo `.htaccess` se necessário

#### Opção B: VPS/Cloud Server

1. **Configure um servidor VPS:**
   - Use Ubuntu 20.04+ ou similar
   - Instale Node.js 18+
   - Configure PM2 para gerenciar o processo

2. **Deploy do projeto:**
   ```bash
   # No servidor VPS
   git clone <seu-repositorio>
   cd meca-admin-nextjs
   npm install
   npm run build
   pm2 start npm --name "meca-admin" -- start
   ```

3. **Configure o domínio:**
   - Aponte o DNS para o IP do VPS
   - Configure SSL com Let's Encrypt

### 3. Configuração de DNS

1. **Acesse o DNS da GoDaddy:**
   - Vá para "Meus Produtos" > "DNS"
   - Selecione seu domínio

2. **Configure os registros:**
   ```
   Tipo: A
   Nome: admin
   Valor: IP_DO_SERVIDOR
   TTL: 600
   ```

3. **Configure CNAME (opcional):**
   ```
   Tipo: CNAME
   Nome: www.admin
   Valor: admin.meca.com.br
   TTL: 600
   ```

### 4. Configuração de SSL

1. **Certificado SSL gratuito:**
   - Use Let's Encrypt
   - Configure auto-renovação

2. **Configuração no servidor:**
   ```bash
   # Instalar Certbot
   sudo apt install certbot
   
   # Obter certificado
   sudo certbot --nginx -d admin.meca.com.br
   ```

### 5. Configuração de Proxy Reverso (Nginx)

1. **Instalar Nginx:**
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **Configurar site:**
   ```bash
   sudo nano /etc/nginx/sites-available/admin.meca.com.br
   ```

3. **Conteúdo do arquivo:**
   ```nginx
   server {
       listen 80;
       server_name admin.meca.com.br;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Ativar site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/admin.meca.com.br /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### 6. Configuração de Variáveis de Ambiente

1. **Criar arquivo .env.production:**
   ```bash
   NEXT_PUBLIC_API_URL=https://api.meca.com.br
   NEXTAUTH_URL=https://admin.meca.com.br
   NEXTAUTH_SECRET=seu-secret-aqui
   ```

2. **Configurar no servidor:**
   ```bash
   export NODE_ENV=production
   export NEXT_PUBLIC_API_URL=https://api.meca.com.br
   ```

### 7. Monitoramento e Logs

1. **Configurar PM2:**
   ```bash
   pm2 startup
   pm2 save
   ```

2. **Monitorar logs:**
   ```bash
   pm2 logs meca-admin
   ```

3. **Configurar backup:**
   ```bash
   # Backup diário
   crontab -e
   # Adicionar: 0 2 * * * /path/to/backup-script.sh
   ```

### 8. Teste Final

1. **Acesse o domínio:**
   ```
   https://admin.meca.com.br
   ```

2. **Teste todas as funcionalidades:**
   - Login
   - Dashboard
   - Todas as páginas
   - Conectividade com API

3. **Verifique SSL:**
   - Certificado válido
   - Redirecionamento HTTPS
   - Segurança A+

## 🔧 Troubleshooting

### Problemas Comuns:

1. **DNS não resolve:**
   - Aguarde propagação (até 24h)
   - Verifique configuração DNS

2. **SSL não funciona:**
   - Verifique certificado
   - Configure redirecionamento HTTP → HTTPS

3. **API não conecta:**
   - Verifique CORS na API
   - Configure proxy se necessário

4. **Performance lenta:**
   - Configure cache
   - Otimize imagens
   - Use CDN

## 📞 Suporte

Para problemas técnicos:
- Verifique logs do PM2
- Teste conectividade
- Verifique configuração DNS
- Consulte documentação da GoDaddy

