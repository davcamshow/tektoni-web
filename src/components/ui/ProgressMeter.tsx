interface ProgressMeterProps {
  value: number;
  label: string;
}

/** Barra de avance accesible (role="progressbar" con valor anunciado). */
export function ProgressMeter({ value, label }: ProgressMeterProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className="meter-row">
      <div
        className="meter"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label={label}
      >
        <div className="meter__fill" style={{ width: `${clamped}%` }} />
      </div>
      <span className="meter__value" aria-hidden="true">
        {clamped}%
      </span>
    </div>
  );
}
