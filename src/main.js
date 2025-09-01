import "bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"
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
    error: null,
  },
};

const watchedState = initView(state, elements);

elements.form.addEventListener("submit", (e) => {
  e.preventDefault();

  const url = new FormData(elements.form).get("url").trim();
  const existingUrls = watchedState.feeds.map((f) => f.url);

  watchedState.form.status = "checking";
  watchedState.form.error = null;

  validateUrl(url, existingUrls)
    .then((cleanUrl) => {
      watchedState.feeds.push({ url: cleanUrl });
      watchedState.form.status = "valid";
    })
    .catch((err) => {
      watchedState.form.error = err.message;
      watchedState.form.status = "invalid";
    });
});
