import { mockRouteCandidates } from "@route5/shared";
import { describe, expect, it } from "vitest";
import {
  getRouteBounds,
  routeLineColors,
  toRouteLineFeatureCollection,
  toSelectedRouteFeatureCollection
} from "../src/features/route-map/route-map-model";

describe("route map model", () => {
  it("turns the five route candidates into GeoJSON line features", () => {
    const featureCollection = toRouteLineFeatureCollection(mockRouteCandidates);

    expect(featureCollection.features).toHaveLength(5);
    expect(featureCollection.features[0]?.geometry.type).toBe("LineString");
    expect(featureCollection.features[0]?.properties.routeId).toBe("flat-loop");
    expect(featureCollection.features[0]?.properties.color).toBe(routeLineColors[0]);
  });

  it("keeps only the selected route for the highlight layer", () => {
    const featureCollection = toSelectedRouteFeatureCollection(
      mockRouteCandidates,
      "waterside-loop"
    );

    expect(featureCollection.features).toHaveLength(1);
    expect(featureCollection.features[0]?.properties.routeId).toBe("waterside-loop");
  });

  it("returns bounds around the selected route", () => {
    const bounds = getRouteBounds(mockRouteCandidates, "flat-loop");

    expect(bounds).toEqual([139.7671, 35.6795, 139.7702, 35.6821]);
  });
});
