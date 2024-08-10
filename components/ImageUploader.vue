<template>
  <v-card class="image-upload" outlined>
    <input
      ref="image"
      type="file"
      name="image"
      accept="image/*"
      @change="updateImage($event)"
    />
    <div v-show="innerValue === null">
      <v-card-text
        class="d-flex flex-column justify-center align-center relative w-100"
        @click.stop="$refs.image.click()"
      >
        <v-icon large>mdi-cloud-upload</v-icon>
        <h3>Upload Image</h3>
      </v-card-text>
    </div>
    <div v-show="innerValue !== null">
      <v-card-text class="d-flex justify-center align-center relative w-100">
        <v-btn icon dark class="ma-0 remove pink" @click.stop="removeImage">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <img ref="output" />
      </v-card-text>
    </div>

    <v-card-title v-if="error" class="py-0">
      <v-alert
        border="bottom"
        color="pink darken-1"
        dark
        class="w-100"
        dismissible
      >
        {{ error }}
      </v-alert>
    </v-card-title>
  </v-card>
</template>

<script>
export default {
  name: 'ImageUploader',
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
    imageType: {
      type: String,
      default: '',
    },
  },
  data: () => ({
    innerValue: null,
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
      if (!(newVal instanceof File)) {
        const img = this.$refs.output;
        img.src = newVal;
      }
    },
    errors(val) {
      if (val) {
        Object.keys(val).forEach((item) => {
          if (item === 'image') {
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
  mounted() {
    if (!(this.value instanceof File)) {
      const img = this.$refs.output;
      img.src = this.value;
    }
  },
  methods: {
    // update image
    updateImage(event) {
      const file = event.target.files[0];
      if (file) {
        this.innerValue = file;
        const img = this.$refs.output;
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(img.src);
        };
      }
    },
    // remove image
    removeImage() {
      this.innerValue = null;
      this.error = null;
    },
  },
};
</script>
