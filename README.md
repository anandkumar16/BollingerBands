# Bollinger Bands

A Next.js app that renders a candlestick chart with a production‑ready Bollinger Bands indicator using KLineCharts only.

## Tech
- Next.js + TypeScript
- TailwindCSS 
- KLineCharts

## Data
Demo OHLCV JSON at `public/data/ohlcv.json`. 

## Features
- Add Indicator button
- Settings modal with Inputs and Style tabs
- Immediate updates on input/style changes
- Crosshair tooltip showing Basis/Upper/Lower
- Background fill between upper and lower (configurable opacity)
- Offset to shift bands by N bars (positive shifts right)

## Formulas
- Basis (middle band) = SMA(close, length)
- StdDev = sample standard deviation over the last `length` closes (n − 1)
- Upper = Basis + (StdDev multiplier × StdDev)
- Lower = Basis − (StdDev multiplier × StdDev)
- Offset: shifts the three series by `offset` bars

## KLineCharts Version
Imports from `klinecharts`. 

## Run
- npm i
- npm run dev
- Open http://localhost:3000




