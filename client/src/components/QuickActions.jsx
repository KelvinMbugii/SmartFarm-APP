import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Droplets, Sun, MessageCircle } from 'lucide-react';

const QuickActions = () => (
  <div className="quick-actions-card">
    <div className="card-header">
      <h2 className="card-title">Quick Actions</h2>
    </div>
    <div className="quick-actions">
      <Link to="/market" className="action-btn primary">
        <TrendingUp className="w-5 h-5" />
        Check Prices
      </Link>
      <Link to="/marketplace" className="action-btn secondary">
        <Droplets className="w-5 h-5" />
        Water Crops
      </Link>
      <Link to="/weather" className="action-btn secondary">
        <Sun className="w-5 h-5" />
        Weather Forecast
      </Link>
      <Link to="/chat" className="action-btn secondary">
        <MessageCircle className="w-5 h-5" />
        Contact Expert
      </Link>
    </div>
  </div>
);

export default QuickActions;
