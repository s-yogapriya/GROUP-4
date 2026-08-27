import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getCategoryImage } from '../constants/categoryImages';
import { 
  FolderPlus, Edit3, Trash2, CheckCircle2, XCircle, Search, 
  RefreshCw, Plus, Layers, ToggleLeft, ToggleRight, AlertCircle,
  Car, Zap, Utensils, ShoppingBag, Truck, Flame, Factory, TreePine, 
  Wind, Plane, Bike, Bus, Train, Trash, Home, Globe, Activity, Grid2X2, List, Target,
  Upload, ImageIcon
} from 'lucide-react';

const ICON_OPTIONS = [
  { name: 'Car', icon: Car },
  { name: 'Zap', icon: Zap },
  { name: 'Utensils', icon: Utensils },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Truck', icon: Truck },
  { name: 'Flame', icon: Flame },
  { name: 'Factory', icon: Factory },
  { name: 'TreePine', icon: TreePine },
  { name: 'Wind', icon: Wind },
  { name: 'Plane', icon: Plane },
  { name: 'Bike', icon: Bike },
  { name: 'Bus', icon: Bus },
  { name: 'Train', icon: Train },
  { name: 'Trash', icon: Trash },
  { name: 'Home', icon: Home },
  { name: 'Globe', icon: Globe },
  { name: 'Activity', icon: Activity },
];

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp'];

function ImagePicker({ existingUrl, onFileChange, imageError, setImageError }) {
  const inputRef = useRef(null);
  const [localPreview, setLocalPreview] = useState(null);
  const [fileName, setFileName] = useState('');

  const validate = (file) => {
    if (!file) return 'Please select an image.';
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXT.includes(ext) || !ALLOWED_TYPES.includes(file.type.toLowerCase()))
      return 'Only JPG, JPEG, PNG and WEBP images are allowed.';
    if (file.size > MAX_BYTES) return 'Image size must be less than 5 MB.';
    return null;
  };

  const handleFile = (file) => {
    const err = validate(file);
    if (err) { setImageError(err); onFileChange(null); setLocalPreview(null); setFileName(''); return; }
    setImageError(null);
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    setLocalPreview(url);
    onFileChange(file);
  };

  const onInputChange = (e) => { const f = e.target.files?.[0]; if (f) handleFile(f); };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const previewSrc = localPreview || existingUrl || null;
  const hasExisting = !!existingUrl && !localPreview;

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
        Category Image <span className="text-slate-500 font-normal normal-case">(JPG, PNG, WEBP · max 5 MB)</span>
      </label>

      <div
        className="relative overflow-hidden rounded-xl border-2 border-dashed border-slate-600 hover:border-emerald-500/60 transition-colors cursor-pointer"
        style={{ minHeight: '8rem' }}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
      >
        {previewSrc ? (
          <>
            <img
              src={previewSrc}
              alt="Category preview"
              className="w-full h-32 object-cover"
              onError={() => { if (localPreview) { setLocalPreview(null); } }}
            />
            <div className="absolute inset-0 bg-slate-950/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Upload className="h-5 w-5 text-white" />
              <span className="text-sm font-semibold text-white">
                {hasExisting ? 'Replace Image' : 'Change Image'}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-6 px-4 text-center">
            <div className="rounded-full bg-slate-800 p-2.5">
              <ImageIcon className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300">Click or drag to upload</p>
              <p className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, WEBP up to 5 MB</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {fileName && (
            <span className="text-xs text-emerald-400 truncate">✓ {fileName}</span>
          )}
          {hasExisting && !fileName && (
            <span className="text-xs text-slate-500 truncate">Current image saved</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="shrink-0 flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:border-slate-500"
        >
          <Upload className="h-3.5 w-3.5" />
          {previewSrc ? 'Choose Another' : 'Choose Image'}
        </button>
      </div>

      {imageError && (
        <p className="flex items-center gap-1 text-xs text-rose-400">
          <AlertCircle className="h-3 w-3 shrink-0" />{imageError}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}

const CategoryManagementPage = () => {
  const { showToast } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    categoryCode: '',
    categoryName: '',
    description: '',
    icon: 'Layers',
    colorCode: '#10B981',
    displayOrder: 1,
    status: 'ACTIVE',
    remarks: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState(null);

  // Delete Confirm Modal
  const [deletingCategory, setDeletingCategory] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data || []);
    } catch (err) {
      showToast('Failed to load categories: ' + (err.toString() || 'Server error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      categoryCode: '',
      categoryName: '',
      description: '',
      icon: 'Car',
      colorCode: '#10B981',
      displayOrder: categories.length + 1,
      status: 'ACTIVE',
      remarks: '',
      monthlyLimit: '',
    });
    setFormErrors({});
    setImageFile(null);
    setImageError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      categoryCode: cat.categoryCode || '',
      categoryName: cat.categoryName || '',
      description: cat.description || '',
      icon: cat.icon || 'Car',
      colorCode: cat.colorCode || '#10B981',
      displayOrder: cat.displayOrder || 1,
      status: cat.status || 'ACTIVE',
      remarks: cat.remarks || '',
      monthlyLimit: cat.monthlyLimit != null ? cat.monthlyLimit : '',
    });
    setFormErrors({});
    setImageFile(null);
    setImageError(null);
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.categoryName || !formData.categoryName.trim()) {
      errors.categoryName = 'Category Name cannot be empty';
    }
    if (!formData.description || !formData.description.trim()) {
      errors.description = 'Description is mandatory';
    }
    if (!formData.status) {
      errors.status = 'Status is mandatory';
    }
    if (formData.monthlyLimit !== '' && formData.monthlyLimit !== undefined && formData.monthlyLimit !== null) {
      const limitVal = Number(formData.monthlyLimit);
      if (isNaN(limitVal) || limitVal <= 0) {
        errors.monthlyLimit = 'Monthly emission limit must be a positive number';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (imageError) return;
    if (editingCategory && !window.confirm(`Update category "${editingCategory.categoryName}"?`)) return;

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('categoryCode', formData.categoryCode);
      fd.append('categoryName', formData.categoryName);
      fd.append('description', formData.description);
      if (formData.icon) fd.append('icon', formData.icon);
      if (formData.colorCode) fd.append('colorCode', formData.colorCode);
      if (formData.displayOrder) fd.append('displayOrder', formData.displayOrder);
      fd.append('status', formData.status || 'ACTIVE');
      if (formData.remarks) fd.append('remarks', formData.remarks);
      if (formData.monthlyLimit !== '' && formData.monthlyLimit !== undefined && formData.monthlyLimit !== null) {
        fd.append('monthlyLimit', formData.monthlyLimit);
      }
      if (imageFile) fd.append('image', imageFile);

      if (editingCategory) {
        const res = await api.put(`/admin/categories/${editingCategory.categoryId}`, fd);
        showToast(res.message || 'Category updated successfully!', 'success');
      } else {
        const res = await api.post('/admin/categories', fd);
        showToast(res.message || 'Category created successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      const msg = typeof err === 'string' ? err : (err?.response?.data?.message || err?.message || 'Operation failed');
      if (msg.includes('Name')) {
        setFormErrors((prev) => ({ ...prev, categoryName: msg }));
      } else if (msg.includes('Code')) {
        setFormErrors((prev) => ({ ...prev, categoryCode: msg }));
      } else if (msg.toLowerCase().includes('limit')) {
        setFormErrors((prev) => ({ ...prev, monthlyLimit: msg }));
      } else if (msg.toLowerCase().includes('image')) {
        setImageError(msg);
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    const action = cat.status === 'ACTIVE' ? 'deactivate' : 'activate';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} category "${cat.categoryName}"?`)) return;
    try {
      const endpoint = cat.status === 'ACTIVE'
        ? `/admin/categories/${cat.categoryId}/deactivate`
        : `/admin/categories/${cat.categoryId}/activate`;
      const res = await api.patch(endpoint);
      showToast(res.message || `Category ${cat.categoryName} status toggled!`, 'success');
      fetchCategories();
    } catch (err) {
      showToast('Status update failed: ' + err.toString(), 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      const res = await api.delete(`/admin/categories/${deletingCategory.categoryId}`);
      showToast(res.message || 'Category deleted successfully!', 'info');
      setDeletingCategory(null);
      fetchCategories();
    } catch (err) {
      showToast('Deletion failed: ' + err.toString(), 'error');
    }
  };

  const filteredCategories = categories.filter((c) => {
    const matchesSearch = 
      c.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.categoryCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'ALL' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const renderIcon = (iconName, color = '#10B981') => {
    const iconObj = ICON_OPTIONS.find((item) => item.name === iconName);
    const IconComp = iconObj ? iconObj.icon : Layers;
    return <IconComp className="w-5 h-5" style={{ color }} />;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto px-5 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <Layers className="w-7 h-7 text-emerald-400" />
              Category Management (Admin)
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Create and manage top-level emission activity categories (Transport, Electricity, Food, Shopping)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/activity-types"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-xs border border-slate-700 transition-all"
            >
              <Activity className="w-4 h-4 text-teal-400" />
              Activity Types
            </Link>
            <button
              onClick={fetchCategories}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-900/30"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-slate-700/60">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Categories</div>
            <div className="text-3xl font-black text-white mt-1">{categories.length}</div>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-emerald-500/20">
            <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Active Categories</div>
            <div className="text-3xl font-black text-emerald-400 mt-1">
              {categories.filter((c) => c.status === 'ACTIVE').length}
            </div>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-amber-500/20">
            <div className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Inactive Categories</div>
            <div className="text-3xl font-black text-amber-400 mt-1">
              {categories.filter((c) => c.status === 'INACTIVE').length}
            </div>
          </div>
        </div>

        {/* Controls / Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search category name, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'ACTIVE', 'INACTIVE'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === status
                    ? 'bg-emerald-600 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
            <div className="ml-1 flex rounded-lg border border-slate-700 bg-slate-900 p-1">
              <button aria-label="Card view" onClick={() => setViewMode('cards')} className={`rounded p-1.5 ${viewMode === 'cards' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}><Grid2X2 className="w-4 h-4" /></button>
              <button aria-label="Table view" onClick={() => setViewMode('table')} className={`rounded p-1.5 ${viewMode === 'table' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <p className="text-xs font-medium text-slate-500">Showing {filteredCategories.length} categor{filteredCategories.length === 1 ? 'y' : 'ies'}</p>

        {/* Categories Table */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-3" />
              Loading categories...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Layers className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p className="font-semibold text-slate-300">No categories found</p>
              <p className="text-xs text-slate-500 mt-1">Try adding a new category or adjusting your search filters.</p>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredCategories.map((cat) => (
                <article key={cat.categoryId} className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70 transition hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/20">
                  <div className="relative h-36 overflow-hidden">
                    <img src={cat.image || getCategoryImage(cat)} alt={`${cat.categoryName} sustainability`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-slate-950/10" />
                    <span className="absolute bottom-3 left-4 h-8 w-1 rounded-r" style={{ backgroundColor: cat.colorCode || '#10B981' }} />
                  </div>
                  <div className="p-5 pt-4">
                    <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950 shadow-lg shadow-slate-950">{renderIcon(cat.icon, cat.colorCode)}</div><div><h3 className="font-bold text-white">{cat.categoryName}</h3><span className="font-mono text-[10px] font-bold text-emerald-400">{cat.categoryCode}</span></div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${cat.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>{cat.status}</span></div>
                    <p className="mt-4 min-h-10 text-sm leading-relaxed text-slate-400">{cat.description || 'No description provided.'}</p>
                    {cat.monthlyLimit != null && (
                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <Target className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-semibold">{cat.monthlyLimit} kg CO₂e/month</span>
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4"><span className="text-xs text-slate-500">Display order <b className="text-slate-300">{cat.displayOrder ?? '-'}</b></span><div className="flex gap-2"><button onClick={() => openEditModal(cat)} className="rounded-lg bg-slate-800 p-2 text-teal-300 hover:bg-slate-700" title="Edit category"><Edit3 className="h-4 w-4" /></button><button onClick={() => handleToggleStatus(cat)} className="rounded-lg bg-slate-800 p-2 text-emerald-300 hover:bg-slate-700" title="Change status">{cat.status === 'ACTIVE' ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}</button><button onClick={() => setDeletingCategory(cat)} className="rounded-lg bg-slate-800 p-2 text-rose-300 hover:bg-rose-950" title="Delete category"><Trash2 className="h-4 w-4" /></button></div></div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="py-4 px-5">Code</th>
                    <th className="py-4 px-5">Category Name</th>
                    <th className="py-4 px-5">Description</th>
                    <th className="py-4 px-5 text-right">Monthly Limit</th>
                    <th className="py-4 px-5 text-center">Order</th>
                    <th className="py-4 px-5 text-center">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredCategories.map((cat) => (
                    <tr key={cat.categoryId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-5">
                        <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-slate-900 text-emerald-400 border border-slate-700 font-bold">
                          {cat.categoryCode}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-900 border border-slate-700 shadow-inner"
                          >
                            {renderIcon(cat.icon, cat.colorCode)}
                          </div>
                          <span>{cat.categoryName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-300 max-w-xs truncate" title={cat.description}>
                        {cat.description}
                      </td>
                      <td className="py-4 px-5 text-right font-mono text-xs">
                        {cat.monthlyLimit != null ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 font-bold">
                            {cat.monthlyLimit} <span className="ml-1 text-slate-500">kg CO₂e</span>
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-center font-mono text-xs text-slate-400">
                        {cat.displayOrder ?? '-'}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <button
                          onClick={() => handleToggleStatus(cat)}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            cat.status === 'ACTIVE'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900'
                              : 'bg-rose-950/80 text-rose-300 border border-rose-700/60 hover:bg-rose-900'
                          }`}
                        >
                          {cat.status === 'ACTIVE' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ACTIVE
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              INACTIVE
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 transition-all"
                            title="Edit Category"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingCategory(cat)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-rose-400 border border-slate-700 hover:border-rose-800/60 transition-all"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-emerald-400" />
                {editingCategory ? 'Update Category' : 'Add New Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Category Code
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated if blank (e.g. TRANS)"
                    value={formData.categoryCode}
                    onChange={(e) => setFormData({ ...formData, categoryCode: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono text-emerald-400 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  {formErrors.categoryCode && (
                    <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {formErrors.categoryCode}
                    </p>
                  )}
                </div>

                {/* Category Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Category Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Transport, Electricity"
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className={`w-full px-3.5 py-2.5 bg-slate-800 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none ${
                      formErrors.categoryName ? 'border-rose-500' : 'border-slate-700 focus:border-emerald-500'
                    }`}
                  />
                  {formErrors.categoryName && (
                    <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {formErrors.categoryName}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe the category activities..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3.5 py-2.5 bg-slate-800 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none ${
                    formErrors.description ? 'border-rose-500' : 'border-slate-700 focus:border-emerald-500'
                  }`}
                />
                {formErrors.description && (
                  <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {formErrors.description}
                  </p>
                )}
              </div>

              {/* Category Image */}
              <ImagePicker
                existingUrl={editingCategory?.image || null}
                onFileChange={setImageFile}
                imageError={imageError}
                setImageError={setImageError}
              />

              {/* Icon & Color Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Icon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {ICON_OPTIONS.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Theme Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.colorCode}
                      onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.colorCode}
                      onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                      className="flex-1 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Order & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Status <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Remarks
                </label>
                <input
                  type="text"
                  placeholder="Optional internal remarks..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Monthly Emission Limit */}
              <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <label className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                    Monthly Emission Limit (kg CO₂e)
                  </label>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 100"
                  value={formData.monthlyLimit}
                  onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
                  className={`w-full px-3.5 py-2.5 bg-slate-800 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none ${
                    formErrors.monthlyLimit ? 'border-rose-500' : 'border-slate-700 focus:border-emerald-500'
                  }`}
                />
                {formErrors.monthlyLimit && (
                  <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {formErrors.monthlyLimit}
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-1.5">
                  Set the maximum monthly CO₂e emissions allowed for this category. Used by alerts and goals.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-900/30"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-7 h-7" />
              <h3 className="text-lg font-bold text-white">Delete Category</h3>
            </div>
            <p className="text-sm text-slate-300">
              Are you sure you want to delete category <strong className="text-white">"{deletingCategory.categoryName}"</strong> ({deletingCategory.categoryCode})? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold transition-all shadow-lg shadow-rose-900/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CategoryManagementPage;
