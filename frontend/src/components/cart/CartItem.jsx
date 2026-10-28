'use client';
import { useDispatch } from 'react-redux';
import { removeFromCartAPI, updateCartQuantityAPI } from '../../redux/slices/cartSlice';
import { getImageUrl, formatCurrency } from '../../utils/helpers';

export default function CartItem({ item }) {
  const dispatch = useDispatch();
  const itemId = item.item?._id || item._id;

  const handleQuantityChange = (newQty) => {
    if (newQty < 1) return;
    dispatch(updateCartQuantityAPI({ id: itemId, quantity: newQty }));
  };

  return (
    <div className="card border-0 rounded-3 mb-3" style={{ background: 'var(--bs)' }}>
      <div className="card-body">
        <div className="row g-3 align-items-center">
          <div className="col-md-2 col-4">
            <img
              src={getImageUrl(item.item?.pictures?.find(p => p && (p.startsWith('http://') || p.startsWith('https://'))) || item.item?.pictures?.[0] || item.images?.[0] || item.image)}
              alt={item.item?.title || item.title}
              className="w-100 rounded-2"
              style={{ height: '80px', objectFit: 'cover' }}
            />
          </div>
          <div className="col-md-3 col-8">
            <h6 className="fw-bold mb-1" style={{ color: '#fff' }}>{item.item?.title || item.title}</h6>
            <span className="badge rounded-pill fw-normal" style={{ background: '#7c3aed20', color: 'var(--ap)', border: '1px solid var(--ap)', fontSize: '0.75rem' }}>
              {item.itemType || item.type || 'item'}
            </span>
          </div>
          <div className="col-md-3 col-6">
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className="btn btn-sm fw-bold"
                style={{ border: '1px solid var(--bdr)', color: '#fff', background: 'var(--bt)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                &minus;
              </button>
              <span className="fw-medium" style={{ color: '#fff', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                className="btn btn-sm fw-bold"
                style={{ border: '1px solid var(--bdr)', color: '#fff', background: 'var(--bt)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                +
              </button>
            </div>
          </div>
          <div className="col-md-2 col-4">
            <span className="fw-bold fs-5" style={{ color: 'var(--ap)' }}>
              {formatCurrency((item.item?.price || item.price || 0) * item.quantity)}
            </span>
          </div>
          <div className="col-md-2 col-2 text-end">
            <button
              onClick={() => dispatch(removeFromCartAPI(itemId))}
              className="btn btn-sm"
              style={{ color: '#ef4444', border: '1px solid #ef4444', background: 'transparent' }}
            >
              &times;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
