import React, { useState } from 'react';
import { Card, Input, Button } from '../../../../shared/components/Common';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const [store, setStore] = useState({
    name: 'Mahaveer Furniture Hub',
    email: 'support@mahaveer.com',
    phone: '9741212888',
    address: 'Davangere, Karnataka'
  });

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Store settings saved successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800">Store Settings</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase">Customize global options</p>
      </div>

      <Card>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="Store Name" value={store.name} onChange={(e) => setStore({...store, name: e.target.value})} />
          <Input label="Support Email" type="email" value={store.email} onChange={(e) => setStore({...store, email: e.target.value})} />
          <Input label="Support Phone" value={store.phone} onChange={(e) => setStore({...store, phone: e.target.value})} />
          <Input label="Store Address" value={store.address} onChange={(e) => setStore({...store, address: e.target.value})} />
          
          <Button type="submit" className="w-fit self-end mt-4">Save Changes</Button>
        </form>
      </Card>
    </div>
  );
}