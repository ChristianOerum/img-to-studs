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
                        <p class="text-[9px] text-zinc-500 uppercase tracking-widest leading-none mb-1">Pieces</p>
                        <p class="text-xs font-semibold text-white leading-none">
                            {{ totalPiecesCount }}
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
                        @click="toggleMosaic()"
                        :title="isViewOnly ? 'This mosaic was exported and can no longer be edited' : ''"
                        class="px-2.5 py-1 rounded-full text-xs font-semibold transition-colors"
                        :class="[useImageStore().previewShowMosaic ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200', isViewOnly ? 'opacity-30 cursor-not-allowed' : '']"
                    >Mosaic</button>

                    <button
                        @click="toggleGrid()"
                        :title="isViewOnly ? 'This mosaic was exported and can no longer be edited' : ''"
                        class="px-2.5 py-1 rounded-full text-xs font-semibold transition-colors"
                        :class="[useImageStore().showGrid ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200', isViewOnly ? 'opacity-30 cursor-not-allowed' : '']"
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
            <div class="grid grid-cols-6 border-b border-zinc-800 shrink-0">

                <button
                    @click="!isViewOnly && (useMenuStore().menuItemShow = 'SI')"
                    :title="isViewOnly ? 'This mosaic was exported and can no longer be edited' : ''"
                    class="flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-medium transition-colors relative"
                    :class="[useMenuStore().menuItemShow === 'SI' ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300', isViewOnly ? 'opacity-30 cursor-not-allowed' : '']"
                >
                    <Icon name="material-symbols:image-outline-rounded" class="text-[17px]" />
                    <span>Image</span>
                    <div v-if="useMenuStore().menuItemShow === 'SI'" class="absolute bottom-0 left-1 right-1 h-0.5 bg-amber-400 rounded-full"></div>
                </button>

                <button
                    @click="!isViewOnly && (useMenuStore().menuItemShow = 'S')"
                    :title="isViewOnly ? 'This mosaic was exported and can no longer be edited' : ''"
                    class="flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-medium transition-colors relative"
                    :class="[useMenuStore().menuItemShow === 'S' ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300', isViewOnly ? 'opacity-30 cursor-not-allowed' : '']"
                >
                    <Icon name="iconoir:add-frame" class="text-[17px]" />
                    <span>Size</span>
                    <div v-if="useMenuStore().menuItemShow === 'S'" class="absolute bottom-0 left-1 right-1 h-0.5 bg-amber-400 rounded-full"></div>
                </button>

                <button
                    @click="!isViewOnly && (useMenuStore().menuItemShow = 'AI')"
                    :title="isViewOnly ? 'This mosaic was exported and can no longer be edited' : ''"
                    class="flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-medium transition-colors relative"
                    :class="[useMenuStore().menuItemShow === 'AI' ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300', isViewOnly ? 'opacity-30 cursor-not-allowed' : '']"
                >
                    <Icon name="streamline:interface-setting-slider-vertical-adjustment-adjust-controls-fader-vertical-settings-slider" class="text-[17px]" />
                    <span>Adjust</span>
                    <div v-if="useMenuStore().menuItemShow === 'AI'" class="absolute bottom-0 left-1 right-1 h-0.5 bg-amber-400 rounded-full"></div>
                </button>

                <button
                    @click="!isViewOnly && (useMenuStore().menuItemShow = 'C')"
                    :title="isViewOnly ? 'This mosaic was exported and can no longer be edited' : ''"
                    class="flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-medium transition-colors relative"
                    :class="[useMenuStore().menuItemShow === 'C' ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300', isViewOnly ? 'opacity-30 cursor-not-allowed' : '']"
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

                <button
                    @click="openPlanTab()"
                    class="flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-medium transition-colors relative"
                    :class="useMenuStore().menuItemShow === 'B' ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'"
                >
                    <Icon name="material-symbols:map-outline-rounded" class="text-[17px]" />
                    <span>Plan</span>
                    <div v-if="useMenuStore().menuItemShow === 'B'" class="absolute bottom-0 left-1 right-1 h-0.5 bg-amber-400 rounded-full"></div>
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

                    <div class="flex flex-col gap-2">
                        <p class="text-[10px] text-zinc-500 uppercase tracking-widest">Brick Sizes</p>
                        <div class="flex flex-wrap gap-1.5">
                            <button
                                v-for="b in brickSizeOptions"
                                :key="b.id"
                                @click="toggleBrickSize(b)"
                                class="px-2.5 py-1 rounded-full text-xs font-semibold transition-colors"
                                :class="b.enabled ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'"
                                :title="b.id === '1x1' ? '1×1 is always required as fallback' : ''"
                            >{{ b.label }}</button>
                        </div>
                        <p class="text-[10px] text-zinc-500 leading-relaxed">Larger bricks reduce cost. All bricks are confined to their 16×16 baseplate.</p>
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
                    <template v-if="piecesData.length">
                        <template v-for="group in piecesData" :key="group.id">
                            <p class="text-[10px] text-zinc-500 tracking-widest mb-2 mt-3 first:mt-0">{{ group.label.toUpperCase() }} PLATES</p>
                            <div class="flex flex-col gap-1.5 mb-1">
                                <div v-for="row in group.colorRows" :key="row.colorName" class="flex items-center gap-2">
                                    <div class="h-3.5 w-3.5 rounded shrink-0 ring-1 ring-white/10" :style="{ backgroundColor: `rgba(${row.color.join(',')})` }"></div>
                                    <span class="text-sm text-white font-semibold shrink-0">{{ row.count }}×</span>
                                    <span class="text-sm text-zinc-400 truncate flex-1">{{ row.colorName }}</span>
                                    <span class="text-xs text-zinc-500 shrink-0">{{ row.cost }}</span>
                                </div>
                            </div>
                        </template>
                    </template>
                    <p v-else class="text-xs text-zinc-600 mb-4">Upload an image to see piece counts.</p>
                    <p class="text-[10px] text-zinc-500 tracking-widest mb-3">16x16 BASEPLATES</p>
                    <div class="flex items-center gap-2">
                        <div class="h-3.5 w-3.5 rounded shrink-0 ring-1 ring-white/10 bg-zinc-600"></div>
                        <span class="text-sm text-white font-semibold shrink-0">{{ useImageStore().width * useImageStore().height }}×</span>
                        <span class="text-sm text-zinc-400 truncate flex-1">16×16 Baseplate</span>
                        <span class="text-xs text-zinc-500 shrink-0">{{ formatPrice(useImageStore().width * useImageStore().height * 30) }}</span>
                    </div>

                    <!-- Border frame pieces -->
                    <template v-if="borderPiecesData.length">
                        <template v-for="group in borderPiecesData" :key="group.id">
                            <p class="text-[10px] text-zinc-500 tracking-widest mb-2 mt-3">{{ group.label }}</p>
                            <div class="flex flex-col gap-1.5 mb-1">
                                <div v-for="item in group.items" :key="item.blId" class="flex items-center gap-2">
                                    <div class="h-3.5 w-3.5 rounded shrink-0 ring-1 ring-white/10 bg-zinc-950"></div>
                                    <span class="text-sm text-white font-semibold shrink-0">{{ item.count }}×</span>
                                    <span class="text-sm text-zinc-400 truncate flex-1">{{ item.label }}</span>
                                    <span class="text-xs text-zinc-500 shrink-0">{{ item.cost }}</span>
                                </div>
                            </div>
                        </template>
                    </template>

                    <p class="text-[10px] text-zinc-600 leading-relaxed mt-4">
                        Prices are estimates based on average retail costs and may vary. Not sourced from live data.
                    </p>
                    <button @click="copyBricklinkXML()" class="w-full mt-3 py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2">
                        <Icon :name="bricklinkCopied ? 'material-symbols:check-rounded' : 'material-symbols:content-copy-outline-rounded'" class="text-base" />
                        {{ bricklinkCopied ? 'Copied!' : 'Copy BrickLink Want List' }}
                    </button>
                    <label class="flex items-center justify-between mt-3 cursor-pointer">
                        <div>
                            <p class="text-xs text-zinc-300 font-medium">Allow used bricks</p>
                            <p class="text-[10px] text-zinc-500 leading-relaxed">Accepts new &amp; used — may reduce price significantly</p>
                        </div>
                        <div class="relative inline-flex items-center shrink-0">
                            <input type="checkbox" v-model="bricklinkAllowUsed" class="sr-only peer">
                            <div class="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:bg-amber-500 transition-colors"></div>
                            <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                        </div>
                    </label>
                    <p class="text-[10px] text-zinc-600 leading-relaxed mt-2">
                        Paste at <span class="text-zinc-500">bricklink.com → Wanted List → Upload → "Upload BrickLink XML format"</span>
                    </p>
                </div>

                <!-- Plan -->
                <div v-if="useMenuStore().menuItemShow === 'B'" class="flex flex-col gap-3">
                    <div>
                        <p class="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Select Baseplate</p>
                        <div class="grid gap-1" :style="{ gridTemplateColumns: `repeat(${useImageStore().width}, minmax(0,1fr))` }">
                            <button
                                @click="selectBP(-1)"
                                class="col-span-full py-1 rounded text-xs font-bold transition-colors"
                                :class="selectedBP === -1 ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'"
                            >All plates</button>
                            <template v-for="r in useImageStore().height" :key="r">
                                <button
                                    v-for="c in useImageStore().width" :key="c"
                                    @click="selectBP((r-1)*useImageStore().width + (c-1))"
                                    class="py-1.5 rounded text-xs font-bold transition-colors"
                                    :class="selectedBP === (r-1)*useImageStore().width+(c-1) ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'"
                                >{{ String.fromCharCode(64+r) }}{{ c }}</button>
                            </template>
                        </div>
                    </div>
                    <div class="border-t border-zinc-800 pt-3">
                        <p class="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Display</p>
                        <div class="flex flex-col gap-2 mb-3">
                            <label class="flex items-center justify-between cursor-pointer">
                                <span class="text-xs text-zinc-300">Brick outlines</span>
                                <div class="relative inline-flex items-center shrink-0">
                                    <input type="checkbox" v-model="showPlanOutlines" class="sr-only peer">
                                    <div class="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:bg-amber-500 transition-colors"></div>
                                    <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                                </div>
                            </label>
                            <label class="flex items-center justify-between cursor-pointer">
                                <span class="text-xs text-zinc-300">16×16 grid</span>
                                <div class="relative inline-flex items-center shrink-0">
                                    <input type="checkbox" v-model="showPlanGrid" class="sr-only peer">
                                    <div class="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:bg-amber-500 transition-colors"></div>
                                    <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div class="border-t border-zinc-800 pt-3">
                        <p class="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Share Build Plan</p>
                        <button
                            v-if="!isViewOnly"
                            @click="exportPlanURL()"
                            :disabled="!storedPlacements"
                            class="w-full py-2 px-4 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                            :class="shareStatus === 'copied' ? 'bg-green-500 text-white' : shareStatus === 'error' ? 'bg-red-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-zinc-950'"
                        >
                            <Icon :name="shareStatus === 'copied' ? 'material-symbols:check-rounded' : 'material-symbols:link'" class="text-base" />
                            {{ shareStatus === 'copied' ? 'Link Copied!' : shareStatus === 'error' ? 'Copy Failed' : 'Export Mosaic Link' }}
                        </button>
                        <p v-if="isViewOnly" class="text-xs text-zinc-500 italic">Shared view — editing disabled.</p>
                        <p class="text-[10px] text-zinc-600 leading-relaxed mt-2">All brick placements are encoded in the URL — no server needed.</p>
                    </div>
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
        <div class="flex-1 min-w-0 overflow-hidden no-scrollbar flex items-center justify-center p-6 relative">

            <!-- Build Plan canvas (Plan tab) -->
            <div
                v-if="useMenuStore().menuItemShow === 'B'"
                ref="buildPlanAreaEl"
                class="w-full h-full flex flex-col gap-2 items-center"
            >
                <div class="shrink-0 flex items-center gap-1.5 flex-wrap justify-center">
                    <button
                        @click="selectBP(-1)"
                        class="px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                        :class="selectedBP === -1 ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'"
                    >All</button>
                    <template v-for="r in useImageStore().height" :key="r">
                        <button
                            v-for="c in useImageStore().width" :key="c"
                            @click="selectBP((r-1)*useImageStore().width + (c-1))"
                            class="w-8 h-8 rounded text-xs font-bold transition-colors"
                            :class="selectedBP === (r-1)*useImageStore().width+(c-1) ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'"
                        >{{ String.fromCharCode(64+r) }}{{ c }}</button>
                    </template>
                </div>
                <div class="flex-1 min-h-0 flex items-center justify-center">
                    <canvas
                        ref="buildPlanCanvasEl"
                        class="shadow-[0_0_80px_rgba(0,0,0,0.9)]"
                        style="display:block; cursor:crosshair;"
                        @mousemove="onBuildCanvasMouseMove"
                        @mouseleave="onBuildCanvasMouseLeave"
                    ></canvas>
                </div>
            </div>

            <canvas
                v-if="!useImageStore().previewArtOnWall"
                ref="legoCanvasEl"
                id="legoCanvas"
                class="max-w-full max-h-full shadow-[0_0_80px_rgba(0,0,0,0.9)]"
                :style="useMenuStore().menuItemShow === 'B' ? { display: 'none' } : {}"
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

    <!-- Build plan hover tooltip -->
    <Teleport to="body">
        <div
            v-if="planTooltip.show"
            class="fixed z-50 pointer-events-none flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl text-xs select-none"
            :style="{ left: planTooltip.x + 'px', top: planTooltip.y + 'px' }"
        >
            <div class="w-3.5 h-3.5 rounded-sm shrink-0 ring-1 ring-white/20" :style="{ backgroundColor: planTooltip.colorRgba }"></div>
            <span class="font-semibold text-white">{{ planTooltip.brickLabel }}</span>
            <span class="text-zinc-400">· {{ planTooltip.colorName }}</span>
        </div>
    </Teleport>

</template>

<script setup>

import { useImageStore } from '@/stores/ImageStore'
import { useMenuStore } from '@/stores/ShowMenu'
import { onMounted, onUnmounted, ref, computed, watch, nextTick } from 'vue';

// ── Brick definitions — index order MUST match BRICK_DEFS in mosaic.worker.js ──
const BRICK_DEFS_MAIN = [
    { id: '6x6',  label: '6×6',        area: 36, blId: '3958',  priceDKK: 4.00  },
    { id: '4x4',  label: '4×4',        area: 16, blId: '3031',  priceDKK: 1.50  },
    { id: '2x3',  label: '2×3',        area: 6,  blId: '3021',  priceDKK: 0.50  },
    { id: '2x2',  label: '2×2',        area: 4,  blId: '3022',  priceDKK: 0.40  },
    { id: '2x2L', label: '2×2 Corner', area: 3,  blId: '2420',  priceDKK: 0.35  },
    { id: '1x2',  label: '1×2',        area: 2,  blId: '3023',  priceDKK: 0.30  },
    { id: '1x1',  label: '1×1',        area: 1,  blId: '3024',  priceDKK: 0.25  },
]
// L-piece cell offsets — must match worker L_CELLS
const L_CELLS_MAIN = [
    [[0,0],[0,1],[1,1]], // orientation 0: missing top-right
    [[0,0],[1,0],[0,1]], // orientation 1: missing bottom-right
    [[0,0],[1,0],[1,1]], // orientation 2: missing bottom-left
    [[1,0],[0,1],[1,1]], // orientation 3: missing top-left (post-process only)
]

// ── Border frame part definitions (all Black, BL color 11) ──────────────────
// Layer 1: 2×N plates that sit at the base, 1 stud on the baseplate + 1 stud sticking out
const BORDER_2XN_DEFS = [
    { n: 16, blId: '4282',  label: '2×16 Plate', priceDKK: 3.00 },
    { n: 12, blId: '2445',  label: '2×12 Plate', priceDKK: 2.50 },
    { n: 10, blId: '3832',  label: '2×10 Plate', priceDKK: 2.00 },
    { n:  8, blId: '3034',  label: '2×8 Plate',  priceDKK: 1.50 },
    { n:  6, blId: '3795',  label: '2×6 Plate',  priceDKK: 1.00 },
    { n:  4, blId: '3020',  label: '2×4 Plate',  priceDKK: 0.60 },
    { n:  3, blId: '3021',  label: '2×3 Plate',  priceDKK: 0.50 },
    { n:  2, blId: '3022',  label: '2×2 Plate',  priceDKK: 0.40 },
    { n:  1, blId: '3023',  label: '1×2 Plate',  priceDKK: 0.25 },
]
// Layers 3-4: 1×N plates (two layers on top of the brick row)
const BORDER_PLATE_1XN_DEFS = [
    { n: 8, blId: '3460',  label: '1×8 Plate',  priceDKK: 0.75 },
    { n: 6, blId: '3666',  label: '1×6 Plate',  priceDKK: 0.60 },
    { n: 4, blId: '3710',  label: '1×4 Plate',  priceDKK: 0.35 },
    { n: 3, blId: '3623',  label: '1×3 Plate',  priceDKK: 0.30 },
    { n: 2, blId: '3023',  label: '1×2 Plate',  priceDKK: 0.25 },
    { n: 1, blId: '3024',  label: '1×1 Plate',  priceDKK: 0.15 },
]
// Layer 5: 1×N tiles (smooth top finish)
const BORDER_TILE_1XN_DEFS = [
    { n: 4, blId: '2431',  label: '1×4 Tile',   priceDKK: 0.50 },
    { n: 3, blId: '63864', label: '1×3 Tile',   priceDKK: 0.40 },
    { n: 2, blId: '3069',  label: '1×2 Tile',   priceDKK: 0.35 },
    { n: 1, blId: '3070',  label: '1×1 Tile',   priceDKK: 0.30 },
]
const BORDER_PIN_BRICK_DEF = { blId: '2458', label: '1×2 Brick w/ Pin', priceDKK: 0.50 }
const BORDER_TECH_PIN_DEF  = { blId: '2780', label: 'Technic Pin',      priceDKK: 0.20 }

// Greedy-pack a single run of `length` studs using the given defs (sorted descending by n)
function borderPackRun(length, defs) {
    const items = []
    let rem = length
    for (const def of defs) {
        if (rem <= 0) break
        const cnt = Math.floor(rem / def.n)
        if (cnt > 0) {
            items.push({ blId: def.blId, label: def.label, priceDKK: def.priceDKK, count: cnt })
            rem -= cnt * def.n
        }
    }
    return items
}
// Merge two item arrays by blId (summing counts for matching parts)
function borderMergeItems(a, b) {
    const map = new Map()
    for (const arr of [a, b]) {
        for (const item of arr) {
            if (map.has(item.blId)) map.get(item.blId).count += item.count
            else map.set(item.blId, { ...item })
        }
    }
    return [...map.values()]
}
// ── Binary compression helpers for URL export ──
async function deflate(data) {
    const s = new CompressionStream('deflate-raw')
    const w = s.writable.getWriter(); w.write(data); w.close()
    const r = s.readable.getReader(); const chunks = []
    for (;;) { const { done, value } = await r.read(); if (done) break; chunks.push(value) }
    const out = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0))
    let off = 0; for (const c of chunks) { out.set(c, off); off += c.length }
    return out
}
async function inflate(data) {
    const s = new DecompressionStream('deflate-raw')
    const w = s.writable.getWriter(); w.write(data); w.close()
    const r = s.readable.getReader(); const chunks = []
    for (;;) { const { done, value } = await r.read(); if (done) break; chunks.push(value) }
    const out = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0))
    let off = 0; for (const c of chunks) { out.set(c, off); off += c.length }
    return out
}
function arrayToBase64url(arr) {
    let s = ''
    for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i])
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
function base64urlToArray(str) {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - str.length % 4) % 4)
    const raw = atob(b64); const arr = new Uint8Array(raw.length)
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
    return arr
}

const showOriginalOverlay = ref(false)
const originalImageSrc = ref('')
const brickCountsData = ref(null) // Int32Array from worker: [BRICK_DEFS.length × numColors]
const brickSizeOptions = ref([
    { id: '6x6',  label: '6×6',        enabled: false },
    { id: '4x4',  label: '4×4',        enabled: true  },
    { id: '2x3',  label: '2×3',        enabled: true  },
    { id: '2x2',  label: '2×2',        enabled: true  },
    { id: '2x2L', label: '2×2 Corner', enabled: true  },
    { id: '1x2',  label: '1×2',        enabled: true  },
    { id: '1x1',  label: '1×1',        enabled: true  }, // always on
])
const enabledBrickIds = computed(() => {
    const ids = brickSizeOptions.value.filter(b => b.enabled).map(b => b.id)
    if (!ids.includes('1x1')) ids.push('1x1')
    return ids
})

// ── Build plan state ──
const storedPlacements  = ref(null)  // Int32Array (6 values per brick)
const storedNumStudsX   = ref(0)
const storedNumStudsY   = ref(0)
const showPlanOutlines  = ref(true)
const showPlanGrid      = ref(true)
const buildPlanCanvasEl = ref(null)
const buildPlanAreaEl   = ref(null)
const selectedBP        = ref(-1)    // -1 = all, 0…n = baseplate index
const shareStatus       = ref('idle') // 'idle' | 'copied' | 'error'
const isViewOnly        = ref(false)   // true when loaded from a shared plan URL

// Build plan hover tooltip
const buildPlanLookup   = ref(null)   // Int32Array: studY*nX+studX → placementIdx (-1=none)
const planTooltip       = ref({ show: false, x: 0, y: 0, colorName: '', colorRgba: '', brickLabel: '' })
let   buildRenderState  = { studSz: 8, originSX: 0, originSY: 0 }

watch(selectedBP,        () => nextTick(renderBuildPlan))
watch(storedPlacements,  buildLookupMap)
watch(showPlanOutlines,  () => nextTick(renderBuildPlan))
watch(showPlanGrid,      () => nextTick(renderBuildPlan))
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

// ── Border frame computed pieces ────────────────────────────────────────────
const borderPiecesData = computed(() => {
    const W = useImageStore().width
    const H = useImageStore().height
    if (!W || !H) return []

    // Horizontal runs (top + bottom): each 16W studs, flush with mosaic edges
    // Vertical runs (left + right):   each 16H studs
    // "Sticking out 1 stud" is the depth of the 2×N plate, not its length
    const hLen = 16 * W
    const vLen = 16 * H
    // Horizontal plate/tile runs include the 4 frame corners; vertical runs fit between them (-2 studs)
    const vLenInner = vLen - 2
    // Total BP outer sections across all 4 runs (each 16-stud baseplate edge on the perimeter)
    const bpSections = 2 * (W + H)

    // Layer 1: 2×N base plates — greedy pack, 2 runs each direction
    const basePlates = borderMergeItems(
        borderPackRun(hLen,      BORDER_2XN_DEFS).map(i => ({ ...i, count: i.count * 2 })),
        borderPackRun(vLenInner, BORDER_2XN_DEFS).map(i => ({ ...i, count: i.count * 2 }))
    )

    // Layer 2: brick row — per BP section: 1 pin brick + 1×12 + 1×2 filling the 14-stud remainder
    // Corner baseplates appear in 2 runs → get 2 pins total; non-corner outer BPs appear in 1 run → 1 pin
    // 4 × 1×1 bricks fill the 4 frame corners (shared position between horizontal and vertical runs)
    const regularBricks = [
        { blId: '6112', label: '1×12 Brick', priceDKK: 1.50, count: bpSections },
        { blId: '3004', label: '1×2 Brick',  priceDKK: 0.30, count: bpSections },
        { blId: '3005', label: '1×1 Brick',  priceDKK: 0.20, count: 4 },
    ]
    const pinBricks = [{ ...BORDER_PIN_BRICK_DEF, count: bpSections }]

    // Layers 3-4: two 1×N plate layers (staggered for strength)
    // Both use straight greedy packs (×4 = 2 layers × 2 runs per direction).
    // Stagger achieved by 4 constant corner 1×4 plates (one per frame corner, layer 4 only).
    // Formula: 8(W+H)−4 × 1×8 | 4 × 1×6 | 4 × 1×4 — verified for W=H=5.
    const plateLayers = borderMergeItems(
        borderMergeItems(
            borderPackRun(hLen,      BORDER_PLATE_1XN_DEFS).map(i => ({ ...i, count: i.count * 4 })),
            borderPackRun(vLenInner, BORDER_PLATE_1XN_DEFS).map(i => ({ ...i, count: i.count * 4 }))
        ),
        [{ blId: '3710', label: '1×4 Plate', priceDKK: 0.35, count: 4 }]
    )

    // Layer 5: 1×N tiles — greedy pack + 2 constant corner stagger pieces (1×4)
    // Formula: 8(W+H) × 1×4  +  2 × 1×2 — verified for W=H=5.
    const tiles = borderMergeItems(
        borderMergeItems(
            borderPackRun(hLen,      BORDER_TILE_1XN_DEFS).map(i => ({ ...i, count: i.count * 2 })),
            borderPackRun(vLenInner, BORDER_TILE_1XN_DEFS).map(i => ({ ...i, count: i.count * 2 }))
        ),
        [{ blId: '2431', label: '1×4 Tile', priceDKK: 0.50, count: 2 }]
    )

    // Baseplate connectors
    const adjPairs = H * Math.max(0, W - 1) + W * Math.max(0, H - 1)
    const innerCorners = Math.max(0, W - 1) * Math.max(0, H - 1)
    const connectorItems = []
    if (innerCorners > 0) connectorItems.push({ blId: '3031', label: '4×4 Plate', priceDKK: 1.50, count: innerCorners })
    if (adjPairs    > 0) connectorItems.push({ blId: '3020', label: '2×4 Plate', priceDKK: 0.60, count: adjPairs    })
    if (adjPairs    > 0) connectorItems.push({ ...BORDER_TECH_PIN_DEF,            count: 2 * adjPairs               })

    function withCost(items) {
        return items.map(i => ({ ...i, cost: formatPrice(i.count * i.priceDKK) }))
    }

    return [
        { id: 'border-base',    label: 'BORDER BASE PLATES (2×N)',      items: withCost(basePlates)      },
        { id: 'border-bricks',  label: 'BORDER BRICKS (1×N)',           items: withCost(regularBricks)   },
        { id: 'border-pin',     label: 'BORDER PIN BRICKS',             items: withCost(pinBricks)       },
        { id: 'border-plates',  label: 'BORDER PLATES (1×N, 2 LAYERS)', items: withCost(plateLayers)     },
        { id: 'border-tiles',   label: 'BORDER TILES (1×N)',            items: withCost(tiles)           },
        { id: 'border-technic', label: 'BASEPLATE CONNECTORS',          items: withCost(connectorItems)  },
    ].filter(g => g.items.length > 0)
})

const borderPiecesTotal = computed(() =>
    borderPiecesData.value.reduce((sum, g) => sum + g.items.reduce((s, i) => s + i.count, 0), 0)
)
const borderPriceDKK = computed(() =>
    borderPiecesData.value.reduce((sum, g) => sum + g.items.reduce((s, i) => s + i.count * i.priceDKK, 0), 0)
)

const totalPrice = computed(() => {
    let tileDKK
    if (brickCountsData.value) {
        const numC = useImageStore().allColorOptions.length
        tileDKK = 0
        BRICK_DEFS_MAIN.forEach((brick, btIdx) => {
            let pieces = 0
            for (let ci = 0; ci < numC; ci++) pieces += brickCountsData.value[btIdx * numC + ci]
            tileDKK += pieces * brick.priceDKK
        })
    } else {
        tileDKK = 0.25 * (16 * useImageStore().width) * (16 * useImageStore().height)
    }
    const baseplateDKK = 30 * useImageStore().width * useImageStore().height
    const totalDKK = tileDKK + baseplateDKK + borderPriceDKK.value
    const converted = totalDKK * locales[selectedLocale.value].rate
    return `≈${converted.toFixed(1)} ${locales[selectedLocale.value].currency}`
})

const totalPiecesCount = computed(() => {
    if (!brickCountsData.value) return (16 * useImageStore().width) * (16 * useImageStore().height)
    let total = 0
    for (let i = 0; i < brickCountsData.value.length; i++) total += brickCountsData.value[i]
    return total + borderPiecesTotal.value
})

const piecesData = computed(() => {
    if (!brickCountsData.value) return []
    const numC = useImageStore().allColorOptions.length
    return BRICK_DEFS_MAIN
        .map((brick, btIdx) => {
            const colorRows = useImageStore().allColorOptions
                .map((colorOpt, ci) => {
                    const cnt = brickCountsData.value[btIdx * numC + ci]
                    if (!cnt) return null
                    return {
                        color: colorOpt.color,
                        colorName: colorOpt.colorName,
                        count: cnt,
                        cost: formatPrice(cnt * brick.priceDKK),
                    }
                })
                .filter(Boolean)
            if (!colorRows.length) return null
            return { id: brick.id, label: brick.label, colorRows }
        })
        .filter(Boolean)
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

    onMounted(async () => {

        await readCSV()

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

        await importPlanFromURL();
    })

    onUnmounted(() => {
        mosaicWorker?.terminate();
        clearTimeout(convertDebounceTimer);
    });

    function drawBrickOnCanvas(ctx, px, py, w, h, colorRgba, showStuds, studSize) {
        if (showStuds) {
            ctx.fillStyle = colorRgba
            ctx.fillRect(px, py, w * studSize, h * studSize)
            ctx.fillStyle = 'rgba(255,255,255,0.1)'
            for (let dy = 0; dy < h; dy++) {
                for (let dx = 0; dx < w; dx++) {
                    ctx.beginPath()
                    ctx.arc(px + (dx + 0.5) * studSize, py + (dy + 0.5) * studSize, studSize / 3, 0, Math.PI * 2)
                    ctx.fill()
                }
            }
        } else {
            ctx.fillStyle = 'rgba(0,0,0,1)'
            ctx.fillRect(px, py, w * studSize, h * studSize)
            ctx.fillStyle = colorRgba
            for (let dy = 0; dy < h; dy++) {
                for (let dx = 0; dx < w; dx++) {
                    ctx.beginPath()
                    ctx.arc(px + (dx + 0.5) * studSize, py + (dy + 0.5) * studSize, studSize / 2, 0, Math.PI * 2)
                    ctx.fill()
                }
            }
        }
    }

    function handleWorkerMessage(e) {
        const { placements: plcBuffer, brickCounts: brickCountsBuf, numStudsX, numStudsY, generation } = e.data;
        if (generation !== processingGeneration) return;

        const plc = new Int32Array(plcBuffer);
        const brickCountsArr = new Int32Array(brickCountsBuf);
        const studSize = currentStudSize;
        const numPlacements = plc.length / 6;
        const showStuds = useImageStore().showStuds;

        legoCanvas = document.getElementById('legoCanvas');
        legoCtx = legoCanvas.getContext('2d');

        for (let i = 0; i < numPlacements; i++) {
            const sx       = plc[i * 6];
            const sy       = plc[i * 6 + 1];
            const w        = plc[i * 6 + 2]; // 0 = L-piece
            const h        = plc[i * 6 + 3];
            const colorIdx = plc[i * 6 + 4];

            const colorRgba = colorIdx < 0
                ? 'rgba(0,0,0,1)'
                : (() => { const c = useImageStore().allColorOptions[colorIdx].color; return `rgba(${c[0]},${c[1]},${c[2]},1)`; })();

            if (w === 0) {
                // L-piece: render as 3 individual stud cells
                const ori = h - 1;
                for (const [dx, dy] of L_CELLS_MAIN[ori]) {
                    drawBrickOnCanvas(legoCtx, (sx + dx) * studSize, (sy + dy) * studSize, 1, 1, colorRgba, showStuds, studSize);
                }
            } else {
                drawBrickOnCanvas(legoCtx, sx * studSize, sy * studSize, w, h, colorRgba, showStuds, studSize);
            }
        }

        // Baseplate grid lines drawn as a single post-pass (cleaner than per-stud)
        if (useImageStore().showGrid && !useImageStore().previewArtOnWall) {
            legoCtx.fillStyle = 'rgba(0,0,0,1)';
            for (let gx = 16; gx < numStudsX; gx += 16) {
                legoCtx.fillRect(gx * studSize, 0, 1, numStudsY * studSize);
            }
            for (let gy = 16; gy < numStudsY; gy += 16) {
                legoCtx.fillRect(0, gy * studSize, numStudsX * studSize, 1);
            }
        }

        // Store brick counts for Pieces panel and pricing
        brickCountsData.value = brickCountsArr;

        // Update allColorOptions.count (total pieces per color, for used/visible flag)
        const numC = useImageStore().allColorOptions.length;
        useImageStore().allColorOptions.forEach((_, ci) => {
            let total = 0;
            for (let bi = 0; bi < BRICK_DEFS_MAIN.length; bi++) total += brickCountsArr[bi * numC + ci];
            useImageStore().allColorOptions[ci].count = total;
            useImageStore().allColorOptions[ci].used  = total > 0;
        });

        // Save placements for build plan
        storedPlacements.value = plc;
        storedNumStudsX.value  = numStudsX;
        storedNumStudsY.value  = numStudsY;
        if (useMenuStore().menuItemShow === 'B') nextTick(renderBuildPlan);

        isProcessing.value = false;
    }

    // ─────────────────────────────────────────────────────────────────
    //  Build plan rendering
    // ─────────────────────────────────────────────────────────────────

    function buildLookupMap() {
        const plc = storedPlacements.value
        if (!plc) { buildPlanLookup.value = null; return }
        const nX = storedNumStudsX.value; const nY = storedNumStudsY.value
        const lookup = new Int32Array(nX * nY).fill(-1)
        const numP = plc.length / 6
        for (let i = 0; i < numP; i++) {
            const sx = plc[i*6]; const sy = plc[i*6+1]
            const w  = plc[i*6+2]; const h  = plc[i*6+3]
            const ci = plc[i*6+4]
            if (ci < 0) continue
            if (w === 0) { // L-piece
                for (const [dx, dy] of L_CELLS_MAIN[h-1]) {
                    const nx = sx+dx, ny = sy+dy
                    if (nx < nX && ny < nY) lookup[ny*nX + nx] = i
                }
            } else {
                for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) {
                    const nx = sx+dx, ny = sy+dy
                    if (nx < nX && ny < nY) lookup[ny*nX + nx] = i
                }
            }
        }
        buildPlanLookup.value = lookup
    }

    function onBuildCanvasMouseMove(e) {
        if (!buildPlanLookup.value || !storedPlacements.value) return
        const canvas = buildPlanCanvasEl.value
        if (!canvas) return
        const rect    = canvas.getBoundingClientRect()
        const mouseX  = e.clientX - rect.left
        const mouseY  = e.clientY - rect.top
        const { studSz, originSX, originSY } = buildRenderState
        if (studSz <= 0) return
        const studX = Math.floor(mouseX / studSz) + originSX
        const studY = Math.floor(mouseY / studSz) + originSY
        const nX = storedNumStudsX.value; const nY = storedNumStudsY.value
        if (studX < 0 || studY < 0 || studX >= nX || studY >= nY) {
            planTooltip.value = { ...planTooltip.value, show: false }; return
        }
        const pIdx = buildPlanLookup.value[studY * nX + studX]
        if (pIdx < 0) { planTooltip.value = { ...planTooltip.value, show: false }; return }
        const plc  = storedPlacements.value
        const ci   = plc[pIdx*6 + 4]
        const bi   = plc[pIdx*6 + 5]
        const w    = plc[pIdx*6 + 2]
        if (ci < 0) { planTooltip.value = { ...planTooltip.value, show: false }; return }
        const colorOpt  = useImageStore().allColorOptions[ci]
        const brickDef  = BRICK_DEFS_MAIN[bi]
        const c = colorOpt?.color
        planTooltip.value = {
            show:       true,
            x:          e.clientX + 16,
            y:          e.clientY - 10,
            colorName:  colorOpt?.colorName  || 'Unknown',
            colorRgba:  c ? `rgba(${c[0]},${c[1]},${c[2]},1)` : '#444',
            brickLabel: brickDef ? (w === 0 ? brickDef.label + ' corner plate' : brickDef.label + ' plate') : 'plate',
        }
    }

    function onBuildCanvasMouseLeave() {
        planTooltip.value = { ...planTooltip.value, show: false }
    }

    function selectBP(idx) {
        selectedBP.value = idx
    }

    function openPlanTab() {
        useMenuStore().menuItemShow = 'B'
        nextTick(renderBuildPlan)
    }

    function renderBuildPlan() {
        const canvas = buildPlanCanvasEl.value
        if (!canvas || !storedPlacements.value) return

        const plc  = storedPlacements.value
        const numP = plc.length / 6
        const nX   = storedNumStudsX.value
        const nY   = storedNumStudsY.value
        if (!nX || !nY) return

        const W = useImageStore().width
        const H = useImageStore().height
        const area = buildPlanAreaEl.value
        const areaW = area ? area.clientWidth  : 700
        const areaH = area ? area.clientHeight : 600

        // ── Compute integer studSz so every stud cell is a perfect square ──
        let studSz, cssW, cssH
        let originSX = 0, originSY = 0

        if (selectedBP.value >= 0) {
            const bpCol = selectedBP.value % W
            const bpRow = Math.floor(selectedBP.value / W)
            originSX = bpCol * 16; originSY = bpRow * 16
            // Square canvas: fit in the smallest dimension minus nav bar (≈52px)
            studSz = Math.max(8, Math.floor(Math.min(areaW - 16, areaH - 52) / 16))
            cssW = cssH = 16 * studSz       // guaranteed square
        } else {
            const maxW = areaW - 16
            const maxH = areaH - 52
            // Same studSz for X and Y → stud cells are always square
            studSz = Math.max(3, Math.floor(Math.min(maxW / nX, maxH / nY)))
            cssW = nX * studSz
            cssH = nY * studSz
        }

        // ── HiDPI: scale canvas pixel buffer by DPR for crisp circles ──
        const dpr = Math.ceil(window.devicePixelRatio || 1)
        canvas.width  = cssW * dpr
        canvas.height = cssH * dpr
        // Set explicit CSS size = logical size → no browser stretching
        canvas.style.width  = cssW + 'px'
        canvas.style.height = cssH + 'px'

        // Save state for mouse hover lookup
        buildRenderState = { studSz, originSX, originSY }

        const ctx = canvas.getContext('2d')
        ctx.scale(dpr, dpr)      // all draw calls now in CSS-pixel space

        ctx.fillStyle = '#18181b'
        ctx.fillRect(0, 0, cssW, cssH)

        const outlineW  = Math.max(1, Math.min(2, studSz / 10))
        const drawKnobs = studSz >= 8
        const knobR     = studSz * 0.28   // radius for stud knob circle

        // ── Pass 1: Fill all bricks ──────────────────────────────────────
        for (let i = 0; i < numP; i++) {
            const sx = plc[i*6]; const sy = plc[i*6+1]
            const w  = plc[i*6+2]; const h  = plc[i*6+3]
            const ci = plc[i*6+4]
            if (ci < 0) continue
            if (selectedBP.value >= 0 &&
                (Math.floor(sx/16) !== selectedBP.value % W ||
                 Math.floor(sy/16) !== Math.floor(selectedBP.value / W))) continue

            const cArr = useImageStore().allColorOptions[ci]?.color
            ctx.fillStyle = cArr ? `rgba(${cArr[0]},${cArr[1]},${cArr[2]},1)` : '#333'

            if (w === 0) {          // L-piece
                for (const [dx, dy] of L_CELLS_MAIN[h - 1]) {
                    ctx.fillRect((sx+dx-originSX)*studSz, (sy+dy-originSY)*studSz, studSz, studSz)
                }
            } else {
                ctx.fillRect((sx-originSX)*studSz, (sy-originSY)*studSz, w*studSz, h*studSz)
            }
        }

        // ── Pass 2: Outlines (drawn after all fills so they're never buried) ──
        if (showPlanOutlines.value) {
        ctx.strokeStyle = 'rgba(0,0,0,0.78)'
        ctx.lineWidth   = outlineW
        for (let i = 0; i < numP; i++) {
            const sx = plc[i*6]; const sy = plc[i*6+1]
            const w  = plc[i*6+2]; const h  = plc[i*6+3]
            const ci = plc[i*6+4]
            if (ci < 0) continue
            if (selectedBP.value >= 0 &&
                (Math.floor(sx/16) !== selectedBP.value % W ||
                 Math.floor(sy/16) !== Math.floor(selectedBP.value / W))) continue

            const hw = outlineW / 2
            const px = (sx - originSX) * studSz
            const py = (sy - originSY) * studSz
            const s  = studSz

            if (w === 0) {
                // L-piece: single polygon outline — no internal borders between cells
                const ori = h - 1
                ctx.beginPath()
                switch (ori) {
                    case 0: // missing top-right
                        ctx.moveTo(px+hw,     py+hw)
                        ctx.lineTo(px+s-hw,   py+hw)
                        ctx.lineTo(px+s-hw,   py+s+hw)
                        ctx.lineTo(px+2*s-hw, py+s+hw)
                        ctx.lineTo(px+2*s-hw, py+2*s-hw)
                        ctx.lineTo(px+hw,     py+2*s-hw)
                        break
                    case 1: // missing bottom-right
                        ctx.moveTo(px+hw,     py+hw)
                        ctx.lineTo(px+2*s-hw, py+hw)
                        ctx.lineTo(px+2*s-hw, py+s-hw)
                        ctx.lineTo(px+s+hw,   py+s-hw)
                        ctx.lineTo(px+s+hw,   py+2*s-hw)
                        ctx.lineTo(px+hw,     py+2*s-hw)
                        break
                    case 2: // missing bottom-left
                        ctx.moveTo(px+hw,     py+hw)
                        ctx.lineTo(px+2*s-hw, py+hw)
                        ctx.lineTo(px+2*s-hw, py+2*s-hw)
                        ctx.lineTo(px+s+hw,   py+2*s-hw)
                        ctx.lineTo(px+s+hw,   py+s-hw)
                        ctx.lineTo(px+hw,     py+s-hw)
                        break
                    case 3: // missing top-left
                        ctx.moveTo(px+s-hw,   py+hw)
                        ctx.lineTo(px+2*s-hw, py+hw)
                        ctx.lineTo(px+2*s-hw, py+2*s-hw)
                        ctx.lineTo(px+hw,     py+2*s-hw)
                        ctx.lineTo(px+hw,     py+s+hw)
                        ctx.lineTo(px+s-hw,   py+s+hw)
                        break
                }
                ctx.closePath()
                ctx.stroke()
            } else {
                ctx.strokeRect(px + hw, py + hw, w*studSz - outlineW, h*studSz - outlineW)
            }
        }
        } // end showPlanOutlines

        // ── Pass 3: Stud knobs ───────────────────────────────────────────
        if (drawKnobs) {
            ctx.fillStyle = 'rgba(255,255,255,0.18)'
            for (let i = 0; i < numP; i++) {
                const sx = plc[i*6]; const sy = plc[i*6+1]
                const w  = plc[i*6+2]; const h  = plc[i*6+3]
                const ci = plc[i*6+4]
                if (ci < 0) continue
                if (selectedBP.value >= 0 &&
                    (Math.floor(sx/16) !== selectedBP.value % W ||
                     Math.floor(sy/16) !== Math.floor(selectedBP.value / W))) continue

                const cells = w === 0
                    ? L_CELLS_MAIN[h-1].map(([dx,dy]) => [sx+dx, sy+dy])
                    : Array.from({length: h}, (_,dy) =>
                        Array.from({length: w}, (_,dx) => [sx+dx, sy+dy])).flat()

                for (const [cx, cy] of cells) {
                    ctx.beginPath()
                    ctx.arc(
                        (cx - originSX + 0.5) * studSz,
                        (cy - originSY + 0.5) * studSz,
                        knobR, 0, Math.PI * 2
                    )
                    ctx.fill()
                }
            }
        }

        // ── Baseplate grid & labels ──────────────────────────────────────
        if (selectedBP.value < 0) {
            // White dividing lines between baseplates
            if (showPlanGrid.value) {
            ctx.fillStyle = 'rgba(255,255,255,0.75)'
            for (let gx = 16; gx < nX; gx += 16) ctx.fillRect(gx*studSz - 1, 0, 2, cssH)
            for (let gy = 16; gy < nY; gy += 16) ctx.fillRect(0, gy*studSz - 1, cssW, 2)
            }
            // Plate ID labels
            if (showPlanGrid.value && studSz >= 5) {
                const fs = Math.min(11, studSz * 1.6)
                ctx.font = `bold ${fs}px sans-serif`
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
                for (let row = 0; row < H; row++) for (let col = 0; col < W; col++) {
                    const label = `${String.fromCharCode(65+row)}${col+1}`
                    const lx = (col*16 + 8)*studSz; const ly = (row*16 + 8)*studSz
                    ctx.fillStyle = 'rgba(0,0,0,0.6)';   ctx.fillText(label, lx+1, ly+1)
                    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillText(label, lx, ly)
                }
            }
        } else {
            // Sub-stud grid lines for single-plate view
            if (studSz >= 12) {
                ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 0.5
                for (let g = 1; g < 16; g++) {
                    ctx.beginPath(); ctx.moveTo(g*studSz, 0); ctx.lineTo(g*studSz, cssH); ctx.stroke()
                    ctx.beginPath(); ctx.moveTo(0, g*studSz); ctx.lineTo(cssW, g*studSz); ctx.stroke()
                }
            }
            // Stud coordinate numbers
            if (studSz >= 14) {
                ctx.font = `${Math.min(9, studSz * 0.52)}px monospace`
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
                ctx.fillStyle = 'rgba(255,255,255,0.3)'
                for (let g = 0; g < 16; g++) {
                    ctx.fillText(g+1, (g+0.5)*studSz, studSz * 0.3)
                    ctx.fillText(g+1, studSz * 0.3, (g+0.5)*studSz)
                }
            }
            // Plate name label
            const bpName = `${String.fromCharCode(65+Math.floor(selectedBP.value/W))}${selectedBP.value%W+1}`
            ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'
            ctx.fillStyle = 'rgba(0,0,0,0.5)';   ctx.fillText(`Plate ${bpName}`, 5, 5)
            ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillText(`Plate ${bpName}`, 4, 4)
        }

        // Rebuild lookup map so hover works on the freshly rendered frame
        buildLookupMap()
    }

    function renderMosaicFromPlacements(placements, numStudsX, numStudsY) {
        const legoC = document.getElementById('legoCanvas')
        if (!legoC) return
        const ctx = legoC.getContext('2d')
        const ss = 8
        legoC.width  = numStudsX * ss
        legoC.height = numStudsY * ss
        const numP = placements.length / 6
        const showStuds = useImageStore().showStuds

        for (let i = 0; i < numP; i++) {
            const sx = placements[i*6]; const sy = placements[i*6+1]
            const w  = placements[i*6+2]; const h  = placements[i*6+3]
            const ci = placements[i*6+4]; const isL = w === 0; const ori = h - 1
            const cArr = ci >= 0 ? useImageStore().allColorOptions[ci]?.color : null
            const color = cArr ? `rgba(${cArr[0]},${cArr[1]},${cArr[2]},1)` : 'rgba(0,0,0,1)'
            if (isL) {
                for (const [dx, dy] of L_CELLS_MAIN[ori])
                    drawBrickOnCanvas(ctx, (sx+dx)*ss, (sy+dy)*ss, 1, 1, color, showStuds, ss)
            } else {
                drawBrickOnCanvas(ctx, sx*ss, sy*ss, w, h, color, showStuds, ss)
            }
        }
        if (useImageStore().showGrid) {
            ctx.fillStyle = 'rgba(0,0,0,1)'
            for (let gx = 16; gx < numStudsX; gx += 16) ctx.fillRect(gx*ss, 0, 1, numStudsY*ss)
            for (let gy = 16; gy < numStudsY; gy += 16) ctx.fillRect(0, gy*ss, numStudsX*ss, 1)
        }
    }

    async function exportPlanURL() {
        if (!storedPlacements.value) return
        shareStatus.value = 'copying'
        try {
            const plc = storedPlacements.value; const numP = plc.length / 6
            const raw = new Uint8Array(3 + numP * 6)
            raw[0] = 1; raw[1] = useImageStore().width & 0xFF; raw[2] = useImageStore().height & 0xFF
            for (let i = 0; i < numP; i++) {
                raw[3+i*6]   = plc[i*6]     & 0xFF
                raw[3+i*6+1] = plc[i*6+1]   & 0xFF
                raw[3+i*6+2] = plc[i*6+2]   & 0xFF
                raw[3+i*6+3] = plc[i*6+3]   & 0xFF
                raw[3+i*6+4] = (plc[i*6+4]+1) & 0xFF  // colorIdx+1 (0=none)
                raw[3+i*6+5] = plc[i*6+5]   & 0xFF
            }
            let data = raw; let prefix = 'r'
            if (typeof CompressionStream !== 'undefined') { data = await deflate(raw); prefix = 'z' }
            const encoded = prefix + arrayToBase64url(data)
            const url = new URL(window.location.href)
            url.search = ''              // clear any stale ?plan= so it never reaches the server
            url.hash = 'plan=' + encoded // put data in the fragment — never sent to server
            await navigator.clipboard.writeText(url.toString())
            shareStatus.value = 'copied'
            setTimeout(() => { shareStatus.value = 'idle' }, 3000)
        } catch (err) {
            console.error('Export plan failed:', err)
            shareStatus.value = 'error'
            setTimeout(() => { shareStatus.value = 'idle' }, 3000)
        }
    }

    async function importPlanFromURL() {
        // Primary: read from URL hash (#plan=…) — this is what exportPlanURL writes.
        // Fallback: legacy ?plan=… query-string links (caused HTTP 414; kept for backward compat).
        const hashParams = new URLSearchParams(window.location.hash.slice(1))
        const planStr = hashParams.get('plan') ?? new URLSearchParams(window.location.search).get('plan')
        if (!planStr || planStr.length < 4) return
        try {
            const prefix = planStr[0]
            let raw = base64urlToArray(planStr.slice(1))
            if (prefix === 'z') raw = await inflate(raw)
            if (raw[0] !== 1) return
            const W = raw[1]; const H = raw[2]
            useImageStore().width = W; useImageStore().height = H
            const numP = Math.floor((raw.length - 3) / 6)
            const placements = new Int32Array(numP * 6)
            for (let i = 0; i < numP; i++) {
                placements[i*6]   = raw[3+i*6]
                placements[i*6+1] = raw[3+i*6+1]
                placements[i*6+2] = raw[3+i*6+2]
                placements[i*6+3] = raw[3+i*6+3]
                placements[i*6+4] = raw[3+i*6+4] - 1  // restore colorIdx
                placements[i*6+5] = raw[3+i*6+5]
            }
            const numC = useImageStore().allColorOptions.length
            const bca  = new Int32Array(BRICK_DEFS_MAIN.length * numC)
            for (let i = 0; i < numP; i++) {
                const ci = placements[i*6+4]; const bi = placements[i*6+5]
                if (ci >= 0 && ci < numC && bi >= 0 && bi < BRICK_DEFS_MAIN.length) bca[bi*numC+ci]++
            }
            brickCountsData.value = bca
            useImageStore().allColorOptions.forEach((_, ci) => {
                let total = 0
                for (let bi = 0; bi < BRICK_DEFS_MAIN.length; bi++) total += bca[bi*numC+ci]
                useImageStore().allColorOptions[ci].count = total
                useImageStore().allColorOptions[ci].used  = total > 0
            })
            storedPlacements.value = placements
            storedNumStudsX.value  = W * 16
            storedNumStudsY.value  = H * 16
            isViewOnly.value = true
            await nextTick()
            renderMosaicFromPlacements(placements, W * 16, H * 16)
            useMenuStore().menuItemShow = 'B'
            await nextTick()
            renderBuildPlan()
        } catch (err) {
            console.error('Import plan from URL failed:', err)
        }
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
                // Scale image to cover the target canvas (preserve aspect ratio)
                const targetW = (16 * 8) * useImageStore().width;
                const targetH = (16 * 8) * useImageStore().height;
                const imgAspect = img.naturalWidth / img.naturalHeight;
                const canvasAspect = targetW / targetH;
                if (imgAspect > canvasAspect) {
                    // Image wider than target — fit height, let width overflow
                    img.height = targetH;
                    img.width  = targetH * imgAspect;
                } else {
                    // Image taller than target — fit width, let height overflow
                    img.width  = targetW;
                    img.height = targetW / imgAspect;
                }
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
        // Always size the canvas to exactly the configured baseplate dimensions
        let numStudsX = 16 * useImageStore().width;
        let numStudsY = 16 * useImageStore().height;


        // Set canvas dimensions to match the number of studs
        canvas.width = numStudsX * studSize;
        canvas.height = numStudsY * studSize;
        // Expose the cover-scaled image dimensions to the overlay (not the canvas clip size)
        overlayImgCanvasW.value = image.width
        overlayImgCanvasH.value = image.height

        // Draw the image at its cover-scaled size (aspect ratio preserved, canvas clips the overflow)
        ctx.drawImage(image, useImageStore().x, useImageStore().y, image.width, image.height);

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
                colorOptions: useImageStore().allColorOptions.map(o => ({ color: Array.from(o.color), checked: !!o.checked, name: o.colorName })),
                generation: processingGeneration,
                enabledBrickIds: enabledBrickIds.value,
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

    function toggleMosaic() {
        if (isViewOnly.value) return
        useImageStore().previewShowMosaic = !useImageStore().previewShowMosaic
        initConvert()
    }
    function toggleGrid() {
        if (isViewOnly.value) return
        useImageStore().showGrid = !useImageStore().showGrid
        initConvert()
    }

    function toggleBrickSize(b) {
        if (b.id === '1x1') return
        b.enabled = !b.enabled
        initConvert()
    }

    function buildBricklinkXML() {
        // BrickLink XML format must NOT have an XML declaration — see bricklink.com/help.asp?helpID=207
        // Collect all items into a map keyed by "blId:color" to avoid duplicate item/color entries
        const itemMap = new Map() // key → { blId, color, qty, remarks[] }
        function addItem(blId, color, qty, remark) {
            const key = `${blId}:${color}`
            if (itemMap.has(key)) {
                const entry = itemMap.get(key)
                entry.qty += qty
                if (remark && !entry.remarks.includes(remark)) entry.remarks.push(remark)
            } else {
                itemMap.set(key, { blId, color, qty, remarks: remark ? [remark] : [] })
            }
        }

        if (brickCountsData.value) {
            const numC = useImageStore().allColorOptions.length
            BRICK_DEFS_MAIN.forEach((brick, btIdx) => {
                useImageStore().allColorOptions.forEach((colorOpt, ci) => {
                    const cnt = brickCountsData.value[btIdx * numC + ci]
                    if (!cnt) return
                    const blColor = BRICKLINK_COLORS[colorOpt.colorName]
                    if (blColor === undefined) return
                    addItem(brick.blId, blColor, cnt, `${escapeXML(colorOpt.colorName)} ${brick.label}`)
                })
            })
        } else {
            // Fallback: 1×1 plates only (no brick data yet)
            useImageStore().allColorOptions.forEach(item => {
                if (item.count <= 0) return
                const blColor = BRICKLINK_COLORS[item.colorName]
                if (blColor === undefined) return
                addItem('3024', blColor, item.count, escapeXML(item.colorName))
            })
        }

        // 16×16 baseplates (item 65803) — any color for cheapest price
        const baseplateCount = useImageStore().width * useImageStore().height
        if (baseplateCount > 0) {
            addItem('65803', 0, baseplateCount, '16x16 Baseplate (any color)')
        }

        // Border frame pieces (all Black, BL color 11)
        for (const group of borderPiecesData.value) {
            for (const item of group.items) {
                addItem(item.blId, 11, item.count, `${escapeXML(item.label)} (Border)`)
            }
        }

        // Emit deduplicated items
        let xml = '<INVENTORY>\n'
        const cond = bricklinkAllowUsed.value ? 'X' : 'N'
        for (const { blId, color, qty, remarks } of itemMap.values()) {
            xml += '  <ITEM>\n'
            xml += '    <ITEMTYPE>P</ITEMTYPE>\n'
            xml += `    <ITEMID>${blId}</ITEMID>\n`
            if (color !== 0) xml += `    <COLOR>${color}</COLOR>\n`
            xml += `    <MINQTY>${qty}</MINQTY>\n`
            xml += `    <CONDITION>${cond}</CONDITION>\n`
            if (remarks.length) xml += `    <REMARKS>${remarks.join(' + ')}</REMARKS>\n`
            xml += '  </ITEM>\n'
        }
        xml += '</INVENTORY>'
        return xml
    }

    const bricklinkCopied = ref(false)
    const bricklinkAllowUsed = ref(false)
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