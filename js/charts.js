/**
 * Zone OpenSincera Dashboard - Charts Module
 * Handles all Chart.js configurations and rendering
 */

const Charts = {
    // Store chart instances for updates/destruction
    instances: {},
    
    /**
     * Default chart options
     */
    defaultOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#9ca3af',
                    font: {
                        family: 'system-ui, -apple-system, sans-serif'
                    }
                }
            },
            tooltip: {
                backgroundColor: '#1a1a2e',
                titleColor: '#fff',
                bodyColor: '#9ca3af',
                borderColor: '#0f3460',
                borderWidth: 1,
                padding: 12,
                displayColors: true
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(15, 52, 96, 0.5)'
                },
                ticks: {
                    color: '#9ca3af'
                }
            },
            y: {
                grid: {
                    color: 'rgba(15, 52, 96, 0.5)'
                },
                ticks: {
                    color: '#9ca3af'
                }
            }
        }
    },
    
    /**
     * Create or update device metrics chart
     * @param {Object} deviceMetrics - Device level metrics data
     */
    renderDeviceMetricsChart(deviceMetrics) {
        const ctx = document.getElementById('deviceMetricsChart');
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.instances.deviceMetrics) {
            this.instances.deviceMetrics.destroy();
        }
        
        // Parse device metrics - handle various data structures
        const labels = [];
        const a2crData = [];
        const adsInViewData = [];
        
        if (deviceMetrics && typeof deviceMetrics === 'object') {
            Object.entries(deviceMetrics).forEach(([device, metrics]) => {
                labels.push(this.formatDeviceName(device));
                a2crData.push(metrics?.avg_ads_to_content_ratio || metrics?.a2cr || 0);
                adsInViewData.push(metrics?.avg_ads_in_view || 0);
            });
        }
        
        // Default data if none available
        if (labels.length === 0) {
            labels.push('Desktop', 'Mobile', 'Tablet');
            a2crData.push(0.15, 0.20, 0.18);
            adsInViewData.push(3.2, 4.5, 3.8);
        }
        
        this.instances.deviceMetrics = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'A2CR (Ads-to-Content Ratio)',
                        data: a2crData.map(v => (v * 100).toFixed(1)),
                        backgroundColor: CONFIG.dashboard.colors.primary,
                        borderRadius: 4
                    },
                    {
                        label: 'Avg Ads in View',
                        data: adsInViewData,
                        backgroundColor: CONFIG.dashboard.colors.success,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                ...this.defaultOptions,
                plugins: {
                    ...this.defaultOptions.plugins,
                    legend: {
                        ...this.defaultOptions.plugins.legend,
                        position: 'bottom'
                    }
                }
            }
        });
    },
    
    /**
     * Create or update industry comparison chart
     * @param {Object} publisherData - Publisher metrics
     * @param {Object} benchmarks - Industry benchmark data
     */
    renderIndustryComparisonChart(publisherData, benchmarks) {
        const ctx = document.getElementById('industryComparisonChart');
        if (!ctx) return;
        
        if (this.instances.industryComparison) {
            this.instances.industryComparison.destroy();
        }
        
        const metrics = ['avg_ads_in_view', 'avg_ad_refresh', 'avg_page_weight', 'avg_cpu'];
        const labels = metrics.map(m => CONFIG.metrics[m]?.label || m);
        
        const publisherValues = metrics.map(m => {
            const val = publisherData?.[m] || 0;
            // Normalize for display (some values need scaling)
            if (m === 'avg_ad_refresh') return val / 10;
            if (m === 'avg_page_weight') return val;
            return val;
        });
        
        const benchmarkValues = metrics.map(m => {
            const val = benchmarks?.[m] || CONFIG.industryBenchmarks[m] || 0;
            if (m === 'avg_ad_refresh') return val / 10;
            if (m === 'avg_page_weight') return val;
            return val;
        });
        
        this.instances.industryComparison = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Zone (Publisher)',
                        data: publisherValues,
                        backgroundColor: 'rgba(0, 120, 212, 0.2)',
                        borderColor: CONFIG.dashboard.colors.primary,
                        borderWidth: 2,
                        pointBackgroundColor: CONFIG.dashboard.colors.primary
                    },
                    {
                        label: 'Industry Average',
                        data: benchmarkValues,
                        backgroundColor: 'rgba(245, 158, 11, 0.2)',
                        borderColor: CONFIG.dashboard.colors.warning,
                        borderWidth: 2,
                        pointBackgroundColor: CONFIG.dashboard.colors.warning
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        ...this.defaultOptions.plugins.legend,
                        position: 'bottom'
                    },
                    tooltip: this.defaultOptions.plugins.tooltip
                },
                scales: {
                    r: {
                        grid: {
                            color: 'rgba(15, 52, 96, 0.5)'
                        },
                        angleLines: {
                            color: 'rgba(15, 52, 96, 0.5)'
                        },
                        pointLabels: {
                            color: '#9ca3af',
                            font: {
                                size: 11
                            }
                        },
                        ticks: {
                            color: '#6b7280',
                            backdropColor: 'transparent'
                        }
                    }
                }
            }
        });
    },
    
    /**
     * Create or update Prebid versions chart
     * @param {Object} versionsData - Prebid major versions data
     */
    renderPrebidVersionsChart(versionsData) {
        const ctx = document.getElementById('prebidVersionsChart');
        if (!ctx) return;
        
        if (this.instances.prebidVersions) {
            this.instances.prebidVersions.destroy();
        }
        
        // Parse versions data
        let labels = [];
        let data = [];
        
        if (versionsData && typeof versionsData === 'object') {
            const sorted = Object.entries(versionsData)
                .sort((a, b) => parseInt(b[1]) - parseInt(a[1]))
                .slice(0, 8);
            
            labels = sorted.map(([version]) => `v${version}`);
            data = sorted.map(([, count]) => parseInt(count));
        }
        
        // Default data if none
        if (labels.length === 0) {
            labels = ['v8', 'v7', 'v6', 'v5', 'v4'];
            data = [45, 30, 15, 7, 3];
        }
        
        this.instances.prebidVersions = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: CONFIG.dashboard.colors.chartPalette.slice(0, labels.length),
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        ...this.defaultOptions.plugins.legend,
                        position: 'right'
                    },
                    tooltip: this.defaultOptions.plugins.tooltip
                }
            }
        });
    },
    
    /**
     * Create or update media types chart
     * @param {Object} mediaTypesData - Ad unit media types data
     */
    renderMediaTypesChart(mediaTypesData) {
        const ctx = document.getElementById('mediaTypesChart');
        if (!ctx) return;
        
        if (this.instances.mediaTypes) {
            this.instances.mediaTypes.destroy();
        }
        
        let labels = [];
        let data = [];
        
        if (mediaTypesData && typeof mediaTypesData === 'object') {
            const entries = Object.entries(mediaTypesData)
                .filter(([key]) => !key.includes('_'))
                .sort((a, b) => parseInt(b[1]) - parseInt(a[1]));
            
            labels = entries.map(([type]) => this.formatMediaType(type));
            data = entries.map(([, count]) => parseInt(count));
        }
        
        // Default data
        if (labels.length === 0) {
            labels = ['Banner', 'Video', 'Native', 'Slider'];
            data = [48000000, 20000000, 2000000, 10000];
        }
        
        this.instances.mediaTypes = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ad Units',
                    data: data,
                    backgroundColor: CONFIG.dashboard.colors.chartPalette,
                    borderRadius: 4
                }]
            },
            options: {
                ...this.defaultOptions,
                indexAxis: 'y',
                plugins: {
                    ...this.defaultOptions.plugins,
                    legend: {
                        display: false
                    },
                    tooltip: {
                        ...this.defaultOptions.plugins.tooltip,
                        callbacks: {
                            label: (context) => {
                                return this.formatLargeNumber(context.raw) + ' ad units';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ...this.defaultOptions.scales.x,
                        ticks: {
                            ...this.defaultOptions.scales.x.ticks,
                            callback: (value) => this.formatLargeNumber(value)
                        }
                    },
                    y: this.defaultOptions.scales.y
                }
            }
        });
    },
    
    /**
     * Helper: Format device name
     */
    formatDeviceName(device) {
        const names = {
            'desktop': 'Desktop',
            'mobile': 'Mobile',
            'tablet': 'Tablet',
            'ctv': 'Connected TV',
            'other': 'Other'
        };
        return names[device.toLowerCase()] || device;
    },
    
    /**
     * Helper: Format media type
     */
    formatMediaType(type) {
        return type.charAt(0).toUpperCase() + type.slice(1);
    },
    
    /**
     * Helper: Format large numbers
     */
    formatLargeNumber(num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    },
    
    /**
     * Destroy all chart instances
     */
    destroyAll() {
        Object.values(this.instances).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.instances = {};
    }
};
