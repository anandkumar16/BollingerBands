"use client"

import { useEffect, useMemo, useRef } from "react"
import type { Candle, BollingerInputs, BollingerStyle, BollingerResultPoint } from "@/lib/types"
import { cn } from "@/lib/utils"
import type { KLineData } from "klinecharts"
import { init, dispose } from "klinecharts"

type Props = {
  candles: Candle[]
  indicator: { series: BollingerResultPoint[] } | null
  style: BollingerStyle
  inputs: BollingerInputs
}

export default function Chart({ candles, indicator, style, inputs }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<any>(null)
  const overlayIdRef = useRef<{ basis?: string; upper?: string; lower?: string; fill?: string }>({})
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  const kData: KLineData[] = useMemo(
    () =>
      candles.map((c) => ({
        timestamp: c.timestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
      })),
    [candles],
  )

  const lines = useMemo(() => {
    if (!indicator) return null
    const off = inputs.offset ?? 0
    const shifted = off === 0 ? indicator.series : shiftSeries(indicator.series, off)
    return {
      basis: shifted.map((p) => ({ timestamp: p.timestamp, value: p.basis })),
      upper: shifted.map((p) => ({ timestamp: p.timestamp, value: p.upper })),
      lower: shifted.map((p) => ({ timestamp: p.timestamp, value: p.lower })),
      raw: shifted,
    }
  }, [indicator, inputs.offset])

  useEffect(() => {
    if (!containerRef.current) return
    if (chartRef.current) {
      dispose(chartRef.current)
      chartRef.current = null
    }
    const chart = init(containerRef.current, {
      candle: { type: "candle_solid" },
      xAxis: { show: true },
      yAxis: { show: true },
      crosshair: { show: true },
      locale: "en-US",
    })
    chartRef.current = chart
    const onResize = () => chart.resize()
    window.addEventListener("resize", onResize)
    if (containerRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          chart.resize()
        })
      })
      resizeObserverRef.current.observe(containerRef.current)
    }
    requestAnimationFrame(() => chart.resize())

    return () => {
      window.removeEventListener("resize", onResize)
      if (resizeObserverRef.current && containerRef.current) {
        try {
          resizeObserverRef.current.unobserve(containerRef.current)
          resizeObserverRef.current.disconnect()
        } catch {}
        resizeObserverRef.current = null
      }
      if (chartRef.current) {
        dispose(chartRef.current)
        chartRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!chartRef.current || !kData.length) return
    if (typeof chartRef.current.applyNewData === "function") {
      chartRef.current.applyNewData(kData)
    } else if (typeof chartRef.current.setData === "function") {
      chartRef.current.setData(kData)
    }
  }, [kData])

  useEffect(() => {
    if (!chartRef.current) return
    const chart = chartRef.current
    removeOverlay(chart, overlayIdRef.current)
    if (!lines) {
      overlayIdRef.current = {}
      return
    }

    if (style.showBackground) {
      const id = chart.createOverlay({
        name: "polygon",
        points: buildBandPolygon(lines.upper, lines.lower),
        styles: {
          color: rgbaGrey(style.backgroundOpacity),
          borderSize: 0,
        },
        groupId: "BOLL_FILL",
        lock: true,
      })
      overlayIdRef.current.fill = id
    }

    if (style.showBasis) {
      const id = chart.createOverlay({
        name: "line",
        points: lines.basis.map((p) => ({ timestamp: p.timestamp, value: p.value })),
        styles: {
          color: style.basisColor,
          size: style.basisWidth,
          style: style.basisStyle === "dashed" ? "dashed" : "solid",
        },
        groupId: "BOLL_BASIS",
        lock: true,
      })
      overlayIdRef.current.basis = id
    }

    if (style.showUpper) {
      const id = chart.createOverlay({
        name: "line",
        points: lines.upper.map((p) => ({ timestamp: p.timestamp, value: p.value })),
        styles: {
          color: style.upperColor,
          size: style.upperWidth,
          style: style.upperStyle === "dashed" ? "dashed" : "solid",
        },
        groupId: "BOLL_UPPER",
        lock: true,
      })
      overlayIdRef.current.upper = id
    }

    if (style.showLower) {
      const id = chart.createOverlay({
        name: "line",
        points: lines.lower.map((p) => ({ timestamp: p.timestamp, value: p.value })),
        styles: {
          color: style.lowerColor,
          size: style.lowerWidth,
          style: style.lowerStyle === "dashed" ? "dashed" : "solid",
        },
        groupId: "BOLL_LOWER",
        lock: true,
      })
      overlayIdRef.current.lower = id
    }
  }, [lines, style])

  useEffect(() => {
    if (!chartRef.current) return
    const chart = chartRef.current
    const handler = (param: any) => {
      if (!param?.current?.kLineData) {
        writeTooltip("")
        return
      }
      const ts = param.current.kLineData.timestamp as number
      const p = lines?.raw.find((x) => x.timestamp === ts)
      if (!p) {
        writeTooltip("")
        return
      }
      writeTooltip(
        `BOLL(${inputs.length}, ${inputs.stdDevMultiplier})  Basis: ${fmt(p.basis)}  Upper: ${fmt(p.upper)}  Lower: ${fmt(p.lower)}`,
      )
    }
    chart.subscribeAction("crosshair", handler)
    return () => {
      chart.unsubscribeAction("crosshair", handler)
      writeTooltip("")
    }
  }, [lines, inputs.length, inputs.stdDevMultiplier])

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={containerRef}
        className={cn("w-full rounded-md bg-background", "min-h-[320px] h-[60vh] sm:h-[520px]")}
      />
      <div id="bb-tooltip" className="text-xs text-muted-foreground" aria-live="polite" />
    </div>
  )
}

function writeTooltip(text: string) {
  const el = document.getElementById("bb-tooltip")
  if (el) el.textContent = text
}
function fmt(n: number) {
  return Number.isFinite(n) ? n.toFixed(2) : "-"
}
function rgbaGrey(alpha: number) {
  const a = Math.max(0, Math.min(1, alpha))
  return `rgba(153,153,153,${a})`
}
function removeOverlay(chart: any, ids: { [k: string]: string | undefined }) {
  Object.values(ids).forEach((id) => {
    if (id) {
      try {
        chart.removeOverlay(id)
      } catch {}
    }
  })
}
function shiftSeries(series: { timestamp: number; basis: number; upper: number; lower: number }[], offset: number) {
  if (offset === 0) return series
  const out = new Array(series.length).fill(null) as any[]
  if (offset > 0) {
    for (let i = 0; i < series.length; i++) {
      const j = i + offset
      if (j < series.length) out[j] = { ...series[i], timestamp: series[j].timestamp }
    }
  } else {
    for (let i = 0; i < series.length; i++) {
      const j = i + offset
      if (j >= 0) out[j] = { ...series[i], timestamp: series[j].timestamp }
    }
  }
  return out.map(
    (v, i) => v ?? { timestamp: series[i].timestamp, basis: Number.NaN, upper: Number.NaN, lower: Number.NaN },
  )
}
function buildBandPolygon(
  upper: { timestamp: number; value: number }[],
  lower: { timestamp: number; value: number }[],
) {
  const pts = [...upper.map((p) => ({ timestamp: p.timestamp, value: p.value }))].concat(
    [...lower].reverse().map((p) => ({ timestamp: p.timestamp, value: p.value })),
  )
  return pts
}
