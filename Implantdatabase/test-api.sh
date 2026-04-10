#!/bin/bash
echo "Testing backend API..."
sleep 2
curl -s http://localhost:5000/api/implants | head -50
echo ""
echo "API test complete"
