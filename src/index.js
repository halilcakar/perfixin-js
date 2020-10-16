let timer;

const timeToFirstByte = () => performance.timing.responseStart - performance.timing.navigationStart;

const domContentLoaded = () => performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart

const windowLoad = (time) => time - performance.timing.navigationStart

const firstContentfulPaint = () => {
  const [time] = performance.getEntriesByName("first-contentful-paint")
  return (time && time.startTime) || 0
}

const document = () => {
  const time = performance.getEntries().find(ch => ch.initiatorType === 'navigation')
  return time && (time.responseEnd - time.requestStart) || 0
}

const calculateTime = (entries) => {
  let result = 0, start = Number.MAX_VALUE, end = 0;
  entries.forEach(entry => {
    if (end < entry.responseEnd) {
      end = entry.responseEnd;
    }
    if (start > entry.startTime && entry.startTime !== 0) {
      start = entry.startTime
    }
  })
  return (result = end - start) > 0 ? result : 0
}

const image = () => calculateTime(performance.getEntriesByType("resource").filter(ch => ch.initiatorType === 'img'))

const asset = (type) => calculateTime(performance.getEntriesByType("resource").filter(child => child.name.split('?')[0].endsWith(`.${type}`)))

const getMetrics = (time) => ({
  timeToFirstByte: timeToFirstByte(),
  firstContentfulPaint: firstContentfulPaint(),
  domContentLoaded: domContentLoaded(),
  windowLoad: windowLoad(time),
  image: image(),
  document: document(),
  script: asset("js"),
  css: asset("css"),
  font: asset('woff') + asset('woff2'),
  url: location.href,
  origin: location.origin,
})

const post = (config, data) => {
  if (config.debug) {
    console.log('Perfixin debugging..');
    return console.log(data);
  }
  let { url } = config;
  if (!url) { url = '/perfixin/create'; }
  
  fetch(url, {
    method: "POST",
    cache: "no-cache",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(console.log);
  clearTimeout(timer)
}

/**
 * @function Perfixin
 * 
 * @param config { url: string, debug: boolean }
 */
export default (config) => {
  if (!window) {
    throw new Error('Cannot get metrics without window =)')
  }
  if (!performance && !performance.timing) {
    throw new Error('Browser is not compatible with Perfixin..')
  }

  if (performance && performance.timing) {
    return timer = setTimeout(() => {
      post(config, getMetrics(performance.timing.loadEventEnd))
    }, 3000)
  }

  window.onload = () => {
    const time = (new Date()).getTime();
    return timer = setTimeout(() => {
      post(config, getMetrics(time))
    }, 3000)
  }
}