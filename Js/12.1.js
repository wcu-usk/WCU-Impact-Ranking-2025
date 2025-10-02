document.addEventListener('DOMContentLoaded', function() {
            // --- TUTORIAL LOGIC ---
            const tutorialOverlay = document.getElementById('tutorial-overlay');
            const tutorialCloseBtn = document.getElementById('tutorial-close-btn');
            const tutorialGotItBtn = document.getElementById('tutorial-got-it');

            function closeTutorial() {
                tutorialOverlay.classList.add('hidden');
            }

            // Always show tutorial on load
            tutorialOverlay.classList.remove('hidden');

            tutorialCloseBtn.addEventListener('click', closeTutorial);
            tutorialGotItBtn.addEventListener('click', closeTutorial);
            
            // --- DOM Element Selection ---
            const slides = document.querySelectorAll('.slide');
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const slideJumper = document.getElementById('slide-jumper');
            const canvas = document.getElementById('drawing-canvas');
            const ctx = canvas.getContext('2d');
            const presentationContainer = document.querySelector('.presentation-container');
            const toolsWrapper = document.getElementById('tools-wrapper');
            const toggleToolbarBtn = document.getElementById('toggle-toolbar-btn');
            const chevronRight = document.getElementById('chevron-right');
            const chevronLeft = document.getElementById('chevron-left');
            const colorPalette = document.getElementById('color-palette');
            const customTooltip = document.getElementById('custom-tooltip');

            // --- State Variables ---
            let currentSlide = 0;
            const totalSlides = slides.length;
            let slideDrawings = new Array(totalSlides);
            let isDrawing = false;
            let currentTool = 'cursor';
            let lastX = 0;
            let lastY = 0;
            let penColor = '#ef4444'; // Default pen color

            // --- Functions ---
            function showSlide(newIndex, oldIndex) {
                if (oldIndex !== undefined) {
                    slideDrawings[oldIndex] = canvas.toDataURL();
                }

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (slideDrawings[newIndex]) {
                    const img = new Image();
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0);
                    };
                    img.src = slideDrawings[newIndex];
                }

                slides.forEach((slide, i) => slide.classList.toggle('active', i === newIndex));
                slideJumper.value = newIndex;
                prevBtn.disabled = newIndex === 0;
                nextBtn.disabled = newIndex === totalSlides - 1;
            }

            function resizeCanvas() {
                const currentDrawing = canvas.toDataURL();
                canvas.width = presentationContainer.clientWidth;
                canvas.height = presentationContainer.clientHeight;
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                };
                img.src = currentDrawing;
            }

            function setActiveTool(tool) {
                currentTool = tool;
                document.querySelectorAll('#tools-wrapper .tool-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.id === `${tool}-tool`);
                });

                colorPalette.classList.toggle('hidden', tool !== 'pen');
                canvas.style.pointerEvents = (tool === 'cursor') ? 'none' : 'auto';
            }
            
            function getMousePos(e) {
                const rect = canvas.getBoundingClientRect();
                return {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
            }

            function startDrawing(e) {
                isDrawing = true;
                const pos = getMousePos(e);
                [lastX, lastY] = [pos.x, pos.y];
            }

            function draw(e) {
                if (!isDrawing) return;
                const pos = getMousePos(e);
                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(pos.x, pos.y);
                
                if (currentTool === 'pen') {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.strokeStyle = penColor;
                    ctx.lineWidth = 4;
                } else if (currentTool === 'eraser') {
                    ctx.globalCompositeOperation = 'destination-out';
                    ctx.lineWidth = 25;
                }
                ctx.stroke();
                
                [lastX, lastY] = [pos.x, pos.y];
            }

            function stopDrawing() {
                isDrawing = false;
            }

            // --- Initial Setup & Event Listeners ---
            
            // Populate slide jumper
            for (let i = 0; i < totalSlides; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `Slide ${i + 1} of ${totalSlides}`;
                slideJumper.appendChild(option);
            }

            // Navigation listeners
            prevBtn.addEventListener('click', () => {
                if (currentSlide > 0) {
                    const oldSlide = currentSlide;
                    currentSlide--;
                    showSlide(currentSlide, oldSlide);
                }
            });
            nextBtn.addEventListener('click', () => {
                if (currentSlide < totalSlides - 1) {
                    const oldSlide = currentSlide;
                    currentSlide++;
                    showSlide(currentSlide, oldSlide);
                }
            });
            slideJumper.addEventListener('change', (e) => {
                const newSlideIndex = parseInt(e.target.value, 10);
                if (newSlideIndex !== currentSlide) {
                    const oldSlide = currentSlide;
                    currentSlide = newSlideIndex;
                    showSlide(currentSlide, oldSlide);
                }
            });

            // Toolbar listeners
            toggleToolbarBtn.addEventListener('click', () => {
                const isHidden = toolsWrapper.classList.toggle('hidden');
                chevronRight.classList.toggle('hidden', !isHidden);
                chevronLeft.classList.toggle('hidden', isHidden);
                if (isHidden) setActiveTool('cursor');
            });

            document.querySelectorAll('.tool-btn').forEach(btn => {
                btn.addEventListener('mouseenter', (e) => {
                    const title = e.currentTarget.getAttribute('title');
                    if (title) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        customTooltip.textContent = title;
                        customTooltip.style.opacity = '1';
                        customTooltip.style.top = `${rect.top - customTooltip.offsetHeight - 8}px`;
                        customTooltip.style.left = `${rect.left + rect.width / 2 - customTooltip.offsetWidth / 2}px`;
                    }
                });
                btn.addEventListener('mouseleave', () => {
                    customTooltip.style.opacity = '0';
                });
            });

            document.getElementById('cursor-tool').addEventListener('click', () => setActiveTool('cursor'));
            document.getElementById('pen-tool').addEventListener('click', () => setActiveTool('pen'));
            document.getElementById('eraser-tool').addEventListener('click', () => setActiveTool('eraser'));
            document.getElementById('clear-tool').addEventListener('click', () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                slideDrawings[currentSlide] = null;
            });

            colorPalette.addEventListener('click', (e) => {
                if (e.target.classList.contains('color-btn')) {
                    penColor = e.target.dataset.color;
                    colorPalette.querySelector('.active-color').classList.remove('active-color');
                    e.target.classList.add('active-color');
                }
            });

            // Canvas drawing listeners
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseout', stopDrawing);

            // Window resize listener
            window.addEventListener('resize', resizeCanvas);
            
            // --- Initial Calls ---
            resizeCanvas(); // Set initial canvas size
            showSlide(currentSlide); // Show the first slide
        });
