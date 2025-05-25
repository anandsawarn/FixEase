import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './Components/Navbar';
import Home from './Pages/Users/Home';
import About from './Pages/Users/About';
import Contact from './Pages/Users/Contact';
import Login from './Pages/Users/Login';
import SignUp from './Pages/Users/SignUp';
import PageNotFound from './Pages/Users/PageNotFound';
import Admin from './Pages/Admin/Admin';
import Services from './Pages/Users/Services';
import BookService from './Components/BookService';
import WhatsappButton from './Components/WhatsappButton';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Show Navbar only on non-admin routes */}
      {!isAdminRoute && <Navbar />}

      <main className="flex-grow pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/services" element={<Services />} />
          <Route path="/book-service/:serviceId" element={<BookService />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </main>

      {/* Show Chat AI only on non-admin routes */}
      {!isAdminRoute && <WhatsappButton />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
