import { createSlice } from "@reduxjs/toolkit";



const initialState = {
    _id:'',
    name: '',
    email: '',
    username: '',
    image: '',
    orderHistory: [],
    cart: [],
    favourites: [],
    addresses: [],
    contact:'',
    isLoggedIn: false,
};

export const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setUser: (state,action) => {
			// Redux Toolkit allows us to write "mutating" logic in reducers. It
			// doesn't actually mutate the state because it uses the Immer library,
			// which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes.
            state._id = action.payload._id;
			state.name = action.payload.name;
            state.username = action.payload.username;
            state.email = action.payload.email;
            state.image = action.payload.image;
            state.orderHistory = action.payload.orderHistory;
            state.cart = action.payload.cart;
            state.favourites = action.payload.favourites;
            state.addresses = action.payload.addresses;
            state.contact = action.payload.contact;
            state.isLoggedIn = true;
		},
		getUser: (state) => {
            state;
		},
        logoutUser: (state) => {
            state._id = '';
            state.name = '';
            state.username = '';
            state.email = '';
            state.image = '';
            state.orderHistory = [];
            state.cart = [];
            state.favourites = [];
            state.addresses = [];
            state.contact = '';
            state.isLoggedIn = false;
        }
        
	},
});

// Action creators are generated for each case reducer function
export const { setUser, getUser,logoutUser } = userSlice.actions;

export default userSlice.reducer;