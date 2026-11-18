<script setup lang="ts">
/*
 * Configurações de acessibilidade. Cada mudança vale na hora (store → atributos no <html>),
 * fica salva no localStorage e, para tema e tamanho do texto, é anunciada na região de status.
 * As caixas de seleção não precisam de anúncio: o leitor já fala "marcado" / "não marcado".
 */
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAnunciador } from '@/composables/useAnunciador'
import {
  NOMES_TEMA,
  TAMANHOS_TEXTO,
  useConfiguracoesStore,
  type TamanhoTexto,
  type Tema,
} from '@/stores/configuracoes'
import GrupoOpcoes, { type Opcao } from '@/components/formulario/GrupoOpcoes.vue'
import TituloPagina from '@/components/comum/TituloPagina.vue'
import DicaExtra from '@/components/comum/DicaExtra.vue'

const configuracoes = useConfiguracoesStore()
const { anunciar, alertar } = useAnunciador()

const opcoesTema: Opcao<Tema>[] = [
  { valor: 'claro', rotulo: 'Claro' },
  { valor: 'escuro', rotulo: 'Escuro' },
  { valor: 'alto-contraste', rotulo: 'Alto contraste (preto e amarelo)' },
]

const opcoesTamanho: Opcao<TamanhoTexto>[] = TAMANHOS_TEXTO.map((valor) => ({
  valor,
  rotulo: valor === 100 ? '100% (padrão)' : `${valor}%`,
}))

const tema = computed<Tema>({
  get: () => configuracoes.tema,
  set: (novo) => {
    configuracoes.tema = novo
    anunciar(`Tema ${NOMES_TEMA[novo]} aplicado.`)
  },
})

const tamanhoTexto = computed<TamanhoTexto>({
  get: () => configuracoes.tamanhoTexto,
  set: (novo) => {
    configuracoes.tamanhoTexto = novo
    anunciar(`Texto em ${novo}%.`)
  },
})

function restaurar() {
  configuracoes.restaurarPadrao()
  anunciar('Configurações iniciais restauradas.')
}

// Falha ao salvar é o único caso de alerta aqui: a pessoa perderia as escolhas ao fechar a página.
watch(
  () => configuracoes.salvamentoFalhou,
  (falhou) => {
    if (falhou) {
      alertar('Não foi possível salvar as configurações neste navegador. Elas valem até você fechar a página.')
    }
  },
)

// O Vue Router guarda no histórico de onde a pessoa veio; serve para o link "Voltar".
const paginaAnterior = (() => {
  const anterior = useRouter().options.history.state?.back
  return typeof anterior === 'string' && !anterior.startsWith('/configuracoes') ? anterior : null
})()
</script>

<template>
  <div class="configuracoes coluna-leitura">
    <TituloPagina>Configurações de acessibilidade</TituloPagina>
    <p>As mudanças valem na hora e ficam salvas neste navegador.</p>
    <DicaExtra>na primeira visita, o site usa as preferências do seu aparelho.</DicaExtra>

    <p v-if="configuracoes.salvamentoFalhou" class="texto-atencao">
      Atenção: seu navegador não deixou salvar as configurações. Elas valem até você fechar esta página.
    </p>

    <GrupoOpcoes v-model="tema" legenda="Cores" nome="tema" :nivel-titulo="2" :opcoes="opcoesTema" />

    <GrupoOpcoes
      v-model="tamanhoTexto"
      legenda="Tamanho do texto"
      nome="tamanho-texto"
      :nivel-titulo="2"
      :opcoes="opcoesTamanho"
      em-linha
    />

    <fieldset>
      <legend><h2>Leitura</h2></legend>
      <div class="lista-opcoes">
        <label class="opcao">
          <input v-model="configuracoes.espacamentoAmpliado" type="checkbox" />
          <span class="opcao__texto">Mais espaço entre linhas e letras</span>
        </label>
        <label class="opcao">
          <input v-model="configuracoes.fonteLegivel" type="checkbox" />
          <span class="opcao__texto">Fonte mais fácil de ler (Atkinson Hyperlegible)</span>
        </label>
        <label class="opcao">
          <input v-model="configuracoes.dicasExtras" type="checkbox" />
          <span class="opcao__texto">
            <span>Mostrar dicas extras</span>
            <span class="opcao__descricao">Explicações a mais em cada tela.</span>
          </span>
        </label>
      </div>
    </fieldset>

    <fieldset>
      <legend><h2>Movimento</h2></legend>
      <div class="lista-opcoes">
        <label class="opcao">
          <input v-model="configuracoes.reduzirMovimento" type="checkbox" />
          <span class="opcao__texto">Reduzir animações</span>
        </label>
      </div>
    </fieldset>

    <p class="configuracoes__acoes">
      <button type="button" class="botao botao--secundario" @click="restaurar">
        Restaurar configurações iniciais
      </button>
    </p>

    <p v-if="paginaAnterior">
      <RouterLink :to="paginaAnterior">Voltar para a página anterior</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.configuracoes fieldset {
  margin-top: var(--espaco-6);
}

.configuracoes__acoes {
  margin-top: var(--espaco-6);
}
</style>
