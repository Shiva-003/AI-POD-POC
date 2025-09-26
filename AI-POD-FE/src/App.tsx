import { Outlet } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { ToastContainer } from 'react-toastify';


const App = () => {
	return (
		<div className="min-h-screen flex flex-col bg-background-light">
			<ToastContainer />
			<header className="sticky top-0 z-50  backdrop-blur-sm bg-background-light/40 border-1 border-gray-200/40">
				<Navbar />
			</header>
			<main className="container mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-150px)]">
				<Outlet />
			</main>

			<footer className="container mx-auto px-4 sm:px-6 lg:px-8">
				<Footer />
			</footer>
		</div>
	);
}

export default App;
