import { 
  PieChart, Pie, Tooltip, Legend, Cell,
  ResponsiveContainer
} from 'recharts';

// Import Room Type
type Room = {
  id: number
  name: string
  capacity: number
  location: string
  description: string
  amenities: string[]
  status: 'available' | 'booked' | 'in_use' | 'maintenance'
  utilizationRate: number
  currentBookings: {
    id: number
    startTime: string
    endTime: string
    userName: string
    purpose: string
  }[]
  weeklyStats: {
    totalHours: number
    averageUtilization: number
    peakHours: string[]
  }
}

interface RoomChartsProps {
  rooms: Room[];
}

/**
 * Meeting Room Usage Chart Component
 */
const RoomCharts = ({ rooms }: RoomChartsProps) => {
  // Calculate status distribution data
  const statusData = rooms.reduce((acc, room) => {
    const status = room.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusData).map(([name, value]) => ({
    name: name === 'available' ? 'Available' :
          name === 'booked' ? 'Booked' :
          name === 'in_use' ? 'In Use' : 'Maintenance',
    value
  }));

  // Color configuration
  const STATUS_COLORS = {
    'Available': '#00C49F',
    'Booked': '#FFBB28',
    'In Use': '#FF8042',
    'Maintenance': '#d1d5db'
  };

  return (
    <div className="mt-6">
      {/* Meeting Room Status Distribution Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Meeting Room Real-Time Status Distribution</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({name, value}) => `${name}: ${value} rooms`}
              >
                {pieData.map((entry) => (
                  <Cell 
                    key={entry.name} 
                    fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} 
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RoomCharts; 