'use client';

import React, { useRef, useState } from 'react';
import FloorplanMapBase, { MapHandle } from './FloorplanMapBase.client';
import { updatePOI, deletePOI, type POI } from '@/lib/clients/poisClient';
import { GenericForm } from '@/lib/components/ui/GenericForm';
import { POIFields } from '@/features/poi/formConfig';
import {
  listPOISensorByPOIId,
  type POISensor
} from '@/lib/clients/poiSensorsClient';
import { listSensorDataByPOISensorId } from '@/lib/clients/sensorDataClient';

export default function FloorplanPOIViewer({
  floorplanId,
  imageUrl,
  imageAspect = 0.405,
}: {
  floorplanId: number;
  imageUrl: string;
  imageAspect?: number;
}) {
  const mapRef = useRef<MapHandle>(null);

  const [selected, setSelected] = useState<POI | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [sensors, setSensors] = useState<POISensor[]>([]);
  const [sensorData, setSensorData] = useState<Record<number, any[]>>({});

  return (
    <div className="relative h-full w-full">

      <FloorplanMapBase
        ref={mapRef}
        floorplanId={floorplanId}
        imageUrl={imageUrl}
        imageAspect={imageAspect}
        mode="view"
        onPOIClick={async poi => {
          setSelected(poi);
          setEditMode(false);

          const sensorList = await listPOISensorByPOIId(poi.id);
          setSensors(sensorList);

          const dataMap: Record<number, any[]> = {};
          for (const s of sensorList)
            dataMap[s.id] = await listSensorDataByPOISensorId(s.id);
          setSensorData(dataMap);
        }}
      />

      {/* ======== SIDE PANEL ========== */}
      {selected && (
        <aside className="absolute right-4 top-4 z-20 w-96 bg-white border rounded shadow-lg p-4">

          {!editMode ? (
            <>
              <h3 className="text-lg font-semibold">POI details</h3>

              <dl className="mt-3 grid grid-cols-1 gap-1 text-sm">
                <div><dt className="text-gray-500">Naam</dt><dd>{selected.name}</dd></div>
                <div><dt className="text-gray-500">Type</dt><dd>{selected.type}</dd></div>
                <div><dt className="text-gray-500">Beschrijving</dt><dd>{selected.description}</dd></div>
                <div><dt className="text-gray-500">X</dt><dd>{selected.coordx}</dd></div>
                <div><dt className="text-gray-500">Y</dt><dd>{selected.coordy}</dd></div>
              </dl>

              <h3 className="mt-4 font-semibold">Sensoren</h3>

              {sensors.length === 0 && (
                <p className="text-sm text-gray-500">Geen sensoren gekoppeld.</p>
              )}

              {sensors.length > 0 && (
                <ul className="mt-2 space-y-3">
                  {sensors.map(sensor => (
                    <li key={sensor.id} className="p-3 border rounded">
                      <h4 className="font-medium">{sensor.name}</h4>
                      <p className="text-sm text-gray-500">Type: {sensor.type}</p>

                      <details className="mt-2 cursor-pointer">
                        <summary className="text-blue-600">Sensor data</summary>

                        {sensorData[sensor.id]?.length ? (
                          <ul className="mt-2 text-sm space-y-1">
                            {sensorData[sensor.id].map((d, i) => (
                              <li key={i} className="p-2 border rounded">
                                <div><strong>Laatste:</strong> {new Date(d.lastComDate).toLocaleString()}</div>
                                <div><strong>Status:</strong> {d.status ? "Actief" : "Offline"}</div>
                                <div><strong>Batterij:</strong> {d.battery}%</div>
                                <div><strong>Temperatuur:</strong> {d.temperature}°C</div>
                                <div><strong>Geluid:</strong> {d.noise} dB</div>
                                <div><strong>Licht:</strong> {d.light} lx</div>
                                <div><strong>CO₂:</strong> {d.co2} ppm</div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm mt-2 text-gray-500">Geen data.</p>
                        )}
                      </details>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 flex gap-2">
                <button className="border px-3 py-1 rounded" onClick={() => setEditMode(true)}>
                  Bewerken
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={async () => {
                    if (!confirm('Verwijderen?')) return;
                    await deletePOI(String(selected.id));
                    await mapRef.current?.reloadPois();
                    setSelected(null);
                  }}
                >
                  Verwijderen
                </button>
                <button className="border px-3 py-1 rounded" onClick={() => setSelected(null)}>
                  Sluiten
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold">POI bewerken</h3>

              <GenericForm
                mode="edit"
                fields={POIFields}
                initial={selected}
                onSubmit={async payload => {
                  const updated = await updatePOI(String(selected!.id), payload);
                  await mapRef.current?.reloadPois();
                  setSelected(updated);
                  setEditMode(false);
                }}
              />

              <div className="mt-2">
                <button className="border px-3 py-1 rounded" onClick={() => setEditMode(false)}>
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
