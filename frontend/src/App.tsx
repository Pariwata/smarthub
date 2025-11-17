import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Frameworks from './pages/Frameworks';
import Regulations from './pages/Regulations';
import Obligations from './pages/Obligations';
import Actions from './pages/Actions';
import Audits from './pages/Audits';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/frameworks" element={<Frameworks />} />
          <Route path="/regulations" element={<Regulations />} />
          <Route path="/obligations" element={<Obligations />} />
          <Route path="/actions" element={<Actions />} />
          <Route path="/audits" element={<Audits />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
