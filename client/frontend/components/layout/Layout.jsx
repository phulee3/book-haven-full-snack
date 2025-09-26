import { useLocation } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';

const Layout = ({ children }) => {
    const location = useLocation();

    return (
        <div>
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
};

export default Layout;