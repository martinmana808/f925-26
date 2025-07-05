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

    function close() {
        if (youtubeIframe) {
            youtubeIframe.src = '';
        }
        dispatch('close');
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

    function handleImageLoad() {
        loading = false;
    }

    function handleImageError() {
        loading = false;
        errorLoading = true;
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
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    });

    $: console.log('Modal data:', data);
</script>




<button class="modal {isOpen ? 'modal--open' : ''}" aria-modal="true" on:click={close}>
    <!-- Navigation buttons -->
    <div class="modal-nav-buttons">
        <button 
            class="modal-nav-button modal-nav-button--prev link--on-hover" 
            on:click={(e) => {
                e.stopPropagation();
                dispatch('prev');
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
                dispatch('next');
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
        <img 
            class="modal-content" 
            {src} 
            alt="Modal image" 
            on:load={handleImageLoad} 
            on:error={handleImageError} 
        />
    {/if}
</button>

