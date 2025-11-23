import React from 'react';
import DataEntryTable from '@/components/ai/DataEntryTable';

const PricesheetTest: React.FC = () => {
  const handleDataChange = (data: any[]) => {
    console.log('Data changed:', data);
  };

  const initialData = [
    {
      id: '1',
      name: 'Office Chair',
      price: 299.99,
      category: 'Furniture'
    },
    {
      id: '2',
      name: 'Standing Desk',
      price: 599.99,
      category: 'Furniture'
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Pricesheet API Integration Test</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Local Storage Mode</h2>
          <DataEntryTable
            initialData={initialData}
            onDataChange={handleDataChange}
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">API Sync Mode</h2>
          <DataEntryTable
            initialData={[]}
            onDataChange={handleDataChange}
          />
        </div>
      </div>
    </div>
  );
};

export default PricesheetTest;
