document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.getElementById('gallery-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('archive-search');
    const totalCount = document.getElementById('total-count');
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.querySelector('.close-btn');
    const lightboxMedia = document.getElementById('lightbox-media-container');

    let currentFilter = 'all';
    let searchQuery = '';

    // Initialize Gallery
    function renderGallery() {
        galleryGrid.innerHTML = '';
        const filteredData = archiveData.filter(item => {
            const matchesCategory = currentFilter === 'all' || item.category === currentFilter;
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        totalCount.textContent = filteredData.length;

        filteredData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'media-card';
            card.innerHTML = `
                <div class="card-thumbnail" style="background-image: url('${item.type === 'video' ? item.thumbnail : item.url}')">
                    <div class="card-type">
                        <i class="fas ${item.type === 'video' ? 'fa-play' : 'fa-image'}"></i>
                    </div>
                </div>
                <div class="card-content">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <div class="card-footer">
                        <span class="tag ${item.category === 'sensitive' ? 'sensitive' : ''}">${item.category}</span>
                        <span class="date">${item.date}</span>
                    </div>
                </div>
            `;
            card.onclick = () => openLightbox(item);
            galleryGrid.appendChild(card);
        });

        if (filteredData.length === 0) {
            galleryGrid.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
        }
    }

    // Filter Logic
    filterButtons.forEach(btn => {
        btn.onclick = () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.category;
            renderGallery();
        };
    });

    // Search Logic
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderGallery();
    });

    // Lightbox Logic
    function openLightbox(item) {
        lightboxMedia.innerHTML = '';
        if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = item.url;
            video.controls = true;
            video.autoplay = true;
            lightboxMedia.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = item.url;
            lightboxMedia.appendChild(img);
        }

        document.getElementById('lightbox-title').textContent = item.title;
        document.getElementById('lightbox-desc').textContent = item.description;
        document.getElementById('lightbox-date').textContent = `Date: ${item.date}`;
        document.getElementById('lightbox-category').textContent = `Category: ${item.category}`;

        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeBtn.onclick = () => {
        lightbox.style.display = 'none';
        lightboxMedia.innerHTML = '';
        document.body.style.overflow = 'auto';
    };

    window.onclick = (e) => {
        if (e.target === lightbox) {
            closeBtn.onclick();
        }
    };

    renderGallery();
});
