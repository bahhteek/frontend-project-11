export default (rssContent) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(rssContent, 'application/xml')

  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new Error('parseError')
  }

  const feed = {
    title: doc.querySelector('channel > title')?.textContent ?? '',
    description: doc.querySelector('channel > description')?.textContent ?? '',
  }

  const posts = Array.from(doc.querySelectorAll('item')).map((item) => ({
    title: item.querySelector('title')?.textContent ?? '',
    link: item.querySelector('link')?.textContent ?? '',
    description: item.querySelector('description')?.textContent ?? '',
  }))

  return { feed, posts }
}
