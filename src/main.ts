import * as twgl from "twgl.js";
import { LightProgram } from "~/shaders/light/program";
import { Vec2 } from "~/geometry/vec2";
import { ScreenCoords, GlCoords } from "~/geometry/coordinates";
import { Debug } from "~/util/debug";
import { SimpleOccluder } from "~shaders/shadow/geometry";
import { ShadowProgram } from "~shaders/shadow/program";
import lampPng from "../assets/lightsource.png";
import torchPng from "../assets/torch.png";
import firePng from "../assets/fire.png";
import backgroundPng from "../assets/houseinthewoods.png";
import { SpriteProgram } from "~shaders/sprite/program";

const NEW_OCCLUDER_ALPHA = 1.0;
const ENABLE_MOON = false;

function pixelToGlCoord(x: number, y: number): Vec2.T {
  return { x: (x / 512) * 2 - 1, y: -((y / 512) * 2 - 1) };
}

function wall(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): SimpleOccluder.T {
  return {
    a: pixelToGlCoord(x1, y1),
    b: pixelToGlCoord(x2, y2),
    alpha: 1,
    bottom: 0,
    top: 20,
  };
}
function windowOccluder(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): SimpleOccluder.T {
  return {
    a: pixelToGlCoord(x1, y1),
    b: pixelToGlCoord(x2, y2),
    alpha: 0.7,
    bottom: 0,
    top: 20,
  };
}

namespace State {
  type Light = {
    position: Vec2.T;
    height: number;
    lightMap: WebGLTexture;
    shadowMap: twgl.FramebufferInfo;
    tint: [number, number, number];
  };

  export type T = {
    gl: WebGLRenderingContext;
    canvas: HTMLCanvasElement;
    mode: "emission" | "shadow";
    lightProgram: LightProgram.T;
    shadowProgram: ShadowProgram.T;
    spriteProgram: SpriteProgram.T;
    backgroundTexture: WebGLTexture;
    /** Surface on which all lights are rendered, used by sprite rendering */
    renderedLights: twgl.FramebufferInfo;
    lights: Light[];
    occluders: SimpleOccluder.T[];
  };

  export function init(): T {
    const canvas = document.getElementById("display") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl", { alpha: false });
    if (gl == null) {
      throw new Error("Failed to get webgl context");
    }

    const attachments = [
      {
        format: gl.RGBA,
        type: gl.UNSIGNED_BYTE,
        min: gl.LINEAR,
        wrap: gl.CLAMP_TO_EDGE,
      },
    ];

    const textures = twgl.createTextures(gl, {
      lamp: {
        src: lampPng,
      },
      torch: {
        src: torchPng,
      },
      fire: {
        src: firePng,
      },
      sun: {
        mag: gl.NEAREST,
        min: gl.LINEAR,
        src: [255, 255, 255, 255],
      },
      background: {
        mag: gl.NEAREST,
        min: gl.LINEAR,
        src: backgroundPng,
      },
    });
    const defaultLight: Light = {
      shadowMap: twgl.createFramebufferInfo(gl, attachments),
      lightMap: textures.lamp,
      position: { x: 0, y: 0 },
      height: 8,
      tint: [1.0, 0.96, 0.709],
    };
    const moon: Light = {
      shadowMap: twgl.createFramebufferInfo(gl, attachments),
      lightMap: textures.lamp,
      position: { x: 0, y: 0 },
      height: 60,
      tint: [0.2, 0.2, 0.4],
    };
    const fire: Light = {
      shadowMap: twgl.createFramebufferInfo(gl, attachments),
      lightMap: textures.fire,
      position: pixelToGlCoord(173, 252),
      height: 5,
      tint: [1.0, 1.0, 1.0],
    };

    const occluders: SimpleOccluder.T[] = [
      wall(298, 180, 469, 180),
      wall(469, 180, 469, 208),
      wall(469, 215, 469, 230),
      windowOccluder(469, 230, 469, 241),
      wall(469, 241, 469, 302),
      wall(469, 311, 469, 326),
      wall(469, 326, 448, 326),
      windowOccluder(447, 326, 424, 326),
      wall(423, 326, 339, 326),
      windowOccluder(338, 326, 315, 326),
      wall(314, 326, 298, 326),
      wall(298, 326, 298, 256),
      wall(298, 246, 298, 232),
      windowOccluder(298, 233, 298, 196),
      wall(298, 214, 298, 215),
      wall(298, 196, 298, 180),
    ];
    const lights = [defaultLight];
    if (ENABLE_MOON) {
      lights.push(moon);
    }
    lights.push(fire);

    return {
      gl,
      canvas,
      occluders,
      lightProgram: LightProgram.init(gl),
      shadowProgram: ShadowProgram.init(gl),
      spriteProgram: SpriteProgram.init(gl),
      backgroundTexture: textures.background,
      renderedLights: twgl.createFramebufferInfo(gl),
      lights,
      mode: "emission",
    };
  }

  export function registerHandlers(state: T) {
    document
      .querySelector("button#emission")
      ?.addEventListener("click", () => (state.mode = "emission"));
    document
      .querySelector("button#shadow")
      ?.addEventListener("click", () => (state.mode = "shadow"));

    let drawingOccluder:
      | undefined
      | { start: Vec2.T; occluderRef: SimpleOccluder.T };
    state.canvas.addEventListener("mousedown", (e) => {
      const mousePos = GlCoords.fromScreenCoords(
        ScreenCoords.fromCanvasEvent(e),
        state.canvas
      );
      let newOccluder = {
        a: { ...mousePos },
        b: { ...mousePos },
        bottom: 0,
        top: 20,
        alpha: NEW_OCCLUDER_ALPHA,
      };
      drawingOccluder = {
        start: { ...mousePos },
        occluderRef: newOccluder,
      };
      state.occluders.push(newOccluder);
      Debug.record("occluder count", state.occluders.length);
    });
    state.canvas.addEventListener("mousemove", (e) => {
      if (drawingOccluder != null) {
        const mousePos = GlCoords.fromScreenCoords(
          ScreenCoords.fromCanvasEvent(e),
          state.canvas
        );
        drawingOccluder.occluderRef.b = { ...mousePos };
      }
    });
    state.canvas.addEventListener("mouseup", () => {
      drawingOccluder = undefined;
    });

    state.canvas.addEventListener("mousemove", (e) => {
      const mousePos = GlCoords.fromScreenCoords(
        ScreenCoords.fromCanvasEvent(e),
        state.canvas
      );

      state.lights[0].position = mousePos;
    });

    state.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      console.log(e.deltaY / 100);
      state.lights[0].height += e.deltaY / 100;
    });
  }

  export function renderShadow(state: T) {
    const { gl, canvas } = state;
    twgl.resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);

    ShadowProgram.recalculateOcclusions(
      state.shadowProgram,
      state.lights[0].position,
      state.lights[0].height,
      state.occluders
    );
    twgl.bindFramebufferInfo(gl, null);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    ShadowProgram.render(state.shadowProgram);
  }

  export function render(state: T) {
    const { gl, canvas } = state;
    twgl.resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);

    twgl.bindFramebufferInfo(gl, state.renderedLights);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (const light of state.lights) {
      ShadowProgram.recalculateOcclusions(
        state.shadowProgram,
        light.position,
        light.height,
        state.occluders
      );
      twgl.bindFramebufferInfo(gl, light.shadowMap);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      ShadowProgram.render(state.shadowProgram);

      twgl.bindFramebufferInfo(gl, state.renderedLights);
      LightProgram.render(
        state.lightProgram,
        light.position,
        light.lightMap,
        light.shadowMap.attachments[0],
        light.tint
      );
    }

    twgl.bindFramebufferInfo(gl, null);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    SpriteProgram.render(
      state.spriteProgram,
      state.renderedLights.attachments[0],
      state.backgroundTexture
    );
  }
}

const state = State.init();

State.registerHandlers(state);

const debugElement = document.querySelector("#debug");

const frameCounter = {
  frames: 0,
  lastReported: 0,
};
function render(time: number) {
  {
    const elapsed = time - frameCounter.lastReported;
    if (elapsed > 1000) {
      Debug.record("fps", frameCounter.frames / (elapsed / 1000));
      frameCounter.frames = 0;
      frameCounter.lastReported = time;
    }
  }

  if (ENABLE_MOON) {
    state.lights[1].position = {
      x: 0.0,
      y: Math.cos(time / 1000),
    };
  }
  Debug.time("render", () => {
    if (state.mode === "shadow") {
      State.renderShadow(state);
    } else {
      State.render(state);
    }
  });

  debugElement && Debug.output(debugElement);

  frameCounter.frames += 1;
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
