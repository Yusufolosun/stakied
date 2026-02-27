import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { GradientText } from '../components/common/GradientText';
import { useSYToken } from '../hooks/useSYToken';
import { useSTXBalance } from '../hooks/useSTXBalance';
import { useWallet } from '../hooks/useWallet';

export const Deposit: React.FC = () => {
  const { address } = useWallet();
  const { balance: stxBalance, isLoading: stxLoading } = useSTXBalance(address);
  const { balance: syBalance, deposit, redeem, isLoading, error } = useSYToken(address);

  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<'wrap' | 'unwrap'>('wrap');

  const handleAction = async () => {
    if (!amount) return;
    const val = BigInt(Math.floor(parseFloat(amount) * 1e6));

    if (mode === 'wrap') {
      await deposit(val);
    } else {
      await redeem(val);
    }
    setAmount('');
  };

  const handleMax = () => {
    if (mode === 'wrap') {
      setAmount((Number(stxBalance) / 1e6).toString());
    } else {
      setAmount((Number(syBalance) / 1e6).toString());
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-reveal">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-display"><GradientText>Yield Vault</GradientText></h1>
        <p className="text-text-muted text-lg max-w-lg mx-auto">
          Standardize your yield. Wrap STX into SY to unlock PT/YT trading and cross-protocol composability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Interaction Card */}
        <Card className="md:col-span-1 p-2">
          <div className="flex p-1 bg-white/5 rounded-2xl mb-6">
            <button
              onClick={() => setMode('wrap')}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${mode === 'wrap' ? 'bg-primary text-white shadow-glow' : 'text-text-muted hover:text-main'}`}
            >
              Wrap
            </button>
            <button
              onClick={() => setMode('unwrap')}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${mode === 'unwrap' ? 'bg-primary text-white shadow-glow' : 'text-text-muted hover:text-main'}`}
            >
              Unwrap
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="flex justify-between text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">
                <span>Amount</span>
                <span className="cursor-pointer hover:text-primary transition-colors" onClick={handleMax}>
                  Balance: {(Number(mode === 'wrap' ? stxBalance : syBalance) / 1e6).toFixed(4)} {mode === 'wrap' ? 'STX' : 'SY'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  placeholder="0.00"
                  className="bg-transparent border-none outline-none text-2xl font-display font-bold text-main w-full"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button onClick={handleMax} className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">MAX</button>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-dim">Exchange Rate</span>
                <span className="text-text-main font-medium">1 STX = 1.00 SY</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">Protocol Fee</span>
                <span className="text-success font-medium">0.00%</span>
              </div>
            </div>

            {error && <p className="text-error text-sm text-center font-medium animate-reveal">{error}</p>}

            <Button
              onClick={handleAction}
              isLoading={isLoading}
              className="w-full py-4 text-lg"
            >
              {mode === 'wrap' ? 'Wrap STX' : 'Unwrap SY'}
            </Button>
          </div>
        </Card>

        {/* Benefits Card */}
        <div className="space-y-6">
          <Card title="Vault Benefits" interactive={false}>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <span className="text-primary font-bold">01</span>
                <div>
                  <h4 className="text-sm font-bold mb-1">Standardized Yield</h4>
                  <p className="text-xs text-text-muted">Universal yield interface for all Stacks DeFi protocols.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-primary font-bold">02</span>
                <div>
                  <h4 className="text-sm font-bold mb-1">PT/YT Ready</h4>
                  <p className="text-xs text-text-muted">Essential for separating principal and yield on Stakied.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-primary font-bold">03</span>
                <div>
                  <h4 className="text-sm font-bold mb-1">Instant Redemption</h4>
                  <p className="text-xs text-text-muted">Unwrap back to STX at any time with zero protocol slippage.</p>
                </div>
              </li>
            </ul>
          </Card>

          <Card variant="solid" className="bg-primary/5 border-primary/20 text-center py-6">
            <p className="text-xs text-text-muted mb-2 uppercase tracking-widest font-bold">Current SY Supply</p>
            <h3 className="text-3xl font-display text-primary mb-0">8.42M SY</h3>
          </Card>
        </div>
      </div>
    </div>
  );
};
