class Captcha {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.options = {
            length: 6,
            width: 200,
            height: 60,
            font: 'bold 30px Arial',
            ...options
        };

        this.captchaText = '';
        this.isVerified = false;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="captcha-container">
                <div class="captcha-display">
                    <div class="captcha-canvas-wrapper">
                        <canvas id="captcha-canvas" width="${this.options.width}" height="${this.options.height}"></canvas>
                    </div>
                    <button type="button" class="captcha-refresh-btn" id="captcha-refresh" title="Refresh Captcha">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                    </button>
                </div>
                <div class="captcha-input-group">
                    <label for="captcha-input">Enter the code above</label>
                    <input type="text" id="captcha-input" placeholder="Type here..." required autocomplete="off">
                </div>
                <div id="captcha-status" class="captcha-status"></div>
            </div>
        `;

        this.canvas = document.getElementById('captcha-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.refreshBtn = document.getElementById('captcha-refresh');
        this.input = document.getElementById('captcha-input');
        this.status = document.getElementById('captcha-status');

        this.refreshBtn.addEventListener('click', () => this.generate());
        this.input.addEventListener('input', () => {
            this.status.style.display = 'none';
            this.isVerified = false;
        });

        this.generate();
    }

    generate() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'; // Avoid ambiguous chars
        this.captchaText = '';
        for (let i = 0; i < this.options.length; i++) {
            this.captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        this.draw();
        this.input.value = '';
        this.isVerified = false;
        this.status.style.display = 'none';
    }

    draw() {
        const { width, height } = this.options;
        const ctx = this.ctx;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw background noise
        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255}, 0.5)`;
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, Math.random() * height);
            ctx.lineTo(Math.random() * width, Math.random() * height);
            ctx.stroke();
        }

        for (let i = 0; i < 30; i++) {
            ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255}, 0.3)`;
            ctx.beginPath();
            ctx.arc(Math.random() * width, Math.random() * height, 1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw text
        ctx.font = this.options.font;
        ctx.textBaseline = 'middle';

        const space = width / (this.options.length + 1);
        for (let i = 0; i < this.captchaText.length; i++) {
            const char = this.captchaText[i];
            const x = space * (i + 1);
            const y = height / 2 + (Math.random() * 10 - 5);

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((Math.random() * 30 - 15) * Math.PI / 180);

            ctx.fillStyle = `rgb(${Math.random() * 100},${Math.random() * 100},${Math.random() * 100})`;
            ctx.fillText(char, -10, 0);
            ctx.restore();
        }
    }

    validate() {
        const userInput = this.input.value.trim();
        if (userInput.toLowerCase() === this.captchaText.toLowerCase()) {
            this.isVerified = true;
            this.status.textContent = 'Captcha verified!';
            this.status.className = 'captcha-status success';
            this.status.style.display = 'block';
            return true;
        } else {
            this.isVerified = false;
            this.status.textContent = 'Invalid captcha. Please try again.';
            this.status.className = 'captcha-status error';
            this.status.style.display = 'block';
            this.generate();
            return false;
        }
    }
}
