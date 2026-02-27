import React from 'react';
import { Link } from 'react-router-dom';
import { GradientText } from '../common/GradientText';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: 'Protocol',
      links: [
        { label: 'Market', path: '/swap' },
        { label: 'Yield Wrap', path: '/deposit' },
        { label: 'Staking', path: '/pool' },
        { label: 'Governance', path: '/gov' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', path: '/docs' },
        { label: 'Whitepaper', path: '#' },
        { label: 'Github', path: 'https://github.com/Yusufolosun/stakied' },
        { label: 'Brand Assets', path: '#' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Discord', path: '#' },
        { label: 'Twitter', path: '#' },
        { label: 'Telegram', path: '#' },
        { label: 'Contact', path: '#' },
      ],
    },
  ];

  return (
    <footer className="mt-20 border-t border-white/5 bg-color-bg-space/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-grad-primary rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">S</span>
              </div>
              <GradientText className="text-xl">Stakied</GradientText>
            </Link>
            <p className="text-text-muted max-w-sm mb-6">
              The premier yield trading and tokenization protocol on Stacks.
              Unlock the full potential of your Bitcoin yield through PT/YT separation.
            </p>
            <div className="flex items-center gap-4">
              {/* Social icons placeholders */}
              <div className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center hover:bg-white/5 cursor-pointer transition-colors">
                <span className="sr-only">Twitter</span>
                𝕏
              </div>
              <div className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center hover:bg-white/5 cursor-pointer transition-colors">
                <span className="sr-only">Github</span>
                🐙
              </div>
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="font-display font-semibold text-main mb-6">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.path.startsWith('http') ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-text-muted hover:text-primary transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="text-sm text-text-muted hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-text-dim">
            © {currentYear} Stakied Protocol. Built with ❤️ on Stacks.
          </p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-xs text-text-dim hover:text-text-muted">Privacy Policy</Link>
            <Link to="#" className="text-xs text-text-dim hover:text-text-muted">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
