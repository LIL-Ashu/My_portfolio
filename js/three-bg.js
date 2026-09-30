(function () {
  "use strict";

  var canvas = document.getElementById("heroCanvas");
  if (!canvas || typeof THREE === "undefined") return;

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isSmallScreen = window.innerWidth < 600;

  // Perf budget: mobile / small screens and reduced-motion get a much lighter (or static) field.
  var COUNT = prefersReducedMotion ? 0 : (isSmallScreen ? 1200 : 2600);

  if (COUNT === 0) {
    canvas.style.display = "none";
    return;
  }

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 14;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);

  var geometry = new THREE.BufferGeometry();
  var positions = new Float32Array(COUNT * 3);
  var speeds = new Float32Array(COUNT);

  for (var i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    speeds[i] = 0.02 + Math.random() * 0.05;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  var material = new THREE.PointsMaterial({
    color: 0x7dd3fc,
    size: 0.045,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
  });

  var points = new THREE.Points(geometry, material);
  scene.add(points);

  var mouseX = 0, mouseY = 0;
  window.addEventListener("pointermove", function (e) {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  var clock = new THREE.Clock();
  var visible = true;

  var heroEl = document.getElementById("top");
  if ("IntersectionObserver" in window && heroEl) {
    var io = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    io.observe(heroEl);
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!visible || document.hidden) return;

    var t = clock.getElapsedTime();
    var pos = geometry.attributes.position.array;
    for (var i = 0; i < COUNT; i++) {
      pos[i * 3 + 1] += Math.sin(t * speeds[i] + i) * 0.0009;
    }
    geometry.attributes.position.needsUpdate = true;

    points.rotation.y += 0.0006;
    camera.position.x += (mouseX * 1.1 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 0.7 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 150);
  });
})();
