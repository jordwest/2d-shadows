precision mediump float;

attribute vec2 position;
attribute vec2 info;
attribute vec2 dist;

varying vec2 v_pos;
varying vec2 v_info;
varying vec2 v_dist;

void main() {
  v_pos = position;
  v_info = info;
  v_dist = dist;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
