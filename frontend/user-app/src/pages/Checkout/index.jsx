import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button, Card, Input, Stepper } from '../../../../shared/components/Common';
import { toast } from 'react-hot-toast';
import { FiMapPin, FiCreditCard, FiSmartphone, FiDollarSign } from 'react-icons/fi';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: Address, 1: Payment, 2: Review

  // Retrieve discount details from sessionStorage (if any)
  const [discount, setDiscount] = useState(0);
  useEffect(() => {
    const savedDiscount = sessionStorage.getItem('checkoutDiscount');
    if (savedDiscount) {
      setDiscount(parseInt(savedDiscount));
    }
  }, []);

  const [address, setAddress] = useState({
    name: 'Basavaraj H G',
    phone: '9741212888',
    street: 'Davangere Main Road',
    city: 'Davanagere',
    state: 'Karnataka',
    pincode: '577004'
  });

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const handlePlaceOrder = () => {
    toast.success('Order Placed Successfully!');
    clearCart();
    sessionStorage.removeItem('checkoutDiscount');
    sessionStorage.removeItem('checkoutCoupon');
    navigate('/order-tracking?orderId=MHV123456');
  };

  const steps = ['Address', 'Payment', 'Order Review'];
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const finalTotal = cartTotal - discount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Checkout</h1>

      {/* Stepper Component */}
      <div className="mb-10 bg-white border border-gray-100 py-3 rounded-large shadow-sm">
        <Stepper steps={steps} currentStep={step} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side forms */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {step === 0 && (
            <Card className="flex flex-col gap-5">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                  <FiMapPin className="text-primary" /> Delivery Address
                </h3>
                <button
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  {isEditingAddress ? 'Cancel' : 'Change'}
                </button>
              </div>

              {!isEditingAddress ? (
                <div className="text-sm text-gray-600 leading-relaxed font-medium">
                  <p className="font-bold text-gray-800 text-base mb-1">{address.name}</p>
                  <p>{address.street}</p>
                  <p>{address.city}, {address.state} - {address.pincode}</p>
                  <p className="mt-2 text-xs text-gray-400">Phone: {address.phone}</p>
                  <Button onClick={() => setStep(1)} className="mt-6 w-full sm:w-auto">
                    Continue to Payment
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setIsEditingAddress(false);
                  }}
                  className="flex flex-col gap-2"
                >
                  <Input
                    label="Full Name"
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Phone Number"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    required
                  />
                  <Input
                    label="Street Details"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    required
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Input
                        label="City"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        required
                      />
                    </div>
                    <Input
                      label="Pincode"
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="mt-4">
                    Save Address
                  </Button>
                </form>
              )}
            </Card>
          )}

          {step === 1 && (
            <Card className="flex flex-col gap-5">
              <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-3 flex items-center gap-2">
                <FiCreditCard className="text-primary" /> Choose Payment Method
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-large transition-all cursor-pointer ${
                    paymentMethod === 'UPI' ? 'border-primary bg-primary-light text-primary shadow-sm' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <FiSmartphone size={24} className="mb-2" />
                  <span className="text-xs font-bold">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-large transition-all cursor-pointer ${
                    paymentMethod === 'Card' ? 'border-primary bg-primary-light text-primary shadow-sm' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <FiCreditCard size={24} className="mb-2" />
                  <span className="text-xs font-bold">Credit/Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('NetBanking')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-large transition-all cursor-pointer ${
                    paymentMethod === 'NetBanking' ? 'border-primary bg-primary-light text-primary shadow-sm' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <FiCreditCard size={24} className="mb-2" />
                  <span className="text-xs font-bold">Net Banking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-large transition-all cursor-pointer ${
                    paymentMethod === 'COD' ? 'border-primary bg-primary-light text-primary shadow-sm' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <FiDollarSign size={24} className="mb-2" />
                  <span className="text-xs font-bold">Cash on Delivery</span>
                </button>
              </div>

              {paymentMethod === 'UPI' && (
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-large">
                  <Input label="Enter UPI ID" placeholder="e.g. user@okaxis" />
                </div>
              )}

              {paymentMethod === 'Card' && (
                <div className="flex flex-col gap-3 p-4 bg-gray-50 border border-gray-100 rounded-large">
                  <Input label="Card Number" placeholder="e.g. 4321 8765 9012 3456" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Expiry Date" placeholder="MM/YY" />
                    <Input label="CVV" placeholder="•••" type="password" />
                  </div>
                </div>
              )}

              <div className="flex justify-between gap-4 mt-4 border-t border-gray-100 pt-4">
                <Button variant="ghost" onClick={() => setStep(0)}>
                  Go Back
                </Button>
                <Button onClick={() => setStep(2)}>
                  Continue to Review
                </Button>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="flex flex-col gap-5">
              <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-3">
                Review Your Order
              </h3>
              
              <div className="text-sm text-gray-650 leading-relaxed font-medium">
                <div className="mb-4">
                  <p className="font-bold text-gray-800 mb-1">Shipping Details:</p>
                  <p>{address.name} — {address.street}, {address.city}, {address.state}</p>
                </div>
                <div className="mb-4">
                  <p className="font-bold text-gray-800 mb-1">Payment Method:</p>
                  <p className="uppercase">{paymentMethod}</p>
                </div>
                <p className="text-xs text-gray-400">Please review the details above. Click "Place Order" to finalize your furniture reservation.</p>
              </div>

              <div className="flex justify-between gap-4 mt-4 border-t border-gray-100 pt-4">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Go Back
                </Button>
                <Button onClick={handlePlaceOrder}>
                  Place Order
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Right Side Order Summary */}
        <Card className="flex flex-col gap-5">
          <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-3">Order Summary</h3>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between font-semibold text-gray-500">
              <span>Items ({totalItems})</span>
              <span className="text-gray-850">₹{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-500">
              <span>Discount</span>
              <span className="text-green-600">-₹{discount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-500">
              <span>Delivery</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between font-extrabold text-gray-800 border-t border-gray-100 pt-3 text-base">
              <span>Total Price</span>
              <span className="text-primary">₹{finalTotal.toLocaleString()}</span>
            </div>
          </div>

          {step < 2 && (
            <Button
              onClick={() => {
                if (step === 0) setStep(1);
                else setStep(2);
              }}
              className="w-full flex items-center justify-center gap-1.5"
            >
              Continue Process
            </Button>
          )}
          {step === 2 && (
            <Button onClick={handlePlaceOrder} className="w-full bg-secondary hover:bg-secondary-hover text-white">
              Place Order
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}