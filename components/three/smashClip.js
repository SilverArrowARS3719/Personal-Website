import * as THREE from "three";
import { catmull } from "./loft";

/*
  The jump smash, as a clip that plays in real time (seconds), not scrubbed
  by scroll: scrubbed character animation moves only as smoothly as the
  reader's thumb, which always looks like a puppet.

  It follows how a right-hander actually plays it: split-step, turn side-on
  (left shoulder to the net, racket elbow up and out, left arm tracking the
  shuttle), load, jump with the racket leg driving back, racket dropped behind
  the back, whip through to full reach, wrist snap, follow-through across the
  body with the legs scissoring, land, recover.

  The figure faces +z (the camera) at rest, racket hand on the -x side; the
  net is off to +x. So ry = 0 is side-on with the chest to the camera, and
  ry near pi/2 is facing the net.

  Angles in radians:
    air        jump height above where the planted foot would put the hips
    x          drift toward the net
    ry, rx     whole-body turn and lean (+ forward)
    cRx, cRy   spine arch (- back) and twist, shared between spine and chest
    hRx, hRy   head nod (- up) and turn (+ toward the net)
    *Sx, *Sz   shoulder swing (- forward/up; -pi is straight overhead) and
               lift away from the body
    *El        elbow bend (- bends), rWr wrist cock (- tips the racket head up)
    *Hx, *Hz   hip swing (- knee forward) and spread, *Kn knee bend (+ bends)
*/

export const DURATION = 2.8;
export const CONTACT_T = 1.45;
export const LAND_T = 1.85;

// ready: knees soft, racket held up in front with the head pointing up
const READY = {
  air: 0, x: 0, ry: 0.95, rx: 0.12, cRx: 0.1, cRy: 0, hRx: -0.15, hRy: 0.35,
  rSx: -0.55, rSz: -0.8, rEl: -1.45, rWr: -0.9, lSx: -0.7, lSz: 0.25, lEl: -1.0,
  rHx: -0.35, rHz: -0.12, rKn: 0.6, lHx: -0.3, lHz: 0.12, lKn: 0.55,
};

const PREP = {
  air: 0, x: 0, ry: 0.15, rx: 0.06, cRx: -0.05, cRy: -0.35, hRx: -0.5, hRy: 0.95,
  rSx: -0.3, rSz: -1.45, rEl: -1.9, rWr: 0.6, lSx: -2.4, lSz: 0.5, lEl: -0.2,
  rHx: 0.05, rHz: -0.18, rKn: 0.55, lHx: -0.3, lHz: 0.3, lKn: 0.4,
};

const LAND = {
  air: 0, x: 0.42, ry: 1.4, rx: 0.32, cRx: 0.3, cRy: 0.35, hRx: 0.3, hRy: 0.05,
  rSx: -0.4, rSz: 0.5, rEl: -0.8, rWr: -0.3, lSx: -0.6, lSz: 0.6, lEl: -1.0,
  rHx: -0.85, rHz: -0.1, rKn: 1.35, lHx: -0.2, lHz: 0.12, lKn: 1.15,
};

const KEYS = [
  { t: 0, ...READY },
  // split-step: a small hop to get moving
  { t: 0.28, ...READY, air: 0.06, rHx: -0.2, rKn: 0.35, lHx: -0.15, lKn: 0.3 },
  { t: 0.45, ...READY, rx: 0.16, rHx: -0.45, rKn: 0.75, lHx: -0.4, lKn: 0.7 },
  { t: 0.8, ...PREP },
  // load
  { t: 1.02, ...PREP, rx: 0.2, cRy: -0.45, hRx: -0.55, rEl: -2.05, rHx: -0.5, rKn: 1.15, lHx: -0.6, lKn: 1.05 },
  // take-off: legs extend, the turn starts, the racket begins to drop
  { t: 1.2, air: 0.22, x: 0.08, ry: 0.3, rx: -0.02, cRx: -0.25, cRy: -0.4, hRx: -0.55, hRy: 0.8,
    rSx: -0.6, rSz: -1.6, rEl: -2.3, rWr: 0.9, lSx: -2.5, lSz: 0.45, lEl: -0.3,
    rHx: 0.2, rHz: -0.12, rKn: 0.35, lHx: -0.35, lHz: 0.2, lKn: 0.4 },
  // peak: back arched, racket behind the back, racket leg kicked back
  { t: 1.35, air: 0.46, x: 0.16, ry: 0.55, rx: -0.08, cRx: -0.45, cRy: -0.25, hRx: -0.6, hRy: 0.55,
    rSx: -2.55, rSz: -0.55, rEl: -2.45, rWr: 0.8, lSx: -2.1, lSz: 0.4, lEl: -0.6,
    rHx: 0.6, rHz: -0.1, rKn: 1.5, lHx: -0.85, lHz: 0.12, lKn: 1.25 },
  // contact: full reach, just in front of the head, chest opened to the net
  { t: CONTACT_T, air: 0.5, x: 0.22, ry: 1.15, rx: 0.04, cRx: -0.05, cRy: 0.35, hRx: -0.4, hRy: 0.15,
    rSx: -2.75, rSz: -0.2, rEl: -0.05, rWr: 0.25, lSx: -0.9, lSz: 0.35, lEl: -1.7,
    rHx: 0.15, rHz: -0.08, rKn: 1.1, lHx: -0.35, lHz: 0.08, lKn: 0.95 },
  // follow-through: racket across to the left hip, wrist snapped, legs switch
  { t: 1.6, air: 0.3, x: 0.32, ry: 1.5, rx: 0.25, cRx: 0.45, cRy: 0.55, hRx: 0.25, hRy: 0,
    rSx: -0.6, rSz: 0.8, rEl: -0.4, rWr: -0.6, lSx: -0.25, lSz: 0.25, lEl: -1.8,
    rHx: -1.0, rHz: -0.08, rKn: 0.9, lHx: 0.45, lHz: 0.08, lKn: 1.3 },
  { t: LAND_T, ...LAND },
  // absorb
  { t: 2.1, ...LAND, rx: 0.36, rHx: -0.95, rKn: 1.5, lHx: -0.3, lKn: 1.3 },
  // recover, watching the shuttle
  { t: DURATION, ...READY, x: 0.42, ry: 0.95, hRx: 0.15, hRy: 0.35 },
];

const FIELDS = Object.keys(READY);

export function sampleClip(t, out = {}) {
  const n = KEYS.length;
  let i = 0;
  while (i < n - 2 && t > KEYS[i + 1].t) i++;
  const k1 = KEYS[i];
  const k2 = KEYS[i + 1];
  const u = THREE.MathUtils.clamp((t - k1.t) / (k2.t - k1.t), 0, 1);
  const k0 = KEYS[Math.max(i - 1, 0)];
  const k3 = KEYS[Math.min(i + 2, n - 1)];
  for (const f of FIELDS) out[f] = catmull(k0[f], k1[f], k2[f], k3[f], u);
  return out;
}

// time runs at a fifth of normal speed through the moment of contact
export function playbackRate(t) {
  return 1 - 0.8 * Math.exp(-(((t - CONTACT_T + 0.01) / 0.09) ** 2));
}

// ---------- applying a pose to the skeleton ---------------------------------

export const BODY = {
  hipH: 0.946, // hips above the floor when standing straight
  hipDrop: 0.07, // hip joints below the hips bone
  thigh: 0.41,
  shin: 0.4,
  ankleH: 0.066, // ankle joint above the sole
};

const reach = (lean, hip, knee, spread) =>
  (BODY.thigh * Math.cos(lean + hip) + BODY.shin * Math.cos(lean + hip + knee)) *
  Math.cos(spread);

export function applyPose(b, P) {
  // the lower foot is planted: it decides how high the body stands
  const planted =
    BODY.hipDrop +
    Math.max(reach(P.rx, P.rHx, P.rKn, P.rHz), reach(P.rx, P.lHx, P.lKn, P.lHz)) +
    BODY.ankleH;
  b.hips.position.set(P.x, planted + P.air, 0);
  b.hips.rotation.set(P.rx, P.ry, 0, "YXZ");

  // the bend is shared between two spine joints so the back curves
  b.spine.rotation.set(P.cRx * 0.5, P.cRy * 0.5, 0, "YXZ");
  b.chest.rotation.set(P.cRx * 0.5, P.cRy * 0.5, 0, "YXZ");
  b.head.rotation.set(P.hRx, P.hRy, 0, "YXZ");

  b.rShoulder.rotation.set(P.rSx, 0, P.rSz);
  b.rElbow.rotation.x = P.rEl;
  b.rWrist.rotation.x = P.rWr;
  b.lShoulder.rotation.set(P.lSx, 0, P.lSz);
  b.lElbow.rotation.x = P.lEl;

  b.rHip.rotation.set(P.rHx, 0, P.rHz);
  b.rKnee.rotation.x = P.rKn;
  b.lHip.rotation.set(P.lHx, 0, P.lHz);
  b.lKnee.rotation.x = P.lKn;

  // feet flat on the floor when planted, toes pointed in the air
  const air = THREE.MathUtils.clamp(P.air / 0.12, 0, 1);
  b.rAnkle.rotation.x = THREE.MathUtils.lerp(-(P.rx + P.rHx + P.rKn), 0.55, air);
  b.lAnkle.rotation.x = THREE.MathUtils.lerp(-(P.rx + P.lHx + P.lKn), 0.55, air);
}
