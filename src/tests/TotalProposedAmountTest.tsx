import React from 'react';
import { totalProposedAmountAPI } from '../api/totalProposedAmount';

// Test component to verify Total Proposed Amount API functionality
const TotalProposedAmountTest: React.FC = () => {
  const [testResults, setTestResults] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testClientSideCalculation = () => {
    addResult('Testing client-side calculation...');
    
    const mockDemolitionItems = [
      { id: '1', proposedBid: 1000 },
      { id: '2', proposedBid: 2500 },
      { id: '3', proposedBid: 750 }
    ];
    
    const mockManualItems = [
      { id: '4', proposedBid: 500 },
      { id: '5', proposedBid: 1200 }
    ];
    
    const getItemProposedBid = (item: any) => item.proposedBid || 0;
    
    const total = totalProposedAmountAPI.calculateTotalFromItems(
      mockDemolitionItems,
      mockManualItems,
      getItemProposedBid
    );
    
    const expectedTotal = 1000 + 2500 + 750 + 500 + 1200; // 5950
    addResult(`Client-side calculation result: $${total.toLocaleString()} (Expected: $${expectedTotal.toLocaleString()})`);
    addResult(total === expectedTotal ? '✅ Client-side calculation test PASSED' : '❌ Client-side calculation test FAILED');
  };

  const testApiEndpoints = async () => {
    setLoading(true);
    addResult('Testing API endpoints...');
    
    const testBidId = 'test-bid-123';
    
    try {
      // Test GET endpoint
      addResult('Testing GET /api/total-proposed-amount/:id...');
      try {
        const getResponse = await totalProposedAmountAPI.getTotalProposedAmount(testBidId);
        addResult(`GET response: ${JSON.stringify(getResponse)}`);
      } catch (error) {
        addResult(`GET error (expected for test): ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Test POST endpoint
      addResult('Testing POST /api/total-proposed-amount/:id...');
      try {
        const postResponse = await totalProposedAmountAPI.setTotalProposedAmount(testBidId, {
          totalProposedAmount: 10000,
          source: 'manual',
          notes: 'Test save'
        });
        addResult(`POST response: ${JSON.stringify(postResponse)}`);
      } catch (error) {
        addResult(`POST error (expected for test): ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Test PUT endpoint
      addResult('Testing PUT /api/total-proposed-amount/:id...');
      try {
        const putResponse = await totalProposedAmountAPI.updateTotalProposedAmount(testBidId, {
          totalProposedAmount: 15000,
          source: 'calculated',
          notes: 'Test update'
        });
        addResult(`PUT response: ${JSON.stringify(putResponse)}`);
      } catch (error) {
        addResult(`PUT error (expected for test): ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Test calculate endpoint
      addResult('Testing POST /api/total-proposed-amount/:id/calculate...');
      try {
        const calculateResponse = await totalProposedAmountAPI.calculateTotalProposedAmount(testBidId, {
          demolitionItems: [{ proposedBid: 5000 }],
          manualItems: [{ proposedBid: 3000 }],
          forceRecalculate: true
        });
        addResult(`Calculate response: ${JSON.stringify(calculateResponse)}`);
      } catch (error) {
        addResult(`Calculate error (expected for test): ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Test DELETE endpoint
      addResult('Testing DELETE /api/total-proposed-amount/:id...');
      try {
        const deleteResponse = await totalProposedAmountAPI.clearTotalProposedAmount(testBidId);
        addResult(`DELETE response: ${JSON.stringify(deleteResponse)}`);
      } catch (error) {
        addResult(`DELETE error (expected for test): ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      addResult('✅ All API endpoint tests completed (errors expected without backend)');
    } catch (error) {
      addResult(`❌ API test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Total Proposed Amount API Test</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testClientSideCalculation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Client-Side Calculation
        </button>
        
        <button
          onClick={testApiEndpoints}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API Endpoints'}
        </button>
        
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Test Results:</h2>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500">No test results yet. Click a test button above.</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono">
                {result}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TotalProposedAmountTest;
