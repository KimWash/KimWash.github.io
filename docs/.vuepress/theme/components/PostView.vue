<template>
  <div>
    <div class="post-box">
      <div class="post-card" v-for="i in data.length" :key="i">
        <post-card @onClick="$router.push(data[i].path)" v-if="i < data.length" :title="data[i].frontmatter.title"
          :category="data[i].frontmatter.category" :date="data[i].frontmatter.date">
        </post-card>
        <ClientOnly>
          <component v-if="infinityLoadingComponent && hasMore" :is="infinityLoadingComponent" :identifier="infiniteId"
            @infinite="onScroll"></component>
        </ClientOnly>
      </div>
    </div>

    <div class="nopost" v-if="data.length <= 0">
      아무런 글도 없는 것 같네요.
    </div>
  </div>
</template>
<script>
import PostCard from "./PostCard.vue";
export default {
  components: { PostCard },
  props: {
    posts: {
      type: Object,
      default: () => { },
    },
  },
  data() {
    return {
      data: [],
      hasMore: this.posts.posts.length > 0 ? true : false,
      infiniteId: +new Date(),
      page: this.$route.query.page,
      infinityLoadingComponent: null,
    };
  },
  mounted() {
    import("vue-infinite-loading").then((module) => {
      this.infinityLoadingComponent = module.default;
    });
    if (this.$route.query.page == undefined) {
      this.$router.push({ query: { page: 1 } });
      this.page = 1;
    }
    this.data = this.posts.posts.slice(0, 10 * this.page);
  },
  methods: {
    onScroll($state) {
      if (this.hasMore) {
        this.page++;
        history.pushState({}, null, this.$route.path + "?page=" + this.page);
        const newDatas = this.posts.posts.slice(
          10 * (this.page - 1),
          10 * this.page
        );

        this.data = [...this.data, ...newDatas];
        if (10 * this.page > this.posts.posts.length) {
          $state.complete();
          this.hasMore = false;
        }
        $state.loaded();
      }
    },
  },
};
</script>

<style>
/* @media screen and (min-width: 1024px) {
  .tiles {
    margin: 2vw 0;
    padding: 0 10vw;
  }
} */
.post-box {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  height: 200px;
  /* height given for illustration */
  display: flex;
  flex-flow: row wrap;
  position: relative;
}

@media screen and (max-width: 767px) {
  .post-card {
    flex: 0 1 calc(50%);
  }
}
@media screen and (min-width: 768px) {
  .post-card {
  flex: 0 1 calc(25%); /* <-- adjusting for margin */
}
}
.post-card {
  cursor:pointer
}



.nopost {
  display: flex;
  justify-content: center;
  margin-top: 10vh;
  font-size: 2rem;
  font-weight: bold;
}</style>