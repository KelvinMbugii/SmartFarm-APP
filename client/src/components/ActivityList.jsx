import React from 'react';

const ActivityList = () => {
  const activities = [
    { text: "Irrigation system activated for Field A", time: "2 hours ago" },
    { text: "Harvest completed for tomato crop", time: "5 hours ago" },
    { text: "New market price alert for wheat", time: "1 day ago" },
  ];

  return (
    <div className="activity-card">
      <div className="card-header">
        <h2 className="card-title">Recent Activity</h2>
      </div>
      <div className="activity-list">
        {activities.map((activity, index) => (
          <div key={index} className="activity-item">
            <div className="activity-dot"></div>
            <div className="activity-content">
              <p className="activity-text">{activity.text}</p>
              <span className="activity-time">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityList;
