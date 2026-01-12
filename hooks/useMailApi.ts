import { useState } from 'react';
import API_GMAIL, { API_URLS } from '@/utils/mailApi';
import { ApiUrlObject } from '@/utils/mailApi';

interface UseApiReturn {
  call: (payload?: any, type?: string) => Promise<void>;
  response: any;
  error: string;
  isLoading: boolean;
}

const useMailApi = (urlObject: ApiUrlObject): UseApiReturn => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const call = async (payload: any = {}, type: string = '') => {
    setResponse(null);
    setIsLoading(true);
    setError('');

    try {
      const res = await API_GMAIL(urlObject, payload, type);
      setResponse(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { call, response, error, isLoading };
};

export default useMailApi;
export { API_URLS };


