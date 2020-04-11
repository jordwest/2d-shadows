precision mediump float;

attribute vec2 position;
attribute float alpha;
//attribute vec2 angularRange;

varying vec2 v_pos;
varying float v_alpha;
//varying vec2 v_angularRange;

void main() {
  v_pos = position;
  v_alpha = alpha;
  //v_angularRange = angularRange;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
