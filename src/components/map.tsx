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
      try {
        const response = await fetch('/checkSw');
        console.log(response);
        console.log(response.headers.get('X-Sw-Tag'))

        // Check if the response status is 202 and the X-Sw-Tag header is present
        if (response.status === 202 && response.headers.get('X-Sw-Tag') === 'Served by Service Worker') {
          console.log('Service worker is active');
          setSwLoaded(true);
        } else {
          console.log('Service worker is not active, reloading the page...');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error checking service worker:', error);
        window.location.reload(); // Reload the page in case of an error
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

const useCheckServiceWorker = () => {
  const [swStatus, setSwStatus] = useState(null);

  useEffect(() => {
      const checkServiceWorker = async () => {
          try {
              const response = await fetch('/checkSw');
              const text = await response.text();
              
              if (response.status === 200 && text.trim() === 'A-OK') {
                  setSwStatus('A-OK');
              } else {
                  setSwStatus('failed');
              }
          } catch (error) {
              console.error('Error checking Service Worker status:', error);
              setSwStatus('error');
          }
      };

      checkServiceWorker();
  }, []);

  return swStatus;
};