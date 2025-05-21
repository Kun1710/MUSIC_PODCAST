export class LyricsManager {
    constructor(audioManager, lrcPath) {
        this.audioManager = audioManager;
        this.lrcPath = lrcPath;
        this.lyrics = [];
        this.currentIndex = 0;
        this.animationId = null;
        this.isPlaying = false;
        this.lastUpdateTime = 0;
        this.updateInterval = 50;
        this.lyricsCache = {}; 
    }

    async loadLRC() {
        try {
            // Kiểm tra cache
            if (this.lyricsCache[this.lrcPath]) {
                this.lyrics = this.lyricsCache[this.lrcPath];
                this.renderAllLyrics();
                return;
            }

            const response = await fetch(this.lrcPath);
            const text = await response.text();
            this.parseLRC(text);
            this.lyricsCache[this.lrcPath] = this.lyrics;
            this.renderAllLyrics();
        } catch (error) {
            console.error('Error loading LRC file:', error);
        }
    }

    parseLRC(text) {
        this.lyrics = [];
        const lines = text.split('\n');
        const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

        lines.forEach(line => {
            const matches = [...line.matchAll(timeRegex)];
            if (matches.length > 0) {
                const text = line.replace(timeRegex, '').trim();
                if (text) {
                    matches.forEach(match => {
                        const [, min, sec, ms] = match;
                        const time = parseInt(min) * 60 + parseInt(sec) + parseInt(ms) / 1000;
                        this.lyrics.push({ time, text });
                    });
                }
            }
        });
        this.lyrics.sort((a, b) => a.time - b.time);
    }

    renderAllLyrics() {
        const container = document.querySelector('.lyrics-content');
        if (!container) return;
        container.innerHTML = '';
        this.lyrics.forEach((item, idx) => {
            const p = document.createElement('p');
            p.dataset.time = item.time;
            p.dataset.index = idx;
            p.textContent = item.text;
            container.appendChild(p);
        });
        this.updateLyricsDisplay();
    }

    start() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.update();
    }

    pause() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    stop() {
        this.pause();
        this.currentIndex = 0;
        this.updateLyricsDisplay();
    }

    update() {
        if (!this.isPlaying) return;
        const now = performance.now();
        if (now - this.lastUpdateTime < this.updateInterval) {
            this.animationId = requestAnimationFrame(() => this.update());
            return;
        }
        this.lastUpdateTime = now;
        const currentTime = this.audioManager.getCurrentTime();
        let newIndex = this.currentIndex;

        // Tìm lyric hiện tại
        while (newIndex < this.lyrics.length - 1 &&
            this.lyrics[newIndex + 1].time <= currentTime) {
            newIndex++;
        }
        // Nếu tua lùi
        while (newIndex > 0 && this.lyrics[newIndex].time > currentTime) {
            newIndex--;
        }

        if (newIndex !== this.currentIndex) {
            this.currentIndex = newIndex;
            this.updateLyricsDisplay();
        }
        this.animationId = requestAnimationFrame(() => this.update());
    }

    updateLyricsDisplay() {
        const container = document.querySelector('.lyrics-content');
        if (!container) return;
        const lrcElements = container.querySelectorAll('p');

        // Xóa tất cả class
        lrcElements.forEach(el => {
            el.classList.remove('current', 'previous', 'next');
        });

        // Gán class cho 3 dòng: trước, hiện tại, sau
        const idxs = [this.currentIndex - 1, this.currentIndex, this.currentIndex + 1];
        idxs.forEach((idx, i) => {
            if (idx >= 0 && idx < this.lyrics.length) {
                const el = container.querySelector(`p[data-index="${idx}"]`);
                if (el) {
                    if (i === 1) el.classList.add('current');
                    else if (i === 0) el.classList.add('previous');
                    else if (i === 2) el.classList.add('next');
                }
            }
        });

        // Đổi màu ngẫu nhiên cho dòng current
        const currentEl = container.querySelector('p.current');
        if (currentEl) {
            const hue = Math.floor(Math.random() * 360);
            currentEl.style.color = `hsl(${hue}, 80%, 60%)`;
        }
        container.querySelectorAll('p:not(.current)').forEach(el => {
            el.style.color = '';
        });

        if (currentEl) {
            const box = container.parentElement;
            const scrollY = currentEl.offsetTop - (box.offsetHeight / 2) + (currentEl.offsetHeight / 2);
            container.style.transform = `translateY(-${scrollY}px)`;
        }
    }
}
