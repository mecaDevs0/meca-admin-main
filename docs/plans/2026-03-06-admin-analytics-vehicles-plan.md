# Admin Analytics + Vehicles + Dashboard Upgrade — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Analytics page (Financial + Growth tabs), Vehicles CRUD page, and Dashboard upgrades (period selector, AreaCharts, bookings card) to the MECA admin panel.

**Architecture:** Opção A — novas páginas independentes (`/dashboard/vehicles`, `/dashboard/analytics`) sem tocar no dashboard atual além de pequenas melhorias. Novos endpoints admin na API Node/Express. Deploy via rsync + PM2 restart.

**Tech Stack:** Next.js 15, Tailwind v4, Recharts, framer-motion, lucide-react, @heroui/react, Node.js/Express, PostgreSQL (AWS RDS), PM2 na EC2.

**EC2 Key:** `/Users/filippoferrari/Documents/LearningMEDUSA/awskey.pem`
**PM2 process:** `meca-admin`
**EC2 path:** `/home/ec2-user/meca-new/meca-admin-nextjs`
**API path:** `/home/ec2-user/meca-new/api-modular-structure`

---

## Task 1: API — Endpoints de Veículos (admin)

**Files:**
- Modify: `api-modular-structure/src/routes/admin/adminRoutes.js`
- Modify: `api-modular-structure/src/controllers/admin/AdminController.js`

**Step 1: Adicionar rotas de veículos em `adminRoutes.js`**

Adicionar após o bloco `ADMIN BOOKINGS`:

```js
// ============ ADMIN VEHICLES ============
router.get('/admin/vehicles', authenticateToken, requireAdmin, AdminController.listVehicles.bind(AdminController));
router.get('/admin/vehicles/:id', authenticateToken, requireAdmin, AdminController.getVehicle.bind(AdminController));
router.put('/admin/vehicles/:id', authenticateToken, requireAdmin, AdminController.updateVehicle.bind(AdminController));
router.delete('/admin/vehicles/:id', authenticateToken, requireAdmin, AdminController.deleteVehicle.bind(AdminController));
```

**Step 2: Implementar `listVehicles` no AdminController**

```js
async listVehicles(req, res) {
  try {
    const { page = 1, limit = 25, search = '', brand = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = `v.deleted_at IS NULL`;
    const params = [];
    let paramIdx = 1;

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      where += ` AND (
        LOWER(v.plate) LIKE $${paramIdx} OR
        LOWER(v.brand) LIKE $${paramIdx} OR
        LOWER(v.model) LIKE $${paramIdx} OR
        LOWER(CONCAT(c.first_name, ' ', c.last_name)) LIKE $${paramIdx} OR
        LOWER(c.email) LIKE $${paramIdx}
      )`;
      paramIdx++;
    }
    if (brand) {
      params.push(brand);
      where += ` AND v.brand = $${paramIdx}`;
      paramIdx++;
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM vehicle v
       LEFT JOIN customer c ON v.customer_id = c.id
       WHERE ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(parseInt(limit), offset);
    const result = await db.query(
      `SELECT
         v.id, v.plate, v.brand, v.model, v.year, v.color, v.fuel_type, v.created_at,
         c.id AS customer_id,
         CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
         c.email AS customer_email,
         (SELECT COUNT(*) FROM booking b WHERE b.vehicle_id = v.id AND b.deleted_at IS NULL) AS booking_count
       FROM vehicle v
       LEFT JOIN customer c ON v.customer_id = c.id
       WHERE ${where}
       ORDER BY v.created_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      params
    );

    return res.json({
      success: true,
      data: {
        vehicles: result.rows,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      }
    });
  } catch (err) {
    console.error('[AdminController] listVehicles error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
```

**Step 3: Implementar `getVehicle`**

```js
async getVehicle(req, res) {
  try {
    const { id } = req.params;

    const vehicleResult = await db.query(
      `SELECT v.*, c.id AS customer_id,
         CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
         c.email AS customer_email, c.phone AS customer_phone
       FROM vehicle v
       LEFT JOIN customer c ON v.customer_id = c.id
       WHERE v.id = $1 AND v.deleted_at IS NULL`,
      [id]
    );
    if (!vehicleResult.rows[0]) {
      return res.status(404).json({ success: false, error: 'Veículo não encontrado' });
    }

    const bookingsResult = await db.query(
      `SELECT b.id, b.appointment_date, b.status, b.created_at,
         w.name AS oficina_name,
         s.name AS service_name,
         p.amount AS payment_amount
       FROM booking b
       LEFT JOIN workshop w ON b.oficina_id = w.id
       LEFT JOIN service s ON b.product_id = s.id
       LEFT JOIN payment p ON p.booking_id = b.id
       WHERE b.vehicle_id = $1 AND b.deleted_at IS NULL
       ORDER BY b.created_at DESC LIMIT 5`,
      [id]
    );

    return res.json({
      success: true,
      data: {
        vehicle: vehicleResult.rows[0],
        bookings_last_5: bookingsResult.rows,
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
```

**Step 4: Implementar `updateVehicle`**

```js
async updateVehicle(req, res) {
  try {
    const { id } = req.params;
    const { brand, model, year, color, fuel_type, plate } = req.body;

    const result = await db.query(
      `UPDATE vehicle SET
         brand = COALESCE($1, brand),
         model = COALESCE($2, model),
         year = COALESCE($3, year),
         color = COALESCE($4, color),
         fuel_type = COALESCE($5, fuel_type),
         plate = COALESCE($6, plate),
         updated_at = NOW()
       WHERE id = $7 AND deleted_at IS NULL
       RETURNING *`,
      [brand, model, year, color, fuel_type, plate ? plate.toUpperCase() : null, id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, error: 'Veículo não encontrado' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
```

**Step 5: Implementar `deleteVehicle`**

```js
async deleteVehicle(req, res) {
  try {
    const { id } = req.params;

    // Bloquear se tem booking ativo
    const activeBooking = await db.query(
      `SELECT id FROM booking
       WHERE vehicle_id = $1 AND status IN ('pendente', 'confirmado', 'em_andamento') AND deleted_at IS NULL
       LIMIT 1`,
      [id]
    );
    if (activeBooking.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Veículo possui agendamento ativo e não pode ser removido.'
      });
    }

    await db.query(
      `UPDATE vehicle SET deleted_at = NOW() WHERE id = $1`,
      [id]
    );
    return res.json({ success: true, message: 'Veículo removido com sucesso.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
```

**Step 6: Garantir que `db` está importado no AdminController**

Verificar se `const db = require('../../config/database');` já existe no topo do AdminController. Se não, adicionar.

**Step 7: Commit**

```bash
cd api-modular-structure
git add src/routes/admin/adminRoutes.js src/controllers/admin/AdminController.js
git commit -m "feat(admin): add vehicles CRUD endpoints (list, get, update, delete)"
```

---

## Task 2: API — Endpoints de Analytics

**Files:**
- Modify: `api-modular-structure/src/routes/admin/adminRoutes.js`
- Modify: `api-modular-structure/src/controllers/admin/AdminController.js`

**Step 1: Adicionar helper de período no AdminController**

Adicionar função utilitária antes dos métodos da classe:

```js
function getPeriodDates(period = '30d') {
  const now = new Date();
  const end = new Date(now);
  let start = new Date(now);
  switch (period) {
    case '7d':  start.setDate(start.getDate() - 7); break;
    case '3m':  start.setMonth(start.getMonth() - 3); break;
    case '6m':  start.setMonth(start.getMonth() - 6); break;
    case '1a':  start.setFullYear(start.getFullYear() - 1); break;
    default:    start.setDate(start.getDate() - 30); break; // 30d
  }
  // Período anterior (mesmo tamanho, antes do start)
  const diff = end - start;
  const prevEnd = new Date(start);
  const prevStart = new Date(prevEnd - diff);
  return { start, end, prevStart, prevEnd };
}
```

**Step 2: Adicionar rotas de analytics em `adminRoutes.js`**

```js
// ============ ADMIN ANALYTICS ============
router.get('/admin/analytics/financial', authenticateToken, requireAdmin, AdminController.getAnalyticsFinancial.bind(AdminController));
router.get('/admin/analytics/growth', authenticateToken, requireAdmin, AdminController.getAnalyticsGrowth.bind(AdminController));
```

**Step 3: Implementar `getAnalyticsFinancial`**

```js
async getAnalyticsFinancial(req, res) {
  try {
    const { period = '30d' } = req.query;
    const { start, end } = getPeriodDates(period);

    // KPIs
    const kpiResult = await db.query(
      `SELECT
         COALESCE(SUM(amount), 0) AS revenue_total,
         COUNT(*) FILTER (WHERE status = 'pago' OR status = 'aprovado') AS paid_bookings,
         COUNT(*) AS total_bookings
       FROM payment
       WHERE created_at >= $1 AND created_at <= $2 AND deleted_at IS NULL`,
      [start, end]
    );

    const kpi = kpiResult.rows[0];
    const meca_fee = 0.12;
    const pagbank_fee = 0.0339;
    const revenue_total = parseFloat(kpi.revenue_total) / 100;
    const meca_take = revenue_total * meca_fee;
    const meca_revenue = meca_take - (revenue_total * pagbank_fee);
    const paid = parseInt(kpi.paid_bookings) || 1;
    const avg_ticket = revenue_total / paid;
    const conversion_rate = kpi.total_bookings > 0
      ? ((kpi.paid_bookings / kpi.total_bookings) * 100).toFixed(1)
      : '0.0';

    // Série temporal (diária para <= 3m, semanal para > 3m)
    const groupBy = ['7d', '30d', '3m'].includes(period) ? 'day' : 'week';
    const seriesResult = await db.query(
      `SELECT
         DATE_TRUNC($1, created_at) AS date,
         COALESCE(SUM(amount), 0) AS revenue,
         COALESCE(SUM(amount * 0.12), 0) AS meca_revenue
       FROM payment
       WHERE created_at >= $2 AND created_at <= $3 AND deleted_at IS NULL
       GROUP BY DATE_TRUNC($1, created_at)
       ORDER BY date ASC`,
      [groupBy, start, end]
    );

    // Top 10 oficinas
    const workshopsResult = await db.query(
      `SELECT
         w.id, w.name,
         COUNT(b.id) AS bookings,
         COALESCE(SUM(p.amount), 0) AS revenue,
         COALESCE(SUM(p.amount * 0.12), 0) AS meca_commission
       FROM booking b
       JOIN workshop w ON b.oficina_id = w.id
       LEFT JOIN payment p ON p.booking_id = b.id
       WHERE b.created_at >= $1 AND b.created_at <= $2 AND b.deleted_at IS NULL
       GROUP BY w.id, w.name
       ORDER BY revenue DESC
       LIMIT 10`,
      [start, end]
    );

    return res.json({
      success: true,
      data: {
        kpis: {
          revenue_total,
          meca_take,
          meca_revenue,
          avg_ticket,
          paid_bookings: parseInt(kpi.paid_bookings),
          conversion_rate: parseFloat(conversion_rate),
        },
        chart_series: seriesResult.rows.map(r => ({
          date: r.date,
          revenue: parseFloat(r.revenue) / 100,
          meca_revenue: parseFloat(r.meca_revenue) / 100,
        })),
        top_workshops: workshopsResult.rows.map(r => ({
          id: r.id,
          name: r.name,
          bookings: parseInt(r.bookings),
          revenue: parseFloat(r.revenue) / 100,
          meca_commission: parseFloat(r.meca_commission) / 100,
          avg_ticket: parseInt(r.bookings) > 0
            ? (parseFloat(r.revenue) / 100 / parseInt(r.bookings))
            : 0,
        })),
      }
    });
  } catch (err) {
    console.error('[AdminController] getAnalyticsFinancial error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
```

**Step 4: Implementar `getAnalyticsGrowth`**

```js
async getAnalyticsGrowth(req, res) {
  try {
    const { period = '30d' } = req.query;
    const { start, end, prevStart, prevEnd } = getPeriodDates(period);

    // Novos clientes no período atual e anterior
    const customersResult = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE created_at >= $1 AND created_at <= $2) AS current,
         COUNT(*) FILTER (WHERE created_at >= $3 AND created_at <= $4) AS previous
       FROM customer WHERE deleted_at IS NULL`,
      [start, end, prevStart, prevEnd]
    );

    // Novas oficinas
    const workshopsResult = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE created_at >= $1 AND created_at <= $2) AS current,
         COUNT(*) FILTER (WHERE created_at >= $3 AND created_at <= $4) AS previous
       FROM workshop WHERE deleted_at IS NULL`,
      [start, end, prevStart, prevEnd]
    );

    // Clientes retidos (agendaram 2x+ no período)
    const retainedResult = await db.query(
      `SELECT COUNT(*) FROM (
         SELECT customer_id FROM booking
         WHERE created_at >= $1 AND created_at <= $2 AND deleted_at IS NULL
         GROUP BY customer_id HAVING COUNT(*) >= 2
       ) AS retained`,
      [start, end]
    );

    // Funil
    const funnelResult = await db.query(
      `SELECT
         (SELECT COUNT(*) FROM customer WHERE created_at >= $1 AND created_at <= $2 AND deleted_at IS NULL) AS registered,
         (SELECT COUNT(DISTINCT customer_id) FROM booking WHERE created_at >= $1 AND created_at <= $2 AND deleted_at IS NULL) AS booked,
         (SELECT COUNT(DISTINCT b.customer_id) FROM booking b JOIN payment p ON p.booking_id = b.id WHERE b.created_at >= $1 AND b.created_at <= $2 AND b.deleted_at IS NULL) AS paid,
         (SELECT COUNT(DISTINCT customer_id) FROM booking WHERE status = 'concluido' AND created_at >= $1 AND created_at <= $2 AND deleted_at IS NULL) AS completed`,
      [start, end]
    );

    // Série de crescimento acumulado
    const growthResult = await db.query(
      `SELECT
         gs.date,
         (SELECT COUNT(*) FROM customer WHERE created_at <= gs.date AND deleted_at IS NULL) AS customers_cumulative,
         (SELECT COUNT(*) FROM workshop WHERE created_at <= gs.date AND deleted_at IS NULL) AS workshops_cumulative
       FROM generate_series($1::date, $2::date, '1 week'::interval) AS gs(date)
       ORDER BY gs.date ASC`,
      [start, end]
    );

    // Churn: oficinas inativas (sem agendamento nos últimos X dias)
    const now = new Date();
    const churn30 = new Date(now); churn30.setDate(now.getDate() - 30);
    const churn60 = new Date(now); churn60.setDate(now.getDate() - 60);
    const churn90 = new Date(now); churn90.setDate(now.getDate() - 90);

    const churnResult = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE last_booking < $1) AS inactive_30d,
         COUNT(*) FILTER (WHERE last_booking < $2) AS inactive_60d,
         COUNT(*) FILTER (WHERE last_booking < $3) AS inactive_90d
       FROM (
         SELECT w.id, MAX(b.created_at) AS last_booking
         FROM workshop w
         LEFT JOIN booking b ON b.oficina_id = w.id AND b.deleted_at IS NULL
         WHERE w.deleted_at IS NULL AND w.status = 'aprovado'
         GROUP BY w.id
       ) AS ws`,
      [churn30, churn60, churn90]
    );

    const c = customersResult.rows[0];
    const w = workshopsResult.rows[0];
    const funnel = funnelResult.rows[0];
    const churn = churnResult.rows[0];

    return res.json({
      success: true,
      data: {
        kpis: {
          new_customers: parseInt(c.current),
          new_customers_prev: parseInt(c.previous),
          new_workshops: parseInt(w.current),
          new_workshops_prev: parseInt(w.previous),
          retained_customers: parseInt(retainedResult.rows[0].count),
        },
        funnel: {
          registered: parseInt(funnel.registered),
          booked: parseInt(funnel.booked),
          paid: parseInt(funnel.paid),
          completed: parseInt(funnel.completed),
        },
        growth_series: growthResult.rows.map(r => ({
          date: r.date,
          customers: parseInt(r.customers_cumulative),
          workshops: parseInt(r.workshops_cumulative),
        })),
        churn: {
          inactive_30d: parseInt(churn.inactive_30d),
          inactive_60d: parseInt(churn.inactive_60d),
          inactive_90d: parseInt(churn.inactive_90d),
        },
      }
    });
  } catch (err) {
    console.error('[AdminController] getAnalyticsGrowth error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
```

**Step 5: Commit**

```bash
git add src/routes/admin/adminRoutes.js src/controllers/admin/AdminController.js
git commit -m "feat(admin): add analytics endpoints (financial, growth)"
```

**Step 6: Deploy API na EC2**

```bash
EC2_KEY="/Users/filippoferrari/Documents/LearningMEDUSA/awskey.pem"
rsync -avz --delete -e "ssh -i $EC2_KEY" \
  api-modular-structure/src/controllers/admin/AdminController.js \
  api-modular-structure/src/routes/admin/adminRoutes.js \
  ec2-user@18.216.86.93:/home/ec2-user/meca-new/api-modular-structure/src/controllers/admin/
ssh -i $EC2_KEY ec2-user@18.216.86.93 "pm2 restart meca-api-v2"
```

---

## Task 3: Frontend — PeriodSelector Component

**Files:**
- Create: `meca-admin-nextjs/components/analytics/PeriodSelector.tsx`

**Step 1: Criar componente**

```tsx
'use client'

interface PeriodSelectorProps {
  value: string
  onChange: (period: string) => void
}

const PERIODS = [
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: '3 meses', value: '3m' },
  { label: '6 meses', value: '6m' },
  { label: '1 ano', value: '1a' },
]

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            value === p.value
              ? 'bg-[#00c977] text-white shadow-lg shadow-[#00c977]/30'
              : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-[#00c977]/50'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/analytics/PeriodSelector.tsx
git commit -m "feat(admin): add PeriodSelector reusable component"
```

---

## Task 4: Frontend — Dashboard Upgrade

**Files:**
- Modify: `meca-admin-nextjs/app/dashboard/page.tsx`
- Modify: `meca-admin-nextjs/lib/api.ts` (adicionar suporte a `period` param)

**Step 1: Adicionar `period` param à chamada getDashboardMetrics em `lib/api.ts`**

Localizar o método `getDashboardMetrics` e alterar para aceitar period:

```ts
getDashboardMetrics(period = '30d') {
  return this.request(`/admin/dashboard-metrics?period=${period}`)
},
```

**Step 2: Substituir BarCharts por AreaCharts com gradiente no dashboard**

Importar novos componentes do recharts:
```tsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
```

Substituir o `<BarChart>` de clientes por:
```tsx
<AreaChart data={...}>
  <defs>
    <linearGradient id="colorClientes" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#00c977" stopOpacity={0.3} />
      <stop offset="95%" stopColor="#00c977" stopOpacity={0} />
    </linearGradient>
  </defs>
  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
  <YAxis stroke="#6b7280" fontSize={12} />
  <Tooltip contentStyle={{ backgroundColor: 'rgba(15,20,30,0.9)', border: 'none', borderRadius: '12px', color: '#fff' }} />
  <Area type="monotone" dataKey="value" name="Clientes" stroke="#00c977" fill="url(#colorClientes)" strokeWidth={2} />
</AreaChart>
```

Substituir o BarChart de oficinas por AreaChart similar com `stopColor="#6366f1"`.

**Step 3: Adicionar PeriodSelector + estado de período**

```tsx
import { PeriodSelector } from '@/components/analytics/PeriodSelector'

// No componente:
const [period, setPeriod] = useState('30d')

// Passar para loadMetrics:
const loadMetrics = async (p = period) => {
  const { data: response } = await apiClient.getDashboardMetrics(p)
  // ...
}

useEffect(() => { loadMetrics(period) }, [period])
```

Adicionar no header do dashboard, abaixo do subtitle:
```tsx
<div className="mt-3">
  <PeriodSelector value={period} onChange={setPeriod} />
</div>
```

**Step 4: Adicionar card de Agendamentos do período**

Adicionar como 5° card no grid (após "Oficinas Pendentes"):
```tsx
<motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg flex flex-col justify-between">
  <div className="flex items-start justify-between mb-3">
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
      <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
    </div>
  </div>
  <div className="space-y-2">
    <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Agendamentos do Período</h3>
    <p className="text-2xl sm:text-3xl font-bold text-[#252940] dark:text-white">{metrics.total_bookings_last_month || 0}</p>
    <div className="pt-3 space-y-1 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#00c977]">Concluídos</span>
        <span className="font-semibold">{metrics.bookings_completed || 0}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-red-400">Cancelados</span>
        <span className="font-semibold">{metrics.bookings_cancelled || 0}</span>
      </div>
    </div>
  </div>
</motion.div>
```

Adicionar `bookings_completed` e `bookings_cancelled` ao `DashboardMetrics` interface e ao mapeamento de dados.

**Step 5: Commit**

```bash
git add app/dashboard/page.tsx lib/api.ts components/analytics/PeriodSelector.tsx
git commit -m "feat(admin): dashboard upgrade - period selector, AreaCharts, bookings card"
```

---

## Task 5: Frontend — Sidebar Update

**Files:**
- Modify: `meca-admin-nextjs/components/layout/Sidebar.tsx`

**Step 1: Adicionar imports de ícones**

```tsx
import { Car, TrendingUp, ... } from 'lucide-react'
```

**Step 2: Adicionar itens ao array `menuItems` após "Usuários"**

```tsx
{
  name: 'Veículos',
  path: '/dashboard/vehicles',
  icon: Car,
  onboardKey: 'vehicles',
},
{
  name: 'Analytics',
  path: '/dashboard/analytics',
  icon: TrendingUp,
  onboardKey: 'analytics',
},
```

**Step 3: Commit**

```bash
git add components/layout/Sidebar.tsx
git commit -m "feat(admin): add Vehicles and Analytics to sidebar"
```

---

## Task 6: Frontend — lib/api.ts (novos métodos)

**Files:**
- Modify: `meca-admin-nextjs/lib/api.ts`

**Step 1: Adicionar métodos vehicles**

```ts
// Vehicles
listVehicles(page = 1, limit = 25, search = '', brand = '') {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set('search', search)
  if (brand) params.set('brand', brand)
  return this.request(`/admin/vehicles?${params}`)
},
getVehicle(id: string) {
  return this.request(`/admin/vehicles/${id}`)
},
updateVehicle(id: string, data: Record<string, any>) {
  return this.request(`/admin/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) })
},
deleteVehicle(id: string) {
  return this.request(`/admin/vehicles/${id}`, { method: 'DELETE' })
},
```

**Step 2: Adicionar métodos analytics**

```ts
// Analytics
getAnalyticsFinancial(period = '30d') {
  return this.request(`/admin/analytics/financial?period=${period}`)
},
getAnalyticsGrowth(period = '30d') {
  return this.request(`/admin/analytics/growth?period=${period}`)
},
```

**Step 3: Commit**

```bash
git add lib/api.ts
git commit -m "feat(admin): add vehicles and analytics API methods to apiClient"
```

---

## Task 7: Frontend — Página de Veículos

**Files:**
- Create: `meca-admin-nextjs/app/dashboard/vehicles/page.tsx`
- Create: `meca-admin-nextjs/components/vehicles/VehicleDetailModal.tsx`
- Create: `meca-admin-nextjs/components/vehicles/VehicleEditModal.tsx`
- Create: `meca-admin-nextjs/components/vehicles/VehicleDeleteModal.tsx`

**Step 1: Criar `VehicleDetailModal.tsx`**

```tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Car, User, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'

interface VehicleDetailModalProps {
  vehicle: any
  onClose: () => void
}

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  concluido:    { icon: CheckCircle, color: 'text-green-400',  label: 'Concluído' },
  cancelado:    { icon: XCircle,     color: 'text-red-400',    label: 'Cancelado' },
  pendente:     { icon: Clock,       color: 'text-yellow-400', label: 'Pendente' },
  em_andamento: { icon: Clock,       color: 'text-blue-400',   label: 'Em andamento' },
}

export function VehicleDetailModal({ vehicle, onClose }: VehicleDetailModalProps) {
  const v = vehicle?.vehicle
  const bookings = vehicle?.bookings_last_5 || []

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-white/20 dark:border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-2xl flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#252940] dark:text-white">{v?.brand} {v?.model}</h2>
                <span className="text-xs bg-[#00c977]/20 text-[#00c977] px-2 py-0.5 rounded-full font-mono">{v?.plate}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dados do veículo */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: 'Ano', value: v?.year },
              { label: 'Cor', value: v?.color || '—' },
              { label: 'Combustível', value: v?.fuel_type || '—' },
              { label: 'Placa', value: v?.plate },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-sm font-semibold text-[#252940] dark:text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Cliente */}
          <div className="bg-[#00c977]/10 rounded-2xl p-4 mb-5 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#00c977]/20 rounded-xl flex items-center justify-center">
              <User className="w-4 h-4 text-[#00c977]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#252940] dark:text-white">{v?.customer_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{v?.customer_email}</p>
              {v?.customer_phone && <p className="text-xs text-gray-500 dark:text-gray-400">{v?.customer_phone}</p>}
            </div>
          </div>

          {/* Últimos agendamentos */}
          <div>
            <h3 className="text-sm font-semibold text-[#252940] dark:text-white mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00c977]" />
              Últimos 5 agendamentos
            </h3>
            {bookings.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Nenhum agendamento encontrado</p>
            ) : (
              <div className="space-y-2">
                {bookings.map((b: any) => {
                  const s = statusConfig[b.status] || statusConfig.pendente
                  return (
                    <div key={b.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                      <div>
                        <p className="text-xs font-medium text-[#252940] dark:text-white">{b.oficina_name || '—'}</p>
                        <p className="text-xs text-gray-400">{b.service_name || '—'} · {new Date(b.appointment_date).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-semibold ${s.color}`}>{s.label}</span>
                        {b.payment_amount && (
                          <p className="text-xs text-gray-400">R$ {(b.payment_amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
```

**Step 2: Criar `VehicleEditModal.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'

interface VehicleEditModalProps {
  vehicle: any
  onClose: () => void
  onSaved: () => void
}

const PLATE_REGEX = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}[0-9]{4}$/

export function VehicleEditModal({ vehicle, onClose, onSaved }: VehicleEditModalProps) {
  const [form, setForm] = useState({
    brand: vehicle.brand || '',
    model: vehicle.model || '',
    year: vehicle.year || '',
    color: vehicle.color || '',
    fuel_type: vehicle.fuel_type || '',
    plate: vehicle.plate || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const plateCleaned = form.plate.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (!PLATE_REGEX.test(plateCleaned)) {
      showToast.error('Placa inválida', 'Use o formato ABC1234 ou ABC1D23')
      return
    }
    setSaving(true)
    const { error } = await apiClient.updateVehicle(vehicle.id, { ...form, plate: plateCleaned })
    setSaving(false)
    if (error) {
      showToast.error('Erro ao salvar', error)
      return
    }
    showToast.success('Veículo atualizado', 'Dados salvos com sucesso')
    onSaved()
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-white/20 dark:border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#252940] dark:text-white">Editar Veículo</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {[
              { key: 'plate',     label: 'Placa',        placeholder: 'ABC1234' },
              { key: 'brand',     label: 'Marca',        placeholder: 'Toyota' },
              { key: 'model',     label: 'Modelo',       placeholder: 'Corolla' },
              { key: 'year',      label: 'Ano',          placeholder: '2020' },
              { key: 'color',     label: 'Cor',          placeholder: 'Prata' },
              { key: 'fuel_type', label: 'Combustível',  placeholder: 'Flex' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">{label}</label>
                <input
                  value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-[#252940] dark:text-white focus:outline-none focus:border-[#00c977] transition-colors"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#00c977] to-[#00b369] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-[#00c977]/30"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
```

**Step 3: Criar `VehicleDeleteModal.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, AlertTriangle } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'

interface VehicleDeleteModalProps {
  vehicle: any
  onClose: () => void
  onDeleted: () => void
}

export function VehicleDeleteModal({ vehicle, onClose, onDeleted }: VehicleDeleteModalProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await apiClient.deleteVehicle(vehicle.id)
    setDeleting(false)
    if (error) {
      if (error.includes('agendamento ativo') || error.includes('409')) {
        showToast.error('Não é possível remover', 'Veículo possui agendamento ativo.')
      } else {
        showToast.error('Erro ao remover', error)
      }
      return
    }
    showToast.success('Veículo removido', `${vehicle.brand} ${vehicle.plate} removido com sucesso`)
    onDeleted()
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-white/20 dark:border-gray-700/50"
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#252940] dark:text-white mb-1">Remover Veículo</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tem certeza que deseja remover <span className="font-semibold text-[#252940] dark:text-white">{vehicle.brand} {vehicle.model} ({vehicle.plate})</span>?
              </p>
              <p className="text-xs text-red-400 mt-2">Esta ação não pode ser desfeita.</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-500/30"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Removendo...' : 'Remover'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
```

**Step 4: Criar `app/dashboard/vehicles/page.tsx`**

```tsx
'use client'

import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { Loading } from '@/components/ui/Loading'
import { VehicleDetailModal } from '@/components/vehicles/VehicleDetailModal'
import { VehicleEditModal } from '@/components/vehicles/VehicleEditModal'
import { VehicleDeleteModal } from '@/components/vehicles/VehicleDeleteModal'
import { motion } from 'framer-motion'
import { Car, Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  year: string
  color: string
  fuel_type: string
  created_at: string
  customer_id: string
  customer_name: string
  customer_email: string
  booking_count: string
}

export default function VehiclesPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [detailVehicle, setDetailVehicle] = useState<any>(null)
  const [editVehicle, setEditVehicle] = useState<any>(null)
  const [deleteVehicle, setDeleteVehicle] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const loadVehicles = useCallback(async () => {
    setLoading(true)
    const { data, error } = await apiClient.listVehicles(page, 25, search)
    setLoading(false)
    if (error) { showToast.error('Erro', error); return }
    const d = (data as any)?.data || data
    setVehicles(d?.vehicles || [])
    setTotalPages(d?.pages || 1)
    setTotal(d?.total || 0)
  }, [page, search])

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) { router.push('/login'); return }
    apiClient.setToken(token)
    loadVehicles()
  }, [loadVehicles, router])

  const handleViewDetail = async (v: Vehicle) => {
    setLoadingDetail(true)
    const { data, error } = await apiClient.getVehicle(v.id)
    setLoadingDetail(false)
    if (error) { showToast.error('Erro', error); return }
    setDetailVehicle((data as any)?.data || data)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-2xl flex items-center justify-center shadow-lg">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#252940] dark:text-white">Veículos</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{total} veículos cadastrados</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchInput}
            onChange={e => { setSearchInput(e.target.value); setPage(1) }}
            placeholder="Pesquisar por placa, marca, modelo ou cliente..."
            className="w-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl pl-11 pr-4 py-3 text-sm text-[#252940] dark:text-white focus:outline-none focus:border-[#00c977] transition-colors backdrop-blur-xl"
          />
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-lg overflow-hidden"
        >
          {loading ? (
            <div className="p-12 flex justify-center"><Loading size={60} /></div>
          ) : vehicles.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Nenhum veículo encontrado</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {['Veículo', 'Placa', 'Cliente', 'Agendamentos', 'Cadastrado', 'Ações'].map(h => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {vehicles.map((v) => (
                    <motion.tr
                      key={v.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
                            <Car className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#252940] dark:text-white">{v.brand} {v.model}</p>
                            <p className="text-xs text-gray-400">{v.year}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="bg-[#00c977]/10 text-[#00c977] text-xs font-mono font-bold px-2.5 py-1 rounded-lg">{v.plate}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[#252940] dark:text-white">{v.customer_name}</p>
                        <p className="text-xs text-gray-400">{v.customer_email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-[#252940] dark:text-white">{v.booking_count}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(v.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(v)}
                            disabled={loadingDetail}
                            className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditVehicle(v)}
                            className="p-2 rounded-xl bg-[#00c977]/10 text-[#00c977] hover:bg-[#00c977]/20 transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteVehicle(v)}
                            className="p-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500">Página {page} de {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 disabled:opacity-40 hover:bg-[#00c977]/20 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 disabled:opacity-40 hover:bg-[#00c977]/20 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      {detailVehicle && <VehicleDetailModal vehicle={detailVehicle} onClose={() => setDetailVehicle(null)} />}
      {editVehicle && <VehicleEditModal vehicle={editVehicle} onClose={() => setEditVehicle(null)} onSaved={loadVehicles} />}
      {deleteVehicle && <VehicleDeleteModal vehicle={deleteVehicle} onClose={() => setDeleteVehicle(null)} onDeleted={loadVehicles} />}
    </div>
  )
}
```

**Step 5: Commit**

```bash
git add app/dashboard/vehicles/ components/vehicles/
git commit -m "feat(admin): add vehicles page with CRUD - list, detail, edit, delete"
```

---

## Task 8: Frontend — Página Analytics

**Files:**
- Create: `meca-admin-nextjs/app/dashboard/analytics/page.tsx`
- Create: `meca-admin-nextjs/components/analytics/FinancialTab.tsx`
- Create: `meca-admin-nextjs/components/analytics/GrowthTab.tsx`

**Step 1: Criar `FinancialTab.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, ShoppingCart, Percent } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'

interface FinancialTabProps {
  data: any
  loading: boolean
}

const MEDAL: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' }

const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function FinancialTab({ data, loading }: FinancialTabProps) {
  if (loading || !data) return <div className="flex justify-center py-20 text-gray-400">Carregando...</div>

  const kpis = data.kpis || {}
  const series = data.chart_series || []
  const workshops = data.top_workshops || []

  const kpiCards = [
    { label: 'Receita Total', value: fmt(kpis.revenue_total || 0), icon: DollarSign, color: 'from-blue-500 to-blue-600' },
    { label: 'Receita Líquida MECA', value: fmt(kpis.meca_revenue || 0), icon: TrendingUp, color: 'from-[#00c977] to-[#00b369]' },
    { label: 'Ticket Médio', value: fmt(kpis.avg_ticket || 0), icon: ShoppingCart, color: 'from-purple-500 to-purple-600' },
    { label: 'Conversão', value: `${kpis.conversion_rate || 0}%`, icon: Percent, color: 'from-yellow-500 to-yellow-600',
      sub: `${kpis.paid_bookings || 0} agendamentos pagos` },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-lg"
          >
            <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center shadow-lg mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
            <p className="text-xl font-bold text-[#252940] dark:text-white">{card.value}</p>
            {card.sub && <p className="text-xs text-gray-400 mt-1">{card.sub}</p>}
          </motion.div>
        ))}
      </div>

      {/* Area Chart */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg">
        <h3 className="text-base font-semibold text-[#252940] dark:text-white mb-4">Evolução da Receita</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={series}>
            <defs>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradMeca" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00c977" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00c977" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" fontSize={11} tickFormatter={(v) => new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} />
            <YAxis fontSize={11} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(15,20,30,0.95)', border: 'none', borderRadius: '12px', color: '#fff' }}
              formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
            />
            <Area type="monotone" dataKey="revenue" name="Receita Bruta" stroke="#6366f1" fill="url(#gradRevenue)" strokeWidth={2} />
            <Area type="monotone" dataKey="meca_revenue" name="Receita MECA" stroke="#00c977" fill="url(#gradMeca)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top Workshops Table */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-[#252940] dark:text-white">Top 10 Oficinas por Receita</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50">
              <tr>
                {['#', 'Oficina', 'Agendamentos', 'Receita', 'Comissão MECA', 'Ticket Médio'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {workshops.map((w: any, i: number) => (
                <tr key={w.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-5 py-3 text-lg">{MEDAL[i] || `#${i + 1}`}</td>
                  <td className="px-5 py-3 text-sm font-medium text-[#252940] dark:text-white">{w.name}</td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{w.bookings}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-[#252940] dark:text-white">{fmt(w.revenue)}</td>
                  <td className="px-5 py-3 text-sm text-[#00c977]">{fmt(w.meca_commission)}</td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{fmt(w.avg_ticket)}</td>
                </tr>
              ))}
              {workshops.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Nenhum dado para o período</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Criar `GrowthTab.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'
import { Users, Building2, RefreshCw, UserCheck, TrendingUp, TrendingDown } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

interface GrowthTabProps {
  data: any
  loading: boolean
}

function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  if (!previous) return null
  const pct = (((current - previous) / previous) * 100).toFixed(1)
  const up = current >= previous
  return (
    <span className={`text-xs flex items-center gap-0.5 font-semibold ${up ? 'text-[#00c977]' : 'text-red-400'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? '+' : ''}{pct}%
    </span>
  )
}

export function GrowthTab({ data, loading }: GrowthTabProps) {
  if (loading || !data) return <div className="flex justify-center py-20 text-gray-400">Carregando...</div>

  const kpis = data.kpis || {}
  const funnel = data.funnel || {}
  const series = data.growth_series || []
  const churn = data.churn || {}

  const funnelMax = Math.max(funnel.registered || 1, 1)
  const funnelSteps = [
    { label: 'Cadastrou', value: funnel.registered || 0, color: '#6366f1' },
    { label: 'Agendou', value: funnel.booked || 0, color: '#3b82f6' },
    { label: 'Pagou', value: funnel.paid || 0, color: '#00c977' },
    { label: 'Concluiu', value: funnel.completed || 0, color: '#10b981' },
  ]

  const churnData = [
    { name: '30 dias', value: churn.inactive_30d || 0 },
    { name: '60 dias', value: churn.inactive_60d || 0 },
    { name: '90 dias', value: churn.inactive_90d || 0 },
  ]

  const kpiCards = [
    { label: 'Novos Clientes', value: kpis.new_customers || 0, prev: kpis.new_customers_prev || 0, icon: Users, color: 'from-[#00c977] to-[#00b369]' },
    { label: 'Novas Oficinas', value: kpis.new_workshops || 0, prev: kpis.new_workshops_prev || 0, icon: Building2, color: 'from-[#252940] to-[#1B1D2E]' },
    { label: 'Clientes Retidos', value: kpis.retained_customers || 0, prev: 0, icon: UserCheck, color: 'from-purple-500 to-purple-600' },
    { label: 'Crescimento', value: `${kpis.new_customers || 0 + kpis.new_workshops || 0}`, prev: 0, icon: RefreshCw, color: 'from-yellow-500 to-yellow-600' },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-gray-700/50 shadow-lg"
          >
            <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center shadow-lg mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-[#252940] dark:text-white">{card.value}</p>
              <DeltaBadge current={Number(card.value)} previous={card.prev} />
            </div>
            {card.prev > 0 && <p className="text-xs text-gray-400 mt-1">Anterior: {card.prev}</p>}
          </motion.div>
        ))}
      </div>

      {/* Funil */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg">
        <h3 className="text-base font-semibold text-[#252940] dark:text-white mb-5">Funil de Conversão</h3>
        <div className="space-y-3">
          {funnelSteps.map((step, i) => {
            const pct = Math.round((step.value / funnelMax) * 100)
            const convRate = i > 0 && funnelSteps[i - 1].value > 0
              ? ((step.value / funnelSteps[i - 1].value) * 100).toFixed(0)
              : null
            return (
              <div key={step.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-[#252940] dark:text-white">{step.label}</span>
                  <div className="flex items-center gap-3">
                    {convRate && <span className="text-xs text-gray-400">{convRate}% do anterior</span>}
                    <span className="text-sm font-bold" style={{ color: step.color }}>{step.value}</span>
                  </div>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: step.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Growth series */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg">
          <h3 className="text-base font-semibold text-[#252940] dark:text-white mb-4">Crescimento Acumulado</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" fontSize={11} tickFormatter={(v) => new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} />
              <YAxis fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15,20,30,0.95)', border: 'none', borderRadius: '12px', color: '#fff' }} />
              <Legend />
              <Line type="monotone" dataKey="customers" name="Clientes" stroke="#00c977" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="workshops" name="Oficinas" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Churn */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg">
          <h3 className="text-base font-semibold text-[#252940] dark:text-white mb-4">Oficinas Inativas (Churn)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={churnData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15,20,30,0.95)', border: 'none', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="value" name="Oficinas inativas" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Criar `app/dashboard/analytics/page.tsx`**

```tsx
'use client'

import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { PeriodSelector } from '@/components/analytics/PeriodSelector'
import { FinancialTab } from '@/components/analytics/FinancialTab'
import { GrowthTab } from '@/components/analytics/GrowthTab'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const TABS = [
  { key: 'financial', label: 'Financeiro' },
  { key: 'growth',    label: 'Crescimento' },
]

export default function AnalyticsPage() {
  const router = useRouter()
  const [tab, setTab] = useState('financial')
  const [period, setPeriod] = useState('30d')
  const [financialData, setFinancialData] = useState<any>(null)
  const [growthData, setGrowthData] = useState<any>(null)
  const [loadingFinancial, setLoadingFinancial] = useState(false)
  const [loadingGrowth, setLoadingGrowth] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) { router.push('/login'); return }
    apiClient.setToken(token)
    loadAll()
  }, [period, router])

  const loadAll = async () => {
    setLoadingFinancial(true)
    setLoadingGrowth(true)

    const [fin, gro] = await Promise.all([
      apiClient.getAnalyticsFinancial(period),
      apiClient.getAnalyticsGrowth(period),
    ])

    setLoadingFinancial(false)
    setLoadingGrowth(false)

    if (fin.error) showToast.error('Erro financeiro', fin.error)
    else setFinancialData((fin.data as any)?.data || fin.data)

    if (gro.error) showToast.error('Erro crescimento', gro.error)
    else setGrowthData((gro.data as any)?.data || gro.data)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#252940] dark:text-white">Analytics</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Métricas financeiras e de crescimento</p>
            </div>
          </div>
          <PeriodSelector value={period} onChange={(p) => { setPeriod(p) }} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                tab === t.key
                  ? 'bg-gradient-to-r from-[#00c977] to-[#00b369] text-white shadow-lg shadow-[#00c977]/30'
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-[#00c977]/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'financial' && <FinancialTab data={financialData} loading={loadingFinancial} />}
          {tab === 'growth' && <GrowthTab data={growthData} loading={loadingGrowth} />}
        </motion.div>
      </div>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add app/dashboard/analytics/ components/analytics/
git commit -m "feat(admin): add analytics page - financial KPIs, area charts, growth funnel, churn"
```

---

## Task 9: Script de Deploy

**Files:**
- Create: `scripts/deploy_admin.sh` (na raiz do repo LearningMEDUSA)

**Step 1: Criar script**

```bash
#!/bin/bash
set -e

EC2_HOST="ec2-user@18.216.86.93"
EC2_KEY="/Users/filippoferrari/Documents/LearningMEDUSA/awskey.pem"
EC2_PATH="/home/ec2-user/meca-new/meca-admin-nextjs"
LOCAL_PATH="$(dirname "$0")/../meca-admin-nextjs"

echo ">> [1/4] Building admin..."
cd "$LOCAL_PATH"
npm run build

echo ">> [2/4] Syncing .next/..."
rsync -avz --delete -e "ssh -i $EC2_KEY" .next/ $EC2_HOST:$EC2_PATH/.next/

echo ">> [3/4] Syncing public/ e configs..."
rsync -avz -e "ssh -i $EC2_KEY" public/ $EC2_HOST:$EC2_PATH/public/ 2>/dev/null || true
rsync -avz -e "ssh -i $EC2_KEY" package.json $EC2_HOST:$EC2_PATH/
ls next.config.* &>/dev/null && rsync -avz -e "ssh -i $EC2_KEY" next.config.* $EC2_HOST:$EC2_PATH/ || true

echo ">> [4/4] Restarting PM2 (meca-admin)..."
ssh -i "$EC2_KEY" $EC2_HOST "pm2 restart meca-admin && pm2 save"

echo ""
echo "Deploy concluido! Admin disponivel em https://admin.mecabr.com"
```

**Step 2: Tornar executável e commitar**

```bash
chmod +x scripts/deploy_admin.sh
git add scripts/deploy_admin.sh
git commit -m "chore: add deploy_admin.sh script (rsync + pm2 restart)"
```

---

## Task 10: Deploy Final em Produção

**Step 1: Deploy da API (novos endpoints)**

```bash
EC2_KEY="/Users/filippoferrari/Documents/LearningMEDUSA/awskey.pem"

# Enviar AdminController e rotas atualizados
rsync -avz -e "ssh -i $EC2_KEY" \
  api-modular-structure/src/controllers/admin/AdminController.js \
  ec2-user@18.216.86.93:/home/ec2-user/meca-new/api-modular-structure/src/controllers/admin/

rsync -avz -e "ssh -i $EC2_KEY" \
  api-modular-structure/src/routes/admin/adminRoutes.js \
  ec2-user@18.216.86.93:/home/ec2-user/meca-new/api-modular-structure/src/routes/admin/

# Restart API
ssh -i "$EC2_KEY" ec2-user@18.216.86.93 "pm2 restart meca-api-v2"
```

**Step 2: Deploy do Admin (frontend)**

```bash
bash scripts/deploy_admin.sh
```

**Step 3: Verificar em produção**

```bash
# Testar endpoint vehicles
curl -s -H "Authorization: Bearer <token_admin>" \
  https://api.mecabr.com/admin/vehicles?limit=1 | jq '.success'

# Testar endpoint analytics
curl -s -H "Authorization: Bearer <token_admin>" \
  "https://api.mecabr.com/admin/analytics/financial?period=30d" | jq '.success'
```

Acessar https://admin.mecabr.com e verificar:
- Sidebar mostra "Veículos" e "Analytics"
- Dashboard tem seletor de período e AreaCharts
- `/dashboard/vehicles` lista veículos com paginação
- `/dashboard/analytics` mostra tabs Financeiro e Crescimento

**Step 4: Commit final**

```bash
git add -A
git commit -m "chore: admin v2 - analytics + vehicles + dashboard upgrade complete"
```
