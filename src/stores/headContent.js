// src/stores/headContent.js
import { writable } from 'svelte/store';

export const headContent = writable({
    title: 'Default Title',
    links: [],
    scripts: []
});
