const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const si = require('systeminformation');
const path = require('path');

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Store active monitoring sessions and their last stats
const activeSessions = new Map();
const lastStats = new Map();

io.on('connection', (socket) => {
    console.log('Client connected');

    // Send available network interfaces
    si.networkInterfaces().then(data => {
        const interfaces = data.filter(iface => iface.type === 'wireless' || iface.type === 'wired');
        socket.emit('networkInterfaces', interfaces);
    });

    // Handle start monitoring
    socket.on('startMonitoring', async (interfaceName) => {
        if (activeSessions.has(socket.id)) {
            clearInterval(activeSessions.get(socket.id));
        }

        try {
            // Get initial stats
            const initialStats = await si.networkStats(interfaceName);
            if (initialStats && initialStats.length > 0) {
                lastStats.set(socket.id, initialStats[0]);
            }

            const intervalId = setInterval(async () => {
                try {
                    const currentStats = await si.networkStats(interfaceName);
                    if (currentStats && currentStats.length > 0) {
                        const lastStat = lastStats.get(socket.id);
                        const currentStat = currentStats[0];

                        if (lastStat) {
                            // Calculate delta values
                            const deltaStats = {
                                timestamp: new Date(),
                                interface: interfaceName,
                                rx_bytes: Math.max(0, currentStat.rx_bytes - lastStat.rx_bytes),
                                tx_bytes: Math.max(0, currentStat.tx_bytes - lastStat.tx_bytes)
                            };

                            // Only emit if there's actual network activity
                            if (deltaStats.rx_bytes > 0 || deltaStats.tx_bytes > 0) {
                                socket.emit('networkData', deltaStats);
                            }
                        }

                        // Update last stats
                        lastStats.set(socket.id, currentStat);
                    }
                } catch (error) {
                    console.error('Error getting network stats:', error);
                    socket.emit('error', 'Failed to get network statistics');
                }
            }, 1000);

            activeSessions.set(socket.id, intervalId);
            console.log(`Started monitoring for interface: ${interfaceName}`);
        } catch (error) {
            console.error('Error starting monitoring:', error);
            socket.emit('error', 'Failed to start monitoring');
        }
    });

    // Handle stop monitoring
    socket.on('stopMonitoring', () => {
        if (activeSessions.has(socket.id)) {
            clearInterval(activeSessions.get(socket.id));
            activeSessions.delete(socket.id);
            lastStats.delete(socket.id);
            console.log('Stopped monitoring');
        }
    });

    // Clean up on disconnect
    socket.on('disconnect', () => {
        if (activeSessions.has(socket.id)) {
            clearInterval(activeSessions.get(socket.id));
            activeSessions.delete(socket.id);
            lastStats.delete(socket.id);
        }
        console.log('Client disconnected');
    });
});

// Start server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
