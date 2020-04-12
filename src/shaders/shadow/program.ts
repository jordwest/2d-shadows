import * as twgl from "twgl.js";
import vertShader from "./shadow.vert";
import fragShader from "./shadow.frag";
import { Vec2 } from "~/geometry/vec2";
import { Debug } from "~/util/debug";
import { SimpleOccluder } from "./geometry";
import { Float32Cursor } from "~/util/cursor";
import { ShadowBlurProgram } from "~shaders/shadowblur/program";

export namespace ShadowProgram {
  export type T = {
    gl: WebGLRenderingContext;
    programInfo: twgl.ProgramInfo;
    bufferInfo: twgl.BufferInfo;
    blurProgram: ShadowBlurProgram.T;
  };

  export function init(gl: WebGLRenderingContext): T {
    const arrays = {
      position: {
        numComponents: 2,
        data: new Float32Array(0),
        drawType: WebGLRenderingContext.DYNAMIC_DRAW,
      },
      alpha: {
        numComponents: 1,
        data: new Float32Array(0),
        drawType: WebGLRenderingContext.DYNAMIC_DRAW,
      },
      angularRange: {
        numComponents: 2,
        data: new Float32Array(0),
        drawType: WebGLRenderingContext.DYNAMIC_DRAW,
      },
    };

    return {
      gl,
      blurProgram: ShadowBlurProgram.init(gl),
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

    const blurPositions = new Float32Cursor(
      new Float32Array(occluders.length * 12)
    );
    const blurTriPositions = new Float32Cursor(
      new Float32Array(occluders.length * 12)
    );

    for (const occluder of occluders) {
      SimpleOccluder.occlusionTriangles(
        positions,
        alpha,
        blurPositions,
        blurTriPositions,
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
        drawType: WebGLRenderingContext.DYNAMIC_DRAW,
      },
      alpha: {
        numComponents: 1,
        data: alpha.array,
        drawType: WebGLRenderingContext.DYNAMIC_DRAW,
      },
    };
    const blurArrays = {
      position: {
        numComponents: 2,
        data: blurPositions.array,
        drawType: WebGLRenderingContext.DYNAMIC_DRAW,
      },
      triPosition: {
        numComponents: 2,
        data: blurTriPositions.array,
        drawType: WebGLRenderingContext.DYNAMIC_DRAW,
      },
    };

    Debug.record("occlusion triangles cursor offset", positions.offset);

    state.bufferInfo = twgl.createBufferInfoFromArrays(
      state.gl,
      arrays,
      state.bufferInfo
    );
    state.blurProgram.bufferInfo = twgl.createBufferInfoFromArrays(
      state.gl,
      blurArrays,
      state.blurProgram.bufferInfo
    );
    state.bufferInfo.numElements = occluders.length * 6;
    state.blurProgram.bufferInfo.numElements = occluders.length * 6;
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

    ShadowBlurProgram.render(state.blurProgram);
  }
}
