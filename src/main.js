import "bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"

import fetchRss from "./api"
import initI18n from "./i18n"
import parseRss from "./parser"
import validateUrl from "./validator"
import initView from "./view"

document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    form: document.getElementById("rss-form"),
    input: document.getElementById("rss-url"),
    feedback: document.getElementById("rss-feedback"),
    submit: document.querySelector('#rss-form button[type="submit"]'),
  };

  const state = {
    feeds: [],
    posts: [],
    form: { status: "idle", errorKey: null, messageKey: null },
  };

  initI18n().then((i18n) => {
    elements.input.placeholder = i18n.t("form.placeholder");
    elements.submit.textContent = i18n.t("form.submit");

    const watchedState = initView(state, elements, i18n);

    elements.form.addEventListener("submit", (e) => {
      e.preventDefault();

      const url = new FormData(elements.form).get("url").trim();
      const existing = watchedState.feeds.map((f) => f.url);

      watchedState.form.status = "checking";
      watchedState.form.errorKey = null;
      watchedState.form.messageKey = null;

      validateUrl(url, existing)
        .then((cleanUrl) => fetchRss(cleanUrl))
        .then((rssContent) => {
          const { feed, posts } = parseRss(rssContent);

          const feedId = Date.now();
          watchedState.feeds.push({ id: feedId, url, ...feed });

          const postsWithId = posts.map((p) => ({
            id: Date.now() + Math.random(),
            feedId,
            ...p,
          }));
          watchedState.posts.push(...postsWithId);

          watchedState.form.messageKey = "form.success";
          watchedState.form.status = "valid";
        })
        .catch((err) => {
          if (err.name === "ValidationError") {
            watchedState.form.errorKey = err.message;
            watchedState.form.status = "invalid";
            return;
          }

          if (err.isAxiosError) {
            watchedState.form.errorKey = "errors.networkError";
            watchedState.form.status = "invalid";
            return;
          }

          if (err.message === "parseError") {
            watchedState.form.errorKey = "errors.parseError";
            watchedState.form.status = "invalid";
            return;
          }

          watchedState.form.errorKey = "errors.unknown";
          watchedState.form.status = "invalid";
        });
    });
  });
});
