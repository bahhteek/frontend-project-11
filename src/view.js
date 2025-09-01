import onChange from "on-change"

export default (state, elements, i18n) =>
  onChange(state, (path) => {
    if (["form.errorKey", "form.messageKey", "form.status"].includes(path)) {
      const { input, feedback, submit, form } = elements;
      input.classList.remove("is-invalid");
      feedback.classList.remove("text-danger", "text-success");
      feedback.textContent = "";
      submit.disabled = false;

      if (state.form.status === "checking") submit.disabled = true;

      if (state.form.status === "invalid") {
        input.classList.add("is-invalid");
        feedback.classList.add("text-danger");
        feedback.textContent = i18n.t(state.form.errorKey);
      }

      if (state.form.status === "valid") {
        feedback.classList.add("text-success");
        feedback.textContent = i18n.t(state.form.messageKey || "form.success");
        form.reset();
        input.focus();
      }
    }

    if (["feeds", "posts", "ui.readPosts"].includes(path)) {
      const feedsContainer = document.getElementById("feeds");
      const postsContainer = document.getElementById("posts");

      feedsContainer.innerHTML = "";
      state.feeds.forEach((feed) => {
        const div = document.createElement("div");
        div.classList.add("mb-3");
        div.innerHTML = `
          <h3 class="h5">${feed.title}</h3>
          <p class="mb-0 text-muted">${feed.description}</p>
        `;
        feedsContainer.append(div);
      });

      postsContainer.innerHTML = "";
      state.posts.forEach((post) => {
        const isRead = state.ui.readPosts.includes(post.id);

        const li = document.createElement("li");
        li.className =
          "d-flex align-items-start justify-content-between gap-2 mb-2";

        const link = document.createElement("a");
        link.href = post.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.dataset.id = post.id;
        link.className = isRead ? "fw-normal" : "fw-bold";
        link.textContent = post.title;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-outline-primary btn-sm preview-btn";
        btn.dataset.id = post.id;
        btn.textContent = "Предпросмотр";

        li.append(link, btn);
        postsContainer.append(li);
      });
    }
  });
