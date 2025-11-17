import { useQuery } from '@tanstack/react-query';
import { complianceApi } from '@/lib/api';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Shield,
  ListTodo,
} from 'lucide-react';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function Dashboard() {
  const { data: overview } = useQuery({
    queryKey: ['overview'],
    queryFn: async () => {
      const response = await complianceApi.getOverview();
      return response.data.data;
    },
  });

  const { data: metrics } = useQuery({
    queryKey: ['metrics'],
    queryFn: async () => {
      const response = await complianceApi.getMetrics();
      return response.data.data;
    },
  });

  const { data: deadlines } = useQuery({
    queryKey: ['deadlines'],
    queryFn: async () => {
      const response = await complianceApi.getUpcomingDeadlines(30);
      return response.data.data;
    },
  });

  const { data: recentChanges } = useQuery({
    queryKey: ['recent-changes'],
    queryFn: async () => {
      const response = await complianceApi.getRecentChanges(5);
      return response.data.data;
    },
  });

  const { data: frameworkCompliance } = useQuery({
    queryKey: ['compliance-by-framework'],
    queryFn: async () => {
      const response = await complianceApi.getComplianceByFramework();
      return response.data.data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          ภาพรวมระบบติดตามการปฏิบัติตามกฎหมายและกฎเกณฑ์
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Frameworks</p>
              <p className="text-2xl font-bold text-gray-900">
                {overview?.frameworks.active || 0}
              </p>
              <p className="text-xs text-gray-500">
                จาก {overview?.frameworks.total || 0} ทั้งหมด
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Regulations</p>
              <p className="text-2xl font-bold text-gray-900">
                {overview?.regulations.active || 0}
              </p>
              <p className="text-xs text-gray-500">
                จาก {overview?.regulations.total || 0} ทั้งหมด
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Obligations</p>
              <p className="text-2xl font-bold text-gray-900">
                {overview?.obligations.total || 0}
              </p>
              <p className="text-xs text-gray-500">ข้อปฏิบัติทั้งหมด</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ListTodo className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Actions</p>
              <p className="text-2xl font-bold text-gray-900">
                {overview?.actions.completed || 0}/{overview?.actions.total || 0}
              </p>
              <p className="text-xs text-gray-500">
                {overview?.actions.completionRate || 0}% สำเร็จ
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Status */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            สถานะการปฏิบัติตาม
          </h2>
          <div className="space-y-3">
            {metrics?.statusDistribution?.map((item: any) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`badge ${getStatusColor(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                  <span className="text-sm text-gray-500">{item.count} รายการ</span>
                </div>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              กำหนดเวลาที่ใกล้จะถึง
            </h2>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {deadlines?.slice(0, 5).map((deadline: any) => (
              <div
                key={deadline.id}
                className="flex items-start justify-between py-2 border-b last:border-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {deadline.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {deadline.regulation}
                  </p>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(deadline.dueDate)}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      deadline.daysUntilDue <= 7
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {deadline.daysUntilDue > 0
                      ? `อีก ${deadline.daysUntilDue} วัน`
                      : 'เกินกำหนด'}
                  </p>
                </div>
              </div>
            ))}
            {(!deadlines || deadlines.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">
                ไม่มีกำหนดเวลาที่ใกล้จะถึง
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Regulatory Changes */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              การเปลี่ยนแปลงล่าสุด
            </h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentChanges?.map((change: any) => (
              <div
                key={change.id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {change.regulation.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {change.description}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="text-xs text-gray-500">
                        {formatDate(change.changeDate)}
                      </span>
                      {change.actionRequired && (
                        <span className="badge badge-warning">
                          ต้องดำเนินการ
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {(!recentChanges || recentChanges.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">
                ไม่มีการเปลี่ยนแปลงล่าสุด
              </p>
            )}
          </div>
        </div>

        {/* Compliance by Framework */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            การปฏิบัติตามตาม Framework
          </h2>
          <div className="space-y-4">
            {frameworkCompliance?.map((item: any) => (
              <div key={item.framework.id}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.framework.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.metrics.totalObligations} ข้อปฏิบัติ
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {item.metrics.complianceRate}%
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.metrics.complianceRate >= 80
                        ? 'bg-green-600'
                        : item.metrics.complianceRate >= 60
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${item.metrics.complianceRate}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                  <span>✓ {item.metrics.compliant} ปฏิบัติตาม</span>
                  <span>⚠ {item.metrics.partiallyCompliant} บางส่วน</span>
                  <span>✗ {item.metrics.nonCompliant} ไม่ปฏิบัติตาม</span>
                </div>
              </div>
            ))}
            {(!frameworkCompliance || frameworkCompliance.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">
                ไม่มีข้อมูล Framework
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Overdue Actions Warning */}
      {overview?.actions.overdue > 0 && (
        <div className="card p-6 bg-red-50 border-red-200">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                มีงานเกินกำหนด {overview.actions.overdue} รายการ
              </h3>
              <p className="mt-1 text-sm text-red-700">
                กรุณาตรวจสอบและดำเนินการกับงานที่เกินกำหนดโดยเร็วที่สุด
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
