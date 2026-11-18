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

const configuracoes = useConfiguracoesStore()
const { anunciar, alertar } = useAnunciador()

const opcoesTema: Opcao<Tema>[] = [
  { valor: 'claro', rotulo: 'Claro', descricao: 'Fundo branco e letras escuras.' },
  {
    valor: 'escuro',
    rotulo: 'Escuro',
    descricao: 'Fundo escuro e letras claras. Cansa menos a vista com pouca luz.',
  },
  {
    valor: 'alto-contraste',
    rotulo: 'Alto contraste',
    descricao: 'Fundo preto e letras amarelas. Ajuda quem enxerga pouco.',
  },
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
    <p>
      Mude como o site aparece para você. As mudanças valem na hora e ficam salvas neste navegador. Na
      primeira visita, usamos as preferências do seu aparelho.
    </p>

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
      instrucao="Com o texto maior, a página fica mais comprida. Role a tela para ver tudo."
      em-linha
    />

    <fieldset>
      <legend><h2>Leitura e movimento</h2></legend>
      <div class="lista-opcoes">
        <label class="opcao">
          <input v-model="configuracoes.espacamentoAmpliado" type="checkbox" />
          <span class="opcao__texto">
            <span class="opcao__rotulo">Aumentar o espaço entre linhas e letras</span>
            <span class="opcao__descricao">Deixa o texto mais arejado e fácil de acompanhar.</span>
          </span>
        </label>
        <label class="opcao">
          <input v-model="configuracoes.fonteLegivel" type="checkbox" />
          <span class="opcao__texto">
            <span class="opcao__rotulo">Usar uma fonte mais fácil de ler</span>
            <span class="opcao__descricao">
              A fonte Atkinson Hyperlegible diferencia letras parecidas, como I, l e 1.
            </span>
          </span>
        </label>
        <label class="opcao">
          <input v-model="configuracoes.reduzirMovimento" type="checkbox" />
          <span class="opcao__texto">
            <span class="opcao__rotulo">Reduzir animações</span>
            <span class="opcao__descricao">Tira os movimentos e as transições da tela.</span>
          </span>
        </label>
        <label class="opcao">
          <input v-model="configuracoes.dicasExtras" type="checkbox" />
          <span class="opcao__texto">
            <span class="opcao__rotulo">Mostrar dicas extras</span>
            <span class="opcao__descricao">Mostra textos de ajuda a mais em cada etapa do agendamento.</span>
          </span>
        </label>
      </div>
    </fieldset>

    <h2>Voltar ao padrão</h2>
    <p>Volta para as cores e opções do seu aparelho.</p>
    <p>
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
  margin-top: var(--espaco-7);
}
</style>
