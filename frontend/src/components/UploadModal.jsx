import { useState, useCallback } from 'react';
import { UploadCloud, X, File, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatBytes } from '../utils/helpers';
import { useDocuments } from '../hooks/useDocuments';

export default function UploadModal({ isOpen, onClose }) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, processing, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const [progress, setProgress] = useState(0);

  const { documents, upload, process } = useDocuments();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles) => {
    // Filter out non-PDFs and check size
    const validFiles = newFiles.filter(file => {
      if (file.type !== 'application/pdf') {
        setErrorMsg('Only PDF files are allowed.');
        return false;
      }
      if (file.size > 20 * 1024 * 1024) { // 20MB
        setErrorMsg('File size must be less than 20MB.');
        return false;
      }
      return true;
    });

    if (validFiles.length > 1 || files.length + validFiles.length > 1) {
      setErrorMsg('Only one PDF can be active at a time.');
      return;
    }

    if (validFiles.length > 0) {
      setFiles(validFiles.slice(0, 1));
      setErrorMsg('');
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploadStatus('uploading');
    setErrorMsg('');
    setProgress(0);

    try {
      // 1. Upload file. The backend replaces this browser's previous PDF.
      const uploadRes = await upload({
        files,
        onProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      // 2. Process documents
      setUploadStatus('processing');
      const documentIds = uploadRes.documents.map(doc => doc.id);
      await process(documentIds);

      setUploadStatus('success');
      setTimeout(() => {
        onClose();
        setFiles([]);
        setUploadStatus('idle');
      }, 2000);

    } catch (err) {
      console.error(err);
      setUploadStatus('error');
      setErrorMsg(err.response?.data?.detail || err.message || 'An error occurred during upload/processing.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card w-full max-w-lg rounded-xl shadow-2xl border border-border overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-lg text-foreground">Upload Documents</h3>
            <button 
              onClick={onClose}
              disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
              className="p-1 rounded-md text-muted-foreground hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Dropzone */}
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors
                ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-zinc-500 hover:bg-zinc-900/50'}
                ${(uploadStatus === 'uploading' || uploadStatus === 'processing') ? 'opacity-50 pointer-events-none' : ''}
              `}
            >
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
              />
              <UploadCloud className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm font-medium text-zinc-300 mb-1">
                Click or drag one PDF file to upload
              </p>
              <p className="text-xs text-muted-foreground">
                Maximum file size: 20MB. New uploads replace your current PDF.
              </p>
            </div>

            {documents.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                Current PDF will be replaced after upload.
              </p>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive-foreground rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 text-destructive" />
                {errorMsg}
              </div>
            )}

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-border text-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <File className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate text-zinc-300">{file.name}</span>
                      <span className="text-muted-foreground text-xs shrink-0">{formatBytes(file.size)}</span>
                    </div>
                    <button 
                      onClick={() => removeFile(idx)}
                      disabled={uploadStatus !== 'idle' && uploadStatus !== 'error'}
                      className="text-muted-foreground hover:text-destructive shrink-0 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Progress Bar */}
            {uploadStatus === 'uploading' && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Uploading files...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            
            {uploadStatus === 'processing' && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing chunks and generating embeddings...
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-500">
                <CheckCircle2 className="w-4 h-4" />
                Successfully uploaded and processed!
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border flex justify-end gap-3 bg-zinc-950/50">
            <button
              onClick={onClose}
              disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploadStatus !== 'idle'}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {(uploadStatus === 'uploading' || uploadStatus === 'processing') && <Loader2 className="w-4 h-4 animate-spin" />}
              {uploadStatus === 'idle' || uploadStatus === 'error' ? 'Upload & Process' : 'Please wait...'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
