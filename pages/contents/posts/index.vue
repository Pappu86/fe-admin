<template>
  <div id="postsList">
    <v-container fluid>
      <v-row>
        <v-col>
          <div style="display: flex">
            <h3>Posts</h3>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="text-center col-md-4 col-12">
          <v-card color="#4fa03e" dark class="text-center post-counter-box">
            <div>New Posts Today</div>
            <h2>{{ postsStatistic.today_new_post }}</h2>
            <div>{{ postsStatistic.today }}</div>
          </v-card>
        </v-col>
        <v-col class="text-center col-md-4 col-12">
          <v-card color="#5388be" dark class="text-center post-counter-box">
            <div>New Posts In Last 30 Days</div>
            <h2>{{ postsStatistic.last_thirty_days_new_post }}</h2>
            <div>({{ postsStatistic.last_thirty_days_progress }}) prev 30 days</div>
          </v-card>
        </v-col>
        <v-col class="text-center col-md-4 col-12">
          <v-card color="#F7961F" dark class="text-center post-counter-box">
            <div>Total Posts</div>
            <h2>{{ postsStatistic.total_post }}</h2>
            <div>{{ postsStatistic.date_range_total_post }}</div>
          </v-card>
        </v-col>
      </v-row>
      <v-row v-if="isFilter">
        <v-col>
          <h3 class="mb-5">Filter</h3>
          <v-card min-height="150">
            <v-row justify="center" class="pa-5">
              <v-col cols="12" md="2">
                <v-select
                  v-model="selectedPublisher"
                  :items="publishers"
                  label="Publishers"
                  class="mr-5"
                  item-text="name"
                  item-value="id"
                  outlined
                  dense
                  hide-details="auto"
                ></v-select>
              </v-col>
              <v-col cols="12" md="2">
                <v-select
                  v-model="selectedReporter"
                  :items="reporters"
                  label="Reporter"
                  class="mr-5"
                  item-text="name"
                  item-value="id"
                  outlined
                  dense
                  hide-details="auto"
                ></v-select>
              </v-col>
              <v-col cols="12" md="2">
                <v-select
                  v-model="selectedCategory"
                  :items="categoriesList"
                  label="Category"
                  class="mr-5"
                  outlined
                  dense
                  hide-details="auto"
                ></v-select>
              </v-col>
              <v-col cols="12" md="3">
                <b-date-range
                  v-model="dateRange"
                  :is-reset="isReset"
                  outlined
                  label="Date range"
                  hide-details="auto"
                  dense
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-btn outlined color="warning" @click="postFilters">Filter</v-btn>
                <v-btn outlined color="warning" @click="resetFilters">Reset</v-btn>
                <v-btn outlined color="warning" @click="handleFilterPanel">Cancle</v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <div style="display: flex">
            <v-spacer />
            <v-btn
              v-can="`create post`"
              class="mr-4"
              outlined
              color="warning"
              @click="handleFilterPanel"
            >
              <i class="mdi mdi-filter"></i>
            </v-btn>
            <a
              v-can="`create post`"
              href="#"
              class="v-btn v-size--default primary"
              :loading="creating"
              @click="createPost"
            >Create post</a>
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
                :items="posts"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1 post-data-table"
                :footer-props="{'items-per-page-options':itemsPerPageItems}"
              >
                <template #item.is_edited="{ item }">
                  <template v-if="item.is_edited && item.history && item.history.length > 0">
                    <v-tooltip bottom>
                      <template #activator="{ on, attrs }">
                        <span v-bind="attrs" v-on="on">History</span>
                      </template>
                      <div>
                        <v-card flat min-width="350">
                          <v-card-title class="pa-1">Edited By</v-card-title>
                          <v-divider></v-divider>
                          <v-card-text class="pa-0">
                            <v-row
                              v-for="edited in item.history"
                              :key="'history_' + edited.id"
                              class="history-row"
                            >
                              <v-col>{{ edited.name }}</v-col>
                              <v-col class="text-end">{{ getHistoryDateTime(edited.updated_at) }}</v-col>
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </div>
                    </v-tooltip>
                  </template>
                </template>
                <template #item.datetime="{ item }">{{ item.datetime | toDayDateTimeString }}</template>
                <template #item.status="{ item }">
                  <active-chip :status="item.status" />
                </template>
                <template #item.action="{ item }">
                  <template v-if="item.status">
                    <v-btn
                      v-can="`view post`"
                      icon
                      small
                      fab
                      color="primary"
                      title="View"
                      target="_blank"
                      :href="getPostUrl(item)"
                    >
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                  </template>
                  <template v-else>
                    <v-btn
                      v-can="`view post`"
                      icon
                      small
                      fab
                      color="primary"
                      title="View"
                      :to="`/contents/posts/${item.id}`"
                    >
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                  </template>
                  <v-btn
                    v-can="`update post`"
                    icon
                    small
                    fab
                    color="teal"
                    title="Edit"
                    :to="`/contents/posts/${item.id}/edit?edit=true&lang=${language}`"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`delete post`"
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
import { format } from 'date-fns';
import { setCategoryNamesList } from '@/util';

export default {
  name: 'Post',
  data() {
    return {
      language: 'en',
      posts: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      selectedReporter: '',
      selectedPublisher: '',
      selectedCategory: '',
      publishers: [],
      reporters: [],
      dateRange: [],
      categoriesList: [{ text: 'All', value: 'all' }],
      isFilter: false,
      resetDates: false,
      isReset: true,
      postsStatistic: {
        today_new_post: 0,
        today: format(new Date(), 'dd MMM yyyy'),
        last_thirty_days_new_post: 0,
        last_thirty_days_progress: '0',
        total_post: 0,
        date_range_total_cusotmer: 'all',
      },
      headers: [
        {
          text: 'Serial No',
          value: 'sno',
        },
        { text: 'Date', value: 'datetime' },
        { text: 'Title', value: 'title' },
        { text: 'Author', value: 'author' },
        { text: 'Edited by', value: 'is_edited' },
        { text: 'Category', value: 'category' },
        { text: 'Type', value: 'type' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      itemsPerPageItems: [20, 30, 50],
      getHistoryDateTime(dateTime) {
        return format(new Date(dateTime + 'Z'), 'dd-MM-yyyy hh:mm a');
      },
    };
  },
  computed: {
    pagination: {
      get() {
        return this.$store.state.pagination.contentPostPagination;
      },
      set(val) {
        this.$store.commit('pagination/CONTENT_POST_UPDATED', val);
      },
    },
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getPostsByPagination();
    },
    // for server side search
    search() {
      this.getPostsByPagination();
    },
    language() {
      this.getPostsByPagination();
    },
    // selectedCategory(newValue, oldValue) {
    //   if (newValue !== oldValue) {
    //     this.getPostsByPagination();
    //   }
    // },
  },
  async mounted() {
    await this.getCategories();
    await this.getPostStatistic();
    await this.getReporters();
    await this.getPublishers();
    window.getApp.$on(
      'REFRESH_PAGE_CONTENT',
      () => this.getPostsByPagination(),
      this.getPostStatistic(),
      this.getCategories()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get post by pagination
    getPostsByPagination: debounce(async function () {
      this.loading = true;
      let url = `page=${this.pagination.page}&per_page=${this.pagination.itemsPerPage}`;
      // get by search keyword
      if (this.search) {
        url += `&query=${this.search}`;
      }

      if (this.selectedPublisher && this.selectedPublisher !== 'all') {
        url += `&publisher=${this.selectedPublisher}`;
      }

      // get by reporter
      if (this.selectedReporter && this.selectedReporter !== 'all') {
        url += `&reporter=${this.selectedReporter}`;
      }

      // get by category
      if (this.selectedCategory && this.selectedCategory !== 'all') {
        url += `&category=${this.selectedCategory}`;
      }
      // get by reporter
      if (this.dateRange.length > 0) {
        url += `&date_range=${this.dateRange}`;
      }

      // get by sort option
      if (this.pagination.sortBy.length && !this.search) {
        const direction = this.pagination.sortDesc[0] ? 'desc' : 'asc';

        url += `&direction=${direction}&sortBy=${this.pagination.sortBy[0]}`;
      }

      try {
        const { data, meta } = await this.$axios.$get(
          `${this.language}/post?${url}`
        );
        this.loading = false;
        if (data.length > 0) {
          this.posts = data.map((obj, index) => {
            obj.sno = index + 1;
            return obj;
          });
        } else {
          this.posts = data;
        }
        // console.log('posts', this.posts);
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // create post
    async createPost() {
      this.creating = true;
      try {
        const { postId } = await this.$axios.$post(`${this.language}/post`);
        // this.creating = false;
        this.$router.push(`/contents/posts/${postId}/edit`);
      } catch (e) {
        // this.creating = false;
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
        this.deletePost(item.id);
      } else {
        return false;
      }
    },
    async deletePost(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${this.language}/post/${id}`
        );
        this.getPostsByPagination();
        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },

    async getPostStatistic() {
      const url = `post/statistic?`;

      try {
        const data = await this.$axios.$get(url);
        this.postsStatistic = data;
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    async getPublishers() {
      try {
        const { data } = await this.$axios.$get(`publishers`);
        this.publishers = data;
      } catch (e) {}
    },
    async getReporters() {
      try {
        const { data } = await this.$axios.$get(`${this.language}/reporters`);
        this.reporters = data;
      } catch (e) {}
    },
    async getCategories() {
      try {
        const { data } = await this.$axios.$get(`asset/category-tree`);
        this.categories = data;
        setCategoryNamesList(this, data);
      } catch (e) {}
    },
    handleFilterPanel() {
      if (this.isFilter) {
        this.isFilter = false;
      } else {
        this.isFilter = true;
      }
    },
    resetFilters() {
      const instance = this;
      instance.selectedCategory = '';
      instance.selectedPublisher = '';
      instance.selectedReporter = '';
      instance.dateRange = [];
      instance.isReset = false;
      setTimeout(() => {
        instance.isReset = true;
      });
    },
    postFilters() {
      this.getPostsByPagination();
    },
    getPostUrl(item) {
      let baseUrl = 'https://thefinancialexpress.com.bd/';
      if (process.env.NODE_ENV !== 'production') {
        baseUrl = 'http://localhost:3000/';
      }
      return baseUrl + item.slug;
    },
  },
};
</script>

<style scoped>
.v-tooltip__content {
  background: #fff !important;
  border: 1px solid rgba(0, 0, 0, 0.12);
  opacity: 1 !important;
}

.history-row {
  padding: 0;
  margin: 0;
}

.history-row > div {
  padding: 5px 10px;
}

.history-row > div:last-child {
  text-align: right;
}
</style>
