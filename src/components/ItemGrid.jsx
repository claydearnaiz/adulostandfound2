import React from 'react';
import { ItemCard } from './ItemCard';

export const ItemGrid = ({ items, onCardClick, isAdmin, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger-children">
      {items.map((item) => (
        <ItemCard 
          key={item.id} 
          item={item} 
          onClick={onCardClick}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
