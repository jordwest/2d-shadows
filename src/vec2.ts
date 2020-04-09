export namespace Angle {
  export type T = number & { _angle: never };

  export function toUnitVector(angle: T): Vec2.T {
    return {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
  }

  export function add(angle: T, by: T): T {
    return (angle + by) as T;
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

  export function invert<C extends T>(vec: T): C {
    return {
      x: vec.x * -1,
      y: vec.y * -1,
    } as C;
  }

  export function scalarMult<C extends T>(vec: T, scalar: number): C {
    return {
      x: vec.x * scalar,
      y: vec.y * scalar,
    } as C;
  }
}

