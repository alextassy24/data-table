// dependencyLoader.js
"use strict";

export const DependencyLoader = {
    DEPENDENCIES: {
        tailwind: "https://unpkg.com/@tailwindcss/browser@4",
        jspdf: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
        autoTable: "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"
    },

    loadedScripts: {}, // Keep track of loaded scripts

    loadScript(url) {
        return new Promise((resolve, reject) => {
            if (this.loadedScripts[url]) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = url;
            script.async = true;

            script.onload = () => {
                this.loadedScripts[url] = true;
                resolve();
            };
            script.onerror = () => reject(new Error(`Failed to load script: ${url}`));

            document.head.appendChild(script);
        });
    },

    async loadJSPDFDependencies() {
        try {
            if (!this.loadedScripts[this.DEPENDENCIES.jspdf]) {
                await this.loadScript(this.DEPENDENCIES.jspdf);
            }
            if (!this.loadedScripts[this.DEPENDENCIES.autoTable]) {
                // autoTable depends on jsPDF, ensure jsPDF is loaded first
                if (!window.jspdf) {
                    // Wait a bit if jsPDF is loading but not yet global
                    await new Promise(resolve => setTimeout(resolve, 100));
                    if(!window.jspdf) throw new Error('jsPDF failed to initialize on window');
                }
                await this.loadScript(this.DEPENDENCIES.autoTable);
            }
            return true;
        } catch (error) {
            console.error('Error loading PDF dependencies:', error);
            throw error;
        }
    },

    async loadTailwind() {
        try {
            await this.loadScript(this.DEPENDENCIES.tailwind);
            return true;
        } catch (error) {
            console.error('Error loading Tailwind:', error);
            throw error; // Or handle more gracefully
        }
    }
};