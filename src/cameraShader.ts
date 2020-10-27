export let shader = `#version 300 es
#define MAX_BUFFER_SIZE 1000

precision mediump float;
	
uniform float time;
uniform bool applyColors;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D textureSampler;
uniform vec2 screenResolution;
uniform vec2 textureResolution;

uniform float hue;
uniform float saturation;
uniform float lightness;

uniform vec3 colors[7];

#define PI 3.1415926535897932384626433832795
#define TWO_PI 2.0 * PI

int modulo(int i, int m) {
    return i - m * (i / m);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 hsv2rgb(vec4 c) {
    return vec4(hsv2rgb(c.xyz), c.w);
}

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec4 rgb2hsv(vec4 c) {
    return vec4(rgb2hsv(c.xyz), c.w);
}

vec4 preprocess(vec4 c) {
    vec4 chsv = rgb2hsv(c);
    chsv.x = mod(chsv.x + hue, 1.0);
    chsv.y += saturation;
    chsv.z += lightness;
    return hsv2rgb(chsv);
}

void main() {

    float screenRatio = screenResolution.x / screenResolution.y;
    vec2 uv = gl_FragCoord.xy / screenResolution.xy;

    uv -= 0.5;
    uv = screenRatio > 1. ? vec2(uv.x * screenRatio, uv.y) : vec2(uv.x, uv.y / screenRatio);

    vec4 pixel = preprocess(texture(textureSampler, vUv));
    fragColor = pixel;
}`;
