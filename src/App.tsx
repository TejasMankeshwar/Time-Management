import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Pomodoro from './pages/Pomodoro';
import EatTheFrog from './pages/EatTheFrog';
import TimeBlocking from './pages/TimeBlocking';
import Kanban from './pages/Kanban';
import GTD from './pages/GTD';
import RPM from './pages/RPM';
import PickleJar from './pages/PickleJar';
import Analytics from './pages/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="pomodoro" element={<Pomodoro />} />
          <Route path="eat-the-frog" element={<EatTheFrog />} />
          <Route path="time-blocking" element={<TimeBlocking />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="gtd" element={<GTD />} />
          <Route path="rpm" element={<RPM />} />
          <Route path="pickle-jar" element={<PickleJar />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
