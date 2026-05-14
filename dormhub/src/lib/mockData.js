export const mockRooms = [
  { id: 1, room_number: '101', capacity: 2, price: 3500, status: 'occupied',    floor: 1, type: 'Double', amenities: ['AC', 'WiFi'] },
  { id: 2, room_number: '102', capacity: 1, price: 2800, status: 'vacant',      floor: 1, type: 'Single', amenities: ['Fan', 'WiFi'] },
  { id: 3, room_number: '103', capacity: 3, price: 4200, status: 'occupied',    floor: 1, type: 'Triple', amenities: ['AC', 'WiFi', 'Bathroom'] },
  { id: 4, room_number: '201', capacity: 1, price: 3000, status: 'vacant',      floor: 2, type: 'Single', amenities: ['AC'] },
  { id: 5, room_number: '202', capacity: 2, price: 3800, status: 'occupied',    floor: 2, type: 'Double', amenities: ['AC', 'WiFi', 'Bathroom'] },
  { id: 6, room_number: '203', capacity: 1, price: 2500, status: 'maintenance', floor: 2, type: 'Single', amenities: ['Fan'] },
  { id: 7, room_number: '301', capacity: 4, price: 5500, status: 'vacant',      floor: 3, type: 'Quad',   amenities: ['AC', 'WiFi', 'Bathroom', 'Kitchen'] },
  { id: 8, room_number: '302', capacity: 2, price: 3600, status: 'occupied',    floor: 3, type: 'Double', amenities: ['AC', 'WiFi'] },
]

export const mockTenants = [
  { id: 1, name: 'Maria Santos',   email: 'maria@email.com',  room: '101', move_in: '2024-01-15', status: 'active', phone: '09171234567', course: 'BS Nursing',      year: 2, profile_color: '#6ee7b7' },
  { id: 2, name: 'Juan dela Cruz', email: 'juan@email.com',   room: '103', move_in: '2024-02-01', status: 'active', phone: '09281234567', course: 'BS Engineering',  year: 3, profile_color: '#818cf8' },
  { id: 3, name: 'Ana Reyes',      email: 'ana@email.com',    room: '202', move_in: '2023-11-10', status: 'active', phone: '09391234567', course: 'BS Education',    year: 4, profile_color: '#f472b6' },
  { id: 4, name: 'Carlos Mendoza', email: 'carlos@email.com', room: '103', move_in: '2024-03-05', status: 'active', phone: '09461234567', course: 'BS IT',           year: 1, profile_color: '#fbbf24' },
  { id: 5, name: 'Liza Garcia',    email: 'liza@email.com',   room: '302', move_in: '2024-01-20', status: 'active', phone: '09551234567', course: 'BS Accountancy',  year: 2, profile_color: '#34d399' },
]

export const mockPayments = [
  { id: 1, tenant: 'Maria Santos',   room: '101', amount: 3500, month: 'May 2025', status: 'paid',    method: 'GCash',         date: '2025-05-02', due: '2025-05-05' },
  { id: 2, tenant: 'Juan dela Cruz', room: '103', amount: 4200, month: 'May 2025', status: 'pending', method: '-',             date: '-',          due: '2025-05-05' },
  { id: 3, tenant: 'Ana Reyes',      room: '202', amount: 3800, month: 'May 2025', status: 'paid',    method: 'Cash',          date: '2025-05-01', due: '2025-05-05' },
  { id: 4, tenant: 'Carlos Mendoza', room: '103', amount: 4200, month: 'May 2025', status: 'overdue', method: '-',             date: '-',          due: '2025-04-05' },
  { id: 5, tenant: 'Liza Garcia',    room: '302', amount: 3600, month: 'May 2025', status: 'paid',    method: 'Bank Transfer', date: '2025-05-03', due: '2025-05-05' },
  { id: 6, tenant: 'Maria Santos',   room: '101', amount: 3500, month: 'Apr 2025', status: 'paid',    method: 'GCash',         date: '2025-04-03', due: '2025-04-05' },
  { id: 7, tenant: 'Juan dela Cruz', room: '103', amount: 4200, month: 'Apr 2025', status: 'paid',    method: 'Cash',          date: '2025-04-04', due: '2025-04-05' },
]

export const mockMaintenance = [
  { id: 1, tenant: 'Maria Santos',   room: '101', issue: 'Air conditioner not cooling properly', status: 'in-progress', priority: 'high',   date: '2025-05-01', assigned: 'Pedro Staff' },
  { id: 2, tenant: 'Juan dela Cruz', room: '103', issue: 'Leaking faucet in bathroom',           status: 'pending',     priority: 'medium', date: '2025-05-03', assigned: null },
  { id: 3, tenant: 'Ana Reyes',      room: '202', issue: 'Broken door lock',                     status: 'resolved',    priority: 'high',   date: '2025-04-28', assigned: 'Pedro Staff' },
  { id: 4, tenant: 'Carlos Mendoza', room: '103', issue: 'WiFi not connecting',                  status: 'pending',     priority: 'low',    date: '2025-05-04', assigned: null },
  { id: 5, tenant: 'Liza Garcia',    room: '302', issue: 'Light bulb replacement needed',        status: 'resolved',    priority: 'low',    date: '2025-04-25', assigned: 'Pedro Staff' },
]

export const mockVisitors = [
  { id: 1, visitor_name: 'Roberto Santos', room: '101', time_in: '2025-05-05 09:30', time_out: '2025-05-05 11:00', purpose: 'Family visit',  status: 'checked-out' },
  { id: 2, visitor_name: 'Elena Cruz',     room: '103', time_in: '2025-05-05 14:00', time_out: null,               purpose: 'Bringing items', status: 'inside' },
  { id: 3, visitor_name: 'Mark Reyes',     room: '202', time_in: '2025-05-04 16:30', time_out: '2025-05-04 18:00', purpose: 'Study group',   status: 'checked-out' },
  { id: 4, visitor_name: 'Sofia Mendoza',  room: '103', time_in: '2025-05-04 10:00', time_out: '2025-05-04 12:30', purpose: 'Family visit',  status: 'checked-out' },
]

export const mockNotifications = [
  { id: 1, type: 'payment',     msg: 'Carlos Mendoza has overdue payment for April 2025',          time: '2 hours ago', read: false },
  { id: 2, type: 'maintenance', msg: 'New maintenance request from Juan dela Cruz – Leaking faucet', time: '5 hours ago', read: false },
  { id: 3, type: 'visitor',     msg: 'Elena Cruz is still inside Room 103',                         time: '3 hours ago', read: true  },
  { id: 4, type: 'payment',     msg: 'Payment reminder: 3 tenants due in 2 days',                  time: '1 day ago',   read: true  },
]

export const revenueData = [
  { month: 'Dec', amount: 28000 },
  { month: 'Jan', amount: 32000 },
  { month: 'Feb', amount: 27500 },
  { month: 'Mar', amount: 35000 },
  { month: 'Apr', amount: 38000 },
  { month: 'May', amount: 36500 },
]
