import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { FaMoneyBill, FaCalendar, FaClock, FaFileInvoiceDollar } from 'react-icons/fa';

const UserSalary = () => {
  const [salary, setSalary] = useState({
    current: null,
    history: [],
    nextPayDate: '',
    paymentHistory: []
  });

  useEffect(() => {
    const fetchSalaryData = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;

        const userData = JSON.parse(userStr);
        if (!userData.id) {
          const userResponse = await axiosInstance.get(`/api/user/email/${encodeURIComponent(userData.email)}`);
          if (!userResponse.data?.employee?.empId) {
            throw new Error('Failed to get employee details');
          }
          const salaryResponse = await axiosInstance.get(`/api/dashboard/user/summary`);
          setSalary({
            current: {
              baseSalary: salaryResponse.data.salaryHistory?.[0]?.baseSalary || 0,
              deductions: salaryResponse.data.salaryHistory?.[0]?.deductions || 0,
              bonus: salaryResponse.data.salaryHistory?.[0]?.bonus || 0,
              totalSalary: salaryResponse.data.salaryHistory?.[0]?.totalSalary || 0,
              paymentFrequency: 'Monthly',
              paymentMethod: 'Direct Deposit'
            },
            history: salaryResponse.data.salaryHistory || [],
            nextPayDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
            paymentHistory: []
          });
        }
      } catch (error) {
        console.error('Error fetching salary data:', error);
      }
    };

    fetchSalaryData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Salary & Benefits</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Salary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Monthly Salary Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Base Salary</span>
                <span className="font-medium">${salary.current?.baseSalary?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Deductions</span>
                <span className="text-red-600">-${salary.current?.deductions?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Bonus</span>
                <span className="text-green-600">${salary.current?.bonus?.toLocaleString() || 0}</span>
              </div>
              <div className="border-t pt-4 flex items-center justify-between">
                <span className="font-semibold">Net Salary</span>
                <span className="text-xl font-bold">
                  ${salary.current?.totalSalary?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Payment Information</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FaCalendar className="text-xl text-gray-400" />
                <span>Next Pay Date:</span>
                <span className="font-medium">
                  {salary.nextPayDate ? new Date(salary.nextPayDate).toLocaleDateString() : 'Not specified'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FaClock className="text-xl text-gray-400" />
                <span>Payment Frequency:</span>
                <span className="font-medium">{salary.current?.paymentFrequency || 'Monthly'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaFileInvoiceDollar className="text-xl text-gray-400" />
                <span>Payment Method:</span>
                <span className="font-medium">{salary.current?.paymentMethod || 'Direct Deposit'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Salary History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deductions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bonus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salary.history.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date().toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${record.baseSalary?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600">
                    -${record.deductions?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600">
                    ${record.bonus?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    ${record.totalSalary?.toLocaleString() || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserSalary;
