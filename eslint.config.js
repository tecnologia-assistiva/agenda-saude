import pluginVue from 'eslint-plugin-vue'
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility'
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

export default withVueTs(
  { ignores: ['dist/**', 'coverage/**', 'playwright-report/**', 'test-results/**'] },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  pluginVueA11y.configs['flat/recommended'],
  // Formatação não é papel do lint aqui; ficam só as regras de erro e de boas práticas.
  pluginVue.configs['no-layout-rules'],
  {
    rules: {
      // Rótulo envolvendo o campo OU ligado por id: os dois são válidos em HTML.
      'vuejs-accessibility/label-has-for': ['error', { required: { some: ['nesting', 'id'] } }],
      'vue/multi-word-component-names': 'off',
    },
  },
)
