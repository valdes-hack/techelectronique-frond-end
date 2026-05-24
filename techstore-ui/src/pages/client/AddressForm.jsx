import React, { useState, useRef } from 'react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, Navigation } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

// Liste des bibliothèques à charger
const libraries = ['places'];

const AddressForm = ({ onAddressSelected, theme }) => {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: libraries,
    });

    const [autocomplete, setAutocomplete] = useState(null);
    const [addressData, setAddressData] = useState({
        label: '', street: '', city: '', region: '', phone: ''
    });

    const onLoad = (auto) => setAutocomplete(auto);

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            
            // On décode l'adresse de Google pour ton format de BD ✨
            let street = "";
            let city = "";
            let region = "";

            place.address_components.forEach(component => {
                const types = component.types;
                if (types.includes("route")) street = component.long_name;
                if (types.includes("locality")) city = component.long_name;
                if (types.includes("administrative_area_level_1")) region = component.long_name;
            });

            const newAddr = {
                ...addressData,
                street: street || place.name,
                city: city,
                region: region,
            };

            setAddressData(newAddr);
            if (onAddressSelected) onAddressSelected(newAddr);
        }
    };

    if (!isLoaded) return <div className="p-4 opacity-50 italic">Chargement des cartes...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* 🔍 BARRE DE RECHERCHE GOOGLE MAPS */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest ml-4">Rechercher votre adresse</label>
                <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Commencez à taper votre adresse à Douala, Yaoundé..."
                            className={`w-full p-5 rounded-3xl outline-none border-2 transition-all font-bold text-sm ${
                                theme === 'dark' ? 'bg-black/20 border-white/5 text-white focus:border-indigo-500' : 'bg-gray-50 border-transparent focus:border-indigo-600'
                            }`}
                        />
                        <Navigation className="absolute right-5 top-5 text-indigo-500 opacity-50" size={18} />
                    </div>
                </Autocomplete>
            </div>

            {/* FORMULAIRE DÉTAILLÉ (Auto-rempli) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <Input label="NOM DE L'EMPLACEMENT" placeholder="ex: Appartement, Bureau..." value={addressData.label} onChange={e => setAddressData({...addressData, label: e.target.value})} theme={theme}/>
                </div>
                <Input label="RUE / QUARTIER" value={addressData.street} onChange={e => setAddressData({...addressData, street: e.target.value})} theme={theme} />
                <Input label="TÉLÉPHONE" placeholder="+237" value={addressData.phone} onChange={e => setAddressData({...addressData, phone: e.target.value})} theme={theme}/>
                <Input label="VILLE" value={addressData.city} theme={theme} onChange={e => setAddressData({...addressData, city: e.target.value})} />
                <Input label="RÉGION" value={addressData.region} theme={theme} onChange={e => setAddressData({...addressData, region: e.target.value})} />
            </div>
            
            <Button onClick={() => onAddressSelected(addressData)} className="w-full py-5 shadow-2xl shadow-indigo-500/20">
                Confirmer et utiliser cette adresse
            </Button>
        </div>
    );
};

export default AddressForm;