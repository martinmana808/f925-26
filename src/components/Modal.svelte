<script>
    export let src = '';
    export let isOpen = false;
    export let data = {}; // Accepts the full work object (title, category, description, etc.)

    import Loading from '../assets/icons/icon--loading.svg';
    import { createEventDispatcher, onMount } from 'svelte';

    const dispatch = createEventDispatcher();
    let closeButton;
    let loading = true;
    let errorLoading = false;
    let previousSrc = '';

    function close() {
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
        if (isOpen && event.key === 'Escape') {
            close();
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
<style>
    .modal-meta {
        position: absolute;
        z-index: 33333333;
        color: black;
        background: white;
    }
</style>
<button class="modal {isOpen ? 'modal--open' : ''}" aria-modal="true" on:click={close}>
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
                <div class="mt-sm">Failed to load image</div>
            </div>
        </div>
    {/if}
 <div class="modal-meta c-1">
            {#if data.title}
                <h2>{data.title}</h2>
            {/if}
            {#if data.category}
                <div class="modal-category">{data.category}</div>
            {/if}
            {#if data.description}
                <p class="modal-description">{data.description}</p>
            {/if}
        </div>
    <!-- Image content -->
    <img class="modal-content" {src} alt="Modal image" on:load={handleImageLoad} on:error={handleImageError} />

    <!-- {#if data.category}
      <footer class="site-footer spacing-x">
          <div class="site-footer__inner mw-container mx-auto w-100 h-100">
              <div class="grid gutter-x h-100">
                  <div class="col-l flex items-center text--eyebrow">
                      <div class="modal-category">{data.category}</div>
                  </div>
                  <div class="col-r flex items-center justify-between">
                      <nav class="icon--social-nav flex items-center">
                          <button
                              class="modal-close link text--eyebrow"
                              bind:this={closeButton}
                              on:click={close}
                              aria-label="Close modal">
                              Close
                          </button>
                      </nav>
                  </div>
              </div>
          </div>
      </footer>
  {/if} -->
</button>
