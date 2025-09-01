import "bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"

import initI18n from "./i18n"
import validateUrl from "./validator"
import initView from "./view"

const elements = {
  form: document.getElementById("rss-form"),
  input: document.getElementById("rss-url"),
  feedback: document.getElementById("rss-feedback"),
  submit: document.querySelector('#rss-form button[type="submit"]'),
};

const state = {
  feeds: [],
  form: {
    status: "idle",
    errorKey: null,
    messageKey: null,
  },
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
      .then((cleanUrl) => {
        watchedState.feeds.push({ url: cleanUrl });
        watchedState.form.messageKey = "form.success";
        watchedState.form.status = "valid";
      })
      .catch((err) => {
        watchedState.form.errorKey = err.message;
        watchedState.form.status = "invalid";
      });
  });
});
