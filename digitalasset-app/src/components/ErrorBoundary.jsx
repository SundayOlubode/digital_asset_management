import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    console.log("Error message:", error.message);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#2d3748",
            color: "white",
            borderRadius: "8px",
            margin: "20px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ color: "#f56565" }}>Something went wrong</h2>
          <p>The application encountered an error. You can:</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: "#553c9a",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              marginTop: "10px",
              cursor: "pointer",
            }}
          >
            Reload the page
          </button>
          <details style={{ marginTop: "15px", color: "#a0aec0" }}>
            <summary>View error details</summary>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                backgroundColor: "#1a202c",
                padding: "10px",
                borderRadius: "4px",
                marginTop: "10px",
                fontSize: "14px",
                overflowX: "auto",
              }}
            >
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
