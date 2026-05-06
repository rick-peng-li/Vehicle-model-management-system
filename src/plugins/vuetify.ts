// Styles
import '@mdi/font/css/materialdesignicons.css'
// @ts-ignore
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { zhHans } from 'vuetify/locale'

export default createVuetify({
  components,
  directives,
  locale: {
    locale: 'zhHans',
    messages: { zhHans },
  },
  defaults: {
    global: {
      ripple: false,
    },
    VCard: {
      elevation: 0,
      border: true,
      rounded: 'lg',
    },
    VBtn: {
      rounded: 'lg',
      variant: 'flat',
      height: 40,
      class: 'text-none font-weight-regular',
    },
    VTextField: {
      variant: 'outlined',
      color: 'primary',
      density: 'comfortable',
      rounded: 'lg',
    },
    VSelect: {
      variant: 'outlined',
      color: 'primary',
      density: 'comfortable',
      rounded: 'lg',
    },
    VAutocomplete: {
      variant: 'outlined',
      color: 'primary',
      density: 'comfortable',
      rounded: 'lg',
    },
    VCombobox: {
      variant: 'outlined',
      color: 'primary',
      density: 'comfortable',
      rounded: 'lg',
    },
    VTextarea: {
      variant: 'outlined',
      color: 'primary',
      density: 'comfortable',
      rounded: 'lg',
    },
    VNavigationDrawer: {
      elevation: 0,
      border: 'e',
    },
    VAppBar: {
      elevation: 0,
      border: 'b',
    },
    VDataTable: {
      density: 'comfortable',
    },
    VDataTableServer: {
      density: 'comfortable',
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          background: '#f5f5f5', // Ant Design light background
          surface: '#ffffff',
          primary: '#1677ff', // Ant Design Blue
          secondary: '#8c8c8c',
          error: '#ff4d4f',
          info: '#1677ff',
          success: '#52c41a',
          warning: '#faad14',
        },
      },
      dark: {
        dark: true,
        colors: {
          background: '#141414', // Ant Design dark background
          surface: '#1f1f1f',
          primary: '#1668dc', // Ant Design Dark Blue
          secondary: '#8c8c8c',
          error: '#d32029',
          info: '#1668dc',
          success: '#49aa19',
          warning: '#d89614',
        },
      },
    },
  },
})
