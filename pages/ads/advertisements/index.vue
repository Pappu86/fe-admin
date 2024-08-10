<template>
  <div id="postsList">
    <v-container fluid>
      <v-row>
        <v-col>
          <div style="display: flex">
            <h3>Advertisement</h3>
            <v-spacer />
            <v-btn
              v-can="`create advertisement`"
              :loading="creating"
              color="primary"
              @click="createAdvertisement"
            >
              Create Advertisement
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
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-data-table
                v-model="selected"
                :headers="headers"
                :items="items"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template #item.start_date="{ item }">
                  {{ item.start_date | toDayDateTimeString }}
                </template>
                <template #item.end_date="{ item }">
                  {{ item.end_date | toDayDateTimeString }}
                </template>
                <template #item.status="{ item }">
                  <active-chip :status="item.status" />
                </template>
                <template #item.action="{ item }">
                  <!-- <v-btn
                    v-can="`view advertisement`"
                    icon
                    small
                    fab
                    color="primary"
                    title="View"
                    :to="`/ads/advertisements/${item.id}`"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn> -->
                  <v-btn
                    v-can="`update advertisement`"
                    icon
                    small
                    fab
                    color="teal"
                    title="Edit"
                    :to="`/ads/advertisements/${item.id}/edit?edit=true`"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`delete advertisement`"
                    icon
                    small
                    fab
                    color="pink"
                    title="Delete"
                    @click="deleteItem(item)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
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
  name: 'AdsAdvertisements',
  data() {
    return {
      language: 'en',
      items: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      headers: [
        { text: 'Title', value: 'title' },
        { text: 'Type', value: 'type' },
        { text: 'Start At', value: 'start_date' },
        { text: 'End At', value: 'end_date' },
        { text: 'Status', value: 'status' },
        {
          text: 'Actions',
          value: 'action',
          sortable: false,
          align: 'center',
          width: 120,
        },
      ],
    };
  },
  computed: {
    pagination: {
      get() {
        return this.$store.state.pagination.adsAdvertisementPagination;
      },
      set(val) {
        this.$store.commit('pagination/ADS_ADVERTISEMENT_UPDATED', val);
      },
    },
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getAdvertisementByPagination();
    },
    // for server side search
    search() {
      this.getAdvertisementByPagination();
    },
  },
  async mounted() {
    await this.getAdvertisementByPagination();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getAdvertisementByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get advertisement by pagination
    getAdvertisementByPagination: debounce(async function () {
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
          `ads/advertisement?${url}`
        );
        this.loading = false;
        this.items = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // create advertisement
    async createAdvertisement() {
      this.creating = true;
      try {
        const { advertisementId } = await this.$axios.$post(
          `ads/advertisement`,
          {
            is_external: true,
          }
        );
        this.creating = false;
        this.$router.push(`/ads/advertisements/${advertisementId}/edit`);
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
        this.deleteAdvertisement(item.id);
      } else {
        return false;
      }
    },
    async deleteAdvertisement(id) {
      try {
        const { message } = await this.$axios.$delete(
          `ads/advertisement/${id}`
        );
        this.getAdvertisementByPagination();
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
