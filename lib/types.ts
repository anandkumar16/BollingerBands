export type Candle = {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export type BollingerInputs = {
  length: number
  maType: "SMA"
  source: "close"
  stdDevMultiplier: number
  offset: number
}

export type BollingerStyle = {
  showBasis: boolean
  basisColor: string
  basisWidth: number
  basisStyle: "solid" | "dashed"

  showUpper: boolean
  upperColor: string
  upperWidth: number
  upperStyle: "solid" | "dashed"

  showLower: boolean
  lowerColor: string
  lowerWidth: number
  lowerStyle: "solid" | "dashed"

  showBackground: boolean
  backgroundOpacity: number
}

export type BollingerResultPoint = {
  timestamp: number
  basis: number
  upper: number
  lower: number
}
