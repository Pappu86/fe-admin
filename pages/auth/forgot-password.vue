<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-col cols="12" md="6">
        <v-card class="elevation-2 pa-3">
          <validation-observer ref="form" v-slot="{ handleSubmit, reset }">
            <v-form
              @submit.prevent="handleSubmit(onSubmit)"
              @reset.prevent="reset"
            >
              <v-card-title class="justify-center">
                Forgot Password
              </v-card-title>
              <v-divider />
              <v-card-text>
                <b-text
                  v-model="email"
                  rules="required|email"
                  prepend-icon="mdi-email"
                  label="Email"
                  vid="email"
                  type="email"
                  required
                />
                <p class="text-right ma-0">
                  <nuxt-link
                    class="primary--text text-capitalize"
                    to="/auth/login"
                  >
                    Back to login page
                  </nuxt-link>
                </p>
              </v-card-text>
              <v-card-actions>
                <vue-recaptcha
                  ref="recaptcha"
                  size="invisible"
                  :sitekey="site_key"
                  @verify="onCaptchaVerified"
                  @expired="onCaptchaExpired"
                />
                <v-spacer />
                <v-btn :loading="loading" color="primary" type="submit">
                  Send Password Reset Link
                </v-btn>
              </v-card-actions>
            </v-form>
          </validation-observer>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import VueRecaptcha from 'vue-recaptcha';

export default {
  name: 'ForgotPassword',
  components: { VueRecaptcha },
  layout: 'auth',
  auth: false,
  data() {
    return {
      email: '',
      loading: false,
      site_key: this.$config.googleRecaptchaSiteKey,
    };
  },
  head() {
    return {
      script: [
        {
          src: 'https://www.google.com/recaptcha/api.js?onload=vueRecaptchaApiLoaded&render=explicit',
          id: 'google-recaptch',
          hid: 'google-recaptch',
        },
      ],
    };
  },
  methods: {
    async onSubmit() {
      await this.$refs.recaptcha.execute();
    },
    // captch verified
    async onCaptchaVerified() {
      await this.$refs.recaptcha.reset();
      await this.sendEmail();
    },
    // catch expired
    async onCaptchaExpired() {
      await this.$refs.recaptcha.reset();
    },
    async sendEmail() {
      this.loading = true;
      try {
        const { message } = await this.$axios.$post(`auth/forgot-password`, {
          email: this.email,
        });
        this.loading = false;
        this.$router.replace('/auth/login');
        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
      } catch (err) {
        this.loading = false;
        if (err.response.status === 422) {
          const { errors } = err.response.data;
          this.$refs.form.setErrors(errors);
        } else {
          this.$store.commit(
            'APP_NETWORK_ERROR',
            err.response && err.response.data.message
          );
        }
      }
    },
  },
};
</script>
