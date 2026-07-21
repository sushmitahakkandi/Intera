const url = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?fm=webp&fit=crop&w=800&h=600&q=80';

async function testFetch() {
  try {
    console.log('Fetching:', url);
    const res = await fetch(url);
    console.log('Status:', res.status);
    console.log('OK:', res.ok);
  } catch (err) {
    console.error('Fetch error:', err);
    if (err.cause) {
      console.error('Error cause:', err.cause);
    }
  }
}

testFetch();
