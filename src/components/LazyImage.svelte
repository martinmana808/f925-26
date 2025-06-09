<script>
  import { onMount } from 'svelte';
  export let src = '';
  export let alt = '';
  export let className = '';
  export let onLoad = () => {};
  export let onError = () => {};

  let imgEl;
  let observer;
  let isVisible = false;
  let isLoaded = false;

  onMount(() => {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          isVisible = true;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (imgEl) observer.observe(imgEl);
    return () => observer && observer.disconnect();
  });

  function handleLoad(event) {
    isLoaded = true;
    onLoad(event);
  }
</script>

<img
  bind:this={imgEl}
  src={isVisible ? src : undefined}
  alt={alt}
  class={className}
  style="opacity: {isLoaded ? 1 : 0}"
  on:load={handleLoad}
  on:error={onError}
/>
