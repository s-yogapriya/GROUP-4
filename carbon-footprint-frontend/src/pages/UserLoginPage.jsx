import React, {
  useState,
} from 'react';

import {
  useNavigate,
  useLocation,
  Link,
} from 'react-router-dom';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api/axios';

import { useAuth } from '../context/AuthContext';

import {
  LogIn,
  User,
  Lock,
  Shield,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';


const UserLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    showToast,
  } = useAuth();


  /* =========================================================
     NORMAL LOGIN
  ========================================================= */

  const [
    usernameOrEmail,
    setUsernameOrEmail,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);


  /* =========================================================
     GOOGLE LOGIN
  ========================================================= */

  const [
    googleLoading,
    setGoogleLoading,
  ] = useState(false);


  /* =========================================================
     GENERAL UI
  ========================================================= */

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);


  const registeredMessage =
    location.state?.registered;


  /* =========================================================
     GOOGLE LOGIN
     
     Spring Security handles:
     
     /oauth2/authorization/google
            ↓
     Google
            ↓
     /login/oauth2/code/google
            ↓
     OAuth2AuthenticationSuccessHandler
  ========================================================= */

  const handleGoogleLogin = () => {
    setErrorMessage('');
    setGoogleLoading(true);

    /*
     * Backend URL.
     *
     * Your Spring Boot application is running on port 8088.
     */
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL ||
      'http://localhost:8088';


    window.location.href =
      `${backendUrl}/oauth2/authorization/google`;
  };


  /* =========================================================
     GITHUB LOGIN
  ========================================================= */

  const handleGithubLogin = () => {
    setErrorMessage('');

    const backendUrl =
      import.meta.env.VITE_BACKEND_URL ||
      'http://localhost:8088';


    window.location.href =
      `${backendUrl}/oauth2/authorization/github`;
  };


  /* =========================================================
     NORMAL USER LOGIN
  ========================================================= */

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();


    if (
      !usernameOrEmail.trim() ||
      !password.trim()
    ) {

      setErrorMessage(
        'Username/Email and Password are required.'
      );

      return;
    }


    setLoading(true);
    setErrorMessage('');


    try {

      const response =
        await api.post(
          '/auth/user/login',
          {
            usernameOrEmail:
              usernameOrEmail.trim(),

            password:
              password.trim(),
          }
        );


      const jwtData =
        response.data;


      /*
       * Store normal-login authentication.
       */
      login(
        jwtData
      );


      /*
       * First-login password reset.
       */
      if (
        jwtData.firstLogin
      ) {

        showToast(
          'First login detected! Please set your new password.',
          'info'
        );

        navigate(
          '/reset-password'
        );

      } else {

        showToast(
          'Login successful! Welcome back.',
          'success'
        );

        navigate(
          '/user/dashboard'
        );
      }

    } catch (error) {

      console.error(
        'Normal login failed:',
        error?.response?.data ||
          error
      );


      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Invalid login credentials.';


      setErrorMessage(
        message
      );

    } finally {

      setLoading(false);
    }
  };


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="
      min-h-screen
      bg-slate-900
      text-slate-100
      flex
      flex-col
    ">

      <Navbar />


      <main className="
        flex-1
        flex
        items-center
        justify-center
        px-4
        py-16
      ">

        <div className="
          w-full
          max-w-md
          space-y-6
        ">


          {/* =================================================
              PAGE TITLE
          ================================================= */}

          <div className="
            space-y-2
            text-center
          ">

            <div className="
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              border
              border-emerald-500/30
              bg-emerald-500/10
              text-emerald-400
            ">

              <LogIn className="
                h-6
                w-6
              " />

            </div>


            <h1 className="
              text-2xl
              font-extrabold
              text-white
            ">
              User Portal Login
            </h1>


            <p className="
              text-xs
              text-slate-400
            ">
              Enter your credentials or use Google to continue.
            </p>

          </div>


          {/* =================================================
              REGISTRATION MESSAGE
          ================================================= */}

          {registeredMessage && (

            <div className="
              flex
              items-start
              gap-2.5
              rounded-xl
              border
              border-emerald-800
              bg-emerald-950/80
              p-4
              text-xs
              text-emerald-300
            ">

              <CheckCircle2 className="
                mt-0.5
                h-5
                w-5
                shrink-0
                text-emerald-400
              " />


              <div>

                <p className="
                  font-bold
                  text-white
                ">
                  Registration Request Submitted!
                </p>


                <p className="
                  mt-0.5
                  leading-5
                ">
                  Your profile is currently
                  PENDING Admin approval.
                  You will receive an email
                  with login credentials
                  once approved.
                </p>

              </div>

            </div>

          )}


          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {errorMessage && (

            <div className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-rose-800
              bg-rose-950/80
              p-4
              text-xs
              text-rose-300
            ">

              <AlertCircle className="
                h-4
                w-4
                shrink-0
              " />

              <span>
                {errorMessage}
              </span>

            </div>

          )}


          {/* =================================================
              GOOGLE LOGIN
          ================================================= */}

          <button
            type="button"
            onClick={
              handleGoogleLogin
            }
            disabled={
              googleLoading
            }
            className="
              flex
              w-full
              items-center
              justify-center
              gap-3
              rounded-xl
              bg-white
              py-3
              text-sm
              font-semibold
              text-gray-700
              shadow-lg
              transition-all
              hover:bg-gray-50
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >

            <svg
              className="
                h-5
                w-5
              "
              viewBox="0 0 24 24"
            >

              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />

              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />

              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />

              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />

            </svg>


            {
              googleLoading
                ? 'Connecting to Google...'
                : 'Continue with Google'
            }

          </button>


          {/* =================================================
              GITHUB LOGIN
          ================================================= */}

          <button
            type="button"
            onClick={
              handleGithubLogin
            }
            className="
              flex
              w-full
              items-center
              justify-center
              gap-3
              rounded-xl
              border
              border-slate-700
              bg-slate-800
              py-3
              text-sm
              font-semibold
              text-white
              transition-all
              hover:bg-slate-700
            "
          >

            <span className="
              text-lg
            ">
              ◉
            </span>

            Continue with GitHub

          </button>


          {/* =================================================
              DIVIDER
          ================================================= */}

          <div className="
            flex
            items-center
            gap-3
            text-xs
            text-slate-500
          ">

            <div className="
              h-px
              flex-1
              bg-slate-700
            />

            <span>
              OR
            </span>

            <div className="
              h-px
              flex-1
              bg-slate-700
            />

          </div>


          {/* =================================================
              NORMAL LOGIN CARD
          ================================================= */}

          <div className="
            rounded-2xl
            border
            border-slate-800
            bg-slate-800/40
            p-6
            shadow-2xl
            sm:p-8
          ">

            <form
              onSubmit={
                handleSubmit
              }
              className="
                space-y-4
              "
            >


              {/* USERNAME / EMAIL */}

              <div>

                <label className="
                  mb-1.5
                  block
                  text-xs
                  font-semibold
                  text-slate-300
                ">
                  Username or Email
                </label>


                <div className="
                  relative
                ">

                  <User className="
                    absolute
                    left-3.5
                    top-3
                    h-4
                    w-4
                    text-slate-500
                  " />


                  <input
                    type="text"
                    value={
                      usernameOrEmail
                    }
                    onChange={(
                      event
                    ) =>
                      setUsernameOrEmail(
                        event.target.value
                      )
                    }
                    placeholder="Username or user@domain.com"
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-800
                      bg-slate-950
                      py-2.5
                      pl-10
                      pr-4
                      text-sm
                      text-white
                      outline-none
                      focus:border-emerald-500
                    "
                    required
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div>

                <label className="
                  mb-1.5
                  block
                  text-xs
                  font-semibold
                  text-slate-300
                ">
                  Password / Temporary Password
                </label>


                <div className="
                  relative
                ">

                  <Lock className="
                    absolute
                    left-3.5
                    top-3
                    h-4
                    w-4
                    text-slate-500
                  " />


                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={
                      password
                    }
                    onChange={(
                      event
                    ) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter password"
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-800
                      bg-slate-950
                      py-2.5
                      pl-10
                      pr-10
                      text-sm
                      text-white
                      outline-none
                      focus:border-emerald-500
                    "
                    required
                  />


                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (
                          value
                        ) =>
                          !value
                      )
                    }
                    className="
                      absolute
                      right-3
                      top-2.5
                      text-slate-500
                      transition
                      hover:text-slate-300
                    "
                    title={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >

                    {showPassword ? (

                      <EyeOff className="
                        h-4
                        w-4
                      " />

                    ) : (

                      <Eye className="
                        h-4
                        w-4
                      " />

                    )}

                  </button>

                </div>

              </div>


              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={
                  loading
                }
                className="
                  mt-2
                  flex
                  w-full
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-600
                  py-3
                  text-sm
                  font-bold
                  text-slate-950
                  shadow-lg
                  shadow-emerald-950/40
                  transition-all
                  hover:bg-emerald-500
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                {
                  loading
                    ? 'Authenticating...'
                    : 'Sign In to Account'
                }

              </button>

            </form>

          </div>


          {/* =================================================
              FOOTER LINKS
          ================================================= */}

          <div className="
            flex
            items-center
            justify-between
            px-1
            text-xs
            text-slate-400
          ">

            <Link
              to="/register"
              className="
                transition-colors
                hover:text-emerald-400
              "
            >
              Need an account? Register here
            </Link>


            <Link
              to="/admin/login"
              className="
                flex
                items-center
                gap-1
                transition-colors
                hover:text-teal-400
              "
            >

              <Shield className="
                h-3.5
                w-3.5
                text-teal-400
              " />

              Admin Portal

            </Link>

          </div>

        </div>

      </main>


      <Footer />

    </div>
  );
};


export default UserLoginPage;