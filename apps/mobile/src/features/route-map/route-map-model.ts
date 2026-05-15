import type { RouteCandidate } from "@route5/shared";
import type { FeatureCollection, LineString } from "geojson";

export type RouteLineProperties = {
  routeId: string;
  name: string;
  color: string;
};

export type RouteLineFeatureCollection = FeatureCollection<
  LineString,
  RouteLineProperties
>;

export type RouteBounds = [
  west: number,
  south: number,
  east: number,
  north: number
];

export const routeLineColors = [
  "#247A6B",
  "#D28A16",
  "#3F6FB6",
  "#B84E7B",
  "#6E5BB8"
] as const;

export const routeMapStyleUrl = "https://demotiles.maplibre.org/style.json";

export const toRouteLineFeatureCollection = (
  routes: RouteCandidate[]
): RouteLineFeatureCollection => ({
  type: "FeatureCollection",
  features: routes.map((route, index) => ({
    type: "Feature",
    id: route.id,
    properties: {
      routeId: route.id,
      name: route.name,
      color: routeLineColors[index % routeLineColors.length] ?? routeLineColors[0]
    },
    geometry: route.geometry
  }))
});

export const toSelectedRouteFeatureCollection = (
  routes: RouteCandidate[],
  selectedRouteId: string | undefined
): RouteLineFeatureCollection =>
  toRouteLineFeatureCollection(
    routes.filter((route) => route.id === selectedRouteId)
  );

export const getRouteBounds = (
  routes: RouteCandidate[],
  selectedRouteId?: string
): RouteBounds | undefined => {
  const visibleRoutes = routes.filter((route) => route.id === selectedRouteId);
  const routesForBounds = visibleRoutes.length > 0 ? visibleRoutes : routes;
  const coordinates = routesForBounds.flatMap((route) => route.geometry.coordinates);

  if (coordinates.length === 0) {
    return undefined;
  }

  const lngs = coordinates.map(([lng]) => lng);
  const lats = coordinates.map(([, lat]) => lat);

  return [
    Math.min(...lngs),
    Math.min(...lats),
    Math.max(...lngs),
    Math.max(...lats)
  ];
};
