import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const Virtual3DRoom = () => {
  const mountRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const cameraRef = useRef({ x: 0, y: 2, z: 8 });

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(10, 20, 10);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const pointLight = new THREE.PointLight(0xffa500, 0.8, 20);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0x2d5016, roughness: 0.8 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5deb3 });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), wallMat);
    backWall.position.set(0, 6, -15);
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), wallMat);
    leftWall.position.set(-15, 6, 0);
    leftWall.rotation.y = Math.PI / 2;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), wallMat);
    rightWall.position.set(15, 6, 0);
    rightWall.rotation.y = -Math.PI / 2;
    scene.add(rightWall);

    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    ceiling.position.y = 12;
    ceiling.rotation.x = Math.PI / 2;
    scene.add(ceiling);

    // Sofa
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.7 });
    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(4, 0.8, 2), sofaMat);
    sofaBase.position.set(-7, 0.4, 5);
    sofaBase.castShadow = true;
    scene.add(sofaBase);

    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(4, 1.5, 0.4), sofaMat);
    sofaBack.position.set(-7, 1.35, 4.2);
    scene.add(sofaBack);

    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1, 2), sofaMat);
    armL.position.set(-9, 0.9, 5);
    scene.add(armL);

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1, 2), sofaMat);
    armR.position.set(-5, 0.9, 5);
    scene.add(armR);

    // TV
    const tv = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 1.5, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 })
    );
    tv.position.set(-7, 1.7, -13.5);
    scene.add(tv);

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 1.3),
      new THREE.MeshStandardMaterial({ color: 0x0066cc, emissive: 0x003366, emissiveIntensity: 0.7 })
    );
    screen.position.set(-7, 1.7, -13.45);
    scene.add(screen);

    // Table
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.4 });
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 2), tableMat);
    tableTop.position.set(0, 1.5, 0);
    tableTop.castShadow = true;
    scene.add(tableTop);

    const legPos = [[-1.8, 0.75, -0.8], [1.8, 0.75, -0.8], [-1.8, 0.75, 0.8], [1.8, 0.75, 0.8]];
    legPos.forEach(pos => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5, 16), tableMat);
      leg.position.set(...pos);
      leg.castShadow = true;
      scene.add(leg);
    });

    // Sphere
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xff6347, roughness: 0.2, metalness: 0.8 })
    );
    sphere.position.set(0, 2, 0);
    sphere.castShadow = true;
    scene.add(sphere);

    // Lamp
    const lampStand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.1, 1.5, 16),
      new THREE.MeshStandardMaterial({ color: 0x2c2c2c, metalness: 0.9 })
    );
    lampStand.position.set(1.5, 2.35, 0.5);
    lampStand.castShadow = true;
    scene.add(lampStand);

    const lampShade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.6, 0.7, 16, 1, true),
      new THREE.MeshStandardMaterial({ 
        color: 0xffffdd,
        emissive: 0xffffaa,
        emissiveIntensity: 0.5,
        side: THREE.DoubleSide
      })
    );
    lampShade.position.set(1.5, 3.3, 0.5);
    scene.add(lampShade);

    // MAN CHARACTER - Walking around room
    const manGroup = new THREE.Group();
    
    const manBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.35, 1.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x0066cc, roughness: 0.7 })
    );
    manBody.position.y = 1.4;
    manBody.castShadow = true;
    manGroup.add(manBody);

    const manHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.8 })
    );
    manHead.position.y = 2.25;
    manHead.castShadow = true;
    manGroup.add(manHead);

    const manHair = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x2c1810, roughness: 0.9 })
    );
    manHair.position.y = 2.35;
    manGroup.add(manHair);

    const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const manLeftEye = new THREE.Mesh(eyeGeo, eyeMat);
    manLeftEye.position.set(-0.08, 2.3, 0.22);
    manGroup.add(manLeftEye);
    const manRightEye = new THREE.Mesh(eyeGeo, eyeMat);
    manRightEye.position.set(0.08, 2.3, 0.22);
    manGroup.add(manRightEye);

    const manLeftArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8),
      new THREE.MeshStandardMaterial({ color: 0x0066cc, roughness: 0.7 })
    );
    manLeftArm.position.set(-0.38, 1.5, 0);
    manLeftArm.rotation.z = 0.3;
    manLeftArm.castShadow = true;
    manGroup.add(manLeftArm);

    const manRightArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8),
      new THREE.MeshStandardMaterial({ color: 0x0066cc, roughness: 0.7 })
    );
    manRightArm.position.set(0.38, 1.5, 0);
    manRightArm.rotation.z = -0.3;
    manRightArm.castShadow = true;
    manGroup.add(manRightArm);

    const manLeftLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.1, 0.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 })
    );
    manLeftLeg.position.set(-0.15, 0.4, 0);
    manLeftLeg.castShadow = true;
    manGroup.add(manLeftLeg);

    const manRightLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.1, 0.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 })
    );
    manRightLeg.position.set(0.15, 0.4, 0);
    manRightLeg.castShadow = true;
    manGroup.add(manRightLeg);

    manGroup.position.set(4, 0, 2);
    scene.add(manGroup);

    // WOMAN CHARACTER - Sitting on sofa
    const womanGroup = new THREE.Group();
    
    const womanBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.35, 1.1, 16),
      new THREE.MeshStandardMaterial({ color: 0xff1493, roughness: 0.6 })
    );
    womanBody.position.y = 1.35;
    womanBody.castShadow = true;
    womanGroup.add(womanBody);

    const womanHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.23, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffd7ba, roughness: 0.7 })
    );
    womanHead.position.y = 2.15;
    womanHead.castShadow = true;
    womanGroup.add(womanHead);

    const womanHair = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 })
    );
    womanHair.position.y = 2.25;
    womanHair.scale.set(1, 1.2, 1);
    womanGroup.add(womanHair);

    const womanLeftEye = new THREE.Mesh(eyeGeo, eyeMat);
    womanLeftEye.position.set(-0.08, 2.2, 0.2);
    womanGroup.add(womanLeftEye);
    const womanRightEye = new THREE.Mesh(eyeGeo, eyeMat);
    womanRightEye.position.set(0.08, 2.2, 0.2);
    womanGroup.add(womanRightEye);

    const womanLeftArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.85, 8),
      new THREE.MeshStandardMaterial({ color: 0xff1493, roughness: 0.6 })
    );
    womanLeftArm.position.set(-0.32, 1.4, 0);
    womanLeftArm.rotation.z = 0.4;
    womanLeftArm.castShadow = true;
    womanGroup.add(womanLeftArm);

    const womanRightArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.85, 8),
      new THREE.MeshStandardMaterial({ color: 0xff1493, roughness: 0.6 })
    );
    womanRightArm.position.set(0.32, 1.4, 0);
    womanRightArm.rotation.z = -0.4;
    womanRightArm.castShadow = true;
    womanGroup.add(womanRightArm);

    womanGroup.position.set(-7, 0.8, 5);
    womanGroup.rotation.y = Math.PI;
    scene.add(womanGroup);

    // CHILD CHARACTER - Playing near table
    const childGroup = new THREE.Group();
    
    const childBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.25, 0.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.7 })
    );
    childBody.position.y = 0.9;
    childBody.castShadow = true;
    childGroup.add(childBody);

    const childHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.8 })
    );
    childHead.position.y = 1.5;
    childHead.castShadow = true;
    childGroup.add(childHead);

    const childLeftArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.7 })
    );
    childLeftArm.position.set(-0.25, 1, 0);
    childLeftArm.rotation.z = 0.5;
    childGroup.add(childLeftArm);

    const childRightArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.7 })
    );
    childRightArm.position.set(0.25, 1, 0);
    childRightArm.rotation.z = -0.5;
    childGroup.add(childRightArm);

    const childLeftLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.07, 0.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x0000ff, roughness: 0.8 })
    );
    childLeftLeg.position.set(-0.1, 0.25, 0);
    childGroup.add(childLeftLeg);

    const childRightLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.07, 0.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x0000ff, roughness: 0.8 })
    );
    childRightLeg.position.set(0.1, 0.25, 0);
    childGroup.add(childRightLeg);

    childGroup.position.set(-2, 0, 1);
    scene.add(childGroup);

    // Controls
    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const keys = {};
    const handleKeyDown = (e) => { keys[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e) => { keys[e.key.toLowerCase()] = false; };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    const clock = new THREE.Clock();
    let manWalkPhase = 0;
    
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const targetX = mouseRef.current.x * 5;
      const targetY = 2 + mouseRef.current.y * 2;
      
      cameraRef.current.x += (targetX - cameraRef.current.x) * 0.05;
      cameraRef.current.y += (targetY - cameraRef.current.y) * 0.05;
      
      camera.position.x = cameraRef.current.x;
      camera.position.y = cameraRef.current.y;
      
      const moveSpeed = 5 * delta;
      if (keys['w'] || keys['arrowup']) camera.position.z -= moveSpeed;
      if (keys['s'] || keys['arrowdown']) camera.position.z += moveSpeed;
      if (keys['a'] || keys['arrowleft']) camera.position.x -= moveSpeed;
      if (keys['d'] || keys['arrowright']) camera.position.x += moveSpeed;
      if (keys['q']) camera.position.y += moveSpeed;
      if (keys['e']) camera.position.y -= moveSpeed;

      camera.lookAt(0, 2, 0);

      // MAN WALKING - circular path around table
      manWalkPhase += delta * 0.5;
      const radius = 3;
      manGroup.position.x = Math.cos(manWalkPhase) * radius;
      manGroup.position.z = Math.sin(manWalkPhase) * radius;
      manGroup.rotation.y = manWalkPhase + Math.PI / 2;
      
      manBody.scale.y = 1 + Math.sin(time * 4) * 0.03;
      manLeftArm.rotation.z = 0.3 + Math.sin(time * 4) * 0.4;
      manRightArm.rotation.z = -0.3 - Math.sin(time * 4) * 0.4;
      manLeftLeg.rotation.x = Math.sin(time * 4) * 0.5;
      manRightLeg.rotation.x = -Math.sin(time * 4) * 0.5;
      manGroup.position.y = Math.abs(Math.sin(time * 4)) * 0.08;
      manHead.rotation.y = Math.sin(time * 2) * 0.3;

      // WOMAN SITTING - watching TV, head movements
      womanBody.scale.y = 1 + Math.sin(time * 1.5) * 0.02;
      womanHead.rotation.y = Math.sin(time * 0.8) * 0.2;
      womanHead.rotation.x = Math.sin(time * 1.2) * 0.1;
      womanLeftArm.rotation.z = 0.4 + Math.sin(time * 1.5) * 0.15;
      womanRightArm.rotation.z = -0.4 - Math.sin(time * 1.5) * 0.15;
      womanGroup.position.y = 0.8 + Math.sin(time * 2) * 0.02;

      // CHILD PLAYING - jumping and spinning
      childGroup.position.y = Math.abs(Math.sin(time * 2.5)) * 0.3;
      childGroup.rotation.y += delta * 2;
      childLeftArm.rotation.z = 0.5 + Math.sin(time * 3) * 0.5;
      childRightArm.rotation.z = -0.5 - Math.sin(time * 3) * 0.5;
      childLeftArm.rotation.x = Math.sin(time * 3) * 0.3;
      childRightArm.rotation.x = -Math.sin(time * 3) * 0.3;
      childHead.rotation.y = Math.sin(time * 2) * 0.4;

      sphere.rotation.y += 0.02;
      sphere.position.y = 2 + Math.sin(time * 3) * 0.1;

      pointLight.intensity = 0.6 + Math.sin(time * 2) * 0.2;
      screen.material.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.2;

      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

export default Virtual3DRoom;