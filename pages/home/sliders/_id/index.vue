<template>
  <div id="sliderEntry">
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
              @submit.prevent="handleSubmit(updateSlider)"
              @reset.prevent="reset"
            >
              <v-card>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="slider.title"
                        rules="required"
                        outlined
                        label="Title"
                        vid="title"
                      />
                      <b-text
                        v-model="slider.link"
                        outlined
                        label="Link"
                        vid="link"
                      />
                      <v-radio-group v-model="slider.type" row>
                        <v-radio label="Image" value="image" />
                        <v-radio label="Video" value="video" />
                        <v-radio label="Iframe" value="iframe" />
                      </v-radio-group>
                      <v-divider />
                      <v-row>
                        <v-col>
                          <v-subheader>Active or Inactive</v-subheader>
                          <v-divider />
                          <active-inactive v-model="slider.status" />
                        </v-col>
                        <v-col>
                          <v-subheader>External Link</v-subheader>
                          <v-divider />
                          <b-switch
                            v-model="slider.is_external"
                            :label="slider.is_external ? 'Yes' : 'No'"
                          />
                        </v-col>
                      </v-row>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <div v-if="slider.type === 'image'">
                        <image-uploader v-model="slider.image" />
                      </div>
                      <div v-if="slider.type === 'video'">
                        <video-uploader v-model="slider.video" />
                      </div>
                      <div v-if="slider.type === 'iframe'">
                        <b-text-area
                          v-model="slider.content"
                          rules="required"
                          outlined
                          rows="10"
                          label="Iframe Script"
                          vid="content"
                        />
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
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
  name: 'SliderEntry',
  data() {
    return {
      menu: false,
      loading: false,
      language: 'en',
      defaultSlider: {
        title: '',
        subtitle: '',
        type: 'image',
        content: null,
        link: '',
        is_external: false,
        status: true,
      },
      slider: Object.assign({}, this.defaultSlider),
    };
  },
  computed: {
    formTitle() {
      return this.$route.query.edit === 'true'
        ? 'Update Slider'
        : 'Update Slider';
    },
  },
  watch: {
    async language() {
      await this.getSlider();
    },
  },
  async mounted() {
    await this.getSlider();
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  methods: {
    async updateSlider() {
      this.loading = true;
      try {
        const formData = new FormData();
        formData.append('_method', 'PATCH');
        if (!(this.slider.image instanceof File)) {
          delete this.slider.image;
        }
        if (!(this.slider.video instanceof File)) {
          delete this.slider.video;
        }
        Object.keys(this.slider).forEach((key) => {
          if (this.slider[key]) {
            formData.append(key, this.slider[key]);
          }
        });

        const { message } = await this.$axios.$post(
          `${this.language}/slider/${this.$route.params.id}`,
          formData
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/home/sliders',
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
    // get slider for edit
    async getSlider() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/slider/${this.$route.params.id}`
        );
        this.slider = data;
        if (data.type === 'image') {
          this.slider.image = data.content;
          this.slider.content = null;
        } else if (data.type === 'video') {
          this.slider.video = data.content;
          this.slider.content = null;
        } else {
          this.slider.content = data.content;
        }
      } catch (e) {
        Object.assign(this.slider, this.defaultSlider);
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
  },
};
</script>
