<template>
  <div id="reporterEntry">
    <v-container fluid>
      <v-row justify="space-between" class="ma-0 py-3">
        <h3>{{ formTitle }}</h3>
        <b-language v-model="language" />
      </v-row>
      <v-row>
        <v-col>
          <validation-observer
            ref="form"
            v-slot="{ handleSubmit, invalid, reset }"
          >
            <v-form
              @submit.prevent="handleSubmit(onSubmit)"
              @reset.prevent="reset"
            >
              <v-card>
                <v-container>
                  <v-row>
                    <v-col cols="12" md="6">
                      <b-text
                        v-model="reporter.name"
                        rules="required|min:3"
                        outlined
                        prepend-icon="mdi-account"
                        label="Name"
                        vid="name"
                        @blur="checkUsername"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <b-text
                        v-model="reporter.email"
                        rules="required|email"
                        outlined
                        prepend-icon="mdi-email"
                        label="Email"
                        vid="email"
                      />
                    </v-col>
                  </v-row>
                </v-container>
                <v-container>
                  <v-row>
                    <v-col cols="12" md="6">
                      <b-text
                        v-model="reporter.mobile"
                        outlined
                        prepend-icon="mdi-phone"
                        label="Mobile"
                        vid="mobile"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <b-text
                        v-model="reporter.username"
                        outlined
                        prepend-icon="mdi-label"
                        label="Username"
                        vid="username"
                      />
                    </v-col>
                  </v-row>
                </v-container>
                <v-container>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-file-input
                        v-model="reporter.image"
                        label="Avatar"
                        outlined
                        prepend-icon="mdi-camera"
                      ></v-file-input>
                    </v-col>
                  </v-row>
                </v-container>
                <active-inactive v-model="reporter.status" />
                <action-button
                  :loading="loading"
                  :error="invalid"
                  :title="formTitle"
                />
              </v-card>
            </v-form>
          </validation-observer>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'ReporterEntry',
  data() {
    return {
      language: 'en',
      show: false,
      loading: false,
      reporter: {
        name: '',
        email: '',
        username: '',
        mobile: '',
        email_verified_at: true,
        status: true,
      },
      roles: [],
    };
  },
  computed: {
    formTitle() {
      return this.$route.query.id ? 'Update Reporter' : 'Create Reporter';
    },
    passwordRequired() {
      return !!this.$route.query.id;
    },
    name() {
      return `${this.reporter.first_name} ${this.reporter.last_name}`;
    },
  },
  async mounted() {
    await this.getReporter();
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  methods: {
    // get reporter
    async getReporter() {
      try {
        // get reporter if reporter is edit mode
        const ReporterId = this.$route.query.id;
        if (ReporterId) {
          const { data } = await this.$axios.$get(
            `${this.language}/reporter/${ReporterId}`
          );
          this.reporter = data;
        }
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    onSubmit() {
      let url;
      let method;
      const reporterId = this.$route.query.id;
      if (reporterId) {
        url = `${this.language}/reporter/${reporterId}`;
        method = 'PATCH';
        this.update(url, method);
      } else {
        url = `${this.language}/reporter`;
        method = 'POST';
        this.update(url, method);
      }
    },
    async update(url, method) {
      this.loading = true;
      try {
        const formData = new FormData();
        formData.append('_method', method);
        Object.keys(this.reporter).forEach((key) => {
          if (this.reporter[key]) {
            formData.append(key, this.reporter[key]);
          }
        });
        const { message } = await this.$axios.$post(url, formData);

        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/reporters',
        });
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
    // check username
    async checkUsername() {
      try {
        const { username } = await this.$axios.$get(
          `${this.language}/reporter-username/${encodeURIComponent(
            this.reporter.name
          )}`
        );
        this.reporter.username = username;
      } catch (e) {
        this.reporter.username = null;
      }
    },
  },
};
</script>
