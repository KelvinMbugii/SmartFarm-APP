import React from 'react';
import { DollarSign, Droplets, TrendingUp } from 'lucide-react';
import StatCard from '@/components/StatCard';
import WeatherCard from '@/components/WeatherCard';
import ActivityList from '@/components/ActivityList';
import QuickActions from '@/components/QuickActions';

const Dashboard = () => {
  const stats = [
    { title: 'Total Revenue', value: '$24,580', change: '+12.5%', trend: 'up', icon: DollarSign },
    { title: 'Water Usage', value: '1,250l', change: '-5.3%', trend: 'down', icon: Droplets },
    { title: 'Market Price', value: '$45.20/kg', trend: 'up', icon: TrendingUp },
  ];

  const weatherData = {
    temperature: '24°c',
    humidity: '68%',
    windSpeed: '12 km/h',
    condition: 'Partly Cloudy',
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Farm Dashboard</h1>
        <p className="dashboard-subtitle">
          Welcome Back! Here's what's happening on your farm today.
        </p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="dashboard-grid">
        <WeatherCard weather={weatherData} />
        <ActivityList />
        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;
