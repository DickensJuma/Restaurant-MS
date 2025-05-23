import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { staffAPI } from "../../services/api";

export const fetchStaff = createAsyncThunk(
  "staff/fetchStaff",
  async (_, { rejectWithValue }) => {
    try {
      const response = await staffAPI.getAll();
      // If response is an array, return it directly
      if (Array.isArray(response)) {
        return response;
      }
      // If response has a data property that's an array, return that
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }
      // If response has a success property and data, return the data
      if (response && response.success && response.data) {
        return response.data;
      }
      // If none of the above, return the response as is
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addStaff = createAsyncThunk(
  "staff/addStaff",
  async (staffData, { rejectWithValue }) => {
    try {
      const response = await staffAPI.create(staffData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateStaff = createAsyncThunk(
  "staff/updateStaff",
  async ({ id, ...staffData }, { rejectWithValue }) => {
    try {
      const response = await staffAPI.update(id, staffData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteStaff = createAsyncThunk(
  "staff/deleteStaff",
  async (id, { rejectWithValue }) => {
    try {
      await staffAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const staffSlice = createSlice({
  name: "staff",
  initialState: {
    staff: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.staff = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addStaff.fulfilled, (state, action) => {
        state.staff.push(action.payload);
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        const index = state.staff.findIndex(
          (staff) => staff._id === action.payload._id
        );
        if (index !== -1) {
          state.staff[index] = action.payload;
        }
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.staff = state.staff.filter(
          (staff) => staff._id !== action.payload
        );
      });
  },
});

export default staffSlice.reducer;
