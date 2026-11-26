import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface BalanceData {
  date: string;
  balance: number;
}

interface Props {
  data: BalanceData[];
}

export const BalanceLineChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="chart-empty">Нет данных для построения графика</div>;
  }

  const formattedData = data.map(item => ({
    ...item,
    shortDate: item.date
  }));

  return (
    <div className="chart-container">
      <LineChart width={500} height={300} data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="shortDate" stroke="#666" fontSize={12} />
        <YAxis stroke="#666" fontSize={12} tickFormatter={(value: number) => `${value} ₽`} />
        <Tooltip 
          formatter={(value: any) => [`${Number(value).toFixed(2)} ₽`, 'Баланс']}
          labelFormatter={(label: any) => `Дата: ${label}`}
        />
        <Line 
          type="monotone" 
          dataKey="balance" 
          stroke="#0088FE" 
          strokeWidth={2}
          dot={{ r: 3, fill: '#0088FE' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </div>
  );
};