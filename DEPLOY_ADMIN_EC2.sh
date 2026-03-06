#!/bin/bash
# Deploy do MECA Admin (Next.js) na EC2
# Executa localmente: build + cópia + npm install na EC2 + pm2 restart

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

EC2_HOST="ec2-18-216-86-93.us-east-2.compute.amazonaws.com"
EC2_USER="ec2-user"
REMOTE_ADMIN_PATH="/home/ec2-user/meca-new/meca-admin-nextjs"
LOCAL_ADMIN_PATH="/Users/filippoferrari/Documents/LearningMEDUSA/meca-admin-nextjs"

SSH_KEY=""
for path in \
    "/Users/filippoferrari/Documents/LearningMEDUSA/awskey.pem" \
    "/Users/filippoferrari/Downloads/awskey.pem" \
    "$HOME/Documents/LearningMEDUSA/awskey.pem" \
    "$HOME/Downloads/awskey.pem"; do
    if [ -f "$path" ]; then
        SSH_KEY="$path"
        break
    fi
done
[ -z "$SSH_KEY" ] && SSH_KEY=$(find ~/Documents/LearningMEDUSA ~/Downloads -name "awskey.pem" 2>/dev/null | head -1)
if [ -z "$SSH_KEY" ]; then
    echo -e "${RED}Chave SSH não encontrada.${NC}"
    exit 1
fi
chmod 400 "$SSH_KEY" 2>/dev/null || true

SSH_OPTS="-o ConnectTimeout=90 -o ServerAliveInterval=15 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Deploy MECA Admin (Next.js) na EC2                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}PASSO 1: Build local${NC}"
cd "$LOCAL_ADMIN_PATH"
npm run build
echo -e "${GREEN}Build OK${NC}"
echo ""

echo -e "${BLUE}PASSO 2: Criar diretório remoto e copiar arquivos${NC}"
ssh -i "$SSH_KEY" $SSH_OPTS ${EC2_USER}@${EC2_HOST} "mkdir -p $REMOTE_ADMIN_PATH"
rsync -avz --delete \
  -e "ssh -i $SSH_KEY $SSH_OPTS" \
  --exclude node_modules \
  --exclude .next/cache \
  --exclude .git \
  "$LOCAL_ADMIN_PATH/" \
  "${EC2_USER}@${EC2_HOST}:${REMOTE_ADMIN_PATH}/"
echo -e "${GREEN}Cópia OK${NC}"
echo ""

echo -e "${BLUE}PASSO 3: Na EC2 — npm install e reiniciar PM2${NC}"
ssh -i "$SSH_KEY" $SSH_OPTS ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
cd /home/ec2-user/meca-new/meca-admin-nextjs
npm install --production 2>&1 | tail -8
if pm2 list | grep -q meca-admin; then
  pm2 restart meca-admin
  echo "PM2 meca-admin reiniciado"
else
  if [ -f ecosystem.config.cjs ]; then
    pm2 start ecosystem.config.cjs
  else
    pm2 start npm --name meca-admin -- run start
  fi
  pm2 save
  echo "PM2 meca-admin iniciado"
fi
sleep 3
pm2 list | grep -E "meca-admin|name"
ENDSSH

echo ""
echo -e "${GREEN}Deploy do admin concluído.${NC}"
echo "Admin: https://admin.mecabr.com"
echo ""
