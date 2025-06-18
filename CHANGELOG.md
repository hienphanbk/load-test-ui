# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-06-18

### 🎉 Initial Release

This is the first public release of Load Test UI - a professional, accessible HTTP load testing tool.

### ✨ Features

#### Core Load Testing
- **Request-based testing** - Send specific number of requests (1-50,000)
- **Concurrent users** - Simulate 1-1,000 concurrent users  
- **HTTP methods** - Support for GET, POST, PUT, PATCH, DELETE
- **Custom headers** - JSON format header configuration
- **Request body** - JSON or text data support
- **Configurable delays** - 0-10 second delays between requests
- **Real-time monitoring** - Live statistics and progress tracking

#### Advanced Analytics
- **Response time metrics** - Average, min, max response times
- **Percentiles** - TP90 (90th percentile) and TP95 (95th percentile)
- **Success rate tracking** - Only HTTP 200 responses count as success
- **Status code breakdown** - Detailed count of all HTTP status codes
- **Request rate** - Real-time requests per second
- **Interactive charts** - Response time and request rate visualization
- **Live logging** - Color-coded real-time logs with response data

#### Modern UI/UX
- **Responsive design** - Works on desktop, tablet, and mobile
- **Accessibility compliant** - WCAG 2.1 AA standards
- **Form validation** - Real-time validation with helpful error messages
- **Loading states** - Visual feedback during operations
- **Dark mode support** - High contrast mode compatibility
- **Touch-friendly** - Optimized for touch devices

#### Developer Experience
- **cURL import** - Import cURL commands directly from browser dev tools
- **Test history** - Auto-save and manage test configurations
- **One-click rerun** - Easily repeat previous tests
- **Error handling** - Comprehensive error messages and debugging info

#### Accessibility Features
- **Screen reader support** - Full ARIA labels and landmarks
- **Keyboard navigation** - Complete keyboard accessibility
- **Skip links** - Quick navigation for assistive technologies
- **Focus management** - Proper focus indicators and management
- **Semantic HTML** - Proper HTML5 semantic structure
- **Live regions** - Dynamic content announcements

### 🏗️ Technical Implementation
- **Backend**: Node.js, Express.js, Socket.IO
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Charts**: Chart.js for real-time visualization
- **Real-time**: WebSocket communication
- **Storage**: JSON file-based test history

### 📋 Requirements
- Node.js v18+
- Modern web browser with JavaScript enabled

### 🔧 Configuration
- Concurrent Users: 1-1,000
- Total Requests: 1-50,000
- Request Delay: 0-10 seconds
- Test History: Last 50 tests (auto-cleanup)

---

## Future Releases

See our [Roadmap](README.md#-roadmap) for planned features and improvements.

### Planned Features
- [ ] API rate limiting detection
- [ ] Custom success criteria configuration
- [ ] Test result export (CSV, JSON)
- [ ] Distributed load testing
- [ ] Performance regression testing
- [ ] Docker containerization
- [ ] CI/CD integration examples
