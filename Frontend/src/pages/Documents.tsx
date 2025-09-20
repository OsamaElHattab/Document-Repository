// src/pages/Documents.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
} from '@material-tailwind/react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface DocumentItem {
  id: string;
  title: string;
  description?: string;
  file_path: string; // relative path e.g. "Documents/<uuid>.pdf"
  access_level?: string;
  current_version_id?: string;
  original_filename?: string;
}

export default function Documents() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [previewErrorMap, setPreviewErrorMap] = useState<
    Record<string, boolean>
  >({});
  const navigate = useNavigate();

  const axiosAuth = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
  });

  // Fetch documents
  useEffect(() => {
    async function fetchDocs() {
      setLoading(true);
      try {
        const res = await axiosAuth.get<DocumentItem[]>('/documents/my', {
          headers: { Accept: 'application/json' },
        });
        setDocuments(res.data || []);
      } catch (err) {
        console.error('Failed to fetch documents:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, []);

  // Fetch previews as blob URLs
  useEffect(() => {
    async function fetchPreviews() {
      for (const doc of documents) {
        try {
          const res = await axiosAuth.get(`/documents/file/${doc.id}`, {
            responseType: 'blob',
          });
          const blobUrl = URL.createObjectURL(res.data);
          setPreviewUrls((prev) => ({ ...prev, [doc.id]: blobUrl }));
        } catch (err) {
          console.warn(`Preview fetch failed for ${doc.id}:`, err);
          setPreviewErrorMap((m) => ({ ...m, [doc.id]: true }));
        }
      }
    }
    if (documents.length > 0) fetchPreviews();
  }, [documents]);

  const renderPreview = (doc: DocumentItem) => {
    if (previewErrorMap[doc.id]) {
      return (
        <div className='w-full h-full flex items-center justify-center rounded-md'>
          <Typography
            variant='small'
            className='text-gray-600 dark:text-gray-300'
          >
            Preview not available
          </Typography>
        </div>
      );
    }

    const blobUrl = previewUrls[doc.id];
    if (!blobUrl) {
      return (
        <div className='w-full h-full flex items-center justify-center'>
          <Typography
            variant='small'
            className='text-gray-600 dark:text-gray-300'
          >
            Loading preview...
          </Typography>
        </div>
      );
    }

    // Images
    if (/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(doc.file_path)) {
      return (
        <img
          src={blobUrl}
          alt={doc.title || 'preview'}
          className='w-full h-full object-cover rounded-md'
        />
      );
    }

    // PDFs (use iframe for blob)
    if (/\.pdf$/i.test(doc.file_path)) {
      return (
        <iframe
          src={blobUrl}
          title={doc.title}
          className='w-full h-full rounded-md'
        />
      );
    }

    // Fallback
    return (
      <div className='w-full h-full flex items-center justify-center rounded-md'>
        <Typography
          variant='small'
          className='text-gray-600 dark:text-gray-300'
        >
          No preview
        </Typography>
      </div>
    );
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-color-background-light dark:bg-color-background-dark'>
        <Typography variant='h6' className='text-gray-700 dark:text-gray-300'>
          Loading documents...
        </Typography>
      </div>
    );
  }

  return (
    <div className='min-h-screen p-6 bg-color-background-light dark:bg-color-background-dark xl:px-8'>
      <div className='max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6'>
        {documents.map((doc) => (
          <Card
            key={doc.id}
            className='shadow-md rounded-2xl overflow-hidden bg-white dark:bg-color-background-dark-second'
          >
            <CardHeader className='p-4'>
              <div className='p-2 rounded-md bg-gray-100 dark:bg-color-background-dark-third h-40 overflow-hidden'>
                <div className='w-full h-full rounded-md overflow-hidden'>
                  {renderPreview(doc)}
                </div>
              </div>
            </CardHeader>

            <CardBody className='flex items-start justify-between gap-4'>
              <div className='flex-1 pr-2'>
                <Typography
                  variant='h6'
                  className='text-color-text-light dark:text-color-text-dark line-clamp-2'
                >
                  {doc.title}
                </Typography>
                <Typography
                  variant='small'
                  className='mt-2 text-gray-600 dark:text-gray-300 line-clamp-3'
                >
                  {doc.description || 'No description'}
                </Typography>
              </div>
              <div className='flex items-center h-full'>
                <Button
                  size='sm'
                  variant='text'
                  onClick={() => navigate(`/documents/${doc.id}`)}
                  className='flex items-center gap-2 whitespace-nowrap text-color-text-light dark:text-color-text-dark'
                  aria-label={`Open ${doc.title}`}
                >
                  <span className='hidden sm:inline'>Open</span>
                  <ArrowRightIcon className='w-5 h-5' />
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
