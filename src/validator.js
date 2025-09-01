import * as yup from "yup"

yup.setLocale({
  mixed: {
    required: "errors.required",
    notOneOf: "errors.duplicate",
  },
  string: {
    url: "errors.url",
  },
});

const validateUrl = (url, existingUrls) => {
  const schema = yup.string().trim().required().url().notOneOf(existingUrls);
  return schema.validate(url);
};

export default validateUrl;
