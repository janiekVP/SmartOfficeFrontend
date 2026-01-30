'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import type { FeatureCollection, Point } from 'geojson';
import {
  listPOIByFloorplanId,
  type POI
} from '@/lib/clients/poisClient';

mapboxgl.accessToken =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? 'YOUR_MAPBOX_TOKEN';

export type MapHandle = {
  reloadPois: () => Promise<void>;
};

type Props = {
  floorplanId: number;
  mode: 'view' | 'create';
  imageUrl: string;

  /** image height / image width → for you: 405/1000 = 0.405 */
  imageAspect?: number;

  /** Optional normalized corners */
  imageCorners?: [
    [number, number],
    [number, number],
    [number, number],
    [number, number]
  ];

  onPOIClick?: (poi: POI) => void;

  /** return normalized coordinates when map is clicked */
  onMapClick?: (nx: number, ny: number) => void;

  /** preview marker data (normalized coords) */
  previewCoords?: [number, number] | null;
  previewDraggable?: boolean;
  onPreviewDragEnd?: (nx: number, ny: number) => void;
};

/* ----------------------------------------------------------
 * NORMALIZE POI FROM API (fixes coordX → coordx mismatch)
 * -------------------------------------------------------- */
function normalizePOI(p: any): POI {
  return {
    id: Number(p.id),
    floorplanid: Number(p.floorplanid ?? p.floorplanId),
    name: String(p.name ?? ''),
    type: String(p.type ?? ''),
    description: String(p.description ?? ''),
    coordx: Number(p.coordx ?? p.coordX),
    coordy: Number(p.coordy ?? p.coordY),
  };
}

/* ----------------------------------------------------------
 * SAFE LOCAL LON/LAT BOX
 * lon ∈ [-10, +10]
 * lat ∈ [-10, -10 + 20 * aspect]
 * Always within valid Mapbox lat range (-90..90)
 * -------------------------------------------------------- */
const LON_MIN = -10;
const LON_MAX = 10;
const LON_SPAN = LON_MAX - LON_MIN;

function toLon(nx: number) {
  return LON_MIN + nx * LON_SPAN;
}

function toLat(ny: number, aspect: number) {
  const latMin = -10;
  const latMax = latMin + LON_SPAN * aspect;
  const latSpan = latMax - latMin;
  return latMin + ny * latSpan;
}

function fromLon(lon: number) {
  return (lon - LON_MIN) / LON_SPAN;
}
function fromLat(lat: number, aspect: number) {
  const latMin = -10;
  const latMax = latMin + LON_SPAN * aspect;
  return (lat - latMin) / (latMax - latMin);
}

/* ----------------------------------------------------------
 * Build FeatureCollection
 * -------------------------------------------------------- */
function toFeatureCollection(
  raw: any[],
  floorId: number,
  aspect: number
): FeatureCollection<Point> {
  const floorPois = raw.map(normalizePOI).filter(p => p.floorplanid === floorId);

  return {
    type: 'FeatureCollection',
    features: floorPois.map(p => ({
      type: 'Feature',
      id: p.id,
      geometry: {
        type: 'Point',
        coordinates: [toLon(p.coordx), toLat(p.coordy, aspect)],
      },
      properties: p,
    })),
  };
}

/* ----------------------------------------------------------
 * MAIN COMPONENT
 * -------------------------------------------------------- */
const FloorplanMapBase = forwardRef<MapHandle, Props>(function FloorplanMapBase(
  {
    floorplanId,
    mode,
    imageUrl,
    imageAspect = 0.405,
    imageCorners,
    onPOIClick,
    onMapClick,
    previewCoords,
    previewDraggable = true,
    onPreviewDragEnd,
  },
  ref
) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapEl = useRef<HTMLDivElement>(null);
  const previewMarker = useRef<mapboxgl.Marker | null>(null);

  /* Convert normalized corners into lon/lat */
  const corners: [[number, number],[number, number],[number, number],[number, number]] = (() => {
    const nc =
      imageCorners ??
      ([
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ] as const);

    return [
      [toLon(nc[0][0]), toLat(nc[0][1], imageAspect)],
      [toLon(nc[1][0]), toLat(nc[1][1], imageAspect)],
      [toLon(nc[2][0]), toLat(nc[2][1], imageAspect)],
      [toLon(nc[3][0]), toLat(nc[3][1], imageAspect)],
    ];
  })();

  /* reloadPois exposed to parent */
  useImperativeHandle(ref, () => ({
    reloadPois: async () => {
      const all = await listPOIByFloorplanId(floorplanId);
      const src = mapRef.current?.getSource('pois') as mapboxgl.GeoJSONSource;
      if (src) src.setData(toFeatureCollection(all, floorplanId, imageAspect));
    }
  }), [floorplanId, imageAspect]);

  /* --------------------------------------------------------
   * INIT MAP
   * ------------------------------------------------------ */
  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapEl.current,
      style: { version: 8, sources: {}, layers: [] },
      projection: 'mercator',
      renderWorldCopies: false,
      center: [toLon(0.5), toLat(0.5, imageAspect)],
      zoom: 0,
      minZoom: -2,
      maxZoom: 12,
      interactive: true,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on('load', async () => {
      /* Add floorplan image */
      map.addSource('floorplan', {
        type: 'image',
        url: imageUrl,
        coordinates: corners,
      });

      map.addLayer({
        id: 'floorplan-layer',
        type: 'raster',
        source: 'floorplan',
        paint: { 'raster-opacity': 1 },
      });

      /* Fit to image */
      const latMin = -10;
      const latMax = latMin + LON_SPAN * imageAspect;

      map.fitBounds(
        [
          [LON_MIN, latMin],
          [LON_MAX, latMax],
        ],
        { padding: 20, animate: false }
      );

      /* Stop user from panning too far away */
      map.setMaxBounds([
        [LON_MIN - 5, latMin - 5],
        [LON_MAX + 5, latMax + 5],
      ]);

      /* Add POI layer */
      map.addSource('pois', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: 'poi-circles',
        type: 'circle',
        source: 'pois',
        paint: {
          'circle-radius': 8,
          'circle-color': '#0d6efd',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      /* Click POI */
      map.on('click', 'poi-circles', (e) => {
        if (!onPOIClick) return;
        const f = e.features?.[0];
        if (!f) return;

        const raw = f.properties as any;
        const poi = normalizePOI(raw);

        onPOIClick(poi);
      });

      /* Click empty map → normalized coords */
      if (mode === 'create' && onMapClick) {
        map.on('click', (e) => {
          const nx = fromLon(e.lngLat.lng);
          const ny = fromLat(e.lngLat.lat, imageAspect);
          onMapClick(nx, ny);
        });
      }

      /* Load POIs */
      const all = await listPOIByFloorplanId(floorplanId);
      const src = map.getSource('pois') as mapboxgl.GeoJSONSource;

      console.log("%c POIs loaded FOR MAP:", "background:#333;color:#0f0", all);

      src.setData(toFeatureCollection(all, floorplanId, imageAspect));
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [imageUrl, imageAspect, floorplanId]);

  /* --------------------------------------------------------
   * Preview marker
   * ------------------------------------------------------ */
  useEffect(() => {
    if (!mapRef.current || mode !== 'create') return;

    const map = mapRef.current;

    if (!previewCoords) {
      previewMarker.current?.remove();
      previewMarker.current = null;
      return;
    }

    const [nx, ny] = previewCoords;
    const lng = toLon(nx);
    const lat = toLat(ny, imageAspect);

    if (!previewMarker.current) {
      const el = document.createElement('div');
      el.style.width = '36px';
      el.style.height = '36px';
      el.style.borderRadius = '50%';
      el.style.border = '3px dashed #0d6efd';
      el.style.background = '#cfe2ff';

      previewMarker.current = new mapboxgl.Marker({
        element: el,
        draggable: previewDraggable,
      })
        .setLngLat([lng, lat])
        .addTo(map);

      if (previewDraggable && onPreviewDragEnd) {
        previewMarker.current.on('dragend', () => {
          const pos = previewMarker.current!.getLngLat();
          const nx2 = fromLon(pos.lng);
          const ny2 = fromLat(pos.lat, imageAspect);
          onPreviewDragEnd(nx2, ny2);
        });
      }
    } else {
      previewMarker.current.setLngLat([lng, lat]);
    }
  }, [previewCoords, previewDraggable, imageAspect, mode]);

  return <div ref={mapEl} className="h-full w-full rounded border" />;
});

export default FloorplanMapBase;
