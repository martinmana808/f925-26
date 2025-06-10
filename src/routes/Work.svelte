<script>
    import LazyImage from '../components/LazyImage.svelte';
    import Papa from 'papaparse';
    import Layout from '../components/layout/Layout.svelte';
    import Modal from '../components/Modal.svelte';
    import Loading from '../assets/icons/icon--loading.svg';
    import { onMount, onDestroy } from 'svelte';
    onMount(() => {
        document.body.classList.add('template--work')
    })
    onDestroy(() => {
        document.body.classList.remove('template--work')
    })
    let allWorks = [];
    let displayedImages = [];
    let imagesToShow = 60; // Number of images to show initially and per "View More"
    let loading = false;
    let isModalOpen = false;
    let modalData = {};
    let workCol;

    const breakpoints = {
        mq_s: 600,      // replace with your actual px value for @mq-s
        mq_nav: 900,    // replace with your actual px value for @mq-nav
        mq_xxl: 1400    // replace with your actual px value for @mq-xxl
    };

    function shuffleArray(array) {
        // Fisher-Yates shuffle
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // CSV loading with aspect_ratio support
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
                        const processedData = results.data.map(item => ({
                            filename: item.filename || 'placeholder.jpg',
                            title: item.title || 'Untitled',
                            category: item.category || 'Unknown',
                            description: item.description || '',
                            aspect_ratio: item.aspect_ratio || '1 / 1'
                        }));
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

    // Load initial images on mount
    onMount(async () => {
        loading = true;
        allWorks = await loadCSVData();
        allWorks = shuffleArray(allWorks); // Shuffle ONCE after loading
        displayedImages = allWorks.slice(0, imagesToShow);
        loading = false;
        updateColumns();
        window.addEventListener('resize', updateColumns);
    });

    onDestroy(() => {
        window.removeEventListener('resize', updateColumns);
    });

    // "View More" loads more images at the bottom
    function loadMoreImages() {
        imagesToShow += 20;
        displayedImages = allWorks.slice(0, imagesToShow);
    }

    function openModal(data) {
        modalData = data;
        isModalOpen = true;
        document.body.classList.add('work-modal-open');
    }

    function closeModal() {
        isModalOpen = false;
        document.body.classList.remove('work-modal-open');
    }

    // Responsive columns logic
    let numColumns = 2;
    let columnWidth = 300; // You can adjust this to match your CSS or calculate dynamically

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
        // Optionally update columnWidth here if you want it to be dynamic
    }

    // True masonry: distribute images by estimated column heights
    function distributeMasonry(images, numColumns, columnWidth = 300) {
        const columns = Array.from({ length: numColumns }, () => ({ images: [], height: 0 }));
        for (const img of images) {
            let ratio = 1;
            if (img.aspect_ratio && img.aspect_ratio.includes('/')) {
                const [w, h] = img.aspect_ratio.split('/').map(Number);
                if (w && h) ratio = h / w;
            }
            const estHeight = columnWidth * ratio;
            // Find the column with the smallest height
            let minCol = columns[0];
            for (const col of columns) {
                if (col.height < minCol.height) minCol = col;
            }
            minCol.images.push(img);
            minCol.height += estHeight;
        }
        return columns.map(col => col.images);
    }

    $: columns = distributeMasonry(displayedImages, numColumns, columnWidth);
</script>

<Layout>
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
                I’ve worn many hats, taken on all kinds of projects, and learned heaps along the way. That variety is what fuels my creativity and problem-solving.
                <br>
                Here’s a little pot-pourri of work I’ve done over the years—random, varied, and all mine.
            </div>
            <div class="mw-600 op-0 l-visible">
                I’ve worn many hats, taken on all kinds of projects, and learned heaps along the way. That variety is what fuels my creativity and problem-solving.
                <br>
                Here’s a little pot-pourri of work I’ve done over the years—random, varied, and all mine.
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
        <div class="flex justify-between items-center col relative">
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
/>
