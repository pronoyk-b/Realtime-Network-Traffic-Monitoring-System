# Real-time Network Traffic Monitor

A real-time network traffic monitoring system built with Node.js and Socket.IO that provides live visualization of network traffic data.

## Features

- Real-time network traffic monitoring
- Interactive line chart visualization
- Network interface selection
- Data export functionality (CSV)
  - Export all data
  - Export data by time range
- Clean and modern UI with Bootstrap

## Prerequisites

- Node.js (v12 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
   ```bash
   git clone [your-repository-url]
   ```

2. Navigate to the project directory:
   ```bash
   cd realtime-network-traffic-monitor
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the application:
   ```bash
   npm start
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

3. Select a network interface and click "Start Monitoring"

## Features

### Network Monitoring
- View real-time data transfer rates
- Monitor data received and sent
- Track total data transfer

### Data Visualization
- Smooth, real-time line chart
- Color-coded received and sent data
- Moving average smoothing for better readability

### Data Export
- Export all monitoring data as CSV
- Export data for specific time ranges
- Separate date and time columns in exported files

## Technologies Used

- Backend:
  - Node.js
  - Express
  - Socket.IO
  - systeminformation

- Frontend:
  - HTML5
  - CSS3
  - JavaScript
  - Chart.js
  - Bootstrap 5
  - Font Awesome

## License

This project is licensed under the MIT License - see the LICENSE file for details.
