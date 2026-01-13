'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { FeatureCollection, Point } from 'geojson';
import { listPOI, type POI } from '@/lib/clients/poisClient';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? 'YOUR_MAPBOX_TOKEN';

export type MapHandle = {
  reloadPois: () => Promise<void>;
};

type Props = {
  floorplanId: number;
  mode: 'view' | 'create';
  imageUrl?: string;
  imageCorners?: [ [number, number], [number, number], [number, number], [number, number] ];
  onPOIClick?: (poi: POI) => void;
  onMapClick?: (lng: number, lat: number) => void;
  previewCoords?: [number, number] | null;            // alleen gebruiken in mode='create'
  previewDraggable?: boolean;                         // default: true
  onPreviewDragEnd?: (lng: number, lat: number) => void;
};

const DEFAULT_CORNERS: [
  [number, number], [number, number], [number, number], [number, number]
] = [
  [4.894, 52.371], // top-left
  [4.896, 52.371], // top-right
  [4.896, 52.369], // bottom-right
  [4.894, 52.369], // bottom-left
];

function normalizePOI(p: any): POI {
  // Zorg dat we altijd lowercase keys teruggeven naar de parent
  return {
    id: Number(p.id),
    floorplanid: Number(p.floorplanid ?? p.floorplanId ?? p.FloorplanId),
    name: (p.name ?? p.Name ?? '').toString(),
    type: (p.type ?? p.Type ?? '').toString(),
    description: (p.description ?? p.Description ?? '').toString(),
    coordx: Number(p.coordx ?? p.coordX ?? p.CoordX ?? p.lng ?? p.longitude),
    coordy: Number(p.coordy ?? p.coordY ?? p.CoordY ?? p.lat ?? p.latitude),
  };
}

function buildFeatureCollection(list: any[], floorId: number): FeatureCollection<Point> {
  const floorNum = Number(floorId);
  return {
    type: 'FeatureCollection',
    features: list
      .filter(p => Number(p.floorplanid ?? p.floorplanId ?? p.FloorplanId) === floorNum)
      .map(p => {
        const poi = normalizePOI(p);
        return {
          type: 'Feature',
          id: poi.id,
          geometry: { type: 'Point', coordinates: [poi.coordx, poi.coordy] },
          properties: poi, // bewaar normalized POI in properties
        } as const;
      })
  };
}

const FloorplanMapBase = forwardRef<MapHandle, Props>(function FloorplanMapBase({
  floorplanId,
  mode,
  imageUrl = '/floorplan.png',
  imageCorners,
  onPOIClick,
  onMapClick,
  previewCoords,
  previewDraggable = true,
  onPreviewDragEnd,
}, ref) {

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapElRef = useRef<HTMLDivElement>(null);
  const previewMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const corners = useMemo(() => imageCorners ?? DEFAULT_CORNERS, [imageCorners]);

  // Handlers refs (voor nette off(...))
  const onCircleClickRef = useRef<((e: mapboxgl.MapLayerMouseEvent) => void) | null>(null);
  const onCircleMoveRef  = useRef<((e: mapboxgl.MapLayerMouseEvent) => void) | null>(null);
  const onMapClickRef    = useRef<((e: mapboxgl.MapMouseEvent) => void) | null>(null);

  // Util: bron updaten
  const updatePoisSource = (fc: FeatureCollection<Point>) => {
    const src = mapRef.current?.getSource('pois') as mapboxgl.GeoJSONSource | undefined;
    if (!src) {
      setTimeout(() => {
        const src2 = mapRef.current?.getSource('pois') as mapboxgl.GeoJSONSource | undefined;
        src2?.setData(fc);
      }, 0);
      return;
    }
    src.setData(fc);
  };

  // Expose reloadPois via ref
  useImperativeHandle(ref, () => ({
    reloadPois: async () => {
      const all = await listPOI();
      const fc = buildFeatureCollection(all, floorplanId);
      updatePoisSource(fc);
    }
  }), [floorplanId]);

  // INIT kaart (eenmalig)
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapElRef.current,
      style: { version: 8, sources: {}, layers: [] },
      center: [4.895168, 52.370216],
      zoom: 18,
      pitch: 0,
      bearing: 0
    });
    mapRef.current = map;

    const onLoad = async () => {
      // Floorplan overlay
      map.addSource('floorplan', {
        type: 'image',
        url: imageUrl,
        coordinates: corners,
      });
      map.addLayer({
        id: 'floorplan-layer',
        type: 'raster',
        source: 'floorplan',
        paint: { 'raster-opacity': 0.85 },
      });

      // POI‑bron + circle layer
      map.addSource('pois', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'poi-circles',
        type: 'circle',
        source: 'pois',
        paint: {
          'circle-radius': 6,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-color': '#0d6efd',
          'circle-opacity': 1
        }
      });
      try { map.moveLayer('poi-circles'); } catch {}

      // Marker‑klik → detail
      const onCircleClick = (e: mapboxgl.MapLayerMouseEvent) => {
        const f = e.features?.[0];
        if (!f || !onPOIClick) return;
        const props = f.properties as any;
        onPOIClick(normalizePOI(props));
      };
      const onCircleMove = (e: mapboxgl.MapLayerMouseEvent) => {
        map.getCanvas().style.cursor = e.features?.length ? 'pointer' : '';
      };
      onCircleClickRef.current = onCircleClick;
      onCircleMoveRef.current  = onCircleMove;
      map.on('click', 'poi-circles', onCircleClick);
      map.on('mousemove', 'poi-circles', onCircleMove);

      // Lege kaart klik → create
      if (mode === 'create' && onMapClick) {
        const onMapClickHandler = (e: mapboxgl.MapMouseEvent) => {
          onMapClick(Number(e.lngLat.lng.toFixed(6)), Number(e.lngLat.lat.toFixed(6)));
        };
        onMapClickRef.current = onMapClickHandler;
        map.on('click', onMapClickHandler);
      }

      // Initiele data
      const all = await listPOI();
      updatePoisSource(buildFeatureCollection(all, floorplanId));
    };

    map.on('load', onLoad);

    return () => {
      // handlers off
      if (onCircleClickRef.current)  { try { map.off('click', 'poi-circles', onCircleClickRef.current); } catch {} }
      if (onCircleMoveRef.current)   { try { map.off('mousemove', 'poi-circles', onCircleMoveRef.current); } catch {} }
      if (onMapClickRef.current)     { try { map.off('click', onMapClickRef.current); } catch {} }

      // preview weg
      if (previewMarkerRef.current) { previewMarkerRef.current.remove(); previewMarkerRef.current = null; }

      // layers/sources weg
      if (map.getLayer('poi-circles')) map.removeLayer('poi-circles');
      if (map.getSource('pois'))       map.removeSource('pois');
      if (map.getLayer('floorplan-layer')) map.removeLayer('floorplan-layer');
      if (map.getSource('floorplan'))      map.removeSource('floorplan');

      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preview marker tekenen/updaten op basis van props (creator‑flow)
  useEffect(() => {
    if (mode !== 'create') return;
    const map = mapRef.current;
    if (!map) return;

    // weg als null
    if (!previewCoords) {
      if (previewMarkerRef.current) {
        previewMarkerRef.current.remove();
        previewMarkerRef.current = null;
      }
      return;
    }

    // aanmaken of verplaatsen
    if (!previewMarkerRef.current) {
      const el = document.createElement('div');
      el.style.width = '36px';
      el.style.height = '36px';
      el.style.borderRadius = '50%';
      el.style.border = '3px dashed #0d6efd';
      el.style.background = '#cfe2ff';
      el.style.boxShadow = '0 0 0 2px rgba(13,110,253,.2)';

      previewMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center', draggable: !!previewDraggable })
        .setLngLat(previewCoords)
        .addTo(map);

      if (previewDraggable && onPreviewDragEnd) {
        previewMarkerRef.current.on('dragend', () => {
          const pos = previewMarkerRef.current!.getLngLat();
          onPreviewDragEnd(Number(pos.lng.toFixed(6)), Number(pos.lat.toFixed(6)));
        });
      }
    } else {
      previewMarkerRef.current.setLngLat(previewCoords);
    }
  }, [mode, previewCoords, previewDraggable, onPreviewDragEnd]);

  return <div ref={mapElRef} className="h-full w-full rounded border border-[#DEE2E6]" />;
});

export default FloorplanMapBase;
