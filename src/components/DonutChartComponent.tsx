import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

interface DonutData {
  name: string
  value: number
  color: string
}

interface DonutChartComponentProps {
  data: DonutData[]
  title?: string
}

export function DonutChartComponent({ data, title }: DonutChartComponentProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6">
      {title && <h3 className="text-lg font-bold text-gray-900 mb-6">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={110}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
