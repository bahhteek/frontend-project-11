import onChange from 'on-change'

export default (state, elements, i18n) =>
  onChange(state, (path) => {
    if (['form.errorKey', 'form.messageKey', 'form.status'].includes(path)) {
      const { input, feedback, submit, form } = elements
      input.classList.remove('is-invalid')
      feedback.classList.remove('text-danger', 'text-success')
      feedback.textContent = ''
      submit.disabled = false

      if (state.form.status === 'checking') submit.disabled = true

      if (state.form.status === 'invalid') {
        input.classList.add('is-invalid')
        feedback.classList.add('text-danger')
        feedback.textContent = i18n.t(state.form.errorKey)
      }

      if (state.form.status === 'valid') {
        feedback.classList.add('text-success')
        feedback.textContent = i18n.t(state.form.messageKey || 'form.success')
        form.reset()
        input.focus()
      }
    }

    if (['feeds', 'posts', 'ui.readPosts'].includes(path)) {
      const feedsPostsBlock = document.getElementById('feeds-posts-block')
      const feedsContainer = document.getElementById('feeds')
      const postsContainer = document.getElementById('posts')

      if (state.feeds.length === 0) {
        feedsPostsBlock.classList.add('d-none')
        feedsContainer.innerHTML = ''
        postsContainer.innerHTML = ''
        return
      }

      feedsPostsBlock.classList.remove('d-none')

      feedsContainer.innerHTML = ''
      state.feeds.forEach((feed) => {
        const li = document.createElement('li')
        li.className = 'list-group-item border-0 border-end-0'

        li.innerHTML = `
      <h3 class='h6 m-0'>${feed.title}</h3>
      <p class='m-0 small text-black-50'>${feed.description}</p>
    `

        feedsContainer.append(li)
      })

      postsContainer.innerHTML = ''
      state.posts.forEach((post) => {
        const isRead = state.ui.readPosts.includes(post.id)

        const li = document.createElement('li')
        li.className 
        = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0'

        const link = document.createElement('a')
        link.href = post.link
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        link.dataset.id = post.id
        link.className = isRead ? 'fw-normal' : 'fw-bold'
        link.textContent = post.title

        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'btn btn-outline-primary btn-sm preview-btn'
        btn.dataset.id = post.id
        btn.setAttribute('data-bs-toggle', 'modal')
        btn.setAttribute('data-bs-target', '#postModal')
        btn.textContent = i18n.t('post.preview')

        li.append(link, btn)
        postsContainer.append(li)
      })
    }
  })
