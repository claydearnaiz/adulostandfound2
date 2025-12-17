import React, { useState } from 'react';
import { Modal } from './Modal';
import { Upload, Loader2, X, Send, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storageService';

export const ClaimRequestModal = ({
    isOpen,
    onClose,
    onSubmit,
    itemName,
    loading = false
}) => {
    const [proofDescription, setProofDescription] = useState('');
    const [proofImage, setProofImage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const localPreview = URL.createObjectURL(file);
            setPreviewUrl(localPreview);
            const downloadURL = await storageService.uploadImage(file);
            setProofImage(downloadURL);
            setPreviewUrl(downloadURL);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image');
            setPreviewUrl('');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!proofDescription.trim()) {
            alert('Please describe why this item belongs to you');
            return;
        }
        onSubmit(proofDescription, proofImage);
    };

    const clearImage = () => {
        setProofImage('');
        setPreviewUrl('');
    };

    const handleClose = () => {
        setProofDescription('');
        setProofImage('');
        setPreviewUrl('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Submit Claim Request">
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Item info */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-sm text-blue-700">
                        You're submitting a claim for: <strong>{itemName}</strong>
                    </p>
                </div>

                {/* Proof description */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Proof of Ownership *
                    </label>
                    <textarea
                        required
                        rows={4}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                        placeholder="Describe why this item belongs to you. Include identifying details like color, brand, unique marks, contents, etc."
                        value={proofDescription}
                        onChange={(e) => setProofDescription(e.target.value)}
                    />
                </div>

                {/* Proof image (optional) */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Supporting Image <span className="text-slate-400 font-normal">(optional)</span>
                    </label>

                    {previewUrl ? (
                        <div className="relative">
                            <img
                                src={previewUrl}
                                alt="Proof"
                                className="w-full h-40 object-cover rounded-xl border border-slate-200"
                            />
                            <button
                                type="button"
                                onClick={clearImage}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="proof-upload"
                            />
                            <label
                                htmlFor="proof-upload"
                                className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploading ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                                    }`}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="animate-spin text-blue-500 mb-2" size={20} />
                                        <span className="text-sm text-blue-600 font-medium">Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="text-slate-400 mb-2" size={20} />
                                        <span className="text-sm text-slate-500">Upload proof (receipt, photo, etc.)</span>
                                    </>
                                )}
                            </label>
                        </div>
                    )}
                </div>

                {/* Info notice */}
                <div className="flex gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <AlertCircle className="shrink-0 text-amber-500 mt-0.5" size={16} />
                    <p className="text-sm text-amber-700">
                        An admin will review your request. You may be asked to provide additional proof or visit the claim location in person.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                Submit Claim
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
