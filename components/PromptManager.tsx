import React, { useState } from 'react';
import { PromptItem } from '../types';
import { Button } from './Button';
import {
  Plus,
  Search,
  Copy,
  Check,
  Trash2,
  GripVertical,
  Tag,
  BarChart2,
  Folder,
  FolderOpen,
  Layers,
  Edit2,
  X,
  FolderPlus
} from 'lucide-react';

interface Props {
  prompts: PromptItem[];
  onUpdatePrompts: (prompts: PromptItem[]) => void;
}

export const PromptManager: React.FC<Props> = ({ prompts, onUpdatePrompts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'manual' | 'usage'>('manual');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Extract Unique Categories
  const categories = Array.from(new Set(prompts.map(p => p.category || 'Uncategorized'))).sort();

  // Extract All Tags
  const allTags = Array.from(new Set(prompts.flatMap(p => p.tags))).sort();

  // Filter Prompts
  const displayPrompts = [...prompts]
    .filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            p.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => p.tags.includes(tag));
      return matchesSearch && matchesCategory && matchesTags;
    })
    .sort((a, b) => {
      if (sortBy === 'usage') return b.usageCount - a.usageCount;
      return 0; // Manual order relies on original array index if strictly implemented, but filtering breaks index-based sort.
      // ideally manual sort is global, but here we simplify.
    });

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    
    // Increment usage
    const updated = prompts.map(p => p.id === id ? { ...p, usageCount: p.usageCount + 1 } : p);
    onUpdatePrompts(updated);
    
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (sortBy === 'usage' || selectedCategory !== 'All') return; // Only allow sort in "All" view + Manual mode to avoid index confusion
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const sourceIndex = prompts.findIndex(p => p.id === draggedId);
    const targetIndex = prompts.findIndex(p => p.id === targetId);

    const newPrompts = [...prompts];
    const [movedItem] = newPrompts.splice(sourceIndex, 1);
    newPrompts.splice(targetIndex, 0, movedItem);

    onUpdatePrompts(newPrompts);
    setDraggedId(null);
  };

  const addNewPrompt = () => {
    const newPrompt: PromptItem = {
      id: Date.now().toString(),
      title: 'New Prompt',
      content: '',
      category: selectedCategory === 'All' ? 'Uncategorized' : selectedCategory,
      usageCount: 0,
      tags: []
    };
    onUpdatePrompts([newPrompt, ...prompts]);
  };

  const addCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      // Create a new prompt in the new category to establish it
      const newPrompt: PromptItem = {
        id: Date.now().toString(),
        title: 'New Prompt',
        content: '',
        category: newCategoryName.trim(),
        usageCount: 0,
        tags: []
      };
      onUpdatePrompts([newPrompt, ...prompts]);
      setSelectedCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const renameCategory = (oldName: string, newName: string) => {
    if (newName.trim() && newName !== oldName) {
      const updated = prompts.map(p =>
        p.category === oldName ? { ...p, category: newName.trim() } : p
      );
      onUpdatePrompts(updated);
      if (selectedCategory === oldName) {
        setSelectedCategory(newName.trim());
      }
    }
    setEditingCategory(null);
    setNewCategoryName('');
  };

  const deleteCategory = (categoryName: string) => {
    if (confirm(`Delete category "${categoryName}" and all its prompts?`)) {
      const updated = prompts.filter(p => p.category !== categoryName);
      onUpdatePrompts(updated);
      if (selectedCategory === categoryName) {
        setSelectedCategory('All');
      }
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const updatePrompt = (id: string, field: keyof PromptItem, value: any) => {
    const updated = prompts.map(p => p.id === id ? { ...p, [field]: value } : p);
    onUpdatePrompts(updated);
  };

  const deletePrompt = (id: string) => {
    if (confirm('Delete this prompt?')) {
      const updated = prompts.filter(p => p.id !== id);
      onUpdatePrompts(updated);
    }
  };

  return (
    <div className="h-[85vh] flex bg-white rounded-3xl border border-stone-200 shadow-sm animate-in fade-in overflow-hidden">
      
      {/* LEFT SIDEBAR: Categories */}
      <div className="w-64 bg-stone-50 border-r border-stone-200 flex flex-col p-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-2 mb-6 px-2">
          <div className="flex items-center gap-2 text-stone-500 font-semibold">
            <Layers className="w-4 h-4" /> Prompt Libraries
          </div>
          <button
            onClick={() => setIsAddingCategory(true)}
            className="p-1.5 hover:bg-stone-200 rounded-lg transition-colors text-stone-500 hover:text-stone-700"
            title="Add Category"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Add Category Input */}
        {isAddingCategory && (
          <div className="mb-4 p-3 bg-white rounded-lg border border-morandi-sage shadow-sm">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addCategory();
                if (e.key === 'Escape') {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
                }
              }}
              placeholder="New category name..."
              className="w-full px-2 py-1.5 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-morandi-sage mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={addCategory}
                className="flex-1 px-2 py-1 bg-morandi-sage text-white text-xs rounded-md hover:bg-morandi-primary transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
                }}
                className="flex-1 px-2 py-1 bg-stone-200 text-stone-600 text-xs rounded-md hover:bg-stone-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1 overflow-y-auto flex-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex justify-between items-center transition-all ${
              selectedCategory === 'All'
                ? 'bg-white shadow-sm text-morandi-text'
                : 'text-stone-500 hover:bg-stone-100'
            }`}
          >
            <span className="flex items-center gap-2"><FolderOpen className="w-4 h-4" /> All Prompts</span>
            <span className="bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded-full text-xs">{prompts.length}</span>
          </button>

          <div className="my-2 border-t border-stone-200/50"></div>

          {categories.map(cat => (
            <div key={cat} className="group relative">
              {editingCategory === cat ? (
                <div className="p-2 bg-white rounded-lg border border-morandi-sage shadow-sm">
                  <input
                    type="text"
                    defaultValue={cat}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        renameCategory(cat, e.currentTarget.value);
                      }
                      if (e.key === 'Escape') {
                        setEditingCategory(null);
                        setNewCategoryName('');
                      }
                    }}
                    onBlur={(e) => renameCategory(cat, e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-morandi-sage"
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between items-center transition-all ${
                    selectedCategory === cat
                      ? 'bg-white shadow-sm text-stone-800'
                      : 'text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate flex-1 min-w-0">
                    <Folder className={`w-3 h-3 flex-shrink-0 ${selectedCategory === cat ? 'fill-morandi-sage stroke-morandi-sage' : ''}`} />
                    <span className="truncate">{cat}</span>
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs text-stone-300">{prompts.filter(p => p.category === cat).length}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 ml-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCategory(cat);
                          setNewCategoryName(cat);
                        }}
                        className="p-1 hover:bg-stone-200 rounded text-stone-400 hover:text-stone-600"
                        title="Rename category"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCategory(cat);
                        }}
                        className="p-1 hover:bg-red-100 rounded text-stone-400 hover:text-red-600"
                        title="Delete category"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-stone-200">
           <p className="text-xs text-stone-400 text-center px-2">
             Tip: Edit a prompt's category on the card to create new folders.
           </p>
        </div>
      </div>

      {/* RIGHT CONTENT: Grid */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-stone-100 flex flex-col gap-4 bg-white z-10">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search prompts..."
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-transparent rounded-xl focus:bg-white focus:border-morandi-sage focus:outline-none transition-all"
                />
              </div>
              {selectedCategory === 'All' && (
                <div className="flex bg-stone-100 p-1 rounded-lg flex-shrink-0">
                  <button
                    onClick={() => setSortBy('manual')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${sortBy === 'manual' ? 'bg-white shadow text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}
                  >
                    Manual
                  </button>
                  <button
                    onClick={() => setSortBy('usage')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${sortBy === 'usage' ? 'bg-white shadow text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}
                  >
                    Most Used
                  </button>
                </div>
              )}
            </div>
            <Button onClick={addNewPrompt} size="sm">
              <Plus className="w-4 h-4" />
              {selectedCategory !== 'All' ? `New in ${selectedCategory}` : 'New Prompt'}
            </Button>
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-stone-400 flex-shrink-0" />
              <div className="flex gap-2 flex-wrap">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-morandi-sage text-white shadow-sm'
                        : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/30">
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
            {displayPrompts.map((prompt) => (
              <div 
                key={prompt.id}
                draggable={sortBy === 'manual' && selectedCategory === 'All'}
                onDragStart={(e) => handleDragStart(e, prompt.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, prompt.id)}
                className={`bg-white p-5 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-[320px]
                  ${draggedId === prompt.id ? 'opacity-40 border-dashed border-stone-400' : ''}
                `}
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {sortBy === 'manual' && selectedCategory === 'All' && <GripVertical className="w-4 h-4 text-stone-300 cursor-grab active:cursor-grabbing flex-shrink-0" />}
                    <input 
                      value={prompt.title}
                      onChange={(e) => updatePrompt(prompt.id, 'title', e.target.value)}
                      className="font-medium text-stone-800 bg-transparent outline-none w-full truncate focus:bg-stone-50 rounded px-1 transition-all"
                      placeholder="Prompt Title"
                    />
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs text-stone-400 flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-full" title="Usage Count">
                      <BarChart2 className="w-3 h-3" /> {prompt.usageCount}
                    </span>
                    <button onClick={() => deletePrompt(prompt.id)} className="p-1.5 text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Category Input (Editable) */}
                <div className="mb-3">
                  <div className="relative inline-block max-w-full">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
                      <Folder size={12} />
                    </div>
                    <input 
                      list="category-options"
                      value={prompt.category}
                      onChange={(e) => updatePrompt(prompt.id, 'category', e.target.value)}
                      className="pl-6 pr-2 py-1 text-xs font-medium text-stone-500 bg-stone-50 rounded-md border border-transparent focus:bg-white focus:border-morandi-sage focus:outline-none transition-all w-auto min-w-[120px] hover:bg-stone-100"
                      placeholder="Category..."
                    />
                  </div>
                </div>

                {/* Content Area */}
                <textarea 
                  value={prompt.content}
                  onChange={(e) => updatePrompt(prompt.id, 'content', e.target.value)}
                  className="flex-1 w-full bg-stone-50/30 rounded-lg p-3 text-sm text-stone-600 font-mono resize-none focus:bg-white focus:ring-1 focus:ring-stone-200 outline-none mb-3"
                  placeholder="Enter your prompt text here..."
                />

                {/* Footer Actions */}
                <div className="mt-auto flex justify-between items-center pt-3 border-t border-stone-50">
                  <div className="flex gap-1 overflow-hidden flex-1 min-w-0 mask-gradient-right pr-2">
                    {prompt.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-stone-100 text-stone-500 px-2 py-1 rounded-full whitespace-nowrap">{tag}</span>
                    ))}
                    <button 
                      onClick={() => {
                        const tag = window.prompt('Add tag:');
                        if (tag) updatePrompt(prompt.id, 'tags', [...prompt.tags, tag]);
                      }}
                      className="p-1 hover:bg-stone-100 rounded-full text-stone-400 flex-shrink-0"
                      title="Add Tag"
                    >
                      <Tag className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => handleCopy(prompt.id, prompt.content)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                      copiedId === prompt.id 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-stone-800 text-white hover:bg-black'
                    }`}
                  >
                    {copiedId === prompt.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedId === prompt.id ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            ))}
            
            {/* Helper: Datalist for Auto-complete */}
            <datalist id="category-options">
              {categories.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>

            {/* Empty State */}
            {displayPrompts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-stone-400 border-2 border-dashed border-stone-200 rounded-2xl">
                 <Search className="w-8 h-8 mb-2 opacity-50" />
                 <p>No prompts found in "{selectedCategory}".</p>
                 <Button variant="ghost" size="sm" onClick={addNewPrompt} className="mt-4 text-morandi-primary">
                   Create one here
                 </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};