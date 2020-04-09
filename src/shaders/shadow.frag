precision mediump float;

uniform sampler2D silhouetteSampler;
varying float v_info;

void main() {
  vec4 silhouetteCol = texture2D(silhouetteSampler, vec2(0.5, v_info));
  float occlusion = silhouetteCol.r;

  gl_FragColor = vec4(v_info, 0.0, 1.0, 1.0);
}
