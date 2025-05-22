import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  salesReport: null,
  customerAnalytics: null,
  peakHours: null,
  loading: false,
  error: null,
};

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    fetchReportStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSalesReportSuccess: (state, action) => {
      state.loading = false;
      state.salesReport = action.payload;
    },
    fetchCustomerAnalyticsSuccess: (state, action) => {
      state.loading = false;
      state.customerAnalytics = action.payload;
    },
    fetchPeakHoursSuccess: (state, action) => {
      state.loading = false;
      state.peakHours = action.payload;
    },
    fetchReportFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearReports: (state) => {
      state.salesReport = null;
      state.customerAnalytics = null;
      state.peakHours = null;
    },
  },
});

export const {
  fetchReportStart,
  fetchSalesReportSuccess,
  fetchCustomerAnalyticsSuccess,
  fetchPeakHoursSuccess,
  fetchReportFailure,
  clearReports,
} = reportSlice.actions;

export default reportSlice.reducer;