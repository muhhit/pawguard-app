import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MapPin, Navigation, Plus, Lock } from 'lucide-react-native';
import { useLocation, LocationData } from '@/hooks/location-store';
import { Pet } from '@/hooks/pet-store';
// import { getLocationForUser, type UserType } from '@/utils/locationPrivacy';
type UserType = 'owner' | 'public' | 'finder';

// Mock function for now to avoid h3-js encoding issues
const getLocationForUser = (petId: string, userType: UserType, lat: number, lng: number) => {
  return {
    lat,
    lng,
    precision: userType === 'owner' ? 'exact' as const : userType === 'finder' ? 'medium' as const : 'fuzzy' as const,
    isDelayed: userType !== 'owner'
  };
};
import { useAuth } from '@/hooks/auth-store';

import { MapViewProps } from './MapView';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoib2ctIiwiYSI6ImNtZjRmbm40aDA0bzIybHNremg5ajRoanQifQ.3y-bv35IQB2WBRbN6eeB9Q';

export default function MapViewWeb({ 
  style,
  onLocationSelect, 
  showAddLocationButton = false, 
  centerLocation,
  pets = [],
  enableClustering = false,
  enableHeatmap = false,
  userType = 'public'
}: MapViewProps) {
  const { user } = useAuth();
  const { 
    currentLocation, 
    getCurrentLocation, 
    calculateDistance, 
    permissions,
    requestPermissions,
    isLoading 
  } = useLocation();
  
  const [petDistances, setPetDistances] = useState<Record<string, number>>({});
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  // Calculate distances to pets when location changes
  useEffect(() => {
    if (currentLocation && pets.length > 0) {
      const distances: Record<string, number> = {};
      pets.forEach(pet => {
        if (pet.last_location) {
          const distance = calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            pet.last_location.lat,
            pet.last_location.lng
          );
          distances[pet.id] = distance;
        }
      });
      setPetDistances(distances);
    }
  }, [currentLocation, pets, calculateDistance]);

  const handleGetCurrentLocation = useCallback(async () => {
    try {
      if (!permissions.foreground) {
        const granted = await requestPermissions();
        if (!granted) {
          alert('Location permission is required to use this feature.');
          return;
        }
      }

      await getCurrentLocation();
    } catch (error) {
      console.error('Error getting current location:', error);
      alert('Unable to get your current location. Please check your browser settings and try again.');
    }
  }, [permissions.foreground, requestPermissions, getCurrentLocation]);

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  // Get initial region
  const getInitialRegion = () => {
    const location = centerLocation || currentLocation;
    if (location) {
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        zoom: 14
      };
    }
    // Default to Istanbul if no location
    return {
      latitude: 41.0082,
      longitude: 28.9784,
      zoom: 10
    };
  };

  const region = getInitialRegion();

  // Create markers array
  const markers = [];
  
  // Add current location marker
  if (currentLocation) {
    markers.push({
      id: 'current-location',
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      title: 'Your Location',
      description: currentLocation.address || 'Current location',
      color: '#45B7D1'
    });
  }

  // Add pet markers with privacy-adjusted locations
  pets.forEach(pet => {
    if (pet.last_location) {
      // Determine user type for this pet
      const petUserType = user?.id === pet.owner_id ? 'owner' : userType;
      
      // Get privacy-adjusted location
      const processedLocation = getLocationForUser(
        pet.id,
        petUserType,
        pet.last_location.lat,
        pet.last_location.lng
      );
      
      const privacyIndicator = processedLocation.precision !== 'exact' ? ' 🔒' : '';
      const precisionText = processedLocation.precision === 'exact' ? 'Exact location' :
                           processedLocation.precision === 'medium' ? 'Nearby area' : 'General area';
      
      markers.push({
        id: pet.id,
        latitude: processedLocation.lat,
        longitude: processedLocation.lng,
        title: `${pet.name} (Lost)${privacyIndicator}`,
        description: `${pet.type} • Reward: ${pet.reward_amount} • ${precisionText}`,
        color: processedLocation.precision === 'exact' ? '#FF6B6B' : '#FFA500',
        precision: processedLocation.precision
      });
    }
  });

  // Add selected location marker
  if (selectedLocation) {
    markers.push({
      id: 'selected-location',
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      title: 'Selected Location',
      description: 'Tap to confirm this location',
      color: '#10B981'
    });
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Pet Tracker Map</title>
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet">
        <script src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"></script>
        <style>
            body { margin: 0; padding: 0; }
            #map { position: absolute; top: 0; bottom: 0; width: 100%; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            mapboxgl.accessToken = '${MAPBOX_TOKEN}';
            
            const map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [${region.longitude}, ${region.latitude}],
                zoom: ${region.zoom}
            });

            // Add navigation control
            map.addControl(new mapboxgl.NavigationControl());

            // Add markers
            const markers = ${JSON.stringify(markers)};
            const petMarkers = markers.filter(m => m.id !== 'current-location' && m.id !== 'selected-location');
            const otherMarkers = markers.filter(m => m.id === 'current-location' || m.id === 'selected-location');
            
            // Add clustering for pet markers if enabled and we have 50+ pets
            const enableClustering = ${enableClustering} && petMarkers.length >= 50;
            
            if (enableClustering) {
                // Add pet markers as a clustered source
                map.on('load', () => {
                    map.addSource('pets', {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: petMarkers.map(marker => ({
                                type: 'Feature',
                                properties: {
                                    title: marker.title,
                                    description: marker.description,
                                    color: marker.color
                                },
                                geometry: {
                                    type: 'Point',
                                    coordinates: [marker.longitude, marker.latitude]
                                }
                            }))
                        },
                        cluster: true,
                        clusterMaxZoom: 14,
                        clusterRadius: 50
                    });
                    
                    // Add cluster circles
                    map.addLayer({
                        id: 'clusters',
                        type: 'circle',
                        source: 'pets',
                        filter: ['has', 'point_count'],
                        paint: {
                            'circle-color': [
                                'step',
                                ['get', 'point_count'],
                                '#FF6B6B',
                                100,
                                '#f1f075',
                                750,
                                '#f28cb1'
                            ],
                            'circle-radius': [
                                'step',
                                ['get', 'point_count'],
                                20,
                                100,
                                30,
                                750,
                                40
                            ]
                        }
                    });
                    
                    // Add cluster count labels
                    map.addLayer({
                        id: 'cluster-count',
                        type: 'symbol',
                        source: 'pets',
                        filter: ['has', 'point_count'],
                        layout: {
                            'text-field': '{point_count_abbreviated}',
                            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                            'text-size': 12
                        },
                        paint: {
                            'text-color': '#ffffff'
                        }
                    });
                    
                    // Add unclustered points
                    map.addLayer({
                        id: 'unclustered-point',
                        type: 'circle',
                        source: 'pets',
                        filter: ['!', ['has', 'point_count']],
                        paint: {
                            'circle-color': '#FF6B6B',
                            'circle-radius': 8,
                            'circle-stroke-width': 2,
                            'circle-stroke-color': '#fff'
                        }
                    });
                    
                    // Click events for clusters
                    map.on('click', 'clusters', (e) => {
                        const features = map.queryRenderedFeatures(e.point, {
                            layers: ['clusters']
                        });
                        const clusterId = features[0].properties.cluster_id;
                        map.getSource('pets').getClusterExpansionZoom(
                            clusterId,
                            (err, zoom) => {
                                if (err) return;
                                map.easeTo({
                                    center: features[0].geometry.coordinates,
                                    zoom: zoom
                                });
                            }
                        );
                    });
                    
                    // Click events for unclustered points
                    map.on('click', 'unclustered-point', (e) => {
                        const coordinates = e.features[0].geometry.coordinates.slice();
                        const { title, description } = e.features[0].properties;
                        
                        new mapboxgl.Popup()
                            .setLngLat(coordinates)
                            .setHTML(\`<h3>\${title}</h3><p>\${description}</p>\`)
                            .addTo(map);
                    });
                    
                    // Change cursor on hover
                    map.on('mouseenter', 'clusters', () => {
                        map.getCanvas().style.cursor = 'pointer';
                    });
                    map.on('mouseleave', 'clusters', () => {
                        map.getCanvas().style.cursor = '';
                    });
                    map.on('mouseenter', 'unclustered-point', () => {
                        map.getCanvas().style.cursor = 'pointer';
                    });
                    map.on('mouseleave', 'unclustered-point', () => {
                        map.getCanvas().style.cursor = '';
                    });
                });
            } else {
                // Add individual markers
                markers.forEach(marker => {
                    const popup = new mapboxgl.Popup({ offset: 25 })
                        .setHTML(\`<h3>\${marker.title}</h3><p>\${marker.description}</p>\`);
                        
                    new mapboxgl.Marker({ color: marker.color })
                        .setLngLat([marker.longitude, marker.latitude])
                        .setPopup(popup)
                        .addTo(map);
                });
            }
            
            // Add heatmap for high activity areas if enabled
            if (${enableHeatmap} && petMarkers.length > 10) {
                map.on('load', () => {
                    map.addSource('pet-heatmap', {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: petMarkers.map(marker => ({
                                type: 'Feature',
                                properties: {
                                    weight: 1
                                },
                                geometry: {
                                    type: 'Point',
                                    coordinates: [marker.longitude, marker.latitude]
                                }
                            }))
                        }
                    });
                    
                    map.addLayer({
                        id: 'pet-heatmap',
                        type: 'heatmap',
                        source: 'pet-heatmap',
                        maxzoom: 15,
                        paint: {
                            'heatmap-weight': [
                                'interpolate',
                                ['linear'],
                                ['get', 'weight'],
                                0, 0,
                                6, 1
                            ],
                            'heatmap-intensity': [
                                'interpolate',
                                ['linear'],
                                ['zoom'],
                                0, 1,
                                15, 3
                            ],
                            'heatmap-color': [
                                'interpolate',
                                ['linear'],
                                ['heatmap-density'],
                                0, 'rgba(33,102,172,0)',
                                0.2, 'rgb(103,169,207)',
                                0.4, 'rgb(209,229,240)',
                                0.6, 'rgb(253,219,199)',
                                0.8, 'rgb(239,138,98)',
                                1, 'rgb(178,24,43)'
                            ],
                            'heatmap-radius': [
                                'interpolate',
                                ['linear'],
                                ['zoom'],
                                0, 2,
                                15, 20
                            ],
                            'heatmap-opacity': [
                                'interpolate',
                                ['linear'],
                                ['zoom'],
                                7, 1,
                                15, 0
                            ]
                        }
                    }, 'waterway-label');
                });
            }
            
            // Add other markers (current location, selected location)
            otherMarkers.forEach(marker => {
                const popup = new mapboxgl.Popup({ offset: 25 })
                    .setHTML(\`<h3>\${marker.title}</h3><p>\${marker.description}</p>\`);
                    
                new mapboxgl.Marker({ color: marker.color })
                    .setLngLat([marker.longitude, marker.latitude])
                    .setPopup(popup)
                    .addTo(map);
            });

            // Handle map clicks for location selection
            ${showAddLocationButton ? `
            map.on('click', (e) => {
                const { lng, lat } = e.lngLat;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'locationSelect',
                    latitude: lat,
                    longitude: lng
                }));
            });
            ` : ''}

            // Fit bounds to show all markers if there are any
            if (markers.length > 1) {
                const bounds = new mapboxgl.LngLatBounds();
                markers.forEach(marker => {
                    bounds.extend([marker.longitude, marker.latitude]);
                });
                map.fitBounds(bounds, { padding: 50 });
            }
        </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'locationSelect' && onLocationSelect) {
        const newLocation: LocationData = {
          latitude: data.latitude,
          longitude: data.longitude,
          address: `${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`,
          timestamp: Date.now(),
          accuracy: 0
        };
        setSelectedLocation(newLocation);
        onLocationSelect(newLocation);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
      
      {/* Map controls */}
      <View style={styles.mapControls}>
        {!currentLocation && (
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={handleGetCurrentLocation}
            disabled={isLoading}
          >
            <Navigation color="#FFFFFF" size={20} />
          </TouchableOpacity>
        )}
      </View>

      {/* Add location button */}
      {showAddLocationButton && (
        <View style={styles.addLocationContainer}>
          <TouchableOpacity style={styles.addLocationButton}>
            <Plus color="#FFFFFF" size={20} />
            <Text style={styles.addLocationText}>
              {selectedLocation ? 'Location Selected' : 'Tap on map to select location'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Get location button if no current location */}
      {!currentLocation && (
        <View style={styles.addLocationContainer}>
          <TouchableOpacity 
            style={styles.locationButton} 
            onPress={handleGetCurrentLocation}
            disabled={isLoading}
          >
            <Navigation color="#FFFFFF" size={20} />
            <Text style={styles.locationButtonText}>
              {isLoading ? 'Getting Location...' : 'Get My Location'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  controlButton: {
    backgroundColor: '#FF6B6B',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addLocationContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  addLocationButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addLocationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  locationButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});