'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import type { FeatureCollection, Point } from 'geojson';
import { GenericForm } from '@/lib/components/ui/GenericForm';
import { POIFields } from '@/features/poi/formConfig';
import {
  listPOI,
  createPOI,
  updatePOI,
  deletePOI,
  type POI
} from '@/lib/clients/poisClient';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? 'YOUR_MAPBOX_TOKEN';

const DEFAULT_CORNERS: [
  [number, number], [number, number], [number, number], [number, number]
] = [
  [4.894, 52.371], // top-left
  [4.896, 52.371], // top-right
  [4.896, 52.369], // bottom-right
  [4.894, 52.369], // bottom-left
];

type Props = {
  floorplanId: number;
  imageUrl?: string;
  imageCorners?: [ [number, number], [number, number], [number, number], [number, number] ];
};

export default function FloorplanWithPOICrud({
  floorplanId,
  imageUrl = '/floorplan.png',
  imageCorners,
}: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [pois, setPois] = useState<POI[]>([]);
  const [fc, setFc] = useState<FeatureCollection<Point>>({
    type: 'FeatureCollection',
    features: []
  });

  // --- Paneel/preview state ---
  const [formOpen, setFormOpen] = useState(false);
  const [modeInPanel, setModeInPanel] = useState<'view' | 'edit' | 'create'>('create'); // ⬅️ nieuw
  const [formInitial, setFormInitial] = useState<Partial<POI> | undefined>(undefined);

  const previewMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [previewCoords, setPreviewCoords] = useState<[number, number] | null>(null);

  // Handlers refs voor cleanup
  const onCircleClickRef = useRef<((e: mapboxgl.MapLayerMouseEvent) => void) | null>(null);
  const onCircleMoveRef  = useRef<((e: mapboxgl.MapLayerMouseEvent) => void) | null>(null);
  const onMapClickRef    = useRef<((e: mapboxgl.MapMouseEvent) => void) | null>(null);

  const corners = useMemo(() => imageCorners ?? DEFAULT_CORNERS, [imageCorners]);

  // --- Helpers voor normalisatie van API keys ---
  const getFloorId = (p: any) =>
    Number(p.floorplanid ?? p.floorplanId ?? p.FloorplanId);

  const getCoordX = (p: any) =>
    Number(p.coordx ?? p.coordX ?? p.CoordX ?? p.lng ?? p.longitude);

  const getCoordY = (p: any) =>
    Number(p.coordy ?? p.coordY ?? p.CoordY ?? p.lat ?? p.latitude);

  const getName = (p: any) =>
    (p.name ?? p.Name ?? '').toString();

  const getType = (p: any) =>
    (p.type ?? p.Type ?? '').toString();

  const getDescription = (p: any) =>
    (p.description ?? p.Description ?? '').toString();

  const typeColor = (t?: string) => {
    switch (t) {
      case 'meeting': return '#2b8a3e';
      case 'coffee':  return '#f59f00';
      default:        return '#0d6efd';
    }
  };

  const poisToFC = (
    list: POI[],
    floorId: number
  ): FeatureCollection<Point> => {
    const floorIdNum = Number(floorId);
    const filtered = list.filter(p => getFloorId(p) === floorIdNum);

    return {
      type: 'FeatureCollection',
      features: filtered
        .map(p => {
          const x = getCoordX(p);
          const y = getCoordY(p);
          if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
          return {
            type: 'Feature',
            id: p.id,
            geometry: { type: 'Point', coordinates: [x, y] },
            properties: {
              name: getName(p),
              type: getType(p),
              description: getDescription(p),
              floorplanid: getFloorId(p)
            }
          } as const;
        })
        .filter(Boolean) as any
    };
  };

  function updatePoisSource(map: mapboxgl.Map | null, data: FeatureCollection<Point>) {
    if (!map) return;
    const src = map.getSource('pois') as mapboxgl.GeoJSONSource | undefined;
    if (!src) {
      setTimeout(() => {
        const src2 = map?.getSource('pois') as mapboxgl.GeoJSONSource | undefined;
        src2?.setData(data);
      }, 0);
      return;
    }
    src.setData(data);
  }

  // ---------- INIT (eenmalig) ----------
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: { version: 8, sources: {}, layers: [] },
      center: [4.895168, 52.370216],
      zoom: 18,
      pitch: 0,
      bearing: 0
    });
    mapRef.current = map;

    const onLoad = async () => {
      map.addSource('floorplan', { type: 'image', url: imageUrl, coordinates: corners });
      map.addLayer({ id: 'floorplan-layer', type: 'raster', source: 'floorplan', paint: { 'raster-opacity': 0.85 } });

      map.addSource('pois', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'poi-circles',
        type: 'circle',
        source: 'pois',
        paint: {
          'circle-radius': 6,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-color': [
            'match', ['get', 'type'],
            'meeting', typeColor('meeting'),
            'coffee',  typeColor('coffee'),
            /* default */ typeColor()
          ],
          'circle-opacity': 1
        }
      });
      try { map.moveLayer('poi-circles'); } catch {}

      // --- Klik op bestaande marker → detailpaneel (view) ---
      const onCircleClick = (e: mapboxgl.MapLayerMouseEvent) => {
        const f = e.features?.[0];
        if (!f) return;
        const id = f.id as number;
        const props = f.properties as any;
        const [lng, lat] = (f.geometry as any).coordinates as [number, number];

        // Preview (van create) weghalen
        if (previewMarkerRef.current) {
          previewMarkerRef.current.remove();
          previewMarkerRef.current = null;
          setPreviewCoords(null);
        }

        // Vul paneel met data (view-mode)
        setModeInPanel('view');
        setFormInitial({
          id,
          floorplanid: props.floorplanid,
          name: props.name,
          type: props.type,
          description: props.description,
          coordx: lng,
          coordy: lat
        });
        setFormOpen(true);
      };

      const onCircleMove = (e: mapboxgl.MapLayerMouseEvent) => {
        map.getCanvas().style.cursor = e.features?.length ? 'pointer' : '';
      };

      // --- Klik op lege kaart → create (preview + formulier) ---
      const onMapClick = (e: mapboxgl.MapMouseEvent) => {
        const lng = Number(e.lngLat.lng.toFixed(6));
        const lat = Number(e.lngLat.lat.toFixed(6));

        const el = document.createElement('div');
        el.style.width = '36px';
        el.style.height = '36px';
        el.style.borderRadius = '50%';
        el.style.border = '3px dashed #0d6efd';
        el.style.background = '#cfe2ff';
        el.style.boxShadow = '0 0 0 2px rgba(13,110,253,.2)';

        if (previewMarkerRef.current) {
          previewMarkerRef.current.remove();
          previewMarkerRef.current = null;
        }

        previewMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center', draggable: true })
          .setLngLat([lng, lat])
          .addTo(mapRef.current!);

        setPreviewCoords([lng, lat]);

        previewMarkerRef.current.on('dragend', () => {
          const pos = previewMarkerRef.current!.getLngLat();
          setPreviewCoords([Number(pos.lng.toFixed(6)), Number(pos.lat.toFixed(6))]);
        });

        setModeInPanel('create');
        setFormInitial({
          floorplanid: floorplanId,
          name: '',
          type: '',
          description: '',
          coordx: lng,
          coordy: lat
        });
        setFormOpen(true);
      };

      onCircleClickRef.current = onCircleClick;
      onCircleMoveRef.current  = onCircleMove;
      onMapClickRef.current    = onMapClick;

      map.on('click', 'poi-circles', onCircleClick);
      map.on('mousemove', 'poi-circles', onCircleMove);
      map.on('click', onMapClick);

      // Data laden
      const all = await listPOI();
      setPois(all);
      const nextFc = poisToFC(all, floorplanId);
      setFc(nextFc);
      updatePoisSource(mapRef.current, nextFc);
    };

    map.on('load', onLoad);

    return () => {
      if (onCircleClickRef.current) { try { map.off('click', 'poi-circles', onCircleClickRef.current); } catch {} }
      if (onCircleMoveRef.current)  { try { map.off('mousemove', 'poi-circles', onCircleMoveRef.current); } catch {} }
      if (onMapClickRef.current)    { try { map.off('click', onMapClickRef.current); } catch {} }
      onCircleClickRef.current = null;
      onCircleMoveRef.current  = null;
      onMapClickRef.current    = null;

      if (previewMarkerRef.current) { previewMarkerRef.current.remove(); previewMarkerRef.current = null; }
      if (map.getLayer('poi-circles')) map.removeLayer('poi-circles');
      if (map.getSource('pois'))      map.removeSource('pois');
      if (map.getLayer('floorplan-layer')) map.removeLayer('floorplan-layer');
      if (map.getSource('floorplan'))      map.removeSource('floorplan');

      map.remove();
      mapRef.current = null;
    };
  }, []);

  // POI’s/floorplanId wijzigen → update GeoJSON bron
  useEffect(() => {
    if (!mapRef.current) return;
    const nextFc = poisToFC(pois, floorplanId);
    setFc(nextFc);
    updatePoisSource(mapRef.current, nextFc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pois, floorplanId]);

  // Bij routewissel → herladen uit backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      const all = await listPOI();
      if (mounted) setPois(all);
    })();
    return () => { mounted = false; };
  }, [floorplanId]);

  // --- Paneel acties ---
  const closePanelAndRemovePreview = () => {
    setFormOpen(false);
    setModeInPanel('create');
    if (previewMarkerRef.current) {
      previewMarkerRef.current.remove();
      previewMarkerRef.current = null;
    }
    setPreviewCoords(null);
  };

  const handleCreateSubmit = async (payload: any) => {
    const [lng, lat] = previewCoords ?? [payload.coordx, payload.coordy];
    const finalPayload: Omit<POI, 'id'> = {
      floorplanid: floorplanId,
      name: payload.name,
      type: payload.type,
      description: payload.description ?? '',
      coordx: Number(lng),
      coordy: Number(lat),
    };

    const created = await createPOI(finalPayload);

    setPois(prev => {
      const next = [...prev, created];
      const nextFc = poisToFC(next, floorplanId);
      setFc(nextFc);
      updatePoisSource(mapRef.current, nextFc);
      return next;
    });

    closePanelAndRemovePreview();
  };

  const handleEditSubmit = async (id: number, payload: any) => {
    const patch: Partial<POI> = {
      name: payload.name,
      type: payload.type,
      description: payload.description ?? '',
      coordx: Number(payload.coordx),
      coordy: Number(payload.coordy),
    };
    const updated = await updatePOI(String(id), patch);

    setPois(prev => {
      const next = prev.map(p => (p.id === id ? updated : p));
      const nextFc = poisToFC(next, floorplanId);
      setFc(nextFc);
      updatePoisSource(mapRef.current, nextFc);
      return next;
    });

    // terug naar view‑modus met geüpdatete data
    setModeInPanel('view');
    setFormInitial({
      id: updated.id,
      floorplanid: getFloorId(updated),
      name: getName(updated),
      type: getType(updated),
      description: getDescription(updated),
      coordx: getCoordX(updated),
      coordy: getCoordY(updated),
    });
  };

  const handleDelete = async (id: number) => {
    await deletePOI(String(id));
    setPois(prev => {
      const next = prev.filter(p => p.id !== id);
      const nextFc = poisToFC(next, floorplanId);
      setFc(nextFc);
      updatePoisSource(mapRef.current, nextFc);
      return next;
    });
    closePanelAndRemovePreview();
  };

  // --- Detail View component (paneel in view-modus) ---
  const DetailView = ({ poi }: { poi: Partial<POI> }) => {
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <div><strong>Naam:</strong> {poi.name}</div>
        <div><strong>Type:</strong> {poi.type}</div>
        <div><strong>Beschrijving:</strong> {poi.description}</div>
        <div><strong>FloorplanId:</strong> {poi.floorplanid}</div>
        <div><strong>Lng (coordx):</strong> {poi.coordx}</div>
        <div><strong>Lat (coordy):</strong> {poi.coordy}</div>

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            onClick={() => setModeInPanel('edit')}
            className="rounded border px-3 py-1"
          >
            Bewerken
          </button>
          {poi.id != null && (
            <button
              onClick={() => handleDelete(Number(poi.id))}
              className="rounded bg-red-600 px-3 py-1 text-white"
            >
              Verwijderen
            </button>
          )}
          <button onClick={closePanelAndRemovePreview} className="rounded border px-3 py-1">
            Sluiten
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* Paneel rechtsboven */}
      {formOpen && (
        <div style={{
          position: 'absolute', top: 12, right: 12, width: 360,
          background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,.15)', zIndex: 10, display: 'grid', gap: 8
        }}>
          <h3 style={{ margin: 0 }}>
            {modeInPanel === 'create' ? 'Nieuwe POI' : modeInPanel === 'edit' ? 'POI bewerken' : 'POI details'}
          </h3>

          {/* Create: toon preview-coords */}
          {modeInPanel === 'create' && previewCoords && (
            <div style={{ fontSize: 12, color: '#555' }}>
              Voorbeeldpositie: <strong>{previewCoords[0]}</strong>, <strong>{previewCoords[1]}</strong> (versleep de marker om te wijzigen)
            </div>
          )}

          {/* Edit-modus gebruikt jouw GenericForm */}
          {modeInPanel === 'edit' ? (
            <GenericForm
              mode="edit"
              fields={POIFields}
              initial={formInitial}
              onSubmit={async (payload) => {
                try {
                  const id = Number(formInitial?.id);
                  await handleEditSubmit(id, payload);
                } catch (err) {
                  console.error(err);
                  alert('Opslaan mislukt');
                }
              }}
            />
          ) : modeInPanel === 'create' ? (
            <GenericForm
              mode="create"
              fields={POIFields}
              initial={formInitial}
              onSubmit={async (payload) => {
                try {
                  await handleCreateSubmit(payload);
                } catch (err) {
                  console.error(err);
                  alert('Opslaan mislukt');
                }
              }}
            />
          ) : (
            // View-modus: toon details en knoppen
            <DetailView poi={formInitial ?? {}} />
          )}
        </div>
      )}

      {/* Kaart */}
      <div ref={mapContainer} className="w-full h-full border rounded-lg border-[#DEE2E6]" />
    </div>
  );
}
``