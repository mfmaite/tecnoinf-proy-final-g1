import React, { useState } from 'react';
import { Button } from '@/components/button/button';

type Props = {
  message: string;
  setMessage: (message: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting?: boolean;
  error?: string | null;
  placeholder?: string;
  submitLabel?: string;
};

export function PostComposer({
  message = '',
  setMessage,
  onSubmit,
  onCancel,
  submitting = false,
  error = null,
  placeholder = 'Escribe el contenido...',
  submitLabel = 'Publicar',
}: Props) {
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = () => {
    const value = message.trim();
    if (!value) {
      setLocalError('Escribe un mensaje antes de publicar.');
      return;
    }
    setLocalError(null);
    onSubmit();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      <label className="text-sm text-gray-600">Mensaje</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-3 text-sm text-text-neutral-50"
        rows={4}
        placeholder={placeholder}
        disabled={submitting}
      />
      {localError ? <div className="text-sm text-red-600">{localError}</div> : null}
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
      <div className="flex items-center gap-2 justify-end">
        <Button
          variant="outline"
          color="secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Publicando...' : submitLabel}
        </Button>
      </div>
    </div>
  );
}


