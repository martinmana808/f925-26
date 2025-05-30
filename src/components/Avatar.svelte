<script>
    export let name
    export let surname
    export let location = ''
    export let big = false

    // Dynamically construct the image path based on the `name` prop
    let image;

    // Use `onMount` to set the image path after the component is mounted
    import { onMount } from 'svelte';

    onMount(() => {
        image = new URL(`../assets/images/team--${name}.png`, import.meta.url).href;
    });
</script>

<div class="team__avatar {big ? '--big' : '--small'}">
    <img src="{image}" alt="{name} {surname}" />
    <div class="{big ? 'team__flag' : 'team__flag--sm'}">{location}</div>
</div>