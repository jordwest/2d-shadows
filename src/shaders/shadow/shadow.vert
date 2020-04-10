precision mediump float;

attribute vec2 position;
attribute float alpha;

varying vec2 v_pos;
varying float v_alpha;

void main() {
  v_pos = position;
  v_alpha = alpha;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
