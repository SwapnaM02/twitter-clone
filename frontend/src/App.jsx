import {Route,Routes,Navigate} from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import {Toaster} from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";


function App() {

  //  get the details of the authenticated user.
  // to able to fectch some data or to send some get request. we use the useQuery().
  // this function will run by default.
  const {data:authUser,isLoading,error,isError}=useQuery({
    // we use queryKey to give a unique name to our query and refer to it later.
    queryKey:['authUser'],
    queryFn:async()=>{
      try{
        const res = await fetch("/api/auth/me");
        const data= await res.json();

        // if the user is unauthorized
        if(data.error) return null;
        if(!res.ok){
          throw new Error(data.error || "Something went wrong");
        }
        console.log("authUser is here:",data);
       return data;

      }
      catch(error){
        throw new Error(error);

      }
    },
    retry:false,


  })

  if(isLoading){
    return (
      <div className="flex justify-center items-center h-screen flex">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  console.log("App.jsx file",authUser);

  
  return (
    <div className='flex max-w-6xl mx-auto'>
      {authUser && <Sidebar/> } {/* common component, caz it's not wrapped with routes */}
      <Routes>
				<Route path='/' element={ authUser?<HomePage />:<Navigate to="/login" />} />
				<Route path='/signup' element={ !authUser?<SignUpPage />:<Navigate to='/' />} />
				<Route path='/login' element={ !authUser?<LoginPage />:<Navigate to="/" />} />
        <Route path='/notifications' element={ authUser?<NotificationPage/>:<Navigate to="/login" />} />
        <Route path='/profile/:username' element={ authUser ?<ProfilePage/>:<Navigate to="/login"/>} />
			</Routes>
      { authUser && <RightPanel/>}
      <Toaster/>
    </div>
  )
}

export default App
