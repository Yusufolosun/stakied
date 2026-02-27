import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { GradientText } from '../components/common/GradientText';
import { useSwap } from '../hooks/useSwap';
import { usePTYT } from '../hooks/usePTYT';
import { useWallet } from '../hooks/useWallet';

export const Swap: React.FC = () => {
  const { address } = useWallet();
  const { ptBalance, refresh: refreshBalances } = usePTYT(address);
  const { buyPT, sellPT, isLoading, error } = useSwap(address);

  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapType, setSwapType] = useState<'buy' | 'sell'>('buy');
  const [maturity, setMaturity] = useState(1);

  // Simplified calculation for demo; in production use a real price impact formula
  useEffect(() => {
    const val = parseFloat(fromAmount) || 0;
    if (swapType === 'buy') {
      setToAmount((val * 0.985).toFixed(4)); // 1.5% fixed "imbalance" for demo
    } else {
      setToAmount((val * 1.012).toFixed(4));
    }
  }, [fromAmount, swapType]);

  const handleSwap = async () => {
    if (!fromAmount) return;
    const amount = BigInt(Math.floor(parseFloat(fromAmount) * 1e6)); // Assuming 6 decimals
    const minRecv = BigInt(Math.floor(parseFloat(toAmount) * 0.99 * 1e6)); // 1% slippage toggle

    try {
      if (swapType === 'buy') {
        await buyPT(amount, minRecv);
      } else {
        await sellPT(amount, minRecv);
      }
      refreshBalances();
    } catch (err) {
      console.error('Swap failed:', err);
    }
  };

  const toggleSwap = () => {
    setSwapType(swapType === 'buy' ? 'sell' : 'buy');
    setFromAmount('');
    setToAmount('');
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-reveal">
      <div className="text-center space-y-2">
        <h1 className="text-4xl"><GradientText>Swap Market</GradientText></h1>
        <p className="text-text-muted">Trade between SY and PT at institutional rates.</p>
      </div>

      <Card className="p-2">
        <div className="space-y-4">
          {/* From Section */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex justify-between text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">
              <span>From</span>
              <span>Balance: 0.00 SY</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                placeholder="0.00"
                className="bg-transparent border-none outline-none text-2xl font-display font-bold text-main w-full"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
              />
              <div className="glass-panel px-3 py-1.5 rounded-xl font-bold flex items-center gap-2">
                {swapType === 'buy' ? 'SY' : 'PT'}
              </div>
            </div>
          </div>

          {/* Swap Toggle Arrow */}
          <div className="flex justify-center -my-6 relative z-10">
            <button
              onClick={toggleSwap}
              className="w-10 h-10 rounded-xl bg-grad-primary flex items-center justify-center text-white shadow-glow hover:rotate-180 transition-transform"
            >
              ↓
            </button>
          </div>

          {/* To Section */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex justify-between text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">
              <span>To (Estimated)</span>
              <span>Balance: {(Number(ptBalance) / 1e6).toFixed(2)} PT</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                readOnly
                placeholder="0.00"
                className="bg-transparent border-none outline-none text-2xl font-display font-bold text-main w-full"
                value={toAmount}
              />
              <div className="glass-panel px-3 py-1.5 rounded-xl font-bold flex items-center gap-2">
                {swapType === 'buy' ? 'PT' : 'SY'}
              </div>
            </div>
          </div>

          {/* Maturity Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">Maturity</label>
              <select
                value={maturity}
                onChange={(e) => setMaturity(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-main outline-none focus:border-primary/50"
              >
                <option value={1}>Dec 2026</option>
                <option value={2}>June 2027</option>
              </select>
            </div>
            <div className="space-y-2 text-right">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mr-1">Implied APY</label>
              <div className="text-success text-lg font-display font-bold pt-1">4.82%</div>
            </div>
          </div>

          {/* Market Stats */}
          <div className="glass-panel rounded-2xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-dim">Exchange Rate</span>
              <span className="text-text-main font-medium">1 PT = 0.985 SY</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-dim">Price Impact</span>
              <span className="text-success font-medium">&lt; 0.01%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-dim">Min. Received</span>
              <span className="text-text-main font-medium">{(parseFloat(toAmount) * 0.99 || 0).toFixed(4)} {swapType === 'buy' ? 'PT' : 'SY'}</span>
            </div>
          </div>

          {error && <p className="text-error text-sm text-center font-medium animate-reveal">{error}</p>}

          <Button
            onClick={handleSwap}
            isLoading={isLoading}
            className="w-full shadow-glow py-4 text-lg"
          >
            {swapType === 'buy' ? 'Buy PT' : 'Sell PT'}
          </Button>
        </div>
      </Card>

      {/* Market Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-2xl border border-white/5 bg-white/5 text-text-muted italic">
          💡 PT (Principal Tokens) allow you to lock in a fixed yield until maturity.
        </div>
        <div className="p-4 rounded-2xl border border-white/5 bg-white/5 text-text-muted italic">
          💡 SY (Standardized Yield) tokens can be redeemed for the underlying asset at any time.
        </div>
      </div>
    </div>
  );
};
