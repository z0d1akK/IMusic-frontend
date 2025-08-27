import React from "react";
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
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
import ClientPage from "./pages/main/ClientHome";
import HomePage from "./pages/main/PublicHome";

import DictionaryManagementPage from "./pages/admin/DictionaryManagementPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import UserEditPage from "./pages/admin/UserEditPage";
import ClientManagementPage from "./pages/manager/ClientManagementPage";
import ClientProfilePage from "./pages/client/ClientProfilePage";


function App() {
    return (
        <Router>
            <div className="d-flex flex-column min-vh-100">
                <Navbar />
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
                                    <ClientProfilePage />
                                </ProtectedRoute>
                            }
                        />

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
                                    <DictionaryManagementPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/users"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <UserManagementPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/admin/users/:id" element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <UserEditPage />
                            </ProtectedRoute>
                        }
                        />
                        <Route
                            path="/admin/clients"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <ClientManagementPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/manager/*"
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
                                    <ClientManagementPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/client/*"
                            element={
                                <ProtectedRoute allowedRoles={["CLIENT"]}>
                                    <ClientPage/>
                                </ProtectedRoute>
                            }
                        />

                        {/*<Route path="*" element={<Navigate to="/notfound" replace/>}/>*/}
                    </Routes>
                </div>
                <Footer/>
            </div>
        </Router>
    );
}

export default App;
