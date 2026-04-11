"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./quantity-slider.module.css";

// Snap la valeur au multiple de step le plus proche, >= moq
function snapToStep(value: number, moq: number, step: number): number {
  const snapped = Math.round((value - moq) / step) * step + moq;
  return Math.max(moq, snapped);
}

// Construit les ticks affichés sous le slider
function buildTicks(moq: number, step: number, max: number): number[] {
  const ticks: number[] = [];
  for (let v = moq; v <= max; v += step) {
    ticks.push(v);
  }
  return ticks;
}

type Props = {
  moq: number;                          // valeur minimale
  step?: number;                        // palier (= moq par défaut)
  max?: number;                         // valeur maximale du slider
  value: number;
  onChange: (value: number) => void;
};

export function QuantitySlider({
  moq,
  step: stepProp,
  max: maxProp,
  value,
  onChange,
}: Props) {
  const step = stepProp ?? moq;
  const max = maxProp ?? Math.max(moq * 10, 50);
  const [isDragging, setIsDragging] = useState(false);
  const [showBounce, setShowBounce] = useState(false);
  const prevValue = useRef(value);
  const rangeRef = useRef<HTMLInputElement>(null);

  const pct = ((value - moq) / (max - moq)) * 100;
  const clampedPct = Math.max(0, Math.min(100, pct));

  const ticks = buildTicks(moq, step, max);
  // Limite à 6 ticks max pour ne pas surcharger
  const displayTicks = ticks.length <= 6 ? ticks : ticks.filter((_, i) => i % Math.ceil(ticks.length / 6) === 0 || ticks[i] === ticks[ticks.length - 1]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = Number(e.target.value);
      const snapped = snapToStep(raw, moq, step);
      onChange(snapped);
    },
    [moq, step, onChange],
  );

  // Animation bounce sur changement de valeur
  useEffect(() => {
    if (prevValue.current !== value) {
      setShowBounce(true);
      const t = setTimeout(() => setShowBounce(false), 200);
      prevValue.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <div className={styles.wrap}>
      {/* Valeur courante */}
      <div className={styles.valueRow}>
        <span className={`${styles.value} ${showBounce ? styles.valueChanged : ""}`}>
          {value}
        </span>
        {moq > 1 && (
          <span className={styles.moqLabel}>min. {moq}</span>
        )}
      </div>

      {/* Track + thumb interactif */}
      <div className={styles.trackWrap}>
        {/* Track background + fill */}
        <div className={styles.track}>
          <div className={styles.trackFill} style={{ width: `${clampedPct}%` }} />
        </div>

        {/* Thumb visuel */}
        <div
          className={`${styles.thumb} ${isDragging ? styles.thumbActive : ""}`}
          style={{ left: `${clampedPct}%` }}
        />

        {/* Input range transparent par-dessus */}
        <input
          ref={rangeRef}
          type="range"
          className={styles.range}
          min={moq}
          max={max}
          step={1}
          value={value}
          onChange={handleChange}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          aria-label={`Quantité (minimum ${moq})`}
          aria-valuemin={moq}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>

      {/* Graduations */}
      {displayTicks.length > 1 && (
        <div className={styles.ticks}>
          {displayTicks.map((tick) => (
            <div key={tick} className={styles.tick}>
              <div className={styles.tickMark} />
              <span className={styles.tickLabel}>{tick}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
