import { isSupabaseConfigured, supabase } from './supabase'
import {
  mockMaintenance,
  mockNotifications,
  mockPayments,
  mockRooms,
  mockTenants,
  mockVisitors,
  revenueData,
} from './mockData'

export const usesLiveData = isSupabaseConfigured

const money = value => Number(value || 0)
const dateOnly = value => value ? String(value).slice(0, 10) : ''
const displayDateTime = value => value ? new Date(value).toLocaleString('en-PH', { hour12: false }) : null

function tenantName(row) {
  return row.full_name || row.profiles?.full_name || row.profiles?.email || 'Unassigned tenant'
}

function tenantEmail(row) {
  return row.email || row.profiles?.email || ''
}

function tenantPhone(row) {
  return row.phone || row.profiles?.phone || ''
}

function tenantCourse(row) {
  return row.course || row.profiles?.course || ''
}

function tenantYear(row) {
  return row.year_level || row.profiles?.year_level || 1
}

export function mapRoom(row) {
  return {
    ...row,
    price: money(row.price),
    amenities: row.amenities || [],
  }
}

export function mapTenant(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    room_id: row.room_id,
    name: tenantName(row),
    email: tenantEmail(row),
    phone: tenantPhone(row),
    course: tenantCourse(row),
    year: tenantYear(row),
    room: row.rooms?.room_number || '',
    move_in: dateOnly(row.move_in_date),
    status: row.status || 'active',
    profile_color: row.profile_color || '#6ee7b7',
    contract_url: row.contract_url,
    id_url: row.id_url,
  }
}

export function mapPayment(row) {
  const tenant = row.tenants ? mapTenant(row.tenants) : null
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    tenant: tenant?.name || 'Unassigned tenant',
    room: tenant?.room || '',
    amount: money(row.amount),
    month: row.month_year,
    status: row.status || 'pending',
    method: row.method || '-',
    date: dateOnly(row.payment_date) || '-',
    due: dateOnly(row.due_date),
    receipt_url: row.receipt_url,
    notes: row.notes || '',
  }
}

export function mapMaintenance(row) {
  const tenant = row.tenants ? mapTenant(row.tenants) : null
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    room_id: row.room_id,
    tenant: tenant?.name || 'Unassigned tenant',
    room: row.rooms?.room_number || tenant?.room || '',
    issue: row.issue,
    description: row.description || '',
    status: row.status || 'pending',
    priority: row.priority || 'medium',
    date: dateOnly(row.created_at),
    assigned: row.assignee?.full_name || null,
    image_url: row.image_url,
  }
}

export function mapVisitor(row) {
  return {
    id: row.id,
    visitor_name: row.visitor_name,
    phone: row.visitor_phone || '',
    room_id: row.room_id,
    tenant_id: row.tenant_id,
    room: row.rooms?.room_number || '',
    purpose: row.purpose || '',
    time_in: displayDateTime(row.time_in),
    time_out: displayDateTime(row.time_out),
    status: row.status || 'inside',
  }
}

export function mapNotification(row) {
  return {
    id: row.id,
    type: row.type || 'general',
    msg: row.message,
    time: displayDateTime(row.created_at),
    read: Boolean(row.read),
  }
}

async function run(query) {
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getRooms() {
  if (!usesLiveData) return mockRooms
  const data = await run(supabase.from('rooms').select('*').order('room_number'))
  return data.map(mapRoom)
}

export async function saveRoom(room, id) {
  if (!usesLiveData) return null
  const payload = { ...room, status: room.status || 'vacant' }
  const query = id
    ? supabase.from('rooms').update(payload).eq('id', id).select().single()
    : supabase.from('rooms').insert(payload).select().single()
  return mapRoom(await run(query))
}

export async function deleteRoom(id) {
  if (!usesLiveData) return
  await run(supabase.from('rooms').delete().eq('id', id))
}

export async function getTenants() {
  if (!usesLiveData) return mockTenants
  const data = await run(
    supabase
      .from('tenants')
      .select('*, profiles(*), rooms(*)')
      .order('created_at', { ascending: false })
  )
  return data.map(mapTenant)
}

export async function saveTenant(form) {
  if (!usesLiveData) return null
  const rooms = await run(supabase.from('rooms').select('id').eq('room_number', form.room).maybeSingle())
  const payload = {
    full_name: form.name,
    email: form.email,
    phone: form.phone,
    course: form.course,
    year_level: Number(form.year || 1),
    room_id: rooms?.id || null,
    move_in_date: form.move_in || null,
    profile_color: form.profile_color,
    status: 'active',
  }
  const data = await run(supabase.from('tenants').insert(payload).select('*, profiles(*), rooms(*)').single())
  if (rooms?.id) await supabase.from('rooms').update({ status: 'occupied' }).eq('id', rooms.id)
  return mapTenant(data)
}

export async function getPayments() {
  if (!usesLiveData) return mockPayments
  const data = await run(
    supabase
      .from('payments')
      .select('*, tenants(*, profiles(*), rooms(*))')
      .order('due_date', { ascending: false })
  )
  return data.map(mapPayment)
}

export async function savePayment(form) {
  if (!usesLiveData) return null
  const payload = {
    tenant_id: Number(form.tenant_id || 0) || null,
    amount: Number(form.amount || 0),
    month_year: form.month,
    due_date: form.due || null,
    method: form.method,
    notes: form.notes,
    status: 'pending',
  }
  const data = await run(supabase.from('payments').insert(payload).select('*, tenants(*, profiles(*), rooms(*))').single())
  return mapPayment(data)
}

export async function markPaymentPaid(id, method = 'Cash') {
  if (!usesLiveData) return null
  const data = await run(
    supabase
      .from('payments')
      .update({ status: 'paid', method, payment_date: new Date().toISOString().slice(0, 10) })
      .eq('id', id)
      .select('*, tenants(*, profiles(*), rooms(*))')
      .single()
  )
  return mapPayment(data)
}

export async function getMaintenanceRequests() {
  if (!usesLiveData) return mockMaintenance
  const data = await run(
    supabase
      .from('maintenance_requests')
      .select('*, tenants(*, profiles(*), rooms(*)), rooms(*), assignee:profiles!maintenance_requests_assigned_to_fkey(full_name)')
      .order('created_at', { ascending: false })
  )
  return data.map(mapMaintenance)
}

export async function saveMaintenanceRequest(form) {
  if (!usesLiveData) return null
  const room = form.room
    ? await run(supabase.from('rooms').select('id').eq('room_number', form.room).maybeSingle())
    : null
  const tenant = form.tenant_id
    ? { id: form.tenant_id }
    : form.tenant
      ? await run(supabase.from('tenants').select('id').or(`full_name.ilike.%${form.tenant}%,email.ilike.%${form.tenant}%`).maybeSingle())
      : null
  const payload = {
    tenant_id: tenant?.id || null,
    room_id: room?.id || null,
    issue: form.issue,
    description: form.description,
    priority: form.priority,
    status: 'pending',
  }
  const data = await run(
    supabase
      .from('maintenance_requests')
      .insert(payload)
      .select('*, tenants(*, profiles(*), rooms(*)), rooms(*), assignee:profiles!maintenance_requests_assigned_to_fkey(full_name)')
      .single()
  )
  return mapMaintenance(data)
}

export async function updateMaintenanceStatus(id, status) {
  if (!usesLiveData) return null
  const patch = { status, resolved_at: status === 'resolved' ? new Date().toISOString() : null }
  const data = await run(
    supabase
      .from('maintenance_requests')
      .update(patch)
      .eq('id', id)
      .select('*, tenants(*, profiles(*), rooms(*)), rooms(*), assignee:profiles!maintenance_requests_assigned_to_fkey(full_name)')
      .single()
  )
  return mapMaintenance(data)
}

export async function getVisitors() {
  if (!usesLiveData) return mockVisitors
  const data = await run(
    supabase
      .from('visitor_logs')
      .select('*, rooms(*), tenants(*, profiles(*), rooms(*))')
      .order('time_in', { ascending: false })
  )
  return data.map(mapVisitor)
}

export async function saveVisitor(form) {
  if (!usesLiveData) return null
  const room = form.room
    ? await run(supabase.from('rooms').select('id').eq('room_number', form.room).maybeSingle())
    : null
  const payload = {
    visitor_name: form.visitor_name,
    visitor_phone: form.phone,
    room_id: room?.id || null,
    purpose: form.purpose,
    status: 'inside',
  }
  const data = await run(supabase.from('visitor_logs').insert(payload).select('*, rooms(*), tenants(*, profiles(*), rooms(*))').single())
  return mapVisitor(data)
}

export async function checkoutVisitor(id) {
  if (!usesLiveData) return null
  const data = await run(
    supabase
      .from('visitor_logs')
      .update({ time_out: new Date().toISOString(), status: 'checked-out' })
      .eq('id', id)
      .select('*, rooms(*), tenants(*, profiles(*), rooms(*))')
      .single()
  )
  return mapVisitor(data)
}

export async function getNotifications(userId) {
  if (!usesLiveData || !userId) return mockNotifications
  const data = await run(supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }))
  return data.map(mapNotification)
}

export async function markNotificationRead(id) {
  if (!usesLiveData) return
  await run(supabase.from('notifications').update({ read: true }).eq('id', id))
}

export async function markAllNotificationsRead(userId) {
  if (!usesLiveData || !userId) return
  await run(supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false))
}

export async function getDashboardData() {
  if (!usesLiveData) {
    return {
      rooms: mockRooms,
      tenants: mockTenants,
      payments: mockPayments,
      maintenance: mockMaintenance,
      revenue: revenueData,
    }
  }

  const [rooms, tenants, payments, maintenance] = await Promise.all([
    getRooms(),
    getTenants(),
    getPayments(),
    getMaintenanceRequests(),
  ])

  const months = [...payments]
    .filter(p => p.status === 'paid')
    .reduce((acc, p) => {
      const key = p.month || 'Unspecified'
      acc[key] = (acc[key] || 0) + p.amount
      return acc
    }, {})

  return {
    rooms,
    tenants,
    payments,
    maintenance,
    revenue: Object.entries(months).slice(-6).map(([month, amount]) => ({ month, amount })),
  }
}
