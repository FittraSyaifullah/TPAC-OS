import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle } from 'lucide-react';

// Add Mapbox CSS to the document head
const mapboxCssUrl = 'https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.css';
if (!document.querySelector(`link[href="${mapboxCssUrl}"]`)) {
  const link = document.createElement('link');
  link.href = mapboxCssUrl;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

interface MapPreviewProps {
  location: string;
  apiKey: string;
}

interface GeocodingResult {
  features: {
    center: [number, number];
  }[];
}

export const MapPreview = ({ location, apiKey }: MapPreviewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!location) {
      setCoordinates(null);
      setError(null);
      return;
    }

    const geocode = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            location,
          )}.json?access_token=${apiKey}&limit=1`,
        );
        const data: GeocodingResult = await response.json();
        if (data.features && data.features.length > 0) {
          setCoordinates(data.features[0].center as [number, number]);
        } else {
          setError('Location not found.');
          setCoordinates(null);
        }
      } catch (err) {
        setError('Failed to fetch location data.');
        console.error(err);
        setCoordinates(null);
      } finally {
        setLoading(false);
      }
    };

    geocode();
  }, [location, apiKey]);

  useEffect(() => {
    if (map.current || !mapContainer.current || !coordinates) return;

    mapboxgl.accessToken = apiKey;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: coordinates,
      zoom: 10,
      interactive: false,
    });

    new mapboxgl.Marker().setLngLat(coordinates).addTo(map.current);

    // Clean up on unmount
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [coordinates, apiKey]);

  // This effect handles map updates when coordinates change
  useEffect(() => {
    if (map.current && coordinates) {
      map.current.setCenter(coordinates);
    }
  }, [coordinates]);

  if (loading) {
    return <Skeleton className="h-48 w-full rounded-md mt-2" />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-2">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div
      ref={mapContainer}
      className="h-48 w-full rounded-md mt-2"
      style={{ display: coordinates ? 'block' : 'none' }}
    />
  );
};