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
              // url: "pmtiles://http://localhost:8080/world.pmtiles",
              // tiles: ["http://localhost:8787/world/{z}/{x}/{y}.mvt"],
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
