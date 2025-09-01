import axios from "axios"

const getUrl = (url) => {
  const encoded = encodeURIComponent(url);
  return `https://allorigins.hexlet.app/get?disableCache=true&url=${encoded}`;
};

const fetchRss = (url) =>
  axios.get(getUrl(url)).then((response) => response.data.contents);

export default fetchRss
