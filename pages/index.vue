<template>
    
    <div class="flex flex-col min-h-100vh">


        <div class="p-4 w-full h-[70vh] overflow-x-scroll flex flex-col no-scrollbar">
            <button @click="getColorArray()">test</button>
            <h2>LEGO Brick Image</h2>
            <canvas id="legoCanvas"></canvas>
        </div>


        <div class="bg-[#ffffff] flex flex-col w-full h-[23vh]">

            <div id="navbar" class="grid grid-cols-5 w-full bg-[#cdcdcd]">
                
                <button @click="useMenuStore().menuItemShow = 'SI'" class="h-full w-full col-span-1 flex items-center justify-center p-2">
                    <Icon class="mr-1" name="material-symbols:image-outline-rounded" />
                    <p class="text-[14px] font-medium pt-1">Source image</p>
                </button>

                <button @click="useMenuStore().menuItemShow = 'S'" class="h-full w-full col-span-1 flex items-center justify-center p-2">
                    <Icon class="mr-1" name="iconoir:add-frame" />
                    <p class="text-[14px] font-medium pt-1">Size</p>
                </button>

                <button @click="useMenuStore().menuItemShow = 'AI'" class="h-full w-full col-span-1 flex items-center justify-center p-2">
                    <Icon class="mr-1" name="streamline:interface-setting-slider-vertical-adjustment-adjust-controls-fader-vertical-settings-slider" />
                    <p class="text-[14px] font-medium pt-1">Adjust image</p>
                </button>

                <button @click="useMenuStore().menuItemShow = 'C'" class="h-full w-full col-span-1 flex items-center justify-center p-2">
                    <Icon class="mr-1" name="mingcute:color-picker-line" />
                    <p class="text-[14px] font-medium pt-1">Color</p>
                </button>

                <button @click="useMenuStore().menuItemShow = 'P'" class="h-full w-full col-span-1 flex items-center justify-center p-2">
                    <Icon class="mr-1" name="tabler:lego" />
                    <p class="text-[14px] font-medium pt-1">Peices</p>
                </button>

            </div>

            
            <div class="p-4 w-full h-auto no-scrollbar overflow-y-scroll">

                <div v-if="useMenuStore().menuItemShow == 'SI'" class="flex items-center justify-center w-full relative">
                    <label for="fileInput" class="relative z-[10] flex flex-col items-center justify-center w-full p-2 border-2 border-black border-dashed rounded-2xl cursor-pointer dark:hover:border-black dark:hover:bg-black/[0.1]">
                        <div class="flex flex-col items-center justify-center">
                            <!-- img v-if="true" id="originalImage" alt="Original Image" class="aspect-auto	w-full rounded-xl relative h-auto z-[0]" src="" -->
                            <svg class="w-8 h-8 text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p class="text-[14px] text-black text-center"><span class="font-semibold">Click to upload</span></p>
                            <p class="text-[12px] text-black">PNG or JPG</p>
                        </div>
                        <input @change="fileInputChange()" id="fileInput" type="file" class="hidden" accept="image/*" />
                    </label>
                </div>

                <div v-if="useMenuStore().menuItemShow == 'S'" class="bg-white p-2 rounded-xl">
                    <h2 class="font-semibold text-[14px]">Size (16x16 stud plates)</h2>
                    <div class="w-fit bg-gray-700/[0.3] rounded-xl flex p-1 pt-2">
                        <input @change="initConvert()" id="widthBox" type="text" v-model="useImageStore().width" class="w-[30px] bg-transparent text-center font-semibold">
                        <p class="font-semibold">x</p>
                        <input @change="initConvert()" id="heightBox" type="text" v-model="useImageStore().height" class="w-[30px] bg-transparent text-center font-semibold">
                    </div>

                    <h2 class="font-semibold text-[14px]">Keep Image A/R</h2>
                    <input @change="initConvert()" id="checkboxAR" type="checkbox" v-model="useImageStore().keepAspect" class="w-[30px] bg-transparent text-center">

                </div>

                <div v-if="useMenuStore().menuItemShow == 'AI'" class="bg-white p-2 rounded-xl">

                    <div class="flex gap-2">
                        <div class="bg-gray-700/[0.3] rounded-xl flex p-1 pt-2 w-[50%]">
                            <p class="font-semibold text-[14px] pl-2 pr-1">Brightness</p>
                            <input @change="initConvert()" id="brightness" step="10" type="number" v-model="useImageStore().brightness" class="w-[60px] bg-transparent font-semibold text-left">
                        </div>

                        <div class="bg-gray-700/[0.3] rounded-xl flex p-1 pt-2 w-[50%]">
                            <p class="font-semibold text-[14px] pl-2 pr-1">Contrast</p>
                            <input @change="initConvert()" inputmode="numeric" step="0.1" id="contrast" type="number" v-model="useImageStore().contrast" class="w-[60px] bg-transparent text-left font-semibold">
                        </div>
                    </div>
                </div>

                <div v-if="useMenuStore().menuItemShow == 'C'" class="p-2 rounded-xl">
                    
                    <button @click="toggleAllColors()" class="p-1 pl-4 pr-4 rounded-full bg-black/[0.1] text-[14px] mb-2 font-medium pt-2">Toggle all</button>

                    <div class="flex flex-wrap gap-[4px]">

                        <div v-for="(item, index) in useImageStore().allColorOptions" v-bind:key="index">


                            <label :for="colorCheckbox + index" class="">
                                <div class="h-10 w-10 rounded-lg" :style="{ backgroundColor: `rgba(${item.color.join(',')})` }">
                                    <input type="checkbox" :id="colorCheckbox + index" class="">
                                </div>
                            </label>


                            <div class="border-2 border-gray-700/[0.3] w-fit p-[4px] rounded-full flex items-center relative font-medium bg-black/[0.10]">
                                <label class="relative inline-flex items-center cursor-pointer mr-[4px]">
                                    <input type="checkbox" value="" class="sr-only peer" v-model="item.checked" @change="initConvert()">
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

                <div v-if="useMenuStore().menuItemShow == 'P'" class="p-2 rounded-xl">
                    <p>16x16 plates: {{ useImageStore().width * useImageStore().height }}x</p>
                </div>

            </div>

            
        </div>

        <div class="p-2 w-full h-[7vh] bg-[#dfdfdf] flex gap-8">
            <img v-if="true" id="originalImage" alt="Original Image" class="aspect-auto rounded-lg	w-auto h-full" src="">

            <div class="w-fi h-full flex flex-col jusify-center font-medium">
                <p class="pt-1 opacity-50">Size</p>
                <p class="font-semibold">{{ ((0.80*16)*useImageStore().width).toFixed(1) + "cm x " + ((0.80*16)*useImageStore().height).toFixed(1) + "cm" }}</p>    
            </div>

            <div class="w-fi h-full flex flex-col jusify-center font-medium">
                <p class="pt-1 opacity-50">Price</p>
                <p class="font-semibold">2.200dkk</p>    
            </div>

        </div>

    </div>

</template>

<script setup>

import { useImageStore } from '@/stores/ImageStore'
import { useMenuStore } from '@/stores/ShowMenu'
import { onMounted } from 'vue';

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

    onMounted(() => {
        
        const apiKey = '47033019a36c204b3f7c5606c05d4cc4';
        const apiUrl = 'https://rebrickable.com/api/v3/lego/colors/';

        // Construct the URL with the API key
        const fullUrl = `${apiUrl}?key=${apiKey}`;

        fetch(fullUrl)
        .then(response => {
            // Check if the response status is OK (200)
            if (response.status !== 200) {
            console.error(`Error: Status ${response.status}`);
            return;
            }

            // Parse the JSON response
            return response.json();
        })
        .then(data => {
            // Handle the data here
            //console.log(data.results);
        
            useImageStore().allColorOptions = []
            data.results.forEach(item => {
                useImageStore().allColorOptions.push({color: hexToRgba(item.rgb), hexColor: item.rgb, colorName: item.name, checked: true, used: false})
            });
            //console.log(useImageStore().allColorOptions)
            
        })
        .catch(error => {
            console.error('Error:', error);
        });


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

        


    })

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
            initConvert()
    }

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

                    const legoImage = convertToLego(img, 8); // Customize brick size and colors
                    legoCanvas.width = (16*8) * useImageStore().width;
                    legoCanvas.height = (16*8) * useImageStore().height;
                    legoCtx.drawImage(legoImage, 0, 0);

                    
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
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

    function convertToLego(image, studSize) {
        const imgWidth = image.width;
        const imgHeight = image.height;

        // Calculate the number of studs in both dimensions
        const numStudsX = Math.ceil(imgWidth / studSize);
        const numStudsY = Math.ceil(imgHeight / studSize);

        // Set canvas dimensions to match the number of studs
        canvas.width = numStudsX * studSize;
        canvas.height = numStudsY * studSize;

        // Draw the image on the canvas
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        changeBrightness(useImageStore().brightness);
        changeContrast(useImageStore().contrast);

        //console.log(useImageStore().allColorOptions)

        // Loop through each stud and map its color
        for (let x = 0; x < numStudsX; x++) {
            for (let y = 0; y < numStudsY; y++) {
                // Calculate the position and size of the stud
                const studX = x * studSize;
                const studY = y * studSize;

                // Get the average color of the cell
                const cellColor = getAverageColor(ctx, studX, studY, studSize, studSize);
                const legoColorEquivilant = findClosestColor(cellColor, getColorArray())
                // Draw the stud with the closest LEGO color
                ctx.fillStyle = legoColorEquivilant
                
                if (legoColorEquivilant != 'rgba(0, 0, 0, 1)') {
                    let relatedColor = useImageStore().allColorOptions.indexOf(useImageStore().allColorOptions.find((arrayElem) => arrayElem.hexColor == rgbaToHex(legoColorEquivilant)))
                    useImageStore().allColorOptions[relatedColor].used = true
                }
                
                ctx.fillRect(studX, studY, studSize, studSize);  // Draw a rectangle
                ctx.fillStyle = "rgba(255,255,255,0.1)";  // Change the fill color for the circle
                ctx.beginPath();
                ctx.arc(studX + studSize / 2, studY + studSize / 2, studSize / 3, 0, Math.PI * 2);  // Draw a circle inside the rectangle
                ctx.fill();
            }
        }

        //disabled unused colors
        useImageStore().allColorOptions.forEach(item => {
            if (item.used == false) {
                item.checked = false
                item.used == false
            }
        });

        // Sort the array based on the "checked" property
        useImageStore().allColorOptions.sort((a, b) => {
            if (a.checked && !b.checked) {
                return -1; // a comes before b in the sorted order
            } else if (!a.checked && b.checked) {
                return 1; // b comes before a in the sorted order
            } else {
                return 0; // the order remains the same
            }
        });

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

    function toggleAllColors() {

        useImageStore().allColorOptions.forEach(function (item, i) {
            useImageStore().allColorOptions[i].checked = !rememberedColorToggle
            //console.log(useImageStore().allColorOptions[i])
        });
        rememberedColorToggle = !rememberedColorToggle

        initConvert()
    }

</script>

<style>

#originalImage[src=""] {
  display: none;
}

.no-scrollbar::-webkit-scrollbar {
    display: none;
}


</style>