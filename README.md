# MUSIC_PODCAST

Ứng dụng phát nhạcvà podcast có tạo playlist trên local với hiệu ứng âm thanh đẹp sử dụng Web Audio API và HTML5 Canvans

## Cách sử dụng

1. Thêm các bài hát vào `song.js` với `id`, `title`, `artist`, `cover`, `lrc`, `duration`
2. Đặt các file nhạc MP3 vào thư mục `song`
3. Đặt các file ảnh bìa vào thư mục `covers` (cover1.png, cover2.png, cover3.png)
4. Đặt các file ảnh vào thư mục `images`
5. Mở file `index.html` trong trình duyệt để sử dụng

## Cấu trúc thư mục

```
/
├── assets/        # File chứa tài nguyên
├── css/           # CSS
├── js/            # File JavaScript
├── index.html     # Trang HTML chính
└── player.html     # Trang phát nhạc
```

## Cấu hình

1. Ứng dụng mặc định sẽ tìm kiếm các file MP3 trong thư mục `song/`
2. Bạn có thể chỉnh sửa file `js/index.js` để thay đổi danh sách bài hát
3. Có thể chinh sửa tại file `js/player.js` vể phát nhạc
4. Các thiết lập hình ảnh có thể điều chỉnh bằng cách nhấn vào nút menu ở góc trên bên phải

## Lưu ý

- Trình duyệt có thể yêu cầu quyền truy cập file để phát nhạc
- Nên mở ứng dụng qua một máy chủ web local để đảm bảo tất cả tính năng hoạt động đúng
- Có thể sử dụng Live Server trong VS Code hoặc các máy chủ đơn giản khác

## Nguồn gốc

Dự án được phát triển bởi KUNT dựa trên í tưởng từ đồ án môn học và nguồn tham khảo tài liệu trên internet, tập trung vào việc tạo playlist cá nhân từ danh sách bài hát và phát nhạc local.
