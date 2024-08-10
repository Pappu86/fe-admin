const CONTENT_POST_UPDATED = 'CONTENT_POST_UPDATED';
const CONTENT_TAG_UPDATED = 'CONTENT_TAG_UPDATED';
const CONTENT_LIVE_MEDIA_UPDATED = 'CONTENT_LIVE_MEDIA_UPDATED';
const ADS_ADVERTISEMENT_UPDATED = 'ADS_ADVERTISEMENT_UPDATED';

const state = () => ({
  contentTagPagination: null,
  contentPostPagination: null,
  contentLiveMediaPagination: null,
  adsAdvertisementPagination: null,
});

const mutations = {
  [CONTENT_POST_UPDATED](state, payload) {
    state.contentPostPagination = payload;
  },
  [CONTENT_TAG_UPDATED](state, payload) {
    state.contentTagPagination = payload;
  },
  [CONTENT_LIVE_MEDIA_UPDATED](state, payload) {
    state.contentLiveMediaPagination = payload;
  },
  [ADS_ADVERTISEMENT_UPDATED](state, payload) {
    state.adsAdvertisementPagination = payload;
  },
};

export default {
  state,
  mutations,
};
