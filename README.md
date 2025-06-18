# 🚀 Load Test UI

A professional, accessible, and modern HTTP load testing tool with real-time monitoring and comprehensive analytics.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-v18+-green.svg)
![Accessibility](https://img.shields.io/badge/accessibility-WCAG%202.1%20AA-brightgreen.svg)


## ✨ Features


### 🎯 **Load Testing Capabilities**

- **Request-based testing** - Send a specific number of requests (1-50,000)
- **Concurrent users** - Simulate 1-1,000 concurrent users
- **HTTP methods** - Support for GET, POST, PUT, PATCH, DELETE
- **Custom headers** - Add any custom headers with JSON format
- **Request body** - Send JSON or text data
- **Configurable delays** - Add delays between requests (0-10 seconds)
- **Real-time monitoring** - Live statistics and progress tracking


### 📊 **Advanced Analytics**

- **Response time metrics** - Average, min, max response times
- **Percentiles** - TP90 (90th percentile) and TP95 (95th percentile)
- **Success rate tracking** - Only HTTP 200 responses count as success
- **Status code breakdown** - Detailed count of all HTTP status codes
- **Request rate** - Real-time requests per second
- **Interactive charts** - Response time and request rate visualization
- **Live logging** - Color-coded real-time logs with response data


### 🎨 **Modern UI/UX**

- **Responsive design** - Works on desktop, tablet, and mobile
- **Accessibility compliant** - WCAG 2.1 AA standards
- **Form validation** - Real-time validation with helpful error messages
- **Loading states** - Visual feedback during operations
- **Dark mode support** - High contrast mode compatibility
- **Touch-friendly** - Optimized for touch devices


### 🔧 **Developer Experience**

- **cURL import** - Import cURL commands directly from browser dev tools
- **Test history** - Auto-save and manage test configurations
- **One-click rerun** - Easily repeat previous tests
- **Export results** - Download test results and configurations
- **Error handling** - Comprehensive error messages and debugging info


### ♿ **Accessibility Features**

- **Screen reader support** - Full ARIA labels and landmarks
- **Keyboard navigation** - Complete keyboard accessibility
- **Skip links** - Quick navigation for assistive technologies
- **Focus management** - Proper focus indicators and management
- **Semantic HTML** - Proper HTML5 semantic structure
- **Live regions** - Dynamic content announcements


## 🚀 Quick Start


### Prerequisites

- Node.js v18+
- npm or yarn


### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/load-test-ui.git
   cd load-test-ui
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the server**

   ```bash
   npm start
   ```

4. **Open your browser**

   Navigate to `http://localhost:3000`


## 📖 Usage


### Basic Load Test

1. **Configure your test:**

   - Enter the target URL
   - Set number of concurrent users (1-1,000)
   - Set total requests to send (1-50,000)
   - Add custom headers if needed (JSON format)
   - Add request body for POST/PUT requests

2. **Start the test:**

   - Click "Start Test" button
   - Monitor real-time statistics
   - View live logs and response data

3. **Analyze results:**

   - Check success rate and response times
   - Review TP90/TP95 percentiles
   - Examine status code breakdown
   - Export results for further analysis


### Advanced Features


#### Import cURL Commands

```bash
# Example: Import a cURL command from browser dev tools
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"key": "value"}' \
  https://api.example.com/endpoint
```

1. Copy cURL command from browser dev tools
2. Click "📥 Import cURL" button
3. Paste the command and click "Parse & Import"
4. Configuration is automatically filled


#### Test History Management

- All tests are automatically saved
- View test history with "Test History" button
- One-click rerun of previous configurations
- Delete individual tests or clear all history


## 🏗️ Architecture


### Technology Stack

- **Backend:** Node.js, Express.js, Socket.IO
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Charts:** Chart.js
- **Real-time:** WebSocket communication
- **Storage:** JSON file-based test history


### Key Components

```text
├── server.js              # Express server with WebSocket handling
├── public/
│   ├── index.html        # Main UI with accessibility features
│   ├── app.js            # Frontend logic and real-time updates
│   └── styles.css        # Modern CSS with responsive design
├── package.json          # Dependencies and scripts
└── test-history.json     # Auto-generated test history storage
```


## 🔧 Configuration


### Environment Variables

```bash
PORT=3000                 # Server port (default: 3000)
```

### Test Limits

- **Concurrent Users:** 1-1,000
- **Total Requests:** 1-50,000
- **Request Delay:** 0-10 seconds
- **Test History:** Last 50 tests (auto-cleanup)


## 📊 Metrics Explained


### Response Time Metrics

- **Average:** Mean response time across all requests
- **Min/Max:** Fastest and slowest response times
- **TP90:** 90% of requests completed within this time
- **TP95:** 95% of requests completed within this time


### Success Criteria

- **Success:** Only HTTP 200 responses count as successful
- **Failure:** All other status codes (201, 404, 500, etc.) are failures
- **Network Errors:** Timeouts and connection failures are tracked


## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.


### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request


### Code Style

- Use meaningful variable names
- Add comments for complex logic
- Follow existing code formatting
- Ensure accessibility compliance
- Test on multiple browsers


## 🐛 Issues and Support

- **Bug Reports:** [GitHub Issues](https://github.com/yourusername/load-test-ui/issues)
- **Feature Requests:** [GitHub Issues](https://github.com/yourusername/load-test-ui/issues)
- **Questions:** [GitHub Discussions](https://github.com/yourusername/load-test-ui/discussions)


## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🙏 Acknowledgments

- Built with modern web technologies
- Designed with accessibility in mind
- Inspired by professional load testing tools
- Community-driven development


## 🗺️ Roadmap

- [ ] API rate limiting detection
- [ ] Custom success criteria configuration
- [ ] Test result export (CSV, JSON)
- [ ] Distributed load testing
- [ ] Performance regression testing
- [ ] Docker containerization
- [ ] CI/CD integration examples


---

### Made with ❤️ for the open source community
