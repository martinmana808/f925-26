<script>
    import LazyImage from '../components/LazyImage.svelte';
    import Papa from 'papaparse';
    import Layout from '../components/layout/Layout.svelte';
    import Modal from '../components/Modal.svelte';
    import Loading from '../assets/icons/icon--loading.svg';
    import { onMount, onDestroy } from 'svelte';

    onMount(() => {
        document.body.classList.add('template--work');
    });

    onDestroy(() => {
        document.body.classList.remove('template--work');
    });

    // State
    let allWorks = [];
    let displayedImages = [];
    let imagesToShow = 60;
    let loading = false;
    let isModalOpen = false;
    let modalData = {};
    let workCol;
    let activeCategory = 'All';
    let categories = ['All'];
    let enabledCategoriesSet = new Set(['All']);

    const breakpoints = {
        mq_s: 600,
        mq_nav: 900,
        mq_xxl: 1400
    };

    // Define your preferred order
    const categoryOrder = [
        'All',
        'UX / UI',
        'Frontend development',
        'Branding',
        'Packaging',
        'Logo',
        'Flyers',
        'Album artwork',
        '3D design',
        'Editorial',
        'Signage',
        'Video',
        'Uncategorized'
    ];

    // Shuffle array using Fisher-Yates algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Helper to load and parse categories.csv
    async function loadEnabledCategories() {
        try {
            const response = await fetch('/assets/data/categories.csv');
            if (!response.ok) throw new Error(`Failed to load categories.csv: ${response.statusText}`);
            const csvText = await response.text();
            return new Promise((resolve) => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        // Only include categories where show === 'yes' (case-insensitive)
                        const enabled = results.data
                            .filter(row => (row.show || '').trim().toLowerCase() === 'yes')
                            .map(row => row.category && row.category.trim())
                            .filter(Boolean);
                        resolve(new Set(['All', ...enabled]));
                    },
                    error: (error) => {
                        console.error('categories.csv parsing error:', error);
                        resolve(new Set(['All']));
                    }
                });
            });
        } catch (error) {
            console.error('Error loading categories.csv:', error);
            return new Set(['All']);
        }
    }

    // Update the loadCSVData function to handle multiple categories and filter by enabled categories
    async function loadCSVData() {
        try {
            // Load enabled categories first
            enabledCategoriesSet = await loadEnabledCategories();
            const response = await fetch('/assets/data/works.csv');
            if (!response.ok) throw new Error(`Failed to load CSV: ${response.statusText}`);
            const csvText = await response.text();
            return new Promise((resolve) => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        // Process each work's categories and filter out hidden works
                        const processedData = results.data
                            .filter(item => {
                                // Filter out works with show='no'
                                if (item.show === 'no') return false;
                                
                                // Split categories by comma and trim whitespace
                                const categories = item.category 
                                    ? item.category.split(',').map(cat => cat.trim())
                                    : ['Uncategorized'];
                                
                                // Filter out works that belong to hidden categories
                                const hasHiddenCategory = categories.some(cat => !enabledCategoriesSet.has(cat));
                                if (hasHiddenCategory) return false;
                                
                                return true;
                            })
                            .map(item => {
                                // Split categories by comma and trim whitespace
                                const categories = item.category 
                                    ? item.category.split(',').map(cat => cat.trim())
                                    : ['Uncategorized'];
                                return {
                                    filename: item.filename || 'placeholder.jpg',
                                    title: item.title || 'Untitled',
                                    categories: categories,
                                    description: item.description || '',
                                    aspect_ratio: item.aspect_ratio || '1 / 1',
                                    url: item.url || '', // Add URL from CSV
                                    show: item.show || 'yes' // Add show field with default 'yes'
                                };
                            });

                        // Extract all unique categories that are enabled
                        const allCategories = new Set(['All']);
                        processedData.forEach(work => {
                            work.categories.forEach(cat => {
                                if (enabledCategoriesSet.has(cat)) {
                                    allCategories.add(cat);
                                }
                            });
                        });
                        // Replace the sorting logic with:
                        const allCategoriesArray = Array.from(allCategories);
                        categories = categoryOrder.filter(cat => allCategoriesArray.includes(cat));
                        resolve(processedData);
                    },
                    error: (error) => {
                        console.error('CSV parsing error:', error);
                        resolve([]);
                    }
                });
            });
        } catch (error) {
            console.error('Error loading CSV:', error);
            return [];
        }
    }

    // Update filter function to check multiple categories
    function filterByCategory(work) {
        if (activeCategory === 'All') return true;
        return work.categories.includes(activeCategory);
    }

    // Add URL handling functions
    function getCategoryFromHash() {
        const hash = window.location.hash;
        const match = hash.match(/category=([^&]+)/);
        return match ? decodeURIComponent(match[1]) : 'All';
    }

    function updateHash(category) {
        const newHash = category === 'All' ? '' : `category=${encodeURIComponent(category)}`;
        window.history.replaceState(null, '', newHash ? `#${newHash}` : window.location.pathname);
    }

    // Update setActiveCategory to handle URL updates
    function setActiveCategory(category) {
        activeCategory = category;
        imagesToShow = 60; // Reset pagination
        updateDisplayedImages();
        updateHash(category);
        
        // Scroll to the top of masonry
        const masonry = document.querySelector('.masonry');
        if (masonry) {
            const rect = masonry.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const targetPosition = scrollTop + rect.top - 20; // 20px offset from top
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    // Update onMount to handle initial category from URL
    onMount(async () => {
        loading = true;
        allWorks = await loadCSVData();
        allWorks = shuffleArray(allWorks);
        
        // Set initial category from URL
        const initialCategory = getCategoryFromHash();
        if (categories.includes(initialCategory)) {
            activeCategory = initialCategory;
        }
        
        displayedImages = allWorks.slice(0, imagesToShow);
        loading = false;
        updateColumns();
        window.addEventListener('resize', updateColumns);
    });

    onDestroy(() => {
        window.removeEventListener('resize', updateColumns);
    });

    function loadMoreImages() {
        console.log('loadMoreImages called');
        const previousLength = displayedImages.length;
        console.log('Previous length:', previousLength);
        
        // Mark the last image before loading more
        const allWorkItems = document.querySelectorAll('.work');
        const lastImage = allWorkItems[previousLength - 1];
        if (lastImage) {
            lastImage.classList.add('ultima');
        }
        
        imagesToShow += 20;
        updateDisplayedImages();
        
        // Wait for the new images to load and layout to complete
        setTimeout(() => {
            console.log('Timeout callback executing');
            
            // Find the marked image and scroll to it
            const ultimaImage = document.querySelector('.ultima');
            if (ultimaImage) {
                console.log('Found ultima image, scrolling to it');
                ultimaImage.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Remove the class after scrolling
                setTimeout(() => {
                    ultimaImage.classList.remove('ultima');
                }, 1000);
            } else {
                console.log('No ultima image found');
            }
        }, 500); // Wait for images to be positioned
    }

    function updateDisplayedImages() {
        displayedImages = activeCategory === 'All'
            ? allWorks.slice(0, imagesToShow)
            : allWorks.filter(work => work.categories.includes(activeCategory)).slice(0, imagesToShow);
    }

    // Modal functions
    let modalIndex = 0;
    let currentFilteredWorks = [];

    function openModal(data) {
        modalData = data;
        // Find the index of the current work in the displayed list (what's actually shown on page)
        modalIndex = displayedFilteredWorks.findIndex(work => work.filename === data.filename);
        // Add index and total to modal data (based on displayed works, not all filtered works)
        modalData.index = modalIndex;
        modalData.total = displayedFilteredWorks.length;
        isModalOpen = true;
        document.body.classList.add('work-modal-open');
    }

    function closeModal() {
        isModalOpen = false;
        document.body.classList.remove('work-modal-open');
    }

    function openNextModal() {
        if (modalIndex < displayedFilteredWorks.length - 1) {
            modalIndex++;
            modalData = displayedFilteredWorks[modalIndex];
            // Update index and total (based on displayed works)
            modalData.index = modalIndex;
            modalData.total = displayedFilteredWorks.length;
        }
    }

    function openPrevModal() {
        if (modalIndex > 0) {
            modalIndex--;
            modalData = displayedFilteredWorks[modalIndex];
            // Update index and total (based on displayed works)
            modalData.index = modalIndex;
            modalData.total = displayedFilteredWorks.length;
        }
    }

    // YouTube video handling
    function isYouTubeUrl(url) {
        if (!url) return false;
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        return youtubeRegex.test(url);
    }

    function getYouTubeEmbedUrl(url) {
        if (!url) return '';
        // Handle both youtube.com and youtu.be URLs
        const videoId = url.includes('youtu.be') 
            ? url.split('/').pop()
            : url.split('v=')[1]?.split('&')[0];
        if (!videoId) return '';
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&showinfo=0&modestbranding=1`;
    }

    // Responsive columns logic
    let numColumns = 2;
    let columnWidth = 300;

    function updateColumns() {
        const width = window.innerWidth;
        if (width >= breakpoints.mq_xxl) {
            numColumns = 5;
        } else if (width >= breakpoints.mq_nav) {
            numColumns = 4;
        } else if (width >= breakpoints.mq_s) {
            numColumns = 3;
        } else {
            numColumns = 2;
        }
    }

    // Masonry distribution
    function distributeMasonry(images, numColumns, columnWidth = 300) {
        const columns = Array.from({ length: numColumns }, () => ({ images: [], height: 0 }));
        for (const img of images) {
            let ratio = 1;
            if (img.aspect_ratio && img.aspect_ratio.includes('/')) {
                const [w, h] = img.aspect_ratio.split('/').map(Number);
                if (w && h) ratio = h / w;
            }
            const estHeight = columnWidth * ratio;
            let minCol = columns[0];
            for (const col of columns) {
                if (col.height < minCol.height) minCol = col;
            }
            minCol.images.push(img);
            minCol.height += estHeight;
        }
        return columns.map(col => col.images);
    }

    // Reactive statements
    $: filteredWorks = activeCategory === 'All' 
    ? allWorks 
    : allWorks.filter(work => work.categories.includes(activeCategory));
    $: displayedFilteredWorks = filteredWorks.slice(0, imagesToShow);
    $: currentFilteredWorks = filteredWorks; // Update the current filtered works for modal navigation
    $: columns = distributeMasonry(displayedFilteredWorks, numColumns, columnWidth);
    $: hasMoreItems = displayedFilteredWorks.length < filteredWorks.length;

</script>

<Layout>
    <div class="work-modal__overlay" ></div>
    <div class="works grid gutter-x h-100 relative">
        <div class="col-l">
            <h1 class="text--subheadingSm l-visible ">Portfolio.<br/>
Design that earns trust.<br/>
Built to actually work.</h1>
        </div>
        <div class="col-r">
            <h1 class="text--section l-hidden">Our work</h1>
            <h2 class="text--subheadingSm l-hidden">
                A look at what we make.

                <span class="small"></span>
            </h2>
            <h2 class="text--section l-visible ">
                A look at what we make.
            </h2>
            <div class="mw-600">
                Every piece here was designed and built by F925 — websites, products, brands, and the details in between. This is the bar we hold ourselves to.<br>
                Deep, written case studies are on the way. For now, here's the work.
            </div>
            
        </div>
       
        <!-- Add category filters -->
        
        <div class="category-filters">
            <div class="filter-buttons">
                {#each categories as category}
                <button
                        class="filter-button tag {activeCategory === category ? 'active' : ''}"
                        on:click={() => setActiveCategory(category)}
                        aria-label={`Filter by ${category}`}
                    >
                        {category}
                    </button>
                {/each}
            </div>
        </div>
        <div class="masonry" id="masonry">
            {#each columns as col}
                <div class="masonry-col">
                    {#each col as work}
                        <button
                            class="work"
                            on:click={() => openModal(work)}
                            style={`aspect-ratio: ${work.aspect_ratio || '1 / 1'};`}
                            aria-label="Open image modal"
                        >
                            <LazyImage
                                src={`/assets/images/works--low/${work.filename || 'placeholder.jpg'}`}
                                alt={work.title || 'Untitled'}
                                className=""
                                onLoad={() => {}}
                                onError={() => {}}
                            />
                            <!-- <div class="work__meta">
                                <strong>{work.title}</strong><br>
                                <small>{work.category}</small>
                            </div> -->
                        </button>
                    {/each}
                </div>
            {/each}
        </div>
        {#if hasMoreItems}
        <div class="hasMoreItems flex justify-center l-justify-between items-center col relative">
                <div class="op-0 m-visible">
                    ↑
                </div>
                <button class="button button--view-more --0out" on:click={loadMoreImages}>
                    <div class="loading--mobile">
                        <img src={Loading} alt="Loading" />
                    </div>
                    <span>View more</span>
                </button>
                <a href="#masonry" class="c-0 m-visible">
                    ↑
                </a>
            </div>
        {/if}
    </div>
   
</Layout>

<Modal
    data={modalData}
    src={modalData.filename ? `/assets/images/works/${modalData.filename}` : ''}
    isOpen={isModalOpen}
    on:close={closeModal}
    on:next={openNextModal}
    on:prev={openPrevModal}
    {isYouTubeUrl}
    {getYouTubeEmbedUrl}
/>
