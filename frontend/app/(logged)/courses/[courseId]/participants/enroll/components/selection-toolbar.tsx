'use client';

import React from 'react';
import { TextField } from '@/components/text-field/text-field';

type Props = {
  query: string;
  onQueryChange: (v: string) => void;
  showCsv?: boolean;
  onCsvChange?: (f: File | null) => void;
};

export const SelectionToolbar = ({
  query,
  onQueryChange,
  showCsv = false,
  onCsvChange,
}: Props) => {
  return (
    <div className="flex items-center gap-3">
      <TextField
        name="search"
        placeholder="Buscar por nombre, email o documento"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
      {showCsv && (
        <div className="flex items-center gap-3 bg-surface-light-10 border border-surface-light-50 rounded-md p-2">
          <input
            type="file"
            accept=".csv"
            className="text-sm text-text-neutral-50"
            onChange={(e) => onCsvChange?.(e.target.files?.[0] ?? null)}
          />
        </div>
      )}
    </div>
  );
};


