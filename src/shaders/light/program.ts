import * as twgl from "twgl.js";
import vertShader from "./light.vert";
import fragShader from "./light.frag";
import { Vec2 } from "~/geometry/vec2";

export namespace LightProgram {
  export type T = {
    gl: WebGLRenderingContext;
    programInfo: twgl.ProgramInfo;
    bufferInfo: twgl.BufferInfo;
  };

  export function init(gl: WebGLRenderingContext): T {
    const arrays = {
      position: {
        numComponents: 2,
        data: [-1, -1, +1, -1, -1, +1, +1, -1, -1, +1, +1, +1],
      },
      emissionTexCoord: {
        numComponents: 2,
        data: [0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1],
      },
    };

    return {
      gl,
      programInfo: twgl.createProgramInfo(gl, [vertShader, fragShader]),
      bufferInfo: twgl.createBufferInfoFromArrays(gl, arrays),
    };
  }

  export function render(
    state: T,
    lightPosition: Vec2.T,
    lightMap: WebGLTexture,
    shadowMap: WebGLTexture,
    tint: [number, number, number]
  ) {
    const { gl, programInfo, bufferInfo } = state;

    gl.useProgram(programInfo.program);

    const uniforms = {
      emissionSampler: lightMap,
      occlusionSampler: shadowMap,
      tint,
      translate: [lightPosition.x, lightPosition.y],
    };

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);

    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);
  }
}
