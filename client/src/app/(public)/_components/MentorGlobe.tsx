'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import GlobeGL, { GlobeMethods } from 'react-globe.gl';
import { MentorResponse } from '@/types/api';

interface MentorGlobeProps {
  mentors: MentorResponse[];
  onMentorClick: (mentor: MentorResponse) => void;
}

interface GlobePoint extends MentorResponse {
  lat: number;
  lng: number;
  size: number;
  color: string;
  label: string;
}

export default function MentorGlobe({ mentors, onMentorClick }: MentorGlobeProps) {
  const globeRef = useRef<GlobeMethods>(null);
  const [isMounted, setIsMounted] = useState(false);

  const mentorPoints = useMemo(() => {
    return mentors.map(mentor => ({
      ...mentor,
      lat: mentor.latitude,
      lng: mentor.longitude,
      size: 0.2,
      color: '#FF5733',
      label: mentor.full_name
    }));
  }, [mentors]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      // Auto-rotate
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
      
      // Initial position
      globeRef.current.pointOfView({
        lat: 0,
        lng: 0,
        altitude: 2.5
      }, 1000);
    }
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <GlobeGL
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={mentorPoints}
        pointLabel="label"
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.01}
        pointRadius="size"
        pointResolution={12}
        pointsMerge={true}
        atmosphereColor="#3a228a"
        atmosphereAltitude={0.25}
        onPointClick={(point: GlobePoint) => onMentorClick(point)}
      />
    </div>
  );
} 