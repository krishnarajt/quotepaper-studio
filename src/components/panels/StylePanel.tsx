"use client";

import { AlignLeft, AlignCenter, AlignRight, ArrowUp, Minus, ArrowDown, RotateCcw } from "lucide-react";
import { useStudio } from "@/lib/store/useStudio";
import { FONTS } from "@/lib/fonts";
import { PRESETS, type TextAlign, type VerticalPos } from "@/lib/constants";
import { Section, Field, Slider, Toggle, SegButton, Chip } from "@/components/ui";

const SWATCHES = ["#ffffff", "#fdfaf3", "#0b0f1a", "#ffd7a8", "#c7f0ff", "#ffc9d6"];

export default function StylePanel() {
  const style = useStudio((s) => s.style);
  const setStyle = useStudio((s) => s.setStyle);
  const applyPreset = useStudio((s) => s.applyPreset);
  const resetStyle = useStudio((s) => s.resetStyle);

  return (
    <>
      <Section title="Presets">
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <Chip key={p.key} label={p.label} onClick={() => applyPreset(p.key)} />
          ))}
        </div>
      </Section>

      <Section
        title="Text"
        action={
          <button type="button" onClick={resetStyle} title="Reset style" className="text-zinc-500 hover:text-zinc-300">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        }
      >
        <Field label="Font">
          <div className="grid grid-cols-3 gap-1.5">
            {FONTS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setStyle({ fontKey: f.key })}
                style={{ fontFamily: f.family }}
                className={`truncate rounded-lg px-2 py-2 text-base transition ${
                  style.fontKey === f.key ? "bg-indigo-500 text-white" : "bg-white/5 text-zinc-200 hover:bg-white/10"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label={`Size ${style.fontScale.toFixed(2)}×`}>
          <Slider value={style.fontScale} min={0.6} max={1.7} step={0.05} onChange={(v) => setStyle({ fontScale: v })} />
        </Field>

        <Field label="Colour">
          <div className="flex items-center gap-2">
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setStyle({ textColor: c })}
                style={{ backgroundColor: c }}
                className={`h-6 w-6 rounded-full ring-2 transition ${
                  style.textColor === c ? "ring-indigo-400" : "ring-white/20"
                }`}
              />
            ))}
            <input
              type="color"
              value={style.textColor}
              onChange={(e) => setStyle({ textColor: e.target.value })}
              className="h-6 w-8 cursor-pointer rounded bg-transparent"
            />
          </div>
        </Field>

        <Field label="Alignment">
          <SegButton<TextAlign>
            value={style.align}
            onChange={(v) => setStyle({ align: v })}
            options={[
              { value: "left", label: <AlignLeft className="mx-auto h-4 w-4" />, title: "Left" },
              { value: "center", label: <AlignCenter className="mx-auto h-4 w-4" />, title: "Center" },
              { value: "right", label: <AlignRight className="mx-auto h-4 w-4" />, title: "Right" },
            ]}
          />
        </Field>

        <Field label="Position">
          <SegButton<VerticalPos>
            value={style.vertical}
            onChange={(v) => setStyle({ vertical: v })}
            options={[
              { value: "top", label: <ArrowUp className="mx-auto h-4 w-4" />, title: "Top" },
              { value: "center", label: <Minus className="mx-auto h-4 w-4" />, title: "Center" },
              { value: "bottom", label: <ArrowDown className="mx-auto h-4 w-4" />, title: "Bottom" },
            ]}
          />
        </Field>

        <div className="mt-3 space-y-2">
          <Toggle checked={style.uppercase} onChange={(v) => setStyle({ uppercase: v })} label="Uppercase" />
          <Toggle checked={style.showAuthor} onChange={(v) => setStyle({ showAuthor: v })} label="Show author" />
          <Toggle checked={style.showQuoteMarks} onChange={(v) => setStyle({ showQuoteMarks: v })} label="Quote marks" />
        </div>
      </Section>

      <Section title="Background FX">
        <Field label={`Darken ${Math.round(style.scrim * 100)}%`}>
          <Slider value={style.scrim} min={0} max={0.85} step={0.05} onChange={(v) => setStyle({ scrim: v })} />
        </Field>
        <Field label={`Blur ${style.blur}px`}>
          <Slider value={style.blur} min={0} max={14} step={1} onChange={(v) => setStyle({ blur: v })} />
        </Field>
        <Toggle checked={style.vignette} onChange={(v) => setStyle({ vignette: v })} label="Vignette" />
      </Section>
    </>
  );
}
