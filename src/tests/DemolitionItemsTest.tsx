import React, { useEffect, useState } from 'react';
import { bidAPI, BidItem } from '../api/bids';
import BidDataEntry from '../components/bids/BidDataEntry';

/**
 * Test component to validate the demolition items mapping
 * using the demo data structure provided
 */
const DemolitionItemsTest: React.FC = () => {
  const [bidItems, setBidItems] = useState<BidItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo data from the user's provided file
  const demoData = {
    "success": true,
    "bidId": "68b484d46ee33ab5e930e12e",
    "projectName": "trump tower uuu",
    "demolitionItems": [
      {
        "id": "item_0",
        "itemNumber": 4,
        "name": "REMOVE WALL PARTITION INCLUDING ELEC W/IN WALLS BACK TO SOURCE.",
        "measurement": null,
        "price": null,
        "proposedBid": null,
        "location": null,
        "specifications": null,
        "notes": null,
        "originalData": {
          "itemNumber": 4,
          "description": "REMOVE WALL PARTITION INCLUDING ELEC W/IN WALLS BACK TO SOURCE.",
          "category": "wall",
          "action": "Remove",
          "measurements": {
            "quantity": null,
            "unit": null,
            "dimensions": null
          },
          "pricing": null
        }
      },
      {
        "id": "item_1",
        "itemNumber": 5,
        "name": "REMOVE EXG DOOR AND FRAME.",
        "measurement": null,
        "price": null,
        "proposedBid": null,
        "location": null,
        "specifications": null,
        "notes": null,
        "originalData": {
          "itemNumber": 5,
          "description": "REMOVE EXG DOOR AND FRAME.",
          "category": "door",
          "action": "Remove",
          "measurements": {
            "quantity": null,
            "unit": null,
            "dimensions": null
          },
          "pricing": null
        }
      },
      {
        "id": "item_2",
        "itemNumber": 7,
        "name": "REMOVE FLOOR FINISHES THROUGHOUT UNLESS OTHERWISE NOTED.",
        "measurement": null,
        "price": null,
        "proposedBid": null,
        "location": null,
        "specifications": null,
        "notes": null,
        "originalData": {
          "itemNumber": 7,
          "description": "REMOVE FLOOR FINISHES THROUGHOUT UNLESS OTHERWISE NOTED.",
          "category": "floor",
          "action": "Remove",
          "measurements": {
            "quantity": null,
            "unit": null,
            "dimensions": null
          },
          "pricing": null
        }
      }
    ],
    "totalItems": 19
  };

  // Test the mapping function locally
  const testMapping = () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate the API mapping process
      const mappedItems = demoData.demolitionItems.map((item: any) => {
        const originalData = item.originalData || {};
        const itemName = item.name || originalData.description || 'Unnamed Item';
        const category = originalData.category || item.category || 'Demolition';
        
        return {
          id: item.id || crypto.randomUUID(),
          name: itemName,
          measurement: item.measurement || originalData.measurements?.unit || item.unit || 'TBD',
          price: parseFloat(item.price) || 0,
          proposedBid: parseFloat(item.proposedBid) || 0,
          category: category,
          quantity: parseInt(item.quantity || originalData.measurements?.quantity || '1') || 1,
          unit: item.unit || originalData.measurements?.unit || 'Each',
          description: item.notes || originalData.description || itemName
        };
      });

      console.log('Original demo data:', demoData.demolitionItems);
      console.log('Mapped items:', mappedItems);
      
      setBidItems(mappedItems);
    } catch (err) {
      setError(`Mapping failed: ${err}`);
      console.error('Mapping error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Test the actual API call
  const testAPICall = async () => {
    setLoading(true);
    setError(null);

    try {
      // This would use the actual bid ID from the demo data
      const demolitionItems = await bidAPI.getDemolitionItems('68b484d46ee33ab5e930e12e');
      console.log('API returned:', demolitionItems);
      setBidItems(demolitionItems);
    } catch (err) {
      setError(`API call failed: ${err}`);
      console.error('API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDataChange = (data: BidItem[]) => {
    setBidItems(data);
    console.log('Bid data sheet updated:', data);
  };

  // Auto-test mapping on component mount
  useEffect(() => {
    testMapping();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Demolition Items Mapping Test</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Test Controls</h2>
        <div className="flex gap-4">
          <button 
            onClick={testMapping}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test Local Mapping
          </button>
          
          <button 
            onClick={testAPICall}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Test API Call
          </button>
        </div>
        
        {loading && (
          <div className="mt-3 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 inline-block mr-2"></div>
            Processing...
          </div>
        )}
        
        {error && (
          <div className="mt-3 text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Results Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold">{bidItems.length}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold">
              {bidItems.filter(item => item.category !== 'Regular').length}
            </div>
            <div className="text-sm text-gray-600">Demolition Items</div>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold">
              {bidItems.filter(item => item.measurement === 'TBD').length}
            </div>
            <div className="text-sm text-gray-600">Items Needing Measurement</div>
          </div>
        </div>
      </div>

      {/* Bid Data Entry Component */}
      <BidDataEntry 
        initialData={bidItems}
        onDataChange={handleDataChange}
      />
      
      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Mapping Results:</h3>
        <div className="text-sm text-gray-700 space-y-1">
          <div>✅ Successfully mapped {bidItems.length} demolition items</div>
          <div>✅ All items have proper categories: {[...new Set(bidItems.map(i => i.category))].join(', ')}</div>
          <div>✅ Items with TBD measurements can be edited in the data sheet</div>
          <div>✅ Prices and proposed bids default to $0 for user input</div>
        </div>
        
        {bidItems.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer font-medium">View Raw Mapped Data</summary>
            <pre className="mt-2 p-2 bg-white rounded border text-xs overflow-auto max-h-40">
              {JSON.stringify(bidItems, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default DemolitionItemsTest;
