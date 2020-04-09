precision mediump float;

attribute vec2 position;
attribute vec2 emissionTexCoord;

varying vec2 v_emissionTexCoord;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
  v_emissionTexCoord = emissionTexCoord;
}
