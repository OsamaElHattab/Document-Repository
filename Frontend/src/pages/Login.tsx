import { useState } from 'react';
import {
  Card,
  Input,
  Button,
  CardBody,
  CardHeader,
  Typography,
} from '@material-tailwind/react';
import { Link, useNavigate } from 'react-router-dom';
import siemens_logo from '../assets/siemens-logo.svg';
import api from '../services/api'; // Axios instance with baseURL

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      console.log(res);

      localStorage.setItem('token', res.data.access_token);
      navigate('/');
    } catch (err: unknown) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-[90vh] bg-color-background-light dark:bg-color-background-dark'>
      <Card
        shadow={false}
        className='md:px-24 md:py-14 py-8 border border-gray-300 w-[90vw] max-w-xl min-w-[350px]'
        style={{ minHeight: '60vh' }}
      >
        <CardHeader shadow={false} floated={false} className='text-center'>
          <div className='flex flex-col items-center'>
            <img
              src={siemens_logo}
              alt='Siemens Logo'
              className='w-52 h-12 text-color-second dark:text-color-third'
            />
            <Typography className='font-extralight text-color-text-light'>
              Document Repository
            </Typography>
          </div>
        </CardHeader>
        <CardBody>
          <form
            onSubmit={handleSubmit}
            className='flex flex-col gap-4 md:mt-12 w-full'
          >
            {error && (
              <div className='text-red-500 text-sm text-center'>{error}</div>
            )}

            <div>
              <label htmlFor='email'>
                <Typography
                  variant='small'
                  color='blue-gray'
                  className='block font-medium mb-2'
                >
                  Email
                </Typography>
              </label>
              <Input
                id='email'
                color='gray'
                size='lg'
                type='email'
                name='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='name@mail.com'
                className='!w-full placeholder:!opacity-100 focus:!border-t-primary !border-t-blue-gray-200'
                labelProps={{
                  className: 'hidden',
                }}
                crossOrigin={undefined}
              />
            </div>

            <div>
              <label htmlFor='password'>
                <Typography
                  variant='small'
                  color='blue-gray'
                  className='block font-medium mb-2'
                >
                  Password
                </Typography>
              </label>
              <Input
                id='password'
                color='gray'
                size='lg'
                type='password'
                name='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='••••••••'
                className='!w-full placeholder:!opacity-100 focus:!border-t-primary !border-t-blue-gray-200'
                labelProps={{
                  className: 'hidden',
                }}
                crossOrigin={undefined}
              />
            </div>

            <Button
              type='submit'
              size='lg'
              color='gray'
              fullWidth
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Typography
              variant='small'
              className='text-center mx-auto max-w-[19rem] !font-medium !text-gray-600'
            >
              Not a member?{' '}
              <Link to='/register' className='text-color-first hover:underline'>
                Register
              </Link>
            </Typography>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
