"use strict";

class DataTable {
  static VERSION = "1.0.0";
  static DEPENDENCIES = {
    tailwind: "https://unpkg.com/@tailwindcss/browser@4",
    jspdf: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    autoTable: "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"
  };

  static async loadDependencies() {
    const loadScript = (url) => {
      return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (document.querySelector(`script[src="${url}"]`)) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = url;
        script.async = true;

        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));

        document.head.appendChild(script);
      });
    };

    try {
      // Load Tailwind first
      await loadScript(DataTable.DEPENDENCIES.tailwind);

      // Load jsPDF
      await loadScript(DataTable.DEPENDENCIES.jspdf);

      // Load autoTable plugin after jsPDF
      await loadScript(DataTable.DEPENDENCIES.autoTable);

      return true;
    } catch (error) {
      console.error('Error loading dependencies:', error);
      throw error;
    }
  }

  static defaultConfig = {
    data: [],
    columns: [],
    pagination: {
      enabled: true,
      pageSize: 10,
      pageSizes: [5, 10, 25, 50, "All"],
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
    },
    classes: {
      container:
          "dt-container max-w-full bg-white rounded-xl shadow-lg overflow-hidden",
      topSection:
          "dt-top p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200",
      topBar: "dt-top-bar flex flex-wrap items-center justify-between gap-4",
      searchWrapper: "dt-search flex-1 min-w-[200px] max-w-md relative",
      searchInput:
          "dt-search-input w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 pl-10",
      searchIcon:
          "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
      pageSizeWrapper: "dt-page-size flex items-center gap-2",
      pageSizeLabel: "dt-page-size-label text-sm text-gray-600",
      pageSizeSelect:
          "dt-page-size-select px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
      pageSizeInput:
          "dt-page-size-input w-20 px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
      tableWrapper: "dt-table-wrapper overflow-x-auto",
      table: "dt-table min-w-full border-collapse",
      thead: "dt-thead bg-gradient-to-r from-gray-50 to-white sticky top-0 ",
      th: "dt-th px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200 bg-white sticky top-0",
      thSortable:
          "dt-th-sortable hover:bg-gray-50 transition-colors duration-200 cursor-pointer select-none",
      thSorted: "dt-th-sorted text-blue-600",
      sortButtons: "dt-sort-buttons ml-2 flex flex-col justify-center gap-0",
      sortButton:
          "dt-sort-button h-3 w-3 text-gray-400 hover:text-gray-600 transition-colors duration-200",
      sortButtonActive:
          "dt-sort-button-active !text-blue-600 bg-blue-50 rounded",
      tbody: "dt-tbody bg-white divide-y divide-gray-100",
      tr: "dt-tr transition-colors duration-200 hover:bg-gray-50",
      td: "dt-td px-6 py-4 text-sm text-gray-600 whitespace-nowrap",
      noData: "dt-no-data text-center py-8 text-gray-500 bg-gray-50 italic",
      bottomSection:
          "dt-bottom p-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200",
      bottomBar:
          "dt-bottom-bar flex flex-wrap items-center justify-between gap-4",
      pagination: "dt-pagination flex items-center gap-2",
      paginationButton:
          "dt-pagination-button px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-1",
      paginationButtonEnabled:
          "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:cursor-pointer",
      paginationButtonDisabled:
          "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed",
      paginationInfo: "dt-pagination-info text-sm text-gray-600",
      paginationCurrent:
          "dt-pagination-current px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium",
      exportSection:
          "dt-export p-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200",
      exportBar: "dt-export-bar flex justify-end gap-2",
      exportButton:
          "dt-export-button px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 hover:cursor-pointer",
      exportButtonCopy:
          "bg-emerald-600 text-white hover:bg-emerald-700 hover:cursor-pointer",
      exportButtonCsv:
          "bg-blue-600 text-white hover:bg-blue-700 hover:cursor-pointer",
      exportButtonPdf: "bg-red-600 text-white hover:bg-red-700 hover:cursor-pointer",
      filterButton:
          "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 shadow-sm",
      filterPanel:
          "dt-filter-panel absolute mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 min-w-[200px]",
      filterHeader:
          "flex justify-between items-center px-4 py-2 border-b border-gray-200",
      filterTitle: "font-semibold text-gray-700",
      filterReset:
          "p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200",
      filterOptionsContainer: "max-h-60 overflow-y-auto py-2",
      filterOption: "flex items-center px-4 py-2 hover:bg-gray-50",
      filterCheckbox:
          "h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500",
      filterLabel: "ml-3 text-sm text-gray-700",
      filterActions:
          "flex justify-center gap-3 px-4 py-3 border-t border-gray-200",
      filterCancelButton:
          "text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300",
      filterApplyButton:
          "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:shadow-md",
      filterIcon:
          "dt-filter-icon ml-2 text-gray-400 hover:text-gray-600 transition-colors duration-200",
      filterIconActive: "text-blue-500 hover:text-blue-600",
    },
  };

  constructor(container, config = {}) {
    // Check if window.jspdf is available (indicating dependencies are loaded)
    if (!window.jspdf && this.config?.export?.formats?.includes('pdf')) {
      throw new Error('Dependencies not loaded. Please call DataTable.loadDependencies() before initializing.');
    }

    this.container =
        typeof container === "string"
            ? document.querySelector(container)
            : container;

    if (!this.container) {
      throw new Error("Container element not found");
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
      searchQuery: "",
      searchTimeout: null,
      filters: {},
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
    this.container.innerHTML = "";
    this.container.className = this.config.classes.container;

    // Create top section
    if (this.config.search.enabled || this.config.pagination.enabled) {
      this.topSection = this._createElement(
          "div",
          this.config.classes.topSection
      );
      this.topBar = this._createElement("div", this.config.classes.topBar);

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
    this.tableWrapper = this._createElement(
        "div",
        this.config.classes.tableWrapper
    );
    this.table = this._createElement("table", this.config.classes.table);
    this._createHeader();
    this.tbody = this._createElement("tbody", this.config.classes.tbody);
    this.table.appendChild(this.tbody);
    this.tableWrapper.appendChild(this.table);
    this.container.appendChild(this.tableWrapper);

    // Create bottom section
    if (this.config.pagination.enabled) {
      this.bottomSection = this._createElement(
          "div",
          this.config.classes.bottomSection
      );
      this.bottomBar = this._createElement(
          "div",
          this.config.classes.bottomBar
      );
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
    const searchWrapper = this._createElement(
        "div",
        this.config.classes.searchWrapper
    );

    // Add search icon
    const searchIcon = this._createElement(
        "span",
        this.config.classes.searchIcon
    );
    searchIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
    searchWrapper.appendChild(searchIcon);

    this.searchInput = this._createElement(
        "input",
        this.config.classes.searchInput
    );
    this.searchInput.type = "text";
    this.searchInput.placeholder = this.config.search.placeholder;
    searchWrapper.appendChild(this.searchInput);
    this.topBar.appendChild(searchWrapper);
  }

  _createPageSize() {
    const wrapper = this._createElement(
        "div",
        this.config.classes.pageSizeWrapper
    );
    const label = this._createElement(
        "label",
        this.config.classes.pageSizeLabel
    );
    label.textContent = "Show:";

    if (this.config.pagination.allowCustomPageSize) {
      this.pageSizeInput = this._createElement(
          "input",
          this.config.classes.pageSizeInput
      );
      this.pageSizeInput.type = "number";
      this.pageSizeInput.min = "1";
      this.pageSizeInput.value = this.state.pageSize;
      wrapper.appendChild(label);
      wrapper.appendChild(this.pageSizeInput);
    } else {
      this.pageSizeSelect = this._createElement(
          "select",
          this.config.classes.pageSizeSelect
      );
      this.config.pagination.pageSizes.forEach((size) => {
        const option = this._createElement("option");
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
    const thead = this._createElement("thead", this.config.classes.thead);
    const tr = this._createElement("tr");

    this.config.columns.forEach((column, index) => {
      const th = this._createElement(
          "th",
          `${this.config.classes.th} ${
              column.sortable !== false ? this.config.classes.thSortable : ""
          }`
      );

      // Create header content wrapper
      const headerContent = document.createElement("div");
      headerContent.className = "flex items-center gap-2";

      // Add column name
      const columnName = document.createElement("span");
      columnName.textContent = column.name;
      headerContent.appendChild(columnName);

      if (column.sortable !== false) {
        th.dataset.index = index;

        // Create sort buttons container
        const sortButtons = this._createElement(
            "div",
            this.config.classes.sortButtons
        );

        // Create ascending sort button
        const ascButton = this._createElement(
            "button",
            this.config.classes.sortButton
        );
        ascButton.innerHTML = this._getSortIcon("asc");
        ascButton.dataset.direction = "asc";
        ascButton.title = "Sort ascending";
        ascButton.addEventListener("click", (e) => {
          e.stopPropagation();
          this._sort(index, "asc");
        });

        // Create descending sort button
        const descButton = this._createElement(
            "button",
            this.config.classes.sortButton
        );
        descButton.innerHTML = this._getSortIcon("desc");
        descButton.dataset.direction = "desc";
        descButton.title = "Sort descending";
        descButton.addEventListener("click", (e) => {
          e.stopPropagation();
          this._sort(index, "desc");
        });

        sortButtons.appendChild(ascButton);
        sortButtons.appendChild(descButton);
        headerContent.appendChild(sortButtons);
      }

      // Add filter button if filtering is enabled and allowed for this column
      if (this.config.filtering.enabled &&
          column.filterable !== false &&
          (!this.config.filtering.excludeActionColumns || !column.actionable)) {
        const filterIcon = this._createElement(
            "span",
            this.config.classes.filterIcon
        );
        filterIcon.innerHTML = this._getFilterIcon();
        filterIcon.addEventListener("click", (e) =>
            this._showFilterPanel(e, column, index)
        );
        headerContent.appendChild(filterIcon);
      }

      th.appendChild(headerContent);
      tr.appendChild(th);
    });

    thead.appendChild(tr);
    this.table.appendChild(thead);
  }

  _createPagination() {
    this.pagination = this._createElement(
        "div",
        this.config.classes.pagination
    );
    this.paginationInfo = this._createElement(
        "span",
        this.config.classes.paginationInfo
    );
    this.bottomBar.appendChild(this.paginationInfo);
    this.bottomBar.appendChild(this.pagination);
  }

  _createExport() {
    this.exportSection = this._createElement(
        "div",
        this.config.classes.exportSection
    );
    const exportBar = this._createElement("div", this.config.classes.exportBar);

    if (this.config.export.formats.includes("copy")) {
      const copyBtn = this._createElement(
          "button",
          `${this.config.classes.exportButton} ${this.config.classes.exportButtonCopy}`
      );
      copyBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        Clipboard
      `;
      copyBtn.addEventListener("click", () => this.copyToClipboard());
      exportBar.appendChild(copyBtn);
    }

    if (this.config.export.formats.includes("csv")) {
      const csvBtn = this._createElement(
          "button",
          `${this.config.classes.exportButton} ${this.config.classes.exportButtonCsv}`
      );
      csvBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        CSV
      `;
      csvBtn.addEventListener("click", () => this.exportCSV());
      exportBar.appendChild(csvBtn);
    }

    if (this.config.export.formats.includes("pdf")) {
      const pdfBtn = this._createElement(
          "button",
          `${this.config.classes.exportButton} ${this.config.classes.exportButtonPdf}`
      );
      pdfBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        PDF
      `;
      pdfBtn.addEventListener("click", async () => {
        pdfBtn.disabled = true;
        try {
          await this.exportPDF();
        } catch (error) {
          console.error('Failed to export PDF:', error);
          alert('Failed to export PDF. Please try again.');
        } finally {
          pdfBtn.disabled = false;
        }
      });
      exportBar.appendChild(pdfBtn);
    }

    this.exportSection.appendChild(exportBar);
    this.container.appendChild(this.exportSection);
  }

  _bindEvents() {
    if (this.config.search.enabled) {
      this.searchInput.addEventListener(
          "input",
          this._debounce((e) => {
            this.state.searchQuery = e.target.value.toLowerCase();
            this.state.currentPage = 1;
            this._filterData();
            this._render();
          }, this.config.search.debounceTime)
      );
    }

    if (
        this.config.pagination.enabled &&
        !this.config.pagination.allowCustomPageSize
    ) {
      this.pageSizeSelect.addEventListener("change", (e) => {
        this.state.pageSize =
            e.target.value === "All"
                ? this.state.filteredData.length
                : parseInt(e.target.value);
        this.state.currentPage = 1;
        this._render();
      });
    }

    if (this.config.sorting.enabled) {
      this.table.querySelector("thead").addEventListener("click", (e) => {
        const th = e.target.closest("th");
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
    this.tbody.innerHTML = "";

    if (this.state.filteredData.length === 0) {
      const tr = this._createElement("tr");
      const td = this._createElement("td", this.config.classes.noData);
      td.colSpan = this.config.columns.length;
      td.textContent = this.config.search.noResultsMessage;
      tr.appendChild(td);
      this.tbody.appendChild(tr);
      return;
    }

    const data = this._getPaginatedData();

    data.forEach((row) => {
      const tr = this._createElement("tr", this.config.classes.tr);
      this.config.columns.forEach((column, index) => {
        const td = this._createElement("td", this.config.classes.td);
        const value = this._getNestedValue(row, column.field);
        td.innerHTML = column.formatter ? column.formatter(value, row) : value;
        tr.appendChild(td);
      });
      this.tbody.appendChild(tr);
    });
  }

  _getNestedValue(obj, path) {
    const value = path
        .split(".")
        .reduce(
            (current, key) =>
                current && current[key] !== undefined ? current[key] : undefined,
            obj
        );
    return value ?? this.config.display.nullValue;
  }

  _renderPagination() {
    if (!this.config.pagination.enabled) return;

    const total = this.state.filteredData.length;
    const pageSize = this.state.pageSize === "All" ? total : parseInt(this.state.pageSize);
    const totalPages = Math.ceil(total / pageSize);
    const start = (this.state.currentPage - 1) * pageSize + 1;
    const end = Math.min(start + pageSize - 1, total);

    // Update info text
    this.paginationInfo.textContent = `Showing ${start} to ${end} of ${total} entries`;

    // Clear existing pagination
    this.pagination.innerHTML = '';

    // Create page indicator
    const pageIndicator = this._createElement(
        "span",
        this.config.classes.paginationCurrent
    );
    pageIndicator.textContent = `Page ${this.state.currentPage} of ${totalPages}`;

    const createButton = (label, icon, disabled, onClick) => {
      const btn = this._createElement(
          "button",
          `${this.config.classes.paginationButton} ${
              disabled
                  ? this.config.classes.paginationButtonDisabled
                  : this.config.classes.paginationButtonEnabled
          }`
      );
      btn.innerHTML = `${icon} ${label}`;
      btn.disabled = disabled;
      if (!disabled) {
        btn.addEventListener("click", onClick);
      }
      return btn;
    };

    // First page button
    this.pagination.appendChild(
        createButton(
            "First",
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>',
            this.state.currentPage === 1,
            () => {
              this.state.currentPage = 1;
              this._render();
            }
        )
    );

    // Previous page button
    this.pagination.appendChild(
        createButton(
            "Previous",
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>',
            this.state.currentPage === 1,
            () => {
              this.state.currentPage--;
              this._render();
            }
        )
    );

    // Add page indicator
    this.pagination.appendChild(pageIndicator);

    // Next page button
    this.pagination.appendChild(
        createButton(
            "Next",
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
            this.state.currentPage === totalPages,
            () => {
              this.state.currentPage++;
              this._render();
            }
        )
    );

    // Last page button
    this.pagination.appendChild(
        createButton(
            "Last",
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>',
            this.state.currentPage === totalPages,
            () => {
              this.state.currentPage = totalPages;
              this._render();
            }
        )
    );
  }

  _filterData() {
    // Start with the original data
    this.state.filteredData = [...this.state.data];

    // Apply filters if they exist
    if (this.state.filters && Object.keys(this.state.filters).length > 0) {
      this.state.filteredData = this.state.filteredData.filter(row => {
        return Object.entries(this.state.filters).every(([field, values]) => {
          if (!values || values.length === 0) return true;
          const value = this._getNestedValue(row, field) || this.config.display.nullValue;
          return values.includes(value);
        });
      });
    }

    // Apply search if it exists
    if (this.state.searchQuery) {
      const searchableColumns = this.config.search.excludeActionColumns
          ? this._getNonActionColumns()
          : this.config.columns;

      this.state.filteredData = this.state.filteredData.filter(row => {
        return searchableColumns.some(column => {
          const value = this._getNestedValue(row, column.field);
          return value && String(value).toLowerCase().includes(this.state.searchQuery.toLowerCase());
        });
      });
    }
  }

  _sort(columnIndex, direction) {
    const column = this.config.columns[columnIndex];
    if (column.sortable === false ||
        (this.config.sorting.excludeActionColumns && column.actionable)) {
      return;
    }

    // Reset all sort indicators
    const headers = this.table.querySelectorAll('th');
    headers.forEach(th => {
      const thSortedClasses = this.config.classes.thSorted.split(' ');
      th.classList.remove(...thSortedClasses);
      const buttons = th.querySelectorAll('button');
      buttons.forEach(btn => {
        const sortButtonActiveClasses = this.config.classes.sortButtonActive.split(' ');
        btn.classList.remove(...sortButtonActiveClasses);
      });
    });

    // Set new sort state
    this.state.sortState = { index: columnIndex, direction };

    // Add active classes
    const currentHeader = this.table.querySelector(`th[data-index="${columnIndex}"]`);
    if (currentHeader) {
      const thSortedClasses = this.config.classes.thSorted.split(' ');
      currentHeader.classList.add(...thSortedClasses);
      const button = currentHeader.querySelector(`button[data-direction="${direction}"]`);
      if (button) {
        const sortButtonActiveClasses = this.config.classes.sortButtonActive.split(' ');
        button.classList.add(...sortButtonActiveClasses);
      }
    }

    // Sort the data
    this.state.filteredData.sort((a, b) => {
      const aVal = this._getNestedValue(a, column.field);
      const bVal = this._getNestedValue(b, column.field);

      // Handle nulls
      if (aVal === this.config.display.nullValue) return 1;
      if (bVal === this.config.display.nullValue) return -1;

      // Handle numbers
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // Handle strings
      const comparison = String(aVal).localeCompare(String(bVal));
      return direction === 'asc' ? comparison : -comparison;
    });

    // Reset to first page when sorting
    this.state.currentPage = 1;
    this._render();
  }

  _getPaginatedData() {
    if (!this.config.pagination.enabled || this.state.pageSize === "All") {
      return this.state.filteredData;
    }

    const pageSize = parseInt(this.state.pageSize);
    const start = (this.state.currentPage - 1) * pageSize;
    return this.state.filteredData.slice(start, start + pageSize);
  }

  // Utility methods
  _createElement(tag, className = "") {
    const element = document.createElement(tag);
    if (className) element.className = className;
    return element;
  }

  _mergeDeep(target, source) {
    const isObject = (obj) => obj && typeof obj === "object";

    if (!isObject(target) || !isObject(source)) {
      return source;
    }

    Object.keys(source).forEach((key) => {
      const targetValue = target[key];
      const sourceValue = source[key];

      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        target[key] = targetValue.concat(sourceValue);
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        target[key] = this._mergeDeep(
            Object.assign({}, targetValue),
            sourceValue
        );
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

  _getSortIcon(direction) {
    switch (direction) {
      case "asc":
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414l-3.293 3.293a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>`;
      case "desc":
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 15.586l3.293-3.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>`;
    }
  }

  _getFilterIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
    </svg>`;
  }

  _getExportableColumns() {
    return this.config.columns.filter(column =>
        column.exportable !== false &&
        (!this.config.export.excludeActionColumns || column.actionable !== true)
    );
  }

  _getNonActionColumns() {
    return this.config.columns.filter(column => !column.actionable);
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
    const exportableColumns = this._getExportableColumns();
    const headers = exportableColumns.map((col) => col.name);
    const rows = data.map((row) =>
        exportableColumns.map((col) => this._getNestedValue(row, col.field))
    );

    const text = [headers, ...rows].map((row) => row.join("\t")).join("\n");

    navigator.clipboard
        .writeText(text)
        .then(() => alert("Table data copied to clipboard"))
        .catch((err) => console.error("Failed to copy:", err));
  }

  exportCSV(filename = "export.csv") {
    const data = this.state.filteredData;
    const exportableColumns = this._getExportableColumns();
    const headers = exportableColumns.map((col) => `"${col.name}"`);
    const rows = data.map((row) =>
        exportableColumns.map((col) => {
          const value = this._getNestedValue(row, col.field);
          return `"${String(value).replace(/"/g, '""')}"`;
        })
    );

    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }

  async exportPDF(filename = 'table-export.pdf') {
    // Ensure dependencies are loaded
    try {
      await DataTable.loadDependencies();
    } catch (error) {
      console.error('Failed to load PDF export dependencies:', error);
      alert('Failed to load PDF export dependencies. Please try again.');
      return;
    }

    // Get table data
    const exportableColumns = this._getExportableColumns();
    const headers = exportableColumns.map(col => col.name);
    const rows = this.state.filteredData.map(row =>
        exportableColumns.map(col => this._getNestedValue(row, col.field))
    );

    // Create PDF document
    const pdf = new window.jspdf.jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4'
    });

    // Get page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;
    const usableWidth = pageWidth - (margin * 2);

    // Calculate optimal column widths based on content and available space
    const columnWidths = headers.map((header, index) => {
      const maxContentLength = Math.max(
          header.length,
          ...rows.map(row => String(row[index]).length)
      );
      // Base width on character count but ensure minimum width
      return Math.max(40, maxContentLength * 5.5);
    });

    // Calculate total table width
    const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);

    // Scale factor to fit table within page width if necessary
    const scaleFactor = Math.min(1, usableWidth / totalWidth);

    // Apply scale factor to column widths
    const adjustedColumnWidths = columnWidths.map(width => width * scaleFactor);

    // PDF styling
    const style = {
      headStyles: {
        fillColor: [248, 250, 252],
        textColor: [30, 41, 59],
        fontSize: 9,
        fontStyle: 'bold',
        cellPadding: 4
      },
      bodyStyles: {
        textColor: [51, 65, 85],
        fontSize: 8,
        cellPadding: 4
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      styles: {
        overflow: 'linebreak',
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 4,
        lineColor: [228, 228, 228],
        lineWidth: 0.5
      },
      margin: {
        top: margin,
        right: margin,
        bottom: margin,
        left: margin
      }
    };

    // Configure auto table
    pdf.autoTable({
      head: [headers],
      body: rows,
      startY: style.margin.top,
      margin: style.margin,
      headStyles: style.headStyles,
      bodyStyles: style.bodyStyles,
      alternateRowStyles: style.alternateRowStyles,
      columnStyles: adjustedColumnWidths.reduce((acc, width, index) => {
        acc[index] = {
          cellWidth: width,
          halign: typeof rows[0]?.[index] === 'number' ? 'right' : 'left' // Align numbers to right
        };
        return acc;
      }, {}),
      styles: style.styles,
      didDrawPage: function(data) {
        // Add page number at the bottom
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
            `Page ${data.pageNumber} of ${data.pageCount}`,
            data.settings.margin.left,
            pageHeight - (margin / 2)
        );
      }
    });

    // Save the PDF
    pdf.save(filename);
  }

  // Add new methods for filtering
  _showFilterPanel(event, column, columnIndex) {
    // Don't show filter panel for action columns if excluded
    if (this.config.filtering.excludeActionColumns && column.actionable) {
      return;
    }

    event.stopPropagation();

    // Remove any existing filter panels
    const existingPanel = document.querySelector(".dt-filter-panel");
    if (existingPanel) existingPanel.remove();

    // Get unique values for this column
    const uniqueValues = [
      ...new Set(
          this.state.data.map(
              (row) =>
                  this._getNestedValue(row, column.field) ||
                  this.config.display.nullValue
          )
      ),
    ].sort();

    // Create filter panel
    const panel = this._createElement("div", this.config.classes.filterPanel);

    // Position the panel below the header
    const headerCell = event.target.closest("th");
    const headerRect = headerCell.getBoundingClientRect();
    panel.style.left = `${headerRect.left}px`;
    panel.style.top = `${headerRect.bottom + window.scrollY}px`;
    panel.style.minWidth = `${headerRect.width}px`;

    // Add filter header
    const filterHeader = this._createElement(
        "div",
        this.config.classes.filterHeader
    );
    const filterTitle = this._createElement(
        "span",
        this.config.classes.filterTitle
    );
    filterTitle.textContent = `Filter ${column.name}`;

    const resetButton = this._createElement('button', this.config.classes.filterReset);
    resetButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>`;
    resetButton.title = 'Reset filters';
    resetButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event bubbling

      // Reset filters for this column and update state
      if (this.state.filters) {
        delete this.state.filters[column.field];

        // If no filters left, clean up the filters object
        if (Object.keys(this.state.filters).length === 0) {
          this.state.filters = {};
        }
      }

      // Reset filtered data to original data
      this.state.filteredData = [...this.state.data];

      // Apply remaining filters if any
      this._filterData();

      // Update the UI
      this._updateFilterIcon(column.field);
      this._render();

      // Close the panel
      panel.remove();
    });

    filterHeader.appendChild(filterTitle);
    filterHeader.appendChild(resetButton);
    panel.appendChild(filterHeader);

    // Add options container
    const optionsContainer = this._createElement(
        "div",
        this.config.classes.filterOptionsContainer
    );

    // Add filter options
    uniqueValues.forEach((value) => {
      const option = this._createElement(
          "div",
          this.config.classes.filterOption
      );

      const checkbox = this._createElement(
          "input",
          this.config.classes.filterCheckbox
      );
      checkbox.type = "checkbox";
      checkbox.checked =
          this.state.filters?.[column.field]?.includes(value) || false;

      const label = this._createElement(
          "label",
          this.config.classes.filterLabel
      );
      label.textContent = value;

      option.appendChild(checkbox);
      option.appendChild(label);

      option.addEventListener("click", (e) => {
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
        }
        this._applyFilter(column.field, value);
      });

      optionsContainer.appendChild(option);
    });

    panel.appendChild(optionsContainer);

    // Add action buttons
    const actionContainer = this._createElement(
        "div",
        this.config.classes.filterActions
    );

    const cancelButton = this._createElement(
        "button",
        `${this.config.classes.filterButton} ${this.config.classes.filterCancelButton}`
    );
    cancelButton.innerHTML = `
      <span class="inline-flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
        Cancel
      </span>`;
    cancelButton.addEventListener("click", () => panel.remove());

    const applyButton = this._createElement(
        "button",
        `${this.config.classes.filterButton} ${this.config.classes.filterApplyButton}`
    );
    applyButton.innerHTML = `
      <span class="inline-flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        Apply
      </span>`;
    applyButton.addEventListener("click", () => {
      this._filterData();
      this._render();
      panel.remove();
    });

    actionContainer.appendChild(cancelButton);
    actionContainer.appendChild(applyButton);
    panel.appendChild(actionContainer);

    document.body.appendChild(panel);

    // Close panel when clicking outside
    document.addEventListener("click", function closePanel(e) {
      if (!panel.contains(e.target) && !event.target.contains(e.target)) {
        panel.remove();
        document.removeEventListener("click", closePanel);
      }
    });
  }

  _applyFilter(field, value) {
    if (!this.state.filters) this.state.filters = {};
    if (!this.state.filters[field]) this.state.filters[field] = [];

    const index = this.state.filters[field].indexOf(value);
    if (index === -1) {
      this.state.filters[field].push(value);
    } else {
      this.state.filters[field].splice(index, 1);
    }

    // Remove the filter if no values are selected
    if (this.state.filters[field].length === 0) {
      delete this.state.filters[field];
    }

    // Update the filter icon state
    this._updateFilterIcon(field);
  }

  _updateFilterIcon(field) {
    const columnIndex = this.config.columns.findIndex(
        (col) => col.field === field
    );
    if (columnIndex === -1) return;

    const th = this.table.querySelector(`th[data-index="${columnIndex}"]`);
    const filterIcon = th.querySelector(".dt-filter-icon");

    if (filterIcon) {
      const hasActiveFilters = this.state.filters?.[field]?.length > 0;
      const activeClasses = this.config.classes.filterIconActive.split(' ');

      if (hasActiveFilters) {
        filterIcon.classList.add(...activeClasses);
      } else {
        filterIcon.classList.remove(...activeClasses);
      }
    }
  }
}

// Export for both CommonJS and ES modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = DataTable;
} else if (typeof define === "function" && define.amd) {
  define([], function () {
    return DataTable;
  });
} else {
  window.DataTable = DataTable;
}
