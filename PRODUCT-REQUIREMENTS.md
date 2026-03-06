# Zone OpenSincera Dashboard - Product Requirements

## Overview

**Product Name:** Zone OpenSincera Dashboard  
**Publisher ID:** 42800  
**Purpose:** A web-based analytics dashboard for Zone to visualize ad tech metrics from the OpenSincera API

## Target Users

- Zone Ad Operations team
- Zone Business Intelligence analysts
- Zone Product managers

## Core Features

### 1. Publisher Overview
- Display publisher name, domain, and description
- Show publisher categories
- Key performance metrics with industry benchmark comparisons

### 2. Key Performance Metrics
Display the following metrics with visual indicators:
- Avg Ads in View
- Avg Ad Refresh
- Avg Page Weight (with benchmark comparison)
- Avg CPU Usage (with benchmark comparison)
- Total GPIDs
- ID Absorption Rate
- Supply Paths
- Resellers

### 3. Industry Benchmarks Section
- Display hardcoded industry benchmarks
- Used for "% vs avg" comparisons in metrics cards
- Benchmarks: Avg Ads in View (3.5), Avg Ad Refresh (30s), Avg Page Weight (4.5 MB), Avg CPU (2.5s), ID Absorption Rate (65%)

### 4. Other Publishers (Ecosystem Overview)
- Ad Systems count
- Global GPIDs
- Ecosystem Size
- Publishers with GPID
- Video Placement Publishers
- Avg User Modules Deployed

### 5. Visualizations
- Device Metrics Chart (desktop vs mobile)
- Industry Comparison Chart
- Prebid Major Versions Chart
- Ad Unit Media Types Chart

### 6. Data Tables
- Prebid Modules table with filtering and pagination
- Sortable columns
- Category filtering

### 7. Export Functionality
- Export metrics to Excel
- Export Prebid modules to Excel

## Technical Requirements

### API Integration
- OpenSincera API: `https://open.sincera.io/api`
- Bearer Token: `c54dc3e17898500ecab43e76ba24bf`
- Publisher ID: `42800`
- CORS Proxy: corsproxy.io for GitHub Pages deployment

### Endpoints Used
- `/ecosystem` - Ecosystem-wide statistics
- `/publishers/{id}` - Publisher-specific data
- `/adsystems` - Ad systems data
- `/mapping_modules` - Prebid module data

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for desktop and mobile

### Deployment
- GitHub Pages: `https://amynhakam.github.io/ZonexOpenSincera/`
- Repository: `ZonexOpenSincera`

## UI/UX Requirements

### Design System
- Dark theme with blue accents
- Card-based layout
- Responsive grid system
- Loading and error states

### Color Palette
- Background: #0f172a (dark)
- Cards: #1e293b
- Accent: #334155
- Primary Blue: #0078D4
- Success: #10b981
- Warning: #f59e0b
- Danger: #ef4444

## Success Metrics

- Dashboard loads within 3 seconds
- All API data displays correctly
- Export functionality works
- Mobile responsive
