import React, {
  HTMLInputAutoCompleteAttribute,
  HTMLInputTypeAttribute,
  useRef,
} from "react";
import clsx from "clsx";

export enum TextFieldStatus {
  default = "default",
  error = "error",
  success = "success",
}

export interface TextFieldProps {
  className?: string;
  disabled?: boolean;
  helperIcon?: React.FunctionComponent;
  helperText?: string;
  label?: string;
  leftIcon?: React.FunctionComponent;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRightIconClick?: () => void;
  placeholder?: string;
  rightIcon?: React.FunctionComponent;
  status?: TextFieldStatus;
  type?: HTMLInputTypeAttribute;
  disableResize?: boolean;
  value?: string;
  autoComplete?: HTMLInputAutoCompleteAttribute;
  maxLength?: number;
  minLength?: number;
}

export const TextField = ({
  className = "",
  disabled = false,
  helperIcon,
  helperText,
  label,
  leftIcon,
  name,
  onChange,
  onRightIconClick,
  placeholder,
  rightIcon,
  status = TextFieldStatus.default,
  type = "text",
  disableResize = false,
  value,
  autoComplete,
  maxLength,
  minLength,
}: TextFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const focusOnInput = () => {
    if (inputRef && inputRef.current) inputRef.current.focus();
  };
  const LeftIcon = leftIcon;
  const RightIcon = rightIcon;
  const HelperIcon = helperIcon;

  const getStatusColors = (status: TextFieldStatus) => {
    switch (status) {
      case TextFieldStatus.error:
        return {
          label: "text-accent-danger-40",
          border: "border-accent-danger-40",
          text: "text-accent-danger-40",
          icon: "text-accent-danger-40",
        };
      case TextFieldStatus.success:
        return {
          label: "text-accent-success-40",
          border: "border-accent-success-40",
          text: "text-accent-success-40",
          icon: "text-accent-success-40",
        };
      default:
        return {
          label: "text-text-neutral-50",
          border: "border-surface-light-50",
          text: "text-text-neutral-50",
          icon: "text-text-neutral-30",
        };
    }
  };

  const statusColors = getStatusColors(status);

  return (
    <div className="w-full relative">
      {label && (
        <label
          className={clsx(
            "mb-1 text-small font-bold",
            statusColors.label
          )}
          htmlFor={name}
        >
          {label}
        </label>
      )}
      <div className={clsx("relative w-full flex", className)}>
        {!!LeftIcon && (
          <button
            type="button"
            onClick={focusOnInput}
            className={clsx(
              "absolute h-full ml-3 flex items-center transition-all duration-300 cursor-text",
              statusColors.icon
            )}
          >
            <LeftIcon data-testid="left-icon" />
          </button>
        )}
        {!!RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className={clsx(
              "absolute right-3 h-full flex items-center transition-all duration-300",
              statusColors.icon
            )}
          >
            <RightIcon data-testid="right-icon" />
          </button>
        )}
        <input
          aria-label={name}
          className={clsx(
            "w-full px-3 py-2 text-medium font-regular",
            "border rounded transition-all duration-200",
            "bg-surface-light-10",
            statusColors.text,
            statusColors.border,
            {
              "resize-none": disableResize,
              "pl-12": LeftIcon,
              "pr-12": RightIcon,
            },
            "hover:bg-surface-light-30",
            "focus:outline-none focus:border-surface-dark-50 focus:bg-surface-light-10",
            "active:outline-none active:bg-surface-light-40",
            "disabled:text-text-neutral-30",
            "placeholder:text-text-neutral-30",
            "disabled:bg-surface-light-20"
          )}
          data-testid="input"
          disabled={disabled}
          id={name}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          ref={inputRef}
          type={type}
          value={value}
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={maxLength}
        />
      </div>
      {helperText && (
        <div className={clsx(
          "flex items-center absolute",
          statusColors.text
        )}>
          {HelperIcon && (
            <div className={clsx(
              "flex w-4 mr-1",
              statusColors.text
            )}>
              <HelperIcon data-testid="helper-icon" />
            </div>
          )}
          <span>{helperText}</span>
        </div>
      )}
    </div>
  );
};
