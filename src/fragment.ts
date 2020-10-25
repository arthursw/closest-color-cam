export let shader = `#version 300 es
#define MAX_BUFFER_SIZE 1000

precision highp float;
	
uniform float time;

in vec2 vUv;
out vec4 fragColor;

void main() {
	float x = mod(vUv.x, 0.2) < 0.1 ? 1. : 0.;
	float y = mod(vUv.y, 0.2) < 0.1 ? 1. : 0.;
  fragColor = vec4(x, y, 1., 1.);
}`;
