"use client";

import Map from "react-map-gl/maplibre";
import { Protocol } from "pmtiles";
import maplibregl, { LayerSpecification } from "maplibre-gl";
import { useEffect, useState } from "react";
import layers, { layersWithPartialCustomTheme } from "protomaps-themes-base";

import { Theme } from "../lib/theme";

export const MapComponent = ({ customTheme }: { customTheme: Partial<Theme> }) => {
  useEffect(() => {
    let protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
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
              url: "pmtiles://http://192.168.1.166:8080/OUTPUT-world.pmtiles",
            },
            protomaps2: {
              type: "vector",
              url: "pmtiles://http://192.168.1.166:8080/OUTPUT.pmtiles",
            },
          },
          glyphs:
            "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
          layers: [
            ...layersWithPartialCustomTheme("protomaps", "light", customTheme),
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
