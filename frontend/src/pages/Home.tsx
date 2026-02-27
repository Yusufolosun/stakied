import React from 'react';
import { Link } from 'react-router-dom';
import { GradientText } from '../components/common/GradientText';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const Home: React.FC = () => {
  const stats = [
    { label: 'Total Value Locked', value: '$12.4M', change: '+12%' },
    { label: 'Total Yield Paid', value: '$1.2M', change: '+5.4%' },
    { label: 'Active Stakers', value: '2,450', change: '+120' },
  ];

  const features = [
    {
      title: 'Yield Wrapping',
      description: 'Convert your yield-bearing assets into SY tokens for maximum composability.',
      link: '/deposit',
      icon: '📦',
      color: 'from-violet-500 to-indigo-500',
    },
    {
      title: 'PT/YT Trading',
      description: 'Separate principal and yield. Speculate on rates or lock in fixed yields.',
      link: '/swap',
      icon: '🔄',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      title: 'Liquidity Pools',
      description: 'Provide liquidity to our AMM and earn trading fees plus protocol rewards.',
      link: '/pool',
      icon: '💧',
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <div className="space-y-24 animate-reveal">
      {/* Hero Section */}
      <section className="text-center space-y-8 relative py-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-grad-glow opacity-50 -z-10" />

        <div className="inline-block px-4 py-1.5 rounded-full glass-panel text-xs font-semibold text-primary mb-4 border-primary/20">
          ✨ New: Phase 4 Mainnet Integration Live
        </div>

        <h1 className="max-w-4xl mx-auto">
          The Future of <GradientText>Bitcoin Yield</GradientText> is Here.
        </h1>

        <p className="max-w-2xl mx-auto text-xl text-text-muted leading-relaxed">
          Stakied is the premier yield tokenization and trading protocol built on Stacks.
          Unlock fixed rates, leverage yield, and maximize your BTC returns.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
          <Link to="/swap">
            <Button size="lg" className="min-w-[180px]">Launch App</Button>
          </Link>
          <Link to="/docs">
            <Button variant="glass" size="lg" className="min-w-[180px]">Read Docs</Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <Card key={stat.label} className={`stagger-${i + 1}`}>
            <div className="space-y-1">
              <p className="text-sm font-medium text-text-muted">{stat.label}</p>
              <div className="flex items-baseline justify-between">
                <h2 className="text-3xl font-display mb-0">{stat.value}</h2>
                <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                  {stat.change}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl">One Protocol. <GradientText>Endless Yield.</GradientText></h2>
          <p className="text-text-muted max-w-xl mx-auto">
            Choose the strategy that fits your risk profile and market outlook.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <Card key={feature.title} title={feature.title} className={`stagger-${i + 1} hover-lift`}>
              <div className="space-y-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl shadow-lg`}>
                  {feature.icon}
                </div>
                <p className="text-text-muted leading-relaxed">
                  {feature.description}
                </p>
                <Link to={feature.link} className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
                  Get Started <span>→</span>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <Card variant="solid" className="bg-grad-primary text-center py-16 space-y-8 overflow-hidden relative">
        <div className="absolute inset-0 bg-white/5 opacity-50 backdrop-blur-3xl -z-10" />
        <h2 className="text-white text-5xl">Ready to maximize your yield?</h2>
        <p className="text-white/80 max-w-xl mx-auto text-lg">
          Join thousands of stakers securing the Stacks network and trading yield on the most advanced protocol.
        </p>
        <div className="pt-4">
          <Link to="/swap">
            <Button variant="glass" size="lg" className="bg-white text-primary hover:bg-white/90">
              Go to Market
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
