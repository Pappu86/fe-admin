<template>
  <div id="postsList">
    <v-container fluid>
      <v-row>
        <v-col>
          <div style="display: flex">
            <h3>Live Media</h3>
            <v-spacer />
            <v-btn
              v-can="`create media`"
              :loading="creating"
              color="primary"
              @click="createLiveMedia"
            >
              Create Live Media
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
              <div>
                <b-language v-model="language" />
              </div>
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
                <template #item.start_at="{ item }">
                  {{ item.start_at | toDayDateTimeString }}
                </template>
                <template #item.end_at="{ item }">
                  {{ item.end_at | toDayDateTimeString }}
                </template>
                <template #item.status="{ item }">
                  <active-chip :status="item.status" />
                </template>
                <template #item.action="{ item }">
                  <!-- <v-btn
                    v-can="`view media`"
                    icon
                    small
                    fab
                    color="primary"
                    title="View"
                    :to="`/contents/media/${item.id}`"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn> -->
                  <v-btn
                    v-can="`update media`"
                    icon
                    small
                    fab
                    color="teal"
                    title="Edit"
                    :to="`/contents/media/${item.id}/edit?edit=true&lang=${language}`"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`delete media`"
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
  name: 'LiveMedia',
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
        { text: 'Start At', value: 'start_at' },
        { text: 'End At', value: 'end_at' },
        { text: 'Featured', value: 'featured' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center', width: 120 },
      ],
    };
  },
  computed: {
    pagination: {
      get() {
        return this.$store.state.pagination.contentLiveMediaPagination;
      },
      set(val) {
        this.$store.commit('pagination/CONTENT_LIVE_MEDIA_UPDATED', val);
      },
    },
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getLiveMediaByPagination();
    },
    // for server side search
    search() {
      this.getLiveMediaByPagination();
    },
    language() {
      this.getLiveMediaByPagination();
    },
  },
  async mounted() {
    await this.getLiveMediaByPagination();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getLiveMediaByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get media by pagination
    getLiveMediaByPagination: debounce(async function () {
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
          `${this.language}/live-media?${url}`
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
    // create media
    async createLiveMedia() {
      this.creating = true;
      try {
        const { liveMediaId } = await this.$axios.$post(
          `${this.language}/live-media`
        );
        this.creating = false;
        this.$router.push(`/contents/media/${liveMediaId}/edit`);
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
        this.deleteLiveMedia(item.id);
      } else {
        return false;
      }
    },
    async deleteLiveMedia(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${this.language}/live-media/${id}`
        );
        this.getLiveMediaByPagination();
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
