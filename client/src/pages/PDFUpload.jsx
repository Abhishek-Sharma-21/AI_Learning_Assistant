import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  FileText,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDocuments } from '../store/slices/documentSlice';
import { selectIsFree, FREE_UPLOAD_LIMIT } from '../store/slices/planSlice';
import UpgradeModal from '../components/UpgradeModal';
import toast from 'react-hot-toast';

const PDFUpload = () => {
  const [file, setFile]           = useState(null);
  const navigate                  = useNavigate();
  const dispatch                  = useDispatch();
  const isFree                    = useSelector(selectIsFree);
  const { items: docs }           = useSelector((s) => s.documents);
  const { token }                 = useSelector((s) => s.auth);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isDragging, setIsDragging]   = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [progress, setProgress]       = useState(0);
  const [status, setStatus]           = useState('idle');
  const fileInputRef = useRef(null);

  const atLimit = isFree && docs.length >= FREE_UPLOAD_LIMIT;

  useEffect(() => { dispatch(fetchDocuments()); }, [dispatch]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (atLimit) { setShowUpgrade(true); return; }
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setStatus('idle');
    } else {
      toast.error('Invalid document format. PDF required.');
    }
  };

  const handleFileSelect = (e) => {
    if (atLimit) { setShowUpgrade(true); return; }
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setStatus('idle');
    }
  };

  const [documentId, setDocumentId] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    if (atLimit) { setShowUpgrade(true); return; }
    
    setUploading(true);
    setStatus('uploading');
    setProgress(10); // Start progress

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        toast.error('Upload failed');
        setStatus('error'); // Set status to error to reflect failure
        return; // Stop further execution
      }

      const data = await response.json();
      toast.success('Document uploaded and analyzed.');
      setProgress(100);
      setDocumentId(data.documentId);
      setStatus('success');
    } catch (error) {
      toast.error(error.message || 'Transmission failure');
      setStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
  };

  return (
    <>
      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          reason={`Free plan is limited to ${FREE_UPLOAD_LIMIT} documents`}
        />
      )}
      <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Upload Documents
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload your PDFs to start analyzing them with AI.
        </p>
      </div>

      {/* Upload Section */}
      <div className="p-10 bg-slate-900/40 border border-slate-800/50 rounded-4xl space-y-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
        {/* Free plan limit banner */}
        {atLimit && (
          <div className="flex items-center gap-3 px-5 py-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-4">
            <Lock size={16} className="text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300 flex-1">
              You've reached the <strong>{FREE_UPLOAD_LIMIT}-document limit</strong> on the Free plan.
            </p>
            <button onClick={() => setShowUpgrade(true)} className="text-xs font-bold text-emerald-400 hover:text-emerald-300 whitespace-nowrap transition-colors">
              Upgrade →
            </button>
          </div>
        )}

        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            className={`
              border-2 border-dashed rounded-4xl p-16 flex flex-col items-center justify-center gap-6 transition-all duration-300 cursor-pointer
              ${isDragging 
                ? 'border-emerald-500 bg-emerald-500/5 scale-[0.98] shadow-[0_0_30px_rgba(16,185,129,0.1)]' 
                : 'border-slate-800/80 hover:border-emerald-500/50 hover:bg-emerald-500/5'}
            `}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="application/pdf"
              className="hidden"
            />
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-2 transition-all duration-500 ${isDragging ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30' : 'bg-slate-800/50 text-slate-400'}`}>
              <Upload size={36} className={isDragging ? 'animate-bounce' : ''} />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-slate-200">Click or drag PDF here</p>
              <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest font-bold">Maximum file size: 10MB</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            {/* Selected File Card */}
            <div className="p-5 bg-slate-950/40 border border-slate-800/50 rounded-3xl flex items-center justify-between group shadow-inner">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText size={28} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200 truncate max-w-[200px] md:max-w-md uppercase tracking-tight">{file.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              {status !== 'uploading' && (
                <button 
                  onClick={removeFile}
                  className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all active:scale-90"
                >
                  <X size={22} />
                </button>
              )}
            </div>

            {/* Upload Progress/Status */}
            {status === 'uploading' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-400 flex items-center gap-3">
                    <Loader2 size={16} className="animate-spin text-emerald-500" />
                    Analyzing Content...
                  </span>
                  <span className="text-emerald-500 font-mono">{progress}%</span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner p-0.5 border border-slate-700/30">
                  <div 
                    className="h-full bg-linear-to-r from-emerald-500 to-teal-400 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(16,185,129,0.5)] rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl flex items-center gap-6 text-emerald-400 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                   <CheckCircle2 size={28} />
                </div>
                <div className="grow">
                  <p className="font-bold text-lg text-white">Analysis Complete</p>
                  <p className="text-xs text-emerald-500/70 font-medium uppercase tracking-wider">Your document is ready for exploration.</p>
                </div>
                <button 
                  onClick={() => navigate(`/dashboard/documents/${documentId}`)}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold text-sm hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                >
                  Go to Dashboard <ArrowRight size={18} />
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl flex items-center gap-6 text-red-500 animate-in shake duration-500">
                <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
                   <AlertCircle size={28} />
                </div>
                <div className="grow">
                  <p className="font-bold text-lg text-white">Upload Failed</p>
                  <p className="text-xs text-red-500/70 font-medium uppercase tracking-wider">There was an error processing your PDF.</p>
                </div>
                <button 
                  onClick={() => setStatus('idle')}
                  className="px-6 py-3 bg-red-500 text-white rounded-2xl font-bold text-sm hover:bg-red-400 transition-all active:scale-95"
                >
                  Try Again
                </button>
              </div>
            )}

            {status === 'idle' && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-5 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-3xl font-bold text-sm transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                <span>Process Document</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Guidelines/Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-slate-900/30 border border-slate-800/40 rounded-4xl shadow-xl">
          <h4 className="font-bold text-slate-200 mb-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
            Optimization Tips
          </h4>
          <ul className="text-sm text-slate-500 space-y-3 font-medium">
            <li className="flex items-center gap-2">• Clean, high-contrast text works best</li>
            <li className="flex items-center gap-2">• PDF format only (v1.4+)</li>
            <li className="flex items-center gap-2">• Up to 10MB per document</li>
          </ul>
        </div>
        <div className="p-8 bg-slate-900/30 border border-slate-800/40 rounded-4xl shadow-xl relative overflow-hidden group">
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/5 blur-3xl group-hover:bg-emerald-500/10 transition-all"></div>
          <h4 className="font-bold text-slate-200 mb-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-500/10 text-teal-500 rounded-lg flex items-center justify-center">
              <AlertCircle size={18} />
            </div>
            Privacy Guard
          </h4>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            Your intellectual property is protected. We use enterprise-grade encryption for all document analysis and storage.
          </p>
        </div>
      </div>
      </div>
    </>
  );
};

export default PDFUpload;
