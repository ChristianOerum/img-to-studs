<template>
    <div ref="containerEl" class="relative w-full h-full rounded-xl overflow-hidden bg-zinc-900">
        <canvas ref="canvasEl" class="block w-full h-full outline-none" :style="{ cursor: canvasCursor }"></canvas>

        <!-- Controls overlay -->
        <div class="absolute top-3 left-3 flex flex-col gap-2 bg-zinc-900/85 backdrop-blur border border-zinc-800 rounded-lg p-2.5 text-xs w-52">
            <div class="flex items-center gap-1.5">
                <button v-for="v in viewButtons" :key="v.id" @click="setView(v.id)" :title="v.title"
                    class="flex-1 px-2 py-1 rounded-full font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">{{ v.label }}</button>
            </div>
            <template v-if="!room">
                <div class="flex flex-col gap-1">
                    <div class="flex justify-between text-zinc-400"><span>Light direction</span><span class="text-white font-semibold">{{ lightAngle }}°</span></div>
                    <input type="range" min="0" max="360" step="5" v-model.number="lightAngle" class="w-full accent-amber-500">
                </div>
                <div class="flex flex-col gap-1">
                    <div class="flex justify-between text-zinc-400"><span>Light height</span><span class="text-white font-semibold">{{ lightElevation }}°</span></div>
                    <input type="range" min="5" max="85" step="5" v-model.number="lightElevation" class="w-full accent-amber-500">
                </div>
            </template>
            <label class="flex items-center justify-between cursor-pointer text-zinc-400">
                <span>Frame</span>
                <input type="checkbox" v-model="showFrame" class="accent-amber-500">
            </label>
            <p class="text-[10px] text-zinc-500 leading-relaxed">
                Drag to rotate · right-drag to pan · scroll to zoom.
                <template v-if="overlay"> Drag the see-through photo to reposition it.</template>
                <template v-else-if="!room"> A low light makes the relief stand out.</template>
            </p>
        </div>

        <div v-if="!placements && !flatImage" class="absolute inset-0 flex items-center justify-center text-sm text-zinc-500 pointer-events-none">
            Upload an image to see the 3D view.
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps({
    placements: { type: Object, default: null },  // Int32Array, 6 ints per brick (x, y, w, h, colorIdx, brickDefIdx)
    heightGrid: { type: Object, default: null },  // Uint8Array, plates of elevation per stud (or null = flat)
    numStudsX:  { type: Number, default: 0 },
    numStudsY:  { type: Number, default: 0 },
    colors:     { type: Array,  default: () => [] }, // [[r,g,b,a], …] indexed by colorIdx
    slopeBrickIdx: { type: Number, default: -1 },    // brick-def index of the 1×1 cheese slope
    room:       { type: Boolean, default: false },   // hang the artwork on the wall of a 3D living room
    showGrid:   { type: Boolean, default: false },   // dark seams between the 16×16 baseplates
    flatImage:  { type: String,  default: '' },      // data URL: show the (adjusted) image flat instead of bricks
    overlay:    { type: Object,  default: null },    // { src, x, y, w, h } original photo in canvas px (8 px = 1 stud)
})
const emit = defineEmits(['overlay-move', 'overlay-end'])

// Real LEGO proportions in stud units: 1 stud pitch = 8 mm, plate = 3.2 mm, stud = 4.8 mm Ø × 1.7 mm
const PLATE_H = 3.2 / 8
const STUD_R  = 2.4 / 8
const STUD_H  = 1.7 / 8
const GAP     = 0.04    // small seam between neighbouring parts so individual pieces read
const BASE_H  = PLATE_H // 16×16 baseplate (65803) is one plate thick
const PX_PER_STUD = 8   // the app's working canvas uses 8 px per stud
const M = 125           // studs per metre (1 stud = 8 mm) — used for the room

// 1×1 cheese slope (54200): 2 plates tall at the back, thin lip at the front.
// Built as a wedge extruded along z; 'faceLeft' = low side at −x (seen from the left).
const SLOPE_HIGH = 2 * PLATE_H
const SLOPE_LOW  = 0.35 * PLATE_H
function makeSlopeGeometry(faceLeft) {
    const s = 0.5 - 0.02 // half footprint minus seam
    const shape = new THREE.Shape()
    if (faceLeft) {
        shape.moveTo(-s, 0); shape.lineTo(s, 0); shape.lineTo(s, SLOPE_HIGH); shape.lineTo(-s, SLOPE_LOW); shape.closePath()
    } else {
        shape.moveTo(-s, 0); shape.lineTo(s, 0); shape.lineTo(s, SLOPE_LOW); shape.lineTo(-s, SLOPE_HIGH); shape.closePath()
    }
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 2 * s, bevelEnabled: false })
    geo.translate(0, 0, -s)
    return geo
}

// L-piece cells — must match L_CELLS in mosaic.worker.js / index.vue
const L_CELLS = [
    [[0,0],[0,1],[1,1]],
    [[0,0],[1,0],[0,1]],
    [[0,0],[1,0],[1,1]],
    [[1,0],[0,1],[1,1]],
]

const containerEl = ref(null)
const canvasEl    = ref(null)
const lightAngle     = ref(135)
const lightElevation = ref(35)
const showFrame      = ref(true)
const hoverOverlay   = ref(false)
const draggingOverlay = ref(false)

const canvasCursor = computed(() => draggingOverlay.value ? 'grabbing' : hoverOverlay.value ? 'move' : 'grab')
const viewButtons = computed(() => props.room
    ? [
        { id: 'room',  label: 'Room',  title: 'Overview of the room' },
        { id: 'front', label: 'Close', title: 'Straight in front of the artwork' },
        { id: 'left',  label: 'Left',  title: 'From the left (image A in dual mode)' },
        { id: 'right', label: 'Right', title: 'From the right (image B in dual mode)' },
    ]
    : [
        { id: 'angle', label: 'Angle', title: 'Angled overview' },
        { id: 'front', label: 'Front', title: 'Straight on' },
        { id: 'left',  label: 'Left',  title: 'From the left (image A in dual mode)' },
        { id: 'right', label: 'Right', title: 'From the right (image B in dual mode)' },
    ])

let renderer, scene, camera, controls, resizeObs
let deskLights, sun
let roomGroup = null, roomInfo = null
let artGroup        // holds the artwork; lies flat on the "desk" or hangs on the room's wall
let modelGroup = null
let overlayMesh = null, overlayTexSrc = ''
let sceneSize = 32
let renderQueued = false
const raycaster = new THREE.Raycaster()

function requestRender() {
    if (renderQueued || !renderer) return
    renderQueued = true
    requestAnimationFrame(() => { renderQueued = false; renderer.render(scene, camera) })
}

onMounted(() => {
    renderer = new THREE.WebGLRenderer({ canvas: canvasEl.value, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x18181b)
    camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20000)

    // "Desk" lighting (artwork lying flat, adjustable sun)
    deskLights = new THREE.Group()
    deskLights.add(new THREE.HemisphereLight(0xffffff, 0x3a3a40, 1.1))
    sun = new THREE.DirectionalLight(0xffffff, 2.2)
    sun.castShadow = true
    sun.shadow.mapSize.set(4096, 4096)
    sun.shadow.bias = -0.0005
    sun.shadow.normalBias = 0.02
    deskLights.add(sun, sun.target)
    scene.add(deskLights)

    artGroup = new THREE.Group()
    scene.add(artGroup)

    // Overlay drag listeners are registered BEFORE OrbitControls so they can disable it first
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointermove', onPointerHover)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.addEventListener('change', () => { clampToRoom(); requestRender() })

    resizeObs = new ResizeObserver(resize)
    resizeObs.observe(containerEl.value)

    resize()
    rebuild()
    applyRoom()
    updateOverlay()
})

onBeforeUnmount(() => {
    resizeObs?.disconnect()
    renderer?.domElement.removeEventListener('pointerdown', onPointerDown)
    renderer?.domElement.removeEventListener('pointermove', onPointerHover)
    window.removeEventListener('pointermove', onPointerDrag)
    window.removeEventListener('pointerup', onPointerUp)
    controls?.dispose()
    disposeModel()
    disposeGroup(roomGroup)
    if (overlayMesh) { overlayMesh.material.map?.dispose(); disposeGroup(overlayMesh) }
    renderer?.dispose()
})

function resize() {
    const el = containerEl.value
    if (!el || !renderer) return
    const w = el.clientWidth, h = el.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    requestRender()
}

// Distance at which an object of size `size` fits the viewport
function fitDistance(size) {
    const fitH = size / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    return fitH * Math.max(1, 1 / camera.aspect)
}

function setView(kind) {
    if (!camera) return
    if (props.room && roomInfo) {
        const { hangY, depth } = roomInfo
        const art = new THREE.Vector3(0, hangY, 0)
        const d = Math.min(fitDistance(sceneSize) * 1.6, depth * 0.9)
        if (kind === 'front') {
            camera.position.set(0, hangY, d)
            controls.target.copy(art)
        } else if (kind === 'left' || kind === 'right') {
            const s = kind === 'left' ? -1 : 1
            camera.position.set(s * d * 0.75, hangY, d * 0.7)
            controls.target.copy(art)
        } else {
            // Room overview: standing in the room at eye height, looking at the wall
            camera.position.set(0.2 * M, 1.45 * M, depth - 0.25 * M)
            controls.target.set(0, hangY - 0.35 * M, 0.4 * M)
        }
    } else {
        const d = fitDistance(sceneSize) * 1.5
        const v = kind === 'front' ? [0, 1, 0.001]
            : kind === 'left'  ? [-0.85, 0.5, 0.15]
            : kind === 'right' ? [0.85, 0.5, 0.15]
            : [-0.35, 0.75, 0.65]
        camera.position.set(...v).normalize().multiplyScalar(d)
        controls.target.set(0, 0, 0)
    }
    controls.update()
    requestRender()
}

// Keep the camera (and the point it orbits around) inside the room so it never
// clips through the walls, floor or ceiling. OrbitControls derives the next frame
// from the current position, so clamping here sticks.
function clampToRoom() {
    if (!props.room || !roomInfo) return
    const { width, height, depth } = roomInfo
    const m = 0.2 * M // keep ~20 cm away from every surface
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
    for (const v of [camera.position, controls.target]) {
        v.x = clamp(v.x, -width / 2 + m, width / 2 - m)
        v.y = clamp(v.y, m, height - m)
        v.z = clamp(v.z, m, depth - m)
    }
    // Don't let the camera end up exactly on its target (OrbitControls needs a direction)
    if (camera.position.distanceToSquared(controls.target) < 1) camera.position.z = Math.min(depth - m, controls.target.z + 1)
}

function updateLight() {
    if (!sun) return
    const az = THREE.MathUtils.degToRad(lightAngle.value)
    const el = THREE.MathUtils.degToRad(lightElevation.value)
    const r = sceneSize * 2
    sun.position.set(Math.cos(az) * Math.cos(el) * r, Math.sin(el) * r, -Math.sin(az) * Math.cos(el) * r)
    const s = sceneSize * 0.8
    Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 0.1, far: r * 3 })
    sun.shadow.camera.updateProjectionMatrix()
    requestRender()
}
watch([lightAngle, lightElevation], updateLight)

function disposeGroup(g) {
    if (!g) return
    g.traverse(o => {
        if (o.geometry) o.geometry.dispose()
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.map?.dispose(); m.dispose() })
    })
    g.parent?.remove(g)
}
function disposeModel() {
    disposeGroup(modelGroup)
    modelGroup = null
}

// ─────────────────────────────────────────────────────────────────────────────
//  Artwork model
// ─────────────────────────────────────────────────────────────────────────────
function rebuild() {
    if (!scene) return
    disposeModel()
    const plc = props.flatImage ? null : props.placements
    const nX = props.numStudsX, nY = props.numStudsY
    if ((!plc && !props.flatImage) || !nX || !nY) { requestRender(); return }

    const prevSize = sceneSize
    sceneSize = Math.max(nX, nY) + (showFrame.value ? 2 : 0)
    const hg = props.heightGrid
    const heightAt = (x, y) => (hg && x >= 0 && y >= 0 && x < nX && y < nY) ? hg[y * nX + x] : 0
    const ox = -nX / 2, oz = -nY / 2

    modelGroup = new THREE.Group()
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), scl = new THREE.Vector3()
    const col = new THREE.Color()
    const setColor = (mesh, idx, rgb) => { col.setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, THREE.SRGBColorSpace); mesh.setColorAt(idx, col) }
    const plasticMat = () => new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.0 })
    const boxGeo = new THREE.BoxGeometry(1, 1, 1)

    // Baseplate(s)
    const base = new THREE.Mesh(new THREE.BoxGeometry(nX, BASE_H, nY), new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.6 }))
    base.position.set(0, -BASE_H / 2, 0)
    base.receiveShadow = true
    modelGroup.add(base)

    if (showFrame.value) addFrame(modelGroup, nX, nY, ox, oz)

    let isDual = false
    if (props.flatImage) {
        // Mosaic preview off: show the adjusted source image as a flat print on the baseplate
        const tex = new THREE.TextureLoader().load(props.flatImage, requestRender)
        tex.colorSpace = THREE.SRGBColorSpace
        const print = new THREE.Mesh(new THREE.PlaneGeometry(nX, nY), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }))
        print.rotation.x = -Math.PI / 2
        print.position.y = 0.01
        print.receiveShadow = true
        modelGroup.add(print)
    } else {
        const tops = []     // colored plates  { x, z, w, d, level, color }
        const supports = [] // black columns    { x, z, w, d, level }
        const studs = []    // { x, z, level, color }
        const slopes = [[], []] // [faceLeft[], faceRight[]] of { x, z, color }
        const numP = plc.length / 6
        for (let i = 0; i < numP; i++) {
            const sx = plc[i*6], sy = plc[i*6+1], w = plc[i*6+2], h = plc[i*6+3], ci = plc[i*6+4]
            const c = ci >= 0 ? props.colors[ci] : null
            const color = c ? [c[0], c[1], c[2]] : [20, 20, 20]
            if (plc[i*6+5] === props.slopeBrickIdx) {
                // Even column faces left (image A), odd column faces right (image B)
                slopes[sx & 1].push({ x: sx, z: sy, color })
                isDual = true
                continue
            }
            const rects = w === 0
                ? L_CELLS[h - 1].map(([dx, dy]) => [sx + dx, sy + dy, 1, 1])
                : [[sx, sy, w, h]]
            for (const [rx, ry, rw, rh] of rects) {
                const level = heightAt(rx, ry)
                tops.push({ x: rx, z: ry, w: rw, d: rh, level, color })
                if (level > 0) supports.push({ x: rx, z: ry, w: rw, d: rh, level })
                for (let dy = 0; dy < rh; dy++) for (let dx = 0; dx < rw; dx++)
                    studs.push({ x: rx + dx, z: ry + dy, level, color })
            }
        }

        // Colored top plates
        if (tops.length) {
            const topMesh = new THREE.InstancedMesh(boxGeo, plasticMat(), tops.length)
            tops.forEach((t, i) => {
                pos.set(ox + t.x + t.w / 2, (t.level + 0.5) * PLATE_H, oz + t.z + t.d / 2)
                scl.set(t.w - GAP, PLATE_H, t.d - GAP)
                topMesh.setMatrixAt(i, m4.compose(pos, q, scl))
                setColor(topMesh, i, t.color)
            })
            topMesh.castShadow = topMesh.receiveShadow = true
            modelGroup.add(topMesh)
        }

        // Black support columns under raised plates
        if (supports.length) {
            const supMesh = new THREE.InstancedMesh(boxGeo.clone(), new THREE.MeshStandardMaterial({ color: 0x111113, roughness: 0.4 }), supports.length)
            supports.forEach((s, i) => {
                const hgt = s.level * PLATE_H
                pos.set(ox + s.x + s.w / 2, hgt / 2, oz + s.z + s.d / 2)
                scl.set(s.w - GAP, hgt, s.d - GAP)
                supMesh.setMatrixAt(i, m4.compose(pos, q, scl))
            })
            supMesh.castShadow = supMesh.receiveShadow = true
            modelGroup.add(supMesh)
        }

        // Studs (fewer segments on very large mosaics to stay fast)
        if (studs.length) {
            const segs = studs.length > 40000 ? 10 : 16
            const studMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(STUD_R, STUD_R, STUD_H, segs), plasticMat(), studs.length)
            scl.set(1, 1, 1)
            studs.forEach((s, i) => {
                pos.set(ox + s.x + 0.5, (s.level + 1) * PLATE_H + STUD_H / 2, oz + s.z + 0.5)
                studMesh.setMatrixAt(i, m4.compose(pos, q, scl))
                setColor(studMesh, i, s.color)
            })
            studMesh.castShadow = studMesh.receiveShadow = true
            modelGroup.add(studMesh)
        }

        // Cheese slopes (dual image mode)
        slopes.forEach((list, side) => {
            if (!list.length) return
            const mesh = new THREE.InstancedMesh(makeSlopeGeometry(side === 0), plasticMat(), list.length)
            scl.set(1, 1, 1)
            list.forEach((s, i) => {
                pos.set(ox + s.x + 0.5, 0, oz + s.z + 0.5)
                mesh.setMatrixAt(i, m4.compose(pos, q, scl))
                setColor(mesh, i, s.color)
            })
            mesh.castShadow = mesh.receiveShadow = true
            modelGroup.add(mesh)
        })
    }

    // Baseplate seams (Grid toggle): thin dark lines that follow the surface height
    if (props.showGrid && (nX > 16 || nY > 16)) {
        const segs = []
        const surfY = (lvl) => props.flatImage ? 0.03 : isDual ? SLOPE_HIGH + 0.01 : (lvl + 1) * PLATE_H + 0.01
        for (let gx = 16; gx < nX; gx += 16) for (let z = 0; z < nY; z++)
            segs.push({ x: ox + gx, z: oz + z + 0.5, w: 0.08, d: 1, y: surfY(Math.max(heightAt(gx - 1, z), heightAt(gx, z))) })
        for (let gz = 16; gz < nY; gz += 16) for (let x = 0; x < nX; x++)
            segs.push({ x: ox + x + 0.5, z: oz + gz, w: 1, d: 0.08, y: surfY(Math.max(heightAt(x, gz - 1), heightAt(x, gz))) })
        const gridMesh = new THREE.InstancedMesh(boxGeo.clone(), new THREE.MeshBasicMaterial({ color: 0x000000 }), segs.length)
        segs.forEach((s, i) => {
            pos.set(s.x, s.y, s.z); scl.set(s.w, 0.02, s.d)
            gridMesh.setMatrixAt(i, m4.compose(pos, q, scl))
        })
        modelGroup.add(gridMesh)
    }

    artGroup.add(modelGroup)
    updateLight()
    if (props.room) applyRoom(prevSize !== sceneSize)
    else if (prevSize !== sceneSize) setView('angle')
    updateOverlay()
    requestRender()
}

watch(() => [props.placements, props.heightGrid, props.numStudsX, props.numStudsY, props.colors, props.flatImage, props.showGrid], rebuild)
watch(showFrame, rebuild)

// ── Black border frame (mirrors the "Border" parts list in index.vue) ──────────
// Stack, bottom → top (y = 0 is the top of the baseplate):
//   1. 2×N plates under the baseplate edge: 1 stud under the baseplate, 1 stud sticking out
//   2. 1×N bricks standing on the protruding stud row, beside the baseplate
//   3–4. two staggered layers of 1×N plates
//   5. 1×N tiles (smooth top)
// Each layer is split into individual pieces (greedy longest-first) so seams show.
function addFrame(group, nX, nY, ox, oz) {
    const boxes = [] // { x0, x1, z0, z1, y0, y1 } in stud units, before centring offset
    const y1 = -BASE_H - PLATE_H              // bottom of layer 1
    const layersDef = [
        { y0: y1,                     h: PLATE_H,     depth: 2, sizes: [16, 12, 10, 8, 6, 4, 3, 2, 1] },
        { y0: -BASE_H,                h: 3 * PLATE_H, depth: 1, sizes: [12, 2, 1] },
        { y0: 2 * PLATE_H,            h: PLATE_H,     depth: 1, sizes: [8, 6, 4, 3, 2, 1] },
        { y0: 3 * PLATE_H,            h: PLATE_H,     depth: 1, sizes: [8, 6, 4, 3, 2, 1] },
        { y0: 4 * PLATE_H,            h: PLATE_H,     depth: 1, sizes: [4, 3, 2, 1] },
    ]
    const pack = (len, sizes, reverse) => {
        const out = []; let rem = len
        for (const sz of sizes) while (rem >= sz) { out.push(sz); rem -= sz }
        return reverse ? out.reverse() : out
    }
    layersDef.forEach((L, li) => {
        const d = L.depth
        const rev = (li & 1) === 1 // alternate piece order per layer → staggered seams
        // Horizontal runs (top & bottom) include the corners: x from -1 to nX+1
        for (const [zA, zB] of [[-1, -1 + d], [nY + 1 - d, nY + 1]]) {
            let x = -1
            for (const sz of pack(nX + 2, L.sizes, rev)) { boxes.push({ x0: x, x1: x + sz, z0: zA, z1: zB, y0: L.y0, y1: L.y0 + L.h }); x += sz }
        }
        // Vertical runs (left & right) fit between the horizontal runs
        const zStart = -1 + d, zLen = nY + 2 - 2 * d
        for (const [xA, xB] of [[-1, -1 + d], [nX + 1 - d, nX + 1]]) {
            let z = zStart
            for (const sz of pack(zLen, L.sizes, rev)) { boxes.push({ x0: xA, x1: xB, z0: z, z1: z + sz, y0: L.y0, y1: L.y0 + L.h }); z += sz }
        }
    })
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x1a1a1d, roughness: 0.32 }), boxes.length)
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), scl = new THREE.Vector3()
    boxes.forEach((b, i) => {
        pos.set(ox + (b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, oz + (b.z0 + b.z1) / 2)
        scl.set(b.x1 - b.x0 - GAP, b.y1 - b.y0 - 0.01, b.z1 - b.z0 - GAP)
        mesh.setMatrixAt(i, m4.compose(pos, q, scl))
    })
    mesh.castShadow = mesh.receiveShadow = true
    group.add(mesh)
}

// ─────────────────────────────────────────────────────────────────────────────
//  Original-photo overlay (Show original): see-through, draggable to reposition
// ─────────────────────────────────────────────────────────────────────────────
function overlayY() {
    let maxH = 0
    const hg = props.heightGrid
    if (hg) for (let i = 0; i < hg.length; i++) if (hg[i] > maxH) maxH = hg[i]
    return (maxH + 1) * PLATE_H + STUD_H + 0.4
}

function updateOverlay() {
    if (!artGroup) return
    const o = props.overlay
    if (!o || !o.src || !props.numStudsX) {
        if (overlayMesh) overlayMesh.visible = false
        requestRender()
        return
    }
    if (!overlayMesh) {
        overlayMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide })
        )
        overlayMesh.rotation.x = -Math.PI / 2
        overlayMesh.renderOrder = 10
        artGroup.add(overlayMesh)
    }
    if (overlayTexSrc !== o.src) {
        overlayMesh.material.map?.dispose()
        const tex = new THREE.TextureLoader().load(o.src, requestRender)
        tex.colorSpace = THREE.SRGBColorSpace
        overlayMesh.material.map = tex
        overlayMesh.material.needsUpdate = true
        overlayTexSrc = o.src
    }
    const w = o.w / PX_PER_STUD, h = o.h / PX_PER_STUD
    overlayMesh.scale.set(w, h, 1)
    overlayMesh.position.set(
        -props.numStudsX / 2 + o.x / PX_PER_STUD + w / 2,
        overlayY(),
        -props.numStudsY / 2 + o.y / PX_PER_STUD + h / 2,
    )
    overlayMesh.visible = true
    requestRender()
}
watch(() => props.overlay, updateOverlay, { deep: true })

function setRayFromEvent(e) {
    const r = renderer.domElement.getBoundingClientRect()
    const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    raycaster.setFromCamera(ndc, camera)
}

let drag = null // { plane, startLocal, startX, startY }
function onPointerDown(e) {
    if (e.button !== 0 || !overlayMesh?.visible || !props.overlay) return
    setRayFromEvent(e)
    const hit = raycaster.intersectObject(overlayMesh)[0]
    if (!hit) return
    // Grab the photo: stop the camera from orbiting while dragging
    controls.enabled = false
    const normal = new THREE.Vector3(0, 1, 0).transformDirection(artGroup.matrixWorld)
    drag = {
        plane: new THREE.Plane().setFromNormalAndCoplanarPoint(normal, hit.point),
        startLocal: artGroup.worldToLocal(hit.point.clone()),
        startX: props.overlay.x, startY: props.overlay.y,
    }
    draggingOverlay.value = true
    window.addEventListener('pointermove', onPointerDrag)
    window.addEventListener('pointerup', onPointerUp)
}
function onPointerDrag(e) {
    if (!drag) return
    setRayFromEvent(e)
    const p = new THREE.Vector3()
    if (!raycaster.ray.intersectPlane(drag.plane, p)) return
    const local = artGroup.worldToLocal(p)
    emit('overlay-move', {
        x: drag.startX + Math.round((local.x - drag.startLocal.x) * PX_PER_STUD),
        y: drag.startY + Math.round((local.z - drag.startLocal.z) * PX_PER_STUD),
    })
}
function onPointerUp() {
    window.removeEventListener('pointermove', onPointerDrag)
    window.removeEventListener('pointerup', onPointerUp)
    drag = null
    draggingOverlay.value = false
    controls.enabled = true
    emit('overlay-end')
}
function onPointerHover(e) {
    if (drag || !overlayMesh?.visible) { if (!drag) hoverOverlay.value = false; return }
    setRayFromEvent(e)
    hoverOverlay.value = raycaster.intersectObject(overlayMesh).length > 0
}

// ─────────────────────────────────────────────────────────────────────────────
//  3D living room (Wall preview)
// ─────────────────────────────────────────────────────────────────────────────
function woodTexture() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512
    const g = c.getContext('2d')
    const plankH = 64
    for (let y = 0, row = 0; y < 512; y += plankH, row++) {
        const offset = (row * 173) % 512
        for (let x = -offset; x < 512; x += 256) {
            const tone = 140 + ((row * 37 + x) % 5) * 8
            g.fillStyle = `rgb(${tone}, ${Math.round(tone * 0.74)}, ${Math.round(tone * 0.5)})`
            g.fillRect(x, y, 256, plankH)
            g.fillStyle = 'rgba(0,0,0,0.25)'
            g.fillRect(x, y, 2, plankH)
        }
        g.fillStyle = 'rgba(0,0,0,0.3)'
        g.fillRect(0, y, 512, 2)
        // grain
        g.strokeStyle = 'rgba(60,35,15,0.12)'
        for (let i = 0; i < 6; i++) {
            g.beginPath(); g.moveTo(0, y + 8 + i * 9); g.bezierCurveTo(170, y + 4 + i * 9, 340, y + 14 + i * 9, 512, y + 8 + i * 9); g.stroke()
        }
    }
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    return tex
}

function buildRoom() {
    disposeGroup(roomGroup)
    const nX = props.numStudsX || 48, nY = props.numStudsY || 48
    const artW = nX + (showFrame.value ? 2 : 0), artH = nY + (showFrame.value ? 2 : 0)
    const sofaTop = 0.86 * M
    const hangY = Math.max(1.5 * M, sofaTop + 0.25 * M + artH / 2)
    const height = Math.max(2.7 * M, hangY + artH / 2 + 0.35 * M)
    const width = Math.max(5 * M, artW + 1.5 * M)
    const depth = 5.5 * M
    roomInfo = { hangY, height, width, depth }

    const g = new THREE.Group()
    const mat = (color, roughness = 0.85, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra })
    const box = (w, h, d, material, x, y, z, { cast = true, receive = true } = {}) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
        m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = receive
        g.add(m); return m
    }
    const cyl = (rTop, rBot, h, material, x, y, z, segs = 24) => {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs), material)
        m.position.set(x, y, z); m.castShadow = m.receiveShadow = true
        g.add(m); return m
    }

    // Shell: floor, walls, ceiling
    const wood = woodTexture()
    wood.repeat.set(width / (2.2 * M), depth / (2.2 * M))
    box(width, 0.02 * M, depth, mat(0xffffff, 0.75, { map: wood }), 0, -0.01 * M, depth / 2, { cast: false })
    const wallMat = mat(0xe9e3d8, 0.95)
    box(width, height, 0.1 * M, wallMat, 0, height / 2, -0.05 * M, { cast: false })                         // back wall
    box(0.1 * M, height, depth, wallMat, -width / 2 - 0.05 * M, height / 2, depth / 2, { cast: false })    // left wall
    box(0.1 * M, height, depth, wallMat, width / 2 + 0.05 * M, height / 2, depth / 2, { cast: false })     // right wall
    box(width, 0.05 * M, depth, mat(0xf6f3ee, 0.95), 0, height + 0.025 * M, depth / 2, { cast: false })    // ceiling
    box(width, height, 0.1 * M, wallMat, 0, height / 2, depth + 0.05 * M, { cast: false })                 // front wall (behind the viewer; casts no shadow so window light still comes in)
    box(width, 0.09 * M, 0.015 * M, mat(0xfbfaf7, 0.6), 0, 0.045 * M, depth - 0.0075 * M)               // front baseboard
    const trim = mat(0xfbfaf7, 0.6)
    box(width, 0.09 * M, 0.015 * M, trim, 0, 0.045 * M, 0.0075 * M)                                      // baseboards
    box(0.015 * M, 0.09 * M, depth, trim, -width / 2 + 0.0075 * M, 0.045 * M, depth / 2)
    box(0.015 * M, 0.09 * M, depth, trim, width / 2 - 0.0075 * M, 0.045 * M, depth / 2)

    // Rug
    box(2.7 * M, 0.012 * M, 1.8 * M, mat(0xbba78c, 1), 0, 0.006 * M, 1.55 * M, { cast: false })

    // Sofa against the wall
    const fabric = mat(0x5a6470, 0.95), fabricDark = mat(0x4b5460, 0.95)
    const sofaW = 2.2 * M, sofaD = 0.92 * M, sz0 = 0.04 * M
    box(sofaW, 0.26 * M, sofaD, fabricDark, 0, 0.09 * M + 0.13 * M, sz0 + sofaD / 2)                            // base
    for (const sx of [-1, 1]) {
        box(0.98 * M, 0.13 * M, 0.66 * M, fabric, sx * 0.5 * M, 0.415 * M, sz0 + 0.24 * M + 0.33 * M)          // seat cushions
        box(0.97 * M, 0.46 * M, 0.2 * M, fabric, sx * 0.5 * M, 0.35 * M + 0.23 * M, sz0 + 0.12 * M)             // back cushions
        box(0.2 * M, 0.62 * M, sofaD, fabricDark, sx * (sofaW / 2 + 0.1 * M), 0.31 * M + 0.04 * M, sz0 + sofaD / 2) // arms
    }
    box(sofaW, 0.5 * M, 0.12 * M, fabricDark, 0, 0.35 * M + 0.25 * M, sz0 + 0.03 * M)                          // backrest frame
    const legMat = mat(0x2b2118, 0.5)
    for (const lx of [-1, 1]) for (const lz of [0.08, 0.84]) cyl(0.025 * M, 0.02 * M, 0.09 * M, legMat, lx * (sofaW / 2 + 0.12 * M), 0.045 * M, sz0 + lz * M)
    // Throw pillows
    box(0.42 * M, 0.38 * M, 0.12 * M, mat(0xc9a14a, 1), -0.75 * M, 0.66 * M, sz0 + 0.3 * M)
    box(0.42 * M, 0.38 * M, 0.12 * M, mat(0xd8cfc0, 1), 0.78 * M, 0.66 * M, sz0 + 0.3 * M)

    // Coffee table
    const oak = mat(0x8a6a4a, 0.55)
    box(1.1 * M, 0.04 * M, 0.6 * M, oak, 0, 0.42 * M, 1.65 * M)
    for (const lx of [-0.5, 0.5]) for (const lz of [-0.25, 0.25]) box(0.04 * M, 0.4 * M, 0.04 * M, legMat, lx * M, 0.2 * M, 1.65 * M + lz * M)
    box(0.3 * M, 0.04 * M, 0.22 * M, mat(0x37474f, 0.7), 0.2 * M, 0.46 * M, 1.6 * M)                           // book

    // Side table + lamp (right of the sofa)
    const stX = sofaW / 2 + 0.5 * M, stZ = 0.4 * M
    cyl(0.24 * M, 0.24 * M, 0.03 * M, oak, stX, 0.56 * M, stZ)
    cyl(0.03 * M, 0.03 * M, 0.54 * M, legMat, stX, 0.28 * M, stZ)
    cyl(0.16 * M, 0.18 * M, 0.02 * M, legMat, stX, 0.01 * M, stZ)
    cyl(0.07 * M, 0.09 * M, 0.2 * M, mat(0xd9d2c5, 0.4), stX, 0.68 * M, stZ)
    cyl(0.12 * M, 0.2 * M, 0.24 * M, mat(0xfff4dc, 0.9, { emissive: 0xffd9a0, emissiveIntensity: 0.55 }), stX, 0.9 * M, stZ)
    const lamp = new THREE.PointLight(0xffd6a0, 0.6, 3 * M, 0)
    lamp.position.set(stX, 0.88 * M, stZ)
    g.add(lamp)

    // Plant (left of the sofa)
    const plX = -sofaW / 2 - 0.55 * M, plZ = 0.35 * M
    cyl(0.17 * M, 0.13 * M, 0.38 * M, mat(0xb5653e, 0.8), plX, 0.19 * M, plZ)
    const leaf = mat(0x3f7d4a, 0.8), leafDark = mat(0x2f6339, 0.8)
    const blobs = [[0, 0.62, 0, 0.2], [-0.12, 0.8, 0.05, 0.16], [0.13, 0.78, -0.04, 0.17], [0.02, 0.98, 0.02, 0.15], [-0.05, 1.12, -0.03, 0.1]]
    blobs.forEach(([bx, by, bz, r], i) => {
        const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r * M, 1), i % 2 ? leafDark : leaf)
        m.position.set(plX + bx * M, by * M, plZ + bz * M); m.castShadow = m.receiveShadow = true
        g.add(m)
    })

    // Lighting: soft sky fill, warm window light (from the front-left), picture light on the art
    g.add(new THREE.HemisphereLight(0xfffaf0, 0x8a7760, 1.0))
    const win = new THREE.DirectionalLight(0xfff1dc, 1.6)
    win.position.set(-2.5 * M, 3.2 * M, 4.5 * M)
    win.target.position.set(0, 0.8 * M, 0.8 * M)
    win.castShadow = true
    win.shadow.mapSize.set(4096, 4096)
    const sb = Math.max(width, depth) * 0.6
    Object.assign(win.shadow.camera, { left: -sb, right: sb, top: sb, bottom: -sb, near: 1, far: 12 * M })
    win.shadow.bias = -0.0004
    win.shadow.normalBias = 0.5
    g.add(win, win.target)

    const spotDist = Math.max(1.2 * M, artH * 0.9)
    const spot = new THREE.SpotLight(0xfff6e8, 1.3, 0, Math.min(1.2, Math.atan((Math.max(artW, artH) * 0.95) / spotDist)), 0.8, 0)
    spot.position.set(0, hangY + spotDist * 0.75, spotDist)
    spot.target.position.set(0, hangY, 0)
    spot.castShadow = true
    spot.shadow.mapSize.set(2048, 2048)
    spot.shadow.camera.near = spotDist * 0.4
    spot.shadow.camera.far = spotDist * 3
    spot.shadow.bias = -0.0002
    spot.shadow.normalBias = 0.02
    g.add(spot, spot.target)

    roomGroup = g
    scene.add(g)
}

function applyRoom(resetView = true) {
    if (!scene) return
    if (props.room) {
        buildRoom()
        deskLights.visible = false
        scene.background = new THREE.Color(0xd9d3c9)
        // Hang the artwork: rotate so studs face the viewer (+z) and image-top points up
        camera.fov = 50 // wider lens to take in the room
        camera.updateProjectionMatrix()
        artGroup.rotation.set(Math.PI / 2, 0, 0)
        artGroup.position.set(0, roomInfo.hangY, BASE_H + PLATE_H + 0.05)
        // Stay in front of the wall: limited sideways swing and up/down tilt
        // (clampToRoom() is the hard safety net for the walls, floor and ceiling)
        controls.minAzimuthAngle = -1.25
        controls.maxAzimuthAngle = 1.25
        controls.minPolarAngle = 0.45
        controls.maxPolarAngle = 2.0
        controls.minDistance = 2
        controls.maxDistance = roomInfo.depth * 1.1
    } else {
        disposeGroup(roomGroup); roomGroup = null; roomInfo = null
        deskLights.visible = true
        scene.background = new THREE.Color(0x18181b)
        camera.fov = 35
        camera.updateProjectionMatrix()
        artGroup.rotation.set(0, 0, 0)
        artGroup.position.set(0, 0, 0)
        controls.minAzimuthAngle = -Infinity
        controls.maxAzimuthAngle = Infinity
        controls.minPolarAngle = 0
        controls.maxPolarAngle = Math.PI * 0.495 // don't go under the baseplate
        controls.minDistance = 0
        controls.maxDistance = Infinity
    }
    artGroup.updateMatrixWorld(true)
    if (resetView) setView(props.room ? 'room' : 'angle')
    requestRender()
}
watch(() => props.room, () => applyRoom(true))
</script>
