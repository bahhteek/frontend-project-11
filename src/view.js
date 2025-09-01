import onChange from "on-change"

export default (state, elements) =>
  onChange(state, (path) => {
    if (path === "form.error" || path === "form.status") {
      const { input, feedback, submit } = elements;

      input.classList.remove("is-invalid");
      feedback.textContent = "";
      submit.disabled = false;

      if (state.form.status === "valid") {
        elements.form.reset();
        input.focus();
      }

      if (state.form.status === "invalid") {
        input.classList.add("is-invalid");
        feedback.textContent = state.form.error;
      }

      if (state.form.status === "checking") {
        submit.disabled = true;
      }
    }
  });
