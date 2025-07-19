<script lang="ts">
    interface WorkData {
        title?: string;
        category?: string;
        description?: string;
        url?: string;
        filename?: string;
        [key: string]: any;
    }

    export let src = '';
    export let isOpen = false;
    export let data: WorkData = {}; // Accepts the full work object (title, category, description, etc.)
    export let isYouTubeUrl = (url) => false;
    export let getYouTubeEmbedUrl = (url) => '';

    import Loading from '../assets/icons/icon--loading.svg';
    import { createEventDispatcher, onMount } from 'svelte';

    const dispatch = createEventDispatcher();
    let closeButton;
    let loading = true;
    let errorLoading = false;
    let previousSrc = '';
    let youtubeIframe;
    let imageEl;
    let canZoom = false;
    let isZoomed = false;
    let naturalWidth = 0;
    let naturalHeight = 0;
    let renderedWidth = 0;
    let renderedHeight = 0;
    let isPointerDevice = false;
    let mouseMoved = false;
    let suppressClick = false;
    const DRAG_THRESHOLD = 5;

    function close() {
        if (youtubeIframe) {
            youtubeIframe.src = '';
        }
        isZoomed = false; // Reset zoom on close
        dispatch('close');
    }

    function handleNav(direction) {
        isZoomed = false;
        dispatch(direction);
    }

    // Focus the close button when modal opens
    $: if (isOpen && closeButton) {
        setTimeout(() => {
            closeButton.focus();
        }, 0);
    }

    // Reset loading and error state when src changes
    $: if (src !== previousSrc) {
        previousSrc = src;
        loading = true;
        errorLoading = false;
    }

    function handleImageLoad(event) {
        loading = false;
        // Get natural and rendered sizes
        naturalWidth = event.target.naturalWidth;
        naturalHeight = event.target.naturalHeight;
        renderedWidth = event.target.clientWidth;
        renderedHeight = event.target.clientHeight;
        canZoom = isPointerDevice && ((naturalWidth > renderedWidth) || (naturalHeight > renderedHeight));
    }

    function handleImageError() {
        loading = false;
        errorLoading = true;
    }

    function handleImageClick(event) {
        if (suppressClick) {
            event.preventDefault();
            event.stopPropagation();
            suppressClick = false;
            return;
        }
        if (!isPointerDevice || !canZoom) return;
        // Only toggle zoom if not a drag
        if (isZoomed) {
            if (!mouseMoved) {
                isZoomed = false;
                event.stopPropagation();
            }
        } else {
            isZoomed = true;
            event.stopPropagation();
        }
    }

    // Handle keyboard events for accessibility
    function handleKeydown(event) {
        if (isOpen) {
            if (event.key === 'Escape') {
                close();
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                dispatch('next');
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                dispatch('prev');
            }
        }
    }

    // Handle button keydown events to prevent spacebar from closing modal
    function handleButtonKeydown(event) {
        if (event.key === ' ') {
            event.preventDefault();
            // Trigger the navigation based on which button was pressed
            if (event.currentTarget.classList.contains('modal-nav-button--prev')) {
                dispatch('prev');
            } else if (event.currentTarget.classList.contains('modal-nav-button--next')) {
                dispatch('next');
            }
        }
    }

    onMount(() => {
        window.addEventListener('keydown', handleKeydown);
        // Detect pointer device
        const mq = window.matchMedia('(pointer: fine)');
        isPointerDevice = mq.matches;
        const updatePointer = (e) => { isPointerDevice = e.matches; };
        mq.addEventListener('change', updatePointer);
        return () => {
            window.removeEventListener('keydown', handleKeydown);
            mq.removeEventListener('change', updatePointer);
        };
    });

    $: console.log('Modal data:', data);

    // Grab-to-pan state
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let scrollStartLeft = 0;
    let scrollStartTop = 0;

    function handleWrapperMouseDown(event) {
        if (!isPointerDevice || !isZoomed) return;
        isDragging = true;
        mouseMoved = false;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
        const wrapper = event.currentTarget;
        scrollStartLeft = wrapper.scrollLeft;
        scrollStartTop = wrapper.scrollTop;
        document.body.style.cursor = 'grabbing';
    }

    function handleWrapperMouseMove(event) {
        if (!isPointerDevice || !isZoomed || !isDragging) return;
        const dx = event.clientX - dragStartX;
        const dy = event.clientY - dragStartY;
        if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
            mouseMoved = true;
        }
        const wrapper = imageEl.parentElement;
        wrapper.scrollLeft = scrollStartLeft - dx;
        wrapper.scrollTop = scrollStartTop - dy;
    }

    function handleWrapperMouseUp(event) {
        if (!isPointerDevice || !isZoomed) return;
        isDragging = false;
        document.body.style.cursor = '';
        if (mouseMoved) {
            event.stopPropagation();
            suppressClick = true;
        }
    }

    function handleWrapperMouseLeave() {
        if (!isPointerDevice || !isZoomed) return;
        isDragging = false;
        document.body.style.cursor = '';
    }
</script>




<button class="modal {isOpen ? 'modal--open' : ''}" aria-modal="true" on:click={close}>
    <!-- Navigation buttons -->
    <div class="modal-nav-buttons">
        <button 
            class="modal-nav-button modal-nav-button--prev link--on-hover" 
            on:click={(e) => {
                e.stopPropagation();
                handleNav('prev');
            }} 
            on:keydown={handleButtonKeydown}
            aria-label="Previous work"
        >
            ←
        </button>
        <div class="modal-nav-counter">
            {data.index + 1}/{data.total}
        </div>
        <button 
            class="modal-nav-button modal-nav-button--next link--on-hover" 
            on:click={(e) => {
                e.stopPropagation();
                handleNav('next');
            }} 
            on:keydown={handleButtonKeydown}
            aria-label="Next work"
        >
            →
        </button>
    </div>

    <button class="modal-close link--on-hover" bind:this={closeButton} on:click={close} aria-label="Close modal">
        Close
    </button>

    <!-- Show loading indicator only when src is not empty and no error occurred -->
    {#if loading && src && !errorLoading}
        <div class="modal__loading">
            <img src={Loading} alt="Loading" />
        </div>
    {/if}

    <!-- Show error message if image fails to load -->
    {#if errorLoading}
        <div class="modal__loading">
            <div>
                <span class="text--section">🐛</span>
                <div class="mt-sm">Failed to load content</div>
            </div>
        </div>
    {/if}

    <div class="modal-meta c-1 pointer-none">
        <div class="modal-meta__tags flex">
            <!-- {#if data.title}
                <span class="tag filter-button active">{data.title}</span> 
            {/if} -->
            {#if data.categories}
                {#each data.categories as category}
                    <span class="tag filter-button active">{category}</span>
                {/each}
            {/if}
        </div>
        {#if data.description} 
            <div class="modal-meta__description tag filter-button">{data.description}</div>
        {/if}
    </div>

    <!-- Content -->
    {#if data.url && isYouTubeUrl(data.url)}
        <div class="modal-content youtube-container">
            <iframe
                bind:this={youtubeIframe}
                width="100%"
                height="100%"
                src={getYouTubeEmbedUrl(data.url)}
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                on:load={() => loading = false}
                on:error={() => {
                    loading = false;
                    errorLoading = true;
                }}
            ></iframe>
        </div>
    {:else}
        <div 
            class="modal-image-wrapper {isZoomed ? 'zoomed' : ''}"
            on:mousedown={isPointerDevice ? handleWrapperMouseDown : undefined}
            on:mousemove={isPointerDevice ? handleWrapperMouseMove : undefined}
            on:mouseup={isPointerDevice ? handleWrapperMouseUp : undefined}
            on:mouseleave={isPointerDevice ? handleWrapperMouseLeave : undefined}
            style={isPointerDevice && isZoomed ? `cursor: ${isDragging ? 'grabbing' : 'grab'};` : ''}
        >
            <img 
                class="modal-content"
                bind:this={imageEl}
                {src}
                alt="Modal image"
                on:load={handleImageLoad}
                on:error={handleImageError}
                on:click={handleImageClick}
                style="cursor: {isPointerDevice ? (canZoom ? (isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in') : 'default') : 'default'};"
                draggable="false"
            />
        </div>
    {/if}
</button>

<style>
    .modal-image-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        overflow: hidden;
        /* fallback for non-zoomed */
    }
    .modal-image-wrapper.zoomed {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.85);
        z-index: 10000;
        justify-content: center;
        align-items: center;
        cursor: grab;
        overflow: auto;
        margin: 0;
        padding: 0;
        user-select: none;
        /* Hide scrollbars for all browsers */
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE 10+ */
    }
    .modal-image-wrapper.zoomed::-webkit-scrollbar {
        display: none; /* Chrome/Safari/Webkit */
    }
    .modal-image-wrapper.zoomed:active {
        cursor: grabbing;
    }
    .modal-image-wrapper.zoomed img {
        max-width: none;
        max-height: none;
        width: auto;
        height: auto;
        box-shadow: 0 0 32px #0008;
        /* Show at natural size */
        cursor: inherit;
    }
    .modal-content {
        max-width: 90vw;
        max-height: 80vh;
        transition: box-shadow 0.2s;
        background: #fff;
        border-radius: 8px;
        cursor: pointer;
        user-select: none;
    }
    .modal-image-wrapper.zoomed .modal-content {
        max-width: none;
        max-height: none;
        border-radius: 0;
        background: transparent;
    }
</style>

