import { Vec2, Angle } from "./vec2";
import { Float32Cursor } from "./cursor";

export namespace SilhouetteOccluder {
  export type T = {
    a: Vec2.T;
    b: Vec2.T;
  };

  export function occlusionTriangles(
    pos: Float32Cursor,
    info: Float32Cursor,
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
    pos.vec2(occluder.a), info.push(0.0);

    pos.vec2(endpointA);
    info.push(0.0);

    pos.vec2(occluder.b);
    info.push(1.0);

    // Tri 2
    pos.vec2(occluder.b);
    info.push(1.0);

    pos.vec2(endpointA);
    info.push(0.0);

    pos.vec2(endpointB);
    info.push(1.0);
  }
}
