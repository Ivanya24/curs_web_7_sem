import { Routes, Route } from "react-router-dom";
import { AccountCard } from "./components/AccountCard";
// import { CreateAccountForm } from "./components/CreateAccountForm";
import {TransactionRow} from "./components/TransactionRow"
import { LoginForm} from "./components/LoginForm";
import {ProtectedRoute } from "./components/ProtectedRoute";
import { RegisterForm} from "./components/RegisterForm";
import { SummaryPanel} from "./components/SummaryPanel";

export default function App() {
  return (
    <Routes>
    {/*Без токена */}
    <Route path="/login" element={<LoginForm />} />
    <Route path="/register" element={<RegisterForm />} />

    <Route path="/my" element={<ProtectedRoute><SummaryPanel /></ProtectedRoute>}/>

    <Route path="/accounts/:id" element={<ProtectedRoute><AccountCard /></ProtectedRoute>}/>

    <Route path="/accounts/:id" element={<ProtectedRoute><AccountCard /></ProtectedRoute>}/>

    <Route path="/transactions/:id" element={<ProtectedRoute><TransactionRow /></ProtectedRoute>}/>



    {/* <Route path="/accounts/create" element={<ProtectedRoute><CreateAccountForm /></ProtectedRoute>}/> */}

    {/* <Route path="/all" element={<ProtectedRoute><SummaryPanel /></ProtectedRoute>}/> */}


    </Routes>
  );
}