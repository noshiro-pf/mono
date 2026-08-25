#!/bin/bash

# Visual Regression Testing - Baseline Creation Script
# This script helps create and manage visual test baselines

set -e

echo "🎨 Visual Regression Testing Setup"
echo "=================================="

# Function to check if dev server is running
check_dev_server() {
    if curl -s http://localhost:5173 > /dev/null; then
        echo "✅ Dev server is running"
        return 0
    else
        echo "❌ Dev server not found on localhost:5173"
        return 1
    fi
}

# Function to wait for dev server
wait_for_server() {
    echo "⏳ Waiting for dev server to start..."
    for i in {1..30}; do
        if check_dev_server; then
            return 0
        fi
        sleep 2
    done
    echo "❌ Dev server failed to start"
    exit 1
}

# Check if we should start dev server
if ! check_dev_server; then
    echo "🚀 Starting dev server..."
    pnpm run dev &
    DEV_SERVER_PID=$!

    # Clean up on exit
    trap "kill $DEV_SERVER_PID 2>/dev/null || true" EXIT

    wait_for_server
fi

echo ""
echo "📸 Creating visual test baselines..."
echo ""

# Create baseline snapshots
if pnpm run test:visual:update; then
    echo ""
    echo "✅ Visual test baselines created successfully!"
    echo ""
    echo "📁 Snapshots saved to: tests/visual/**/*-snapshots/"
    echo ""
    echo "Next steps:"
    echo "1. Review the generated snapshots"
    echo "2. Commit the snapshots to version control"
    echo "3. Run 'pnpm run test:visual' to verify tests pass"
else
    echo ""
    echo "❌ Failed to create visual baselines"
    exit 1
fi

echo ""
echo "🎉 Visual regression testing is now set up!"
