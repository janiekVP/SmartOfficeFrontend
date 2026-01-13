'use client';

import React, { useRef, useState } from 'react';
import FloorplanMapBase, { MapHandle } from './FloorplanMapBase.client';
import { createPOI, type POI } from '@/lib/clients/poisClient';
import { GenericForm } from '@/lib/components/ui/GenericForm';
import { POIFields } from '@/features/poi/formConfig';

export default function FloorplanPOICreator({ floorplanId }: { floorplanId: number }) {
  const mapRef = useRef<MapHandle>(null);
  const [previewCoords, setPreviewCoords] = useState<[number, number] | null>(null);
  const [initial, setInitial] = useState<Partial<POI> | undefined>(undefined);

  return (
    <div className="relative h-full w-full">
      <FloorplanMapBase
        ref={mapRef}
        floorplanId={floorplanId}
        mode="create"
        previewCoords={previewCoords}
        previewDraggable={true}
        onPreviewDragEnd={(lng, lat) => {
          setPreviewCoords([lng, lat]);
          setInitial(prev => ({ ...prev, coordx: lng, coordy: lat }));
        }}
        onMapClick={(lng, lat) => {
          setPreviewCoords([lng, lat]);
          setInitial({
            floorplanid: floorplanId,
            name: '',
            type: '',
            description: '',
            coordx: lng,
            coordy: lat
          });
        }}
      />

      {previewCoords && (
        <aside className="absolute right-4 top-4 z-10 w-96 rounded border border-gray-200 bg-white p-4 shadow-lg">
          <h3 className="m-0 text-lg font-semibold">Nieuwe POI</h3>
          <p className="text-xs text-gray-600">
            Gekozen locatie: <strong>{previewCoords[0]}</strong>, <strong>{previewCoords[1]}</strong> (versleep de marker om te wijzigen)
          </p>

          <GenericForm
            mode="create"
            fields={POIFields}
            initial={initial}
            onSubmit={async (payload) => {
              if (!previewCoords) return;
              const [lng, lat] = previewCoords;
              const finalPayload = {
                ...payload,
                floorplanid: floorplanId, // forceer juiste floorplan
                coordx: Number(lng),
                coordy: Number(lat),
              };
              await createPOI(finalPayload as any);
              await mapRef.current?.reloadPois();
              // reset panel + preview
              setPreviewCoords(null);
              setInitial(undefined);
            }}
          />

          <div className="mt-2 flex gap-2">
            <button
              className="rounded border px-3 py-1"
              onClick={() => { setPreviewCoords(null); setInitial(undefined); }}
            >
              Annuleer
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
