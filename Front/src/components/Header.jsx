import React from 'react';
import HeaderButton from './HeaderButton';

import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { setUserInfo, clearUserInfo } from '../redux/slices/userSlice';
import { clearToken } from '../redux/slices/authSlice';

import { findEmail } from '../api/User';

export default function Header({ inicio, biblioteca, editor, login, register }) {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const token = useSelector((state) => state.auth.token);
    const email = useSelector((state) => state.user.email);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!token) return;

        async function fetchEmail() {
            try {
                let email = await findEmail(token);
                dispatch(setUserInfo({ email }));
            } catch {
                dispatch(clearUserInfo());
                dispatch(clearToken());
            }
        }

        fetchEmail();
    }, [dispatch, token]);

    return (
        <header className="w-full fixed z-1000 top-0 flex items-center px-6  bg-white border-b border-[#444444]">
            <div className="flex items-center mb-3">
                <img src="logo.png" alt="Logo" className="h-20 w-auto" />
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2 flex space-x-2">
                {inicio && (<HeaderButton url={'/'} label={'Inicio'} />)}
                {biblioteca && (<HeaderButton url={'/biblioteca'} label={'Biblioteca'} />)}
                {editor && (<HeaderButton url={'/editor'} label={'Editor'} />)}
            </div>

            <div className="flex items-center space-x-1.5 ml-auto">
                {isAuthenticated ? (
                    <>
                        <p className='text-black font-medium mr-5'>{email}</p>
                        {login && (<HeaderButton url={'/login'} label={'Cerrar Sesión'} onClick={() => dispatch(clearToken())}/>)}
                    </>
                ) : (
                    <>
                        {login && (<HeaderButton url={'/login'} label={'Iniciar Sesión'} />)}
                        {register && (<HeaderButton url={'/register'} label={'Registrarse'} />)}
                    </>
                )}

            </div>
        </header>
    );
}
