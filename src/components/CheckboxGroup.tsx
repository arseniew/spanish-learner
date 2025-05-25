import React from 'react';

interface CheckboxGroupProps<T extends string> {
  title: string;
  items: T[];
  selectedItems: Set<T>;
  onToggle: (item: T) => void;
  onToggleAll?: (select: boolean) => void;
  itemGroups?: { name: string; items: T[] }[];
  onToggleGroup?: (groupItems: T[], select: boolean) => void;
}

export function CheckboxGroup<T extends string>({
  title,
  items,
  selectedItems,
  onToggle,
  onToggleAll,
  itemGroups,
  onToggleGroup,
}: CheckboxGroupProps<T>) {
  const allSelected = items.length > 0 && selectedItems.size === items.length;
  const noneSelected = selectedItems.size === 0;

  const handleToggleAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    onToggleAll?.(event.target.checked);
  };

   const handleGroupToggle = (
        groupItems: T[],
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        onToggleGroup?.(groupItems, event.target.checked);
    };

   const isGroupSelected = (groupItems: T[]): boolean => {
        // Ensure groupItems only contains items that actually exist in the main 'items' list
        const relevantGroupItems = groupItems.filter(item => items.includes(item));
        if (relevantGroupItems.length === 0) return false; // Cannot select an empty or irrelevant group
        return relevantGroupItems.every(item => selectedItems.has(item));
   }

   const isGroupIndeterminate = (groupItems: T[]): boolean => {
        const relevantGroupItems = groupItems.filter(item => items.includes(item));
        if (relevantGroupItems.length === 0) return false;
        const someSelected = relevantGroupItems.some(item => selectedItems.has(item));
        const allRelevantSelected = isGroupSelected(relevantGroupItems); // Use the filtered list here too
        return someSelected && !allRelevantSelected;
   }


  return (
    <fieldset className="checkbox-group">
      <legend>{title}</legend>
      {onToggleAll && items.length > 0 && (
        <div className="checkbox-item select-all">
          <input
            type="checkbox"
            id={`toggle-all-${title.replace(/\s+/g, '-')}`} // Make ID safe
            checked={allSelected}
            disabled={items.length === 0}
            onChange={handleToggleAll}
            ref={input => { // Handle indeterminate state for "Select All"
                if (input) {
                    input.indeterminate = !allSelected && !noneSelected;
                }
            }}
          />
          <label htmlFor={`toggle-all-${title.replace(/\s+/g, '-')}`}>
            {allSelected ? 'Deselect All' : 'Select All'}
          </label>
        </div>
      )}
       {itemGroups && onToggleGroup && itemGroups.map(group => {
            const relevantGroupItems = group.items.filter(item => items.includes(item));
            // Only show group toggle if it contains *at least one* item from the main `items` list
            return relevantGroupItems.length > 0 && (
                <div key={group.name} className="checkbox-item group-toggle">
                    <input
                        type="checkbox"
                        id={`toggle-group-${title.replace(/\s+/g, '-')}-${group.name.replace(/\s+/g, '-')}`}
                        checked={isGroupSelected(relevantGroupItems)}
                        onChange={(e) => handleGroupToggle(relevantGroupItems, e)}
                        ref={input => {
                            if (input) {
                                input.indeterminate = isGroupIndeterminate(relevantGroupItems);
                            }
                        }}
                    />
                    <label htmlFor={`toggle-group-${title.replace(/\s+/g, '-')}-${group.name.replace(/\s+/g, '-')}`}>
                        Select {group.name}
                    </label>
                </div>
            )
       })}
      <div className="checkbox-list">
        {items.map(item => (
          <div key={item} className="checkbox-item">
            <input
              type="checkbox"
              id={`${title.replace(/\s+/g, '-')}-${item}`}
              checked={selectedItems.has(item)}
              onChange={() => onToggle(item)}
            />
            <label htmlFor={`${title.replace(/\s+/g, '-')}-${item}`}>{item}</label>
          </div>
        ))}
         {items.length === 0 && <p className="no-items-message">(No {title.toLowerCase()} available)</p>}
      </div>
    </fieldset>
  );
}
