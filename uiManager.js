// uiManager.js
"use strict";
// Assuming these are correctly imported in your actual file structure
import { createElement, setElementHtml, addClasses, removeClasses, toggleClasses } from './domUtils.js';
import { getSortIcon, getFilterIcon, getNestedValue } from './utils.js';

export class UIManager {
    constructor(containerElement, configManager, stateManager, eventHandler) {
        this.container = containerElement;
        this.config = configManager;
        this.state = stateManager;
        this.events = eventHandler; // In DataTable.js, 'this' is passed for eventHandler

        this.elements = {};
    }

    createInitialStructure() {
        this.container.innerHTML = "";
        addClasses(this.container, this.config.get('classes.container'));

        this._createTopSection();
        this._createTableWrapper();
        this._createBottomSection();
        this._createExportSection();

        this.renderTableHeaders();
    }

    _createTopSection() {
        // Check if any feature in the top section is enabled
        if (!this.config.get('search.enabled') &&
            !(this.config.get('pagination.enabled') && this.config.get('pagination.pageSizes').length > 0)
        ) {
            // If neither search nor page size selector is enabled, don't create the top section.
            // Note: Export section is separate.
            return;
        }


        this.elements.topSection = createElement('div', this.config.get('classes.topSection'));
        this.elements.topBar = createElement('div', this.config.get('classes.topBar'));

        if (this.config.get('search.enabled')) {
            this._createSearchInput(this.elements.topBar);
        }
        if (this.config.get('pagination.enabled') && this.config.get('pagination.pageSizes').length > 0) {
            this._createPageSizeSelector(this.elements.topBar);
        }

        // Only append topSection if topBar has children (i.e., search or pageSize was created)
        if (this.elements.topBar.hasChildNodes()) {
            this.elements.topSection.appendChild(this.elements.topBar);
            this.container.appendChild(this.elements.topSection);
        }
    }

    _createSearchInput(parentElement) {
        const wrapperClasses = this.config.get('classes.searchWrapper');
        const inputClasses = this.config.get('classes.searchInput');
        const iconClasses = this.config.get('classes.searchIcon');

        this.elements.searchWrapper = createElement('div', wrapperClasses);

        const searchIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
        const searchIcon = createElement('span', iconClasses);
        setElementHtml(searchIcon, searchIconSvg);

        this.elements.searchInput = createElement('input', inputClasses, {
            type: 'text',
            placeholder: this.config.get('search.placeholder')
        });

        this.elements.searchWrapper.appendChild(searchIcon);
        this.elements.searchWrapper.appendChild(this.elements.searchInput);
        parentElement.appendChild(this.elements.searchWrapper);
    }

    _createPageSizeSelector(parentElement) {
        const wrapperClasses = this.config.get('classes.pageSizeWrapper');
        this.elements.pageSizeWrapper = createElement('div', wrapperClasses);

        const labelClasses = this.config.get('classes.pageSizeLabel');
        const label = createElement('label', labelClasses, {}, "Show:");
        this.elements.pageSizeWrapper.appendChild(label);

        if (this.config.get('pagination.allowCustomPageSize')) {
            this.elements.pageSizeInput = createElement('input', this.config.get('classes.pageSizeInput'), {
                type: 'number',
                min: '1',
                value: String(this.state.get('pageSize'))
            });
            this.elements.pageSizeWrapper.appendChild(this.elements.pageSizeInput);
        } else {
            this.elements.pageSizeSelect = createElement('select', this.config.get('classes.pageSizeSelect'));
            const pageSizes = this.config.get('pagination.pageSizes');
            const currentSelectedPageSize = this.state.get('pageSize');
            const totalRows = this.state.get('totalRows'); // Get totalRows for "All" comparison

            pageSizes.forEach(size => {
                const option = createElement('option', [], { value: String(size) }, String(size));
                // Correctly check for "All" selection
                if (size === "All") {
                    if (currentSelectedPageSize === totalRows || currentSelectedPageSize === "All") { // Check against actual number or "All" string
                        option.selected = true;
                    }
                } else if (String(size) === String(currentSelectedPageSize)) {
                    option.selected = true;
                }
                this.elements.pageSizeSelect.appendChild(option);
            });
            this.elements.pageSizeWrapper.appendChild(this.elements.pageSizeSelect);
        }
        parentElement.appendChild(this.elements.pageSizeWrapper);
    }

    _createTableWrapper() {
        this.elements.tableWrapper = createElement('div', this.config.get('classes.tableWrapper'));
        this.elements.table = createElement('table', this.config.get('classes.table'));
        this.elements.thead = createElement('thead', this.config.get('classes.thead'));
        this.elements.tbody = createElement('tbody', this.config.get('classes.tbody'));

        this.elements.table.appendChild(this.elements.thead);
        this.elements.table.appendChild(this.elements.tbody);
        this.elements.tableWrapper.appendChild(this.elements.table);
        this.container.appendChild(this.elements.tableWrapper);
    }

    _createBottomSection() {
        if (!this.config.get('pagination.enabled')) return;

        this.elements.bottomSection = createElement('div', this.config.get('classes.bottomSection'));
        this.elements.bottomBar = createElement('div', this.config.get('classes.bottomBar'));

        this.elements.paginationInfo = createElement('span', this.config.get('classes.paginationInfo'));
        this.elements.bottomBar.appendChild(this.elements.paginationInfo);

        this.elements.paginationControls = createElement('div', this.config.get('classes.pagination'));
        this.elements.bottomBar.appendChild(this.elements.paginationControls);

        this.elements.bottomSection.appendChild(this.elements.bottomBar);
        this.container.appendChild(this.elements.bottomSection);
    }

    _createExportSection() {
        if (!this.config.get('export.enabled')) return;

        this.elements.exportSection = createElement('div', this.config.get('classes.exportSection'));
        this.elements.exportBar = createElement('div', this.config.get('classes.exportBar'));

        const formats = this.config.get('export.formats');
        const copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
        const csvIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
        const pdfIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;

        if (formats.includes("copy")) {
            this.elements.copyButton = createElement('button', `${this.config.get('classes.exportButton')} ${this.config.get('classes.exportButtonCopy')}`);
            setElementHtml(this.elements.copyButton, `${copyIcon} Clipboard`);
            this.elements.exportBar.appendChild(this.elements.copyButton);
        }
        if (formats.includes("csv")) {
            this.elements.csvButton = createElement('button', `${this.config.get('classes.exportButton')} ${this.config.get('classes.exportButtonCsv')}`);
            setElementHtml(this.elements.csvButton, `${csvIcon} CSV`);
            this.elements.exportBar.appendChild(this.elements.csvButton);
        }
        if (formats.includes("pdf")) {
            this.elements.pdfButton = createElement('button', `${this.config.get('classes.exportButton')} ${this.config.get('classes.exportButtonPdf')}`);
            setElementHtml(this.elements.pdfButton, `${pdfIcon} PDF`);
            this.elements.exportBar.appendChild(this.elements.pdfButton);
        }

        if (this.elements.exportBar.hasChildNodes()) {
            this.elements.exportSection.appendChild(this.elements.exportBar);
            this.container.appendChild(this.elements.exportSection);
        }
    }


    renderTableHeaders() {
        if (!this.elements.thead) {
            console.error("UIManager: thead element not found for renderTableHeaders.");
            return;
        }
        setElementHtml(this.elements.thead, '');
        const tr = createElement('tr');
        const columns = this.config.get('columns');
        const currentSortState = this.state.get('sortState');

        columns.forEach((column, index) => {
            const thClassArray = [this.config.get('classes.th')];

            if (column.sortable !== false &&
                this.config.get('sorting.enabled') &&
                (!this.config.get('sorting.excludeActionColumns') || !column.actionable)) {
                thClassArray.push(this.config.get('classes.thSortable'));
            }

            const th = createElement('th', thClassArray.join(' '));
            th.dataset.columnIndex = String(index);

            if (currentSortState && currentSortState.index === index) {
                addClasses(th, this.config.get('classes.thSorted'));
            }

            const headerContent = createElement('div', "flex items-center gap-2");
            const columnName = createElement('span', [], {}, column.name);
            headerContent.appendChild(columnName);

            if (column.sortable !== false &&
                this.config.get('sorting.enabled') &&
                (!this.config.get('sorting.excludeActionColumns') || !column.actionable)) {
                const sortButtonsWrapper = createElement('div', this.config.get('classes.sortButtons'));

                ['asc', 'desc'].forEach(direction => {
                    const sortButton = createElement('button', this.config.get('classes.sortButton'), {
                        'data-direction': direction,
                        title: `Sort ${direction}ending`
                    });
                    setElementHtml(sortButton, getSortIcon(direction));
                    if (currentSortState && currentSortState.index === index && currentSortState.direction === direction) {
                        addClasses(sortButton, this.config.get('classes.sortButtonActive'));
                    }
                    sortButtonsWrapper.appendChild(sortButton);
                });
                headerContent.appendChild(sortButtonsWrapper);
            }

            if (this.config.get('filtering.enabled') &&
                column.filterable !== false &&
                (!this.config.get('filtering.excludeActionColumns') || !column.actionable)) {
                // Use the primary class for targeting, ensure it's just one class string here.
                const filterIconBaseClass = this.config.get('classes.filterIcon').split(' ')[0];
                const filterIconContainer = createElement('span', this.config.get('classes.filterIcon')); // Apply all configured classes
                filterIconContainer.classList.add(filterIconBaseClass); // Ensure the base class for targeting is present
                filterIconContainer.dataset.columnIndex = String(index);
                setElementHtml(filterIconContainer, getFilterIcon());

                this.updateFilterIconState(filterIconContainer, column.field, (this.state.get('activeFilters')[column.field] || []).length > 0);

                headerContent.appendChild(filterIconContainer);
            }

            th.appendChild(headerContent);
            tr.appendChild(th);
        });
        this.elements.thead.appendChild(tr);
    }

    renderTableBody(displayData) {
        if (!this.elements.tbody) {
            console.error("UIManager: tbody element not found for renderTableBody.");
            return;
        }
        setElementHtml(this.elements.tbody, '');
        const columns = this.config.get('columns');
        const nullValueDisplay = this.config.get('display.nullValue');

        if (!displayData || displayData.length === 0) {
            const tr = createElement('tr');
            const td = createElement('td', this.config.get('classes.noData'), {
                colSpan: String(columns.length)
            }, this.config.get('search.noResultsMessage'));
            tr.appendChild(td);
            this.elements.tbody.appendChild(tr);
            return;
        }

        displayData.forEach(row => {
            const tr = createElement('tr', this.config.get('classes.tr'));
            columns.forEach(column => {
                const td = createElement('td', this.config.get('classes.td'));
                const value = getNestedValue(row, column.field, nullValueDisplay);
                setElementHtml(td, column.formatter ? column.formatter(value, row) : String(value ?? ''));
                tr.appendChild(td);
            });
            this.elements.tbody.appendChild(tr);
        });
    }

    renderPaginationControls() {
        if (!this.config.get('pagination.enabled') || !this.elements.paginationControls || !this.elements.paginationInfo) {
            return;
        }
        setElementHtml(this.elements.paginationControls, '');

        const { currentPage, pageSize, totalRows } = this.state.getAll();

        if (totalRows === 0 && !this.config.get('search.enabled')) {
            setElementHtml(this.elements.paginationInfo, '');
            return;
        }

        const actualPageSize = pageSize === "All" || pageSize >= totalRows ? totalRows : parseInt(pageSize);

        if (isNaN(actualPageSize) || (actualPageSize <= 0 && totalRows > 0) ) {
            setElementHtml(this.elements.paginationInfo, `Showing 0 to 0 of ${totalRows} entries`);
            return;
        }

        const totalPages = totalRows === 0 ? 1 : Math.ceil(totalRows / actualPageSize) || 1;

        const startEntry = totalRows === 0 ? 0 : (currentPage - 1) * actualPageSize + 1;
        const endEntry = totalRows === 0 ? 0 : Math.min(currentPage * actualPageSize, totalRows);
        setElementHtml(this.elements.paginationInfo, `Showing ${startEntry} to ${endEntry} of ${totalRows} entries`);

        const pageIndicator = createElement('span', this.config.get('classes.paginationCurrent'), {}, `Page ${currentPage} of ${totalPages}`);

        const createButton = (text, svgIcon, pageToGo, isDisabled) => {
            const btnClasses = [this.config.get('classes.paginationButton')];
            btnClasses.push(isDisabled ? this.config.get('classes.paginationButtonDisabled') : this.config.get('classes.paginationButtonEnabled'));

            const btn = createElement('button', btnClasses.join(' '), { 'data-page': String(pageToGo) });
            if (isDisabled) btn.disabled = true;
            setElementHtml(btn, `${svgIcon} ${text}`);
            return btn;
        };

        const firstIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>';
        const prevIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
        const nextIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        const lastIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>';

        if (totalPages > 1 || totalRows > 0) { // Only show pagination buttons if there's something to paginate
            this.elements.paginationControls.appendChild(createButton("First", firstIcon, 1, currentPage === 1));
            this.elements.paginationControls.appendChild(createButton("Previous", prevIcon, currentPage - 1, currentPage === 1));
            this.elements.paginationControls.appendChild(pageIndicator);
            this.elements.paginationControls.appendChild(createButton("Next", nextIcon, currentPage + 1, currentPage === totalPages || totalRows === 0));
            this.elements.paginationControls.appendChild(createButton("Last", lastIcon, totalPages, currentPage === totalPages || totalRows === 0));
        } else { // If no pages, clear info too or show "No entries"
            setElementHtml(this.elements.paginationInfo, `0 entries`);
        }
    }

    /**
     * Updates the visual state of a filter icon (e.g., color it if active).
     * @param {HTMLElement} filterIconElement - The specific filter icon element in the header.
     * @param {string} columnField - The field identifier of the column.
     * @param {boolean} isActive - Whether the filter for this column is active.
     */
    updateFilterIconState(filterIconElement, columnField, isActive) {
        // The filterIconElement is the one clicked or identified.
        // If filterIconElement is not directly available (e.g. on initial render),
        // we might need to query it based on columnField or index.
        // For now, assume filterIconElement is the correct DOM span.
        if (!filterIconElement) {
            // Fallback: try to find the icon if not passed directly
            // This requires headers to be rendered and dataset.columnIndex to be reliable
            const columns = this.config.get('columns');
            const columnIndex = columns.findIndex(col => col.field === columnField);
            if (columnIndex !== -1 && this.elements.thead) {
                const th = this.elements.thead.querySelector(`th[data-column-index="${columnIndex}"]`);
                if (th) {
                    filterIconElement = th.querySelector(`.${this.config.get('classes.filterIcon').split(' ')[0]}`);
                }
            }
        }

        if (filterIconElement) {
            const activeClasses = this.config.get('classes.filterIconActive').split(' ');
            if (isActive) {
                addClasses(filterIconElement, activeClasses);
            } else {
                removeClasses(filterIconElement, activeClasses);
            }
        }
    }
}
