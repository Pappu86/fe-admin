<template>
  <div id="tagEntry">
    <v-container fluid>
      <v-row justify="space-between" class="ma-0 py-3">
        <h3>{{ formTitle }}</h3>
        <b-language v-model="language" />
      </v-row>
      <v-row>
        <v-col>
          <validation-observer v-slot="{ handleSubmit, invalid, reset }">
            <v-form
              ref="form"
              @submit.prevent="handleSubmit(updateTag)"
              @reset.prevent="reset"
            >
              <v-card>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="tag.name"
                        rules="required"
                        outlined
                        label="Name"
                        vid="name"
                        @blur="checkSlug"
                      />
                      <b-text
                        v-model="tag.slug"
                        rules="required"
                        outlined
                        label="Slug"
                        vid="slug"
                      />
                      <v-subheader>Pick a Color</v-subheader>
                      <v-text-field
                        v-model="tag.color"
                        readonly
                        hide-details
                        class="ma-0 pa-0"
                        solo
                      >
                        <template #append>
                          <v-menu
                            v-model="menu"
                            left
                            offset-x
                            :close-on-content-click="false"
                          >
                            <template #activator="{ on }">
                              <div :style="swatchStyle" v-on="on" />
                            </template>
                            <v-card>
                              <v-card-text class="pa-0">
                                <v-color-picker v-model="tag.color" flat />
                              </v-card-text>
                            </v-card>
                          </v-menu>
                        </template>
                      </v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="tag.meta_title"
                        outlined
                        label="Meta Title"
                        vid="meta_title"
                      />
                      <b-text-area
                        v-model="tag.meta_description"
                        outlined
                        label="Meta Description"
                        vid="meta_description"
                      />
                      <v-subheader>Meta Image</v-subheader>
                      <image-uploader v-model="tag.meta_image" />
                    </v-col>
                  </v-row>
                </v-card-text>
                <active-inactive v-model="tag.status" />
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
  name: 'TagEntry',
  data() {
    return {
      menu: false,
      loading: false,
      language: 'en',
      defaultTag: {
        name: '',
        slug: '',
        color: '#000000',
        meta_title: '',
        meta_description: '',
        status: true,
        meta_image: null,
      },
      tag: Object.assign({}, this.defaultTag),
      tags: [],
    };
  },
  computed: {
    formTitle() {
      return this.$route.query.edit === 'true' ? 'Update Tag' : 'Update Tag';
    },
    swatchStyle() {
      const { menu } = this;
      const { color } = this.tag;
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
      await this.getTag();
    },
  },
  async mounted() {
    await this.getTag();
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  methods: {
    async updateTag() {
      this.loading = true;
      try {
        const formData = new FormData();
        formData.append('_method', 'PATCH');
        Object.keys(this.tag).forEach((key) => {
          if (this.tag[key]) {
            formData.append(key, this.tag[key]);
          }
        });
        const { message } = await this.$axios.$post(
          `${this.language}/tag/${this.$route.params.id}`,
          formData
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/common/tags',
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
    // get tag for edit
    async getTag() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/tag/${this.$route.params.id}`
        );
        this.tag = data;
      } catch (e) {
        Object.assign(this.tag, this.defaultTag);
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // check slug
    async checkSlug() {
      try {
        const { slug } = await this.$axios.$get(
          `${this.language}/tag-slug/${encodeURIComponent(this.tag.name)}`
        );
        this.tag.slug = slug;
      } catch (e) {
        this.tag.slug = null;
      }
    },
  },
};
</script>
