import { useQuery } from '@tanstack/react-query';
import { complianceApi } from '@/lib/api';
import { BookOpen, Plus, Filter } from 'lucide-react';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function Regulations() {
  const { data: regulations, isLoading } = useQuery({
    queryKey: ['regulations'],
    queryFn: async () => {
      const response = await complianceApi.getRegulations();
      return response.data.data;
    },
  });

  if (isLoading) {
    return <div>กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Regulatory Library</h1>
          <p className="mt-1 text-sm text-gray-500">
            คลังกฎหมาย กฎระเบียบ และมาตรฐานที่ใช้บังคับ
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            กรอง
          </button>
          <button className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มกฎหมาย
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                รหัส / ชื่อ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ประเภท
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Framework
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                วันที่มีผลบังคับใช้
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                สถานะ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ข้อปฏิบัติ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {regulations?.map((regulation: any) => (
              <tr key={regulation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {regulation.code}
                    </div>
                    <div className="text-sm text-gray-500">
                      {regulation.title}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {regulation.regulationType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {regulation.framework?.name || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {formatDate(regulation.effectiveDate)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`badge ${getStatusColor(regulation.status)}`}>
                    {getStatusLabel(regulation.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {regulation._count?.obligations || 0} รายการ
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!regulations || regulations.length === 0) && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              ยังไม่มีกฎหมาย
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              เริ่มต้นโดยการเพิ่มกฎหมายหรือกฎระเบียบ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
