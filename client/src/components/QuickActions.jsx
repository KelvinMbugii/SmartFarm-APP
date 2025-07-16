import React from 'react';
import { TrendingUp, Droplets, Sun, MessageCircle } from 'lucide-react';

const QuickActions = () => (
  <div className="quick-actions-card">
    <div className="card-header">
      <h2 className="card-title">Quick Actions</h2>
    </div>
    <div className="quick-actions">
      <button className="action-btn primary">
        <TrendingUp className="w-5 h-5" />
        Check Prices
      </button>
      <button className="action-btn secondary">
        <Droplets className="w-5 h-5" />
        Water Crops
      </button>
      <button className="action-btn secondary">
        <Sun className="w-5 h-5" />
        Weather Forecast
      </button>
      <button className="action-btn secondary">
        <MessageCircle className="w-5 h-5" />
        Contact Expert
      </button>
    </div>
  </div>
);

export default QuickActions;
