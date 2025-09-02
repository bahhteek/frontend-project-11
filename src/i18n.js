import i18next from 'i18next'
import en from './locales/en'
import ru from './locales/ru'

export default () => {
  const i18n = i18next.createInstance()
  return i18n
    .init({
      lng: 'ru',
      debug: false,
      resources: { ru, en },
    })
    .then(() => i18n)
}
