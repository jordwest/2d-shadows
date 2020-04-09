export namespace Angle {
  export type T = number & { _angle: never };

  export function toUnitVector(angle: T): Vec2.T {
    return {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
  }
}

export namespace Vec2 {
  export type T = {
    x: number;
    y: number;
  };

  export function add<C extends T>(a: C, b: C): C {
    return { x: a.x + b.x, y: a.y + b.y } as C;
  }

  export function angleTo(origin: T, target: T): Angle.T {
    return Math.atan2(target.y - origin.y, target.x - origin.x) as Angle.T;
  }

  export function scalarMult(vec: T, scalar: number) {
    return {
      x: vec.x * scalar,
      y: vec.y * scalar,
    };
  }
}

