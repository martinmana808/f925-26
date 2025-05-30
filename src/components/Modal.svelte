<script>
    export let src = ''
    export let isOpen = false

    import Loading from '../assets/icons/icon--loading.svg'
    import { createEventDispatcher, onMount } from 'svelte'

    const dispatch = createEventDispatcher()
    let closeButton
    let loading = true // Track loading state
    let errorLoading = false // Track if there is an error
    let previousSrc = '' // Track previous src to detect changes

    function close() {
        dispatch('close')
    }

    // Watch for changes to isOpen and set focus accordingly
    $: if (isOpen && closeButton) {
        setTimeout(() => {
            closeButton.focus()
        }, 0)
    }

    // Reset loading and error state when src changes
    $: if (src !== previousSrc) {
        previousSrc = src // Update the previous src
        loading = true // Reset loading state only when src changes
        errorLoading = false // Reset error state only when src changes
    }

    // Handle image load
    function handleImageLoad() {
        loading = false // Image loaded successfully
    }

    // Handle image load error
    function handleImageError() {
        loading = false
        errorLoading = true // Set error state when image fails to load
    }

    // Handle keyboard events
    window.addEventListener('keydown', (event) => {
        if (isOpen && event.key === 'Escape') {
            close() // Close the modal when ESC key is pressed
        }
    })

    // Cleanup event listener on component destruction
    onMount(() => {
        return () => {
            window.removeEventListener('keydown', (event) => {
                if (isOpen && event.key === 'Escape') {
                    close() // Close the modal when ESC key is pressed
                }
            })
        }
    })
</script>

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

    <!-- Image content -->
    <img class="modal-content" {src} alt="Modal image" on:load={handleImageLoad} on:error={handleImageError} />

    <!-- Footer (optional) -->
    <!-- {#if category}
      <footer class="site-footer spacing-x">
          <div class="site-footer__inner mw-container mx-auto w-100 h-100">
              <div class="grid gutter-x h-100">
                  <div class="col-l flex items-center text--eyebrow">
                      <div class="modal-category">{category}</div>
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
