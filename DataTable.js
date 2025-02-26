// DataTable.js - A lightweight, vanilla JavaScript data table library
'use strict';

class DataTable {
  static VERSION = '1.0.0';
  
  static defaultConfig = {
    data: [],
    columns: [],
    pagination: {
      enabled: true,
      pageSize: 10,
      pageSizes: [5, 10, 25, 50, 'All'],
      allowCustomPageSize: false
    },
    search: {
      enabled: true,
      placeholder: 'Search...',
      debounceTime: 300,
      noResultsMessage: 'No matching records found'
    },
    sorting: {
      enabled: true,
      multiColumn: false
    },
    export: {
      enabled: true,
      formats: ['csv', 'copy']
    },
    classes: {
      container: 'dt-container max-w-full bg-white rounded-xl shadow-lg overflow-hidden',
      topSection: 'dt-top p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200',
      topBar: 'dt-top-bar flex flex-wrap items-center justify-between gap-4',
      searchWrapper: 'dt-search flex-1 min-w-[200px] max-w-md relative',
      searchInput: 'dt-search-input w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 pl-10',
      searchIcon: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400',
      pageSizeWrapper: 'dt-page-size flex items-center gap-2',
      pageSizeLabel: 'dt-page-size-label text-sm text-gray-600',
      pageSizeSelect: 'dt-page-size-select px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      pageSizeInput: 'dt-page-size-input w-20 px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      tableWrapper: 'dt-table-wrapper overflow-x-auto',
      table: 'dt-table min-w-full border-collapse',
      thead: 'dt-thead bg-gradient-to-r from-gray-50 to-white sticky top-0 ',
      th: 'dt-th px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200 bg-white sticky top-0',
      thSortable: 'dt-th-sortable hover:bg-gray-50 transition-colors duration-200 cursor-pointer select-none',
      thSorted: 'dt-th-sorted text-blue-600 bg-blue-50',
      sortIcon: 'dt-sort-icon ml-2 inline-block transition-transform duration-200',
      tbody: 'dt-tbody bg-white divide-y divide-gray-100',
      tr: 'dt-tr transition-colors duration-200 hover:bg-gray-50',
      td: 'dt-td px-6 py-4 text-sm text-gray-600 whitespace-nowrap',
      noData: 'dt-no-data text-center py-8 text-gray-500 bg-gray-50 italic',
      bottomSection: 'dt-bottom p-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200',
      bottomBar: 'dt-bottom-bar flex flex-wrap items-center justify-between gap-4',
      pagination: 'dt-pagination flex items-center gap-2',
      paginationButton: 'dt-pagination-button px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-1',
      paginationButtonEnabled: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:cursor-pointer',
      paginationButtonDisabled: 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed',
      paginationInfo: 'dt-pagination-info text-sm text-gray-600',
      paginationCurrent: 'dt-pagination-current px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium',
      exportSection: 'dt-export p-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200',
      exportBar: 'dt-export-bar flex justify-end gap-2',
      exportButton: 'dt-export-button px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 hover:cursor-pointer',
      exportButtonCopy: 'bg-emerald-600 text-white hover:bg-emerald-700 hover:cursor-pointer',
      exportButtonCsv: 'bg-blue-600 text-white hover:bg-blue-700 hover:cursor-pointer'
    }
  };

  constructor(container, config = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
      
    if (!this.container) {
      throw new Error('Container element not found');
    }

    // Deep merge configuration
    this.config = this._mergeDeep(DataTable.defaultConfig, config);
    
    // Initialize state
    this.state = {
      data: this.config.data,
      filteredData: [...this.config.data], // Create a copy of the data
      sortState: null,
      currentPage: 1,
      pageSize: this.config.pagination.pageSize,
      searchQuery: '',
      searchTimeout: null
    };

    // Initialize the table
    this._init();
  }

  // Private methods
  _init() {
    this._createStructure();
    this._bindEvents();
    this._render();
  }

  _createStructure() {
    this.container.innerHTML = '';
    this.container.className = this.config.classes.container;

    // Create top section
    if (this.config.search.enabled || this.config.pagination.enabled) {
      this.topSection = this._createElement('div', this.config.classes.topSection);
      this.topBar = this._createElement('div', this.config.classes.topBar);
      
      if (this.config.search.enabled) {
        this._createSearch();
      }
      
      if (this.config.pagination.enabled) {
        this._createPageSize();
      }
      
      this.topSection.appendChild(this.topBar);
      this.container.appendChild(this.topSection);
    }

    // Create table wrapper and table
    this.tableWrapper = this._createElement('div', this.config.classes.tableWrapper);
    this.table = this._createElement('table', this.config.classes.table);
    this._createHeader();
    this.tbody = this._createElement('tbody', this.config.classes.tbody);
    this.table.appendChild(this.tbody);
    this.tableWrapper.appendChild(this.table);
    this.container.appendChild(this.tableWrapper);

    // Create bottom section
    if (this.config.pagination.enabled) {
      this.bottomSection = this._createElement('div', this.config.classes.bottomSection);
      this.bottomBar = this._createElement('div', this.config.classes.bottomBar);
      this._createPagination();
      this.bottomSection.appendChild(this.bottomBar);
      this.container.appendChild(this.bottomSection);
    }

    // Create export section
    if (this.config.export.enabled) {
      this._createExport();
    }
  }

  _createSearch() {
    const searchWrapper = this._createElement('div', this.config.classes.searchWrapper);
    
    // Add search icon
    const searchIcon = this._createElement('span', this.config.classes.searchIcon);
    searchIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
    searchWrapper.appendChild(searchIcon);
    
    this.searchInput = this._createElement('input', this.config.classes.searchInput);
    this.searchInput.type = 'text';
    this.searchInput.placeholder = this.config.search.placeholder;
    searchWrapper.appendChild(this.searchInput);
    this.topBar.appendChild(searchWrapper);
  }

  _createPageSize() {
    const wrapper = this._createElement('div', this.config.classes.pageSizeWrapper);
    const label = this._createElement('label', this.config.classes.pageSizeLabel);
    label.textContent = 'Show:';
    
    if (this.config.pagination.allowCustomPageSize) {
      this.pageSizeInput = this._createElement('input', this.config.classes.pageSizeInput);
      this.pageSizeInput.type = 'number';
      this.pageSizeInput.min = '1';
      this.pageSizeInput.value = this.state.pageSize;
      wrapper.appendChild(label);
      wrapper.appendChild(this.pageSizeInput);
    } else {
      this.pageSizeSelect = this._createElement('select', this.config.classes.pageSizeSelect);
      this.config.pagination.pageSizes.forEach(size => {
        const option = this._createElement('option');
        option.value = size;
        option.textContent = size;
        if (size === this.state.pageSize) option.selected = true;
        this.pageSizeSelect.appendChild(option);
      });
      wrapper.appendChild(label);
      wrapper.appendChild(this.pageSizeSelect);
    }
    
    this.topBar.appendChild(wrapper);
  }

  _createHeader() {
    const thead = this._createElement('thead', this.config.classes.thead);
    const tr = this._createElement('tr');
    
    this.config.columns.forEach((column, index) => {
      const th = this._createElement('th', `${this.config.classes.th} ${column.sortable !== false ? this.config.classes.thSortable : ''}`);
      
      // Create header content wrapper
      const headerContent = document.createElement('div');
      headerContent.className = 'flex items-center gap-2';
      headerContent.textContent = column.name;
      
      if (column.sortable !== false) {
        th.dataset.index = index;
        const sortIcon = this._createElement('span', this.config.classes.sortIcon);
        headerContent.appendChild(sortIcon);
      }
      
      th.appendChild(headerContent);
      tr.appendChild(th);
    });
    
    thead.appendChild(tr);
    this.table.appendChild(thead);
  }

  _createPagination() {
    this.pagination = this._createElement('div', this.config.classes.pagination);
    this.paginationInfo = this._createElement('span', this.config.classes.paginationInfo);
    this.bottomBar.appendChild(this.paginationInfo);
    this.bottomBar.appendChild(this.pagination);
  }

  _createExport() {
    this.exportSection = this._createElement('div', this.config.classes.exportSection);
    const exportBar = this._createElement('div', this.config.classes.exportBar);
    
    if (this.config.export.formats.includes('copy')) {
      const copyBtn = this._createElement('button', `${this.config.classes.exportButton} ${this.config.classes.exportButtonCopy}`);
      copyBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        Clipboard
      `;
      copyBtn.addEventListener('click', () => this.copyToClipboard());
      exportBar.appendChild(copyBtn);
    }
    
    if (this.config.export.formats.includes('csv')) {
      const csvBtn = this._createElement('button', `${this.config.classes.exportButton} ${this.config.classes.exportButtonCsv}`);
      csvBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        CSV
      `;
      csvBtn.addEventListener('click', () => this.exportCSV());
      exportBar.appendChild(csvBtn);
    }
    
    this.exportSection.appendChild(exportBar);
    this.container.appendChild(this.exportSection);
  }

  _bindEvents() {
    if (this.config.search.enabled) {
      this.searchInput.addEventListener('input', this._debounce(e => {
        this.state.searchQuery = e.target.value.toLowerCase();
        this.state.currentPage = 1;
        this._filterData();
        this._render();
      }, this.config.search.debounceTime));
    }

    if (this.config.pagination.enabled && !this.config.pagination.allowCustomPageSize) {
      this.pageSizeSelect.addEventListener('change', e => {
        this.state.pageSize = e.target.value === 'All' ? this.state.filteredData.length : parseInt(e.target.value);
        this.state.currentPage = 1;
        this._render();
      });
    }

    if (this.config.sorting.enabled) {
      this.table.querySelector('thead').addEventListener('click', e => {
        const th = e.target.closest('th');
        if (!th || !th.dataset.index) return;
        
        const index = parseInt(th.dataset.index);
        this._sort(index);
      });
    }
  }

  _render() {
    this._renderData();
    this._renderPagination();
  }

  _renderData() {
    this.tbody.innerHTML = '';
    
    if (this.state.filteredData.length === 0) {
      const tr = this._createElement('tr');
      const td = this._createElement('td', this.config.classes.noData);
      td.colSpan = this.config.columns.length;
      td.textContent = this.config.search.noResultsMessage;
      tr.appendChild(td);
      this.tbody.appendChild(tr);
      return;
    }
    
    const data = this._getPaginatedData();
    
    data.forEach(row => {
      const tr = this._createElement('tr', this.config.classes.tr);
      this.config.columns.forEach((column, index) => {
        const td = this._createElement('td', this.config.classes.td);
        const value = this._getNestedValue(row, column.field);
        td.innerHTML = column.formatter ? column.formatter(value, row) : value;
        tr.appendChild(td);
      });
      this.tbody.appendChild(tr);
    });
  }

  _getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => 
      current && current[key] !== undefined ? current[key] : '', obj);
  }

  _renderPagination() {
    if (!this.config.pagination.enabled) return;

    const total = this.state.filteredData.length;
    const pageSize = this.state.pageSize === 'All' ? total : this.state.pageSize;
    const totalPages = Math.ceil(total / pageSize);
    const start = (this.state.currentPage - 1) * pageSize + 1;
    const end = Math.min(start + pageSize - 1, total);

    // Update info text
    this.paginationInfo.textContent = `Showing ${start} to ${end} of ${total} entries`;

    // Update pagination buttons
    this.pagination.innerHTML = '';
    
    // Create page indicator
    const pageIndicator = this._createElement('span', this.config.classes.paginationCurrent);
    pageIndicator.textContent = `Page ${this.state.currentPage} of ${totalPages}`;
    
    const createButton = (label, icon, disabled, onClick) => {
      const btn = this._createElement('button', `${this.config.classes.paginationButton} ${
        disabled ? this.config.classes.paginationButtonDisabled : this.config.classes.paginationButtonEnabled
      }`);
      btn.innerHTML = `${icon} ${label}`;
      btn.disabled = disabled;
      if (!disabled) btn.addEventListener('click', onClick);
      return btn;
    };

    const buttons = [
      {
        label: 'First',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>',
        disabled: this.state.currentPage === 1,
        onClick: () => {
          this.state.currentPage = 1;
          this._render();
        }
      },
      {
        label: 'Previous',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>',
        disabled: this.state.currentPage === 1,
        onClick: () => {
          this.state.currentPage--;
          this._render();
        }
      },
      {
        label: 'Next',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
        disabled: this.state.currentPage === totalPages,
        onClick: () => {
          this.state.currentPage++;
          this._render();
        }
      },
      {
        label: 'Last',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>',
        disabled: this.state.currentPage === totalPages,
        onClick: () => {
          this.state.currentPage = totalPages;
          this._render();
        }
      }
    ];

    buttons.forEach(btn => {
      this.pagination.appendChild(createButton(btn.label, btn.icon, btn.disabled, btn.onClick));
    });
    
    // Insert page indicator between Previous and Next buttons
    this.pagination.insertBefore(pageIndicator, this.pagination.children[2]);
  }

  _filterData() {
    if (!this.state.searchQuery) {
      this.state.filteredData = [...this.state.data];
      return;
    }

    this.state.filteredData = this.state.data.filter(row => {
      return this.config.columns.some(column => {
        const value = this._getNestedValue(row, column.field);
        return value && String(value).toLowerCase().includes(this.state.searchQuery);
      });
    });
  }

  _sort(columnIndex) {
    const column = this.config.columns[columnIndex];
    if (column.sortable === false) return;

    let direction = 'asc';
    if (this.state.sortState && this.state.sortState.index === columnIndex) {
      direction = this.state.sortState.direction === 'asc' ? 'desc' : null;
    }

    // Update sort state
    this.state.sortState = direction ? { index: columnIndex, direction } : null;

    // Update sort indicators
    const headers = this.table.querySelectorAll('th');
    headers.forEach((th, index) => {
      const sortIcon = th.querySelector(`.${this.config.classes.sortIcon}`);
      if (sortIcon) {
        if (index === columnIndex && direction) {
          sortIcon.textContent = direction === 'asc' ? '↑' : '↓';
          th.classList.add(this.config.classes.thSorted);
        } else {
          sortIcon.textContent = '';
          th.classList.remove(this.config.classes.thSorted);
        }
      }
    });

    // Sort data
    if (direction) {
      this.state.filteredData.sort((a, b) => {
        const aVal = this._getNestedValue(a, column.field);
        const bVal = this._getNestedValue(b, column.field);

        if (!isNaN(aVal) && !isNaN(bVal)) {
          return direction === 'asc' 
            ? parseFloat(aVal) - parseFloat(bVal)
            : parseFloat(bVal) - parseFloat(aVal);
        }

        if (direction === 'asc') {
          return String(aVal).localeCompare(String(bVal));
        } else {
          return String(bVal).localeCompare(String(aVal));
        }
      });
    } else {
      this.state.filteredData = [...this.state.data];
    }

    this._render();
  }

  _getPaginatedData() {
    if (this.state.pageSize === 'All') return this.state.filteredData;
    
    const start = (this.state.currentPage - 1) * this.state.pageSize;
    return this.state.filteredData.slice(start, start + this.state.pageSize);
  }

  // Utility methods
  _createElement(tag, className = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    return element;
  }

  _mergeDeep(target, source) {
    const isObject = obj => obj && typeof obj === 'object';
    
    if (!isObject(target) || !isObject(source)) {
      return source;
    }

    Object.keys(source).forEach(key => {
      const targetValue = target[key];
      const sourceValue = source[key];

      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        target[key] = targetValue.concat(sourceValue);
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        target[key] = this._mergeDeep(Object.assign({}, targetValue), sourceValue);
      } else {
        target[key] = sourceValue;
      }
    });

    return target;
  }

  _debounce(func, wait) {
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

  // Public methods
  refresh() {
    this._filterData();
    this._render();
  }

  updateData(newData) {
    this.state.data = newData;
    this.state.filteredData = [...newData];
    this.state.currentPage = 1;
    this.state.sortState = null;
    this.refresh();
  }

  copyToClipboard() {
    const data = this.state.filteredData;
    const headers = this.config.columns.map(col => col.name);
    const rows = data.map(row => 
      this.config.columns.map(col => this._getNestedValue(row, col.field))
    );
    
    const text = [headers, ...rows]
      .map(row => row.join('\t'))
      .join('\n');
    
    navigator.clipboard.writeText(text)
      .then(() => alert('Table data copied to clipboard'))
      .catch(err => console.error('Failed to copy:', err));
  }

  exportCSV(filename = 'export.csv') {
    const data = this.state.filteredData;
    const headers = this.config.columns.map(col => `"${col.name}"`);
    const rows = data.map(row => 
      this.config.columns.map(col => {
        const value = this._getNestedValue(row, col.field);
        return `"${String(value).replace(/"/g, '""')}"`;
      })
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataTable;
} else if (typeof define === 'function' && define.amd) {
  define([], function() { return DataTable; });
} else {
  window.DataTable = DataTable;
}