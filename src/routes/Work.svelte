<script>
    import Layout from '../components/layout/Layout.svelte'
    import Loading from '../assets/icons/icon--loading.svg'
    import Modal from '../components/Modal.svelte'
    import { onMount, onDestroy } from 'svelte'

    let displayedImages = []
    let loading = false
    let modalImageSrc = ''
    let modalCategory = ''
    let isModalOpen = false
    let workCol
    let imageFiles

    if (import.meta.env.MODE === 'development') {
        imageFiles = import.meta.glob('/src/assets/images/works--low/*/*.{jpg,png,jpeg,gif,webp}')
    } else {
        imageFiles = import.meta.glob('../assets/images/works--low/*/*.{jpg,png,jpeg,gif,webp}')
    }

    let images = Object.keys(imageFiles)

    async function preloadImages() {
        document.body.classList.add('is-loading')

        const imageDimensions = []

        await Promise.all(
            images.map(async (path) => {
                const img = new Image()
                img.src = path

                return new Promise((resolve) => {
                    img.onload = () => {
                        const category = path.split('/')[5]
                        imageDimensions.push({
                            src: path,
                            width: img.width,
                            height: img.height,
                            ratio: img.width / img.height,
                            category: category,
                        })
                        resolve()
                    }
                })
            }),
        )

        document.body.classList.remove('is-loading')

        return imageDimensions
    }

    async function selectRandomImages(shouldScroll = false) {
        setLoading(true)
        const imageDimensions = await preloadImages()
        const selectedImages = []
        let availableImages = [...imageDimensions]

        for (let i = 0; i < 60; i++) {
            if (availableImages.length === 0) break
            const randomIndex = Math.floor(Math.random() * availableImages.length)
            selectedImages.push(availableImages.splice(randomIndex, 1)[0])
        }

        displayedImages = selectedImages
        setLoading(false)

        if (shouldScroll) {
            const offset = 105
            const viewportWidth = window.innerWidth

            if (viewportWidth <= 500) {
                const targetPosition = workCol.getBoundingClientRect().top + window.pageYOffset - offset
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth',
                })
            } else {
                workCol.scrollIntoView({
                    behavior: 'smooth',
                })
            }
        }
    }

    function setLoading(isLoading) {
        loading = isLoading
    }

    function openModal(src, category) {
        modalImageSrc = src
        modalCategory = category
        isModalOpen = true
        document.body.classList.add('work-modal-open')
    }

    function closeModal() {
        isModalOpen = false
        document.body.classList.remove('work-modal-open')
    }

    onMount(() => {
        selectRandomImages(false) // No scrolling when the page reloads
        document.body.classList.add('template--work')
    })

    onDestroy(() => {
        document.body.classList.remove('template--work')
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
            {#each displayedImages as { src, ratio, category }}
                 
                    <button
                        class="work"
                        style="aspect-ratio: {ratio};"
                        on:click={() => openModal(src.replace('--low', '--high'), category)}
                        aria-label="Open image in modal">
                        <img {src} alt="Work Image" loading="lazy" />
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

<Modal src={modalImageSrc} category={modalCategory} isOpen={isModalOpen} on:close={closeModal} />
