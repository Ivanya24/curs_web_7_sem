import { Routes, Route } from "react-router-dom";
import { AccountCard } from "./components/AccountCard";
// import { CreateAccountForm } from "./components/CreateAccountForm";
import {TransactionRow} from "./components/TransactionRow"
import { LoginForm} from "./components/LoginForm";
import {ProtectedRoute } from "./components/ProtectedRoute";
import { Navigate } from 'react-router-dom'
import { RegisterForm} from "./components/RegisterForm";
import { SummaryPanel} from "./components/SummaryPanel";
import { GuestRoute } from "./components/GuestRoute";
import { NotFound } from "./components/NotFound";

export default function App() {
  return (
    <Routes>
    {/*Без токена */}
            <Route 
          path="/login" 
          element={
            <GuestRoute>
              <LoginForm />
            </GuestRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <GuestRoute>
              <RegisterForm />
            </GuestRoute>
          } 
        />

    <Route path="/" element={<Navigate to="/my" replace />} />


    <Route path="/my" element={<ProtectedRoute><SummaryPanel /></ProtectedRoute>}/>

    <Route path="/accounts/:id" element={<ProtectedRoute><AccountCard /></ProtectedRoute>}/>

    <Route path="/accounts/:id" element={<ProtectedRoute><AccountCard /></ProtectedRoute>}/>

    <Route path="/transactions/:id" element={<ProtectedRoute><TransactionRow /></ProtectedRoute>}/>


    <Route path="/not-found" element={<NotFound />} />
    <Route path="*" element={<NotFound />} /> 

    {/* <Route path="/accounts/create" element={<ProtectedRoute><CreateAccountForm /></ProtectedRoute>}/> */}

    {/* <Route path="/all" element={<ProtectedRoute><SummaryPanel /></ProtectedRoute>}/> */}


    </Routes>
  );
}