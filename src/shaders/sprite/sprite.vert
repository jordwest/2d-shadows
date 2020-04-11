precision mediump float;

attribute vec2 position;
attribute vec2 lightTexCoord;
attribute vec2 spriteTexCoord;

uniform vec2 translate;

varying vec2 v_lightTexCoord;
varying vec2 v_spriteTexCoord;

void main() {
  gl_Position = vec4(position + translate, 0.0, 1.0);
  v_spriteTexCoord = spriteTexCoord;
  v_lightTexCoord = lightTexCoord;
}
