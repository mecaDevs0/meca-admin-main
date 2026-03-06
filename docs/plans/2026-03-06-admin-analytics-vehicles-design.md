# MECA Admin — Analytics + Veículos + Dashboard Upgrade

**Data:** 2026-03-06
**Escopo:** meca-admin-nextjs (Next.js 15) + api-modular-structure (Node/Express)
**Deploy:** PM2 `meca-admin` na EC2 + script rsync local

---

## 1. Visão Geral

Adicionar ao admin MECA (uso exclusivo interno):
1. **Dashboard upgrade** — seletor de período global, sparklines nos cards, AreaChart com gradiente, card de agendamentos
2. **Nova página `/dashboard/vehicles`** — CRUD completo de veículos com vínculo ao cliente
3. **Nova página `/dashboard/analytics`** — Financeiro + Crescimento com gráficos ricos

---

## 2. Estrutura de Arquivos

### Frontend (meca-admin-nextjs)

```
app/dashboard/
  vehicles/
    page.tsx                        ← NOVO: listagem + busca + paginação
  analytics/
    page.tsx                        ← NOVO: tabs Financeiro / Crescimento

components/
  vehicles/
    VehicleTable.tsx                ← tabela com paginação
    VehicleDetailModal.tsx          ← ver detalhes + cliente + histórico
    VehicleEditModal.tsx            ← editar campos do veículo
    VehicleDeleteModal.tsx          ← confirmação de remoção
  analytics/
    PeriodSelector.tsx              ← seletor 7d/30d/3m/6m/1a (reutilizado no dashboard)
    FinancialTab.tsx                ← KPIs + AreaChart receita + ranking oficinas
    GrowthTab.tsx                   ← KPIs + funil + LineChart + churn

components/layout/
  Sidebar.tsx                       ← EDITAR: adicionar Veículos + Analytics

lib/
  api.ts                            ← EDITAR: adicionar métodos vehicles + analytics
```

### Backend (api-modular-structure)

```
src/
  routes/admin/
    adminRoutes.js                  ← EDITAR: adicionar rotas vehicles + analytics
  controllers/admin/
    AdminController.js              ← EDITAR: adicionar métodos vehicles + analytics
```

---

## 3. Dashboard Upgrade

### Seletor de Período Global
- Componente `PeriodSelector` reutilizável: `7d | 30d | 3m | 6m | 1a`
- Default: `30d`
- Estado local no dashboard, passado via props para gráficos
- Query param `?period=30d` na chamada `GET /admin/dashboard-metrics`

### Cards Existentes — Melhorias
- Substituir `BarChart` por `AreaChart` com gradiente verde/escuro
- Gráficos existentes ("Registro de Clientes" e "Registro de Oficinas") viram AreaChart com fill gradiente

### Novo Card — Agendamentos do Período
- Total de agendamentos no período
- Sub-info: concluídos (verde) / cancelados (vermelho) / pendentes (amarelo)
- Mini donut chart inline (Recharts PieChart small)

---

## 4. Página Veículos (`/dashboard/vehicles`)

### API — Novos Endpoints

```
GET  /admin/vehicles
     ?page=1&limit=25&search=<placa|marca|cliente>&brand=<>
     → { vehicles: [...], total, page, pages }

GET  /admin/vehicles/:id
     → { vehicle, customer, bookings_last_5 }

PUT  /admin/vehicles/:id
     body: { brand, model, year, color, fuel_type, plate }
     → { vehicle }

DELETE /admin/vehicles/:id
     → 409 se tiver booking ativo, 200 se ok (soft delete)
```

### Campos da tabela `vehicle` (existente no RDS)
- `id`, `customer_id`, `plate`, `brand`, `model`, `year`, `color`, `fuel_type`, `created_at`, `deleted_at`

### Frontend

**Tabela principal:**
| Veículo | Placa | Cliente | Agendamentos | Cadastrado | Ações |
|---------|-------|---------|--------------|------------|-------|
| Marca + Modelo + Ano | Badge verde | Nome + email | Contador | Data | Ver / Editar / Remover |

- Busca debounce 400ms (placa, marca, cliente)
- Paginação server-side, 25/página
- Filtro dropdown: Todas as marcas / Sem agendamentos

**Modal Ver Veículo:**
- Dados completos do veículo
- Card do cliente (nome, email, telefone) com link para `/dashboard/users`
- Últimos 5 agendamentos: data, oficina, serviço, status, valor

**Modal Editar Veículo:**
- Campos: marca, modelo, ano, cor, combustível, placa
- Validação de placa (regex Mercosul `[A-Z]{3}[0-9][A-Z0-9][0-9]{2}` ou antigo `[A-Z]{3}[0-9]{4}`)

**Modal Remover:**
- Confirmação simples
- Bloqueia com aviso se veículo tem booking com status `pendente` ou `em_andamento`

---

## 5. Página Analytics (`/dashboard/analytics`)

### API — Novos Endpoints

```
GET /admin/analytics/financial?period=30d
    → {
        kpis: { revenue_total, meca_revenue, avg_ticket, paid_bookings, conversion_rate },
        chart_series: [{ date, revenue, meca_revenue }],   // diário/semanal conforme período
        top_workshops: [{ id, name, bookings, revenue, meca_commission, avg_ticket }]
      }

GET /admin/analytics/growth?period=30d
    → {
        kpis: { new_customers, new_workshops, conversion_rate, retained_customers },
        kpis_prev: { ... },                               // período anterior para variação %
        funnel: { registered, booked, paid, completed },
        growth_series: [{ date, customers_cumulative, workshops_cumulative }],
        churn: { inactive_30d, inactive_60d, inactive_90d }
      }
```

### Tab Financeiro

**Row 1 — 4 KPI Cards**
- Receita total do período (R$)
- Receita líquida MECA (R$) — 12% - taxa PagBank
- Ticket médio (R$)
- Agendamentos pagos (n) + % conversão

**Row 2 — AreaChart grande (largura total)**
- Eixo X: dias/semanas, Eixo Y: R$
- Área 1 (cinza/transparente): receita bruta
- Área 2 (gradiente verde): receita MECA
- Tooltip com ambos os valores

**Row 3 — Ranking Top 10 Oficinas**
- Tabela com badge de posição (1° = ouro, 2° = prata, 3° = bronze)
- Colunas: Oficina, Agendamentos, Receita Gerada, Comissão MECA, Ticket Médio
- Linha clicável → abre modal com detalhes da oficina (reusa WorkshopCard existente)

### Tab Crescimento

**Row 1 — 4 KPI Cards com delta**
- Novos clientes: N + seta ↑↓ vs período anterior
- Novas oficinas: N + seta ↑↓
- Taxa de conversão: %
- Clientes retidos: N (agendaram 2x+)

**Row 2 — Funil de Conversão (FunnelChart horizontal)**
- Cadastrou → Agendou → Pagou → Concluiu
- % de cada etapa em relação ao anterior
- Cores degradê do azul para verde

**Row 3 — Dois gráficos lado a lado**
- Esquerdo: `LineChart` — clientes acumulados (verde) + oficinas acumuladas (azul escuro)
- Direito: `BarChart` agrupado — churn 30d / 60d / 90d (barras em vermelho degradê)

---

## 6. Deploy

### Script `scripts/deploy_admin.sh`

```bash
#!/bin/bash
set -e
EC2_HOST="ec2-user@18.216.86.93"
EC2_KEY="/Users/filippoferrari/Documents/LearningMEDUSA/awskey.pem"
EC2_PATH="/home/ec2-user/meca-new/meca-admin-nextjs"

echo ">> Building admin..."
cd meca-admin-nextjs && npm run build

echo ">> Syncing .next/..."
rsync -avz --delete -e "ssh -i $EC2_KEY" .next/ $EC2_HOST:$EC2_PATH/.next/
rsync -avz -e "ssh -i $EC2_KEY" public/ $EC2_HOST:$EC2_PATH/public/
rsync -avz -e "ssh -i $EC2_KEY" package.json next.config.* $EC2_HOST:$EC2_PATH/

echo ">> Restarting PM2..."
ssh -i $EC2_KEY $EC2_HOST "cd $EC2_PATH && pm2 restart meca-admin"
echo ">> Deploy concluido!"
```

### Variáveis de Ambiente
- Local: `meca-admin-nextjs/.env.local` — `NEXT_PUBLIC_API_URL=https://api.mecabr.com`
- EC2: `/home/ec2-user/meca-new/meca-admin-nextjs/.env.production` — já configurado

---

## 7. Sidebar — Novos Itens

Adicionar após "Usuários":
```tsx
{ name: 'Veículos',   path: '/dashboard/vehicles',  icon: Car,         onboardKey: 'vehicles' }
{ name: 'Analytics',  path: '/dashboard/analytics', icon: TrendingUp,  onboardKey: 'analytics' }
```

---

## 8. Dependências

Já instaladas no projeto:
- `recharts` — todos os gráficos
- `framer-motion` — animações
- `lucide-react` — ícones (Car, TrendingUp já disponíveis)
- `@heroui/react`, `@radix-ui/*` — modais/selects
- `@tanstack/react-table` — tabela veículos

Nenhuma dependência nova necessária.

---

## 9. Ordem de Implementação

1. API: endpoints vehicles (GET list, GET :id, PUT, DELETE)
2. API: endpoints analytics (financial, growth)
3. Frontend: PeriodSelector component
4. Frontend: Dashboard upgrade (seletor + AreaChart + card agendamentos)
5. Frontend: Sidebar update (2 novos itens)
6. Frontend: Página Veículos (tabela + 3 modais)
7. Frontend: Página Analytics (2 tabs + todos os gráficos)
8. Script deploy_admin.sh
9. Deploy em produção
