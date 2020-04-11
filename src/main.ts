import * as twgl from "twgl.js";
import { LightProgram } from "~/shaders/light/program";
import { Vec2 } from "~/geometry/vec2";
import { ScreenCoords, GlCoords } from "~/geometry/coordinates";
import { Debug } from "~/util/debug";
import { SimpleOccluder } from "~shaders/shadow/geometry";
import { ShadowProgram } from "~shaders/shadow/program";

namespace State {
  export type T = {
    gl: WebGLRenderingContext;
    canvas: HTMLCanvasElement;
    mode: "emission" | "shadow";
    light: LightProgram.T;
    lightPosition: Vec2.T;
    lightHeight: number;
    shadow: ShadowProgram.T;
    occlusionMap: twgl.FramebufferInfo;
    occlusionMap2: twgl.FramebufferInfo;
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

    const occlusionMap = twgl.createFramebufferInfo(gl, attachments);
    const occlusionMap2 = twgl.createFramebufferInfo(gl, attachments);

    const light = LightProgram.init(gl);

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
      light,
      lightPosition: { x: 0, y: 0 },
      lightHeight: 8,
      shadow: ShadowProgram.init(gl),
      occlusionMap,
      occlusionMap2,
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

      state.lightPosition = mousePos;
    });

    state.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      console.log(e.deltaY / 100);
      state.lightHeight += e.deltaY / 100;
    });
  }

  export function render(state: T, time: number) {
    const { gl, canvas } = state;
    twgl.resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);

    ShadowProgram.recalculateOcclusions(
      state.shadow,
      state.lightPosition,
      state.lightHeight,
      state.occluders
    );
    if (state.mode === "shadow") {
      twgl.bindFramebufferInfo(gl, null);
      ShadowProgram.render(state.shadow);
    } else if (state.mode === "emission") {
      twgl.bindFramebufferInfo(gl, state.occlusionMap);
      ShadowProgram.render(state.shadow);

      twgl.bindFramebufferInfo(gl, null);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      LightProgram.render(
        state.light,
        state.lightPosition,
        state.occlusionMap.attachments[0]
      );

      let secondLightPos = {
        //x: Math.sin(time / 1000),
        x: 0.0,
        y: Math.cos(time / 1000),
      };
      ShadowProgram.recalculateOcclusions(
        state.shadow,
        secondLightPos,
        state.lightHeight,
        state.occluders
      );
      twgl.bindFramebufferInfo(gl, state.occlusionMap2);
      ShadowProgram.render(state.shadow);

      twgl.bindFramebufferInfo(gl, null);
      LightProgram.render(
        state.light,
        secondLightPos,
        state.occlusionMap2.attachments[0]
      );
    }
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
  Debug.time("render", () => {
    State.render(state, time);
  });

  debugElement && Debug.output(debugElement);

  frameCounter.frames += 1;
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
