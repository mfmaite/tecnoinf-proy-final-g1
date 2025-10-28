'use client';

import React, { useMemo, useState } from 'react';

import Modal from '@/components/modal/modal';
import { Button } from '@/components/button/button';
import { userController } from '@/controllers/userController';
import { TextField, TextFieldStatus } from '@/components/text-field/text-field';

type ChangePasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string;
}

const ChangePasswordModal = ({ isOpen, onClose, accessToken }: ChangePasswordModalProps) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const confirmMatches = useMemo(() => newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword, [newPassword, confirmPassword]);
  const canSubmit = useMemo(() => !!accessToken && oldPassword.length > 0 && newPassword.length >= 8 && confirmMatches, [accessToken, oldPassword, newPassword, confirmMatches]);

  const handleSubmit = async () => {
    if (!accessToken) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const resp = await userController.changePassword({
      oldPassword,
      newPassword,
      confirmPassword,
    }, accessToken);

    setSubmitting(false);

    if (resp.success) {
      setSuccess('Contraseña actualizada correctamente');
      setTimeout(() => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSubmitting(false);
        setError(null);
        setSuccess(null);
        onClose()
      }, 1200);
    } else {
      setError(resp.message || 'No se pudo cambiar la contraseña');
    }
  };

  return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Cambiar contraseña"
        description="Ingrese su contraseña actual y la nueva contraseña."
        footer={(
          <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
            {submitting ? 'Guardando...' : 'Guardar'}
          </Button>
        )}
      >
        <div className="flex flex-col gap-4">
          <TextField
            name="oldPassword"
            label="Contraseña actual"
            type="password"
            autoComplete="current-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <TextField
            name="newPassword"
            label="Nueva contraseña"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            helperText={newPassword && newPassword.length < 8 ? 'Debe tener al menos 8 caracteres' : undefined}
            status={newPassword && newPassword.length < 8 ? TextFieldStatus.error : TextFieldStatus.default}
          />
          <TextField
            name="confirmPassword"
            label="Confirmar nueva contraseña"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            helperText={confirmPassword && !confirmMatches ? 'Las contraseñas no coinciden' : undefined}
            status={confirmPassword && !confirmMatches ? TextFieldStatus.error : TextFieldStatus.default}
          />

          {(error || success) && (
            <div className={error ? 'text-accent-danger-40 text-sm' : 'text-accent-success-40 text-sm'}>
              {error || success}
            </div>
          )}
        </div>
      </Modal>
  )
}

export { ChangePasswordModal }
