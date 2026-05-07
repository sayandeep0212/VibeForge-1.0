/**
 * Upload an image to ImgBB and return the URL
 */
export async function uploadToImgBB(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) throw new Error('ImgBB API key not configured');

  const formData = new FormData();
  formData.append('image', file);
  formData.append('key', apiKey);

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error('Failed to upload image to ImgBB');
  }

  return data.data.display_url;
}
