import * as THREE from 'three';
import './style.css';

// --- CONFIGURAÇÃO DA CENA ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd9b95a); // Ocre (Savana)
scene.fog = new THREE.Fog(0xd9b95a, 5, 25);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- LUZES ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 0.5);
sunLight.position.set(5, 10, 7.5);
scene.add(sunLight);

// --- CHÃO (3D) ---
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x6a8530 }); // Verde-mostarda
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// --- LÚCINHA (SPRITE 2.5D) ---
const textureLoader = new THREE.TextureLoader();
const lucinhaTexture = textureLoader.load('/assets/lucinha.png');
const lucinhaMaterial = new THREE.SpriteMaterial({ map: lucinhaTexture });
const lucinha = new THREE.Sprite(lucinhaMaterial);
lucinha.scale.set(1.5, 1.5, 1);
lucinha.position.y = 0.75;
scene.add(lucinha);

camera.position.set(0, 2, 5);
camera.lookAt(lucinha.position);

// --- LÓGICA DE MOVIMENTO ---
const keys = {
    left: false,
    right: false,
    space: false
};

window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.code === 'ArrowRight' || e.key === 'd') keys.right = true;
    if (e.code === 'Space') keys.space = true;
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.code === 'ArrowRight' || e.key === 'd') keys.right = false;
    if (e.code === 'Space') keys.space = false;
});

let velocityY = 0;
const gravity = -0.01;
const jumpForce = 0.2;
const speed = 0.1;

function animate() {
    requestAnimationFrame(animate);

    // Movimentação lateral
    if (keys.left) lucinha.position.x -= speed;
    if (keys.right) lucinha.position.x += speed;

    // Pulo simples
    if (keys.space && lucinha.position.y <= 0.75) {
        velocityY = jumpForce;
    }

    lucinha.position.y += velocityY;
    
    if (lucinha.position.y > 0.75) {
        velocityY += gravity;
    } else {
        lucinha.position.y = 0.75;
        velocityY = 0;
    }

    // Câmera segue a Lúcinha
    camera.position.x = lucinha.position.x;
    
    renderer.render(scene, camera);
}

// Resalize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
console.log('Sankofa Game Engine (MVP) Initialized');
