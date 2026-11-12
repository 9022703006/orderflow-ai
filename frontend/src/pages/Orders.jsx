import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`${API_BASE_URL}/api/orders`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userEmail");
          navigate("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data)) {
          setOrders(data);
        }
      })
      .catch((err) => console.error("Error fetching orders:", err))
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div className="page-container">
      <Navbar />

      <main className="content-container">
        <div className="page-header">
          <div>
            <h2>Orders List</h2>
            <p className="section-subtitle">Manage and track your latest incoming orders</p>
          </div>
          <div className="orders-count-badge">{orders.length} Total Orders</div>
        </div>

        <div className="card table-card">
          <div className="table-responsive">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                      Loading orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const customerName = order.customerName || order.customer || "Customer";
                    return (
                      <tr key={order.id}>
                        <td className="order-id">#{order.id}</td>
                        <td className="customer-cell">
                          <div className="avatar-placeholder">
                            {customerName.charAt(0).toUpperCase()}
                          </div>
                          <span>{customerName}</span>
                        </td>
                        <td>{order.product}</td>
                        <td>{order.quantity}</td>
                        <td className="amount-cell">
                          ₹{(order.total || 0).toLocaleString("en-IN")}
                        </td>
                        <td>
                          <span
                            className={`status-badge status-${(order.status || "pending").toLowerCase()}`}
                          >
                            {order.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Orders;
