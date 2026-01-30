'use client';

import React, { useRef, useState, useEffect } from 'react';
import FloorplanMapBase, { MapHandle } from './FloorplanMapBase.client';
import { GenericForm } from '@/lib/components/ui/GenericForm';
import { POIFields } from '@/features/poi/formConfig';
import {
  listPOIByFloorplanId,
  createPOI,
  updatePOI,
  deletePOI,
  type POI,
} from '@/lib/clients/poisClient';

export default function FloorplanWithPOICrud({
  floorplanId,
  imageUrl,
  imageAspect = 0.405,
}: {
  floorplanId: number;
  imageUrl: string;
  imageAspect?: number;
}) {
  const mapRef = useRef<MapHandle>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [mode, setMode] = useState<'view' | 'create' | 'edit'>('create');
  const [formInitial, setFormInitial] = useState<Partial<POI>>();
  const [previewCoords, setPreviewCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    listPOIByFloorplanId(floorplanId).then(console.log);
  }, [floorplanId]);

  const close = () => {
    setFormOpen(false);
    setMode('create');
    setPreviewCoords(null);
    setFormInitial(undefined);
  };

  const handleCreate = async (payload: any) => {
    if (!previewCoords) return;
    const [nx, ny] = previewCoords;

    await createPOI({
      floorplanid: floorplanId,
      name: payload.name,
      type: payload.type,
      description: payload.description ?? '',
      coordx: nx,
      coordy: ny,
    });

    await mapRef.current?.reloadPois();
    close();
  };

  const handleEdit = async (id: number, payload: any) => {
    const updated = await updatePOI(String(id), {
      name: payload.name,
      type: payload.type,
      description: payload.description ?? '',
      coordx: Number(payload.coordx),
      coordy: Number(payload.coordy),
    });

    await mapRef.current?.reloadPois();
    setFormInitial(updated);
    setMode('view');
  };

  const handleDeletePOI = async (id: number) => {
    await deletePOI(String(id));
    await mapRef.current?.reloadPois();
    close();
  };

  return (
    <div className="relative h-full w-full">

      <FloorplanMapBase
        ref={mapRef}
        floorplanId={floorplanId}
        imageUrl={imageUrl}
        imageAspect={imageAspect}
        mode="create"
        previewCoords={previewCoords}
        previewDraggable={true}
        onPreviewDragEnd={(nx, ny) => {
          setPreviewCoords([nx, ny]);
          setFormInitial(prev => ({ ...prev, coordx: nx, coordy: ny }));
        }}
        onMapClick={(nx, ny) => {
          setMode('create');
          setPreviewCoords([nx, ny]);
          setFormInitial({
            floorplanid: floorplanId,
            coordx: nx,
            coordy: ny,
            name: '',
            type: '',
            description: '',
          });
          setFormOpen(true);
        }}
        onPOIClick={poi => {
          setPreviewCoords(null);
          setMode('view');
          setFormInitial({ ...poi });
          setFormOpen(true);
        }}
      />

      {formOpen && (
        <aside className="absolute right-4 top-4 z-20 w-96 bg-white border rounded p-4 shadow-lg">
          <h3 className="text-lg font-semibold">
            {mode === 'create'
              ? 'Nieuwe POI'
              : mode === 'edit'
              ? 'POI bewerken'
              : 'POI details'}
          </h3>

          {mode === 'view' && formInitial && (
            <div className="mt-3 grid gap-2 text-sm">
              <div><strong>Naam:</strong> {formInitial.name}</div>
              <div><strong>Type:</strong> {formInitial.type}</div>
              <div><strong>Beschrijving:</strong> {formInitial.description}</div>
              <div><strong>X:</strong> {formInitial.coordx}</div>
              <div><strong>Y:</strong> {formInitial.coordy}</div>

              <div className="mt-3 flex gap-2">
                <button className="border px-3 py-1 rounded" onClick={() => setMode('edit')}>Bewerken</button>
                <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => handleDeletePOI(formInitial.id!)}>Verwijderen</button>
                <button className="border px-3 py-1 rounded" onClick={close}>Sluiten</button>
              </div>
            </div>
          )}

          {mode === 'edit' && formInitial && (
            <>
              <GenericForm
                mode="edit"
                fields={POIFields}
                initial={formInitial}
                onSubmit={payload => handleEdit(Number(formInitial.id), payload)}
              />
              <button className="mt-2 border px-3 py-1 rounded" onClick={() => setMode('view')}>
                Annuleer
              </button>
            </>
          )}

          {mode === 'create' && (
            <>
              <GenericForm
                mode="create"
                fields={POIFields}
                initial={formInitial}
                onSubmit={handleCreate}
              />
              <button className="mt-2 border px-3 py-1 rounded" onClick={close}>Annuleer</button>
            </>
          )}
        </aside>
      )}

    </div>
  );
}
