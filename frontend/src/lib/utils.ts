import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatStr: string = 'dd/MM/yyyy'): string {
  return format(new Date(date), formatStr, { locale: th });
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: th });
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // Compliance Status
    COMPLIANT: 'bg-green-100 text-green-800',
    PARTIALLY_COMPLIANT: 'bg-yellow-100 text-yellow-800',
    NON_COMPLIANT: 'bg-red-100 text-red-800',
    NOT_APPLICABLE: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    UNDER_REVIEW: 'bg-purple-100 text-purple-800',

    // Action Status
    NOT_STARTED: 'bg-gray-100 text-gray-800',
    PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    OVERDUE: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',

    // Regulation Status
    DRAFT: 'bg-gray-100 text-gray-800',
    ACTIVE: 'bg-green-100 text-green-800',
    AMENDED: 'bg-blue-100 text-blue-800',
    REPEALED: 'bg-red-100 text-red-800',

    // Priority
    CRITICAL: 'bg-red-100 text-red-800',
    HIGH: 'bg-orange-100 text-orange-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-blue-100 text-blue-800',
  };

  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    // Compliance Status
    COMPLIANT: 'ปฏิบัติตามแล้ว',
    PARTIALLY_COMPLIANT: 'ปฏิบัติตามบางส่วน',
    NON_COMPLIANT: 'ไม่ปฏิบัติตาม',
    NOT_APPLICABLE: 'ไม่เกี่ยวข้อง',
    IN_PROGRESS: 'กำลังดำเนินการ',
    UNDER_REVIEW: 'อยู่ระหว่างตรวจสอบ',

    // Action Status
    NOT_STARTED: 'ยังไม่เริ่ม',
    PENDING_REVIEW: 'รอการตรวจสอบ',
    COMPLETED: 'เสร็จสิ้น',
    OVERDUE: 'เกินกำหนด',
    CANCELLED: 'ยกเลิก',

    // Regulation Status
    DRAFT: 'ร่าง',
    ACTIVE: 'ใช้งานอยู่',
    AMENDED: 'แก้ไขแล้ว',
    REPEALED: 'ยกเลิกแล้ว',

    // Priority
    CRITICAL: 'วิกฤต',
    HIGH: 'สูง',
    MEDIUM: 'ปานกลาง',
    LOW: 'ต่ำ',
  };

  return statusLabels[status] || status;
}
