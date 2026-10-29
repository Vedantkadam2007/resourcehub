import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const dataDir = path.join(root, 'data');
const dataFile = path.join(dataDir, 'db.json');

fs.mkdirSync(dataDir, { recursive: true });

const seed = {
  resources: [
    {
      id: 'r1',
      title: 'Electronics Prototyping Lab',
      category: 'Laboratory',
      location: 'Innovation Block · Room 204',
      institution: 'Parul Innovation Hub',
      owner: 'Dr. Meera Shah',
      description: 'A supervised bench for circuit prototyping, soldering and microcontroller projects.',
      image: 'lab',
      hourlyRate: 0,
      capacity: 8,
      available: true,
      verification: 'Verified',
      requirements: ['Safety induction', 'Staff supervision'],
      equipment: ['Oscilloscopes', 'Soldering stations', 'Bench power supplies'],
      bookings: 12,
      fairUseLimit: 4
    },
    {
      id: 'r2',
      title: 'Mirrorless Camera Kit',
      category: 'Media Equipment',
      location: 'Media Centre · Desk 3',
      institution: 'Creative Commons Studio',
      owner: 'Rohan Patel',
      description: 'Camera body, two lenses, tripod and audio kit for student projects and community storytelling.',
      image: 'camera',
      hourlyRate: 120,
      capacity: 1,
      available: true,
      verification: 'Verified',
      requirements: ['Valid student or member ID', 'Return condition photos'],
      equipment: ['Camera body', '24–70mm lens', 'Tripod', 'Microphone'],
      bookings: 7,
      fairUseLimit: 2
    },
    {
      id: 'r3',
      title: 'Rapid Prototyping 3D Printer',
      category: 'Fabrication',
      location: 'Makerspace · Bay A',
      institution: 'Parul Makerspace',
      owner: 'Aarav Desai',
      description: 'FDM printer for functional prototypes. Filament supplied for small academic prints.',
      image: 'printer',
      hourlyRate: 60,
      capacity: 2,
      available: true,
      verification: 'Verified',
      requirements: ['3D printing induction', 'Approved materials only'],
      equipment: ['FDM printer', 'PLA filament', 'Slicer workstation'],
      bookings: 19,
      fairUseLimit: 3
    },
    {
      id: 'r4',
      title: 'Team Collaboration Room',
      category: 'Workspace',
      location: 'Library · Floor 2',
      institution: 'Central Library',
      owner: 'Library Operations',
      description: 'Bookable group room with display, whiteboard and hybrid meeting equipment.',
      image: 'room',
      hourlyRate: 0,
      capacity: 10,
      available: true,
      verification: 'Verified',
      requirements: ['Institution email', 'Leave room tidy'],
      equipment: ['Display', 'Whiteboard', 'Video conferencing'],
      bookings: 22,
      fairUseLimit: 2
    },
    {
      id: 'r5',
      title: 'Portable Audio Recording Kit',
      category: 'Media Equipment',
      location: 'Performing Arts Wing · Store 1',
      institution: 'Creative Commons Studio',
      owner: 'Nisha Kulkarni',
      description: 'Portable recorder and microphones for interviews, podcasts and field research.',
      image: 'audio',
      hourlyRate: 80,
      capacity: 1,
      available: true,
      verification: 'Verified',
      requirements: ['Equipment handling checklist'],
      equipment: ['Recorder', '2 microphones', 'Headphones'],
      bookings: 4,
      fairUseLimit: 2
    },
    {
      id: 'r6',
      title: 'Materials Testing Bench',
      category: 'Laboratory',
      location: 'Engineering Lab · Room 118',
      institution: 'Applied Research Centre',
      owner: 'Lab Supervisor',
      description: 'Supervised materials testing station for approved coursework and research projects.',
      image: 'testing',
      hourlyRate: 150,
      capacity: 3,
      available: true,
      verification: 'Pending review',
      requirements: ['Relevant lab training', 'Supervisor approval', 'PPE required'],
      equipment: ['Hardness tester', 'Digital calipers', 'PPE'],
      bookings: 9,
      fairUseLimit: 2
    }
  ],
  bookings: [],
  incidents: [],
  audit: [],
  users: [
    { id: 'u1', name: 'Demo Student', email: 'student@demo.com', role: 'Student', verified: true },
    { id: 'u2', name: 'Demo Owner', email: 'owner@demo.com', role: 'Resource Owner', verified: true },
    { id: 'u3', name: 'Institution Admin', email: 'admin@demo.com', role: 'Institution Admin', verified: true }
  ]
};

let db;

function save() {
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 2));
}

try {
  db = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
} catch {
  db = seed;
  save();
}

function audit(action, actor, detail, entityId = null) {
  db.audit.unshift({
    id: crypto.randomUUID(),
    action,
    actor,
    detail,
    entityId,
    at: new Date().toISOString()
  });

  db.audit = db.audit.slice(0, 500);
  save();
}

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const demoAccounts = [
  { email: 'student@demo.com', password: 'Student@123', name: 'Demo Student', role: 'user' },
  { email: 'owner@demo.com', password: 'Owner@123', name: 'Demo Owner', role: 'user' },
  { email: 'member@demo.com', password: 'Member@123', name: 'Community Member', role: 'user' },
  {
    email: process.env.RESOURCEHUB_ADMIN_EMAIL || 'vedantkadam875@gmail.com',
    password: process.env.RESOURCEHUB_ADMIN_PASSWORD || 'Vedant@1234',
    name: 'ResourceHub Admin',
    role: 'admin'
  }
];

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { email = '', password = '', role = 'user' } = req.body || {};

  const account = demoAccounts.find(
    user =>
      user.email.toLowerCase() === String(email).trim().toLowerCase() &&
      user.password === String(password) &&
      user.role === role
  );

  if (!account) {
    return res.status(401).json({
      error: 'Email or password is incorrect for this login type.'
    });
  }

  res.json({
    user: {
      email: account.email,
      name: account.name,
      role: account.role
    }
  });
});

// Health check
app.get('/health', (_, res) => {
  res.json({
    ok: true,
    service: 'ResourceHub API',
    time: new Date().toISOString()
  });
});

// Get resources
app.get('/api/resources', (req, res) => {
  let list = db.resources;
  const q = String(req.query.q || '').toLowerCase();
  const category = String(req.query.category || 'All');

  if (q) {
    list = list.filter(resource =>
      [
        resource.title,
        resource.category,
        resource.location,
        resource.institution,
        resource.description,
        ...resource.equipment
      ].join(' ').toLowerCase().includes(q)
    );
  }

  if (category !== 'All') {
    list = list.filter(resource => resource.category === category);
  }

  res.json(list);
});

app.get('/api/resources/:id', (req, res) => {
  const resource = db.resources.find(item => item.id === req.params.id);

  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  res.json(resource);
});

app.post('/api/resources', (req, res) => {
  const {
    title,
    category,
    location,
    institution,
    description,
    owner,
    hourlyRate,
    requirements
  } = req.body;

  if (!title || !category || !location || !description) {
    return res.status(400).json({
      error: 'Title, category, location and description are required'
    });
  }

  const resource = {
    id: crypto.randomUUID(),
    title,
    category,
    location,
    institution: institution || 'Community listing',
    description,
    owner: owner || 'Demo Owner',
    image: 'new',
    hourlyRate: Number(hourlyRate) || 0,
    capacity: 1,
    available: true,
    verification: 'Pending review',
    requirements: Array.isArray(requirements) ? requirements : [],
    equipment: [],
    bookings: 0,
    fairUseLimit: 2
  };

  db.resources.unshift(resource);
  audit('RESOURCE_LISTED', owner || 'Demo Owner', `Listed ${title}`, resource.id);

  res.status(201).json(resource);
});

// Create booking
app.post('/api/bookings', (req, res) => {
  const {
    resourceId,
    userName,
    email,
    purpose,
    startAt,
    endAt,
    trainingConfirmed
  } = req.body;

  const resource = db.resources.find(item => item.id === resourceId);

  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  if (!userName || !email || !purpose || !startAt || !endAt) {
    return res.status(400).json({
      error: 'Please complete all required booking fields'
    });
  }

  if (new Date(endAt) <= new Date(startAt)) {
    return res.status(400).json({
      error: 'End time must be after start time'
    });
  }

  if (
    resource.requirements?.some(requirement => /induction|training/i.test(requirement)) &&
    !trainingConfirmed
  ) {
    return res.status(400).json({
      error: 'Please confirm that you meet the training/induction requirements'
    });
  }

  const overlapping = db.bookings.some(booking =>
    booking.resourceId === resourceId &&
    ['Pending', 'Approved', 'Checked out'].includes(booking.status) &&
    new Date(startAt) < new Date(booking.endAt) &&
    new Date(endAt) > new Date(booking.startAt)
  );

  const userBookings = db.bookings.filter(booking =>
    booking.email.toLowerCase() === email.toLowerCase() &&
    booking.resourceId === resourceId &&
    ['Pending', 'Approved', 'Checked out'].includes(booking.status)
  ).length;

  const fairUseLimit = resource.fairUseLimit || 3;
  const status = overlapping || userBookings >= fairUseLimit ? 'Waitlisted' : 'Pending';

  const booking = {
    id: crypto.randomUUID(),
    resourceId,
    resourceTitle: resource.title,
    userName,
    email,
    purpose,
    startAt,
    endAt,
    status,
    createdAt: new Date().toISOString(),
    trainingConfirmed: !!trainingConfirmed,
    conditionBefore: null,
    conditionAfter: null
  };

  db.bookings.unshift(booking);

  audit(
    status === 'Waitlisted' ? 'BOOKING_WAITLISTED' : 'BOOKING_REQUESTED',
    userName,
    `${status}: ${resource.title}`,
    booking.id
  );

  res.status(201).json(booking);
});

app.get('/api/bookings', (req, res) => {
  const email = String(req.query.email || '').toLowerCase();
  const list = email
    ? db.bookings.filter(booking => booking.email.toLowerCase() === email)
    : db.bookings;

  res.json(list);
});

app.patch('/api/bookings/:id/status', (req, res) => {
  const booking = db.bookings.find(item => item.id === req.params.id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const allowed = [
    'Approved',
    'Rejected',
    'Cancelled',
    'Checked out',
    'Returned',
    'Waitlisted'
  ];

  const { status, actor = 'Resource Owner', note = '' } = req.body;

  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const transitions = {
    Pending: ['Approved', 'Rejected', 'Cancelled', 'Waitlisted'],
    Waitlisted: ['Approved', 'Rejected', 'Cancelled'],
    Approved: ['Cancelled', 'Checked out'],
    'Checked out': ['Returned'],
    Returned: [],
    Rejected: [],
    Cancelled: []
  };

  if (!transitions[booking.status]?.includes(status)) {
    return res.status(409).json({
      error: `Cannot change booking from ${booking.status} to ${status}`
    });
  }

  booking.status = status;
  booking.updatedAt = new Date().toISOString();

  if (status === 'Checked out') {
    booking.conditionBefore = note || 'Condition checked at handover';
  }

  if (status === 'Returned') {
    booking.conditionAfter = note || 'Return condition recorded';
  }

  audit(
    `BOOKING_${status.toUpperCase().replaceAll(' ', '_')}`,
    actor,
    `${booking.resourceTitle}: ${note || status}`,
    booking.id
  );

  if (status === 'Returned') {
    const nextBooking = db.bookings.find(
      item => item.resourceId === booking.resourceId && item.status === 'Waitlisted'
    );

    if (nextBooking) {
      nextBooking.status = 'Pending';
      audit(
        'WAITLIST_PROMOTED',
        'System',
        `${nextBooking.userName} promoted from waitlist`,
        nextBooking.id
      );
    }
  }

  save();
  res.json(booking);
});

// Incidents
app.post('/api/incidents', (req, res) => {
  const {
    bookingId,
    resourceId,
    reporter,
    kind,
    description,
    severity = 'Medium'
  } = req.body;

  if (!reporter || !kind || !description) {
    return res.status(400).json({
      error: 'Reporter, incident type and description are required'
    });
  }

  const incident = {
    id: crypto.randomUUID(),
    bookingId: bookingId || null,
    resourceId: resourceId || null,
    reporter,
    kind,
    description,
    severity,
    status: 'Open',
    createdAt: new Date().toISOString()
  };

  db.incidents.unshift(incident);
  audit('INCIDENT_REPORTED', reporter, `${severity} ${kind}: ${description}`, incident.id);

  res.status(201).json(incident);
});

app.get('/api/incidents', (_, res) => {
  res.json(db.incidents);
});

app.patch('/api/incidents/:id', (req, res) => {
  const incident = db.incidents.find(item => item.id === req.params.id);

  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  if (!['Open', 'Under review', 'Resolved'].includes(req.body.status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  incident.status = req.body.status;
  incident.updatedAt = new Date().toISOString();

  audit(
    'INCIDENT_STATUS_CHANGED',
    req.body.actor || 'Institution Admin',
    `${incident.kind} → ${incident.status}`,
    incident.id
  );

  save();
  res.json(incident);
});

// Audit log
app.get('/api/audit', (_, res) => {
  res.json(db.audit);
});

// Dashboard statistics
app.get('/api/stats', (_, res) => {
  res.json({
    resources: db.resources.length,
    verified: db.resources.filter(item => item.verification === 'Verified').length,
    bookings: db.bookings.length,
    pending: db.bookings.filter(item => item.status === 'Pending').length,
    waitlisted: db.bookings.filter(item => item.status === 'Waitlisted').length,
    incidents: db.incidents.filter(item => item.status !== 'Resolved').length,
    utilisation: Math.min(
      94,
      Math.round(
        db.resources.reduce((sum, resource) => sum + resource.bookings, 0) /
        Math.max(1, db.resources.length * 20) * 100
      )
    )
  });
});

// Serve the Vite-built frontend from the dist/ directory.
const distDir = path.join(root, 'dist');
app.use(express.static(distDir));

// Keep unknown API paths as API errors; serve React for frontend routes.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  res.sendFile(path.join(distDir, 'index.html'), err => {
    if (err) next(err);
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error' });
});

const port = Number(process.env.PORT) || 5000;

app.listen(port, () => {
  console.log(`ResourceHub server running on port ${port}`);
});