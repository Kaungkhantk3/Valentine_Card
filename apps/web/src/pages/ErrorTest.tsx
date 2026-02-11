// Test component to verify ErrorBoundary works
// To test: Navigate to /error-test and you should see the error boundary UI

export default function ErrorTest() {
  // This will trigger the ErrorBoundary
  throw new Error("Test error to verify ErrorBoundary is working!");

  return <div>This should never render</div>;
}
