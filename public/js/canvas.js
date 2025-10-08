/**
 * Canvas Drawing Controller for Draw It Or Lose It
 * Handles HTML5 Canvas drawing functionality with real-time features
 */

class CanvasController {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.currentColor = '#000000';
        this.brushSize = 3;
        this.drawingHistory = [];
        this.historyIndex = -1;
        this.lastPoint = null;
        
        this.initializeCanvas();
        this.bindCanvasEvents();
    }

    /**
     * Initialize the canvas and context
     */
    initializeCanvas() {
        this.canvas = document.getElementById('drawingCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.bindColorEvents();
        this.bindBrushEvents();
        this.bindActionEvents();
    }

    /**
     * Setup canvas properties
     */
    setupCanvas() {
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Set default drawing properties
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        
        // Set white background
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save initial state
        this.saveState();
    }

    /**
     * Bind canvas drawing events
     */
    bindCanvasEvents() {
        if (!this.canvas) return;

        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.startDrawing(e));
        this.canvas.addEventListener('touchmove', (e) => this.draw(e));
        this.canvas.addEventListener('touchend', () => this.stopDrawing());

        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /**
     * Bind color palette events
     */
    bindColorEvents() {
        const colorButtons = document.querySelectorAll('.color-btn');
        colorButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setColor(e.target.dataset.color);
                
                // Update active state
                colorButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    /**
     * Bind brush size events
     */
    bindBrushEvents() {
        const brushSizeSlider = document.getElementById('brushSize');
        const brushSizeValue = document.getElementById('brushSizeValue');
        
        if (brushSizeSlider && brushSizeValue) {
            brushSizeSlider.addEventListener('input', (e) => {
                this.setBrushSize(parseInt(e.target.value));
                brushSizeValue.textContent = e.target.value;
            });
        }
    }

    /**
     * Bind action button events
     */
    bindActionEvents() {
        // Clear canvas
        const clearBtn = document.getElementById('clearCanvas');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCanvas());
        }

        // Undo last action
        const undoBtn = document.getElementById('undoLast');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undoLast());
        }
    }

    /**
     * Start drawing
     */
    startDrawing(e) {
        e.preventDefault();
        this.isDrawing = true;
        
        const point = this.getEventPoint(e);
        this.lastPoint = point;
        
        // Start new path
        this.ctx.beginPath();
        this.ctx.moveTo(point.x, point.y);
        
        // Save state for undo functionality
        this.saveState();
    }

    /**
     * Draw on canvas
     */
    draw(e) {
        if (!this.isDrawing) return;
        
        e.preventDefault();
        const point = this.getEventPoint(e);
        
        // Draw line from last point to current point
        this.ctx.lineTo(point.x, point.y);
        this.ctx.stroke();
        
        this.lastPoint = point;
    }

    /**
     * Stop drawing
     */
    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.lastPoint = null;
        }
    }

    /**
     * Get point coordinates from mouse or touch event
     */
    getEventPoint(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        let clientX, clientY;
        
        if (e.touches && e.touches.length > 0) {
            // Touch event
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            // Mouse event
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    /**
     * Set drawing color
     */
    setColor(color) {
        this.currentColor = color;
        this.ctx.strokeStyle = color;
    }

    /**
     * Set brush size
     */
    setBrushSize(size) {
        this.brushSize = size;
        this.ctx.lineWidth = size;
    }

    /**
     * Clear the entire canvas
     */
    clearCanvas() {
        if (confirm('Are you sure you want to clear the canvas?')) {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.saveState();
        }
    }

    /**
     * Undo the last drawing action
     */
    undoLast() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState();
        }
    }

    /**
     * Save current canvas state for undo functionality
     */
    saveState() {
        this.historyIndex++;
        
        // Remove any states after current index
        if (this.historyIndex < this.drawingHistory.length) {
            this.drawingHistory.length = this.historyIndex;
        }
        
        // Save current state
        this.drawingHistory[this.historyIndex] = this.canvas.toDataURL();
        
        // Limit history size to prevent memory issues
        if (this.drawingHistory.length > 20) {
            this.drawingHistory.shift();
            this.historyIndex--;
        }
    }

    /**
     * Restore canvas state from history
     */
    restoreState() {
        if (this.historyIndex >= 0 && this.historyIndex < this.drawingHistory.length) {
            const img = new Image();
            img.onload = () => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(img, 0, 0);
            };
            img.src = this.drawingHistory[this.historyIndex];
        }
    }

    /**
     * Get canvas data as image
     */
    getCanvasData() {
        return this.canvas.toDataURL('image/png');
    }

    /**
     * Load image data onto canvas
     */
    loadCanvasData(dataUrl) {
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
            this.saveState();
        };
        img.src = dataUrl;
    }

    /**
     * Export canvas as downloadable image
     */
    exportCanvas() {
        const link = document.createElement('a');
        link.download = `drawing-${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }

    /**
     * Resize canvas to fit container
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        if (!container) return;

        const containerWidth = container.clientWidth;
        const aspectRatio = 800 / 600;
        
        let newWidth = containerWidth - 40; // Account for padding
        let newHeight = newWidth / aspectRatio;
        
        // Limit height
        if (newHeight > 500) {
            newHeight = 500;
            newWidth = newHeight * aspectRatio;
        }

        this.canvas.style.width = newWidth + 'px';
        this.canvas.style.height = newHeight + 'px';
    }

    /**
     * Enable/disable drawing
     */
    setDrawingEnabled(enabled) {
        this.canvas.style.cursor = enabled ? 'crosshair' : 'not-allowed';
        this.canvas.style.opacity = enabled ? '1' : '0.5';
    }

    /**
     * Get drawing statistics
     */
    getDrawingStats() {
        return {
            historyLength: this.drawingHistory.length,
            currentIndex: this.historyIndex,
            canUndo: this.historyIndex > 0,
            brushSize: this.brushSize,
            currentColor: this.currentColor
        };
    }

    /**
     * Reset canvas to initial state
     */
    reset() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawingHistory = [];
        this.historyIndex = -1;
        this.saveState();
    }
}

// Initialize canvas controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.canvasController = new CanvasController();
    console.log('Canvas Controller initialized');
});
