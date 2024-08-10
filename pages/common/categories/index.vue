<template>
  <div id="categories">
    <v-container fluid>
      <v-row>
        <v-col>
          <div style="display: flex">
            <h3>Categories</h3>
            <v-spacer />
            <v-btn
              v-can="`create category`"
              color="primary"
              :loading="creating"
              @click="create"
            >New Category</v-btn>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card>
            <v-card-title class="pa-1">
              <v-text-field
                v-model="search"
                solo
                flat
                prepend-inner-icon="mdi-magnify"
                placeholder="Type something"
                hide-details
              ></v-text-field>
              <b-language v-model="language" />
            </v-card-title>
            <v-divider />
            <v-card-text>
              <v-data-table
                :headers="main_headers"
                :items="newCategories"
                :loading="loading"
                class="elevation-1"
                show-expand
                single-expand
              >
                <template #item.status="{ item }">
                  <active-chip :status="item.status" />
                </template>
                <template #item.color="{ item }">
                  <v-chip :color="item.color" class="black--text">{{ item.color }}</v-chip>
                </template>
                <template #item.action="{ item }">
                  <edit-in-same-page-actions
                    update="update category"
                    delete-action="delete category"
                    :to="`/common/categories/${item.id}?edit=true&lang=${language}`"
                    @deleteItem="deleteItem(item)"
                  />
                </template>
                <template #expanded-item="{ headers, item: child }">
                  <td v-if="child.children.length" :colspan="headers.length">
                    <v-row justify="center">
                      <v-col cols="12" sm="10">
                        <v-data-table
                          :headers="headers"
                          :items="child.children"
                          :loading="loading"
                          class="elevation-1"
                          hide-default-footer
                        >
                          <template #item.status="{ item }">
                            <active-chip :status="item.status" />
                          </template>
                          <template #item.color="{ item }">
                            <v-chip :color="item.color" class="black--text">{{ item.color }}</v-chip>
                          </template>
                          <template #item.action="{ item }">
                            <edit-in-same-page-actions
                              update="update category"
                              delete-action="delete category"
                              :to="`/common/categories/${item.id}?edit=true&lang=${language}`"
                              @deleteItem="deleteItem(item)"
                            />
                          </template>
                        </v-data-table>
                      </v-col>
                    </v-row>
                  </td>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { debounce } from 'lodash-es';

export default {
  name: 'Category',
  data() {
    return {
      language: 'en',
      dialog: false,
      categories: [],
      newCategories: [],
      search: '',
      loading: false,
      creating: false,
      main_headers: [
        { text: 'Name', value: 'name' },
        { text: 'Slug', value: 'slug' },
        { text: 'Color', value: 'color' },
        { text: 'Posts', value: 'posts_count' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
    };
  },
  watch: {
    language() {
      this.getCategoriesByPagination();
    },
    search(searchKey, oldValue) {
      if (!searchKey) this.newCategories = this.categories;

      if (searchKey !== oldValue) {
        const categoriesList = this.categories;
        const newCategoriesList = [];

        categoriesList.forEach((category) => {
          let name = category.name;
          const regEx = new RegExp(searchKey, 'gi');
          // Get all child category name
          name += getNameString(category.children);
          const matched = name.match(regEx);
          if (matched) {
            newCategoriesList.push(category);
          }

          this.newCategories = newCategoriesList;
        });
      }
    },
  },
  mounted() {
    this.getCategoriesByPagination();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getCategoriesByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get category by pagination
    getCategoriesByPagination: debounce(async function () {
      this.loading = true;

      try {
        const { data } = await this.$axios.$get(
          `${this.language}/category`
        );
        this.loading = false;
        this.newCategories = data;
        this.categories = data;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // update parent child
    async updateParentChild() {
      try {
        const { message } = await this.$axios.$post(
          `${this.language}/category-rebuild`,
          this.newCategories
        );
        this.getCategoriesByPagination();
        this.$store.dispatch('crud_success_dialog', message);
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // create category
    async create() {
      this.creating = true;
      try {
        const { categoryId } = await this.$axios.$post(
          `${this.language}/category`
        );
        this.creating = false;
        this.$router.push(`/common/categories/${categoryId}`);
      } catch (e) {
        this.creating = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // delete item
    async deleteItem(item) {
      if (
        await this.$root.$confirm('Delete', 'Are you sure?', {
          color: 'red',
        })
      ) {
        this.deleteCategory(item.id);
      } else {
        return false;
      }
    },
    async deleteCategory(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${this.language}/category/${id}`
        );
        this.getCategoriesByPagination();
        this.$store.dispatch('crud_success_dialog', message);
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
  },
};
// Get children category name
const getNameString = (childCategories) => {
  let name = '';
  if (childCategories && childCategories.length > 0) {
    childCategories.forEach((category) => {
      name += category.name;

      if (category.children) {
        name += getNameString(category.children);
      }
    });
  }
  return name;
};
</script>
