import * as twgl from "twgl.js";
import vertShader from "./shaders/light.vert";
import fragShader from "./shaders/light.frag";

namespace Vec2 {
  export type T = {
    x: number;
    y: number;
  };
}

namespace LightProgram {
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
    };

    return {
      gl,
      programInfo: twgl.createProgramInfo(gl, [vertShader, fragShader]),
      bufferInfo: twgl.createBufferInfoFromArrays(gl, arrays),
    };
  }

  export function render(state: T) {
    const { gl, programInfo, bufferInfo } = state;
    //const uniforms = {
    //  time: time * 0.001,
    //  resolution: [gl.canvas.width, gl.canvas.height],
    //};

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    //twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);
  }
}

namespace State {
  export type T = {
    gl: WebGLRenderingContext;
    canvas: HTMLCanvasElement;
    light: LightProgram.T;
  };

  export function init(): T {
    const canvas = document.getElementById("display") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl");

    return {
      gl,
      canvas,
      light: LightProgram.init(gl),
    };
  }

  export function render(state: T) {
    const { gl, canvas } = state;
    twgl.resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);

    LightProgram.render(state.light);
  }
}

const state = State.init();

function render(_time: number) {
  State.render(state);
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
