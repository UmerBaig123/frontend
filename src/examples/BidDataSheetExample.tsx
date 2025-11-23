import React, { useEffect, useState } from 'react';
import { bidAPI, BidItem } from '../api/bids';
import BidDataEntry from '../components/bids/BidDataEntry';

/**
 * Example component showing how to use the updated getDemolitionItems API
 * to populate a Bid Data Sheet with demolition items
 */
const BidDataSheetExample: React.FC = () => {
  const [bidItems, setBidItems] = useState<BidItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example function to load demolition items for a specific bid
  const loadDemolitionItemsForBidSheet = async (bidId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // The getDemolitionItems method now returns BidItem[] format
      // that's ready to populate the Bid Data Sheet
      const demolitionItems = await bidAPI.getDemolitionItems(bidId);
      
      console.log('Demolition items mapped for Bid Data Sheet:', demolitionItems);
      
      // These items are now in the correct format with the following structure:
      // {
      //   id: string,
      //   name: string,
      //   measurement: string,
      //   price: number,
      //   proposedBid: number,
      //   category: string, // Will be 'Demolition' for demolition items
      //   quantity: number,
      //   unit: string,
      //   description: string
      // }
      
      setBidItems(demolitionItems);
      
    } catch (err) {
      setError(`Failed to load demolition items: ${err}`);
      console.error('Error loading demolition items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Example of how to combine regular bid items with demolition items
  const loadCombinedBidData = async (bidId: string) => {
    try {
      setLoading(true);
      
      // Load bid details to get regular items
      const bidDetails = await bidAPI.getBidDetails(bidId);
      const regularItems = bidDetails.items || [];
      
      // Load demolition items (now returns BidItem[] format)
      const demolitionItems = await bidAPI.getDemolitionItems(bidId);
      
      // Combine both types of items for the data sheet
      const combinedItems = [...regularItems, ...demolitionItems];
      
      console.log('Combined bid items for data sheet:', combinedItems);
      setBidItems(combinedItems);
      
    } catch (err) {
      setError(`Failed to load combined bid data: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDataChange = (data: BidItem[]) => {
    setBidItems(data);
    console.log('Bid data sheet updated:', data);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Bid Data Sheet Example</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          This example shows how demolition items are now automatically mapped 
          to the correct format for the Bid Data Sheet.
        </p>
        
        <div className="flex gap-4 mb-4">
          <button 
            onClick={() => loadDemolitionItemsForBidSheet('example-bid-id')}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Load Demolition Items Only
          </button>
          
          <button 
            onClick={() => loadCombinedBidData('example-bid-id')}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Load Combined Bid Data
          </button>
        </div>
        
        {loading && (
          <div className="text-blue-600">Loading bid data...</div>
        )}
        
        {error && (
          <div className="text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Bid Data Entry Component - will display the loaded data */}
      <BidDataEntry 
        initialData={bidItems}
        onDataChange={handleDataChange}
      />
      
      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">What's Changed:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <code>getDemolitionItems()</code> now returns <code>BidItem[]</code> instead of <code>DemolitionItem[]</code></li>
          <li>• Demolition items are automatically mapped to the correct format for the Bid Data Sheet</li>
          <li>• Items include proper <code>category: 'Demolition'</code> for easy identification</li>
          <li>• All pricing and measurement data is properly parsed and formatted</li>
          <li>• Items can be directly used in the BidDataEntry component without additional transformation</li>
        </ul>
      </div>
    </div>
  );
};

export default BidDataSheetExample;
