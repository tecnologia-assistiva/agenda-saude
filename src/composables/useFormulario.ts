import { computed, ref } from 'vue'
import { definirTituloDocumento } from '@/router/foco-rota'
import type { ErroDoResumo } from '@/components/formulario/ResumoErros.vue'

/*
 * Validação ao enviar (nunca a cada tecla). Com erro: preenche `erros` (mensagem ao lado de cada
 * campo), monta a lista do resumo na ordem dos campos, soma uma `tentativa` (o ResumoErros recebe o
 * foco) e coloca "Erro: " no começo do <title>.
 */

export interface CampoDoFormulario<C extends string> {
  chave: C
  /** id do input ou do fieldset, para o link do resumo. */
  id: string
}

export function useFormulario<C extends string>(opcoes: {
  campos: CampoDoFormulario<C>[]
  validar: () => Partial<Record<C, string>>
  titulo: () => string
}) {
  const erros = ref<Partial<Record<C, string>>>({})
  const tentativa = ref(0)

  const listaErros = computed<ErroDoResumo[]>(() =>
    opcoes.campos.flatMap((campo) => {
      const mensagem = (erros.value as Partial<Record<C, string>>)[campo.chave]
      return mensagem ? [{ id: campo.id, mensagem }] : []
    }),
  )

  /** Valida tudo. Devolve true se pode seguir. */
  function validarAoEnviar(): boolean {
    erros.value = opcoes.validar()
    tentativa.value += 1
    const valido = listaErros.value.length === 0
    definirTituloDocumento(opcoes.titulo(), { erro: !valido })
    return valido
  }

  return { erros, listaErros, tentativa, validarAoEnviar }
}
