precision mediump float;

attribute vec2 position;
attribute float info;

varying float v_info;

void main() {
  v_info = info;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
