// dataProcessor.js
"use strict";
import { getNestedValue } from './utils.js';

export class DataProcessor {
    constructor(configManager) {
        this.configManager = configManager;
    }

    // Applies search and column filters
    filterAndSearchData(data, searchQuery, activeFilters, columns) {
        let filteredData = [...data];
        const nullValueDisplay = this.configManager.get('display.nullValue');

        // Apply column filters
        if (activeFilters && Object.keys(activeFilters).length > 0) {
            filteredData = filteredData.filter(row => {
                return Object.entries(activeFilters).every(([field, values]) => {
                    if (!values || values.length === 0) return true;
                    const rowValue = getNestedValue(row, field) ?? nullValueDisplay;
                    return values.includes(String(rowValue)); // Ensure comparison is string-based if values are strings
                });
            });
        }

        // Apply search query
        if (searchQuery) {
            const searchableColumns = this.configManager.get('search.excludeActionColumns')
                ? columns.filter(col => !col.actionable)
                : columns;

            filteredData = filteredData.filter(row => {
                return searchableColumns.some(column => {
                    const value = getNestedValue(row, column.field);
                    return value !== null && value !== undefined && String(value).toLowerCase().includes(searchQuery.toLowerCase());
                });
            });
        }
        return filteredData;
    }

    sortData(data, sortState, columns) {
        if (!sortState || sortState.index === null) {
            return data; // Or return to original order if tracked
        }

        const { index: columnIndex, direction } = sortState;
        const column = columns[columnIndex];
        const nullValueDisplay = this.configManager.get('display.nullValue');

        if (!column || column.sortable === false || (this.configManager.get('sorting.excludeActionColumns') && column.actionable)) {
            return data;
        }

        const sortedData = [...data].sort((a, b) => {
            let aVal = getNestedValue(a, column.field);
            let bVal = getNestedValue(b, column.field);

            // Handle nulls consistently
            if (aVal === nullValueDisplay || aVal === null || aVal === undefined) aVal = null;
            if (bVal === nullValueDisplay || bVal === null || bVal === undefined) bVal = null;

            if (aVal === null && bVal === null) return 0;
            if (aVal === null) return 1; // Nulls last
            if (bVal === null) return -1; // Nulls last

            // Attempt numeric sort if both are numbers or can be coerced
            const aNum = parseFloat(aVal);
            const bNum = parseFloat(bVal);

            if (!isNaN(aNum) && !isNaN(bNum)) {
                return direction === 'asc' ? aNum - bNum : bNum - aNum;
            }

            // Fallback to string localeCompare
            const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true, sensitivity: 'base' });
            return direction === 'asc' ? comparison : -comparison;
        });

        return sortedData;
    }

    paginateData(data, currentPage, pageSize) {
        if (!this.configManager.get('pagination.enabled') || pageSize === "All" || !pageSize) {
            return data;
        }
        const numericPageSize = parseInt(pageSize);
        if (isNaN(numericPageSize) || numericPageSize <= 0) return data;

        const start = (currentPage - 1) * numericPageSize;
        return data.slice(start, start + numericPageSize);
    }
}