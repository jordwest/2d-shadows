import { Vec2, Angle } from "~/geometry/vec2";
import { Float32Cursor } from "~/util/cursor";
import { Debug } from "~util/debug";

export namespace SimpleOccluder {
  export type T = {
    a: Vec2.T;
    b: Vec2.T;
    bottom: number;
    top: number;
    alpha: number;
  };

  function calcShadowEdge(
    occlusionRelative: Vec2.T,
    occlusionTop: number,
    lightHeight: number
  ) {
    let distanceToOcclusion = Vec2.magnitude(occlusionRelative);
    if (occlusionTop < lightHeight) {
      const deltaHeight = lightHeight - occlusionTop;
      // Light is higher than the top of this object, so let it peek over

      const angleToTopOfOcclusion = Math.atan(
        distanceToOcclusion / deltaHeight
      );
      return Math.tan(angleToTopOfOcclusion) * lightHeight;
    } else {
      // Edge goes to infinity
      return Infinity;
    }
  }

  export function occlusionTriangles(
    data: Float32Cursor,
    alpha: Float32Cursor,
    angularRange: Float32Cursor,
    occluder: T,
    lightPosition: Vec2.T,
    lightHeight: number,
    lightRadius: number
  ) {
    // Find the position of the occluder relative to the light source
    const occluderRelative = {
      a: Vec2.add(occluder.a, Vec2.invert(lightPosition)),
      b: Vec2.add(occluder.b, Vec2.invert(lightPosition)),
    };
    Debug.record("occluder relative y", occluderRelative.a.y);

    let shadowStartDistA = calcShadowEdge(
      occluderRelative.a,
      occluder.bottom,
      lightHeight
    );
    if (shadowStartDistA == Infinity) {
      shadowStartDistA = lightRadius;
    }

    let shadowStartDistB = calcShadowEdge(
      occluderRelative.b,
      occluder.bottom,
      lightHeight
    );
    if (shadowStartDistB == Infinity) {
      shadowStartDistB = lightRadius;
    }

    let shadowEndDistA = calcShadowEdge(
      occluderRelative.a,
      occluder.top,
      lightHeight
    );
    if (shadowEndDistA == Infinity) {
      shadowEndDistA = lightRadius;
    }

    let shadowEndDistB = calcShadowEdge(
      occluderRelative.b,
      occluder.top,
      lightHeight
    );
    if (shadowEndDistB == Infinity) {
      shadowEndDistB = lightRadius;
    }

    const blurAngle = 0.03;

    // Figure out the end points for each ray
    const thetaRayA = Vec2.angle(occluderRelative.a);
    const thetaRayB = Vec2.angle(occluderRelative.b);

    const endpointA = Vec2.scalarMult(
      Angle.toUnitVector(thetaRayA as Angle.T),
      shadowEndDistA
    );
    const endpointB = Vec2.scalarMult(
      Angle.toUnitVector(thetaRayB as Angle.T),
      shadowEndDistB
    );
    const startPointA = Vec2.scalarMult(
      Angle.toUnitVector(thetaRayA),
      shadowStartDistA
    );
    const startPointB = Vec2.scalarMult(
      Angle.toUnitVector(thetaRayB),
      shadowStartDistB
    );

    // Triangle 1
    data.vec2(startPointA);
    alpha.push(occluder.alpha);
    angularRange.push2(thetaRayA, thetaRayB);

    data.vec2(endpointA);
    alpha.push(occluder.alpha);
    angularRange.push2(thetaRayA, thetaRayB);

    data.vec2(startPointB);
    alpha.push(occluder.alpha);
    angularRange.push2(thetaRayA, thetaRayB);

    // Triangle 2
    data.vec2(startPointB);
    alpha.push(occluder.alpha);
    angularRange.push2(thetaRayA, thetaRayB);

    data.vec2(endpointA);
    alpha.push(occluder.alpha);
    angularRange.push2(thetaRayA, thetaRayB);

    data.vec2(endpointB);
    alpha.push(occluder.alpha);
    angularRange.push2(thetaRayA, thetaRayB);
  }
}
