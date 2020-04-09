precision mediump float;

attribute vec2 position;
attribute vec2 info;

varying vec2 v_pos;
varying vec2 v_info;

void main() {
  v_pos = position;
  v_info = info;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
