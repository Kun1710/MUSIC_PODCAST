// import { SONG_LIST } from './song.js';

export class AudioManager {
    constructor(songList) {
        this.songList = songList;
        this.currentIndex = 0;
        this.ac = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.ac.createAnalyser();
        this.gainNode = this.ac.createGain();
        this.source = null;
        this.buffer = null;
        this.isPlaying = false;
        this.onSongChange = null;
        this.isRepeat = false;
        this.isShuffle = false;
        this.shuffleOrder = [];
        this.startTime = 0;
        this.pauseTime = 0;
        this.loading = false;
        this.started = false;
        this.isChangingSong = false;
        this.isSeeking = false;

        // Connect nodes
        this.analyser.connect(this.gainNode);
        this.gainNode.connect(this.ac.destination);
    }

    async init() {
        this.loadSong(this.currentIndex);
    }

    loadSong(index) {
        // Reset timer khi đổi bài
        this.startTime = 0;
        this.pauseTime = 0;
        this.started = false;
        this.isChangingSong = true;

        this.currentIndex = index;
        const song = this.songList[this.currentIndex];
        this.loading = true;

        // Tải file nhạc bằng XMLHttpRequest
        const xhr = new XMLHttpRequest();
        xhr.open('GET', song.url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 0) {
                this.processAudioBuffer(xhr.response);
                if (this.onSongChange) this.onSongChange(song);
            } else {
                console.error('Error loading audio file');
                this.loading = false;
            }
        };
        xhr.onerror = () => {
            console.error('Error loading audio file');
            this.loading = false;
        };
        xhr.send();
    }

    processAudioBuffer(arrayBuffer) {
        try {
            // Cleanup old source
            if (this.source) {
                this.source.stop();
                this.source.disconnect();
                this.source = null;
            }

            this.ac.decodeAudioData(arrayBuffer, buffer => {
                this.buffer = buffer;
                this.loading = false;
                this.isChangingSong = false;
                if (this.isPlaying) {
                    this.play();
                }
            }, error => {
                console.error('Error decoding audio:', error);
                this.loading = false;
                this.isChangingSong = false;
            });
        } catch (error) {
            console.error('Error processing audio buffer:', error);
            this.loading = false;
            this.isChangingSong = false;
        }
    }

    play() {
        if (this.loading || !this.buffer || this.isChangingSong) return;

        if (this.ac.state === 'suspended') {
            this.ac.resume();
        }

        // Cleanup old source before creating new one
        if (this.source) {
            this.source.stop();
            this.source.disconnect();
            this.source = null;
        }

        // Create new source
        this.source = this.ac.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.connect(this.analyser);

        // Set start time
        if (this.started) {
            this.startTime = this.ac.currentTime - this.pauseTime;
        } else {
            this.startTime = this.ac.currentTime;
            this.started = true;
        }

        // Start playback
        this.source.start(0, this.pauseTime);
        this.isPlaying = true;

        // Handle end of playback
        this.source.onended = () => {
            // Nếu đang seek thì không chuyển bài
            if (this.isSeeking) {
                this.isSeeking = false;
                return;
            }
            // Chỉ tự động chuyển bài khi không đang trong quá trình chuyển bài
            if (this.isPlaying && !this.isChangingSong) {
                if (this.isRepeat) {
                    this.seek(0);
                    this.play();
                } else {
                    this.next();
                }
            }
        };
    }

    pause() {
        if (!this.isPlaying) return;

        // Save current position
        this.pauseTime = this.ac.currentTime - this.startTime;

        // Stop current playback
        if (this.source) {
            this.source.stop();
            this.source.disconnect();
            this.source = null;
        }

        this.isPlaying = false;
    }

    seek(time) {
        if (!this.buffer) return;

        this.pauseTime = time;
        if (this.isPlaying) {
            // Stop current playback
            if (this.source) {
                this.isSeeking = true; // Đánh dấu đang seek
                this.source.stop();
                this.source.disconnect();
                this.source = null;
            }
            // Start new playback from new position
            this.play();
        }
    }

    setVolume(vol) {
        this.gainNode.gain.value = vol;
    }

    mute() {
        this.gainNode.gain.value = 0;
    }

    unmute() {
        this.gainNode.gain.value = 1;
    }

    getCurrentTime() {
        if (!this.started) return 0;
        return this.isPlaying ?
            this.ac.currentTime - this.startTime :
            this.pauseTime;
    }

    getDuration() {
        return this.buffer ? this.buffer.duration : 0;
    }

    getCurrentSong() {
        return this.songList[this.currentIndex];
    }

    next() {
        if (this.isChangingSong) return;

        if (this.isShuffle) {
            if (!this.shuffleOrder.length) this.generateShuffleOrder();
            let idx = this.shuffleOrder.indexOf(this.currentIndex);
            idx = (idx + 1) % this.shuffleOrder.length;
            this.currentIndex = this.shuffleOrder[idx];
        } else {
            this.currentIndex = (this.currentIndex + 1) % this.songList.length;
        }
        this.loadSong(this.currentIndex);
    }

    prev() {
        if (this.isChangingSong) return;

        if (this.isShuffle) {
            if (!this.shuffleOrder.length) this.generateShuffleOrder();
            let idx = this.shuffleOrder.indexOf(this.currentIndex);
            idx = (idx - 1 + this.shuffleOrder.length) % this.shuffleOrder.length;
            this.currentIndex = this.shuffleOrder[idx];
        } else {
            this.currentIndex = (this.currentIndex - 1 + this.songList.length) % this.songList.length;
        }
        this.loadSong(this.currentIndex);
    }

    setRepeat(isRepeat) {
        this.isRepeat = isRepeat;
    }

    setShuffle(isShuffle) {
        this.isShuffle = isShuffle;
        if (isShuffle) {
            this.generateShuffleOrder();
        } else {
            this.shuffleOrder = [];
        }
    }

    generateShuffleOrder() {
        const order = Array.from(this.songList.keys ? this.songList.keys() : [...Array(this.songList.length).keys()]);
        // Fisher-Yates shuffle
        for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [order[i], order[j]] = [order[j], order[i]];
        }
        this.shuffleOrder = order;
        // Đảm bảo bài hiện tại là bài đầu tiên trong shuffle
        const idx = this.shuffleOrder.indexOf(this.currentIndex);
        if (idx > 0) {
            [this.shuffleOrder[0], this.shuffleOrder[idx]] = [this.shuffleOrder[idx], this.shuffleOrder[0]];
        }
    }
}

// async function testAudioManager(audioManager) {
//     console.log('Bắt đầu test AudioManager...');

//     // Test phát nhạc
//     await audioManager.play();
//     console.log('Đã phát nhạc:', audioManager.getCurrentSong().title);

//     // Test tạm dừng sau 2 giây
//     setTimeout(() => {
//         audioManager.pause();
//         console.log('Đã tạm dừng nhạc');
//     }, 2000);

//     // Test chuyển bài tiếp theo sau 4 giây
//     setTimeout(() => {
//         audioManager.next();
//         audioManager.play();
//         console.log('Chuyển sang bài tiếp theo:', audioManager.getCurrentSong().title);
//     }, 4000);

//     // Test quay lại bài trước sau 6 giây
//     setTimeout(() => {
//         audioManager.prev();
//         audioManager.play();
//         console.log('Quay lại bài trước:', audioManager.getCurrentSong().title);
//     }, 6000);

//     // Test repeat sau 8 giây
//     setTimeout(() => {
//         audioManager.setRepeat(true);
//         console.log('Bật repeat');
//     }, 8000);

//     // Test shuffle sau 10 giây
//     setTimeout(() => {
//         audioManager.setShuffle(true);
//         audioManager.next();
//         audioManager.play();
//         console.log('Bật shuffle và chuyển bài:', audioManager.getCurrentSong().title);
//     }, 10000);

//     // Test điều chỉnh âm lượng sau 12 giây
//     setTimeout(() => {
//         audioManager.setVolume(0.2);
//         console.log('Giảm âm lượng xuống 20%');
//     }, 12000);

//     // Test mute sau 14 giây
//     setTimeout(() => {
//         audioManager.mute();
//         console.log('Mute âm thanh');
//     }, 14000);

//     // Test unmute sau 16 giây
//     setTimeout(() => {
//         audioManager.unmute();
//         console.log('Unmute âm thanh');
//     }, 16000);
// }

// // Gọi hàm test sau khi trang đã load và audioManager đã khởi tạo
// testAudioManager(audioManager);
