import React, { useState } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function DoseOptimizer() {
  const [genericName, setGenericName] = useState('');
  const [requiredStrengthNum, setRequiredStrengthNum] = useState('');
  const [dailyFrequency, setDailyFrequency] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const { data } = await API.post('/dose/optimize', {
        genericName: genericName.trim(),
        requiredStrengthNum: Number(requiredStrengthNum),
        dailyFrequency: Number(dailyFrequency),
      });
      setResult(data);
      toast.success('Dose optimization calculated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to optimize this medication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">Dose Cost Optimization & Safety Engine</h1>
      <p className="text-sm text-slate-400 mb-6">Analyze potential cost savings with clinical safety guardrails for pill splitting.</p>

      <div className="bg-white rounded-xl p-6 mb-6">
        <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Generic Drug Name</label>
            <input
              type="text"
              required
              value={genericName}
              onChange={(e) => setGenericName(e.target.value)}
              placeholder="e.g. Metformin"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Required Dose (mg)</label>
            <input
              type="number"
              required
              min="1"
              value={requiredStrengthNum}
              onChange={(e) => setRequiredStrengthNum(e.target.value)}
              placeholder="e.g. 500"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Doses Per Day</label>
            <input
              type="number"
              required
              min="1"
              max="10"
              value={dailyFrequency}
              onChange={(e) => setDailyFrequency(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="md:col-span-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto py-2.5 px-6 bg-blue-600 text-white font-medium text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Analyzing Catalog...' : 'Calculate Cost Savings'}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="space-y-6">
          {/* Recommendation & Safety Header */}
          <div className="bg-white rounded-xl p-6 border-l-4 border-cyan-500">
            <h2 className="text-lg font-semibold text-white mb-2">Clinical Recommendation</h2>
            <p className="text-sm text-cyan-300 font-medium mb-4">
              {result.recommendation || 'Optimization analysis complete.'}
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4 mt-4">
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Pill Scoreability Check</h4>
                <p className="text-xs text-slate-400">
                  {result.isScoreable !== false 
                    ? '✓ Tablet features a scored line. Safe for precise pill splitting using a pill cutter.'
                    : '⚠ Warning: Unscored tablet. Splitting may result in uneven dosage distribution.'}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${result.isScoreable !== false ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                {result.isScoreable !== false ? 'Scoreable' : 'Unscored'}
              </div>
            </div>
          </div>

          {/* Cost Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Option */}
            <div className="bg-white rounded-xl p-6 border border-white/10">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Standard Prescription</span>
              <h3 className="text-xl font-bold text-white mt-1 mb-3">{result.standardOption?.brandName || 'Standard Dose'}</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p className="flex justify-between"><span>Strength:</span> <strong className="text-white">{result.standardOption?.strength}</strong></p>
                <p className="flex justify-between"><span>Pack Size:</span> <strong className="text-white">{result.standardOption?.packSize} pills</strong></p>
                <p className="flex justify-between"><span>Price per Pack:</span> <strong className="text-white">₹{result.standardOption?.pricePerPack}</strong></p>
                <p className="flex justify-between pt-2 border-t border-white/10 text-emerald-400 font-semibold">
                  <span>Cost per Unit:</span> <span>₹{result.standardOption?.costPerUnit}</span>
                </p>
              </div>
            </div>

            {/* Split Option */}
            <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 p-6 rounded-xl border border-emerald-500/30">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Optimized Split Option</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-bold">
                  Save ₹{result.estimatedMonthlySavings || '0.00'}/mo
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1 mb-3">{result.bestSplitOption?.brandName || 'Higher Strength Split'}</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p className="flex justify-between"><span>Strength:</span> <strong className="text-white">{result.bestSplitOption?.strength}</strong></p>
                <p className="flex justify-between"><span>Pack Size:</span> <strong className="text-white">{result.bestSplitOption?.packSize} pills</strong></p>
                <p className="flex justify-between"><span>Price per Pack:</span> <strong className="text-white">₹{result.bestSplitOption?.pricePerPack}</strong></p>
                <p className="flex justify-between pt-2 border-t border-white/10 text-emerald-400 font-semibold">
                  <span>Effective Cost per Unit:</span> <span>₹{result.bestSplitOption?.costPerUnit}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}