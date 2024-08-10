<template>
  <div id="advertisementEntry">
    <v-container fluid>
      <v-row justify="space-between" class="ma-0 py-3">
        <h3>{{ formTitle }}</h3>
      </v-row>
      <v-row>
        <v-col>
          <validation-observer ref="form" v-slot="{ handleSubmit, invalid, reset }">
            <v-form @submit.prevent="handleSubmit(updateAdvertisement)" @reset.prevent="reset">
              <v-card>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="advertisement.title"
                        rules="required"
                        outlined
                        label="Title"
                        vid="title"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <b-auto-complete
                        v-model="advertisement.provider_id"
                        :items="providers"
                        rules="required"
                        outlined
                        label="Select Provider"
                      />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="4">
                      <b-auto-complete
                        v-model="position.page"
                        :items="pages"
                        rules="required"
                        outlined
                        label="Select Page"
                        @change="getSections"
                      />
                    </v-col>
                    <v-col cols="12" sm="4">
                      <b-auto-complete
                        v-model="position.section"
                        :items="sections"
                        rules="required"
                        outlined
                        label="Select Section"
                        @change="getPositions"
                      />
                    </v-col>
                    <v-col cols="12" sm="4">
                      <b-auto-complete
                        v-model="advertisement.position_id"
                        :items="positions"
                        rules="required"
                        outlined
                        label="Select Position"
                      />
                    </v-col>
                  </v-row>
                  <v-row justify="center">
                    <div class="pa-3">
                      <h4 class="text-center text-h6">Advertisement Type</h4>
                      <v-divider></v-divider>
                      <v-radio-group v-model="advertisement.type" row>
                        <v-radio label="Image" value="image" />
                        <v-radio label="Video" value="video" />
                        <v-radio label="Document" value="document" />
                        <v-radio label="Iframe" value="iframe" />
                      </v-radio-group>
                    </div>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <b-text v-model="advertisement.link" outlined label="Link" vid="link" />
                      <v-row>
                        <v-col cols="12" sm="6">
                          <b-switch v-model="advertisement.is_external" label="External Link" />
                          <b-switch v-model="advertisement.is_modal" label="Popup Ads" />
                          <b-switch v-model="advertisement.is_auto_modal" label="Auto Popup Ads" />
                          <b-text
                            v-if="advertisement.is_auto_modal"
                            v-model="advertisement.auto_modal_duration"
                            rules="numeric"
                            outlined
                            label="Auto Popup Duration"
                          />
                        </v-col>
                        <v-col cols="12" sm="6">
                          <DatePicker
                            v-if="loaded"
                            v-model="range"
                            mode="dateTime"
                            is-range
                            :is-dark="$vuetify.theme.dark"
                          >
                            <template #default="{ inputValue, inputEvents }">
                              <v-subheader>Start and End Date</v-subheader>
                              <v-divider />
                              <div
                                class="date-picker v-input v-text-field v-text-field--single-line v-text-field--solo v-text-field--is-booted v-text-field--enclosed v-text-field--placeholder"
                              >
                                <div class="v-input__control">
                                  <div class="v-input__slot">
                                    <div class="v-text-field__slot">
                                      <input
                                        :value="`${inputValue.start} ~ ${inputValue.end}`"
                                        type="text"
                                        readonly
                                        placeholder="Start Date and End Date"
                                        v-on="inputEvents.start"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </template>
                          </DatePicker>
                          <b-switch
                            v-model="advertisement.has_mobile_content"
                            label="Has Mobile Content"
                          />
                        </v-col>
                      </v-row>

                      <v-subheader>Active or Inactive</v-subheader>
                      <v-divider />
                      <active-inactive v-model="advertisement.status" />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <div v-if="advertisement.type === 'image'">
                        <image-uploader v-model="advertisement.image" />
                        <template v-if="advertisement.has_mobile_content">
                          <h5 class="text-h6">Mobile Content</h5>
                          <image-uploader v-model="advertisement.mobile_image" />
                        </template>
                        <div v-if="isEnableMultiAds()" class="mt-4">
                          <v-row>
                            <v-col>
                              <v-subheader>Aditional Image</v-subheader>
                              <v-btn
                                color="primary"
                                class="mx-4"
                                outlined
                                large
                                @click.stop="openDialog('images')"
                              >
                                <v-icon>mdi-plus</v-icon>
                              </v-btn>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col v-for="(image, i) in aditionalImages" :key="i" cols="12" sm="4">
                              <v-img :src="image.src" />
                              <v-card-actions class="justify-center">
                                <v-btn color="teal" outlined @click.stop="openDialog('images')">
                                  <v-icon>mdi-pencil</v-icon>
                                </v-btn>
                                <v-btn color="pink" outlined @click="removeImage('images', i)">
                                  <v-icon>mdi-delete</v-icon>
                                </v-btn>
                              </v-card-actions>
                            </v-col>
                          </v-row>
                        </div>
                      </div>
                      <div v-if="advertisement.type === 'video'">
                        <video-uploader v-model="advertisement.video" />
                        <template v-if="advertisement.has_mobile_content">
                          <v-subheader>Mobile Content</v-subheader>
                          <v-divider />
                          <video-uploader v-model="advertisement.mobile_video" />
                        </template>
                      </div>
                      <div v-if="advertisement.type === 'document'">
                        <document-uploader v-model="advertisement.document" />
                        <template v-if="advertisement.has_mobile_content">
                          <v-subheader>Mobile Content</v-subheader>
                          <v-divider />
                          <document-uploader v-model="advertisement.mobile_document" />
                        </template>
                      </div>
                      <div v-if="advertisement.type === 'iframe'">
                        <b-text-area
                          v-model="advertisement.content"
                          rules="required"
                          outlined
                          rows="10"
                          label="Iframe Script"
                          vid="content"
                        />
                        <template v-if="advertisement.has_mobile_content">
                          <v-subheader>Mobile Content</v-subheader>
                          <v-divider />
                          <b-text-area
                            v-model="advertisement.mobile_content"
                            rules="required"
                            outlined
                            rows="10"
                            label="Iframe Script"
                            vid="mobile_content"
                          />
                        </template>
                      </div>
                      <div v-if="advertisement.has_mobile_content" class="mt-4">
                        <b-text
                          v-model="advertisement.mobile_link"
                          outlined
                          label="Mobile Link"
                          vid="mobile_link"
                        />
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
                <action-button :loading="loading" :error="invalid" :title="formTitle" />
              </v-card>
            </v-form>
          </validation-observer>
        </v-col>
      </v-row>
    </v-container>
    <v-dialog v-model="mediaDialog" scrollable max-width="95vw">
      <v-card id="mediaDialog">
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">Upload Files</span>
          <v-btn icon dark class="ma-0" @click.stop="mediaDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <media-library @use="useThisFile" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import DatePicker from 'v-calendar/lib/components/date-picker.umd';
import { addMonths, parseISO } from 'date-fns';

export default {
  name: 'AdvertisementEntry',
  components: { DatePicker },
  data() {
    return {
      menu: false,
      loading: false,
      language: 'en',
      defaultAdvertisement: {
        title: '',
        subtitle: '',
        type: 'image',
        content: null,
        link: '',
        is_external: true,
        status: true,
      },
      loaded: false,
      range: {
        start: new Date(),
        end: addMonths(new Date(), 1),
      },
      advertisement: Object.assign({}, this.defaultAdvertisement),
      providers: [],
      pages: [],
      sections: [],
      positions: [],
      position: {
        page: '',
        section: '',
      },
      dailog_type: 'image',
      mediaDialog: false,
      aditionalImages: [],
      isMultiAds: 0,
      isEnableMultiAds() {
        if (
          this.position.page === 'home' &&
          (this.position.section === 'header' ||
            this.position.section === 'hero_section')
        ) {
          this.isMultiAds = 1;
          return true;
        } else {
          this.isMultiAds = 0;
          return false;
        }
      },
    };
  },
  computed: {
    formTitle() {
      return this.$route.query.edit === 'true'
        ? 'Update Advertisement'
        : 'Update Advertisement';
    },
  },
  async mounted() {
    await this.getProviders();
    await this.getPages();
    await this.getAdvertisement();
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  methods: {
    async updateAdvertisement() {
      this.loading = true;
      try {
        const formData = new FormData();
        formData.append('_method', 'PATCH');

        if (!(this.advertisement.image instanceof File)) {
          delete this.advertisement.image;
        }
        if (!(this.advertisement.video instanceof File)) {
          delete this.advertisement.video;
        }
        if (!(this.advertisement.document instanceof File)) {
          delete this.advertisement.document;
        }
        if (!(this.advertisement.mobile_image instanceof File)) {
          delete this.advertisement.mobile_image;
        }
        if (!(this.advertisement.mobile_video instanceof File)) {
          delete this.advertisement.mobile_video;
        }
        if (!(this.advertisement.mobile_document instanceof File)) {
          delete this.advertisement.mobile_document;
        }
        Object.keys(this.advertisement).forEach((key) => {
          if (this.advertisement[key]) {
            formData.append(key, this.advertisement[key]);
          }
        });
        formData.append('position', JSON.stringify(this.position));
        if (this.range.start) {
          formData.append('start_date', this.range.start.toISOString());
        }
        if (this.range.end) {
          formData.append('end_date', this.range.end.toISOString());
        }

        const aditionalImages = this.aditionalImages;
        if (this.isMultiAds) {
          formData.append('is_multi_ads', 1);
          // For multi ads implement
          if (aditionalImages.length > 0) {
            aditionalImages.forEach(function (element, index) {
              formData.append(
                `images[${index}][advertisement_id]`,
                aditionalImages[index].advertisement_id
              );
              formData.append(
                `images[${index}][src]`,
                aditionalImages[index].src
              );
            });
          }
        }

        const { message } = await this.$axios.$post(
          `ads/advertisement/${this.$route.params.id}`,
          formData
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/ads/advertisements',
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
    // get advertisement for edit
    async getAdvertisement() {
      try {
        const { data } = await this.$axios.$get(
          `ads/advertisement/${this.$route.params.id}`
        );
        this.advertisement = data;
        if (data.type === 'image') {
          this.advertisement.image = data.content;
          this.advertisement.content = null;
          this.advertisement.mobile_image = data.mobile_content;
          this.advertisement.mobile_content = null;
          this.advertisement.additional_ads = data.additional_ads;
          this.aditionalImages = data.additional_ads;
        } else if (data.type === 'video') {
          this.advertisement.video = data.content;
          this.advertisement.content = null;
          this.advertisement.mobile_video = data.mobile_content;
          this.advertisement.mobile_content = null;
        } else if (data.type === 'document') {
          this.advertisement.document = data.content;
          this.advertisement.content = null;
          this.advertisement.mobile_document = data.mobile_content;
          this.advertisement.mobile_content = null;
        } else {
          this.advertisement.content = data.content;
          this.advertisement.mobile_content = data.mobile_content;
        }
        if (this.advertisement.position) {
          this.position = JSON.parse(this.advertisement.position);
          await this.getSections(this.position.page);
          await this.getPositions(this.position.section);
        }
        if (this.advertisement.start_date) {
          this.range.start = parseISO(this.advertisement.start_date);
        }
        if (this.advertisement.end_date) {
          this.range.end = parseISO(this.advertisement.end_date);
        }
      } catch (e) {
        Object.assign(this.advertisement, this.defaultAdvertisement);
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      } finally {
        this.loaded = true;
      }
    },
    async getProviders() {
      try {
        const { data } = await this.$axios.$get(`ads/providers`);
        this.providers = data;
      } catch (e) {}
    },
    async getPages() {
      try {
        const { data } = await this.$axios.$get(`ads/pages`);
        this.pages = data;
      } catch (e) {}
    },
    async getSections(page) {
      try {
        const { data } = await this.$axios.$get(`ads/sections/${page}`);
        this.sections = data;
      } catch (e) {}
    },
    async getPositions(section) {
      try {
        const { data } = await this.$axios.$get(
          `ads/positions/${this.position.page}/${section}`
        );
        this.positions = data;
      } catch (e) {}
    },
    // open image select dialog
    openDialog(type) {
      this.dailog_type = type;
      this.mediaDialog = true;
    },
    // remove selected image
    removeImage(type, index) {
      this.dailog_type = null;
      this.aditionalImages.splice(index, 1);
    },
    // update product image property
    useThisFile(event) {
      this.aditionalImages.push({
        advertisement_id: this.$route.params.id,
        src: event.src,
      });
      this.mediaDialog = false;
    },
  },
};
</script>
