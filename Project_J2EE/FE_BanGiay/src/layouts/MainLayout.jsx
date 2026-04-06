import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';

function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Navbar không còn fixed, không cần padding top */}
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

export default MainLayout;
