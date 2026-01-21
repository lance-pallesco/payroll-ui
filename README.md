# Payroll System Frontend

- This repository contains the frontend user interface for the Payroll System.
It communicates with the backend REST API to manage employees and compute payroll.

## Features
- View all employees
- Add, edit, delete employee
- Compute take-home pay
- Responsive and interactive UI

## Setup

1. Clone this repository:
```bash
git clone https://github.com/lance-pallesco/payroll-ui.git
cd payroll-ui
```

2. Install dependencies:
```bash
npm install
```

3. Configure API URL in .env:
```bash
VITE_API_BASE_URL=http://localhost:5000
```

4. Run the frontend:
```bash
npm run dev
```
Frontend runs at http://localhost:5173.

This frontend communicates with the backend API here:
[Payroll System Backend](https://github.com/lance-pallesco/payroll-api)

Check the backend README for instructions on setting up the API and database.
