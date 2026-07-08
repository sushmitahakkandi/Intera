import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button, Card, EmptyState } from '../../../../shared/components/Common';
import { FiTrash2, FiArrowRight, FiTag } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useApp();
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          title="Your Cart is Empty"
          description="Looks like you haven't added any luxury furniture to your shopping basket yet."
        />
        <div className="text-center mt-6">
          <Link to="/shop">
            <Button size="sm">Go Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'SUMMER20') {
      setDiscountPercent(20);
      setAppliedCoupon('SUMMER20');
      toast.success('Coupon SUMMER20 applied: 20% discount!');
    } else if (code === 'MHV10') {
      setDiscountPercent(10);
      setAppliedCoupon('MHV10');
      toast.success('Coupon MHV10 applied: 10% discount!');
    } else if (code === '') {
      toast.error('Please enter a coupon code.');
    } else {
      toast.error('Invalid coupon code. Try SUMMER20 or MHV10.');
    }
  };

  const discountAmount = Math.round(cartTotal * (discountPercent / 100));
  const finalTotal = cartTotal - discountAmount;

  // Total items count
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleProceedToCheckout = () => {
    // Save discount info to sessionStorage or pass it via state
    sessionStorage.setItem('checkoutDiscount', discountAmount.toString());
    sessionStorage.setItem('checkoutCoupon', appliedCoupon);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8">My Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart items list */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="flex gap-4 items-center p-4">
              <div className="w-20 h-20 bg-gray-100 rounded-large overflow-hidden flex-shrink-0 border border-gray-100">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 text-sm truncate">{item.name}</h4>
                <p className="text-xs text-gray-400 capitalize mb-1">{item.category}</p>
                <div className="text-sm font-extrabold text-gray-900">₹{item.price.toLocaleString()}</div>
              </div>
              
              {/* Quantity selectors */}
              <div className="flex items-center border border-gray-200 rounded-large overflow-hidden">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 text-xs font-bold"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold text-gray-800">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 text-xs font-bold"
                >
                  +
                </button>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => {
                  removeFromCart(item.id);
                  toast.success('Removed item from cart');
                }}
                className="p-2 text-gray-400 hover:text-danger rounded-full transition-colors"
              >
                <FiTrash2 size={16} />
              </button>
            </Card>
          ))}
        </div>

        {/* Order Summary Panel */}
        <div className="flex flex-col gap-6">
          {/* Coupon Code section */}
          <Card>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Coupon code (SUMMER20)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-large text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              </div>
              <Button type="submit" variant="outline" size="sm" className="px-4 py-2 text-xs font-bold">
                Apply
              </Button>
            </form>
            {appliedCoupon && (
              <div className="mt-2.5 flex items-center justify-between text-xs bg-primary-light text-primary px-3 py-1.5 rounded-large font-bold">
                <span>Coupon Applied: {appliedCoupon}</span>
                <button
                  onClick={() => {
                    setAppliedCoupon('');
                    setDiscountPercent(0);
                    toast.success('Coupon removed');
                  }}
                  className="hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </Card>

          <Card className="flex flex-col gap-5">
            <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-3">Order Summary</h3>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between font-semibold text-gray-500">
                <span>Subtotal</span>
                <span className="text-gray-800">₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-500">
                <span>Discount</span>
                <span className="text-green-600">-₹{discountAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-500">
                <span>Delivery Charges</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="flex justify-between font-extrabold text-gray-800 border-t border-gray-100 pt-3 text-base">
                <span>Total Price</span>
                <span className="text-primary">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <Button onClick={handleProceedToCheckout} className="w-full flex items-center justify-center gap-1.5 mt-2">
              Proceed to Checkout <FiArrowRight size={16} />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}