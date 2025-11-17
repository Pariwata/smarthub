import { useQuery } from '@tanstack/react-query';
import { complianceApi } from '@/lib/api';
import { Shield, Plus } from 'lucide-react';
import { getStatusColor } from '@/lib/utils';

export default function Frameworks() {
  const { data: frameworks, isLoading } = useQuery({
    queryKey: ['frameworks'],
    queryFn: async () => {
      const response = await complianceApi.getFrameworks();
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
          <h1 className="text-3xl font-bold text-gray-900">Compliance Frameworks</h1>
          <p className="mt-1 text-sm text-gray-500">
            กรอบการปฏิบัติตามกฎหมายและมาตรฐานต่างๆ
          </p>
        </div>
        <button className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          เพิ่ม Framework
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {frameworks?.map((framework: any) => (
          <div key={framework.id} className="card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <Shield className="h-10 w-10 text-primary-600" />
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {framework.code}
                  </h3>
                  <p className="text-sm text-gray-500">{framework.name}</p>
                </div>
              </div>
              {framework.isActive && (
                <span className={`badge ${getStatusColor('ACTIVE')}`}>ใช้งานอยู่</span>
              )}
            </div>

            <p className="mt-4 text-sm text-gray-600 line-clamp-2">
              {framework.description || 'ไม่มีคำอธิบาย'}
            </p>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-500">Regulations</p>
                  <p className="font-semibold text-gray-900">
                    {framework._count?.regulations || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Audits</p>
                  <p className="font-semibold text-gray-900">
                    {framework._count?.audits || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-semibold text-gray-900">{framework.category}</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button className="w-full btn-secondary text-sm">
                ดูรายละเอียด
              </button>
            </div>
          </div>
        ))}
      </div>

      {(!frameworks || frameworks.length === 0) && (
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            ยังไม่มี Framework
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            เริ่มต้นโดยการเพิ่ม Compliance Framework แรก
          </p>
          <div className="mt-6">
            <button className="btn-primary">
              <Plus className="w-4 h-4 mr-2 inline" />
              เพิ่ม Framework
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
