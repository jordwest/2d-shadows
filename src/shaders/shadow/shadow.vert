precision mediump float;

attribute vec2 position;

varying vec2 v_pos;

void main() {
  v_pos = position;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
