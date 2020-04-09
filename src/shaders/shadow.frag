#define M_PI 3.1415926535897932384626433832795

precision mediump float;

uniform sampler2D silhouetteSampler;
uniform vec2 lightSourcePos;

varying vec2 v_pos;
varying vec2 v_info;
varying vec2 v_dist;

void main() {
  float minAngle = v_info.x;
  float maxAngle = v_info.y;
  float minDist = v_dist.x;
  float maxDist = v_dist.y;

  float angleToLight = atan(v_pos.y - lightSourcePos.y, v_pos.x - lightSourcePos.x);
  float texY = smoothstep(minAngle, maxAngle, angleToLight);
  float angleToCenter = (minAngle + maxAngle) / 2.0;
  float texX = smoothstep(-M_PI, M_PI, angleToCenter);

  vec4 silhouetteCol = texture2D(silhouetteSampler, vec2(texX, texY));

  float startDist = silhouetteCol.r;
  float occlusion = silhouetteCol.g;

  float currentDist = length(v_pos - lightSourcePos);
  float currentDistNormalised = smoothstep(minDist, maxDist, currentDist);
  //float occlusionMult = smoothstep(startDist - 0.05, startDist + 0.05, currentDistNormalised);
  float occlusionMult = step(startDist, currentDistNormalised);
  occlusion = occlusion * occlusionMult;

  gl_FragColor = vec4(occlusion, occlusion, occlusion, 1.0);
  //gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  //gl_FragColor = vec4(currentDistNormalised, 0.0, 0.0, 1.0);
}
