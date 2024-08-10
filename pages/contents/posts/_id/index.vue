<template>
  <div id="postSingle">
    <v-container fluid>
      <v-row>
        <v-col>
          <v-card v-if="article">
            <v-card-title>
              <h4>Single Post - &nbsp;</h4>
              <active-chip :status="article.status" />
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card>
            <v-img
              v-if="article.image"
              height="300"
              contain
              :src="article.image"
            ></v-img>

            <v-card-title primary-title>
              <div>
                <h3 class="display-1">{{ article.title }}</h3>
              </div>
            </v-card-title>
            <v-card-text>
              <p>{{ article.excerpt }}</p>
              <br />
              <hr />
              <br />
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-html="article.content"></div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="4">
          <v-card>
            <v-card-title primary-title>
              <h5 class="display-1">Details</h5>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="4">Published</v-col>
                <v-col>: {{ article.datetime | toDayDateTimeString }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="4">Is FB article</v-col>
                <v-col>: {{ article.is_fb_article }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="4">Is slider</v-col>
                <v-col>: {{ article.is_fb_article }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="4">Reporter</v-col>
                <v-col>: {{ article.reporter_name }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="4">Category</v-col>
                <v-col>: {{ article.category_name }}</v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'PostSingle',
  data() {
    return {
      language: 'en',
      article: {
        title: '',
        excerpt: '',
        content: '',
        datetime: '',
      },
    };
  },
  watch: {
    language(newVal, oldVal) {
      if (newVal !== oldVal) this.getarticle();
    },
  },
  mounted() {
    this.getarticle();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => this.getarticle());
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    async getarticle() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/post/${this.$route.params.id}`
        );
        this.article = data;
      } catch (error) {
        console.log('error', error);
      }
    },
  },
};
</script>
