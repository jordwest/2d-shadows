import { Vec2, Angle } from "./vec2";
import { Float32Cursor } from "./cursor";
import { Debug } from "./debug";

export namespace SilhouetteOccluder {
  export type T = {
    origin: Vec2.T;
    radius: number;
  };

  export function occlusionTriangles(
    pos: Float32Cursor,
    info: Float32Cursor,
    dist: Float32Cursor,
    occluder: T,
    lightPosition: Vec2.T,
    lightRadius: number
  ) {
    const angleToLight = Vec2.angleTo(lightPosition, occluder.origin);
    const offset = Vec2.scalarMult(
      Angle.toUnitVector(Angle.add(angleToLight, (Math.PI / 2) as Angle.T)),
      0.3
    );

    // Figure out the end points for each ray
    const occluderA = Vec2.add(occluder.origin, offset);
    const thetaRayA = Vec2.angleTo(lightPosition, occluderA);
    const endpointA = Vec2.add(
      lightPosition,
      Vec2.scalarMult(Angle.toUnitVector(thetaRayA), lightRadius)
    );

    const occluderB = Vec2.add(occluder.origin, Vec2.invert(offset));
    const thetaRayB = Vec2.angleTo(lightPosition, occluderB);
    const endpointB = Vec2.add(
      lightPosition,
      Vec2.scalarMult(Angle.toUnitVector(thetaRayB), lightRadius)
    );

    Debug.record("thetaRayA", thetaRayA);
    Debug.record("thetaRayB", thetaRayB);

    const startDist = Vec2.magnitude(
      Vec2.add(occluder.origin, Vec2.invert(lightPosition))
    );
    const endDist = startDist + 0.1;

    // Tri 1
    pos.vec2(occluderA);
    info.push2(thetaRayA, thetaRayB);
    dist.push2(startDist, endDist);

    pos.vec2(endpointA);
    info.push2(thetaRayA, thetaRayB);
    dist.push2(startDist, endDist);

    pos.vec2(occluderB);
    info.push2(thetaRayA, thetaRayB);
    dist.push2(startDist, endDist);

    // Tri 2
    pos.vec2(occluderB);
    info.push2(thetaRayA, thetaRayB);
    dist.push2(startDist, endDist);

    pos.vec2(endpointA);
    info.push2(thetaRayA, thetaRayB);
    dist.push2(startDist, endDist);

    pos.vec2(endpointB);
    info.push2(thetaRayA, thetaRayB);
    dist.push2(startDist, endDist);
  }
}
