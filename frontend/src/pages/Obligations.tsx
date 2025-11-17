import { useQuery } from '@tanstack/react-query';
import { complianceApi } from '@/lib/api';
import { FileText } from 'lucide-react';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

export default function Obligations() {
  const { data: obligations, isLoading } = useQuery({
    queryKey: ['obligations'],
    queryFn: async () => {
      const response = await complianceApi.getObligations();
      return response.data.data;
    },
  });

  if (isLoading) {
    return <div>กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Compliance Obligations</h1>
        <p className="mt-1 text-sm text-gray-500">
          ข้อปฏิบัติตามกฎหมายและกฎเกณฑ์ที่ต้องดำเนินการ
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {obligations?.map((obligation: any) => (
          <div key={obligation.id} className="card p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {obligation.obligationCode}
                  </h3>
                  <span className={`badge ${getStatusColor(obligation.priority)}`}>
                    {getStatusLabel(obligation.priority)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-900">{obligation.title}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {obligation.regulation?.title}
                </p>
                <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                  <span>ความถี่: {obligation.frequency}</span>
                  <span>•</span>
                  <span>หน่วยงาน: {obligation.responsibleDepartment || 'ไม่ระบุ'}</span>
                </div>
              </div>
              {obligation.statusTracking?.[0] && (
                <span
                  className={`badge ${getStatusColor(
                    obligation.statusTracking[0].status
                  )}`}
                >
                  {getStatusLabel(obligation.statusTracking[0].status)}
                </span>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Controls</p>
                  <p className="font-semibold text-gray-900">
                    {obligation._count?.controls || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Actions</p>
                  <p className="font-semibold text-gray-900">
                    {obligation._count?.actions || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Evidence</p>
                  <p className="font-semibold text-gray-900">
                    {obligation._count?.evidences || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!obligations || obligations.length === 0) && (
        <div className="card p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">ยังไม่มีข้อปฏิบัติ</h3>
          <p className="mt-1 text-sm text-gray-500">
            ข้อปฏิบัติจะถูกสร้างขึ้นจากกฎหมายและกฎระเบียบ
          </p>
        </div>
      )}
    </div>
  );
}
