const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));
app.use(express.json());

// Store active tests and test history
const activeTests = new Map();
const testHistoryFile = path.join(__dirname, 'test-history.json');

// Load test history from file
function loadTestHistory() {
    try {
        if (fs.existsSync(testHistoryFile)) {
            const data = fs.readFileSync(testHistoryFile, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.log('Error loading test history:', error.message);
    }
    return [];
}

// Save test history to file
function saveTestHistory(history) {
    try {
        fs.writeFileSync(testHistoryFile, JSON.stringify(history, null, 2));
    } catch (error) {
        console.log('Error saving test history:', error.message);
    }
}

// Initialize test history
let testHistory = loadTestHistory();

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoints for test history
app.get('/api/history', (req, res) => {
    res.json(testHistory);
});

app.post('/api/history/:id/run', (req, res) => {
    const historyId = req.params.id;
    const historyItem = testHistory.find(item => item.id === historyId);
    
    if (!historyItem) {
        return res.status(404).json({ error: 'Test history not found' });
    }
    
    res.json({ 
        message: 'Test configuration loaded', 
        config: historyItem.config 
    });
});

app.delete('/api/history/:id', (req, res) => {
    const historyId = req.params.id;
    const index = testHistory.findIndex(item => item.id === historyId);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Test history not found' });
    }
    
    testHistory.splice(index, 1);
    saveTestHistory(testHistory);
    res.json({ message: 'Test history deleted' });
});

app.delete('/api/history', (req, res) => {
    testHistory = [];
    saveTestHistory(testHistory);
    res.json({ message: 'All test history cleared' });
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('start-test', async (config) => {
        const testId = uuidv4();
        const test = {
            id: testId,
            config: config,
            startTime: Date.now(),
            isRunning: true,
            stats: {
                sentRequests: 0,
                receivedResponses: 0,
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                responseTimes: [],
                errors: [],
                statusCodes: {},
                requestsToSend: config.totalRequests || 100, // Total requests to send
                requestsSentCount: 0, // Track how many have been sent
                minResponseTime: Infinity,
                maxResponseTime: 0
            }
        };

        activeTests.set(testId, test);
        
        socket.emit('test-started', { testId: testId });
        console.log(`Test ${testId} started with ${config.concurrentUsers} users and ${config.totalRequests} total requests`);

        // Execute the load test
        executeLoadTest(test, socket);
    });

    socket.on('stop-test', (testId) => {
        if (activeTests.has(testId)) {
            const test = activeTests.get(testId);
            test.isRunning = false;
            console.log('Test stopped:', testId);
            socket.emit('test-stopped', { testId });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

async function executeLoadTest(test, socket) {
    const { config } = test;
    const { url, method, headers, body, concurrentUsers, delayBetweenRequests } = config;

    const promises = [];
    const startTime = Date.now();
    
    // Create concurrent users
    for (let i = 0; i < concurrentUsers; i++) {
        promises.push(simulateUser(test, socket, i));
    }

    // Wait for all users to complete or test to stop
    await Promise.all(promises);

    // Complete the test if it's still running
    if (test.isRunning) {
        test.isRunning = false;
        socket.emit('test-completed', {
            testId: test.id,
            stats: calculateFinalStats(test)
        });
    }

    // Save test to history
    const historyItem = {
        id: test.id,
        config: test.config,
        stats: calculateFinalStats(test),
        timestamp: new Date().toISOString(),
        endTime: Date.now(),
        duration: (Date.now() - test.startTime) / 1000
    };
    
    testHistory.unshift(historyItem); // Add to beginning
    
    // Keep only last 50 tests
    if (testHistory.length > 50) {
        testHistory = testHistory.slice(0, 50);
    }
    
    saveTestHistory(testHistory);
}

async function simulateUser(test, socket, userId) {
    const { config } = test;
    const { url, method, headers, body, delayBetweenRequests } = config;

    while (test.isRunning) {
        // Use atomic operation to check and decrement available requests
        if (test.stats.requestsToSend <= 0) {
            break; // No more requests to send
        }
        
        // Reserve a request slot
        test.stats.requestsToSend--;
        test.stats.requestsSentCount++;
        
        const requestStart = Date.now();
        
        // Increment sent requests immediately
        test.stats.sentRequests++;
        
        // Emit immediate update for sent requests
        socket.emit('test-update', {
            testId: test.id,
            stats: calculateCurrentStats(test),
            userId: userId,
            event: 'request-sent'
        });

        try {
            const requestConfig = {
                method: method.toLowerCase(),
                url: url,
                headers: headers || {},
                timeout: 30000,
                validateStatus: function (status) {
                    return status >= 100 && status < 600; // Accept all valid HTTP status codes
                }
            };

            if (body && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT' || method.toUpperCase() === 'PATCH')) {
                if (typeof body === 'string') {
                    try {
                        // Try to parse as JSON first
                        JSON.parse(body);
                        requestConfig.data = body;
                    } catch (e) {
                        // If not valid JSON, send as string
                        requestConfig.data = body;
                    }
                } else {
                    requestConfig.data = JSON.stringify(body);
                }
                
                // Ensure Content-Type is set if not already provided
                if (!requestConfig.headers['Content-Type'] && !requestConfig.headers['content-type']) {
                    requestConfig.headers['Content-Type'] = 'application/json';
                }
            }

            console.log(`User ${userId}: Making ${method} request to ${url}`);
            console.log(`User ${userId}: Headers:`, JSON.stringify(requestConfig.headers, null, 2));
            if (requestConfig.data) {
                console.log(`User ${userId}: Body:`, requestConfig.data.substring(0, 200) + (requestConfig.data.length > 200 ? '...' : ''));
            }
            
            const response = await axios(requestConfig);
            const responseTime = Date.now() - requestStart;

            console.log(`User ${userId}: Got response ${response.status} in ${responseTime}ms`);
            console.log(`User ${userId}: Response headers:`, JSON.stringify(response.headers, null, 2));
            console.log(`User ${userId}: Response data:`, typeof response.data === 'string' ? response.data.substring(0, 500) : JSON.stringify(response.data, null, 2).substring(0, 500));

            // Update statistics for received response - only 200 is success
            const isSuccess = response.status === 200;
            updateStatsForResponse(test, responseTime, isSuccess, response.status);
            
            // Emit real-time update for response with response data
            socket.emit('test-update', {
                testId: test.id,
                stats: calculateCurrentStats(test),
                userId: userId,
                responseTime: responseTime,
                status: response.status,
                statusCode: response.status,
                responseData: typeof response.data === 'string' ? response.data.substring(0, 200) : JSON.stringify(response.data, null, 2).substring(0, 200),
                responseHeaders: response.headers,
                event: 'response-received'
            });

        } catch (error) {
            const responseTime = Date.now() - requestStart;
            
            console.log(`User ${userId}: Request failed - ${error.message} (${responseTime}ms)`);
            if (error.response) {
                console.log(`User ${userId}: Response status: ${error.response.status}`);
                console.log(`User ${userId}: Response headers:`, JSON.stringify(error.response.headers, null, 2));
                console.log(`User ${userId}: Response data:`, typeof error.response.data === 'string' ? error.response.data.substring(0, 500) : JSON.stringify(error.response.data, null, 2).substring(0, 500));
                
                // Update statistics with error response status - only 200 is success
                const isSuccess = error.response.status === 200;
                updateStatsForResponse(test, responseTime, isSuccess, error.response.status);
                if (error.message) {
                    test.stats.errors.push(error.message);
                }
            } else {
                // Network error or timeout - definitely not success
                updateStatsForResponse(test, responseTime, false, null);
                test.stats.errors.push(error.message);
            }
            
            // Emit error update with response data
            socket.emit('test-update', {
                testId: test.id,
                stats: calculateCurrentStats(test),
                userId: userId,
                responseTime: responseTime,
                error: error.message,
                statusCode: error.response ? error.response.status : null,
                responseData: error.response ? (typeof error.response.data === 'string' ? error.response.data.substring(0, 200) : JSON.stringify(error.response.data, null, 2).substring(0, 200)) : null,
                responseHeaders: error.response ? error.response.headers : null,
                event: 'response-received'
            });
        }

        // Delay between requests
        if (delayBetweenRequests > 0 && test.isRunning) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
        }
    }
}

function updateStatsForResponse(test, responseTime, success, statusCode = null) {
    const stats = test.stats;
    
    stats.receivedResponses++;
    stats.totalRequests++;
    
    // Only count status code 200 as successful
    if (success && statusCode === 200) {
        stats.successfulRequests++;
    } else {
        stats.failedRequests++;
    }

    // Track count for each status code
    if (statusCode !== null) {
        if (!stats.statusCodes[statusCode]) {
            stats.statusCodes[statusCode] = 0;
        }
        stats.statusCodes[statusCode]++;
    }

    stats.responseTimes.push(responseTime);
    stats.minResponseTime = Math.min(stats.minResponseTime, responseTime);
    stats.maxResponseTime = Math.max(stats.maxResponseTime, responseTime);
}

function calculateCurrentStats(test) {
    const stats = test.stats;
    const elapsedTime = (Date.now() - test.startTime) / 1000;
    
    // Calculate average response time
    if (stats.responseTimes.length > 0) {
        stats.avgResponseTime = stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length;
        
        // Calculate percentiles (TP90, TP95)
        const sortedTimes = [...stats.responseTimes].sort((a, b) => a - b);
        stats.tp90 = calculatePercentile(sortedTimes, 90);
        stats.tp95 = calculatePercentile(sortedTimes, 95);
    } else {
        stats.tp90 = 0;
        stats.tp95 = 0;
    }
    
    // Calculate requests per second
    stats.requestsPerSecond = stats.totalRequests / elapsedTime;
    stats.responseRate = stats.receivedResponses / elapsedTime;
    
    return {
        ...stats,
        elapsedTime: elapsedTime,
        successRate: stats.totalRequests > 0 ? (stats.successfulRequests / stats.totalRequests) * 100 : 0
    };
}

function calculatePercentile(sortedArray, percentile) {
    if (sortedArray.length === 0) return 0;
    
    const index = (percentile / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
        return sortedArray[lower];
    }
    
    const weight = index - lower;
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}

function calculateFinalStats(test) {
    return calculateCurrentStats(test);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Load Test Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
