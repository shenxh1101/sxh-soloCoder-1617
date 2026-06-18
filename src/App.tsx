import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Vehicles from "@/pages/Vehicles";
import VehicleDetail from "@/pages/VehicleDetail";
import VehicleForm from "@/pages/VehicleForm";
import Records from "@/pages/Records";
import RecordForm from "@/pages/RecordForm";
import RecordDetail from "@/pages/RecordDetail";
import Reminders from "@/pages/Reminders";
import Statistics from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/new" element={<VehicleForm />} />
          <Route path="/vehicles/:id" element={<VehicleDetail />} />
          <Route path="/vehicles/:id/edit" element={<VehicleForm />} />
          <Route path="/records" element={<Records />} />
          <Route path="/records/new" element={<RecordForm />} />
          <Route path="/records/:id" element={<RecordDetail />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
