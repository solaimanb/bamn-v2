import { useEffect, useRef, useMemo } from 'react';
import GlobeGL from 'react-globe.gl';
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
  const globeRef = useRef<typeof GlobeGL>(null);

  const mentorPoints = useMemo(() => {
    return mentors.map(mentor => ({
      ...mentor,
      lat: mentor.latitude,
      lng: mentor.longitude,
      size: 0.3,
      color: '#FF5733',
      label: mentor.full_name
    }));
  }, [mentors]);

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