import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search } from 'lucide-react';

const MapSelector = ({ 
  lat, 
  lng, 
  onLocationChange, 
  direccion, 
  onDireccionChange,
  radioPermitido = 100 
}) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const autocompleteRef = useRef(null);
  const searchInputRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Cargar Google Maps API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const center = { lat: lat || 19.4326, lng: lng || -99.1332 }; // CDMX por defecto

    // Inicializar mapa
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
    });

    // Crear marcador
    const marker = new window.google.maps.Marker({
      position: center,
      map,
      draggable: true,
      title: 'Ubicación del In House'
    });
    markerRef.current = marker;

    // Crear círculo de radio permitido
    const circle = new window.google.maps.Circle({
      strokeColor: '#3B82F6',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#3B82F6',
      fillOpacity: 0.2,
      map,
      center,
      radius: radioPermitido
    });
    circleRef.current = circle;

    // Evento de arrastre del marcador
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      const newLat = position.lat();
      const newLng = position.lng();
      
      onLocationChange(newLat, newLng);
      circle.setCenter(position);
      
      // Geocodificación inversa
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: position }, (results, status) => {
        if (status === 'OK' && results[0]) {
          onDireccionChange(results[0].formatted_address);
        }
      });
    });

    // Click en el mapa
    map.addListener('click', (e) => {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      
      marker.setPosition(e.latLng);
      circle.setCenter(e.latLng);
      onLocationChange(newLat, newLng);
      
      // Geocodificación inversa
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: e.latLng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          onDireccionChange(results[0].formatted_address);
        }
      });
    });

    // Autocomplete para búsqueda
    if (searchInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current);
      autocomplete.bindTo('bounds', map);
      autocompleteRef.current = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry || !place.geometry.location) {
          return;
        }

        const newLat = place.geometry.location.lat();
        const newLng = place.geometry.location.lng();

        map.setCenter(place.geometry.location);
        marker.setPosition(place.geometry.location);
        circle.setCenter(place.geometry.location);
        
        onLocationChange(newLat, newLng);
        onDireccionChange(place.formatted_address);
      });
    }

    return () => {
      if (marker) marker.setMap(null);
      if (circle) circle.setMap(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, radioPermitido]);

  // Actualizar círculo cuando cambia el radio
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radioPermitido);
    }
  }, [radioPermitido]);

  // Actualizar posición cuando cambian lat/lng externamente
  useEffect(() => {
    if (markerRef.current && lat && lng) {
      const newPosition = { lat, lng };
      markerRef.current.setPosition(newPosition);
      if (circleRef.current) {
        circleRef.current.setCenter(newPosition);
      }
    }
  }, [lat, lng]);

  const obtenerUbicacionActual = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLat = position.coords.latitude;
          const newLng = position.coords.longitude;
          
          onLocationChange(newLat, newLng);
          
          if (markerRef.current) {
            const newPosition = { lat: newLat, lng: newLng };
            markerRef.current.setPosition(newPosition);
            markerRef.current.getMap().setCenter(newPosition);
            if (circleRef.current) {
              circleRef.current.setCenter(newPosition);
            }
          }

          // Geocodificación inversa
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
              onDireccionChange(results[0].formatted_address);
            }
          });
        },
        (error) => {
          console.error('Error al obtener ubicación:', error);
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Buscar dirección..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Botón de ubicación actual */}
      <button
        type="button"
        onClick={obtenerUbicacionActual}
        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <MapPin size={20} />
        Usar mi ubicación actual
      </button>

      {/* Mapa */}
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border border-gray-300"
      />

      {/* Información */}
      <div className="text-sm text-gray-600">
        <p>• Haz clic en el mapa o arrastra el marcador para seleccionar la ubicación</p>
        <p>• El círculo azul indica el radio permitido ({radioPermitido}m)</p>
      </div>
    </div>
  );
};

export default MapSelector;
