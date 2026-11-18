import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { lerDados, salvarDados } from '@/servicos/armazenamento'

/*
 * Preferências de acessibilidade. Ficam salvas no localStorage e viram atributos no <html>:
 * data-tema, data-espacamento, data-fonte, data-movimento e o font-size (tamanho do texto).
 * O script do index.html faz o mesmo antes da primeira pintura; manter os dois em sincronia.
 */

export const TEMAS = ['claro', 'escuro', 'alto-contraste'] as const
export type Tema = (typeof TEMAS)[number]

export const TAMANHOS_TEXTO = [100, 125, 150, 175, 200] as const
export type TamanhoTexto = (typeof TAMANHOS_TEXTO)[number]

export const NOMES_TEMA: Record<Tema, string> = {
  claro: 'claro',
  escuro: 'escuro',
  'alto-contraste': 'alto contraste',
}

export interface Preferencias {
  tema: Tema
  tamanhoTexto: TamanhoTexto
  espacamentoAmpliado: boolean
  fonteLegivel: boolean
  reduzirMovimento: boolean
  dicasExtras: boolean
}

export const CHAVE_CONFIGURACOES = 'configuracoes'

function consultarMidia(consulta: string): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(consulta).matches
}

function temaDoSistemaSemAltoContraste(): Tema {
  return consultarMidia('(prefers-color-scheme: dark)') ? 'escuro' : 'claro'
}

/** Valores da primeira visita: vêm de prefers-contrast, prefers-color-scheme e prefers-reduced-motion. */
export function preferenciasDoSistema(): Preferencias {
  return {
    tema: consultarMidia('(prefers-contrast: more)') ? 'alto-contraste' : temaDoSistemaSemAltoContraste(),
    tamanhoTexto: 100,
    espacamentoAmpliado: false,
    fonteLegivel: false,
    reduzirMovimento: consultarMidia('(prefers-reduced-motion: reduce)'),
    dicasExtras: false,
  }
}

/** Aceita dados salvos; um campo inválido volta ao valor do sistema, sem descartar os outros. */
export function validarPreferencias(dados: unknown): Preferencias | null {
  if (typeof dados !== 'object' || dados === null) return null
  const d = dados as Record<string, unknown>
  const padrao = preferenciasDoSistema()
  const booleano = (valor: unknown, reserva: boolean) => (typeof valor === 'boolean' ? valor : reserva)
  return {
    tema: TEMAS.includes(d.tema as Tema) ? (d.tema as Tema) : padrao.tema,
    tamanhoTexto: TAMANHOS_TEXTO.includes(d.tamanhoTexto as TamanhoTexto)
      ? (d.tamanhoTexto as TamanhoTexto)
      : padrao.tamanhoTexto,
    espacamentoAmpliado: booleano(d.espacamentoAmpliado, padrao.espacamentoAmpliado),
    fonteLegivel: booleano(d.fonteLegivel, padrao.fonteLegivel),
    reduzirMovimento: booleano(d.reduzirMovimento, padrao.reduzirMovimento),
    dicasExtras: booleano(d.dicasExtras, padrao.dicasExtras),
  }
}

export function aplicarPreferencias(p: Preferencias, raiz: HTMLElement = document.documentElement): void {
  raiz.dataset.tema = p.tema
  raiz.dataset.espacamento = p.espacamentoAmpliado ? 'ampliado' : 'padrao'
  raiz.dataset.fonte = p.fonteLegivel ? 'legivel' : 'padrao'
  raiz.dataset.movimento = p.reduzirMovimento ? 'reduzido' : 'padrao'
  raiz.style.fontSize = p.tamanhoTexto === 100 ? '' : `${p.tamanhoTexto}%`
}

export const useConfiguracoesStore = defineStore('configuracoes', () => {
  const inicial = lerDados(CHAVE_CONFIGURACOES, validarPreferencias) ?? preferenciasDoSistema()

  const tema = ref<Tema>(inicial.tema)
  const tamanhoTexto = ref<TamanhoTexto>(inicial.tamanhoTexto)
  const espacamentoAmpliado = ref(inicial.espacamentoAmpliado)
  const fonteLegivel = ref(inicial.fonteLegivel)
  const reduzirMovimento = ref(inicial.reduzirMovimento)
  const dicasExtras = ref(inicial.dicasExtras)
  /** true quando o navegador não deixou salvar: a tela de configurações avisa. */
  const salvamentoFalhou = ref(false)

  const preferencias = computed<Preferencias>(() => ({
    tema: tema.value,
    tamanhoTexto: tamanhoTexto.value,
    espacamentoAmpliado: espacamentoAmpliado.value,
    fonteLegivel: fonteLegivel.value,
    reduzirMovimento: reduzirMovimento.value,
    dicasExtras: dicasExtras.value,
  }))

  // Aplica já na carga. Só salva quando a pessoa muda algo: enquanto isso, segue o sistema.
  aplicarPreferencias(preferencias.value)
  watch(
    preferencias,
    (p) => {
      aplicarPreferencias(p)
      salvamentoFalhou.value = !salvarDados(CHAVE_CONFIGURACOES, p)
    },
    { flush: 'sync' },
  )

  let temaAntesDoAltoContraste: Tema | null = null

  /** Botão "Alto contraste" da barra eMAG: liga, ou volta ao tema que estava antes. */
  function alternarAltoContraste(): void {
    if (tema.value === 'alto-contraste') {
      tema.value = temaAntesDoAltoContraste ?? temaDoSistemaSemAltoContraste()
      temaAntesDoAltoContraste = null
    } else {
      temaAntesDoAltoContraste = tema.value
      tema.value = 'alto-contraste'
    }
  }

  function restaurarPadrao(): void {
    const p = preferenciasDoSistema()
    tema.value = p.tema
    tamanhoTexto.value = p.tamanhoTexto
    espacamentoAmpliado.value = p.espacamentoAmpliado
    fonteLegivel.value = p.fonteLegivel
    reduzirMovimento.value = p.reduzirMovimento
    dicasExtras.value = p.dicasExtras
    temaAntesDoAltoContraste = null
  }

  return {
    tema,
    tamanhoTexto,
    espacamentoAmpliado,
    fonteLegivel,
    reduzirMovimento,
    dicasExtras,
    salvamentoFalhou,
    preferencias,
    alternarAltoContraste,
    restaurarPadrao,
  }
})
