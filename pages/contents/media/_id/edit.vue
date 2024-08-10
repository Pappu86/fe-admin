<template>
  <div id="mediaEntry">
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
              @submit.prevent="handleSubmit(updateMedia)"
              @reset.prevent="reset"
            >
              <v-card>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="media.title"
                        rules="required|max:180"
                        outlined
                        label="Title"
                        vid="title"
                        :counter="180"
                      />
                      <b-text-area
                        v-model="media.subtitle"
                        rules="max:255"
                        outlined
                        label="Subtitle"
                        vid="subtitle"
                        :counter="255"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <DatePicker
                        v-if="loaded"
                        v-model="range"
                        mode="dateTime"
                        is-range
                        :is-dark="$vuetify.theme.dark"
                        @input="getDateRange"
                      >
                        <template #default="{ inputValue, inputEvents }">
                          <v-subheader>Start and End Date</v-subheader>
                          <v-divider />
                          <div
                            class="
                              date-picker
                              v-input
                              v-text-field
                              v-text-field--single-line
                              v-text-field--solo
                              v-text-field--is-booted
                              v-text-field--enclosed
                              v-text-field--placeholder
                            "
                          >
                            <div class="v-input__control">
                              <div class="v-input__slot">
                                <div class="v-text-field__slot">
                                  <input
                                    :value="`${inputValue.start} ~ ${inputValue.end}`"
                                    type="text"
                                    readonly
                                    placeholder="Start Date and End Date"
                                    v-on="inputEvents.start"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </template>
                      </DatePicker>

                      <v-row>
                        <v-col cols="12" md="6">
                          <v-subheader>Active or Inactive</v-subheader>
                          <v-divider />
                          <active-inactive v-model="media.status" />
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-subheader>Featured</v-subheader>
                          <v-divider />
                          <v-checkbox
                            v-model="media.featured"
                            label="Is Featured?"
                            color="primary"
                          />
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-subheader>Embeded Script</v-subheader>
                      <b-text-area
                        v-model="media.content"
                        rules="required|start_with:<iframe"
                        outlined
                        label="Content"
                        vid="content"
                        rows="12"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-subheader>Thumnail Image</v-subheader>
                      <image-uploader v-model="media.image" />
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
import DatePicker from 'v-calendar/lib/components/date-picker.umd';

export default {
  name: 'MediaEntry',

  components: { DatePicker },
  data() {
    return {
      menu: false,
      loading: false,
      loaded: false,
      language: 'en',
      range: {
        start: new Date(),
        end: new Date(),
      },
      defaultMedia: {
        title: '',
        subtitle: '',
        content: '',
        start_at: new Date().toISOString(),
        end_at: new Date().toISOString(),
        status: true,
        featured: false,
        image: null,
      },
      media: Object.assign({}, this.defaultMedia),
    };
  },
  computed: {
    formTitle() {
      return this.$route.query.edit === 'true'
        ? 'Update Media'
        : 'Update Media';
    },
    swatchStyle() {
      const { menu } = this;
      const { color } = this.media;
      return {
        backgroundColor: color,
        cursor: 'pointer',
        height: '30px',
        width: '30px',
        borderRadius: menu ? '50%' : '4px',
        transition: 'border-radius 200ms ease-in-out',
      };
    },
  },
  watch: {
    async language() {
      await this.getMedia();
    },
  },
  async mounted() {
    await this.getMedia();
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  methods: {
    getDateRange({ start, end }) {
      if (start) this.media.start_at = start.toISOString();
      if (end) this.media.end_at = end.toISOString();
    },
    async updateMedia() {
      this.loading = true;
      try {
        const formData = new FormData();
        formData.append('_method', 'PATCH');
        Object.keys(this.media).forEach((key) => {
          if (this.media[key]) {
            formData.append(key, this.media[key]);
          }
        });
        const { message } = await this.$axios.$post(
          `${this.language}/live-media/${this.$route.params.id}`,
          formData
        );
        this.$store.dispatch('crud_success', {
          message,
          path: '/contents/media',
        });
      } catch (err) {
        if (err.response.status === 422) {
          const { errors } = err.response.data;
          this.$refs.form.setErrors(errors);
        } else {
          this.$store.commit(
            'APP_NETWORK_ERROR',
            err.response && err.response.data.message
          );
        }
      } finally {
        this.loading = false;
      }
    },
    // get media for edit
    async getMedia() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/live-media/${this.$route.params.id}`
        );
        this.media = data;
        if (this.media.start_at) {
          this.range.start = this.media.start_at;
        } else {
          this.media.start_at = new Date().toISOString()
        }
        if (this.media.end_at) {
          this.range.end = this.media.end_at;
        } else {
          this.media.end_at = new Date().toISOString()
        }
      } catch (e) {
        Object.assign(this.media, this.defaultMedia);
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      } finally {
        this.loaded = true;
      }
    },
  },
};
</script>
