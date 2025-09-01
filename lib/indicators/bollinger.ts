import type { Candle, BollingerInputs, BollingerResultPoint } from "@/lib/types"

export function computeBollingerBands(data: Candle[], inputs: BollingerInputs) {
  const src = inputs.source // 'close'
  const len = Math.max(1, Math.floor(inputs.length))
  const mul = Number(inputs.stdDevMultiplier ?? 2)

  const values = data.map((d) => d[src])
  const basisArr = sma(values, len)
  const out: BollingerResultPoint[] = data.map((d, i) => {
    if (i < len - 1) {
      return { timestamp: d.timestamp, basis: Number.NaN, upper: Number.NaN, lower: Number.NaN }
    }
    const window = values.slice(i - (len - 1), i + 1)
    const basis = basisArr[i]
    const stdev = sampleStdDev(window)
    const upper = basis + mul * stdev
    const lower = basis - mul * stdev
    return { timestamp: d.timestamp, basis, upper, lower }
  })
  return { series: out }
}

function sma(arr: number[], length: number) {
  const out = new Array(arr.length).fill(Number.NaN)
  let sum = 0
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i]
    if (i >= length) sum -= arr[i - length]
    if (i >= length - 1) {
      out[i] = sum / length
    }
  }
  return out
}

// Sample standard deviation (n - 1)
function sampleStdDev(window: number[]) {
  const n = window.length
  if (n <= 1) return 0
  const mean = window.reduce((a, b) => a + b, 0) / n
  const variance = window.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1)
  return Math.sqrt(variance)
}
