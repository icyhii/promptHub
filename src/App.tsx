import { Suspense, lazy, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy-loaded pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MyPrompts = lazy(() => import('./pages/MyPrompts'));
const PromptDetail = lazy(() => import('./pages/PromptDetail'));
const Teams = lazy(() => import('./pages/Teams'));
const CommunityLibrary = lazy(() => import('./pages/CommunityLibrary'));
const Playground = lazy(() => import('./pages/Playground'));
const Optimization = lazy(() => import('./pages/Optimization'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/prompts" element={<MyPrompts />} />
          <Route path="/prompts/:id" element={<PromptDetail />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/community" element={<CommunityLibrary />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/optimization" element={<Optimization />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;