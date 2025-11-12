'use client'

import { useEffect, useRef } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function OnboardingTour() {
  const driverObj = useRef<any>(null)

  useEffect(() => {
    // Verificar se já foi mostrado o onboard
    const hasSeenOnboard = localStorage.getItem('meca_admin_onboard_seen')
    
    if (hasSeenOnboard === 'true') {
      return
    }

    // Função para marcar como visto e fechar
    const markAsSeenAndClose = () => {
      localStorage.setItem('meca_admin_onboard_seen', 'true')
      if (driverObj.current) {
        try {
          driverObj.current.destroy()
        } catch (e) {
          console.error('Erro ao fechar tour:', e)
        }
      }
    }

    // Adicionar estilos customizados para tema escuro
    const style = document.createElement('style')
    style.setAttribute('data-driver-custom', 'true')
    style.textContent = `
      .driver-popover {
        background: #1f2937 !important;
        border: 1px solid #374151 !important;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
      }
      .driver-popover-title {
        color: #ffffff !important;
        font-weight: 600 !important;
      }
      .driver-popover-description {
        color: #d1d5db !important;
      }
      .driver-popover-footer {
        border-top: 1px solid #374151 !important;
      }
      .driver-popover-btn {
        background: #00c977 !important;
        color: #ffffff !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 8px 16px !important;
        font-weight: 500 !important;
        transition: all 0.2s !important;
        cursor: pointer !important;
      }
      .driver-popover-btn:hover {
        background: #00b369 !important;
        transform: translateY(-1px) !important;
      }
      .driver-popover-btn:active {
        transform: translateY(0) !important;
      }
      .driver-popover-close-btn {
        color: #9ca3af !important;
        font-size: 20px !important;
        transition: all 0.2s !important;
        cursor: pointer !important;
      }
      .driver-popover-close-btn:hover {
        color: #ffffff !important;
        transform: scale(1.1) !important;
      }
      .driver-popover-progress-item {
        background: #374151 !important;
      }
      .driver-popover-progress-item-active {
        background: #00c977 !important;
      }
      .driver-popover-arrow-side-left .driver-popover-arrow {
        border-left-color: #1f2937 !important;
      }
      .driver-popover-arrow-side-right .driver-popover-arrow {
        border-right-color: #1f2937 !important;
      }
      .driver-popover-arrow-side-top .driver-popover-arrow {
        border-top-color: #1f2937 !important;
      }
      .driver-popover-arrow-side-bottom .driver-popover-arrow {
        border-bottom-color: #1f2937 !important;
      }
      .driver-overlay {
        cursor: pointer !important;
      }
    `
    document.head.appendChild(style)

    // Configurar Driver.js
    driverObj.current = driver({
      showProgress: true,
      allowClose: true,
      overlayColor: 'rgba(0, 0, 0, 0.85)',
      popoverClass: 'driver-popover-custom',
      doneBtnText: 'Concluir',
      nextBtnText: 'Próximo',
      prevBtnText: 'Anterior',
      steps: [
        {
          element: '[data-onboard="sidebar"]',
          popover: {
            title: 'Bem-vindo ao MECA Admin! 🎉',
            description: 'Esta é a barra lateral de navegação. Use-a para acessar todas as funcionalidades do painel administrativo.',
            side: 'right',
            align: 'start',
          }
        },
        {
          element: '[data-onboard="dashboard"]',
          popover: {
            title: 'Dashboard',
            description: 'Aqui você pode acompanhar as principais métricas do marketplace em tempo real.',
            side: 'bottom',
            align: 'start',
          }
        },
        {
          element: '[data-onboard="workshops"]',
          popover: {
            title: 'Gerenciar Oficinas',
            description: 'Aprove ou rejeite novas oficinas, edite informações e gerencie o cadastro.',
            side: 'bottom',
            align: 'start',
          }
        },
        {
          element: '[data-onboard="services"]',
          popover: {
            title: 'Serviços',
            description: 'Gerencie o catálogo de serviços base da plataforma. Crie, edite e remova serviços.',
            side: 'bottom',
            align: 'start',
          }
        },
        {
          element: '[data-onboard="notifications"]',
          popover: {
            title: 'Notificações',
            description: 'Envie notificações para usuários, grupos específicos ou toda a plataforma.',
            side: 'bottom',
            align: 'start',
          }
        },
        {
          element: '[data-onboard="users"]',
          popover: {
            title: 'Usuários',
            description: 'Visualize e gerencie todos os clientes e proprietários de oficinas cadastrados.',
            side: 'bottom',
            align: 'start',
          }
        },
        {
          element: '[data-onboard="reports"]',
          popover: {
            title: 'Relatórios',
            description: 'Gere relatórios detalhados sobre vendas, oficinas, usuários e muito mais.',
            side: 'bottom',
            align: 'start',
          }
        },
        {
          element: '[data-onboard="api-status"]',
          popover: {
            title: 'Status da API',
            description: 'Monitore o status dos endpoints da API e teste a conectividade.',
            side: 'bottom',
            align: 'start',
          }
        },
        {
          element: '[data-onboard="profile"]',
          popover: {
            title: 'Perfil',
            description: 'Gerencie suas informações pessoais e altere sua senha.',
            side: 'bottom',
            align: 'start',
          }
        },
        {
          element: '[data-onboard="theme-toggle"]',
          popover: {
            title: 'Tema',
            description: 'Alterne entre tema claro e escuro para uma experiência personalizada.',
            side: 'top',
            align: 'center',
          }
        },
      ],
      onDestroyStarted: () => {
        markAsSeenAndClose()
      },
      onDestroyed: () => {
        markAsSeenAndClose()
      },
      onHighlightStarted: (element) => {
        // Garantir que o elemento está visível
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }, 100)
        }
      },
    })

    // Função para adicionar listeners de fechamento
    const addCloseListeners = () => {
      // Adicionar listener no botão de fechar (X)
      const closeBtns = document.querySelectorAll('.driver-popover-close-btn')
      closeBtns.forEach((closeBtn) => {
        closeBtn.removeEventListener('click', markAsSeenAndClose)
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          markAsSeenAndClose()
        }, { once: true })
      })

      // Adicionar listener no botão "Concluir"
      const doneBtns = document.querySelectorAll('.driver-popover-btn')
      doneBtns.forEach((doneBtn) => {
        if (doneBtn.textContent?.includes('Concluir') || doneBtn.textContent?.includes('Done')) {
          doneBtn.removeEventListener('click', markAsSeenAndClose)
          doneBtn.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            markAsSeenAndClose()
          }, { once: true })
        }
      })

      // Adicionar listener no overlay (clicar fora)
      const overlay = document.querySelector('.driver-overlay')
      if (overlay) {
        overlay.removeEventListener('click', markAsSeenAndClose)
        overlay.addEventListener('click', (e) => {
          // Só fechar se clicar diretamente no overlay, não no popover
          if (e.target === overlay) {
            markAsSeenAndClose()
          }
        }, { once: true })
      }
    }

    // Observar mudanças no DOM para adicionar listeners quando os botões aparecerem
    const observer = new MutationObserver(() => {
      addCloseListeners()
    })

    // Iniciar o tour após um pequeno delay
    const timer = setTimeout(() => {
      if (driverObj.current) {
        driverObj.current.drive()
        
        // Observar mudanças no body para capturar quando os botões aparecerem
        observer.observe(document.body, {
          childList: true,
          subtree: true
        })

        // Tentar adicionar listeners imediatamente e repetidamente
        const intervalId = setInterval(() => {
          addCloseListeners()
        }, 100)

        // Parar o intervalo após 5 segundos
        setTimeout(() => {
          clearInterval(intervalId)
        }, 5000)

        // Adicionar listeners após um delay inicial
        setTimeout(addCloseListeners, 500)
      }
    }, 1000)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
      if (driverObj.current) {
        try {
          driverObj.current.destroy()
        } catch (e) {
          // Ignorar erros ao destruir
        }
      }
      // Remover estilos customizados ao desmontar
      const customStyle = document.querySelector('style[data-driver-custom]')
      if (customStyle) {
        customStyle.remove()
      }
    }
  }, [])

  return null
}

