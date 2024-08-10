<template>
  <div id="mediaAssetDialog">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col>
          <v-card min-height="200" class="mt-5">
            <v-row justify="center" class="pa-5">
              <v-col cols="12" sm="5">
                <v-expansion-panels flat>
                  <v-expansion-panel>
                    <v-expansion-panel-header disable-icon-rotate>
                      Category
                      <template v-slot:actions>
                        <v-icon
                          v-if="selectedCategories.length > 0"
                          color="teal"
                        >
                          mdi-check
                        </v-icon>
                        <v-icon
                          v-else=""
                          color="warning"
                          title="Please select category"
                        >
                          mdi-alert
                        </v-icon>
                      </template>
                    </v-expansion-panel-header>
                    <v-divider />
                    <v-expansion-panel-content>
                      <template v-if="categories.length > 0">
                        <v-sheet class="pt-3">
                          <v-text-field
                            v-model="category"
                            placeholder="Search category"
                            outlined
                            clear-icon="mdi-close-circle-outline"
                            hide-details
                            clearable
                            dense
                          ></v-text-field>
                        </v-sheet>
                        <scrollbar style="max-height: 200px">
                          <v-treeview
                            v-model="selectedCategories"
                            :items="categories"
                            :search="category"
                            selectable
                            return-object
                          ></v-treeview>
                        </scrollbar>
                      </template>
                      <template v-else="">
                        <div
                          class="d-flex pt-5 mt-5 pb-5 justify-center red--text"
                        >
                          Please, At first create a category!
                        </div>
                      </template>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-col>
              <v-col cols="12" sm="7">
                <v-file-input
                  v-model="files"
                  :loading="loading"
                  label="Images/Files"
                  placeholder="Select files to upload..."
                  multiple
                  show-size
                  counter
                  chips
                  @change="updateItems(files)"
                />
              </v-col>
            </v-row>
            <v-card-text v-if="items.length">
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">Name</th>
                      <th class="text-left">Type</th>
                      <th class="text-left">Size</th>
                      <th class="text-left">Progress</th>
                      <th class="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, i) in items" :key="i">
                      <td>{{ item.file.name }}</td>
                      <td>{{ item.file.type }}</td>
                      <td>{{ fileSize(item.file.size) }}</td>
                      <td>
                        <v-progress-linear
                          v-model="item.progress"
                          background-opacity="0.3"
                          height="20"
                          rounded
                          stream
                          striped
                          color="light-blue"
                        >
                          <strong>{{ Math.ceil(item.progress) }}%</strong>
                        </v-progress-linear>
                      </td>
                      <td class="text-center">
                        <v-btn
                          icon
                          fab
                          x-small
                          color="pink"
                          @click="removeFile(i)"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-card-text>
            <v-divider />
            <v-row justify="center" class="mt-5">
              <v-col cols="12" sm="6" class="text-center">
                <v-btn color="secondary" large outlined @click="clearAll">
                  Cancel
                </v-btn>
                <v-btn
                  color="primary"
                  type="button"
                  outlined
                  large
                  :loading="loading"
                  :disabled="
                    !(
                      selectedCategories.length > 0 &&
                      files &&
                      files.length > 0
                    )
                  "
                  @click="uploadAll"
                >
                  Upload
                  <v-icon right>mdi-cloud-upload</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-flex xs12 class="d-flex pt-5 mt-3">
          <v-text-field
            v-model="search"
            solo
            flat
            prepend-inner-icon="mdi-magnify"
            placeholder="Type file name"
            hide-details
          ></v-text-field>
          <div class="d-flex">
            <v-select
              v-model="selectedCategory"
              :items="categoriesList"
              label="Category"
              class="mr-5"
              outlined
              dense
              hide-details="auto"
              style="max-width: 200px"
            ></v-select>
          </div>
        </v-flex>
      </v-row>
      <v-row>
        <v-col cols="12" sm="12">
          <v-card>
            <v-tabs v-model="tab">
              <v-tabs-slider color="primary"></v-tabs-slider>
              <v-tab v-for="(item, index) in media" :key="index">
                {{ index }}
              </v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab">
              <v-tab-item
                v-for="(item, tabCategory) in media"
                :key="tabCategory"
              >
                <template v-if="tabCategory === 'Audio'">
                  <v-container fluid>
                    <scrollbar class="media-scrollbar">
                      <v-row>
                        <v-col
                          v-for="audio in item"
                          :key="audio.id"
                          class="d-flex child-flex"
                          cols="12"
                          sm="3"
                        >
                          <v-card>
                            <v-sheet
                              color="cyan lighten-3"
                              height="300"
                              class="d-flex justify-center align-center"
                            >
                              <audio controls :src="audio.url">
                                Your browser does not support the
                                <code>audio</code> element.
                              </audio>
                            </v-sheet>
                            <v-card-actions class="justify-center">
                              <v-btn
                                :data-clipboard-text="audio.url"
                                color="accent"
                                outlined
                                class="copy-link"
                              >
                                Copy Link
                              </v-btn>
                              <v-btn
                                color="primary"
                                outlined
                                @click="$emit('use', audio)"
                              >
                                Use It
                              </v-btn>
                              <v-btn
                                color="info"
                                outlined
                                @click="showDetails(audio)"
                              >
                                Details
                              </v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-col>
                      </v-row>
                    </scrollbar>
                  </v-container>
                </template>
                <template v-else-if="tabCategory === 'Videos'">
                  <v-container fluid>
                    <scrollbar class="media-scrollbar">
                      <v-row>
                        <v-col
                          v-for="video in item"
                          :key="video.id"
                          class="d-flex child-flex"
                          cols="12"
                          sm="3"
                        >
                          <v-card>
                            <v-sheet
                              color="cyan lighten-3"
                              height="300"
                              class="d-flex justify-center align-center"
                            >
                              <video controls :src="video.url" width="100%">
                                Your browser does not support the
                                <code>video</code> element.
                              </video>
                            </v-sheet>
                            <v-card-actions class="justify-center">
                              <v-btn
                                :data-clipboard-text="video.url"
                                color="accent"
                                outlined
                                class="copy-link"
                              >
                                Copy Link
                              </v-btn>
                              <v-btn
                                color="primary"
                                outlined
                                @click="$emit('use', video)"
                              >
                                Use It
                              </v-btn>
                              <v-btn
                                color="info"
                                outlined
                                @click="showDetails(video)"
                              >
                                Details
                              </v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-col>
                      </v-row>
                    </scrollbar>
                  </v-container>
                </template>
                <template v-else-if="tabCategory === 'Images'">
                  <v-container fluid>
                    <scrollbar class="media-scrollbar">
                      <v-row>
                        <v-col
                          v-for="image in item"
                          :key="image.id"
                          class="d-flex child-flex"
                          cols="12"
                          sm="3"
                        >
                          <v-card>
                            <v-img
                              :src="image.url"
                              :lazy-src="`https://picsum.photos/id/11/100/60`"
                              aspect-ratio="1"
                              class="grey lighten-2"
                            >
                              <template v-slot:placeholder>
                                <v-row
                                  class="fill-height ma-0"
                                  align="center"
                                  justify="center"
                                >
                                  <v-progress-circular
                                    indeterminate
                                    color="grey lighten-5"
                                  />
                                </v-row>
                              </template>
                            </v-img>
                            <v-card-actions class="justify-center">
                              <v-btn
                                :data-clipboard-text="image.url"
                                color="accent"
                                outlined
                                class="copy-link"
                              >
                                Copy Link
                              </v-btn>
                              <v-btn
                                color="primary"
                                outlined
                                @click="$emit('use', image)"
                              >
                                Use It
                              </v-btn>
                              <v-btn
                                color="info"
                                outlined
                                @click="showDetails(image)"
                              >
                                Details
                              </v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-col>
                      </v-row>
                    </scrollbar>
                  </v-container>
                </template>
                <template v-else>
                  <v-container fluid>
                    <scrollbar class="media-scrollbar">
                      <v-row>
                        <v-col
                          v-for="app in item"
                          :key="app.id"
                          class="d-flex child-flex"
                          cols="12"
                          sm="3"
                        >
                          <v-card>
                            <v-sheet
                              color="cyan lighten-3"
                              height="300"
                              class="d-flex justify-center align-center"
                            >
                              <v-icon size="150">mdi-folder</v-icon>
                            </v-sheet>
                            <v-card-actions class="justify-center">
                              <v-btn
                                :data-clipboard-text="app.url"
                                color="accent"
                                outlined
                                class="copy-link"
                              >
                                Copy Link
                              </v-btn>
                              <v-btn
                                color="primary"
                                outlined
                                @click="$emit('use', app)"
                              >
                                Use It
                              </v-btn>
                              <v-btn
                                color="info"
                                outlined
                                @click="showDetails(app)"
                              >
                                Details
                              </v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-col>
                      </v-row>
                    </scrollbar>
                  </v-container>
                </template>
              </v-tab-item>
            </v-tabs-items>

            <v-row justify="center">
              <v-col class="text-center">
                <v-btn
                  class="primary"
                  large
                  :disabled="prev_page_url === null"
                  @click="prev"
                >
                  <v-icon left>mdi-chevron-left</v-icon>Prev Page
                </v-btn>
                <v-btn
                  class="primary"
                  large
                  :disabled="next_page_url === null"
                  @click="next"
                >
                  Next Page <v-icon right>mdi-chevron-right</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Copied alert -->
    <v-snackbar v-model="copied" app top right color="success">
      Link Copied!
      <template #action="{ attrs }">
        <v-btn dark text icon v-bind="attrs" @click.native="copied = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Details dialog -->
    <v-dialog v-model="isOpenDetailsDialog" max-width="500px">
      <v-card>
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">Edit file</span>
          <v-btn
            icon
            dark
            class="ma-0"
            @click.stop="isOpenDetailsDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-form @submit.prevent="updateFileHandler">
          <v-card-text>
            <v-simple-table v-if="file">
              <template #default>
                <tbody>
                  <tr>
                    <td><strong>Name:</strong></td>
                    <td>
                      <v-text-field
                        v-model="file.name"
                        placeholder="Enter file name"
                        outlined
                        hide-details
                        dense
                      ></v-text-field>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Download:</strong></td>
                    <td>
                      <v-btn
                        color="primary"
                        title="download"
                        outlined
                        class="mr-4"
                        @click="downloadFile(file.media_id)"
                      >
                        <v-icon>mdi-download</v-icon>
                      </v-btn>
                      ({{ file.size }})
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Delete:</strong></td>
                    <td>
                      <v-btn
                        color="pink"
                        title="delete"
                        outlined
                        @click="showConfirmDelete"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
            <v-divider />
            <template v-if="categories.length > 0">
              <v-sheet class="pt-3">
                <v-text-field
                  v-model="fileSearchCategory"
                  placeholder="Search category"
                  outlined
                  clear-icon="mdi-close-circle-outline"
                  hide-details
                  clearable
                  dense
                ></v-text-field>
              </v-sheet>
              <scrollbar style="max-height: 200px">
                <v-treeview
                  v-model="file.categories"
                  :items="categories"
                  :search="fileSearchCategory"
                  selectable
                  return-object
                ></v-treeview>
              </scrollbar>
            </template>
            <template v-else="">
              <div class="d-flex pt-5 mt-5 pb-5 justify-center red--text">
                Please, At first create a category!
              </div>
            </template>
          </v-card-text>
          <v-divider />
          <action-button-dialog
            :error="!(file && file.categories.length > 0) || !file.name"
            title="Update"
            @close="isOpenDetailsDialog = false"
          />
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Clipboard from 'clipboard';
import { humanReadableFileSize, setCategoryNamesList } from '@/util';
import Scrollbar from '@/components/Scrollbar';
import { confirmationAlert } from '@/plugins/sweetalert';

export default {
  name: 'MediaAssetDialog',
  components: { Scrollbar },
  data() {
    return {
      loading: false,
      downloading: false,
      copied: false,
      tab: null,
      file: {
        categories: [],
      },
      files: null,
      items: [],
      breadcrumbs: [
        {
          disabled: false,
          href: 'home',
          link: false,
          text: 'Home',
        },
        {
          disabled: false,
          href: 'assets',
          link: false,
          text: 'Assets',
        },
      ],
      media: [],
      isOpenDetailsDialog: false,
      fileSearchCategory: '',
      categories: [],
      categoriesList: [{ text: 'All', value: 'all' }],
      search: '',
      category: '',
      selectedCategory: '',
      selectedCategories: [],
      next_page_url: null,
      prev_page_url: null,
    };
  },
  watch: {
    // for server side search
    search() {
      this.getMedia();
    },
    selectedCategory(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.getMedia();
      }
    },
  },
  mounted() {
    // initiate clipboard
    const clipboard = new Clipboard('.copy-link');
    clipboard.on('success', (e) => {
      this.copied = true;
      e.clearSelection();
    });
    this.getMedia();
    this.getCategories();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getMedia();
      this.getCategories();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // File Details handler
    showDetails(file) {
      this.file = Object.assign({}, file);
      this.isOpenDetailsDialog = true;
    },
    updateItems(files) {
      this.items = [];
      for (const file of this.files) {
        this.items.push({
          file,
          progress: 0,
          source: this.$axios.CancelToken.source(),
        });
      }
    },
    // cancel all upload
    clearAll() {
      if (this.items.length) {
        this.items.forEach((item) => {
          item.source && item.source.cancel('Request Canceled!');
        });
      }
      this.files = null;
      this.items = [];
    },
    fileSize(size) {
      return humanReadableFileSize(size);
    },
    removeFile(index) {
      this.items[index].source &&
        this.items[index].source.cancel('Request Canceled!');
      this.files.splice(index, 1);
      this.items.splice(index, 1);
    },
    uploadAll() {
      this.loading = true;
      const requests = [];
      this.items.forEach((item, index) => {
        requests.push(this.upload(item, index));
      });
      Promise.all(requests)
        .then(() => {
          this.loading = false;
          this.getMedia();
          this.files = [];
          this.items = [];
        })
        .catch(() => (this.loading = false));
    },
    // upload files
    async upload(item, index) {
      try {
        const formData = new FormData();

        formData.append('file', item.file);
        formData.append('categories', JSON.stringify(this.selectedCategories));
        const { message } = await this.$axios.$post(`asset`, formData, {
          onUploadProgress(event) {
            const { loaded, total } = event;
            item.progress = Math.round((loaded * 100) / total);
          },
          cancelToken: item.source.token,
        });
        this.files.splice(index, 1);
        this.items.splice(index, 1);
        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
      } catch (err) {
        if (this.$axios.isCancel(err)) {
          this.$store.commit('APP_NETWORK_ERROR', err.message);
        } else if (err.response.status === 422) {
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
    // get media
    async getMedia() {
      try {
        let url = ``;

        // get by search keyword
        if (this.search) {
          url += `&query=${this.search}`;
        }

        // get by category
        if (this.selectedCategory && this.selectedCategory !== 'all') {
          url += `&category=${this.selectedCategory}`;
        }

        const { data, links } = await this.$axios.$get(`asset?${url}`);
        this.media = assetFilesGroupBye(data, 'media_type');

        // eslint-disable-next-line camelcase
        this.next_page_url = links && links.next;
        // eslint-disable-next-line camelcase
        this.prev_page_url = links && links.prev;
      } catch (err) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          err.response && err.response.data.message
        );
      }
    },
    // update file
    updateFileHandler() {
      this.updateFile();
      this.isOpenDetailsDialog = false;
    },
    async updateFile() {
      const file = this.file;
      try {
        const { message } = await this.$axios.$patch(`asset/${file.id}`, file);
        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
        this.getMedia();
      } catch (err) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          err.response && err.response.data.message
        );
      }
    },
    // download files
    async downloadFile(file) {
      this.downloading = true;
      try {
        const response = await this.$axios({
          url: `${process.env.API_URL}/file-download/${file}`,
          method: 'GET',
          responseType: 'blob',
        });
        this.downloading = false;
        const contentDisposition = response.headers['content-disposition'];
        let fileName = 'unknown';
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
          );
          fileName = fileNameMatch[1];
        }
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (e) {
        this.downloading = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // delete message
    showConfirmDelete() {
      if (this.file) {
        confirmationAlert().then((res) => {
          if (res.value) {
            this.deleteFile(this.file.id);
          }
          return false;
        });
      }
    },
    // delete file
    async deleteFile(file) {
      try {
        const { message } = await this.$axios.$delete(
          `${process.env.API_URL}/asset/${file}`
        );
        this.file = Object.assign({}, { categories: [] });
        this.isOpenDetailsDialog = false;
        this.getMedia();
        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    async getCategories() {
      try {
        const { data } = await this.$axios.$get(`asset/category-tree`);
        this.categories = data;
        // Please insure, keep 'categoriesList' in instance.
        setCategoryNamesList(this, data);
      } catch (e) {}
    },

    // get prev media
    async prev() {
      try {
        // eslint-disable-next-line camelcase
        const { data, links } = await this.$axios.$get(this.prev_page_url);

        this.media = assetFilesGroupBye(data, 'media_type');
        // eslint-disable-next-line camelcase
        this.next_page_url = links && links.next;
        // eslint-disable-next-line camelcase
        this.prev_page_url = links && links.prev;
      } catch (err) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          err.response && err.response.data.message
        );
      }
    },
    // get next media
    async next() {
      try {
        // eslint-disable-next-line camelcase
        const { data, links } = await this.$axios.$get(this.next_page_url);

        this.media = assetFilesGroupBye(data, 'media_type');
        // eslint-disable-next-line camelcase
        this.next_page_url = links && links.next;
        // eslint-disable-next-line camelcase
        this.prev_page_url = links && links.prev;
      } catch (err) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          err.response && err.response.data.message
        );
      }
    },
  },
};

const assetFilesGroupBye = (items, key = 'media_type') => {
  const newObjByGroup = items.reduce((previous, current) => {
    previous[current[key]] && previous[current[key]].length !== 0
      ? previous[current[key]].push(current)
      : (previous[current[key]] = new Array(current));
    return previous;
  }, {});

  return newObjByGroup;
};
</script>
