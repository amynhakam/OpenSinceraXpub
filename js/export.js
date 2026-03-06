/**
 * Zone OpenSincera Dashboard - Export Module
 * Handles data export to Excel/CSV
 */

const Export = {
    /**
     * Export data to Excel file
     * @param {Array} data - Array of objects to export
     * @param {string} filename - Name of the file (without extension)
     * @param {string} sheetName - Name of the worksheet
     */
    toExcel(data, filename, sheetName = 'Data') {
        if (!data || data.length === 0) {
            console.warn('No data to export');
            return;
        }
        
        try {
            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(data);
            
            // Auto-size columns
            const maxWidths = {};
            data.forEach(row => {
                Object.keys(row).forEach(key => {
                    const value = String(row[key] || '');
                    maxWidths[key] = Math.max(maxWidths[key] || key.length, value.length);
                });
            });
            
            ws['!cols'] = Object.keys(maxWidths).map(key => ({
                wch: Math.min(maxWidths[key] + 2, 50)
            }));
            
            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
            
            // Generate and download file
            XLSX.writeFile(wb, `${filename}_${this.getTimestamp()}.xlsx`);
            
            this.showNotification('Export successful!');
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Export failed. Please try again.', 'error');
        }
    },
    
    /**
     * Export data to CSV file
     * @param {Array} data - Array of objects to export
     * @param {string} filename - Name of the file (without extension)
     */
    toCSV(data, filename) {
        if (!data || data.length === 0) {
            console.warn('No data to export');
            return;
        }
        
        try {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, 'Data');
            
            XLSX.writeFile(wb, `${filename}_${this.getTimestamp()}.csv`);
            
            this.showNotification('Export successful!');
        } catch (error) {
            console.error('CSV export failed:', error);
            this.showNotification('Export failed. Please try again.', 'error');
        }
    },
    
    /**
     * Export publisher metrics
     * @param {Object} publisherData - Publisher data object
     */
    exportPublisherMetrics(publisherData) {
        if (!publisherData) return;
        
        const metrics = [
            { Metric: 'Publisher Name', Value: publisherData.name || 'N/A' },
            { Metric: 'Publisher ID', Value: publisherData.publisher_id || 'N/A' },
            { Metric: 'Domain', Value: publisherData.domain || 'N/A' },
            { Metric: 'Status', Value: publisherData.status || 'N/A' },
            { Metric: 'Primary Supply Type', Value: publisherData.primary_supply_type || 'N/A' },
            { Metric: 'Avg Ads in View', Value: publisherData.avg_ads_in_view || 0 },
            { Metric: 'Avg Ad Refresh (seconds)', Value: publisherData.avg_ad_refresh || 0 },
            { Metric: 'Avg Page Weight (MB)', Value: publisherData.avg_page_weight || 0 },
            { Metric: 'Avg CPU (seconds)', Value: publisherData.avg_cpu || 0 },
            { Metric: 'Total Unique GPIDs', Value: publisherData.total_unique_gpids || 0 },
            { Metric: 'ID Absorption Rate', Value: publisherData.id_absorption_rate || 0 },
            { Metric: 'Total Supply Paths', Value: publisherData.total_supply_paths || 0 },
            { Metric: 'Reseller Count', Value: publisherData.reseller_count || 0 },
            { Metric: 'Last Updated', Value: publisherData.updated_at || 'N/A' }
        ];
        
        // Add categories if present
        if (publisherData.categories && publisherData.categories.length > 0) {
            metrics.push({ Metric: 'Categories', Value: publisherData.categories.join(', ') });
        }
        
        // Add device metrics if present
        if (publisherData.device_level_metrics) {
            Object.entries(publisherData.device_level_metrics).forEach(([device, data]) => {
                metrics.push({ 
                    Metric: `${device} - A2CR`, 
                    Value: data?.avg_ads_to_content_ratio || data?.a2cr || 0 
                });
                metrics.push({ 
                    Metric: `${device} - Avg Ads in View`, 
                    Value: data?.avg_ads_in_view || 0 
                });
            });
        }
        
        this.toExcel(metrics, 'Zone_Publisher_Metrics', 'Publisher Metrics');
    },
    
    /**
     * Export ad systems data
     * @param {Array} adSystems - Array of ad system objects
     */
    exportAdSystems(adSystems) {
        if (!adSystems || adSystems.length === 0) return;
        
        const data = adSystems.map(system => ({
            ID: system.id,
            Name: system.name,
            Domain: system.canonical_domain,
            Description: system.description || 'N/A'
        }));
        
        this.toExcel(data, 'Zone_Ad_Systems', 'Ad Systems');
    },
    
    /**
     * Export Prebid modules data
     * @param {Array} modules - Array of Prebid module objects
     */
    exportPrebidModules(modules) {
        if (!modules || modules.length === 0) return;
        
        const data = modules.map(module => ({
            ID: module.id,
            'Module Name': module.module_name,
            Category: module.module_category,
            'Ad System ID': module.adsystem_id,
            'Detection Count (90 days)': module.detected_count
        }));
        
        this.toExcel(data, 'Zone_Prebid_Modules', 'Prebid Modules');
    },
    
    /**
     * Export all dashboard data
     * @param {Object} dashboardData - Complete dashboard data
     */
    exportAll(dashboardData) {
        if (!dashboardData) return;
        
        try {
            const wb = XLSX.utils.book_new();
            
            // Publisher metrics sheet
            if (dashboardData.publisher) {
                const publisherData = this.flattenPublisherData(dashboardData.publisher);
                const ws1 = XLSX.utils.json_to_sheet(publisherData);
                XLSX.utils.book_append_sheet(wb, ws1, 'Publisher Metrics');
            }
            
            // Ecosystem sheet
            if (dashboardData.ecosystem) {
                const ecosystemData = this.flattenEcosystemData(dashboardData.ecosystem);
                const ws2 = XLSX.utils.json_to_sheet(ecosystemData);
                XLSX.utils.book_append_sheet(wb, ws2, 'Ecosystem');
            }
            
            // Ad Systems sheet
            if (dashboardData.adSystems && dashboardData.adSystems.length > 0) {
                const adSystemsData = dashboardData.adSystems.map(s => ({
                    ID: s.id,
                    Name: s.name,
                    Domain: s.canonical_domain,
                    Description: s.description || ''
                }));
                const ws3 = XLSX.utils.json_to_sheet(adSystemsData);
                XLSX.utils.book_append_sheet(wb, ws3, 'Ad Systems');
            }
            
            // Prebid Modules sheet
            if (dashboardData.prebidModules && dashboardData.prebidModules.length > 0) {
                const modulesData = dashboardData.prebidModules.map(m => ({
                    ID: m.id,
                    'Module Name': m.module_name,
                    Category: m.module_category,
                    'Ad System ID': m.adsystem_id,
                    'Detection Count': m.detected_count
                }));
                const ws4 = XLSX.utils.json_to_sheet(modulesData);
                XLSX.utils.book_append_sheet(wb, ws4, 'Prebid Modules');
            }
            
            // Download the workbook
            XLSX.writeFile(wb, `Zone_OpenSincera_Full_Report_${this.getTimestamp()}.xlsx`);
            
            this.showNotification('Full report exported successfully!');
        } catch (error) {
            console.error('Full export failed:', error);
            this.showNotification('Export failed. Please try again.', 'error');
        }
    },
    
    /**
     * Flatten publisher data for export
     */
    flattenPublisherData(publisher) {
        const flat = [
            { Metric: 'Publisher ID', Value: publisher.publisher_id },
            { Metric: 'Name', Value: publisher.name },
            { Metric: 'Domain', Value: publisher.domain },
            { Metric: 'Status', Value: publisher.status },
            { Metric: 'Avg Ads in View', Value: publisher.avg_ads_in_view },
            { Metric: 'Avg Ad Refresh', Value: publisher.avg_ad_refresh },
            { Metric: 'Avg Page Weight', Value: publisher.avg_page_weight },
            { Metric: 'Avg CPU', Value: publisher.avg_cpu },
            { Metric: 'Total GPIDs', Value: publisher.total_unique_gpids },
            { Metric: 'ID Absorption Rate', Value: publisher.id_absorption_rate },
            { Metric: 'Supply Paths', Value: publisher.total_supply_paths },
            { Metric: 'Resellers', Value: publisher.reseller_count },
            { Metric: 'Updated At', Value: publisher.updated_at }
        ];
        return flat;
    },
    
    /**
     * Flatten ecosystem data for export
     */
    flattenEcosystemData(ecosystem) {
        return [
            { Metric: 'Date', Value: ecosystem.date },
            { Metric: 'Known Ad Systems', Value: ecosystem.known_adsystems },
            { Metric: 'Global GPIDs', Value: ecosystem.global_gpids },
            { Metric: 'Ecosystem Size', Value: ecosystem.sincera_ecosystem_size },
            { Metric: 'Pubs with GPID', Value: ecosystem.pubs_with_gpid },
            { Metric: 'Video Plcmt Pubs', Value: ecosystem.video_plcmt_pubs },
            { Metric: 'Web Risk Flagged', Value: ecosystem.webrisk_flagged_publishers },
            { Metric: 'Adult Domains', Value: ecosystem.adult_domains },
            { Metric: 'Topics Opt-outs', Value: ecosystem.topics_opt_outs }
        ];
    },
    
    /**
     * Get current timestamp for filename
     */
    getTimestamp() {
        const now = new Date();
        return now.toISOString().slice(0, 10).replace(/-/g, '');
    },
    
    /**
     * Show notification toast
     */
    showNotification(message, type = 'success') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ${
            type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white`;
        toast.textContent = message;
        
        // Add to DOM
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateY(20px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};
