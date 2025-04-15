import React from 'react';
import ReactECharts from 'echarts-for-react';

// Import Room Type
type Room = {
  id: number
  name: string
  capacity: number
  location: string
  description: string
  facilities: {
    projecter: boolean | null
    whiteboard: number | null
    power_sockets: number | null
    coffee_break: boolean | null
    special_notes: string[] | null
  }
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
 * Meeting Room Booking Preference Statistics Chart Component
 * @param {RoomChartsProps} props - Component properties
 * @returns {JSX.Element} Chart component
 */
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
    
    // Boolean facility statistics
    if (room.facilities.projecter) {
      acc['Projector'] = (acc['Projector'] || 0) + bookingCount;
    }
    if (room.facilities.coffee_break) {
      acc['Coffee Break'] = (acc['Coffee Break'] || 0) + bookingCount;
    }
    
    // Whiteboard quantity statistics
    if (room.facilities.whiteboard) {
      const whiteboardCount = room.facilities.whiteboard;
      if (whiteboardCount === 1) {
        acc['1 Whiteboard'] = (acc['1 Whiteboard'] || 0) + bookingCount;
      }
      if (whiteboardCount === 2) {
        acc['2 Whiteboards'] = (acc['2 Whiteboards'] || 0) + bookingCount;
      }
      if (whiteboardCount >= 3) {
        acc['3+ Whiteboards'] = (acc['3+ Whiteboards'] || 0) + bookingCount;
      }
    }
    
    // Statistics on the number of sockets
    if (room.facilities.power_sockets) {
      const socketCount = room.facilities.power_sockets;
      if (socketCount <= 4) {
        acc['1-4 Power Sockets'] = (acc['1-4 Power Sockets'] || 0) + bookingCount;
      } else if (socketCount <= 8) {
        acc['4-8 Power Sockets'] = (acc['4-8 Power Sockets'] || 0) + bookingCount;
      } else {
        acc['8+ Power Sockets'] = (acc['8+ Power Sockets'] || 0) + bookingCount;
      }
    }
    
    return acc;
  }, {} as Record<string, number>);

  const amenityData = Object.entries(amenityPreference)
    .map(([name, bookings]) => ({
      name,
      value: totalBookings > 0 
        ? Math.round((bookings / totalBookings) * 100)
        : 0
    }))
    .sort((a, b) => {
      // Customize sorting rules
      const getOrder = (name: string) => {
        // Boolean value facilities are ranked first
        if (name === 'Projector') return 1;
        if (name === 'Coffee Break') return 2;
        // Whiteboards sorted by quantity
        if (name.includes('Whiteboard')) {
          if (name === '1 Whiteboard') return 3;
          if (name === '2 Whiteboards') return 4;
          if (name === '3+ Whiteboards') return 5;
          return 6;
        }
        // Sockets sorted by range
        if (name.includes('Power Socket')) {
          if (name.startsWith('1-4')) return 10;
          if (name.startsWith('4-8')) return 11;
          return 12;
        }
        return 100;
      };
      return getOrder(a.name) - getOrder(b.name);
    });

  // Color Configuration
  const COLORS = [
    '#D8A6A6', '#9BADBC', '#9E8FA1', '#B8A8A8', '#B2A5B8'
  ];

  // Building Preference Pie Chart Configuration
  const buildingOption = {
    title: {
      text: 'Building Preference Statistics',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [
      {
        name: 'Building Preference',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true
        },
        data: buildingData.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: COLORS[index % COLORS.length] }
        }))
      }
    ]
  };

  // Capacity Preference Pie Chart Configuration
  const capacityOption = {
    title: {
      text: 'Capacity Preference Statistics',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [
      {
        name: 'Capacity Preference',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true
        },
        data: capacityData.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: COLORS[index % COLORS.length] }
        }))
      }
    ]
  };

  // Facility Preference Bar Chart Configuration
  const amenityOption = {
    title: {
      text: 'Facility Preference Statistics',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c}%'
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
        name: 'Utilization Rate',
        type: 'bar',
        data: amenityData.map((item, index) => ({
          value: item.value,
          itemStyle: { 
            color: item.name.includes('Whiteboard') ? '#9BADBC' :
                   item.name.includes('Power Socket') ? '#D8A6A6' :
                   item.name === 'Projector' ? '#9E8FA1' :
                   item.name === 'Coffee Break' ? '#B8A8A8' :
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
  };

  // Peak hours statistics
  const generatePeakHoursData = () => {
    const hourStats = Array(24).fill(0);
    
    rooms.forEach(room => {
      room.weeklyStats.peakHours.forEach(peakHour => {
        const [start, end] = peakHour.split('-');
        const [startHour, startMinute] = start.split(':').map(Number);
        const [endHour, endMinute] = end.split(':').map(Number);
        
        // Convert time to minutes for calculation
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;
        
        // Calculate the statistics for each hour
        for (let hour = 0; hour < 24; hour++) {
          const hourStart = hour * 60;
          const hourEnd = (hour + 1) * 60;
          
          // Check if there is an overlap
          if (startTime < hourEnd && endTime > hourStart) {
            hourStats[hour]++;
          }
        }
      });
    });

    return hourStats.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      count: count
    }));
  };

  // Peak hours statistics configuration
  const peakHoursOption = {
    title: {
      text: 'Peak Hours Statistics',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        const time = params[0].name;
        const count = params[0].value;
        return `${time}<br/>Peak Count: ${count}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: generatePeakHoursData().map(item => item.hour),
      axisLabel: {
        interval: 0,
        rotate: 45,
        formatter: function(value: string) {
          return value;
        },
        align: 'center',
        margin: 15
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      name: 'Peak Count',
      minInterval: 1
    },
    series: [
      {
        name: 'Peak Hours',
        type: 'line',
        smooth: true,
        data: generatePeakHoursData().map(item => item.count),
        areaStyle: {
          opacity: 0.3
        },
        lineStyle: {
          width: 3
        },
        itemStyle: {
          color: '#B2A5B8'
        },
        symbol: 'circle',
        symbolSize: 8
      }
    ]
  };

  return (
    <div className="mt-6 space-y-6 h-full">
      <div className="flex overflow-x-auto gap-6 pb-4">
        <div className="flex-1 min-w-[400px] h-[400px]">
          <ReactECharts option={buildingOption} style={{ height: '100%' }} />
        </div>
        <div className="flex-1 min-w-[400px] h-[400px]">
          <ReactECharts option={capacityOption} style={{ height: '100%' }} />
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px] h-[400px]">
          <ReactECharts option={amenityOption} style={{ height: '100%' }} />
        </div>
      </div>

      <div className="grid gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[800px] h-[400px]">
              <ReactECharts option={peakHoursOption} style={{ height: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCharts; 