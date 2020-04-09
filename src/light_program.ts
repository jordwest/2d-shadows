import * as twgl from "twgl.js";
import vertShader from "./shaders/light.vert";
import fragShader from "./shaders/light.frag";
import lightSourcePng from "../assets/lightsource.png";

export namespace LightProgram {
  export type T = {
    gl: WebGLRenderingContext;
    programInfo: twgl.ProgramInfo;
    bufferInfo: twgl.BufferInfo;
    emissionTexture: WebGLTexture;
    checkerTexture: WebGLTexture;
    occlusionTexture?: WebGLTexture;
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
    const textures = twgl.createTextures(gl, {
      checker: {
        mag: gl.NEAREST,
        min: gl.LINEAR,
        src: [
          255,
          255,
          255,
          255,
          50,
          50,
          50,
          255,
          50,
          50,
          50,
          255,
          255,
          255,
          255,
          255,
        ],
      },

      emission: {
        src: lightSourcePng,
      },
    });

    return {
      gl,
      emissionTexture: textures.emission,
      checkerTexture: textures.checker,
      programInfo: twgl.createProgramInfo(gl, [vertShader, fragShader]),
      bufferInfo: twgl.createBufferInfoFromArrays(gl, arrays),
    };
  }

  export function render(state: T) {
    const { gl, programInfo, bufferInfo } = state;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(programInfo.program);
    const uniforms = {
      emissionSampler: state.emissionTexture,
      occlusionSampler: state.occlusionTexture,
    };

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);
  }
}
