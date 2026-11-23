import {
  createRouter,
  createWebHistory,
  type RouteComponent,
  type RouteRecordRaw,
  type RouterHistory,
  type RouterScrollBehavior,
} from 'vue-router'
import InicioView from '@/views/InicioView.vue'
import { instalarFocoNaTrocaDeRota } from './foco-rota'
import { ETAPAS, caminhoDaPrimeiraEtapaIncompleta, instalarGuardasDoAgendamento, tituloDaEtapa } from './etapas'

declare module 'vue-router' {
  interface RouteMeta {
    /** Título da página; o <title> fica "titulo – Agenda Saúde". */
    titulo: string
    /** Número da etapa do agendamento (1 a 5). */
    etapa?: number
  }
}

const EtapaPendenteView = () => import('@/views/agendar/EtapaPendenteView.vue')

/** Tela de cada etapa. As etapas 4 e 5 ganham a tela própria na etapa 4 do projeto. */
const TELAS_DAS_ETAPAS: Record<number, () => Promise<RouteComponent>> = {
  1: () => import('@/views/agendar/EtapaDadosView.vue'),
  2: () => import('@/views/agendar/EtapaAtendimentoView.vue'),
  3: () => import('@/views/agendar/EtapaDataHorarioView.vue'),
  4: EtapaPendenteView,
  5: EtapaPendenteView,
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
