<template>
  <div id="tags">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col>
          <div style="display: flex">
            <h3>Tags</h3>
            <v-spacer />
            <v-btn
              :v-can="`create tag`"
              color="primary"
              :loading="creating"
              @click="create"
            >
              New Tag
            </v-btn>
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
              />
              <div>
                <b-language v-model="language" />
              </div>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-data-table
                v-model="selected"
                :headers="main_headers"
                :items="tags"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template #item.status="{ item }">
                  <active-chip :status="item.status" />
                </template>
                <template #item.color="{ item }">
                  <v-chip :color="item.color" class="black--text">{{
                    item.color
                  }}</v-chip>
                </template>
                <template #item.action="{ item }">
                  <edit-in-same-page-actions
                    update="update tag"
                    delete-action="delete tag"
                    :to="`/common/tags/${item.id}?edit=true&lang=${language}`"
                    @deleteItem="deleteItem(item)"
                  />
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
  name: 'Tag',
  data() {
    return {
      language: 'en',
      dialog: false,
      tags: [],
      selected: [],
      search: '',
      total: 0,
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
  computed: {
    pagination: {
      get() {
        return this.$store.state.pagination.contentTagPagination;
      },
      set(val) {
        this.$store.commit('pagination/CONTENT_TAG_UPDATED', val);
      },
    },
  },
  watch: {
    // for server side pagination
    async pagination() {
      await this.getTagsByPagination();
    },
    // for server side search
    async search() {
      await this.getTagsByPagination();
    },
    async language() {
      await this.getTagsByPagination();
    },
  },
  async mounted() {
    await this.getTagsByPagination();
    window.getApp.$on('REFRESH_PAGE_CONTENT', async () => {
      await this.getTagsByPagination();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get tag by pagination
    getTagsByPagination: debounce(async function () {
      this.loading = true;
      let url = `page=${this.pagination.page}&per_page=${this.pagination.itemsPerPage}`;
      // get by search keyword
      if (this.search) {
        url += `&query=${this.search}`;
      }

      // get by sort option
      if (this.pagination.sortBy.length && !this.search) {
        const direction = this.pagination.sortDesc[0] ? 'desc' : 'asc';

        url += `&direction=${direction}&sortBy=${this.pagination.sortBy[0]}`;
      }

      try {
        const { data, meta } = await this.$axios.$get(
          `${this.language}/tag?${url}`
        );
        this.loading = false;
        this.tags = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // create tag
    async create() {
      this.creating = true;
      try {
        const { tagId } = await this.$axios.$post(`${this.language}/tag`);
        this.creating = false;
        this.$router.push(`/common/tags/${tagId}`);
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
        this.deleteTag(item.id);
      } else {
        return false;
      }
    },
    async deleteTag(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${this.language}/tag/${id}`
        );
        this.getTagsByPagination();
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
</script>
