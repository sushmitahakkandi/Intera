import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Input, Modal } from '../../../../shared/components/Common';
import { toast } from 'react-hot-toast';
import { FiUser, FiMapPin, FiCreditCard, FiBell, FiPlus, FiTrash2, FiCheckCircle } from 'react-icons/fi';

export default function UserProfile() {
  const { user, setUser } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Basavaraj H G',
    phone: '9741212888',
    email: user?.email || 'basavaraj@gmail.com'
  });

  // Addresses Mock state
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: 'Basavaraj H G',
      phone: '9741212888',
      street: 'Davangere Main Road',
      city: 'Davanagere',
      state: 'Karnataka',
      pincode: '577004',
      isDefault: true
    }
  ]);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Payments Mock State
  const [payments, setPayments] = useState([
    { id: 1, type: 'UPI', provider: 'GPay', identifier: 'basavaraj@okaxis', label: 'basavaraj@okaxis' }
  ]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    type: 'Card',
    number: '',
    name: '',
    expiry: ''
  });

  // Notifications Mock State
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    aiVisuals: true,
    newsletter: false
  });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) { toast.error('Full name is required'); return; }
    if (!profileForm.email.trim()) { toast.error('Email address is required'); return; }
    if (!/\S+@\S+\.\S+/.test(profileForm.email)) { toast.error('Enter a valid email address'); return; }
    if (!profileForm.phone.trim()) { toast.error('Phone number is required'); return; }
    if (!/^\d{10}$/.test(profileForm.phone.replace(/[-+ ]/g, ''))) { toast.error('Phone must be 10 digits'); return; }
    setUser({ ...user, name: profileForm.name, email: profileForm.email });
    toast.success('Profile details updated!');
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!addressForm.name.trim()) { toast.error('Name / label is required'); return; }
    if (!addressForm.phone.trim()) { toast.error('Phone number is required'); return; }
    if (!/^\d{10}$/.test(addressForm.phone.replace(/[-+ ]/g, ''))) { toast.error('Phone must be 10 digits'); return; }
    if (!addressForm.street.trim()) { toast.error('Street address is required'); return; }
    if (!addressForm.city.trim()) { toast.error('City is required'); return; }
    if (!addressForm.state.trim()) { toast.error('State is required'); return; }
    if (!addressForm.pincode.trim()) { toast.error('Pincode is required'); return; }
    if (!/^\d{6}$/.test(addressForm.pincode)) { toast.error('Pincode must be 6 digits'); return; }
    const newAddress = {
      ...addressForm,
      id: Date.now(),
      isDefault: addresses.length === 0
    };
    setAddresses([...addresses, newAddress]);
    setAddressModalOpen(false);
    setAddressForm({ name: '', phone: '', street: '', city: '', state: '', pincode: '' });
    toast.success('New delivery address added!');
  };

  const handleDeleteAddress = (id) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
    toast.success('Address removed');
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (paymentForm.type === 'Card') {
      if (!paymentForm.name.trim()) { toast.error('Cardholder name is required'); return; }
      if (!paymentForm.number.trim()) { toast.error('Card number is required'); return; }
      if (paymentForm.number.replace(/\s/g, '').length < 16) { toast.error('Enter a valid 16-digit card number'); return; }
      if (!paymentForm.expiry.trim()) { toast.error('Expiry date is required'); return; }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentForm.expiry)) { toast.error('Expiry must be in MM/YY format'); return; }
    } else {
      if (!paymentForm.number.trim()) { toast.error('UPI ID is required'); return; }
      if (!paymentForm.number.includes('@')) { toast.error('Enter a valid UPI ID (e.g. user@okaxis)'); return; }
    }
    const newPayment = {
      id: Date.now(),
      type: paymentForm.type,
      provider: paymentForm.type === 'Card' ? 'Visa' : 'UPI',
      identifier: paymentForm.type === 'Card' ? `•••• •••• •••• ${paymentForm.number.slice(-4)}` : paymentForm.number,
      label: paymentForm.type === 'Card' ? paymentForm.name : 'UPI Link'
    };
    setPayments([...payments, newPayment]);
    setPaymentModalOpen(false);
    setPaymentForm({ type: 'Card', number: '', name: '', expiry: '' });
    toast.success('New payment method linked!');
  };

  const handleDeletePayment = (id) => {
    setPayments(payments.filter((p) => p.id !== id));
    toast.success('Payment method unlinked');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences updated!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <Card className="md:col-span-1 p-4 flex flex-col gap-2 h-fit bg-white">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left text-xs py-3 px-4 rounded-large font-bold flex items-center gap-2.5 transition-all ${
              activeTab === 'profile' ? 'bg-primary-light text-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FiUser size={16} /> Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('address')}
            className={`w-full text-left text-xs py-3 px-4 rounded-large font-bold flex items-center gap-2.5 transition-all ${
              activeTab === 'address' ? 'bg-primary-light text-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FiMapPin size={16} /> Saved Addresses
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full text-left text-xs py-3 px-4 rounded-large font-bold flex items-center gap-2.5 transition-all ${
              activeTab === 'payments' ? 'bg-primary-light text-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FiCreditCard size={16} /> Payment Methods
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left text-xs py-3 px-4 rounded-large font-bold flex items-center gap-2.5 transition-all ${
              activeTab === 'notifications' ? 'bg-primary-light text-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FiBell size={16} /> Notifications
          </button>
        </Card>

        {/* Main Content Panels */}
        <div className="md:col-span-3 flex flex-col gap-6">
          {activeTab === 'profile' && (
            <Card className="p-6 bg-white">
              <h3 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
                <FiUser className="text-primary" /> Personal Details
              </h3>
              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                <Input
                  label="Full Name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  required
                />
                <Input
                  label="Phone Number"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  required
                />
                <Button type="submit" className="w-fit self-end mt-2">
                  Save Changes
                </Button>
              </form>
            </Card>
          )}

          {activeTab === 'address' && (
            <Card className="p-6 bg-white">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-5">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <FiMapPin className="text-primary" /> Saved Delivery Addresses
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAddressModalOpen(true)}
                  className="flex items-center gap-1 text-xs py-1.5 px-3 font-bold"
                >
                  <FiPlus /> Add New
                </Button>
              </div>

              <div className="flex flex-col gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="border border-gray-200 p-4 rounded-large bg-gray-50 flex justify-between items-start"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="font-bold text-gray-800 text-sm">{addr.name}</h4>
                        {addr.isDefault && (
                          <span className="text-[9px] bg-primary-light text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                        {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 font-bold">Phone: {addr.phone}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-2 text-gray-400 hover:text-danger rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'payments' && (
            <Card className="p-6 bg-white">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-5">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <FiCreditCard className="text-primary" /> Linked Payment Methods
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPaymentModalOpen(true)}
                  className="flex items-center gap-1 text-xs py-1.5 px-3 font-bold"
                >
                  <FiPlus /> Link Method
                </Button>
              </div>

              <div className="flex flex-col gap-4">
                {payments.map((pmt) => (
                  <div
                    key={pmt.id}
                    className="border border-gray-200 p-4 rounded-large bg-gray-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs">
                        {pmt.type[0]}
                      </span>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{pmt.provider} Account</h4>
                        <p className="text-xs text-gray-400 font-semibold">{pmt.identifier}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePayment(pmt.id)}
                      className="p-2 text-gray-400 hover:text-danger rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="p-6 bg-white">
              <h3 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
                <FiBell className="text-primary" /> Notification Preferences
              </h3>

              <div className="flex flex-col gap-5 text-sm font-semibold text-gray-700">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-gray-800 text-sm font-bold">Order Status Updates</p>
                    <p className="text-xs text-gray-400 font-medium">Receive real-time tracking updates via email/SMS</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.orderUpdates}
                    onChange={(e) => setNotifications({ ...notifications, orderUpdates: e.target.checked })}
                    className="w-5 h-5 rounded accent-primary cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-gray-800 text-sm font-bold">Promotions & Coupons</p>
                    <p className="text-xs text-gray-400 font-medium">Alerts on upcoming catalog sales and holiday promos</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.promotions}
                    onChange={(e) => setNotifications({ ...notifications, promotions: e.target.checked })}
                    className="w-5 h-5 rounded accent-primary cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-gray-800 text-sm font-bold">AI Visualizer Renderings</p>
                    <p className="text-xs text-gray-400 font-medium">Notification when your visualizer render yields style recommendations</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.aiVisuals}
                    onChange={(e) => setNotifications({ ...notifications, aiVisuals: e.target.checked })}
                    className="w-5 h-5 rounded accent-primary cursor-pointer"
                  />
                </label>
              </div>

              <Button onClick={handleSaveNotifications} className="w-fit self-end mt-8">
                Save Preferences
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal isOpen={addressModalOpen} onClose={() => setAddressModalOpen(false)} title="Add New Address">
        <form onSubmit={handleAddAddress} className="flex flex-col gap-3">
          <Input
            label="Name / Label"
            placeholder="e.g. Work Address"
            value={addressForm.name}
            onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
            required
          />
          <Input
            label="Phone"
            placeholder="e.g. 9876543210"
            value={addressForm.phone}
            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
            required
          />
          <Input
            label="Street Details"
            placeholder="e.g. Flat 104, Green Meadows"
            value={addressForm.street}
            onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
            required
          />
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input
                label="City"
                placeholder="e.g. Bangalore"
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                required
              />
            </div>
            <Input
              label="Pincode"
              placeholder="e.g. 560001"
              value={addressForm.pincode}
              onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
              required
            />
          </div>
          <Input
            label="State"
            placeholder="e.g. Karnataka"
            value={addressForm.state}
            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3 mt-4 border-t border-gray-100 pt-4">
            <Button type="button" variant="ghost" onClick={() => setAddressModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Address</Button>
          </div>
        </form>
      </Modal>

      {/* Add Payment Modal */}
      <Modal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title="Link Payment Method">
        <form onSubmit={handleAddPayment} className="flex flex-col gap-3">
          <div className="flex gap-4 mb-2">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="pmtType"
                checked={paymentForm.type === 'Card'}
                onChange={() => setPaymentForm({ ...paymentForm, type: 'Card' })}
                className="accent-primary"
              />
              Credit/Debit Card
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="pmtType"
                checked={paymentForm.type === 'UPI'}
                onChange={() => setPaymentForm({ ...paymentForm, type: 'UPI' })}
                className="accent-primary"
              />
              UPI Account
            </label>
          </div>

          {paymentForm.type === 'Card' ? (
            <>
              <Input
                label="Cardholder Name"
                placeholder="John Doe"
                value={paymentForm.name}
                onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })}
                required
              />
              <Input
                label="Card Number"
                placeholder="4321 8765 9012 3456"
                value={paymentForm.number}
                onChange={(e) => setPaymentForm({ ...paymentForm, number: e.target.value })}
                required
              />
              <Input
                label="Expiry Date"
                placeholder="MM/YY"
                value={paymentForm.expiry}
                onChange={(e) => setPaymentForm({ ...paymentForm, expiry: e.target.value })}
                required
              />
            </>
          ) : (
            <Input
              label="UPI ID"
              placeholder="username@okaxis"
              value={paymentForm.number}
              onChange={(e) => setPaymentForm({ ...paymentForm, number: e.target.value })}
              required
            />
          )}

          <div className="flex justify-end gap-3 mt-4 border-t border-gray-100 pt-4">
            <Button type="button" variant="ghost" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Link Account</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}