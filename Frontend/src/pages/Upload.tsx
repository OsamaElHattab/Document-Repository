// src/pages/Upload.tsx
import { useState, DragEvent, KeyboardEvent } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Button,
  Textarea,
  Select,
  Option,
  Chip,
} from '@material-tailwind/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [accessLevel, setAccessLevel] = useState<
    'public' | 'private' | 'department'
  >('public');
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const axiosAuth = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    headers: {
      Authorization: `Bearer ${token || ''}`,
      Accept: 'application/json',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please choose a file to upload');
      return;
    }
    if (!token) {
      alert('You must be logged in to upload');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('access_level', accessLevel);
      formData.append('file', file);

      // Upload the document
      const res = await axiosAuth.post('/documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const docId = res.data.id;

      // Handle tags
      // create if not exist and link to document
      for (const tagName of tags) {
        try {
          // Try to create tag (will fail if exists)
          await axiosAuth.post('/tags/', { name: tagName });
          await axiosAuth.post(`/tags/attach/${docId}`, { name: tagName });
        } catch (err: any) {
          if (err.response?.status === 400 || err.response?.status === 409) {
            // Already exists, attach it
            const allTags = await axiosAuth.get('/tags/');
            const existing = allTags.data.find((t: any) => t.name === tagName);
            if (existing) {
              await axiosAuth.post(`/tags/attach/${docId}`, { name: tagName });
            }
          } else {
            console.error('Tag error:', err);
          }
        }
      }

      alert('Document created successfully!');
      setTitle('');
      setDescription('');
      setAccessLevel('public');
      setFile(null);
      setTags([]);
      navigate(`/documents/${docId}`);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-[85vh] mt-2 bg-color-background-light dark:bg-color-background-dark'>
      <Card className='w-[95vw] max-w-5xl border border-gray-300 shadow-lg dark:bg-color-background-dark-second dark:border-0'>
        <CardHeader
          floated={false}
          shadow={false}
          className='text-center p-6 dark:bg-color-background-dark-second'
        >
          <Typography
            variant='h4'
            className='text-color-text-light dark:text-color-text-dark'
          >
            Upload Document
          </Typography>
          <Typography
            variant='small'
            className='mt-2 text-gray-600 dark:text-color-text-dark'
          >
            Fill in the details on the left and upload your file on the right.
          </Typography>
        </CardHeader>

        <CardBody className='dark:bg-color-background-dark-third'>
          <form
            onSubmit={handleSubmit}
            className='grid grid-cols-1 md:grid-cols-2 gap-8'
          >
            {/* Left side: metadata */}
            <div className='flex flex-col gap-6'>
              {/* Title */}
              <div>
                <Typography
                  variant='small'
                  className='mb-2 font-medium text-gray-700 dark:text-color-text-dark'
                >
                  Title
                </Typography>
                <Input
                  type='text'
                  color='gray'
                  placeholder='Document Title'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className='placeholder:!opacity-100 dark:bg-color-background-dark-second dark:text-color-text-dark dark:border-0'
                />
              </div>

              {/* Description */}
              <div>
                <Typography
                  variant='small'
                  className='mb-2 font-medium text-gray-700 dark:text-color-text-dark'
                >
                  Description
                </Typography>
                <Textarea
                  color='gray'
                  placeholder='Brief description of the document'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className='dark:bg-color-background-dark-second dark:text-color-text-dark dark:border-0'
                />
              </div>

              {/* Access Level */}
              <div>
                <Typography
                  variant='small'
                  className='mb-2 font-medium text-gray-700 dark:text-color-text-dark'
                >
                  Access Level
                </Typography>
                <Select
                  label='Select access level'
                  value={accessLevel}
                  onChange={(val) =>
                    setAccessLevel(
                      (val as 'public' | 'private' | 'department') || 'public'
                    )
                  }
                  className='dark:bg-color-background-dark-second dark:text-color-text-dark dark:border-0'
                >
                  <Option
                    value='public'
                    className='dark:bg-color-background-dark-third dark:text-color-text-dark'
                  >
                    Public
                  </Option>
                  <Option
                    value='private'
                    className='dark:bg-color-background-dark-third dark:text-color-text-dark'
                  >
                    Private
                  </Option>
                  <Option
                    value='department'
                    className='dark:bg-color-background-dark-third dark:text-color-text-dark'
                  >
                    Department
                  </Option>
                </Select>
              </div>

              {/* Tags */}
              <div>
                <Typography
                  variant='small'
                  className='mb-2 font-medium text-gray-700 dark:text-color-text-dark'
                >
                  Tags
                </Typography>
                <Input
                  type='text'
                  placeholder='Type a tag and press Enter'
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className='placeholder:!opacity-100 dark:bg-color-background-dark-second dark:text-color-text-dark dark:border-0'
                />
                <div className='flex flex-wrap gap-2 mt-2'>
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      value={tag}
                      onClose={() => removeTag(tag)}
                      className='dark:bg-color-background-dark-second dark:text-color-text-dark'
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: file upload */}
            <label
              htmlFor='file-upload'
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer dark:border-blue-gray-900 ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-color-background-dark-third'
                  : 'border-gray-400 bg-color-background-light dark:bg-color-background-dark-second'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type='file'
                id='file-upload'
                accept='*/*'
                onChange={handleFileChange}
                className='hidden'
              />
              <div className='flex flex-col items-center justify-center text-gray-600 dark:text-color-text-dark cursor-pointer'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-12 w-12 mb-3 text-gray-500 dark:text-color-text-dark cursor-pointer'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M7 16V4m0 12l-4-4m4 4l4-4m6 4V4m0 12l-4-4m4 4l4-4'
                  />
                </svg>
                <Typography
                  variant='small'
                  className='font-medium cursor-pointer'
                >
                  Drag & Drop your file here
                </Typography>
                <Typography
                  variant='small'
                  className='text-gray-500 dark:text-color-text-dark cursor-pointer'
                >
                  or click anywhere to browse
                </Typography>
              </div>

              {file && (
                <Typography
                  variant='small'
                  className='mt-4 text-gray-700 dark:text-color-text-dark'
                >
                  Selected: {file.name}
                </Typography>
              )}
            </label>
          </form>

          {/* Submit button */}
          <div className='mt-8'>
            <Button
              type='submit'
              color='gray'
              fullWidth
              disabled={loading}
              className='dark:bg-color-background-dark-second dark:text-color-text-dark'
              onClick={handleSubmit}
            >
              {loading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
