precision mediump float;

varying vec2 v_triPosition;

// atan2(1, 1) - the rightmost angle of the triangle
#define LEFT 0.7853981633974483

// atan2(1, -1) - the leftmost angle of the triangle
#define RIGHT 2.356194490192345

void main() {
  float angle = atan(v_triPosition.y, v_triPosition.x);
  float alpha = smoothstep(RIGHT, LEFT, angle);
  //gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
  gl_FragColor = vec4(1.0, 0.0, 0.0, alpha);
}
