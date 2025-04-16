import React from 'react';
import ReactECharts from 'echarts-for-react';

// Import Room Type
type Room = {
  room_id: string
  image: string
  name: string
  capacity_min: number
  capacity_max: number
  building: string
  floor: string
  facilities: {
    projector: boolean | null
    whiteboard: number | null
    power_sockets: number | null
    coffee_break: boolean | null
    special_notes: string[] | null
  }
  booking_count?: number
  hourly_bookings?: number[]
}

interface RoomChartsProps {
  rooms: Room[];
}

/**
 * Meeting Room Booking Preference Statistics Chart Component
 * @param {RoomChartsProps} props - Component properties
 * @returns {JSX.Element} Chart component
 */
const RoomCharts = ({ rooms }: RoomChartsProps) => {
  // 1. Building Preference Statistics
  const buildingPreference = rooms.reduce((acc, room) => {
    const building = room.building;
    // Assuming that each conference room has a booking frequency attribute
    const bookingCount = room.booking_count || 0;
    acc[building] = (acc[building] || 0) + bookingCount;
    return acc;
  }, {} as Record<string, number>);

  // 2. Capacity Preference
  const capacityDistribution = rooms.reduce((acc, room) => {
    const range = `${room.capacity_min}-${room.capacity_max}`;
    const bookingCount = room.booking_count || 0;
    acc[range] = (acc[range] || 0) + bookingCount;
    return acc;
  }, {} as Record<string, number>);

  // 3. Facilities Usage
  const facilitiesUsage = rooms.reduce((acc, room) => {
    const bookingCount = room.booking_count || 0;
    if (room.facilities.projector) acc.projector = (acc.projector || 0) + bookingCount;
    if (room.facilities.whiteboard) acc.whiteboard = (acc.whiteboard || 0) + bookingCount;
    if (room.facilities.power_sockets) acc.power_sockets = (acc.power_sockets || 0) + bookingCount;
    if (room.facilities.coffee_break) acc.coffee_break = (acc.coffee_break || 0) + bookingCount;
    return acc;
  }, {} as Record<string, number>);

  // Calculate the total number of bookings
  const totalBookings = rooms.reduce((acc, room) => acc + (room.booking_count || 0), 0);

  // 1. Building Preference Statistics
  const buildingData = Object.entries(buildingPreference)
    .map(([name, count]) => ({
      name,
      value: count,
      percentage: ((count / totalBookings) * 100).toFixed(1)
    }))
    .sort((a, b) => b.value - a.value);

  // 2. Meeting Room Capacity Preference Statistics
  const capacityData = Object.entries(capacityDistribution)
    .map(([name, count]) => ({
      name,
      value: count,
      percentage: ((count / totalBookings) * 100).toFixed(1)
    }))
    .sort((a, b) => {
      const [minA, maxA] = a.name.split('-').map(Number);
      const [minB, maxB] = b.name.split('-').map(Number);
      return minA - minB || maxA - maxB;
    });

  // 3. Facility Preference Statistics
  const amenityData = Object.entries(facilitiesUsage)
    .map(([name, count]) => ({
      name,
      value: count,
      percentage: ((count / totalBookings) * 100).toFixed(1)
    }))
    .sort((a, b) => {
      const order = ['projector', 'whiteboard', 'power_sockets', 'coffee_break'];
      return order.indexOf(a.name) - order.indexOf(b.name);
    });

  // Color Configuration
  const COLORS = [
    '#B2A5B8',
    '#D8A6A6',
    '#9BADBC',
    '#A9B0B8',
    '#B8A8A8',
    '#9E8FA1',
    '#E6D5C7',
    '#D8C3A5',
    '#C4B5A3',
    '#A8B8A8'
  ];

  // 4. Peak Hours Statistics
  const peakHoursData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    value: rooms.reduce((acc, room) => {
      const hourlyBookings = room.hourly_bookings || Array(24).fill(0);
      return acc + hourlyBookings[i];
    }, 0)
  }));

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Building Preference Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Building Preference</h3>
          <ReactECharts
            option={{
              tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} times ({d}%)'
              },
              legend: {
                orient: 'vertical',
                left: 'left',
                data: buildingData.map(item => item.name)
              },
              series: [
                {
                  type: 'pie',
                  radius: '50%',
                  data: buildingData.map((item, index) => ({
                    ...item,
                    itemStyle: { color: COLORS[index % COLORS.length] }
                  })),
                  emphasis: {
                    itemStyle: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                  },
                  label: {
                    show: true,
                    formatter: '{b}: {d}%'
                  }
                }
              ]
            }}
            style={{ height: '300px' }}
          />
        </div>

        {/* Capacity Distribution Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Capacity Preference</h3>
          <ReactECharts
            option={{
              tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} times ({d}%)'
              },
              legend: {
                orient: 'vertical',
                left: 'left',
                data: capacityData.map(item => item.name)
              },
              series: [
                {
                  type: 'pie',
                  radius: '50%',
                  data: capacityData.map((item, index) => ({
                    ...item,
                    itemStyle: { color: COLORS[index % COLORS.length] }
                  })),
                  emphasis: {
                    itemStyle: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                  },
                  label: {
                    show: true,
                    formatter: '{b}: {d}%'
                  }
                }
              ]
            }}
            style={{ height: '300px' }}
          />
        </div>
      </div>

      {/* Facilities Usage Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Facilities Preference</h3>
        <ReactECharts
          option={{
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow'
              },
              formatter: '{b}: {c} times ({d}%)'
            },
            grid: {
              left: '15%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: {
              type: 'value',
              axisLabel: {
                formatter: '{value}%'
              }
            },
            yAxis: {
              type: 'category',
              data: amenityData.map(item => item.name),
              axisLabel: {
                interval: 0,
                formatter: function(value: string) {
                  return value.length > 20 ? value.slice(0, 20) + '...' : value;
                }
              }
            },
            series: [
              {
                name: 'Booking Count',
                type: 'bar',
                data: amenityData.map((item, index) => ({
                  value: parseFloat(item.percentage),
                  itemStyle: { 
                    color: item.name === 'projector' ? '#9E8FA1' :
                           item.name === 'whiteboard' ? '#9BADBC' :
                           item.name === 'power_sockets' ? '#D8A6A6' :
                           item.name === 'coffee_break' ? '#B8A8A8' :
                           COLORS[index % COLORS.length]
                  }
                })),
                label: {
                  show: true,
                  position: 'right',
                  formatter: '{c}%'
                }
              }
            ]
          }}
          style={{ height: '300px' }}
        />
      </div>

      {/* Peak Hours Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Peak Hours Distribution</h3>
        <ReactECharts
          option={{
            tooltip: {
              trigger: 'axis',
              formatter: '{b}:00 - {c} times'
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: {
              type: 'category',
              data: peakHoursData.map(item => `${item.hour}:00`),
              axisLabel: {
                interval: 2,
                formatter: function(value: string) {
                  return value;
                }
              }
            },
            yAxis: {
              type: 'value',
              name: 'Booking Count',
              nameLocation: 'middle',
              nameGap: 30
            },
            series: [
              {
                name: 'Booking Count',
                type: 'line',
                smooth: true,
                data: peakHoursData.map(item => item.value),
                itemStyle: {
                  color: '#B2A5B8'
                },
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                      offset: 0,
                      color: 'rgba(178, 165, 184, 0.3)'
                    }, {
                      offset: 1,
                      color: 'rgba(178, 165, 184, 0.1)'
                    }]
                  }
                },
                markLine: {
                  silent: true,
                  data: [
                    {
                      name: 'Average',
                      type: 'average',
                      lineStyle: {
                        color: '#9E8FA1'
                      }
                    }
                  ]
                }
              }
            ]
          }}
          style={{ height: '300px' }}
        />
      </div>
    </div>
  );
};

export default RoomCharts; 