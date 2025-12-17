import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Plus, LayoutGrid, List, Package, Smartphone, Briefcase, BookOpen, Shirt,
  Download, FileText, FileSpreadsheet, ChevronDown, Calendar, ArrowUpDown,
  History, ClipboardList
} from 'lucide-react';
import { exportService } from '../services/exportService';

const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: Package },
  { id: 'Electronics', label: 'Electronics', icon: Smartphone },
  { id: 'Bags', label: 'Bags', icon: Briefcase },
  { id: 'Books', label: 'Books', icon: BookOpen },
  { id: 'Clothing', label: 'Clothing', icon: Shirt },
  { id: 'Personal Items', label: 'Personal', icon: Package },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'az', label: 'A → Z' },
  { id: 'za', label: 'Z → A' },
];

export const FilterBar = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  locationFilter,
  setLocationFilter,
  categoryFilter,
  setCategoryFilter,
  isAdmin,
  onAddItem,
  viewMode,
  setViewMode,
  totalItems,
  items = [],
  // New props for enhanced filtering
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  sortOption,
  setSortOption,
  // Admin actions
  onOpenActivityLog,
  onOpenClaimRequests,
  onSeedData,
  pendingClaimsCount = 0
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const exportRef = useRef(null);

  // Close export menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportCSV = () => {
    exportService.exportToCSV(items);
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    exportService.exportToPDF(items);
    setShowExportMenu(false);
  };

  const clearDateFilter = () => {
    setDateFrom?.('');
    setDateTo?.('');
  };

  const hasDateFilter = dateFrom || dateTo;

  return (
    <div className="bg-white/70 backdrop-blur-sm border-b border-slate-100">
      <div className="max-w-[95%] mx-auto px-4 sm:px-6 py-4 space-y-4">
        {/* Search Row */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            <input
              type="text"
              placeholder="Search by name, description, or location..."
              className="input h-12 !pl-12 !pr-4"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <select
              className="input h-12 w-full sm:w-auto min-w-[130px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Unclaimed">Unclaimed</option>
              <option value="Claimed">Claimed</option>
            </select>

            <select
              className="input h-12 w-full sm:w-auto min-w-[150px]"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="All">All Locations</option>
              <option value="Library">Library</option>
              <option value="Ozanam">Ozanam</option>
              <option value="Adamson Hall">Adamson Hall</option>
              <option value="St. Vincent">St. Vincent</option>
              <option value="Cardinal Santos">Cardinal Santos</option>
              <option value="Carlos Tiu">Carlos Tiu (CT)</option>
              <option value="ST Annex">ST Annex</option>
              <option value="Basketball Court">Basketball Court</option>
            </select>

            {/* Sort Dropdown */}
            {setSortOption && (
              <select
                className="input h-12 w-full sm:w-auto min-w-[130px]"
                value={sortOption || 'newest'}
                onChange={(e) => setSortOption(e.target.value)}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            )}

            {/* Date Filter Toggle */}
            {setDateFrom && (
              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className={`h-12 px-4 rounded-xl font-medium transition-all flex items-center gap-2 ${hasDateFilter
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
              >
                <Calendar size={16} />
                <span className="hidden sm:inline">Date Range</span>
                {hasDateFilter && (
                  <span className="h-2 w-2 bg-blue-500 rounded-full" />
                )}
              </button>
            )}

            {isAdmin && (
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    aria-label="Table view"
                  >
                    <List size={18} />
                  </button>
                </div>

                {/* Activity Log Button */}
                {onOpenActivityLog && (
                  <button
                    onClick={onOpenActivityLog}
                    className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="Activity Log"
                  >
                    <History size={18} />
                  </button>
                )}

                {/* Claim Requests Button */}
                {onOpenClaimRequests && (
                  <button
                    onClick={onOpenClaimRequests}
                    className="relative p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="Claim Requests"
                  >
                    <ClipboardList size={18} />
                    {pendingClaimsCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {pendingClaimsCount > 9 ? '9+' : pendingClaimsCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Seed Data Button (Dev helper) */}
                {onSeedData && (
                  <button
                    onClick={onSeedData}
                    className="p-3 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                    title="Seed Database with Mock Data"
                  >
                    <Package size={18} />
                  </button>
                )}

                {/* Export Dropdown */}
                <div className="relative" ref={exportRef}>
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-2 h-12 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-all"
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">Export</span>
                    <ChevronDown size={14} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                      <button
                        onClick={handleExportCSV}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <FileSpreadsheet size={16} className="text-emerald-500" />
                        Export as CSV
                      </button>
                      <button
                        onClick={handleExportPDF}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <FileText size={16} className="text-red-500" />
                        Export as PDF
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={onAddItem}
                  className="btn-primary flex items-center gap-2 whitespace-nowrap h-12 px-4"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Add Item</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Date Range Filter (collapsible) */}
        {showDateFilter && setDateFrom && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <span className="text-sm font-medium text-slate-500">Date Found:</span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="input h-10 text-sm"
                value={dateFrom || ''}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                className="input h-10 text-sm"
                value={dateTo || ''}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To"
              />
            </div>
            {hasDateFilter && (
              <button
                onClick={clearDateFilter}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear dates
              </button>
            )}
          </div>
        )}

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = (categoryFilter || 'all') === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter?.(cat.id === 'all' ? '' : cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
              >
                <Icon size={14} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-900">{totalItems}</span> items found
          </p>
        </div>
      </div>
    </div>
  );
};
