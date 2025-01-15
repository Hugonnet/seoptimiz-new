export const formatURL = (url: string): string => {
  let formattedURL = url.trim().toLowerCase();
  
  // Remove any existing protocol
  formattedURL = formattedURL.replace(/^(https?:\/\/)?(www\.)?/, '');
  
  // Add https:// if no protocol is present
  formattedURL = `https://${formattedURL}`;
  
  return formattedURL;
};