// Date utilities for European format (DD/MM/YYYY)

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'Not set'
  const date = new Date(dateString)
  
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  }
  
  return date.toLocaleDateString('pt-PT', { ...defaultOptions, ...options })
}

export const formatDateLong = (dateString) => {
  if (!dateString) return 'Not set'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-PT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatDateShort = (dateString) => {
  if (!dateString) return 'Not set'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-PT', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatDateMonthShort = (dateString) => {
  if (!dateString) return 'Not set'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-PT', {
    month: 'short',
    day: 'numeric'
  })
}

export const formatDateMonthYear = (dateString) => {
  if (!dateString) return 'Not set'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-PT', {
    month: 'short',
    year: 'numeric'
  })
}

export const formatTime = (timeString) => {
  if (!timeString) return 'Not set'
  const [hours, minutes] = timeString.split(':')
  const date = new Date()
  date.setHours(hours, minutes)
  return date.toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export const formatTime12Hour = (timeString) => {
  if (!timeString) return 'Not set'
  const [hours, minutes] = timeString.split(':')
  const date = new Date()
  date.setHours(hours, minutes)
  return date.toLocaleTimeString('pt-PT', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export const formatDateTime = (dateString, timeString) => {
  if (!dateString) return 'Not set'
  const date = new Date(`${dateString}T${timeString || '00:00'}`)
  return date.toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export const generateTimeSlots = () => {
  const slots = []
  for (let hour = 8; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      slots.push({ value: timeString, display: displayTime })
    }
  }
  return slots
}

export const getWeekdayShort = (date) => {
  return date.toLocaleDateString('pt-PT', { weekday: 'short' })
}

export const getMonthLong = (date) => {
  return date.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
}

export const isToday = (date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export const isCurrentMonth = (date, currentDate) => {
  return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear()
} 

// Valida se é um número positivo
export function validarNumero(valor) {
  return !isNaN(Number(valor)) && Number(valor) > 0;
}

// Valida formato de email
export function validarEmail(email) {
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Valida formato de telefone (mínimo 9 dígitos, pode começar com +)
export function validarTelefone(telefone) {
  return !telefone || /^\+?\d{9,15}$/.test(telefone);
}

// Valida se a data é válida
export function validarData(data) {
  return !data || !isNaN(Date.parse(data));
} 