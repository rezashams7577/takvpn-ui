"use client";

import type { ChangeEvent } from "react";

export type FormSelectOption = {
  value: string;
  label: string;
};

export type FormSelectProps = {
  label: string;
  name: string;
  options: FormSelectOption[];
  required?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  id?: string;
};

export function FormSelect({
  label,
  name,
  options,
  required,
  defaultValue,
  value,
  onChange,
  id,
}: FormSelectProps) {
  const fieldId = id ?? name;
  return (
    <div className="admin-field">
      <label htmlFor={fieldId} className="admin-field-label">
        {label}
      </label>
      <select
        id={fieldId}
        name={name}
        required={required}
        defaultValue={value === undefined ? defaultValue : undefined}
        value={value}
        onChange={onChange}
        className="admin-select w-full"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
