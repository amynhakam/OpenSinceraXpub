/**
 * OpenSincera X Publisher Dashboard - Dashboard Module
 * Handles UI rendering and state management
 */

const Dashboard = {
    // Store current data
    data: null,
    
    // Track if event listeners have been set up
    listenersInitialized: false,
    
    // Current publisher ID
    currentPublisherId: null,
    
    // Date range for data filtering
    dateRange: {
        startDate: null,
        endDate: null
    },
    
    // Pagination state
    pagination: {
        adSystems: { page: 0, filtered: [] },
        prebidModules: { page: 0, filtered: [], sortKey: 'detected_count', sortDir: 'desc' }
    },
    
    /**
     * Initialize dashboard with data
     * @param {Object} data - Dashboard data from API
     * @param {number|string} publisherId - Publisher ID
     */
    init(data, publisherId) {
        this.data = data;
        this.currentPublisherId = publisherId;
        this.pagination.adSystems.filtered = data.adSystems || [];
        this.pagination.prebidModules.filtered = data.prebidModules || [];
        
        // Sort prebid modules by detection count initially
        this.pagination.prebidModules.filtered.sort((a, b) => b.detected_count - a.detected_count);
        
        this.initializeDatePickers();
        this.render();
        this.updateSearchStatus(publisherId);
        
        // Only setup event listeners once
        if (!this.listenersInitialized) {
            this.setupEventListeners();
            this.listenersInitialized = true;
        }
    },
    
    /**
     * Update the search status display
     * @param {number|string} publisherId - Publisher ID
     */
    updateSearchStatus(publisherId) {
        const searchStatus = document.getElementById('searchStatus');
        const currentPublisherId = document.getElementById('currentPublisherId');
        
        if (searchStatus && currentPublisherId) {
            searchStatus.classList.remove('hidden');
            currentPublisherId.textContent = `Publisher ID: ${publisherId}`;
        }
    },
    
    /**
     * Initialize date pickers with default values
     */
    initializeDatePickers() {
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (!startDateInput || !endDateInput) return;
        
        // If dates are already set (from a preset or user input), preserve them
        if (this.dateRange.startDate && this.dateRange.endDate) {
            startDateInput.value = this.dateRange.startDate;
            endDateInput.value = this.dateRange.endDate;
            return;
        }
        
        // Set default date range (last 30 days)
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        // Format dates for input
        const formatDate = (date) => date.toISOString().split('T')[0];
        
        // Use ecosystem date if available as the end date
        if (this.data?.ecosystem?.date) {
            const ecosystemDate = new Date(this.data.ecosystem.date);
            endDateInput.value = formatDate(ecosystemDate);
            
            // Set start date to 30 days before ecosystem date
            const startDate = new Date(ecosystemDate);
            startDate.setDate(ecosystemDate.getDate() - 30);
            startDateInput.value = formatDate(startDate);
        } else {
            endDateInput.value = formatDate(today);
            startDateInput.value = formatDate(thirtyDaysAgo);
        }
        
        // Store the date range
        this.dateRange.startDate = startDateInput.value;
        this.dateRange.endDate = endDateInput.value;
    },
    
    /**
     * Render all dashboard components
     */
    render() {
        this.renderPublisherBanner();
        this.renderMetricsCards();
        this.renderEcosystemStats();
        this.renderBenchmarks();
        this.renderAdSystemsTable();
        this.renderPrebidModulesTable();
        this.renderCharts();
        this.updateTimestamp();
    },
    
    /**
     * Render publisher info banner
     */
    renderPublisherBanner() {
        const publisher = this.data?.publisher;
        if (!publisher) return;
        
        document.getElementById('publisherName').textContent = publisher.name || 'Unknown Publisher';
        document.getElementById('publisherDomain').textContent = publisher.domain || '--';
        document.getElementById('publisherDescription').textContent = publisher.pub_description || 'No description available';
        
        // Render categories
        const categoriesContainer = document.getElementById('publisherCategories');
        categoriesContainer.innerHTML = '';
        
        if (publisher.categories && publisher.categories.length > 0) {
            publisher.categories.slice(0, 5).forEach(category => {
                const badge = document.createElement('span');
                badge.className = 'category-badge';
                badge.textContent = category;
                categoriesContainer.appendChild(badge);
            });
            
            if (publisher.categories.length > 5) {
                const more = document.createElement('span');
                more.className = 'category-badge';
                more.textContent = `+${publisher.categories.length - 5} more`;
                categoriesContainer.appendChild(more);
            }
        }
    },
    
    /**
     * Render key metrics cards
     */
    renderMetricsCards() {
        const publisher = this.data?.publisher;
        const grid = document.getElementById('metricsGrid');
        if (!grid || !publisher) return;
        
        const metrics = [
            { key: 'avg_ads_in_view', value: publisher.avg_ads_in_view, icon: this.getIcon('eye') },
            { key: 'avg_ad_refresh', value: publisher.avg_ad_refresh, icon: this.getIcon('refresh') },
            { key: 'avg_page_weight', value: publisher.avg_page_weight, icon: this.getIcon('weight') },
            { key: 'avg_cpu', value: publisher.avg_cpu, icon: this.getIcon('cpu') },
            { key: 'total_unique_gpids', value: publisher.total_unique_gpids, icon: this.getIcon('tag') },
            { key: 'id_absorption_rate', value: publisher.id_absorption_rate, icon: this.getIcon('fingerprint') },
            { key: 'total_supply_paths', value: publisher.total_supply_paths, icon: this.getIcon('route') },
            { key: 'reseller_count', value: publisher.reseller_count, icon: this.getIcon('users') }
        ];
        
        grid.innerHTML = metrics.map(metric => {
            const config = CONFIG.metrics[metric.key];
            const formattedValue = this.formatMetricValue(metric.value, config);
            const benchmark = CONFIG.industryBenchmarks[metric.key];
            const trend = this.calculateTrend(metric.value, benchmark, metric.key);
            
            return `
                <div class="metric-card bg-zone-card rounded-xl p-5 border border-zone-accent">
                    <div class="flex items-start justify-between">
                        <div class="w-10 h-10 rounded-lg bg-zone-accent flex items-center justify-center text-zone-blue">
                            ${metric.icon}
                        </div>
                        ${trend.html}
                    </div>
                    <div class="mt-4">
                        <div class="metric-value text-white">${formattedValue}</div>
                        <div class="metric-label">${config?.label || metric.key}</div>
                    </div>
                    <div class="mt-2 text-xs text-gray-500" title="${config?.description || ''}">
                        ${config?.description?.substring(0, 50) || ''}...
                    </div>
                </div>
            `;
        }).join('');
    },
    
    /**
     * Render ecosystem statistics
     */
    renderEcosystemStats() {
        const ecosystem = this.data?.ecosystem;
        const publisher = this.data?.publisher;
        const grid = document.getElementById('ecosystemGrid');
        if (!grid || !ecosystem) return;
        
        // Update date
        document.getElementById('ecosystemDate').textContent = 
            ecosystem.date ? `Data from ${ecosystem.date}` : '--';
        
        const stats = [
            { label: 'Ad Systems', value: ecosystem.known_adsystems },
            { label: 'Global GPIDs', value: ecosystem.global_gpids },
            { label: 'Ecosystem Size', value: ecosystem.sincera_ecosystem_size },
            { label: 'Pubs w/ GPID', value: ecosystem.pubs_with_gpid },
            { label: 'Video Plcmt Pubs', value: ecosystem.video_plcmt_pubs },
            { label: 'Avg User Modules', value: ecosystem.avg_user_modules_deployed },
            { label: 'Avg Ads In View', value: publisher?.avg_ads_in_view, format: 'decimal' },
            { label: 'Avg Ad Refresh', value: publisher?.avg_ad_refresh, format: 'seconds' },
            { label: 'Avg Page Weight', value: publisher?.avg_page_weight, format: 'mb' }
        ];
        
        grid.innerHTML = stats.map(stat => {
            let formattedValue;
            if (stat.format === 'mb') {
                formattedValue = stat.value != null ? `${stat.value.toFixed(2)} MB` : '--';
            } else if (stat.format === 'seconds') {
                formattedValue = stat.value != null ? `${stat.value.toFixed(2)}s` : '--';
            } else if (stat.format === 'decimal') {
                formattedValue = stat.value != null ? stat.value.toFixed(2) : '--';
            } else if (stat.format === 'percentage') {
                formattedValue = stat.value != null ? `${(stat.value * 100).toFixed(1)}%` : '--';
            } else {
                formattedValue = this.formatNumber(stat.value);
            }
            return `
                <div class="ecosystem-stat">
                    <div class="ecosystem-stat-value">${formattedValue}</div>
                    <div class="ecosystem-stat-label">${stat.label}</div>
                </div>
            `;
        }).join('');
    },
    
    /**
     * Render industry benchmarks section
     */
    renderBenchmarks() {
        const grid = document.getElementById('benchmarksGrid');
        if (!grid) return;
        
        const benchmarks = [
            { key: 'avg_ads_in_view', label: 'Avg Ads in View', value: CONFIG.industryBenchmarks.avg_ads_in_view, format: 'decimal' },
            { key: 'avg_ad_refresh', label: 'Avg Ad Refresh', value: CONFIG.industryBenchmarks.avg_ad_refresh, format: 'seconds' },
            { key: 'avg_page_weight', label: 'Avg Page Weight', value: CONFIG.industryBenchmarks.avg_page_weight, format: 'mb' },
            { key: 'avg_cpu', label: 'Avg CPU Usage', value: CONFIG.industryBenchmarks.avg_cpu, format: 'seconds' },
            { key: 'id_absorption_rate', label: 'ID Absorption Rate', value: CONFIG.industryBenchmarks.id_absorption_rate, format: 'percentage' }
        ];
        
        grid.innerHTML = benchmarks.map(benchmark => {
            let formattedValue;
            if (benchmark.value == null) {
                formattedValue = '--';
            } else if (benchmark.format === 'percentage') {
                formattedValue = (benchmark.value * 100).toFixed(1) + '%';
            } else if (benchmark.format === 'seconds') {
                formattedValue = benchmark.value.toFixed(1) + 's';
            } else if (benchmark.format === 'mb') {
                formattedValue = benchmark.value.toFixed(2) + ' MB';
            } else {
                formattedValue = benchmark.value.toFixed(2);
            }
            return `
                <div class="ecosystem-stat">
                    <div class="ecosystem-stat-value">${formattedValue}</div>
                    <div class="ecosystem-stat-label">${benchmark.label}</div>
                </div>
            `;
        }).join('');
    },
    
    /**
     * Render ad systems table
     */
    renderAdSystemsTable() {
        const tbody = document.getElementById('adSystemsTableBody');
        const countEl = document.getElementById('adSystemsCount');
        if (!tbody) return;
        
        const { page, filtered } = this.pagination.adSystems;
        const perPage = CONFIG.dashboard.pagination.adSystemsPerPage;
        const start = page * perPage;
        const end = start + perPage;
        const pageData = filtered.slice(start, end);
        
        if (pageData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-8 text-gray-500">
                        No ad systems found
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = pageData.map(system => `
                <tr class="border-b border-zone-accent/50">
                    <td class="py-3 px-4">
                        ${system.image?.url 
                            ? `<img src="${system.image.url}" alt="${system.name}" class="ad-system-logo" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%230078D4%22><rect width=%2224%22 height=%2224%22 rx=%224%22/></svg>'">`
                            : `<div class="ad-system-logo flex items-center justify-center text-xs text-gray-400">${system.name?.charAt(0) || '?'}</div>`
                        }
                    </td>
                    <td class="py-3 px-4 font-medium text-white">${system.name || 'Unknown'}</td>
                    <td class="py-3 px-4 text-gray-400">${system.canonical_domain || '--'}</td>
                    <td class="py-3 px-4 text-gray-400 line-clamp-2 max-w-md">${system.description || '--'}</td>
                </tr>
            `).join('');
        }
        
        countEl.textContent = `Showing ${start + 1}-${Math.min(end, filtered.length)} of ${filtered.length} ad systems`;
        
        // Update pagination buttons
        document.getElementById('adSystemsPrev').disabled = page === 0;
        document.getElementById('adSystemsNext').disabled = end >= filtered.length;
    },
    
    /**
     * Render Prebid modules table
     */
    renderPrebidModulesTable() {
        const tbody = document.getElementById('prebidModulesTableBody');
        const countEl = document.getElementById('prebidModulesCount');
        if (!tbody) return;
        
        const { page, filtered } = this.pagination.prebidModules;
        const perPage = CONFIG.dashboard.pagination.prebidModulesPerPage;
        const start = page * perPage;
        const end = start + perPage;
        const pageData = filtered.slice(start, end);
        
        // Find max detection count for bar scaling
        const maxDetected = Math.max(...filtered.map(m => m.detected_count || 0), 1);
        
        if (pageData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-8 text-gray-500">
                        No modules found
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = pageData.map(module => {
                const barWidth = ((module.detected_count || 0) / maxDetected * 100).toFixed(1);
                return `
                    <tr class="border-b border-zone-accent/50">
                        <td class="py-3 px-4 font-medium text-white">${module.module_name || 'Unknown'}</td>
                        <td class="py-3 px-4">
                            <span class="module-category ${module.module_category || 'other'}">${module.module_category || 'other'}</span>
                        </td>
                        <td class="py-3 px-4">
                            <div class="text-white">${this.formatNumber(module.detected_count)}</div>
                            <div class="detection-bar">
                                <div class="detection-bar-fill" style="width: ${barWidth}%"></div>
                            </div>
                        </td>
                        <td class="py-3 px-4 text-gray-400">${module.adsystem_id || '--'}</td>
                    </tr>
                `;
            }).join('');
        }
        
        countEl.textContent = `Showing ${start + 1}-${Math.min(end, filtered.length)} of ${filtered.length} modules`;
        
        // Update pagination buttons
        document.getElementById('prebidPrev').disabled = page === 0;
        document.getElementById('prebidNext').disabled = end >= filtered.length;
    },
    
    /**
     * Render all charts
     */
    renderCharts() {
        const publisher = this.data?.publisher;
        const ecosystem = this.data?.ecosystem;
        
        // Device metrics chart
        Charts.renderDeviceMetricsChart(publisher?.device_level_metrics);
        
        // Industry comparison chart
        Charts.renderIndustryComparisonChart(publisher, CONFIG.industryBenchmarks);
        
        // Prebid versions chart
        Charts.renderPrebidVersionsChart(ecosystem?.pbjs_major_versions);
        
        // Media types chart
        Charts.renderMediaTypesChart(ecosystem?.pbjs_ad_unit_media_types);
    },
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Date range apply button
        const applyDateRangeBtn = document.getElementById('applyDateRange');
        if (applyDateRangeBtn) {
            applyDateRangeBtn.addEventListener('click', () => {
                this.onDateRangeChange();
            });
        }
        
        // Also apply on Enter key in date inputs
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        [startDateInput, endDateInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.onDateRangeChange();
                    }
                });
            }
        });
        
        // Date range presets dropdown
        const dateRangePresetsBtn = document.getElementById('dateRangePresets');
        const dateRangeDropdown = document.getElementById('dateRangeDropdown');
        
        if (dateRangePresetsBtn && dateRangeDropdown) {
            // Toggle dropdown on click
            dateRangePresetsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isHidden = dateRangeDropdown.classList.contains('hidden');
                dateRangeDropdown.classList.toggle('hidden', !isHidden);
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dateRangePresetsBtn.contains(e.target) && !dateRangeDropdown.contains(e.target)) {
                    dateRangeDropdown.classList.add('hidden');
                }
            });
            
            // Handle preset selection
            dateRangeDropdown.querySelectorAll('button[data-range]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const range = btn.dataset.range;
                    dateRangeDropdown.classList.add('hidden');
                    this.applyDatePreset(range);
                });
            });
        }
        
        // Ad systems search
        const adSystemSearch = document.getElementById('adSystemSearch');
        if (adSystemSearch) {
            adSystemSearch.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                this.pagination.adSystems.filtered = this.data.adSystems.filter(s => 
                    s.name?.toLowerCase().includes(query) || 
                    s.canonical_domain?.toLowerCase().includes(query)
                );
                this.pagination.adSystems.page = 0;
                this.renderAdSystemsTable();
            });
        }
        
        // Prebid category filter
        const prebidFilter = document.getElementById('prebidCategoryFilter');
        if (prebidFilter) {
            prebidFilter.addEventListener('change', (e) => {
                const category = e.target.value;
                this.pagination.prebidModules.filtered = category
                    ? this.data.prebidModules.filter(m => m.module_category === category)
                    : [...this.data.prebidModules];
                this.pagination.prebidModules.filtered.sort((a, b) => b.detected_count - a.detected_count);
                this.pagination.prebidModules.page = 0;
                this.renderPrebidModulesTable();
            });
        }
        
        // Pagination buttons
        document.getElementById('adSystemsPrev')?.addEventListener('click', () => {
            if (this.pagination.adSystems.page > 0) {
                this.pagination.adSystems.page--;
                this.renderAdSystemsTable();
            }
        });
        
        document.getElementById('adSystemsNext')?.addEventListener('click', () => {
            const maxPage = Math.ceil(this.pagination.adSystems.filtered.length / CONFIG.dashboard.pagination.adSystemsPerPage) - 1;
            if (this.pagination.adSystems.page < maxPage) {
                this.pagination.adSystems.page++;
                this.renderAdSystemsTable();
            }
        });
        
        document.getElementById('prebidPrev')?.addEventListener('click', () => {
            if (this.pagination.prebidModules.page > 0) {
                this.pagination.prebidModules.page--;
                this.renderPrebidModulesTable();
            }
        });
        
        document.getElementById('prebidNext')?.addEventListener('click', () => {
            const maxPage = Math.ceil(this.pagination.prebidModules.filtered.length / CONFIG.dashboard.pagination.prebidModulesPerPage) - 1;
            if (this.pagination.prebidModules.page < maxPage) {
                this.pagination.prebidModules.page++;
                this.renderPrebidModulesTable();
            }
        });
        
        // Export buttons
        document.getElementById('exportMetricsBtn')?.addEventListener('click', () => {
            Export.exportPublisherMetrics(this.data?.publisher);
        });
        
        document.getElementById('exportAdSystemsBtn')?.addEventListener('click', () => {
            Export.exportAdSystems(this.pagination.adSystems.filtered);
        });
        
        document.getElementById('exportPrebidBtn')?.addEventListener('click', () => {
            Export.exportPrebidModules(this.pagination.prebidModules.filtered);
        });
        
        // Table header sorting for prebid modules
        document.querySelectorAll('#prebidModulesTableBody').forEach(table => {
            table.closest('table')?.querySelectorAll('th[data-sort]').forEach(th => {
                th.addEventListener('click', () => {
                    const key = th.dataset.sort;
                    const { sortKey, sortDir } = this.pagination.prebidModules;
                    
                    if (sortKey === key) {
                        this.pagination.prebidModules.sortDir = sortDir === 'asc' ? 'desc' : 'asc';
                    } else {
                        this.pagination.prebidModules.sortKey = key;
                        this.pagination.prebidModules.sortDir = 'desc';
                    }
                    
                    const dir = this.pagination.prebidModules.sortDir === 'asc' ? 1 : -1;
                    this.pagination.prebidModules.filtered.sort((a, b) => {
                        const aVal = a[key] || 0;
                        const bVal = b[key] || 0;
                        if (typeof aVal === 'string') return aVal.localeCompare(bVal) * dir;
                        return (aVal - bVal) * dir;
                    });
                    
                    this.pagination.prebidModules.page = 0;
                    this.renderPrebidModulesTable();
                });
            });
        });
    },
    
    /**
     * Update last updated timestamp
     */
    updateTimestamp() {
        const timeEl = document.getElementById('updateTime');
        const dataDateEl = document.getElementById('dataDate');
        
        if (timeEl && this.data?.fetchedAt) {
            const date = new Date(this.data.fetchedAt);
            timeEl.textContent = date.toLocaleTimeString();
        }
    },
    
    /**
     * Apply a date preset and update the inputs
     */
    applyDatePreset(preset) {
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (!startDateInput || !endDateInput) return;
        
        const today = new Date();
        const formatDate = (date) => date.toISOString().split('T')[0];
        
        let startDate, endDate;
        
        switch (preset) {
            case 'today':
                startDate = endDate = formatDate(today);
                break;
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                startDate = endDate = formatDate(yesterday);
                break;
            case 'last7days':
                endDate = formatDate(today);
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 6);
                startDate = formatDate(sevenDaysAgo);
                break;
            case 'monthToDate':
                endDate = formatDate(today);
                const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                startDate = formatDate(firstOfMonth);
                break;
            case 'lastMonth':
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                startDate = formatDate(lastMonthStart);
                endDate = formatDate(lastMonthEnd);
                break;
            default:
                return;
        }
        
        startDateInput.value = startDate;
        endDateInput.value = endDate;
        
        // Auto-apply the date range
        this.onDateRangeChange();
    },
    
    /**
     * Handle date range change
     */
    onDateRangeChange() {
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (!startDateInput || !endDateInput) return;
        
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        // Validate dates
        if (!startDate || !endDate) {
            this.showNotification('Please select both start and end dates', 'error');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            this.showNotification('Start date cannot be after end date', 'error');
            return;
        }
        
        // Store the date range
        this.dateRange.startDate = startDate;
        this.dateRange.endDate = endDate;
        
        // Check if publisher is set
        if (!this.currentPublisherId && !App.currentPublisherId) {
            this.showNotification('Please search for a publisher first', 'error');
            return;
        }
        
        // Show loading indicator
        this.showNotification(`Loading data from ${startDate} to ${endDate}...`, 'info');
        
        // Reload data with new date range
        const publisherId = this.currentPublisherId || App.currentPublisherId;
        App.loadDashboard(publisherId, startDate, endDate);
    },
    
    /**
     * Show a notification toast
     */
    showNotification(message, type = 'success') {
        const toast = document.createElement('div');
        const bgColor = type === 'error' ? 'bg-red-600' : type === 'info' ? 'bg-zone-blue' : 'bg-green-600';
        toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ${bgColor} text-white`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    /**
     * Format metric value based on config
     */
    formatMetricValue(value, config) {
        if (value === undefined || value === null) return '--';
        
        const decimals = config?.decimals ?? 2;
        
        switch (config?.format) {
            case 'percentage':
                return (value * 100).toFixed(decimals) + '%';
            case 'seconds':
                return value.toFixed(decimals) + 's';
            case 'mb':
                return value.toFixed(decimals) + ' MB';
            case 'number':
                return this.formatNumber(value);
            case 'decimal':
            default:
                return value.toFixed(decimals);
        }
    },
    
    /**
     * Format large numbers with K, M, B suffixes
     */
    formatNumber(num) {
        if (num === undefined || num === null) return '--';
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toLocaleString();
    },
    
    /**
     * Calculate trend compared to benchmark
     */
    calculateTrend(value, benchmark, metricKey) {
        if (!benchmark || value === undefined || value === null) {
            return { html: '' };
        }
        
        // For some metrics, lower is better (page weight, cpu usage)
        const lowerIsBetter = ['avg_page_weight', 'avg_cpu'].includes(metricKey);
        const diff = ((value - benchmark) / benchmark * 100).toFixed(1);
        const isLower = value < benchmark;
        
        if (Math.abs(diff) < 5) {
            return {
                html: `<span class="metric-trend neutral">~Industry avg</span>`
            };
        }
        
        // Determine if the result is good or bad
        // For lower-is-better metrics: being lower = good
        // For other metrics: being higher = good
        const isGood = lowerIsBetter ? isLower : !isLower;
        const colorClass = isGood ? 'positive' : 'negative';
        // Arrow direction: ↓ when below avg, ↑ when above avg
        const arrow = isLower ? '↓' : '↑';
        
        return {
            html: `<span class="metric-trend ${colorClass}">
                ${arrow} ${Math.abs(diff)}% vs avg
            </span>`
        };
    },
    
    /**
     * Get SVG icon by name
     */
    getIcon(name) {
        const icons = {
            eye: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>`,
            refresh: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>`,
            weight: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>`,
            cpu: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>`,
            tag: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>`,
            fingerprint: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path></svg>`,
            route: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>`,
            users: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`,
            adunit: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>`
        };
        return icons[name] || '';
    }
};
