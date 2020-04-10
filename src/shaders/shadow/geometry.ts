import { Vec2, Angle } from "~/geometry/vec2";
import { Float32Cursor } from "~/util/cursor";
import { Debug } from "~util/debug";

export namespace SimpleOccluder {
  export type T = {
    a: Vec2.T;
    b: Vec2.T;
    alpha: number;
  };

  export function occlusionTriangles(
    data: Float32Cursor,
    alpha: Float32Cursor,
    occluder: T,
    lightPosition: Vec2.T,
    lightRadius: number
  ) {
    // Find the position of the occluder relative to the light source
    const occluderRelative = {
      a: Vec2.add(occluder.a, Vec2.invert(lightPosition)),
      b: Vec2.add(occluder.b, Vec2.invert(lightPosition)),
    };
    //Debug.record("light source", lightPosition);
    //Debug.record("occluder", occluder);
    Debug.record("occluder relative y", occluderRelative.a.y);

    // Figure out the end points for each ray
    const thetaRayA = Vec2.angle(occluderRelative.a);
    const endpointA = Vec2.scalarMult(
      Angle.toUnitVector(thetaRayA),
      lightRadius
    );

    const thetaRayB = Vec2.angle(occluderRelative.b);
    const endpointB = Vec2.scalarMult(
      Angle.toUnitVector(thetaRayB),
      lightRadius
    );

    // Triangle 1
    data.vec2(occluderRelative.a);
    alpha.push(occluder.alpha);

    data.vec2(endpointA);
    alpha.push(occluder.alpha);

    data.vec2(occluderRelative.b);
    alpha.push(occluder.alpha);

    // Triangle 2
    data.vec2(occluderRelative.b);
    alpha.push(occluder.alpha);

    data.vec2(endpointA);
    alpha.push(occluder.alpha);

    data.vec2(endpointB);
    alpha.push(occluder.alpha);
  }
}
