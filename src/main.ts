import * as twgl from "twgl.js";
import { LightProgram } from "./light_program";
import { ShadowProgram } from "./shadow_program";
import { Vec2, Angle } from "./vec2";
import { ScreenCoords, GlCoords } from "./coordinates";
import { Debug } from "./debug";
import { SilhouetteOccluder } from "./silhouette_occluder";

namespace State {
  export type T = {
    gl: WebGLRenderingContext;
    canvas: HTMLCanvasElement;
    mode: "emission" | "shadow";
    light: LightProgram.T;
    lightPosition: Vec2.T;
    shadow: ShadowProgram.T;
    occlusionMap: twgl.FramebufferInfo;
    occluders: SilhouetteOccluder.T[];
  };

  export function init(): T {
    const canvas = document.getElementById("display") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl");

    const attachments = [
      {
        format: gl.RGBA,
        type: gl.UNSIGNED_BYTE,
        min: gl.LINEAR,
        wrap: gl.CLAMP_TO_EDGE,
      },
    ];

    const occlusionMap = twgl.createFramebufferInfo(gl, attachments);

    const light = LightProgram.init(gl);
    light.occlusionTexture = occlusionMap.attachments[0];

    return {
      gl,
      canvas,
      occluders: [],
      light,
      lightPosition: { x: 0, y: 0 },
      shadow: ShadowProgram.init(gl),
      occlusionMap,
      mode: "shadow",
    };
  }

  export function registerHandlers(state: T) {
    document
      .querySelector("button#emission")
      .addEventListener("click", () => (state.mode = "emission"));
    document
      .querySelector("button#shadow")
      .addEventListener("click", () => (state.mode = "shadow"));

    state.canvas.addEventListener("click", (e) => {
      const mousePos = GlCoords.fromScreenCoords(
        ScreenCoords.fromCanvasEvent(e),
        state.canvas
      );

      const occluder = {
        origin: mousePos,
        radius: Math.random() * 0.1 + 0.1,
      };
      //const occluder = {
      //  origin: { x: 0.5, y: 0.3 },
      //  radius: 0.1,
      //};

      state.occluders.push(occluder);
      Debug.record("occluder count", state.occluders.length);
    });

    state.canvas.addEventListener("mousemove", (e) => {
      const mousePos = GlCoords.fromScreenCoords(
        ScreenCoords.fromCanvasEvent(e),
        state.canvas
      );

      state.lightPosition = mousePos;

      ShadowProgram.recalculateOcclusions(
        state.shadow,
        mousePos,
        state.occluders
      );
    });
  }

  export function render(state: T) {
    const { gl, canvas } = state;
    twgl.resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);

    if (state.mode === "shadow") {
      twgl.bindFramebufferInfo(gl, null);
      ShadowProgram.render(state.shadow);
    } else if (state.mode === "emission") {
      twgl.bindFramebufferInfo(gl, state.occlusionMap);
      ShadowProgram.render(state.shadow);

      twgl.bindFramebufferInfo(gl, null);
      LightProgram.render(state.light, state.lightPosition);
    }
  }
}

const state = State.init();

State.registerHandlers(state);

const debugElement = document.querySelector("#debug");

function render(_time: number) {
  state.gl.finish();
  const start = performance.now();
  State.render(state);
  state.gl.finish();

  const time = performance.now() - start;
  Debug.record("frame time", time);

  Debug.output(debugElement);
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
