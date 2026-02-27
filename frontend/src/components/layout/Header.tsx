import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GradientText } from '../common/GradientText';
import { Button } from '../common/Button';
import { useWallet } from '../../hooks/useWallet';

export const Header: React.FC = () => {
  const { address, connected, connect, disconnect } = useWallet();
  const location = useLocation();

  const navItems = [
    { label: 'Market', path: '/swap' },
    { label: 'Wrap', path: '/deposit' },
    { label: 'Stake', path: '/pool' },
    { label: 'Docs', path: '/docs' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel px-6 py-3 rounded-2xl animate-reveal">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-grad-primary rounded-xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
            <span className="text-white text-xl font-bold">S</span>
          </div>
          <GradientText className="text-2xl hidden md:block">Stakied</GradientText>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === item.path ? 'text-primary' : 'text-text-muted'
                }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {connected ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs text-text-dim">Connected</span>
                <span className="text-sm font-mono text-text-main">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
              <Button variant="glass" size="sm" onClick={disconnect}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button variant="primary" size="sm" onClick={connect} className="shadow-glow">
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
