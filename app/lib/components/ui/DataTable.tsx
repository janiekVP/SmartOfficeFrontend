'use client';

import React from 'react';

export type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
};

type Props<T> = {
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string | number;
  actions?: (row: T) => React.ReactNode;
};

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  actions,
}: Props<T>) {
  if (!rows.length) {
    return <p className="text-gray-600">Geen data beschikbaar.</p>;
  }

  return (
    <table className="min-w-full border">
      <thead>
        <tr className="bg-gray-50">
          {columns.map((c) => (
            <th key={String(c.key)} className="p-2 text-left">
              {c.header}
            </th>
          ))}
          {actions && <th className="p-2">Acties</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={getRowId(row)} className="border-t">
            {columns.map((c) => (
              <td key={String(c.key)} className="p-2">
                {c.render
                  ? c.render(row)
                  : String((row as any)[c.key])}
              </td>
            ))}
            {actions && <td className="p-2">{actions(row)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
