#define M_PI 3.1415926535897932384626433832795

precision mediump float;

varying vec2 v_pos;
varying float v_alpha;

void main() {
  gl_FragColor = vec4(1.0, 1.0, 1.0, v_alpha);
}
