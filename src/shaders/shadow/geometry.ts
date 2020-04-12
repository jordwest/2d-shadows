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
    blurPositions: Float32Cursor,
    blurTriPositions: Float32Cursor,
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

    // Figure out the end points for each ray
    const theta = {
      a: Vec2.angle(occluderRelative.a),
      b: Vec2.angle(occluderRelative.b),
    };
    //Debug.record("thetas", theta);

    //if (theta.a < theta.b) {
    //  const tempOcc = occluderRelative.a;
    //  occluderRelative.a = occluderRelative.b;
    //  occluderRelative.b = tempOcc;

    //  const tempTheta = theta.a;
    //  theta.a = theta.b;
    //  theta.b = tempTheta;
    //}

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

    const endpointA = Vec2.scalarMult(
      Angle.toUnitVector(theta.a),
      shadowEndDistA
    );
    const endpointB = Vec2.scalarMult(
      Angle.toUnitVector(theta.b),
      shadowEndDistB
    );
    const startPointA = Vec2.scalarMult(
      Angle.toUnitVector(theta.a),
      shadowStartDistA
    );
    const startPointB = Vec2.scalarMult(
      Angle.toUnitVector(theta.b),
      shadowStartDistB
    );

    const angleBetween = Vec2.angleBetween(endpointA, endpointB);
    const distBetween = Vec2.magnitude(
      Vec2.add(endpointA, Vec2.invert(endpointB))
    );
    const endpointNormal = Angle.toUnitVector(
      (angleBetween - Math.PI) as Angle.T
    );

    // Average the endpoints to find the midpoint between them
    const endMidpoint = Vec2.scalarMult(Vec2.add(endpointA, endpointB), 0.5);

    let blur = 0.05;
    const blurFactorA = blur * shadowEndDistA;
    Debug.record("blurFactorA", blurFactorA);
    Debug.record("distBetween", distBetween);
    const shadowOuterA = Vec2.add(
      endpointA,
      Vec2.scalarMult(endpointNormal, blur * shadowEndDistA)
    );
    const shadowInnerA =
      blurFactorA > distBetween / 2
        ? endMidpoint
        : Vec2.add(
            endpointA,
            Vec2.scalarMult(
              Vec2.invert(endpointNormal),
              blur * shadowEndDistA * 0.5
            )
          );

    const blurFactorB = blur * shadowEndDistB;
    const shadowOuterB = Vec2.add(
      endpointB,
      Vec2.scalarMult(Vec2.invert(endpointNormal), blur * shadowEndDistB)
    );
    const shadowInnerB =
      blurFactorB > distBetween / 2
        ? endMidpoint
        : Vec2.add(
            endpointB,
            Vec2.scalarMult(endpointNormal, blur * shadowEndDistB * 0.5)
          );

    // Record vertex info that's the same for the whole instance.
    // To be replaced when instanced rendering is implemented
    const instanceInfo = () => {
      alpha.push(occluder.alpha);
    };

    // Triangle 1
    data.vec2(startPointA);
    instanceInfo();

    data.vec2(shadowInnerA);
    instanceInfo();

    data.vec2(startPointB);
    instanceInfo();

    // Shadow blur left hand side
    blurPositions.vec2(occluderRelative.a);
    blurTriPositions.push2(0, 0);

    blurPositions.vec2(shadowInnerA);
    blurTriPositions.push2(1, 1);

    blurPositions.vec2(shadowOuterA);
    blurTriPositions.push2(-1, 1);

    // Triangle 2
    data.vec2(startPointB);
    instanceInfo();

    data.vec2(shadowInnerA);
    instanceInfo();

    data.vec2(shadowInnerB);
    instanceInfo();

    // Shadow blur right hand side
    blurPositions.vec2(occluderRelative.b);
    blurTriPositions.push2(0, 0);

    blurPositions.vec2(shadowInnerB);
    blurTriPositions.push2(1, 1);

    blurPositions.vec2(shadowOuterB);
    blurTriPositions.push2(-1, 1);
  }
}
