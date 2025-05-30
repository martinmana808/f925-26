<script>
    export let title
    export let description = ''
    export let tags = []
    export let url
</script>

<div class="service-card carousel-cell">
    <h2 class="text--subheadingLg">{title}</h2>
    <div class="mb-sm">
        {@html description}
    </div>
    {#if tags.length > 0}
        <div class="mt-auto">
            <ul class="tags list-reset">
                {#each tags as tag}
                    <li class="tag">{tag.title}</li>
                {/each}
            </ul>
        </div>
    {/if}
    {#if url}
        <div class="m-visible">
            <a class="button mt-sm" href={url}><span>View details</span></a>
        </div>
        <div class="m-hidden w-100">
            <a class="button mt-sm w-100" href={url}><span>View details</span></a>
        </div>
    {/if}
</div>
