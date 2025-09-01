import onChange from "on-change"

export default (state, elements, i18n) =>
  onChange(state, (path) => {
    if (["form.errorKey", "form.messageKey", "form.status"].includes(path)) {
      const { input, feedback, submit, form } = elements;

      input.classList.remove("is-invalid");
      feedback.classList.remove("text-danger", "text-success");
      feedback.textContent = "";
      submit.disabled = false;

      if (state.form.status === "checking") {
        submit.disabled = true;
      }

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

    if (path === "feeds" || path === "posts") {
      const feedsContainer = document.getElementById("feeds");
      const postsContainer = document.getElementById("posts");

      feedsContainer.innerHTML = "";
      postsContainer.innerHTML = "";

      state.feeds.forEach((feed) => {
        const div = document.createElement("div");
        div.classList.add("mb-3");
        div.innerHTML = `
          <h3>${feed.title}</h3>
          <p>${feed.description}</p>
        `;
        feedsContainer.append(div);
      });

      state.posts.forEach((post) => {
        const li = document.createElement("li");
        li.classList.add("mb-1");
        li.innerHTML = `<a href="${post.link}" target="_blank">${post.title}</a>`;
        postsContainer.append(li);
      });
    }
  });
