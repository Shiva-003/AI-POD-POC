import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useSearchParams } from 'react-router-dom';
import HistoryCard from '../../components/HistoryCard/HistoryCard';
import Paginator from '../../components/Paginator/Paginator';
import EmptyState from '../../components/EmptyState/EmptyState';
import { toast } from 'react-toastify';

export const UserHistoryPage = () => {
  const { backendUrl } = useContext(AppContext);
  const [history, setHistory] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const pageNumber = Number(searchParams.get('pageNumber')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 4;

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/user/getUserHistory`, {
        params: {
          pageNumber,
          pageSize,
        },
      });

      const responseData = data.data;
      setHistory(responseData.data || []);
      setTotalItems(responseData.totalCount);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageNumber, pageSize]);

  const handleDownloadReport = async (id: string) => {
      try {
      const response = await axios.get(`http://localhost:3000/api/user/downloadReport/${id}`, { responseType: 'blob' });

      // Create a blob from the PDF file
      const file = new Blob([response.data], { type: 'application/pdf' });

      // Create a link element
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(file);
      link.href = url;
      link.setAttribute('download', `diagnosis_report_${id}.pdf`);

      // Append to the DOM and trigger the download
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      } catch (error) {
      console.error('Error downloading the report:', error);
      toast.error('There was an issue downloading the report. Please try again.');
      }
  };

  return (
    <div className="h-full flex flex-col justify-center">
      {loading ? (
        <p>Loading...</p>
      ) : history.length === 0 ? 
        <EmptyState />
       : <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {history.map((item: any) => (
              <HistoryCard history={item} downloadReport={handleDownloadReport} />
            ))}
          </div>
          {/* Pagination Controls */}
          <Paginator pageNumber={pageNumber} pageSize={pageSize} totalItems={totalItems} setSearchParams={setSearchParams} />
        </div>
      }

    </div>
  );
};

export default UserHistoryPage;
