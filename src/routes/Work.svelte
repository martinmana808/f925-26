<script>
    import Papa from 'papaparse'
    import Layout from '../components/layout/Layout.svelte'
    import Modal from '../components/Modal.svelte'
    import Loading from '../assets/icons/icon--loading.svg'
    import { onMount } from 'svelte'

    let displayedImages = []
    let loading = false
    let isModalOpen = false
    let modalData = {}
    let workCol

    let allWorks = []

    async function loadCSVData() {
    try {
        const response = await fetch('/assets/data/works.csv')
        if (!response.ok) {
            throw new Error(`Failed to load CSV: ${response.statusText}`)
        }
        const csvText = await response.text()
        console.log("RAW CSV TEXT:", csvText); // <---- ADD THIS LINE

        return new Promise((resolve) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    console.log('PapaParse raw results:', results); // <---- ADD THIS LINE
                    // Add default values for missing properties
                    const processedData = results.data.map(item => ({
                        filename: item.filename || 'placeholder.jpg',
                        title: item.title || 'Untitled',
                        category: item.category || 'Unknown',
                        description: item.description || ''
                    }))
                    resolve(processedData)
                },
                error: (error) => {
                    console.error('CSV parsing error:', error)
                    resolve([]) // Return empty array on error
                }
            })
        })
    } catch (error) {
        console.error('Error loading CSV:', error)
        return []
    }
}

    async function selectRandomImages(shouldScroll = false) {
        try {
            setLoading(true)
            if (!allWorks || allWorks.length === 0) {
                allWorks = await loadCSVData()
            }
            
            const randomItems = [...allWorks].sort(() => 0.5 - Math.random()).slice(0, 60)
            displayedImages = randomItems
            setLoading(false)

            if (shouldScroll && workCol) {
                workCol.scrollIntoView({ behavior: 'smooth' })
            }
        } catch (error) {
            console.error('Error selecting random images:', error)
            setLoading(false)
        }
    }

    function setLoading(value) {
        loading = value
    }

    function openModal(data) {
        modalData = data
        isModalOpen = true
        document.body.classList.add('work-modal-open')
    }

    function closeModal() {
        isModalOpen = false
        document.body.classList.remove('work-modal-open')
    }

    onMount(async () => {
        allWorks = await loadCSVData()
        console.log("Primer item del CSV:", allWorks[0])
        selectRandomImages()
        document.body.classList.add('template--work')
    })
</script>

<Layout {selectRandomImages}>
    <div class="works grid gutter-x h-100 relative">
        <div class="col-l">
            <h1 class="text--subheadingSm l-visible">The power of being<br> a jack of all trades.</h1>
            <!-- <p class=" mw-600 s-hidden">
                Soon, we'll be showcasing new work, but we wouldn't have made it this far without our past. Take a look at some of what we've done before.
                <br />
                Refresh the page or touch the button at the bottom to stir up a fresh, eye-candy set of random images.
            </p> -->
        </div>
        <div class="col-r">
            <h1 class="text--section l-hidden">My work</h1>
            <h2 class="text--subheadingSm l-hidden">
                Master of none? Maybe. But I know a hell of a lot.

                <span class="small"></span>
                <!-- <span class="emoji">😝</span> -->
            </h2>
            <h2 class="text--section l-visible">
                Master of none? Maybe. But I know a hell of a lot.

                <span class="small">
                    <!-- <span class="emoji">😝</span> -->
                </span>
            </h2>

            <div class=" mw-600">
                I’ve worn many hats, taken on all kinds of projects, and learned heaps along the way. That variety is what fuels my creativity and problem-solving.
                <br>
                Here’s a little pot-pourri of work I’ve done over the years—random, varied, and all mine.
                <div class="s-visible">
                    <br />

                    <button class="link" on:click={() => selectRandomImages(true)}>Click here</button> to shuffle through a fresh set of random images.
                </div>
            </div>
            
        </div>
        <div class="work-random__button s-hidden">
            <button class="button --sm" on:click={() => selectRandomImages(true)}>
                <!-- Scroll only when clicked -->
                <div class="loading--mobile">
                    <img src={Loading} alt="Loading" />
                </div>
                <span>View more</span>
            </button>
        </div>
        <div id="work-col" class="work-col" bind:this={workCol}>
            <div class="loading--desktop">
                <img src={Loading} alt="Loading" />
            </div>
            {#each displayedImages as work, i}
                <button
                    class="work"
                    on:click={() => openModal(work)}
                    style={`aspect-ratio: ${work.aspectRatio || '1 / 1'};`}
                    aria-label="Open image modal">
                    <img
                        src={`/assets/images/works--low/${work.filename || 'placeholder.jpg'}`}
                        alt={work.title || 'Untitled'}
                        loading="lazy"
                        on:load={(event) => {
                            const img = event.target;
                            // Calculate aspect ratio and update the work object
                            work.aspectRatio = img.naturalWidth && img.naturalHeight
                                ? `${img.naturalWidth} / ${img.naturalHeight}`
                                : '1 / 1';
                            // Force Svelte to update the UI
                            displayedImages = [...displayedImages];
                        }}
                    />
                    <div class="work__meta">
                        <strong>{work.title}</strong><br>
                        <small>{work.category}</small>
                    </div>
                </button>
            {/each}
        </div>
    </div>
    <div class="s-visible">
        <button class="button --1out mx-auto" on:click={() => selectRandomImages(true)}>
            <!-- Scroll only when clicked -->
            <div class="loading--mobile">
                <img src={Loading} alt="Loading" />
            </div>
            <span>View more</span>
        </button>
    </div>
</Layout>

<Modal
    data={modalData}
    src={modalData.filename ? `/assets/images/works--high/${modalData.filename}` : ''}
    isOpen={isModalOpen}
    on:close={closeModal}
/>
