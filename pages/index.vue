<template>

    <div class="flex h-screen bg-zinc-950 overflow-hidden">

        <!-- ── Left Panel ─────────────────────────────────────────────── -->
        <div class="bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0 overflow-hidden" :style="{ width: panelWidth + 'px' }">

            <!-- Stats -->
            <div class="px-4 py-3 border-b border-zinc-800 space-y-3">

                <div class="flex items-center gap-2">
                    <img id="originalImage" alt="Original" class="h-10 w-10 rounded-md object-cover shrink-0" src="">
                    <div>
                        <p class="text-xs font-semibold text-white leading-none">LEGO Mosaic</p>
                        <p class="text-[10px] text-zinc-500 leading-none mt-0.5">img-to-studs</p>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-2">
                    <div class="bg-zinc-800 rounded-lg px-2.5 py-2">
                        <p class="text-[9px] text-zinc-500 uppercase tracking-widest leading-none mb-1">Size</p>
                        <p class="text-xs font-semibold text-white leading-none">
                            {{ ((0.80*16)*useImageStore().width).toFixed(0) }}×{{ ((0.80*16)*useImageStore().height).toFixed(0) }}<span class="text-zinc-500 font-normal"> cm</span>
                        </p>
                    </div>
                    <div class="bg-zinc-800 rounded-lg px-2.5 py-2">
                        <p class="text-[9px] text-zinc-500 uppercase tracking-widest leading-none mb-1">Plates</p>
                        <p class="text-xs font-semibold text-white leading-none">
                            {{ (16 * useImageStore().width) * (16 * useImageStore().height) }}
                        </p>
                    </div>
                    <div @click="useMenuStore().menuItemShow = 'P'" class="bg-zinc-800 rounded-lg px-2.5 py-2 cursor-pointer hover:bg-zinc-700 transition-colors">
                        <p class="text-[9px] text-zinc-500 uppercase tracking-widest leading-none mb-1">Price</p>
                        <p class="text-xs font-semibold text-white leading-none truncate">{{ totalPrice }}</p>
                    </div>
                </div>

                <!-- Toggle buttons + locale -->
                <div class="flex items-center gap-1.5 flex-wrap">
                    <button
                        @click="useImageStore().previewShowMosaic = !useImageStore().previewShowMosaic; initConvert()"
                        class="px-2.5 py-1 rounded-full text-xs font-semibold transition-colors"
                        :class="useImageStore().previewShowMosaic ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'"
                    >Mosaic</button>

                    <button
                        @click="useImageStore().showGrid = !useImageStore().showGrid; initConvert()"
                        class="px-2.5 py-1 rounded-full text-xs font-semibold transition-colors"
                        :class="useImageStore().showGrid ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'"
                    >Grid</button>

                    <button
                        @click="useImageStore().previewArtOnWall = !useImageStore().previewArtOnWall; initConvert()"
                        class="px-2.5 py-1 rounded-full text-xs font-semibold transition-colors"
                        :class="useImageStore().previewArtOnWall ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'"
                    >Wall</button>

                    <select v-model="selectedLocale" class="ml-auto bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs font-semibold focus:outline-none focus:border-amber-500 transition-colors cursor-pointer">
                        <option v-for="(loc, key) in locales" :key="key" :value="key">{{ loc.flag }} {{ loc.currency }}</option>
                    </select>
                </div>

            </div>

            <!-- Nav tabs -->
            <div class="grid grid-cols-5 border-b border-zinc-800 shrink-0">

                <button
                    @click="useMenuStore().menuItemShow = 'SI'"
                    class="flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-medium transition-colors relative"
                    :class="useMenuStore().menuItemShow === 'SI' ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'"
                >
                    <Icon name="material-symbols:image-outline-rounded" class="text-[17px]" />
                    <span>Image</span>
                    <div v-if="useMenuStore().menuItemShow === 'SI'" class="absolute bottom-0 left-1 right-1 h-0.5 bg-amber-400 rounded-full"></div>
                </button>

                <button
                    @click="useMenuStore().menuItemShow = 'S'"
                    class="flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-medium transition-colors relative"
                    :class="useMenuStore().menuItemShow === 'S' ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'"
                >
                    <Icon name="iconoir:add-frame" class="text-[17px]" />
                    <span>Size</span>
                    <div v-if="useMenuStore().menuItemShow === 'S'" class="absolute bottom-0 left-1 right-1 h-0.5 bg-amber-400 rounded-full"></div>
                </button>

                <button
                    @click="useMenuStore().menuItemShow = 'AI'"
                    class="flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-medium transition-colors relative"
                    :class="useMenuStore().menuItemShow === 'AI' ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'"
                >
                    <Icon name="streamline:interface-setting-slider-vertical-adjustment-adjust-controls-fader-vertical-settings-slider" class="text-[17px]" />
                    <span>Adjust</span>
                    <div v-if="useMenuStore().menuItemShow === 'AI'" class="absolute bottom-0 left-1 right-1 h-0.5 bg-amber-400 rounded-full"></div>
                </button>

                <button
                    @click="useMenuStore().menuItemShow = 'C'"
                    class="flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-medium transition-colors relative"
                    :class="useMenuStore().menuItemShow === 'C' ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'"
                >
                    <Icon name="mingcute:color-picker-line" class="text-[17px]" />
                    <span>Colors</span>
                    <div v-if="useMenuStore().menuItemShow === 'C'" class="absolute bottom-0 left-1 right-1 h-0.5 bg-amber-400 rounded-full"></div>
                </button>

                <button
                    @click="useMenuStore().menuItemShow = 'P'"
                    class="flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-medium transition-colors relative"
                    :class="useMenuStore().menuItemShow === 'P' ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'"
                >
                    <Icon name="tabler:lego" class="text-[17px]" />
                    <span>Pieces</span>
                    <div v-if="useMenuStore().menuItemShow === 'P'" class="absolute bottom-0 left-1 right-1 h-0.5 bg-amber-400 rounded-full"></div>
                </button>

            </div>

            <!-- Tab content — fills remaining height -->
            <div class="flex-1 overflow-y-auto no-scrollbar px-4 py-3">

                <!-- Source Image upload -->
                <div v-if="useMenuStore().menuItemShow === 'SI'" class="flex items-center justify-center w-full h-full min-h-32">
                    <label for="fileInput" class="flex flex-col items-center justify-center w-full h-full border border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 transition-all gap-2 p-6">
                        <svg class="w-7 h-7 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <div class="text-center">
                            <p class="text-sm text-zinc-400"><span class="font-semibold text-white">Click to upload</span></p>
                            <p class="text-xs text-zinc-600 mt-0.5">PNG, JPG or WEBP</p>
                        </div>
                        <input @change="fileInputChange()" id="fileInput" type="file" class="hidden" accept="image/*" />
                    </label>
                </div>

                <!-- Size -->
                <div v-if="useMenuStore().menuItemShow === 'S'" class="flex flex-col gap-4">
                    <p class="text-[10px] text-zinc-500 uppercase tracking-widest">Baseplates (16×16 studs each)</p>
                    <div class="flex flex-col gap-3">
                        <div class="flex flex-col gap-1">
                            <label class="text-xs text-zinc-400">Width</label>
                            <input @change="initConvert()" id="widthBox" type="number" v-model="useImageStore().width"
                                class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:border-amber-500 transition-colors">
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-xs text-zinc-400">Height</label>
                            <input @change="initConvert()" id="heightBox" type="number" v-model="useImageStore().height"
                                class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:border-amber-500 transition-colors">
                        </div>
                        <p class="text-xs text-zinc-500">
                            = {{ useImageStore().width * 16 }} × {{ useImageStore().height * 16 }} studs total
                        </p>
                    </div>
                </div>

                <!-- Adjust image -->
                <div v-if="useMenuStore().menuItemShow === 'AI'" class="flex flex-col gap-3">
                    <div class="flex flex-col gap-3">
                        <div class="flex flex-col gap-1">
                            <label class="text-xs text-zinc-400">Brightness</label>
                            <input @change="initConvert()" id="brightness" step="10" type="number" v-model="useImageStore().brightness"
                                class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:border-amber-500 transition-colors">
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-xs text-zinc-400">Contrast</label>
                            <input @change="initConvert()" id="contrast" step="0.1" type="number" v-model="useImageStore().contrast"
                                class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:border-amber-500 transition-colors">
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-xs text-zinc-400">X offset</label>
                            <input @change="initConvert()" type="number" v-model="useImageStore().x"
                                class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:border-amber-500 transition-colors">
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-xs text-zinc-400">Y offset</label>
                            <input @change="initConvert()" type="number" v-model="useImageStore().y"
                                class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:border-amber-500 transition-colors">
                        </div>
                    </div>
                    <label class="flex items-center gap-2.5 cursor-pointer w-fit">
                        <div class="relative inline-flex items-center">
                            <input @change="initConvert()" id="checkboxAR" type="checkbox" v-model="useImageStore().grayscale" class="sr-only peer">
                            <div class="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                        </div>
                        <span class="text-sm text-zinc-300">Grayscale</span>
                    </label>
                    <label class="flex items-center gap-2.5 cursor-pointer w-fit">
                        <div class="relative inline-flex items-center">
                            <input type="checkbox" v-model="showOriginalOverlay" class="sr-only peer">
                            <div class="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                        </div>
                        <span class="text-sm text-zinc-300">Show original</span>
                    </label>
                </div>

                <!-- Colors -->
                <div v-if="useMenuStore().menuItemShow === 'C'">
                    <div class="flex items-center justify-between mb-3">
                        <p class="text-[10px] text-zinc-500 uppercase tracking-widest">LEGO Colors</p>
                        <div class="flex items-center gap-1.5">
                            <button @click="toggleExpensiveColors()" class="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors flex items-center gap-1">
                                <Icon name="material-symbols:diamond-outline" class="text-sm" />
                                Toggle expensive
                            </button>
                            <button @click="toggleAllColors()" class="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors">
                                Toggle all
                            </button>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-1.5">
                        <label v-for="(item, index) in useImageStore().allColorOptions" :key="index" class="h-8 w-8 cursor-pointer">
                            <div
                                class="group relative h-8 w-8 rounded-md flex items-center justify-center ring-2 transition-all"
                                :class="item.checked ? 'ring-white/30' : 'ring-transparent opacity-35'"
                                :style="{ backgroundColor: `rgba(${item.color.join(',')})` }"
                            >
                                <Icon v-if="item.checked" class="text-white text-xl drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" name="material-symbols:fitbit-check-small-rounded" />
                                <Icon v-if="item.expensive" name="material-symbols:diamond" class="absolute -top-1 -right-1 text-[11px] text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                                <input type="checkbox" :id="'colorCheckbox' + index" v-model="item.checked" @change="initConvert()" class="hidden">
                                <div class="absolute bg-zinc-900 border border-zinc-700 w-max bottom-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md hidden group-hover:block z-10 text-xs text-white shadow-xl pointer-events-none">
                                    {{ item.colorName }}<span v-if="item.expensive" class="ml-1 text-amber-300">&#9670;</span>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Pieces -->
                <div v-if="useMenuStore().menuItemShow === 'P'">
                    <p class="text-[10px] text-zinc-500 tracking-widest mb-3">1x1 PLATES</p>
                    <div class="flex flex-col gap-1.5 mb-4">
                        <template v-for="(item, index) in useImageStore().allColorOptions" :key="index">
                            <div v-if="item.count !== 0" class="flex items-center gap-2">
                                <div class="h-3.5 w-3.5 rounded shrink-0 ring-1 ring-white/10" :style="{ backgroundColor: `rgba(${item.color.join(',')})` }"></div>
                                <span class="text-sm text-white font-semibold shrink-0">{{ item.count }}×</span>
                                <span class="text-sm text-zinc-400 truncate flex-1">{{ item.colorName }}</span>
                                <span class="text-xs text-zinc-500 shrink-0">{{ formatPrice(item.count * 0.25) }}</span>
                            </div>
                        </template>
                    </div>
                    <p class="text-[10px] text-zinc-500 tracking-widest mb-3">16x16 BASEPLATES</p>
                    <div class="flex items-center gap-2">
                        <div class="h-3.5 w-3.5 rounded shrink-0 ring-1 ring-white/10 bg-zinc-600"></div>
                        <span class="text-sm text-white font-semibold shrink-0">{{ useImageStore().width * useImageStore().height }}×</span>
                        <span class="text-sm text-zinc-400 truncate flex-1">16×16 Baseplate</span>
                        <span class="text-xs text-zinc-500 shrink-0">{{ formatPrice(useImageStore().width * useImageStore().height * 30) }}</span>
                    </div>
                    <p class="text-[10px] text-zinc-600 leading-relaxed mt-4">
                        Prices are estimates based on average retail costs and may vary. Not sourced from live data.
                    </p>
                    <button @click="copyBricklinkXML()" class="w-full mt-3 py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2">
                        <Icon :name="bricklinkCopied ? 'material-symbols:check-rounded' : 'material-symbols:content-copy-outline-rounded'" class="text-base" />
                        {{ bricklinkCopied ? 'Copied!' : 'Copy BrickLink Want List' }}
                    </button>
                    <p class="text-[10px] text-zinc-600 leading-relaxed mt-2">
                        Paste at <span class="text-zinc-500">bricklink.com → Wanted List → Upload → "Upload BrickLink XML format"</span>
                    </p>
                </div>

            </div>
        </div>

        <!-- ── Resize Handle ──────────────────────────────────────────── -->
        <div
            @mousedown="startResize"
            class="w-1 shrink-0 cursor-col-resize bg-zinc-800 hover:bg-amber-400 transition-colors relative group"
        >
            <!-- wider invisible hit area -->
            <div class="absolute inset-y-0 -left-1.5 -right-1.5"></div>
        </div>

        <!-- ── Canvas / Preview Area ─────────────────────────────────── -->
        <div class="flex-1 min-w-0 overflow-auto no-scrollbar flex items-center justify-center p-6 relative">

            <canvas
                v-if="!useImageStore().previewArtOnWall"
                ref="legoCanvasEl"
                id="legoCanvas"
                class="max-w-full max-h-full shadow-[0_0_80px_rgba(0,0,0,0.9)]"
            ></canvas>

            <!-- Original image overlay for drag-to-reposition -->
            <img
                v-if="showOriginalOverlay && originalImageSrc && !useImageStore().previewArtOnWall"
                :src="originalImageSrc"
                alt=""
                draggable="false"
                :style="overlayStyle"
                class="absolute opacity-50 select-none pointer-events-auto"
                :class="isDraggingOverlay ? 'cursor-grabbing' : 'cursor-grab'"
                @mousedown.prevent="startOverlayDrag"
            />

            <div v-if="useImageStore().previewArtOnWall" ref="wallContainerEl" class="w-full h-full flex items-center justify-center relative">
                <img id="preview-image" alt="Preview Image" class="rounded-xl w-full max-h-full object-contain shadow-2xl" src="../assets/images/livingroom.jpg">
                <div
                    id="image-container"
                    :style="wallContainerStyle"
                    class="absolute h-auto w-[20px] border-4 border-black overflow-hidden rounded-sm shadow-2xl select-none"
                    :class="isDraggingWall ? 'cursor-grabbing' : 'cursor-grab'"
                    @mousedown.prevent="startWallDrag"
                >
                    <canvas id="legoCanvas" class="w-full h-auto"></canvas>
                </div>
            </div>

            <div v-if="isProcessing" class="absolute inset-0 flex items-center justify-center bg-zinc-950/60 z-10">
                <div class="flex flex-col items-center gap-2">
                    <div class="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                    <span class="text-xs text-zinc-400 font-medium">Calculating…</span>
                </div>
            </div>

        </div>

    </div>

</template>

<script setup>

import { useImageStore } from '@/stores/ImageStore'
import { useMenuStore } from '@/stores/ShowMenu'
import { onMounted, onUnmounted, ref, computed } from 'vue';

const showOriginalOverlay = ref(false)
const originalImageSrc = ref('')
const isDraggingOverlay = ref(false)
const legoCanvasEl = ref(null)
const wallContainerEl = ref(null)
const isDraggingWall = ref(false)
const wallMosaicPos = ref({ x: null, y: null })

const wallContainerStyle = computed(() => {
    if (wallMosaicPos.value.x === null) {
        return { top: '30%', left: '50%', transform: 'translate(-50%, -50%)' }
    }
    return { top: wallMosaicPos.value.y + 'px', left: wallMosaicPos.value.x + 'px', transform: 'none' }
})

function startWallDrag(e) {
    const container = wallContainerEl.value
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const el = e.currentTarget
    const elRect = el.getBoundingClientRect()

    // On first drag, convert CSS-centred position into absolute pixels
    if (wallMosaicPos.value.x === null) {
        wallMosaicPos.value = {
            x: elRect.left - containerRect.left,
            y: elRect.top  - containerRect.top
        }
    }

    isDraggingWall.value = true
    const startX    = e.clientX
    const startY    = e.clientY
    const startPosX = wallMosaicPos.value.x
    const startPosY = wallMosaicPos.value.y

    function onMove(ev) {
        wallMosaicPos.value = {
            x: startPosX + (ev.clientX - startX),
            y: startPosY + (ev.clientY - startY)
        }
    }
    function onUp() {
        isDraggingWall.value = false
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup',   onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
}
// Dimensions of the hidden offscreen canvas (set in convertToLego after sizing)
const overlayImgCanvasW = ref(0)
const overlayImgCanvasH = ref(0)

const overlayStyle = computed(() => {
    const legoC = legoCanvasEl.value || document.getElementById('legoCanvas')
    if (!legoC || !legoC.width || !overlayImgCanvasW.value) return { display: 'none' }
    // Display scale: how many CSS px per legoCanvas natural pixel
    const scale = legoC.offsetWidth / legoC.width
    const container = legoC.parentElement
    if (!container) return { display: 'none' }
    const containerRect = container.getBoundingClientRect()
    const canvasRect   = legoC.getBoundingClientRect()
    const left = canvasRect.left - containerRect.left + useImageStore().x * scale
    const top  = canvasRect.top  - containerRect.top  + useImageStore().y * scale
    return {
        left:   left + 'px',
        top:    top  + 'px',
        // Size = hidden canvas dimensions converted to display pixels
        width:  overlayImgCanvasW.value * scale + 'px',
        height: overlayImgCanvasH.value * scale + 'px',
    }
})

function startOverlayDrag(e) {
    isDraggingOverlay.value = true
    const startX = e.clientX
    const startY = e.clientY
    const startStoreX = useImageStore().x
    const startStoreY = useImageStore().y
    const canvas = legoCanvasEl.value || document.getElementById('legoCanvas')
    const scale = canvas ? canvas.offsetWidth / canvas.width : 1

    function onMove(ev) {
        useImageStore().x = startStoreX + Math.round((ev.clientX - startX) / scale)
        useImageStore().y = startStoreY + Math.round((ev.clientY - startY) / scale)
    }
    function onUp() {
        isDraggingOverlay.value = false
        initConvert()
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup',   onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
}

const panelWidth = ref(340) // default ≈ w-80+

function startResize(e) {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = panelWidth.value

    function onMouseMove(e) {
        panelWidth.value = Math.min(520, Math.max(200, startWidth + (e.clientX - startX)))
    }
    function onMouseUp() {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
}

const selectedLocale = ref('da')

const locales = {
    'da':    { currency: 'DKK', flag: '🇩🇰', rate: 1 },
    'en-US': { currency: 'USD', flag: '🇺🇸', rate: 0.14 },
    'en-EU': { currency: 'EUR', flag: '🇪🇺', rate: 0.134 },
    'en-GB': { currency: 'GBP', flag: '🇬🇧', rate: 0.115 },
    'sv':    { currency: 'SEK', flag: '🇸🇪', rate: 1.43 },
    'no':    { currency: 'NOK', flag: '🇳🇴', rate: 1.04 },
}

const totalPrice = computed(() => {
    const tileDKK = 0.25 * (16 * useImageStore().width) * (16 * useImageStore().height)
    const baseplateDKK = 30 * useImageStore().width * useImageStore().height
    const totalDKK = tileDKK + baseplateDKK
    const converted = totalDKK * locales[selectedLocale.value].rate
    return `≈${converted.toFixed(1)} ${locales[selectedLocale.value].currency}`
})

function formatPrice(dkk) {
    const converted = dkk * locales[selectedLocale.value].rate
    return `≈${converted.toFixed(1)} ${locales[selectedLocale.value].currency}`
}

let file = ""
let fileInput
let originalImage
let legoCanvas
let legoCtx
let CheckboxAR
let heightBox
let widthBox
let canvas
let ctx
let brightnessInput
let contrastInput
let rememberedColorToggle = true
let preview_image
let preview_mosaic
let image_container

let mosaicWorker = null
const isProcessing = ref(false)
let processingGeneration = 0
let currentStudSize = 8
let convertDebounceTimer = null
const baseURL = useRuntimeConfig().app.baseURL

    onMounted(() => {

        readCSV()

        fileInput = document.getElementById('fileInput');
        originalImage = document.getElementById('originalImage');
        legoCanvas = document.getElementById('legoCanvas');
        legoCtx = legoCanvas.getContext('2d');
        CheckboxAR = document.getElementById('checkboxAR');
        heightBox = document.getElementById('heightBox');
        widthBox = document.getElementById('widthBox');
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');
        brightnessInput = document.getElementById('brightness'); 
        contrastInput = document.getElementById('contrast'); 
        preview_mosaic = document.getElementById('preview-mosaic')

        mosaicWorker = new Worker(baseURL + 'mosaic.worker.js');
        mosaicWorker.onmessage = handleWorkerMessage;

    })

    onUnmounted(() => {
        mosaicWorker?.terminate();
        clearTimeout(convertDebounceTimer);
    });

    function handleWorkerMessage(e) {
        const { results: resultBuffer, counts: countBuffer, numStudsX, numStudsY, generation } = e.data;

        // Discard stale results from superseded jobs
        if (generation !== processingGeneration) return;

        const results = new Int32Array(resultBuffer);
        const counts  = new Int32Array(countBuffer);
        const studSize = currentStudSize;

        legoCanvas = document.getElementById('legoCanvas');
        legoCtx = legoCanvas.getContext('2d');

        for (let sy = 0; sy < numStudsY; sy++) {
            for (let sx = 0; sx < numStudsX; sx++) {
                const studX = sx * studSize;
                const studY = sy * studSize;
                const colorIdx = results[sy * numStudsX + sx];

                let colorRgba;
                if (colorIdx < 0) {
                    colorRgba = 'rgba(0, 0, 0, 1)';
                } else {
                    const c = useImageStore().allColorOptions[colorIdx].color;
                    colorRgba = `rgba(${c[0]}, ${c[1]}, ${c[2]}, 1)`;
                }

                if (useImageStore().showStuds) {
                    legoCtx.fillStyle = colorRgba;
                    legoCtx.fillRect(studX, studY, studSize, studSize);
                    legoCtx.fillStyle = 'rgba(255,255,255,0.1)';
                    legoCtx.beginPath();
                    legoCtx.arc(studX + studSize / 2, studY + studSize / 2, studSize / 3, 0, Math.PI * 2);
                    legoCtx.fill();
                } else {
                    legoCtx.fillStyle = 'rgba(0,0,0,1)';
                    legoCtx.fillRect(studX, studY, studSize, studSize);
                    legoCtx.fillStyle = colorRgba;
                    legoCtx.beginPath();
                    legoCtx.arc(studX + studSize / 2, studY + studSize / 2, studSize / 2, 0, Math.PI * 2);
                    legoCtx.fill();
                }

                if (useImageStore().showGrid && !useImageStore().previewArtOnWall) {
                    if (sx % 16 === 0 && sx !== 0) {
                        legoCtx.fillStyle = 'rgba(0,0,0,1)';
                        legoCtx.fillRect(studX, studY, 1, studSize);
                    }
                    if (sy % 16 === 0 && sy !== 0) {
                        legoCtx.fillStyle = 'rgba(0,0,0,1)';
                        legoCtx.fillRect(studX, studY, studSize, 1);
                    }
                }
            }
        }

        // Update color counts and used flags
        useImageStore().allColorOptions.forEach((item, i) => {
            useImageStore().allColorOptions[i].count = counts[i];
            useImageStore().allColorOptions[i].used = counts[i] > 0;
        });

        isProcessing.value = false;
    }

    function fileInputChange() {
        file = event.target.files[0];
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    originalImage.src = img.src;
                }
            img.src = e.target.result;
            }
            reader.readAsDataURL(file);
            readCSV
            initConvert()
    }

    function initConvert() {
        clearTimeout(convertDebounceTimer);
        convertDebounceTimer = setTimeout(_doConvert, 150);
    }

    function _doConvert() {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                originalImage.src = img.src;
                originalImageSrc.value = img.src;
                // Use natural image dimensions — NOT the rendered thumbnail size
                const aspect_ratio = img.naturalHeight / img.naturalWidth;
                img.width = (16 * 8) * useImageStore().width;
                img.height = (16 * 8) * useImageStore().width * aspect_ratio;
                convertToLego(img, 8);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function changeContrast(contrast) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // Modify the contrast of each pixel
            data[i] = (data[i] - 128) * contrast + 128;      // Red channel
            data[i + 1] = (data[i + 1] - 128) * contrast + 128;  // Green channel
            data[i + 2] = (data[i + 2] - 128) * contrast + 128;  // Blue channel
        }

        // Put the modified image data back onto the canvas
        ctx.putImageData(imageData, 0, 0);
    };

    
    function changeBrightness(brightness) {

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // Modify the brightness of each pixel
            data[i] += brightness;      // Red channel
            data[i + 1] += brightness;  // Green channel
            data[i + 2] += brightness;  // Blue channel
        }

        // Put the modified image data back onto the canvas
        ctx.putImageData(imageData, 0, 0);
    };

    function applyGrayscaleFilter(ctx) {
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const red = data[i];
            const green = data[i + 1];
            const blue = data[i + 2];

            // Calculate the grayscale value using the luminance formula
            const grayscale = 0.2989 * red + 0.5870 * green + 0.1140 * blue;

            // Set the red, green, and blue channels to the grayscale value
            data[i] = grayscale;
            data[i + 1] = grayscale;
            data[i + 2] = grayscale;
        }

        // Put the modified image data back onto the canvas
        ctx.putImageData(imageData, 0, 0);
    }


    function convertToLego(image, studSize) {
        let imgWidth = image.width;
        let imgHeight = image.height;
        let aspect_ratio = imgWidth/imgHeight

        //handle image aspect
        if ( (imgHeight/studSize) < 16 * useImageStore().height ) {
            console.log("height")
            console.log( (useImageStore().height*16 - (imgHeight / studSize)) * studSize )
            imgHeight = imgHeight + (useImageStore().height*16 - (imgHeight / studSize)) * studSize
            imgWidth = imgHeight*aspect_ratio
        }

        // Calculate the number of studs in both dimensions
        let numStudsX = Math.ceil(imgWidth / studSize);
        let numStudsY = Math.ceil(imgHeight / studSize);


        // Set canvas dimensions to match the number of studs
        canvas.width = numStudsX * studSize;
        canvas.height = numStudsY * studSize;
        // Expose to the overlay so it can size itself correctly
        overlayImgCanvasW.value = canvas.width
        overlayImgCanvasH.value = canvas.height

        // Draw the image on the canvas
        ctx.drawImage(image, useImageStore().x, useImageStore().y, canvas.width, canvas.height);

        //image adjustment
        changeBrightness(useImageStore().brightness);
        changeContrast(useImageStore().contrast);
        if (useImageStore().grayscale) {
            applyGrayscaleFilter(ctx);
        }

        useImageStore().allColorOptions.forEach((item,i) => {
            useImageStore().allColorOptions[i].count = 0
        })

        legoCanvas = document.getElementById('legoCanvas');
        legoCtx = legoCanvas.getContext('2d');
        legoCanvas.width = (16 * 8) * useImageStore().width;
        legoCanvas.height = (16 * 8) * useImageStore().height;

        if (useImageStore().previewShowMosaic) {
            currentStudSize = studSize;
            processingGeneration++;
            isProcessing.value = true;

            // Single getImageData call — avoids per-stud GPU readbacks
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            mosaicWorker.postMessage({
                buffer: imageData.data.buffer,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                studSize,
                colorOptions: useImageStore().allColorOptions.map(o => ({ color: Array.from(o.color), checked: !!o.checked })),
                generation: processingGeneration
            }, [imageData.data.buffer]);
        } else {
            legoCtx.drawImage(canvas, 0, 0);
        }

        preview_image = document.getElementById('preview-image')
        image_container = document.getElementById('image-container')

        if (useImageStore().previewArtOnWall && preview_image) {
            let scale = preview_image.offsetWidth/300
            image_container.style.width = ((0.80*16)*useImageStore().width).toFixed(1) * scale + "px"
            image_container.style.height = ((0.80*16)*useImageStore().height).toFixed(1) * scale + "px"
        }
    }

    function getAverageColor(ctx, x, y, width, height) {
        const imageData = ctx.getImageData(x, y, width, height).data;
        let totalRed = 0;
        let totalGreen = 0;
        let totalBlue = 0;

        for (let i = 0; i < imageData.length; i += 4) {
            totalRed += imageData[i];
            totalGreen += imageData[i + 1];
            totalBlue += imageData[i + 2];
        }

        const pixelCount = imageData.length / 4; // Divided by 4 because each pixel has RGBA channels
        const averageRed = totalRed / pixelCount;
        const averageGreen = totalGreen / pixelCount;
        const averageBlue = totalBlue / pixelCount;

        // Return the average color as an RGBA string
        return `rgba(${averageRed.toFixed(0)}, ${averageGreen.toFixed(0)}, ${averageBlue.toFixed(0)}, 1)`;
    }

    function findClosestColor(rgbaColor, colorArray) {
        // Convert the RGBA color string to an array of [R, G, B, A] values
        const rgbaParts = rgbaColor.match(/\d+/g).map(Number);
        const [r1, g1, b1, a1] = rgbaParts;

        // Function to calculate the Euclidean distance between two colors
        function calculateDistance(color1, color2) {
            const [r2, g2, b2, a2] = color2;
            const dr = r1 - r2;
            const dg = g1 - g2;
            const db = b1 - b2;
            const da = a1 - a2;
            // Take alpha into account when calculating distance
            return Math.sqrt(dr * dr + dg * dg + db * db + da * da * 10); // Multiply da by a factor to weigh it more heavily
        }

        let closestColor = colorArray[0];
        let closestDistance = calculateDistance(rgbaParts, closestColor);

        for (const color of colorArray) {
            const distance = calculateDistance(rgbaParts, color);
            if (distance < closestDistance) {
            closestColor = color;
            closestDistance = distance;
            }
        }

        return `rgba(${closestColor.join(', ')})`
    }

    function getColorArray() {
        let colorArr = []
        let colorCounter = 0
        useImageStore().allColorOptions.forEach(item => {
            if (item.checked == true) {
                colorCounter += 1
                colorArr.push(item.color)
            }
        });
        
        if (colorCounter == 0) {
            colorArr = [hexToRgba('000000')]
        }
    
        return colorArr
    }

    function hexToRgba(hex, alpha = 1) {
        // Remove the # symbol if it's included
        hex = hex.replace(/^#/, '');

        // Parse the hexadecimal values for red, green, and blue
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);

        // Ensure the alpha value is within the range [0, 1]
        alpha = Math.min(1, Math.max(0, alpha));

        // Return the RGBA color in the "rgba(r, g, b, alpha)" format
        return JSON.parse(`[${r}, ${g}, ${b}, ${alpha}]`);
    }

    function rgbaToHex(rgba) {
        // Extract the red, green, blue, and alpha values from the RGBA string
        const rgbaValues = rgba.match(/\d+/g);

        if (!rgbaValues || rgbaValues.length !== 4) {
            // Invalid input, return an error value or handle the error as needed
            return '000000'; // Default to black
        }

        // Convert the RGB values to hexadecimal
        const red = parseInt(rgbaValues[0]);
        const green = parseInt(rgbaValues[1]);
        const blue = parseInt(rgbaValues[2]);
        const alpha = Math.round(parseFloat(rgbaValues[3]) * 255); // Convert alpha to 0-255 range

        const hexRed = red.toString(16).padStart(2, '0');
        const hexGreen = green.toString(16).padStart(2, '0');
        const hexBlue = blue.toString(16).padStart(2, '0');
        const hexAlpha = alpha.toString(16).padStart(2, '0');

        // Combine the hexadecimal values
        const hexColor = `${hexRed}${hexGreen}${hexBlue}`;

        // Optionally, you can include the alpha value in the hex color if needed
        // const hexColorWithAlpha = `${hexRed}${hexGreen}${hexBlue}${hexAlpha}`;

        return hexColor.toUpperCase();
    }

    // BrickLink color ID mapping (color name → BrickLink color ID)
    const BRICKLINK_COLORS = {
        'White': 1,
        'Very Light Gray': 49,
        'Very Light Bluish Gray': 99,
        'Light Gray': 9,
        'Light Bluish Gray': 86,
        'Dark Gray': 10,
        'Dark Bluish Gray': 85,
        'Black': 11,
        'Dark Red': 59,
        'Red': 5,
        'Coral': 220,
        'Dark Salmon': 231,
        'Salmon': 25,
        'Light Salmon': 26,
        'Sand Red': 58,
        'Dark Brown': 120,
        'Brown': 8,
        'Light Brown': 91,
        'Medium Brown': 240,
        'Reddish Brown': 88,
        'Fabuland Brown': 106,
        'Dark Tan': 69,
        'Medium Tan': 241,
        'Tan': 2,
        'Light Nougat': 90,
        'Nougat': 28,
        'Medium Nougat': 150,
        'Dark Nougat': 225,
        'Fabuland Orange': 160,
        'Earth Orange': 29,
        'Dark Orange': 68,
        'Rust': 27,
        'Neon Orange': 165,
        'Orange': 4,
        'Medium Orange': 31,
        'Light Orange': 32,
        'Bright Light Orange': 110,
        'Very Light Orange': 96,
        'Dark Yellow': 161,
        'Yellow': 3,
        'Light Yellow': 33,
        'Bright Light Yellow': 103,
        'Neon Yellow': 236,
        'Neon Green': 166,
        'Light Lime': 35,
        'Yellowish Green': 158,
        'Medium Lime': 76,
        'Fabuland Lime': 248,
        'Lime': 34,
        'Dark Olive Green': 242,
        'Olive Green': 155,
        'Dark Green': 80,
        'Green': 6,
        'Bright Green': 36,
        'Medium Green': 37,
        'Light Green': 38,
        'Sand Green': 48,
        'Dark Turquoise': 39,
        'Light Turquoise': 40,
        'Aqua': 41,
        'Light Aqua': 152,
        'Dark Blue': 63,
        'Blue': 7,
        'Dark Azure': 153,
        'Little Robots Blue': 247,
        'Maersk Blue': 72,
        'Medium Azure': 156,
        'Sky Blue': 87,
        'Medium Blue': 42,
        'Bright Light Blue': 105,
        'Light Blue': 62,
        'Sand Blue': 55,
        'Dark Blue-Violet': 109,
        'Violet': 43,
        'Blue-Violet': 174,
        'Lilac': 245,
        'Medium Violet': 73,
        'Light Lilac': 246,
        'Light Violet': 44,
        'Dark Purple': 89,
        'Purple': 24,
        'Light Purple': 93,
        'Medium Lavender': 157,
        'Lavender': 154,
        'Clikits Lavender': 227,
        'Sand Purple': 54,
        'Magenta': 71,
        'Dark Pink': 47,
        'Medium Dark Pink': 94,
        'Bright Pink': 104,
        'Pink': 23,
        'Light Pink': 56,
    }

    function escapeXML(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    }

    function buildBricklinkXML() {
        // BrickLink XML format must NOT have an XML declaration — see bricklink.com/help.asp?helpID=207
        let xml = '<INVENTORY>\n'

        // 1×1 plates (item 3024) grouped by BrickLink color
        useImageStore().allColorOptions.forEach(item => {
            if (item.count <= 0) return
            const blColor = BRICKLINK_COLORS[item.colorName]
            if (blColor === undefined) return
            xml += '  <ITEM>\n'
            xml += '    <ITEMTYPE>P</ITEMTYPE>\n'
            xml += '    <ITEMID>3024</ITEMID>\n'
            xml += `    <COLOR>${blColor}</COLOR>\n`
            xml += `    <MINQTY>${item.count}</MINQTY>\n`
            xml += '    <CONDITION>N</CONDITION>\n'
            xml += `    <REMARKS>${escapeXML(item.colorName)}</REMARKS>\n`
            xml += '  </ITEM>\n'
        })

        // 16×16 baseplates (item 65803) — any color for cheapest price
        const baseplateCount = useImageStore().width * useImageStore().height
        if (baseplateCount > 0) {
            xml += '  <ITEM>\n'
            xml += '    <ITEMTYPE>P</ITEMTYPE>\n'
            xml += '    <ITEMID>65803</ITEMID>\n'
            xml += `    <MINQTY>${baseplateCount}</MINQTY>\n`
            xml += '    <CONDITION>N</CONDITION>\n'
            xml += '    <REMARKS>16x16 Baseplate (any color)</REMARKS>\n'
            xml += '  </ITEM>\n'
        }

        xml += '</INVENTORY>'
        return xml
    }

    const bricklinkCopied = ref(false)
    let bricklinkCopyTimer = null

    async function copyBricklinkXML() {
        const xml = buildBricklinkXML()
        await navigator.clipboard.writeText(xml)
        bricklinkCopied.value = true
        clearTimeout(bricklinkCopyTimer)
        bricklinkCopyTimer = setTimeout(() => { bricklinkCopied.value = false }, 2500)
    }

    function toggleAllColors() {

        useImageStore().allColorOptions.forEach(function (item, i) {
            useImageStore().allColorOptions[i].checked = !rememberedColorToggle
            //console.log(useImageStore().allColorOptions[i])
        });
        rememberedColorToggle = !rememberedColorToggle

        initConvert()
    }

    let rememberedExpensiveToggle = true
    function toggleExpensiveColors() {
        useImageStore().allColorOptions.forEach(function (item, i) {
            if (item.expensive) {
                useImageStore().allColorOptions[i].checked = !rememberedExpensiveToggle
            }
        })
        rememberedExpensiveToggle = !rememberedExpensiveToggle
        initConvert()
    }

    //Indlæser danske skoler datasæt
    async function readCSV(){
        try {
            
            //csv to array of obj's
            const response = await fetch(baseURL + 'LEGO_Colors.csv');
            const csvString  = await response.text()

            const rows = csvString.split(/\r?\n/).filter(row => row.trim() !== '');

            useImageStore().allColorOptions = []

            rows.forEach(row => {
                const values = row.split(';');
                const hex = values[0]?.trim().toUpperCase()
                const name = values[1]?.trim()
                if (!hex || !name) return
                const expensive = values[2]?.trim().toLowerCase() === 'expensive'
                useImageStore().allColorOptions.push({color: hexToRgba(hex), hexColor: hex, colorName: name, checked: !expensive, used: false, count: 0, expensive})
            });

            //insert into store
            //useContactFormulaStore().danskeSkoler = [...parsedData]

        } catch (error) {
    
        console.error('Error fetching CSV data:', error);
            
    }
    }

</script>

<style>

html, body {
    background-color: #09090b; /* zinc-950 */
    height: 100%;
    overflow: hidden;
}

#originalImage[src=""] {
    display: none;
}

.no-scrollbar::-webkit-scrollbar {
    display: none;
}

/* Style number input spinners for dark theme */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    opacity: 0.3;
    filter: invert(1);
}

</style>