<template>
  <div id="Sliders">
    <v-container fluid>
      <v-row>
        <v-col>
          <div style="display: flex">
            <h3>Sliders</h3>
            <v-spacer />
            <v-btn
              v-can="`create slider`"
              color="primary"
              :loading="creating"
              @click="create"
            >New Slider</v-btn>
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
              <b-language v-model="language" />
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-progress-linear v-if="loading" :indeterminate="loading" />
              <v-simple-table>
                <template #default>
                  <thead>
                    <tr>
                      <th>Drag</th>
                      <th>Title</th>
                      <th>Upload Time</th>
                      <th class="text-center">Status</th>
                      <th class="text-center">Actions</th>
                    </tr>
                  </thead>
                  <draggable
                    v-model="sliders"
                    tag="tbody"
                    :options="{ animation: 200 }"
                    @end="reorder"
                  >
                    <tr v-for="item in sliders" :key="item.id">
                      <td>
                        <v-btn small fab>
                          <v-icon>mdi-drag</v-icon>
                        </v-btn>
                      </td>
                      <td>{{ item.title }}</td>
                      <td>{{ getPublishDateTime(item.updated_at) }}</td>
                      <td class="text-center">
                        <active-chip :status="item.status" />
                      </td>
                      <td class="text-center">
                        <edit-in-same-page-actions
                          update="update slider"
                          delete-action="delete slider"
                          :to="`/home/sliders/${item.id}?edit=true&lang=${language}`"
                          @deleteItem="deleteItem(item)"
                        />
                      </td>
                    </tr>
                  </draggable>
                </template>
              </v-simple-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { debounce } from 'lodash-es';
import draggable from 'vuedraggable';
import { format } from 'date-fns';

export default {
  name: 'Slider',
  components: { draggable },
  data() {
    return {
      language: 'en',
      dialog: false,
      sliders: [],
      search: '',
      loading: false,
      creating: false,
      getPublishDateTime(dateTime) {
        return format(new Date(dateTime), 'dd-MM-yyyy hh:mm a');
      },
    };
  },
  watch: {
    language() {
      this.getSlidersByPagination();
    },
    // for server side search
    search() {
      this.getSlidersByPagination();
    },
  },
  mounted() {
    this.getSlidersByPagination();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getSlidersByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get slider by pagination
    getSlidersByPagination: debounce(async function () {
      this.loading = true;
      let url = 'query=';
      // get by search keyword
      if (this.search) {
        url += `${this.search}`;
      }

      try {
        const { data } = await this.$axios.$get(
          `${this.language}/slider?${url}`
        );
        console.log('data', data);
        this.sliders = data;
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      } finally {
        this.loading = false;
      }
    }, 500),
    // create slider
    async create() {
      this.creating = true;
      try {
        const { sliderId } = await this.$axios.$post(`${this.language}/slider`);
        this.creating = false;
        this.$router.push(`/home/sliders/${sliderId}`);
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
        this.deleteSlider(item.id);
      } else {
        return false;
      }
    },
    async deleteSlider(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${this.language}/slider/${id}`
        );
        this.getSlidersByPagination();
        this.$store.dispatch('crud_success_dialog', message);
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    async reorder() {
      try {
        const { message } = await this.$axios.$put(
          `${this.language}/slider-reorder`,
          {
            sliders: this.sliders,
          }
        );
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
