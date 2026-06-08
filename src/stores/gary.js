// src/stores/gary.js
import { writable } from 'svelte/store';

// Whether the Gary chat panel is open
export const garyOpen = writable(false);

// An optional message to auto-send the next time Gary opens (e.g. from a hero CTA)
export const garyPrime = writable(null);

// Open Gary, optionally priming it with a first user message
export function openGary(message = null) {
    garyPrime.set(message);
    garyOpen.set(true);
}
