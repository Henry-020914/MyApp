import { Camera, GeoJSONSource, Layer, Map } from "@maplibre/maplibre-react-native";
import type { RouteCandidate } from "@route5/shared";
import { useMemo } from "react";
import { Text, View } from "react-native";
import {
  getRouteBounds,
  routeMapStyleUrl,
  toRouteLineFeatureCollection,
  toSelectedRouteFeatureCollection
} from "./route-map-model";

type RouteMapProps = {
  routes: RouteCandidate[];
  selectedRouteId?: string;
};

export function RouteMap({ routes, selectedRouteId }: RouteMapProps) {
  const routeFeatures = useMemo(
    () => toRouteLineFeatureCollection(routes),
    [routes]
  );
  const selectedRouteFeatures = useMemo(
    () => toSelectedRouteFeatureCollection(routes, selectedRouteId),
    [routes, selectedRouteId]
  );
  const routeBounds = useMemo(
    () => getRouteBounds(routes, selectedRouteId),
    [routes, selectedRouteId]
  );

  return (
    <View
      style={{
        backgroundColor: "#DDE6E1",
        borderColor: "#D0DAD4",
        borderCurve: "continuous",
        borderRadius: 8,
        borderWidth: 1,
        height: 280,
        overflow: "hidden"
      }}
    >
      <Map
        attribution
        compass={false}
        logo={false}
        mapStyle={routeMapStyleUrl}
        scaleBar={false}
        style={{ flex: 1 }}
      >
        {routeBounds ? (
          <Camera
            bounds={routeBounds}
            duration={400}
            padding={{ bottom: 34, left: 28, right: 28, top: 34 }}
          />
        ) : null}

        <GeoJSONSource id="route5-all-routes" data={routeFeatures}>
          <Layer
            id="route5-all-route-lines"
            type="line"
            source="route5-all-routes"
            paint={{
              "line-color": ["get", "color"],
              "line-opacity": 0.38,
              "line-width": 3
            }}
            layout={{
              "line-cap": "round",
              "line-join": "round"
            }}
          />
        </GeoJSONSource>

        <GeoJSONSource id="route5-selected-route" data={selectedRouteFeatures}>
          <Layer
            id="route5-selected-route-line"
            type="line"
            source="route5-selected-route"
            paint={{
              "line-color": "#174F45",
              "line-opacity": 0.98,
              "line-width": 7
            }}
            layout={{
              "line-cap": "round",
              "line-join": "round"
            }}
          />
        </GeoJSONSource>
      </Map>

      <View
        pointerEvents="none"
        style={{
          backgroundColor: "rgba(255,255,255,0.86)",
          borderRadius: 6,
          bottom: 10,
          left: 10,
          paddingHorizontal: 8,
          paddingVertical: 5,
          position: "absolute"
        }}
      >
        <Text selectable style={{ color: "#26342D", fontSize: 12 }}>
          5本
        </Text>
      </View>
    </View>
  );
}
