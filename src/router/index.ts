import {
  createRouter,
  createWebHistory,
  type RouteComponent,
  type RouteRecordRaw,
  type RouterHistory,
  type RouterScrollBehavior,
} from 'vue-router'
import InicioView from '@/views/InicioView.vue'
import { useAgendamentoStore } from '@/stores/agendamento'
import { useConsultasStore } from '@/stores/consultas'
import { instalarFocoNaTrocaDeRota } from './foco-rota'
import { ETAPAS, caminhoDaPrimeiraEtapaIncompleta, etapa, instalarGuardasDoAgendamento, tituloDaEtapa } from './etapas'

declare module 'vue-router' {
  interface RouteMeta {
    /** Título da página; o <title> fica "titulo – Agenda Saúde". */
    titulo: string
    /** Número da etapa do agendamento (1 a 5). */
    etapa?: number
  }
}

const MinhasConsultasView = () => import('@/views/MinhasConsultasView.vue')

const TELAS_DAS_ETAPAS: Record<number, () => Promise<RouteComponent>> = {
  1: () => import('@/views/agendar/EtapaDadosView.vue'),
  2: () => import('@/views/agendar/EtapaAtendimentoView.vue'),
  3: () => import('@/views/agendar/EtapaDataHorarioView.vue'),
  4: () => import('@/views/agendar/EtapaRevisaoView.vue'),
  5: () => import('@/views/agendar/EtapaConfirmacaoView.vue'),
}

export const rotas: RouteRecordRaw[] = [
  { path: '/', name: 'inicio', component: InicioView, meta: { titulo: 'Início' } },
  {
    path: '/agendar',
    component: () => import('@/views/AgendarLayout.vue'),
    children: [
      // "/agendar" sozinho leva à primeira etapa que falta completar.
      { path: '', name: 'agendar', redirect: () => caminhoDaPrimeiraEtapaIncompleta() },
      ...ETAPAS.map((e) => ({
        path: e.caminho.replace('/agendar/', ''),
        component: TELAS_DAS_ETAPAS[e.numero] as () => Promise<RouteComponent>,
        meta: { titulo: tituloDaEtapa(e.numero), etapa: e.numero },
      })),
    ],
  },
  { path: '/minhas-consultas', name: 'minhas-consultas', component: MinhasConsultasView, meta: { titulo: 'Minhas consultas' } },
  {
    // "Remarcar" é um link para cá: carrega a consulta no rascunho (mesmo protocolo) e abre a etapa 3,
    // com as etapas 1 e 2 já prontas (WCAG 3.3.7). A tela nunca aparece: a guarda sempre redireciona.
    path: '/minhas-consultas/remarcar/:protocolo',
    name: 'remarcar',
    component: MinhasConsultasView,
    meta: { titulo: 'Minhas consultas' },
    beforeEnter: (para) => {
      const consulta = useConsultasStore().buscar(String(para.params.protocolo))
      if (!consulta) return { name: 'minhas-consultas' }
      useAgendamentoStore().carregarConsulta(consulta)
      return etapa(3).caminho
    },
  },
  {
    path: '/configuracoes',
    name: 'configuracoes',
    component: () => import('@/views/ConfiguracoesView.vue'),
    meta: { titulo: 'Configurações de acessibilidade' },
  },
  {
    path: '/acessibilidade',
    name: 'acessibilidade',
    component: () => import('@/views/AcessibilidadeView.vue'),
    meta: { titulo: 'Sobre a acessibilidade' },
  },
  {
    path: '/:caminho(.*)*',
    name: 'nao-encontrada',
    component: () => import('@/views/NaoEncontradaView.vue'),
    meta: { titulo: 'Página não encontrada' },
  },
]

const rolagem: RouterScrollBehavior = (para, de, posicaoSalva) => {
  if (posicaoSalva) return posicaoSalva
  // Links de pulo (#conteudo, #menu, #rodape): o navegador já rolou e focou o destino.
  if (para.path === de.path && para.hash) return false
  return { top: 0 }
}

export function criarRouter(historico: RouterHistory = createWebHistory(import.meta.env.BASE_URL)) {
  const router = createRouter({ history: historico, routes: rotas, scrollBehavior: rolagem })
  instalarGuardasDoAgendamento(router)
  instalarFocoNaTrocaDeRota(router)
  return router
}
