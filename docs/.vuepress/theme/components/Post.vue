<template>
  <div class="page post">
    <div class="columns">
      <div class="column">
        <p class="title is-4">{{ $page.frontmatter.title }}</p>
      </div>
    </div>
    <p class="subtitle is-5 date">{{ $page.frontmatter.date }}</p>

    <Content style="paddig: 0" />
    <Disqus class="comment" />
  </div>
</template>
<script>
import Disqus from "./Disqus.vue";
export default {
  components: {
    Disqus,
  },
};
</script>
<style>
.subtitle.is-5.date {
  text-align: right;
}
@media screen and (min-width: 1024px) {
  .post {
    padding: 0 18vw;
  }
}
@media screen and (max-width: 1023px) {
  .post {
    padding: 0 10px;
  }
}
.post {
  margin-top: 5vh;
}
.comment {
  margin-top: 20vh;
}
.label {
  display: inline;
}
code {
  font-family: "Spoqa Han Sans Neo";
}
.number {
  all: unset;
}
</style>
