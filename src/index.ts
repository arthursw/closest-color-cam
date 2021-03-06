import * as THREE from "three";
import * as dat from "dat.gui";
import * as vertexShader from "./vertex";
import * as fragmentShader from "./nchroma";
// import * as fragmentShader from "./cameraShader";
import "screenlog";
// import * as fragmentShader from "./fragment";
import { EqualStencilFunc, FontLoader, PlaneHelper, Uniform } from "../dist/src.f10117fe";
declare var screenLog: any;

screenLog.init();
let scene: THREE.Scene;
let camera: THREE.OrthographicCamera;
let renderer: THREE.WebGLRenderer;
let material: THREE.RawShaderMaterial;

let canvas = document.createElement("canvas");
let preprocessing = { hue: 0.0, saturation: 0.0, lightness: 0.0 };

let width = Math.floor(window.innerHeight / 4)
let height = Math.floor(window.innerWidth / 4)

function scene_setup() {
  //This is all code needed to set up a basic ThreeJS scene
  //First we initialize the scene and our camera
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  //We create the WebGL renderer and add it to the document
  
  let context = canvas.getContext("webgl2");

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    context: context
  } as any);
  // renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height)
  renderer.setPixelRatio(1)
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  document.body.appendChild(renderer.domElement);
  return scene;
}

scene = scene_setup();

let red = '#F44336'
let blue = '#448AFF'
let green = '#8BC34A'
let yellow = '#FFC107'
// let brown = '#795548'
let brown = '#704433'
// let brown = '#006633'
let white = '#FFFFFF'
let black = '#000000'
let colors = [red, blue, green, yellow, brown, black, white]
let colorVectorArray = []

for(let color of colors) {
  let c = new THREE.Color(color)
  colorVectorArray.push(new THREE.Vector3(c.r, c.g, c.b))
}

let video: HTMLVideoElement = document.querySelector('video') as any;

let texture = new THREE.VideoTexture( video );
texture.minFilter = THREE.NearestFilter
texture.magFilter = THREE.NearestFilter

material = new THREE.RawShaderMaterial({
  uniforms: {
    applyColors: { type: "b", value: true },
    // screenResolution: { type: "v2", value: new THREE.Vector2(width, height) },
    colors: { type: "v3v", value: colorVectorArray },
    textureSampler: { value: texture },
    // textureResolution: new THREE.Uniform(new THREE.Vector2(canvas ? canvas.height / 2 : 0, canvas ? canvas.width / 2 : 0)),
    hue: {type: "f", value: preprocessing.hue},
    saturation: {type: "f", value: preprocessing.saturation},
    lightness: {type: "f", value: preprocessing.lightness},
  },
  vertexShader: vertexShader.shader.trim(),
  fragmentShader: fragmentShader.shader.trim()
});

let geometry = new THREE.PlaneBufferGeometry(2, 2);
let sprite = new THREE.Mesh(geometry, material);

scene.add(sprite);

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  width = window.innerHeight / 4
  height = window.innerWidth / 4
  renderer.setSize(width, height)
  renderer.setPixelRatio(1)
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  /*
  camera.left = -0.5 * screenWidth;
  camera.right = 0.5 * screenWidth;
  camera.top = 0.5 * screenHeight;
  camera.bottom = -0.5 * screenHeight;
  camera.updateProjectionMatrix();
  */
}

function animate(timestamp: number = 0) {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

animate();

// Prefer camera resolution nearest to 1280x720.
var constraints = { audio: false, video: { facingMode: "environment", width: width, height: height } }; 

navigator.mediaDevices.getUserMedia(constraints)
.then(function(mediaStream) {
  video.srcObject = mediaStream;
  video.onloadedmetadata = function(e) {
    video.play();
    texture = new THREE.VideoTexture( video );
    material.uniforms.textureSampler.value = texture;
  };
})
.catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors at the end.


var gui = new dat.GUI();

let preprocessingFolder = gui.addFolder('Preprocessing');

let hueController = preprocessingFolder.add(preprocessing, 'hue', 0, 1, 0.01).onChange( (value: number)=> material.uniforms.hue.value = value );
let saturationController = preprocessingFolder.add(preprocessing, 'saturation', -1, 1, 0.01).onChange( (value: number)=> material.uniforms.saturation.value = value );
let lightnessController = preprocessingFolder.add(preprocessing, 'lightness', -1, 1, 0.01).onChange( (value: number)=> material.uniforms.lightness.value = value );

let dragging = false

function changePreprocessing(event: MouseEvent | TouchEvent){
  if(!dragging && event instanceof MouseEvent) {
    return
  }
  let point = {x: 0, y: 0}
  if(event instanceof TouchEvent) {
    point.x = event.touches[0].pageX
    point.y = event.touches[0].pageY
  } else {
    point.x = event.pageX
    point.y = event.pageY
  }
  point.x /= window.innerWidth
  point.y /= window.innerHeight

  if(point.y < 1/3) {
    hueController.setValue(point.x)
  }
  else if(point.y < 2/3) {
    saturationController.setValue(point.x)
  }
  else if(point.y < 3/3) {
    lightnessController.setValue(point.x)
  }
}

window.addEventListener('touchmove', changePreprocessing)
window.addEventListener('mousedown', ()=> dragging = true)
window.addEventListener('mousemove', changePreprocessing)
window.addEventListener('mouseup', ()=> dragging = true)
