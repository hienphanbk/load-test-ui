class LoadTestUI {
    constructor() {
        this.socket = io();
        this.currentTestId = null;
        this.isTestRunning = false;
        this.charts = {};
        this.chartData = {
            responseTimes: [],
            requestRates: [],
            timestamps: []
        };
        this.testHistory = [];
        this.validationErrors = {};
        
        this.initializeEventListeners();
        this.initializeCharts();
        this.setupSocketHandlers();
        this.initializeFormValidation();
    }

    initializeEventListeners() {
        const startBtn = document.getElementById('startTest');
        const stopBtn = document.getElementById('stopTest');
        const showHistoryBtn = document.getElementById('showHistory');
        const clearHistoryBtn = document.getElementById('clearHistory');
        const importCurlBtn = document.getElementById('importCurl');
        const parseCurlBtn = document.getElementById('parseCurl');

        startBtn.addEventListener('click', () => this.startTest());
        stopBtn.addEventListener('click', () => this.stopTest());
        showHistoryBtn.addEventListener('click', () => this.showTestHistory());
        clearHistoryBtn.addEventListener('click', () => this.clearTestHistory());
        importCurlBtn.addEventListener('click', () => this.showCurlImportModal());
        parseCurlBtn.addEventListener('click', () => this.parseCurlCommand());

        // Auto-format JSON in textareas
        const headersTextarea = document.getElementById('headers');
        const bodyTextarea = document.getElementById('body');

        headersTextarea.addEventListener('blur', () => this.formatJSON(headersTextarea));
        bodyTextarea.addEventListener('blur', () => this.formatJSON(bodyTextarea));
        
        // Keyboard navigation for modals
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }

    initializeFormValidation() {
        const fields = ['url', 'concurrentUsers', 'totalRequests', 'delayBetweenRequests', 'headers', 'body'];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => this.validateField(fieldId));
                field.addEventListener('blur', () => this.validateField(fieldId));
            }
        });
    }

    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        
        if (!field || !errorElement) return true;

        let isValid = true;
        let errorMessage = '';

        switch (fieldId) {
            case 'url':
                if (!field.value.trim()) {
                    isValid = false;
                    errorMessage = 'URL is required';
                } else if (!this.isValidURL(field.value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid URL';
                }
                break;
                
            case 'concurrentUsers':
                const users = parseInt(field.value);
                if (isNaN(users) || users < 1 || users > 1000) {
                    isValid = false;
                    errorMessage = 'Users must be between 1 and 1000';
                }
                break;
                
            case 'totalRequests':
                const requests = parseInt(field.value);
                if (isNaN(requests) || requests < 1 || requests > 50000) {
                    isValid = false;
                    errorMessage = 'Requests must be between 1 and 50,000';
                }
                break;
                
            case 'delayBetweenRequests':
                const delay = parseInt(field.value);
                if (isNaN(delay) || delay < 0 || delay > 10000) {
                    isValid = false;
                    errorMessage = 'Delay must be between 0 and 10,000ms';
                }
                break;
                
            case 'headers':
            case 'body':
                if (field.value.trim()) {
                    try {
                        JSON.parse(field.value);
                    } catch (e) {
                        isValid = false;
                        errorMessage = 'Invalid JSON format';
                    }
                }
                break;
        }

        // Update UI
        field.setAttribute('aria-invalid', !isValid);
        
        if (isValid) {
            errorElement.hidden = true;
            errorElement.textContent = '';
            delete this.validationErrors[fieldId];
        } else {
            errorElement.hidden = false;
            errorElement.textContent = errorMessage;
            this.validationErrors[fieldId] = errorMessage;
        }

        return isValid;
    }

    isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    showValidationMessage(message, type = 'error') {
        const messagesDiv = document.getElementById('validation-messages');
        messagesDiv.textContent = message;
        messagesDiv.className = `validation-messages ${type === 'success' ? 'success' : ''}`;
        messagesDiv.hidden = false;
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                messagesDiv.hidden = true;
            }, 3000);
        }
    }

    hideValidationMessage() {
        const messagesDiv = document.getElementById('validation-messages');
        messagesDiv.hidden = true;
    }

    validateForm() {
        const fields = ['url', 'concurrentUsers', 'totalRequests', 'delayBetweenRequests', 'headers', 'body'];
        let isFormValid = true;
        
        fields.forEach(fieldId => {
            const fieldValid = this.validateField(fieldId);
            if (!fieldValid) isFormValid = false;
        });

        if (!isFormValid) {
            this.showValidationMessage('Please fix the errors above before starting the test.');
            // Focus on first invalid field
            const firstError = Object.keys(this.validationErrors)[0];
            if (firstError) {
                document.getElementById(firstError)?.focus();
            }
        }

        return isFormValid;
    }

    setLoadingState(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    handleKeyboardNavigation(e) {
        // Escape key closes modals
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal:not([aria-hidden="true"])');
            openModals.forEach(modal => {
                modal.style.display = 'none';
                modal.setAttribute('aria-hidden', 'true');
            });
        }
    }

    showCurlImportModal() {
        const modal = document.getElementById('curlModal');
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus on the textarea
        setTimeout(() => {
            document.getElementById('curlInput').focus();
        }, 100);
    }

    async startTest() {
        const startBtn = document.getElementById('startTest');
        
        // Validate form
        if (!this.validateForm()) {
            return;
        }

        this.hideValidationMessage();
        this.setLoadingState(startBtn, true);
        
        try {
            const config = this.getTestConfiguration();
            
            // Reset charts and stats
            this.resetStats();
            this.resetCharts();

            // Use WebSocket communication (original approach)
            this.socket.emit('start-test', config);
            this.showValidationMessage('Starting load test...', 'success');
            this.log('Initiating load test...', 'info');
            
            // The server will respond via WebSocket events
        } catch (error) {
            console.error('Error starting test:', error);
            this.showValidationMessage(`Error starting test: ${error.message}`);
            this.setLoadingState(startBtn, false);
        }
    }

    async stopTest() {
        const stopBtn = document.getElementById('stopTest');
        this.setLoadingState(stopBtn, true);

        try {
            if (this.currentTestId) {
                // Use WebSocket communication (original approach)
                this.socket.emit('stop-test', this.currentTestId);
                this.showValidationMessage('Stopping test...', 'success');
            }
        } catch (error) {
            console.error('Error stopping test:', error);
            this.showValidationMessage(`Error stopping test: ${error.message}`);
            this.setLoadingState(stopBtn, false);
        }
    }

    announceToScreenReader(message) {
        // Create a temporary element for screen reader announcements
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        
        document.body.appendChild(announcement);
        announcement.textContent = message;
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    updateTestControls() {
        const startBtn = document.getElementById('startTest');
        const stopBtn = document.getElementById('stopTest');
        const statusElement = document.getElementById('testStatus');

        if (this.isTestRunning) {
            startBtn.disabled = true;
            stopBtn.disabled = false;
            statusElement.textContent = 'Running';
            statusElement.style.color = '#68d391';
        } else {
            startBtn.disabled = false;
            stopBtn.disabled = true;
            statusElement.textContent = 'Ready';
            statusElement.style.color = '#4a5568';
        }
    }

    formatJSON(textarea) {
        try {
            if (textarea.value.trim()) {
                const parsed = JSON.parse(textarea.value);
                textarea.value = JSON.stringify(parsed, null, 2);
            }
        } catch (e) {
            // Invalid JSON, leave as is
        }
    }

    initializeCharts() {
        // Response Time Chart
        const responseTimeCtx = document.getElementById('responseTimeChart').getContext('2d');
        this.charts.responseTime = new Chart(responseTimeCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Response Time (ms)',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time (ms)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        // Request Rate Chart
        const requestRateCtx = document.getElementById('requestRateChart').getContext('2d');
        this.charts.requestRate = new Chart(requestRateCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Requests/sec',
                    data: [],
                    backgroundColor: 'rgba(102, 126, 234, 0.7)',
                    borderColor: '#667eea',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Requests/sec'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    setupSocketHandlers() {
        this.socket.on('test-started', (data) => {
            this.currentTestId = data.testId;
            this.isTestRunning = true;
            this.updateTestControls();
            this.showValidationMessage('Test started successfully!', 'success');
            this.log('Test started successfully', 'info');
            
            // Remove loading state from start button
            const startBtn = document.getElementById('startTest');
            this.setLoadingState(startBtn, false);
            
            // Announce to screen readers
            this.announceToScreenReader('Load test started');
        });

        this.socket.on('test-update', (data) => {
            this.updateStats(data.stats);
            this.updateCharts(data.stats);
            
            if (data.error) {
                this.log(`User ${data.userId}: Error - ${data.error}`, 'error');
                if (data.responseData) {
                    this.log(`User ${data.userId}: Response Data: ${data.responseData}`, 'error');
                }
                if (data.responseHeaders) {
                    this.log(`User ${data.userId}: Response Headers: ${JSON.stringify(data.responseHeaders, null, 2)}`, 'error');
                }
            } else {
                this.log(`User ${data.userId}: ${data.status} - ${data.responseTime}ms`, 'success');
                if (data.responseData) {
                    this.log(`User ${data.userId}: Response Data: ${data.responseData}`, 'info');
                }
                if (data.responseHeaders) {
                    this.log(`User ${data.userId}: Response Headers: ${JSON.stringify(data.responseHeaders, null, 2)}`, 'info');
                }
            }
        });

        this.socket.on('test-stopped', (data) => {
            this.isTestRunning = false;
            this.updateTestControls();
            this.showValidationMessage('Test stopped successfully!', 'success');
            this.log('Load test stopped', 'warning');
            
            // Remove loading state from stop button
            const stopBtn = document.getElementById('stopTest');
            this.setLoadingState(stopBtn, false);
            
            // Announce to screen readers
            this.announceToScreenReader('Load test stopped');
        });

        this.socket.on('test-completed', (data) => {
            this.isTestRunning = false;
            this.updateTestControls();
            this.showValidationMessage('Test completed successfully!', 'success');
            this.log('Load test completed', 'info');
            this.log(`Final Summary: ${this.formatTestSummary(data.finalStats)}`, 'info');
            
            // Remove loading state from buttons
            const startBtn = document.getElementById('startTest');
            const stopBtn = document.getElementById('stopTest');
            this.setLoadingState(startBtn, false);
            this.setLoadingState(stopBtn, false);
            
            // Announce to screen readers
            this.announceToScreenReader('Load test completed');
        });

        this.socket.on('connect', () => {
            this.log('Connected to server', 'info');
        });

        this.socket.on('disconnect', () => {
            this.log('Disconnected from server', 'warning');
            this.isTestRunning = false;
            this.updateTestControls();
            
            // Remove loading states
            const startBtn = document.getElementById('startTest');
            const stopBtn = document.getElementById('stopTest');
            this.setLoadingState(startBtn, false);
            this.setLoadingState(stopBtn, false);
        });

        // Handle connection errors
        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.showValidationMessage('Connection error: Unable to connect to server');
            
            // Remove loading states
            const startBtn = document.getElementById('startTest');
            const stopBtn = document.getElementById('stopTest');
            this.setLoadingState(startBtn, false);
            this.setLoadingState(stopBtn, false);
        });
    }

    getTestConfiguration() {
        const url = document.getElementById('url').value.trim();
        const method = document.getElementById('method').value;
        const concurrentUsers = parseInt(document.getElementById('concurrentUsers').value);
        const totalRequests = parseInt(document.getElementById('totalRequests').value);
        const delayBetweenRequests = parseInt(document.getElementById('delayBetweenRequests').value);
        const headersText = document.getElementById('headers').value.trim();
        const bodyText = document.getElementById('body').value.trim();

        if (!url) {
            throw new Error('Please enter a target URL');
        }

        if (concurrentUsers < 1 || concurrentUsers > 1000) {
            throw new Error('Concurrent users must be between 1 and 1000');
        }

        if (totalRequests < 1 || totalRequests > 50000) {
            throw new Error('Total requests must be between 1 and 50,000');
        }

        let headers = {};
        if (headersText) {
            try {
                headers = JSON.parse(headersText);
            } catch (e) {
                throw new Error('Headers must be valid JSON format');
            }
        }

        let body = '';
        if (bodyText) {
            try {
                // Try to parse as JSON to validate
                JSON.parse(bodyText);
                body = bodyText;
            } catch (e) {
                // If not valid JSON, treat as plain text
                body = bodyText;
            }
        }

        return {
            url,
            method,
            concurrentUsers,
            totalRequests,
            delayBetweenRequests,
            headers,
            body
        };
    }

    updateUI() {
        const startBtn = document.getElementById('startTest');
        const stopBtn = document.getElementById('stopTest');
        const statusElement = document.getElementById('testStatus');

        if (this.isTestRunning) {
            startBtn.disabled = true;
            stopBtn.disabled = false;
            statusElement.textContent = 'Running';
            statusElement.style.color = '#68d391';
        } else {
            startBtn.disabled = false;
            stopBtn.disabled = true;
            statusElement.textContent = 'Ready';
            statusElement.style.color = '#4a5568';
        }
    }

    updateStats(stats) {
        document.getElementById('sentRequests').textContent = stats.sentRequests || 0;
        document.getElementById('receivedResponses').textContent = stats.receivedResponses || 0;
        document.getElementById('totalRequests').textContent = stats.totalRequests || 0;
        document.getElementById('successfulRequests').textContent = stats.successfulRequests || 0;
        document.getElementById('failedRequests').textContent = stats.failedRequests || 0;
        document.getElementById('successRate').textContent = `${(stats.successRate || 0).toFixed(1)}%`;
        document.getElementById('avgResponseTime').textContent = `${(stats.avgResponseTime || 0).toFixed(0)}ms`;
        document.getElementById('requestsPerSecond').textContent = (stats.requestsPerSecond || 0).toFixed(1);
        document.getElementById('responseRate').textContent = (stats.responseRate || 0).toFixed(1);
        document.getElementById('tp90').textContent = `${(stats.tp90 || 0).toFixed(0)}ms`;
        document.getElementById('tp95').textContent = `${(stats.tp95 || 0).toFixed(0)}ms`;
        document.getElementById('elapsedTime').textContent = `${(stats.elapsedTime || 0).toFixed(0)}s`;

        // Update status code breakdown
        this.updateStatusCodeBreakdown(stats.statusCodes || {});

        // Add animation effect
        document.querySelectorAll('.metric-card').forEach(card => {
            card.classList.add('updating');
            setTimeout(() => card.classList.remove('updating'), 500);
        });
    }

    updateStatusCodeBreakdown(statusCodes) {
        const container = document.getElementById('statusCodeBreakdown');
        container.innerHTML = '';

        // Sort status codes numerically
        const sortedStatusCodes = Object.keys(statusCodes).sort((a, b) => parseInt(a) - parseInt(b));

        sortedStatusCodes.forEach(statusCode => {
            const count = statusCodes[statusCode];
            const statusCategory = this.getStatusCategory(parseInt(statusCode));
            
            const statusItem = document.createElement('div');
            statusItem.className = `status-code-item ${statusCategory}`;
            
            statusItem.innerHTML = `
                <div class="status-code">${statusCode}</div>
                <div class="status-count">${count}</div>
                <div class="status-label">${this.getStatusDescription(parseInt(statusCode))}</div>
            `;
            
            container.appendChild(statusItem);
        });
    }

    getStatusCategory(statusCode) {
        if (statusCode >= 200 && statusCode < 300) return 'status-2xx';
        if (statusCode >= 300 && statusCode < 400) return 'status-3xx';
        if (statusCode >= 400 && statusCode < 500) return 'status-4xx';
        if (statusCode >= 500) return 'status-5xx';
        return 'status-other';
    }

    getStatusDescription(statusCode) {
        const descriptions = {
            200: 'OK',
            201: 'Created',
            204: 'No Content',
            301: 'Moved Permanently',
            302: 'Found',
            304: 'Not Modified',
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            405: 'Method Not Allowed',
            429: 'Too Many Requests',
            500: 'Internal Server Error',
            502: 'Bad Gateway',
            503: 'Service Unavailable',
            504: 'Gateway Timeout'
        };
        
        return descriptions[statusCode] || 'Unknown';
    }

    updateCharts(stats) {
        const now = new Date().toLocaleTimeString();
        
        // Update response time chart
        this.chartData.responseTimes.push(stats.avgResponseTime || 0);
        this.chartData.timestamps.push(now);
        
        // Keep only last 20 data points
        if (this.chartData.responseTimes.length > 20) {
            this.chartData.responseTimes.shift();
            this.chartData.timestamps.shift();
        }

        this.charts.responseTime.data.labels = [...this.chartData.timestamps];
        this.charts.responseTime.data.datasets[0].data = [...this.chartData.responseTimes];
        this.charts.responseTime.update('none');

        // Update request rate chart
        this.chartData.requestRates.push(stats.requestsPerSecond || 0);
        
        if (this.chartData.requestRates.length > 20) {
            this.chartData.requestRates.shift();
        }

        this.charts.requestRate.data.labels = [...this.chartData.timestamps];
        this.charts.requestRate.data.datasets[0].data = [...this.chartData.requestRates];
        this.charts.requestRate.update('none');
    }

    resetStats() {
        document.getElementById('sentRequests').textContent = '0';
        document.getElementById('receivedResponses').textContent = '0';
        document.getElementById('totalRequests').textContent = '0';
        document.getElementById('successfulRequests').textContent = '0';
        document.getElementById('failedRequests').textContent = '0';
        document.getElementById('successRate').textContent = '0%';
        document.getElementById('avgResponseTime').textContent = '0ms';
        document.getElementById('requestsPerSecond').textContent = '0';
        document.getElementById('responseRate').textContent = '0';
        document.getElementById('tp90').textContent = '0ms';
        document.getElementById('tp95').textContent = '0ms';
        document.getElementById('elapsedTime').textContent = '0s';
    }

    resetCharts() {
        this.chartData = {
            responseTimes: [],
            requestRates: [],
            timestamps: []
        };

        this.charts.responseTime.data.labels = [];
        this.charts.responseTime.data.datasets[0].data = [];
        this.charts.responseTime.update();

        this.charts.requestRate.data.labels = [];
        this.charts.requestRate.data.datasets[0].data = [];
        this.charts.requestRate.update();
    }

    log(message, type = 'info') {
        const logContainer = document.getElementById('testLog');
        const timestamp = new Date().toLocaleTimeString();
        
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        
        logEntry.innerHTML = `
            <span class="log-timestamp">[${timestamp}]</span>
            <span class="log-${type}">${message}</span>
        `;

        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;

        // Keep only last 100 log entries
        while (logContainer.children.length > 100) {
            logContainer.removeChild(logContainer.firstChild);
        }
    }

    generateSummaryReport(stats) {
        this.log('=== TEST SUMMARY ===', 'info');
        this.log(`Total Requests: ${stats.totalRequests}`, 'info');
        this.log(`Successful: ${stats.successfulRequests} (${stats.successRate.toFixed(1)}%)`, 'success');
        this.log(`Failed: ${stats.failedRequests}`, 'error');
        this.log(`Average Response Time: ${stats.avgResponseTime.toFixed(0)}ms`, 'info');
        this.log(`Min Response Time: ${stats.minResponseTime}ms`, 'info');
        this.log(`Max Response Time: ${stats.maxResponseTime}ms`, 'info');
        this.log(`TP90 Response Time: ${(stats.tp90 || 0).toFixed(0)}ms`, 'info');
        this.log(`TP95 Response Time: ${(stats.tp95 || 0).toFixed(0)}ms`, 'info');
        this.log(`Requests per Second: ${stats.requestsPerSecond.toFixed(1)}`, 'info');
        this.log(`Test Duration: ${stats.elapsedTime.toFixed(0)}s`, 'info');
        this.log('=== END SUMMARY ===', 'info');
    }

    saveTestToHistory(stats) {
        console.log('Test completed and saved to history');
    }

    async showTestHistory() {
        try {
            const response = await fetch('/api/history');
            const history = await response.json();
            
            const modal = document.getElementById('historyModal');
            const historyList = document.getElementById('historyList');
            
            historyList.innerHTML = '';
            
            if (history.length === 0) {
                historyList.innerHTML = '<div class="no-history">No test history available</div>';
            } else {
                history.forEach(item => {
                    const historyItem = this.createHistoryItem(item);
                    historyList.appendChild(historyItem);
                });
            }
            
            modal.style.display = 'block';
        } catch (error) {
            console.error('Error loading test history:', error);
            this.log('Error loading test history', 'error');
        }
    }

    createHistoryItem(item) {
        const div = document.createElement('div');
        div.className = 'history-item';
        
        const timestamp = new Date(item.timestamp).toLocaleString();
        const duration = item.duration ? `${item.duration.toFixed(1)}s` : 'N/A';
        
        div.innerHTML = `
            <div class="history-header">
                <div class="history-title">${item.config.method} ${item.config.url}</div>
                <div class="history-timestamp">${timestamp}</div>
            </div>
            
            <div class="history-config">
                <div class="history-config-item">
                    <div class="history-config-label">Method</div>
                    <div class="history-config-value">${item.config.method}</div>
                </div>
                <div class="history-config-item">
                    <div class="history-config-label">Concurrent Users</div>
                    <div class="history-config-value">${item.config.concurrentUsers}</div>
                </div>
                <div class="history-config-item">
                    <div class="history-config-label">Total Requests</div>
                    <div class="history-config-value">${item.config.totalRequests}</div>
                </div>
                <div class="history-config-item">
                    <div class="history-config-label">Delay</div>
                    <div class="history-config-value">${item.config.delayBetweenRequests}ms</div>
                </div>
            </div>
            
            <div class="history-stats">
                <div class="history-stat">
                    <div class="history-stat-value">${item.stats.totalRequests || 0}</div>
                    <div class="history-stat-label">Total Requests</div>
                </div>
                <div class="history-stat">
                    <div class="history-stat-value">${item.stats.successfulRequests || 0}</div>
                    <div class="history-stat-label">Successful</div>
                </div>
                <div class="history-stat">
                    <div class="history-stat-value">${(item.stats.successRate || 0).toFixed(1)}%</div>
                    <div class="history-stat-label">Success Rate</div>
                </div>
                <div class="history-stat">
                    <div class="history-stat-value">${(item.stats.avgResponseTime || 0).toFixed(0)}ms</div>
                    <div class="history-stat-label">Avg Response</div>
                </div>
                <div class="history-stat">
                    <div class="history-stat-value">${duration}</div>
                    <div class="history-stat-label">Duration</div>
                </div>
            </div>
            
            <div class="history-actions">
                <button class="btn btn-primary btn-small" onclick="loadTestUI.loadAndRunTest('${item.id}')">
                    Run Again
                </button>
                <button class="btn btn-danger btn-small" onclick="loadTestUI.deleteHistoryItem('${item.id}')">
                    Delete
                </button>
            </div>
        `;
        
        return div;
    }

    async loadAndRunTest(historyId) {
        try {
            const response = await fetch(`/api/history/${historyId}/run`, {
                method: 'POST'
            });
            
            if (response.ok) {
                const data = await response.json();
                this.loadTestConfig(data.config);
                document.getElementById('historyModal').style.display = 'none';
                this.log('Test configuration loaded. Click "Start Load Test" to run.', 'info');
            } else {
                this.log('Error loading test configuration', 'error');
            }
        } catch (error) {
            console.error('Error loading test:', error);
            this.log('Error loading test configuration', 'error');
        }
    }

    loadTestConfig(config) {
        document.getElementById('url').value = config.url || '';
        document.getElementById('method').value = config.method || 'GET';
        document.getElementById('concurrentUsers').value = config.concurrentUsers || 10;
        document.getElementById('totalRequests').value = config.totalRequests || 100;
        document.getElementById('delayBetweenRequests').value = config.delayBetweenRequests || 1000;
        
        if (config.headers) {
            document.getElementById('headers').value = typeof config.headers === 'string' ? 
                config.headers : JSON.stringify(config.headers, null, 2);
        } else {
            document.getElementById('headers').value = '';
        }
        
        if (config.body) {
            document.getElementById('body').value = typeof config.body === 'string' ? 
                config.body : JSON.stringify(config.body, null, 2);
        } else {
            document.getElementById('body').value = '';
        }
    }

    async deleteHistoryItem(historyId) {
        if (confirm('Are you sure you want to delete this test history?')) {
            try {
                const response = await fetch(`/api/history/${historyId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    this.showTestHistory(); // Refresh the list
                    this.log('Test history deleted', 'info');
                } else {
                    this.log('Error deleting test history', 'error');
                }
            } catch (error) {
                console.error('Error deleting test:', error);
                this.log('Error deleting test history', 'error');
            }
        }
    }

    async clearTestHistory() {
        if (confirm('Are you sure you want to clear all test history?')) {
            try {
                const response = await fetch('/api/history', {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    this.showTestHistory(); // Refresh the list
                    this.log('All test history cleared', 'info');
                } else {
                    this.log('Error clearing test history', 'error');
                }
            } catch (error) {
                console.error('Error clearing history:', error);
                this.log('Error clearing test history', 'error');
            }
        }
    }

    showCurlImportModal() {
        document.getElementById('curlModal').style.display = 'block';
        document.getElementById('curlInput').focus();
    }

    parseCurlCommand() {
        const curlInput = document.getElementById('curlInput').value.trim();
        
        if (!curlInput) {
            this.log('Please enter a cURL command', 'error');
            return;
        }

        try {
            const config = this.parseCurl(curlInput);
            this.loadTestConfig(config);
            document.getElementById('curlModal').style.display = 'none';
            document.getElementById('curlInput').value = '';
            this.log('cURL command imported successfully!', 'success');
        } catch (error) {
            console.error('Error parsing cURL:', error);
            this.log(`Error parsing cURL: ${error.message}`, 'error');
        }
    }

    parseCurl(curlString) {
        // Clean up the curl string
        let cleaned = curlString
            .replace(/\\\n/g, ' ')  // Handle line continuations
            .replace(/\s+/g, ' ')   // Normalize whitespace
            .trim();

        // Remove 'curl' command if present
        if (cleaned.toLowerCase().startsWith('curl ')) {
            cleaned = cleaned.substring(5);
        }

        const config = {
            url: '',
            method: 'GET',
            headers: {},
            body: ''
        };

        // Split into tokens, respecting quotes
        const tokens = this.tokenizeCurl(cleaned);
        
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            
            if (token === '-X' || token === '--request') {
                i++;
                if (i < tokens.length) {
                    config.method = tokens[i].toUpperCase();
                }
            } else if (token === '-H' || token === '--header') {
                i++;
                if (i < tokens.length) {
                    const header = tokens[i];
                    const colonIndex = header.indexOf(':');
                    if (colonIndex > 0) {
                        const key = header.substring(0, colonIndex).trim();
                        const value = header.substring(colonIndex + 1).trim();
                        config.headers[key] = value;
                    }
                }
            } else if (token === '-d' || token === '--data' || token === '--data-raw') {
                i++;
                if (i < tokens.length) {
                    config.body = tokens[i];
                    if (config.method === 'GET') {
                        config.method = 'POST'; // Assume POST when data is provided
                    }
                }
            } else if (token === '-u' || token === '--user') {
                i++;
                if (i < tokens.length) {
                    const userPass = tokens[i];
                    const encoded = btoa(userPass);
                    config.headers['Authorization'] = `Basic ${encoded}`;
                }
            } else if (token === '-A' || token === '--user-agent') {
                i++;
                if (i < tokens.length) {
                    config.headers['User-Agent'] = tokens[i];
                }
            } else if (token.startsWith('http://') || token.startsWith('https://')) {
                config.url = token;
            } else if (!token.startsWith('-') && !config.url && token.includes('.')) {
                // Fallback: assume it's a URL if no URL found yet
                config.url = token.startsWith('http') ? token : `https://${token}`;
            }
        }

        if (!config.url) {
            throw new Error('No URL found in cURL command');
        }

        return config;
    }

    tokenizeCurl(str) {
        const tokens = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';
        let escaped = false;

        for (let i = 0; i < str.length; i++) {
            const char = str[i];

            if (escaped) {
                current += char;
                escaped = false;
                continue;
            }

            if (char === '\\') {
                escaped = true;
                continue;
            }

            if (!inQuotes && (char === '"' || char === "'")) {
                inQuotes = true;
                quoteChar = char;
                continue;
            }

            if (inQuotes && char === quoteChar) {
                inQuotes = false;
                quoteChar = '';
                continue;
            }

            if (!inQuotes && char === ' ') {
                if (current) {
                    tokens.push(current);
                    current = '';
                }
                continue;
            }

            current += char;
        }

        if (current) {
            tokens.push(current);
        }

        return tokens;
    }
}

// Initialize the application when the page loads
let loadTestUI;

document.addEventListener('DOMContentLoaded', () => {
    loadTestUI = new LoadTestUI();
});
