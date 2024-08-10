<template>
  <div id="dashboard">
    <page-breadcrumb :paths="breadcrumbs" />
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title class="primary white--text">
              Welcome to Dashboard
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      breadcrumbs: [
        {
          text: 'Dashboard',
          to: '/',
          path: '/',
          disabled: true,
          icon: false,
          exact: true,
        },
      ],
    };
  },
};
</script>
