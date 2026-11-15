import React, { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function ScanPrescription() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const { data } = await API.get('/scan/my-prescriptions');
      setHistory(Array.isArray(data) ? data : data.prescriptions || []);
    } catch (err) {
      console.error('Failed to load prescription history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a prescription image first.');
      return;
    }

    setLoading(true);
    setScanResult(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await API.post('/scan/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setScanResult(data);
      setFile(null);
      toast.success('Prescription scanned successfully!');
      fetchHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error scanning prescription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">Prescription OCR Scanner</h1>
      <p className="text-sm text-slate-400 mb-6">Upload a photo of your doctor's prescription to automatically extract medications.</p>

      <div className="bg-white rounded-xl p-6 mb-8">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Prescription Image (JPEG, PNG)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="py-2.5 px-6 bg-emerald-600 text-white font-medium text-sm rounded-md hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Scanning with Tesseract OCR...' : 'Upload & Extract Text'}
          </button>
        </form>

        {scanResult && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">Scan Analysis Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scanResult.imageUrl && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Uploaded Image</p>
                  <img
                    src={scanResult.imageUrl}
                    alt="Prescription"
                    className="rounded-xl border border-white/10 max-h-72 object-contain w-full bg-slate-950"
                  />
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Parsed Medications</p>
                  {scanResult.prescription?.parsedMedicines?.length > 0 ? (
                    <div className="space-y-2">
                      {scanResult.prescription.parsedMedicines.map((med, idx) => (
                        <div key={idx} className="bg-slate-900 p-3 rounded-lg border border-emerald-500/20">
                          <p className="text-sm font-bold text-white">{med.drugName || 'Medication'}</p>
                          <div className="flex gap-4 mt-1 text-xs text-slate-400">
                            <span>Dosage: <strong className="text-emerald-400">{med.dosage || 'N/A'}</strong></span>
                            <span>Frequency: <strong className="text-cyan-400">{med.frequency || 'N/A'}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 bg-slate-900 p-3 rounded-lg">No structured medications parsed. See raw text below.</p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Full Extracted Text</p>
                  <div className="bg-slate-900 p-3 rounded-lg border border-white/10 text-xs text-slate-300 max-h-36 overflow-auto">
                    {scanResult.prescription?.extractedText || scanResult.extractedText || 'No text extracted'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Previous Scans */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Your Scan History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-slate-400">No prescriptions uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((item) => (
              <div key={item._id} className="bg-white p-4 rounded-xl border border-white/10">
                <p className="text-xs text-slate-500 mb-1">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-slate-300 line-clamp-2">
                  {item.extractedText || 'Processed prescription record'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}