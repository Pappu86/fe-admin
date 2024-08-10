<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="6" md="6">
        <v-card class="elevation-2 pa-3">
          <validation-observer ref="form" v-slot="{ handleSubmit, reset }">
            <v-form
              @submit.prevent="handleSubmit(onSubmit)"
              @reset.prevent="reset"
            >
              <v-card-title class="justify-center">
                Reset Password
              </v-card-title>
              <v-divider />
              <v-card-text>
                <b-email
                  v-model="user.email"
                  rules="required|email"
                  prepend-icon="mdi-email"
                  label="Email"
                  vid="email"
                  required
                />
                <validation-provider
                  v-slot="{ errors, valid, dirty }"
                  name="Password"
                  rules="required|min:8"
                  vid="password"
                >
                  <v-text-field
                    v-model="user.password"
                    :append-icon="show ? 'mdi-eye-off' : 'mdi-eye'"
                    :type="show ? 'text' : 'password'"
                    prepend-icon="mdi-lock"
                    :error-messages="errors"
                    :success="valid && dirty"
                    label="Password"
                    @click:append="show = !show"
                  />
                </validation-provider>
                <validation-provider
                  v-slot="{ errors, valid, dirty }"
                  name="Confirm Password"
                  rules="confirmed:password"
                >
                  <v-text-field
                    v-model="user.password_confirmation"
                    :append-icon="show ? 'mdi-eye-off' : 'mdi-eye'"
                    :type="show ? 'text' : 'password'"
                    prepend-icon="mdi-lock"
                    :error-messages="errors"
                    :success="valid && dirty"
                    label="Confirm Password"
                    @click:append="show = !show"
                  />
                </validation-provider>
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
                  Reset Password
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
  name: 'ResetPassword',
  components: { VueRecaptcha },
  layout: 'auth',
  auth: false,
  data() {
    return {
      user: {
        email: '',
        password: '',
        password_confirmation: '',
        token: this.$route.params.token || '',
      },
      loading: false,
      show: false,
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
      await this.resetPassword();
    },
    // catch expired
    async onCaptchaExpired() {
      await this.$refs.recaptcha.reset();
    },
    // reset password
    async resetPassword() {
      this.loading = true;
      try {
        const { message } = await this.$axios.$post(
          `auth/reset-password`,
          this.user
        );
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
