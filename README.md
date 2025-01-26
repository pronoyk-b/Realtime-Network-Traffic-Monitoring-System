# Network Traffic Monitor

A real-time network traffic monitoring system that provides detailed statistics and visualizations of your network usage.

## Features

- Real-time network traffic monitoring
- Interactive line charts showing data transfer rates
- Detailed statistics including:
  - Data Received (MB)
  - Data Sent (MB)
  - Total Transfer (MB)
  - Packet Counts
- Data export functionality with CSV downloads
- Interface selection for monitoring specific network adapters
- Simultaneous monitoring of download and upload speeds

## Screenshots

### Main User Interface
![Main User Interface](Images/user%20interface.png)
*The main dashboard showing real-time network statistics and monitoring controls.*

### Download Speed Monitoring
![Download Speed Monitoring](Images/downloading%20speed%20monitor.png)
*Real-time visualization of network download speed with interactive charts.*

### Upload Speed Monitoring
![Upload Speed Monitoring](Images/uploading%20speed%20monitor.png)
*Real-time visualization of network upload speed with interactive charts.*

**Note:** The system is capable of monitoring both download and upload speeds simultaneously, providing comprehensive network traffic analysis in real-time.

## Prerequisites

- Windows Operating System
- Node.js (v14.0.0 or higher)
- Modern web browser (Chrome, Firefox, Edge recommended)

## First Time Setup

1. **Initial Setup**
   - Right-click on `setup.bat` and select "Run as administrator"
   - The setup script will:
     - Check for Node.js installation
     - Configure PowerShell execution policies
     - Install required dependencies
     - Create necessary configuration files

2. **Troubleshooting First-Time Setup**
   - If Node.js is missing:
     - The setup will open the Node.js download page
     - Install Node.js and run setup.bat again
   - If PowerShell restrictions appear:
     - The setup will attempt to fix them automatically
     - Follow any on-screen instructions if manual intervention is needed
   - If network issues occur:
     - Check your internet connection
     - Try running setup.bat again

## Regular Usage

1. **Starting the Application**
   - Double-click `start.bat`
   - Your default web browser will open automatically to http://localhost:3000
   - The application will start monitoring network traffic immediately

2. **Using the Application**
   - Select a network interface from the dropdown
   - Click "Start Capture" to begin monitoring
   - View real-time statistics and charts
   - Use the download button to export data
   - Click "Stop Capture" when finished

3. **Exporting Data**
   - Click the "Download" button
   - Choose between:
     - All Data: Exports complete monitoring session
     - Time Range: Select specific start and end times

## File Structure

- `setup.bat` - Initial setup script
- `start.bat` - Application launcher
- `server.js` - Backend server code
- `public/` - Frontend files
  - `index.html` - Main webpage
  - `app.js` - Frontend logic
  - `styles.css` - Styling

## Common Issues and Solutions

1. **Port 3000 Already in Use**
   - Close other applications that might be using port 3000
   - Or modify the port in server.js

2. **Administrator Rights**
   - Right-click and select "Run as administrator" for setup.bat
   - Follow on-screen instructions

3. **PowerShell Execution Policy**
   - The setup script will handle this automatically
   - If manual intervention is needed, run PowerShell as administrator:
     ```powershell
     Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
     ```

4. **Dependencies Installation Failed**
   - Check internet connection
   - Try running setup.bat again
   - If problem persists, manually run:
     ```bash
     npm install
     ```

## Technical Details

- Backend: Node.js with Express
- Frontend: HTML5, CSS3, JavaScript
- Libraries:
  - Chart.js for visualizations
  - Socket.io for real-time updates
  - systeminformation for network monitoring

## Security Notes

- The application monitors only your local network interfaces
- No data is sent to external servers
- All processing is done locally on your machine

## Support

If you encounter any issues:
1. Check the common issues section above
2. Try running setup.bat again
3. Ensure all prerequisites are met
4. Check the console for error messages

## License

MIT License - Feel free to modify and distribute this code.
