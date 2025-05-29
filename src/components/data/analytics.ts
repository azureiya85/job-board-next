export const getInitialAnalyticsData = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return {
    date: today,
    totalUsers: 0,
    newUsers: 0,
    activeUsers: 0,
    totalJobPostings: 0,
    newJobPostings: 0,
    totalApplications: 0,
    newApplications: 0,
    totalSubscriptions: 0,
    newSubscriptions: 0,
    subscriptionRevenue: 0,
    assessmentsTaken: 0,
    certificatesIssued: 0,
  };
};