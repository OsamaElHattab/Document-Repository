import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Button,
  Select,
  Option,
  IconButton,
} from '@material-tailwind/react';
import { IoSearch, IoDownloadOutline } from 'react-icons/io5';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaRegFolderOpen } from 'react-icons/fa6';

interface Document {
  id: string;
  title: string;
  description: string;
  access_level: string;
  uploader_id: string;
  file_path: string;
}

interface VersionItem {
  id: string;
  document_id: string;
  version_number: number;
  title?: string;
  description?: string;
  file_path: string;
  uploaded_by?: string;
  uploaded_at?: string | null;
  access_level?: string;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [field, setField] = useState<'title' | 'tags' | 'uploader'>('title');
  const [results, setResults] = useState<Document[]>([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(5);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const axiosAuth = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    headers: { Authorization: `Bearer ${token || ''}` },
  });

  const fetchResults = async () => {
    if (!query) return;
    try {
      setLoading(true);
      const res = await axiosAuth.get('/documents/search', {
        params: { q: query, field, page, per_page: perPage },
      });
      setResults(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) fetchResults();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchResults();
  };

  const downloadVersion = async (version: VersionItem) => {
    try {
      const res = await axiosAuth.get(
        `/documents/versions/${version.id}/file`,
        { responseType: 'blob' }
      );
      const blob = new Blob([res.data], {
        type: res.headers['content-type'] || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ext = version.file_path.split('.').pop() || 'bin';
      const filename = `${
        version.title || 'document'
      }_v${version.version_number}.${ext}`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download failed');
    }
  };

  const handleDownload = async (docId: string) => {
    try {
      // 1. Get all versions of the document
      const res = await axiosAuth.get(`/documents/${docId}/versions`);
      const versions: VersionItem[] = res.data;

      if (!versions || versions.length === 0) {
        alert('No versions found for this document');
        return;
      }

      // 2. Pick the latest version (max version_number)
      const latest = versions.reduce((a, b) =>
        a.version_number > b.version_number ? a : b
      );

      // 3. Reuse your existing downloadVersion function
      await downloadVersion(latest);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download failed');
    }
  };

  return (
    <div className='flex items-center justify-center min-h-[85vh] bg-color-background-light dark:bg-color-background-dark px-4'>
      <Card className='w-[95vw] max-w-6xl shadow-xl dark:bg-color-background-dark-second rounded-2xl'>
        <CardHeader
          floated={false}
          shadow={false}
          className='p-6 dark:bg-color-background-dark-second'
        >
          <Typography
            variant='h4'
            className='text-color-text-light dark:text-color-text-dark text-center '
          >
            Search Documents
          </Typography>
        </CardHeader>

        <CardBody className='dark:bg-color-background-dark-third p-6'>
          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className='flex gap-3 items-center mb-8 md:flex-row flex-col'
          >
            <Input
              type='text'
              placeholder='Enter keywords...'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className='flex-1 rounded-xl px-3 py-2 bg-gray-200 dark:bg-color-background-dark-second dark:text-color-text-dark focus:!ring-2 focus:!border-0 focus:!ring-gray-400 placeholder:!opacity-100 border '
              labelProps={{ className: 'hidden' }}
            />
            <div className='flex gap-3'>
              <div className='min-w-max'>
                <Select
                  value={field}
                  onChange={(val) =>
                    setField((val as 'title' | 'tags' | 'uploader') || 'title')
                  }
                  className='w-full rounded-xl bg-gray-100 dark:bg-color-background-dark-second dark:text-color-text-dark !border-0'
                  label='Filter by'
                >
                  <Option value='title'>Title</Option>
                  <Option value='tags'>Tags</Option>
                  <Option value='uploader'>Uploader</Option>
                </Select>
              </div>
              <Button
                type='submit'
                color='gray'
                className='rounded-xl px-5 py-2 dark:bg-color-background-dark-second dark:text-color-text-dark'
              >
                <IoSearch className='h-5 w-5' />
              </Button>
            </div>
          </form>

          {/* Results */}
          {loading ? (
            <Typography>Loading...</Typography>
          ) : results.length === 0 ? (
            <div className='min-h-[50vh] flex flex-col items-center justify-center bg-color-background-light dark:bg-color-background-dark-second rounded-2xl'>
              <FaRegFolderOpen className='w-12 h-12 text-gray-600 dark:text-gray-500 mb-5' />
              <Typography
                variant='h5'
                className='text-gray-700 dark:text-gray-300'
              >
                No results found.
              </Typography>
            </div>
          ) : (
            <div className='space-y-4'>
              {results.map((doc) => (
                <div
                  key={doc.id}
                  className='flex items-center justify-between p-4 rounded-xl shadow-sm dark:border dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-color-background-dark cursor-pointer transition bg-gray-100 dark:bg-color-background-dark-second'
                  onClick={() => navigate(`/documents/${doc.id}`)}
                >
                  <div>
                    <Typography
                      variant='h6'
                      className='text-color-text-light dark:text-color-text-dark'
                    >
                      {doc.title}
                    </Typography>
                    <Typography className='ml-3 text-sm text-gray-600 dark:text-gray-400'>
                      {doc.description}
                    </Typography>
                    <Typography className='ml-3 text-xs text-gray-500 dark:text-gray-500'>
                      Access: {doc.access_level}
                    </Typography>
                  </div>
                  <IconButton
                    variant='text'
                    color='gray'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(doc.id);
                    }}
                    className='rounded-full hover:bg-gray-300 dark:hover:bg-gray-700'
                  >
                    <IoDownloadOutline className='h-5 w-5 dark:text-color-text-dark' />
                  </IconButton>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > perPage && (
            <div className='flex justify-between items-center mt-8'>
              <Button
                size='sm'
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className='rounded-lg'
              >
                Previous
              </Button>
              <Typography className='text-sm'>
                Page {page} of {Math.ceil(total / perPage)}
              </Typography>
              <Button
                size='sm'
                disabled={page >= Math.ceil(total / perPage)}
                onClick={() => setPage((p) => p + 1)}
                className='rounded-lg'
              >
                Next
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
