<template>
  <v-chip class="white--text" :color="status ? 'success' : 'warning'">{{ statusText }}</v-chip>
</template>

<script>
export default {
  name: 'ActiveChip',
  props: {
    status: {
      type: Boolean,
      default: true,
    }
  },
  computed: {
    statusText() {
      return this.status ? 'Active' : 'Inactive'
    }
  }
}
</script>