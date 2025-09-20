import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  CardFooter,
  Chip,
} from '@material-tailwind/react';
import { ProcessInfo } from '../types';
import {
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { FiExternalLink } from 'react-icons/fi';

// Define the headers for the main process information
const TABLE_HEAD = [
  { key: 'pid', label: 'PID' },
  { key: 'name', label: 'Process Name' },
  { key: 'cpu_usage_percent', label: 'CPU Usage (%)' },
  { key: 'threads', label: 'Threads' },
  { key: 'memory_usage_percent', label: 'Memory Usage (%)' },
];

// Additional headers to be displayed only on the processes page
const ADDITIONAL_HEAD = [
  { key: 'status', label: 'Status' },
  { key: 'ppid', label: 'PPID' },
];

const ITEMS_PER_PAGE = 12; // Pagination limit

interface SortableTableProps {
  processes: ProcessInfo[];
}

export function SortableTable({ processes }: SortableTableProps) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const location = useLocation();
  const isProcessesPage = location.pathname === '/processes';

  // Sorting function (sorts based on selected field and order)
  const sortedProcesses = [...processes].sort((a, b) => {
    if (!sortField) return 0;

    const valueA = a[sortField as keyof ProcessInfo];
    const valueB = b[sortField as keyof ProcessInfo];

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortOrder === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    } else if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    }
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedProcesses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  let paginatedProcesses = sortedProcesses.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Display all processes on the processes page
  if (isProcessesPage) {
    paginatedProcesses = sortedProcesses;
  }

  // Handle page change for pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle sorting when clicking a column header
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <Card className='h-full w-full p-4 dark:bg-color-background-dark-second overflow-x-auto'>
      {/* Display link to full processes page if not already on it */}
      {!isProcessesPage && (
        <div>
          <h6 className='text-color-text-light dark:text-color-text-dark flex justify-start gap-1 items-center'>
            <Link to={'/processes'} className='flex items-center gap-1'>
              Processes
              <FiExternalLink className='text-sm opacity-30' />
            </Link>
          </h6>
        </div>
      )}
      {/* Process Table */}
      <table className='mt-4 w-full min-w-max table-auto text-left'>
        <thead className='sticky top-0'>
          <tr>
            {/* Render main table headers */}
            {TABLE_HEAD.map(({ key, label }) => (
              <th
                key={key}
                className={`cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 py-4 pl-1 transition-colors hover:bg-blue-gray-50 dark:bg-color-background-dark-third dark:border-color-background-dark dark:hover:bg-color-first dark:hover:text-color-text-dark ${
                  key === 'memory_usage_percent' && !isProcessesPage
                    ? 'hidden md:table-cell'
                    : ''
                }`}
                onClick={() => handleSort(key)}
              >
                <Typography className='flex items-center justify-start gap-2 font-normal leading-none opacity-70 text-color-text-light dark:text-color-text-dark text-xs'>
                  {label}
                  {sortField === key ? (
                    sortOrder === 'asc' ? (
                      <ChevronUpIcon className='h-4' />
                    ) : (
                      <ChevronDownIcon className='h-4' />
                    )
                  ) : (
                    <ChevronUpDownIcon className='h-4' />
                  )}
                </Typography>
              </th>
            ))}
            {/* Render additional headers only on the processes page */}
            {isProcessesPage &&
              ADDITIONAL_HEAD.map(({ key, label }) => (
                <th
                  key={key}
                  className={`cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 py-4 pl-1 transition-colors hover:bg-blue-gray-50 dark:bg-color-background-dark-third dark:border-color-background-dark dark:hover:bg-color-first dark:hover:text-color-text-dark`}
                  onClick={() => handleSort(key)}
                >
                  <Typography className='flex items-center justify-start gap-2 font-normal leading-none opacity-70 text-color-text-light dark:text-color-text-dark text-xs'>
                    {label}
                    {sortField === key ? (
                      sortOrder === 'asc' ? (
                        <ChevronUpIcon className='h-4' />
                      ) : (
                        <ChevronDownIcon className='h-4' />
                      )
                    ) : (
                      <ChevronUpDownIcon className='h-4' />
                    )}
                  </Typography>
                </th>
              ))}
          </tr>
        </thead>
        {/* Table Body */}
        <tbody>
          {paginatedProcesses.map(
            ({
              pid,
              name,
              cpu_usage_percent,
              memory_usage_percent,
              threads,
              status,
              ppid,
            }) => (
              <tr key={pid}>
                <td className='p-2 m-2 border-b border-opacity-10 dark:border-opacity-10 border-color-text-light dark:border-color-text-dark'>
                  <Typography className='font-normal text-color-text-light dark:text-color-text-dark text-xs'>
                    {pid}
                  </Typography>
                </td>
                <td className='p-2 m-2 border-b border-opacity-10 dark:border-opacity-10 border-color-text-light dark:border-color-text-dark'>
                  <Typography className='font-normal text-color-text-light dark:text-color-text-dark text-xs max-w-32 truncate overflow-hidden whitespace-nowrap'>
                    {name}
                  </Typography>
                </td>
                <td className='p-2 m-2 border-b border-opacity-10 dark:border-opacity-10 border-color-text-light dark:border-color-text-dark'>
                  {cpu_usage_percent !== null &&
                    cpu_usage_percent !== undefined && (
                      <Chip
                        variant='ghost'
                        size='sm'
                        value={cpu_usage_percent.toFixed(2)}
                        color={cpu_usage_percent > 70 ? 'red' : 'green'}
                        className='dark:text-color-text-dark'
                      />
                    )}
                </td>
                <td className='p-2 m-2 border-b border-opacity-10 dark:border-opacity-10 border-color-text-light dark:border-color-text-dark'>
                  <Typography className='font-normal text-color-text-light dark:text-color-text-dark text-xs'>
                    {threads}
                  </Typography>
                </td>
                <td
                  className={`p-2 border-b border-opacity-10 dark:border-opacity-10 border-color-text-light dark:border-color-text-dark ${!isProcessesPage ? 'hidden md:block' : ''}`}
                >
                  {memory_usage_percent !== null &&
                    memory_usage_percent !== undefined && (
                      <Chip
                        variant='ghost'
                        size='sm'
                        value={memory_usage_percent.toFixed(2)}
                        color={memory_usage_percent > 70 ? 'red' : 'green'}
                        className='dark:text-color-text-dark'
                      />
                    )}
                </td>
                {/* Additional Fields (Only on Processes Page) */}
                {isProcessesPage && (
                  <td className='p-2 m-2 border-b border-opacity-10 dark:border-opacity-10 border-color-text-light dark:border-color-text-dark'>
                    <Typography className='font-normal text-color-text-light dark:text-color-text-dark text-xs'>
                      {status}
                    </Typography>
                  </td>
                )}
                {isProcessesPage && (
                  <td className='p-2 m-2 border-b border-opacity-10 dark:border-opacity-10 border-color-text-light dark:border-color-text-dark'>
                    <Typography className='font-normal text-color-text-light dark:text-color-text-dark text-xs'>
                      {ppid}
                    </Typography>
                  </td>
                )}
              </tr>
            )
          )}
        </tbody>
      </table>
      {/* Pagination Controls (Only when not on Processes Page) */}
      {!isProcessesPage && (
        <CardFooter className='flex items-center justify-between border-t border-blue-gray-50 dark:border-opacity-40 px-4 py-2'>
          <Typography
            variant='small'
            color='blue-gray'
            className='font-normal dark:text-color-text-dark'
          >
            Page {currentPage} of {totalPages}
          </Typography>
          <div className='flex gap-2'>
            <Button
              variant='outlined'
              size='sm'
              className='rounded-full dark:border-color-text-dark dark:text-color-text-dark'
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              size='sm'
              className='rounded-full bg-color-second text-color-text-dark dark:bg-color-second dark:text-color-text-dark'
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
