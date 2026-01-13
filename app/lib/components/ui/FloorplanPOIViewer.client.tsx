'use client';

import React, { useRef, useState } from 'react';
import FloorplanMapBase, { MapHandle } from './FloorplanMapBase.client';
import { updatePOI, deletePOI, type POI } from '@/lib/clients/poisClient';
import { GenericForm } from '@/lib/components/ui/GenericForm';
import { POIFields } from '@/features/poi/formConfig';

export default function FloorplanPOIViewer({ floorplanId }: { floorplanId: number }) {
  const mapRef = useRef<MapHandle>(null);
  const [selected, setSelected] = useState<POI | null>(null);
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="relative h-full w-full">
      <FloorplanMapBase
        ref={mapRef}
        floorplanId={floorplanId}
        mode="view"
        onPOIClick={(poi) => {
          setSelected(poi);
          setEditMode(false);
        }}
      />

      {selected && (
        <aside className="absolute right-4 top-4 z-10 w-96 rounded border border-gray-200 bg-white p-4 shadow-lg">
          {!editMode ? (
            <>
              <h3 className="m-0 text-lg font-semibold">POI details</h3>
              <dl className="mt-3 grid grid-cols-1 gap-1 text-sm">
                <div><dt className="text-gray-500">Naam</dt><dd className="text-base">{selected.name}</dd></div>
                <div><dt className="text-gray-500">Type</dt><dd className="text-base">{selected.type}</dd></div>
                <div><dt className="text-gray-500">Beschrijving</dt><dd className="text-base">{selected.description}</dd></div>
                <div><dt className="text-gray-500">FloorplanId</dt><dd className="text-base">{selected.floorplanid}</dd></div>
                <div><dt className="text-gray-500">Lng</dt><dd className="text-base">{selected.coordx}</dd></div>
                <div><dt className="text-gray-500">Lat</dt><dd className="text-base">{selected.coordy}</dd></div>
              </dl>

              <div className="mt-4 flex gap-2">
                <button
                  className="rounded border px-3 py-1"
                  onClick={() => setEditMode(true)}
                >
                  Bewerken
                </button>
                <button
                  className="rounded bg-red-600 px-3 py-1 text-white"
                  onClick={async () => {
                    if (!selected) return;
                    if (!confirm('Weet je zeker dat je wilt verwijderen?')) return;
                    await deletePOI(String(selected.id));
                    await mapRef.current?.reloadPois();
                    setSelected(null);
                  }}
                >
                  Verwijderen
                </button>
                <button
                  className="rounded border px-3 py-1"
                  onClick={() => setSelected(null)}
                >
                  Sluiten
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="m-0 text-lg font-semibold">POI bewerken</h3>
              <GenericForm
                mode="edit"
                fields={POIFields}
                initial={selected}
                onSubmit={async (payload) => {
                  const id = String(selected!.id);
                  const updated = await updatePOI(id, payload);
                  await mapRef.current?.reloadPois();
                  // paneel terug naar view, met geüpdatete waarden
                  setSelected({
                    ...selected!,
                    ...payload,
                    // fallback: neem waarden uit updated als jouw API camelCase terugstuurt
                    name: (payload as any).name ?? (updated as any).name,
                    type: (payload as any).type ?? (updated as any).type,
                    description: (payload as any).description ?? (updated as any).description,
                    coordx: (payload as any).coordx ?? (updated as any).coordx ?? (updated as any).coordX,
                    coordy: (payload as any).coordy ?? (updated as any).coordy ?? (updated as any).coordY,
                  });
                  setEditMode(false);
                }}
              />

              <div className="mt-2 flex gap-2">
                <button className="rounded border px-3 py-1" onClick={() => setEditMode(false)}>
                  Annuleer
                </button>
              </div>
            </>
          )}
        </aside>
      )}
    </div>
  );
}
