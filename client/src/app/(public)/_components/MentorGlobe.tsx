'use client';

import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import GlobeGL, { GlobeMethods } from 'react-globe.gl';
import { MentorResponse } from '@/types/api';
import * as THREE from 'three';
import throttle from 'lodash/throttle';

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

// Pre-create material for reuse
const createMarkerMaterial = (texture: THREE.Texture) => {
  return new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 1,
    sizeAttenuation: true,
    depthWrite: false
  });
};

export default function MentorGlobe({ mentors, onMentorClick, isDialogOpen = false }: MentorGlobeProps) {
  const globeRef = useRef<GlobeMethods>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [markerMaterial, setMarkerMaterial] = useState<THREE.SpriteMaterial | null>(null);
  const [hoveredMentor, setHoveredMentor] = useState<GlobePoint | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const spritesRef = useRef<Map<string, THREE.Sprite>>(new Map());
  const coordsCacheRef = useRef<Map<string, { lat: number; lng: number }>>(new Map());

  const getOffsetCoordinates = useCallback((
    mentors: MentorResponse[],
    currentMentor: MentorResponse,
    index: number,
    totalOverlapping: number
  ): { lat: number; lng: number } => {
    const cacheKey = `${currentMentor.latitude},${currentMentor.longitude},${index},${totalOverlapping}`;
    if (coordsCacheRef.current.has(cacheKey)) {
      return coordsCacheRef.current.get(cacheKey)!;
    }

    const overlappingMentors = mentors.filter(
      m => m.latitude === currentMentor.latitude && m.longitude === currentMentor.longitude
    );

    if (overlappingMentors.length <= 1) {
      const result = {
        lat: currentMentor.latitude,
        lng: currentMentor.longitude
      };
      coordsCacheRef.current.set(cacheKey, result);
      return result;
    }

    const baseRadius = 0.05;
    const angle = (2 * Math.PI * index) / Math.max(totalOverlapping, 8);
    const radius = baseRadius * (1 + (index * 0.1));

    const result = {
      lat: currentMentor.latitude + (radius * Math.cos(angle)),
      lng: currentMentor.longitude + (radius * Math.sin(angle))
    };
    coordsCacheRef.current.set(cacheKey, result);
    return result;
  }, []);

  useEffect(() => {
    if (isDialogOpen) {
      setHoveredMentor(null);
    }
  }, [isDialogOpen]);

  useEffect(() => {
    setIsMounted(true);
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/marker.png', (texture) => {
      texture.needsUpdate = true;
      setMarkerMaterial(createMarkerMaterial(texture));
    });

    return () => {
      // Cleanup sprites and cache on unmount
      spritesRef.current.forEach(sprite => {
        sprite.material.dispose();
      });
      spritesRef.current.clear();
      coordsCacheRef.current.clear();
    };
  }, []);

  const mentorPoints = useMemo(() => {
    const locationCounts = new Map<string, number>();
    const locationIndices = new Map<string, number>();

    // Pre-calculate counts in a single pass
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
  }, [mentors, getOffsetCoordinates]);

  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.enableDamping = true;
      controls.dampingFactor = 0.2;

      globeRef.current.pointOfView({
        lat: 0,
        lng: 0,
        altitude: 2.5
      }, 1000);
    }
  }, []);

  const handleMouseMove = useCallback(
    throttle((event: MouseEvent) => {
      if (tooltipRef.current && hoveredMentor && !isDialogOpen) {
        tooltipRef.current.style.left = `${event.clientX + 10}px`;
        tooltipRef.current.style.top = `${event.clientY + 10}px`;
      }
    }, 16),
    [hoveredMentor, isDialogOpen]
  );

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      handleMouseMove.cancel();
    };
  }, [handleMouseMove]);

  const handleHover = useCallback((point: GlobePoint | null) => {
    if (!isDialogOpen) {
      setHoveredMentor(point);
      if (point && spritesRef.current.has(point.id)) {
        const sprite = spritesRef.current.get(point.id)!;
        sprite.material.opacity = 0.7;
      }
      if (hoveredMentor && hoveredMentor.id !== point?.id && spritesRef.current.has(hoveredMentor.id)) {
        const sprite = spritesRef.current.get(hoveredMentor.id)!;
        sprite.material.opacity = 1;
      }
    }
  }, [isDialogOpen, hoveredMentor]);

  if (!isMounted) return null;

  return (
    <div className="w-full h-full">
      <GlobeGL
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        customLayerData={mentorPoints}
        customThreeObject={(d: GlobePoint) => {
          if (!markerMaterial) return null;

          if (spritesRef.current.has(d.id)) {
            return spritesRef.current.get(d.id)!;
          }

          const sprite = new THREE.Sprite(markerMaterial.clone());
          sprite.scale.set(6, 6, 1);
          spritesRef.current.set(d.id, sprite);
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
        onCustomLayerHover={handleHover}
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