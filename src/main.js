import "bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import fetchRss from "./api"
import initI18n from "./i18n"
import parseRss from "./parser"
import validateUrl from "./validator"
import initView from "./view"

const genId = () => Date.now() + Math.random();

const diffNewPosts = (freshPosts, existingPosts, feedId) => {
  const existingLinks = new Set(existingPosts.map((p) => p.link));
  return freshPosts
    .filter((p) => !existingLinks.has(p.link))
    .map((p) => ({ id: genId(), feedId, ...p }));
};

const updateAllFeedsOnce = (state, fetchRssImpl, parseRssImpl) => {
  if (state.feeds.length === 0) return Promise.resolve();

  const tasks = state.feeds.map((feed) =>
    fetchRssImpl(feed.url)
      .then((rss) => {
        const { posts } = parseRssImpl(rss);
        const newOnes = diffNewPosts(posts, state.posts, feed.id);
        if (newOnes.length > 0) {
          state.posts.push(...newOnes);
        }
      })
      .catch(() => {
        // Глотаем ошибку конкретного фида, чтобы не валить весь цикл обновления
      })
  );

  return Promise.allSettled(tasks).then(() => undefined);
};

const startUpdates = (state, fetchRssImpl, parseRssImpl, intervalMs = 5000) => {
  const tick = () => {
    updateAllFeedsOnce(state, fetchRssImpl, parseRssImpl).then(() => {
      setTimeout(tick, intervalMs);
    });
  };
  setTimeout(tick, intervalMs);
};

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

    // Запускаем фоновое обновление всех добавленных фидов
    startUpdates(watchedState, fetchRss, parseRss, 5000);

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

          const feedId = genId();
          watchedState.feeds.push({ id: feedId, url, ...feed });

          const postsWithId = posts.map((p) => ({ id: genId(), feedId, ...p }));
          watchedState.posts.push(...postsWithId);

          watchedState.form.messageKey = "form.success";
          watchedState.form.status = "valid";
        })
        .catch((err) => {
          if (err.name === "ValidationError") {
            watchedState.form.errorKey = err.message; // ключ из yup.setLocale
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
