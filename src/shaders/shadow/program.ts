import * as twgl from "twgl.js";
import vertShader from "./shadow.vert";
import fragShader from "./shadow.frag";
import { Vec2 } from "~/geometry/vec2";
import { Debug } from "~/util/debug";
import { SimpleOccluder } from "./geometry";
import { Float32Cursor } from "~/util/cursor";

export namespace ShadowProgram {
  export type T = {
    gl: WebGLRenderingContext;
    programInfo: twgl.ProgramInfo;
    bufferInfo: twgl.BufferInfo;
  };

  export function init(gl: WebGLRenderingContext): T {
    const arrays = {
      position: {
        numComponents: 2,
        data: new Float32Array(0),
      },
      alpha: {
        numComponents: 1,
        data: new Float32Array(0),
      },
    };

    return {
      gl,
      programInfo: twgl.createProgramInfo(gl, [vertShader, fragShader]),
      bufferInfo: twgl.createBufferInfoFromArrays(gl, arrays),
    };
  }

  export function recalculateOcclusions(
    state: T,
    lightPosition: Vec2.T,
    lightHeight: number,
    occluders: SimpleOccluder.T[]
  ) {
    const positions = new Float32Cursor(
      new Float32Array(occluders.length * 12)
    );
    const alpha = new Float32Cursor(new Float32Array(occluders.length * 6));

    for (const occluder of occluders) {
      SimpleOccluder.occlusionTriangles(
        positions,
        alpha,
        occluder,
        lightPosition,
        lightHeight,
        5.0
      );
    }

    const arrays = {
      position: {
        numComponents: 2,
        data: positions.array,
      },
      alpha: {
        numComponents: 1,
        data: alpha.array,
      },
    };

    Debug.record("occlusion triangles cursor offset", positions.offset);

    state.bufferInfo = twgl.createBufferInfoFromArrays(
      state.gl,
      arrays,
      state.bufferInfo
    );
    state.bufferInfo.numElements = occluders.length * 6;
  }

  export function render(state: T) {
    const { gl, programInfo, bufferInfo } = state;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Enable alpha blending so shadows can overlap each other
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.drawBufferInfo(gl, bufferInfo);
  }
}
