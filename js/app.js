/**
 * OpenSincera X Publisher Dashboard - Main Application
 * Entry point and initialization
 */

const App = {
    // Current publisher ID
    currentPublisherId: null,
    
    /**
     * Initialize the application
     */
    async init() {
        console.log('OpenSincera X Publisher Dashboard initializing...');
        
        // Setup refresh button
        this.setupRefreshButton();
        
        // Setup publisher search
        this.setupPublisherSearch();
        
        // Setup retry button
        this.setupRetryButton();
        
        // Show initial state (don't auto-load - wait for user to search)
        this.showInitialState();
        
        // Setup auto-refresh if configured and publisher is set
        if (CONFIG.dashboard.autoRefreshInterval > 0) {
            setInterval(() => {
                if (this.currentPublisherId) {
                    const { startDate, endDate } = Dashboard.dateRange || {};
                    this.loadDashboard(this.currentPublisherId, startDate, endDate);
                }
            }, CONFIG.dashboard.autoRefreshInterval);
        }
    },
    
    /**
     * Show initial state prompting user to search
     */
    showInitialState() {
        const initialState = document.getElementById('initialState');
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const dashboardContent = document.getElementById('dashboardContent');
        
        initialState?.classList.remove('hidden');
        loadingState?.classList.add('hidden');
        errorState?.classList.add('hidden');
        dashboardContent?.classList.add('hidden');
    },
    
    /**
     * Setup publisher search functionality
     */
    setupPublisherSearch() {
        const publisherInput = document.getElementById('publisherInput');
        const applyPublisherBtn = document.getElementById('applyPublisher');
        
        if (applyPublisherBtn && publisherInput) {
            applyPublisherBtn.addEventListener('click', () => {
                this.searchPublisher();
            });
            
            // Also handle Enter key
            publisherInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchPublisher();
                }
            });
        }
    },
    
    /**
     * Search for a publisher by ID
     */
    async searchPublisher() {
        const publisherInput = document.getElementById('publisherInput');
        const inputValue = publisherInput?.value?.trim();
        
        if (!inputValue) {
            alert('Please enter a Publisher ID');
            return;
        }
        
        // Validate it's a numeric ID
        const isNumeric = /^\d+$/.test(inputValue);
        
        if (!isNumeric) {
            alert('Please enter a valid numeric Publisher ID (e.g., 42800)');
            return;
        }
        
        // It's a publisher ID
        this.currentPublisherId = parseInt(inputValue, 10);
        await this.loadDashboard(this.currentPublisherId);
    },
    
    /**
     * Load dashboard data
     * @param {number|string} publisherId - Publisher ID to load
     * @param {string} startDate - Optional start date (YYYY-MM-DD)
     * @param {string} endDate - Optional end date (YYYY-MM-DD)
     */
    async loadDashboard(publisherId, startDate, endDate) {
        if (!publisherId) {
            console.error('No publisher ID provided');
            return;
        }
        
        this.currentPublisherId = publisherId;
        
        const initialState = document.getElementById('initialState');
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const dashboardContent = document.getElementById('dashboardContent');
        const refreshBtn = document.getElementById('refreshBtn');
        const applyBtn = document.getElementById('applyDateRange');
        
        try {
            // Show loading state
            initialState?.classList.add('hidden');
            loadingState?.classList.remove('hidden');
            errorState?.classList.add('hidden');
            dashboardContent?.classList.add('hidden');
            
            // Add spin animation to refresh button
            const refreshIcon = refreshBtn?.querySelector('svg');
            refreshIcon?.classList.add('refresh-spin');
            
            // Disable apply button during load
            if (applyBtn) applyBtn.disabled = true;
            
            // Fetch all data with optional date range
            const data = await API.getAllData(publisherId, startDate, endDate);
            
            console.log('Dashboard data loaded for publisher', publisherId, ':', data);
            
            // Hide loading, show dashboard
            loadingState?.classList.add('hidden');
            dashboardContent?.classList.remove('hidden');
            
            // Initialize dashboard with data
            Dashboard.init(data, publisherId);
            
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            
            // Show error state
            loadingState?.classList.add('hidden');
            errorState?.classList.remove('hidden');
            dashboardContent?.classList.add('hidden');
            
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) {
                errorMessage.textContent = error.message || 'Unable to fetch data from the API. Please check your connection and try again.';
            }
        } finally {
            // Remove spin animation
            const refreshIcon = document.getElementById('refreshBtn')?.querySelector('svg');
            refreshIcon?.classList.remove('refresh-spin');
            
            // Re-enable apply button
            if (applyBtn) applyBtn.disabled = false;
        }
    },
    
    /**
     * Setup refresh button handler
     */
    setupRefreshButton() {
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                if (this.currentPublisherId) {
                    // Use current date range from Dashboard if available
                    const { startDate, endDate } = Dashboard.dateRange || {};
                    this.loadDashboard(this.currentPublisherId, startDate, endDate);
                } else {
                    alert('Please search for a publisher first');
                }
            });
        }
    },
    
    /**
     * Setup retry button handler
     */
    setupRetryButton() {
        const retryBtn = document.getElementById('retryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                if (this.currentPublisherId) {
                    const { startDate, endDate } = Dashboard.dateRange || {};
                    this.loadDashboard(this.currentPublisherId, startDate, endDate);
                } else {
                    this.showInitialState();
                }
            });
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Also handle cases where script loads after DOM
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => App.init(), 1);
}
