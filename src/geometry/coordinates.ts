import { Vec2 } from "./vec2";

export namespace ScreenCoords {
  export type T = Vec2.T & { _screenCoord: never };

  export function fromCanvasEvent(e: { offsetX: number; offsetY: number }) {
    return { x: e.offsetX, y: e.offsetY } as T;
  }
}

export namespace GlCoords {
  export type T = Vec2.T & { _screenCoord: never };

  export function fromScreenCoords(
    v: ScreenCoords.T,
    screenDimensions: { width: number; height: number }
  ): GlCoords.T {
    return {
      x: (v.x / screenDimensions.width) * 2.0 - 1.0,
      y: -((v.y / screenDimensions.height) * 2.0 - 1.0),
    } as T;
  }
}

export namespace TextureCoords {
  export type Texture = Vec2.T & { _screenCoord: never };
}
