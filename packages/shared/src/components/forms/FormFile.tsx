"use client";

export type FormFileProps = {
  label: string;
  name: string;
  required?: boolean;
  accept?: string;
  id?: string;
};

export function FormFile({ label, name, required, accept, id }: FormFileProps) {
  const fieldId = id ?? name;
  return (
    <div className="admin-field">
      <label htmlFor={fieldId} className="admin-field-label">
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
        type="file"
        required={required}
        accept={accept}
        className="admin-field-control admin-field-file"
      />
    </div>
  );
}
