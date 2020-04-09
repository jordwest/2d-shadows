precision mediump float;

uniform sampler2D emissionSampler;
uniform sampler2D occlusionSampler;

varying vec2 v_emissionTexCoord;

void main() {
  vec4 col = texture2D(emissionSampler, v_emissionTexCoord);
  vec4 occlusion = texture2D(occlusionSampler, v_emissionTexCoord);
  //gl_FragColor = vec4(col.rgb, 1.0 - occlusion.r);
  float val = min(col.r, 1.0 - occlusion.r);
  gl_FragColor = vec4(val, val, val, 1.0);
}
