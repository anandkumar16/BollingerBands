"use client"

import { useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import type { BollingerInputs, BollingerStyle } from "@/lib/types"
import { Button } from "@/components/ui/button"

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  inputs: BollingerInputs
  onInputsChange: (v: BollingerInputs) => void
  style: BollingerStyle
  onStyleChange: (v: BollingerStyle) => void
}

export default function BollingerSettings({ open, onOpenChange, inputs, onInputsChange, style, onStyleChange }: Props) {
  const lineStyles = useMemo(() => ["solid", "dashed"] as const, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bollinger Bands Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="inputs">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
          </TabsList>

          <TabsContent value="inputs" className="mt-4 space-y-4">
            <div className="grid gap-3">
              <Label htmlFor="length">Length</Label>
              <Input
                id="length"
                type="number"
                min={1}
                value={inputs.length}
                onChange={(e) => onInputsChange({ ...inputs, length: Math.max(1, Number(e.target.value || 1)) })}
              />
            </div>

            <div className="grid gap-3">
              <Label>Basic MA Type</Label>
              <Select value={inputs.maType} onValueChange={(v) => onInputsChange({ ...inputs, maType: v as "SMA" })}>
                <SelectTrigger>
                  <SelectValue placeholder="SMA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMA">SMA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <Label>Source</Label>
              <Select value={inputs.source} onValueChange={(v) => onInputsChange({ ...inputs, source: v as "close" })}>
                <SelectTrigger>
                  <SelectValue placeholder="close" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="close">Close</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="std">StdDev (multiplier)</Label>
              <Input
                id="std"
                type="number"
                step="0.1"
                value={inputs.stdDevMultiplier}
                onChange={(e) => onInputsChange({ ...inputs, stdDevMultiplier: Number(e.target.value || 0) })}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="offset">Offset</Label>
              <Input
                id="offset"
                type="number"
                step="1"
                value={inputs.offset}
                onChange={(e) => onInputsChange({ ...inputs, offset: Number(e.target.value || 0) })}
              />
              <p className="text-xs text-muted-foreground">Positive shifts forward (to the right).</p>
            </div>
          </TabsContent>

          <TabsContent value="style" className="mt-4 space-y-6">
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Basis (middle band)</legend>
              <div className="flex items-center justify-between">
                <Label>Visible</Label>
                <Switch checked={style.showBasis} onCheckedChange={(v) => onStyleChange({ ...style, showBasis: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Color</Label>
                  <input
                    type="color"
                    className="h-9 w-full rounded-md border"
                    value={style.basisColor}
                    onChange={(e) => onStyleChange({ ...style, basisColor: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Width</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={style.basisWidth}
                    onChange={(e) => onStyleChange({ ...style, basisWidth: Number(e.target.value || 1) })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Line style</Label>
                <Select
                  value={style.basisStyle}
                  onValueChange={(v) => onStyleChange({ ...style, basisStyle: v as "solid" | "dashed" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lineStyles.map((ls) => (
                      <SelectItem key={ls} value={ls}>
                        {ls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Upper band</legend>
              <div className="flex items-center justify-between">
                <Label>Visible</Label>
                <Switch checked={style.showUpper} onCheckedChange={(v) => onStyleChange({ ...style, showUpper: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Color</Label>
                  <input
                    type="color"
                    className="h-9 w-full rounded-md border"
                    value={style.upperColor}
                    onChange={(e) => onStyleChange({ ...style, upperColor: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Width</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={style.upperWidth}
                    onChange={(e) => onStyleChange({ ...style, upperWidth: Number(e.target.value || 1) })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Line style</Label>
                <Select
                  value={style.upperStyle}
                  onValueChange={(v) => onStyleChange({ ...style, upperStyle: v as "solid" | "dashed" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lineStyles.map((ls) => (
                      <SelectItem key={ls} value={ls}>
                        {ls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Lower band</legend>
              <div className="flex items-center justify-between">
                <Label>Visible</Label>
                <Switch checked={style.showLower} onCheckedChange={(v) => onStyleChange({ ...style, showLower: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Color</Label>
                  <input
                    type="color"
                    className="h-9 w-full rounded-md border"
                    value={style.lowerColor}
                    onChange={(e) => onStyleChange({ ...style, lowerColor: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Width</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={style.lowerWidth}
                    onChange={(e) => onStyleChange({ ...style, lowerWidth: Number(e.target.value || 1) })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Line style</Label>
                <Select
                  value={style.lowerStyle}
                  onValueChange={(v) => onStyleChange({ ...style, lowerStyle: v as "solid" | "dashed" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lineStyles.map((ls) => (
                      <SelectItem key={ls} value={ls}>
                        {ls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Background fill</legend>
              <div className="flex items-center justify-between">
                <Label>Visible</Label>
                <Switch
                  checked={style.showBackground}
                  onCheckedChange={(v) => onStyleChange({ ...style, showBackground: v })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Opacity</Label>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[style.backgroundOpacity]}
                  onValueChange={(v) => onStyleChange({ ...style, backgroundOpacity: v[0] })}
                />
              </div>
            </fieldset>

            <div className="pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
