export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - The Financial Express',
    title: 'Home',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'Admin panel for the financial expresss website.',
      },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Runtime config: https://go.nuxtjs.dev/nuxt-config
  publicRuntimeConfig: {
    appName: process.env.APP_NAME,
    apiUrl: process.env.API_URL,
    apiBaseUrl: process.env.API_BASE_URL,
    googleRecaptchaSiteKey: process.env.GOOGLE_RECAPTCHA_SITE_KEY,
    tinyMceApiKey: process.env.TINYMCE_API_KEY,
    opEdCategories: process.env.OP_ED_CATEGORIES,
  },

  // Router config: https://go.nuxtjs.dev/nuxt-config
  router: {
    middleware: ['auth'],
  },

  // Loading config: https://go.nuxtjs.dev/nuxt-config
  loading: { color: '#fff', height: '4px' },

  // Loading Indicator config: https://go.nuxtjs.dev/nuxt-config
  loadingIndicator: {
    name: 'rectangle-bounce',
    color: '#fff',
    background: '#3C4C5D',
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    // app custom style
    '~/assets/style/theme.scss',
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    // filters
    '@/plugins/filters',
    // vee-validate
    '@/plugins/vee-validate',
    // vue toasted
    '@/plugins/toast',
    // v-video-embed
    '@/plugins/v-video-embed.client',
    // dark, light system
    '@/plugins/theme-detect.client',
    '@/plugins/helpers',
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: [
    '~/components/',
    '~/components/buttons',
    '~/components/filters',
    '~/components/forms',
    '~/components/headers',
    '~/components/widgets',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    // https://go.nuxtjs.dev/auth
    '@nuxtjs/auth-next',
  ],

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    debug: process.env.NODE_ENV !== 'production',
    credentials: true,
  },

  // https://go.nuxtjs.dev/auth
  auth: {
    redirect: {
      login: '/auth/login',
      logout: '/auth/login',
      callback: '/auth/login',
      home: '/',
    },
    strategies: {
      local: {
        endpoints: {
          login: { url: '/auth/token', method: 'post' },
          logout: { url: '/auth/logout-by-token', method: 'post' },
          user: { url: '/auth/me', method: 'get' },
        },
        token: {
          property: false,
          maxAge: 604800,
        },
      },
      laravelSanctum: {
        provider: 'laravel/sanctum',
        url: process.env.API_BASE_URL,
        endpoints: {
          login: {
            url: process.env.API_BASE_URL + '/api/auth/login',
          },
          logout: {
            url: process.env.API_BASE_URL + '/api/auth/logout',
          },
          user: {
            url: process.env.API_BASE_URL + '/api/auth/me',
          },
        },
      },
    },
    plugins: ['@/plugins/directives'],
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    optionsPath: './vuetify.options.js',
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      name: process.env.APP_NAME,
      background_color: '#58C6E2',
      theme_color: '#58C6E2',
    },
    meta: {
      theme_color: '#58C6E2',
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
  server: {
    port: 4200,
  },
};
