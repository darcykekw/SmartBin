# SmartBin: User-Centered Interactive IoT Waste Monitoring and Feedback System

SmartBin is a production-ready, fully functional Human-Computer Interaction (HCI) system that reimagines waste management. It utilizes IoT ultrasonic sensors to monitor bin fill levels in real-time, providing immediate auditory and visual feedback to users, alongside actionable data for facility managers through a responsive web dashboard.

## 🚀 Features

- **Real-Time Level Tracking**: Uses ultrasonic sensors to calculate bin fill percentage continuously.
- **Interactive HCI Feedback**: Immediate visual (RGB LEDs) and auditory (Buzzer) feedback when users interact with the bin.
- **Smart Alert System**: Tracks state changes with cooldown logic to prevent auditory fatigue.
- **Live Dashboard**: A beautiful Next.js UI with real-time polling to monitor all registered bins.
- **Notification System**: Floating on-screen alerts when a bin reaches maximum capacity.
- **Activity Logs**: Full historical tracking of fill levels and status changes for every bin.

## 🛠 Tech Stacks

- **Frontend & Backend**: Next.js (App Router, Full-stack)
- **Styling**: Tailwind CSS (with Glassmorphism and animations)
- **Database**: MySQL (connected via `mysql2` connection pooling)
- **Authentication**: NextAuth.js (Credentials Provider + bcrypt)
- **Hardware**: ESP32 / ESP8266 Microcontroller
- **Sensors/Actuators**: HC-SR04 Ultrasonic Sensor, RGB LED, Active Buzzer, Push Button

## 🚦 Status Logic

The Arduino processes distance measurements and converts them into three distinct states based on the percentage filled:
- **Empty (Green)**: 0% to 20% filled.
- **Half-Full (Yellow)**: 21% to 85% filled. Triggers 2 short warning beeps upon entering this state.
- **Full (Red)**: > 85% filled. Triggers 1 long continuous beep and a dashboard notification.

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/register` | Registers a new user. Expects `name`, `email`, `password`. |
| `GET`  | `/api/bins` | Retrieves all bins for the authenticated user. |
| `POST` | `/api/bins` | Creates a new bin. Expects `name`, `location`, `capacity_cm`. |
| `GET`  | `/api/bins/[id]` | Retrieves details and historical logs (max 50) for a specific bin. |
| `POST` | `/api/bin-data` | Receives data from the ESP32. Expects `bin_id` and `distance_cm`. Updates logs and status. |

---

## ⚙️ Setup & Installation Guide

This project includes a database initialization script, making it incredibly easy to install and run on any new computer.

### 1. Prerequisites
- **Node.js** installed on your machine.
- **XAMPP**, **WAMP**, or a local **MySQL** server installed and running.
- **Arduino IDE** (for flashing the ESP32 code).

### 2. Database Initialization
You do not need to manually create tables in MySQL Workbench.
1. Open XAMPP and start **MySQL**.
2. Navigate to the `web` folder in your terminal:
   ```bash
   cd web
   ```
3. Run the database setup script. This will automatically create `smartbin_db` and all necessary tables (`users`, `bins`, `bin_logs`):
   ```bash
   node init-db.js
   ```

### 3. Running the Next.js App
1. Install the required Node packages:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser to `http://localhost:3000`. Register an account and create your first SmartBin in the dashboard. Copy the generated **Bin ID**.

### 4. Hardware Setup (Arduino)
1. Open `arduino/smart_bin/smart_bin.ino` in the Arduino IDE.
2. Update the configuration variables at the top of the file:
   - `ssid`: Your Wi-Fi network name.
   - `password`: Your Wi-Fi password.
   - `serverUrl`: The local IPv4 address of the computer running the Next.js app (e.g., `http://192.168.1.5:3000/api/bin-data`). Do not use `localhost`.
   - `BIN_ID`: The UUID you copied from your Next.js dashboard.
3. Connect your ESP32, select the correct COM port, and click **Upload**.

Enjoy your fully integrated SmartBin system!
