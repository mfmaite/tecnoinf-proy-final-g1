"use client";

import React from "react";
import { clsx } from "clsx";
import { Button } from "@/components/button/button";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnBackdrop?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  className = "",
}) => {
  if (!isOpen) return null;

  const handleBackdrop = () => {
    if (closeOnBackdrop) onClose();
  };

  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-black/40 backdrop-blur-sm"
      )}
      onClick={handleBackdrop}
      aria-modal
      role="dialog"
    >
      <div
        className={clsx(
          "w-full mx-4",
          sizeClasses[size],
          "bg-white rounded-2xl shadow-xl border border-gray-200",
          "animate-in fade-in zoom-in-95",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || description) && (
          <div className="px-6 py-5 border-b border-gray-200">
            {title && (
              <h2 className="text-xl font-bold text-secondary-color-70">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
        )}

        <div className="px-6 py-5">{children}</div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <Button variant="outline" color="secondary" onClick={onClose}>
            Cancelar
          </Button>
          {footer}
        </div>
      </div>
    </div>
  );
};

export default Modal;


