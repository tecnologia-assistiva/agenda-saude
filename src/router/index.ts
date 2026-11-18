import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type RouterHistory,
  type RouterScrollBehavior,
} from 'vue-router'
import InicioView from '@/views/InicioView.vue'
import { instalarFocoNaTrocaDeRota } from './foco-rota'

declare module 'vue-router' {
  interface RouteMeta {
    /** Título da página; o <title> fica "titulo – Agenda Saúde". */
    titulo: string
    /** Número da etapa do agendamento (1 a 5). */
    etapa?: number
  }
}

export const rotas: RouteRecordRaw[] = [
  { path: '/', name: 'inicio', component: InicioView, meta: { titulo: 'Início' } },
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
  instalarFocoNaTrocaDeRota(router)
  return router
}
