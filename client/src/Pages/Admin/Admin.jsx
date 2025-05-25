import React, { useEffect, useState } from "react";
import { Tabs, notification, Button, Dropdown } from "antd";
import {
  DashboardOutlined,
  ToolOutlined,
  TeamOutlined,
  MessageOutlined,
  LogoutOutlined,
  BellOutlined,
  LockOutlined,
  MailOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import AdminDashboard from "./AdminDashboard";
import AdminServices from "./AdminServices";
import UserCallRequest from "./UserCallRequest";
import ManageEmployee from "./ManageEmployee";
import ActiveServices from "./ActiveServices";


const Admin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const [api, contextHolder] = notification.useNotification();



  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://fixease.onrender.com/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.jwtToken) {
        localStorage.setItem("token", data.jwtToken);
        setIsLoggedIn(true);
        api.success({
          message: "Login Successful",
          description: "You have been logged in successfully.",
          placement: "bottomRight",
        });
      } else {
        throw new Error("No token received");
      }
    } catch (err) {
      setError(err.message || "Failed to login. Please try again.");
      api.error({
        message: "Login Failed",
        description: err.message || "Failed to login. Please try again.",
        placement: "bottomRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    api.success({
      message: "Logged out successfully",
      placement: "bottomRight",
    });
  };

  const userMenuItems = [
    {
      key: 'logout',
      label: (
        <div onClick={handleLogout} className="flex items-center space-x-2">
          <LogoutOutlined />
          <span>Logout</span>
        </div>
      ),
    },
  ];

  const tabItems = [
    {
      key: "1",
      label: (
        <div className="flex items-center space-x-2">
          <DashboardOutlined className="text-lg" />
          <span>Dashboard</span>
        </div>
      ),
      children: <AdminDashboard />,
    },
    {
      key: "2",
      label: (
        <div className="flex items-center space-x-2">
          <ToolOutlined className="text-lg" />
          <span>All Services</span>
        </div>
      ),
      children: <AdminServices />,
    },
    {
      key: "3",
      label: (
        <div className="flex items-center space-x-2">
          <CheckCircleOutlined className="text-lg" />
          <span>Active Services</span>
        </div>
      ),
      children: <ActiveServices />,
    },
    {
      key: "4",
      label: (
        <div className="flex items-center space-x-2">
          <TeamOutlined className="text-lg" />
          <span>Employees</span>
        </div>
      ),
      children: <ManageEmployee />,
    },
    {
      key: "5",
      label: (
        <div className="flex items-center space-x-2">
          <MessageOutlined className="text-lg" />
          <span>Query Request</span>
        </div>
      ),
      children: <UserCallRequest />,
    },
   
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        {contextHolder}
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
              <h1 className="text-3xl font-bold text-white">FixEase Admin</h1>
            </div>
            <form onSubmit={handleLogin} className="p-8 space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailOutlined className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 sm:text-sm border-gray-300 rounded-md border"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockOutlined className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 sm:text-sm border-gray-300 rounded-md border"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ${loading ? 'opacity-75' : ''}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="bg-white shadow-lg rounded-b-xl -mt-16">
        <div className="flex gap-10 items-center p-5 justify-between">
          <div className="flex gap-10 items-center">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-800">
              FixEase Admin
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
              <div className="flex items-center space-x-2 cursor-pointer group">
                <div className="relative">
                  <div className="w-18 h-18 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    A
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </div>
        <div className="h-[2px] bg-gradient-to-r from-transparent via-blue-300 to-transparent mx-10 sm:mx-5" />
      </div>

      <div className="container">
        <div className="overflow-hidden">
          <Tabs
            defaultActiveKey="1"
            tabPosition="left"
            items={tabItems}
            className="admin-tabs"
            tabBarStyle={{
              padding: "20px 0",
              background: "linear-gradient(to bottom, #f8fafc, #f1f5f9)",
              borderRight: "1px solid #e2e8f0",
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Admin;