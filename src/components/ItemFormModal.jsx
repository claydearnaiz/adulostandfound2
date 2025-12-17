import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { Upload, Link, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { storageService } from '../services/storageService';

const LOCATIONS = [
  'Library - 3rd Floor',
  'Ozanam Building - Room 305',
  'Adamson Hall - Canteen',
  'St. Vincent Building - Computer Lab 1',
  'Cardinal Santos Building - Lobby',
  'Carlos Tiu Building - Lobby',
  'ST Annex - Ground Floor',
  'Basketball Court - Bleachers',
  'Other'
];

const CLAIM_LOCATIONS = ['CS', 'ST Gate', 'Other'];
const CATEGORIES = ['Personal Items', 'Electronics', 'Bags', 'Books', 'Clothing', 'Other'];

export const ItemFormModal = ({ isOpen, onClose, onSubmit, initialData, title }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    dateFound: new Date().toISOString().split('T')[0],
    locationFound: '',
    claimLocation: 'CS',
    status: 'Unclaimed',
    category: ''
  });

  const [imageMode, setImageMode] = useState('upload'); // 'upload' or 'url'
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [customCategory, setCustomCategory] = useState('');
  const [customClaimLocation, setCustomClaimLocation] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        dateFound: initialData.dateFound || new Date().toISOString().split('T')[0]
      });
      setPreviewUrl(initialData.image || '');
      setImageMode(initialData.image ? 'url' : 'upload');
    } else {
      setFormData({
        name: '',
        description: '',
        image: '',
        dateFound: new Date().toISOString().split('T')[0],
        locationFound: '',
        claimLocation: 'CS',
        status: 'Unclaimed',
        category: ''
      });
      setPreviewUrl('');
      setImageMode('upload');
      setCustomCategory('');
      setCustomClaimLocation('');
    }
  }, [initialData, isOpen]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      // Show preview immediately
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Upload to Firebase Storage
      const downloadURL = await storageService.uploadImage(file);
      setFormData({ ...formData, image: downloadURL });
      setPreviewUrl(downloadURL);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
      setPreviewUrl('');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (url) => {
    setFormData({ ...formData, image: url });
    setPreviewUrl(url);
  };

  const clearImage = () => {
    setFormData({ ...formData, image: '' });
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.image) {
      alert('Please add an image');
      return;
    }
    // apply custom fields if chosen
    const payload = {
      ...formData,
      category: formData.category === 'Other' && customCategory ? customCategory : formData.category,
      claimLocation: formData.claimLocation === 'Other' && customClaimLocation ? customClaimLocation : formData.claimLocation,
    };

    setSubmitLoading(true);
    try {
      await onSubmit(payload);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Item Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Item Name *</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="e.g., Blue Water Bottle"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
          <textarea
            required
            rows={3}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            placeholder="Detailed description of the item"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Image Section */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Image *</label>
          
          {/* Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg mb-3">
            <button
              type="button"
              onClick={() => setImageMode('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                imageMode === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              <Upload size={16} />
              Upload
            </button>
            <button
              type="button"
              onClick={() => setImageMode('url')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                imageMode === 'url' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              <Link size={16} />
              URL
            </button>
          </div>

          {imageMode === 'upload' ? (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  uploading ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin text-blue-500 mb-2" size={24} />
                    <span className="text-sm text-blue-600 font-medium">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="text-slate-400 mb-2" size={24} />
                    <span className="text-sm text-slate-500">Click to upload image</span>
                    <span className="text-xs text-slate-400 mt-1">Max 5MB (JPG, PNG, GIF)</span>
                  </>
                )}
              </label>
            </div>
          ) : (
            <input
              type="url"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="https://example.com/image.jpg"
              value={formData.image}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
          )}

          {/* Preview */}
          {previewUrl && (
            <div className="relative mt-3">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-40 object-cover rounded-xl border border-slate-200"
                onError={() => setPreviewUrl('')}
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Date and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Date Found *</label>
            <input
              type="date"
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={formData.dateFound}
              onChange={(e) => setFormData({ ...formData, dateFound: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {CATEGORIES.map(cat => {
                const active = formData.category === cat;
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => { setFormData({ ...formData, category: cat }); setCustomCategory(''); }}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      active ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
            {(formData.category === 'Other') && (
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter custom category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Location Found */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Location Found *</label>
          <input
            list="locations"
            required
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="e.g., Library - 3rd Floor"
            value={formData.locationFound}
            onChange={(e) => setFormData({ ...formData, locationFound: e.target.value })}
          />
          <datalist id="locations">
            {LOCATIONS.map(loc => <option key={loc} value={loc} />)}
          </datalist>
        </div>

        {/* Claim Location and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Claim Location *</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {CLAIM_LOCATIONS.map(loc => {
                const active = formData.claimLocation === loc;
                return (
                  <button
                    type="button"
                    key={loc}
                    onClick={() => { setFormData({ ...formData, claimLocation: loc }); setCustomClaimLocation(''); }}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      active ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {loc}
                  </button>
                );
              })}
            </div>
            {formData.claimLocation === 'Other' && (
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter custom claim location"
                value={customClaimLocation}
                onChange={(e) => setCustomClaimLocation(e.target.value)}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Status *</label>
            <select
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Unclaimed">Unclaimed</option>
              <option value="Claimed">Claimed</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitLoading || uploading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Saving...
              </>
            ) : (
              initialData ? 'Update Item' : 'Add Item'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
