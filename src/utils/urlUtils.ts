export const formatURL = (domain: string): string => {
  let formattedURL = domain.toLowerCase().trim();
  
  // Remove any trailing slashes
  formattedURL = formattedURL.replace(/\/$/, '');
  
  // Remove consecutive dots
  formattedURL = formattedURL.replace(/\.{2,}/g, '.');
  
  // If the URL doesn't start with http:// or https://, add https://
  if (!formattedURL.match(/^https?:\/\//)) {
    formattedURL = `https://${formattedURL}`;
  }
  
  // If www. is not present after the protocol, add it
  if (!formattedURL.match(/^https?:\/\/www\./)) {
    formattedURL = formattedURL.replace(/^(https?:\/\/)/, '$1www.');
  }
  
  return formattedURL;
};