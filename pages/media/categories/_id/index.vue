<template>
  <div id="assetCategoryEntry">
    <v-container grid-list-xl fluid>
      <v-row justify="space-between" class="ma-0 py-3">
        <h3>{{ formTitle }}</h3>
      </v-row>
      <v-row>
        <v-col>
          <validation-observer v-slot="{ handleSubmit, invalid, reset }">
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
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <b-auto-complete
                        v-model="category.parent_id"
                        :items="categories"
                        outlined
                        label="Select Parent Category"
                        item-text="name"
                        item-value="id"
                        vid="parent_id"
                      />
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
  name: 'AssetCategoryEntry',
  data() {
    return {
      dialog: false,
      loading: false,
      category: {
        id: 0,
        name: '',
        status: true,
      },
      default: {
        id: 0,
        name: '',
        status: 'true',
      },
      dailog_type: null,
      categories: [],
    };
  },
  computed: {
    formTitle() {
      return this.$route.query.edit === 'true'
        ? 'Edit Category'
        : 'Update Category';
    },
  },
  async mounted() {
    await this.getCategory();
    await this.getCategories();
  },
  methods: {
    async updateCategory() {
      this.loading = true;
      try {
        const { message } = await this.$axios.$patch(
          `asset/category/${this.$route.params.id}`,
          this.category
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/media/categories',
        });
      } catch (err) {
        this.loading = false;
        if (err.response.status === 422) {
          const { errors } = err.response.data;
          const fields = Object.values(errors);
          for (let i = 0; i < fields.length; i++) {
            for (let j = 0; j < fields[i].length; j++) {
              this.$toasted.global.form_error(fields[i][j]);
            }
          }
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
          `asset/category/${this.$route.params.id}`
        );
        this.category = data;
      } catch (e) {
        Object.assign(this.category, this.default);
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // get categories to set parent category
    async getCategories() {
      try {
        const { data } = await this.$axios.$get(
          `asset/category-all`
        );
        this.categories = data;
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
  },
};
</script>