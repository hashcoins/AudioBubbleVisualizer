import { AudioListener, Audio, AudioLoader, AudioAnalyser, Clock } from 'three';
import { Scene, SphereGeometry, Vector3, PerspectiveCamera, WebGLRenderer, Color, MeshBasicMaterial, MeshStandardMaterial, Mesh } from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.146/examples/jsm/controls/OrbitControls.js';
import { createSculptureWithGeometry } from 'https://unpkg.com/shader-park-core/dist/shader-park-core.esm.js';
import { spCode } from './finished_buble.js';

let scene = new Scene();

let camera = new PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 1.5;

let renderer = new WebGLRenderer({ antialias: true, transparent: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setClearColor( new Color(1, 1, 1), 0);
document.body.appendChild( renderer.domElement );


let clock = new Clock();

// AUDIO
// create an AudioListener and add it to the camera
const listener = new AudioListener();
camera.add( listener );

// create an Audio source
const sound = new Audio( listener );

let button = document.querySelector('.button');
button.innerHTML = "Loading Audio..."



// create an AudioAnalyser, passing in the sound and desired fftSize
// get the average frequency of the sound
const analyser = new AudioAnalyser( sound, 32 );


let state = {
  mouse : new Vector3(),
  currMouse : new Vector3(),
  pointerDown: 0.0,
  currPointerDown: 0.0,
  audio: 0.0,
  currAudio: 0.0,
  time: 0.0
}

window.addEventListener( 'pointermove', (event) => {
  state.currMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	state.currMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}, false );

window.addEventListener( 'pointerdown', (event) => state.currPointerDown = 1.0, false );
window.addEventListener( 'pointerup', (event) => state.currPointerDown = 0.0, false );


let geometry  = new SphereGeometry(2, 45, 45);

// // // Create Shader Park Sculpture
let mesh = createSculptureWithGeometry(geometry, spCode(), () => ( {
  time: state.time,
  pointerDown: state.pointerDown,
  audio: state.audio,
  mouse: state.mouse,
  _scale : .5
} ));

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const audioInput = document.getElementById('audio-file');
button.addEventListener('pointerdown', () => {
  audioInput.click();
});

audioInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const arrayBuffer = e.target.result;
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContext.decodeAudioData(arrayBuffer, function(buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();
      });
    };
    reader.readAsArrayBuffer(file);
    button.style.display = 'Playing';
  }
});

scene.add(mesh);

// Add Controlls
let controls = new OrbitControls( camera, renderer.domElement, {
  enableDamping : true,
  dampingFactor : 0.25,
  zoomSpeed : 0.5,
  rotateSpeed : 0.5
} );

let onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( 'resize', onWindowResize );

let render = () => {
    requestAnimationFrame(render);
    state.time = clock.getDelta(); // Use AudioContext's currentTime for more precise timing
    controls.update();
    
    if (analyser) {
      const frequencyData = analyser.getFrequencyData();
      const bassFrequency = frequencyData[0]; // Use the first frequency value for bass
      const bassIntensity = bassFrequency / 500; // Normalize the bass intensity (0 to 1)
      const shakeMagnitude = 0.001; // Adjust this value to control the camera shake intensity
  
      // Shake the camera based on bass intensity
      camera.position.x += (Math.random() - 0.5) * shakeMagnitude * bassIntensity;
      camera.position.y += (Math.random() - 0.5) * shakeMagnitude * bassIntensity;
      camera.position.z += (Math.random() - 0.5) * shakeMagnitude * bassIntensity;
  
      state.currAudio += Math.pow((analyser.getFrequencyData()[2] / 255) * .81, 8) + state.time * .5;
      state.audio = .2 * state.currAudio + .8 * state.audio;
    }
    
    state.pointerDown = 0.1 * state.currPointerDown + 0.9 * state.pointerDown;
    state.mouse.lerp(state.currMouse, 0.05);
    renderer.render(scene, camera);
  };
  
  render();