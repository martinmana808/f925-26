<script>
    export let title
    export let description = ''
    export let tags = []
    export let url
</script>

<div class="service-card">
    <h2 class="text--subheadingSm">{title}</h2>
    <div class="mb-md">
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
        <div >
            <a class="button mt-sm" href={url}><span>View details</span></a>
        </div>
    {/if}
</div>
