'use client';

import { useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { getLocationDetails } from '@/lib/utils';
import type { LatLngExpression, DragEndEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationDetails {
  continent: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
}

interface MapComponentProps {
  center: LatLngExpression;
  onLocationSelect: (details: LocationDetails) => void;
}

const ClientSideMap = dynamic(
  () => Promise.all([
    import('leaflet'),
    import('react-leaflet')
  ]).then(([L, RL]) => {
    const icon = L.default.icon({
      iconUrl: '/marker.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    const MapComponent = ({ center, onLocationSelect }: MapComponentProps) => {
      const handleMarkerDragEnd = useCallback(async (e: DragEndEvent) => {
        const marker = e.target;
        const position = marker.getLatLng();
        const details = await getLocationDetails(position.lat, position.lng);
        onLocationSelect(details);
      }, [onLocationSelect]);

      const handleMapClick = useCallback(async (e: { latlng: { lat: number; lng: number } }) => {
        const details = await getLocationDetails(e.latlng.lat, e.latlng.lng);
        onLocationSelect(details);
      }, [onLocationSelect]);

      const { MapContainer, TileLayer, Marker, useMapEvents } = RL;

      function MapEvents() {
        useMapEvents({
          click: handleMapClick,
        });
        return null;
      }

      return (
        <MapContainer
          center={center}
          zoom={4}
          className="h-full w-full"
          scrollWheelZoom={true}
          zoomControl={true}
          minZoom={2}
          maxZoom={18}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={center}
            icon={icon}
            draggable={true}
            eventHandlers={{
              dragend: handleMarkerDragEnd,
            }}
          />
          <MapEvents />
        </MapContainer>
      );
    };

    return MapComponent;
  }),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] rounded-md border flex items-center justify-center bg-gray-50">
        Loading map...
      </div>
    )
  }
);

interface LocationMapProps {
  onLocationSelect: (details: LocationDetails) => void;
  latitude?: number;
  longitude?: number;
}

export function LocationMap({ onLocationSelect, latitude = 23.8103, longitude = 90.4125 }: LocationMapProps) {
  const center = useMemo<LatLngExpression>(
    () => [latitude, longitude],
    [latitude, longitude]
  );

  return (
    <div className="w-full h-[300px] rounded-md border overflow-hidden">
      <ClientSideMap
        center={center}
        onLocationSelect={onLocationSelect}
      />
    </div>
  );
} 