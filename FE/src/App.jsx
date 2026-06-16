import { Suspense, lazy } from 'react';
import { Navigate, Routes, Route, useParams } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Admin imports
import AdminLayout from './components/admin/AdminLayout';
import RequireAdmin from './components/admin/RequireAdmin';
import Dashboard from './pages/admin/Dashboard';
import Books from './pages/admin/Books';
import Authors from './pages/admin/Authors';
import Subjects from './pages/admin/Subjects';
import DocumentTypes from './pages/admin/DocumentTypes';
import DocumentLinkSubmissions from './pages/admin/DocumentLinkSubmissions';
import Bookshelves from './pages/admin/Bookshelves';
import Users from './pages/admin/Users';
import CommentsModeration from './pages/admin/CommentsModeration';
import BookAnalytics from './pages/admin/BookAnalytics';
import Settings from './pages/admin/Settings';

const HomePage = lazy(() => import('./pages/HomePage'));
const Read = lazy(() => import('./pages/Read'));
const BookSection = lazy(() => import('./components/BookSection'));
const BookShelf = lazy(() => import('./pages/BookShelf'));
const Profile = lazy(() => import('./pages/Profile'));
const SearchPage = lazy(() => import('./pages/SearchPage'));

const LegacyDocumentRedirect = ({ read = false }) => {
  const { id } = useParams();
  return <Navigate to={`/document/${id}${read ? '/read' : ''}`} replace />;
};

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
        <Routes>
          <Route path="/homepage/*" element={<HomePage />} />
          <Route path="*" element={<HomePage />} />
          <Route path="/document/:id/read" element={<Read />} />
          <Route path="/document/:id" element={<BookSection />} />
          <Route path="/book/:id/read" element={<LegacyDocumentRedirect read />} />
          <Route path="/book/:id" element={<LegacyDocumentRedirect />} />
          <Route path="/bookshelf" element={<BookShelf />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </Suspense>
    </div>
  )
}

function AppContent() {
  return (
    <Routes>
      <Route path='/register' element={<Register />} />
      <Route path='/login' element={<Login />} />
      {/* Admin routes */}
      <Route path='/admin' element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<Dashboard />} />
        <Route path='documents' element={<Books />} />
        <Route path='books' element={<Navigate to="/admin/documents" replace />} />
        <Route path='faculties' element={<Authors />} />
        <Route path='authors' element={<Navigate to="/admin/faculties" replace />} />
        <Route path='courses' element={<Subjects />} />
        <Route path='subjects' element={<Navigate to="/admin/courses" replace />} />
        <Route path='document-types' element={<DocumentTypes />} />
        <Route path='document-link-submissions' element={<DocumentLinkSubmissions />} />
        <Route path='bookshelves' element={<Bookshelves />} />
        <Route path='users' element={<Users />} />
        <Route path='votes' element={<CommentsModeration />} />
        <Route path='comments' element={<Navigate to="/admin/votes" replace />} />
        <Route path='analytics' element={<BookAnalytics />} />
        <Route path='settings' element={<Settings />} />
      </Route>
      <Route path='/*' element={<MainLayout />} />
    </Routes>
  )
}

function App() {
  return (
    <>
      <AppContent />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  )
}
export default App;
