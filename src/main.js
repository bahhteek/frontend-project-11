import { Modal } from 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import fetchRss from './api'
import initI18n from './i18n'
import parseRss from './parser'
import validateUrl from './validator'
import initView from './view'

const genId = () => Date.now() + Math.random()

const diffNewPosts = (freshPosts, existingPosts, feedId) => {
  const existingLinks = new Set(existingPosts.map(p => p.link))
  return freshPosts
    .filter(p => !existingLinks.has(p.link))
    .map(p => ({ id: genId(), feedId, ...p }))
}

const updateAllFeedsOnce = (state, fetchRssImpl, parseRssImpl) => {
  if (state.feeds.length === 0) return Promise.resolve()

  const tasks = state.feeds.map(feed =>
    fetchRssImpl(feed.url)
      .then((rss) => {
        const { posts } = parseRssImpl(rss)
        const newOnes = diffNewPosts(posts, state.posts, feed.id)
        if (newOnes.length > 0) state.posts.push(...newOnes)
      })
      .catch(() => {}),
  )

  return Promise.allSettled(tasks).then(() => undefined)
}

const startUpdates = (state, fetchRssImpl, parseRssImpl, intervalMs = 5000) => {
  const tick = () => {
    updateAllFeedsOnce(state, fetchRssImpl, parseRssImpl).then(() => {
      setTimeout(tick, intervalMs)
    })
  }
  setTimeout(tick, intervalMs)
}

document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    form: document.getElementById('rss-form'),
    input: document.getElementById('rss-url'),
    feedback: document.getElementById('rss-feedback'),
    submit: document.querySelector('#rss-form button[type="submit"]'),

    postsContainer: document.getElementById('posts'),
    modalEl: document.getElementById('postModal'),
    modalTitle: document.getElementById('postModalLabel'),
    modalBody: document.getElementById('postModalBody'),
    modalLink: document.getElementById('postModalLink'),
  }

  const state = {
    feeds: [],
    posts: [],
    form: { status: 'idle', errorKey: null, messageKey: null },
    ui: {
      readPosts: [],
      currentPostId: null,
    },
  }

  initI18n().then((i18n) => {
    elements.input.placeholder = i18n.t('form.placeholder')
    elements.submit.textContent = i18n.t('form.submit')

    const watchedState = initView(state, elements, i18n)

    startUpdates(watchedState, fetchRss, parseRss, 5000)

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault()

      const url = new FormData(elements.form).get('url').trim()
      const existing = watchedState.feeds.map(f => f.url)

      watchedState.form.status = 'checking'
      watchedState.form.errorKey = null
      watchedState.form.messageKey = null

      validateUrl(url, existing)
        .then(cleanUrl => fetchRss(cleanUrl))
        .then((rssContent) => {
          const { feed, posts } = parseRss(rssContent)

          const feedId = genId()
          watchedState.feeds.push({ id: feedId, url, ...feed })

          const postsWithId = posts.map(p => ({ id: genId(), feedId, ...p }))
          watchedState.posts.push(...postsWithId)

          watchedState.form.messageKey = 'form.success'
          watchedState.form.status = 'valid'
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            watchedState.form.errorKey = err.message
            watchedState.form.status = 'invalid'
            return
          }
          if (err.isAxiosError) {
            watchedState.form.errorKey = 'errors.networkError'
            watchedState.form.status = 'invalid'
            return
          }
          if (err.message === 'parseError') {
            watchedState.form.errorKey = 'errors.parseError'
            watchedState.form.status = 'invalid'
            return
          }
          watchedState.form.errorKey = 'errors.unknown'
          watchedState.form.status = 'invalid'
        })
    })

    const bsModal = new Modal(elements.modalEl)

    elements.postsContainer.addEventListener('click', (e) => {
      const previewBtn = e.target.closest('.preview-btn')
      const linkEl = e.target.closest('a[data-id]')

      if (linkEl) {
        const id = Number(linkEl.dataset.id)
        if (!watchedState.ui.readPosts.includes(id)) {
          watchedState.ui.readPosts.push(id)
        }
        return
      }

      if (previewBtn) {
        const id = Number(previewBtn.dataset.id)
        watchedState.ui.currentPostId = id
        if (!watchedState.ui.readPosts.includes(id)) {
          watchedState.ui.readPosts.push(id)
        }

        const post = watchedState.posts.find(p => p.id === id)
        if (post) {
          elements.modalTitle.textContent = post.title
          elements.modalBody.textContent = post.description
          elements.modalLink.href = post.link
          bsModal.show()
        }
      }
    })
  })
})
