import { memo } from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  hint: string;
  tone?: 'default' | 'danger';
}

export const KpiCard = memo(function KpiCard({
  label,
  value,
  hint,
  tone = 'default',
}: KpiCardProps) {
  return (
    <div className={tone === 'danger' ? 'kpi kpi--danger' : 'kpi'}>
      <p className="kpi__label">{label}</p>
      <p className="kpi__value">{value}</p>
      <p className="kpi__hint">{hint}</p>
    </div>
  );
});
