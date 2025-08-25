import React, {
  HTMLInputAutoCompleteAttribute,
  HTMLInputTypeAttribute,
  useRef,
} from "react";
import styles from "./text-field.module.scss";
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
  return (
    <div className={styles.container}>
      {label && (
        <label
          className={clsx(styles.label, styles[status])}
          htmlFor={name}
        >
          {label}
        </label>
      )}
      <div className={clsx(styles.inputContainer, className)}>
        {!!LeftIcon && (
          <button
            type="button"
            onClick={focusOnInput}
            className={styles.iconLeft}
          >
            <LeftIcon data-testid="left-icon" />
          </button>
        )}
        {!!RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className={styles.iconRight}
          >
            <RightIcon data-testid="right-icon" />
          </button>
        )}
        <input
          aria-label={name}
          className={clsx(
            styles.inputStyle,
            styles[status],
            {
              [styles.disableResize]: disableResize,
            },
            LeftIcon ? styles.withPaddingLeft : "",
            RightIcon ? styles.withPaddingRight : "",
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
        <div className={clsx(styles.helperText, styles[status])}>
          {HelperIcon && (
            <div className={clsx(styles.helperIcon, styles[status])}>
              <HelperIcon data-testid="helper-icon" />
            </div>
          )}
          <span>{helperText}</span>
        </div>
      )}
    </div>
  );
};
