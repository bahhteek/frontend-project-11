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
  });
