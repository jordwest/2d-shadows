import { Vec2, Angle } from "~/geometry/vec2";
import { Float32Cursor } from "~/util/cursor";

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

    // Triangle 1
    data.vec2(occluder.a);
    alpha.push(occluder.alpha);

    data.vec2(endpointA);
    alpha.push(occluder.alpha);

    data.vec2(occluder.b);
    alpha.push(occluder.alpha);

    // Triangle 2
    data.vec2(occluder.b);
    alpha.push(occluder.alpha);

    data.vec2(endpointA);
    alpha.push(occluder.alpha);

    data.vec2(endpointB);
    alpha.push(occluder.alpha);
  }
}
