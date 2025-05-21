export class AudioVisual {
    constructor(canvasSelector) {
        this.canvas = document.querySelector(canvasSelector);
        if (!this.canvas) {
            console.error('Canvas not found:', canvasSelector);
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.analyser = null;
        this.dataArray = null;
        this.animationId = null;
        this.isPlaying = false;
        this.colorChangeInterval = 2000; // Thay đổi màu mỗi 2 giây
        this.lastColorChange = 0;

        // Cấu hình visualizer
        this.opt = {
            barWidth: 3,
            barGap: 1,
            barCount: 128,
            maxHeight: 60,
            centerX: 0.5,
            centerY: 0.7,
            lineColor: '#ffffff',
            shadowBlur: 2,
            isRound: true
        };

        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Create initial gradient
        this.createGradient();
    }

    // Tạo màu ngẫu nhiên
    getRandomColor() {
        const hue = Math.random() * 360;
        return `hsl(${hue}, 70%, 60%)`;
    }

    // Tạo gradient với màu ngẫu nhiên
    createGradient() {
        const color1 = this.getRandomColor();
        const color2 = this.getRandomColor();
        const color3 = this.getRandomColor();

        this.gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        this.gradient.addColorStop(0, color1);
        this.gradient.addColorStop(0.5, color2);
        this.gradient.addColorStop(1, color3);
    }

    // Kiểm tra và cập nhật màu sắc
    updateColors() {
        const now = performance.now();
        if (now - this.lastColorChange > this.colorChangeInterval) {
            this.createGradient();
            this.lastColorChange = now;
        }
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.createGradient();
    }

    start() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.draw();
    }

    stop() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw() {
        if (!this.isPlaying || !this.analyser) {
            this.animationId = requestAnimationFrame(() => this.draw());
            return;
        }

        const { ctx, canvas, analyser, opt } = this;

        // Cập nhật màu sắc
        this.updateColors();

        // Lấy dữ liệu tần số
        const bufferLen = analyser.frequencyBinCount;
        const buffer = new Uint8Array(bufferLen);
        analyser.getByteFrequencyData(buffer);

        // Tính toán vị trí
        const cx = canvas.width * opt.centerX;
        const cy = canvas.height * opt.centerY;
        const sp = (opt.barWidth + opt.barGap) / 2;

        // Xóa canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Vẽ các đường
        ctx.beginPath();
        ctx.lineWidth = opt.barWidth;
        ctx.strokeStyle = this.gradient;
        ctx.shadowBlur = opt.shadowBlur;

        // Vẽ từng đường
        for (let i = 0; i < bufferLen; i++) {
            const h = (buffer[i] / 255) * opt.maxHeight;
            const xl = cx - i * (opt.barWidth + opt.barGap) - sp;
            const xr = cx + i * (opt.barWidth + opt.barGap) + sp;
            const y1 = cy - h / 2;
            const y2 = cy + h / 2;

            // Vẽ đường bên trái
            ctx.moveTo(xl, y1);
            ctx.lineTo(xl, y2);

            // Vẽ đường bên phải
            ctx.moveTo(xr, y1);
            ctx.lineTo(xr, y2);
        }

        ctx.stroke();
        this.animationId = requestAnimationFrame(() => this.draw());
    }

    setAnalyser(analyser) {
        console.log('Setting analyser:', analyser);
        this.analyser = analyser;
        if (this.analyser) {
            console.log('Analyser connected successfully');
            this.analyser.fftSize = 512;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        } else {
            console.error('No analyser provided');
        }
    }
}
