import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Card,
  CardBody,
  Typography,
  Button,
  List,
  ListItem,
  IconButton,
  Chip,
  Input,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@material-tailwind/react';
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

interface DocumentItem {
  id: string;
  title: string;
  description?: string;
  file_path: string;
  access_level?: string;
  current_version_id?: string;
  uploader_id?: string;
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

interface TagItem {
  id: number;
  name: string;
}

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Add tag
  const [newTag, setNewTag] = useState('');

  // Upload new version
  const [openUpload, setOpenUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // axios instance with authentication
  const axiosAuth = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      Accept: 'application/json',
    },
  });

  // Fetch document + versions + tags
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErrorMsg(null);

    async function fetchData() {
      try {
        const [docRes, versionsRes, tagsRes] = await Promise.all([
          axiosAuth.get<DocumentItem>(`/documents/${id}`),
          axiosAuth.get<VersionItem[]>(`/documents/${id}/versions`),
          axiosAuth.get<TagItem[]>(`/tags/document/${id}`),
        ]);
        setDoc(docRes.data);

        const vers = versionsRes.data || [];
        vers.sort((a, b) => a.version_number - b.version_number);
        setVersions(vers);

        setTags(tagsRes.data || []);

        if (vers.length > 0) {
          const last = vers[vers.length - 1];
          setSelectedVersionId(last.id);
          await fetchPreview(last.id);
        }
      } catch (err: any) {
        console.error('Failed to fetch doc/versions:', err);
        setErrorMsg(
          err?.response?.data?.detail || err.message || 'Failed to load'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch preview for selected version
  const fetchPreview = async (versionId?: string | null) => {
    if (!versionId) {
      setPreviewUrl(null);
      return;
    }
    setPreviewLoading(true);
    setErrorMsg(null);

    try {
      const res = await axiosAuth.get(`/documents/versions/${versionId}/file`, {
        responseType: 'blob',
      });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const blobUrl = URL.createObjectURL(res.data);
      setPreviewUrl(blobUrl);
    } catch (err: any) {
      console.error('Failed to fetch preview blob:', err);
      setErrorMsg(err?.response?.data?.detail || 'Preview not available');
      setPreviewUrl(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Select a version
  const handleSelectVersion = async (v: VersionItem) => {
    if (v.id === selectedVersionId) return;
    setSelectedVersionId(v.id);
    await fetchPreview(v.id);
  };

  // Download version
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
        version.title || doc?.title || 'document'
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

  // Add new tag
  const handleAddTag = async () => {
    if (!newTag.trim() || !id) return;
    try {
      const res = await axiosAuth.post(`/tags/attach/${id}`, {
        name: newTag.trim(),
      });
      setTags((prev) => [...prev, res.data]);
      setNewTag('');
    } catch (err) {
      console.error('Failed to add tag:', err);
      alert('Failed to add tag');
    }
  };

  // Upload new version
  const handleUploadVersion = async () => {
    if (!uploadFile || !id) return;
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const res = await axiosAuth.post(`/documents/${id}/versions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setVersions((prev) =>
        [...prev, res.data].sort((a, b) => a.version_number - b.version_number)
      );
      setSelectedVersionId(res.data.id);
      await fetchPreview(res.data.id);
      setOpenUpload(false);
      setUploadFile(null);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-color-background-light dark:bg-color-background-dark'>
        <Typography className='text-gray-700 dark:text-gray-300'>
          Loading...
        </Typography>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-color-background-light dark:bg-color-background-dark'>
        <div className='max-w-xl text-center p-6'>
          <Typography className='text-red-600 dark:text-red-300'>
            {errorMsg}
          </Typography>
          <Button
            className='mt-4 dark:text-color-text-dark'
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon className='w-4 h-4 mr-2 dark:text-color-text-dark' />
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='lg:max-h-[85vh] p-6 bg-color-background-light dark:bg-color-background-dark xl:px-12'>
      <div className='mx-auto max-w-screen-2xl flex flex-col lg:flex-row gap-6'>
        {/* Metadata + Versions */}
        <div className='w-full lg:w-1/4 flex flex-col gap-6 order-1 lg:order-2'>
          {/* Metadata card */}
          <Card className='rounded-2xl shadow-md bg-white dark:bg-color-background-dark-second'>
            <CardBody className='p-4'>
              <div className='mb-4'>
                <Typography
                  variant='small'
                  className='text-gray-600 dark:text-gray-300'
                >
                  Title
                </Typography>
                <Typography className='text-color-text-light dark:text-color-text-dark font-semibold ml-2'>
                  {doc?.title}
                </Typography>
              </div>
              <div className='mb-4'>
                <Typography
                  variant='small'
                  className='text-gray-600 dark:text-gray-300'
                >
                  Description
                </Typography>
                <Typography className='text-color-text-light dark:text-color-text-dark ml-2'>
                  {doc?.description || 'No description'}
                </Typography>
              </div>
              <div>
                <Typography
                  variant='small'
                  className='text-gray-600 dark:text-gray-300 mb-2'
                >
                  Tags
                </Typography>
                <div className='flex flex-wrap gap-2 mb-2'>
                  {tags.map((t) => (
                    <Chip
                      key={t.id}
                      value={t.name}
                      variant='ghost'
                      className='bg-color-background-light-third dark:bg-color-background-dark text-color-text-light dark:text-color-text-dark'
                    />
                  ))}
                </div>
                <div className='flex gap-2 w-full'>
                  <Input
                    label='Add tag'
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    crossOrigin={undefined}
                    className='flex-1'
                    containerProps={{ className: 'w-full' }}
                  />
                  <IconButton
                    onClick={handleAddTag}
                    className=' hover:bg-gray-300 dark:hover:bg-gray-700 bg-color-background-light-third dark:bg-color-background-dark'
                  >
                    <PlusIcon className='w-4 h-4 text-color-text-light dark:text-color-text-dark' />
                  </IconButton>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Versions card */}
          <Card className='rounded-2xl shadow-md bg-white dark:bg-color-background-dark-second'>
            <CardBody className='p-4'>
              <div className='flex justify-between items-center'>
                <Typography
                  variant='small'
                  className='text-gray-600 dark:text-gray-300'
                >
                  Versions
                </Typography>
                <Button
                  size='sm'
                  variant='text'
                  onClick={() => setOpenUpload(true)}
                  className='flex items-center gap-1 dark:text-color-text-dark dark:bg-color-background-dark dark:hover:bg-color-background-dark-third bg-color-background-light-third'
                >
                  <ArrowUpTrayIcon className='w-4 h-4' />
                  New
                </Button>
              </div>
              <List className='mt-2 divide-y divide-gray-200 dark:divide-gray-700 max-h-[38vh] overflow-auto'>
                {[...versions].reverse().map((v) => {
                  const isSelected = v.id === selectedVersionId;
                  return (
                    <ListItem
                      key={v.id}
                      className={`flex items-center justify-between gap-2 py-3 min-h-11 dark:hover:bg-color-background-dark-third ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-color-background-dark rounded-md'
                          : ''
                      }`}
                    >
                      <div
                        className='flex-1 cursor-pointer'
                        onClick={() => handleSelectVersion(v)}
                      >
                        <Typography
                          className={`font-medium text-base ${
                            isSelected
                              ? 'text-color-text-light dark:text-color-text-dark'
                              : 'text-gray-700 dark:text-gray-200'
                          }`}
                        >
                          v{v.version_number}{' '}
                          {doc?.title ? `- ${doc?.title}` : ''}
                        </Typography>
                        <Typography className='text-gray-500 dark:text-gray-400 font-normal text-xs'>
                          {v.uploaded_at
                            ? new Date(v.uploaded_at).toLocaleString()
                            : ''}
                        </Typography>
                      </div>
                      <IconButton
                        variant='text'
                        size='sm'
                        onClick={() => downloadVersion(v)}
                        title='Download version'
                      >
                        <ArrowDownTrayIcon className='w-4 h-4 text-gray-700 dark:text-gray-200' />
                      </IconButton>
                    </ListItem>
                  );
                })}
              </List>
            </CardBody>
          </Card>
        </div>

        {/* Preview */}
        <div className='w-full lg:w-3/4 order-2 lg:order-1 '>
          <Card className='rounded-2xl shadow-md bg-white dark:bg-color-background-dark-second '>
            <CardBody className='p-4'>
              <div className='flex items-center justify-between mb-4'>
                <Typography className='text-lg font-semibold text-color-text-light dark:text-color-text-dark'>
                  Preview
                </Typography>
                <Button
                  size='sm'
                  variant='text'
                  onClick={() => navigate(-1)}
                  className='dark:text-color-text-dark'
                >
                  <ArrowLeftIcon className='w-4 h-4 mr-1 dark:text-color-text-dark' />
                  Back
                </Button>
              </div>

              <div className='bg-gray-100 dark:bg-color-background-dark-third rounded-md p-2 h-[70vh] lg:h-[70vh] overflow-hidden'>
                {previewLoading ? (
                  <div className='w-full h-full flex items-center justify-center'>
                    <Typography className='text-gray-700 dark:text-gray-300'>
                      Loading preview...
                    </Typography>
                  </div>
                ) : previewUrl ? (
                  /\.pdf$/i.test(
                    versions.find((v) => v.id === selectedVersionId)
                      ?.file_path || ''
                  ) ? (
                    <iframe
                      src={previewUrl}
                      className='w-full h-full rounded-md border-0'
                      title='Document preview'
                    />
                  ) : /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(
                      versions.find((v) => v.id === selectedVersionId)
                        ?.file_path || ''
                    ) ? (
                    <img
                      src={previewUrl}
                      alt='preview'
                      className='w-full h-full object-contain rounded-md'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                      <Typography className='text-gray-700 dark:text-gray-300'>
                        Preview not available
                      </Typography>
                    </div>
                  )
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <Typography className='text-gray-700 dark:text-gray-300'>
                      No preview
                    </Typography>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Upload version modal */}
      <Dialog open={openUpload} handler={() => setOpenUpload(false)} size='sm'>
        <DialogHeader>Upload New Version</DialogHeader>
        <DialogBody>
          <div
            className='border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-md p-6 text-center cursor-pointer'
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files.length > 0) {
                setUploadFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            {uploadFile ? (
              <Typography>{uploadFile.name}</Typography>
            ) : (
              <Typography>Drag & drop file here or click to select</Typography>
            )}
            <input
              id='fileInput'
              type='file'
              className='hidden'
              onChange={(e) => {
                if (e.target.files?.length) {
                  setUploadFile(e.target.files[0]);
                }
              }}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant='text'
            color='red'
            onClick={() => setOpenUpload(false)}
            className='mr-2'
          >
            Cancel
          </Button>
          <Button
            variant='gradient'
            onClick={handleUploadVersion}
            disabled={uploadLoading || !uploadFile}
          >
            {uploadLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
