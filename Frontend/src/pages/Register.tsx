import { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  CardBody,
  CardHeader,
  Typography,
  Select,
  Option,
} from '@material-tailwind/react';
import { Link, useNavigate } from 'react-router-dom';
import siemens_logo from '../assets/siemens-logo.svg';

export default function Register() {
  const [departments, setDepartments] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8000/departments/', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to load departments');
        }
        const data = await response.json();
        setDepartments(data); // [{id:1,name:"Software"},...]
        if (data.length > 0) {
          setSelectedDepartment(data[0].id); // Default to first department
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment) {
      alert('Please select a department');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          full_name: form.fullName,
          department_id: selectedDepartment,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Registration failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error registering:', error);
      alert('Failed to register. Please try again.');
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
            <img src={siemens_logo} alt='Siemens Logo' className='w-52 h-12' />
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
            {/* Email */}
            <div>
              <Typography
                variant='small'
                color='blue-gray'
                className='block font-medium mb-2'
              >
                Email
              </Typography>
              <Input
                id='email'
                color='gray'
                size='lg'
                type='email'
                name='email'
                value={form.email}
                onChange={handleChange}
                placeholder='name@mail.com'
                className='!w-full placeholder:!opacity-100 focus:!border-t-primary !border-t-blue-gray-200'
                crossOrigin={undefined}
              />
            </div>
            {/* Password */}
            <div>
              <Typography
                variant='small'
                color='blue-gray'
                className='block font-medium mb-2'
              >
                Password
              </Typography>
              <Input
                id='password'
                color='gray'
                size='lg'
                type='password'
                name='password'
                value={form.password}
                onChange={handleChange}
                placeholder='••••••••'
                className='!w-full placeholder:!opacity-100 focus:!border-t-primary !border-t-blue-gray-200'
                crossOrigin={undefined}
              />
            </div>
            {/* Full Name */}
            <div>
              <Typography
                variant='small'
                color='blue-gray'
                className='block font-medium mb-2'
              >
                Full Name
              </Typography>
              <Input
                id='fullName'
                color='gray'
                size='lg'
                type='text'
                name='fullName'
                value={form.fullName}
                onChange={handleChange}
                placeholder='Full Name'
                className='!w-full placeholder:!opacity-100 focus:!border-t-primary !border-t-blue-gray-200'
                crossOrigin={undefined}
              />
            </div>
            {/* Department */}
            <div>
              <Typography
                variant='small'
                color='blue-gray'
                className='block font-medium mb-2'
              >
                Department
              </Typography>
              <Select
                size='lg'
                color='gray'
                // label='Select department'
                onChange={(val) =>
                  setSelectedDepartment(val ? parseInt(val) : null)
                }
                disabled={loading}
                className='!w-full !border-t-blue-gray-200 text-gray-900 dark:text-gray-100'
              >
                {loading ? (
                  <Option value='' disabled>
                    Loading departments...
                  </Option>
                ) : (
                  departments.map((dept) => (
                    <Option
                      key={dept.id}
                      value={dept.id.toString()}
                      className='text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    >
                      {dept.name}
                    </Option>
                  ))
                )}
              </Select>
            </div>
            {/* Register Button */}
            <Button type='submit' size='lg' color='gray' fullWidth>
              Register
            </Button>
            {/* Already a member */}
            <Typography
              variant='small'
              className='text-center mx-auto max-w-[19rem] !font-medium !text-gray-600'
            >
              Already a member?{' '}
              <Link to='/login' className='text-color-first hover:underline'>
                Login
              </Link>
            </Typography>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
