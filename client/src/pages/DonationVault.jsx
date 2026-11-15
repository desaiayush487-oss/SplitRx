import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function DonationVault() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [drugName, setDrugName] = useState('');
  const [quantityPills, setQuantityPills] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [image, setImage] = useState(null);

  const fetchVaultItems = async () => {
    try {
      const { data } = await API.get('/donations');
      setItems(Array.isArray(data) ? data : data.donations || []);
    } catch (err) {
      toast.error('Failed to fetch vault items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaultItems();
  }, []);

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!image) {
      toast.error('Please upload a photo of the medicine strip.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('drugName', drugName);
    formData.append('quantityPills', quantityPills);
    formData.append('expiryDate', expiryDate);
    formData.append('batchNumber', batchNumber);

    try {
      await API.post('/donations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Medicine successfully listed in the vault!');
      setDrugName('');
      setQuantityPills('');
      setExpiryDate('');
      setBatchNumber('');
      setImage(null);
      fetchVaultItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to list donation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaim = async (id) => {
    try {
      await API.patch(`/donations/${id}/claim`);
      toast.success('Medication claimed successfully!');
      fetchVaultItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not claim this item.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">P2P Medication Donation Vault</h1>
          <p className="text-sm text-gray-400">Share sealed, unexpired medicines safely with verified community members.</p>
        </div>
        {user?.role === 'ngo' && (
          <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            NGO Reviewer Mode Active
          </span>
        )}
      </div>

      {/* Donate Form */}
      <div className="bg-white rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Donate Unused Medicine</h2>
        <form onSubmit={handleDonate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Medicine Name & Strength</label>
            <input
              type="text"
              required
              value={drugName}
              onChange={(e) => setDrugName(e.target.value)}
              placeholder="e.g. Paracetamol 650mg"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Quantity (Pills)</label>
            <input
              type="number"
              required
              min="1"
              value={quantityPills}
              onChange={(e) => setQuantityPills(e.target.value)}
              placeholder="e.g. 10"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Expiry Date</label>
            <input
              type="date"
              required
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Batch Number</label>
            <input
              type="text"
              required
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="e.g. BATCH123"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Strip Photo</label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full text-sm text-slate-400"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-purple-600 text-white font-medium text-sm rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {submitting ? 'Listing...' : 'List in Vault'}
            </button>
          </div>
        </form>
      </div>

      {/* Available Vault Items */}
      <h2 className="text-lg font-semibold text-white mb-4">Available Medicines in Vault</h2>
      {loading ? (
        <p className="text-sm text-gray-400">Loading vault inventory...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400">No medications currently listed in the vault.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => {
            const isOwner = item.donor === user?._id || item.donor?._id === user?._id;
            const isAvailable = item.status === 'Available' || !item.status;

            return (
              <div key={item._id} className="bg-white rounded-xl overflow-hidden flex flex-col justify-between">
                <div>
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.drugName}
                      className="w-full h-44 object-cover border-b border-white/5"
                    />
                  )}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-white">{item.drugName}</h3>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {item.status || 'Verified'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">Quantity: <span className="font-semibold text-white">{item.quantityPills} pills</span></p>
                    <p className="text-sm text-slate-300">Expiry: <span className="font-semibold text-white">{new Date(item.expiryDate).toLocaleDateString()}</span></p>
                    <p className="text-xs text-slate-500 mt-1">Batch: {item.batchNumber}</p>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  {isOwner ? (
                    <button disabled className="w-full py-2 px-4 bg-slate-800 text-slate-400 text-sm font-medium rounded-md cursor-not-allowed">
                      Your Listing
                    </button>
                  ) : (
                    <button
                      onClick={() => handleClaim(item._id)}
                      disabled={!isAvailable}
                      className="w-full py-2 px-4 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 disabled:opacity-50"
                    >
                      {isAvailable ? 'Claim Medicine' : 'Reserved'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}