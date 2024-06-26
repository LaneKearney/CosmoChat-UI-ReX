import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ActivityDashboard = () => {
  const [activityData, setActivityData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [timeFrame, setTimeFrame] = useState('all');
  const [recommendations, setRecommendations] = useState('');

  const fetchActivityData = async () => {
    try {
      const response = await fetch('/mockData.json'); // Replace with your actual API endpoint
      const data = await response.json();
      setActivityData(data);

      const pieData = [
        { name: 'Likes', value: data.reduce((sum, item) => sum + item.likes, 0) },
        { name: 'Comments', value: data.reduce((sum, item) => sum + item.comments, 0) },
        { name: 'Shgares', value: data.reduce((sum, item) => sum + item.shares, 0) },
      ];
      setPieData(pieData);

      generateRecommendations(data);
    } catch (error) {
      console.error('Error fetching activity data:', error);
    }
  };

  useEffect(() => {
    fetchActivityData();
    const intervalId = setInterval(fetchActivityData, 60000); // Fetch data every minute

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const handleTimeFrameChange = (e) => {
    setTimeFrame(e.target.value);
  };

  const filterDataByTimeFrame = (data) => {
    if (timeFrame === 'all') return data;
    const now = new Date();
    const filteredData = data.filter(item => {
      const date = new Date(item.name);
      if (timeFrame === 'last7days') {
        return (now - date) <= 7 * 24 * 60 * 60 * 1000;
      } else if (timeFrame === 'lastMonth') {
        return (now - date) <= 30 * 24 * 60 * 60 * 1000;
      }
      return true;
    });
    return filteredData;
  };

  const generateRecommendations = (data) => {
    const recentData = data.slice(-2);
    const last = recentData[recentData.length - 1];
    const previous = recentData[recentData.length - 2];

    let recommendationText = 'User activity is stable.';
    if (last.logins > previous.logins) {
      recommendationText = 'User logins have increased. Consider sending promotional emails to maintain the trend.';
    } else if (last.logins < previous.logins) {
      recommendationText = 'User logins have decreased. Consider running engagement campaigns.';
    }

    setRecommendations(recommendationText);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const filteredActivityData = filterDataByTimeFrame(activityData);

  return (
    <div style={{ width: '100%', height: '100vh', padding: '20px' }}>
      <h2>Activity Dashboard</h2>
      <div>
        <label>Select Time Frame: </label>
        <select value={timeFrame} onChange={handleTimeFrameChange}>
          <option value="all">All Time</option>
          <option value="last7days">Last 7 Days</option>
          <option value="lastMonth">Last Month</option>
        </select>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 45%', margin: '20px' }}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={filteredActivityData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="logins" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="messages" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: '1 1 45%', margin: '20px' }}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={filteredActivityData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="activeUsers" fill="#8884d8" />
              <Bar dataKey="sessionDuration" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: '1 1 45%', margin: '20px' }}>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h3>Recommendations</h3>
        <p>{recommendations}</p>
      </div>
    </div>
  );
};

export default ActivityDashboard;






