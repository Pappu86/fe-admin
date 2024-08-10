<template>
  <div id="menuList">
    <v-container fluid>
      <v-row>
        <v-col>
          <h1>Backend Menus</h1>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-text>
              <v-list>
                <draggable
                  v-model="menus"
                  handle=".v-list-group__header__prepend-icon"
                  @end="onEnd"
                >
                  <v-list-group
                    v-for="item in menus"
                    :key="item.id"
                    prepend-icon="mdi-drag"
                    no-action
                  >
                    <template #activator>
                      <v-list-item-content>
                        <v-list-item-title v-text="item.title" />
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-menu :nudge-width="100" offset-x>
                          <template #activator="{ on }">
                            <v-btn x-small icon v-on="on">
                              <v-icon>mdi-dots-vertical</v-icon>
                            </v-btn>
                          </template>

                          <v-list>
                            <v-list-item
                              v-can="`update menu`"
                              @click="editMenu(item)"
                            >
                              <v-list-item-title>
                                <v-icon color="teal"> mdi-pencil </v-icon>
                                <span>&nbsp;Edit</span>
                              </v-list-item-title>
                            </v-list-item>
                            <v-list-item
                              v-can="`delete menu`"
                              @click="deleteMenu(item)"
                            >
                              <v-list-item-title>
                                <v-icon color="pink"> mdi-delete </v-icon>
                                <span>&nbsp;Delete</span>
                              </v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="addMenu(item)">
                              <v-list-item-title>
                                <v-icon color="primary">
                                  mdi-checkbox-multiple-blank-outline
                                </v-icon>
                                <span>&nbsp;Add Children</span>
                              </v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </v-list-item-action>
                    </template>
                    <draggable :list="item.children" @end="onEnd">
                      <div v-for="subItem in item.children" :key="subItem.id">
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title>
                              {{ subItem.title }}
                            </v-list-item-title>
                          </v-list-item-content>
                          <v-list-item-action
                            style="flex-direction: row; min-width: 75px"
                          >
                            <v-btn
                              v-can="`update menu`"
                              depressed
                              outlined
                              icon
                              fab
                              color="primary"
                              class="mr-2"
                              small
                              @click="editChild(item, subItem)"
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
                              @click="deleteMenu(subItem)"
                            >
                              <v-icon> mdi-delete </v-icon>
                            </v-btn>
                          </v-list-item-action>
                        </v-list-item>
                        <v-divider />
                      </div>
                    </draggable>
                  </v-list-group>
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
                    required
                  />
                  <template v-if="add_children">
                    <b-text
                      key="link"
                      v-model="menu.link"
                      rules="required"
                      append-icon="mdi-link"
                      label="Link"
                      required
                    />
                  </template>
                  <icon-selector @icon-selected="iconSelected" />
                  <validation-provider
                    v-slot="{ errors, valid, dirty }"
                    name="Roles"
                    rules="required"
                  >
                    <v-select
                      v-model="menu.roles"
                      :items="roles"
                      label="Select Roles"
                      item-text="name"
                      item-value="id"
                      :error-messages="errors"
                      :success="valid && dirty"
                      multiple
                      chips
                      required
                    />
                  </validation-provider>
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

export default {
  name: 'MenuEntry',
  components: { draggable },
  data() {
    return {
      loading: false,
      menu: {
        title: '',
        icon: '',
        status: true,
        roles: [],
      },
      roles: [],
      menus: [],
      editedIndex: -1,
      add_children: false,
      update_children: false,
      defaultItem: {
        title: '',
        icon: '',
        status: true,
        roles: [],
      },
    };
  },
  computed: {
    formTitle() {
      if (this.add_children) {
        if (this.update_children) {
          return 'Update Children';
        } else {
          return 'Add Children';
        }
      } else {
        return this.editedIndex > -1 ? 'Update Menu' : 'Create Menu';
      }
    },
  },
  mounted() {
    this.getRoles();
    this.getMenus();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getRoles();
      this.getMenus();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get roles
    async getRoles() {
      try {
        const { data } = await this.$axios.$get(`role-all`);
        this.roles = data;
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // get roles
    async getMenus() {
      try {
        const { data } = await this.$axios.$get(`menu`);
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
        const { message } = await this.$axios.$post(`menu-reorder`, this.menus);
        this.getMenus();
        this.$store.dispatch('common/getMenus');
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
      this.update_children = false;
      this.menu = Object.assign({}, this.defaultItem);
      setTimeout(() => {
        this.add_children = false;
        this.$refs.form.reset();
      }, 100);
    },
    // edit menu
    editMenu(menu) {
      this.menu = Object.assign({}, menu);
      this.editedIndex = this.menus.indexOf(menu);
    },
    // edit child menu
    editChild(parent, menu) {
      this.menu = Object.assign({}, menu);
      this.add_children = true;
      this.update_children = true;
      this.editedIndex = this.menus.indexOf(parent);
    },
    // add menu
    addMenu(menu) {
      this.add_children = true;
      this.editedIndex = this.menus.indexOf(menu);
      this.menu.parent_id = menu.id;
      this.menu.id = menu.id;
    },
    // delete item
    async deleteMenu(item) {
      if (
        await this.$root.$confirm('Delete', 'Are you sure?', {
          color: 'red',
        })
      ) {
        this.deleteRootMenu(item.id);
      } else {
        return false;
      }
    },
    async deleteRootMenu(id) {
      try {
        const { message } = await this.$axios.$delete(`menu/${id}`);
        this.getMenus();
        this.$store.dispatch('common/getMenus');
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
        url = `menu/${this.menu.id}`;
        method = 'PATCH';
        this.update(url, method);
      } else {
        url = `menu`;
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
        this.$store.dispatch('common/getMenus');
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
