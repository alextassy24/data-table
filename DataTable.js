// DataTable.js
"use strict";

import { ConfigManager } from './config.js';
import { StateManager } from './state.js';
import { DataProcessor } from './dataProcessor.js';
import { UIManager } from './uiManager.js';
import { ExportHandler } from './exportHandler.js';
import { DependencyLoader } from './dependencyLoader.js';
import { debounce, getNestedValue } from './utils.js';
import { createElement, setElementHtml } from './domUtils.js';

export class DataTable {
  static VERSION = "1.0.0";

  static async loadDependencies() {
    try {
      await DependencyLoader.loadTailwind();
      // console.log("DataTable dependencies (Tailwind) loaded.");
    } catch (error) {
      console.error("Failed to load DataTable dependencies:", error);
      throw error;
    }
    return true;
  }

  constructor(containerSelector, userConfig = {}) {
    this.containerElement = document.querySelector(containerSelector);
    if (!this.containerElement) {
      throw new Error(`DataTable container element "${containerSelector}" not found.`);
    }

    this.configManager = new ConfigManager(userConfig);
    this.stateManager = new StateManager(
        this.configManager.get('data'),
        this.configManager.get('pagination.pageSize'),
        this.configManager.get('pagination.pageSize')
    );
    this.dataProcessor = new DataProcessor(this.configManager);
    this.uiManager = new UIManager(this.containerElement, this.configManager, this.stateManager, this);
    this.exportHandler = new ExportHandler(this.stateManager, this.configManager);

    this._init();
  }

  _init() {
    this.uiManager.createInitialStructure();
    this._bindCoreEvents();
    this.render();
  }

  _processAndPrepareData() {
    const state = this.stateManager.getAll();
    const columns = this.configManager.get('columns');

    let processedData = this.dataProcessor.filterAndSearchData(state.data, state.searchQuery, state.activeFilters, columns);
    this.stateManager.update({ totalRows: processedData.length });

    processedData = this.dataProcessor.sortData(processedData, state.sortState, columns);
    this.stateManager.update({ processedData });

    const displayData = this.dataProcessor.paginateData(processedData, state.currentPage, state.pageSize);
    this.stateManager.update({ displayData });

    return displayData;
  }

  render() {
    const displayData = this._processAndPrepareData();
    this.uiManager.renderTableHeaders();
    this.uiManager.renderTableBody(displayData);
    this.uiManager.renderPaginationControls();
  }

  _bindCoreEvents() {
    // Search and PageSize bindings (no changes needed here)
    if (this.configManager.get('search.enabled') && this.uiManager.elements.searchInput) {
      const debounceTime = this.configManager.get('search.debounceTime');
      this.uiManager.elements.searchInput.addEventListener('input',
          debounce(e => {
            this.stateManager.update({ searchQuery: e.target.value.toLowerCase(), currentPage: 1 });
            this.render();
          }, debounceTime)
      );
    }

    if (this.configManager.get('pagination.enabled')) {
      const pageSizeElement = this.uiManager.elements.pageSizeSelect || this.uiManager.elements.pageSizeInput;
      if (pageSizeElement) {
        pageSizeElement.addEventListener('change', e => {
          const newSize = e.target.value;
          const pageSize = newSize === "All"
              ? this.stateManager.get('totalRows')
              : parseInt(newSize);
          this.stateManager.update({
            pageSize: pageSize > 0 ? pageSize : this.stateManager.get('totalRows'),
            currentPage: 1
          });
          this.render();
        });
      }
    }

    // Pagination Button Events (no changes needed here)
    if (this.configManager.get('pagination.enabled') && this.uiManager.elements.paginationControls) {
      this.uiManager.elements.paginationControls.addEventListener('click', e => {
        const button = e.target.closest('button[data-page]');
        if (button && !button.disabled) {
          const newPage = parseInt(button.dataset.page);
          if (!isNaN(newPage)) {
            this.stateManager.update({ currentPage: newPage });
            this.render();
          }
        }
      });
    }

    // Export Button Events (no changes needed here)
    if(this.configManager.get('export.enabled')) {
      if(this.uiManager.elements.copyButton) {
        this.uiManager.elements.copyButton.addEventListener('click', () => this.exportHandler.copyToClipboard());
      }
      if(this.uiManager.elements.csvButton) {
        this.uiManager.elements.csvButton.addEventListener('click', () => this.exportHandler.exportCSV());
      }
      if(this.uiManager.elements.pdfButton) {
        this.uiManager.elements.pdfButton.addEventListener('click', async () => {
          if (this.uiManager.elements.pdfButton.disabled) return;
          this.uiManager.elements.pdfButton.disabled = true;
          try { await this.exportHandler.exportPDF(); }
          catch(err) { console.error("PDF Export failed in DataTable:", err); }
          finally { this.uiManager.elements.pdfButton.disabled = false; }
        });
      }
    }

    // --- Combined Click Listener for THEAD (Sorting & Filtering) ---
    if (this.uiManager.elements.thead) {
      // console.log("Attaching single click listener to thead:", this.uiManager.elements.thead);
      this.uiManager.elements.thead.addEventListener('click', e => {
        const targetElement = e.target;

        // 1. Check for Filter Icon click
        if (this.configManager.get('filtering.enabled')) {
          const filterIconClass = this.configManager.get('classes.filterIcon').split(' ').find(cls => cls.startsWith('dt-filter-icon'));
          if (!filterIconClass) {
            console.error("Base dt-filter-icon class not found in config for event listener.");
            return;
          }
          const filterIcon = targetElement.closest(`.${filterIconClass}`);
          if (filterIcon) {
            e.stopPropagation(); // CRITICAL: Stop event from bubbling to sort logic
            const headerCell = filterIcon.closest('th[data-column-index]');
            if (headerCell && headerCell.isConnected) {
              const columnIndex = parseInt(headerCell.dataset.columnIndex);
              const column = this.configManager.get('columns')[columnIndex];
              // console.log("Filter icon click handled. Column:", column.name);
              this._showFilterPanel(filterIcon, column, columnIndex);
            } else {
              console.warn("Filter icon clicked, but its parent <th> is not connected or not found. Icon:", filterIcon, "Found TH:", headerCell);
            }
            return; // Filter action handled, do nothing else
          }
        }

        // 2. Check for Sort Button click (specific buttons for asc/desc)
        if (this.configManager.get('sorting.enabled')) {
          const sortButton = targetElement.closest('button[data-direction]');
          if (sortButton) {
            e.stopPropagation(); // CRITICAL: Stop event
            const headerCell = sortButton.closest('th[data-column-index]');
            if (headerCell && headerCell.isConnected) {
              const columnIndex = parseInt(headerCell.dataset.columnIndex);
              const direction = sortButton.dataset.direction;
              // console.log("Sort button click handled. Column Index:", columnIndex, "Direction:", direction);
              this._handleSort(columnIndex, direction);
            }
            return; // Sort action handled
          }
        }

        // 3. Check for general TH click for sorting (if not filter icon or sort button)
        if (this.configManager.get('sorting.enabled')) {
          const headerCellForSort = targetElement.closest('th[data-column-index]');
          if (headerCellForSort && headerCellForSort.isConnected) {
            const columnConfig = this.configManager.get('columns')[parseInt(headerCellForSort.dataset.columnIndex)];
            if (columnConfig && columnConfig.sortable !== false) {
              // This click is for sorting the column itself (not an icon/button within it)
              const columnIndex = parseInt(headerCellForSort.dataset.columnIndex);
              const currentSort = this.stateManager.get('sortState');
              let newDirection = 'asc';

              if (currentSort && currentSort.index === columnIndex) {
                if (currentSort.direction === 'asc') {
                  newDirection = 'desc';
                } else {
                  // Cycle: asc -> desc -> unsorted (null)
                  this.stateManager.update({ sortState: null, currentPage: 1 });
                  this.render();
                  return; // Unsorted
                }
              }
              // console.log("General TH click for sorting. Column Index:", columnIndex, "New Direction:", newDirection);
              this._handleSort(columnIndex, newDirection);
            }
          }
        }
      });
    }
  }

  _handleSort(columnIndex, direction) {
    this.stateManager.update({ sortState: { index: columnIndex, direction }, currentPage: 1 });
    this.render(); // This will re-render headers, which is fine after sort state is updated
  }

  _showFilterPanel(filterIconElement, column, columnIndex) {
    // console.log("--- _showFilterPanel invoked ---");
    // console.log("Received filterIconElement:", filterIconElement, "Is Connected:", filterIconElement.isConnected);

    const existingPanel = document.querySelector(`.${this.configManager.get('classes.filterPanel').split(' ')[0]}`);
    if (existingPanel) existingPanel.remove();

    const panel = createElement('div', this.configManager.get('classes.filterPanel'));
    panel.style.position = 'absolute';
    panel.style.zIndex = String(this.configManager.get('classes.filterPanel').includes('z-50') ? 50 : 100);

    const headerCellForPositioning = filterIconElement.closest('th[data-column-index="' + columnIndex + '"]');

    if (!headerCellForPositioning || !headerCellForPositioning.isConnected) {
      console.error("Filter panel: headerCellForPositioning is not found or not connected to the DOM for panel positioning.");
      // Attempt to use filterIconElement itself if headerCell is problematic
      const iconRect = filterIconElement.getBoundingClientRect();
      if(iconRect.width === 0 && iconRect.height === 0){
        console.error("Filter icon also has no dimensions. Positioning panel at default 10,10.");
        panel.style.left = '10px';
        panel.style.top = '10px';
      } else {
        console.warn("Positioning panel relative to filter icon due to header cell issue.");
        panel.style.left = `${iconRect.left + window.scrollX}px`;
        panel.style.top = `${iconRect.bottom + window.scrollY + 5}px`; // 5px offset
      }
    } else {
      // Deferring to rAF for potentially more stable measurements
      requestAnimationFrame(() => {
        const headerRect = headerCellForPositioning.getBoundingClientRect();
        // console.log("Header Rect for positioning (in rAF):", JSON.parse(JSON.stringify(headerRect)));

        if (headerRect.width === 0 && (headerRect.left === 0 || headerRect.x === 0) ) {
          console.warn("Positioning header cell (rAF) has zero width or is at left 0. Using icon as fallback.");
          const iconRect = filterIconElement.getBoundingClientRect();
          panel.style.left = `${iconRect.left + window.scrollX}px`;
          panel.style.top = `${iconRect.bottom + window.scrollY + 5}px`;
        } else {
          panel.style.left = `${headerRect.left + window.scrollX}px`;
          panel.style.top = `${headerRect.bottom + window.scrollY}px`;
        }
        const minWidthClass = this.configManager.get('classes.filterPanel').match(/min-w-\[(\d+(?:px|rem|em))\]/);
        panel.style.minWidth = minWidthClass ? minWidthClass[1] : '200px';
      });
    }

    const uniqueValues = [...new Set(
        this.stateManager.get('data').map(row => getNestedValue(row, column.field) ?? this.configManager.get('display.nullValue'))
    )].sort((a, b) => String(a).localeCompare(String(b)));

    const filterHeader = createElement('div', this.configManager.get('classes.filterHeader'));
    const filterTitle = createElement('span', this.configManager.get('classes.filterTitle'), {}, `Filter ${column.name}`);
    const resetButton = createElement('button', this.configManager.get('classes.filterReset'));
    setElementHtml(resetButton, `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`);
    resetButton.title = 'Reset filters for this column';
    filterHeader.appendChild(filterTitle);
    filterHeader.appendChild(resetButton);
    panel.appendChild(filterHeader);

    const optionsContainer = createElement('div', this.configManager.get('classes.filterOptionsContainer'));
    const currentFiltersForField = this.stateManager.get('activeFilters')[column.field] || [];
    uniqueValues.forEach(value => {
      const optionDiv = createElement('div', this.configManager.get('classes.filterOption'));
      const checkboxId = `dt-filter-${column.field.replace(/\W/g, '_')}-${String(value).replace(/\W/g, '_')}-${columnIndex}`;
      const checkbox = createElement('input', this.configManager.get('classes.filterCheckbox'), { type: 'checkbox', value: String(value), id: checkboxId });
      checkbox.checked = currentFiltersForField.includes(String(value));
      const label = createElement('label', this.configManager.get('classes.filterLabel'), { for: checkboxId }, String(value));
      optionDiv.appendChild(checkbox);
      optionDiv.appendChild(label);
      optionDiv.addEventListener('click', (e) => {
        if (e.target !== checkbox) { checkbox.checked = !checkbox.checked; }
      });
      optionsContainer.appendChild(optionDiv);
    });
    panel.appendChild(optionsContainer);

    const actionContainer = createElement('div', this.configManager.get('classes.filterActions'));
    const cancelButton = createElement('button', `${this.configManager.get('classes.filterButton')} ${this.configManager.get('classes.filterCancelButton')}`, {}, 'Cancel');
    const applyButton = createElement('button', `${this.configManager.get('classes.filterButton')} ${this.configManager.get('classes.filterApplyButton')}`, {}, 'Apply');
    actionContainer.appendChild(cancelButton);
    actionContainer.appendChild(applyButton);
    panel.appendChild(actionContainer);
    document.body.appendChild(panel);

    const closePanel = () => {
      panel.remove();
      document.removeEventListener('click', handleOutsideClick, true);
    };
    const handleOutsideClick = (e) => {
      if (!panel.contains(e.target) && !filterIconElement.contains(e.target)) {
        closePanel();
      }
    };
    resetButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const newActiveFilters = { ...this.stateManager.get('activeFilters') };
      delete newActiveFilters[column.field];
      this.stateManager.update({ activeFilters: newActiveFilters, currentPage: 1 });
      this.render();
      this.uiManager.updateFilterIconState(filterIconElement, column.field, false);
      closePanel();
    });
    cancelButton.addEventListener('click', (e) => {
      e.stopPropagation();
      closePanel();
    });
    applyButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const selectedValues = [];
      optionsContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        selectedValues.push(cb.value);
      });
      const newActiveFilters = { ...this.stateManager.get('activeFilters') };
      if (selectedValues.length > 0) { newActiveFilters[column.field] = selectedValues; }
      else { delete newActiveFilters[column.field]; }
      this.stateManager.update({ activeFilters: newActiveFilters, currentPage: 1 });
      this.render();
      this.uiManager.updateFilterIconState(filterIconElement, column.field, selectedValues.length > 0);
      closePanel();
    });
    setTimeout(() => { document.addEventListener('click', handleOutsideClick, true); }, 0);
    // console.log("--- _showFilterPanel END ---");
  }

  refresh() { this.render(); }
  updateData(newData) {
    this.stateManager.resetForNewData(newData, this.configManager.get('pagination.pageSize'));
    this.render();
  }
  destroy() {
    this.containerElement.innerHTML = "";
    const existingPanel = document.querySelector(`.${this.configManager.get('classes.filterPanel').split(' ')[0]}`);
    if (existingPanel) existingPanel.remove();
    // More robust: remove specific event listeners
    if (this.uiManager && this.uiManager.elements.thead) {
      // This would require storing the listener function to remove it, or using AbortController
      // For simplicity now, we are not removing specific listeners on destroy.
    }
    console.log("DataTable destroyed");
  }
}
