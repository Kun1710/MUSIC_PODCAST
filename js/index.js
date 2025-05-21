import { SONG_LIST } from './song.js';
// import { initSnowflakes } from './snowflakes.js';
// initSnowflakes();
// ----------------- Hiệu ứng snowflakes -----------------
// const snowflakes = document.querySelectorAll('.snowflake');

//   snowflakes.forEach(flake => {
//     // Gán vị trí và random animation
//     flake.style.left = Math.random() * 100 + '%';
//     flake.style.fontSize = (10 + Math.random() * 20) + 'px';
//     flake.style.animationDuration = (6 + Math.random() * 6) + 's';
//     flake.style.animationDelay = (Math.random() * 5) + 's';

//     // Khi click, cho tan ra
//     flake.addEventListener('click', function () {
//       flake.classList.add('melt');

//       // Sau khi tan xong thì remove khỏi DOM
//       setTimeout(() => {
//         flake.remove();
//       }, 1000);
//     });
// });


// ----------------- Hiệu ứng chuột -----------------
const cursor = document.querySelector('.cursor');
let lastTreble = 0;

document.addEventListener('mousemove', (e) => {
  cursor.style.left = `${e.pageX}px`;
  cursor.style.top = `${e.pageY}px`;

  const currentTime = Date.now();
  if (currentTime - lastTreble > 100) {
    const treble = document.createElement('div');
    treble.className = 'treble-clef';
    treble.style.left = `${e.pageX}px`;
    treble.style.top = `${e.pageY}px`;
    document.body.appendChild(treble);
    setTimeout(() => treble.remove(), 2000);
    lastTreble = currentTime;
  }
});

document.addEventListener('mousedown', () => {
  cursor.style.width = '30px';
  cursor.style.height = '30px';
});

document.addEventListener('mouseup', () => {
  cursor.style.width = '20px';
  cursor.style.height = '20px';
});

const hoverZone = document.querySelector('.hover-zone');
const header = document.querySelector('.hidden-header');
const overlay = document.querySelector('.page-overlay');

let timer;

function showHeader() {
  clearTimeout(timer);
  header.classList.add('show');
  overlay.classList.add('active');
}

function hideHeader() {
  timer = setTimeout(() => {
    header.classList.remove('show');
    overlay.classList.remove('active');
  }, 500);
}

hoverZone.addEventListener('mouseenter', showHeader);
hoverZone.addEventListener('mouseleave', hideHeader);
header.addEventListener('mouseenter', showHeader);
header.addEventListener('mouseleave', hideHeader);

overlay.addEventListener('click', () => {
  header.classList.remove('show');
  overlay.classList.remove('active');
});
// ----------------- Hiệu ứng chữ -----------------
const title = document.querySelector('.animated-title');
const text = title.textContent.trim();
title.innerHTML = [...text].map((char, i) => {
  if (char === ' ') {
    return `<span class="spacer">&nbsp;</span>`;
  }
  return `<span style="animation-delay:${i * 0.1}s">${char}</span>`;
}).join('');

// ----------------- Xử lý modal -----------------

// Mở modal tạo playlist

const addPlayListBtn = document.getElementById('add-play-list-btn');
addPlayListBtn.addEventListener('click', open_add_play_list);
function open_add_play_list() {
  const modal = document.getElementById('add-play-list');
  document.getElementById('playlist-name').value = '';
  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('show'), 10);
}

// Chọn bài hát để phát

const musicLink = document.getElementById('music-link');
musicLink.addEventListener('click', (e) => {
  e.preventDefault();
  const modal = document.getElementById('selection-music-playon');
  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('show'), 10);
  renderMusicSelectionList(); // Render danh sách nhạc khi mở modal
});

// Render danh sách nhạc cho modal selection
function renderMusicSelectionList(searchTerm = '') {
  const songListContainer = document.getElementById('song-list-container-playon');
  songListContainer.innerHTML = '';

  const filteredSongs = SONG_LIST.filter(song => {
    const searchLower = searchTerm.toLowerCase();
    return song.title.toLowerCase().includes(searchLower) ||
      song.artist.toLowerCase().includes(searchLower);
  });

  filteredSongs.forEach(song => {
    const songTemplate = document.getElementById('song-template-playon').content.cloneNode(true);
    const songTitle = songTemplate.querySelector('.song-title');
    const songArtist = songTemplate.querySelector('.song-artist');
    const playButton = songTemplate.querySelector('.playSong');

    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    if (song.duration) songTemplate.querySelector('.song-duration').textContent = song.duration;

    playButton.addEventListener('click', () => {
      window.location.href = `player.html?song=${encodeURIComponent(song.id)}`;
    });

    songListContainer.appendChild(songTemplate);
  });
}

// Xử lý tìm kiếm

const musicSearch = document.getElementById('music-search');
musicSearch.addEventListener('input', (e) => {
  renderMusicSelectionList(e.target.value);
});

// Đóng modal với tất cả nút .close-modal

document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = btn.closest('.modal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }
  });
});

// Đóng modal song selection khi ấn close

const closeSongSelectionModal = document.querySelector('.close-song-selection-modal'); // Nút đóng modal chọn bài

if (closeSongSelectionModal) {
  closeSongSelectionModal.addEventListener('click', () => {
    const modal = closeSongSelectionModal.closest('.modal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.style.display = 'none';

        // Sau khi đóng modal, reload lại danh sách playlist
        renderPlaylists();
      }, 100);
    }
  });
}

function showAlert(message, callback = null) {
  const alertBox = document.getElementById('customAlert');
  const messageEl = document.getElementById('alertMessage');
  const okBtn = document.getElementById('alertOkBtn');

  messageEl.textContent = message;
  alertBox.classList.remove('hidden');
  const newBtn = okBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(newBtn, okBtn);

  newBtn.addEventListener('click', () => {
    document.getElementById('customAlert').classList.add('hidden');
    if (typeof callback === 'function') {
      callback();
    }
  });
}

// ----------------Tạo playlist -----------------

const confirmCreateBtn = document.getElementById('confirm-create');
const playlistNameInput = document.getElementById('playlist-name');
const selectSongsModal = document.getElementById('song-selection-modal');

confirmCreateBtn.addEventListener('click', () => {
  const playlistName = playlistNameInput.value.trim();

  // Kiểm tra nếu tên playlist đã tồn tại
  if (!playlistName) {
    showAlert('Chưa nhập tên PlayList!');
    return;
  }

  // Lấy danh sách playlist từ localStorage
  let playlists = JSON.parse(localStorage.getItem('playlists')) || [];

  // Kiểm tra xem playlist với tên nhập vào đã tồn tại chưa
  const playlistExists = playlists.some(playlist => playlist.name === playlistName);

  if (playlistExists) {
    showAlert('Playlist đã tồn tại!');
    return;
  }

  const createModal = document.getElementById('add-play-list');
  createModal.classList.remove('show');
  setTimeout(() => {
    createModal.style.display = 'none';

    // Mở modal chọn bài hát
    if (selectSongsModal) {
      selectSongsModal.style.display = 'flex';
      setTimeout(() => selectSongsModal.classList.add('show'), 10);
      createPlayList(playlistName); // Tạo playlist
      renderSongList(playlistName); // Gọi hàm render danh sách bài hát
    }
  }, 300);
});
// ----------------- Render PlayList -----------------
function renderPlaylists() {
  const playlistsContainer = document.getElementById('playlist-container');
  playlistsContainer.innerHTML = ''; // Xóa nội dung cũ

  const playlists = JSON.parse(localStorage.getItem('playlists')) || [];

  const images = [
    '../assets/images/images1.jpg',
    '../assets/images/images2.jpg',
    '../assets/images/images3.jpg',
    '../assets/images/images4.jpg',
    '../assets/images/images5.jpg',
    '../assets/images/images6.jpg',
    '../assets/images/images7.jpg',
  ];

  playlists.forEach(playlist => {
    const template = document.getElementById('playlist-template').content.cloneNode(true);

    const nameList = template.querySelector('.name-list');
    nameList.textContent = playlist.name;

    const bgDiv = template.querySelector('.bg-image-list');
    const randomImage = images[Math.floor(Math.random() * images.length)];

    bgDiv.style.backgroundImage = `url(${randomImage})`;
    bgDiv.style.backgroundSize = 'cover';
    bgDiv.style.backgroundPosition = 'center';
    bgDiv.style.backgroundRepeat = 'no-repeat';

    const deleteBtn = template.querySelector('.deleteList');
    const infoBtn = template.querySelector('.infoList');

    // Thêm sự kiện cho nút xóa
    deleteBtn.addEventListener('click', () => {
      deletePlaylist(playlist.name); // <-- Truyền đúng tên
    });
    // Thêm sự kiện cho nút thông tin
    infoBtn.addEventListener('click', () => {
      open_info_list(playlist.name); // <-- Truyền đúng tên
    });
    playlistsContainer.appendChild(template);

    document.querySelectorAll('.name-list').forEach(nameList => {
      nameList.addEventListener('click', () => {
        const playlistName = nameList.textContent.trim();
        // Lấy playlist từ localStorage
        const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
        const playlist = playlists.find(p => p.name === playlistName);
        if (playlist && playlist.songs.length > 0) {
          // Lấy id bài hát đầu tiên trong playlist
          const firstSongId = playlist.songs[0].id;
          window.location.href = `player.html?playlist=${encodeURIComponent(playlistName)}&song=${encodeURIComponent(firstSongId)}`;
        } else {
          // Nếu playlist không có bài hát thì chỉ chuyển với tên playlist
          window.location.href = `player.html?playlist=${encodeURIComponent(playlistName)}`;
        }
      });
    });
  });
}
// Gọi hàm renderPlaylists khi trang được tải
document.addEventListener('DOMContentLoaded', renderPlaylists);

// ----------------- Render danh sách bài hát -----------------
function renderSongList(playlistName, searchTerm = '') {
  const songListContainer = document.getElementById('song-list-container');
  songListContainer.innerHTML = '';

  const storedPlaylists = JSON.parse(localStorage.getItem('playlists')) || [];
  const selectedPlaylistObj = storedPlaylists.find(p => p.name === playlistName);
  const selectedSongs = selectedPlaylistObj ? selectedPlaylistObj.songs : [];

  const filteredSongs = SONG_LIST.filter(song => {
    const notInPlaylist = !selectedSongs.some(addedSong => addedSong.title === song.title && addedSong.artist === song.artist);
    const matchSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase());
    return notInPlaylist && matchSearch;
  });

  filteredSongs.forEach(song => {
    const songTemplate = document.getElementById('song-template').content.cloneNode(true);
    songTemplate.querySelector('.song-title').textContent = song.title;
    songTemplate.querySelector('.song-artist').textContent = song.artist;
    if (song.duration) songTemplate.querySelector('.song-duration').textContent = song.duration;
    songTemplate.querySelector('.addSong').addEventListener('click', function () {
      addSongToPlaylist(playlistName, song);
      showAlert(`Đã thêm bài hát vào ${playlistName} thành công!`, () => {
        renderSongList(playlistName, searchTerm);
      });
    });
    songListContainer.appendChild(songTemplate);
  });
}
// CHECK 
// ------------------ Thông tin playlist ------------------
function open_info_list(playlistName) {
  const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
  const playlist = playlists.find(p => p.name === playlistName);
  if (!playlist) return;

  document.getElementById('name-playlist').textContent = playlist.name;

  const container = document.querySelector('.info-list-container');
  container.innerHTML = '';

  const template = document.getElementById('song-list-template');

  playlist.songs.forEach(song => {
    const songItem = template.content.cloneNode(true);
    songItem.querySelector('.song-title').textContent = song.title;
    songItem.querySelector('.song-artist').textContent = song.artist;
    if (song.duration) songItem.querySelector('.song-duration').textContent = song.duration;

    songItem.querySelector('.song-text').addEventListener('click', () => {
      window.location.href = `player.html?playlist=${encodeURIComponent(playlistName)}&song=${encodeURIComponent(song.id)}`;
    });
    // Gán sự kiện xóa, truyền object song đầy đủ
    songItem.querySelector('.deleteSong').addEventListener('click', () => {
      removeSongFromPlaylist(playlistName, song);
      open_info_list(playlistName);
    });

    container.appendChild(songItem);
  });

  const modal = document.getElementById('info-list-modal');
  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('show'), 10);

  const addSongBtn = document.querySelector('.addSongToPlayList');
  addSongBtn.addEventListener('click', () => {
    const infoModal = document.getElementById('info-list-modal');
    const selectSongsModal = document.getElementById('song-selection-modal');

    infoModal.classList.remove('show');
    setTimeout(() => {
      infoModal.style.display = 'none';

      // Sau khi ẩn xong mới hiện modal chọn bài
      if (selectSongsModal) {
        selectSongsModal.style.display = 'flex';
        setTimeout(() => selectSongsModal.classList.add('show'), 10);
        renderSongList(playlistName);
      }
    }, 300);
  });
}

// ------------------ Xóa playlist ------------------
function deletePlaylist(playlistName) {
  let playlists = JSON.parse(localStorage.getItem('playlists')) || [];

  // Lọc ra những playlist KHÁC tên cần xóa
  playlists = playlists.filter(playlist => playlist.name !== playlistName);

  // Ghi lại vào localStorage
  localStorage.setItem('playlists', JSON.stringify(playlists));

  showAlert('Đã xóa playlist thành công!', () => {
    renderPlaylists();
  });
}

function createPlayList(playlistName) {
  const playlist = {
    name: playlistName,
    songs: []
  };
  // Lưu playlist vào localStorage
  let playlists = JSON.parse(localStorage.getItem('playlists')) || [];
  playlists.push(playlist);
  localStorage.setItem('playlists', JSON.stringify(playlists));
}
// ----------------- xóa bài hát trong playlist -----------------
function removeSongFromPlaylist(playlistName, song) {
  // Lấy danh sách playlist từ localStorage
  let playlists = JSON.parse(localStorage.getItem('playlists')) || [];

  // Tìm playlist theo tên
  const playlist = playlists.find(p => p.name === playlistName);

  // Nếu tìm thấy playlist
  if (playlist) {
    // Lọc bài hát muốn xóa dựa trên id (so sánh dưới dạng string)
    playlist.songs = playlist.songs.filter(item => String(item.id) !== String(song.id));

    // Cập nhật lại danh sách playlist vào localStorage
    localStorage.setItem('playlists', JSON.stringify(playlists));

    // Hiển thị thông báo thành công
    showAlert(`Đã xóa bài hát "${song.title}" khỏi playlist "${playlistName}" thành công!`, () => {
      renderPlaylists();  // Gọi lại hàm renderPlaylists để cập nhật giao diện
    });
  } else {
    showAlert('Playlist không tồn tại!');
  }
}

// ----------------- Thêm bài hát vào playlist -----------------
function addSongToPlaylist(playlistName, song) {
  let playlists = JSON.parse(localStorage.getItem('playlists')) || [];

  const playlist = playlists.find(p => p.name === playlistName);

  if (playlist) {
    // Lưu đầy đủ thông tin bài hát
    const songInfo = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      url: song.url,
      cover: song.cover,
      lrc: song.lrc,
      duration: song.duration
    };
    playlist.songs.push(songInfo);
    localStorage.setItem('playlists', JSON.stringify(playlists));
    renderPlaylists(); // Cập nhật lại danh sách playlist
  }
}

// --- Tìm kiếm cho modal chọn bài hát ---
const searchSongSelection = document.getElementById('search-song-selection');
if (searchSongSelection) {
  searchSongSelection.addEventListener('input', (e) => {
    // Lấy tên playlist đang thao tác từ modal (có thể lưu vào biến toàn cục khi mở modal)
    const playlistName = window.currentPlaylistName || '';
    renderSongList(playlistName, e.target.value);
  });
}

// --- Tìm kiếm cho modal info playlist ---
const searchInfoList = document.getElementById('search-info-list');
if (searchInfoList) {
  searchInfoList.addEventListener('input', (e) => {
    const playlistName = document.getElementById('name-playlist').textContent;
    renderInfoList(playlistName, e.target.value);
  });
}

// --- Hàm renderInfoList (cho modal info playlist) ---
function renderInfoList(playlistName, searchTerm = '') {
  const container = document.getElementById('info-list-container');
  container.innerHTML = '';

  const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
  const playlist = playlists.find(p => p.name === playlistName);
  if (!playlist) return;

  const filteredSongs = playlist.songs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const template = document.getElementById('song-list-template');
  filteredSongs.forEach(song => {
    const songItem = template.content.cloneNode(true);
    songItem.querySelector('.song-title').textContent = song.title;
    songItem.querySelector('.song-artist').textContent = song.artist;
    if (song.duration) songItem.querySelector('.song-duration').textContent = song.duration;

    // Thêm sự kiện click cho nút xóa
    songItem.querySelector('.deleteSong').addEventListener('click', () => {
      removeSongFromPlaylist(playlistName, song);
      renderInfoList(playlistName, searchTerm);
    });
    
    songItem.querySelector('.song-text').addEventListener('click', () => {
      window.location.href = `player.html?playlist=${encodeURIComponent(playlistName)}&song=${encodeURIComponent(song.id)}`;
    });

    container.appendChild(songItem);
  });
}
