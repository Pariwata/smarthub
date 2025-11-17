import { ClipboardCheck } from 'lucide-react';

export default function Audits() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audits</h1>
        <p className="mt-1 text-sm text-gray-500">
          การตรวจสอบและประเมินการปฏิบัติตาม
        </p>
      </div>

      <div className="card p-12 text-center">
        <ClipboardCheck className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Audit Module
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          โมดูลการตรวจสอบจะพร้อมใช้งานในเร็วๆ นี้
        </p>
      </div>
    </div>
  );
}
