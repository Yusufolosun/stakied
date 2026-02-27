import React from 'react';
import { Card } from '../components/common/Card';
import { GradientText } from '../components/common/GradientText';

export const Analytics: React.FC = () => {
  const stats = [
    { label: 'Total Volume', value: '$420M', change: '+5.2%' },
    { label: 'Protocol Revenue', value: '$1.2M', change: '+12.1%' },
    { label: 'Unique Users', value: '42,069', change: '+842' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-reveal">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-display"><GradientText>Analytics Dashboard</GradientText></h1>
        <p className="text-text-muted text-lg">Real-time protocol metrics and performance indicators.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <Card key={stat.label} variant="glass" className={`stagger-${i + 1} p-6`}>
            <p className="text-[10px] text-text-dim uppercase font-bold mb-1">{stat.label}</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-display text-main mb-0">{stat.value}</h3>
              <span className="text-xs font-bold text-success">
                {stat.change}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="TVL Breakdown" className="h-96">
          <div className="h-full flex items-center justify-center text-text-dim italic">
            [Chart Placeholder: TVL over Time]
          </div>
        </Card>
        <Card title="Volume Analytics" className="h-96">
          <div className="h-full flex items-center justify-center text-text-dim italic">
            [Chart Placeholder: Daily Volume by Asset]
          </div>
        </Card>
      </div>
    </div>
  );
};
