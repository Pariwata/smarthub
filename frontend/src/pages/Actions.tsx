import { useQuery } from '@tanstack/react-query';
import { complianceApi } from '@/lib/api';
import { ListTodo } from 'lucide-react';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function Actions() {
  const { data: actions, isLoading } = useQuery({
    queryKey: ['actions'],
    queryFn: async () => {
      const response = await complianceApi.getActions();
      return response.data.data;
    },
  });

  if (isLoading) {
    return <div>กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Compliance Actions</h1>
        <p className="mt-1 text-sm text-gray-500">
          งานและกิจกรรมที่ต้องดำเนินการเพื่อให้สอดคล้องกับข้อปฏิบัติ
        </p>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                รหัส / ชื่องาน
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ข้อปฏิบัติ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ผู้รับผิดชอบ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                กำหนดเสร็จ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                สถานะ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ความคืบหน้า
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {actions?.map((action: any) => (
              <tr key={action.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {action.actionCode}
                    </div>
                    <div className="text-sm text-gray-500">{action.title}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {action.obligation?.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {action.assignedTo || 'ไม่ระบุ'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {formatDate(action.dueDate)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`badge ${getStatusColor(action.status)}`}>
                    {getStatusLabel(action.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${action.completionPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-700">
                      {action.completionPercentage}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!actions || actions.length === 0) && (
          <div className="text-center py-12">
            <ListTodo className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">ยังไม่มีงาน</h3>
            <p className="mt-1 text-sm text-gray-500">
              งานจะถูกสร้างขึ้นจากข้อปฏิบัติและ controls
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
