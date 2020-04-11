import * as twgl from "twgl.js";
import vertShader from "./sprite.vert";
import fragShader from "./sprite.frag";

export namespace SpriteProgram {
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
      lightTexCoord: {
        numComponents: 2,
        data: [0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1],
      },
      spriteTexCoord: {
        numComponents: 2,
        data: [0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0],
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
    lights: WebGLTexture,
    spriteTexture: WebGLTexture
  ) {
    const { gl, programInfo, bufferInfo } = state;

    gl.useProgram(programInfo.program);

    const uniforms = {
      lightSampler: lights,
      spriteSampler: spriteTexture,
      translate: [0.0, 0.0],
    };

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);
  }
}
