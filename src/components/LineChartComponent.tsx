import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DataPoint {
  month: string
  licitaciones: number
}

interface LineChartComponentProps {
  data: DataPoint[]
  title?: string
}

export function LineChartComponent({ data, title }: LineChartComponentProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6">
      {title && <h3 className="text-lg font-bold text-gray-900 mb-6">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Line
            type="monotone"
            dataKey="licitaciones"
            stroke="#0d9488"
            strokeWidth={3}
            dot={{ fill: '#0d9488', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
