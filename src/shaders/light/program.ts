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

  export function render(
    state: T,
    lightPosition: Vec2.T,
    shadowMap: WebGLTexture
  ) {
    const { gl, programInfo, bufferInfo } = state;

    gl.useProgram(programInfo.program);

    const uniforms = {
      emissionSampler: state.emissionTexture,
      occlusionSampler: shadowMap,
      translate: [lightPosition.x, lightPosition.y],
    };

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);
  }
}
