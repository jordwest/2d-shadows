import { Vec2 } from "~/geometry/vec2";

export class Float32Cursor {
  array: Float32Array;
  offset: number;

  constructor(arr: Float32Array) {
    this.array = arr;
    this.offset = 0;
  }

  push(val: number) {
    this.array[this.offset] = val;
    this.offset += 1;
  }

  push2(a: number, b: number) {
    this.push(a);
    this.push(b);
  }

  vec2(v: Vec2.T) {
    this.push2(v.x, v.y);
  }

  push3(a: number, b: number, c: number) {
    this.push2(a, b);
    this.push(c);
  }

  restart() {
    this.offset = 0;
  }
}
