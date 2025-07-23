'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
interface MapComponentProps {
    center: LatLngExpression;
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

        const MapComponent = ({ center }: MapComponentProps) => {
            const { MapContainer, TileLayer, Marker } = RL;

            return (
                <MapContainer
                    center={center}
                    zoom={13}
                    className="h-full w-full"
                    scrollWheelZoom={false}
                    zoomControl={true}
                    dragging={false}
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
                        draggable={false}
                    />
                </MapContainer>
            );
        };

        return MapComponent;
    }),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full rounded-lg flex items-center justify-center">
                <div className="animate-pulse">Loading map...</div>
            </div>
        )
    }
);

interface ProfileMapProps {
    latitude: number;
    longitude: number;
}

export function ProfileMap({ latitude, longitude }: ProfileMapProps) {
    const center = useMemo<LatLngExpression>(
        () => [latitude, longitude],
        [latitude, longitude]
    );

    return (
        <div className="w-full h-full rounded-lg overflow-hidden">
            <ClientSideMap center={center} />
        </div>
    );
} 