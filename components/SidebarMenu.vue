<template>
  <v-navigation-drawer id="appDrawer" v-model="drawer" fixed app width="260">
    <v-toolbar color="primary darken-1" dark>
      <img :src="logo" class="w-100 h-100" alt="TheFinancialExpress" />
    </v-toolbar>
    <scrollbar class="drawer-menu--scroll">
      <v-list dense expand class="pb-4">
        <v-subheader>Dashboard</v-subheader>
        <v-list-item nuxt to="/">
          <v-list-item-action>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title> Dashboard </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <template v-for="menu in menus">
          <v-divider :key="menu.id + '-divider'" />
          <v-subheader :key="menu.id">{{ menu.title }}</v-subheader>
          <v-list-item
            v-for="subItem in menu.children"
            :key="subItem.id"
            nuxt
            :to="subItem.link"
            ripple="ripple"
          >
            <v-list-item-action>
              <v-icon>{{ subItem.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title :title="subItem.title">
                {{ subItem.title }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </scrollbar>
  </v-navigation-drawer>
</template>

<script>
import { mapGetters } from 'vuex';
import { VList } from 'vuetify/lib';
import Scrollbar from './Scrollbar';

export default {
  name: 'Sidebar',
  components: {
    VList,
    Scrollbar,
  },
  props: {
    logo: {
      type: String,
      default: '/logo.png',
    },
  },
  data: () => ({
    drawer: true,
    scrollSettings: {
      maxScrollbarLength: 60,
    },
  }),
  computed: {
    items() {
      const array = [];
      this.menus.forEach((item) => {
        const menu = {
          header: item.title,
          divider: true,
          items: item,
        };
        array.push(menu);
      });
      return array;
    },
    ...mapGetters({
      menus: 'common/menus',
    }),
  },
  created() {
    // eslint-disable-next-line nuxt/no-globals-in-created
    window.getApp.$on('APP_DRAWER_TOGGLED', () => {
      this.drawer = !this.drawer;
    });
  },
};
</script>
