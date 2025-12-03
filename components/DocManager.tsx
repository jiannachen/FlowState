import React, { useState, useEffect } from 'react';
import { DocumentAsset, DocBlock } from '../types';
import { 
  Copy, 
  Plus, 
  FileText, 
  Link as LinkIcon, 
  Trash2,
  Check,
  Edit3
} from 'lucide-react';

interface Props {
  docs: DocumentAsset[];
  onUpdateDocs: (docs: DocumentAsset[]) => void;
}

export const DocManager: React.FC<Props> = ({ docs, onUpdateDocs }) => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  // Select first doc on load if none selected
  useEffect(() => {
    if (!selectedDocId && docs.length > 0) {
      setSelectedDocId(docs[0].id);
    }
  }, [docs, selectedDocId]);

  const activeDoc = docs.find(d => d.id === selectedDocId);

  const copyToClipboard = (text: string, blockId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBlockId(blockId);
    setTimeout(() => setCopiedBlockId(null), 2000);
  };

  const createNewDoc = () => {
    const newDoc: DocumentAsset = {
      id: Date.now().toString(),
      title: 'Untitled Document',
      category: 'General',
      lastModified: Date.now(),
      blocks: []
    };
    const newDocs = [...docs, newDoc];
    onUpdateDocs(newDocs);
    setSelectedDocId(newDoc.id);
  };

  const addBlock = (type: 'text' | 'link') => {
    if (!activeDoc) return;
    const newBlock: DocBlock = {
      id: Date.now().toString(),
      type,
      content: '',
      label: type === 'text' ? 'New Text' : 'New Link'
    };
    const updatedDocs = docs.map(d => 
      d.id === activeDoc.id ? { ...d, blocks: [...d.blocks, newBlock] } : d
    );
    onUpdateDocs(updatedDocs);
    setEditingBlockId(newBlock.id);
  };

  const updateBlock = (blockId: string, content: string) => {
    if (!activeDoc) return;
    const updatedDocs = docs.map(d => 
      d.id === activeDoc.id ? {
        ...d,
        blocks: d.blocks.map(b => b.id === blockId ? { ...b, content } : b)
      } : d
    );
    onUpdateDocs(updatedDocs);
  };

  const updateDocTitle = (title: string) => {
    if (!activeDoc) return;
    const updatedDocs = docs.map(d => d.id === activeDoc.id ? { ...d, title } : d);
    onUpdateDocs(updatedDocs);
  }

  const deleteBlock = (blockId: string) => {
    if (!activeDoc) return;
     const updated = docs.map(d => d.id === activeDoc.id ? { ...d, blocks: d.blocks.filter(b => b.id !== blockId) } : d);
     onUpdateDocs(updated);
  };

  return (
    <div className="flex h-[80vh] bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm animate-in fade-in">
      
      {/* Doc List Sidebar */}
      <div className="w-64 bg-stone-50 border-r border-stone-200 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-stone-600">My Assets</h2>
          <button onClick={createNewDoc} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
            <Plus className="w-4 h-4 text-stone-600" />
          </button>
        </div>
        <div className="space-y-2 overflow-y-auto flex-1">
          {docs.map(doc => (
            <button
              key={doc.id}
              onClick={() => setSelectedDocId(doc.id)}
              className={`w-full text-left p-3 rounded-xl text-sm transition-all ${
                selectedDocId === doc.id 
                ? 'bg-white shadow-sm text-morandi-text font-medium border border-stone-100' 
                : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              {doc.title}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activeDoc ? (
          <>
            <div className="p-6 border-b border-stone-100 bg-white z-10">
              <input 
                value={activeDoc.title}
                onChange={(e) => updateDocTitle(e.target.value)}
                className="text-2xl font-medium text-stone-800 bg-transparent outline-none w-full placeholder:text-stone-300"
                placeholder="Document Title"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50/30">
              {activeDoc.blocks.map(block => {
                const isEditing = editingBlockId === block.id;

                return (
                  <div key={block.id} className="group bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                    
                    {/* Header: Label and Actions */}
                    <div className="flex justify-between items-center p-3 border-b border-stone-50 bg-stone-50/50">
                      <input 
                        className="text-xs font-bold uppercase tracking-wider text-stone-400 bg-transparent outline-none"
                        value={block.label}
                        onChange={(e) => {
                           const updatedDocs = docs.map(d => 
                             d.id === activeDoc.id ? { ...d, blocks: d.blocks.map(b => b.id === block.id ? { ...b, label: e.target.value } : b) } : d
                           );
                           onUpdateDocs(updatedDocs);
                        }}
                      />
                      <div className="flex gap-2">
                         {isEditing ? (
                           <button onClick={() => setEditingBlockId(null)} className="flex items-center gap-1 text-xs px-2 py-1 bg-stone-200 rounded text-stone-600 hover:bg-stone-300">
                             <Check className="w-3 h-3" /> Done
                           </button>
                         ) : (
                           <>
                             <button onClick={() => setEditingBlockId(block.id)} className="flex items-center gap-1 text-xs px-2 py-1 bg-stone-100 rounded text-stone-500 hover:bg-stone-200">
                               <Edit3 className="w-3 h-3" /> Edit
                             </button>
                             <button onClick={() => deleteBlock(block.id)} className="flex items-center gap-1 text-xs px-2 py-1 bg-red-50 text-red-400 rounded hover:bg-red-100">
                               <Trash2 className="w-3 h-3" />
                             </button>
                           </>
                         )}
                      </div>
                    </div>

                    {/* Body: Click to copy or Edit mode */}
                    <div 
                      className={`p-4 ${!isEditing && 'cursor-pointer hover:bg-stone-50 transition-colors active:bg-stone-100'}`}
                      onClick={() => !isEditing && copyToClipboard(block.content, block.id)}
                    >
                      {isEditing ? (
                        <textarea 
                          autoFocus
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, e.target.value)}
                          className="w-full bg-transparent outline-none text-stone-700 resize-none min-h-[80px] font-mono text-sm"
                          placeholder="Type content here..."
                        />
                      ) : (
                        <div className="relative">
                           <p className="text-stone-700 text-sm whitespace-pre-wrap font-mono">{block.content || <span className="text-stone-300 italic">Empty block...</span>}</p>
                           {copiedBlockId === block.id && (
                             <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded">
                               <span className="flex items-center gap-2 text-morandi-green font-bold text-sm animate-in zoom-in">
                                 <Check className="w-4 h-4" /> Copied!
                               </span>
                             </div>
                           )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="flex gap-4 justify-center mt-8 pb-12 opacity-50 hover:opacity-100 transition-opacity">
                 <button onClick={() => addBlock('text')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-200 text-stone-600 hover:bg-stone-300 text-sm font-medium">
                   <FileText className="w-4 h-4" /> Add Text Block
                 </button>
                 <button onClick={() => addBlock('link')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-200 text-stone-600 hover:bg-stone-300 text-sm font-medium">
                   <LinkIcon className="w-4 h-4" /> Add Link
                 </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-stone-400">
            Select or create a document to manage your assets.
          </div>
        )}
      </div>
    </div>
  );
};
