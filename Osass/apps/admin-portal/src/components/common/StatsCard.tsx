import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <div className={cn('stats-card', className)}>
      <div className="flex items-center justify-between">
        <span className="stats-card-title">{title}</span>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="stats-card-value">{value}</div>
      {trend && (
        <div className={cn('stats-card-trend', trend.isPositive ? 'positive' : 'negative')}>
          <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
          <span className="text-muted-foreground">from last month</span>
        </div>
      )}
    </div>
  );
}
