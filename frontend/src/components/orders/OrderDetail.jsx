'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate, formatCurrency, getImageUrl } from '../../utils/helpers';
import { ORDER_STATUS, PAYMENT_STATUS } from '../../utils/constants';

const statusColors = {
  'sent': '#10b981',
  'not sent': '#f59e0b',
  'paid': '#10b981',
  'not paid': '#ef4444'
};

export default function OrderDetail({ order }) {
  if (!order) {
    return (
      <div className="text-center py-5" style={{ background: 'var(--bp)', minHeight: '60vh' }}>
        <h3 style={{ color: '#fff' }}>Order not found</h3>
        <Link href="/orders" className="btn mt-3" style={{ border: '1px solid var(--ap)', color: 'var(--ap)' }}>Back to Orders</Link>
      </div>
    );
  }

  const items = order.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const total = order.totalAmount || order.total || subtotal;

  return (
    <section style={{ background: 'var(--bp)', minHeight: '80vh' }}>
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 rounded-3 p-4 mb-4" style={{ background: 'var(--bs)' }}>
              <div className="d-flex justify-content-between align-items-start flex-wrap mb-3">
                <div>
                  <small style={{ color: '#71717a' }}>Order Number</small>
                  <h4 className="fw-bold mb-1" style={{ color: '#fff' }}>{order.orderNumber || order._id?.slice(-8).toUpperCase()}</h4>
                  <small style={{ color: '#71717a' }}>Placed on {formatDate(order.createdAt)}</small>
                </div>
                <div className="d-flex gap-2">
                  <span className="badge rounded-pill fw-normal px-3 py-2" style={{
                    background: `${statusColors[order.orderStatus] || '#71717a'}20`,
                    color: statusColors[order.orderStatus] || '#71717a',
                    border: `1px solid ${statusColors[order.orderStatus] || '#71717a'}`
                  }}>
                    {ORDER_STATUS.includes(order.orderStatus) ? order.orderStatus : order.orderStatus || 'pending'}
                  </span>
                  <span className="badge rounded-pill fw-normal px-3 py-2" style={{
                    background: `${statusColors[order.paymentStatus] || '#71717a'}20`,
                    color: statusColors[order.paymentStatus] || '#71717a',
                    border: `1px solid ${statusColors[order.paymentStatus] || '#71717a'}`
                  }}>
                    {PAYMENT_STATUS.includes(order.paymentStatus) ? order.paymentStatus : order.paymentStatus || 'pending'}
                  </span>
                </div>
              </div>

              {order.paymentStatus === 'not paid' && (
                <button className="btn fw-semibold py-2 px-4" style={{ background: 'linear-gradient(135deg, var(--ap), #2563eb)', color: '#fff', border: 'none' }}>
                  Pay Now
                </button>
              )}
            </div>

            <div className="card border-0 rounded-3 p-4 mb-4" style={{ background: 'var(--bs)' }}>
              <h5 className="fw-bold mb-3" style={{ color: '#fff' }}>Order Items ({items.length})</h5>
              {items.map((item, i) => {
                const populatedItem = item.item && typeof item.item === 'object' ? item.item : null;
                const imgSrc = getImageUrl(
                  populatedItem?.pictures?.find(p => p && (p.startsWith('http://') || p.startsWith('https://'))) ||
                  populatedItem?.pictures?.[0] || '/next.svg'
                );
                const title = populatedItem?.title || item.title || 'Item';
                const slug = populatedItem?.slug || item.slug;
                const itemType = item.itemType || item.type;
                const linkHref = slug ? `/${itemType === 'services' ? 'services' : 'projects'}/${slug}` : '#';

                return (
                  <div key={item._id || i} className="d-flex align-items-center gap-3 py-3 border-bottom border-secondary border-opacity-25">
                    <img src={imgSrc} alt={title} className="rounded-2" style={{ width: '70px', height: '70px', objectFit: 'cover' }} />
                    <div className="flex-grow-1">
                      <Link href={linkHref} className="fw-medium text-decoration-none" style={{ color: '#fff' }}>
                        {title}
                      </Link>
                      <div className="d-flex gap-2 mt-1">
                        <span style={{ color: 'var(--ts)', fontSize: '0.85rem' }}>Qty: {item.quantity || 1}</span>
                        <span className="fw-medium" style={{ color: 'var(--ap)' }}>{formatCurrency(item.price || 0)}</span>
                      </div>
                    </div>
                    <span className="fw-bold" style={{ color: '#fff' }}>{formatCurrency((item.price || 0) * (item.quantity || 1))}</span>
                  </div>
                );
              })}
            </div>

            {order.trackingInfo && (
              <div className="card border-0 rounded-3 p-4" style={{ background: 'var(--bs)' }}>
                <h5 className="fw-bold mb-3" style={{ color: '#fff' }}>Tracking Information</h5>
                {order.trackingInfo.trackingNumber && (
                  <div className="mb-2">
                    <small style={{ color: '#71717a' }}>Tracking Number</small>
                    <p className="fw-medium mb-0" style={{ color: 'var(--tp)' }}>{order.trackingInfo.trackingNumber}</p>
                  </div>
                )}
                {order.trackingInfo.carrier && (
                  <div className="mb-2">
                    <small style={{ color: '#71717a' }}>Carrier</small>
                    <p className="fw-medium mb-0" style={{ color: 'var(--tp)' }}>{order.trackingInfo.carrier}</p>
                  </div>
                )}
                {order.trackingInfo.estimatedDelivery && (
                  <div className="mb-2">
                    <small style={{ color: '#71717a' }}>Estimated Delivery</small>
                    <p className="fw-medium mb-0" style={{ color: 'var(--tp)' }}>{formatDate(order.trackingInfo.estimatedDelivery)}</p>
                  </div>
                )}
                {order.trackingInfo.status && (
                  <div>
                    <small style={{ color: '#71717a' }}>Status</small>
                    <p className="mb-0">
                      <span className="badge rounded-pill fw-normal px-3 py-2" style={{ background: '#2563eb20', color: '#2563eb', border: '1px solid #2563eb' }}>
                        {order.trackingInfo.status}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="col-lg-4">
            <div className="card border-0 rounded-3 p-4 sticky-top" style={{ background: 'var(--bs)', top: '2rem' }}>
              <h5 className="fw-bold mb-3" style={{ color: '#fff' }}>Order Summary</h5>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: 'var(--ts)' }}>Subtotal</span>
                <span style={{ color: '#fff' }}>{formatCurrency(subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ color: '#10b981' }}>Discount</span>
                  <span style={{ color: '#10b981' }}>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <hr style={{ borderColor: 'var(--bdr)' }} />
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-bold fs-5" style={{ color: '#fff' }}>Total</span>
                <span className="fw-bold fs-5" style={{ color: 'var(--ap)' }}>{formatCurrency(total)}</span>
              </div>
              <Link href="/orders" className="btn w-100 fw-semibold py-2" style={{ border: '1px solid var(--ap)', color: 'var(--ap)', background: 'transparent' }}>
                &larr; Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
