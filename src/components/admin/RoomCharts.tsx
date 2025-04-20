import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { subDays } from 'date-fns';

type Reservation = {
  reservation_id: string;
  room_id: string;
  room_name: string;
  building: string;
  floor: number;
  user_id: string;
  user_name: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  attendees: Array<{
    user_id: string;
    avatar: string;
    username: string;
    email: string;
    status: string;
    created_at: string;
    updated_at: string;
  }>;
  purpose: string;
  status: string; // pending confirmed canceled completed
}

type Room = {
  room_id: string;
  image: string;
  name: string;
  capacity_min: number;
  capacity_max: number;
  building: string;
  floor: string;
  facilities: {
    projector: boolean | null;
    whiteboard: number | null;
    power_sockets: number | null;
    coffee_break: boolean | null;
    special_notes: string[] | null;
  };
  status: string;
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
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(`${backendUrl}/admin/reservations`, {
          method: 'GET',
          credentials: 'include',
        });
        
        const data = await response.json();
        console.log('Original response data:', data);
        
        if (data.code === 200) {
          // Process date format
          const processedReservations = data.data.map((reservation: Reservation) => {
            // Processing start time
            let startTime: Date;
            if (reservation.start_time.toString().startsWith('+')) {
              const [year, month, day, hour, minute, second] = reservation.start_time.toString()
                .match(/\+(\d{5})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z/)!
                .slice(1)
                .map(Number);
              startTime = new Date(year, month - 1, day, hour, minute, second);
            } else {
              startTime = new Date(reservation.start_time);
            }

            // End time of processing
            let endTime: Date;
            if (reservation.end_time.toString().startsWith('+')) {
              const [year, month, day, hour, minute, second] = reservation.end_time.toString()
                .match(/\+(\d{5})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z/)!
                .slice(1)
                .map(Number);
              endTime = new Date(year, month - 1, day, hour, minute, second);
            } else {
              endTime = new Date(reservation.end_time);
            }

            return {
              ...reservation,
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString()
            };
          });

          console.log('Processed booking data:', processedReservations);
          setReservations(processedReservations);
          setLoading(false);
          return;
        }

        throw new Error(data.message || 'Unknown response format');
      } catch (error) {
        console.error('Failed to obtain booking data:', error);
        setReservations([]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 mb-4">No data available or login required</p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to login
        </button>
      </div>
    );
  }

  // 1. Firstly, select the bookings that meet the criteria
  const validReservations = reservations.filter(reservation => {
    // Check the booking status
    const isValidStatus = reservation.status === 'completed' || reservation.status === 'confirmed';
    
    // Check if the booking time is within the past month
    const reservationStart = new Date(reservation.start_time);
    const reservationEnd = new Date(reservation.end_time);
    const queryStart = subDays(new Date(), 30);
    const queryEnd = new Date();
    const isInTimeRange = reservationStart >= queryStart && reservationEnd <= queryEnd;
    
    console.log('Booking Check:', {
      reservation_id: reservation.reservation_id,
      status: reservation.status,
      start_time: reservation.start_time,
      end_time: reservation.end_time,
      isValidStatus,
      isInTimeRange
    });
    
    return isValidStatus && isInTimeRange;
  });

  console.log('Eligible bookings:', validReservations);

  // 2. Building preference analysis
  const buildingPreference = validReservations.reduce((acc, reservation) => {
    const room = rooms.find(r => r.room_id === reservation.room_id);
    if (room) {
      acc[room.building] = (acc[room.building] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  console.log('Building preference data:', buildingPreference);

  // 3. Capacity preference analysis
  const capacityDistribution = validReservations.reduce((acc, reservation) => {
    const room = rooms.find(r => r.room_id === reservation.room_id);
    if (room) {
      const range = `${room.capacity_min}-${room.capacity_max}`;
      acc[range] = (acc[range] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  console.log('Capacity preference data:', capacityDistribution);

  // 4. Facility preference analysis
  const facilitiesUsage = validReservations.reduce((acc, reservation) => {
    const room = rooms.find(r => r.room_id === reservation.room_id);
    if (room) {
      // Boolean type facility statistics
      if (room.facilities.projector) {
        acc.projector = (acc.projector || 0) + 1;
      }
      if (room.facilities.coffee_break) {
        acc.coffee_break = (acc.coffee_break || 0) + 1;
      }
      
      // Numerical type facility statistics
      if (room.facilities.whiteboard) {
        const whiteboardKey = `${room.facilities.whiteboard} Whiteboard${room.facilities.whiteboard > 1 ? 's' : ''}`;
        acc[whiteboardKey] = (acc[whiteboardKey] || 0) + 1;
      }
      if (room.facilities.power_sockets) {
        const socketKey = `${room.facilities.power_sockets} Socket${room.facilities.power_sockets > 1 ? 's' : ''}`;
        acc[socketKey] = (acc[socketKey] || 0) + 1;
      }
    }
    return acc;
  }, {} as Record<string, number>);

  console.log('Facility preference data:', facilitiesUsage);

  // 5. 24-hour distribution analysis
  const peakHoursData = Array.from({ length: 24 }, (_, hour) => {
    const count = validReservations.reduce((acc, reservation) => {
      const startHour = new Date(reservation.start_time).getHours();
      const endHour = new Date(reservation.end_time).getHours();
      // If the booking time includes the current hour, count
      if (hour >= startHour && hour < endHour) {
        return acc + 1;
      }
      return acc;
    }, 0);
    return { hour, value: count };
  });

  console.log('24-hour distribution data:', peakHoursData);

  // Calculate the total number of valid reservations
  const totalReservations = validReservations.length;
  console.log('Total number of bookings:', totalReservations);

  // 1. Building Preference Statistics
  const buildingData = Object.entries(buildingPreference)
    .map(([name, count]) => ({
      name,
      value: count,
      percentage: ((count / totalReservations) * 100).toFixed(1)
    }))
    .sort((a, b) => b.value - a.value);

  // 2. Meeting Room Capacity Preference Statistics
  const capacityData = Object.entries(capacityDistribution)
    .map(([name, count]) => ({
      name,
      value: count,
      percentage: ((count / totalReservations) * 100).toFixed(1)
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
      percentage: ((count / totalReservations) * 100).toFixed(1)
    }))
    .sort((a, b) => {
      // Custom sorting order: first boolean facilities, then numerical facilities
      const order = ['projector', 'coffee_break'];
      const aIndex = order.indexOf(a.name);
      const bIndex = order.indexOf(b.name);
      
      // If both are boolean facilities, sort by predefined order
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      // If both are numerical facilities, sort by number size
      if (aIndex === -1 && bIndex === -1) {
        const aNum = parseInt(a.name);
        const bNum = parseInt(b.name);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
      }
      
      // Boolean facilities are ranked first
      return aIndex === -1 ? 1 : -1;
    });

  // Color Configuration
  const COLORS = [
    '#8cb4d4', // Dark blue
    '#9bc7db', // Medium dark blue
    '#b4d4e4', // Medium blue
    '#a0d4e4', // Medium light blue
    '#acd4e0', // Light blue
    '#b8dde4', // Light cyan blue
    '#c2e0e8', // Light blue
    '#c9e4e4', // Light cyan
    '#dbeef0', // Extremely light blue
    '#e5f2f4'  // Lightest blue
  ];

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Building Preference Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Building Preference - Monthly</h3>
          <ReactECharts
            option={{
              tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} booking(s) ({d}%)'
              },
              legend: {
                orient: 'vertical',
                left: 'left',
                data: buildingData.map(item => item.name)
              },
              series: [
                {
                  type: 'pie',
                  radius: ['40%', '70%'],
                  center: ['60%', '50%'],
                  avoidLabelOverlap: true,
                  itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                  },
                  label: {
                    show: true,
                    formatter: '{b}: {d}%',
                    position: 'outside'
                  },
                  emphasis: {
                    label: {
                      show: true,
                      fontSize: '14',
                      fontWeight: 'bold'
                    },
                    itemStyle: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                  },
                  data: buildingData.map((item, index) => ({
                    ...item,
                    itemStyle: { color: COLORS[index % COLORS.length] }
                  }))
                }
              ]
            }}
            style={{ height: '300px' }}
          />
        </div>

        {/* Capacity Distribution Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Capacity Preference - Monthly</h3>
          <ReactECharts
            option={{
              tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} booking(s) ({d}%)'
              },
              legend: {
                orient: 'vertical',
                left: 'left',
                data: capacityData.map(item => item.name)
              },
              series: [
                {
                  type: 'pie',
                  radius: ['40%', '70%'],
                  center: ['60%', '50%'],
                  avoidLabelOverlap: true,
                  itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                  },
                  label: {
                    show: true,
                    formatter: '{b}: {d}%',
                    position: 'outside'
                  },
                  emphasis: {
                    label: {
                      show: true,
                      fontSize: '14',
                      fontWeight: 'bold'
                    },
                    itemStyle: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                  },
                  data: capacityData.map((item, index) => ({
                    ...item,
                    itemStyle: { color: COLORS[index % COLORS.length] }
                  }))
                }
              ]
            }}
            style={{ height: '300px' }}
          />
        </div>
      </div>

      {/* Facilities Usage Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Facility Preference - Monthly</h3>
        <ReactECharts
          option={{
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow'
              },
              formatter: function(params: any) {
                const data = params[0];
                const amenity = amenityData.find(item => item.name === data.name);
                if (amenity) {
                  return `${data.name}: ${amenity.value} booking(s) (${amenity.percentage}%)`;
                }
                return '';
              }
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
                name: 'Booking Counts',
                type: 'bar',
                data: amenityData.map((item, index) => ({
                  value: parseFloat(item.percentage),
                  itemStyle: { 
                    color: item.name === 'projector' ? COLORS[0] :
                           item.name === 'coffee_break' ? COLORS[1] :
                           COLORS[index % COLORS.length]
                  }
                })),
                label: {
                  show: true,
                  position: 'right',
                  formatter: '{c}%'
                },
                barWidth: '60%',
                itemStyle: {
                  borderRadius: [0, 5, 5, 0]
                }
              }
            ]
          }}
          style={{ height: '300px' }}
        />
      </div>

      {/* Peak Hours Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Peak Hours Distribution - Monthly</h3>
        <ReactECharts
          option={{
            tooltip: {
              trigger: 'axis',
              formatter: '{b}:00 - {c} booking(s)'
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
              name: 'Booking Counts',
              nameLocation: 'middle',
              nameGap: 30
            },
            series: [
              {
                name: 'Booking Counts',
                type: 'line',
                smooth: true,
                data: peakHoursData.map(item => item.value),
                itemStyle: {
                  color: `${COLORS[0]}95`
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
                      color: `${COLORS[0]}60`
                    }, {
                      offset: 1,
                      color: `${COLORS[2]}35`
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
                        color: COLORS[0]
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