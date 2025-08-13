document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    const startCameraButton = document.getElementById('start-camera');
    const clickPhotoButton = document.getElementById('click-photo');
    const uploadImageInput = document.getElementById('upload-image');

    const colorPreview = document.getElementById('color-preview');
    const hexValue = document.getElementById('hex');
    const rgbValue = document.getElementById('rgb');
    const cmykValue = document.getElementById('cmyk');

    let videoStream = null;

    // --- Webcam Functionality ---

    startCameraButton.addEventListener('click', async () => {
        try {
            // Stop any existing stream
            if (videoStream) {
                videoStream.getTracks().forEach(track => track.stop());
            }
            
            videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            video.srcObject = videoStream;
            video.classList.remove('hidden');
            clickPhotoButton.classList.remove('hidden');
            canvas.classList.add('hidden'); // Hide canvas when video is active
        } catch (err) {
            console.error("Error accessing webcam:", err);
            alert("Could not access the webcam. Please ensure you have given permission.");
        }
    });

    clickPhotoButton.addEventListener('click', () => {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame onto the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Stop the webcam stream
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
        }

        // Hide video and show canvas
        video.classList.add('hidden');
        clickPhotoButton.classList.add('hidden');
        canvas.classList.remove('hidden');
    });

    // --- Image Upload Functionality ---

    uploadImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Set canvas dimensions to match image
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0);
                
                // Ensure canvas is visible
                canvas.classList.remove('hidden');
                video.classList.add('hidden');
                clickPhotoButton.classList.add('hidden');
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // --- Color Picking Functionality ---

    canvas.addEventListener('mousemove', (e) => {
        // Get mouse coordinates relative to the canvas
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);

        // Get pixel data at the coordinates
        const pixelData = context.getImageData(x, y, 1, 1).data;
        const [r, g, b] = pixelData;

        // Update the display
        updateColorInfo(r, g, b);
    });

    function updateColorInfo(r, g, b) {
        const rgbString = `rgb(${r}, ${g}, ${b})`;
        const hexString = rgbToHex(r, g, b);
        const cmykString = rgbToCmyk(r, g, b);

        // Update UI
        colorPreview.style.backgroundColor = rgbString;
        rgbValue.textContent = rgbString;
        hexValue.textContent = hexString;
        cmykValue.textContent = cmykString;
    }

    // --- Color Conversion Helpers ---

    function rgbToHex(r, g, b) {
        const toHex = (c) => ('0' + c.toString(16)).slice(-2);
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    }

    function rgbToCmyk(r, g, b) {
        if (r === 0 && g === 0 && b === 0) {
            return 'cmyk(0, 0, 0, 100)';
        }

        let c = 1 - (r / 255);
        let m = 1 - (g / 255);
        let y = 1 - (b / 255);

        const k = Math.min(c, m, y);
        c = (c - k) / (1 - k);
        m = (m - k) / (1 - k);
        y = (y - k) / (1 - k);
        
        const format = (val) => Math.round(val * 100);

        return `cmyk(${format(c)}, ${format(m)}, ${format(y)}, ${format(k)})`;
    }
});
