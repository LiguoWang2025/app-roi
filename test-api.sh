#!/bin/bash

echo "Testing API connection..."
echo ""

# Test health endpoint
echo "1. Testing /health endpoint:"
curl -s http://localhost:3001/health | jq .
echo ""

# Test upload endpoint (without file)
echo "2. Testing /api/upload endpoint:"
curl -s -X POST http://localhost:3001/api/upload | jq .
echo ""

# Test ROI endpoint
echo "3. Testing /api/roi endpoint:"
curl -s http://localhost:3001/api/roi | jq .
echo ""

echo "All tests completed!"
