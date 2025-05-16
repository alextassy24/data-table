// state.js
"use strict";

export class StateManager {
    constructor(initialData = [], initialPageSize = 10, initialConfiguredPageSize) {
        this.state = {
            data: initialData, // Original, unfiltered data
            processedData: [...initialData], // Data after search and filtering, before sorting and pagination
            displayData: [], // Data currently visible in the table (after pagination)
            sortState: null, // { index: columnIndex, direction: 'asc' | 'desc' }
            currentPage: 1,
            pageSize: initialConfiguredPageSize === "All" ? initialData.length : parseInt(initialPageSize),
            searchQuery: "",
            searchTimeout: null, // Keep search timeout ID here
            activeFilters: {}, // { columnField: [value1, value2], ... }
            totalRows: initialData.length, // Total rows after filtering and searching
        };
    }

    update(newState) {
        this.state = { ...this.state, ...newState };
    }

    get(key) {
        return this.state[key];
    }

    getAll() {
        return this.state;
    }

    resetForNewData(newData, newPageSize) {
        this.update({
            data: newData,
            processedData: [...newData],
            displayData: [],
            sortState: null,
            currentPage: 1,
            pageSize: newPageSize === "All" ? newData.length : parseInt(newPageSize),
            searchQuery: "",
            activeFilters: {},
            totalRows: newData.length,
        });
    }
}