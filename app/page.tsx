"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import Chart from "@/components/Chart"
import BollingerSettings from "@/components/BollingerSettings"
import type { BollingerInputs, BollingerStyle, Candle } from "@/lib/types"
import { computeBollingerBands } from "@/lib/indicators/bollinger"

function synthData(n: number): Candle[] {
  const now = Date.now() - n * 60_000
  let price = 100
  const out: Candle[] = []
  for (let i = 0; i < n; i++) {
    const ts = now + i * 60_000
    const chg = (Math.random() - 0.5) * 0.8
    const o = price
    price = Math.max(1, price + chg)
    const c = price
    const h = Math.max(o, c) + Math.random() * 0.6
    const l = Math.min(o, c) - Math.random() * 0.6
    out.push({ timestamp: ts, open: o, high: h, low: l, close: c, volume: 1000 + Math.random() * 500 })
  }
  return out
}

export default function Page() {
  const [data, setData] = useState<Candle[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [indicatorAdded, setIndicatorAdded] = useState(false)

  const [inputs, setInputs] = useState<BollingerInputs>({
    length: 20,
    maType: "SMA",
    source: "close",
    stdDevMultiplier: 2,
    offset: 0,
  })

  const [style, setStyle] = useState<BollingerStyle>({
    showBasis: true,
    basisColor: "#22c55e",
    basisWidth: 2,
    basisStyle: "solid",

    showUpper: true,
    upperColor: "#3b82f6",
    upperWidth: 2,
    upperStyle: "solid",

    showLower: true,
    lowerColor: "#ef4444",
    lowerWidth: 2,
    lowerStyle: "solid",

    showBackground: true,
    backgroundOpacity: 0.12,
  })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/data/ohlcv.json")
        if (!res.ok) throw new Error("missing data")
        const raw = await res.json()
        const parsed: Candle[] = raw.map((d: any) => ({
          timestamp: typeof d.timestamp === "number" ? d.timestamp : new Date(d.timestamp).getTime(),
          open: Number(d.open),
          high: Number(d.high),
          low: Number(d.low),
          close: Number(d.close),
          volume: Number(d.volume ?? 0),
        }))
        setData(parsed.length >= 200 ? parsed : synthData(240))
      } catch {
        setData(synthData(240))
      }
    }
    load()
  }, [])

  const boll = useMemo(() => {
    if (!data.length) return null
    return computeBollingerBands(data, inputs)
  }, [data, inputs])

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="mx-auto max-w-5xl flex flex-col gap-4">
        <header className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-semibold text-pretty">Bollinger Bands</h1>
          <div className="flex items-center gap-2">
            {!indicatorAdded ? (
              <Button onClick={() => setIndicatorAdded(true)}>Add Indicator</Button>
            ) : (
              <Button variant="outline" onClick={() => setShowSettings(true)}>
                Settings
              </Button>
            )}
          </div>
        </header>

        <section className="rounded-lg border bg-card p-2 md:p-3">
          <Chart candles={data} indicator={indicatorAdded ? boll : null} style={style} inputs={inputs} />
        </section>
      </div>

      <BollingerSettings
        open={showSettings}
        onOpenChange={setShowSettings}
        inputs={inputs}
        onInputsChange={setInputs}
        style={style}
        onStyleChange={setStyle}
      />
    </main>
  )
}
