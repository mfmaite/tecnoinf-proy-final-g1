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
    <div className="flex gap-3">
      <TextField
        name="search"
        placeholder="Buscar por nombre, email o documento"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
      {showCsv && (
         <div>
         <input
           type="file"
           accept=".csv,text/csv"
           onChange={(e) => onCsvChange?.(e.target.files?.[0] ?? null)}
           className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-color-80 file:text-white hover:file:bg-primary-color-90"
         />
         <a
           href="/assets/spreadsheets-examples/matriculacion-estudiante.csv"
           download
           className="inline-block mt-1 text-primary-color-80 hover:underline text-sm"
         >
           Descargar CSV de ejemplo
         </a>
       </div>
      )}
    </div>
  );
};


