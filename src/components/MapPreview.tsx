import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapPreviewProps {
  location: string;
  apiKey: string;
}

export const MapPreview = ({ location, apiKey }: MapPreviewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  mapboxgl.accessToken = apiKey;

  useEffect(() => {
    if (!location) {
      setCoordinates(null);
      return;
    }

    const geocode = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            location
          )}.json?access_token=${apiKey}`
        );
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const coords: [number, number] = data.features[0].center;
          setCoordinates(coords);
        } else {
          setCoordinates(null);
        }
      } catch (error) {
        console.error('Error fetching geocoding data:', error);
        setCoordinates(null);
      }
    };

    geocode();
  }, [location, apiKey]);

  useEffect(() => {
    if (map.current || !mapContainer.current || !coordinates) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: coordinates,
      zoom: 9,
      interactive: false,
    });

    new mapboxgl.Marker().setLngLat(coordinates).addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [coordinates]);

  useEffect(() => {
    if (map.current && coordinates) {
      map.current.setCenter(coordinates);
    }
  }, [coordinates]);

  return (
    <div
      ref={mapContainer}
      className="h-full w-full rounded-md"
      style={{ display: coordinates ? 'block' : 'none' }}
    />
  );
};