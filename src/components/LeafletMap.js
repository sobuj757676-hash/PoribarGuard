"use client";

import { useEffect, useRef, useState } from 'react';

/**
 * LeafletMap — A dynamically-loaded OpenStreetMap component using Leaflet.
 * Used by MapTab to display the child's real-time location.
 * 
 * Why dynamic import? Leaflet accesses `window` during initialization,
 * which crashes in Next.js SSR. By loading it only on the client side,
 * we avoid the "window is not defined" error.
 * 
 * Props:
 * - latitude, longitude: GPS coordinates
 * - accuracy: GPS accuracy in meters (used for accuracy circle radius)
 * - locationName: human-readable name of the location
 * - speed: speed in km/h
 * - isOnline: whether the child device is currently online
 * - childName: name of the child
 */
export default function LeafletMap({ latitude, longitude, accuracy, locationName, speed, isOnline, childName }) {
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const circleRef = useRef(null);
    const containerRef = useRef(null);
    const [leafletLoaded, setLeafletLoaded] = useState(false);

    const lat = latitude || 23.1634; // Default: Jashore, Bangladesh
    const lng = longitude || 89.2182;
    const acc = accuracy || 50;

    useEffect(() => {
        // Dynamic import of Leaflet (client-only)
        let isMounted = true;

        const loadLeaflet = async () => {
            const L = (await import('leaflet')).default;

            // Inject Leaflet CSS via <link> tag (dynamic import of CSS is unreliable)
            if (!document.querySelector('link[href*="leaflet"]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }

            if (!isMounted || !containerRef.current) return;

            // Fix Leaflet default icon paths (broken in webpack/next.js)
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            // Initialize map
            if (!mapRef.current) {
                const map = L.map(containerRef.current, {
                    center: [lat, lng],
                    zoom: 16,
                    zoomControl: true,
                    attributionControl: false,
                });

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                }).addTo(map);

                // Custom pulsing marker icon
                const pulsingIcon = L.divIcon({
                    className: 'leaflet-pulsing-marker',
                    html: `<div style="
                        width: 18px; height: 18px;
                        background: ${isOnline ? '#10b981' : '#9ca3af'};
                        border: 3px solid white;
                        border-radius: 50%;
                        box-shadow: 0 0 0 ${isOnline ? '8px rgba(16, 185, 129, 0.3)' : '4px rgba(156, 163, 175, 0.2)'};
                        ${isOnline ? 'animation: pulse 2s ease-in-out infinite;' : ''}
                    "></div>
                    <style>
                        @keyframes pulse {
                            0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                            50% { box-shadow: 0 0 0 12px rgba(16, 185, 129, 0); }
                        }
                    </style>`,
                    iconSize: [18, 18],
                    iconAnchor: [9, 9],
                });

                markerRef.current = L.marker([lat, lng], { icon: pulsingIcon })
                    .addTo(map)
                    .bindPopup(`<b>${childName}</b><br/>${locationName || 'Location'}<br/>${speed ? `Speed: ${speed.toFixed(1)} km/h` : 'Stationary'}`);

                // Accuracy circle
                circleRef.current = L.circle([lat, lng], {
                    radius: acc,
                    color: '#10b981',
                    fillColor: '#10b981',
                    fillOpacity: 0.1,
                    weight: 1,
                }).addTo(map);

                mapRef.current = map;
            }

            setLeafletLoaded(true);
        };

        loadLeaflet();

        return () => {
            isMounted = false;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markerRef.current = null;
                circleRef.current = null;
            }
        };
    }, []); // Only initialize once

    // Update marker position when coords change
    useEffect(() => {
        if (!mapRef.current || !markerRef.current || !circleRef.current) return;
        if (!latitude || !longitude) return;

        const newPos = [latitude, longitude];
        markerRef.current.setLatLng(newPos);
        circleRef.current.setLatLng(newPos);
        circleRef.current.setRadius(accuracy || 50);

        markerRef.current.setPopupContent(
            `<b>${childName}</b><br/>${locationName || 'Location'}<br/>${speed ? `Speed: ${speed.toFixed(1)} km/h` : 'Stationary'}`
        );

        // Smoothly pan to new position
        mapRef.current.panTo(newPos, { animate: true, duration: 1 });

    }, [latitude, longitude, accuracy, speed, locationName, childName]);

    return (
        <div
            ref={containerRef}
            style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
        />
    );
}
