// domUtils.js
"use strict";

export function createElement(tag, classNames = [], attributes = {}, textContent = '') {
    const element = document.createElement(tag);
    // Ensure classNames is treated as an array of strings or a single string
    let classesToAdd = '';
    if (Array.isArray(classNames)) {
        classesToAdd = classNames.join(' ');
    } else if (typeof classNames === 'string') {
        classesToAdd = classNames;
    }
    if (classesToAdd) {
        element.className = classesToAdd.trim();
    }

    for (const attr in attributes) {
        element.setAttribute(attr, attributes[attr]);
    }
    if (textContent) {
        element.textContent = textContent;
    }
    return element;
}

export function setElementHtml(element, htmlString) {
    if (element && typeof element.innerHTML !== 'undefined') { // Check if it's an element that can have innerHTML
        element.innerHTML = htmlString;
    } else if (element) {
        console.warn('setElementHtml: element does not have innerHTML property', element);
    }
}

export function addClasses(element, classNames) {
    if (element && element.classList && typeof element.classList.add === 'function') {
        const classes = Array.isArray(classNames) ? classNames : String(classNames).split(' ');
        element.classList.add(...classes.filter(Boolean));
    } else if (element) {
        // console.warn('addClasses: element does not have classList or add method', element);
    }
}

export function removeClasses(element, classNames) {
    if (element && element.classList && typeof element.classList.remove === 'function') {
        const classes = Array.isArray(classNames) ? classNames : String(classNames).split(' ');
        element.classList.remove(...classes.filter(Boolean));
    } else if (element) {
        // console.warn('removeClasses: element does not have classList or remove method', element);
    }
}

export function toggleClasses(element, classNames, force) {
    if (element && element.classList && typeof element.classList.toggle === 'function') {
        const classes = Array.isArray(classNames) ? classNames : String(classNames).split(' ');
        classes.forEach(cls => {
            if (cls) element.classList.toggle(cls, force);
        });
    } else if (element) {
        // console.warn('toggleClasses: element does not have classList or toggle method', element);
    }
}