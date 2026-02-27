import React from 'react';
import { Card } from '../components/common/Card';
import { GradientText } from '../components/common/GradientText';

export const Docs: React.FC = () => {
  const sections = [
    {
      title: 'Introduction',
      content: 'Stakied is a yield tokenization protocol that allows anyone to lock yield-bearing assets and split them into Principal Tokens (PT) and Yield Tokens (YT).'
    },
    {
      title: 'Principal Tokens (PT)',
      content: 'PT represents the principal of the underlying yield-bearing asset. It can be redeemed 1:1 for the underlying at maturity. PT effectively allows you to lock in a fixed yield.'
    },
    {
      title: 'Yield Tokens (YT)',
      content: 'YT represents the yield component of the underlying asset. Holders of YT stream all rewards from the underlying asset in real-time until maturity.'
    },
    {
      title: 'Standardized Yield (SY)',
      content: 'SY is a token standard that wraps various yield-bearing assets into a unified interface, making them compatible with the Stakied PT/YT engine.'
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-reveal">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-display uppercase tracking-tight">
          Protocol <GradientText>Knowledge Base</GradientText>
        </h1>
        <p className="text-text-muted text-lg max-w-2xl mx-auto">
          Deep dive into the architecture, mechanics, and strategies of the Stakied Protocol.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1 space-y-4 sticky top-24">
          <p className="text-[10px] text-text-dim uppercase font-bold tracking-widest pl-2">Navigation</p>
          <nav className="space-y-1">
            {sections.map(s => (
              <a
                key={s.title}
                href={`#${s.title.toLowerCase()}`}
                className="block px-3 py-2 text-sm text-text-muted hover:text-primary hover:bg-white/5 rounded-lg transition-all"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        <div className="md:col-span-3 space-y-12">
          {sections.map((section, i) => (
            <Card
              key={section.title}
              id={section.title.toLowerCase()}
              className={`stagger-${(i % 4) + 1}`}
            >
              <h3 className="text-2xl font-display text-main mb-4">{section.title}</h3>
              <p className="text-text-muted leading-relaxed">
                {section.content}
              </p>
              <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center text-xs">
                <span className="text-text-dim">Last updated: Feb 2026</span>
                <button className="text-primary hover:underline">Share link ↗</button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
