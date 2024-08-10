<template>
  <div id="reportersList">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <div style="display: flex">
            <h3>Reporters</h3>
            <v-spacer />
            <v-btn
              v-can="`create reporter`"
              to="/reporters/entry"
              color="primary"
              nuxt
              >Create Reporter</v-btn
            >
          </div>
        </v-flex>
        <v-flex xs12>
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
              <div>
                <b-language v-model="language" />
              </div>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-data-table
                v-model="selected"
                :headers="headers"
                :items="reporters"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template #item.avatar="{ item }">
                  <v-avatar v-if="item.avatar" size="32">
                    <img :src="item.avatar" :alt="item.name" />
                  </v-avatar>
                  <v-avatar v-else-if="item.name" size="32" color="purple red--after">
                    <span class="white--text">{{ item.name | avatar}}</span>
                  </v-avatar>
                  <v-avatar v-else size="32" color="purple red--after">
                    <span class="white--text">{{ item.username | avatar}}</span>
                  </v-avatar>
                </template>
                <template #item.status="{ item }">
                  <active-chip :status="item.status" />
                </template>
                <template #item.action="{ item }">
                  <edit-in-same-page-actions
                    update="update reporter"
                    delete-action="delete reporter"
                    :to="`/reporters/entry?id=${item.id}&edit=true&lang=${language}`"
                    @deleteItem="deleteItem(item)"
                  />
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import { debounce } from 'lodash-es';

export default {
  name: 'Reporter',
  data() {
    return {
      language: 'en',
      reporters: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      pagination: {},
      headers: [
        { text: 'Avatar', value: 'avatar' },
        { text: 'Name', value: 'name' },
        { text: 'Email', value: 'email' },
        { text: 'Username', value: 'username' },
        { text: 'Status', value: 'status' },
        {
          text: 'Actions',
          value: 'action',
          sortable: false,
          align: 'center',
          width: '150px',
        },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
    };
  },
  watch: {
    pagination() {
      this.getReporterByPagination();
    },
    search() {
      this.getReporterByPagination();
    },
    language() {
      this.getReporterByPagination();
    },
  },
  mounted() {
    this.getReporterByPagination();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getReporterByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get reporter by pagination
    getReporterByPagination: debounce(async function () {
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
          `${this.language}/reporter?${url}`
        );
        this.loading = false;
        this.reporters = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // delete item
    async deleteItem(item) {
      if (
        await this.$root.$confirm('Delete', 'Are you sure?', {
          color: 'red',
        })
      ) {
        this.deleteReporter(item.id);
      } else {
        return false;
      }
    },
    async deleteReporter(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${this.language}/reporter/${id}`
        );
        this.getReporterByPagination();
        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
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
