<template>
  <div id="mediaAssets">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col>
          <h3>Upload Files</h3>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card min-height="200">
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
                          v-else
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
                            selection-type="independent"
                            return-object
                          ></v-treeview>
                        </scrollbar>
                      </template>
                      <template v-else>
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
                <template #default>
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
            <v-row justify="center" class="mt-3 pb-3 mb-5">
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
                  <v-icon right> mdi-cloud-upload </v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-flex xs12 class="d-flex pb-3">
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
      <v-row class="pl-3 pr-3 mb-3">
        <v-divider />
      </v-row>
      <v-row>
        <template v-if="media.length > 0">
          <v-col
            v-for="item in media"
            :key="item.id"
            cols="12"
            sm="3"
            md="3"
            lg="3"
            xl="2"
          >
            <v-card>
              <template v-if="item.media_type === 'Images'">
                <v-img :src="item.src" aspect-ratio="1" class="grey lighten-2">
                  <template #placeholder>
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
              </template>
              <template v-else-if="item.media_type === 'Audio'">
                <v-sheet
                  color="cyan lighten-3 fill-height"
                  min-height="248"
                  class="d-flex justify-center align-center"
                >
                  <audio controls :src="item.url">
                    Your browser does not support the
                    <code>audio</code> element.
                  </audio>
                </v-sheet>
              </template>
              <template v-else-if="item.media_type === 'Videos'">
                <v-sheet
                  color="cyan lighten-3 fill-height"
                  min-height="248"
                  class="d-flex justify-center align-center"
                >
                  <video controls :src="item.url" width="100%">
                    Your browser does not support the
                    <code>video</code> element.
                  </video>
                </v-sheet>
              </template>

              <template v-else>
                <v-sheet
                  color="cyan lighten-3 fill-height"
                  min-height="248"
                  class="d-flex justify-center align-center"
                >
                  <v-icon size="150"> mdi-folder </v-icon>
                </v-sheet>
              </template>
              <v-card-actions class="justify-center">
                <v-btn :data-clipboard-text="item.src" color="accent" outlined>
                  Copy Link
                </v-btn>
                <v-btn color="info" outlined @click.stop="details(item)">
                  Details
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </template>
        <v-col v-else>
          <div class="pt-5 mt-5 pb-5 mb-5 text-center">
            We didn't find anythings here!
          </div>
        </v-col>
      </v-row>
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
    </v-container>

    <!-- Copied alert  -->
    <v-snackbar v-model="copied" app top right color="success">
      Link Copied!
      <template #action="{ attrs }">
        <v-btn dark text icon v-bind="attrs" @click.native="copied = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">Edit file</span>
          <v-btn icon dark class="ma-0" @click.stop="dialog = false">
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
                  selection-type="independent"
                  return-object
                ></v-treeview>
              </scrollbar>
            </template>
            <template v-else>
              <div class="d-flex pt-5 mt-5 pb-5 justify-center red--text">
                Please, At first create a category!
              </div>
            </template>
          </v-card-text>
          <v-divider />
          <action-button-dialog
            :error="!(file && file.categories.length > 0) || !file.name"
            title="Update"
            @close="dialog = false"
          />
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Clipboard from 'clipboard';
import { humanReadableFileSize, setCategoryNamesList } from '@/util';
// import { confirmationAlert } from '@/plugins/sweetalert';

export default {
  name: 'MediaAsset',
  data() {
    return {
      loading: false,
      downloading: false,
      copied: false,
      language: 'en',
      dialog: false,
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
      next_page_url: null,
      prev_page_url: null,
      selectedCategory: '',
      selectedCategories: [],
      categories: [],
      categoriesList: [{ text: 'All', value: 'all' }],
      search: '',
      category: '',
      fileSearchCategory: '',
    };
  },
  computed: {},
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
    const clipboard = new Clipboard('.v-btn');
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
    details(file) {
      this.file = Object.assign({}, file);
      this.dialog = true;
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
          this.files = [];
          this.items = [];
          this.selectedCategories = [];
        })
        .catch(() => (this.loading = false))
        .finally(() => this.getMedia());
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

    updateFileHandler() {
      this.updateFile();
      this.dialog = false;
    },
    // update file
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

        // eslint-disable-next-line camelcase
        const { data, links } = await this.$axios.$get(`asset?${url}`);

        this.media = data;
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
    // get prev media
    async prev() {
      try {
        // eslint-disable-next-line camelcase
        const { data, links } = await this.$axios.$get(this.prev_page_url);

        this.media = data;
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

        this.media = data;
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
    // download files
    async downloadFile(file) {
      this.downloading = true;
      try {
        const response = await this.$axios({
          url: `/file-download/${file}`,
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
    async showConfirmDelete() {
      if (this.file) {
        // confirmationAlert().then((res) => {
        //   if (res.value) {
        //     this.deleteFile(this.file.id);
        //   }
        //   return false;
        // });
        if (
          await this.$root.$confirm('Delete', 'Are you sure?', {
            color: 'red',
          })
        ) {
          this.deleteFile(this.file.id);
        } else {
          return false;
        }
      }
    },
    // delete file
    async deleteFile(file) {
      try {
        const { message } = await this.$axios.$delete(`/asset/${file}`);
        this.dialog = false;
        this.file = Object.assign({}, { categories: [] });
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
  },
};
</script>
