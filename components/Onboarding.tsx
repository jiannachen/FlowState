import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { Button } from './Button';
import { extractStrengthsFromMedia } from '../geminiService';
import { ArrowRight, Upload, FileText, Loader2, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [rawText, setRawText] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getParsedStrengths = () => {
    return rawText
      .split('\n')
      .map(line => line.replace(/^\d+[\.\)]\s*/, '').trim()) // Remove "1. " or "1)"
      .filter(line => line.length > 2); // Remove empty lines
  };

  const handleComplete = () => {
    const allStrengths = getParsedStrengths();

    if (name && allStrengths.length >= 5) {
      onComplete({ 
        name, 
        strengthsRawText: rawText, // Pass the full original text
        topStrengths: allStrengths.slice(0, 5) // Store top 5 separately for quick UI tags
      });
    } else {
      setErrorMsg("Please provide at least your Top 5 strengths.");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    setErrorMsg(null);

    let file: File | undefined;
    
    if ('files' in e.target && e.target.files) {
      file = e.target.files[0];
    } else if ('dataTransfer' in e) {
      file = e.dataTransfer.files[0];
    }

    if (!file) return;

    // Validate type
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      setErrorMsg("Please upload a JPG, PNG image or PDF file.");
      return;
    }

    setIsProcessingFile(true);
    
    try {
      // Read file as Base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g. "data:image/jpeg;base64,")
        const base64Data = base64String.split(',')[1];
        
        try {
          const extractedText = await extractStrengthsFromMedia(base64Data, file.type);
          setRawText(prev => {
             // If previous text exists, append. Otherwise set.
             // We try to keep the numbering logic if AI returns it.
             return prev ? prev + '\n' + extractedText : extractedText;
          });
          setIsProcessingFile(false);
        } catch (err) {
          setErrorMsg("Could not read the file. Please try a clearer image.");
          setIsProcessingFile(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setErrorMsg("Error processing file.");
      setIsProcessingFile(false);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const strengthCount = getParsedStrengths().length;

  return (
    <div className="max-w-2xl mx-auto pt-12 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-light text-morandi-text">Cognitive Blueprint</h1>
        <p className="text-morandi-accent max-w-lg mx-auto leading-relaxed">
          Upload your full <b>CliftonStrengths 34</b> report.<br/>
          We analyze your Top 10 to drive action, and your Bottom 5 to avoid burnout.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 space-y-8">
        <div className="space-y-4">
          <label className="block text-sm font-bold uppercase tracking-wider text-stone-400">Your Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 bg-stone-50 rounded-xl border border-transparent focus:bg-white focus:border-morandi-sage focus:outline-none focus:ring-2 focus:ring-morandi-sage/20 transition-all font-medium text-lg"
            placeholder="e.g. Alex"
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="block text-sm font-bold uppercase tracking-wider text-stone-400">Strengths Report</label>
            {strengthCount > 0 && (
               <span className="text-xs font-medium text-morandi-green flex items-center gap-1">
                 <CheckCircle2 className="w-3 h-3" /> {strengthCount} strengths detected
               </span>
            )}
          </div>

          {/* File Upload / Drag & Drop Area */}
          <div 
            className={`relative group border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
              ${dragActive ? 'border-morandi-primary bg-stone-50' : 'border-stone-200 hover:border-morandi-accent hover:bg-stone-50'}
              ${isProcessingFile ? 'opacity-50 pointer-events-none' : ''}
            `}
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={handleFileSelect}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileSelect}
            />
            
            {isProcessingFile ? (
              <div className="flex flex-col items-center gap-3 text-morandi-primary">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm font-medium">Scanning your full 34 profile...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-stone-400 group-hover:text-morandi-primary transition-colors">
                <Upload className="w-8 h-8" />
                <span className="text-sm font-medium">Click to upload or drag & drop PDF/Image</span>
                <span className="text-xs text-stone-300">Supported: .pdf, .png, .jpg</span>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" /> {errorMsg}
            </div>
          )}

          <div className="relative">
             <div className="absolute inset-0 flex items-center" aria-hidden="true">
               <div className="w-full border-t border-stone-100"></div>
             </div>
             <div className="relative flex justify-center">
               <span className="bg-white px-2 text-xs text-stone-400 uppercase">Or paste manually (1-34)</span>
             </div>
           </div>

          <textarea 
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="w-full h-64 p-4 bg-stone-50 rounded-xl border border-transparent focus:bg-white focus:border-morandi-sage focus:outline-none focus:ring-2 focus:ring-morandi-sage/20 transition-all resize-none text-sm leading-relaxed font-mono text-stone-600"
            placeholder={`1. Strategic\n2. Learner\n3. Achiever\n...\n33. Consistency\n34. Discipline`}
          />
          <p className="text-xs text-stone-400 text-right">Paste the full ordered list for best results.</p>
        </div>

        <Button 
          onClick={handleComplete} 
          className="w-full py-4 text-lg" 
          disabled={!name || strengthCount < 5 || isProcessingFile}
        >
          {isProcessingFile ? 'Analyzing Report...' : 'Generate My Blueprint'} <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};