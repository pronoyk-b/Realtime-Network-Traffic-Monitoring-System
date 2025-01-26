// Connect to Socket.IO server
const socket = io();

// DOM elements
const interfaceSelect = document.getElementById('interfaceSelect');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const dataReceived = document.getElementById('dataReceived');
const dataSent = document.getElementById('dataSent');
const dataTransfer = document.getElementById('dataTransfer');
const packetList = document.getElementById('packetList');
const trafficChart = document.getElementById('trafficChart');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const downloadTimeRangeBtn = document.getElementById('downloadTimeRangeBtn');

// Variables for statistics
let totalReceived = 0;
let totalSent = 0;

// Store network data for download
let networkDataLog = [];

// Initialize Chart.js
const ctx = trafficChart.getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Data Received',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            tension: 0.4,
            cubicInterpolationMode: 'monotone'
        }, {
            label: 'Data Sent',
            data: [],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true,
            tension: 0.4,
            cubicInterpolationMode: 'monotone'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 750,
            easing: 'easeInOutQuart'
        },
        scales: {
            x: {
                grid: {
                    display: false
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    callback: function(value) {
                        return bytesToMB(value) + ' MB';
                    }
                }
            }
        },
        plugins: {
            legend: {
                position: 'top'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.dataset.label + ': ' + bytesToMB(context.raw) + ' MB';
                    }
                }
            }
        },
        elements: {
            point: {
                radius: 0,
                hitRadius: 10,
                hoverRadius: 4
            },
            line: {
                borderWidth: 2
            }
        }
    }
});

// Store last few data points for smoothing
const smoothingWindow = 5;
let receivedBuffer = Array(smoothingWindow).fill(0);
let sentBuffer = Array(smoothingWindow).fill(0);

// Function to calculate moving average
function calculateMovingAverage(buffer) {
    return buffer.reduce((a, b) => a + b, 0) / buffer.length;
}

// Convert bytes to MB
function bytesToMB(bytes) {
    return (bytes / (1024 * 1024)).toFixed(2);
}

// Format timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
}

// Format bytes
function formatBytes(bytes) {
    return bytesToMB(bytes) + ' MB';
}

// Update network statistics
function updateStats(data) {
    totalReceived += data.rx_bytes;
    totalSent += data.tx_bytes;
    
    dataReceived.textContent = formatBytes(totalReceived);
    dataSent.textContent = formatBytes(totalSent);
    dataTransfer.textContent = formatBytes(totalReceived + totalSent);
}

// Add packet to table
function addPacketToTable(data) {
    const row = document.createElement('tr');
    const timestamp = new Date(data.timestamp);
    
    row.innerHTML = `
        <td>${timestamp.toLocaleTimeString()}</td>
        <td>${data.interface}</td>
        <td>${formatBytes(data.rx_bytes)}</td>
        <td>${formatBytes(data.tx_bytes)}</td>
        <td>${formatBytes(data.rx_bytes + data.tx_bytes)}</td>
    `;
    
    if (packetList.firstChild) {
        packetList.insertBefore(row, packetList.firstChild);
    } else {
        packetList.appendChild(row);
    }
    
    // Keep only last 100 rows
    while (packetList.children.length > 100) {
        packetList.removeChild(packetList.lastChild);
    }
}

// Function to update chart with new data
function updateChart(data) {
    const timestamp = new Date(data.timestamp);
    const labels = chart.data.labels;
    const receivedData = chart.data.datasets[0].data;
    const sentData = chart.data.datasets[1].data;

    // Update buffers
    receivedBuffer = [...receivedBuffer.slice(1), data.rx_bytes];
    sentBuffer = [...sentBuffer.slice(1), data.tx_bytes];

    // Calculate smoothed values
    const smoothedReceived = calculateMovingAverage(receivedBuffer);
    const smoothedSent = calculateMovingAverage(sentBuffer);

    // Add new data points
    labels.push(formatTimestamp(timestamp));
    receivedData.push(smoothedReceived);
    sentData.push(smoothedSent);

    // Keep last 20 data points
    const maxDataPoints = 20;
    if (labels.length > maxDataPoints) {
        labels.shift();
        receivedData.shift();
        sentData.shift();
    }

    chart.update('none'); // Use 'none' mode for smoother updates
}

// Function to convert data to CSV
function convertToCSV(data) {
    const headers = ['Date', 'Time', 'Interface', 'Received (bytes)', 'Sent (bytes)', 'Total Transfer'];
    const rows = data.map(entry => [
        entry.date,
        entry.time,
        entry.interface,
        entry.rx_bytes,
        entry.tx_bytes,
        entry.rx_bytes + entry.tx_bytes
    ]);
    
    return [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');
}

// Function to download CSV file
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Download all data
downloadAllBtn.addEventListener('click', () => {
    if (networkDataLog.length === 0) {
        alert('No data available to download');
        return;
    }
    
    const csvContent = convertToCSV(networkDataLog);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadCSV(csvContent, `network-traffic-${timestamp}.csv`);
});

// Download time range data
downloadTimeRangeBtn.addEventListener('click', async () => {
    if (networkDataLog.length === 0) {
        alert('No data available to download');
        return;
    }

    // Get start time
    const startTimeStr = prompt('Enter start time (YYYY-MM-DD HH:mm:ss):', 
        new Date(networkDataLog[0].timestamp).toLocaleString().replace(',', ''));
    if (!startTimeStr) return;

    // Get end time
    const endTimeStr = prompt('Enter end time (YYYY-MM-DD HH:mm:ss):', 
        new Date().toLocaleString().replace(',', ''));
    if (!endTimeStr) return;

    // Parse times
    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        alert('Invalid date format. Please use YYYY-MM-DD HH:mm:ss');
        return;
    }

    if (startTime > endTime) {
        alert('Start time must be before end time');
        return;
    }

    // Filter data by time range
    const filteredData = networkDataLog.filter(entry => 
        entry.timestamp >= startTime && entry.timestamp <= endTime
    );

    if (filteredData.length === 0) {
        alert('No data available in the specified time range');
        return;
    }

    const csvContent = convertToCSV(filteredData);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadCSV(csvContent, `network-traffic-${startTime.toISOString().slice(0,10)}-to-${endTime.toISOString().slice(0,10)}.csv`);
});

// Socket.IO event handlers
socket.on('networkInterfaces', (interfaces) => {
    interfaces.forEach(iface => {
        const option = document.createElement('option');
        option.value = iface.iface;
        option.textContent = `${iface.iface} (${iface.type})`;
        interfaceSelect.appendChild(option);
    });
});

socket.on('networkData', (data) => {
    updateStats(data);
    updateChart(data);
    
    // Add to network data log with formatted date and time
    const timestamp = new Date(data.timestamp);
    const logEntry = {
        ...data,
        date: timestamp.toLocaleDateString(),
        time: timestamp.toLocaleTimeString(),
        timestamp: timestamp
    };
    networkDataLog.push(logEntry);
    addPacketToTable(logEntry);
});

socket.on('error', (error) => {
    console.error('Error:', error);
    alert('An error occurred: ' + error);
});

// Button event handlers
startButton.addEventListener('click', () => {
    const selectedInterface = interfaceSelect.value;
    if (selectedInterface) {
        socket.emit('startMonitoring', selectedInterface);
        startButton.disabled = true;
        stopButton.disabled = false;
        interfaceSelect.disabled = true;
    } else {
        alert('Please select a network interface');
    }
});

stopButton.addEventListener('click', () => {
    socket.emit('stopMonitoring');
    startButton.disabled = false;
    stopButton.disabled = true;
    interfaceSelect.disabled = false;
});
