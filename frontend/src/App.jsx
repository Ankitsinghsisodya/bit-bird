import {Navigate,Routes,Route} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import HomePage from './pages/home/HomePage.jsx';
import SignUpPage from './pages/auth/signup/SignUpPage.jsx';
import LoginPage from './pages/auth/login/LoginPage.jsx';
import Sidebar from './components/common/Sidebar.jsx';
import RightPanel from './components/common/RightPanel.jsx';
import Notification from './pages/notification/NotificationPage.jsx';
import ProfilePage from './pages/profile/ProfilePage.jsx';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';
import ChatPage from './pages/chats/ChatingPage.jsx'
import { useQuery } from '@tanstack/react-query';


function App() {
	
	const { data: authUser, isLoading, error, isError } = useQuery({
		queryKey: ['authUser'],
		queryFn: async () => {
			try {
				const res = await fetch('/api/auth/me');
				const data = await res.json();
				if (data.error) return null;
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				console.log("authUser is here:", data);
				return data;
			} catch (error) {
				throw new Error(error);
			}
		}
	});

	if (isLoading) {
		return (
			<div className='h-screen flex justify-center items-center'>
				<LoadingSpinner size='lg' />
			</div>
		);
	}

	return (
		<div className='flex max-w-6xl mx-auto'>
			{authUser && <Sidebar />}
			<Routes>
				<Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
				<Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
				<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
				<Route path="notifications" element={authUser ? <Notification /> : <Navigate to='/login' />} />
				<Route path="profile/:username" element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
				<Route path="/chats/*" element={authUser ? <ChatPage /> : <Navigate to='/login' />} />
			</Routes>
			{authUser && <RightPanel />}
			<Toaster />
		</div>
	);
}

export default App;