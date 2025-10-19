import axios from 'axios';

const instance = axios.create({
	// baseURL: "http://localhost:8888",
	baseURL:"https://foodfly-backend-1.onrender.com/",
	withCredentials: true,
});

export default instance;