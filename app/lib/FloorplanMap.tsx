'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN';

export default function FloorplanMap({ onPOIClick }: { onPOIClick: (poi: any) => void }) {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: { version: 8, sources: {}, layers: [] },
      center: [4.895168, 52.370216],
      zoom: 18,
    });

    map.on('load', () => {
      map.addSource('floorplan', {
        type: 'image',
        url: '/floorplan.png',
        coordinates: [
          [4.894, 52.371],
          [4.896, 52.371],
          [4.896, 52.369],
          [4.894, 52.369],
        ],
      });

      map.addLayer({
        id: 'floorplan-layer',
        type: 'raster',
        source: 'floorplan',
        paint: { 'raster-opacity': 0.8 },
      });

      const poiData = [ 
        {
          coords: [4.8955, 52.3705] as [number, number],
          title: 'Meeting Room',
          type: 'meeting',
          description: 'Capacity: 10 people, Projector available',
          status: 'available',
          battery: '85',
          temperature: '22',
          noise: '52',
          light: '300',
          humidity: '45',
          co2: '600',
          lastComDate: '11-12-2025 10:30 AM',
        },
        {
          coords: [4.8958, 52.3703] as [number, number],
          title: 'Coffee Station',
          type: 'coffee',
          desc: 'Free coffee and snacks',
          status: 'occupied',
          battery: '85',
          temp: '22',
          noise: '52',
          light: '300',
          humidity: '45',
          co2: '600',
          lastComDate: '11-12-2025 10:30 AM',
        },
      ];

      const getIconForType = (type: string) => {
        switch (type) {
          case 'meeting': return '/icons/conference-room-icon.svg';
          case 'coffee': return '/icons/bubble-icon.svg';
          default: return '/icons/default.svg';
        }
      };

      poiData.forEach((poi) => {
        const el = document.createElement('div');
        el.style.backgroundImage = `url(${getIconForType(poi.type)})`;
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.backgroundSize = 'cover';
        el.style.borderRadius = '50%';
        el.style.border = `3px solid ${poi.status === 'available' ? 'green' : 'red'}`;
        el.style.transition = 'transform 0.2s ease';

        el.addEventListener('click', () => onPOIClick(poi));

        new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat(poi.coords)
          .addTo(map);
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.addControl(new mapboxgl.FullscreenControl(), 'top-left');
    });

    return () => map.remove();
  }, [onPOIClick]);

  return <div ref={mapContainer} className="w-full h-full border rounded-lg border-[#DEE2E6]" />;
}