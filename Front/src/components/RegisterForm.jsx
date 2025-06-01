import React, { useState } from 'react'
import TextBox from './TextBox';
import PasswordTextBox from './PasswordTextBox';
import { register } from '../api/User';
import { useNavigate } from 'react-router-dom';

export default function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        if (!password.trim()) return;
        if (!confirmPassword.trim()) return;
        if(password !== confirmPassword) return;

        let res = await register(email,password);
        console.log('Respuesta register:', JSON.stringify(res));
        if(res.email === email){
            navigate('/login');
        }
    };

    return (
        <>
            <div className='fixed top-1/2 left-1/2 w-1/3 transform -translate-x-1/2 -translate-y-1/2'>
                <div className='w-full px-5 py-5 bg-gray-400 flex items-center justify-between rounded-t-lg'>
                    <div className="flex-grow flex justify-center">
                        <p className='text-black text-3xl'>Registrarse</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className='w-full px-5 py-8 bg-gray-200 rounded-b-lg'>
                    <TextBox label={'Correo'} text={email} placeholder={'Correo'} setText={setEmail} />

                    <PasswordTextBox className='mt-5' label={'Contraseña'} password={password} setPassword={setPassword} />
                    <PasswordTextBox className='mt-5' label={'Confirmar contraseña'} password={confirmPassword} setPassword={setConfirmPassword} />
                    
                    <button
                        type="submit"
                        className='w-full mt-10 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition'
                    >
                        Registrarse
                    </button>
                </form>
            </div>
        </>
    )
}
