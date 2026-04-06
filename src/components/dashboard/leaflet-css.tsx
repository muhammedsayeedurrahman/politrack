'use client';
import { useEffect } from 'react';

export function LeafletCSS() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);
  return null;
}
