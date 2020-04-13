import * as twgl from "twgl.js";
import vertShader from "./shadowblur.vert";
import fragShader from "./shadowblur.frag";
import { Float32Cursor } from "~/util/cursor";

export namespace ShadowBlurProgram {
  export type T = {
    gl: WebGLRenderingContext;
    programInfo: twgl.ProgramInfo;
    bufferInfo: twgl.BufferInfo;
    arrays: {
      position: Float32Array;
      triPosition: Float32Array;
    };
  };

  export function init(gl: WebGLRenderingContext): T {
    const arrays = {
      position: {
        numComponents: 2,
        data: new Float32Array(0),
        drawType: WebGLRenderingContext.DYNAMIC_DRAW,
      },
      triPosition: {
        numComponents: 2,
        data: new Float32Array(0),
        drawType: WebGLRenderingContext.DYNAMIC_DRAW,
      },
    };

    return {
      gl,
      programInfo: twgl.createProgramInfo(gl, [vertShader, fragShader]),
      bufferInfo: twgl.createBufferInfoFromArrays(gl, arrays),
      arrays: {
        position: arrays.position.data,
        triPosition: arrays.triPosition.data,
      },
    };
  }

  export function render(state: T) {
    const { gl, programInfo, bufferInfo } = state;

    // Enable alpha blending so shadows can overlap each other
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.drawBufferInfo(gl, bufferInfo);
  }
}
