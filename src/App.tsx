import { Routes, Route, Navigate } from "react-router-dom";
import { useUIStore } from "./stores/uiStore";
import { AppLayout } from "./components/layout/AppLayout";
import { ArchiveLayout } from "./components/layout/ArchiveLayout";
import { TableLayout } from "./components/layout/TableLayout";

function App() {
  const mode = useUIStore((s) => s.mode);

  return (
    <div className="h-screen w-screen bg-background text-text overflow-hidden">
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route
            index
            element={
              mode === "archive" ? (
                <ArchiveLayout />
              ) : (
                <TableLayout />
              )
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
