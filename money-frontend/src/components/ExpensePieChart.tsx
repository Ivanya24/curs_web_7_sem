import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28', '#FF6B6B', '#A28DFF'];

interface CategoryData {
  category: string;
  totalAmount: number;
}

interface Props {
  data: CategoryData[];
}

export const ExpensePieChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="chart-empty">Нет данных о расходах</div>;
  }

  return (
    <div className="chart-container">
      <PieChart width={400} height={300}>
        <Pie
          data={data}
          cx={200}
          cy={150}
          outerRadius={80}
          fill="#8884d8"
          dataKey="totalAmount"
          nameKey="category"
          label={(entry: any) => `${entry.category} ${(entry.percent * 100).toFixed(0)}%`}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: any) => `${Number(value).toFixed(2)} ₽`} />
        <Legend />
      </PieChart>
    </div>
  );
};