import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Documents from './pages/Documents';
import Search from './pages/Search';
import Upload from './pages/Upload';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import DocumentDetail from './pages/DocumentDetail';

export default function AppRouter() {
  const isLoggedIn = !!localStorage.getItem('token');
  return (
    <Router>
      <Routes>
        <Route
          path='/'
          element={
            isLoggedIn ? (
              <Layout>
                <Documents />
              </Layout>
            ) : (
              <Navigate to='/login' />
            )
          }
        />
        <Route
          path='/login'
          element={
            <Layout hideNavbar>
              <Login />
            </Layout>
          }
        />
        <Route
          path='/register'
          element={
            <Layout hideNavbar>
              <Register />
            </Layout>
          }
        />
        <Route
          path='/search'
          element={
            isLoggedIn ? (
              <Layout>
                <Search />
              </Layout>
            ) : (
              <Navigate to='/login' />
            )
          }
        />
        <Route
          path='/upload'
          element={
            isLoggedIn ? (
              <Layout>
                <Upload />
              </Layout>
            ) : (
              <Navigate to='/login' />
            )
          }
        />
        {/* Catch-all route for undefined paths */}
        <Route
          path='*'
          element={<Navigate to={isLoggedIn ? '/' : '/login'} replace />}
        />
        <Route
          path='/documents/:id'
          element={
            isLoggedIn ? (
              <Layout>
                <DocumentDetail />
              </Layout>
            ) : (
              <Navigate to='/login' />
            )
          }
        />
      </Routes>
    </Router>
  );
}
