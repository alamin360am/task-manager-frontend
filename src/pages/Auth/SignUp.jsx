import React, { useContext, useState } from 'react'
import AuthLayout from './../../components/layouts/AuthLayout'
import { validateEmail } from '../../utils/helper';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import Input from '../../components/Inputs/Input';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import uploadImage from '../../utils/uploadImage';
import { LoadingContext } from '../../context/loadingContext';
import Loader from '../../components/Loader';

const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminInviteToken, setAdminInviteToken] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const {updatedUser} = useContext(UserContext);

  const {loading, setLoading} = useContext(LoadingContext);

  const handleSignUp = async(e) => {
    e.preventDefault();

    let profileImageUrl = ""

    if(!fullName) {
      setError("Please enter full name")
    }

    if(!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if(!password) {
      setError("Please enter the password");
      return;
    }

    setError("");

    // SignUp API
    try {
      // upload image if presents
      setLoading(true);
      if (profilePic) {
        const imageUploadRes = await uploadImage(profilePic);
        profileImageUrl = imageUploadRes || "";

        console.log(imageUploadRes);
        
      }
      
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        email,
        password,
        profileImageUrl,
        adminInviteToken
      });

      const {token, role} = response.data;

      if(token) {
        localStorage.setItem("token", token);
        updatedUser(response.data);
      }

      // Redirect based on role
      if(role === "admin") navigate("/admin/dashboard");
      else navigate("/user/dashboard");

    } catch (error) {
      if(error.message && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }

  }

  return loading ? (
    <div className='w-screen h-screen'> <Loader /> </div>
  ) : (
    <AuthLayout>
      <div className='lg:w-full h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center'>
        <h3 className='text-xl font-semibold text-black'>Create an Account</h3>
        <p className='text-xs text-slate-700 mt-[5px] mb-6'>Join us today by entering your details below.</p>

        <form onSubmit={handleSignUp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input 
              value={fullName}
              onChange={({target}) => setFullName(target.value)}
              label={"Full Name"}
              placeholder={"John"}
              type={"text"}
            />
            <Input
              type="text"
              value={email}
              onChange={({target}) => setEmail(target.value)}
              label="Email Address"
              placeholder='john@example.com'
            />
            <Input
              type="password"
              value={password}
              onChange={({target}) => setPassword(target.value)}
              label="Password"
              placeholder='Min 8 Characters'
            />
            <Input
              type="password"
              value={adminInviteToken}
              onChange={({target}) => setAdminInviteToken(target.value)}
              label="Admin Invite Token"
              placeholder='6 Digit Code'
            />
            </div>
            {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}

            <button type='submit' className='btn-primary'>SIGN UP</button>

            <p>
              Already have an account?{" "}
              <Link className='font-medium text-primary underline' to={"/login"}>Login</Link>
            </p>
      
        </form>
      </div>
    </AuthLayout>
  )
}

export default SignUp
