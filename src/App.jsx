import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/App.css'
import { BasePageLayout } from './pages/layouts/BasePageLayout'
import { Register } from "./pages/Register";

function App() {
  // Simple placeholder for HomePage
  const HomePage = () => {
    return (
      <div className="home-content">
        <h1>Welcome to Timeless</h1>
        <p className="tagline">Premium luxury watches for any occasion</p>
        <div className="home-cta">
          <a href="/catalog" className="btn">Browse Our Collection</a>
        </div>
      </div>
    )
  }
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BasePageLayout />}>
          {/* Public routes */}
          <Route index element={<HomePage />} />
          <Route path="catalog" element={<div>Catalog Page (Placeholder)</div>} />
          <Route path="about" element={<div>About Page (Placeholder)</div>} />
          <Route path="contact" element={<div>Contact Page (Placeholder)</div>} />
          <Route path="login" element={<div>Login Page (Placeholder)</div>} />
          <Route path="/register" element={<Register />} /> 
          
          {/* Not found */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App