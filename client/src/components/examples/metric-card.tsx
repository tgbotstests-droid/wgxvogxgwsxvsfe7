import { MetricCard } from '../metric-card'
import { DollarSign, Activity, TrendingUp, Percent } from 'lucide-react'

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <MetricCard
        title="Общая прибыль"
        value="$12,543.80"
        trend={{ value: "+15.2%", isPositive: true }}
        icon={<DollarSign className="w-5 h-5 text-muted-foreground" />}
      />
      <MetricCard
        title="Активные возможности"
        value="23"
        icon={<Activity className="w-5 h-5 text-muted-foreground" />}
      />
      <MetricCard
        title="Процент успеха"
        value="87.5%"
        trend={{ value: "+3.1%", isPositive: true }}
        icon={<Percent className="w-5 h-5 text-muted-foreground" />}
      />
      <MetricCard
        title="Дневная P/L"
        value="$1,234.56"
        trend={{ value: "+8.4%", isPositive: true }}
        icon={<TrendingUp className="w-5 h-5 text-muted-foreground" />}
      />
    </div>
  )
}
