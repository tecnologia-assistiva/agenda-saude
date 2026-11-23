import pluginVue from 'eslint-plugin-vue'
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility'
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

export default withVueTs(
  { ignores: ['dist/**', 'coverage/**', 'playwright-report/**', 'test-results/**'] },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  pluginVueA11y.configs['flat/recommended'],
  pluginVue.configs['no-layout-rules'],
  {
    rules: {
      'vuejs-accessibility/label-has-for': ['error', { required: { some: ['nesting', 'id'] } }],
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    files: ['src/components/layout/BarraAcessibilidade.vue'],
    rules: {
      'vuejs-accessibility/no-access-key': 'off',
    },
  },
)