"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon for webpack bundling
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const OFFICE_COORDS: [number, number] = [18.5076, 73.7918];

export default function LeafletMap() {
  return (
    <MapContainer
      center={OFFICE_COORDS}
      zoom={16}
      style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 5 }}
      zoomControl={true}
      attributionControl={false}
      id="live-leaflet-map"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <Marker position={OFFICE_COORDS} icon={defaultIcon}>
        <Popup>
          <b>SAP Headquarters Branch</b>
          <br />
          Office No. 6, K.P.C.S House,
          <br />
          Paud Road, Kothrud, Pune
        </Popup>
      </Marker>
    </MapContainer>
  );
}
