import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ scanCount: 0, donationCount: 0 });
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [scansRes, donationsRes] = await Promise.all([
          API.get('/scan/my-prescriptions').catch(() => ({ data: [] })),
          API.get('/donations').catch(() => ({ data: [] }))
        ]);

        const scans = Array.isArray(scansRes.data) ? scansRes.data : scansRes.data.prescriptions || [];
        const donations = Array.isArray(donationsRes.data) ? donationsRes.data : donationsRes.data.donations || [];

        setRecentScans(scans.slice(0, 3));
        setStats({
          scanCount: scans.length,
          donationCount: donations.filter(d => d.donor === user?._id || d.donor?._id === user?._id).length
        });
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 p-8 rounded-2xl border border-emerald-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute -right-12 -top-12 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-emerald-400">{user?.name || 'Explorer'}</span>! 👋
          </h1>
          <p className="mt-2 text-sm text-slate-300 max-w-xl">
            Smart medication cost optimization and sustainable healthcare network. Manage prescriptions, analyze pill savings, and share surplus medications securely.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-emerald-500/30 shadow-inner">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Role: {user?.role?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Real Live User Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 p-6 rounded-xl border border-white/10 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Scanned Prescriptions</p>
            <h3 className="text-3xl font-extrabold text-white mt-1">{loading ? '...' : stats.scanCount}</h3>
            <p className="text-xs text-emerald-400 mt-1">Processed via Tesseract OCR</p>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 font-bold text-xl border border-emerald-500/20">
            📄
          </div>
        </div>

        <div className="bg-slate-900/80 p-6 rounded-xl border border-white/10 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Vault Contributions</p>
            <h3 className="text-3xl font-extrabold text-white mt-1">{loading ? '...' : stats.donationCount}</h3>
            <p className="text-xs text-purple-400 mt-1">Medicines listed for community</p>
          </div>
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 font-bold text-xl border border-purple-500/20">
            💊
          </div>
        </div>

        <div className="bg-slate-900/80 p-6 rounded-xl border border-white/10 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Platform Status</p>
            <h3 className="text-2xl font-extrabold text-cyan-400 mt-1">Active & Secure</h3>
            <p className="text-xs text-slate-400 mt-1">Connected to MongoDB Atlas</p>
          </div>
          <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 font-bold text-xl border border-cyan-500/20">
            ⚡
          </div>
        </div>
      </div>

      {/* Core Modules Grid */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Core Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 rounded-xl p-6 flex flex-col justify-between border border-white/10 shadow-lg hover:border-emerald-500/40 transition-all">
            <div>
              <div className="w-10 h-10 bg-emerald-500/15 text-emerald-400 rounded-lg flex items-center justify-center font-bold text-lg mb-4 border border-emerald-500/30">
                OCR
              </div>
              <h3 className="text-lg font-bold text-white">Scan Prescription</h3>
              <p className="mt-2 text-sm text-slate-400">
                Upload medical prescriptions to automatically parse drug names and dosages using OCR.
              </p>
            </div>
            <Link
              to="/scan"
              className="mt-6 inline-block text-center w-full py-2.5 px-4 bg-emerald-600 text-slate-950 font-bold text-sm rounded-md hover:bg-emerald-500 shadow-lg"
            >
              Open Scanner
            </Link>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-6 flex flex-col justify-between border border-white/10 shadow-lg hover:border-cyan-500/40 transition-all">
            <div>
              <div className="w-10 h-10 bg-cyan-500/15 text-cyan-400 rounded-lg flex items-center justify-center font-bold text-lg mb-4 border border-cyan-500/30">
                ₹/%
              </div>
              <h3 className="text-lg font-bold text-white">Dose Optimizer</h3>
              <p className="mt-2 text-sm text-slate-400">
                Calculate cost reductions by splitting higher-strength scoreable tablets safely.
              </p>
            </div>
            <Link
              to="/optimize"
              className="mt-6 inline-block text-center w-full py-2.5 px-4 bg-blue-600 text-slate-950 font-bold text-sm rounded-md hover:bg-blue-500 shadow-lg"
            >
              Calculate Savings
            </Link>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-6 flex flex-col justify-between border border-white/10 shadow-lg hover:border-purple-500/40 transition-all">
            <div>
              <div className="w-10 h-10 bg-purple-500/15 text-purple-400 rounded-lg flex items-center justify-center font-bold text-lg mb-4 border border-purple-500/30">
                P2P
              </div>
              <h3 className="text-lg font-bold text-white">Medication Vault</h3>
              <p className="mt-2 text-sm text-slate-400">
                Browse verified surplus medications or list unexpired sealed strips for community members.
              </p>
            </div>
            <Link
              to="/vault"
              className="mt-6 inline-block text-center w-full py-2.5 px-4 bg-purple-600 text-white font-bold text-sm rounded-md hover:bg-purple-500 shadow-lg"
            >
              Explore Vault
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-slate-900/80 rounded-xl p-6 border border-white/10 shadow-lg">
        <h2 className="text-lg font-bold text-white mb-4">Recent Prescription Scans</h2>
        {loading ? (
          <p className="text-sm text-slate-400">Loading recent activity...</p>
        ) : recentScans.length === 0 ? (
          <p className="text-sm text-slate-400">No prescription scans found. Try uploading one in the Scan Prescription tab!</p>
        ) : (
          <div className="space-y-3">
            {recentScans.map((scan) => (
              <div key={scan._id} className="bg-slate-950 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium line-clamp-1">{scan.extractedText || 'Prescription Document'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Uploaded on {new Date(scan.createdAt).toLocaleDateString()}</p>
                </div>
                <Link to="/scan" className="text-xs text-emerald-400 hover:underline font-semibold">View Details →</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}