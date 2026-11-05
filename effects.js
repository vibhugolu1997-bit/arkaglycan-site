/* Arka Glycan home page: 3D hero and interaction (plain JavaScript; Three.js r128 from cdnjs).
 *
 * - A core-fucosylated, disialylated biantennary N-glycan (A2G2S2F) in SNFG symbols rotates
 *   above a 3D MS/MS spectrum whose peaks rise and fall. Drag to turn it; it leans towards the
 *   pointer. Rendering pauses when the hero is off screen or the tab is hidden.
 * - Cards tilt in 3D under the pointer.
 * - With prefers-reduced-motion, one still frame is drawn and nothing else moves. Without
 *   WebGL (or if the library did not load) the inline SVG fallback stays visible.
 */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 3D glycan and spectrum ---------- */
  function startHero() {
    var holder = document.getElementById("glycan-3d");
    if (!holder || typeof THREE === "undefined") return;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      return;                                   // no WebGL: keep the SVG fallback
    }
    holder.classList.add("webgl-ready");
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    holder.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 1.2, 12.5);
    camera.lookAt(0, 0.4, 0);

    scene.add(new THREE.AmbientLight(0x8fa3d6, 0.65));
    var key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(4, 6, 8);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0xf5a524, 0.55);
    rim.position.set(-6, -2, -4);
    scene.add(rim);

    // SNFG colours (Symbol Nomenclature for Glycans)
    var SNFG = { GlcNAc: 0x0072bc, Man: 0x00a651, Gal: 0xffd400, Fuc: 0xed1c24, NeuAc: 0xa54399 };
    function material(color) {
      return new THREE.MeshStandardMaterial({ color: color, roughness: 0.35, metalness: 0.15 });
    }
    var shapes = {
      GlcNAc: new THREE.BoxGeometry(0.62, 0.62, 0.62),
      Man: new THREE.SphereGeometry(0.36, 32, 24),
      Gal: new THREE.SphereGeometry(0.36, 32, 24),
      Fuc: new THREE.ConeGeometry(0.36, 0.66, 3),
      NeuAc: new THREE.OctahedronGeometry(0.42)
    };

    // A2G2S2F: reducing-end GlcNAc on the right, antennae branching to the left
    var residues = [
      ["GlcNAc", 3.4, 0, 0],      // 0 reducing end
      ["GlcNAc", 2.1, 0, 0],      // 1
      ["Man", 0.8, 0, 0],         // 2 beta-Man
      ["Man", -0.4, 1.1, 0.3],    // 3 alpha6 arm
      ["Man", -0.4, -1.1, -0.3],  // 4 alpha3 arm
      ["GlcNAc", -1.7, 1.5, 0.5], // 5
      ["GlcNAc", -1.7, -1.5, -0.5], // 6
      ["Gal", -3.0, 1.75, 0.7],   // 7
      ["Gal", -3.0, -1.75, -0.7], // 8
      ["NeuAc", -4.3, 1.95, 0.9], // 9
      ["NeuAc", -4.3, -1.95, -0.9], // 10
      ["Fuc", 3.4, -1.3, 0.4]     // 11 core fucose
    ];
    var links = [[0, 1], [1, 2], [2, 3], [2, 4], [3, 5], [4, 6], [5, 7], [6, 8], [7, 9], [8, 10], [0, 11]];

    var glycan = new THREE.Group();
    var positions = residues.map(function (r) { return new THREE.Vector3(r[1], r[2], r[3]); });
    var bondMaterial = new THREE.MeshStandardMaterial({ color: 0xc9d3ea, roughness: 0.6 });
    links.forEach(function (pair) {
      var a = positions[pair[0]], b = positions[pair[1]];
      var length = a.distanceTo(b);
      var bond = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, length, 10), bondMaterial);
      bond.position.copy(a).add(b).multiplyScalar(0.5);
      bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      glycan.add(bond);
    });
    residues.forEach(function (r, i) {
      var mesh = new THREE.Mesh(shapes[r[0]], material(SNFG[r[0]]));
      mesh.position.copy(positions[i]);
      if (r[0] === "Fuc") mesh.rotation.z = Math.PI;      // SNFG triangle points down from its parent
      mesh.userData.phase = i * 0.7;
      glycan.add(mesh);
    });
    glycan.position.set(0.4, 1.3, 0);
    scene.add(glycan);

    // 3D MS/MS spectrum: a floor of peaks (B ions blue, Y ions amber, others grey)
    var spectrum = new THREE.Group();
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(11, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x12224a, roughness: 0.9, transparent: true, opacity: 0.85 }));
    floor.rotation.x = -Math.PI / 2;
    spectrum.add(floor);
    var grid = new THREE.GridHelper(11, 22, 0x26396b, 0x1b3062);
    grid.position.y = 0.01;
    grid.scale.z = 3.2 / 11;
    spectrum.add(grid);
    var peaks = [];
    var seed = 7;
    function random() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    for (var i = 0; i < 46; i++) {
      var kind = i % 7 === 0 ? "Y" : i % 5 === 0 ? "B" : "noise";
      var height = kind === "noise" ? 0.15 + random() * 0.5 : 0.7 + random() * 1.9;
      var color = kind === "Y" ? 0xf5a524 : kind === "B" ? 0x3987e5 : 0x6b7ba3;
      var bar = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1, 0.07),
        new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: kind === "noise" ? 0.05 : 0.35 }));
      bar.position.set(-5.2 + i * 0.23, height / 2, (random() - 0.5) * 0.6);
      bar.scale.y = height;
      bar.userData = { height: height, phase: random() * Math.PI * 2 };
      peaks.push(bar);
      spectrum.add(bar);
    }
    spectrum.position.set(0, -2.7, 0);
    spectrum.rotation.x = 0.18;
    scene.add(spectrum);

    // pointer and animation state (set before the first draw)
    var lean = { x: 0, y: 0 }, spin = 0, dragging = false, lastX = 0, velocity = 0.0035;
    var visible = true, running = false;

    // size to the holder
    function resize() {
      var w = holder.clientWidth, h = holder.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      draw(performance.now());
      camera.aspect = w / h;
      camera.position.z = w < 400 ? 15.5 : 13.5;    // pull back on phone-width screens
      camera.updateProjectionMatrix();
    }
    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(holder);
    else window.addEventListener("resize", resize);

    // pointer: lean towards it; drag to turn
    holder.addEventListener("pointermove", function (e) {
      var box = holder.getBoundingClientRect();
      lean.x = ((e.clientY - box.top) / box.height - 0.5) * 0.5;
      lean.y = ((e.clientX - box.left) / box.width - 0.5) * 0.6;
      if (dragging) { spin += (e.clientX - lastX) * 0.01; lastX = e.clientX; draw(0); }
    });
    holder.addEventListener("pointerdown", function (e) {
      dragging = true; lastX = e.clientX; holder.setPointerCapture(e.pointerId);
    });
    holder.addEventListener("pointerup", function () { dragging = false; });
    holder.addEventListener("pointerleave", function () { lean.x = 0; lean.y = 0; });

    function draw(t) {
      var time = t / 1000;
      if (!reduceMotion && !dragging) spin += velocity;
      glycan.rotation.y += (spin + lean.y - glycan.rotation.y) * 0.08;
      glycan.rotation.x += (lean.x * 0.6 - glycan.rotation.x) * 0.08;
      if (!reduceMotion) {
        glycan.position.y = 1.3 + Math.sin(time * 0.9) * 0.12;
        glycan.children.forEach(function (child) {
          if (child.userData.phase !== undefined) {
            var s = 1 + Math.sin(time * 1.6 + child.userData.phase) * 0.05;
            child.scale.set(s, s, s);
          }
        });
        peaks.forEach(function (bar) {
          var h = bar.userData.height * (0.75 + 0.25 * Math.sin(time * 1.3 + bar.userData.phase));
          bar.scale.y = h;
          bar.position.y = h / 2;
        });
        spectrum.rotation.y = Math.sin(time * 0.25) * 0.12;
      }
      renderer.render(scene, camera);
    }
    function loop(t) {
      if (!visible || document.hidden) { running = false; return; }
      draw(t);
      requestAnimationFrame(loop);
    }
    function start() {
      draw(performance.now());   // a first frame now, even if animation frames are delayed or paused
      if (reduceMotion) return;
      if (!running) { running = true; requestAnimationFrame(loop); }
    }
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start();
      }).observe(holder);
    }
    document.addEventListener("visibilitychange", function () { if (!document.hidden) start(); });
    start();
  }

  /* ---------- cards that tilt in 3D under the pointer ---------- */
  function startTilt() {
    if (reduceMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.querySelectorAll(".tilt").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var box = card.getBoundingClientRect();
        var x = (e.clientX - box.left) / box.width - 0.5;
        var y = (e.clientY - box.top) / box.height - 0.5;
        card.style.transform = "perspective(800px) rotateX(" + (-y * 10).toFixed(2) + "deg) rotateY(" +
          (x * 12).toFixed(2) + "deg) translateZ(6px)";
        card.style.setProperty("--glow-x", (x + 0.5) * 100 + "%");
        card.style.setProperty("--glow-y", (y + 0.5) * 100 + "%");
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- sections lift into place as they arrive (always visible at rest) ---------- */
  function startReveal() {
    if (reduceMotion || !window.IntersectionObserver) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("arrived");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll(".lift").forEach(function (el) { observer.observe(el); });
  }

  function init() { startHero(); startTilt(); startReveal(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
