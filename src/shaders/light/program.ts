import * as twgl from "twgl.js";
import vertShader from "./light.vert";
import fragShader from "./light.frag";
import lightSourcePng from "../../../assets/lightsource.png";
import { Vec2 } from "~/geometry/vec2";

export namespace LightProgram {
  export type T = {
    gl: WebGLRenderingContext;
    programInfo: twgl.ProgramInfo;
    bufferInfo: twgl.BufferInfo;
    emissionTexture: WebGLTexture;
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
      emission: {
        src: lightSourcePng,
      },
    });

    return {
      gl,
      emissionTexture: textures.emission,
      programInfo: twgl.createProgramInfo(gl, [vertShader, fragShader]),
      bufferInfo: twgl.createBufferInfoFromArrays(gl, arrays),
    };
  }

  export function render(state: T, lightPosition: Vec2.T) {
    const { gl, programInfo, bufferInfo } = state;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(programInfo.program);
    const uniforms = {
      emissionSampler: state.emissionTexture,
      occlusionSampler: state.occlusionTexture,
      translate: [lightPosition.x, lightPosition.y],
    };

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);
  }
}
