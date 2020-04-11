precision mediump float;

uniform sampler2D lightSampler;
uniform sampler2D spriteSampler;

varying vec2 v_lightTexCoord;
varying vec2 v_spriteTexCoord;

void main() {
  vec4 light = texture2D(lightSampler, v_lightTexCoord);
  vec4 col = texture2D(spriteSampler, v_spriteTexCoord);
  
  gl_FragColor = col * light;
}
