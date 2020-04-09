import * as twgl from "twgl.js";
import vertShader from "./shaders/shadow.vert";
import fragShader from "./shaders/shadow.frag";
import { Vec2 } from "./vec2";
import { Debug } from "./debug";
import { SilhouetteOccluder } from "./silhouette_occluder";
import silhouetteTexturePng from "../assets/baked_shadow.png";
import { Float32Cursor } from "./cursor";

export namespace ShadowProgram {
  export type T = {
    gl: WebGLRenderingContext;
    programInfo: twgl.ProgramInfo;
    bufferInfo: twgl.BufferInfo;
    silhouetteTexture: WebGLTexture;
  };

  export function init(gl: WebGLRenderingContext): T {
    const arrays = {
      position: {
        numComponents: 2,
        data: new Float32Array(0),
      },
      info: {
        numComponents: 2,
        data: new Float32Array(0),
      },
      dist: {
        numComponents: 2,
        data: new Float32Array(0),
      },
    };

    const silhouetteTexture = twgl.createTexture(gl, {
      src: silhouetteTexturePng,
      wrap: gl.CLAMP_TO_EDGE,
      min: gl.NEAREST,
      mag: gl.NEAREST,
    });

    return {
      gl,
      silhouetteTexture,
      programInfo: twgl.createProgramInfo(gl, [vertShader, fragShader]),
      bufferInfo: twgl.createBufferInfoFromArrays(gl, arrays),
    };
  }

  export function recalculateOcclusions(
    state: T,
    lightPosition: Vec2.T,
    occluders: SilhouetteOccluder.T[]
  ) {
    const positions = new Float32Cursor(
      new Float32Array(occluders.length * 12)
    );

    const info = new Float32Cursor(new Float32Array(occluders.length * 12));

    const dist = new Float32Cursor(new Float32Array(occluders.length * 12));

    for (const occluder of occluders) {
      SilhouetteOccluder.occlusionTriangles(
        positions,
        info,
        dist,
        occluder,
        lightPosition,
        5.0
      );
    }

    const arrays = {
      position: {
        numComponents: 2,
        data: positions.array,
      },
      info: {
        numComponents: 2,
        data: info.array,
      },
      dist: {
        numComponents: 2,
        data: dist.array,
      },
    };
    Debug.record("occlusion triangles size", positions.offset);
    Debug.record("occlusion info size", info.offset);
    state.bufferInfo = twgl.createBufferInfoFromArrays(
      state.gl,
      arrays,
      state.bufferInfo
    );
  }

  export function render(state: T) {
    const { gl, programInfo, bufferInfo } = state;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const uniforms = {
      silhouetteSampler: state.silhouetteTexture,
      lightSourcePos: [0.0, 0.0],
    };

    twgl.setUniforms(programInfo, uniforms);

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.drawBufferInfo(gl, bufferInfo);
  }
}
