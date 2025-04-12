import { 
  PieChart, Pie, Tooltip, Legend, Cell,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
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


const RoomCharts = ({ rooms }: RoomChartsProps) => {
  // 1. Building Preference Statistics
  const buildingPreference = rooms.reduce((acc, room) => {
    const building = room.location.split(',')[0].trim();
    const bookingCount = room.currentBookings?.length || 0;
    acc[building] = (acc[building] || 0) + bookingCount;
    return acc;
  }, {} as Record<string, number>);

  const totalBookings = rooms.reduce((total, room) => 
    total + (room.currentBookings?.length || 0), 0
  );

  const buildingData = Object.entries(buildingPreference)
    .map(([name, bookings]) => ({
      name,
      value: totalBookings > 0 
        ? Math.round((bookings / totalBookings) * 100) 
        : 0 
    }))
    .sort((a, b) => b.value - a.value);

  // 2. Meeting Room Capacity Preference Statistics
  const capacityPreference = rooms.reduce((acc, room) => {
    let size = 'Small (1-4 people)';
    if (room.capacity > 10) size = 'Large (10+ people)';
    else if (room.capacity > 4) size = 'Medium (5-10 people)';
    
    const bookingCount = room.currentBookings?.length || 0;
    acc[size] = (acc[size] || 0) + bookingCount;
    return acc;
  }, {} as Record<string, number>);

  const capacityData = Object.entries(capacityPreference)
    .map(([name, bookings]) => ({
      name,
      value: totalBookings > 0 
        ? Math.round((bookings / totalBookings) * 100)
        : 0
    }))
    .sort((a, b) => {
      const order = ['Small (1-4 people)', 'Medium (5-10 people)', 'Large (10+ people)'];
      return order.indexOf(a.name) - order.indexOf(b.name);
    });

  // 3. Facility Preference Statistics
  const amenityPreference = rooms.reduce((acc, room) => {
    const bookingCount = room.currentBookings?.length || 0;
    
    room.amenities.forEach(amenity => {
      acc[amenity] = (acc[amenity] || 0) + bookingCount;
    });
    return acc;
  }, {} as Record<string, number>);

  const amenityData = Object.entries(amenityPreference)
    .map(([name, bookings]) => ({
      name,
      utilization: totalBookings > 0 
        ? Math.round((bookings / totalBookings) * 100)
        : 0
    }))
    .sort((a, b) => b.utilization - a.utilization);

  // Color Configuration
  const COLORS = [
    '#D8A6A6', '#9BADBC', '#9E8FA1', '#B8A8A8', '#8E8E8E',
    '#8A9AAD', '#6D8B9E', '#7A8D9C', '#A89CAC', '#7D7D6D',
    '#6E7E6B', '#A99F8E', '#B8A692', '#B2A5B8'
  ];

  const renderPieChart = (data: any[], title: string) => (
    <div className="bg-white p-4 rounded-lg shadow h-full min-w-[400px]">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({name, value}) => `${name}: ${value}%`}
              labelLine={{
                strokeWidth: 1,
                stroke: '#999999'
              }}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={entry.name} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderBarChart = (data: any[], title: string) => (
    <div className="bg-white p-4 rounded-lg shadow h-full min-w-[600px]">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 20,
              right: 30,
              left: 150,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} unit="%" />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={140}
              tick={{ 
                fontSize: 12,
                width: 140,
              }}
              style={{
                fontSize: '12px'
              }}
            />
            <Tooltip 
              formatter={(value) => `${value}%`}
              labelStyle={{ fontSize: '12px' }}
              wrapperStyle={{ width: 200 }}
            />
            <Legend />
            <Bar 
              dataKey="utilization" 
              name="Utilization Rate"
              fill="#8884d8"
              radius={[0, 4, 4, 0]}
              barSize={20}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={entry.name} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="mt-6 space-y-6 h-full">
      <div className="flex overflow-x-auto gap-6 pb-4">
        <div className="flex-1 min-w-[400px]">
          {renderPieChart(buildingData, 'Building Preference Statistics')}
        </div>
        <div className="flex-1 min-w-[400px]">
          {renderPieChart(capacityData, 'Meeting Room Capacity Preference Statistics')}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        {renderBarChart(amenityData, 'Meeting Room Amenities Preference Statistics')}
      </div>
    </div>
  );
};

export default RoomCharts; 