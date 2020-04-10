import { Vec2, Angle } from "~/geometry/vec2";

export namespace SimpleOccluder {
  export type T = {
    a: Vec2.T;
    b: Vec2.T;
  };

  export function occlusionTriangles(
    out: Float32Array,
    offset: number,
    occluder: T,
    lightPosition: Vec2.T,
    lightRadius: number
  ) {
    // Figure out the end points for each ray
    const thetaRayA = Vec2.angleTo(lightPosition, occluder.a);
    const endpointA = Vec2.add(
      lightPosition,
      Vec2.scalarMult(Angle.toUnitVector(thetaRayA), lightRadius)
    );

    const thetaRayB = Vec2.angleTo(lightPosition, occluder.b);
    const endpointB = Vec2.add(
      lightPosition,
      Vec2.scalarMult(Angle.toUnitVector(thetaRayB), lightRadius)
    );

    // Tri 1
    out[offset] = occluder.a.x;
    out[offset + 1] = occluder.a.y;
    out[offset + 2] = endpointA.x;
    out[offset + 3] = endpointA.y;
    out[offset + 4] = occluder.b.x;
    out[offset + 5] = occluder.b.y;
    // Tri 2
    out[offset + 6] = occluder.b.x;
    out[offset + 7] = occluder.b.y;
    out[offset + 8] = endpointA.x;
    out[offset + 9] = endpointA.y;
    out[offset + 10] = endpointB.x;
    out[offset + 11] = endpointB.y;
  }
}
