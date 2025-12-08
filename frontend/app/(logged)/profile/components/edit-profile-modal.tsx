'use client';

import React, { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

import Modal from '@/components/modal/modal';
import { Button } from '@/components/button/button';
import { TextField, TextFieldStatus } from '@/components/text-field/text-field';
import { userController } from '@/controllers/userController';
import { UserResponse } from '@/types/user';

type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string;
  initialUser: UserResponse | undefined;
  onSaved?: (updated: UserResponse) => void;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

const EditProfileModal = ({
  isOpen,
  onClose,
  accessToken,
  initialUser,
  onSaved,
}: EditProfileModalProps) => {
  const { update } = useSession();
  const [name, setName] = useState<string>(initialUser?.name ?? '');
  const [email, setEmail] = useState<string>(initialUser?.email ?? '');
  const [description, setDescription] = useState<string>(initialUser?.description ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reset form when opening with new initialUser
  React.useEffect(() => {
    if (isOpen) {
      setName(initialUser?.name ?? '');
      setEmail(initialUser?.email ?? '');
      setDescription(initialUser?.description ?? '');
      setFile(null);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, initialUser]);

  const nameError = useMemo(() => {
    if (!name.trim()) return 'El nombre es obligatorio';
    if (name.length > 255) return 'Máximo 255 caracteres';
    return null;
  }, [name]);

  const emailError = useMemo(() => {
    if (!email.trim()) return 'El email es obligatorio';
    // Basic check
    const ok = /\S+@\S+\.\S+/.test(email);
    if (!ok) return 'Formato de email inválido';
    return null;
  }, [email]);

  const fileError = useMemo(() => {
    if (!file) return null;
    if (file.size > MAX_FILE_BYTES) return 'La imagen excede 10MB';
    if (!file.type.startsWith('image/')) return 'El archivo debe ser una imagen';
    return null;
  }, [file]);

  const canSubmit = useMemo(() => {
    return !!accessToken && !nameError && !emailError && !fileError && !submitting;
  }, [accessToken, nameError, emailError, fileError, submitting]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!accessToken || !canSubmit) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const resp = await userController.updateCurrentUser(
      { name, email, description },
      accessToken,
      file
    );

    setSubmitting(false);

    if (resp.success && resp.data) {
      setSuccess('Perfil actualizado correctamente');
      onSaved?.(resp.data);
      try {
        await update({
          user: {
            name: resp.data.name,
            email: resp.data.email,
            description: resp.data.description,
            pictureUrl: resp.data.pictureUrl,
          },
        } as any);
      } catch {}
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 900);
    } else {
      setError(resp.message || 'No se pudo actualizar el perfil');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar perfil"
      description="Actualiza tu información personal y foto de perfil."
      footer={(
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {submitting ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      )}
    >
      <div className="flex flex-col gap-4">
        <TextField
          name="name"
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          helperText={nameError ?? undefined}
          status={nameError ? TextFieldStatus.error : TextFieldStatus.default}
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          helperText={emailError ?? undefined}
          status={emailError ? TextFieldStatus.error : TextFieldStatus.default}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary-color-20 text-text-neutral-50"
            placeholder="Cuéntanos algo sobre ti"
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">{(description?.length ?? 0)}/1000</p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Foto de perfil</label>
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="block w-full text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-secondary-color-50 file:px-4 file:py-2 file:text-white hover:file:bg-secondary-color-60 cursor-pointer"
          />
          <p className="text-xs text-gray-500">Formatos: PNG, JPG, WEBP, GIF. Máx 10MB.</p>
          {fileError ? <p className="text-xs text-accent-danger-40">{fileError}</p> : null}
        </div>

        {(error || success) && (
          <div className={error ? 'text-accent-danger-40 text-sm' : 'text-accent-success-40 text-sm'}>
            {error || success}
          </div>
        )}
      </div>
    </Modal>
  );
}

export { EditProfileModal };


