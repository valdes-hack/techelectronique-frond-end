import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix pour l'icône du marqueur par défaut qui disparaît parfois avec React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const MapPicker = ({ onLocationSelected }) => {
    // Coordonnées par défaut sur Bafoussam (5.47, 10.41)
    const [position, setPosition] = useState([5.4777, 10.4176]);

    // Détecter le déplacement du marqueur ou le clic sur la carte
    function LocationMarker() {
        const map = useMapEvents({
            async click(e) {
                const { lat, lng } = e.latlng;
                setPosition([lat, lng]);
                
                // Appel API pour transformer les coordonnées en vraie adresse (Reverse Geocoding)
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                const data = await res.json();
                
                if (data.address) {
                    onLocationSelected({
                        street: data.address.road || data.address.suburb || data.display_name.split(',')[0],
                        city: data.address.city || data.address.town || "Bafoussam",
                        region: data.address.state || "Ouest", // Là on ne se trompera plus ! ✨
                    });
                }
            },
        });

        return <Marker position={position} />;
    }

    return (
        <div className="h-64 w-full rounded-[2rem] overflow-hidden border-2 border-indigo-100 shadow-inner my-4">
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker />
            </MapContainer>
            <p className="text-[9px] font-bold text-center p-2 opacity-50 uppercase tracking-widest">Cliquez sur la carte pour définir votre position exacte 📍</p>
        </div>
    );
};

export default MapPicker;