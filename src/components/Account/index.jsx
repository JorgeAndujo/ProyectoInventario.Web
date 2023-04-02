import { lazy } from "react";
import PropTypes from 'prop-types';
import { Navigate, Route, Routes } from "react-router-dom"

const Login = lazy(() => import("./Login"));
const RecoverPassword = lazy(() => import("./RecoverPassword.jsx"));
const SolicitarRecuperacion = lazy(() => import("./SolicitarRecuperacion"))

const AccountRouter = () => (
    <Routes>
        <Route path={"/login"} element={<Login />}/>
        <Route path={"/"} element={<Navigate replace to='/login' />} />
        <Route path={"*"} element={<Navigate replace to='/login' />} />
        <Route path={"/recoverPassword/:id"} element={<RecoverPassword />} />
        <Route path={"/requestRecover"} element={< SolicitarRecuperacion />} />
    </Routes>
)

AccountRouter.propTypes = {
    match: PropTypes.object,
  };
export default AccountRouter;