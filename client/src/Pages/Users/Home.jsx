import Navbar from '../../Components/Navbar';
import HeroSection from '../../Components/HeroSection';
import Testimonials from '../../Components/Testimonials';
import Services from './Services';
import Footer from '../../Components/Footer';
const Home = () => {
  return (
    <div>
      <Navbar />
       <HeroSection/>
       <Services/>
       <Testimonials/>
      <Footer />
    </div>
  );
};

export default Home;
