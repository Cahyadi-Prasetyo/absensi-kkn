"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

interface MapPickerProps {
  latitude: number;
  longitude: number;
  radius: number;
  onChange: (lat: number, lng: number) => void;
}

// Sub-component to handle map click events
function MapClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Sub-component to center map when coordinates change externally (e.g. GPS button)
function MapCenterHandler({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export default function MapPicker({ latitude, longitude, radius, onChange }: MapPickerProps) {
  const position: [number, number] = [latitude, longitude];

  // Drag end handler for marker
  const eventHandlers = React.useMemo(
    () => ({
      dragend(e: any) {
        const marker = e.target;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onChange(latLng.lat, latLng.lng);
        }
      },
    }),
    [onChange]
  );

  return (
    <div className="w-full h-[280px] rounded-xl overflow-hidden border border-slate-200 shadow-inner z-10 relative">
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={position}
          draggable={true}
          eventHandlers={eventHandlers}
        />
        <Circle
          center={position}
          radius={radius}
          pathOptions={{
            color: "#363CD5",
            fillColor: "#363CD5",
            fillOpacity: 0.15,
            weight: 1.5,
          }}
        />
        <MapClickHandler onChange={onChange} />
        <MapCenterHandler lat={latitude} lng={longitude} />
      </MapContainer>
      <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur px-2.5 py-1 rounded-md border border-slate-200/80 text-[10px] font-bold text-slate-600 shadow-sm z-[1000] pointer-events-none select-none">
        Klik peta atau geser marker untuk memindahkan posisi posko
      </div>
    </div>
  );
}
