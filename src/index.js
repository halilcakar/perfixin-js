let timer;

const timeToFirstByte = () => performance.timing.responseStart - performance.timing.navigationStart;

const firstContentfulPaint = () => {
  const [time] = performance.getEntriesByName("first-contentful-paint")
  return time && time.startTime || 0
}

const domContentLoaded = () => performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart

const windowLoad = (time) => time - performance.timing.navigationStart

const fromAssets = (t, n) => {
  const e = performance.getEntriesByType("resource");
  let i = 0, o = Number.MAX_VALUE, a = 0;
  return e.forEach(e => {
    (e.initiatorType === t || n && (t => t && t.split("?")[0].endsWith(`.${n}`))(e.name)) && (o > e.startTime && 0 !== e.startTime && (o = e.startTime), a < e.responseEnd && (a = e.responseEnd))
  }), o === Number.MAX_VALUE || 0 === a ? i = 0 : i += a - o, i
}

const getMetrics = (time) => ({
  ttfb: timeToFirstByte(),
  fcp: firstContentfulPaint(),
  dcl: domContentLoaded(),
  windowLoad: windowLoad(time),
  script: fromAssets(null, "js"),
  image: fromAssets('img'),
  css: fromAssets(null, "css"),
  font: fromAssets(null, 'woff') + fromAssets(null, 'woff2'),
  document: fromAssets('xmlhttprequest')
})

const post = (url, data) => {
  console.log(url)
  console.log(data)
  // fetch(url, { method: "POST", cache: "no-cache", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  clearTimeout(timer)
}

export default () => {
  if (!url) {
    throw new Error('Perfixin requires a URL to send the metrics..')
  }
  if (!window) {
    throw new Error('Cannot get metrics without window =)')
  }
  if (!performance && !performance.timing) {
    throw new Error('Browser is not compatible with this..')
  }

  if (performance && performance.timing && performance.timing.loadEventEnd) {
    timer = setTimeout(() => {
      post(url, getMetrics(performance.timing.loadEventEnd))
    }, 3000);
    return
  }

  window.onload = () => {
    const time = (new Date()).getTime();
    timer = setTimeout(() => {
      post(url, getMetrics(time));
    })
  }
}