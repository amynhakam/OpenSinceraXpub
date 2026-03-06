# OpenSincera X Publisher Dashboard

A dynamic publisher analytics dashboard powered by the OpenSincera API. Unlike the dedicated Zone and MCG dashboards, this version allows you to look up any publisher by ID or domain.

## Overview

This dashboard provides real-time insights into any publisher's advertising technology stack, including:

- Publisher metrics and performance indicators
- Device-level analytics (Desktop, Mobile, Tablet)
- Prebid module detection and adoption
- Industry benchmark comparisons
- Ecosystem overview statistics

## Features

- **Dynamic Publisher Lookup**: Enter any Publisher ID or domain to view their analytics
- **Real-time Data**: Fetches live data from OpenSincera API
- **Interactive Charts**: Built with Chart.js for device metrics, industry comparison, Prebid versions, and media types
- **Data Export**: Export metrics, ad systems, and Prebid modules to Excel
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Modern dark UI with purple accent branding
- **Date Range Presets**: Quick presets (Today, Yesterday, Last 7 Days, Month to Date, Last Month)

## Usage

1. Open `index.html` in a web browser
2. Enter a Publisher ID (numeric) or domain name in the search field
3. Click "Apply" or press Enter
4. View the analytics data for the selected publisher

### Example Publisher IDs
- **Zone**: 42800
- **MCG**: 34732

## Tech Stack

- **HTML5/CSS3**: Semantic markup and modern styling
- **Tailwind CSS**: Utility-first CSS framework (via CDN)
- **Chart.js**: Interactive chart visualizations
- **SheetJS**: Excel export functionality
- **OpenSincera API**: Ad tech data source

## Project Structure

```
OpenSinceraXpub/
├── index.html          # Main dashboard page
├── css/
│   └── styles.css      # Custom styles
├── js/
│   ├── config.js       # Configuration (API settings, benchmarks)
│   ├── api.js          # API communication module
│   ├── dashboard.js    # UI rendering and state management
│   ├── charts.js       # Chart.js configurations
│   ├── export.js       # Excel export functionality
│   └── app.js          # Application entry point
└── README.md           # This file
```

## Configuration

The dashboard is configured via `js/config.js`:

- **Publisher ID**: 42800 (Zone)
- **API Token**: Pre-configured for OpenSincera API
- **Industry Benchmarks**: Customizable benchmark values for comparisons

## Usage

### Local Development

1. Clone or download this directory
2. Open `index.html` in a web browser
3. The dashboard will automatically fetch and display data

### GitHub Pages Deployment

1. Create a new repository named `ZonexOpenSincera`
2. Push all files to the `main` branch
3. Enable GitHub Pages in repository settings
4. Access at: `https://[username].github.io/ZonexOpenSincera/`

## Key Metrics Displayed

| Metric | Description |
|--------|-------------|
| Avg Ads in View | Average number of ads visible in viewport |
| Avg Ad Refresh | Time before an ad refreshes |
| Avg Page Weight | Average page file size (MB) |
| Avg CPU Usage | CPU time consumed (seconds) |
| Total GPIDs | Total Global Placement IDs |
| ID Absorption Rate | SSP identifier attachment rate |
| Supply Paths | Number of supply paths |
| Resellers | Associated reseller count |

## Industry Benchmarks

The dashboard compares Zone's metrics against industry averages:

- Avg Ads in View: 3.5
- Avg Ad Refresh: 30s
- Avg Page Weight: 4.5 MB
- Avg CPU: 2.5s
- ID Absorption Rate: 65%

## API Integration

Uses the OpenSincera API with the following endpoints:

- `/ecosystem` - Ecosystem-wide statistics
- `/publishers?id=42800` - Zone publisher data
- `/adsystems` - Known ad systems
- `/mapping_modules` - Prebid module mappings

## License

© 2026 Zone. All rights reserved.
