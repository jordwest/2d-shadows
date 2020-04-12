#define M_PI 3.1415926535897932384626433832795

precision mediump float;

varying vec2 v_pos;
varying float v_alpha;

void main() {
  //float angleToOccluderA = atan(v_pos.y - v_occluderA.y, v_pos.x - v_occluderA.x);
  //float inRangeA = smoothstep(v_angularRangeA.y, v_angularRangeA.x, angleToOccluderA);

  //float angleToOccluderB = atan(v_pos.y - v_occluderB.y, v_pos.x - v_occluderB.x);
  //float inRangeB = smoothstep(v_angularRangeB.y, v_angularRangeB.x, angleToOccluderB);

  //float alpha = v_alpha * (inRangeA * (1.0 - inRangeB));
  
  gl_FragColor = vec4(1.0, 1.0, 1.0, v_alpha);
}
