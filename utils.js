// utils.js
"use strict";

export function mergeDeep(target, source) {
    const isObject = (obj) => obj && typeof obj === "object" && !Array.isArray(obj);

    if (!isObject(target) || !isObject(source)) {
        return source;
    }

    Object.keys(source).forEach((key) => {
        const targetValue = target[key];
        const sourceValue = source[key];

        if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
            // For arrays, you might want to replace, or concatenate, or merge based on use case.
            // For simple config classes, replacing might be fine. DataTable.js concatenates, so let's stick to that for now.
            target[key] = sourceValue; // Or targetValue.concat(sourceValue) if that's the desired behavior for all arrays
        } else if (isObject(targetValue) && isObject(sourceValue)) {
            target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
        } else {
            target[key] = sourceValue;
        }
    });
    return target;
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
export function getNestedValue(obj, path, defaultValue = null) {
    const value = path
        .split(".")
        .reduce((current, key) => (current && current[key] !== undefined ? current[key] : undefined), obj);
    return value !== undefined ? value : defaultValue;
}

export function getSortIcon(direction, classes = {}) {
    // classes can provide specific SVG classes if needed
    // Using your existing SVGs. Make sure they adapt to the class changes if any.
    const ascIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414l-3.293 3.293a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>`;
    const descIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 15.586l3.293-3.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>`;
    if (direction === 'asc') return ascIcon;
    if (direction === 'desc') return descIcon;
    return ''; // Or a default "unsorted" icon
}

export function getFilterIcon(classes = {}) {
    return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" /></svg>`;
}

// Add other general utilities if any (e.g., string manipulation, formatting)