import { useEffect, useState } from "react";
import { MapComponent } from "./components/map";
import {
  convertThemeWithThemeItemStateToTheme,
  convertThemeToThemeWithThemeItemState,
  initialThemeWithThemeItemState,
  Theme,
  LIGHT as lightTheme,
  DARK as darkTheme,
  WHITE as whiteTheme,
  BLACK as blackTheme,
  CONTRAST as contrastTheme,
  GRAYSCALE as grayscaleTheme,
  ThemeWithThemeItemState,
} from "./lib/theme";

export default function App() {
  const [customThemeWithThemeItemState, setCustomThemeWithThemeItemState] =
    useState<ThemeWithThemeItemState>(initialThemeWithThemeItemState);
  const [selectedTheme, setSelectedTheme] = useState<string>("light");
  const [customTheme, setCustomTheme] = useState<Partial<Theme>>(
    convertThemeWithThemeItemStateToTheme(customThemeWithThemeItemState)
  );
  const [previousTheme, setPreviousTheme] = useState<ThemeWithThemeItemState>(
    initialThemeWithThemeItemState
  );

  const themes: {
    [key: string]: { name: string; theme: Theme | Partial<Theme> }
   } = {
    "light": {
      name: "Light",
      theme: lightTheme,
    },
    "dark": {
      name: "Dark",
      theme: darkTheme,
    },
    "white": {
      name: "White",
      theme: whiteTheme,
    },
    "black": {
      name: "Black",
      theme: blackTheme,
    },
    "contrast": {
      name: "Contrast",
      theme: contrastTheme,
    },
    "grayscale":{
      name: "Grayscale",
      theme: grayscaleTheme,
    },
    "custom": {
      name: "Custom",
      theme: customTheme,
    },
   };

  useEffect(() => {
    setCustomTheme(
      convertThemeWithThemeItemStateToTheme(customThemeWithThemeItemState)
    );
  }, [customThemeWithThemeItemState]);

  const handleColorChange = (key: string, color: string) => {
    console.log(key, color);

    setCustomThemeWithThemeItemState((prevThemeWithThemeItemState) => ({
      ...prevThemeWithThemeItemState,
      [key]: {
        ...prevThemeWithThemeItemState[key],
        color: color,
      },
    }));
  };

  const handleNullChange = (key: string, checked: boolean) => {
    setCustomThemeWithThemeItemState((prevThemeWithThemeItemState) => ({
      ...prevThemeWithThemeItemState,
      [key]: {
        color: prevThemeWithThemeItemState[key].color,
        enabled: checked,
      },
    }));
  };

  const handleThemeSelect = (theme: Theme | Partial<Theme>) => {
    setPreviousTheme(customThemeWithThemeItemState);
    setCustomThemeWithThemeItemState(
      convertThemeToThemeWithThemeItemState(theme)
    );
  };

  function formatString(input: string): string {
    return input
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, function (match) {
        return match.toUpperCase();
      });
  }

  const generalKeys = [
    "background",
    "earth",
    "park_a",
    "park_b",
    "buildings",
    "hospital",
    "industrial",
    "school",
    "wood_a",
    "wood_b",
    "pedestrian",
    "scrub_a",
    "scrub_b",
    "glacier",
    "sand",
    "beach",
    "aerodrome",
    "runway",
    "major",
    "medium",
    "minor_a",
    "minor_b",
    "water",
    "pier",
    "military",
    "highway",
    "railway",
    "zoo",
  ];

  const advancedKeys = Object.keys(
    convertThemeWithThemeItemStateToTheme(initialThemeWithThemeItemState)
  ).filter((key) => !generalKeys.includes(key));


  return (
    <main className="bg-white h-full overflow-hidden">
      <div className="absolute w-screen h-dvh overflow-hidden">
        <MapComponent customTheme={customTheme} />
        <div className="bg-opacity-80 backdrop-blur bg-slate-100 text-xs text-center p-2 absolute bottom-0 right-0 rounded-lg m-2">
          MapLibre | OpenStreetMap contributors | Protomaps
        </div>
      </div>
      <div className="px-2 pt-2">
        <Header
          title="Basemap PMTiles styling"
          subtitle="Create your own theme for MapLibre GL and Protomaps"
        />
      </div>
      <div className="absolute bottom-8 sm:relative sm:bottom-0 w-full px-2 pb-2">
        <div className=" bg-white w-full bg-opacity-70 backdrop-blur-lg my-1 rounded-xl bottom-0">
          <Details summary="Preset themes">
            {Object.keys(themes).map((key, index) => (
              <div
                key={key}
                onClick={() => handleThemeSelect(themes[key].theme)}
                className="bg-slate-900 bg-opacity-80 backdrop-blur drop-shadow-sm mb-1 text-white py-2 px-3 mr-2 rounded-full cursor-pointer text-xs"
              >
                {themes[key].name}
              </div>
            ))}
          </Details>
          <Details summary="General">
            {generalKeys.map((key) => (
              <div
                key={key}
                className="text-xs mb-2 drop-shadow-sm flex flex-row mr-2 rounded-full bg-slate-200 py-1 px-3 items-center"
              >
                <input
                  type="checkbox"
                  className="mr-2 cursor-pointer"
                  checked={customThemeWithThemeItemState[key].enabled}
                  onChange={(e) => handleNullChange(key, e.target.checked)}
                />
                <label className="block mr-2">{formatString(key)}</label>
                <input
                  type="color"
                  value={customThemeWithThemeItemState[key].color}
                  onChange={(event) =>
                    handleColorChange(key, event.target.value)
                  }
                  className="w-7 h-7 bg-transparent"
                />
              </div>
            ))}
          </Details>
          <Details summary="Advanced">
            {advancedKeys.map((key) => (
              <div
                key={key}
                className="text-xs mb-2 drop-shadow-sm flex flex-row mr-2 rounded-full bg-slate-200 py-1 px-3 items-center"
              >
                <input
                  type="checkbox"
                  className="mr-2 cursor-pointer"
                  checked={customThemeWithThemeItemState[key].enabled}
                  onChange={(e) => handleNullChange(key, e.target.checked)}
                />
                <label className="block mr-2">{formatString(key)}</label>
                <input
                  type="color"
                  value={customThemeWithThemeItemState[key].color}
                  onChange={(event) =>
                    handleColorChange(key, event.target.value)
                  }
                  className="w-7 h-7 bg-transparent"
                />
              </div>
            ))}
          </Details>
          <Details summary="Output (custom theme)">
            <div className="bg-slate-200 p-2 my-2 rounded-lg text-xs">
              You can use the following custom theme with MapLibre GL JS and
              Protomaps by using{" "}
              <pre className="inline">layersWithPartialCustomTheme</pre> using
              npm packages
              <a
                className="text-blue-500"
                href="https://www.npmjs.com/package/protomaps-themes-base"
              >
                &nbsp;protomaps-themes-base
              </a>{" "}
              and{" "}
              <a
                className="text-blue-500"
                href="https://www.npmjs.com/package/maplibre-gl"
              >
                maplibre-gl
              </a>
              . Refer to this source code to see a sample implementation.
            </div>
            <pre className="p-2 bg-slate-200 text-xs rounded w-full">
              const customTheme ={" "}
              {JSON.stringify(
                convertThemeWithThemeItemStateToTheme(
                  customThemeWithThemeItemState
                ),
                null,
                2
              )}
              <br />
              const customLayer = <br />
              &nbsp;&nbsp;layersWithPartialCustomTheme(
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;"&lt;ENTER SOURCE HERE&gt;", <br />
              &nbsp;&nbsp;&nbsp;&nbsp;"light", <br />
              &nbsp;&nbsp;&nbsp;&nbsp;customTheme)
            </pre>
          </Details>
        </div>
      </div>
    </main>
  );
}


  interface HeaderProps {
    title: string;
    subtitle: string;
  }

  const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
    return (
      <header className="bg-slate-700 bg-opacity-80 backdrop-blur rounded-xl text-white p-3 flex justify-between items-center">
        <div className="items-center">
          <div className="text-md font-bold">{title}</div>
          <div className="text-xs">{subtitle}</div>
        </div>
        <a href="#" className="text-gray-300 hover:text-white">
          GitHub
        </a>
      </header>
    );
  };

  interface DetailsProps {
    summary: string;
    children: React.ReactNode;
  }

  const Details: React.FC<DetailsProps> = ({ summary, children }) => {
    return (
      <details className="py-2 px-3 border-b border-slate-900 border-opacity-10 text-sm">
        <summary>{summary}</summary>
        <div className="pt-2 flex flex-row flex-wrap max-h-60 overflow-y-auto">
          {children}
        </div>
      </details>
    );
  };