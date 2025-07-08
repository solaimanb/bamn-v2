"use client";

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { Mentor } from '@/types/mentor';
import type { ForwardedRef } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import * as THREE from 'three';

interface PointData {
    lat: number;
    lng: number;
    size: number;
    color: string;
    mentor: Mentor;
}

interface GlobeProps {
    ref?: ForwardedRef<THREE.Group>;
    globeImageUrl: string;
    pointsData: PointData[];
    pointAltitude: number;
    pointRadius: number;
    pointColor: string;
    pointLabel: (point: PointData) => string;
    onPointClick: (point: PointData) => void;
    backgroundColor: string;
    atmosphereColor: string;
    width: number;
    height: number;
    globeMaterial?: THREE.Material;
    enableZoom?: boolean;
    minDistance?: number;
    maxDistance?: number;
}

const Globe = dynamic<GlobeProps>(() => import('react-globe.gl'), {
    ssr: false,
    loading: () => (
        <div className="aspect-video w-full flex justify-center items-center">
            <Skeleton className="w-20 h-20 rounded-full" />
        </div>
    ),
});

interface MentorGlobeProps {
    mentors: Mentor[];
    onMentorClick: (mentor: Mentor) => void;
}

export default function MentorGlobe({ mentors, onMentorClick }: MentorGlobeProps) {
    const globeRef = useRef<THREE.Group>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

    useEffect(() => {
        const updateDimensions = () => {
            const container = document.querySelector('.globe-container');
            if (container) {
                setDimensions({
                    width: container.clientWidth,
                    height: container.clientHeight
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const pointsData: PointData[] = mentors.map(mentor => ({
        lat: mentor.latitude,
        lng: mentor.longitude,
        size: 0.5,
        color: '#ff3333',
        mentor: mentor
    }));

    return (
        <div className="globe-container aspect-video w-full flex justify-center items-center relative">
            <Globe
                ref={globeRef}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
                pointsData={pointsData}
                pointAltitude={0.01}
                pointRadius={0.5}
                pointColor="color"
                pointLabel={(point: PointData) => `
                    <div class="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg">
                        <div class="font-semibold">${point.mentor.full_name}</div>
                        <div class="text-sm text-gray-600">${point.mentor.institution}</div>
                        <div class="text-xs text-gray-500">${point.mentor.city}, ${point.mentor.country}</div>
                    </div>
                `}
                onPointClick={(point: PointData) => onMentorClick(point.mentor)}
                backgroundColor="rgba(0,0,0,0)"
                atmosphereColor="#ffffff"
                width={dimensions.width}
                height={dimensions.height}
                enableZoom={true}
                minDistance={200}
                maxDistance={400}
            />
        </div>
    );
} 