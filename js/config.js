/**
 * OpenSincera X Publisher Dashboard - Configuration
 * Contains API settings and dashboard configuration
 */

const CONFIG = {
    // API Configuration
    api: {
        // Call OpenSincera API directly
        baseUrl: 'https://open.sincera.io/api',
        token: 'c54dc3e17898500ecab43e76ba24bf',
        publisherId: null, // Dynamic - set by user input
        
        // Endpoints
        endpoints: {
            ecosystem: '/ecosystem',
            publishers: '/publishers',
            adsystems: '/adsystems',
            mappingModules: '/mapping_modules'
        }
    },
    
    // Dashboard Settings
    dashboard: {
        // Auto-refresh interval (in milliseconds) - 0 to disable
        autoRefreshInterval: 0,
        
        // Pagination settings
        pagination: {
            adSystemsPerPage: 10,
            prebidModulesPerPage: 15
        },
        
        // Chart colors
        colors: {
            primary: '#0078D4',
            secondary: '#60a5fa',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            purple: '#8b5cf6',
            pink: '#ec4899',
            cyan: '#06b6d4',
            
            // Chart color palette
            chartPalette: [
                '#0078D4',
                '#10b981',
                '#f59e0b',
                '#8b5cf6',
                '#ec4899',
                '#06b6d4',
                '#ef4444',
                '#84cc16',
                '#f97316',
                '#6366f1'
            ]
        }
    },
    
    // Metric definitions for display
    metrics: {
        total_ad_units: {
            label: 'Total Ad Units',
            description: 'Total number of ad units across all media types',
            format: 'number',
            decimals: 0,
            icon: 'adunit'
        },
        avg_ads_in_view: {
            label: 'Avg Ads in View',
            description: 'Average number of ads visible in the viewport',
            format: 'decimal',
            decimals: 2,
            icon: 'eye'
        },
        avg_ad_refresh: {
            label: 'Avg Ad Refresh',
            description: 'Average time in seconds before an ad refreshes',
            format: 'seconds',
            decimals: 1,
            icon: 'refresh'
        },
        avg_page_weight: {
            label: 'Avg Page Weight',
            description: 'Average file size of pages (inversely correlates with performance)',
            format: 'mb',
            decimals: 2,
            icon: 'weight'
        },
        avg_cpu: {
            label: 'Avg CPU Usage',
            description: 'Average CPU usage in seconds (inversely correlates with performance)',
            format: 'seconds',
            decimals: 2,
            icon: 'cpu'
        },
        total_unique_gpids: {
            label: 'Total GPIDs',
            description: 'Total number of Global Placement IDs',
            format: 'number',
            decimals: 0,
            icon: 'tag'
        },
        id_absorption_rate: {
            label: 'ID Absorption Rate',
            description: 'How effectively SSPs append identifiers to bid requests',
            format: 'percentage',
            decimals: 1,
            icon: 'fingerprint'
        },
        total_supply_paths: {
            label: 'Supply Paths',
            description: 'Total number of supply paths from advertiser to publisher',
            format: 'number',
            decimals: 0,
            icon: 'route'
        },
        reseller_count: {
            label: 'Resellers',
            description: 'Number of resellers associated with the publisher',
            format: 'number',
            decimals: 0,
            icon: 'users'
        }
    },
    
    // Industry benchmark averages (for comparison)
    // These are approximate values - will be updated from ecosystem data
    industryBenchmarks: {
        avg_ads_in_view: 3.5,
        avg_ad_refresh: 30,
        avg_page_weight: 4.5,
        avg_cpu: 2.5,
        id_absorption_rate: 0.65
    }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.api);
Object.freeze(CONFIG.api.endpoints);
Object.freeze(CONFIG.dashboard);
Object.freeze(CONFIG.dashboard.pagination);
Object.freeze(CONFIG.dashboard.colors);
Object.freeze(CONFIG.metrics);
Object.freeze(CONFIG.industryBenchmarks);
