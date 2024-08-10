const MENUS_UPDATED = 'MENUS_UPDATED';

const state = () => ({
  menus: [],
});

const getters = {
  menus: (state) => state.menus,
};

const mutations = {
  [MENUS_UPDATED](state, payload) {
    state.menus = payload;
  },
};

const actions = {
  async getMenus({ commit }) {
    try {
      const { data } = await this.$axios.$get(`menus`);
      commit(MENUS_UPDATED, data);
    } catch (e) {}
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
};
