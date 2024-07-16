"use client";

import Map from "react-map-gl/maplibre";
import { Protocol } from "pmtiles";
import maplibregl, { LayerSpecification } from "maplibre-gl";
import { useEffect, useState } from "react";
import layers, { layersWithPartialCustomTheme } from "protomaps-themes-base";

import { Theme } from "../lib/theme";

if ("serviceWorker" in navigator) {
  const registration = navigator.serviceWorker.register("/sw2.js").then(
    function (registration) {
      console.log(
        "Service Worker registration successful with scope: ",
        registration.scope
      );
    },
    function (err) {
      console.log("Service Worker registration failed: ", err);
    }
  );
}

export const MapComponent = ({
  customTheme,
}: {
  customTheme: Partial<Theme>;
}) => {
  useEffect(() => {
    let protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .getRegistrations()
          .then((registrations) => {
            const sw2Registered = registrations.some((registration) =>
              registration.active?.scriptURL.endsWith("/sw2.js")
            );

            if (!sw2Registered) {
              window.location.reload();
            }
          })
          .catch((error) => {
            console.error(
              "Error checking service worker registrations:",
              error
            );
          });
      });
    }
  }, []);

  return (
    <>
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
              // url: "pmtiles://http://localhost:8080/world.pmtiles",
              // tiles: [
              //   "https://pmtiles-cloudflare.tomsprojects.workers.dev/world/{z}/{x}/{y}.mvt",
              // ],
              // tiles: [
              //   "https://protomaps-host.tomsprojects.workers.dev/world/{z}/{x}/{y}.mvt",
              // ],
              // url: "pmtiles://http://localhost:8787/world/{z}/{x}/{y}.mvt",
              url: "pmtiles://world.pmtiles",
            },
            protomaps2: {
              type: "vector",
              // url: "pmtiles://http://localhost:8080/nyc.pmtiles",
              // url: "pmtiles://http://localhost:8787/nyc/{z}/{x}/{y}.mvt",
              // tiles: ["http://localhost:8787/nyc/{z}/{x}/{y}.mvt"],
              url: "pmtiles://nyc.pmtiles",
              // tiles: [
              //   "https://pmtiles-cloudflare.tomsprojects.workers.dev/nyc/{z}/{x}/{y}.mvt",
              // ],
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
            ...layersWithPartialCustomTheme("protomaps2", "light", customTheme)
              .filter((e) => {
                return !e.id.includes("background");
              })
              .map((e) => {
                e.id = e.id + "2";
                return e;
              }),
          ],
        }}
        mapLib={maplibregl}
        attributionControl={false}
      />
    </>
  );
};
