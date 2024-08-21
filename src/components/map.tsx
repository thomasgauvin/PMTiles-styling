"use client";

import Map from "react-map-gl/maplibre";
import { Protocol } from "pmtiles";
import maplibregl, { LayerSpecification } from "maplibre-gl";
import { useEffect, useState } from "react";
import layers, { layersWithPartialCustomTheme } from "protomaps-themes-base";

import { Theme } from "../lib/theme";

export const MapComponent = ({ customTheme }: { customTheme: Partial<Theme> }) => {

  const [swLoaded, setSwLoaded] = useState(false);
  
  useEffect(() => {
    let protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  useEffect(() => {
    const checkServiceWorker = async () => {
      const registration = await navigator.serviceWorker.getRegistration('/service-worker.js');

      console.log('Checking Service Worker registration...');
      // Check if the service worker is registered and active
      if (registration) {
        console.log('Service Worker is registered:', registration);
        setSwLoaded(true);
      } else {
        console.log('Service Worker is not registered');
        window.location.reload(); // Reload the page in case the service worker is not active (need service worker to be active for map to load)
      }
    };

    checkServiceWorker();
  }, []);

  useEffect(()=> {
    if ('serviceWorker' in navigator) {
      console.log('registering service worker')
      navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
              console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(error => {
              console.log('Service Worker registration failed:', error);
          });
    }
  }, []);

  return (
    <>
      {
        swLoaded ?
        <Map
        initialViewState={{
          longitude: -74.006,
          latitude: 40.7128,
          zoom: 12,
        }}
        mapStyle={{
          version: 8,
          sources: {
            protomaps: {
              type: "vector",
              url: "pmtiles:///world.pmtiles",
            },
            protomaps2: {
              type: "vector",
              url: "pmtiles:///nyc.pmtiles",
            },
          },
          glyphs:
            "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
          layers: [
            ...layersWithPartialCustomTheme(
              "protomaps",
              "light",
              customTheme
            ).filter((e) => {
              return !e.id.includes("background");
            }),
            ...layersWithPartialCustomTheme(
              "protomaps2",
              "light",
              customTheme
            ).filter((e) => {
              return !e.id.includes("background");
            }).map((e) => {
              return {
                ...e,
                id: `${e.id}-2`
              };
            }),
          ],
        }}
        mapLib={maplibregl}
        attributionControl={false}
      />
      :
      <div className="fixed inset-0 z-50 bg-white">
        
      </div>

      }

    </>
  );
};
