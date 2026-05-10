"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, Edit, Trash2, Smartphone, Save, X, Image as ImageIcon } from 'lucide-react';
import { SETUP_STEPS } from '@/data/setupGuides';

export default function SetupGuidesManager() {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingGuide, setEditingGuide] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        fetchGuides();
    }, []);

    const fetchGuides = async () => {
        try {
            const res = await fetch('/api/admin/setup-guides');
            if (!res.ok) throw new Error('Failed to fetch guides');
            const data = await res.json();
            setGuides(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/setup-guides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingGuide)
            });
            
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to save');
            }
            
            toast.success('Setup guide saved successfully');
            setEditingGuide(null);
            fetchGuides();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this custom guide? The system will revert to the default hardcoded instructions for this step.')) return;
        
        try {
            const res = await fetch(`/api/admin/setup-guides?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Guide deleted');
            fetchGuides();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Max 2MB
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image must be smaller than 2MB");
            return;
        }

        setUploadingImage(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/setup-guides/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            
            setEditingGuide(prev => ({ ...prev, screenshotUrl: data.url }));
            toast.success("Image uploaded!");
        } catch (error) {
            toast.error(error.message || "Failed to upload image");
        } finally {
            setUploadingImage(false);
        }
    };

    const oems = ['Xiaomi', 'Samsung', 'Vivo', 'Oppo', 'Realme', 'Huawei', 'OnePlus', 'Google', 'Transsion', 'Other'];

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold dark:text-gray-100">Dynamic Setup Guides</h2>
                    <p className="text-sm text-gray-500">Override default Wizard setup instructions for specific manufacturers and Android skins.</p>
                </div>
                <button 
                    onClick={() => setEditingGuide({ stepId: SETUP_STEPS[0], oem: 'Xiaomi', skinName: '', titleEn: '', titleBn: '', instructionEn: '', instructionBn: '', screenshotUrl: '' })}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition"
                >
                    <Plus className="w-4 h-4" /> Add Override
                </button>
            </div>

            {editingGuide && (
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 mb-8 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg dark:text-gray-100">{editingGuide.id ? 'Edit Guide Override' : 'New Guide Override'}</h3>
                        <button onClick={() => setEditingGuide(null)} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"><X className="w-4 h-4" /></button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Setup Step *</label>
                                <select 
                                    required
                                    value={editingGuide.stepId} 
                                    onChange={e => setEditingGuide({...editingGuide, stepId: e.target.value})}
                                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    {SETUP_STEPS.map(step => (
                                        <option key={step} value={step}>{step}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target OEM *</label>
                                <select 
                                    required
                                    value={editingGuide.oem} 
                                    onChange={e => setEditingGuide({...editingGuide, oem: e.target.value})}
                                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    {oems.map(oem => (
                                        <option key={oem} value={oem}>{oem}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skin Name (Optional)</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g., HyperOS, OneUI"
                                    value={editingGuide.skinName || ''} 
                                    onChange={e => setEditingGuide({...editingGuide, skinName: e.target.value})}
                                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave blank to apply to all devices of this OEM</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (English) *</label>
                                    <input 
                                        required type="text" 
                                        value={editingGuide.titleEn} 
                                        onChange={e => setEditingGuide({...editingGuide, titleEn: e.target.value})}
                                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instruction (English) *</label>
                                    <textarea 
                                        required rows={3}
                                        value={editingGuide.instructionEn} 
                                        onChange={e => setEditingGuide({...editingGuide, instructionEn: e.target.value})}
                                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (Bangla) *</label>
                                    <input 
                                        required type="text" 
                                        value={editingGuide.titleBn} 
                                        onChange={e => setEditingGuide({...editingGuide, titleBn: e.target.value})}
                                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-bengali"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instruction (Bangla) *</label>
                                    <textarea 
                                        required rows={3}
                                        value={editingGuide.instructionBn} 
                                        onChange={e => setEditingGuide({...editingGuide, instructionBn: e.target.value})}
                                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-bengali"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Screenshot Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Guide Screenshot (Optional)</label>
                            
                            <div className="flex items-start gap-4">
                                {editingGuide.screenshotUrl && (
                                    <div className="relative group rounded-lg overflow-hidden border border-gray-200">
                                        <img src={editingGuide.screenshotUrl} alt="Preview" className="w-32 h-64 object-cover" />
                                        <button 
                                            type="button"
                                            onClick={() => setEditingGuide({...editingGuide, screenshotUrl: null})}
                                            className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                                        >
                                            <Trash2 className="w-6 h-6" />
                                        </button>
                                    </div>
                                )}
                                
                                <div className="flex-1">
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer relative">
                                        <input 
                                            type="file" 
                                            accept="image/png, image/jpeg, image/webp" 
                                            onChange={handleImageUpload}
                                            disabled={uploadingImage}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                                        />
                                        
                                        {uploadingImage ? (
                                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                        )}
                                        
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                            {uploadingImage ? 'Uploading...' : 'Click or drag image to upload'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB. Aspect ratio 9:16 recommended.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button type="button" onClick={() => setEditingGuide(null)} className="px-4 py-2 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 rounded-lg">Cancel</button>
                            <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 transition disabled:opacity-50">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Guide
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        <Smartphone className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-400 mb-1">No Custom Guides</h3>
                        <p>You haven't added any custom overrides yet. The dashboard will use the default instructions.</p>
                    </div>
                )}
                
                {guides.map(guide => (
                    <div key={guide.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col group">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/80 flex justify-between items-start">
                            <div>
                                <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 text-xs font-bold rounded-full mb-2">
                                    {guide.oem} {guide.skinName ? `(${guide.skinName})` : ''}
                                </span>
                                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate" title={guide.stepId}>{guide.stepId}</h4>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button onClick={() => setEditingGuide(guide)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(guide.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                        
                        <div className="p-4 flex-1 flex flex-col">
                            {guide.screenshotUrl && (
                                <div className="w-full h-32 bg-gray-100 dark:bg-gray-900 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                                    <img src={guide.screenshotUrl} alt="Preview" className="h-full object-contain" />
                                </div>
                            )}
                            
                            <div className="space-y-3 mt-auto">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">English</span>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{guide.titleEn}</p>
                                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{guide.instructionEn}</p>
                                </div>
                                <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Bangla</span>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium font-bengali">{guide.titleBn}</p>
                                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 font-bengali">{guide.instructionBn}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
