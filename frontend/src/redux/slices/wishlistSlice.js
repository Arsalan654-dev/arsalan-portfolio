import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await userService.getWishlist();
    return res.data?.data || res.data || [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load wishlist');
  }
});

export const addToWishlistAPI = createAsyncThunk('wishlist/addToWishlist', async (itemId, { rejectWithValue }) => {
  try {
    const res = await userService.addToWishlist({ itemId });
    return res.data?.data || res.data || [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add to wishlist');
  }
});

export const removeFromWishlistAPI = createAsyncThunk('wishlist/removeFromWishlist', async (itemId, { rejectWithValue }) => {
  try {
    const res = await userService.removeFromWishlist(itemId);
    return res.data?.data || res.data || [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to remove from wishlist');
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchWishlist.fulfilled, (state, action) => { state.items = action.payload; state.loading = false; })
      .addCase(fetchWishlist.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addToWishlistAPI.fulfilled, (state, action) => { state.items = action.payload; })
      .addCase(addToWishlistAPI.rejected, (state, action) => { state.error = action.payload; })
      .addCase(removeFromWishlistAPI.fulfilled, (state, action) => { state.items = action.payload; })
      .addCase(removeFromWishlistAPI.rejected, (state, action) => { state.error = action.payload; });
  }
});

export const { setWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
