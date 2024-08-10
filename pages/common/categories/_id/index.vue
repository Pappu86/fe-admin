<template>
  <div id="categoryEntry">
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
              @submit.prevent="handleSubmit(updateCategory)"
              @reset.prevent="reset"
            >
              <v-card>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="category.name"
                        rules="required"
                        outlined
                        label="Name"
                        vid="name"
                        @blur="checkSlug"
                      />
                      <b-text
                        v-model="category.slug"
                        rules="required"
                        outlined
                        label="Slug"
                        vid="slug"
                      />
                      <b-auto-complete
                        v-model="category.parent_id"
                        :items="categories"
                        outlined
                        label="Select Parent Category"
                        item-text="name"
                        item-value="id"
                        vid="parent_id"
                      />
                      <v-subheader>Pick a Color</v-subheader>
                      <v-text-field
                        v-model="category.color"
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
                                <v-color-picker v-model="category.color" flat />
                              </v-card-text>
                            </v-card>
                          </v-menu>
                        </template>
                      </v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="category.meta_title"
                        outlined
                        label="Meta Title"
                        vid="meta_title"
                      />
                      <b-text-area
                        v-model="category.meta_description"
                        outlined
                        label="Meta Description"
                        vid="meta_description"
                      />
                      <v-subheader>Meta Image</v-subheader>
                      <image-uploader v-model="category.meta_image" />
                    </v-col>
                  </v-row>
                </v-card-text>
                <active-inactive v-model="category.status" />
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
  name: 'CategoryEntry',
  data() {
    return {
      menu: false,
      loading: false,
      language: 'en',
      defaultCategory: {
        name: '',
        slug: '',
        color: '#000000',
        meta_title: '',
        meta_description: '',
        status: true,
        meta_image: null,
      },
      category: Object.assign({}, this.defaultCategory),
      categories: [],
    };
  },
  computed: {
    formTitle() {
      return this.$route.query.edit === 'true'
        ? 'Update Category'
        : 'Update Category';
    },
    swatchStyle() {
      const { menu } = this;
      const { color } = this.category;
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
      await this.getCategories();
      await this.getCategory();
    },
  },
  async mounted() {
    await this.getCategories();
    await this.getCategory();
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  methods: {
    async updateCategory() {
      this.loading = true;
      try {
        const formData = new FormData();
        formData.append('_method', 'PATCH');
        Object.keys(this.category).forEach((key) => {
          if (this.category[key]) {
            formData.append(key, this.category[key]);
          }
        });
        const { message } = await this.$axios.$post(
          `${this.language}/category/${this.$route.params.id}`,
          formData
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/common/categories',
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
    // get category for edit
    async getCategory() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/category/${this.$route.params.id}`
        );
        this.category = data;
      } catch (e) {
        Object.assign(this.category, this.defaultCategory);
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // get categories
    async getCategories() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/categories?category=${this.$route.params.id}`
        );
        this.categories = data;
      } catch (e) {
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
          `${this.language}/category-slug/${encodeURIComponent(
            this.category.name
          )}`
        );
        this.category.slug = slug;
      } catch (e) {
        this.category.slug = null;
      }
    },
  },
};
</script>
