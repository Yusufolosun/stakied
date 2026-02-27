import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { GradientText } from '../components/common/GradientText';
import { usePTYT } from '../hooks/usePTYT';
import { useSYToken } from '../hooks/useSYToken';
import { useWallet } from '../hooks/useWallet';

export const Mint: React.FC = () => {
  const { address } = useWallet();
  const { balance: syBalance } = useSYToken(address);
  const { mintPTYT, ptBalance, ytBalance, isLoading, error } = usePTYT(address);

  const [syAmount, setSyAmount] = useState('');
  const [maturity, setMaturity] = useState(1);

  const handleMint = async () => {
    if (!syAmount) return;
    const amount = BigInt(Math.floor(parseFloat(syAmount) * 1e6));
    await mintPTYT(amount, maturity);
    setSyAmount('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-reveal">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-display"><GradientText>Tokenization Engine</GradientText></h1>
        <p className="text-text-muted text-lg max-w-2xl mx-auto">
          Split your SY tokens into Principal (PT) and Yield (YT) tokens.
          Principal tokens appreciate to face value, while Yield tokens stream real-time BTC rewards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Minting Interface */}
        <Card className="lg:col-span-2 p-2">
          <div className="space-y-8">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
              <div className="flex justify-between text-xs font-semibold text-text-muted mb-4 uppercase tracking-wider">
                <span>Asset to Tokenize</span>
                <span>SY Balance: {(Number(syBalance) / 1e6).toFixed(2)} SY</span>
              </div>

              <div className="flex items-center gap-6">
                <input
                  type="number"
                  placeholder="0.00"
                  className="bg-transparent border-none outline-none text-4xl font-display font-bold text-main w-full"
                  value={syAmount}
                  onChange={(e) => setSyAmount(e.target.value)}
                />
                <div className="glass-panel px-4 py-2 rounded-xl font-bold text-xl flex items-center gap-2">
                  SY
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">Select Maturity</label>
                <select
                  value={maturity}
                  onChange={(e) => setMaturity(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-main font-semibold outline-none focus:border-primary/50 transition-all cursor-pointer"
                >
                  <option value={1}>31 December 2026</option>
                  <option value={2}>30 June 2027</option>
                  <option value={3}>31 December 2027</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">Current YieldRate</label>
                <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-success font-display font-bold text-xl">
                  4.2% Fixed
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-panel p-5 rounded-2xl border-white/5 text-center">
                <p className="text-[10px] text-text-dim uppercase font-bold mb-2">You receive PT</p>
                <h4 className="text-2xl font-display text-main mb-0">{syAmount || '0.00'}</h4>
              </div>
              <div className="glass-panel p-5 rounded-2xl border-white/5 text-center">
                <p className="text-[10px] text-text-dim uppercase font-bold mb-2">You receive YT</p>
                <h4 className="text-2xl font-display text-primary mb-0">{syAmount || '0.00'}</h4>
              </div>
            </div>

            {error && <p className="text-error text-sm text-center font-medium">{error}</p>}

            <Button
              onClick={handleMint}
              isLoading={isLoading}
              className="w-full py-5 text-xl shadow-glow"
            >
              Mint PT & YT
            </Button>
          </div>
        </Card>

        {/* Info & Balances Sidebar */}
        <div className="space-y-8">
          <Card title="Your Portfolio" variant="solid" className="bg-primary/5 border-primary/20">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-text-dim uppercase font-bold mb-1">Total Principal</p>
                  <h4 className="text-2xl font-display text-main mb-0">{(Number(ptBalance) / 1e6).toFixed(2)} PT</h4>
                </div>
                <div className="text-xs text-success font-bold">+1.2%</div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-text-dim uppercase font-bold mb-1">Total Yield Tokens</p>
                  <h4 className="text-2xl font-display text-primary mb-0">{(Number(ytBalance) / 1e6).toFixed(2)} YT</h4>
                </div>
                <div className="text-xs text-primary font-bold">Live ⚡</div>
              </div>
            </div>
          </Card>

          <Card title="How it Works" interactive={false}>
            <div className="space-y-4 text-xs text-text-muted leading-relaxed">
              <p>
                1. <span className="text-main font-bold">Lock SY:</span> Your Standardized Yield tokens are locked until maturity.
              </p>
              <p>
                2. <span className="text-main font-bold">Receive PT:</span> Principal Tokens can be traded or held to redeem 1 SY at maturity.
              </p>
              <p>
                3. <span className="text-main font-bold">Receive YT:</span> Yield Tokens stream all rewards from the underlying assets until maturity.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
