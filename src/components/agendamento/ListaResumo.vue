<script setup lang="ts">
/*
 * Pares rótulo e valor num <dl> (revisão e confirmação). Cada par fica num <div>, o que o HTML
 * permite dentro de <dl>. Na tela estreita o valor vai embaixo do rótulo; na larga, ao lado.
 */
export interface ItemResumo {
  rotulo: string
  valor: string
}

defineProps<{ itens: ItemResumo[] }>()
</script>

<template>
  <dl class="lista-resumo">
    <div v-for="item in itens" :key="item.rotulo" class="lista-resumo__linha">
      <dt class="lista-resumo__rotulo">{{ item.rotulo }}</dt>
      <dd class="lista-resumo__valor">{{ item.valor }}</dd>
    </div>
  </dl>
</template>

<style scoped>
.lista-resumo {
  margin: 0 0 var(--espaco-6);
  border-top: 0.0625rem solid var(--cor-separador);
}

.lista-resumo__linha {
  padding-block: var(--espaco-2);
  border-bottom: 0.0625rem solid var(--cor-separador);
}

.lista-resumo__rotulo {
  font-weight: 700;
}

.lista-resumo__valor {
  margin: 0;
}

/* Base em rem: com texto em 200% a coluna do rótulo cresce junto e não aperta o valor. */
@media (min-width: 40em) {
  .lista-resumo__linha {
    display: grid;
    grid-template-columns: minmax(8rem, 1fr) 2fr;
    gap: var(--espaco-4);
  }
}
</style>
