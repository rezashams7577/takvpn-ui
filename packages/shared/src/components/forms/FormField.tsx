"use client";

import type { ChangeEvent } from "react";

const controlClass = "admin-field-control";

export type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
  step?: string;
  min?: string | number;
  minLength?: number;
  inputMode?: HTMLInputElement["inputMode"];
  multiline?: boolean;
  id?: string;
};

export function FormField({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  value,
  onChange,
  placeholder,
  dir,
  step,
  min,
  minLength,
  inputMode,
  multiline,
  id,
}: FormFieldProps) {
  const fieldId = id ?? name;
  const shared = {
    id: fieldId,
    name,
    required,
    placeholder,
    dir,
    className: controlClass,
  };

  return (
    <div className="admin-field">
      <label htmlFor={fieldId} className="admin-field-label">
        {label}
      </label>
      {multiline ? (
        <textarea
          {...shared}
          defaultValue={value === undefined ? defaultValue : undefined}
          value={value}
          onChange={onChange}
          rows={3}
        />
      ) : (
        <input
          {...shared}
          type={type}
          defaultValue={value === undefined ? defaultValue : undefined}
          value={value}
          onChange={onChange}
          step={step}
          min={min}
          minLength={minLength}
          inputMode={inputMode}
        />
      )}
    </div>
  );
}

export { controlClass as formControlClassName };
