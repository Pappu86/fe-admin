<template>
  <div id="latestPosts">
    <v-container fluid>
      <v-row>
        <v-col>
          <div style="display: flex">
            <h3>Latest Post</h3>
            <v-spacer />
            <v-btn
              v-can="`create latest-post`"
              color="primary"
              @click="dialog = true"
            >
              New Latest Post
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
              ></v-text-field>
              <b-language v-model="language" />
            </v-card-title>
            <v-divider />
            <v-card-text>
              <v-data-table
                :headers="main_headers"
                :items="latestPosts"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template #item.status="{ item }">
                  <active-chip :status="item.status" />
                </template>
                <template #item.action="{ item }">
                  <edit-with-dialog-actions
                    update="update latest-post"
                    delete-action="delete latest-post"
                    @editItem="editItem(item)"
                    @deleteItem="deleteItem(item)"
                  />
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-dialog v-model="dialog" max-width="800px" persistent>
      <v-card>
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">{{ formTitle }}</span>
          <v-btn icon dark class="ma-0" @click.stop="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <validation-observer v-slot="{ handleSubmit, invalid, reset }">
          <v-form
            @submit.prevent="handleSubmit(onSubmit)"
            @reset.prevent="reset"
          >
            <v-card-text>
              <b-text
                v-model="editedItem.title"
                rules="required"
                outlined
                label="Title"
              />
              <b-text v-model="editedItem.url" outlined label="Url" />
              <active-inactive-dialog v-model="editedItem.status" />
            </v-card-text>
            <v-divider />
            <action-button-dialog
              :loading="saving"
              :error="invalid"
              @close="close"
            />
          </v-form>
        </validation-observer>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { debounce } from 'lodash-es';

export default {
  name: 'LatestPost',
  data() {
    return {
      language: 'en',
      dialog: false,
      latestPosts: [],
      search: '',
      loading: false,
      creating: false,
      saving: false,
      pagination: {},
      total: 0,
      main_headers: [
        { text: 'Title', value: 'title' },
        { text: 'Url', value: 'url' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      editedIndex: -1,
      defaultItem: {
        title: '',
        url: '',
        status: true,
      },
      editedItem: Object.assign({}, this.defaultItem),
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Latest Post' : 'Update Latest Post';
    },
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getLatestPostsByPagination();
    },
    // for server side search
    search() {
      this.getLatestPostsByPagination();
    },
    language() {
      this.getLatestPostsByPagination();
    },
  },
  mounted() {
    this.editedItem = Object.assign({}, this.defaultItem);
    this.getLatestPostsByPagination();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getLatestPostsByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get latest-post by pagination
    getLatestPostsByPagination: debounce(async function () {
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
          `${this.language}/latest-post?${url}`
        );
        this.loading = false;
        this.latestPosts = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    async onSubmit() {
      if (this.editedIndex > -1) {
        await this.update();
      } else {
        await this.create();
      }
    },
    // create latest-post
    async create() {
      this.creating = true;
      try {
        const { message } = await this.$axios.$post(
          `${this.language}/latest-post`,
          this.editedItem
        );
        this.creating = false;
        this.getLatestPostsByPagination();
        this.close();
        this.$store.dispatch('crud_success_dialog', message);
      } catch (e) {
        this.creating = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // open dialog to edit latest-post
    editItem(item) {
      this.editedIndex = this.latestPosts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      setTimeout(() => {
        this.dialog = true;
      }, 100);
    },
    // close dialog
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 100);
    },
    // update model
    async update() {
      this.saving = true;
      try {
        const { message } = await this.$axios.$patch(
          `${this.language}/latest-post/${this.editedItem.id}`,
          this.editedItem
        );
        this.saving = false;
        this.getLatestPostsByPagination();
        this.close();
        this.$store.dispatch('crud_success_dialog', message);
      } catch (err) {
        this.saving = false;
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
    // delete item
    async deleteItem(item) {
      if (
        await this.$root.$confirm('Delete', 'Are you sure?', {
          color: 'red',
        })
      ) {
        this.deleteType(item.id);
      } else {
        return false;
      }
    },
    async deleteType(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${this.language}/latest-post/${id}`
        );
        this.getLatestPostsByPagination();
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
