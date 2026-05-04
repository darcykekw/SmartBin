# SmartBin IoT Waste Management System

## Overview
SmartBin is a comprehensive Internet of Things (IoT) waste management solution designed to provide real-time monitoring of waste fill levels. The system integrates embedded hardware with a modern web dashboard to optimize waste collection processes, featuring instantaneous status feedback, continuous hardware monitoring, and an asynchronous data synchronization architecture.

## Architecture

### Hardware Component (Embedded Systems)
The hardware component is built upon the ESP32 microcontroller, utilizing an HC-SR04 ultrasonic sensor to continuously measure the distance to the waste surface. 

Key Hardware Features:
- Fill Level Detection: Utilizes ultrasonic pulses to calculate waste percentage based on configurable bin capacity.
- Hysteresis and Debouncing: Implements software state debounce logic to mitigate threshold jitter and ensure stable state transitions.
- Status Indication: Features an RGB LED to visually communicate the current fill state (Green: Empty, Yellow: Half-Full, Red: Full).
- Audible Alerts: Active-Low buzzer system for state-change notifications and a continuous alarm state machine when the bin reaches maximum capacity.
- Hardware Override: Tactile button integrated with non-blocking timers to allow manual system toggling and alarm silencing.

### Software Component (Web Dashboard)
The software layer is a full-stack Next.js application designed to provide centralized monitoring.

Key Software Features:
- Real-Time Synchronization: Asynchronously polls the MySQL database to display instantaneous changes in hardware states.
- System Registry: Interface to register new physical bins with unique UUIDs and specific physical parameters.
- Authentication: Secure session management.
- Database Architecture: Relational MySQL database tracking bins, locations, and historical fill-level logs.

## Technologies Used
- Hardware: ESP32, HC-SR04 Ultrasonic Sensor, RGB LED, Active Buzzer, Tactile Button.
- Firmware: C++ (Arduino IDE format) utilizing hardware timers and state machine logic.
- Frontend: Next.js (App Router), React, Tailwind CSS.
- Backend: Next.js Route Handlers, MySQL, Node.js.

## Setup and Deployment

### Hardware Initialization
1. Wire the ESP32 to the sensor, LEDs, and buzzer according to the pin configurations in the firmware.
2. Update the network credentials and target API endpoint in the `smart_bin.ino` file.
3. Flash the firmware to the ESP32 using the Arduino IDE. 

### Web Server Initialization
1. Initialize the MySQL database and execute the schema initialization scripts.
2. Configure the `.env` file with the database connection strings and authentication secrets.
3. Install dependencies utilizing `npm install`.
4. Deploy the local development server via `npm run dev`.
