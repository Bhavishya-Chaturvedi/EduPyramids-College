
import { Routes, Route } from "react-router-dom";
import ResponsiveAppBar from "./components/homepage/ResponsiveAppBar";
import MegaMenu from "./components/homepage/AppBar";
// import FeatureTiles from "./components/homepage/HomeComponents";
import HomePage from "./pages/home/Homepage";
import DomainPage from "./pages/public/DomainsPage";
import CoursePage from "./pages/public/CoursePage";
import TutorialSearch from "./pages/public/TutorialSearch";
import PaymentStatus from "./pages/public/PaymentStatus";
import SubscriptionPage from "./pages/public/SubscriptionPage";


export default function App(){

  return (
    <>
        {/* <ResponsiveAppBar/> */}
        <MegaMenu/>
        {/* <HomePage /> */}
        {/* Define the routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/domains" element={<DomainPage />} />
          <Route path="/tutorial-search" element={<TutorialSearch />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/domains/:slug" element={<CoursePage />} />
          <Route path="/payment-status/:transactionId" element={<PaymentStatus />} />
          {/* catch-all for 404 */}
          <Route path="*" element={<h1>Page Not Found</h1>} />
        </Routes>
    </>
  )
}
