// Bootstrap стили и js
import "bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import "./styles.css"

const form = document.getElementById("rss-form");
const status = document.getElementById("status");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const url = new FormData(form).get("url");

  Promise.resolve(url)
    .then((value) => {
      status.innerHTML = `<div class="alert alert-success">Добавлено: ${value}</div>`;
      form.reset();
    })
    .catch(() => {
      status.innerHTML = '<div class="alert alert-danger">Ошибка</div>';
    });
});
