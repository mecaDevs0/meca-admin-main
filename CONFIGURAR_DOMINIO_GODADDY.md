# Como Configurar Domínio Público na GoDaddy para o Admin MECA

## 1. Pré-requisitos

- Conta na GoDaddy
- Domínio registrado
- Acesso ao painel de controle da GoDaddy
- Instância EC2 da AWS rodando
- Admin MECA funcionando localmente

## 2. Configuração no GoDaddy

### Passo 1: Acessar o Painel de Controle
1. Faça login na sua conta GoDaddy
2. Vá para "Meus Produtos"
3. Clique em "Gerenciar" no seu domínio

### Passo 2: Configurar DNS
1. Vá para a seção "DNS"
2. Clique em "Adicionar" para criar um novo registro
3. Configure o subdomínio para o admin:

**Configuração do Subdomínio:**
- **Tipo**: A
- **Nome**: admin (para admin.seudominio.com)
- **Valor**: IP da sua instância EC2 (ex: 3.144.213.137)
- **TTL**: 600 (10 minutos)

### Passo 3: Configurar CNAME (Opcional)
Se quiser usar um domínio personalizado:
- **Tipo**: CNAME
- **Nome**: meca-admin
- **Valor**: admin.seudominio.com

## 3. Configuração na EC2

### Passo 1: Instalar Nginx
```bash
# Conectar na EC2
ssh -i "sua-chave.pem" ec2-user@seu-ip

# Instalar Nginx
sudo yum update -y
sudo yum install nginx -y

# Iniciar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Passo 2: Configurar Nginx
```bash
# Criar configuração para o admin
sudo nano /etc/nginx/conf.d/meca-admin.conf
```

Conteúdo do arquivo:
```nginx
server {
    listen 80;
    server_name admin.seudominio.com;

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

### Passo 3: Reiniciar Nginx
```bash
sudo nginx -t  # Testar configuração
sudo systemctl restart nginx
```

## 4. Deploy do Admin na EC2

### Passo 1: Preparar o Admin
```bash
# No seu computador local
cd meca-admin-nextjs

# Instalar dependências
npm install

# Build para produção
npm run build

# Criar arquivo de configuração
echo "NEXT_PUBLIC_API_URL=http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000" > .env.production
```

### Passo 2: Enviar para EC2
```bash
# Criar arquivo tar
tar -czf meca-admin.tar.gz .

# Enviar para EC2
scp -i "sua-chave.pem" meca-admin.tar.gz ec2-user@seu-ip:/home/ec2-user/

# Conectar na EC2
ssh -i "sua-chave.pem" ec2-user@seu-ip

# Extrair arquivos
cd /home/ec2-user
tar -xzf meca-admin.tar.gz
```

### Passo 3: Instalar e Executar
```bash
# Instalar Node.js (se não estiver instalado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Instalar dependências
npm install

# Executar em produção
npm start
```

## 5. Configurar PM2 (Recomendado)

### Instalar PM2
```bash
npm install -g pm2
```

### Criar arquivo de configuração
```bash
nano ecosystem.config.js
```

Conteúdo:
```javascript
module.exports = {
  apps: [{
    name: 'meca-admin',
    script: 'npm',
    args: 'start',
    cwd: '/home/ec2-user/meca-admin-nextjs',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### Executar com PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 6. Configurar SSL (HTTPS)

### Instalar Certbot
```bash
sudo yum install certbot python3-certbot-nginx -y
```

### Obter Certificado SSL
```bash
sudo certbot --nginx -d admin.seudominio.com
```

### Configuração Automática
O Certbot irá:
1. Obter certificado SSL gratuito
2. Configurar HTTPS automaticamente
3. Renovar automaticamente

## 7. Verificação

### Testar Localmente
```bash
# Testar se o admin está rodando
curl http://localhost:3000
```

### Testar Publicamente
1. Acesse `http://admin.seudominio.com`
2. Verifique se carrega o admin
3. Teste todas as funcionalidades

### Verificar SSL
1. Acesse `https://admin.seudominio.com`
2. Verifique se o certificado está válido
3. Teste navegação segura

## 8. Monitoramento

### Verificar Status
```bash
# Status do PM2
pm2 status

# Logs do admin
pm2 logs meca-admin

# Status do Nginx
sudo systemctl status nginx
```

### Logs de Acesso
```bash
# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 9. Troubleshooting

### Problemas Comuns

1. **Admin não carrega**
   - Verificar se PM2 está rodando: `pm2 status`
   - Verificar logs: `pm2 logs meca-admin`
   - Verificar Nginx: `sudo systemctl status nginx`

2. **Erro de DNS**
   - Aguardar propagação (até 48h)
   - Verificar configuração DNS no GoDaddy
   - Testar com `nslookup admin.seudominio.com`

3. **Erro de SSL**
   - Verificar se o domínio está apontando corretamente
   - Renovar certificado: `sudo certbot renew`

4. **Erro de API**
   - Verificar se a API da EC2 está rodando
   - Testar conectividade: `curl http://localhost:9000/health`

## 10. Manutenção

### Atualizações
```bash
# Parar aplicação
pm2 stop meca-admin

# Atualizar código
git pull origin main
npm install
npm run build

# Reiniciar
pm2 restart meca-admin
```

### Backup
```bash
# Backup do banco de dados
pg_dump meca_db > backup_$(date +%Y%m%d).sql

# Backup dos arquivos
tar -czf backup_admin_$(date +%Y%m%d).tar.gz /home/ec2-user/meca-admin-nextjs
```

## 11. URLs Finais

Após configuração completa:
- **Admin**: `https://admin.seudominio.com`
- **API**: `http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000`
- **Banco**: AWS RDS PostgreSQL

## 12. Segurança

### Firewall
```bash
# Configurar firewall
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

### Acesso Restrito
- Configurar autenticação básica se necessário
- Usar HTTPS sempre
- Monitorar logs de acesso
- Implementar rate limiting










