<template>
  <div id="postEntry">
    <v-progress-linear v-if="loading" :indeterminate="loading" />
    <validation-observer ref="form" v-slot="{ handleSubmit, invalid, reset }">
      <v-form @submit.prevent="handleSubmit(onSubmit(true))" @reset.prevent="reset">
        <v-container fluid>
          <v-row>
            <v-col cols="12" sm="8">
              <v-card>
                <v-card-title>
                  <h4>Edit Post</h4>
                  <v-spacer />
                  <active-chip :status="post.status" />
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <b-text
                    v-model="post.title"
                    rules="required|min:10|max:180"
                    outlined
                    label="Title"
                    counter="180"
                    vid="title"
                    required
                  />
                  <b-text
                    v-model="post.short_title"
                    rules="required|min:10|max:180"
                    outlined
                    label="Short Title"
                    counter="180"
                    vid="short_title"
                    required
                    @blur="checkSlug(post.short_title)"
                  />
                  <b-text
                    v-model="post.slug"
                    rules="required"
                    outlined
                    label="Slug"
                    vid="slug"
                    required
                  />
                  <b-text
                    v-model="post.shoulder"
                    rules="min:5|max:180"
                    outlined
                    label="Shoulder"
                    counter="180"
                  />
                  <b-text
                    v-model="post.hanger"
                    rules="min:5|max:180"
                    outlined
                    label="Hanger"
                    counter="180"
                  />
                  <b-text-area
                    v-model="post.excerpt"
                    rules="min:10|max:300"
                    outlined
                    label="Excerpt"
                    counter="300"
                  />
                  <v-row>
                    <v-col>
                      <v-subheader class="pa-0">Image</v-subheader>
                      <image-uploader v-model="post.image" class="mb-5" />
                      <b-text v-model="post.caption" outlined label="Image Caption" />
                      <b-text v-model="post.source" outlined label="Image Source" />
                    </v-col>
                    <v-col>
                      <v-subheader class="pa-0">Meta Image</v-subheader>
                      <image-uploader v-model="post.meta_image" />
                    </v-col>
                  </v-row>
                  <v-subheader class="pa-0">Content</v-subheader>
                  <editor
                    id="content"
                    v-model="post.content"
                    rules="required"
                    class="mt-4"
                    :init="init"
                    :plugins="plugins"
                    :toolbar="toolbar"
                  ></editor>
                  <br />
                  <b-text
                    v-model="post.meta_title"
                    rules="min:10|max:180"
                    outlined
                    label="Meta Title"
                    counter="180"
                  />
                  <b-text-area
                    v-model="post.meta_description"
                    rules="min:10|max:300"
                    outlined
                    label="Meta Description"
                    counter="300"
                  />
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="4">
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Publish</h4>
                  <v-spacer />
                  <b-language v-model="language" />
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <b-date-time
                    v-model="post.datetime"
                    rules="required"
                    outlined
                    prepend-icon="mdi-calendar"
                    label="Post Publish Date"
                    @isCustom="isEditedDatetime"
                  />
                  <v-row>
                    <v-col>
                      <v-checkbox
                        v-model="post.is_fb_article"
                        label="Is FB Article?"
                        color="primary"
                      />
                    </v-col>
                    <v-col>
                      <v-checkbox v-model="post.is_slider" label="Is Slider?" color="primary" />
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-divider />
                <v-card-actions class="justify-center">
                  <v-btn outlined @click="$router.back()">Cancel</v-btn>
                  <v-btn
                    outlined
                    color="primary"
                    :disabled="isInvalidForm(invalid)"
                    @click="handleSubmit(onSubmit(false))"
                  >Save</v-btn>
                  <v-btn
                    id="publishBtn"
                    v-can="`publish post`"
                    outlined
                    color="success"
                    :disabled="isInvalidForm(invalid)"
                    @click="handleSubmit(onSubmit(true))"
                  >Publish</v-btn>
                </v-card-actions>
              </v-card>
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Reporter</h4>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <b-auto-complete
                    v-model="post.reporter_id"
                    :items="reporters"
                    rules="required"
                    outlined
                    item-text="name"
                    item-value="id"
                    label="Select Reporter"
                  />
                </v-card-text>
              </v-card>
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Category</h4>
                </v-card-title>
                <v-divider />
                <v-sheet class="pa-2">
                  <v-text-field
                    v-model="category"
                    placeholder="Search Category"
                    solo
                    hide-details
                    clearable
                    clear-icon="mdi-close-circle-outline"
                  ></v-text-field>
                </v-sheet>
                <scrollbar style="height: 300px">
                  <validation-provider
                    v-slot="{ errors, valid, dirty }"
                    name="Categories"
                    rules="required"
                  >
                    <v-treeview
                      v-model="selectedCategories"
                      :items="categories"
                      :search="category"
                      selectable
                      open-all
                      :error-messages="errors"
                      :success="valid && dirty"
                      selection-type="independent"
                      color="primary"
                    ></v-treeview>
                  </validation-provider>
                </scrollbar>
              </v-card>
              <v-card v-if="opedCategory" class="mb-4">
                <v-card-title>
                  <h4>Op-Ed Category</h4>
                </v-card-title>
                <v-divider />
                <v-sheet class="pa-2">
                  <v-text-field
                    v-model="category"
                    placeholder="Search Category"
                    solo
                    hide-details
                    clearable
                    clear-icon="mdi-close-circle-outline"
                  ></v-text-field>
                </v-sheet>
                <div>
                  <scrollbar style="height: 300px">
                    <v-treeview
                      v-model="selectedOpedCategories"
                      :items="opedCategories"
                      :search="category"
                      selectable
                      open-all
                      selection-type="independent"
                      color="primary"
                    ></v-treeview>
                  </scrollbar>
                </div>
              </v-card>
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Type</h4>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <b-auto-complete
                    v-model="post.type"
                    :items="types"
                    rules="required"
                    outlined
                    label="Select Type"
                  />
                </v-card-text>
              </v-card>
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Tag</h4>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <v-combobox
                    v-model="post.tags"
                    :items="tags"
                    :search-input.sync="searchTag"
                    hide-selected
                    label="Select Tag"
                    item-value="id"
                    item-text="name"
                    multiple
                    outlined
                    small-chips
                  >
                    <template #no-data>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            No results matching "
                            <strong>{{ searchTag }}</strong>". Press
                            <kbd>enter</kbd> to create a
                            new tag.
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                  </v-combobox>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </validation-observer>
  </div>
</template>

<script>
// Import TinyMCE
// eslint-disable-next-line no-unused-vars
import tinymce from 'tinymce/tinymce';
// A theme is also required
import 'tinymce/themes/silver';

// import plugins
import 'tinymce/plugins/print';
import 'tinymce/plugins/code';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/link';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/directionality';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/visualchars';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/image';
import 'tinymce/plugins/media';
import 'tinymce/plugins/template';
import 'tinymce/plugins/table';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/hr';
import 'tinymce/plugins/pagebreak';
import 'tinymce/plugins/nonbreaking';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/save';
import 'tinymce/plugins/autosave';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/noneditable';
import 'tinymce/plugins/quickbars';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/emoticons/js/emojis';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/spellchecker';
import 'tinymce/plugins/textpattern';
import 'tinymce/plugins/help';
import 'tinymce/plugins/importcss';
import 'tinymce/icons/default';

import Editor from '@tinymce/tinymce-vue';

export default {
  name: 'PostEdit',
  components: { Editor },
  data() {
    return {
      language: 'en',
      defaultForm: {
        category_id: null,
        reporter_id: '',
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        datetime: null,
        status: true,
        image: null,
        meta_image: null,
        is_featured: false,
        type: '',
        tags: [],
      },
      post: Object.assign({}, this.defaultForm),
      defaultopedPost: {
        id: null,
        category_id: null,
        opedCategory_id: null,
        post_id: null,
      },
      opedPost: Object.assign({}, this.defaultopedPost),
      category: '',
      categories: [],
      opedCategories: [],
      selectedCategories: [],
      selectedOpedCategories: [],
      reporters: [],
      types: [],
      tags: [],
      searchTag: '',
      dateModal: false,
      timeModal: false,
      loading: false,
      opedCategory: false,
      toolbar:
        'undo redo | bold italic underline strikethrough | image media fileupload | alignleft aligncenter alignright alignjustify |  numlist bullist | fontselect fontsizeselect formatselect paste pastetext | outdent indent | forecolor backcolor casechange permanentpen formatpainter removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | link anchor codesample | ltr rtl | code | wordcount',
      plugins:
        'print preview paste importcss searchreplace autolink autosave save directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor insertdatetime advlist lists wordcount textpattern noneditable help charmap quickbars emoticons code wordcount',
      init: {
        height: 500,
        content_css: window.matchMedia('(prefers-color-scheme: dark)').matches
          ? '/skins/content/dark/content.css'
          : '/skins/content/default/content.css',
        skin_url: window.matchMedia('(prefers-color-scheme: dark)').matches
          ? '/skins/ui/oxide-dark'
          : '/skins/ui/oxide',
        toolbar_mode: 'sliding',
        image_caption: true,
        browser_spellcheck: true,
        relative_urls: false,
        remove_script_host: false,
        convert_urls: true,
        image_advtab: true,
        menubar: true,
        branding: false,
        block_unsupported_drop: false,
        paste_data_images: false,
        automatic_uploads: true,
        images_upload_credentials: true,
        images_upload_handler: (blobInfo, success, failure, progress) => {
          const xhr = new XMLHttpRequest();
          xhr.withCredentials = false;
          xhr.open(
            'POST',
            `${this.$config.apiUrl}/post-assets/${this.$route.params.id}`
          );
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
          xhr.setRequestHeader(
            'Authorization',
            this.$auth.strategy.token.get()
          );

          xhr.upload.onprogress = function (e) {
            progress((e.loaded / e.total) * 100);
          };

          xhr.onload = () => {
            if (xhr.status !== 200) {
              failure('HTTP Error: ' + xhr.status);
              return;
            }
            const json = JSON.parse(xhr.responseText);

            if (!json || typeof json.location !== 'string') {
              failure('Invalid JSON: ' + xhr.responseText);
              return;
            }

            this.$store.commit(
              'CRUD_SUCCESS_NO_ACTION',
              'Image Uploaded Successfully'
            );

            success(json.location);
          };

          xhr.onerror = function () {
            failure(
              'Image upload failed due to a XHR Transport error. Code: ' +
                xhr.status
            );
          };

          const formData = new FormData();
          formData.append('file', blobInfo.blob(), blobInfo.filename());

          xhr.send(formData);
        },
        file_picker_types: 'image',
        file_picker_callback: (callback, value, meta) => {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.onchange = async (e) => {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('file', file);
            try {
              const { location, name } = await this.$axios.$post(
                `${this.$config.apiUrl}/post-assets/${this.$route.params.id}`,
                formData
              );

              this.$store.commit(
                'CRUD_SUCCESS_NO_ACTION',
                'Image Uploaded Successfully'
              );

              // Provide image and alt text for the image dialog
              if (meta.filetype === 'image') {
                callback(location, { alt: name });
              }
            } catch (err) {
              this.$store.commit(
                'APP_NETWORK_ERROR',
                err.response && err.response.data.message
              );
            }
          };

          input.click();
        },
        setup: (editor) => {
          editor.ui.registry.addButton('fileupload', {
            icon: 'new-document',
            tooltip: 'Insert Document',
            onAction: () => {
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute(
                'accept',
                '.pdf, .xls, .xlsx, .doc, .docx, .ppt, .pptx'
              );
              input.onchange = async (e) => {
                const file = e.target.files[0];
                const formData = new FormData();
                formData.append('file', file);
                try {
                  const { location, name } = await this.$axios.$post(
                    `${this.$config.apiUrl}/post-assets/${this.$route.params.id}`,
                    formData
                  );
                  this.$store.commit(
                    'CRUD_SUCCESS_NO_ACTION',
                    'Document Uploaded Successfully'
                  );

                  const iframe = `<div class="v-card v-sheet" style="width: 600px; min-height: 300px; margin: auto;">
                    <div class="player-wrapper">
                      <div class="player">
                        <iframe class="document" src="https://docs.google.com/viewer?embedded=true&url=${location}" frameborder="0"
                        allowfullscreen style="width: 100%; height: 100%;"></iframe>
                      </div>
                    </div>
                    <div class="v-card__title justify-center">
                      <a href="${location}" title="${name}" class="uploadFile">Download Document</a>
                    </div>
                  </div>`;

                  editor.insertContent(iframe);
                } catch (err) {
                  if (err.response.status === 422) {
                    const { errors } = err.response.data;
                    const fields = Object.values(errors);
                    for (let i = 0; i < fields.length; i++) {
                      for (let j = 0; j < fields[i].length; j++) {
                        this.$store.commit(
                          'APP_NETWORK_ERROR',
                          `${fields[i][j]}`
                        );
                      }
                    }
                  } else {
                    this.$store.commit(
                      'APP_NETWORK_ERROR',
                      err.response && err.response.data.message
                    );
                  }
                }
              };

              input.click();
            },
          });
        },
      },
      isInvalidForm(invalid) {
        return invalid || !this.post?.image;
      },
      isCustomDatetime: false,
    };
  },
  computed: {
    // insert view ids
    views() {
      return this.$config.opEdCategories.split(',').map(Number);
    },
  },
  watch: {
    async language() {
      await this.getPost();
    },
    selectedCategories(value) {
      const viewOne = value.includes(this.views[0]);
      const viewTwo = value.includes(this.views[1]);
      const viewThree = value.includes(this.views[2]);
      const viewFour = value.includes(this.views[3]);
      const viewFive = value.includes(this.views[4]);
      const viewSix = value.includes(this.views[5]);
      if (viewOne || viewTwo || viewThree || viewFour || viewFive || viewSix) {
        this.opedCategory = true;
      } else {
        this.opedCategory = false;
      }

      if (value.length > 1) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          'Please Select Only 1 Category'
        );
        this.selectedCategories = [];
      }
    },
    selectedOpedCategories(value) {
      if (value.length > 1) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          'Please Select Only 1 Category'
        );
        this.selectedOpedCategories = [];
      }
    },
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  async mounted() {
    await this.getCategories();
    await this.getTypes();
    await this.getReporters();
    await this.getTags();
    await this.getPost();
    if (this.selectedOpedCategories) {
      await this.getOpedPost();
    }

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getPost();
    });
  },
  methods: {
    isEditedDatetime(value) {
      this.isCustomDatetime = value;
    },
    onSubmit(status) {
      this.post.status = status;
      if (this.selectedCategories.length) {
        this.post.category_id = this.selectedCategories[0];
      }

      // Auto fill excerpt by content text
      // if (!this.post.excerpt && this.post.content) {
      //   const contentHtml = this.post.content;
      //   const createElement = document.createElement("div");
      //   createElement.innerHTML = contentHtml;
      //   const contentStr = this.shorten(createElement.innerText, 100, ' ', ' ...');
      //   this.post.excerpt = contentStr;
      // }

      if (this.opedCategory) {
        this.opedPost.category_id = this.selectedOpedCategories[0];
        this.opedPost.post_id = parseInt(this.$route.params.id);
        this.opedPost.opedCategory_id = this.selectedCategories[0];

        this.publishOpedPost();
      } else {
        this.publishPost();
      }
    },
    async publishPost() {
      this.loading = true;
      try {
        const formData = new FormData();
        formData.append('_method', 'PATCH');
        Object.keys(this.post).forEach((key) => {
          if (this.post[key]) {
            formData.append(key, this.post[key]);
          }
        });
        // For datetime change identifier
        formData.append('isCustomDatetime', this.isCustomDatetime);

        const { message } = await this.$axios.$post(
          `${this.language}/post/${this.$route.params.id}`,
          formData
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/contents/posts',
        });
      } catch (err) {
        this.loading = false;
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
    async publishOpedPost() {
      this.loading = true;
      try {
        const formData = new FormData();
        if (this.opedPost.id) {
          formData.append('_method', 'PATCH');
          Object.keys(this.opedPost).forEach((key) => {
            if (this.opedPost[key]) {
              formData.append(key, this.opedPost[key]);
            }
          });
          const { message } = await this.$axios.$post(
            `/opedpost/${this.opedPost.id}`,
            formData
          );
          this.loading = false;
          this.$store.dispatch('crud_success', {
            message,
          });
        } else {
          formData.append('_method', 'POST');
          Object.keys(this.opedPost).forEach((key) => {
            if (this.opedPost[key]) {
              formData.append(key, this.opedPost[key]);
            }
          });
          const { message } = await this.$axios.$post(`/opedpost`, formData);
          this.loading = false;
          this.$store.dispatch('crud_success', {
            message,
          });
        }

        this.publishPost();
      } catch (err) {
        this.loading = false;
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
    async getPost() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/post/${this.$route.params.id}`
        );
        this.post = Object.assign({}, data);
        if (this.post.category_id) {
          this.selectedCategories.push(this.post.category_id);
        }
      } catch (e) {
        this.$router.replace('/posts');
      }
    },
    async getOpedPost() {
      // Object.assign(this.opedPost, this.defaultopedPost);
      try {
        const url = `&post_id=${this.$route.params.id}`;
        const { data } = await this.$axios.$get(`/opedpost?${url}`);
        this.opedPost = Object.assign({}, data[0]);
        this.selectedOpedCategories.push(this.opedPost.category_id);
      } catch (e) {
        this.$router.replace('/posts');
      }
    },
    // check slug
    async checkSlug(title) {
      try {
        const { slug } = await this.$axios.$get(
          `${this.language}/post-slug/${encodeURIComponent(title)}`
        );

        this.post.slug = slug;
      } catch (e) {
        this.post.slug = null;
      }
    },
    async getCategories() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/categories-tree`
        );
        this.categories = data;
        this.opedCategories = [...this.categories];
        this.opedCategories.splice(5, 1);
      } catch (e) {}
    },
    async getTypes() {
      try {
        const { data } = await this.$axios.$get(`type-all`);
        this.types = data;
      } catch (e) {}
    },
    async getReporters() {
      try {
        const { data } = await this.$axios.$get(`${this.language}/reporters`);
        this.reporters = data;
      } catch (e) {}
    },
    async getTags() {
      try {
        const { data } = await this.$axios.$get(`${this.language}/tags`);
        this.tags = data;
      } catch (e) {}
    },
  },
};
</script>
