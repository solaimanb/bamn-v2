/**
 * A 3D globe component that displays mentor locations with hover and click interactions.
 */

'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import debounce from 'lodash/debounce';
import {
    Ion,
    Color,
    Cartesian3,
    Math as CesiumMath,
    CallbackProperty,
    NearFarScalar,
    EntityCollection,
    HorizontalOrigin,
    VerticalOrigin,
    DistanceDisplayCondition,
    Cartesian2,
    ScreenSpaceEventType,
    ScreenSpaceEventHandler,
    HeightReference,
    LabelGraphics,
    OpenStreetMapImageryProvider,
    ImageryLayer,
    BillboardGraphics,
} from '@cesium/engine';
import { Viewer } from '@cesium/widgets';
import { Mentor } from '@/types/mentor';
import { GlobeVisualization } from '@/types/api';

if (typeof window !== 'undefined') {
    Ion.defaultAccessToken = window.CESIUM_ION_TOKEN || process.env.NEXT_PUBLIC_CESIUM_TOKEN || '';
}

type MentorLocation = Mentor | GlobeVisualization;

interface MentorGlobeCesiumProps {
    mentors?: MentorLocation[];
    onMentorClick?: (mentor: MentorLocation) => void;
}

const getOffsetCoordinates = (
    mentors: MentorLocation[],
    currentMentor: MentorLocation,
    index: number,
    totalOverlapping: number
): { latitude: number; longitude: number } => {
    const overlappingMentors = mentors.filter(
        m => m.latitude === currentMentor.latitude && m.longitude === currentMentor.longitude
    );

    if (overlappingMentors.length <= 1) {
        return {
            latitude: currentMentor.latitude,
            longitude: currentMentor.longitude
        };
    }

    const baseRadius = 0.0001;
    const angle = (2 * Math.PI * index) / Math.max(totalOverlapping, 8);
    const radius = baseRadius * (1 + (index * 0.1));

    return {
        latitude: currentMentor.latitude + (radius * Math.cos(angle)),
        longitude: currentMentor.longitude + (radius * Math.sin(angle))
    };
};

const useMentorClusters = (mentors: MentorLocation[]) => {
    return useMemo(() => {
        const clusters = new Map<string, MentorLocation[]>();

        mentors.forEach(mentor => {
            if (!mentor.latitude || !mentor.longitude) return;

            const key = `${mentor.latitude},${mentor.longitude}`;
            const existing = clusters.get(key) || [];
            clusters.set(key, [...existing, mentor]);
        });

        return clusters;
    }, [mentors]);
};

export default function MentorGlobeCesium({ mentors = [], onMentorClick }: MentorGlobeCesiumProps) {
    const cesiumContainer = useRef<HTMLDivElement>(null);
    const [viewer, setViewer] = useState<Viewer | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [debugStatus, setDebugStatus] = useState<string>('Initializing...');
    const [containerReady, setContainerReady] = useState(false);
    const mentorEntities = useRef<EntityCollection | null>(null);
    const hoverStates = useRef<Map<string, boolean>>(new Map());
    const [selectedMentor, setSelectedMentor] = useState<MentorLocation | null>(null);
    const lastFrameTime = useRef<number>(0);
    const frameRateLimit = 30;
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds
    const mentorClusters = useMentorClusters(mentors);

    const containerStyle = useMemo<React.CSSProperties>(() => ({
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        width: '100vw',
        height: '100vh',
        margin: '0',
        padding: '0',
        overflow: 'hidden',
        background: 'transparent',
    }), []);

    /** Creates a Cesium entity for a mentor with hover and click interactions */
    const createMentorEntity = useCallback((viewer: Viewer, mentor: MentorLocation) => {
        if (!mentor.latitude || !mentor.longitude) return null;

        // Use memoized clusters instead of filtering every time
        const key = `${mentor.latitude},${mentor.longitude}`;
        const locationMentors = mentorClusters.get(key) || [];
        const index = locationMentors.findIndex(m => m.id === mentor.id);
        const { latitude, longitude } = getOffsetCoordinates(
            mentors,
            mentor,
            index,
            locationMentors.length
        );

        const isInCluster = locationMentors.length > 1;

        return viewer.entities.add({
            position: Cartesian3.fromDegrees(longitude, latitude),
            billboard: new BillboardGraphics({
                image: '/gps.png',
                verticalOrigin: VerticalOrigin.BOTTOM,
                horizontalOrigin: HorizontalOrigin.CENTER,
                scale: isInCluster ? 0.2 : 0.3,
                heightReference: HeightReference.RELATIVE_TO_GROUND,
                scaleByDistance: new NearFarScalar(1.5e6, 1.0, 3.0e7, 0.1),
                translucencyByDistance: new NearFarScalar(1.5e6, 1.0, 3.0e7, 1.0),
                disableDepthTestDistance: 0,
            }),
            id: mentor.id,
            description: undefined,
            show: true,
            label: {
                text: new CallbackProperty(() => {
                    const isHovered = hoverStates.current.get(mentor.id);
                    if (!isHovered) return '';

                    const text = [
                        mentor.full_name,
                        '──────────',
                        'email' in mentor ? mentor.current_role || 'Mentor' : 'Mentor',
                        'email' in mentor ? mentor.institution || '' : '',
                        'email' in mentor ? `${mentor.city}, ${mentor.country}` : ''
                    ];

                    if (isInCluster) {
                        text.push('──────────');
                        text.push(`+${locationMentors.length - 1} more at this location`);
                    }

                    return text.filter(Boolean).join('\n');
                }, false),
                font: '14px "Inter", system-ui, sans-serif',
                fillColor: Color.fromCssColorString('#000000'),
                outlineWidth: 0,
                style: 0,
                showBackground: true,
                backgroundColor: new Color(1.0, 1.0, 1.0, 1.0),
                backgroundPadding: new Cartesian2(16, 12),
                pixelOffset: new Cartesian2(0, -40),
                horizontalOrigin: HorizontalOrigin.CENTER,
                verticalOrigin: VerticalOrigin.BOTTOM,
                scale: 0.9,
                distanceDisplayCondition: new DistanceDisplayCondition(2.0e6, 2.0e7),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                show: false,
                heightReference: HeightReference.RELATIVE_TO_GROUND,
                eyeOffset: new Cartesian3(0, 0, -10),
                translucencyByDistance: new NearFarScalar(2.0e6, 1.0, 2.0e7, 0.3)
            }
        });
    }, [mentors, mentorClusters]);

    const updateHoverStates = useCallback((
        viewer: Viewer,
        movement: { endPosition: Cartesian2 },
        entities: EntityCollection
    ) => {
        if (!movement || !movement.endPosition) return;

        const scene = viewer.scene;
        const camera = viewer.camera;
        const ellipsoid = scene.globe.ellipsoid;
        const ray = camera.getPickRay(movement.endPosition);
        if (!ray) return;

        const pickedPosition = scene.globe.pick(ray, scene);
        if (!pickedPosition) return;

        // Get picked coordinates
        const pickedCartographic = ellipsoid.cartesianToCartographic(pickedPosition);
        const pickedLat = CesiumMath.toDegrees(pickedCartographic.latitude);
        const pickedLon = CesiumMath.toDegrees(pickedCartographic.longitude);

        // Performance optimization: Only process entities within a certain radius
        const MAX_DISTANCE = 2; // degrees
        let needsUpdate = false;

        entities.values.forEach(entity => {
            if (!entity.position) return;

            const position = entity.position.getValue(viewer.clock.currentTime);
            if (!position) return;

            const cartographic = ellipsoid.cartesianToCartographic(position);
            const entityLat = CesiumMath.toDegrees(cartographic.latitude);
            const entityLon = CesiumMath.toDegrees(cartographic.longitude);

            // Quick distance check
            const latDiff = Math.abs(entityLat - pickedLat);
            const lonDiff = Math.abs(entityLon - pickedLon);

            // Skip if too far
            if (latDiff > MAX_DISTANCE || lonDiff > MAX_DISTANCE) {
                const currentState = hoverStates.current.get(entity.id as string);
                if (currentState) {
                    needsUpdate = true;
                    hoverStates.current.set(entity.id as string, false);
                    if (entity.label instanceof LabelGraphics) {
                        entity.label.show = new CallbackProperty(() => false, false);
                    }
                }
                return;
            }

            // Accurate distance check for close entities
            const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
            if (distance > 1) {
                const currentState = hoverStates.current.get(entity.id as string);
                if (currentState) {
                    needsUpdate = true;
                    hoverStates.current.set(entity.id as string, false);
                    if (entity.label instanceof LabelGraphics) {
                        entity.label.show = new CallbackProperty(() => false, false);
                    }
                }
                return;
            }

            // Screen space check for close entities
            const windowCoords = scene.cartesianToCanvasCoordinates(position);
            if (!windowCoords) return;

            const dx = movement.endPosition.x - windowCoords.x;
            const dy = movement.endPosition.y - windowCoords.y;
            const screenDistance = Math.sqrt(dx * dx + dy * dy);
            const isHovered = screenDistance <= 40;

            const currentState = hoverStates.current.get(entity.id as string);
            if (currentState !== isHovered) {
                needsUpdate = true;
                hoverStates.current.set(entity.id as string, isHovered);
                if (entity.label instanceof LabelGraphics) {
                    entity.label.show = new CallbackProperty(() => isHovered, false);
                }
            }
        });

        // Only request render if states actually changed
        if (needsUpdate) {
            scene.requestRender();
        }
    }, []);

    const debouncedUpdateHoverStates = useMemo(
        () => debounce(updateHoverStates, 16),
        [updateHoverStates]
    );

    /** Handles click events on mentor points */
    const handleClick = useCallback((movement: { position: Cartesian2 }) => {
        if (!viewer) return;

        const pickedFeature = viewer.scene.pick(movement.position);
        if (pickedFeature && pickedFeature.id && pickedFeature.id.id) {
            const clickedMentor = mentors.find(m => m.id === pickedFeature.id.id);
            if (clickedMentor) {
                if (onMentorClick && !selectedMentor) {
                    onMentorClick(clickedMentor);
                } else {
                    setSelectedMentor(clickedMentor);
                }
            }
        }
    }, [viewer, mentors, onMentorClick, selectedMentor]);

    /** Initializes container dimensions and sets up resize observer */
    useEffect(() => {
        const container = cesiumContainer.current;
        if (!container) return;

        const checkContainer = () => {
            const { offsetWidth, offsetHeight } = container;
            if (offsetWidth > 0 && offsetHeight > 0) {
                setContainerReady(true);
                return true;
            }
            return false;
        };

        if (!checkContainer()) {
            const observer = new ResizeObserver(() => {
                if (checkContainer()) {
                    observer.disconnect();
                }
            });

            observer.observe(container);
            return () => observer.disconnect();
        }
    }, []);

    /** Updates mentor entities and sets up hover interactions */
    useEffect(() => {
        if (!viewer) return;

        if (mentorEntities.current) {
            viewer.entities.removeAll();
            mentorEntities.current = null;
        }

        hoverStates.current.clear();

        mentorEntities.current = new EntityCollection();

        const batchSize = 50;
        for (let i = 0; i < mentors.length; i += batchSize) {
            const batch = mentors.slice(i, i + batchSize);
            batch.forEach(mentor => {
                createMentorEntity(viewer, mentor);
            });
        }

        const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction((movement: { endPosition: Cartesian2 }) => {
            const now = Date.now();
            if (now - lastFrameTime.current < 1000 / frameRateLimit) return;
            lastFrameTime.current = now;

            debouncedUpdateHoverStates(viewer, movement, viewer.entities);
        }, ScreenSpaceEventType.MOUSE_MOVE);

        return () => {
            debouncedUpdateHoverStates.cancel();
            if (handler && !viewer.isDestroyed()) {
                handler.destroy();
            }
        };

    }, [viewer, mentors, createMentorEntity, debouncedUpdateHoverStates]);

    useEffect(() => {
        if (!viewer) return;

        const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
        const currentHoverStates = hoverStates.current;

        handler.setInputAction(
          debounce((movement: { endPosition: Cartesian2 }) => {
            if (!mentorEntities.current) return;
            updateHoverStates(viewer, movement, mentorEntities.current);
          }, 50),
          ScreenSpaceEventType.MOUSE_MOVE
        );

        return () => {
          handler.destroy();
          Array.from(currentHoverStates.keys()).forEach(id => {
            currentHoverStates.set(id, false);
          });
        };
    }, [viewer, updateHoverStates]);

    useEffect(() => {
        const currentHoverStates = hoverStates.current;
        return () => {
            if (viewer) {
                viewer.entities.removeAll();
                viewer.destroy();
            }
            currentHoverStates.clear();
            mentorEntities.current = null;
        };
    }, [viewer]);

    /** Sets up click handlers for mentor selection */
    useEffect(() => {
        if (!viewer) return;

        const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction(handleClick, ScreenSpaceEventType.LEFT_CLICK);

        return () => {
            if (!viewer.isDestroyed()) {
                handler.destroy();
            }
        };
    }, [viewer, handleClick]);

    /** Initializes Cesium viewer and sets up click handlers */
    useEffect(() => {
        const container = cesiumContainer.current;
        if (!containerReady || !container) return;

        let mounted = true;
        let currentViewer: Viewer | null = null;

        const initCesium = async (retryAttempt = 0) => {
            try {
                setDebugStatus('Checking WebGL support...');
                if (!checkWebGLSupport()) {
                    throw new Error('WebGL is not supported or enabled on your browser.');
                }

                setDebugStatus('Initializing globe...');
                window.CESIUM_BASE_URL = '/cesium';

                if (!Ion.defaultAccessToken) {
                    Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN!;
                }

                if (retryAttempt > 0) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }

                const viewer = new Viewer(container, {
                    animation: false,
                    baseLayerPicker: false,
                    fullscreenButton: false,
                    geocoder: false,
                    homeButton: false,
                    infoBox: false,
                    sceneModePicker: false,
                    selectionIndicator: false,
                    timeline: false,
                    navigationHelpButton: false,
                    navigationInstructionsInitiallyVisible: false,
                    scene3DOnly: true,
                    requestRenderMode: true,
                    maximumRenderTimeChange: Infinity,
                    targetFrameRate: 60,
                    terrain: undefined,
                    baseLayer: new ImageryLayer(new OpenStreetMapImageryProvider({
                        url: 'https://a.tile.openstreetmap.org/'
                    }), {}),
                    contextOptions: {
                        webgl: {
                            alpha: true,
                            failIfMajorPerformanceCaveat: false,
                            powerPreference: 'high-performance',
                            preserveDrawingBuffer: false,
                            antialias: true,
                        },
                    },
                    orderIndependentTranslucency: false,
                });

                currentViewer = viewer;

                if (!mounted) {
                    viewer.destroy();
                    return;
                }

                viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);

                const scene = viewer.scene;
                scene.globe.enableLighting = false;
                scene.globe.baseColor = Color.WHITE;
                scene.backgroundColor = Color.WHITE;
                scene.moon.show = false;
                scene.skyBox.show = false;
                scene.sun.show = false;
                scene.skyAtmosphere.show = false;
                scene.globe.showGroundAtmosphere = false;
                scene.globe.show = true;
                scene.globe.enableLighting = false;
                scene.globe.translucency.enabled = false;

                container.style.position = 'fixed';
                container.style.inset = '0';
                container.style.width = '100vw';
                container.style.height = '100vh';
                container.style.margin = '0';
                container.style.padding = '0';
                container.style.overflow = 'hidden';
                container.style.background = 'white';

                const viewerContainer = viewer.container as HTMLElement;
                viewerContainer.style.position = 'absolute';
                viewerContainer.style.inset = '0';
                viewerContainer.style.width = '100%';
                viewerContainer.style.height = '100%';
                viewerContainer.style.margin = '0';
                viewerContainer.style.padding = '0';
                viewerContainer.style.background = 'white';

                const canvas = viewer.canvas;
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.position = 'absolute';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.background = 'white';

                viewer.resize();
                setTimeout(() => {
                    if (mounted && viewer && !viewer.isDestroyed()) {
                        viewer.resize();
                        scene.requestRender();
                    }
                }, 100);

                const creditContainer = viewer.creditDisplay.container as HTMLElement;
                creditContainer.style.display = 'none';

                viewer.camera.setView({
                    destination: Cartesian3.fromDegrees(0, 20, 20000000),
                    orientation: {
                        heading: 0.0,
                        pitch: -CesiumMath.PI_OVER_TWO,
                        roll: 0.0
                    }
                });

                scene.requestRender();

                if (process.env.NODE_ENV === 'development') {
                    viewer.scene.debugShowFramesPerSecond = false;
                }

                setViewer(viewer);
                setIsLoading(false);
                setError(null);
                setRetryCount(0);

            } catch (error) {
                console.error('Error initializing Cesium:', error);

                if (mounted && retryAttempt < maxRetries) {
                    setDebugStatus(`Retrying initialization (Attempt ${retryAttempt + 1}/${maxRetries})...`);
                    setRetryCount(retryAttempt + 1);
                    await initCesium(retryAttempt + 1);
                } else if (mounted) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to initialize the globe';
                    setError(`Failed to load globe: ${errorMessage}. Please try refreshing the page.`);
                    setIsLoading(false);
                }
            }
        };

        initCesium();

        return () => {
            mounted = false;
            if (currentViewer && !currentViewer.isDestroyed()) {
                currentViewer.destroy();
                setViewer(null);
            }
        };
    }, [containerReady]);

    const checkWebGLSupport = (): boolean => {
        const canvas = document.createElement('canvas');
        let gl: WebGLRenderingContext | null = null;

        try {
            gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
        } catch {
            return false;
        }

        return !!gl;
    };

    if (!containerReady) {
        return (
            <div
                ref={cesiumContainer}
                className="fixed inset-0 w-screen h-screen bg-white"
                style={containerStyle}
            />
        );
    }

    if (isLoading) {
        return (
            <div
                ref={cesiumContainer}
                className="fixed inset-0 w-screen h-screen bg-white"
                style={containerStyle}
            >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-center">
                        <div className="mb-2">Loading 3D Globe{retryCount > 0 ? ` (Attempt ${retryCount}/${maxRetries})` : ''}...</div>
                        <div className="text-sm text-gray-400">{debugStatus}</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white p-4">
                <div className="max-w-md text-center">
                    <h3 className="text-xl font-semibold mb-4">Globe Loading Error</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            setIsLoading(true);
                            setRetryCount(0);
                            setDebugStatus('Retrying initialization...');
                            window.location.reload();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Retry Loading
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div
                ref={cesiumContainer}
                className="fixed inset-0 w-screen h-screen"
                style={containerStyle}
            >
                <style jsx global>{`
                    .cesium-viewer :is(.cesium-label, .cesium-label-background) {
                        border-radius: 8px;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                        transition: opacity 0.2s ease-in-out;
                    }
                `}</style>
            </div>
        </>
    );
} 