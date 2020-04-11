precision mediump float;

uniform sampler2D emissionSampler;
uniform sampler2D occlusionSampler;

varying vec2 v_emissionTexCoord;

void main() {
  vec4 col = texture2D(emissionSampler, v_emissionTexCoord);
  vec4 occlusion = texture2D(occlusionSampler, v_emissionTexCoord);
  //gl_FragColor = vec4(col.rgb, 1.0 - occlusion.r);
  
  float lightness = max(col.r, col.g);
  lightness = max(lightness, col.b);
  lightness = min(lightness, 1.0 - occlusion.r);
  gl_FragColor = vec4(col.r, col.g, col.b, lightness);
}
