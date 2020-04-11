import * as twgl from "twgl.js";
import { LightProgram } from "~/shaders/light/program";
import { Vec2 } from "~/geometry/vec2";
import { ScreenCoords, GlCoords } from "~/geometry/coordinates";
import { Debug } from "~/util/debug";
import { SimpleOccluder } from "~shaders/shadow/geometry";
import { ShadowProgram } from "~shaders/shadow/program";
import lampPng from "../assets/lightsource.png";
import torchPng from "../assets/torch.png";
import backgroundPng from "../assets/background.png";
import { SpriteProgram } from "~shaders/sprite/program";

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
      lightMap: textures.torch,
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

    const occluders = [
      {
        a: { x: -0.22, y: 0.4 },
        b: { x: -0.2, y: 0.4 },
        alpha: 1,
        bottom: 0,
        top: 5,
      },
      {
        a: { x: -0.2, y: 0.4 },
        b: { x: 0.2, y: 0.4 },
        alpha: 0.4,
        bottom: 0,
        top: 5,
      },
      {
        a: { x: -0.2, y: 0.4 },
        b: { x: 0.2, y: 0.4 },
        alpha: 1,
        bottom: 0,
        top: 0.2,
      },
      {
        a: { x: -0.22, y: 0.4 },
        b: { x: 0.22, y: 0.4 },
        alpha: 1,
        bottom: 4.8,
        top: 20,
      },
      {
        a: { x: 0.2, y: 0.4 },
        b: { x: 0.22, y: 0.4 },
        alpha: 1,
        bottom: 0,
        top: 5,
      },
      {
        a: { x: -0.2, y: 0.4 },
        b: { x: 0.2, y: 0.4 },
        alpha: 1,
        bottom: 2.5,
        top: 2.7,
      },
      {
        a: { x: -0.02, y: 0.4 },
        b: { x: 0.02, y: 0.4 },
        alpha: 1,
        bottom: 0,
        top: 5,
      },
    ];

    return {
      gl,
      canvas,
      occluders,
      lightProgram: LightProgram.init(gl),
      shadowProgram: ShadowProgram.init(gl),
      spriteProgram: SpriteProgram.init(gl),
      backgroundTexture: textures.background,
      renderedLights: twgl.createFramebufferInfo(gl),
      lights: [defaultLight, moon],
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
        alpha: 1,
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

  state.lights[1].position = {
    x: 0.0,
    y: Math.cos(time / 1000),
  };
  Debug.time("render", () => {
    State.render(state);
  });

  debugElement && Debug.output(debugElement);

  frameCounter.frames += 1;
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
