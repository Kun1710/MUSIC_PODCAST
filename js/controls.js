export class ControlsManager {
    constructor(audioManager) {
        this.audioManager = audioManager;
        // Lấy các nút điều khiển
        this.repeatBtn = document.getElementById('repeatBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.volumeBtn = document.getElementById('volumeBtn');
        this.playBtn = document.getElementById('playBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.progressBar = document.getElementById('music-progress');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.isRepeat = false;
        this.isShuffle = false;
        this.isPlaying = false;
        this.lastVolume = 1;
        this.volumeSliderHideTimeout = null;
        this.initVolumeControl();
        this.bindEvents();
    }

    bindEvents() {
        // Repeat
        this.repeatBtn.addEventListener('click', () => {
            this.isRepeat = !this.isRepeat;
            this.audioManager.setRepeat(this.isRepeat);
            this.updateRepeatIcon();
        });
        // Shuffle
        this.shuffleBtn.addEventListener('click', () => {
            this.isShuffle = !this.isShuffle;
            this.audioManager.setShuffle(this.isShuffle);
            this.updateShuffleIcon();
        });
        // Next
        this.nextBtn.addEventListener('click', () => {
            this.audioManager.next();
        });
        // Prev
        this.prevBtn.addEventListener('click', () => {
            this.audioManager.prev();
        });
    }

    // Volume control UI
    initVolumeControl() {
        const controlWidget = this.volumeBtn.closest('.control-widget');
        // Hiện volumeSlider khi hover vào volumeBtn
        this.volumeBtn.addEventListener('mouseenter', () => {
            this.showVolumeSlider();
            if (controlWidget) controlWidget.classList.add('expand-right');
        });
        this.volumeBtn.addEventListener('mouseleave', () => {
            this.hideVolumeSliderWithDelay();
            if (controlWidget) controlWidget.classList.remove('expand-right');
        });
        // Khi hover vào volumeSlider thì giữ hiệu ứng hiện các nút
        this.volumeSlider.addEventListener('mouseenter', () => {
            this.showVolumeSlider();
            if (controlWidget) controlWidget.classList.add('expand-right');
            // Hiện các nút như hover control-widget
            controlWidget.classList.add('hover');
        });
        this.volumeSlider.addEventListener('mouseleave', () => {
            this.hideVolumeSliderWithDelay();
            if (controlWidget) controlWidget.classList.remove('expand-right');
            controlWidget.classList.remove('hover');
        });
        this.volumeSlider.addEventListener('input', (e) => {
            const vol = e.target.value / 100;
            this.audioManager.setVolume(vol);
            this.updateVolumeIcon(vol);
            this.lastVolume = vol;
        });
        // Click vào icon để mute/unmute
        this.volumeBtn.addEventListener('click', (e) => {
            // Đừng mute nếu click vào slider
            if (e.target === this.volumeSlider) return;
            if (this.audioManager.audio.muted) {
                this.audioManager.unmute();
                this.updateVolumeIcon(this.lastVolume);
                this.volumeSlider.value = this.lastVolume * 100;
            } else {
                this.audioManager.mute();
                this.updateVolumeIcon(0);
                this.volumeSlider.value = 0;
            }
        });
    }

    showVolumeSlider() {
        clearTimeout(this.volumeSliderHideTimeout);
        this.volumeSlider.style.display = 'block';
    }

    hideVolumeSliderWithDelay() {
        clearTimeout(this.volumeSliderHideTimeout);
        this.volumeSliderHideTimeout = setTimeout(() => {
            this.volumeSlider.style.display = 'none';
        }, 200);
    }

    updatePlayIcon() {
        const icon = this.playBtn.querySelector('i');
        if (this.isPlaying) {
            icon.className = 'iconfont icon-pause';
        } else {
            icon.className = 'iconfont icon-playon';
        }
    }

    updateRepeatIcon() {
        const icon = this.repeatBtn.querySelector('i');
        if (this.isRepeat) {
            icon.style.color = '#7efff5';
        } else {
            icon.style.color = '';
        }
    }

    updateShuffleIcon() {
        const icon = this.shuffleBtn.querySelector('i');
        if (this.isShuffle) {
            icon.style.color = '#e46bff';
        } else {
            icon.style.color = '';
        }
    }

    updateVolumeIcon(vol) {
        const icon = this.volumeBtn.querySelector('i');
        if (vol === 0) {
            icon.className = 'iconfont icon-volume-4';
        } else if (vol < 0.2) {
            icon.className = 'iconfont icon-volume-0';
        } else if (vol < 0.5) {
            icon.className = 'iconfont icon-volume-1';
        } else if (vol < 0.75) {
            icon.className = 'iconfont icon-volume-2';
        } else {
            icon.className = 'iconfont icon-volume-3';
        }
    }
}
