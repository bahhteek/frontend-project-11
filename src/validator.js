import * as yup from "yup"

yup.setLocale({
  mixed: {
    required: "Не должно быть пустым",
    notOneOf: "RSS уже добавлен",
  },
  string: {
    url: "Ссылка должна быть валидным URL",
  },
});

const validateUrl = (url, existingUrls) => {
  const schema = yup.string().trim().required().url().notOneOf(existingUrls);

  // validate() — асинхронная, возвращает промис
  return schema.validate(url);
};

export default validateUrl;