import axios from 'axios';

export const API_URLS = {
  saveSentEmails: {
    endpoint: 'save',
    method: 'POST',
  },
  saveDraftEmails: {
    endpoint: 'save-draft',
    method: 'POST',
  },
  getEmailFromType: {
    endpoint: 'emails',
    method: 'GET',
  },
  toggleStarredMails: {
    endpoint: 'starred',
    method: 'POST',
  },
  deleteEmails: {
    endpoint: 'delete',
    method: 'DELETE',
  },
  moveEmailsToBin: {
    endpoint: 'bin',
    method: 'POST',
  },
};

export interface ApiUrlObject {
  endpoint: string;
  method: string;
}

const API_GMAIL = async (
  serviceUrlObject: ApiUrlObject,
  requestData: any = {},
  type: string = ''
) => {
  const { params, urlParams, ...body } = requestData;

  let url = `/api/mail/${serviceUrlObject.endpoint}`;
  if (type && serviceUrlObject.endpoint === 'emails') {
    url += `/${type}`;
  }

  return await axios({
    method: serviceUrlObject.method as any,
    url: url,
    data: requestData,
  });
};

export default API_GMAIL;


