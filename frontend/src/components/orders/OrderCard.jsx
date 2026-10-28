'use client';
import Link from 'next/link';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { ORDER_STATUS, PAYMENT_STATUS } from '../../utils/constants';

const statusColors = {
  'sent': '#10b981',
  'not sent': '#f59e0b',
  'paid': '#10b981',
  'not paid': '#ef4444'
};

export default function OrderCard({ order }) {
  return (
    <div className="card border-0 rounded-3 mb-3" style={{ background: 'var(--bs)' }}>
      <div className="card-body">
        <div className="row g-3 align-items-center">
          <div className="col-md-3">
            <small style={{ color: '#71717a' }}>Order #</small>
            <p className="fw-bold mb-0" style={{ color: '#fff' }}>{order.orderNumber || order._id?.slice(-8).toUpperCase()}</p>
          </div>
          <div className="col-md-2">
            <small style={{ color: '#71717a' }}>Date</small>
            <p className="mb-0" style={{ color: 'var(--tp)' }}>{formatDate(order.createdAt)}</p>
          </div>
          <div className="col-md-2">
            <small style={{ color: '#71717a' }}>Order Status</small>
            <p className="mb-0">
              <span className="badge rounded-pill fw-normal px-3 py-2" style={{
                background: `${statusColors[order.orderStatus] || '#71717a'}20`,
                color: statusColors[order.orderStatus] || '#71717a',
                border: `1px solid ${statusColors[order.orderStatus] || '#71717a'}`
              }}>
                {ORDER_STATUS.includes(order.orderStatus) ? order.orderStatus : order.orderStatus || 'pending'}
              </span>
            </p>
          </div>
          <div className="col-md-2">
            <small style={{ color: '#71717a' }}>Payment</small>
            <p className="mb-0">
              <span className="badge rounded-pill fw-normal px-3 py-2" style={{
                background: `${statusColors[order.paymentStatus] || '#71717a'}20`,
                color: statusColors[order.paymentStatus] || '#71717a',
                border: `1px solid ${statusColors[order.paymentStatus] || '#71717a'}`
              }}>
                {PAYMENT_STATUS.includes(order.paymentStatus) ? order.paymentStatus : order.paymentStatus || 'pending'}
              </span>
            </p>
          </div>
          <div className="col-md-1">
            <small style={{ color: '#71717a' }}>Items</small>
            <p className="mb-0 fw-medium" style={{ color: '#fff' }}>{order.items?.length || 0}</p>
          </div>
          <div className="col-md-1">
            <small style={{ color: '#71717a' }}>Total</small>
            <p className="mb-0 fw-bold" style={{ color: 'var(--ap)' }}>{formatCurrency(order.totalAmount || order.total || 0)}</p>
          </div>
          <div className="col-md-1">
            <Link
              href={`/orders/${order._id}`}
              className="btn fw-semibold py-2 px-3"
              style={{ border: '1px solid var(--ap)', color: 'var(--ap)', background: 'transparent', fontSize: '0.85rem' }}
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
