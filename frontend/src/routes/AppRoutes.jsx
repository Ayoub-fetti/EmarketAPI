import { Routes, Route } from 'react-router-dom'
import Layout from '../components/Layout'
import Home from '../pages/Home'
import Products from '../pages/Products'
import Login from '../pages/Login'
import Register from '../pages/Register' 
import { Details } from '../pages/Details'
import ProtectedRoute from '../components/ProtectedRoute'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
      {/* public routes */}
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<Details />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        {/* private route */}
      <Route path='#' element={<ProtectedRoute>#</ProtectedRoute>}/>
      </Route>
    </Routes>
  )
}
