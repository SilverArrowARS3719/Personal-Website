import * as THREE from "three";

/*
  Lofting: the way a car body is actually drawn. You give a handful of cross
  sections along the car (where the centre is, how wide, how tall, how square)
  and the surface is swept smoothly through them, the same way a shipwright
  runs planks over frames. Between the key sections every value follows a
  Catmull-Rom curve, so there are no creases where one section meets the next.

  Each section: { x, y, z, w, h, n }
    x        position along the car (nose is +x)
    y, z     centre of the section
    w, h     half-width (across the car) and half-height
    n        squareness: 2 is an ellipse, 4 and up is a rounded box

  The geometry also carries a `loft` attribute, (along, around): along runs
  0 at the first section to 1 at the last, around runs 0 at the underside,
  0.25 on the +z flank, 0.5 on top and 0.75 on the -z flank. Livery shaders
  use it to paint stripes that follow the surface.
*/

const FIELDS = ["x", "y", "z", "w", "h", "n"];
const sgnPow = (v, p) => Math.sign(v) * Math.abs(v) ** p;

export function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

function sample(keys, steps) {
  const segs = keys.length - 1;
  const out = [];
  for (let i = 0; i <= steps; i++) {
    const u = (i / steps) * segs;
    const s = Math.min(Math.floor(u), segs - 1);
    const t = u - s;
    const k0 = keys[Math.max(s - 1, 0)];
    const k1 = keys[s];
    const k2 = keys[s + 1];
    const k3 = keys[Math.min(s + 2, segs)];
    const sec = {};
    for (const f of FIELDS) sec[f] = catmull(k0[f], k1[f], k2[f], k3[f], t);
    // squareness and size can overshoot on a spline; keep them sane
    sec.w = Math.max(sec.w, 0.002);
    sec.h = Math.max(sec.h, 0.002);
    sec.n = Math.max(sec.n, 1.6);
    out.push(sec);
  }
  return out;
}

export function loft(keySections, { steps = 96, radial = 56, caps = true } = {}) {
  const keys = keySections.map((k) => ({ z: 0, n: 2.6, ...k }));
  const secs = sample(keys, steps);
  const ring = radial + 1; // the seam vertex is doubled so `around` never wraps mid-triangle

  const pos = [];
  const uv = [];
  secs.forEach((s, i) => {
    for (let j = 0; j <= radial; j++) {
      const a = j / radial;
      const ang = -Math.PI / 2 + a * Math.PI * 2;
      pos.push(
        s.x,
        s.y + s.h * sgnPow(Math.sin(ang), 2 / s.n),
        s.z + s.w * sgnPow(Math.cos(ang), 2 / s.n)
      );
      uv.push(i / steps, a);
    }
  });

  const index = [];
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * ring + j;
      const b = a + 1;
      const c = a + ring;
      const d = c + 1;
      index.push(a, b, c, b, d, c);
    }
  }

  if (caps) {
    const cap = (s, ringStart, front, along) => {
      const centre = pos.length / 3;
      pos.push(s.x, s.y, s.z);
      uv.push(along, 0.5);
      for (let j = 0; j < radial; j++) {
        const p = ringStart + j;
        if (front) index.push(centre, p + 1, p);
        else index.push(centre, p, p + 1);
      }
    };
    cap(secs[0], 0, true, 0);
    cap(secs[secs.length - 1], steps * ring, false, 1);
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("loft", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

/*
  A wing section: a cambered teardrop with the leading edge at x = 0 and the
  trailing edge at x = -chord, extruded across the car and centred on z = 0.
  The camber is downward, because an F1 wing is an upside-down aeroplane wing.
*/
export function airfoil(chord, span, thickness = 0.09, camber = 0.06) {
  const s = new THREE.Shape();
  const n = 14;
  const half = (u) => thickness * chord * (1.4 * Math.sqrt(u) - 1.2 * u - 0.2 * u * u);
  const mean = (u) => -camber * chord * 4 * u * (1 - u);
  s.moveTo(0, 0);
  for (let i = 1; i <= n; i++) {
    const u = i / n;
    s.lineTo(-u * chord, mean(u) + half(u));
  }
  for (let i = n - 1; i >= 1; i--) {
    const u = i / n;
    s.lineTo(-u * chord, mean(u) - half(u));
  }
  s.lineTo(0, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: span, bevelEnabled: false, curveSegments: 4 });
  g.translate(0, 0, -span / 2);
  g.computeVertexNormals();
  return g;
}

// a flat plate drawn as an outline in the car's side view (x, y), `thick` deep
export function sidePlate(points, thick = 0.015) {
  const s = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: false });
  g.translate(0, 0, -thick / 2);
  return g;
}

// a flat plate drawn as an outline in plan view (x, z), `thick` deep, top at y = 0
export function planPlate(points, thick = 0.025) {
  const s = new THREE.Shape(points.map(([x, z]) => new THREE.Vector2(x, z)));
  const g = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: false });
  // shape y -> world z, extrude direction -> world -y
  g.rotateX(Math.PI / 2);
  return g;
}

// a solid of revolution around the z axis (wheel parts), profile as [radius, z]
export function turned(profile, segments = 64) {
  const g = new THREE.LatheGeometry(
    profile.map(([r, z]) => new THREE.Vector2(r, z)),
    segments
  );
  // lathe spins round y; the wheel axle is z
  g.rotateX(Math.PI / 2);
  g.computeVertexNormals();
  return g;
}
