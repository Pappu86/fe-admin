<template>
  <div id="subscribers">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <div style="display: flex">
            <h3>Newsletter Subscribers</h3>
            <v-spacer />
            <!-- <v-btn v-can="`create user`" to="/users/entry" color="primary" nuxt>Create User</v-btn> -->
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
              <v-btn icon>
                <v-icon>mdi-filter-variant</v-icon>
              </v-btn>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-data-table
                v-model="selected"
                :headers="headers"
                :items="subscribers"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template #item.mailchimp_status="{ item }">
                  <div class="text-capitalize">{{item.mailchimp_status}}</div>
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
  name: 'User',
  data() {
    return {
      subscribers: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      pagination: {},
      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Email', value: 'email' },
        { text: 'Status', value: 'mailchimp_status' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
    };
  },
  watch: {
    pagination() {
      this.getSubscribersByPagination();
    },
    search() {
      this.getSubscribersByPagination();
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getSubscribersByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get user by pagination
    getSubscribersByPagination: debounce(async function () {
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
          `newsletter/subscribers?${url}`
        );
        this.loading = false;
        this.subscribers = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
  },
};
</script>
