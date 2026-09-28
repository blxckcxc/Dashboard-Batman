// Troca de modo de visualização das malhas: Realista (PBR), Wireframe holográfico e Raio-X / Blueprint.
// Cada malha guarda o material realista em userData.matReal e o papel em userData.papel.
import * as THREE from 'three';

const WIRE = new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
const WIRE_AMBAR = new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });

function fresnel(cor, base, rim) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { cor: { value: new THREE.Color(cor) }, base: { value: base }, rim: { value: rim } },
    vertexShader: `
      varying vec3 vN; varying vec3 vV;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 cor; uniform float base; uniform float rim; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2); gl_FragColor = vec4(cor, base + f * rim); }`,
  });
}

const XRAY_CASCO = fresnel(0x93c5fd, 0.03, 0.55);
const XRAY_INTERNO = fresnel(0xf59e0b, 0.25, 0.8);
const XRAY_VIDRO = fresnel(0xe0f2fe, 0.02, 0.35);
const ARESTA = new THREE.LineBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.55 });
const ARESTA_INTERNA = new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.9 });

export function registrar(raiz) {
  raiz.traverse((o) => {
    if (!o.isMesh || o.userData.matReal) return;
    o.userData.matReal = o.material;
    if (!o.userData.papel) o.userData.papel = 'casco';
    if (o.userData.papel === 'interno') o.visible = false;
  });
}

function arestas(mesh) {
  if (mesh.userData.arestas) return mesh.userData.arestas;
  const interno = mesh.userData.papel === 'interno';
  const l = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 28), interno ? ARESTA_INTERNA : ARESTA);
  l.userData.ignorarModo = true;
  l.raycast = () => {};
  mesh.add(l);
  mesh.userData.arestas = l;
  return l;
}

export function aplicar(raiz, modo) {
  raiz.traverse((o) => {
    if (!o.isMesh || o.userData.ignorarModo || !o.userData.matReal) return;
    const papel = o.userData.papel;
    const interno = papel === 'interno';
    const chama = papel === 'chama';
    if (o.userData.arestas) o.userData.arestas.visible = false;
    if (modo === 'real') {
      o.material = o.userData.matReal;
      o.visible = !interno && (!chama || o.userData.acesa);
    } else if (modo === 'wire') {
      o.material = interno || papel === 'luz' ? WIRE_AMBAR : chama ? o.userData.matReal : WIRE;
      o.visible = !interno && (!chama || o.userData.acesa);
    } else {
      if (chama) {
        o.material = o.userData.matReal;
        o.visible = !!o.userData.acesa;
        return;
      }
      o.material = interno ? XRAY_INTERNO : papel === 'vidro' ? XRAY_VIDRO : XRAY_CASCO;
      o.visible = true;
      arestas(o).visible = true;
    }
  });
}
