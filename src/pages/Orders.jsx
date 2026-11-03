import React from "react";
import Navbar from "../components/Navbar";

function Orders() {
  const orders = [
    {
      id: 1,
      customer: "Rahul",
      product: "Tractor",
      quantity: 2,
      total: 900000,
      status: "Completed"
    },
    {
      id: 2,
      customer: "Amit",
      product: "Tractor",
      quantity: 1,
      total: 450000,
      status: "Pending"
    }
  ];

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
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="order-id">#{order.id}</td>
                    <td className="customer-cell">
                      <div className="avatar-placeholder">{order.customer[0]}</div>
                      <span>{order.customer}</span>
                    </td>
                    <td>{order.product}</td>
                    <td>{order.quantity}</td>
                    <td className="amount-cell">₹{order.total.toLocaleString("en-IN")}</td>
                    <td>
                      <span className={`status-badge status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Orders;
