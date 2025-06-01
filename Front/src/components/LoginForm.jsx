import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import PasswordTextBox from './PasswordTextBox';
import TextBox from './TextBox';

import { useDispatch } from 'react-redux';
import { setToken } from '../redux/slices/authSlice'

import { login } from '../api/User';


export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        if (!password.trim()) return;

        let res = await login(email, password);
        console.log('Respuesta login:', JSON.stringify(res));
        if(res){
            dispatch(setToken(res.access_token))
            navigate('/biblioteca');
        }
    };

    return (
        <>
            <div className='fixed top-1/2 left-1/2 w-1/3 transform -translate-x-1/2 -translate-y-1/2'>
                <div className='w-full px-5 py-5 bg-gray-400 flex items-center justify-between rounded-t-lg'>
                    <div className="flex-grow flex justify-center">
                        <p className='text-black text-3xl'>Inicio de sesión</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className='w-full px-5 py-8 bg-gray-200 rounded-b-lg'>
                    <TextBox label={'Correo'} text={email} placeholder={'Correo'} setText={setEmail} />

                    <PasswordTextBox className='mt-5' label={'Contraseña'} password={password} setPassword={setPassword} />

                    <button
                        type="submit"
                        className='w-full mt-10 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition'
                    >
                        Iniciar sesión
                    </button>
                    <Link to='/register'>
                        <p className='mt-5 flex justify-center text-black underline font-normal'>Registrarse</p>
                    </Link>
                </form>
            </div>
        </>
    )
}
