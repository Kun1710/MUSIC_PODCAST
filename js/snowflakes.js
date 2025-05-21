export function initSnowflakes() {
    const snowflakesContainer = document.querySelector('.snowflakes');
    // Giảm số lượng bông tuyết từ 30 xuống còn 15
    const totalSnowflakes = 15;
    const existingSnowflakes = document.querySelectorAll('.snow');
    
    // Thiết lập animation cho các bông tuyết có sẵn trong HTML
    existingSnowflakes.forEach((snowflake, index) => {
        setupSnowflake(snowflake, index);
    });
    
    // Tạo thêm bông tuyết nếu cần
    for (let i = existingSnowflakes.length; i < totalSnowflakes; i++) {
        createAdditionalSnowflake();
    }
    
    function setupSnowflake(snowflake, index) {
        // Thêm class kích thước ngẫu nhiên
        const sizes = ['small', 'medium', 'large'];
        const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
        snowflake.classList.add(randomSize);
        
        const startX = Math.random() * window.innerWidth;
        const startY = -50;
        // Thay đổi tốc độ rơi để tự nhiên hơn
        const duration = 8 + Math.random() * 12; // 8-20 giây
        const xDrift = (Math.random() - 0.5) * 150; // Độ lệch ngang tăng lên
        
        snowflake.style.left = `${startX}px`;
        snowflake.style.top = `${startY}px`;
        snowflake.style.animation = `snowfall ${duration}s linear infinite`;
        snowflake.style.setProperty('--x-drift', `${xDrift}px`);
        
        addSnowflakeInteractions(snowflake);
    }
    
    function createAdditionalSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.className = 'snow';
        
        const randomIconClass = `icon-snowflake-${Math.floor(Math.random() * 5) + 1}`;
        const icon = document.createElement('i');
        icon.className = `iconfont ${randomIconClass}`;
        snowflake.appendChild(icon);
        
        setupSnowflake(snowflake);
        snowflakesContainer.appendChild(snowflake);
    }
    
    function addSnowflakeInteractions(snowflake) {
        // Hiệu ứng khi hover
        snowflake.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.5) rotate(15deg)';
            this.style.filter = 
                'drop-shadow(0 0 12px rgba(255, 255, 255, 0.9))' +
                'drop-shadow(0 0 20px rgba(0, 50, 92, 0.7))' +
                'brightness(1.5)';
            this.style.opacity = '1';
            this.style.zIndex = '101';
            this.style.transition = 'all 0.2s ease';
        });
        
        snowflake.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.filter = '';
            this.style.opacity = '';
            this.style.zIndex = '';
            this.style.transition = 'all 0.4s ease';
        });
        
        // Hiệu ứng tan chảy khi click
        snowflake.addEventListener('click', function() {
            this.style.animation = 'none';
            this.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            this.style.transform = 'scale(0) rotate(45deg)';
            this.style.opacity = '0';
            this.style.filter = 'brightness(0.5)';
            
            setTimeout(() => {
                this.remove();
                createAdditionalSnowflake();
            }, 600);
        });
    }
    
    // Xử lý khi resize window
    const resizeHandler = function() {
        document.querySelectorAll('.snow').forEach(snowflake => {
            const startX = Math.random() * window.innerWidth;
            snowflake.style.left = `${startX}px`;
        });
    };
    
    // Debounce resize handler
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeHandler, 200);
    });
}