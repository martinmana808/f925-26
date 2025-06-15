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

    const breakpoints = {
        mq_s: 600,
        mq_nav: 900,
        mq_xxl: 1400
    };

    // Shuffle array using Fisher-Yates algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

     // Update the loadCSVData function to handle multiple categories
    async function loadCSVData() {
        try {
            const response = await fetch('/assets/data/works.csv');
            if (!response.ok) throw new Error(`Failed to load CSV: ${response.statusText}`);
            const csvText = await response.text();
            
            return new Promise((resolve) => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        // Process each work's categories
                        const processedData = results.data.map(item => {
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
                                url: item.url || '' // Add URL from CSV
                            };
                        });

                        // Extract all unique categories
                        const allCategories = new Set(['All']);
                        processedData.forEach(work => {
                            work.categories.forEach(cat => allCategories.add(cat));
                        });
                        // Ensure 'All' is first and the rest are sorted
                        const sortedCategories = Array.from(allCategories).filter(c => c !== 'All').sort();
                        categories = ['All', ...sortedCategories];
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

    // Load initial data
    onMount(async () => {
        loading = true;
        allWorks = await loadCSVData();
        allWorks = shuffleArray(allWorks);
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

    // Call this when changing categories
    function setActiveCategory(category) {
        activeCategory = category;
        imagesToShow = 60; // Reset pagination
        updateDisplayedImages();
    }

    // Modal functions
    function openModal(data) {
        modalData = data;
        isModalOpen = true;
        document.body.classList.add('work-modal-open');
    }

    function closeModal() {
        isModalOpen = false;
        document.body.classList.remove('work-modal-open');
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
    $: columns = distributeMasonry(displayedFilteredWorks, numColumns, columnWidth);
    $: hasMoreItems = displayedFilteredWorks.length < filteredWorks.length;

</script>

<Layout>
    <div class="work-modal__overlay" ></div>
    <div class="works grid gutter-x h-100 relative">
        <div class="col-l">
            <h1 class="works-intro text--subheadingSm l-visible">The power of being<br> a jack of all trades.</h1>
            <h1 class="text--subheadingSm l-visible op-0">The power of being<br> a jack of all trades.</h1>
        </div>
        <div class="col-r">
            <h1 class="text--section l-hidden">My work</h1>
            <h2 class="text--subheadingSm l-hidden">
                Master of none? Maybe. But I know a hell of a lot.

                <span class="small"></span>
                <!-- <span class="emoji">😝</span> -->
            </h2>
            <h2 class="works-intro text--section l-visible">
                Master of none? Maybe. But I know a hell of a lot.
            </h2>
            <h2 class="text--section l-visible op-0">
                Master of none? Maybe. But I know a hell of a lot.
            </h2>

            <div class="works-intro mw-600">
                I've worn many hats, taken on all kinds of projects, and learned heaps along the way. That variety is what fuels my creativity and problem-solving.
                <br>
                Here's a little pot-pourri of work I've done over the years—random, varied, and all mine.
            </div>
            <div class="mw-600 op-0 l-visible">
                I've worn many hats, taken on all kinds of projects, and learned heaps along the way. That variety is what fuels my creativity and problem-solving.
                <br>
                Here's a little pot-pourri of work I've done over the years—random, varied, and all mine.
            </div>
            
        </div>
        <div class="work-random__button s-hidden">
            <button class="button --sm">
                <!-- Scroll only when clicked -->
                <div class="loading--mobile">
                    <img src={Loading} alt="Loading" />
                </div>
                <span>View more</span>
            </button>
        </div>
        <!-- Add category filters -->
        
        <div class="category-filters col-l">
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
        {#if displayedImages.length < allWorks.length}
        <div class="flex justify-between items-center col relative texture--cross spacing-t--sm spacing-b--sm">
                <div class="op-0">
                    ↑
                </div>
                <button class="button button--view-more --0out" on:click={loadMoreImages}>
                    <div class="loading--mobile">
                        <img src={Loading} alt="Loading" />
                    </div>
                    <span>View more</span>
                </button>
                <a href="#masonry" class="c-0">
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
    {isYouTubeUrl}
    {getYouTubeEmbedUrl}
/>
