<template>
  <div id="menuList">
    <v-container fluid>
      <v-row>
        <v-col>
          <h1>Frontend Top Menus</h1>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-text>
              <v-list>
                <draggable v-model="menus" handle=".v-btn" @end="onEnd">
                  <v-list-item v-for="item in menus" :key="item.id">
                    <v-list-item-icon>
                      <v-btn small fab>
                        <v-icon>mdi-drag</v-icon>
                      </v-btn>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ item.title }}
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                      <div>
                        <v-btn
                          v-can="`update menu`"
                          depressed
                          outlined
                          icon
                          fab
                          color="primary"
                          class="mr-2"
                          small
                          @click="editMenu(item, item)"
                        >
                          <v-icon> mdi-pencil </v-icon>
                        </v-btn>
                        <v-btn
                          v-can="`delete menu`"
                          depressed
                          outlined
                          icon
                          fab
                          color="pink"
                          small
                          @click="deleteMenu(item)"
                        >
                          <v-icon> mdi-delete </v-icon>
                        </v-btn>
                      </div>
                    </v-list-item-action>
                  </v-list-item>
                </draggable>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col v-can="`create menu`" cols="12" md="6">
          <validation-observer
            ref="form"
            v-slot="{ handleSubmit, invalid, reset }"
          >
            <v-form
              @submit.prevent="handleSubmit(onSubmit)"
              @reset.prevent="reset"
            >
              <v-card>
                <v-card-text>
                  <b-text
                    v-model="menu.title"
                    rules="required"
                    append-icon="mdi-label"
                    label="Title"
                    vid="title"
                  />
                  <b-text
                    v-model="menu.link"
                    vid="link"
                    rules="required"
                    append-icon="mdi-link"
                    label="Link"
                  />
                  <b-text
                    v-model="menu.logged_in_link"
                    vid="logged_in_link"
                    append-icon="mdi-link"
                    label="Logged In Link"
                    hint="menu link after logged in"
                    persistent-hint
                  />
                  <mdi-icon-selector v-model="menu.icon" class="mt-4" />
                  <v-checkbox
                    v-model="menu.is_external"
                    label="External Link?"
                  />
                  <active-inactive-dialog v-model="menu.status" />
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn outlined color="warning" @click.stop="cancelEdit">
                    Cancel
                  </v-btn>
                  <v-btn
                    :loading="loading"
                    :disabled="invalid"
                    color="primary"
                    type="submit"
                    outlined
                  >
                    {{ formTitle }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </validation-observer>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import { confirmDelete } from '@/plugins/sweetalert';

export default {
  name: 'TopMenuEntry',
  components: { draggable },
  data() {
    return {
      loading: false,
      defaultForm: {
        title: '',
        link: '',
        icon: '',
        status: true,
        logged_in_link: '',
        is_external: false,
      },
      menu: Object.assign({}, this.defaultForm),
      menus: [],
      editedIndex: -1,
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex > -1 ? 'Update Menu' : 'Create Menu';
    },
  },
  mounted() {
    this.getMenus();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getMenus();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get roles
    async getMenus() {
      try {
        const { data } = await this.$axios.$get(`top-menu`);
        this.menus = data;
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // get the icon
    iconSelected(icon) {
      this.menu.icon = icon;
    },
    // rearrange menus
    async onEnd() {
      try {
        const { message } = await this.$axios.$post(
          `top-menu-reorder`,
          this.menus
        );
        this.getMenus();
        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // cancel edit
    cancelEdit() {
      this.editedIndex = -1;
      this.menu = Object.assign({}, this.defaultForm);
      setTimeout(() => {
        this.$refs.form.reset();
      }, 100);
    },
    // edit menu
    editMenu(menu) {
      this.menu = Object.assign({}, menu);
      this.editedIndex = this.menus.indexOf(menu);
    },
    // delete menu
    deleteMenu(menu) {
      confirmDelete().then((res) => {
        if (res.value) {
          this.deleteRootMenu(menu.id);
        }
        return false;
      });
    },
    async deleteRootMenu(id) {
      try {
        const { message } = await this.$axios.$delete(`top-menu/${id}`);
        this.getMenus();
        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    onSubmit() {
      let url;
      let method;
      if (this.editedIndex > -1) {
        url = `top-menu/${this.menu.id}`;
        method = 'PATCH';
        this.update(url, method);
      } else {
        url = `top-menu`;
        method = 'POST';
        this.update(url, method);
      }
    },
    async update(url, method) {
      this.loading = true;
      try {
        const { message } = (
          await this.$axios({
            url,
            method,
            data: this.menu,
          })
        ).data;
        this.loading = false;
        this.cancelEdit();
        this.getMenus();
        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
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
  },
};
</script>
