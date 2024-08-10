<template>
  <v-card class="document-upload" outlined>
    <input
      ref="document"
      type="file"
      name="document"
      accept="application/pdf"
      @change="updateVideo($event)"
    />
    <template v-if="innerValue === ''">
      <v-card-text
        class="d-flex flex-column justify-center align-center relative w-100"
        @click="$refs.document.click()"
      >
        <v-icon large>mdi-cloud-upload</v-icon>
        <h3>Upload PDF Document</h3>
      </v-card-text>
    </template>
    <template v-else>
      <v-card-text class="d-flex justify-center align-center relative w-100">
        <v-btn icon dark class="ma-0 remove pink" @click.stop="removeVideo">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <embed :src="innerValue" type="application/pdf">
      </v-card-text>
      <v-card-title v-if="error" class="py-0">
        <v-alert border="bottom" color="pink darken-1" dark class="w-100">
          {{ error }}
        </v-alert>
      </v-card-title>
    </template>
  </v-card>
</template>

<script>
export default {
  name: 'VideoUploader',
  props: {
    // must be included in props
    value: {
      type: null,
      default: null,
    },
    errors: {
      type: Object,
      default: null,
    },
  },
  data: () => ({
    innerValue: '',
    error: null,
  }),
  watch: {
    // Handles internal model changes.
    innerValue(newVal) {
      this.$emit('input', newVal);
    },
    // Handles external model changes.
    value(newVal) {
      this.innerValue = newVal;
    },
    errors(val) {
      if (val) {
        Object.keys(val).forEach((item) => {
          if (item === 'document') {
            this.error = val[item][0];
          }
        });
      } else {
        this.error = null;
      }
    },
  },
  created() {
    if (this.value) {
      this.innerValue = this.value;
    }
  },
  methods: {
    // update document
    updateVideo(event) {
      const file = event.target.files[0];
      this.$emit('updateVideo', file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.innerValue = URL.createObjectURL(file);
      };
    },
    // remove document
    removeVideo() {
      this.innerValue = '';
      this.error = null;
      this.$emit('removeVideo', '');
    },
  },
};
</script>
