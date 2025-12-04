import React from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./utils/ProtectedRoute";

import NotFoundPage from "./components/NotFound";
import UnauthorizedPage from "./components/Unauthorized";

import LoginPage from "./pages/logAndReg/LoginPage";
import RegisterPage from "./pages/logAndReg/RegisterPage";
import EditProfilePage from "./pages/EditProfilePage";

import AdminPage from "./pages/main/AdminHome";
import ManagerPage from "./pages/main/ManagerHome";
import HomePage from "./pages/main/PublicHome";

import DictionaryManagementPage from "./pages/admin/DictionaryManagementPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import UserEditPage from "./pages/admin/UserEditPage";
import ClientManagementPage from "./pages/manager/ClientManagementPage";
import ProductManagementPage from "./pages/admin/ProductManagementPage";
import ProductFormPage from "./pages/admin/ProductFormPage";
import CategoryAttributePage from "./pages/admin/CategoryAttributePage";
import InventoryMovementPage from "./pages/admin/InventoryMovementPage";
import OrderManagementPage from "./pages/admin/OrderManagementPage";
import SalesDetails from "./pages/admin/statistics/SalesDetails";
import OrdersDetails from "./pages/admin/statistics/OrdersDetails";
import ProductsDetails from "./pages/admin/statistics/ProductsDetails";
import ManagerDetails from "./pages/admin/statistics/ManagerDetails";
import ProductSeasonalityDetails from "./pages/admin/statistics/ProductSeasonalityDetails";
import CategorySalesDetails from "./pages/admin/statistics/CategorySalesDetails";

import ManagerProductsDetails from "./pages/manager/statistics/ManagerProductsDetails";
import ManagerSalesDetails from "./pages/manager/statistics/ManagerSalesDetails";
import ManagerClientsDetails from "./pages/manager/statistics/ManagerClientsDetails";
import ManagerProductSeasonalityDetails from "./pages/manager/statistics/ManagerProductSeasonalityDetails";
import ManagerCategorySalesDetails from "./pages/manager/statistics/ManagerCategorySalesDetails";

import ClientProfilePage from "./pages/client/ClientProfilePage";
import CartPage from "./pages/client/CartPage";
import OrdersPage from "./pages/client/OrdersPage";

import ProductDetailPage from "./pages/ProductsAndCatalogs/ProductDetailPage";
import ProductCatalogPage from "./pages/ProductsAndCatalogs/ProductCatalogPage";
import InventoryMovementTrendsDetails from "./pages/admin/statistics/InventoryMovementTrendsDetails";
import InventoryMovementDetails from "./pages/admin/statistics/InventoryMovementDetails";
import AvgCheckDetails from "./pages/admin/statistics/AvgCheckDetails";
import AvgCheckClientDetails from "./pages/admin/statistics/AvgCheckClientDetails";


function App() {
    return (
        <Router>
            <div className="d-flex flex-column min-vh-100">
                <Navbar/>
                <div className="flex-grow-1">
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/register" element={<RegisterPage/>}/>
                        <Route path="/notfound" element={<NotFoundPage/>}/>
                        <Route path="/unauthorized" element={<UnauthorizedPage/>}/>

                        <Route
                            path="/profile/edit"
                            element={
                                <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "CLIENT"]}>
                                    <EditProfilePage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/client/profile"
                            element={
                                <ProtectedRoute allowedRoles={['CLIENT']}>
                                    <ClientProfilePage/>
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/catalog" element={<ProductCatalogPage/>}/>
                        <Route path="/catalog/:id" element={<ProductDetailPage/>}/>

                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute allowedRoles={["ADMIN"]}>
                                    <AdminPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/dictionaries"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <DictionaryManagementPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/users"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <UserManagementPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/admin/users/:id" element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <UserEditPage/>
                            </ProtectedRoute>
                        }
                        />
                        <Route
                            path="/admin/clients"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <ClientManagementPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/product-attributes"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <CategoryAttributePage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/products"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <ProductManagementPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/products/:id"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <ProductFormPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/products/create"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <ProductFormPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/orders/management"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                                    <OrderManagementPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/inventory-movement"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <InventoryMovementPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/statistics/sales"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <SalesDetails/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/statistics/orders"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <OrdersDetails/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/statistics/products"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <ProductsDetails/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/statistics/managers"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <ManagerDetails/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/statistics/product/:id/seasonality"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <ProductSeasonalityDetails/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/statistics/categories"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <CategorySalesDetails/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/statistics/inventory-trends"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <InventoryMovementTrendsDetails />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/statistics/inventory-movement-details"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <InventoryMovementDetails />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/statistics/avg-check"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <AvgCheckDetails />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/statistics/avg-check/:clientId"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <AvgCheckClientDetails />
                                </ProtectedRoute>
                            }
                        />




                        <Route
                            path="/manager"
                            element={
                                <ProtectedRoute allowedRoles={["MANAGER"]}>
                                    <ManagerPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager/clients"
                            element={
                                <ProtectedRoute allowedRoles={['MANAGER']}>
                                    <ClientManagementPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager/product-attributes"
                            element={
                                <ProtectedRoute allowedRoles={['MANAGER']}>
                                    <CategoryAttributePage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager/products"
                            element={
                                <ProtectedRoute allowedRoles={['MANAGER']}>
                                    <ProductManagementPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager/products/:id"
                            element={
                                <ProtectedRoute allowedRoles={['MANAGER']}>
                                    <ProductFormPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager/products/create"
                            element={
                                <ProtectedRoute allowedRoles={['MANAGER']}>
                                    <ProductFormPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager/inventory-movement"
                            element={
                                <ProtectedRoute allowedRoles={['MANAGER']}>
                                    <InventoryMovementPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager/statistics/sales"
                            element={
                                <ProtectedRoute allowedRoles={['MANAGER']}>
                                    <ManagerSalesDetails/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager/statistics/clients"
                            element={
                                <ProtectedRoute allowedRoles={['MANAGER']}>
                                    <ManagerClientsDetails/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager/statistics/products"
                            element={
                                <ProtectedRoute allowedRoles={['MANAGER']}>
                                    <ManagerProductsDetails/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager/statistics/product/:id/seasonality"
                            element={
                                <ProtectedRoute allowedRoles={['MANAGER']}>
                                    <ManagerProductSeasonalityDetails/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager/statistics/categories"
                            element={
                                <ProtectedRoute allowedRoles={['MANAGER']}>
                                    <ManagerCategorySalesDetails/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager/statistics/inventory-trends"
                            element={
                                <ProtectedRoute allowedRoles={['MANAGER']}>
                                    <InventoryMovementTrendsDetails isManager />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager/statistics/avg-check"
                            element={
                                <ProtectedRoute allowedRoles={['MANAGER']}>
                                    <AvgCheckDetails isManager />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager/statistics/avg-check/:clientId"
                            element={
                                <ProtectedRoute allowedRoles={['MANAGER']}>
                                    <AvgCheckClientDetails/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager/statistics/inventory-movement-details"
                            element={
                                <ProtectedRoute allowedRoles={['MANAGER']}>
                                    <InventoryMovementDetails />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/client/cart"
                            element={
                                <ProtectedRoute allowedRoles={['CLIENT']}>
                                    <CartPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/client/orders"
                            element={
                                <ProtectedRoute allowedRoles={['CLIENT']}>
                                    <OrdersPage/>
                                </ProtectedRoute>
                            }
                        />

                    </Routes>
                </div>
                <Footer/>
            </div>
        </Router>
    );
}

export default App;
