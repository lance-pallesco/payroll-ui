import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

const dbPath = path.join(__dirname, 'payroll.db');
const sqlite = sqlite3.verbose();
const db = new sqlite.Database(dbPath);

app.use(cors());
app.use(express.json());

// Initialize database schema
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_number TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      middle_name TEXT,
      dob TEXT NOT NULL,
      daily_rate REAL NOT NULL,
      working_days TEXT NOT NULL
    )
  `);
});

function generateEmployeeNumber(lastName, dobIso) {
  const cleanLast = (lastName || '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase();
  const prefix = (cleanLast.substring(0, 3) || 'EMP').padEnd(3, 'X');

  const random = Math.floor(Math.random() * 100000);
  const randomStr = String(random).padStart(5, '0');

  const dob = new Date(dobIso);
  if (Number.isNaN(dob.getTime())) {
    throw new Error('Invalid date of birth');
  }

  const day = String(dob.getDate()).padStart(2, '0');
  const monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const month = monthNames[dob.getMonth()];
  const year = dob.getFullYear();

  return `${prefix}-${randomStr}-${day}${month}${year}`;
}

function parseWorkingDays(str) {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

function serializeWorkingDays(arr) {
  if (!Array.isArray(arr)) return '';
  return arr.join(',');
}

function workingDayNamesToWeekdays(workingDays) {
  const map = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6
  };
  return (workingDays || []).map(d => map[d]).filter(v => v !== undefined);
}

function computeTakeHomePay(employee, startDateIso, endDateIso) {
  const start = new Date(startDateIso);
  const end = new Date(endDateIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Invalid start or end date');
  }
  if (end < start) {
    throw new Error('End date must be on or after start date');
  }

  const dob = new Date(employee.dob);
  if (Number.isNaN(dob.getTime())) {
    throw new Error('Invalid employee date of birth');
  }

  const workWeekdays = workingDayNamesToWeekdays(employee.workingDays);
  const dailyRate = Number(employee.dailyRate);

  let total = 0;
  const current = new Date(start);

  while (current <= end) {
    const weekday = current.getDay();
    const isWorkingDay = workWeekdays.includes(weekday);
    const isBirthday =
      current.getDate() === dob.getDate() &&
      current.getMonth() === dob.getMonth();

    if (isWorkingDay) {
      total += 2 * dailyRate;
    }
    if (isBirthday) {
      total += dailyRate;
    }

    current.setDate(current.getDate() + 1);
  }

  return total;
}

// GET all employees
app.get('/api/employees', (req, res) => {
  db.all(
    'SELECT * FROM employees ORDER BY last_name, first_name',
    [],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch employees' });
      }
      const result = rows.map(r => ({
        id: r.id,
        employeeNumber: r.employee_number,
        firstName: r.first_name,
        lastName: r.last_name,
        middleName: r.middle_name,
        dob: r.dob,
        dailyRate: r.daily_rate,
        workingDays: parseWorkingDays(r.working_days)
      }));
      res.json(result);
    }
  );
});

// GET single employee by id
app.get('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM employees WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch employee' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({
      id: row.id,
      employeeNumber: row.employee_number,
      firstName: row.first_name,
      lastName: row.last_name,
      middleName: row.middle_name,
      dob: row.dob,
      dailyRate: row.daily_rate,
      workingDays: parseWorkingDays(row.working_days)
    });
  });
});

// CREATE employee
app.post('/api/employees', (req, res) => {
  const { firstName, lastName, middleName, dob, dailyRate, workingDays } = req.body || {};

  if (!firstName || !lastName || !dob || dailyRate == null || !Array.isArray(workingDays)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let employeeNumber;
  try {
    employeeNumber = generateEmployeeNumber(lastName, dob);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  const sql = `
    INSERT INTO employees (employee_number, first_name, last_name, middle_name, dob, daily_rate, working_days)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    employeeNumber,
    firstName,
    lastName,
    middleName || null,
    dob,
    Number(dailyRate),
    serializeWorkingDays(workingDays)
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create employee' });
    }
    res.status(201).json({
      id: this.lastID,
      employeeNumber,
      firstName,
      lastName,
      middleName: middleName || null,
      dob,
      dailyRate: Number(dailyRate),
      workingDays
    });
  });
});

// UPDATE employee
app.put('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, middleName, dob, dailyRate, workingDays } = req.body || {};

  if (!firstName || !lastName || !dob || dailyRate == null || !Array.isArray(workingDays)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let employeeNumber;
  try {
    employeeNumber = generateEmployeeNumber(lastName, dob);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  const sql = `
    UPDATE employees
    SET employee_number = ?, first_name = ?, last_name = ?, middle_name = ?, dob = ?, daily_rate = ?, working_days = ?
    WHERE id = ?
  `;
  const params = [
    employeeNumber,
    firstName,
    lastName,
    middleName || null,
    dob,
    Number(dailyRate),
    serializeWorkingDays(workingDays),
    id
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update employee' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({
      id: Number(id),
      employeeNumber,
      firstName,
      lastName,
      middleName: middleName || null,
      dob,
      dailyRate: Number(dailyRate),
      workingDays
    });
  });
});

// DELETE employee
app.delete('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM employees WHERE id = ?', [id], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete employee' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.status(204).send();
  });
});

// COMPUTE take-home pay
app.post('/api/employees/:id/compute-pay', (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.body || {};

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate are required' });
  }

  db.get('SELECT * FROM employees WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch employee' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employee = {
      id: row.id,
      employeeNumber: row.employee_number,
      firstName: row.first_name,
      lastName: row.last_name,
      middleName: row.middle_name,
      dob: row.dob,
      dailyRate: row.daily_rate,
      workingDays: parseWorkingDays(row.working_days)
    };

    try {
      const amount = computeTakeHomePay(employee, startDate, endDate);
      res.json({ takeHomePay: amount });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Payroll API server listening on port ${PORT}`);
});

