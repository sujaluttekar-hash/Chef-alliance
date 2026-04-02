import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// 🔹 Error Boundary (prevents white screen crashes)
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
          background: "#0f172a",
          color: "#e2e8f0"
        }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
              ⚠️ Something went wrong
            </h1>
            <p style={{ opacity: 0.7 }}>
              Please refresh or contact support
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 🔹 Root Element Check
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("❌ Root element (#root) not found in HTML.");
}

// 🔹 Optional: Smooth Initial Loader (premium feel)
function Loader() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a, #1e293b)"
    }}>
      <div style={{
        width: "40px",
        height: "40px",
        border: "3px solid rgba(255,255,255,0.2)",
        borderTop: "3px solid #6366f1",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }} />
    </div>
  );
}

// Inject keyframes for loader
const style = document.createElement("style");
style.innerHTML = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);

// 🔹 Create Root
const root = ReactDOM.createRoot(rootElement);

// 🔹 Render App
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <React.Suspense fallback={<Loader />}>
        <App />
      </React.Suspense>
    </ErrorBoundary>
  </React.StrictMode>
);
