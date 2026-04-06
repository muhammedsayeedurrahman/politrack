'use client';
import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';

// Dynamic import - SSR disabled for Leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

import { INDIA_CENTER, MAP_DEFAULT_ZOOM, getRiskLevel } from '@/lib/constants';

// Deterministic mock locations across Indian cities
const RISK_POINTS = [
  { id: '1', name: 'Rajesh Sharma', risk: 85, lat: 28.61, lng: 77.23, city: 'Delhi' },
  { id: '2', name: 'Golden Bridge Constructions', risk: 72, lat: 19.08, lng: 72.88, city: 'Mumbai' },
  { id: '3', name: 'Vikram Singh', risk: 63, lat: 12.97, lng: 77.59, city: 'Bangalore' },
  { id: '4', name: 'Sunrise Realty Group', risk: 91, lat: 13.08, lng: 80.27, city: 'Chennai' },
  { id: '5', name: 'Amit Gupta', risk: 45, lat: 22.57, lng: 88.36, city: 'Kolkata' },
  { id: '6', name: 'Metro Development Corp', risk: 78, lat: 17.39, lng: 78.49, city: 'Hyderabad' },
  { id: '7', name: 'Priya Mehta', risk: 55, lat: 18.52, lng: 73.86, city: 'Pune' },
  { id: '8', name: 'PrimeSteel Industries', risk: 82, lat: 26.91, lng: 75.79, city: 'Jaipur' },
  { id: '9', name: 'Suresh Verma', risk: 38, lat: 26.85, lng: 80.95, city: 'Lucknow' },
  { id: '10', name: 'Ganga Port Services', risk: 67, lat: 23.02, lng: 72.57, city: 'Ahmedabad' },
  { id: '11', name: 'Deepak Reddy', risk: 76, lat: 21.15, lng: 79.09, city: 'Nagpur' },
  { id: '12', name: 'Indus Mining Corp', risk: 88, lat: 25.60, lng: 85.12, city: 'Patna' },
];

function getRiskMarkerColor(score: number): string {
  if (score >= 70) return '#ef4444';
  if (score >= 50) return '#f97316';
  if (score >= 30) return '#eab308';
  return '#22c55e';
}

export function RiskMap() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MapPin size={16} />
          Geospatial Risk Map
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden rounded-b-lg">
        <div className="h-[300px] sm:h-[400px] w-full relative" role="img" aria-label="Interactive geospatial risk map showing entity risk scores across Indian cities. High risk entities are shown in red, medium in orange, and low in green.">
          <span className="sr-only">
            Map displays {RISK_POINTS.length} risk-scored entities across India. Highest risk: {RISK_POINTS.reduce((max, p) => p.risk > max.risk ? p : max, RISK_POINTS[0]).name} ({RISK_POINTS.reduce((max, p) => p.risk > max.risk ? p : max, RISK_POINTS[0]).risk}/100).
          </span>
          <MapContainer
            center={[INDIA_CENTER.lat, INDIA_CENTER.lng]}
            zoom={MAP_DEFAULT_ZOOM}
            className="h-full w-full z-0"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {RISK_POINTS.map((point) => (
              <CircleMarker
                key={point.id}
                center={[point.lat, point.lng]}
                radius={Math.max(8, point.risk / 8)}
                pathOptions={{
                  fillColor: getRiskMarkerColor(point.risk),
                  color: getRiskMarkerColor(point.risk),
                  weight: 2,
                  opacity: 0.8,
                  fillOpacity: 0.4,
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">{point.name}</p>
                    <p className="text-muted-foreground">{point.city}</p>
                    <p>Risk Score: <span className="font-bold" style={{ color: getRiskMarkerColor(point.risk) }}>{point.risk}</span></p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}
