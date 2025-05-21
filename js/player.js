import { AudioManager } from './audio.js';
import { AudioVisual } from './visualizer.js';
import { ControlsManager } from './controls.js';
import { LyricsManager } from './lyrics.js';
import { SONG_LIST } from './song.js';

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const playlistName = getQueryParam('playlist');
const songId = getQueryParam('song');
let songList = [];
let startIndex = 0;

if (playlistName) {
    // Trường hợp phát theo playlist
    const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
    const playlist = playlists.find(p => p.name === playlistName);
    if (playlist) {
        songList = playlist.songs;
    } else {
        alert('Không tìm thấy playlist!');
        songList = SONG_LIST;
    }
} else {
    // Trường hợp phát 1 bài từ modal selection-music-playon
    songList = SONG_LIST;
}

if (songId && songList.length > 0) {
    const idx = songList.findIndex(song => String(song.id) === String(songId));
    if (idx !== -1) startIndex = idx;
}
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Khởi tạo các thành phần
    const audioManager = new AudioManager(songList);
    audioManager.currentIndex = startIndex;
    await audioManager.init();

    const visualizer = new AudioVisual('#music-canvas');
    if (visualizer) {
        visualizer.setAnalyser(audioManager.analyser);
        console.log('Visualizer initialized');
    }

    const controlsManager = new ControlsManager(audioManager);
    audioManager.setRepeat(controlsManager.isRepeat);
    audioManager.setShuffle(controlsManager.isShuffle);

    // LyricsManager sẽ được khởi tạo lại mỗi khi đổi bài
    let lyricsManager = null;
    let lastUpdateTime = 0;
    const UPDATE_INTERVAL = 50; // Cập nhật UI mỗi 50ms

    // 2. Hàm cập nhật thông tin bài hát lên UI
    function updateSongInfo(song) {
        document.getElementById('song-name').textContent = song.title;
        document.getElementById('song-artist').textContent = song.artist;
        document.getElementById('info-cover').style.backgroundImage = `url('${song.cover}')`;
    }

    // 3. Hàm cập nhật thời gian và progress
    function updateTimeAndProgress() {
        const now = performance.now();
        if (now - lastUpdateTime < UPDATE_INTERVAL) return;
        lastUpdateTime = now;

        const current = audioManager.getCurrentTime();
        const duration = audioManager.getDuration() || 1;
        const minute = Math.floor(current / 60).toString().padStart(2, '0');
        const second = Math.floor(current % 60).toString().padStart(2, '0');

        requestAnimationFrame(() => {
            document.getElementById('time-minute').textContent = minute;
            document.getElementById('time-second').textContent = second;

            const percent = Math.min(current / duration, 1) * 100;
            document.querySelector('.progress-current').style.width = percent + '%';
            document.querySelector('.progress-handle').style.left = percent + '%';
        });
    }

    // 4. Sự kiện khi đổi bài hát
    async function onSongChange(song) {
        updateSongInfo(song);

        // Lyrics
        if (lyricsManager) {
            lyricsManager.stop();
            lyricsManager = null;
        }
        lyricsManager = new LyricsManager(audioManager, song.lrc);
        await lyricsManager.loadLRC();
        lyricsManager.start();

        // Visualizer
        if (audioManager.isPlaying) visualizer.start();
        else visualizer.stop();
    }

    // 5. Sự kiện play/pause để đồng bộ visualizer và lyrics
    function onPlay() {
        requestAnimationFrame(() => {
            if (visualizer) visualizer.start();
            if (lyricsManager) lyricsManager.start();
            controlsManager.isPlaying = true;
            controlsManager.updatePlayIcon();
        });
    }

    function onPause() {
        requestAnimationFrame(() => {
            if (visualizer) visualizer.stop();
            if (lyricsManager) lyricsManager.pause();
            controlsManager.isPlaying = false;
            controlsManager.updatePlayIcon();
        });
    }

    // 6. Sự kiện đổi bài
    audioManager.onSongChange = onSongChange;
    onSongChange(audioManager.getCurrentSong());

    // 7. Cập nhật thời gian và progress liên tục
    function updateLoop() {
        updateTimeAndProgress();
        requestAnimationFrame(updateLoop);
    }
    updateLoop();

    // 8. Xử lý tua nhạc khi click progress bar
    const progressBar = document.getElementById('music-progress');
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const seekTime = percent * (audioManager.getDuration() || 1);
        audioManager.seek(seekTime);
        updateTimeAndProgress();
    });

    // 9. Đồng bộ volume slider với audio
    const volumeSlider = document.getElementById('volumeSlider');
    volumeSlider.value = 100;
    let volumeUpdateTimeout;
    volumeSlider.addEventListener('input', (e) => {
        const vol = e.target.value / 100;
        clearTimeout(volumeUpdateTimeout);
        volumeUpdateTimeout = setTimeout(() => {
            audioManager.setVolume(vol);
            controlsManager.updateVolumeIcon(vol);
            controlsManager.lastVolume = vol;
        }, 50);
    });

    // 10. Khi đổi repeat/shuffle từ controls, đồng bộ logic
    controlsManager.repeatBtn.addEventListener('click', () => {
        audioManager.setRepeat(controlsManager.isRepeat);
    });
    controlsManager.shuffleBtn.addEventListener('click', () => {
        audioManager.setShuffle(controlsManager.isShuffle);
    });

    // 11. Kết nối sự kiện play/pause từ controls
    const infoWidget = document.querySelector('.info-widget');
    const lyricsContainer = document.querySelector('.lyrics-container');
    controlsManager.playBtn.addEventListener('click', () => {
        if (audioManager.isPlaying) {
            audioManager.pause();
            onPause();
            infoWidget.classList.remove('playing');
            lyricsContainer.classList.remove('downing');
        } else {
            audioManager.play();
            onPlay();
            infoWidget.classList.add('playing');
            lyricsContainer.classList.add('downing');
        }
    });

    // 12. Để test trên console nếu cần
    window.audioManager = audioManager;
    window.visualizer = visualizer;
    window.controlsManager = controlsManager;
    window.lyricsManager = () => lyricsManager;
});

