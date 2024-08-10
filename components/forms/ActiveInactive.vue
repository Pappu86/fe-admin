<template>
  <v-container class="py-0">
    <v-switch
      v-model="status"
      color="primary"
      class="text-capitalize"
      :label="label"
      v-bind="$attrs"
      v-on="$listeners"
    />
  </v-container>
</template>

<script>
export default {
  name: 'ActiveInactive',
  props: {
    value: {
      type: Boolean,
      default: true,
    },
  },
  data: () => ({
    status: true,
  }),
  computed: {
    label() {
      return this.status ? 'Active': 'Inactive'
    }
  },
  watch: {
    // Handles internal model changes.
    status(newVal) {
      this.$emit('input', newVal);
    },
    // Handles external model changes.
    value(newVal) {
      this.status = newVal;
    },
  },
  created() {
    if (this.value) {
      this.status = this.value;
    }
  },
};
</script>
