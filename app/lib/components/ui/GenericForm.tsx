
'use client';

import React, { useState } from 'react';

export type FieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'checkbox'
  | 'select'
  | 'datetime'
  | 'file';

export type FieldOption = { label: string; value: string };

export type FormField<T> = {
  name: keyof T & string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
  step?: number;
  min?: number;
  max?: number;

  parse?: (raw: unknown) => unknown;

  format?: (val: unknown) => string | number | boolean;
};

export type GenericFormProps<T> = {
  mode?: 'create' | 'edit';
  fields: FormField<T>[];
  initial?: Partial<T>;
  onSubmit: (payload: Partial<T>) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
};

function asBoolean(val: unknown): boolean {
  return typeof val === 'boolean' ? val : Boolean(val);
}

function asTextValue(val: unknown): string {
  if (typeof val === 'string') return val;
  if (val == null) return '';
  return String(val);
}

function asNumberInputValue(val: unknown): string | number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return val;
  return '';
}

function formatDateTimeLocal(val: unknown): string {
  if (typeof val !== 'string' || !val) return '';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    `${d.getFullYear()}-` +
    `${pad(d.getMonth() + 1)}-` +
    `${pad(d.getDate())}T` +
    `${pad(d.getHours())}:` +
    `${pad(d.getMinutes())}`
  );
}

function parseDateTimeLocal(raw: string): string | undefined {
  if (!raw) return undefined;

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return undefined;

  return d.toISOString();
}

function defaultParse(raw: unknown, type: FieldType): unknown {
  switch (type) {
    case 'datetime':
      return typeof raw === 'string' ? parseDateTimeLocal(raw) : undefined;

    case 'checkbox':
      return Boolean(raw);

    case 'number':
      if (typeof raw === 'string') {
        const t = raw.trim();
        if (t === '') return undefined;
        const n = Number(t);
        return Number.isNaN(n) ? undefined : n;
      }
      return undefined;

    case 'file':
      return raw instanceof File ? raw : undefined;

    case 'text':
    case 'textarea':
    case 'select':
      return typeof raw === 'string' ? raw : String(raw);

    default:
      return raw;
  }
}

function defaultFormat(val: unknown, type: FieldType): string | number | boolean {
  switch (type) {
    case 'datetime':
      return formatDateTimeLocal(val);

    case 'checkbox':
      return typeof val === 'boolean' ? val : Boolean(val);

    case 'number':
      return typeof val === 'number' ? val : '';

    case 'file':
      return '';

    case 'text':
    case 'textarea':
    case 'select':
      return typeof val === 'string' ? val : '';

    default:
      return '';
  }
}

export function GenericForm<T>({
  mode = 'create',
  fields,
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: GenericFormProps<T>) {
  const [model, setModel] = useState<Partial<T>>(initial ?? {});
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const update = (field: FormField<T>, raw: unknown) => {
    const value = field.parse ? field.parse(raw) : defaultParse(raw, field.type);
    setModel((prev) => ({ ...prev, [field.name]: value as any }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field.name];
      return next;
    });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    for (const f of fields) {
      if (!f.required) continue;
      const val = model[f.name];
      switch (f.type) {
        case 'checkbox':
          if (val !== true) errs[f.name] = `"${f.label}" moet aangevinkt zijn.`;
          break;

        case 'number':
          if (val === undefined || val === null || Number.isNaN(val as any)) {
            errs[f.name] = `"${f.label}" is verplicht.`;
          }
          break;

        case 'file':
          if (!(val instanceof File)) {
            errs[f.name] = `"${f.label}" is verplicht.`;
          }
          break;

        case 'text':
        case 'textarea':
        case 'select':
          if (typeof val !== 'string' || val.trim() === '') {
            errs[f.name] = `"${f.label}" is verplicht.`;
          }
          break;

        case 'datetime':
        default:
          if (val == null) errs[f.name] = `"${f.label}" is verplicht.`;
          break;
      }
    }
    setFieldErrors(errs);
    setFormError(Object.keys(errs).length ? 'Controleer de invoer.' : null);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!validate()) return;

    try {
      await onSubmit(model);
    } catch (err) {
      setFormError((err as Error)?.message ?? 'Onbekende fout bij opslaan.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {fields.map((f) => {
        const formatted = f.format
          ? f.format(model[f.name] as unknown)
          : defaultFormat(model[f.name] as unknown, f.type);

        const val = model[f.name] as unknown;

        return (
          <div key={f.name}>
            <label className="block text-sm font-medium">
              {f.label} {f.required && <span className="text-red-600">*</span>}
            </label>

            {f.type === 'checkbox' && (
              <input
                type="checkbox"
                checked={formatted as boolean}
                onChange={(e) => update(f, e.currentTarget.checked)}
                className="mt-1"
              />
            )}

            {f.type === 'number' && (
              <input
                type="number"
                value={formatted as string | number}
                onChange={(e) => update(f, e.currentTarget.value)}
                className="mt-1 w-full rounded border p-2"
                placeholder={f.placeholder}
                step={f.step}
                min={f.min}
                max={f.max}
              />
            )}

            {f.type === 'text' && (
              <input
                type="text"
                value={formatted as string}
                onChange={(e) => update(f, e.currentTarget.value)}
                className="mt-1 w-full rounded border p-2"
                placeholder={f.placeholder}
              />
            )}

            {f.type === 'textarea' && (
              <textarea
                value={formatted as string}
                onChange={(e) => update(f, e.currentTarget.value)}
                className="mt-1 w-full rounded border p-2"
                rows={3}
                placeholder={f.placeholder}
              />
            )}

            {f.type === 'select' && (
              <select
                value={formatted as string}
                onChange={(e) => update(f, e.currentTarget.value)}
                className="mt-1 w-full rounded border p-2"
              >
                <option value="">Selecteer…</option>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}

            {f.type === 'datetime' && (
              <input
                type="datetime-local"
                value={formatted as string}
                onChange={(e) => update(f, e.currentTarget.value)}
                className="mt-1 w-full rounded border p-2"
              />
            )}

            {f.type === 'file' && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0];
                    update(f, file ?? undefined);
                  }}
                  className="mt-1 w-full rounded border p-2"
                />
                {val instanceof File && val.type.startsWith('image/') && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(val)}
                      alt="Preview"
                      className="max-w-full rounded border"
                    />
                  </div>
                )}
              </>
            )}

            {fieldErrors[f.name] && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors[f.name]}</p>
            )}
          </div>
        );
      })}

      {formError && <p className="text-red-600">{formError}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          {submitLabel ?? (mode === 'create' ? 'Aanmaken' : 'Opslaan')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border px-4 py-2"
          >
            Annuleren
          </button>
        )}
      </div>
    </form>
  );
}
