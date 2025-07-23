'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import GlobeGL, { GlobeMethods } from 'react-globe.gl';
import { MentorResponse } from '@/types/api';
import * as THREE from 'three';

interface MentorGlobeProps {
  mentors: MentorResponse[];
  onMentorClick: (mentor: MentorResponse) => void;
  isDialogOpen?: boolean;
}

interface GlobePoint extends MentorResponse {
  lat: number;
  lng: number;
  size: number;
  color: string;
  label: string;
}

const getOffsetCoordinates = (
  mentors: MentorResponse[],
  currentMentor: MentorResponse,
  index: number,
  totalOverlapping: number
): { lat: number; lng: number } => {
  const overlappingMentors = mentors.filter(
    m => m.latitude === currentMentor.latitude && m.longitude === currentMentor.longitude
  );

  if (overlappingMentors.length <= 1) {
    return {
      lat: currentMentor.latitude,
      lng: currentMentor.longitude
    };
  }

  const baseRadius = 0.05;
  const angle = (2 * Math.PI * index) / Math.max(totalOverlapping, 8);
  const radius = baseRadius * (1 + (index * 0.1));

  return {
    lat: currentMentor.latitude + (radius * Math.cos(angle)),
    lng: currentMentor.longitude + (radius * Math.sin(angle))
  };
};

export default function MentorGlobe({ mentors, onMentorClick, isDialogOpen = false }: MentorGlobeProps) {
  const globeRef = useRef<GlobeMethods>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [markerSvg, setMarkerSvg] = useState<THREE.Texture | null>(null);
  const [hoveredMentor, setHoveredMentor] = useState<GlobePoint | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDialogOpen) {
      setHoveredMentor(null);
    }
  }, [isDialogOpen]);

  useEffect(() => {
    setIsMounted(true);
    const img = new Image();
    img.src = '/marker.png';
    img.onload = () => {
      const texture = new THREE.Texture(img);
      texture.needsUpdate = true;
      setMarkerSvg(texture);
    };
  }, []);

  const mentorPoints = useMemo(() => {
    const locationCounts = new Map<string, number>();
    const locationIndices = new Map<string, number>();

    mentors.forEach(mentor => {
      const key = `${mentor.latitude},${mentor.longitude}`;
      locationCounts.set(key, (locationCounts.get(key) || 0) + 1);
    });

    return mentors.map(mentor => {
      const key = `${mentor.latitude},${mentor.longitude}`;
      const count = locationCounts.get(key) || 1;
      const index = locationIndices.get(key) || 0;
      locationIndices.set(key, index + 1);

      const { lat, lng } = getOffsetCoordinates(mentors, mentor, index, count);

      return {
        ...mentor,
        lat,
        lng,
        size: 0.05,
        color: '#000000',
        label: mentor.full_name
      };
    });
  }, [mentors]);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
      globeRef.current.pointOfView({
        lat: 0,
        lng: 0,
        altitude: 2.5
      }, 1000);
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (tooltipRef.current && hoveredMentor && !isDialogOpen) {
        tooltipRef.current.style.left = `${event.clientX + 10}px`;
        tooltipRef.current.style.top = `${event.clientY + 10}px`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [hoveredMentor, isDialogOpen]);

  if (!isMounted) return null;

  return (
    <div className="w-full h-full">
      <GlobeGL
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        customLayerData={mentorPoints}
        customThreeObject={(d: GlobePoint) => {
          if (!markerSvg) return null;
          const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: markerSvg,
              transparent: true,
              opacity: hoveredMentor?.id === d.id ? 0.7 : 1
            })
          );
          sprite.scale.set(6, 6, 1);
          return sprite;
        }}
        customThreeObjectUpdate={(obj: THREE.Object3D, d: GlobePoint) => {
          if (globeRef.current) {
            const coords = globeRef.current.getCoords(d.lat, d.lng, 0.01);
            if (coords) {
              Object.assign(obj.position, coords);
            }
          }
        }}
        onCustomLayerHover={(point: GlobePoint | null) => {
          if (!isDialogOpen) {
            setHoveredMentor(point);
          }
        }}
        onCustomLayerClick={(point: GlobePoint) => onMentorClick(point)}
        atmosphereColor="rgb(66, 133, 244)"
        atmosphereAltitude={0.15}
      />

      {hoveredMentor && !isDialogOpen && (
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-white px-2 py-1 rounded shadow-lg text-sm pointer-events-none"
          style={{
            transform: 'translate(-50%, -100%)',
            marginTop: '-10px'
          }}
        >
          {hoveredMentor.full_name}
        </div>
      )}
    </div>
  );
} 