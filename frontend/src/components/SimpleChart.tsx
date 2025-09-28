import React from 'react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  data: ChartData[];
  title: string;
  type?: 'bar' | 'pie';
  maxHeight?: number;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ 
  data, 
  title, 
  type = 'bar',
  maxHeight = 200 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-gray-500'
  ];

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="flex flex-wrap gap-4">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const color = item.color || colors[index % colors.length];
            
            return (
              <div key={item.label} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded ${color}`}></div>
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">
                  {item.value} ({percentage.toFixed(1)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3" style={{ maxHeight: `${maxHeight}px` }}>
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const color = item.color || colors[index % colors.length];
          
          return (
            <div key={item.label} className="flex items-center space-x-3">
              <div className="w-20 text-sm text-gray-600 truncate">
                {item.label}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className={`h-6 rounded-full ${color} flex items-center justify-end pr-2 transition-all duration-300`}
                  style={{ width: `${Math.max(percentage, 8)}%` }}
                >
                  <span className="text-xs font-medium text-white">
                    {item.value}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimpleChart;
