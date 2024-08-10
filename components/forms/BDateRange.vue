<template>
  <validation-provider :name="$attrs.label">
    <v-dialog v-model="dialog" persistent width="350">
      <template v-slot:activator="{ on }">
        <v-text-field
          v-model="dateRangeText"
          v-bind="$attrs"
          readonly
          v-on="on"
        />
      </template>
      <v-card>
        <v-card-text class="pa-0">
          <v-date-picker v-model="dates" full-width range></v-date-picker>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn outlined @click.native="clearDateTime"> Cancel </v-btn>
          <v-btn outlined color="primary" @click="getDateRange"> OK </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </validation-provider>
</template>

<script>
export default {
  name: 'BDateRange',
  props: {
    dateRange: {
      type: Array,
      default: () => [],
    },
    isReset: {
      type: Boolean,
      default: true,
    },
  },
  data: () => ({
    dates: [],
    dialog: false,
  }),
  computed: {
    dateRangeText() {
      if (this.dates.length) return this.dates.join(' ~ ');
      else return null;
    },
  },
  watch: {
    isReset(newValue, oldValue) {
      if (newValue) this.dates = [];
    },
  },
  methods: {
    clearDateTime() {
      this.resetPicker();
      this.dates = [];
      this.$emit('input', []);
    },
    getDateRange() {
      this.resetPicker();
      this.$emit('input', this.dates);
    },
    resetPicker() {
      this.dialog = false;
    },
  },
};
</script>
