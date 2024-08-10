<template>
  <div id="types">
    <v-container fluid>
      <v-row>
        <v-col>
          <div style="display: flex">
            <h3>Types</h3>
            <v-spacer />
            <v-btn
              v-can="`create type`"
              color="primary"
              :loading="creating"
              @click="create"
            >
              New Type
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
            <v-card-text>
              <v-data-table
                :headers="main_headers"
                :items="types"
                :loading="loading"
                :search="search"
                class="elevation-1"
              >
                <template #item.action="{ item }">
                  <edit-with-dialog-actions
                    update="update type"
                    delete-action="delete type"
                    @editItem="editItem(item)"
                    @deleteItem="deleteItem(item)"
                  />
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">{{ formTitle }}</span>
          <v-btn icon dark class="ma-0" @click.stop="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <validation-observer v-slot="{ handleSubmit, invalid, reset }">
          <v-form @submit.prevent="handleSubmit(update)" @reset.prevent="reset">
            <v-card-text>
              <b-text
                v-model="editedItem.key"
                rules="required|alpha_dash"
                outlined
                label="Key"
              />
              <b-text
                v-model="editedItem.label"
                rules="required"
                outlined
                label="Label"
              />
              <active-inactive-dialog v-model="editedItem.status" />
            </v-card-text>
            <v-divider />
            <action-button-dialog
              :loading="saving"
              :error="invalid"
              @close="close"
            />
          </v-form>
        </validation-observer>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { debounce } from 'lodash-es';

export default {
  name: 'Type',
  data() {
    return {
      language: 'en',
      dialog: false,
      types: [],
      search: '',
      loading: false,
      creating: false,
      saving: false,
      main_headers: [
        { text: 'Key', value: 'key' },
        { text: 'Label', value: 'label' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      editedIndex: -1,
      defaultItem: {
        key: '',
        label: '',
        status: true,
      },
      editedItem: Object.assign({}, this.defaultItem),
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Type' : 'Update Type';
    },
  },
  mounted() {
    this.getTypesByPagination();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getTypesByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get type by pagination
    getTypesByPagination: debounce(async function () {
      this.loading = true;

      try {
        const { data } = await this.$axios.$get(`type`);
        this.loading = false;
        this.types = data;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // create type
    async create() {
      this.creating = true;
      try {
        const { typeId } = await this.$axios.$post(`type`);
        this.creating = false;
        this.editedItem.id = typeId;
        setTimeout(() => {
          this.dialog = true;
        }, 100);
      } catch (e) {
        this.creating = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // open dialog to edit type
    editItem(item) {
      this.editedIndex = this.types.indexOf(item);
      this.editedItem = Object.assign({}, item);
      setTimeout(() => {
        this.dialog = true;
      }, 100);
    },
    // close dialog
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 100);
    },
    // update model
    async update() {
      this.saving = true;
      try {
        const { message } = await this.$axios.$patch(
          `type/${this.editedItem.id}`,
          this.editedItem
        );
        this.saving = false;
        this.getTypesByPagination();
        this.close();
        this.$store.dispatch('crud_success_dialog', message);
      } catch (err) {
        this.saving = false;
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
    // delete item
    async deleteItem(item) {
      if (
        await this.$root.$confirm('Delete', 'Are you sure?', {
          color: 'red',
        })
      ) {
        this.deleteType(item.id);
      } else {
        return false;
      }
    },
    async deleteType(id) {
      try {
        const { message } = await this.$axios.$delete(`type/${id}`);
        this.getTypesByPagination();
        this.$store.dispatch('crud_success_dialog', message);
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
