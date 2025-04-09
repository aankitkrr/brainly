import { Dashboard } from "./pages/dashboard";
import { LandingPage } from "./pages/landingpage";
import { SharedPage } from "./pages/sharedpage";
import { SignIn } from "./pages/signin";
import { SignUp } from "./pages/signup";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App(){
  return <BrowserRouter>
    <Routes>
      <Route path = "/" element = {<LandingPage />} />
      <Route path = "/signin" element = {<SignIn />} />
      <Route path = "/signup" element = {<SignUp />} />
      <Route path = "/dashboard" element = {<Dashboard />} />
      <Route path = "/share/:shareLink" element = { <SharedPage /> } />
    </Routes>
  </BrowserRouter>
}

export default App
