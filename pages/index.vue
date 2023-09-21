<template>
    
    <div class="flex h-screen">

        <div class="bg-gray-700 h-full p-4 flex flex-col w-[350px]">

            <h1 class="text-white font-bold text-[28px]">Img to studs</h1>
            <p class="text-white font-bold text-[18px] mb-8">Mosaic maker</p>

            <div class="flex flex-col gap-2">
                <div class="flex items-center justify-center w-full relative">
                    <label for="fileInput" class="relative z-[10] flex flex-col items-center justify-center w-full p-2 border-2 border-white border-dashed rounded-2xl cursor-pointer dark:hover:border-white dark:hover:bg-gray-600/[0.4]">
                        <div class="flex flex-col items-center justify-center">
                            <img v-if="true" id="originalImage" alt="Original Image" class="aspect-auto	w-full rounded-xl relative h-auto z-[0] mb-2" src="">
                            <svg class="w-8 h-8 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p class="text-[14px] text-white text-center"><span class="font-semibold">Click to upload</span></p>
                            <p class="text-[12px] text-white">PNG or JPG</p>
                        </div>
                        <input id="fileInput" type="file" class="hidden" accept="image/*" />
                    </label>
                </div>

                <div class="bg-white p-2 rounded-xl">
                    <h2 class="font-semibold text-[14px]">Keep Image A/R</h2>
                    <input id="checkboxAR" type="checkbox" v-model="useImageStore().keepAspect" class="w-[30px] bg-transparent text-center">
                </div>

                <div class="bg-white p-2 rounded-xl">
                    <h2 class="font-semibold text-[14px]">Size (16x16 stud plates)</h2>
                    <div class="w-fit bg-gray-700/[0.3] rounded-xl flex p-1 pt-2">
                        <input id="widthBox" type="text" v-model="useImageStore().width" class="w-[30px] bg-transparent text-center font-semibold">
                        <p class="font-semibold">x</p>
                        <input id="heightBox" type="text" v-model="useImageStore().height" class="w-[30px] bg-transparent text-center font-semibold">
                    </div>
                </div>

                <div class="bg-white p-2 rounded-xl">
                    <h2 class="font-semibold text-[14px]">Colors</h2>
                    
                    <div class="flex flex-wrap gap-[4px]">
                        <div v-for="(item, index) in useImageStore().allColorOptions" v-bind:key="index">


                            <div class="border-2 border-gray-700/[0.3] w-fit p-[4px] rounded-full flex items-center relative font-medium bg-black/[0.1]">
                                <label class="relative inline-flex items-center cursor-pointer mr-[4px]">
                                    <input type="checkbox" value="" class="sr-only peer" checked>
                                    <div class="w-11 h-6 bg-gray-200 rounded-full dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-bubbles"></div>
                                </label>

                                <div class="w-4 h-4 p-[3px] mr-1" :style="{ backgroundColor: `rgba(${item.color.join(',')})` }">
                                    <div class="w-full h-full rounded-full bg-white/[0.2]"></div>
                                </div>

                                <p class="text-[12px] relative top-[2px] mr-2">{{ item.colorName }}</p>
                            </div>

                            
                        </div>
                    </div>

                </div>

                <div class="bg-white p-2 rounded-xl mt-8">
                    <h2 class="font-semibold text-[14px]">Peice count</h2>
                    <p>16x16 plates: {{ useImageStore().width * useImageStore().height }}x</p>
                </div>

            </div>
        </div>

        <div class="p-4">
            <h2>LEGO Brick Image</h2>
            <canvas id="legoCanvas"></canvas>
        </div>

    </div>

</template>

<script setup lang="ts">

import { useImageStore } from '@/stores/ImageStore'
import { onMounted } from 'vue';

let file = ""
let fileInput
let originalImage
let legoCanvas
let legoCtx
let CheckboxAR
let heightBox
let widthBox

    onMounted(() => {
        
        fileInput = document.getElementById('fileInput');
        originalImage = document.getElementById('originalImage');
        legoCanvas = document.getElementById('legoCanvas');
        legoCtx = legoCanvas.getContext('2d');
        CheckboxAR = document.getElementById('checkboxAR');
        heightBox = document.getElementById('heightBox');
        widthBox = document.getElementById('widthBox');

        console.log(file)

        // When a file is selected, load and process the image
        fileInput.addEventListener('change', (event) => {
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
            
        });

        CheckboxAR.addEventListener('change', () => {
            initConvert()
        })

        heightBox.addEventListener('change', () => {
            initConvert()
        })

        widthBox.addEventListener('change', () => {
            initConvert()
        })



    })

    function initConvert() {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    originalImage.src = img.src;
                    let aspect_ratio = originalImage.clientHeight / originalImage.clientWidth
                    img.width = (16*8) * useImageStore().width

                    if (useImageStore().keepAspect) {
                        img.height = (16*8) * useImageStore().width * aspect_ratio
                    }
                    else {
                        img.height = (16*8) * useImageStore().height
                    }

                    const legoImage = convertToLego(img, 8, ["#FF0000", "#00FF00", "#0000FF"]); // Customize brick size and colors
                    legoCanvas.width = (16*8) * useImageStore().width;
                    legoCanvas.height = (16*8) * useImageStore().height;
                    legoCtx.drawImage(legoImage, 0, 0);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }


    function convertToLego(image, studSize, colors) {
        const imgWidth = image.width;
        const imgHeight = image.height;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate the number of studs in both dimensions
        const numStudsX = Math.ceil(imgWidth / studSize);
        const numStudsY = Math.ceil(imgHeight / studSize);

        // Set canvas dimensions to match the number of studs
        canvas.width = numStudsX * studSize;
        canvas.height = numStudsY * studSize;

        // Draw the image on the canvas
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        // Loop through each stud and map its color
        for (let x = 0; x < numStudsX; x++) {
            for (let y = 0; y < numStudsY; y++) {
                // Calculate the position and size of the stud
                const studX = x * studSize;
                const studY = y * studSize;

                // Get the average color of the cell
                const cellColor = getAverageColor(ctx, studX, studY, studSize, studSize);
                const legoColorEquivilant = findClosestColor(cellColor,useImageStore().colorOptions)
                // Draw the stud with the closest LEGO color
                ctx.fillStyle = legoColorEquivilant
                ctx.fillRect(studX, studY, studSize, studSize);  // Draw a rectangle
                ctx.fillStyle = "rgba(255,255,255,0.1)";  // Change the fill color for the circle
                ctx.beginPath();
                ctx.arc(studX + studSize / 2, studY + studSize / 2, studSize / 3, 0, Math.PI * 2);  // Draw a circle inside the rectangle
                ctx.fill();
            }
        }

        return canvas;
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

</script>

<style>

#originalImage[src=""] {
  display: none;
}


</style>