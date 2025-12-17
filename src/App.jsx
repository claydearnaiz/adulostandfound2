import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider, useToast } from './components/Toast';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { ItemGrid } from './components/ItemGrid';
import { ItemTable } from './components/ItemTable';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { ItemFormModal } from './components/ItemFormModal';
import { AuthModal } from './components/AuthModal';
import { StatsCards } from './components/StatsCards';
import { ItemGridSkeleton } from './components/Skeleton';
import { RecentlyAdded } from './components/RecentlyAdded';
import { ActivityLogModal } from './components/ActivityLogModal';
import { BulkActionBar } from './components/BulkActionBar';
import { UserDashboard } from './components/UserDashboard';
import { ClaimRequestModal } from './components/ClaimRequestModal';
import { ClaimRequestsPanel } from './components/ClaimRequestsPanel';
import { itemService } from './services/itemService';
import { activityLogService } from './services/activityLogService';
import { claimRequestService } from './services/claimRequestService';
import { Package, Search } from 'lucide-react';
import { MOCK_ITEMS } from './services/mockData';
import { isAfter, isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';

// Helper function for smoother typing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function AppContent() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdminView, setIsAdminView] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('');

  // NEW: Date range filter
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // NEW: Sort option
  const [sortOption, setSortOption] = useState('newest');

  // Modals
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // NEW: Admin modals
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
  const [isClaimRequestsOpen, setIsClaimRequestsOpen] = useState(false);

  // NEW: User modals
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [hasExistingClaim, setHasExistingClaim] = useState(false);

  // NEW: Bulk selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // NEW: Pending claims count
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0);

  // Reset admin view if user loses admin status
  useEffect(() => {
    if (!isAdmin && isAdminView) {
      setIsAdminView(false);
    }
  }, [isAdmin, isAdminView]);

  // Load items on mount
  useEffect(() => {
    loadItems();
  }, []);

  // Load pending claims count for admin
  useEffect(() => {
    if (isAdmin) {
      loadPendingClaimsCount();
    }
  }, [isAdmin]);

  // Check for existing claim when viewing item details
  useEffect(() => {
    const checkExistingClaim = async () => {
      if (selectedItem && user && !isAdmin) {
        const hasClaim = await claimRequestService.hasPendingClaim(selectedItem.id, user.uid);
        setHasExistingClaim(hasClaim);
      } else {
        setHasExistingClaim(false);
      }
    };
    checkExistingClaim();
  }, [selectedItem, user, isAdmin]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await itemService.getAll();
      setItems(data);
    } catch (error) {
      console.error('Failed to load items:', error);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingClaimsCount = async () => {
    const count = await claimRequestService.getPendingCount();
    setPendingClaimsCount(count);
  };

  // Filter and sort logic
  const filteredItems = useMemo(() => {
    let result = items.filter(item => {
      const matchesSearch =
        (item.name || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (item.locationFound || '').toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesLocation = locationFilter === 'All' || (item.locationFound || '').includes(locationFilter);
      const matchesCategory = !categoryFilter || (item.category || '').toLowerCase() === categoryFilter.toLowerCase();

      // Date range filter
      let matchesDateRange = true;
      if (dateFrom || dateTo) {
        const itemDate = item.dateFound ? parseISO(item.dateFound) : null;
        if (itemDate) {
          if (dateFrom && isBefore(itemDate, startOfDay(parseISO(dateFrom)))) {
            matchesDateRange = false;
          }
          if (dateTo && isAfter(itemDate, endOfDay(parseISO(dateTo)))) {
            matchesDateRange = false;
          }
        } else {
          matchesDateRange = false;
        }
      }

      return matchesSearch && matchesStatus && matchesLocation && matchesCategory && matchesDateRange;
    });

    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'oldest':
          return new Date(a.dateFound) - new Date(b.dateFound);
        case 'az':
          return (a.name || '').localeCompare(b.name || '');
        case 'za':
          return (b.name || '').localeCompare(a.name || '');
        case 'newest':
        default:
          return new Date(b.dateFound) - new Date(a.dateFound);
      }
    });

    return result;
  }, [items, debouncedSearch, statusFilter, locationFilter, categoryFilter, dateFrom, dateTo, sortOption]);

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const item = items.find(i => i.id === id);
        await itemService.delete(id);
        await activityLogService.log('delete', user, item);
        toast.success('Item deleted successfully');
        loadItems();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingItem) {
        await itemService.update(editingItem.id, formData);
        await activityLogService.log('edit', user, { id: editingItem.id, name: formData.name });
        toast.success('Item updated successfully');
      } else {
        const newItem = await itemService.add(formData);
        await activityLogService.log('add', user, { id: newItem.id, name: formData.name });
        toast.success('Item added successfully');
      }
      loadItems();
      setIsFormOpen(false);
    } catch (error) {
      toast.error('Failed to save item');
    }
  };

  // NEW: Bulk action handlers
  const handleBulkMarkClaimed = async () => {
    if (!window.confirm(`Mark ${selectedIds.length} items as claimed?`)) return;

    setBulkLoading(true);
    try {
      await Promise.all(selectedIds.map(id => itemService.update(id, { status: 'Claimed' })));
      await activityLogService.log('bulk_claim', user, { name: `${selectedIds.length} items` });
      toast.success(`${selectedIds.length} items marked as claimed`);
      setSelectedIds([]);
      loadItems();
    } catch (error) {
      toast.error('Failed to update items');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} items? This cannot be undone.`)) return;

    setBulkLoading(true);
    try {
      await Promise.all(selectedIds.map(id => itemService.delete(id)));
      await activityLogService.log('bulk_delete', user, { name: `${selectedIds.length} items` });
      toast.success(`${selectedIds.length} items deleted`);
      setSelectedIds([]);
      loadItems();
    } catch (error) {
      toast.error('Failed to delete items');
    } finally {
      setBulkLoading(false);
    }
  };

  // NEW: Claim request handlers
  const handleOpenClaimModal = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setIsClaimModalOpen(true);
  };

  const handleSubmitClaim = async (proofDescription, proofImage) => {
    if (!selectedItem || !user) return;

    setClaimSubmitting(true);
    try {
      await claimRequestService.submit(
        selectedItem.id,
        selectedItem.name,
        user.uid,
        user.displayName || user.email?.split('@')[0] || 'User',
        proofDescription,
        proofImage
      );
      await activityLogService.log('claim_request', user, selectedItem);
      toast.success('Claim request submitted! An admin will review it soon.');
      setIsClaimModalOpen(false);
      setIsDetailsOpen(false);
      loadPendingClaimsCount();
    } catch (error) {
      toast.error('Failed to submit claim request');
    } finally {
      setClaimSubmitting(false);
    }
  };

  // NEW: Admin claim action handler
  const handleClaimAction = async (action, claim) => {
    try {
      if (action === 'approve') {
        // Mark item as claimed
        await itemService.update(claim.itemId, { status: 'Claimed' });
        await activityLogService.log('claim_approve', user, { id: claim.itemId, name: claim.itemName }, `Approved for ${claim.userName}`);
        toast.success('Claim approved and item marked as claimed');
      } else {
        await activityLogService.log('claim_reject', user, { id: claim.itemId, name: claim.itemName }, `Rejected for ${claim.userName}`);
        toast.success('Claim rejected');
      }
      loadItems();
      loadPendingClaimsCount();
    } catch (error) {
      toast.error('Failed to process claim');
    }
  };

  // NEW: Seed data handler
  const handleSeedData = async () => {
    if (!window.confirm(`Add ${MOCK_ITEMS.length} mock items to the database?`)) return;

    setLoading(true);
    try {
      await Promise.all(MOCK_ITEMS.map(async (item) => {
        // Add random slight variation to location/description to make them unique if run multiple times
        const uniqueItem = {
          ...item,
          name: `${item.name} ${Math.floor(Math.random() * 1000)}`,
          dateFound: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString().split('T')[0] // Random date in last ~10 days
        };
        return itemService.add(uniqueItem);
      }));
      await activityLogService.log('seed_data', user, { name: `${MOCK_ITEMS.length} mock items` });
      toast.success('Database seeded successfully');
      loadItems();
    } catch (error) {
      console.error('Seed error:', error);
      toast.error('Failed to seed database');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setLocationFilter('All');
    setCategoryFilter('');
    setDateFrom('');
    setDateTo('');
    setSortOption('newest');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-slate-50" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-blue-100/30 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur">
        <div className="max-w-[95%] mx-auto px-4 sm:px-6">
          <Header
            isAdminView={isAdminView}
            setIsAdminView={setIsAdminView}
            onLoginClick={() => setIsAuthOpen(true)}
            onOpenDashboard={() => setIsUserDashboardOpen(true)}
          />
        </div>
        <div className="max-w-[95%] mx-auto px-4 sm:px-6">
          <FilterBar
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            isAdmin={isAdminView}
            onAddItem={handleAddItem}
            viewMode={viewMode}
            setViewMode={setViewMode}
            totalItems={filteredItems.length}
            items={filteredItems}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            sortOption={sortOption}
            setSortOption={setSortOption}
            onOpenActivityLog={() => setIsActivityLogOpen(true)}
            onOpenClaimRequests={() => setIsClaimRequestsOpen(true)}
            onSeedData={handleSeedData}
            pendingClaimsCount={pendingClaimsCount}
          />
        </div>
      </div>

      <main className="max-w-[95%] mx-auto px-4 sm:px-6 py-8">
        {/* Stats for Admin */}
        {isAdminView && !loading && (
          <StatsCards items={items} pendingClaimsCount={pendingClaimsCount} />
        )}

        {/* Recently Added section (non-admin view) */}
        {!isAdminView && !loading && (
          <RecentlyAdded items={items} onItemClick={handleCardClick} />
        )}

        {/* Content */}
        {loading ? (
          <ItemGridSkeleton count={8} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            search={search}
            onClear={clearFilters}
          />
        ) : isAdminView && viewMode === 'table' ? (
          <ItemTable
            items={filteredItems}
            onView={handleCardClick}
            onEdit={handleEditItem}
            onDelete={(id) => handleDeleteItem(id)}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            showSelection={true}
          />
        ) : (
          <ItemGrid
            items={filteredItems}
            onCardClick={handleCardClick}
            isAdmin={isAdminView}
            onEdit={handleEditItem}
            onDelete={(item) => handleDeleteItem(item.id)}
          />
        )}
      </main>

      {/* Bulk Action Bar */}
      {isAdminView && selectedIds.length > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.length}
          onMarkClaimed={handleBulkMarkClaimed}
          onDelete={handleBulkDelete}
          onClearSelection={() => setSelectedIds([])}
          loading={bulkLoading}
        />
      )}

      {/* Modals */}
      <ItemDetailsModal
        key={selectedItem?.id || 'details'}
        item={selectedItem}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        showClaimButton={!!user && !isAdmin}
        onSubmitClaim={handleOpenClaimModal}
        hasExistingClaim={hasExistingClaim}
      />

      <ItemFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Admin Modals */}
      <ActivityLogModal
        isOpen={isActivityLogOpen}
        onClose={() => setIsActivityLogOpen(false)}
      />

      <ClaimRequestsPanel
        isOpen={isClaimRequestsOpen}
        onClose={() => setIsClaimRequestsOpen(false)}
        onClaimAction={handleClaimAction}
      />

      {/* User Modals */}
      <UserDashboard
        isOpen={isUserDashboardOpen}
        onClose={() => setIsUserDashboardOpen(false)}
        userId={user?.uid}
      />

      <ClaimRequestModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSubmit={handleSubmitClaim}
        itemName={selectedItem?.name || ''}
        loading={claimSubmitting}
      />
    </div>
  );
}

const EmptyState = ({ search, onClear }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="bg-slate-100 p-6 rounded-full mb-6">
      {search ? (
        <Search size={40} className="text-slate-400" />
      ) : (
        <Package size={40} className="text-slate-400" />
      )}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">
      {search ? 'No results found' : 'No items yet'}
    </h3>
    <p className="text-slate-500 text-center max-w-md mb-6">
      {search
        ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
        : 'Lost items will appear here once they are added to the system.'
      }
    </p>
    {search && (
      <button onClick={onClear} className="btn-secondary">
        Clear filters
      </button>
    )}
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;