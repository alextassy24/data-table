// config.js
"use strict";

// Only import mergeDeep from utils.js
import { mergeDeep } from './utils.js';

export const defaultConfig = {
    data: [],
    columns: [],
    pagination: {
        enabled: true,
        pageSize: 10,
        pageSizes: [5, 10, 25, 50, "All"],
        allowCustomPageSize: false,
    },
    search: {
        enabled: true,
        placeholder: "Search...",
        debounceTime: 300,
        noResultsMessage: "No matching records found",
        excludeActionColumns: true,
    },
    sorting: {
        enabled: true,
        multiColumn: false,
        excludeActionColumns: true,
    },
    filtering: {
        enabled: true,
        excludeActionColumns: true,
        defaultFilterable: true,
    },
    display: {
        nullValue: "N/A",
    },
    export: {
        enabled: true,
        formats: ["csv", "copy", "pdf"],
        excludeActionColumns: true,
        pdfOptions: {
            orientation: 'landscape',
            unit: 'pt',
            format: 'a4',
            filename: 'table-export.pdf'
        },
        csvOptions: {
            filename: 'export.csv'
        }
    },
    classes: {
        container: "dt-container max-w-full bg-white rounded-xl shadow-lg overflow-hidden",
        topSection: "dt-top p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200",
        topBar: "dt-top-bar flex flex-wrap items-center justify-between gap-4",
        searchWrapper: "dt-search flex-1 min-w-[200px] max-w-md relative",
        searchInput: "dt-search-input w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 pl-10 text-sm text-gray-700 placeholder-gray-400",
        searchIcon: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
        pageSizeWrapper: "dt-page-size flex items-center gap-2",
        pageSizeLabel: "dt-page-size-label text-sm text-gray-600",
        pageSizeSelect: "dt-page-size-select px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700",
        pageSizeInput: "dt-page-size-input w-20 px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700",
        tableWrapper: "dt-table-wrapper overflow-x-auto",
        table: "dt-table min-w-full border-collapse",
        thead: "dt-thead bg-gradient-to-r from-gray-50 to-white sticky top-0 ",
        th: "dt-th px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200 bg-white sticky top-0",
        thSortable: "dt-th-sortable hover:bg-gray-50 transition-colors duration-200 cursor-pointer select-none",
        thSorted: "dt-th-sorted text-blue-600",
        sortButtons: "dt-sort-buttons ml-2 flex flex-col justify-center gap-0",
        sortButton: "dt-sort-button h-3 w-3 text-gray-400 hover:text-gray-600 transition-colors duration-200",
        sortButtonActive: "dt-sort-button-active !text-blue-600 bg-blue-50 rounded",
        tbody: "dt-tbody bg-white divide-y divide-gray-100",
        tr: "dt-tr transition-colors duration-200 hover:bg-gray-50",
        td: "dt-td px-6 py-4 text-sm text-gray-600 whitespace-nowrap",
        noData: "dt-no-data text-center py-8 text-gray-500 bg-gray-50 italic",
        bottomSection: "dt-bottom p-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200",
        bottomBar: "dt-bottom-bar flex flex-wrap items-center justify-between gap-4",
        pagination: "dt-pagination flex items-center gap-2",
        paginationButton: "dt-pagination-button px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-1",
        paginationButtonEnabled: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:cursor-pointer",
        paginationButtonDisabled: "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed",
        paginationInfo: "dt-pagination-info text-sm text-gray-600",
        paginationCurrent: "dt-pagination-current px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium",
        exportSection: "dt-export p-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200",
        exportBar: "dt-export-bar flex justify-end gap-2",
        exportButton: "dt-export-button px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 hover:cursor-pointer",
        exportButtonCopy: "bg-emerald-600 text-white hover:bg-emerald-700 hover:cursor-pointer",
        exportButtonCsv: "bg-blue-600 text-white hover:bg-blue-700 hover:cursor-pointer",
        exportButtonPdf: "bg-red-600 text-white hover:bg-red-700 hover:cursor-pointer",
        filterPanel: "dt-filter-panel absolute mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[220px] max-w-xs",
        filterHeader: "flex justify-between items-center px-4 py-3 border-b border-gray-200",
        filterTitle: "font-semibold text-gray-800 text-sm",
        filterReset: "p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300",
        filterOptionsContainer: "max-h-60 overflow-y-auto py-2 px-1",
        filterOption: "flex items-center px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer",
        filterCheckbox: "h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0",
        filterLabel: "ml-3 text-sm text-gray-700 select-none",
        filterActions: "flex justify-end gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg",
        filterCancelButton: "dt-filter-btn px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
        filterApplyButton: "dt-filter-btn px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        filterIcon: "dt-filter-icon ml-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer p-1 rounded-full hover:bg-gray-200",
        filterIconActive: "text-blue-600 bg-blue-100 hover:text-blue-700 hover:bg-blue-200",
    }
};

export class ConfigManager {
    constructor(userConfig = {}) {
        const defaults = JSON.parse(JSON.stringify(defaultConfig));
        this.config = mergeDeep(defaults, userConfig);
    }

    get(key) {
        return key.split('.').reduce((obj, part) => obj && obj[part], this.config);
    }

    getFullConfig() {
        return this.config;
    }
}
