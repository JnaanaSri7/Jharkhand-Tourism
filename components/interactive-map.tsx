"use client";

import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker } from "react-leaflet";
import L, { LatLngExpression, Layer, Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Feature, FeatureCollection } from "geojson";
import jharkhandTouristPlaces from "../db/places";

// Fix for default marker icon
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface Place {
  _id?: string;
  district: string;
  name: string;
  lat: number;
  lon: number;
  streetView?: string;
  imageId?: string;
  imageName?: string;
}

export default function InteractiveMap() {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [districtColors, setDistrictColors] = useState<{ [key: string]: string }>({});
  const [markers, setMarkers] = useState<Place[]>([]);
  const [places] = useState<Place[]>(jharkhandTouristPlaces);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<Layer[]>([]);
  const hoveredLayerRef = useRef<Layer | null>(null);
  const selectedLayerRef = useRef<Layer | null>(null);
  const [streetViewUrl, setStreetViewUrl] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const colors = [
    "#FF6B6B", "#FFBE0B", "#FF9F1C", "#FFE066", "#F72585", "#FF89A0",
    "#EF476F", "#FF6363", "#4ECDC4", "#2EC4B6", "#06D6A0", "#4CC9F0",
    "#3A86FF", "#4361EE", "#8338EC", "#7209B7", "#FFD166", "#F4D35E",
    "#F9C74F", "#90BE6D", "#43AA8B", "#F9844A", "#F8961E", "#F94144"
  ];

  const shuffleArray = (array: string[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const assignDistrictColors = (features: Feature[]) => {
    if (!features) return {};
    const shuffledColors = shuffleArray(colors);
    const colorMap: { [key: string]: string } = {};
    features.forEach((feature, index) => {
      const districtName = feature.properties?.dtname || `district_${index}`;
      colorMap[districtName] = shuffledColors[index % shuffledColors.length];
    });
    return colorMap;
  };

  // Function to get image path for a place
  const getImagePath = (placeName: string) => {
    // Try different extensions in order of preference
    const extensions = ['jpg', 'jpeg', 'png', 'JPG'];
    
    // First try exact match - images should be in public/arvrPics folder
    for (const ext of extensions) {
      const imagePath = `/arvrPics/${placeName}.${ext}`;
      return imagePath;
    }
    
    return null;
  };

  // Function to handle image loading errors
  const handleImageError = (placeName: string, currentExt: string) => {
    const extensions = ['jpg', 'jpeg', 'png', 'JPG'];
    const currentIndex = extensions.indexOf(currentExt);
    
    if (currentIndex < extensions.length - 1) {
      // Try next extension
      const nextExt = extensions[currentIndex + 1];
      return `/arvrPics/${placeName}.${nextExt}`;
    }
    
    // All extensions failed, mark as error
    setImageError(prev => ({ ...prev, [placeName]: true }));
    return null;
  };

  useEffect(() => {
    // Fetch GeoJSON data
    fetch("/JHARKHAND_DISTRICTS.geojson")
      .then((r) => r.json())
      .then((data: FeatureCollection) => {
        setGeoData(data);
        if (data && data.features) {
          setDistrictColors(assignDistrictColors(data.features));
          if (mapRef.current && data.features.length > 0) {
            const geoJsonLayer = L.geoJSON(data);
            const bounds = geoJsonLayer.getBounds();
            mapRef.current.fitBounds(bounds, { padding: [20, 20] });

            setTimeout(() => {
              mapRef.current?.invalidateSize();
            }, 100);
          }
        }
      })
      .catch((err) => console.error("Failed to load geojson:", err));

    // Places data is now loaded from local file
    console.log('Places loaded from local file:', places.length, 'places');
    setIsLoading(false);
  }, []);

  const getLayerElement = (layer: any) => {
    return layer._path || null;
  };

  const resetAll = () => {
    layerGroupRef.current.forEach((l) => {
      const element = getLayerElement(l);
      if (element) {
        element.classList.remove("hovered", "selected", "dimmed");
      }
    });
    selectedLayerRef.current = null;
    setMarkers([]);
    setSelectedDistrict(null);
    setSelectedPlace(null);
  };

  const reapplySelection = () => {
    if (!selectedDistrict) return;
    layerGroupRef.current.forEach((l: any) => {
      const districtName = l.feature?.properties?.dtname;
      const element = getLayerElement(l);
      if (districtName === selectedDistrict && element) {
        element.classList.add("selected");
        selectedLayerRef.current = l;
      } else if (element) {
        element.classList.add("dimmed");
      }
    });
  };

  const onEachFeature = (feature: Feature, layer: Layer) => {
    const districtName = feature.properties?.dtname || "Unknown";
    const districtColor = districtColors[districtName] || "#FF6B6B";

    (layer as L.Path).setStyle({
      fillColor: districtColor,
      weight: 1,
      opacity: 1,
      color: "#333333",
      fillOpacity: 0.85,
      className: "district-shape"
    });

    if (selectedDistrict === districtName) {
      const element = getLayerElement(layer);
      if (element) {
        element.classList.add("selected");
      }
      selectedLayerRef.current = layer;
      layerGroupRef.current.forEach((l) => {
        if (l !== layer) {
          const otherElement = getLayerElement(l);
          if (otherElement) {
            otherElement.classList.add("dimmed");
          }
        }
      });
    }

    layer.bindTooltip(districtName, {
      permanent: true,
      direction: "center",
      className: "district-label"
    });

    layerGroupRef.current.push(layer);

    layer.on({
      mouseover: () => {
        if (selectedLayerRef.current) return;
        hoveredLayerRef.current = layer;
        const element = getLayerElement(layer);
        if (element) element.classList.add("hovered");

        layerGroupRef.current.forEach((l) => {
          if (l !== layer) {
            const otherElement = getLayerElement(l);
            if (otherElement) {
              otherElement.classList.add("dimmed");
            }
          }
        });
        (layer as any).bringToFront();
      },
      mouseout: () => {
        if (selectedLayerRef.current) return;
        const element = getLayerElement(layer);
        if (element) element.classList.remove("hovered");
        layerGroupRef.current.forEach((l) => {
          const otherElement = getLayerElement(l);
          if (otherElement) {
            otherElement.classList.remove("dimmed");
          }
        });
      },
      click: () => {
        if (selectedLayerRef.current) {
          const prevElement = getLayerElement(selectedLayerRef.current);
          if (prevElement) prevElement.classList.remove("selected");
          selectedLayerRef.current = null;
        }

        const element = getLayerElement(layer);
        const isAlreadySelected = element && element.classList.contains("selected");

        resetAll();

        if (!isAlreadySelected) {
          if (element) element.classList.add("selected");
          selectedLayerRef.current = layer;
          setSelectedDistrict(districtName);
          layerGroupRef.current.forEach((l) => {
            if (l !== layer) {
              const otherElement = getLayerElement(l);
              if (otherElement) otherElement.classList.add("dimmed");
            }
          });

          // Set markers immediately since places data is local
          const districtPlaces = places
            .filter((place) => place.district === districtName && place.streetView)
            .slice(0, 2);
          console.log(`Setting markers for ${districtName}:`, districtPlaces.length, 'places');
          setMarkers(districtPlaces);
        } else {
          setMarkers([]);
        }
      }
    });
  };

  const handleDeselect = () => {
    resetAll();
  };


  return (
    <div style={{ height: "70vh", width: "70%", position: "relative", margin: "20px auto" }}>
      {isLoading && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1000,
          background: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "20px",
          borderRadius: "10px",
          textAlign: "center"
        }}>
          <div>Loading map data...</div>
        </div>
      )}
      <div style={{ position: "relative", height: "100%", width: "100%", borderRadius: "16px", overflow: "hidden" }}>
        {streetViewUrl ? (
          <div className="street-view-container" style={{ height: "100%", width: "100%", position: "relative" }}>
            <iframe
              src={streetViewUrl}
              style={{ border: 0, width: "100%", height: "100%" }}
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : (
          <MapContainer
            center={[23.6, 85.3] as LatLngExpression}
            zoom={7.5}
            zoomSnap={0.1}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
            dragging={false}
            touchZoom={false}
            doubleClickZoom={false}
            scrollWheelZoom={false}
            boxZoom={false}
            keyboard={false}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">Carto</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              subdomains={["a", "b", "c", "d"]}
            />
            {geoData && <GeoJSON data={geoData} onEachFeature={onEachFeature} />}

            {markers.map((place, idx) => (
              <Marker
                key={idx}
                position={[place.lat, place.lon] as LatLngExpression}
                eventHandlers={{
                  click: () => setSelectedPlace(place)
                }}
              />
            ))}
          </MapContainer>
        )}

        {selectedPlace && (
          <div className="info-box">
            <div className="info-box-header">
              <span className="info-box-title">{selectedPlace.name}</span>
              <button
                className="info-box-close"
                onClick={() => setSelectedPlace(null)}
              >
                ×
              </button>
            </div>
            <div className="info-box-content">
              <div className="info-box-image">
                {!imageError[selectedPlace.name] ? (
                  <img 
                    src={getImagePath(selectedPlace.name) || ''}
                    alt={selectedPlace.name}
                    style={{ 
                      width: '100%', 
                      height: '120px', 
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      const currentSrc = img.src;
                      const fileName = currentSrc.split('/').pop();
                      const currentExt = fileName?.split('.').pop() || 'jpg';
                      
                      const nextSrc = handleImageError(selectedPlace.name, currentExt);
                      if (nextSrc) {
                        img.src = nextSrc;
                      } else {
                        // Show fallback
                        img.style.display = 'none';
                      }
                    }}
                    onLoad={() => {
                      console.log(`Image loaded successfully: ${selectedPlace.name}`);
                    }}
                  />
                ) : null}
                
                {imageError[selectedPlace.name] && (
                  <div style={{ 
                    width: '100%', 
                    height: '120px', 
                    background: 'linear-gradient(135deg, #800020, #1e3a8a)', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f4d03f',
                    fontSize: '14px',
                    textAlign: 'center'
                  }}>
                    📍 {selectedPlace.name}
                  </div>
                )}
              </div>
              {selectedPlace.streetView && (
                <button
                  className="explore-button"
                  onClick={() => {
                    setStreetViewUrl(selectedPlace.streetView!);
                    setSelectedPlace(null);
                  }}
                >
                  Explore Now!
                </button>
              )}
            </div>
          </div>
        )}

        <div
          className="deselect-button"
          onClick={() => {
            if (streetViewUrl) {
              setStreetViewUrl(null);
              setTimeout(() => reapplySelection(), 50);
            } else {
              handleDeselect();
            }
          }}
          title={streetViewUrl ? "Back to Map" : "Deselect district"}
          style={{
            display: selectedLayerRef.current || streetViewUrl ? "flex" : "none",
            position: "absolute",
            top: "15px",
            right: "15px"
          }}
        >
          ×
        </div>
      </div>
    </div>
  );
}

