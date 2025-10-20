import clsx from 'clsx';
import React from 'react';

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled: boolean;
  options: { value: string; label: string }[];
}

const SelectField = ({ label, name, value, onChange, disabled, options }: SelectFieldProps) => {
  return (
    <div>
      <label className="block text-text-neutral-50 mb-1 text-small font-bold">
        {label}
      </label>
      <select
        name="role"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={clsx(
          "w-full px-3 py-2 text-medium font-regular text-text-neutral-50",
          "border rounded transition-all duration-200",
          "bg-surface-light-10",
          "hover:bg-surface-light-30",
          "focus:outline-none focus:border-surface-dark-50 focus:bg-surface-light-10",
          "active:outline-none active:bg-surface-light-40",
          "disabled:text-text-neutral-30",
          "placeholder:text-text-neutral-30",
          "disabled:bg-surface-light-20"
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export { SelectField }
