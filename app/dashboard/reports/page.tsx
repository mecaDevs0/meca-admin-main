'use client'

import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { Loading } from '@/components/ui/Loading'
import { FileText, TrendingUp, Building2, Calendar, DollarSign, Download, Percent, Search, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface Workshop {
  id: string
  name: string
  email: string
}

export default function ReportsPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loadingWorkshops, setLoadingWorkshops] = useState(false)
  
  // Estados do relatório de oficinas
  const [downloadingReport, setDownloadingReport] = useState(false)
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('')
  const [reportMonth, setReportMonth] = useState<string>('')
  const [reportYear, setReportYear] = useState<string>('')
  const [reportStartDate, setReportStartDate] = useState<string>('')
  const [reportEndDate, setReportEndDate] = useState<string>('')
  const [useCustomPeriod, setUseCustomPeriod] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('meca_admin_token')
    if (!token) {
      router.push('/login')
      return
    }
    apiClient.setToken(token)
    loadMetrics()
    loadWorkshops()
  }, [router])
  
  const loadWorkshops = async () => {
    setLoadingWorkshops(true)
    try {
      const { data: response, error } = await apiClient.getWorkshops()
      
      if (error) {
        console.error('Erro ao carregar oficinas:', error)
        setWorkshops([])
        return
      }
      
      let rawWorkshops: any[] = []
      if (response && typeof response === 'object') {
        if ('data' in response && response.data && typeof response.data === 'object' && 'oficinas' in response.data) {
          rawWorkshops = Array.isArray((response.data as { oficinas: unknown }).oficinas) 
            ? (response.data as { oficinas: unknown[] }).oficinas 
            : []
        } else if ('oficinas' in response && Array.isArray(response.oficinas)) {
          rawWorkshops = response.oficinas
        } else if ('data' in response && Array.isArray(response.data)) {
          rawWorkshops = response.data
        } else if (Array.isArray(response)) {
          rawWorkshops = response
        }
      }
      
      const workshopsData = rawWorkshops.map((w: any) => ({
        id: w.id,
        name: w.name || 'Sem nome',
        email: w.email || ''
      }))
      
      setWorkshops(workshopsData)
    } catch (error) {
      console.error('Erro ao carregar oficinas:', error)
      setWorkshops([])
    } finally {
      setLoadingWorkshops(false)
    }
  }

  const loadMetrics = async () => {
    setLoading(true)
    try {
      const { data: response, error } = await apiClient.getDashboardMetrics()

      if (error) {
        showToast.error('Erro ao carregar métricas', error || 'Não foi possível carregar os dados')
        setMetrics(null)
        setLoading(false)
        return
      }

      const normalized =
        response && typeof response === 'object' && 'data' in response
          ? (response as { data?: unknown }).data
          : response

      setMetrics(normalized || {})
    } catch (error) {
      console.error('Erro na requisição:', error)
      showToast.error('Erro de conexão', 'Verifique se a API está rodando')
      setMetrics(null)
    }

    setLoading(false)
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '—'
    return `${(value * 100).toFixed(2)}%`
  }

  const revenueThisMonth = Number(metrics?.revenue_this_month || 0)
  const totalRevenueLastMonth = Number(metrics?.total_revenue_last_month || 0)
  const mecaCommissionLastMonth = Number(metrics?.meca_commission_last_month || 0)
  const totalBookingsLastMonth = Number(metrics?.total_bookings_last_month || 0)

  const customerRegistrations: Array<{ name: string; value: number }> =
    Array.isArray(metrics?.customer_registrations) ? metrics.customer_registrations : []
  const workshopRegistrations: Array<{ name: string; value: number }> =
    Array.isArray(metrics?.workshop_registrations) ? metrics.workshop_registrations : []

  const oficinasByStatus = metrics?.oficinas_by_status || {}

  const registrationsSeries = useMemo(() => {
    const combined: Record<string, { month: string; clientes: number; oficinas: number }> = {}
    const order: string[] = []

    customerRegistrations.forEach(({ name, value }) => {
      if (!combined[name]) {
        combined[name] = { month: name, clientes: 0, oficinas: 0 }
        order.push(name)
      }
      combined[name].clientes = value ?? 0
    })

    workshopRegistrations.forEach(({ name, value }) => {
      if (!combined[name]) {
        combined[name] = { month: name, clientes: 0, oficinas: 0 }
        order.push(name)
      }
      combined[name].oficinas = value ?? 0
    })

    return order.map((key) => combined[key])
  }, [customerRegistrations, workshopRegistrations])

  const oficinasStatusList = useMemo(
    () =>
      Object.entries(oficinasByStatus || {}).map(([status, total]) => ({
        status,
        total: Number(total) || 0,
      })),
    [oficinasByStatus],
  )

  const totalRegistrations = useMemo(
    () =>
      registrationsSeries.reduce(
        (acc, item) => ({ clientes: acc.clientes + item.clientes, oficinas: acc.oficinas + item.oficinas }),
        { clientes: 0, oficinas: 0 },
      ),
    [registrationsSeries],
  )

  const downloadCSV = (filename: string, rows: Array<Array<string | number>>) => {
    if (rows.length === 0) {
      showToast.warning('Sem dados', 'Não há dados disponíveis para exportar.')
      return
    }

    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => {
            const normalized = typeof cell === 'number' ? cell.toString() : cell
            return `"${normalized.replace(/"/g, '""')}"`
          })
          .join(';'),
      )
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast.success('Relatório gerado', `${filename} exportado com sucesso.`)
  }

  // Formatar status para português
  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'approved': 'Aprovado',
      'aprovado': 'Aprovado',
      'pending': 'Pendente',
      'pendente': 'Pendente',
      'rejected': 'Rejeitado',
      'rejeitado': 'Rejeitado'
    }
    return statusMap[status?.toLowerCase()] || status || 'N/A'
  }

  const downloadExcel = async (filename: string, data: any) => {
    try {
      // Import dinâmico para evitar problemas de SSR
      const ExcelJS = (await import('exceljs')).default
      const workbook = new ExcelJS.Workbook()
      
      // Configurar propriedades do documento
      workbook.creator = 'MECA Admin'
      workbook.created = new Date()
      workbook.modified = new Date()

      const worksheet = workbook.addWorksheet('Relatório Oficinas', {
        pageSetup: {
          paperSize: 9, // A4
          orientation: 'landscape',
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
        },
      })

      // Definir cores e estilos
      const headerStyle: any = {
        font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 },
        fill: {
          type: 'pattern' as const,
          pattern: 'solid' as const,
          fgColor: { argb: 'FF2D3748' }, // Cinza escuro
        },
        alignment: { vertical: 'middle' as const, horizontal: 'center' as const, wrapText: true },
        border: {
          top: { style: 'thin' as const, color: { argb: 'FF000000' } },
          left: { style: 'thin' as const, color: { argb: 'FF000000' } },
          bottom: { style: 'thin' as const, color: { argb: 'FF000000' } },
          right: { style: 'thin' as const, color: { argb: 'FF000000' } },
        },
      }

      const titleStyle: any = {
        font: { bold: true, size: 16, color: { argb: 'FF1A202C' } },
        alignment: { horizontal: 'center' as const, vertical: 'middle' as const },
      }

      const sectionHeaderStyle: any = {
        font: { bold: true, size: 14, color: { argb: 'FFFFFFFF' } },
        fill: {
          type: 'pattern' as const,
          pattern: 'solid' as const,
          fgColor: { argb: 'FF00C977' }, // Verde MECA
        },
        alignment: { horizontal: 'center' as const, vertical: 'middle' as const },
        border: {
          top: { style: 'medium' as const, color: { argb: 'FF000000' } },
          left: { style: 'thin' as const, color: { argb: 'FF000000' } },
          bottom: { style: 'medium' as const, color: { argb: 'FF000000' } },
          right: { style: 'thin' as const, color: { argb: 'FF000000' } },
        },
      }

      const summaryStyle: any = {
        font: { bold: true, size: 11 },
        fill: {
          type: 'pattern' as const,
          pattern: 'solid' as const,
          fgColor: { argb: 'FFF7FAFC' }, // Cinza claro
        },
        border: {
          top: { style: 'thin' as const, color: { argb: 'FF000000' } },
          left: { style: 'thin' as const, color: { argb: 'FF000000' } },
          bottom: { style: 'thin' as const, color: { argb: 'FF000000' } },
          right: { style: 'thin' as const, color: { argb: 'FF000000' } },
        },
      }

      const currencyStyle: any = {
        numFmt: '"R$" #,##0.00',
        alignment: { horizontal: 'right' as const },
      }

      const percentStyle: any = {
        numFmt: '0.00%',
        alignment: { horizontal: 'right' as const },
      }

      const dataStyle: any = {
        border: {
          top: { style: 'thin' as const, color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin' as const, color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin' as const, color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin' as const, color: { argb: 'FFE2E8F0' } },
        },
        alignment: { vertical: 'middle' as const, wrapText: true },
      }

      let currentRow = 1

      // Título principal
      worksheet.mergeCells(currentRow, 1, currentRow, 15)
      const titleCell = worksheet.getCell(currentRow, 1)
      titleCell.value = 'RELATÓRIO DETALHADO DE OFICINAS - MECA'
      titleCell.style = titleStyle
      titleCell.font = { ...titleStyle.font, size: 18 }
      currentRow++

      // Informações do relatório
      currentRow++
      worksheet.getCell(currentRow, 1).value = 'Período:'
      worksheet.getCell(currentRow, 1).font = { bold: true }
      worksheet.getCell(currentRow, 2).value = `${data.period.start_date || ''} até ${data.period.end_date || ''}`
      currentRow++

      worksheet.getCell(currentRow, 1).value = 'Gerado em:'
      worksheet.getCell(currentRow, 1).font = { bold: true }
      worksheet.getCell(currentRow, 2).value = new Date().toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })
      currentRow++

      worksheet.getCell(currentRow, 1).value = 'Total de Oficinas:'
      worksheet.getCell(currentRow, 1).font = { bold: true }
      worksheet.getCell(currentRow, 2).value = data.summary.total_workshops || 0
      currentRow += 2

      // Resumo Executivo - Métricas Financeiras
      worksheet.mergeCells(currentRow, 1, currentRow, 5)
      const financeHeader = worksheet.getCell(currentRow, 1)
      financeHeader.value = 'RESUMO EXECUTIVO - MÉTRICAS FINANCEIRAS'
      financeHeader.style = sectionHeaderStyle
      currentRow++

      const financeLabels = [
        ['Receita Bruta Total', data.summary.total_receita_bruta],
        ['Valor Líquido Total', data.summary.total_valor_liquido],
        ['Taxa MECA Total', data.summary.total_taxa_meca],
        ['Taxa PagBank Total', data.summary.total_taxa_pagbank],
        ['Ticket Médio Geral', data.summary.media_ticket_medio],
      ]

      financeLabels.forEach(([label, value], idx) => {
        const cellLabel = worksheet.getCell(currentRow, 1)
        cellLabel.value = label as string
        cellLabel.style = summaryStyle
        
        const cellValue = worksheet.getCell(currentRow, 2)
        cellValue.value = Number(value) || 0
        cellValue.style = { ...summaryStyle, ...currencyStyle }
        
        // Destacar valores importantes
        if (idx === 0 || idx === 1) { // Receita Bruta e Valor Líquido
          cellLabel.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFE6FCF4' } }
          cellValue.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFD1FAE5' } }
          cellValue.font = { bold: true, size: 12, color: { argb: 'FF059669' } }
        }
        
        currentRow++
      })

      currentRow++

      // Resumo Executivo - Métricas Operacionais
      worksheet.mergeCells(currentRow, 1, currentRow, 5)
      const opsHeader = worksheet.getCell(currentRow, 1)
      opsHeader.value = 'RESUMO EXECUTIVO - MÉTRICAS OPERACIONAIS'
      opsHeader.style = sectionHeaderStyle
      currentRow++

      const opsLabels = [
        ['Total de Serviços', data.summary.total_servicos],
        ['Serviços Concluídos', data.summary.total_servicos_concluidos],
        ['Serviços Pendentes', (data.summary.total_servicos || 0) - (data.summary.total_servicos_concluidos || 0) - (data.summary.total_cancelamentos || 0)],
        ['Cancelamentos', data.summary.total_cancelamentos],
        ['Taxa de Conclusão', (data.summary.taxa_conclusao_geral || 0) / 100],
        ['Pagamentos Aprovados', data.summary.total_pagamentos_aprovados],
      ]

      opsLabels.forEach(([label, value], idx) => {
        const cellLabel = worksheet.getCell(currentRow, 1)
        cellLabel.value = label as string
        cellLabel.style = summaryStyle
        
        const cell = worksheet.getCell(currentRow, 2)
        cell.value = typeof value === 'number' ? value : Number(value) || 0
        
        // Cores baseadas no tipo de métrica
        if (label === 'Taxa de Conclusão') {
          cell.style = { ...summaryStyle, ...percentStyle }
          const taxa = Number(cell.value) || 0
          if (taxa >= 0.8) {
            cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFD1FAE5' } }
            cell.font = { bold: true, color: { argb: 'FF059669' } }
          } else if (taxa >= 0.5) {
            cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFEF3C7' } }
            cell.font = { bold: true, color: { argb: 'FFD97706' } }
          }
        } else if (label === 'Serviços Concluídos') {
          cell.style = summaryStyle
          cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFE6FCF4' } }
          cell.font = { bold: true, color: { argb: 'FF059669' } }
        } else if (label === 'Cancelamentos') {
          cell.style = summaryStyle
          if (Number(value) > 0) {
            cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFEE2E2' } }
            cell.font = { bold: true, color: { argb: 'FFDC2626' } }
          }
        } else if (label === 'Total de Serviços') {
          cell.style = summaryStyle
          cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFE6FCF4' } }
          cell.font = { bold: true, size: 12 }
        } else {
          cell.style = summaryStyle
        }
        
        currentRow++
      })

      currentRow += 2

      // Cabeçalho da tabela de oficinas
      const headers = [
        'Nome da Oficina',
        'Status',
        'CNPJ',
        'Email',
        'Telefone',
        'Endereço',
        'Total Serviços',
        'Concluídos',
        'Pendentes',
        'Em Andamento',
        'Cancelados',
        'Taxa Conclusão',
        'Taxa Cancelamento',
        'Receita Bruta',
        'Valor Líquido',
        'Ticket Médio Serviço',
        'Ticket Médio Pagamento',
        'Taxa MECA',
        'Taxa PagBank',
        'Pag. Aprovados',
        'Pag. Pendentes',
        'Pag. Falhados',
        'Primeiro Serviço',
        'Último Serviço',
        'ID Técnico',
      ]

      headers.forEach((header, index) => {
        const cell = worksheet.getCell(currentRow, index + 1)
        cell.value = header
        cell.style = headerStyle
        worksheet.getColumn(index + 1).width = header.length > 15 ? 18 : 15
      })

      worksheet.getRow(currentRow).height = 30
      currentRow++

      // Dados das oficinas com cores alternadas e destaque
      data.workshops.forEach((w: any, workshopIndex: number) => {
        const row = [
          w.workshop_name || 'N/A',
          formatStatus(w.workshop_status || ''),
          w.workshop_cnpj || 'Não informado',
          w.workshop_email || 'Não informado',
          w.workshop_phone || 'Não informado',
          w.workshop_address || 'Não informado',
          w.total_servicos || 0,
          w.servicos_concluidos || 0,
          w.servicos_pendentes || 0,
          w.servicos_em_andamento || 0,
          w.cancelamentos || 0,
          (w.taxa_conclusao_percent || 0) / 100,
          (w.taxa_cancelamento_percent || 0) / 100,
          w.receita_bruta || 0,
          w.valor_liquido || 0,
          w.ticket_medio_servico || 0,
          w.ticket_medio_pagamento || 0,
          w.taxa_meca || 0,
          w.taxa_pagbank || 0,
          w.pagamentos_aprovados || 0,
          w.pagamentos_pendentes || 0,
          w.pagamentos_falhados || 0,
          w.primeiro_servico ? new Date(w.primeiro_servico).toLocaleDateString('pt-BR') : 'N/A',
          w.ultimo_servico ? new Date(w.ultimo_servico).toLocaleDateString('pt-BR') : 'N/A',
          w.workshop_id || '',
        ]

        // Cores alternadas para linhas (zebra striping)
        const isEvenRow = workshopIndex % 2 === 0
        const rowBgColor = isEvenRow ? 'FFF9FAFB' : 'FFFFFFFF' // Cinza muito claro / Branco

        row.forEach((value, index) => {
          const cell = worksheet.getCell(currentRow, index + 1)
          cell.value = value
          
          // Estilo base com cor de fundo alternada
          const baseStyle: any = {
            ...dataStyle,
            fill: {
              type: 'pattern' as const,
              pattern: 'solid' as const,
              fgColor: { argb: rowBgColor },
            },
          }

          // Formatação específica por coluna (índices baseados no array row)
          // Colunas monetárias: 13 (Receita Bruta), 14 (Valor Líquido), 15 (Ticket Médio Serviço), 16 (Ticket Médio Pagamento), 17 (Taxa MECA), 18 (Taxa PagBank)
          if ([13, 14, 15, 16, 17, 18].includes(index)) {
            cell.style = { ...baseStyle, ...currencyStyle }
          } 
          // Taxas percentuais: 11 (Taxa Conclusão), 12 (Taxa Cancelamento)
          else if ([11, 12].includes(index)) {
            cell.style = { ...baseStyle, ...percentStyle }
          } else {
            cell.style = baseStyle
          }

          // Cores condicionais e destaques
          if (index === 1) {
            // Status - cores baseadas no status
            const status = String(value).toLowerCase()
            if (status === 'aprovado') {
              cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFD1FAE5' } } // Verde claro
              cell.font = { bold: true, color: { argb: 'FF059669' } }
            } else if (status === 'pendente') {
              cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFEF3C7' } } // Amarelo claro
              cell.font = { bold: true, color: { argb: 'FFD97706' } }
            } else if (status === 'rejeitado') {
              cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFEE2E2' } } // Vermelho claro
              cell.font = { bold: true, color: { argb: 'FFDC2626' } }
            }
          }

          // Total de serviços - verde se > 0
          if (index === 6) {
            const total = Number(value) || 0
            if (total > 0) {
              cell.font = { bold: true, color: { argb: 'FF00C977' }, size: 11 }
              cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFE6FCF4' } }
            }
          }

          // Serviços concluídos - verde
          if (index === 7 && Number(value) > 0) {
            cell.font = { bold: true, color: { argb: 'FF059669' } }
            cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFD1FAE5' } }
          }

          // Serviços pendentes - amarelo
          if (index === 8 && Number(value) > 0) {
            cell.font = { bold: true, color: { argb: 'FFD97706' } }
            cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFEF3C7' } }
          }

          // Cancelamentos - vermelho
          if (index === 10 && Number(value) > 0) {
            cell.font = { bold: true, color: { argb: 'FFDC2626' } }
            cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFEE2E2' } }
          }

          // Taxa de conclusão - verde se alta
          if (index === 11) {
            const taxa = Number(value) || 0
            if (taxa >= 0.8) {
              cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFD1FAE5' } }
              cell.font = { bold: true, color: { argb: 'FF059669' } }
            } else if (taxa >= 0.5) {
              cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFEF3C7' } }
              cell.font = { bold: true, color: { argb: 'FFD97706' } }
            } else if (taxa > 0) {
              cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFEE2E2' } }
              cell.font = { bold: true, color: { argb: 'FFDC2626' } }
            }
          }

          // Receita bruta - destaque verde forte
          if (index === 13 && Number(value) > 0) {
            cell.font = { bold: true, color: { argb: 'FF059669' }, size: 11 }
            cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFD1FAE5' } }
          }

          // Valor líquido - destaque verde
          if (index === 14 && Number(value) > 0) {
            cell.font = { bold: true, color: { argb: 'FF10B981' }, size: 11 }
            cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFE6FCF4' } }
          }

          // Pagamentos aprovados - verde
          if (index === 19 && Number(value) > 0) {
            cell.font = { bold: true, color: { argb: 'FF059669' } }
            cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFD1FAE5' } }
          }

          // Pagamentos pendentes - amarelo
          if (index === 20 && Number(value) > 0) {
            cell.font = { bold: true, color: { argb: 'FFD97706' } }
            cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFEF3C7' } }
          }

          // Pagamentos falhados - vermelho
          if (index === 21 && Number(value) > 0) {
            cell.font = { bold: true, color: { argb: 'FFDC2626' } }
            cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFEE2E2' } }
          }
        })

        currentRow++
      })

      // Ajustar larguras das colunas
      worksheet.getColumn(1).width = 25 // Nome
      worksheet.getColumn(2).width = 12 // Status
      worksheet.getColumn(3).width = 18 // CNPJ
      worksheet.getColumn(4).width = 25 // Email
      worksheet.getColumn(6).width = 35 // Endereço
      worksheet.getColumn(25).width = 30 // ID Técnico

      currentRow += 3

      // ========== NOVA SEÇÃO: SERVIÇOS POR OFICINA ==========
      // Sempre criar a seção se houver serviços cadastrados, mesmo sem dados de oficinas
      if (data.services && Array.isArray(data.services) && data.services.length > 0) {
        // Título da seção
        const servicesHeaderCols = 1 + data.services.length // 1 para nome da oficina + colunas de serviços
        worksheet.mergeCells(currentRow, 1, currentRow, servicesHeaderCols)
        const servicesTitleCell = worksheet.getCell(currentRow, 1)
        servicesTitleCell.value = 'QUANTIDADE DE SERVIÇOS REALIZADOS POR OFICINA'
        servicesTitleCell.style = {
          ...sectionHeaderStyle,
          font: { bold: true, size: 16, color: { argb: 'FFFFFFFF' } },
        }
        currentRow++

        // Cabeçalho: Nome da Oficina + Lista de Serviços
        const servicesHeaders = ['Oficina', ...data.services.map((s: any) => s.name)]
        servicesHeaders.forEach((header, index) => {
          const cell = worksheet.getCell(currentRow, index + 1)
          cell.value = header
          cell.style = {
            ...headerStyle,
            fill: {
              type: 'pattern' as const,
              pattern: 'solid' as const,
              fgColor: { argb: 'FF4A5568' }, // Cinza médio para diferenciar
            },
          }
          // Largura automática para colunas de serviços
          if (index === 0) {
            worksheet.getColumn(index + 1).width = 30
          } else {
            worksheet.getColumn(index + 1).width = 20
          }
        })
        worksheet.getRow(currentRow).height = 30
        currentRow++

        // Dados: Para cada oficina, mostrar quantidade de cada serviço
        data.workshops.forEach((w: any, workshopIndex: number) => {
          const isEvenRow = workshopIndex % 2 === 0
          const rowBgColor = isEvenRow ? 'FFF9FAFB' : 'FFFFFFFF'

          // Nome da oficina
          const nameCell = worksheet.getCell(currentRow, 1)
          nameCell.value = w.workshop_name || 'N/A'
          nameCell.style = {
            ...dataStyle,
            fill: {
              type: 'pattern' as const,
              pattern: 'solid' as const,
              fgColor: { argb: rowBgColor },
            },
            font: { bold: true },
          }

          // Quantidade de cada serviço
          data.services.forEach((service: any, serviceIndex: number) => {
            const cell = worksheet.getCell(currentRow, serviceIndex + 2)
            const servicesForWorkshop = (data.services_by_workshop && data.services_by_workshop[w.workshop_id]) ? data.services_by_workshop[w.workshop_id] : {}
            const serviceData = servicesForWorkshop[service.id]
            const quantidade = serviceData && typeof serviceData === 'object' && 'quantidade' in serviceData 
              ? serviceData.quantidade 
              : (typeof serviceData === 'number' ? serviceData : 0)
            
            cell.value = quantidade
            cell.alignment = { horizontal: 'center' as const, vertical: 'middle' as const }
            
            // Aplicar cores condicionais diretamente (sem estilo base que pode sobrescrever)
            if (quantidade > 0) {
              if (quantidade >= 10) {
                // Verde escuro - muitos serviços
                cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFD1FAE5' } }
                cell.font = { bold: true, color: { argb: 'FF059669' }, size: 11 }
                cell.border = {
                  top: { style: 'thin' as const, color: { argb: 'FF000000' } },
                  left: { style: 'thin' as const, color: { argb: 'FF000000' } },
                  bottom: { style: 'thin' as const, color: { argb: 'FF000000' } },
                  right: { style: 'thin' as const, color: { argb: 'FF000000' } },
                }
              } else if (quantidade >= 5) {
                // Verde claro - quantidade média
                cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFE6FCF4' } }
                cell.font = { bold: true, color: { argb: 'FF00C977' }, size: 10 }
                cell.border = {
                  top: { style: 'thin' as const, color: { argb: 'FF000000' } },
                  left: { style: 'thin' as const, color: { argb: 'FF000000' } },
                  bottom: { style: 'thin' as const, color: { argb: 'FF000000' } },
                  right: { style: 'thin' as const, color: { argb: 'FF000000' } },
                }
              } else {
                // Amarelo claro - poucos serviços
                cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFEF3C7' } }
                cell.font = { bold: false, color: { argb: 'FFD97706' }, size: 10 }
                cell.border = {
                  top: { style: 'thin' as const, color: { argb: 'FF000000' } },
                  left: { style: 'thin' as const, color: { argb: 'FF000000' } },
                  bottom: { style: 'thin' as const, color: { argb: 'FF000000' } },
                  right: { style: 'thin' as const, color: { argb: 'FF000000' } },
                }
              }
            } else {
              // Cinza para zero (mantém fundo alternado)
              cell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: rowBgColor } }
              cell.font = { color: { argb: 'FF9CA3AF' }, size: 10 }
              cell.border = {
                top: { style: 'thin' as const, color: { argb: 'FFE5E7EB' } },
                left: { style: 'thin' as const, color: { argb: 'FFE5E7EB' } },
                bottom: { style: 'thin' as const, color: { argb: 'FFE5E7EB' } },
                right: { style: 'thin' as const, color: { argb: 'FFE5E7EB' } },
              }
            }
          })

          currentRow++
        })

        currentRow += 2
      }

      // Congelar primeira linha de cabeçalho da tabela principal (encontrada antes da seção de serviços)
      // A tabela principal começa após o resumo executivo
      const mainTableStartRow = 1 + 20 // Aproximadamente onde começa a tabela principal (após título, info, resumos)
      worksheet.views = [
        {
          state: 'frozen',
          ySplit: mainTableStartRow,
        },
      ]

      // Gerar buffer e fazer download
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename.replace('.csv', '.xlsx'))
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      showToast.success('Relatório gerado', `${filename.replace('.csv', '.xlsx')} exportado com sucesso!`)
    } catch (error) {
      console.error('Erro ao gerar Excel:', error)
      showToast.error('Erro ao gerar Excel', 'Tente novamente ou use o formato CSV')
      // Fallback para CSV
      downloadCSV(filename, [])
    }
  }

  const handleExport = (type: 'finance' | 'registrations' | 'status') => {
    switch (type) {
      case 'finance':
        downloadCSV('meca-relatorio-financeiro.csv', [
          ['Indicador', 'Valor'],
          ['Receita (mês atual)', formatCurrency(revenueThisMonth)],
          ['Receita (último mês)', formatCurrency(totalRevenueLastMonth)],
          ['Comissão MECA (último mês)', formatCurrency(mecaCommissionLastMonth)],
          ['Taxa MECA vigente', formatPercent(metrics?.meca_fee_percentage ?? null)],
          ['Agendamentos (último mês)', totalBookingsLastMonth],
        ])
        break
      case 'registrations':
        downloadCSV('meca-cadastros.csv', [
          ['Mês', 'Novos clientes', 'Novas oficinas'],
          ...registrationsSeries.map((item) => [item.month, item.clientes, item.oficinas]),
          ['TOTAL', totalRegistrations.clientes, totalRegistrations.oficinas],
        ])
        break
      case 'status':
        downloadCSV('meca-oficinas-status.csv', [
          ['Status', 'Quantidade'],
          ...oficinasStatusList.map((item) => [item.status, item.total]),
        ])
        break
      default:
        break
    }
  }

  const handleDownloadWorkshopReport = async () => {
    if (useCustomPeriod && (!reportStartDate || !reportEndDate)) {
      showToast.warning('Período inválido', 'Selecione as datas de início e fim')
      return
    }

    if (!useCustomPeriod && (!reportMonth || !reportYear)) {
      showToast.warning('Mês/Ano inválido', 'Selecione o mês e ano para o relatório')
      return
    }

    setDownloadingReport(true)
    const loadingToast = showToast.loading('Gerando relatório detalhado...')
    
    try {
      const params: any = {}
      
      if (useCustomPeriod) {
        params.start_date = reportStartDate
        params.end_date = reportEndDate
      } else {
        params.month = reportMonth
        params.year = reportYear
      }
      
      if (selectedWorkshopId) {
        params.workshop_id = selectedWorkshopId
      }

      const { data: response, error } = await apiClient.getWorkshopsMonthlyReport(params)

      showToast.dismiss(loadingToast)

      if (error || !response || (typeof response === 'object' && !('data' in response)) || (typeof response === 'object' && 'data' in response && !response.data)) {
        showToast.error('Erro ao gerar relatório', error || 'Não foi possível gerar o relatório')
        setDownloadingReport(false)
        return
      }

      const reportData = (response as any)?.data
      const workshopsData = reportData?.workshops || []
      const period = reportData?.period || {}
      const summary = reportData?.summary || {}
      const services = reportData?.services || []
      const servicesByWorkshop = reportData?.services_by_workshop || {}

      if (workshopsData.length === 0) {
        showToast.warning('Sem dados', 'Não há dados disponíveis para o período selecionado')
        setDownloadingReport(false)
        return
      }

      // Preparar dados detalhados para CSV com design melhorado
      const csvRows: Array<Array<string | number>> = [
        // Cabeçalho do Relatório
        ['════════════════════════════════════════════════════════════════════════════════'],
        ['                    RELATÓRIO DETALHADO DE OFICINAS - MECA'],
        ['════════════════════════════════════════════════════════════════════════════════'],
        [],
        ['INFORMAÇÕES DO RELATÓRIO'],
        ['Período:', `${period.start_date || ''} até ${period.end_date || ''}`],
        ['Gerado em:', new Date().toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })],
        ['Total de Oficinas Analisadas:', summary.total_workshops || 0],
        [],
        ['════════════════════════════════════════════════════════════════════════════════'],
        ['                            RESUMO EXECUTIVO'],
        ['════════════════════════════════════════════════════════════════════════════════'],
        [],
        ['MÉTRICAS FINANCEIRAS', ''],
        ['Receita Bruta Total', formatCurrency(summary.total_receita_bruta || 0)],
        ['Valor Líquido Total', formatCurrency(summary.total_valor_liquido || 0)],
        ['Taxa MECA Total', formatCurrency(summary.total_taxa_meca || 0)],
        ['Taxa PagBank Total', formatCurrency(summary.total_taxa_pagbank || 0)],
        ['Ticket Médio Geral', formatCurrency(summary.media_ticket_medio || 0)],
        [],
        ['MÉTRICAS OPERACIONAIS', ''],
        ['Total de Serviços', summary.total_servicos || 0],
        ['Serviços Concluídos', summary.total_servicos_concluidos || 0],
        ['Serviços Pendentes', (summary.total_servicos || 0) - (summary.total_servicos_concluidos || 0) - (summary.total_cancelamentos || 0)],
        ['Cancelamentos', summary.total_cancelamentos || 0],
        ['Taxa de Conclusão', `${summary.taxa_conclusao_geral?.toFixed(2) || '0.00'}%`],
        ['Total de Pagamentos Aprovados', summary.total_pagamentos_aprovados || 0],
        [],
        ['════════════════════════════════════════════════════════════════════════════════'],
        ['                    DETALHAMENTO POR OFICINA'],
        ['════════════════════════════════════════════════════════════════════════════════'],
        [],
        // Cabeçalho da tabela de oficinas (agrupado logicamente)
        [
          'Nome da Oficina',
          'Status',
          'CNPJ',
          'Contato (Email)',
          'Telefone',
          'Endereço',
          '',
          'TOTAL SERVIÇOS',
          'Concluídos',
          'Pendentes',
          'Em Andamento',
          'Cancelados',
          'Taxa Conclusão %',
          'Taxa Cancelamento %',
          '',
          'RECEITA BRUTA',
          'VALOR LÍQUIDO',
          'Ticket Médio Serviço',
          'Ticket Médio Pagamento',
          '',
          'TAXAS',
          'Taxa MECA',
          'Taxa PagBank',
          '',
          'PAGAMENTOS',
          'Aprovados',
          'Pendentes',
          'Falhados',
          '',
          'PERÍODO DE ATIVIDADE',
          'Primeiro Serviço',
          'Último Serviço',
          'Primeiro Pagamento',
          'Último Pagamento',
          '',
          'ID Técnico'
        ],
        ...workshopsData.map((w: any) => [
          w.workshop_name || 'N/A',
          formatStatus(w.workshop_status || ''),
          w.workshop_cnpj || 'Não informado',
          w.workshop_email || 'Não informado',
          w.workshop_phone || 'Não informado',
          w.workshop_address || 'Não informado',
          '',
          w.total_servicos || 0,
          w.servicos_concluidos || 0,
          w.servicos_pendentes || 0,
          w.servicos_em_andamento || 0,
          w.cancelamentos || 0,
          `${w.taxa_conclusao_percent?.toFixed(2) || '0.00'}%`,
          `${w.taxa_cancelamento_percent?.toFixed(2) || '0.00'}%`,
          '',
          formatCurrency(w.receita_bruta || 0),
          formatCurrency(w.valor_liquido || 0),
          formatCurrency(w.ticket_medio_servico || 0),
          formatCurrency(w.ticket_medio_pagamento || 0),
          '',
          formatCurrency(w.taxa_meca || 0),
          formatCurrency(w.taxa_pagbank || 0),
          '',
          w.pagamentos_aprovados || 0,
          w.pagamentos_pendentes || 0,
          w.pagamentos_falhados || 0,
          '',
          w.primeiro_servico ? new Date(w.primeiro_servico).toLocaleDateString('pt-BR') : 'N/A',
          w.ultimo_servico ? new Date(w.ultimo_servico).toLocaleDateString('pt-BR') : 'N/A',
          w.primeiro_pagamento ? new Date(w.primeiro_pagamento).toLocaleDateString('pt-BR') : 'N/A',
          w.ultimo_pagamento ? new Date(w.ultimo_pagamento).toLocaleDateString('pt-BR') : 'N/A',
          '',
          w.workshop_id || ''
        ]),
        [],
        ['════════════════════════════════════════════════════════════════════════════════'],
        ['                                 FIM DO RELATÓRIO'],
        ['════════════════════════════════════════════════════════════════════════════════']
      ]

      const workshopName = selectedWorkshopId 
        ? workshopsData[0]?.workshop_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'oficina'
        : 'todas-oficinas'
      
      const periodStr = useCustomPeriod
        ? `${reportStartDate}_${reportEndDate}`
        : `${reportYear || new Date().getFullYear()}${reportMonth ? `-${reportMonth.padStart(2, '0')}` : ''}`
      
      const filename = `meca-relatorio-${workshopName}-${periodStr}.xlsx`

      // Gerar Excel formatado e colorido
      await downloadExcel(filename, {
        period,
        summary,
        workshops: workshopsData,
        services,
        services_by_workshop: servicesByWorkshop
      })
    } catch (err) {
      showToast.dismiss(loadingToast)
      showToast.error('Erro ao gerar relatório', 'Ocorreu um erro inesperado')
      console.error('Erro ao gerar relatório:', err)
    }

    setDownloadingReport(false)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  if (loading) {
    return <Loading message="Carregando relatórios..." size={200} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-10"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00c977] to-[#00b369] rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#252940] dark:text-white">Relatórios</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Consolidação financeira e operacional do marketplace MECA.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-[#00c977]" />
                Clientes
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-[#2563eb]" />
                Oficinas
              </div>
            </div>
          </div>
        </motion.div>

        {/* Highlights */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Receita (este mês)"
            value={formatCurrency(revenueThisMonth)}
            icon={<DollarSign className="w-5 h-5 text-white" />}
            accent="from-[#00c977] to-[#00b369]"
          />
          <StatCard
            title="Comissão MECA (último mês)"
            value={formatCurrency(mecaCommissionLastMonth)}
            icon={<TrendingUp className="w-5 h-5 text-white" />}
            accent="from-[#252940] to-[#1B1D2E]"
          />
          <StatCard
            title="Agendamentos (último mês)"
            value={totalBookingsLastMonth.toString()}
            icon={<Calendar className="w-5 h-5 text-white" />}
            accent="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Taxa MECA vigente"
            value={formatPercent(metrics?.meca_fee_percentage ?? null)}
            icon={<Percent className="w-5 h-5 text-white" />}
            accent="from-purple-500 to-purple-600"
          />
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PanelCard
            title="Evolução de cadastros"
            description="Volume mensal de novos clientes e oficinas (últimos meses)."
          >
            {registrationsSeries.length === 0 ? (
              <EmptyState message="Ainda não há histórico de cadastros suficientes para montar o gráfico." />
            ) : (
              <div className="space-y-4">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={registrationsSeries} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorClientes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00c977" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#00c977" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOficinas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-gray-700" />
                      <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} stroke="#94a3b8" tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: 12,
                          border: '1px solid #1e293b',
                          color: '#f8fafc',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area type="monotone" name="Clientes" dataKey="clientes" stroke="#00c977" fill="url(#colorClientes)" strokeWidth={2} />
                      <Area type="monotone" name="Oficinas" dataKey="oficinas" stroke="#2563eb" fill="url(#colorOficinas)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 flex items-center justify-between">
                    <span>Total de clientes</span>
                    <strong className="text-[#00c977] dark:text-[#4ade80]">{totalRegistrations.clientes}</strong>
                  </div>
                  <div className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 flex items-center justify-between">
                    <span>Total de oficinas</span>
                    <strong className="text-[#2563eb] dark:text-[#60a5fa]">{totalRegistrations.oficinas}</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleExport('registrations')}
                  className="inline-flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-[#252940] to-[#1B1D2E] text-white hover:from-[#1B1D2E] hover:to-[#252940] transition-all duration-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar CSV de cadastros
                </button>
              </div>
            )}
          </PanelCard>

          <PanelCard
            title="Resumo de cadastros recentes"
            description="Indicadores para acompanhar crescimento da base nas últimas janelas." 
          >
            <div className="grid grid-cols-1 gap-3">
              <QuickReportCard
                title="Clientes este mês"
                value={customerRegistrations.length > 0 ? customerRegistrations[customerRegistrations.length - 1].value : 0}
                description="Novos clientes no mês corrente."
              />
              <QuickReportCard
                title="Oficinas este mês"
                value={workshopRegistrations.length > 0 ? workshopRegistrations[workshopRegistrations.length - 1].value : 0}
                description="Novas oficinas com cadastro completo."
              />
              <QuickReportCard
                title="Clientes nesta semana"
                value={metrics?.customers_this_week || 0}
                description="Usuários finalizando cadastro nos últimos 7 dias."
              />
              <QuickReportCard
                title="Oficinas aprovadas nesta semana"
                value={metrics?.workshops_this_week || 0}
                description="Oficinas validadas e habilitadas para operar."
              />
            </div>
          </PanelCard>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickReportCard
            title="Clientes cadastrados"
            value={metrics?.total_customers || 0}
            description="Clientes com conta ativa na plataforma."
          />
          <QuickReportCard
            title="Oficinas cadastradas"
            value={metrics?.total_oficinas || 0}
            description="Oficinas com cadastro concluído."
          />
          <QuickReportCard
            title="Clientes ativos"
            value={metrics?.active_customers || 0}
            description="Clientes que interagiram nos últimos 30 dias."
          />
          <QuickReportCard
            title="Oficinas ativas"
            value={metrics?.active_workshops || 0}
            description="Oficinas operando com PagBank sincronizado."
          />
        </motion.div>

        {/* Relatório Detalhado de Oficinas */}
        <motion.div variants={itemVariants}>
          <PanelCard
            title="Relatório Detalhado de Oficinas"
            description="Gere relatórios completos com métricas financeiras e operacionais por oficina e período."
          >
            <div className="space-y-6">
              {/* Seletor de Oficina */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Selecionar Oficina
                </label>
                <select
                  value={selectedWorkshopId}
                  onChange={(e) => setSelectedWorkshopId(e.target.value)}
                  disabled={loadingWorkshops}
                  className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00c977] focus:border-transparent transition-all"
                >
                  <option value="">Todas as oficinas</option>
                  {workshops.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggle Período */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tipo de Período</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Escolha entre período customizado ou mês/ano específico
                  </p>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Mês/Ano</span>
                  <input
                    type="checkbox"
                    checked={useCustomPeriod}
                    onChange={(e) => setUseCustomPeriod(e.target.checked)}
                    className="w-12 h-6 rounded-full appearance-none bg-gray-300 dark:bg-gray-600 relative transition-colors checked:bg-[#00c977] cursor-pointer before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:shadow-md before:transition-transform before:translate-x-0.5 before:translate-y-0.5 checked:before:translate-x-6"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Customizado</span>
                </label>
              </div>

              {/* Período: Mês/Ano ou Datas Customizadas */}
              {useCustomPeriod ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Data Início
                    </label>
                    <input
                      type="date"
                      value={reportStartDate}
                      onChange={(e) => setReportStartDate(e.target.value)}
                      max={reportEndDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00c977] focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Data Fim
                    </label>
                    <input
                      type="date"
                      value={reportEndDate}
                      onChange={(e) => setReportEndDate(e.target.value)}
                      min={reportStartDate}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00c977] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Mês
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={reportMonth}
                      onChange={(e) => setReportMonth(e.target.value)}
                      placeholder="MM (1-12)"
                      className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00c977] focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Ano
                    </label>
                    <input
                      type="number"
                      min="2020"
                      max={new Date().getFullYear() + 1}
                      value={reportYear}
                      onChange={(e) => setReportYear(e.target.value)}
                      placeholder="AAAA"
                      className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00c977] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Botão de Download */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadWorkshopReport}
                disabled={downloadingReport || loadingWorkshops}
                className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#00c977] to-[#00b369] hover:from-[#00b369] hover:to-[#00a05a] text-white rounded-xl font-semibold text-base transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingReport ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Gerando relatório...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Gerar Relatório CSV Detalhado
                  </>
                )}
              </motion.button>

              {/* Info */}
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>💡 Dica:</strong> O relatório inclui métricas completas como receita, serviços, cancelamentos, taxas MECA e PagBank, ticket médio e muito mais.
                </p>
              </div>
            </div>
          </PanelCard>
        </motion.div>
      </motion.div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  accent,
}: {
  title: string
  value: string
  icon: ReactNode
  accent: string
}) {
  return (
    <div className="bg-white/90 dark:bg-gray-800/85 backdrop-blur-xl rounded-2xl p-6 md:p-7 border border-white/40 dark:border-gray-700/40 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 bg-gradient-to-br ${accent} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-[#252940] dark:text-white">{value}</p>
    </div>
  )
}

function PanelCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="bg-white/90 dark:bg-gray-800/85 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/40 dark:border-gray-700/40 shadow-lg space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#252940] dark:text-white">{title}</h2>
        {description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function QuickReportCard({
  title,
  value,
  description,
}: {
  title: string
  value: number
  description: string
}) {
  return (
    <div className="bg-white/85 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 md:p-6 border border-white/40 dark:border-gray-700/40 shadow-lg">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
        {title}
      </h3>
      <p className="text-2xl font-bold text-[#252940] dark:text-white mb-2">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-500 dark:text-gray-400">
      {message}
    </div>
  )
}
